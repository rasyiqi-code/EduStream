'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from '@/lib/utils';

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function EnhancedSearch({ 
  placeholder = 'Cari video atau kursus...', 
  className = '',
  autoFocus = false 
}: EnhancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim()) {
        router.push(`/dashboard?search=${encodeURIComponent(value)}`);
      } else {
        router.push('/dashboard');
      }
    }, 500),
    [router]
  );

  // Update search value and trigger debounced search
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClear = () => {
    setSearchValue('');
    router.push('/dashboard');
  };

  // Update state when URL changes
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== searchValue) {
      setSearchValue(query ?? '');
    }
  }, [searchParams]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        autoFocus={autoFocus}
        className="pl-10 pr-10 rounded-full border-muted-foreground/20 focus-visible:ring-primary"
      />
      {searchValue && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}

