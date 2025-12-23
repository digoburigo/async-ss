import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Checkbox } from "@acme/ui/checkbox";
import { Field } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";

export function PublicFeedbackSubmit() {
  const params = useParams({ strict: false }) as { organizationSlug?: string };
  const organizationSlug = params.organizationSlug;
  const [submitted, setSubmitted] = useState<{
    referenceNumber: string;
  } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  // Auto sign-in anonymously if not authenticated
  useEffect(() => {
    async function signInAnonymously() {
      if (isSessionLoading || session || isSigningIn) return;

      setIsSigningIn(true);
      try {
        await authClient.signIn.anonymous();
      } catch (error) {
        console.error("Failed to sign in anonymously:", error);
      } finally {
        setIsSigningIn(false);
      }
    }

    signInAnonymously();
  }, [session, isSessionLoading, isSigningIn]);

  const { data: orgData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["public-categories", organizationSlug],
    queryFn: async () => {
      const { api } = await import("~/clients/api-client");
      const response = await (api.feedback.public.categories as any)({
        organizationSlug: organizationSlug as string,
      }).get();
      return response.data;
    },
    enabled: !!organizationSlug,
  });

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: async (data: any) => {
      // Ensure we have a session before submitting
      if (!session) {
        throw new Error("Sessao nao iniciada. Por favor, aguarde.");
      }

      const { api } = await import("~/clients/api-client");
      const response = await (api.feedback.submit as any).post({
        organizationId: orgData?.organization?.id ?? "",
        ...data,
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao enviar feedback");
      }

      return response.data;
    },
    onSuccess: (data) => {
      if (data?.referenceNumber) {
        setSubmitted({ referenceNumber: data.referenceNumber });
        toast.success("Feedback enviado com sucesso!");
      }
    },
    onError: (error: Error) => {
      console.error("Submit error:", error);
      toast.error(error.message || "Erro ao enviar feedback. Tente novamente.");
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      subcategoryId: "",
      address: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      citizenName: "",
      citizenEmail: "",
      citizenPhone: "",
      isAnonymous: false,
    },
    onSubmit: async ({ value }) => {
      submitFeedback(value);
    },
  });
  const selectedCategory = orgData?.categories?.find(
    (c: any) => c.id === selectedCategoryId
  );

  const isInitializing = isLoadingOrg || isSessionLoading || isSigningIn;

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-muted-foreground text-sm">
            {isSigningIn ? "Preparando..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  if (!orgData?.found) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Organizacao nao encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="font-bold text-2xl">Feedback Enviado!</h2>
            <p className="text-muted-foreground">
              Seu feedback foi registrado com sucesso. Use o numero de protocolo
              abaixo para acompanhar o status.
            </p>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-muted-foreground text-sm">
                Numero de Protocolo
              </p>
              <p className="font-bold font-mono text-2xl">
                {submitted.referenceNumber}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
                href={`/feedback/track/${submitted.referenceNumber}`}
              >
                Acompanhar Status
              </a>
              <Button onClick={() => setSubmitted(null)} variant="outline">
                Enviar Outro Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          {orgData.organization?.logo && (
            <img
              alt={orgData.organization.name}
              className="mx-auto mb-4 h-16"
              src={orgData.organization.logo}
            />
          )}
          <h1 className="font-bold text-3xl">{orgData.organization?.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Portal de Atendimento ao Cidadao
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Registrar Feedback
            </CardTitle>
            <CardDescription>
              Preencha o formulario abaixo para enviar sua sugestao, reclamacao
              ou elogio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {/* Category Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="categoryId">
                  {(field) => (
                    <Field>
                      <Label>Categoria *</Label>
                      <Select
                        onValueChange={(value) => {
                          field.handleChange(value);
                          setSelectedCategoryId(value);
                        }}
                        value={field.state.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgData.categories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                {selectedCategory?.subcategories?.length > 0 && (
                  <form.Field name="subcategoryId">
                    {(field) => (
                      <Field>
                        <Label>Subcategoria</Label>
                        <Select
                          onValueChange={field.handleChange}
                          value={field.state.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma subcategoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory.subcategories.map((sub: any) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  </form.Field>
                )}
              </div>

              {/* Title and Description */}
              <form.Field name="title">
                {(field) => (
                  <Field>
                    <Label>Titulo *</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Resumo do seu feedback"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <Label>Descricao *</Label>
                    <Textarea
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Descreva detalhadamente o problema, sugestao ou elogio"
                      rows={5}
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              {/* Location */}
              <div className="border-t pt-4">
                <h3 className="mb-4 font-medium">Localizacao (opcional)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <form.Field name="address">
                    {(field) => (
                      <Field className="md:col-span-2">
                        <Label>Endereco</Label>
                        <Input
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Rua, numero"
                          value={field.state.value}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="neighborhood">
                    {(field) => (
                      <Field>
                        <Label>Bairro</Label>
                        <Input
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Bairro"
                          value={field.state.value}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="city">
                    {(field) => (
                      <Field>
                        <Label>Cidade</Label>
                        <Input
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Cidade"
                          value={field.state.value}
                        />
                      </Field>
                    )}
                  </form.Field>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Dados de Contato</h3>
                  <form.Field name="isAnonymous">
                    {(field) => (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={field.state.value}
                          id="anonymous"
                          onCheckedChange={(checked) =>
                            field.handleChange(!!checked)
                          }
                        />
                        <Label className="font-normal" htmlFor="anonymous">
                          Enviar anonimamente
                        </Label>
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Subscribe selector={(state) => state.values.isAnonymous}>
                  {(isAnonymous) =>
                    !isAnonymous && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <form.Field name="citizenName">
                          {(field) => (
                            <Field>
                              <Label>Nome</Label>
                              <Input
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder="Seu nome"
                                value={field.state.value}
                              />
                            </Field>
                          )}
                        </form.Field>

                        <form.Field name="citizenPhone">
                          {(field) => (
                            <Field>
                              <Label>Telefone</Label>
                              <Input
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder="(00) 00000-0000"
                                value={field.state.value}
                              />
                            </Field>
                          )}
                        </form.Field>

                        <form.Field name="citizenEmail">
                          {(field) => (
                            <Field className="md:col-span-2">
                              <Label>Email</Label>
                              <Input
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder="seu@email.com"
                                type="email"
                                value={field.state.value}
                              />
                            </Field>
                          )}
                        </form.Field>
                      </div>
                    )
                  }
                </form.Subscribe>
              </div>

              <Button
                className="w-full"
                disabled={isPending || !session}
                size="lg"
                type="submit"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : !session ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  "Enviar Feedback"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Ja enviou um feedback?{" "}
            <a className="text-primary hover:underline" href="/feedback/track">
              Acompanhe aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
