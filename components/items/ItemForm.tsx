import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { createItem, updateItem, fetchCampuses, fetchCategories, fetchItemImages, addItemImage, deleteItemImage } from '@/services/items';
import { uploadItemImage, deleteItemImageFile } from '@/services/storage';
import { createClient } from '@/lib/supabase/client';
import type { Campus, Category, ItemImage } from '@/types/database';
import { toast } from 'sonner';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient();

type ItemFormProps = {
  id?: string
}

export default function ItemForm({ id }: ItemFormProps) {
  const isEdit = Boolean(id);
  const router = useRouter();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [campusId, setCampusId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Image state
  const [existingImages, setExistingImages] = useState<ItemImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    Promise.all([fetchCampuses(), fetchCategories()]).then(([c, cat]) => {
      setCampuses(c);
      setCategories(cat);
    });

    if (isEdit && id) {
      supabase.from('items').select('*').eq('id', Number(id)).single().then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setDescription(data.item_description || '');
          setLocation(data.location_description || '');
          setEventDate(data.event_date || '');
          setType(data.type);
          setCampusId(data.campus_id.toString());
          setCategoryId(data.category_id.toString());
        }
      });
      fetchItemImages(Number(id)).then(setExistingImages);
    }
  }, [id, isEdit]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalCount = existingImages.length + newFiles.length + files.length;
    if (totalCount > 5) {
      toast.error('Máximo de 5 imagens por item');
      return;
    }

    setNewFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setNewPreviews(prev => [...prev, ...previews]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (image: ItemImage) => {
    try {
      await deleteItemImage(image.id);
      deleteItemImageFile(image.image_url);
      setExistingImages(prev => prev.filter(img => img.id !== image.id));
      toast.success('Imagem removida');
    } catch {
      toast.error('Erro ao remover imagem');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const payload = {
        title,
        item_description: description || undefined,
        location_description: location || undefined,
        event_date: eventDate || undefined,
        type,
        campus_id: Number(campusId),
        category_id: Number(categoryId),
      };

      let itemId: number;

      if (isEdit && id) {
        await updateItem(Number(id), payload as any);
        itemId = Number(id);
        toast.success('Item atualizado!');
      } else {
        const created = await createItem({ ...payload, user_id: profile.id });
        itemId = created.id;
        toast.success('Item publicado!');
      }

      // Upload new images
      if (newFiles.length > 0) {
        setUploadingImages(true);
        for (const file of newFiles) {
          const imageUrl = await uploadItemImage(file, itemId, profile.auth_user_id);
          await addItemImage(itemId, imageUrl);
        }
        setUploadingImages(false);
      }

      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar item');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 max-w-2xl">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle>{isEdit ? 'Editar Item' : 'Novo Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Carteira preta encontrada no bloco A" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={type} onValueChange={(v: 'lost' | 'found') => setType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">Perdido</SelectItem>
                      <SelectItem value="found">Achado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data do evento</Label>
                  <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campus *</Label>
                  <Select value={campusId} onValueChange={setCampusId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {campuses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local onde foi encontrado/perdido</Label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Biblioteca central, 2º andar" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o item com detalhes..." rows={4} />
              </div>

              {/* Image upload section */}
              <div className="space-y-3">
                <Label>Fotos (máx. 5)</Label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map(img => (
                    <div key={img.id} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border group">
                      <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border group">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {totalImages < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">Adicionar</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading || uploadingImages || !campusId || !categoryId}>
                  {uploadingImages ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enviando fotos...</>
                  ) : loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Publicar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
