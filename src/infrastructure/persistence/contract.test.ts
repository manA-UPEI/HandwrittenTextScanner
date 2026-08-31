import { describe, expect, it } from "vitest";
import type { DocumentStore } from "@/domain/ports/document-store";
import { isAppError } from "@/domain/errors/app-error";
import { fixtureScannedDocument } from "@/test/fixtures";
import { makeMemoryDocumentStore } from "@/infrastructure/persistence/memory-document-store";
import { makeUpstashDocumentStore } from "@/infrastructure/persistence/upstash-document-store";

/**
 * A Redis stand-in backed by plain Maps — enough surface for
 * makeUpstashDocumentStore's calls (get/set/del/zadd/zrange/zrem/mget), so
 * this suite never touches a real Redis instance. Only the "whole range,
 * reverse-sorted by score" query shape is implemented, since that's the
 * only one the adapter ever issues.
 */
const makeFakeRedisClient = () => {
  const values = new Map<string, unknown>();
  const sortedSets = new Map<string, Map<string, number>>();

  return {
    async get<TData>(key: string) {
      return (values.get(key) as TData | undefined) ?? null;
    },
    async set(key: string, value: unknown) {
      values.set(key, value);
      return "OK";
    },
    async del(key: string) {
      return values.delete(key) ? 1 : 0;
    },
    async zadd(key: string, scoreMember: { score: number; member: string }) {
      const set = sortedSets.get(key) ?? new Map<string, number>();
      sortedSets.set(key, set);
      set.set(scoreMember.member, scoreMember.score);
      return 1;
    },
    async zrange<TData extends unknown[]>(
      key: string,
      _min: number,
      _max: number,
      opts?: { rev?: boolean },
    ) {
      const set = sortedSets.get(key) ?? new Map<string, number>();
      const entries = [...set.entries()].sort((a, b) => a[1] - b[1]);
      if (opts?.rev) entries.reverse();
      return entries.map(([member]) => member) as TData;
    },
    async zrem(key: string, ...members: string[]) {
      const set = sortedSets.get(key);
      if (!set) return 0;
      return members.filter((member) => set.delete(member)).length;
    },
    async mget<TData extends unknown[]>(...keys: string[]) {
      return keys.map((key) => values.get(key) ?? null) as TData;
    },
  };
};

interface ContractHarness {
  name: string;
  makeStore: (options?: { now?: () => number }) => DocumentStore;
}

const harnesses: ContractHarness[] = [
  { name: "memory", makeStore: (options) => makeMemoryDocumentStore(options) },
  {
    name: "upstash",
    makeStore: (options) => makeUpstashDocumentStore({ client: makeFakeRedisClient(), ...options }),
  },
];

describe.each(harnesses)("$name document store contract", ({ makeStore }) => {
  it("round-trips a saved document through load", async () => {
    const store = makeStore();
    const document = fixtureScannedDocument({ title: "Meeting notes" });

    const saved = await store.save("owner-1", document);

    expect(saved.id).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
    const loaded = await store.load("owner-1", saved.id);
    expect(loaded).toEqual(saved);
  });

  it("updates the same document in place when saved again with its id", async () => {
    const store = makeStore();
    const first = await store.save("owner-1", fixtureScannedDocument({ title: "Draft" }));

    const second = await store.save(
      "owner-1",
      fixtureScannedDocument({ title: "Final" }),
      first.id,
    );

    expect(second.id).toBe(first.id);
    const list = await store.list("owner-1");
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Final");
  });

  it("lists documents most-recently-updated first", async () => {
    let time = 0;
    const store = makeStore({ now: () => time });
    const older = await store.save("owner-1", fixtureScannedDocument({ title: "Older" }));
    time = 1;
    const newer = await store.save("owner-1", fixtureScannedDocument({ title: "Newer" }));

    const list = await store.list("owner-1");

    expect(list.map((doc) => doc.id)).toEqual([newer.id, older.id]);
    expect(list[0].pageCount).toBe(fixtureScannedDocument().pages.length);
  });

  it("removes a document so it no longer appears or loads", async () => {
    const store = makeStore();
    const saved = await store.save("owner-1", fixtureScannedDocument());

    await store.remove("owner-1", saved.id);

    expect(await store.list("owner-1")).toHaveLength(0);
    const error = await store.load("owner-1", saved.id).catch((e) => e);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("NOT_FOUND");
  });

  it("throws NOT_FOUND for a load or remove of an id that was never saved", async () => {
    const store = makeStore();

    const loadError = await store.load("owner-1", "missing-id").catch((e) => e);
    expect(isAppError(loadError)).toBe(true);
    expect(loadError.code).toBe("NOT_FOUND");

    const removeError = await store.remove("owner-1", "missing-id").catch((e) => e);
    expect(isAppError(removeError)).toBe(true);
    expect(removeError.code).toBe("NOT_FOUND");
  });

  it("scopes documents to their owner — one owner's id is invisible to another", async () => {
    const store = makeStore();
    const saved = await store.save("owner-1", fixtureScannedDocument());

    expect(await store.list("owner-2")).toHaveLength(0);
    const error = await store.load("owner-2", saved.id).catch((e) => e);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("NOT_FOUND");
  });
});
