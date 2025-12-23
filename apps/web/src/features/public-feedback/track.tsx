import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Field } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Send,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  open: { label: "Aberto", color: "bg-blue-500", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-yellow-500", icon: Loader2 },
  under_review: { label: "Em Revisao", color: "bg-purple-500", icon: Search },
  resolved: { label: "Resolvido", color: "bg-green-500", icon: CheckCircle },
  closed: { label: "Fechado", color: "bg-gray-500", icon: CheckCircle },
  rejected: { label: "Rejeitado", color: "bg-red-500", icon: AlertCircle },
};

export function PublicFeedbackTrack() {
  const params = useParams({ strict: false }) as {
    referenceNumber?: string;
  };
  const paramRef = params.referenceNumber;
  const [searchRef, setSearchRef] = useState(paramRef ?? "");
  const [activeRef, setActiveRef] = useState(paramRef ?? "");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["track-feedback", activeRef],
    queryFn: async () => {
      const { api } = await import("~/clients/api-client");
      const response = await (api.feedback.track as any)({
        referenceNumber: activeRef,
      }).get();
      return response.data;
    },
    enabled: !!activeRef,
  });

  const { mutate: submitComment, isPending: isSubmittingComment } = useMutation(
    {
      mutationFn: async () => {
        const { api } = await import("~/clients/api-client");
        const response = await (api.feedback.track as any)({
          referenceNumber: activeRef,
        }).comment.post({ content: comment });
        return response.data;
      },
      onSuccess: () => {
        toast.success("Comentario enviado com sucesso");
        setComment("");
        refetch();
      },
      onError: () => {
        toast.error("Erro ao enviar comentario");
      },
    }
  );

  const { mutate: submitRating, isPending: isSubmittingRating } = useMutation({
    mutationFn: async () => {
      const { api } = await import("~/clients/api-client");
      const response = await (api.feedback.track as any)({
        referenceNumber: activeRef,
      }).rating.post({ rating, comment: ratingComment || undefined });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avaliacao enviada com sucesso. Obrigado!");
      setRating(0);
      setRatingComment("");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao enviar avaliacao");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveRef(searchRef.toUpperCase());
  };

  const feedback = data?.feedback;
  const statusInfo = feedback ? statusConfig[feedback.status] : null;
  const StatusIcon = statusInfo?.icon ?? Clock;
  const canRate =
    feedback &&
    ["resolved", "closed"].includes(feedback.status) &&
    !feedback.satisfactionRating;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-3xl">Acompanhar Feedback</h1>
          <p className="mt-2 text-muted-foreground">
            Digite o numero de protocolo para acompanhar o status do seu
            feedback
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form className="flex gap-2" onSubmit={handleSearch}>
              <Input
                className="flex-1 font-mono"
                onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                placeholder="FB-00000001"
                value={searchRef}
              />
              <Button disabled={!searchRef || isLoading} type="submit">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {activeRef && !isLoading && !data?.found && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-lg">Protocolo nao encontrado</p>
              <p className="text-muted-foreground">
                Verifique o numero e tente novamente
              </p>
            </CardContent>
          </Card>
        )}

        {feedback && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription>Protocolo</CardDescription>
                    <CardTitle className="font-mono text-2xl">
                      {feedback.referenceNumber}
                    </CardTitle>
                  </div>
                  <Badge className="px-4 py-2 text-base" variant="outline">
                    <StatusIcon
                      className={`mr-2 h-4 w-4 ${feedback.status === "in_progress" ? "animate-spin" : ""}`}
                    />
                    {statusInfo?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{feedback.title}</h3>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {feedback.description}
                  </p>
                </div>

                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>{" "}
                    {feedback.categoryName ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Departamento:</span>{" "}
                    {feedback.departmentName ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Registrado em:
                    </span>{" "}
                    {format(
                      new Date(feedback.createdAt),
                      "dd/MM/yyyy 'as' HH:mm",
                      { locale: ptBR }
                    )}
                  </div>
                  {feedback.resolvedAt && (
                    <div>
                      <span className="text-muted-foreground">
                        Resolvido em:
                      </span>{" "}
                      {format(
                        new Date(feedback.resolvedAt),
                        "dd/MM/yyyy 'as' HH:mm",
                        { locale: ptBR }
                      )}
                    </div>
                  )}
                </div>

                {(feedback.address || feedback.neighborhood) && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>
                      {[feedback.address, feedback.neighborhood]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {feedback.resolutionNotes && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="mb-2 font-medium text-green-800">
                      Resolucao
                    </h4>
                    <p className="text-green-700">{feedback.resolutionNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Satisfaction Rating */}
            {canRate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Avalie o Atendimento
                  </CardTitle>
                  <CardDescription>
                    Sua opiniao e importante para melhorarmos nossos servicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        className="p-2 transition-transform hover:scale-110"
                        key={value}
                        onClick={() => setRating(value)}
                        type="button"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            value <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <>
                      <Field>
                        <Label>Comentario (opcional)</Label>
                        <Textarea
                          onChange={(e) => setRatingComment(e.target.value)}
                          placeholder="Deixe um comentario sobre o atendimento"
                          value={ratingComment}
                        />
                      </Field>
                      <Button
                        className="w-full"
                        disabled={isSubmittingRating}
                        onClick={() => submitRating()}
                      >
                        {isSubmittingRating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        Enviar Avaliacao
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comunicacao
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment List */}
                {data?.publicComments && data.publicComments.length > 0 ? (
                  <div className="space-y-3">
                    {data.publicComments.map((c: any) => (
                      <div
                        className={`rounded-lg p-3 ${
                          c.isFromCitizen
                            ? "ml-8 bg-blue-50"
                            : "mr-8 bg-gray-100"
                        }`}
                        key={c.id}
                      >
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground text-xs">
                          <span className="font-medium">
                            {c.isFromCitizen ? "Voce" : "Atendente"}
                          </span>
                          <span>
                            {format(new Date(c.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-muted-foreground">
                    Nenhuma mensagem ainda
                  </p>
                )}

                {/* Add Comment Form */}
                {!["closed", "rejected"].includes(feedback.status) && (
                  <div className="border-t pt-4">
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (comment.trim()) {
                          submitComment();
                        }
                      }}
                    >
                      <Input
                        className="flex-1"
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        value={comment}
                      />
                      <Button
                        disabled={!comment.trim() || isSubmittingComment}
                        type="submit"
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
