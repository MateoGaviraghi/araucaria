CREATE TABLE "module_settings" (
	"code" text PRIMARY KEY NOT NULL,
	"start_min" smallint NOT NULL,
	"end_min" smallint NOT NULL,
	"price" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "module_settings_code_check" CHECK ("module_settings"."code" in ('mediodia', 'noche', 'dia-completo')),
	CONSTRAINT "module_settings_hours_check" CHECK ("module_settings"."start_min" between 480 and 1410 and "module_settings"."end_min" > "module_settings"."start_min" and "module_settings"."end_min" <= 1800 and "module_settings"."start_min" % 30 = 0 and "module_settings"."end_min" % 30 = 0),
	CONSTRAINT "module_settings_price_check" CHECK ("module_settings"."price" between 0 and 99999999)
);
--> statement-breakpoint
ALTER TABLE "admin_audit" DROP CONSTRAINT "admin_audit_action_check";--> statement-breakpoint
ALTER TABLE "admin_audit" ADD CONSTRAINT "admin_audit_action_check" CHECK ("admin_audit"."action" in ('login_ok', 'login_fail', 'login_locked', 'logout', 'block', 'unblock', 'password_rotated', 'edit', 'settings'));--> statement-breakpoint
-- D-053: the values the client sent on 2026-10-13 (docs/01-CONTEXT.md). From now on the owner edits them in the panel.
INSERT INTO "module_settings" ("code", "start_min", "end_min", "price") VALUES ('mediodia', 600, 1110, 260000), ('noche', 1200, 1560, 260000), ('dia-completo', 600, 1560, 500000);