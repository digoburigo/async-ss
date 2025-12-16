import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Building2Icon, CheckIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";

export const Route = createFileRoute("/organizations")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.session) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { data: organizations, isPending: isLoadingOrganizations } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleSelectOrganization = async (organizationId: string) => {
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      toast.success("Organização alterada com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao alterar organização"
      );
    }
  };

  if (isLoadingOrganizations) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando organizações...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="font-bold text-3xl tracking-tight">
            Selecione uma organização
          </h1>
          <p className="mt-2 text-muted-foreground">
            Escolha uma organização para continuar para o seu painel
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizations?.map((org) => (
            <Card className="flex flex-col" key={org.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2Icon className="size-6" />
                  </div>
                  {activeOrganization?.id === org.id && (
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckIcon className="size-4" />
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4">{org.name}</CardTitle>
                <CardDescription>
                  {org.slug || "Sem slug disponível"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Add more org details here if needed */}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSelectOrganization(org.id)}
                >
                  Entrar na organização
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <PlusIcon className="size-6" />
              </div>
              <CardTitle className="mt-4">Criar organização</CardTitle>
              <CardDescription>
                Começar uma nova organização do zero
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button className="w-full" variant="outline">
                Criar nova
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
