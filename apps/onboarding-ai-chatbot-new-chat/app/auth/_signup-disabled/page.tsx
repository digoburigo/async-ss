"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/onboarding-chat`,
          data: {
            name,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/check-email");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar a conta"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <img
                alt="Farben"
                className="h-12"
                src="/images/design-mode/download.png"
              />
            </div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta na Farben
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    type="text"
                    value={name}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/auth/login"
                >
                  Fazer login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
