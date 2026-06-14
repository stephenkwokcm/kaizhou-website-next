import type { CollectionConfig } from "payload";

const isAdmin = (user: { roles?: string[] | null } | null | undefined): boolean =>
  Boolean(user?.roles?.includes("admin"));

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  access: {
    // Who can enter /admin
    admin: ({ req: { user } }) => isAdmin(user),
    create: ({ req: { user } }) => isAdmin(user),
    read: ({ req: { user } }) => isAdmin(user),
    update: ({ req: { user } }) => isAdmin(user),
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["admin"],
      // Persist roles into the JWT so access checks avoid a DB lookup.
      saveToJWT: true,
      options: ["admin", "editor"],
      access: {
        // Only an admin can set or change roles (prevents self-elevation,
        // including at creation time if collection-create is ever loosened).
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
  ],
};
