"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic,
  MicOff,
  Save,
  Loader2,
  Plus,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

interface Meeting {
  id: string
  title: string
  description: string | null
  meeting_date: string
  duration_minutes: number
  location: string | null
  participants: string[] | null
  notes: string | null
  transcript: string | null
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const [manualTranscript, setManualTranscript] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fullTranscriptRef = useRef<string>("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Digite as notas da reunião aqui...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  })

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setIsSupported(false)
    }
  }, [])

  useEffect(() => {
    loadMeeting()
  }, [meetingId])

  useEffect(() => {
    if (meeting?.notes && editor) {
      editor.commands.setContent(meeting.notes)
    }
  }, [meeting?.notes, editor])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const loadMeeting = async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`)
      if (!response.ok) throw new Error("Failed to fetch meeting")
      const data = await response.json()
      setMeeting(data)
    } catch (error) {
      console.error("[v0] Error loading meeting:", error)
      toast.error("Erro ao carregar reunião")
      router.push("/reunioes")
    } finally {
      setIsLoading(false)
    }
  }

  const saveMeeting = async (updates: Partial<Meeting>) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to save meeting")
      const data = await response.json()
      setMeeting(data)
      toast.success("Reunião salva!")
    } catch (error) {
      console.error("[v0] Error saving meeting:", error)
      toast.error("Erro ao salvar reunião")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = () => {
    if (!editor) return
    saveMeeting({ notes: editor.getHTML() })
  }

  const handleStatusChange = (status: string) => {
    saveMeeting({ status: status as Meeting["status"] })
  }

  const startRecording = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.")
      setShowManualInput(true)
      return
    }

    setHasNetworkError(false)

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "pt-BR"

    fullTranscriptRef.current = ""
    setInterimTranscript("")

    recognition.onstart = () => {
      setIsRecording(true)
      toast.success("Gravação iniciada! Fale ao microfone.")
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript + " "
        } else {
          interim += transcript
        }
      }

      if (final) {
        fullTranscriptRef.current += final
        if (editor) {
          const timestamp = format(new Date(), "HH:mm:ss")
          const currentContent = editor.getHTML()
          const newParagraph = `<p><strong>[${timestamp}]</strong> ${final.trim()}</p>`

          if (currentContent === "<p></p>" || !currentContent) {
            editor.commands.setContent(newParagraph)
          } else {
            editor.commands.setContent(currentContent + newParagraph)
          }
        }
      }

      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[v0] Speech recognition error:", event.error)
      setIsRecording(false)

      if (event.error === "not-allowed") {
        toast.error("Permissão de microfone negada. Habilite nas configurações do navegador.")
      } else if (event.error === "no-speech") {
        toast.info("Nenhuma fala detectada. Tente novamente.")
      } else if (event.error === "network") {
        setHasNetworkError(true)
        setShowManualInput(true)
        toast.error("Erro de rede na transcrição. Use a entrada manual abaixo.", {
          duration: 5000,
        })
      } else if (event.error === "aborted") {
      } else {
        toast.error(`Erro no reconhecimento: ${event.error}`)
        setShowManualInput(true)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      setInterimTranscript("")

      if (fullTranscriptRef.current && editor) {
        handleSaveNotes()
        toast.info("Gravação finalizada e salva!")
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleAddManualTranscript = () => {
    if (!manualTranscript.trim() || !editor) return

    const timestamp = format(new Date(), "HH:mm:ss")
    const currentContent = editor.getHTML()
    const newParagraph = `<p><strong>[${timestamp}]</strong> ${manualTranscript.trim()}</p>`

    if (currentContent === "<p></p>" || !currentContent) {
      editor.commands.setContent(newParagraph)
    } else {
      editor.commands.setContent(currentContent + newParagraph)
    }

    setManualTranscript("")
    toast.success("Texto adicionado às notas!")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <p>Reunião não encontrada</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/reunioes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          {meeting.description && <p className="text-muted-foreground">{meeting.description}</p>}
        </div>
        <Select value={meeting.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Agendada</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Meeting Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {format(new Date(meeting.meeting_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {format(new Date(meeting.meeting_date), "HH:mm")} ({meeting.duration_minutes}min)
            </div>
            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {meeting.location}
              </div>
            )}
            {meeting.participants && meeting.participants.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {meeting.participants.join(", ")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recording Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Transcrição em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isSupported ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              Seu navegador não suporta reconhecimento de voz. Use Google Chrome, Microsoft Edge ou Safari para esta
              funcionalidade.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                    <Mic className="h-4 w-4 mr-2" />
                    Iniciar Gravação
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    Parar Gravação
                  </Button>
                )}

                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
                    Ouvindo...
                  </div>
                )}

                {!isRecording && (
                  <Button variant="outline" size="sm" onClick={() => setShowManualInput(!showManualInput)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Entrada Manual
                  </Button>
                )}
              </div>

              {isRecording && interimTranscript && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground italic">{interimTranscript}</p>
                </div>
              )}

              {hasNetworkError && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Transcrição automática indisponível</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        O reconhecimento de voz requer conexão com servidores externos que podem estar bloqueados neste
                        ambiente. Use a entrada manual abaixo para adicionar texto às notas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showManualInput && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Digite o texto para adicionar às notas:</span>
                  </div>
                  <Textarea
                    placeholder="Digite aqui o que foi dito na reunião..."
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddManualTranscript} disabled={!manualTranscript.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar às Notas
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                A transcrição automática é feita pelo navegador (pt-BR). Se houver problemas de rede, use a entrada
                manual.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes Editor */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notas da Reunião</CardTitle>
            <Button onClick={handleSaveNotes} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editor && (
            <div className="flex flex-wrap gap-1 p-2 border-b mb-2">
              <Button
                type="button"
                variant={editor.isActive("bold") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <strong>B</strong>
              </Button>
              <Button
                type="button"
                variant={editor.isActive("italic") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <em>I</em>
              </Button>
              <Button
                type="button"
                variant={editor.isActive("strike") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <s>S</s>
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                H1
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                H3
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                • Lista
              </Button>
              <Button
                type="button"
                variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                1. Lista
              </Button>
              <Button
                type="button"
                variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                " Citação
              </Button>
            </div>
          )}

          <div className="border rounded-md min-h-[400px]">
            <EditorContent editor={editor} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
