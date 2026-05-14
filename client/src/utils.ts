export function money(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export function compact(value: number): string {
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function pct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const formatCurrency = money;
export const formatPercent = pct;
export const formatCompactNumber = compact;

export const chartColors = ["#d1844b", "#4ade80", "#38bdf8", "#f6c85f", "#fb7185", "#a78bfa"];

export function riskClass(risk: string): string {
  if (risk === "High") return "border-danger/40 bg-danger/10 text-rose-200";
  if (risk === "Medium") return "border-amber/40 bg-amber/10 text-amber";
  return "border-mint/40 bg-mint/10 text-mint";
}

export function riskDotClass(risk: string): string {
  if (risk === "High") return "bg-danger";
  if (risk === "Medium") return "bg-amber";
  return "bg-mint";
}
