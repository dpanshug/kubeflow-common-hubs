export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-10 animate-pulse">
        <div className="size-24 rounded-full bg-bg-tertiary" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 bg-bg-tertiary rounded-lg" />
          <div className="h-4 w-32 bg-bg-tertiary rounded" />
          <div className="h-3 w-64 bg-bg-tertiary rounded" />
        </div>
      </div>

      <div className="border-b border-border mb-6">
        <div className="flex gap-6 -mb-px">
          <div className="h-4 w-16 bg-bg-tertiary rounded mb-3" />
          <div className="h-4 w-24 bg-bg-tertiary rounded mb-3" />
          <div className="h-4 w-16 bg-bg-tertiary rounded mb-3" />
        </div>
      </div>

      <div className="animate-pulse space-y-4">
        <div className="h-5 w-24 bg-bg-tertiary rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-bg-tertiary rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
