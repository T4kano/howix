"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, { name, phone });
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Erro ao cadastrar.');
    } else {
      toast.success('Conta criada! Verifique seu email para confirmar.');
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md border border-border shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
            <CardDescription>Cadastre-se para publicar itens achados ou perdidos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Celular / WhatsApp</Label>
                <Input id="phone" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">Entrar</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
