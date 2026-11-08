"use client";

import { useRowLabel } from "@payloadcms/ui";

export default function RoleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; color?: string; members?: unknown[] }>();
  return (
    <span className="kz-role-label">
      <span className="kz-role-label__color" style={{ backgroundColor: data.color }} aria-hidden="true" />
      {data.name || `職銜 ${(rowNumber ?? 0) + 1}`} · {data.members?.length ?? 0} 位成員
    </span>
  );
}
