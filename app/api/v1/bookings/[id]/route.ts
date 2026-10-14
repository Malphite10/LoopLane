import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/index";
import { bookings } from "@/db/schema";
import { ok, fail, parseBody, handle } from "@/lib/api";
import { requirePermission } from "@/lib/tenant";
import { updateBookingSchema } from "@/lib/validation";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function parseId(id: string): Promise<string | null> {
  return z.string().uuid().safeParse(id).success ? id : null;
}

export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const rawId = (await params).id;
    const id = await parseId(rawId);
    const context = await requirePermission("bookings:write");
    if (!id) return fail(404, "not_found", "Booking not found.");
    const input = await parseBody(request, updateBookingSchema);

    const [updated] = await db
      .update(bookings)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
        ...(input.startsAt !== undefined ? { startsAt: new Date(input.startsAt) } : {}),
        ...(input.endsAt !== undefined ? { endsAt: new Date(input.endsAt) } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      })
      // Tenant ownership is enforced in the same predicate as the update.
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, context.tenant.id)))
      .returning();

    if (!updated) {
      return fail(404, "not_found", "Booking not found.");
    }
    return ok(updated);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const id = await parseId((await params).id);
    const context = await requirePermission("bookings:write");
    if (!id) return fail(404, "not_found", "Booking not found.");

    const [deleted] = await db
      .delete(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, context.tenant.id)))
      .returning({ id: bookings.id });

    if (!deleted) {
      return fail(404, "not_found", "Booking not found.");
    }
    return ok({ deleted: deleted.id });
  });
}

export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const id = await parseId((await params).id);
    const context = await requirePermission("bookings:read");
    if (!id) return fail(404, "not_found", "Booking not found.");

    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, context.tenant.id)))
      .limit(1);

    if (!booking) {
      return fail(404, "not_found", "Booking not found.");
    }
    return ok(booking);
  });
}
