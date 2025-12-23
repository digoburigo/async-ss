import { AlertCircleIcon } from "lucide-react";

type NoJobTypeMessageProps = {
  isOrgAdmin?: boolean;
};

export function NoJobTypeMessage({
  isOrgAdmin = false,
}: NoJobTypeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <AlertCircleIcon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Nenhum cargo atribuído</h3>
        <p className="max-w-md text-muted-foreground">
          {isOrgAdmin
            ? "Você ainda não tem um cargo atribuído. Como administrador, você pode visualizar os passos de qualquer cargo usando o seletor acima."
            : "Você ainda não tem um cargo atribuído. Entre em contato com o administrador da sua organização para que ele configure seu cargo."}
        </p>
      </div>
    </div>
  );
}
