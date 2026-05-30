const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ backgroundColor: '#e5e7eb' }}
  />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-xl overflow-hidden">
    <Skeleton className="h-40 w-full" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-6 w-20 mt-3" />
    </div>
  </div>
);

export const SkeletonListItem = () => (
  <div className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center gap-5">
    <Skeleton className="w-20 h-14 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="flex items-center gap-2 sm:shrink-0">
      <Skeleton className="h-8 w-16 rounded-lg" />
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonTableRow = () => (
  <tr className="border-b border-gray-200">
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-48" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-5 w-16 rounded-full" />
    </td>
    <td className="py-3 px-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="py-3 px-4 text-center">
      <Skeleton className="h-8 w-20 rounded-lg mx-auto" />
    </td>
  </tr>
);

export const SkeletonPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Skeleton;