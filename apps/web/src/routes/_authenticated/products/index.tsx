import { Suspense } from "react";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { cn } from "@acme/ui";
import { buttonVariants } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { Heading } from "~/components/heading";
import { DataTableSkeleton } from "~/components/table/data-table-skeleton";
import ProductListingPage from "~/features/products/components/product-listing";

export const Route = createFileRoute("/_authenticated/products/")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Heading
          title="Products"
          description="Manage products (Server side table functionalities.)"
        />
        <Link
          to="/products/new"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <IconPlus className="mr-2 h-4 w-4" /> Add New
        </Link>
      </div>
      <Separator />
      <Suspense
        // key={key}
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        <ProductListingPage />
      </Suspense>
    </div>
  );
}
