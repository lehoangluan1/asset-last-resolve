import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  canPrev: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  firstPage: () => void;
  lastPage: () => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function PaginationBar({
  page, pageSize, totalPages, totalItems, canPrev, canNext,
  onPageChange, onPageSizeChange, firstPage, lastPage, nextPage, prevPage,
}: PaginationBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{totalItems} total</span>
        <span>·</span>
        <span>Page {page} of {totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map(s => (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={firstPage} disabled={!canPrev}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevPage} disabled={!canPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextPage} disabled={!canNext}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={lastPage} disabled={!canNext}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
