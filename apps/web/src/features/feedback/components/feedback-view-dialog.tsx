import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Separator } from "@acme/ui/separator";
import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Mail, MapPin, Phone, User } from "lucide-react";

import {
  getPriorityOption,
  getSourceOption,
  getStatusOption,
} from "../data/data";

interface FeedbackViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: CitizenFeedback | null;
}

export function FeedbackViewDialog({
  open,
  onOpenChange,
  feedback,
}: FeedbackViewDialogProps) {
  const queryClient = useClientQueries(schema);

  const { data: comments = [] } = queryClient.feedbackComment.useFindMany(
    {
      where: { feedbackId: feedback?.id },
      orderBy: { createdAt: "desc" },
      include: { createdByUser: true },
    },
    { enabled: !!feedback?.id && open }
  );

  const { data: statusHistory = [] } =
    queryClient.feedbackStatusHistory.useFindMany(
      {
        where: { feedbackId: feedback?.id },
        orderBy: { createdAt: "desc" },
        include: { createdByUser: true },
      },
      { enabled: !!feedback?.id && open }
    );

  if (!feedback) return null;

  const status = getStatusOption(feedback.status);
  const priority = getPriorityOption(feedback.priority);
  const source = getSourceOption(feedback.source);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge className="font-mono" variant="outline">
              {feedback.referenceNumber || "-"}
            </Badge>
            {status && (
              <Badge variant="outline">
                <span
                  className={`mr-1.5 h-2 w-2 rounded-full ${status.color}`}
                />
                {status.label}
              </Badge>
            )}
            {priority && (
              <Badge variant="outline">
                <span
                  className={`mr-1.5 h-2 w-2 rounded-full ${priority.color}`}
                />
                {priority.label}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl">{feedback.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(feedback.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </span>
              {source && <span>Origem: {source.label}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <h4 className="mb-2 font-medium">Descricao</h4>
            <p className="whitespace-pre-wrap text-muted-foreground text-sm">
              {feedback.description}
            </p>
          </div>

          <Separator />

          {/* Location */}
          {(feedback.address || feedback.neighborhood || feedback.city) && (
            <>
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4" />
                  Localizacao
                </h4>
                <div className="space-y-1 text-muted-foreground text-sm">
                  {feedback.address && <p>{feedback.address}</p>}
                  {feedback.neighborhood && (
                    <p>Bairro: {feedback.neighborhood}</p>
                  )}
                  {feedback.city && (
                    <p>
                      {feedback.city}
                      {feedback.state && ` - ${feedback.state}`}
                    </p>
                  )}
                  {feedback.zipCode && <p>CEP: {feedback.zipCode}</p>}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Citizen Info */}
          {!feedback.isAnonymous &&
            (feedback.citizenName ||
              feedback.citizenEmail ||
              feedback.citizenPhone) && (
              <>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    Dados do Cidadao
                  </h4>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    {feedback.citizenName && (
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {feedback.citizenName}
                      </p>
                    )}
                    {feedback.citizenEmail && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {feedback.citizenEmail}
                      </p>
                    )}
                    {feedback.citizenPhone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {feedback.citizenPhone}
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

          {feedback.isAnonymous && (
            <>
              <div>
                <Badge variant="secondary">Feedback Anonimo</Badge>
              </div>
              <Separator />
            </>
          )}

          {/* SLA Info */}
          {feedback.dueDate && (
            <>
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4" />
                  Prazo (SLA)
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {format(new Date(feedback.dueDate), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                  {feedback.slaBreached ? (
                    <Badge variant="destructive">Atrasado</Badge>
                  ) : (
                    <Badge
                      className="border-green-600 text-green-600"
                      variant="outline"
                    >
                      No prazo
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Resolution */}
          {feedback.resolvedAt && (
            <>
              <div>
                <h4 className="mb-2 font-medium">Resolucao</h4>
                <p className="text-muted-foreground text-sm">
                  Resolvido em:{" "}
                  {format(new Date(feedback.resolvedAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
                {feedback.resolutionNotes && (
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground text-sm">
                    {feedback.resolutionNotes}
                  </p>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Internal Notes */}
          {feedback.internalNotes && (
            <>
              <div>
                <h4 className="mb-2 font-medium">Notas Internas</h4>
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-muted-foreground text-sm">
                  {feedback.internalNotes}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Status History */}
          {statusHistory.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Historico de Status</h4>
              <div className="space-y-2">
                {statusHistory.map((item) => {
                  const fromStatusOpt = item.fromStatus
                    ? getStatusOption(item.fromStatus)
                    : null;
                  const toStatusOpt = getStatusOption(item.toStatus);
                  return (
                    <div
                      className="flex items-start gap-2 text-sm"
                      key={item.id}
                    >
                      <span className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(item.createdAt), "dd/MM HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      <span>
                        {fromStatusOpt ? (
                          <>
                            <Badge className="text-xs" variant="outline">
                              {fromStatusOpt.label}
                            </Badge>
                            {" → "}
                          </>
                        ) : null}
                        <Badge className="text-xs" variant="outline">
                          {toStatusOpt?.label}
                        </Badge>
                      </span>
                      {(item as any).createdByUser && (
                        <span className="text-muted-foreground">
                          por {(item as any).createdByUser.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">
                Comentarios ({comments.length})
              </h4>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    className={`rounded-md p-3 text-sm ${
                      comment.isInternal
                        ? "border border-yellow-200 bg-yellow-50"
                        : "bg-muted"
                    }`}
                    key={comment.id}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">
                        {comment.isFromCitizen
                          ? "Cidadao"
                          : (comment as any).createdByUser?.name || "Sistema"}
                      </span>
                      {comment.isInternal && (
                        <Badge className="text-xs" variant="outline">
                          Interno
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-xs">
                        {format(
                          new Date(comment.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
