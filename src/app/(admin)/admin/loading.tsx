export default function AdminDashboardLoading() {
  return (
    <div className="max-w-6xl space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-32 bg-bg-tertiary rounded-lg" />
        <div className="h-4 w-56 bg-bg-tertiary rounded mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg-secondary p-5"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-bg-tertiary rounded" />
                <div className="h-7 w-12 bg-bg-tertiary rounded" />
              </div>
              <div className="size-10 bg-bg-tertiary rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="h-6 w-36 bg-bg-tertiary rounded mb-4" />
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="h-10 bg-bg-secondary/50 border-b border-border" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 border-b border-border last:border-0 px-4 flex items-center"
            >
              <div className="h-4 w-full bg-bg-tertiary rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
