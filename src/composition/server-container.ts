import "server-only";
import {
  resolveAiProvider,
  resolveDocumentStoreBackend,
  resolveRateLimiterBackend,
} from "@/infrastructure/config/server-env";
import { transcriptionProviders } from "@/infrastructure/ai/registry";
import { rateLimiterBackends } from "@/infrastructure/security/registry";
import { documentStoreBackends } from "@/infrastructure/persistence/registry";
import { makeTranscribeImage } from "@/use-cases/transcribe-image";
import { makeSaveDocument } from "@/use-cases/save-document";
import { makeListDocuments } from "@/use-cases/list-documents";
import { makeLoadDocument } from "@/use-cases/load-document";
import { makeDeleteDocument } from "@/use-cases/delete-document";

// A single set of limiter instances shared across requests to this server
// process. On the "memory" backend that's what makes the limits hold at
// all; on "upstash" every instance shares the same Redis-backed counters
// anyway.
const rateLimiters = rateLimiterBackends[resolveRateLimiterBackend()]();

// Same reasoning as rateLimiters above: one shared store per server
// process, since that's what makes the "memory" backend hold documents
// across requests at all.
const documentStore = documentStoreBackends[resolveDocumentStoreBackend()]();

/**
 * The only place a concrete TranscriptionService meets the use case.
 * Resolves the provider from the registry (see @/infrastructure/ai/registry)
 * so swapping AI_PROVIDER never touches this function's body.
 */
export const createServerServices = () => {
  const transcription = transcriptionProviders[resolveAiProvider()]();

  return {
    transcribeImage: makeTranscribeImage({ transcription, rateLimiters }),
    saveDocument: makeSaveDocument({ documentStore }),
    listDocuments: makeListDocuments({ documentStore }),
    loadDocument: makeLoadDocument({ documentStore }),
    deleteDocument: makeDeleteDocument({ documentStore }),
  };
};
