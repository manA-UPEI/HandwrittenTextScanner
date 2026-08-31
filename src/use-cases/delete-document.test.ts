import { describe, expect, it } from "vitest";
import { makeDeleteDocument } from "@/use-cases/delete-document";
import { makeFakeDocumentStore } from "@/test/fakes";
import { fixtureScannedDocument } from "@/test/fixtures";
import { isAppError } from "@/domain/errors/app-error";

describe("makeDeleteDocument", () => {
  it("removes a document the owner had saved", async () => {
    const documentStore = makeFakeDocumentStore();
    const saved = await documentStore.save("owner-1", fixtureScannedDocument());
    const deleteDocument = makeDeleteDocument({ documentStore });

    await deleteDocument("owner-1", saved.id);

    expect(await documentStore.list("owner-1")).toEqual([]);
  });

  it("throws NOT_FOUND rather than deleting another owner's document", async () => {
    const documentStore = makeFakeDocumentStore();
    const saved = await documentStore.save("owner-1", fixtureScannedDocument());
    const deleteDocument = makeDeleteDocument({ documentStore });

    const error = await deleteDocument("owner-2", saved.id).catch((e) => e);

    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("NOT_FOUND");
    expect(await documentStore.load("owner-1", saved.id)).toBeTruthy();
  });
});
