"use client";

import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  PlayCircle,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Placeholder data for offboarding videos - same structure as tutoriais
const offboardingSectors = [
  {
    id: "1",
    name: "Procedimentos Gerais",
    description: "Vídeos sobre os procedimentos gerais de desligamento",
    sections: [
      {
        id: "1-1",
        name: "Documentação",
        steps: [
          {
            id: "1-1-1",
            title: "Entrega de Documentos",
            description: "Como entregar todos os documentos necessários",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration: "5:30",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Transferência de Conhecimento",
    description: "Vídeos sobre como transferir seu conhecimento para a equipe",
    sections: [
      {
        id: "2-1",
        name: "Handover",
        steps: [
          {
            id: "2-1-1",
            title: "Documentando Processos",
            description: "Como documentar seus processos para sucessores",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration: "8:45",
          },
        ],
      },
    ],
  },
];

function getYouTubeEmbedUrl(url: string) {
  const videoId = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
  )?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default function VideosEncerramentoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [expandedSectors, setExpandedSectors] = useState<
    Record<string, boolean>
  >({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        setUser(authUser);

        // Auto-expand first sector
        if (offboardingSectors.length > 0) {
          setExpandedSectors({ [offboardingSectors[0].id]: true });
          if (offboardingSectors[0].sections.length > 0) {
            setExpandedSections({
              [offboardingSectors[0].sections[0].id]: true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const toggleSector = (sectorId: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorId]: !prev[sectorId],
    }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const markAsComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="mb-8 h-5 w-96" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-foreground">
            Vídeos de Encerramento
          </h1>
          <p className="mt-2 text-muted-foreground">
            Assista aos vídeos sobre os procedimentos de desligamento da empresa
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar with sectors and sections */}
          <div className="space-y-4 lg:col-span-1">
            {offboardingSectors.map((sector) => (
              <Card key={sector.id}>
                <Collapsible
                  onOpenChange={() => toggleSector(sector.id)}
                  open={expandedSectors[sector.id]}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer rounded-t-lg transition-colors hover:bg-accent/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <PlayCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {sector.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {sector.description}
                            </CardDescription>
                          </div>
                        </div>
                        {expandedSectors[sector.id] ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-2 pt-0">
                      {sector.sections.map((section) => (
                        <Collapsible
                          key={section.id}
                          onOpenChange={() => toggleSection(section.id)}
                          open={expandedSections[section.id]}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={cn(
                                "flex w-full items-center justify-between rounded-md px-3 py-2",
                                "text-left text-sm transition-colors hover:bg-accent"
                              )}
                            >
                              <span className="font-medium">
                                {section.name}
                              </span>
                              {expandedSections[section.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-1 space-y-1 pl-3">
                            {section.steps.map((step) => (
                              <button
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                                  "text-left transition-colors hover:bg-accent",
                                  selectedStep?.id === step.id &&
                                    "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                                key={step.id}
                                onClick={() => setSelectedStep(step)}
                              >
                                {completedSteps.has(step.id) ? (
                                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                                ) : (
                                  <Video className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="flex-1 truncate">
                                  {step.title}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                  <Clock className="h-3 w-3" />
                                  {step.duration}
                                </span>
                              </button>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          {/* Video player area */}
          <div className="lg:col-span-2">
            {selectedStep ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedStep.title}</CardTitle>
                      <CardDescription>
                        {selectedStep.description}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => markAsComplete(selectedStep.id)}
                      size="sm"
                      variant={
                        completedSteps.has(selectedStep.id)
                          ? "default"
                          : "outline"
                      }
                    >
                      {completedSteps.has(selectedStep.id) ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Concluído
                        </>
                      ) : (
                        "Marcar como Concluído"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                    {getYouTubeEmbedUrl(selectedStep.video_url) ? (
                      <iframe
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                        src={getYouTubeEmbedUrl(selectedStep.video_url)!}
                        title={selectedStep.title}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="text-muted-foreground">
                          Vídeo não disponível
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <PlayCircle className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 font-medium text-lg">
                    Selecione um vídeo
                  </h3>
                  <p className="max-w-md text-center text-muted-foreground">
                    Escolha um vídeo na lista ao lado para começar a assistir os
                    procedimentos de encerramento
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
