import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

import FormCardSkeleton from "~/components/form-card-skeleton";
import ProductViewPage from "~/features/products/components/product-view-page";

export const Route = createFileRoute("/_authenticated/products/$productId")({
  component: RouteComponent,
});

export default function RouteComponent() {
  const params = Route.useParams();

  return (
    <div className="flex-1 space-y-4">
      <Suspense fallback={<FormCardSkeleton />}>
        <ProductViewPage productId={params.productId} />
      </Suspense>
    </div>
  );
}
