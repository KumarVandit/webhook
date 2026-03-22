CREATE TABLE IF NOT EXISTS "webhook_delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_config_id" uuid NOT NULL,
	"event" text NOT NULL,
	"status_code" integer,
	"success" boolean NOT NULL,
	"error" text,
	"duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_delivery_logs_webhook_config_id_fkey"
		FOREIGN KEY ("webhook_config_id")
		REFERENCES "webhook_configs"("id")
		ON DELETE CASCADE
);
