import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";
import { authClient } from "~/clients/auth-client";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { ProductsMutateDrawer } from "./products-mutate-drawer";
import { useProducts } from "./products-provider";

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts();
  const client = useClientQueries(schema);
  const { data: session } = authClient.useSession();

  const { mutateAsync: deleteProduct } = client.product.useUpdate({
    onSuccess: () => {
      toast.success("Produto excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (!(currentRow && session?.user?.id)) return;

    await deleteProduct({
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
      <ProductsMutateDrawer
        key="product-create"
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
        open={open === "create"}
      />

      {currentRow && (
        <>
          <ProductsMutateDrawer
            currentRow={currentRow}
            key={`product-update-${currentRow.id}`}
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
                Você está prestes a excluir o produto{" "}
                <strong>{currentRow.name}</strong> (código:{" "}
                <strong>{currentRow.code}</strong>). <br />
                Esta ação não pode ser desfeita.
              </>
            }
            destructive
            handleConfirm={handleDelete}
            key="product-delete"
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            open={open === "delete"}
            title={`Excluir produto: ${currentRow.name}?`}
          />
        </>
      )}
    </>
  );
}
