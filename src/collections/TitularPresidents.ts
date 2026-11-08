import type { CollectionConfig } from "payload";
import { HonoraryPresidents } from "./HonoraryPresidents";

export const TitularPresidents: CollectionConfig = {
  ...HonoraryPresidents,
  slug: "titular-presidents",
  labels: { singular: "名譽會長", plural: "名譽會長" },
  admin: {
    ...HonoraryPresidents.admin,
    description: "管理名譽會長資料及顯示順序，於前台獨立區塊展示，顏色固定。",
  },
};
