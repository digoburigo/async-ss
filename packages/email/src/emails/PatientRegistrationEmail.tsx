import { Html } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import TailwindProvider from "../utils/tailwind";

export default function PatientRegistrationEmail({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink = "https://example.com",
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}) {
  return (
    <TailwindProvider>
      <Html>
        <p>
          Você foi cadastrado como paciente para {teamName} por{" "}
          {invitedByUsername} ({invitedByEmail}).
        </p>
        <EmailButton href={inviteLink}>Aceitar registro</EmailButton>
      </Html>
    </TailwindProvider>
  );
}
