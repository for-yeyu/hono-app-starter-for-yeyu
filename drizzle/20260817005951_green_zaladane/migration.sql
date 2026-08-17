ALTER TABLE "users" RENAME COLUMN "email" TO "password";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_key";