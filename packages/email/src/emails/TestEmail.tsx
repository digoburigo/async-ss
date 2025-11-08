import { Html } from "@react-email/components";
import TailwindProvider from "../utils/tailwind";

export default function TestEmail() {
	return (
		<TailwindProvider>
			<Html>
				<p>Teste</p>
			</Html>
		</TailwindProvider>
	);
}
