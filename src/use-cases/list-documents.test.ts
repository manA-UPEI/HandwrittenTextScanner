import { describe, expect, it } from "vitest";
import { makeListDocuments } from "@/use-cases/list-documents";
import { makeFakeDocumentStore } from "@/test/fakes";
import { fixtureScannedDocument } from "@/test/fixtures";

describe("makeListDocuments", () => {
  it("lists only the calling owner's documents", async () => {
    const documentStore = makeFakeDocumentStore();
    await documentStore.save("owner-1", fixtureScannedDocument({ title: "Mine" }));
    await documentStore.save("owner-2", fixtureScannedDocument({ title: "Theirs" }));
    const listDocuments = makeListDocuments({ documentStore });

    const result = await listDocuments("owner-1");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Mine");
  });

  it("returns an empty list for an owner with no saved documents", async () => {
    const documentStore = makeFakeDocumentStore();
    const listDocuments = makeListDocuments({ documentStore });

    expect(await listDocuments("owner-1")).toEqual([]);
  });
});
