/** Format an ISO date as Traditional Chinese "YYYY 年 M 月 D 日". */
export function formatDateZh(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso ?? "";
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
