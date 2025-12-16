"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { YouTubePlayer } from "@/components/youtube-player";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  youtube_video_url: string;
  duration_minutes: number;
  order_index: number;
}

interface TutorialSection {
  id: string;
  name: string;
  description: string;
  order_index: number;
  steps: TutorialStep[];
}

interface TutorialSector {
  id: string;
  name: string;
  description: string;
  icon: string;
  order_index: number;
  sections: TutorialSection[];
}

interface StepProgress {
  step_id: string;
  completed: boolean;
}

export default function TutorialsPage() {
  const [sectors, setSectors] = useState<TutorialSector[]>([]);
  const [progress, setProgress] = useState<StepProgress[]>([]);
  const [selectedStep, setSelectedStep] = useState<TutorialStep | null>(null);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(
    new Set()
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectorsRes, progressRes] = await Promise.all([
        fetch("/api/tutorials/sectors"),
        fetch("/api/tutorials/progress"),
      ]);

      const sectorsData = await sectorsRes.json();
      const progressData = await progressRes.json();

      setSectors(sectorsData);
      setProgress(progressData);

      // Expand first sector and section by default
      if (sectorsData.length > 0) {
        setExpandedSectors(new Set([sectorsData[0].id]));
        if (sectorsData[0].sections?.length > 0) {
          setExpandedSections(new Set([sectorsData[0].sections[0].id]));
          if (sectorsData[0].sections[0].steps?.length > 0) {
            setSelectedStep(sectorsData[0].sections[0].steps[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load tutorials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSector = (sectorId: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorId)) {
      newExpanded.delete(sectorId);
    } else {
      newExpanded.add(sectorId);
    }
    setExpandedSectors(newExpanded);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isStepCompleted = (stepId: string) =>
    progress.some((p) => p.step_id === stepId && p.completed);

  const toggleStepCompletion = async (stepId: string) => {
    const currentStatus = isStepCompleted(stepId);

    try {
      await fetch("/api/tutorials/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_id: stepId,
          completed: !currentStatus,
        }),
      });

      setProgress((prev) => {
        const existing = prev.find((p) => p.step_id === stepId);
        if (existing) {
          return prev.map((p) =>
            p.step_id === stepId ? { ...p, completed: !currentStatus } : p
          );
        }
        return [...prev, { step_id: stepId, completed: !currentStatus }];
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : "";
  };

  const calculateProgress = (sector: TutorialSector) => {
    const allSteps = sector.sections.flatMap((s) => s.steps);
    const completedSteps = allSteps.filter((step) => isStepCompleted(step.id));
    return allSteps.length > 0
      ? Math.round((completedSteps.length / allSteps.length) * 100)
      : 0;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Vídeos Tutoriais</h1>
        <p className="text-muted-foreground">
          Aprenda a usar a plataforma com nossos tutoriais em vídeo organizados
          por função
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Sidebar with navigation */}
        <div className="space-y-2">
          {sectors.map((sector) => {
            const sectorProgress = calculateProgress(sector);
            const isExpanded = expandedSectors.has(sector.id);

            return (
              <div
                className="overflow-hidden rounded-lg border"
                key={sector.id}
              >
                <button
                  className="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent"
                  onClick={() => toggleSector(sector.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sector.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{sector.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {sectorProgress}% completo
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/30">
                    {sector.sections.map((section) => {
                      const isSectionExpanded = expandedSections.has(
                        section.id
                      );

                      return (
                        <div key={section.id}>
                          <button
                            className="flex w-full items-center justify-between p-3 pl-6 text-sm transition-colors hover:bg-accent/50"
                            onClick={() => toggleSection(section.id)}
                          >
                            <span className="font-medium">{section.name}</span>
                            {isSectionExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>

                          {isSectionExpanded && (
                            <div className="bg-background">
                              {section.steps.map((step) => {
                                const isCompleted = isStepCompleted(step.id);
                                const isSelected = selectedStep?.id === step.id;

                                return (
                                  <button
                                    className={cn(
                                      "flex w-full items-center gap-3 p-3 pl-12 text-left transition-colors hover:bg-accent",
                                      isSelected &&
                                        "border-primary border-l-4 bg-primary/10"
                                    )}
                                    key={step.id}
                                    onClick={() => setSelectedStep(step)}
                                  >
                                    <Checkbox
                                      checked={isCompleted}
                                      onCheckedChange={() =>
                                        toggleStepCompletion(step.id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate font-medium text-sm">
                                        {step.title}
                                      </div>
                                      <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                                        <Clock className="h-3 w-3" />
                                        <span>{step.duration_minutes} min</span>
                                      </div>
                                    </div>
                                    {isCompleted && (
                                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Video player */}
        <div>
          {selectedStep ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedStep.title}
                    </CardTitle>
                    {selectedStep.description && (
                      <CardDescription className="mt-2">
                        {selectedStep.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={
                      isStepCompleted(selectedStep.id) ? "default" : "outline"
                    }
                  >
                    {isStepCompleted(selectedStep.id)
                      ? "Concluído"
                      : "Pendente"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video overflow-hidden rounded-lg bg-black">
                  <YouTubePlayer
                    videoId={extractVideoId(selectedStep.youtube_video_url)}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{selectedStep.duration_minutes} minutos</span>
                  </div>

                  <Button
                    onClick={() => toggleStepCompletion(selectedStep.id)}
                    variant={
                      isStepCompleted(selectedStep.id) ? "outline" : "default"
                    }
                  >
                    {isStepCompleted(selectedStep.id) ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Marcar como Não Concluído
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <Play className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-xl">
                  Selecione um Tutorial
                </h3>
                <p className="text-muted-foreground">
                  Escolha um vídeo tutorial no menu lateral para começar a
                  aprender
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
