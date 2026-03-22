import { db, webhookConfigs, webhookDeliveryLogs } from "@turbobun/db";
import { desc, eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

const MAX_LOGS = 200;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const serverUrl = request.nextUrl.searchParams.get("serverUrl");
  const apiKey =
    request.headers.get("x-api-key") ??
    request.nextUrl.searchParams.get("apiKey");

  if (!(serverUrl && apiKey)) {
    return NextResponse.json(
      { error: "serverUrl and apiKey are required." },
      { status: 400 }
    );
  }

  try {
    // Get all webhook config IDs for this server
    const configs = await db
      .select({
        id: webhookConfigs.id,
        webhook: webhookConfigs.webhook,
      })
      .from(webhookConfigs)
      .where(eq(webhookConfigs.serverUrl, serverUrl));

    if (configs.length === 0) {
      return NextResponse.json([]);
    }

    const configIds = configs.map((c) => c.id);
    const webhookMap = new Map(configs.map((c) => [c.id, c.webhook]));

    const logs = await db
      .select({
        id: webhookDeliveryLogs.id,
        webhookConfigId: webhookDeliveryLogs.webhookConfigId,
        event: webhookDeliveryLogs.event,
        statusCode: webhookDeliveryLogs.statusCode,
        success: webhookDeliveryLogs.success,
        error: webhookDeliveryLogs.error,
        duration: webhookDeliveryLogs.duration,
        createdAt: webhookDeliveryLogs.createdAt,
      })
      .from(webhookDeliveryLogs)
      .where(inArray(webhookDeliveryLogs.webhookConfigId, configIds))
      .orderBy(desc(webhookDeliveryLogs.createdAt))
      .limit(MAX_LOGS);

    const result = logs.map((log) => ({
      id: log.id,
      webhookUrl: webhookMap.get(log.webhookConfigId) ?? "unknown",
      event: log.event,
      statusCode: log.statusCode,
      success: log.success,
      error: log.error,
      duration: log.duration,
      createdAt: log.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch delivery logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery logs." },
      { status: 500 }
    );
  }
}
