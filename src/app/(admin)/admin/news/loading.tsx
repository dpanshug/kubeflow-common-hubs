export default function NewsLoading() {
  return (
    <div className="max-w-6xl space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-20 bg-bg-tertiary rounded-lg" />
          <div className="h-4 w-48 bg-bg-tertiary rounded mt-2" />
        </div>
        <div className="h-9 w-28 bg-bg-tertiary rounded-lg" />
      </div>

      <div className="h-10 w-full bg-bg-tertiary rounded-lg" />

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="h-10 bg-bg-secondary/50 border-b border-border" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 border-b border-border last:border-0 px-4 flex items-center"
          >
            <div className="h-4 w-full bg-bg-tertiary rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
