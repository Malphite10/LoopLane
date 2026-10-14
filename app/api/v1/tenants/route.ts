import { cookies } from "next/headers";
import { db } from "@/db/index";
import { memberships, tenants } from "@/db/schema";
import { ok, parseBody, handle } from "@/lib/api";
import { requireContext, TENANT_COOKIE } from "@/lib/tenant";
import { slugify } from "@/lib/auth";
import { createTenantSchema, switchTenantSchema } from "@/lib/validation";
import { assertMembership } from "@/lib/tenant";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handle(async () => {
    const context = await requireContext();
    const input = await parseBody(request, createTenantSchema);
    const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;

    const created = await db.transaction(async (tx) => {
      const [tenant] = await tx.insert(tenants).values({ name: input.name, slug }).returning();
      await tx.insert(memberships).values({
        userId: context.user.id,
        tenantId: tenant.id,
        role: "owner",
      });
      return tenant;
    });

    return ok(
      { id: created.id, name: created.name, slug: created.slug },
      201,
    );
  });
}

export async function PUT(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, switchTenantSchema);
    const context = await requireContext();
    const membership = await assertMembership(context.user.id, input.tenantId);
    if (!membership) {
      return Response.json(
        { error: { code: "forbidden", message: "You are not a member of this tenant." } },
        { status: 403 },
      );
    }

    const jar = await cookies();
    jar.set(TENANT_COOKIE, input.tenantId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return ok({ switchedTo: input.tenantId });
  });
}
