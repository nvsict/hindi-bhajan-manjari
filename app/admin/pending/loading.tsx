export default function PendingSubmissionsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
          <div className="space-y-2.5">
            <div className="h-7 w-56 bg-gray-200 rounded-xl" />
            <div className="h-4 w-72 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="h-10 w-36 bg-orange-50 rounded-xl" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 bg-gray-100 rounded-xl" />
        <div className="h-11 w-40 bg-gray-100 rounded-xl" />
      </div>

      {/* Card Skeletons */}
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-6 w-2/3 bg-gray-200 rounded-lg" />
              <div className="h-4 w-1/3 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-7 w-28 bg-gray-100 rounded-full" />
          </div>
          <div className="h-28 w-full bg-gray-50 rounded-2xl border border-gray-100" />
          <div className="flex gap-3 pt-2">
            <div className="h-12 flex-1 bg-gray-100 rounded-xl" />
            <div className="h-12 flex-1 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
