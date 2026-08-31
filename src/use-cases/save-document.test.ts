import { describe, expect, it } from "vitest";
import { makeSaveDocument } from "@/use-cases/save-document";
import { makeFakeDocumentStore } from "@/test/fakes";
import { fixtureScannedDocument } from "@/test/fixtures";

describe("makeSaveDocument", () => {
  it("saves a new document under the owner", async () => {
    const documentStore = makeFakeDocumentStore();
    const saveDocument = makeSaveDocument({ documentStore });

    const saved = await saveDocument("owner-1", fixtureScannedDocument({ title: "Notes" }));

    expect(saved.title).toBe("Notes");
    expect(await documentStore.load("owner-1", saved.id)).toEqual(saved);
  });

  it("updates the existing document in place when an id is supplied", async () => {
    const documentStore = makeFakeDocumentStore();
    const saveDocument = makeSaveDocument({ documentStore });
    const first = await saveDocument("owner-1", fixtureScannedDocument({ title: "Draft" }));

    const second = await saveDocument(
      "owner-1",
      fixtureScannedDocument({ title: "Final" }),
      first.id,
    );

    expect(second.id).toBe(first.id);
    expect((await documentStore.list("owner-1")).length).toBe(1);
  });

  it("defaults a blank title to Untitled scan", async () => {
    const documentStore = makeFakeDocumentStore();
    const saveDocument = makeSaveDocument({ documentStore });

    const saved = await saveDocument("owner-1", fixtureScannedDocument({ title: "   " }));

    expect(saved.title).toBe("Untitled scan");
  });
});
