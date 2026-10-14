import { cookies } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/index";
import {
  memberships,
  tenants,
  type Membership,
  type Tenant,
  type User,
} from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { can, permissionsFor, type Permission, type Role } from "@/lib/permissions";

export const TENANT_COOKIE = "looplane_tenant";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export interface TenantContext {
  user: User;
  tenant: Tenant;
  membership: Membership;
  role: Role;
  permissions: Permission[];
}

/**
 * Resolves the active tenant strictly from the authenticated user's
 * memberships. A tenant hint in a cookie (or anywhere else in the request)
 * is only honored after it has been validated against a persisted
 * membership row — tenant identity is never taken from raw request input.
 */
export async function resolveTenantContext(
  user: User,
): Promise<TenantContext | null> {
  const rows = await db
    .select({ membership: memberships, tenant: tenants })
    .from(memberships)
    .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
    .where(eq(memberships.userId, user.id))
    .orderBy(asc(memberships.createdAt));

  if (rows.length === 0) return null;

  const jar = await cookies();
  const hint = jar.get(TENANT_COOKIE)?.value;
  const selected =
    (hint ? rows.find((r) => r.tenant.id === hint) : undefined) ?? rows[0];

  const role = selected.membership.role as Role;
  return {
    user,
    tenant: selected.tenant,
    membership: selected.membership,
    role,
    permissions: permissionsFor(role),
  };
}

export async function requireContext(): Promise<TenantContext> {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError(401, "unauthenticated", "Sign in to continue.");
  }
  const context = await resolveTenantContext(user);
  if (!context) {
    throw new ApiError(403, "no_tenant", "No tenant membership found.");
  }
  return context;
}

export async function requirePermission(
  permission: Permission,
): Promise<TenantContext> {
  const context = await requireContext();
  if (!can(context.role, permission)) {
    throw new ApiError(
      403,
      "forbidden",
      `Missing required permission: ${permission}.`,
    );
  }
  return context;
}

export async function assertMembership(
  userId: string,
  tenantId: string,
): Promise<Membership | null> {
  const rows = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)))
    .limit(1);
  return rows[0] ?? null;
}
