"use client";

import { TextField, useField } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";

export default function RoleColor(props: TextFieldClientProps) {
  const { value, setValue } = useField<string>({ path: props.path });
  return (
    <div className="kz-role-color">
      <TextField {...props} />
      <input
        aria-label="選擇職銜顏色"
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value ?? "") ? value : "#8b2323"}
        disabled={props.readOnly || props.field.admin?.readOnly}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
