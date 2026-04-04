import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import type { ItemWithDetails, ItemImage } from '@/types/database';

interface ItemCardProps {
  item: ItemWithDetails;
  images?: ItemImage[];
}

export function ItemCard({ item, images = [] }: ItemCardProps) {
  const [imgIndex, setImgIndex] = useState(0);

  const typeBadge = item.type === 'lost'
    ? { label: 'Perdido', className: 'bg-destructive border-destructive/20' }
    : { label: 'Achado', className: 'bg-accent border-accent/20' };

  const statusBadge = item.status === 'claimed'
    ? { label: 'Reivindicado', className: 'bg-primary border-primary/20' }
    : null;

  return (
    <Link href={`/item/${item.id}`} className="group block">
      <Card className="overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[imgIndex]?.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); setImgIndex(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setImgIndex(i => (i + 1) % images.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-primary-foreground' : 'bg-primary-foreground/40'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground text-sm">Sem imagem</span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
            {statusBadge && <Badge className={statusBadge.className}>{statusBadge.label}</Badge>}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{item.campus_name}</span>
            </div>
            {item.event_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(item.event_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-1">
              <Badge variant="secondary" className="text-xs">{item.category_name}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
