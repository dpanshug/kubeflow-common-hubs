export default function UserDetailLoading() {
  return (
    <div className="max-w-3xl space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-40 bg-bg-tertiary rounded-lg" />
        <div className="h-4 w-48 bg-bg-tertiary rounded mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg-secondary p-4"
          >
            <div className="h-3 w-16 bg-bg-tertiary rounded mb-2" />
            <div className="h-5 w-24 bg-bg-tertiary rounded" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="h-9 w-28 bg-bg-tertiary rounded-lg" />
        <div className="h-9 w-28 bg-bg-tertiary rounded-lg" />
      </div>
    </div>
  );
}
