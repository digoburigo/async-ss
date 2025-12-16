import { schema } from "@acme/zen-v3/zenstack/schema";
import { useNavigate } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";
import { ClientForm } from "~/components/clients/client-form";

type TClientViewPageProps = {
  clientId: string;
};

export default function ClientViewPage({ clientId }: TClientViewPageProps) {
  const navigate = useNavigate();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);

  const { data: clientData, isFetching } = client.client.useFindUnique(
    {
      where: { id: clientId },
    },
    {
      enabled: !!activeOrganization?.id && !!clientId,
    }
  );

  const { mutate: updateClient, isPending } = client.client.useUpdate({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso");
      navigate({ to: "/clients" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (data: {
    name: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
  }) => {
    if (!clientData) return;

    updateClient({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
      },
      where: { id: clientData.id },
    });
  };

  if (isFetching) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Carregando cliente...</p>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="font-bold text-2xl">Cliente não encontrado</h2>
          <p className="mt-2 text-muted-foreground">
            O cliente que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Cliente</h1>
        <p className="text-muted-foreground">
          Atualize os dados do cliente abaixo.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <ClientForm
          defaultValues={{
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            status: clientData.status,
          }}
          isSubmitting={isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
