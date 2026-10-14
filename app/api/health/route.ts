import { sql } from "drizzle-orm";
import { db } from "@/db/index";

export const runtime = "nodejs";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      status: "ok",
      database: "connected",
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json(
      { status: "degraded", database: "unavailable" },
      { status: 503 },
    );
  }
}
