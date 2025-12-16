import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verifique seu email</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para seu email. Clique no link
              para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground text-sm">
              Não recebeu o email? Verifique sua caixa de spam ou tente
              novamente.
            </p>
            <Button asChild className="w-full bg-transparent" variant="outline">
              <Link href="/auth/login">Voltar para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
