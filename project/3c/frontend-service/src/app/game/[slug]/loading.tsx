import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

function HeroSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-container-low overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-8 lg:p-10">
        <Skeleton className="w-36 md:w-44 lg:w-52 aspect-[3/4] rounded-2xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-11 w-3/4 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Skeleton className="h-14 w-28 rounded-2xl" />
            <Skeleton className="h-12 w-40 rounded-2xl" />
            <Skeleton className="h-12 w-44 rounded-2xl" />
            <Skeleton className="h-12 w-36 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceTableSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
        <Loader2 className="h-4 w-4 animate-spin text-primary-container" aria-hidden="true" />
        <span>Loading store prices...</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-4 w-16 rounded-lg ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="mb-5">
        <Skeleton className="h-4 w-56 rounded-lg" />
      </div>

      <HeroSkeleton />
      <PriceTableSkeleton />
    </div>
  );
}
