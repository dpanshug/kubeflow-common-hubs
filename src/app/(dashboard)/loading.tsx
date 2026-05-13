export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-bg-tertiary rounded-lg" />
        <div className="h-4 w-72 bg-bg-tertiary rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-bg-tertiary rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
