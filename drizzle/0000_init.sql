CREATE TABLE "admin_audit" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_hash" text,
	"session_id" uuid,
	CONSTRAINT "admin_audit_action_check" CHECK ("admin_audit"."action" in ('login_ok', 'login_fail', 'login_locked', 'logout', 'block', 'unblock', 'password_rotated'))
);
--> statement-breakpoint
CREATE TABLE "admin_credential" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"password_hash" text NOT NULL,
	"credential_version" integer DEFAULT 1 NOT NULL,
	"rotated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_credential_id_check" CHECK ("admin_credential"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"credential_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "admin_sessions_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "login_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"ip_hash" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"module" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "module_blocks_date_module_key" UNIQUE("date","module"),
	CONSTRAINT "module_blocks_module_check" CHECK ("module_blocks"."module" in ('mediodia', 'noche'))
);
--> statement-breakpoint
CREATE INDEX "admin_audit_at_idx" ON "admin_audit" USING btree ("at");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_hash_at_idx" ON "login_attempts" USING btree ("ip_hash","at");--> statement-breakpoint
CREATE INDEX "login_attempts_at_idx" ON "login_attempts" USING btree ("at");