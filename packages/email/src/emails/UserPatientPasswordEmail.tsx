import { Html } from "@react-email/components";
import TailwindProvider from "../utils/tailwind";

export default function UserPatientPasswordEmail({ pass }: { pass: string }) {
  return (
    <TailwindProvider>
      <Html>
        <p>
          Lembre-se de verificar seu email antes de entrar no sistema. Verifique
          se você recebeu a mensagem de confirmação de email.
        </p>
        <p>
          Esta é a sua senha inicial para acessar o sistema. Lembre-se de que,
          no primeiro login, será necessário trocar a senha para maior
          segurança. Após a troca, essa senha não será mais válida.
        </p>
        <code className="rounded bg-gray-200 px-1 py-0.5 font-bold font-mono text-gray-700 text-xl tracking-tight">
          {pass}
        </code>
        <div className="mt-4">
          <small>
            Caso você não tenha solicitado este procedimento, ignore este email.
          </small>
        </div>
      </Html>
    </TailwindProvider>
  );
}
