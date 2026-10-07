ALTER TABLE "admin_audit" DROP CONSTRAINT "admin_audit_action_check";--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "custom_from" smallint;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "custom_to" smallint;--> statement-breakpoint
ALTER TABLE "admin_audit" ADD CONSTRAINT "admin_audit_action_check" CHECK ("admin_audit"."action" in ('login_ok', 'login_fail', 'login_locked', 'logout', 'block', 'unblock', 'password_rotated', 'edit'));--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_notes_check" CHECK (char_length("reservations"."notes") between 1 and 500);--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_custom_hours_check" CHECK (("reservations"."custom_from" is null and "reservations"."custom_to" is null) or ("reservations"."custom_from" between 480 and 1410 and "reservations"."custom_to" > "reservations"."custom_from" and "reservations"."custom_to" <= 1800 and "reservations"."custom_from" % 30 = 0 and "reservations"."custom_to" % 30 = 0));