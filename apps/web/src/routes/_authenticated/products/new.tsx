import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/products/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Criar Novo Produto
        </h1>
      </div>
    </div>
  );
}
