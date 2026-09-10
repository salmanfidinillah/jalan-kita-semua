"use client";

type LoadingStateProps = { label?: string };

export function LoadingState({ label = "Memuat..." }: LoadingStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 text-muted-ink" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-road-blue" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </main>
  );
}

type ErrorStateProps = { message?: string; onRetry?: () => void };

export function ErrorState({ message = "Terjadi kesalahan. Coba lagi.", onRetry }: ErrorStateProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="max-w-md rounded-2xl border border-danger-red/30 bg-[#fff0ed] p-5 text-danger-red" role="alert">
        {message}
      </p>
      {onRetry && (
        <button className="rounded-full bg-ink px-5 py-3 font-bold text-white" type="button" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </main>
  );
}

type EmptyStateProps = { title: string; description?: string; action?: React.ReactNode };

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-8">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-2 max-w-md leading-7 text-muted-ink">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

