import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * JWT sessions — no database required. Google is the only provider: free,
 * no password storage, and users already have an account. The session
 * callback copies the JWT's `sub` (the stable Google account id) onto
 * `session.user.id`, which is what transcribe-image.action.ts uses as the
 * rate limiter's client id.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
