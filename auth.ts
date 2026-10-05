import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const login = (profile as any).login as string;
        const user = await db.user.upsert({
          where: { githubLogin: login },
          update: { name: profile.name ?? login, image: (profile as any).avatar_url },
          create: { githubLogin: login, name: profile.name ?? login, image: (profile as any).avatar_url },
        });
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id = token.uid;
      return session;
    },
  },
});
