"use client";

import { useField, useForm } from "@payloadcms/ui";

// Renders above the rich-text body (News `content` / Activities `description`)
// to help non-technical editors start writing: one-click starter templates, a
// short tip, and a prominent link to the live preview. The target field path
// is passed per-collection via `clientProps` so one component serves both.
type Props = { target?: string };

type RichTextLeaf = { text?: string };
type RichTextNode = { children?: RichTextLeaf[] };
type RichTextValue = { root?: { children?: RichTextNode[] } };
type LexNode = Record<string, unknown>;

// --- Serialized Lexical node builders (Payload 3.x shape) ---------------------
const text = (value: string): LexNode => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: value,
  version: 1,
});

const heading = (value: string): LexNode => ({
  type: "heading",
  tag: "h2",
  children: [text(value)],
  direction: null,
  format: "",
  indent: 0,
  version: 1,
});

const paragraph = (value: string): LexNode => ({
  type: "paragraph",
  children: [text(value)],
  direction: null,
  format: "",
  indent: 0,
  textFormat: 0,
  textStyle: "",
  version: 1,
});

const richText = (children: LexNode[]): LexNode => ({
  root: {
    type: "root",
    children,
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
});

type Template = { id: string; label: string; desc: string; build: () => LexNode };

const TEMPLATES: Template[] = [
  {
    id: "recap",
    label: "活動回顧",
    desc: "相片與經過",
    build: () =>
      richText([
        heading("活動概況"),
        paragraph(
          "（簡述活動的日期、地點與目的。例如：本會已於六月十日假漢豐湖畔舉行週年聚餐，逾百位會員出席。）",
        ),
        heading("活動花絮"),
        paragraph("（加入活動相片，並描述當日情況與會員反應。可用工具列的「插入圖片」按鈕。）"),
        heading("鳴謝"),
        paragraph("（感謝出席的會員、嘉賓及贊助單位。）"),
      ]),
  },
  {
    id: "circular",
    label: "通告",
    desc: "事項與日期",
    build: () =>
      richText([
        heading("通告"),
        paragraph("（說明本次通告的主題，例如會費續繳、會址變更或會議安排。）"),
        paragraph("生效日期：（填寫日期）"),
        paragraph("詳情：（補充須知事項與注意事項。）"),
      ]),
  },
  {
    id: "notice",
    label: "公告",
    desc: "公布與查詢",
    build: () =>
      richText([
        heading("公告"),
        paragraph("（公布內容，例如新一屆理事會選舉結果或重要事項。）"),
        paragraph("如有查詢，歡迎聯絡本會：電話 ____ ／ 電郵 ____。"),
      ]),
  },
];

function isEmptyRichText(value?: RichTextValue): boolean {
  return !value?.root?.children?.some((node) =>
    node.children?.some((leaf) => leaf.text?.trim()),
  );
}

export default function ContentStarter({ target = "content" }: Props) {
  const { value } = useField<RichTextValue>({ path: target });
  const { dispatchFields } = useForm();

  // Only offer the starter helpers while the body is empty; once the editor has
  // content, render nothing and get out of the way.
  if (!isEmptyRichText(value)) return null;

  const applyTemplate = (build: () => LexNode) => {
    const next = build();
    // The Lexical field only re-mounts (and shows new content) when its
    // `initialValue` reference changes — updating `value` alone would save the
    // data but leave the editor visually empty. So set BOTH.
    dispatchFields({ type: "UPDATE", path: target, value: next, initialValue: next });
  };

  return (
    <div className="kz-starter">
      <p className="kz-starter__title">選擇範本，快速起稿</p>
      <div className="kz-starter__chips">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="kz-starter__chip"
            onClick={() => applyTemplate(t.build)}
          >
            {t.label}
            <span className="kz-starter__chip-desc">{t.desc}</span>
          </button>
        ))}
      </div>
      <p className="kz-starter__tip">
        <span className="kz-starter__tip-tag">提示</span>
        先寫一句重點摘要，再分段加入相片，最後附上聯絡或報名方式。文章會自動套用網站版面。
      </p>
    </div>
  );
}
