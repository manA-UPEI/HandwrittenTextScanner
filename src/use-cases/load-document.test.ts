import { describe, expect, it } from "vitest";
import { makeLoadDocument } from "@/use-cases/load-document";
import { makeFakeDocumentStore } from "@/test/fakes";
import { fixtureScannedDocument } from "@/test/fixtures";
import { isAppError } from "@/domain/errors/app-error";

describe("makeLoadDocument", () => {
  it("loads a document previously saved for that owner", async () => {
    const documentStore = makeFakeDocumentStore();
    const saved = await documentStore.save("owner-1", fixtureScannedDocument());
    const loadDocument = makeLoadDocument({ documentStore });

    expect(await loadDocument("owner-1", saved.id)).toEqual(saved);
  });

  it("throws NOT_FOUND for another owner's document id", async () => {
    const documentStore = makeFakeDocumentStore();
    const saved = await documentStore.save("owner-1", fixtureScannedDocument());
    const loadDocument = makeLoadDocument({ documentStore });

    const error = await loadDocument("owner-2", saved.id).catch((e) => e);

    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("NOT_FOUND");
  });
});
