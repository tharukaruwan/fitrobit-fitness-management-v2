import { useState, useMemo } from "react";

interface UseTableDataOptions<T> {
  data: T[];
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
}

export function useTableData<T>({
  data,
  itemsPerPage = 8,
  searchFields = [],
}: UseTableDataOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = (item as any)[key];
          if (Array.isArray(itemValue)) {
            return itemValue.some((v) => String(v).toLowerCase() === value.toLowerCase());
          }
          return String(itemValue).toLowerCase() === value.toLowerCase();
        });
      }
    });

    return result;
  }, [data, searchQuery, filters, searchFields]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchQuery("");
    setCurrentPage(1);
  };

  return {
    // Data
    paginatedData,
    filteredData,
    totalItems: filteredData.length,

    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,

    // Search
    searchQuery,
    handleSearch,

    // Filters
    filters,
    handleFilter,
    resetFilters,

    // Pagination props for table
    paginationProps: {
      currentPage,
      totalPages,
      totalItems: filteredData.length,
      itemsPerPage,
      onPageChange: handlePageChange,
    },
  };
}
