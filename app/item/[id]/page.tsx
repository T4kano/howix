'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Tag, Building, Phone, Mail, MessageCircle, ArrowLeft, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { fetchItemById, fetchItemImages, softDeleteItem, claimItem } from '@/services/items';
import { useAuth } from '@/hooks/useAuth';
import type { ItemWithDetails, ItemImage } from '@/types/database';
import { toast } from 'sonner';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [images, setImages] = useState<ItemImage[]>([]);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [itemData, imagesData] = await Promise.all([
          fetchItemById(Number(id)),
          fetchItemImages(Number(id)),
        ]);
        setItem(itemData);
        setImages(imagesData);
      } catch {
        toast.error('Item não encontrado');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isOwner = profile && item && profile.id === item.user_id;

  const handleClaim = async () => {
    if (!item) return;
    try {
      await claimItem(item.id);
      setItem({ ...item, status: 'claimed' });
      toast.success('Item marcado como reivindicado!');
    } catch { toast.error('Erro ao reivindicar item'); }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await softDeleteItem(item.id);
      toast.success('Item removido');
      router.push('/dashboard');
    } catch { toast.error('Erro ao remover item'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const typeBadge = item.type === 'lost'
    ? { label: 'Perdido', className: 'bg-destructive/10 text-destructive' }
    : { label: 'Achado', className: 'bg-accent/10 text-accent' };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              {images.length > 0 ? (
                <>
                  <img src={images[imgIndex]?.image_url} alt={item.title} className="h-full w-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-sm hover:bg-card">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-sm hover:bg-card">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Sem imagem</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setImgIndex(i)}
                    className={`h-16 w-24 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${i === imgIndex ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={typeBadge.className}>{typeBadge.label}</Badge>
                {item.status === 'claimed' && <Badge variant="outline" className="bg-primary/10 text-primary">Reivindicado</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{item.title}</h1>

              {item.item_description && (
                <p className="text-muted-foreground leading-relaxed">{item.item_description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {item.location_description && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{item.location_description}</span>
                  </div>
                )}
                {item.event_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(item.event_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>{item.category_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4 text-primary" />
                  <span>{item.campus_name}</span>
                </div>
              </div>

              {isOwner && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  {item.status === 'open' && (
                    <Button onClick={handleClaim} className="gap-2">
                      <CheckCircle className="h-4 w-4" /> Marcar como Reivindicado
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => router.push(`/dashboard/items/${item.id}/edit`)} className="gap-2">
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                        <AlertDialogDescription>Essa ação não pode ser desfeita. O item será removido do quadro.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Author card */}
          <div className="md:sticky md:top-24 self-start">
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Publicado por</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.author_avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {item.author_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{item.author_name || 'Usuário'}</p>
                    <p className="text-sm text-muted-foreground">{item.author_email}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  {item.author_phone && (
                    <a href={`tel:${item.author_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" /> {item.author_phone}
                    </a>
                  )}
                  {item.author_whatsapp && (
                    <a href={`https://wa.me/${item.author_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Publicado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
