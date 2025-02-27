import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import supabase from "@/app/utils/db";
import logActivity from "@/components/Admin/ActivityLog/Login";
import logFailedLogin from "@/components/Admin/ActivityLog/LoginFailed";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 5, // Session berumur 5 jam karena 60 * 60 detik * 5 = 5 jam
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        // const { data, error } = await supabase
        //   .from("users")
        //   .select("*")
        //   .eq("email", credentials?.email);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .or(
            `email.eq.${credentials?.email},username.eq.${credentials?.email}`
          ); // Bisa login dengan email atau username

        if (error || !data.length) {
          return null;
        }
        const user = data[0];

        const passwordCorrect = await bcrypt.compare(
          credentials?.password,
          user?.password
        );

        if (passwordCorrect) {
          const userAgent = req.headers["user-agent"] || "Unknown";
          await logActivity({
            idUser: user?.id,
            role: user?.role,
            action: "Login",
            detail: "Login successful",
            userAgent: userAgent,
          });

          return {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            username: user?.username,
            role: user?.role,
            provider: user?.provider,
            status: user?.status,
          };
        } else {
          const userAgent = req.headers["user-agent"] || "Unknown";
          await logFailedLogin(credentials?.email, userAgent);
        }

        // console.log("credentials", credentials);
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.status = user.status;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        username: token.username,
        email: token.email,
        provider: token.provider,
        status: token.status,
        role: token.role,
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
