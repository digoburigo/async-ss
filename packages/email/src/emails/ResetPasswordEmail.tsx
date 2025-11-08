import { Html } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import TailwindProvider from "../utils/tailwind";

export default function ResetPasswordEmail({
	resetLink,
}: {
	resetLink: string;
}) {
	return (
		<TailwindProvider>
			<Html>
				<p>Clique no botão abaixo para resetar sua senha.</p>
				<EmailButton href={resetLink}>Resetar senha</EmailButton>
				<div className="mt-4">
					<small>
						Se você não solicitou este procedimento, ignore este email.
					</small>
				</div>
			</Html>
		</TailwindProvider>
	);
}
