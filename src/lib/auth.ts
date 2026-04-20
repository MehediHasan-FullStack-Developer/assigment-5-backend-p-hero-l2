import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { bearer, emailOTP, oAuthProxy } from "better-auth/plugins";
import { sendMail } from "../helper/sendMail";
import { Role, UserStatus } from "../generated/prisma";
import { emailMessage, forgotMessage } from "../helper/mailText";
import { env } from "../config/envConfig";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // baseURL: env.CLIENT_URL,
  // baseURL: "http://localhost:5000",
  baseURL: env.BETTER_AUTH_BASE_URL,
  trustedOrigins: [env.CLIENT_URL, "http://localhost:3000"],

  plugins: [
    bearer(),
    emailOTP({
      otpLength: 8,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendMail(email, otp, emailMessage);
        } else if (type === "forget-password") {
          await sendMail(email, otp, forgotMessage);
        }
      },
    }),
    oAuthProxy(),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
      },

      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },

      hasPassword: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
    },
  },

  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: true,
    // cookies: {
    //   state: {
    //     name: "session_token",
    //     attributes: {
    //       sameSite: "none",
    //       secure: true,
    //       httpOnly: true,
    //       path: "/",
    //     },
    //   },
    //   session_token: {
    //     name: "session_token",
    //     attributes: {
    //       sameSite: "none",
    //       secure: true,
    //       httpOnly: true,
    //       path: "/",
    //     },
    //   },
    // },
  },

  socialProviders: {
    google: {
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
    },
  },
});
