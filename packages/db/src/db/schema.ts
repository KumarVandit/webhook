import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const webhookConfigs = pgTable(
  "webhook_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serverUrl: text("server_url").notNull(),
    signingSecret: text("signing_secret").notNull(),
    webhook: text("webhook").notNull(),
    apiKey: text("api_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.serverUrl, t.webhook)]
);

export const webhookDeliveryLogs = pgTable("webhook_delivery_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  webhookConfigId: uuid("webhook_config_id")
    .notNull()
    .references(() => webhookConfigs.id, { onDelete: "cascade" }),
  event: text("event").notNull(),
  statusCode: integer("status_code"),
  success: boolean("success").notNull(),
  error: text("error"),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
