export default function ReviewLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      <div>
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-20 bg-bg-tertiary rounded" />
          <div className="h-5 w-16 bg-bg-tertiary rounded" />
        </div>
        <div className="h-7 w-64 bg-bg-tertiary rounded-lg mb-1" />
        <div className="h-4 w-40 bg-bg-tertiary rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg-secondary p-6"
            >
              <div className="h-4 w-20 bg-bg-tertiary rounded mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-bg-tertiary rounded" />
                <div className="h-4 w-5/6 bg-bg-tertiary rounded" />
                <div className="h-4 w-3/4 bg-bg-tertiary rounded" />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="rounded-xl border border-border bg-bg-secondary p-6 space-y-3">
            <div className="h-4 w-20 bg-bg-tertiary rounded" />
            <div className="h-10 w-full bg-bg-tertiary rounded-lg" />
            <div className="h-20 w-full bg-bg-tertiary rounded-lg" />
            <div className="h-9 w-full bg-bg-tertiary rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
