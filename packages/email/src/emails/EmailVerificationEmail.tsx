import { Html } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import TailwindProvider from "../utils/tailwind";

export default function EmailVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  return (
    <TailwindProvider>
      <Html>
        <p>Clique no botão abaixo para verificar seu email ({email}).</p>
        <EmailButton href={url}>Verificar email</EmailButton>
      </Html>
    </TailwindProvider>
  );
}
