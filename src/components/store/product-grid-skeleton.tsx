export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="aspect-4/5 animate-pulse bg-mist" />
          <div className="mt-3 h-4 w-2/3 animate-pulse bg-mist" />
          <div className="mt-2 h-4 w-1/3 animate-pulse bg-mist" />
        </li>
      ))}
    </ul>
  );
}
