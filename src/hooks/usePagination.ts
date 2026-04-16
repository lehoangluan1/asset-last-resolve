import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    setPage,
    setPageSize: (size: number) => { setPageSize(size); setPage(1); },
    canPrev: safePage > 1,
    canNext: safePage < totalPages,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(p - 1, 1)),
    firstPage: () => setPage(1),
    lastPage: () => setPage(totalPages),
  };
}
