CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"client_name" text,
	"client_phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_client_name_check" CHECK (char_length("reservations"."client_name") between 1 and 80),
	CONSTRAINT "reservations_client_phone_check" CHECK ("reservations"."client_phone" ~ '^[+]54[0-9]{10}$')
);
--> statement-breakpoint
ALTER TABLE "module_blocks" ADD COLUMN "reservation_id" uuid;--> statement-breakpoint
CREATE INDEX "reservations_date_idx" ON "reservations" USING btree ("date");--> statement-breakpoint
ALTER TABLE "module_blocks" ADD CONSTRAINT "module_blocks_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "module_blocks_reservation_id_idx" ON "module_blocks" USING btree ("reservation_id");