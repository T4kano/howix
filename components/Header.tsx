import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, User, LogOut, LayoutDashboard } from 'lucide-react';

export function Header() {
    const { user, profile, signOut, loading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const initials = profile?.name
        ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10  items-center justify-center rounded-lg bg-blue-900">
                        <Image
                            src="/univali.svg"
                            alt="Achados e Perdidos"
                            width={30}
                            height={30}
                        />
                    </div>

                    <span className="text-lg font-bold text-foreground">Achados & Perdidos</span>
                </Link>

                <nav className="flex items-center gap-3">
                    {loading ? (
                        <div>
                            <p>Carregando...</p>
                            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
                        </div>
                    ) : user ? (
                        <>
                            <Button variant="default" size="sm" onClick={() => router.push('/dashboard/items/new')} className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Cadastrar Item</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={profile?.avatar_url || undefined} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        Meu Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>
                                Entrar
                            </Button>
                            <Button variant="default" size="sm" onClick={() => router.push('/auth/sign-up')}>
                                Cadastrar
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
