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

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Skeleton;