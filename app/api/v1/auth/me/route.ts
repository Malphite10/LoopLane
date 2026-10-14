import { cookies } from "next/headers";
import { ok, fail, handle } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { TENANT_COOKIE, resolveTenantContext } from "@/lib/tenant";
import { db } from "@/db/index";
import { memberships, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  return handle(async () => {
    const user = await getSessionUser();
    if (!user) {
      return fail(401, "unauthenticated", "Sign in to continue.");
    }

    const rows = await db
      .select({ tenant: tenants, role: memberships.role })
      .from(memberships)
      .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
      .where(eq(memberships.userId, user.id));

    const context = await resolveTenantContext(user);

    return ok({
      user: { id: user.id, name: user.name, email: user.email },
      activeTenant: context
        ? { id: context.tenant.id, name: context.tenant.name, role: context.role, permissions: context.permissions }
        : null,
      tenants: rows.map((r) => ({ id: r.tenant.id, name: r.tenant.name, role: r.role })),
    });
  });
}

export async function DELETE() {
  return handle(async () => {
    const jar = await cookies();
    jar.delete(TENANT_COOKIE);
    return ok({ cleared: true });
  });
}
