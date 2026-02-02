'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from 'lucide-react';

export default function GlobalSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // Only show search bar on root or /monitoring paths
  if (pathname !== '/' && !pathname.startsWith('/monitoring')) {
    return null;
  }

  return (
    <div className="relative flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] h-9"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('q')?.toString()}
      />
    </div>
  );
}
