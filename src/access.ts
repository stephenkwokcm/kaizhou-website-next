import type { Access } from "payload";

// Shared role-based access helpers. Roles are "admin" and "editor" (see Users).
// Admins do everything; editors maintain content but cannot touch user accounts
// or site settings.

type WithRoles = { roles?: string[] | null };

const rolesOf = (user: unknown): string[] => {
  const r = (user as WithRoles | null | undefined)?.roles;
  return Array.isArray(r) ? r : [];
};

export const isAdminUser = (user: unknown): boolean => rolesOf(user).includes("admin");
const isEditorUser = (user: unknown): boolean => rolesOf(user).includes("editor");
export const isAdminOrEditorUser = (user: unknown): boolean =>
  isAdminUser(user) || isEditorUser(user);

/** Public — anyone, including unauthenticated (for public-facing reads). */
export const anyone: Access = () => true;

/** Admin role only. */
export const adminOnly: Access = ({ req: { user } }) => isAdminUser(user);

/** Admin or editor role — the content maintainers who may use the panel. */
export const adminOrEditor: Access = ({ req: { user } }) => isAdminOrEditorUser(user);

/**
 * Admins act on every document; a non-admin is scoped to their OWN document
 * only. Used on Users so an editor's account/profile view works while they can
 * never see or edit other accounts.
 */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (isAdminUser(user)) return true;
  if (user) return { id: { equals: user.id } };
  return false;
};
