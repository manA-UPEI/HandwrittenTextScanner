import { describe, expect, it } from "vitest";
import { assertValidImagePayload } from "@/use-cases/validate-image-payload";
import { fixtureImage } from "@/test/fixtures";
import { isAppError } from "@/domain/errors/app-error";

describe("assertValidImagePayload", () => {
  it("accepts a well-formed image", () => {
    expect(() => assertValidImagePayload(fixtureImage())).not.toThrow();
  });

  it("rejects a disallowed mime type", () => {
    // @ts-expect-error deliberately invalid mime type for the guard test
    const image = fixtureImage({ mimeType: "image/gif" });
    expect(() => assertValidImagePayload(image)).toThrowError(
      expect.objectContaining({ code: "INVALID_IMAGE" }),
    );
  });

  it("rejects malformed base64", () => {
    const image = fixtureImage({ base64: "not-base64!!" });
    try {
      assertValidImagePayload(image);
      expect.fail("expected assertValidImagePayload to throw");
    } catch (error) {
      expect(isAppError(error)).toBe(true);
    }
  });

  it("rejects an oversized payload", () => {
    const oversized = "A".repeat(7 * 1024 * 1024); // decodes to well over 5MB
    const image = fixtureImage({ base64: oversized });
    expect(() => assertValidImagePayload(image)).toThrowError(
      expect.objectContaining({ code: "INVALID_IMAGE" }),
    );
  });
});
