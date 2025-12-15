import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Using a simpler approach that extracts basic text from PDF binary

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
	// Convert to string and look for text content between stream markers
	const uint8Array = new Uint8Array(buffer);
	const text = new TextDecoder("latin1").decode(uint8Array);

	// Extract text content from PDF streams (simplified extraction)
	const textParts: string[] = [];

	// Look for text objects in PDF (BT...ET blocks)
	const btEtMatches = text.matchAll(/BT\s*([\s\S]*?)\s*ET/g);
	for (const match of btEtMatches) {
		// Extract text from Tj and TJ operators
		const tjMatches = match[1].matchAll(/$$(.*?)$$\s*Tj/g);
		for (const tj of tjMatches) {
			textParts.push(tj[1]);
		}

		// Also extract from TJ arrays
		const tjArrayMatches = match[1].matchAll(/\[(.*?)\]\s*TJ/g);
		for (const tja of tjArrayMatches) {
			const innerTexts = tja[1].matchAll(/$$(.*?)$$/g);
			for (const it of innerTexts) {
				textParts.push(it[1]);
			}
		}
	}

	// Clean up extracted text
	let extracted = textParts
		.join(" ")
		.replace(/\\n/g, "\n")
		.replace(/\\r/g, "")
		.replace(/\s+/g, " ")
		.trim();

	// If no text extracted from streams, try to find readable ASCII text
	if (extracted.length < 100) {
		const asciiText = text.match(/[\x20-\x7E]{20,}/g);
		if (asciiText) {
			extracted = asciiText
				.filter(
					(t) =>
						!t.includes("stream") &&
						!t.includes("endstream") &&
						!t.includes("/Type"),
				)
				.join(" ")
				.substring(0, 15000);
		}
	}

	return extracted;
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// Get document and candidate info
		const { data: doc, error: docError } = await supabase
			.from("preboarding_candidate_documents")
			.select(`
        *,
        candidate:preboarding_candidates(
          name,
          position,
          department,
          job_position:preboarding_job_positions(
            title,
            description,
            requirements,
            responsibilities
          )
        )
      `)
			.eq("id", id)
			.single();

		if (docError) {
			console.error("[v0] Error fetching document:", docError);
			throw docError;
		}

		const candidate = doc.candidate;
		const jobPosition = candidate?.job_position;

		let documentContent = "";
		if (doc.file_url) {
			try {
				console.log("[v0] Fetching document from:", doc.file_url);
				const response = await fetch(doc.file_url);

				if (!response.ok) {
					console.error("[v0] Failed to fetch document:", response.status);
					throw new Error(`Failed to fetch document: ${response.status}`);
				}

				if (doc.mime_type === "application/pdf") {
					const arrayBuffer = await response.arrayBuffer();
					console.log("[v0] PDF size:", arrayBuffer.byteLength, "bytes");
					documentContent = await extractTextFromPDF(arrayBuffer);
					console.log(
						"[v0] Extracted PDF text length:",
						documentContent.length,
					);
				} else if (
					doc.mime_type?.includes("text") ||
					doc.file_name?.endsWith(".txt")
				) {
					documentContent = await response.text();
				} else if (doc.mime_type?.includes("image")) {
					// For images, we can describe what type of document it is
					documentContent = `[Documento de imagem: ${doc.file_name}. Tipo: ${doc.document_type}. A análise será baseada nas informações do candidato e na vaga.]`;
				}
			} catch (e) {
				console.error("[v0] Could not fetch/parse document content:", e);
				documentContent = `[Não foi possível extrair o texto do documento. Análise baseada nas informações disponíveis.]`;
			}
		}

		const hasContent = documentContent && documentContent.trim().length > 50;
		console.log(
			"[v0] Has significant content:",
			hasContent,
			"Length:",
			documentContent?.length || 0,
		);

		const prompt = `Você é um especialista em RH e recrutamento. Analise o documento do candidato e forneça uma avaliação detalhada.

INFORMAÇÕES DO CANDIDATO:
- Nome: ${candidate?.name || "Não informado"}
- Cargo Pretendido: ${candidate?.position || jobPosition?.title || "Não informado"}
- Departamento: ${candidate?.department || "Não informado"}

DESCRIÇÃO DA VAGA:
${jobPosition?.description || "Não disponível"}

REQUISITOS DA VAGA:
${jobPosition?.requirements || "Não disponíveis"}

RESPONSABILIDADES:
${jobPosition?.responsibilities || "Não disponíveis"}

TIPO DE DOCUMENTO: ${doc.document_type}
TÍTULO DO DOCUMENTO: ${doc.title}

CONTEÚDO DO DOCUMENTO:
${hasContent ? documentContent.substring(0, 15000) : "O conteúdo do documento não pôde ser extraído automaticamente. Por favor, forneça uma análise geral baseada no tipo de documento e nas informações do candidato disponíveis."}

Por favor, forneça:
1. **Resumo da Análise**: Uma breve análise do documento
2. **Pontos Fortes**: Aspectos positivos identificados
3. **Pontos de Atenção**: Aspectos que merecem atenção ou esclarecimento
4. **Aderência à Vaga**: Avalie de 0 a 100 o quanto o candidato parece adequado para a vaga com base neste documento
5. **Recomendações**: Sugestões para o processo de entrevista

${!hasContent ? "NOTA: Como o conteúdo do documento não pôde ser extraído, forneça uma análise mais conservadora e sugira que o documento seja revisado manualmente." : ""}

Responda em português brasileiro de forma clara e objetiva.
Ao final, inclua a nota de aderência no formato: "NOTA_ADERENCIA: XX" onde XX é um número de 0 a 100.`;

		console.log("[v0] Calling AI for analysis...");
		const { text } = await generateText({
			model: "anthropic/claude-sonnet-4-20250514",
			prompt,
		});
		console.log("[v0] AI response received, length:", text.length);

		// Extract adherence score from response
		const scoreMatch = text.match(/NOTA_ADERENCIA:\s*(\d+)/i);
		const adherenceScore = scoreMatch
			? Number.parseInt(scoreMatch[1], 10)
			: null;
		console.log("[v0] Extracted adherence score:", adherenceScore);

		// Clean the analysis text (remove the score line)
		const cleanedAnalysis = text.replace(/NOTA_ADERENCIA:\s*\d+/i, "").trim();

		// Update document with analysis
		const { data: updated, error: updateError } = await supabase
			.from("preboarding_candidate_documents")
			.update({
				ai_analysis: cleanedAnalysis,
				adherence_score: adherenceScore,
				analyzed_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (updateError) {
			console.error("[v0] Error updating document:", updateError);
			throw updateError;
		}

		console.log("[v0] Document analysis complete");
		return NextResponse.json(updated);
	} catch (error) {
		console.error("[v0] Error analyzing document:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: "Failed to analyze document", details: errorMessage },
			{ status: 500 },
		);
	}
}
