import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { resumeUrl } = await req.json();

    if (!resumeUrl) {
      return Response.json(
        { error: "Resume URL is required" },
        { status: 400 }
      );
    }

    console.log("[v0] Analyzing resume from URL:", resumeUrl);

    const pdfResponse = await fetch(resumeUrl);
    if (!pdfResponse.ok) {
      console.log("[v0] Failed to fetch resume, status:", pdfResponse.status);
      return Response.json(
        { error: "Failed to fetch resume" },
        { status: 400 }
      );
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    console.log("[v0] PDF fetched, size:", pdfBuffer.byteLength, "bytes");

    const result = await generateText({
      model: "anthropic/claude-sonnet-4",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise este currículo em português e forneça insights detalhados no formato JSON EXATO:

{
  "summary": "Resumo breve do perfil profissional em 2-3 frases",
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "weaknesses": ["área para melhoria 1", "área para melhoria 2", "área para melhoria 3"],
  "recommendation": "Recomendação geral sobre a adequação do candidato"
}

Responda APENAS com o JSON, sem texto adicional antes ou depois.`,
            },
            {
              type: "file",
              data: pdfBuffer,
              mimeType: "application/pdf",
            },
          ],
        },
      ],
    });

    console.log("[v0] AI response received, text length:", result.text.length);

    let insights;
    try {
      // Try direct parse first
      insights = JSON.parse(result.text);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = result.text.match(
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
      );
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in the text
        const objectMatch = result.text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          insights = JSON.parse(objectMatch[0]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    console.log("[v0] Successfully parsed insights");
    return Response.json(insights);
  } catch (error) {
    console.error("[v0] Error analyzing resume:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze resume",
      },
      { status: 500 }
    );
  }
}
