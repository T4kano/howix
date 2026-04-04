'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, CheckCircle, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserItems, softDeleteItem, claimItem } from '@/services/items';
import { toast } from 'sonner';

export default function Dashboard() {
    const { profile } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;
        fetchUserItems(profile.id).then(data => {
            setItems(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [profile]);

    const handleClaim = async (id: number) => {
        try {
            await claimItem(id);
            setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'claimed' } : i));
            toast.success('Item reivindicado!');
        } catch { toast.error('Erro'); }
    };

    const handleDelete = async (id: number) => {
        try {
            await softDeleteItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success('Item removido');
        } catch { toast.error('Erro'); }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Meus Itens</h1>
                        <p className="text-muted-foreground mt-1">Gerencie seus itens publicados</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/items/new')} className="gap-2">
                        <Plus className="h-4 w-4" /> Novo Item
                    </Button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">Você ainda não publicou nenhum item.</p>
                        <Button onClick={() => router.push('/dashboard/items/new')} className="mt-4 gap-2">
                            <Plus className="h-4 w-4" /> Publicar Primeiro Item
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => (
                            <Card key={item.id} className="border border-border shadow-sm">
                                <CardContent className="flex items-center justify-between p-4 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                                            <Badge variant="outline" className={item.type === 'lost' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}>
                                                {item.type === 'lost' ? 'Perdido' : 'Achado'}
                                            </Badge>
                                            {item.status === 'claimed' && (
                                                <Badge variant="outline" className="bg-primary/10 text-primary">Reivindicado</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/item/${item.id}`}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/items/${item.id}/edit`)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {item.status === 'open' && (
                                            <Button variant="ghost" size="icon" onClick={() => handleClaim(item.id)}>
                                                <CheckCircle className="h-4 w-4 text-primary" />
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                                                    <AlertDialogDescription>O item será removido do quadro público.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>Excluir</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
