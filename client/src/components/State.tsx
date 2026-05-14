export function LoadingState({ label = "Loading cost data..." }: { label?: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-6 text-steel">
      {label}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-panel/60 p-8 text-center text-steel">
      {label}
    </div>
  );
}

export function ErrorState({ error }: { error: string }) {
  return (
    <div className="rounded-md border border-danger/40 bg-danger/10 p-5 text-rose-200">
      {error}
    </div>
  );
}
