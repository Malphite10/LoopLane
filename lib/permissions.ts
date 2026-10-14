export const PERMISSIONS = [
  "bookings:read",
  "bookings:write",
  "members:read",
  "members:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type Role = "owner" | "admin" | "member";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [...PERMISSIONS],
  admin: ["bookings:read", "bookings:write", "members:read"],
  member: ["bookings:read"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsFor(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}
