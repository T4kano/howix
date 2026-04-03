import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import type { Campus, Category, ItemFilters } from '@/types/database';

interface ItemFiltersBarProps {
    filters: ItemFilters;
    onFiltersChange: (filters: ItemFilters) => void;
    campuses: Campus[];
    categories: Category[];
    showStatus?: boolean;
}

export function ItemFiltersBar({ filters, onFiltersChange, campuses, categories, showStatus = false }: ItemFiltersBarProps) {
    const update = (partial: Partial<ItemFilters>) => onFiltersChange({ ...filters, ...partial, page: 1 });

    const activeCount = [filters.category_id, filters.campus_id, filters.type, filters.status].filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por título ou descrição..."
                    value={filters.search || ''}
                    onChange={(e) => update({ search: e.target.value })}
                    className="pl-10 bg-card"
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <Select
                    value={filters.category_id?.toString() || 'all'}
                    onValueChange={(v) => update({ category_id: v === 'all' ? undefined : Number(v) })}
                >
                    <SelectTrigger className="w-[180px] bg-card">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas categorias</SelectItem>
                        {categories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.campus_id?.toString() || 'all'}
                    onValueChange={(v) => update({ campus_id: v === 'all' ? undefined : Number(v) })}
                >
                    <SelectTrigger className="w-[180px] bg-card">
                        <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos campus</SelectItem>
                        {campuses.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Badge
                        variant={filters.type === 'lost' ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1.5 transition-colors"
                        onClick={() => update({ type: filters.type === 'lost' ? undefined : 'lost' })}
                    >
                        Perdido
                    </Badge>
                    <Badge
                        variant={filters.type === 'found' ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1.5 transition-colors"
                        onClick={() => update({ type: filters.type === 'found' ? undefined : 'found' })}
                    >
                        Achado
                    </Badge>
                </div>

                {showStatus && (
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => update({ status: v === 'all' ? undefined : v as any })}
                    >
                        <SelectTrigger className="w-[160px] bg-card">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos status</SelectItem>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="claimed">Reivindicado</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {activeCount > 0 && (
                    <Badge
                        variant="secondary"
                        className="cursor-pointer gap-1 px-3 py-1.5"
                        onClick={() => onFiltersChange({ search: filters.search, page: 1 })}
                    >
                        <X className="h-3 w-3" /> Limpar filtros
                    </Badge>
                )}
            </div>
        </div>
    );
}
