import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/server/lib/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Für Development, in Production auf true setzen
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},
	advanced: {
		crossSubDomainCookies: {
			enabled: false,
		},
		useSecureCookies: process.env.NODE_ENV === "production",
	},
	secret: process.env.BETTER_AUTH_SECRET || "your-super-secret-key-change-this-in-production",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
