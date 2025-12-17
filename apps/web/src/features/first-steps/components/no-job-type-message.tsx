import { AlertCircleIcon } from "lucide-react";

type NoJobTypeMessageProps = {
  isOrgAdmin?: boolean;
};

export function NoJobTypeMessage({
  isOrgAdmin = false,
}: NoJobTypeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <div className="bg-muted flex size-16 items-center justify-center rounded-full">
        <AlertCircleIcon className="text-muted-foreground size-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Nenhum cargo atribuído</h3>
        <p className="text-muted-foreground max-w-md">
          {isOrgAdmin
            ? "Você ainda não tem um cargo atribuído. Como administrador, você pode visualizar os passos de qualquer cargo usando o seletor acima."
            : "Você ainda não tem um cargo atribuído. Entre em contato com o administrador da sua organização para que ele configure seu cargo."}
        </p>
      </div>
    </div>
  );
}
