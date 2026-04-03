"use client";

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Obrigado por se cadastrar!
              </CardTitle>
              <CardDescription>Confirme seu e-mail</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Você se cadastrou com sucesso. Por favor, verifique seu e-mail para confirmar sua conta antes de fazer login.
              </p>
              <Button variant="default" size="sm" onClick={() => router.push('/auth/login')}>
                Entrar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
