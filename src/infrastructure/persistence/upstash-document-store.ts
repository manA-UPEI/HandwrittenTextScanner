import { Redis } from "@upstash/redis";
import type { DocumentStore, SavedDocument } from "@/domain/ports/document-store";
import type { ScannedDocument } from "@/domain/entities/scanned-document";
import { AppError } from "@/domain/errors/app-error";

/**
 * The slice of @upstash/redis this adapter actually calls. Depending on this
 * narrow shape — instead of the full Redis class — is what lets tests inject
 * a stub without a real Redis instance, same convention as RateLimitClient
 * in the upstash rate limiter.
 */
interface RedisDocumentClient {
  get<TData>(key: string): Promise<TData | null>;
  set(key: string, value: unknown): Promise<unknown>;
  del(key: string): Promise<number>;
  zadd(key: string, scoreMember: { score: number; member: string }): Promise<unknown>;
  zrange<TData extends unknown[]>(
    key: string,
    min: number,
    max: number,
    opts?: { rev?: boolean },
  ): Promise<TData>;
  zrem(key: string, ...members: string[]): Promise<unknown>;
  mget<TData extends unknown[]>(...keys: string[]): Promise<TData>;
}

interface Overrides {
  url?: string;
  token?: string;
  /** Separates keys from other data sharing the same Redis instance. */
  prefix?: string;
  client?: RedisDocumentClient;
  /** Injected clock, so tests can control save ordering without real delays. */
  now?: () => number;
}

const resolveCredentials = (overrides: Overrides): { url: string; token: string } => {
  const url = overrides.url ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = overrides.token ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new AppError(
      "CONFIG_MISSING",
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for " +
        'DOCUMENT_STORE_BACKEND="upstash". Add them to .env.local, or set ' +
        'DOCUMENT_STORE_BACKEND="memory" for local development.',
    );
  }

  return { url, token };
};

/**
 * DocumentStore backed by Upstash Redis — shared across every server
 * instance, unlike the in-memory adapter, so it's the one to use once this
 * app runs as more than one serverless invocation. Reads its own
 * configuration lazily (on first call, not at import time), same convention
 * as the Gemini provider and the Upstash rate limiter.
 *
 * One JSON value per document (`{prefix}:doc:{ownerId}:{id}`) plus one
 * sorted set per owner (`{prefix}:docs:{ownerId}`, scored by save time) for
 * ordered listing without a full table scan.
 */
export const makeUpstashDocumentStore = (overrides: Overrides = {}): DocumentStore => {
  const prefix = overrides.prefix ?? "handwriting-scanner";
  const now = overrides.now ?? Date.now;
  let client: RedisDocumentClient | undefined = overrides.client;

  const resolveClient = (): RedisDocumentClient => {
    if (!client) {
      const { url, token } = resolveCredentials(overrides);
      client = new Redis({ url, token });
    }
    return client;
  };

  const docKey = (ownerId: string, id: string) => `${prefix}:doc:${ownerId}:${id}`;
  const indexKey = (ownerId: string) => `${prefix}:docs:${ownerId}`;

  return {
    async save(ownerId, document: ScannedDocument, id) {
      const resolvedId = id ?? crypto.randomUUID();
      const saved: SavedDocument = {
        ...document,
        id: resolvedId,
        updatedAt: new Date(now()).toISOString(),
      };

      const redis = resolveClient();
      await redis.set(docKey(ownerId, resolvedId), saved);
      await redis.zadd(indexKey(ownerId), { score: now(), member: resolvedId });
      return saved;
    },

    async list(ownerId) {
      const redis = resolveClient();
      const ids = await redis.zrange<string[]>(indexKey(ownerId), 0, -1, { rev: true });
      if (ids.length === 0) return [];

      const docs = await redis.mget<(SavedDocument | null)[]>(
        ...ids.map((id) => docKey(ownerId, id)),
      );
      return docs
        .filter((doc): doc is SavedDocument => doc !== null)
        .map((doc) => ({
          id: doc.id,
          title: doc.title,
          pageCount: doc.pages.length,
          updatedAt: doc.updatedAt,
        }));
    },

    async load(ownerId, id) {
      const redis = resolveClient();
      const doc = await redis.get<SavedDocument>(docKey(ownerId, id));
      if (!doc) throw new AppError("NOT_FOUND", "This document could not be found.");
      return doc;
    },

    async remove(ownerId, id) {
      const redis = resolveClient();
      const deletedCount = await redis.del(docKey(ownerId, id));
      await redis.zrem(indexKey(ownerId), id);
      if (deletedCount === 0) {
        throw new AppError("NOT_FOUND", "This document could not be found.");
      }
    },
  };
};
