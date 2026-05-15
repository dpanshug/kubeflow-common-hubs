export default function SubmissionsLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-36 bg-bg-tertiary rounded-lg" />
        <div className="h-4 w-48 bg-bg-tertiary rounded mt-2" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-bg-tertiary rounded-lg" />
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg-secondary p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-bg-tertiary rounded" />
                  <div className="h-5 w-16 bg-bg-tertiary rounded" />
                </div>
                <div className="h-5 w-3/4 bg-bg-tertiary rounded" />
                <div className="h-3 w-24 bg-bg-tertiary rounded" />
              </div>
              <div className="h-3 w-12 bg-bg-tertiary rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
