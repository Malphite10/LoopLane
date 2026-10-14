import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { bookings } from "@/db/schema";
import { ok, parseBody, handle } from "@/lib/api";
import { requirePermission } from "@/lib/tenant";
import { createBookingSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  return handle(async () => {
    const context = await requirePermission("bookings:read");
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.tenantId, context.tenant.id))
      .orderBy(desc(bookings.startsAt));
    return ok(rows);
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const context = await requirePermission("bookings:write");
    const input = await parseBody(request, createBookingSchema);

    const [created] = await db
      .insert(bookings)
      .values({
        // Tenant scope always comes from the authenticated membership,
        // never from the request payload.
        tenantId: context.tenant.id,
        createdBy: context.user.id,
        title: input.title,
        customerName: input.customerName,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        status: input.status ?? "pending",
        notes: input.notes ?? null,
      })
      .returning();

    return ok(created, 201);
  });
}

export async function DELETE() {
  return handle(async () => {
    const context = await requirePermission("bookings:write");
    await db.delete(bookings).where(and(eq(bookings.tenantId, context.tenant.id)));
    return ok({ deleted: true });
  });
}
