export default function NewBadgeLoading() {
  return (
    <div className="max-w-3xl space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-36 bg-bg-tertiary rounded-lg" />
        <div className="h-4 w-52 bg-bg-tertiary rounded mt-2" />
      </div>

      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-24 bg-bg-tertiary rounded mb-2" />
            <div className="h-10 w-full bg-bg-tertiary rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-28 bg-bg-tertiary rounded-lg mt-6" />
      </div>
    </div>
  );
}
