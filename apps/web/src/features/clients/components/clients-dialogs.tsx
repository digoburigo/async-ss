import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { ClientsMutateDrawer } from "./clients-mutate-drawer";
import { useClients } from "./clients-provider";

export function ClientsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClients();
  const client = useClientQueries(schema);
  const { data: session } = authClient.useSession();

  const { mutateAsync: deleteClient } = client.client.useUpdate({
    onSuccess: () => {
      toast.success("Cliente excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (!(currentRow && session?.user?.id)) return;

    await deleteClient({
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
      where: { id: currentRow.id },
    });

    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 500);
  };

  return (
    <>
      <ClientsMutateDrawer
        key="client-create"
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
        open={open === "create"}
      />

      {currentRow && (
        <>
          <ClientsMutateDrawer
            currentRow={currentRow}
            key={`client-update-${currentRow.id}`}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            open={open === "update"}
          />

          <ConfirmDialog
            className="max-w-md"
            confirmText="Excluir"
            desc={
              <>
                Você está prestes a excluir o cliente{" "}
                <strong>{currentRow.name}</strong> (email:{" "}
                <strong>{currentRow.email}</strong>). <br />
                Esta ação não pode ser desfeita.
              </>
            }
            destructive
            handleConfirm={handleDelete}
            key="client-delete"
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            open={open === "delete"}
            title={`Excluir cliente: ${currentRow.name}?`}
          />
        </>
      )}
    </>
  );
}
