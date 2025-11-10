/**
 * @file advanced-filters.tsx
 * @description Advanced search filters component for videos and courses
 * 
 * Features:
 * - Filter by category (subject)
 * - Filter by level (beginner, intermediate, advanced)
 * - Filter by duration
 * - Filter by instructor
 * - Sort options
 * - Active filters display
 * - Clear all filters
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface FilterOptions {
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | '';
  minDuration?: number; // in minutes
  maxDuration?: number; // in minutes
  instructor?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'duration-asc' | 'duration-desc';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories?: string[];
  availableInstructors?: string[];
  className?: string;
}

const CATEGORIES = [
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Agama Islam',
  'Seni Budaya',
  'Olahraga',
  'Teknologi Informasi',
  'Lainnya'
];

const LEVELS = [
  { value: 'beginner', label: 'Pemula' },
  { value: 'intermediate', label: 'Menengah' },
  { value: 'advanced', label: 'Lanjutan' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'popular', label: 'Paling Populer' },
  { value: 'duration-asc', label: 'Durasi (Pendek)' },
  { value: 'duration-desc', label: 'Durasi (Panjang)' }
];

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableCategories = CATEGORIES,
  availableInstructors = [],
  className
}: AdvancedFiltersProps) {
  const [durationRange, setDurationRange] = React.useState<[number, number]>([
    filters.minDuration || 0,
    filters.maxDuration || 120
  ]);

  const hasActiveFilters = React.useMemo(() => {
    return Boolean(
      filters.category ||
      filters.level ||
      filters.minDuration ||
      filters.maxDuration ||
      filters.instructor
    );
  }, [filters]);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.level) count++;
    if (filters.minDuration || filters.maxDuration) count++;
    if (filters.instructor) count++;
    return count;
  }, [filters]);

  const handleClearFilters = () => {
    onFiltersChange({
      sortBy: filters.sortBy || 'newest'
    });
    setDurationRange([0, 120]);
  };

  const handleDurationChange = (value: [number, number]) => {
    setDurationRange(value);
    onFiltersChange({
      ...filters,
      minDuration: value[0],
      maxDuration: value[1]
    });
  };

  const FilterContent = () => (
    <div className="space-y-6 py-4">
      {/* Category Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Kategori</Label>
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {availableCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Tingkat Kesulitan</Label>
        <RadioGroup
          value={filters.level || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              level: value === 'all' ? undefined : (value as FilterOptions['level'])
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="level-all" />
            <Label htmlFor="level-all" className="font-normal cursor-pointer">
              Semua Tingkat
            </Label>
          </div>
          {LEVELS.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <RadioGroupItem value={level.value} id={`level-${level.value}`} />
              <Label
                htmlFor={`level-${level.value}`}
                className="font-normal cursor-pointer"
              >
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Duration Filter */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">
          Durasi: {durationRange[0]}-{durationRange[1]} menit
        </Label>
        <Slider
          value={durationRange}
          onValueChange={handleDurationChange}
          min={0}
          max={120}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 min</span>
          <span>120+ min</span>
        </div>
      </div>

      {/* Instructor Filter */}
      {availableInstructors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Instruktur</Label>
          <Select
            value={filters.instructor || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, instructor: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Instruktur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Instruktur</SelectItem>
              {availableInstructors.map((instructor) => (
                <SelectItem key={instructor} value={instructor}>
                  {instructor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort By */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Urutkan</Label>
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              sortBy: value as FilterOptions['sortBy']
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Urutan" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* Mobile: Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  variant="default"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search with advanced filters
              </SheetDescription>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-20">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <Badge variant="default">{activeFilterCount}</Badge>
              )}
            </div>
            <FilterContent />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({ ...filters, category: undefined })
                }
              />
            </Badge>
          )}
          {filters.level && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {LEVELS.find((l) => l.value === filters.level)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, level: undefined })}
              />
            </Badge>
          )}
          {(filters.minDuration || filters.maxDuration) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.minDuration || 0}-{filters.maxDuration || 120} min
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    minDuration: undefined,
                    maxDuration: undefined
                  })
                }
              />
            </Badge>
          )}
          {filters.instructor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.instructor}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({ ...filters, instructor: undefined })
                }
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

