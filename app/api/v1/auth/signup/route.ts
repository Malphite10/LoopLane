import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { memberships, tenants, users } from "@/db/schema";
import { ok, fail, parseBody, handle } from "@/lib/api";
import { createSession, hashPassword, slugify } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, signupSchema);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);
    if (existing.length > 0) {
      return fail(409, "email_taken", "An account with this email already exists.");
    }

    const tenantName = input.tenantName?.trim() || `${input.name}'s workspace`;
    const slug = `${slugify(tenantName)}-${Date.now().toString(36)}`;

    const created = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash: hashPassword(input.password),
        })
        .returning();

      const [tenant] = await tx.insert(tenants).values({ name: tenantName, slug }).returning();

      // Tenant creation and initial owner membership are atomic: a tenant
      // must never exist without its owner.
      await tx.insert(memberships).values({
        userId: user.id,
        tenantId: tenant.id,
        role: "owner",
      });

      return { user, tenant };
    });

    await createSession(created.user.id);

    return ok(
      {
        user: { id: created.user.id, name: created.user.name, email: created.user.email },
        tenant: { id: created.tenant.id, name: created.tenant.name, slug: created.tenant.slug },
      },
      201,
    );
  });
}
