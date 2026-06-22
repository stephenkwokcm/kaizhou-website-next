import type { CollectionConfig } from "payload";

const isAdmin = (user: { roles?: string[] | null } | null | undefined): boolean =>
  Boolean(user?.roles?.includes("admin"));

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "使用者", plural: "使用者" },
  admin: {
    group: "系統",
    useAsTitle: "email",
  },
  auth: {
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  access: {
    admin: ({ req: { user } }) => isAdmin(user),
    create: ({ req: { user } }) => isAdmin(user),
    read: ({ req: { user } }) => isAdmin(user),
    update: ({ req: { user } }) => isAdmin(user),
    delete: ({ req: { user } }) => isAdmin(user),
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
      saveToJWT: true,
      options: [
        { label: "管理員", value: "admin" },
        { label: "編輯", value: "editor" },
      ],
      access: {
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
  ],
};
