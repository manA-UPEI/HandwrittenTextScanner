import type { DefaultSession } from "next-auth";

/** Adds the id NextAuth's session callback attaches — see src/auth.ts. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
