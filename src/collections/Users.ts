import type { CollectionConfig } from "payload";
import { adminOnly, adminOrSelf, isAdminUser, isAdminOrEditorUser } from "@/access";
import { SSO_ONLY } from "@/lib/sso";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "使用者", plural: "使用者" },
  admin: {
    group: "管理員專用",
    useAsTitle: "email",
    // Account management is admin-only — hide this collection from editors' nav.
    hidden: ({ user }) => !isAdminUser(user),
  },
  auth: {
    // Prod → SSO-only (no email/password, no fallback). Dev keeps email/password
    // as a local bypass. See lib/sso (SSO_ONLY).
    disableLocalStrategy: SSO_ONLY ? true : undefined,
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  access: {
    // Editors may enter /admin (to manage content); account management stays
    // admin-only. Editors are scoped to their own account so the profile view
    // works, but they can never read or edit other users.
    admin: ({ req: { user } }) => isAdminOrEditorUser(user),
    create: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOnly,
  },
  fields: [
    { name: "name", type: "text", label: "姓名" },
    {
      name: "roles",
      type: "select",
      label: "角色",
      hasMany: true,
      required: true,
      defaultValue: ["admin"],
      // Persist roles into the JWT so access checks avoid a DB lookup.
      saveToJWT: true,
      options: [
        { label: "管理員", value: "admin" },
        { label: "編輯", value: "editor" },
      ],
      access: {
        // Only an admin can set or change roles (prevents self-elevation,
        // including at creation time if collection-create is ever loosened).
        create: ({ req: { user } }) => isAdminUser(user),
        update: ({ req: { user } }) => isAdminUser(user),
      },
    },
  ],
};
