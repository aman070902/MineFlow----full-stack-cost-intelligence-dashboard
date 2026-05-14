export function Card({
  title,
  value,
  subtitle,
  tone = "neutral",
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClass =
    tone === "good" ? "text-mint" : tone === "warn" ? "text-amber" : "text-white";

  return (
    <div className="group flex min-h-36 flex-col justify-between rounded-lg border border-line bg-panel/95 p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-copper/45 hover:bg-panel2">
      <p className="text-sm font-medium text-steel">{title}</p>
      <p className={`mt-4 break-words text-2xl font-semibold leading-tight ${toneClass}`}>{value}</p>
      {subtitle ? <p className="mt-3 text-sm leading-5 text-steel">{subtitle}</p> : null}
    </div>
  );
}
