import { Search, SlidersHorizontal } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-1">
          Search Results
        </h1>
        <div className="h-px bg-gradient-to-r from-primary-container/30 to-transparent" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Search className="h-4 w-4 text-primary-container animate-pulse" aria-hidden="true" />
          <span>Searching stores and comparing prices...</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
          {['Steam', 'Epic', 'GOG', 'Xbox'].map((store) => (
            <Badge key={store} variant="outline" className="text-xs opacity-70">
              {store}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl bg-surface-container-low"
          >
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-4/5 rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
