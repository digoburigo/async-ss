import { generateObject } from "ai";
import { z } from "zod";

// Sample data that the AI can reference
const hrData = {
	headcount: 215,
	turnover: 10,
	absenteeism: 7.39,
	vacation: 20,
	overtime: 200,
	admissions: 8,
	terminations: 5,
	monthlyHeadcount: [
		{ month: "Jan", headcount: 180, admissoes: 12, desligamentos: 5 },
		{ month: "Fev", headcount: 187, admissoes: 10, desligamentos: 3 },
		{ month: "Mar", headcount: 192, admissoes: 8, desligamentos: 3 },
		{ month: "Abr", headcount: 195, admissoes: 6, desligamentos: 3 },
		{ month: "Mai", headcount: 198, admissoes: 7, desligamentos: 4 },
		{ month: "Jun", headcount: 200, admissoes: 5, desligamentos: 3 },
		{ month: "Jul", headcount: 203, admissoes: 8, desligamentos: 5 },
		{ month: "Ago", headcount: 205, admissoes: 6, desligamentos: 4 },
		{ month: "Set", headcount: 208, admissoes: 7, desligamentos: 4 },
		{ month: "Out", headcount: 210, admissoes: 5, desligamentos: 3 },
		{ month: "Nov", headcount: 212, admissoes: 6, desligamentos: 4 },
		{ month: "Dez", headcount: 215, admissoes: 8, desligamentos: 5 },
	],
	departmentData: [
		{ name: "Operação", value: 85 },
		{ name: "Técnico", value: 45 },
		{ name: "Comercial", value: 35 },
		{ name: "Administrativo", value: 30 },
		{ name: "RH", value: 20 },
	],
	ageDistribution: [
		{ faixa: "18-25", quantidade: 35 },
		{ faixa: "26-35", quantidade: 75 },
		{ faixa: "36-45", quantidade: 55 },
		{ faixa: "46-55", quantidade: 30 },
		{ faixa: "56+", quantidade: 20 },
	],
	tenureDistribution: [
		{ tempo: "0-1 ano", quantidade: 45 },
		{ tempo: "1-3 anos", quantidade: 55 },
		{ tempo: "3-5 anos", quantidade: 40 },
		{ tempo: "5-10 anos", quantidade: 50 },
		{ tempo: "10+ anos", quantidade: 25 },
	],
	genderData: [
		{ name: "Masculino", value: 120 },
		{ name: "Feminino", value: 95 },
	],
	turnoverByMonth: [
		{ month: "Jan", turnover: 2.8 },
		{ month: "Fev", turnover: 1.6 },
		{ month: "Mar", turnover: 1.6 },
		{ month: "Abr", turnover: 1.5 },
		{ month: "Mai", turnover: 2.0 },
		{ month: "Jun", turnover: 1.5 },
		{ month: "Jul", turnover: 2.5 },
		{ month: "Ago", turnover: 2.0 },
		{ month: "Set", turnover: 1.9 },
		{ month: "Out", turnover: 1.4 },
		{ month: "Nov", turnover: 1.9 },
		{ month: "Dez", turnover: 2.3 },
	],
};

const chartDataItemSchema = z.object({
	name: z.string().optional(),
	value: z.number().optional(),
	month: z.string().optional(),
	label: z.string().optional(),
	quantidade: z.number().optional(),
	headcount: z.number().optional(),
	turnover: z.number().optional(),
	admissoes: z.number().optional(),
	desligamentos: z.number().optional(),
	faixa: z.string().optional(),
	tempo: z.string().optional(),
});

const responseSchema = z.object({
	content: z.string().describe("A resposta textual para a pergunta do usuário"),
	shouldShowChart: z
		.boolean()
		.describe("Se deve mostrar um gráfico na resposta"),
	chart: z
		.object({
			type: z.enum(["bar", "line", "pie", "area"]).describe("Tipo do gráfico"),
			title: z.string().describe("Título do gráfico"),
			data: z.array(chartDataItemSchema).describe("Dados do gráfico"),
			dataKeys: z.array(z.string()).describe("Chaves de dados para o gráfico"),
			colors: z.array(z.string()).describe("Cores para cada série de dados"),
		})
		.optional()
		.describe("Configuração do gráfico se shouldShowChart for true"),
});

export async function POST(req: Request) {
	try {
		const { message } = await req.json();

		const { object } = await generateObject({
			model: "openai/gpt-4o-mini",
			schema: responseSchema,
			prompt: `Você é um assistente especializado em indicadores de RH e análise de dados administrativos.
      
Dados disponíveis da empresa:
${JSON.stringify(hrData, null, 2)}

Pergunta do usuário: ${message}

Responda a pergunta do usuário de forma clara e objetiva em português do Brasil.
Se a pergunta pedir um gráfico ou análise visual, defina shouldShowChart como true e configure o gráfico apropriado.
Para gráficos de pizza, cada item deve ter "name" e "value" como chaves, e opcionalmente "color".
Para gráficos de linha/barra/área, use a primeira chave como eixo X.
Use cores em formato hexadecimal como #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899.`,
			maxOutputTokens: 2000,
		});

		return Response.json({
			content: object.content,
			chart: object.shouldShowChart ? object.chart : undefined,
		});
	} catch (error) {
		console.error("Error in indicadores chat:", error);
		return Response.json(
			{ error: "Failed to generate response" },
			{ status: 500 },
		);
	}
}
