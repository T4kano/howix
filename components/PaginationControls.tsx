import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 pt-6">
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-3">
                Página {page} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Próxima
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
