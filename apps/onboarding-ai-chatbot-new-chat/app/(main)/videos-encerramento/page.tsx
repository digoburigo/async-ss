"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PlayCircle, ChevronRight, ChevronDown, Video, Clock, CheckCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
]

function getYouTubeEmbedUrl(url: string) {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

export default function VideosEncerramentoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [selectedStep, setSelectedStep] = useState<any>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        // Auto-expand first sector
        if (offboardingSectors.length > 0) {
          setExpandedSectors({ [offboardingSectors[0].id]: true })
          if (offboardingSectors[0].sections.length > 0) {
            setExpandedSections({ [offboardingSectors[0].sections[0].id]: true })
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const toggleSector = (sectorId: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorId]: !prev[sectorId],
    }))
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const markAsComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Vídeos de Encerramento</h1>
          <p className="text-muted-foreground mt-2">
            Assista aos vídeos sobre os procedimentos de desligamento da empresa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with sectors and sections */}
          <div className="lg:col-span-1 space-y-4">
            {offboardingSectors.map((sector) => (
              <Card key={sector.id}>
                <Collapsible open={expandedSectors[sector.id]} onOpenChange={() => toggleSector(sector.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <PlayCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{sector.name}</CardTitle>
                            <CardDescription className="text-xs">{sector.description}</CardDescription>
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
                    <CardContent className="pt-0 space-y-2">
                      {sector.sections.map((section) => (
                        <Collapsible
                          key={section.id}
                          open={expandedSections[section.id]}
                          onOpenChange={() => toggleSection(section.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-md",
                                "text-sm hover:bg-accent transition-colors text-left",
                              )}
                            >
                              <span className="font-medium">{section.name}</span>
                              {expandedSections[section.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-3 space-y-1 mt-1">
                            {section.steps.map((step) => (
                              <button
                                key={step.id}
                                onClick={() => setSelectedStep(step)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                                  "hover:bg-accent transition-colors text-left",
                                  selectedStep?.id === step.id &&
                                    "bg-primary text-primary-foreground hover:bg-primary/90",
                                )}
                              >
                                {completedSteps.has(step.id) ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Video className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="truncate flex-1">{step.title}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
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
                      <CardDescription>{selectedStep.description}</CardDescription>
                    </div>
                    <Button
                      variant={completedSteps.has(selectedStep.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => markAsComplete(selectedStep.id)}
                    >
                      {completedSteps.has(selectedStep.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluído
                        </>
                      ) : (
                        "Marcar como Concluído"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    {getYouTubeEmbedUrl(selectedStep.video_url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(selectedStep.video_url)!}
                        title={selectedStep.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Vídeo não disponível</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um vídeo</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Escolha um vídeo na lista ao lado para começar a assistir os procedimentos de encerramento
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
