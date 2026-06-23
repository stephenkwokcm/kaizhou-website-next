/** date-fns pattern for admin-panel timestamps. Natural zh-TW year→month→day
 *  order with 24h time; every token is numeric (年/月/日 are literals) so it
 *  renders identically regardless of the admin's active locale. Shared by the
 *  global `admin.dateFormat` and each date field's `displayFormat` so all
 *  timestamps stay consistent. */
export const ADMIN_DATE_FORMAT = "yyyy年M月d日 HH:mm";

/** Format an ISO date as Traditional Chinese "YYYY 年 M 月 D 日". */
export function formatDateZh(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso ?? "";
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
