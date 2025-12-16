"use client";

import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type EmployeeType = "vendedor" | "gerente_estoque";

interface ProcessData {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

interface DocumentData {
  id: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size: number;
}

export default function AdminPage() {
  const [activeRole, setActiveRole] = useState<EmployeeType>("vendedor");
  const [processes, setProcesses] = useState<ProcessData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [currentProcess, setCurrentProcess] = useState({
    title: "",
    content: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load processes
      const { data: processData, error: processError } = await supabase
        .from("onboarding_processes")
        .select("*")
        .eq("employee_type", activeRole)
        .order("order_index", { ascending: true });

      if (processError) throw processError;
      setProcesses(processData || []);

      // Load documents
      const { data: docData, error: docError } = await supabase
        .from("onboarding_documents")
        .select("*")
        .eq("employee_type", activeRole)
        .order("created_at", { ascending: false });

      if (docError) throw docError;
      setDocuments(docData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcess = async () => {
    if (!(currentProcess.title && currentProcess.content)) return;

    setLoading(true);
    try {
      if (editingId) {
        // Update existing process
        const { error } = await supabase
          .from("onboarding_processes")
          .update({
            title: currentProcess.title,
            content: currentProcess.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Insert new process
        const { error } = await supabase.from("onboarding_processes").insert({
          employee_type: activeRole,
          title: currentProcess.title,
          content: currentProcess.content,
          order_index: processes.length,
        });

        if (error) throw error;
      }

      setCurrentProcess({ title: "", content: "" });
      setEditingId(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
      alert("Erro ao salvar processo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProcess = (process: ProcessData) => {
    setCurrentProcess({ title: process.title, content: process.content });
    setEditingId(process.id);
  };

  const handleDeleteProcess = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este processo?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("onboarding_processes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir processo:", error);
      alert("Erro ao excluir processo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, envie apenas arquivos PDF");
      return;
    }

    setUploading(true);
    try {
      // Upload to Vercel Blob
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Erro no upload");

      const { url, filename, size } = await uploadResponse.json();

      // Save reference to Supabase
      const { error } = await supabase.from("onboarding_documents").insert({
        employee_type: activeRole,
        title: filename,
        file_url: url,
        file_name: filename,
        file_size: size,
      });

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: DocumentData) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return;

    setLoading(true);
    try {
      // Delete from Blob
      await fetch("/api/upload-document", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: doc.file_url }),
      });

      // Delete from Supabase
      const { error } = await supabase
        .from("onboarding_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      alert("Erro ao excluir documento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button size="sm" variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-2xl text-gray-900">
                  Administração de Onboarding
                </h1>
                <p className="text-muted-foreground text-sm">
                  Gerencie processos e materiais de integração
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-orange-600 text-sm">Farben</p>
              <p className="text-muted-foreground text-xs">
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs
          onValueChange={(v) => setActiveRole(v as EmployeeType)}
          value={activeRole}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="vendedor">Vendedor</TabsTrigger>
            <TabsTrigger value="gerente_estoque">
              Gerente de Estoque
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6 space-y-6" value={activeRole}>
            {/* Add/Edit Process Form */}
            <Card className="p-6">
              <h2 className="mb-4 font-semibold text-lg">
                {editingId !== null
                  ? "Editar Processo"
                  : "Adicionar Novo Processo"}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Processo</Label>
                  <Input
                    id="title"
                    onChange={(e) =>
                      setCurrentProcess({
                        ...currentProcess,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ex: Técnicas de Atendimento ao Cliente"
                    value={currentProcess.title}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Conteúdo / Fluxo</Label>
                  <Textarea
                    className="resize-none"
                    id="content"
                    onChange={(e) =>
                      setCurrentProcess({
                        ...currentProcess,
                        content: e.target.value,
                      })
                    }
                    placeholder="Descreva o processo, fluxo de trabalho ou informações importantes..."
                    rows={8}
                    value={currentProcess.content}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={
                      !(currentProcess.title && currentProcess.content) ||
                      loading
                    }
                    onClick={handleAddProcess}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {editingId !== null ? "Atualizar" : "Salvar"} Processo
                  </Button>
                  {editingId !== null && (
                    <Button
                      onClick={() => {
                        setCurrentProcess({ title: "", content: "" });
                        setEditingId(null);
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Documents Section */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-lg">
                  Documentos PDF ({documents.length})
                </h2>
                <Button
                  asChild
                  disabled={uploading}
                  size="sm"
                  variant="outline"
                >
                  <label className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload PDF
                    <input
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      type="file"
                    />
                  </label>
                </Button>
              </div>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                      key={doc.id}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">{doc.file_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={doc.file_url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Ver
                          </a>
                        </Button>
                        <Button
                          onClick={() => handleDeleteDocument(doc)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground text-sm">
                  Nenhum documento cadastrado ainda.
                </p>
              )}
            </Card>

            {/* List of Processes */}
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">
                Processos Cadastrados ({processes.length})
              </h2>
              {loading && processes.length === 0 ? (
                <Card className="p-8 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                </Card>
              ) : processes.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum processo cadastrado ainda. Adicione o primeiro
                    processo acima.
                  </p>
                </Card>
              ) : (
                processes.map((process) => (
                  <Card className="p-6" key={process.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {process.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-muted-foreground text-sm">
                          {process.content}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditProcess(process)}
                          size="sm"
                          variant="outline"
                        >
                          Editar
                        </Button>
                        <Button
                          disabled={loading}
                          onClick={() => handleDeleteProcess(process.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
