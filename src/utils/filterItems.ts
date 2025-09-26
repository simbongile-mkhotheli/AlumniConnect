/**
 * Generic filtering utility functions
 * Provides flexible filtering capabilities for arrays of objects
 */

/**
 * Filter items based on multiple criteria
 * @param items - Array of items to filter
 * @param filters - Object containing filter criteria
 * @param searchFields - Array of fields to search in when using search filter
 * @returns Filtered array of items
 */
export interface FilterOptions {
  exactKeys?: string[]; // keys requiring exact match (case-insensitive by default)
  caseSensitive?: boolean; // for substring matches
  exactCaseSensitive?: boolean; // for exact key comparison
  debug?: boolean; // enable debug logging
}

export function filterItems<T extends Record<string, any>>(
  items: T[],
  filters: Record<string, string | undefined | null>,
  searchFields: string[] = ['title', 'name'],
  options: FilterOptions = {}
): T[] {
  const exactSet = new Set(options.exactKeys || []);
  const caseSensitive = options.caseSensitive === true;
  const exactCaseSensitive = options.exactCaseSensitive === true;

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[filterItems] Starting filter with:', {
      itemCount: items.length,
      filters,
      searchFields,
      options,
      exactKeys: Array.from(exactSet)
    });
  }

  const result = items.filter(item => {
    const passes = Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;

      // search logic
      if (key === 'search') {
        return searchFields.some(field => {
          const fieldValue = item[field];
            if (typeof fieldValue === 'string') {
              if (caseSensitive) return fieldValue.includes(value);
              return fieldValue.toLowerCase().includes(value.toLowerCase());
            }
            return false;
        });
      }

      const itemValue = item[key];

      // array values (tags, etc.) always substring match
      if (Array.isArray(itemValue)) {
        return itemValue.some(val => {
          if (typeof val !== 'string' || typeof value !== 'string') return false;
          return caseSensitive
            ? val.includes(value)
            : val.toLowerCase().includes(value.toLowerCase());
        });
      }

      if (typeof itemValue === 'string' && typeof value === 'string') {
        if (exactSet.has(key)) {
          return exactCaseSensitive
            ? itemValue === value
            : itemValue.toLowerCase() === value.toLowerCase();
        }
        return caseSensitive
          ? itemValue.includes(value)
          : itemValue.toLowerCase().includes(value.toLowerCase());
      }

      // fallback strict equality
      return itemValue === value;
    });

    if (options?.debug && passes) {
      console.debug('[filterItems] Item passes all filters:', {
        item: item.title || item.name || item.id,
        sampleFields: Object.fromEntries(
          Object.keys(filters).map(key => [key, item[key]])
        )
      });
    }

    return passes;
  });

  if (options?.debug) {
    console.debug('[filterItems] Filter complete:', {
      originalCount: items.length,
      filteredCount: result.length,
      sampleResults: result.slice(0, 3).map(item => ({
        title: item.title || item.name || item.id,
        relevantFields: Object.fromEntries(
          Object.keys(filters).map(key => [key, item[key]])
        )
      }))
    });
  }

  return result;
}

/**
 * Sort items by a specific field
 * @param items - Array of items to sort
 * @param sortField - Field to sort by
 * @param sortDirection - Direction to sort ('asc' or 'desc')
 * @returns Sorted array of items
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortField: keyof T,
  sortDirection: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Handle number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Handle date comparison - check if values are Date objects
    if (
      aValue &&
      bValue &&
      typeof aValue === 'object' &&
      typeof bValue === 'object'
    ) {
      // Check if they have getTime method (Date objects)
      if (
        typeof (aValue as any).getTime === 'function' &&
        typeof (bValue as any).getTime === 'function'
      ) {
        const comparison =
          (aValue as any).getTime() - (bValue as any).getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    }

    // Handle date string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        const comparison = aDate.getTime() - bDate.getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    }

    // Fallback to string comparison
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

/**
 * Paginate items
 * @param items - Array of items to paginate
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns Object containing paginated items and pagination info
 */
export function paginateItems<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / limit);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Search items across multiple fields
 * @param items - Array of items to search
 * @param searchTerm - Term to search for
 * @param searchFields - Fields to search in
 * @returns Filtered array of items matching the search term
 */
export function searchItems<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: string[] = ['title', 'name', 'description']
): T[] {
  if (!searchTerm.trim()) {
    return items;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return items.filter(item => {
    return searchFields.some(field => {
      const fieldValue = item[field];

      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(lowerSearchTerm);
      }

      if (Array.isArray(fieldValue)) {
        return fieldValue.some(
          val =>
            typeof val === 'string' &&
            val.toLowerCase().includes(lowerSearchTerm)
        );
      }

      return false;
    });
  });
}
