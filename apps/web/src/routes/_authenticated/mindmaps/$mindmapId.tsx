import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { MindmapEditor } from "~/features/mindmaps/components/mindmap-editor";
import { MindmapsProvider } from "~/features/mindmaps/components/mindmaps-provider";

export const Route = createFileRoute("/_authenticated/mindmaps/$mindmapId")({
  component: RouteComponent,
});

export default function RouteComponent() {
  const params = Route.useParams();

  return (
    <MindmapsProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              Carregando mapa mental...
            </div>
          }
        >
          <MindmapEditor mindmapId={params.mindmapId} />
        </Suspense>
      </div>
    </MindmapsProvider>
  );
}
