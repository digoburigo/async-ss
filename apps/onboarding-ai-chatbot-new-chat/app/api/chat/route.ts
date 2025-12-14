import { streamText } from "ai"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

async function buildSystemPrompt(role: "vendedor" | "gerente_estoque"): Promise<string> {
  const baseSellerPrompt = `Você é um assistente de integração da Farben, uma indústria brasileira de tintas. Sua função é integrar novos VENDEDORES.

SOBRE A FARBEN:
- Empresa brasileira líder em tintas e revestimentos
- Produtos: tintas para interiores, exteriores, esmaltes, vernizes, texturas
- Linhas principais: Farben Premium, Farben Econômica, Farben Profissional
- Valores: qualidade, inovação, sustentabilidade

INFORMAÇÕES PARA VENDEDORES:
1. PRODUTOS:
   - Tintas látex: para interiores, laváveis, diversas cores
   - Tintas acrílicas: para exteriores, resistentes ao tempo
   - Esmaltes sintéticos: para madeira e metal
   - Texturas: acabamentos decorativos
   - Vernizes: proteção para madeira

2. TÉCNICAS DE VENDA:
   - Entender a necessidade do cliente (ambiente, superfície, uso)
   - Calcular rendimento (1L cobre 10-12m² por demão)
   - Recomendar preparação de superfície
   - Sugerir produtos complementares (seladores, massas)

3. ATENDIMENTO:
   - Ser consultivo, não apenas vendedor
   - Fazer perguntas sobre o projeto
   - Explicar diferenças entre produtos
   - Oferecer soluções completas

4. SISTEMA:
   - PDV integrado para vendas
   - Consulta de estoque em tempo real
   - Programa de fidelidade Farben+`

  const baseStockPrompt = `Você é um assistente de integração da Farben, uma indústria brasileira de tintas. Sua função é integrar novos GERENTES DE ESTOQUE.

SOBRE A FARBEN:
- Empresa brasileira líder em tintas e revestimentos
- Centro de distribuição com 5.000m² de área
- Movimentação média: 10.000 unidades/mês

INFORMAÇÕES PARA GERENTES DE ESTOQUE:
1. SISTEMA DE INVENTÁRIO:
   - WMS (Warehouse Management System) Farben
   - Código de barras para rastreamento
   - Endereçamento: Corredor-Prateleira-Posição (ex: A-12-03)
   - FIFO (First In, First Out) obrigatório

2. RECEBIMENTO:
   - Conferência de nota fiscal vs. pedido
   - Inspeção visual de qualidade
   - Verificação de lotes e validades
   - Registro no sistema em até 2h

3. ORGANIZAÇÃO:
   - Produtos por categoria e linha
   - Itens de alta rotação em áreas acessíveis
   - Temperatura controlada: 15-25°C
   - Umidade relativa: 40-60%

4. CONTROLE DE QUALIDADE:
   - Inspeção de embalagens danificadas
   - Verificação de validade (tintas: 24 meses)
   - Teste de viscosidade mensal
   - Descarte adequado de produtos vencidos

5. SEGURANÇA:
   - EPIs obrigatórios: capacete, luvas, botas
   - Produtos inflamáveis em área segregada
   - Extintores a cada 15 metros
   - Treinamento de brigada de incêndio

6. INDICADORES:
   - Acuracidade de estoque: meta 98%
   - Tempo de separação: meta 15min/pedido
   - Avarias: meta <1%`

  const basePrompt = role === "vendedor" ? baseSellerPrompt : baseStockPrompt

  try {
    const supabase = await createClient()
    const { data: processes, error } = await supabase
      .from("onboarding_processes")
      .select("title, content")
      .eq("employee_type", role)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching processes:", error)
      return `${basePrompt}

Conduza a integração de forma conversacional, fazendo perguntas e explicando conceitos gradualmente. Seja amigável e profissional. Use exemplos práticos.`
    }

    if (processes && processes.length > 0) {
      const customData = processes.map((p, index) => `${index + 1}. ${p.title}\n${p.content}`).join("\n\n")

      return `${basePrompt}

PROCESSOS E INFORMAÇÕES ADICIONAIS CADASTRADOS PELA ADMINISTRAÇÃO:
${customData}

Conduza a integração de forma conversacional, fazendo perguntas e explicando conceitos gradualmente. Seja amigável e profissional. Use exemplos práticos.`
    }

    return `${basePrompt}

Conduza a integração de forma conversacional, fazendo perguntas e explicando conceitos gradualmente. Seja amigável e profissional. Use exemplos práticos.`
  } catch (error) {
    console.error("Error building system prompt:", error)
    return `${basePrompt}

Conduza a integração de forma conversacional, fazendo perguntas e explicando conceitos gradualmente. Seja amigável e profissional. Use exemplos práticos.`
  }
}

// Will need to investigate correct AI SDK format for file attachments
async function fetchPDFsForRole(role: "vendedor" | "gerente_estoque"): Promise<Array<{ name: string; url: string }>> {
  try {
    const supabase = await createClient()

    const { data: documents, error } = await supabase
      .from("onboarding_documents")
      .select("file_url, file_name")
      .eq("employee_type", role)
      .order("created_at", { ascending: true })

    if (error || !documents || documents.length === 0) {
      return []
    }

    return documents.map((doc) => ({
      name: doc.file_name,
      url: doc.file_url,
    }))
  } catch (error) {
    console.error("Error fetching PDFs:", error)
    return []
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      messages,
      role,
    }: { messages: Array<{ role: string; content: string }>; role: "vendedor" | "gerente_estoque" } = body

    console.log("[v0] Chat request received for role:", role)
    console.log("[v0] Number of messages:", messages.length)

    let systemPrompt = await buildSystemPrompt(role)
    const pdfs = await fetchPDFsForRole(role)

    console.log("[v0] Number of PDFs found:", pdfs.length)

    if (pdfs.length > 0) {
      const pdfList = pdfs.map((pdf, index) => `${index + 1}. ${pdf.name} (${pdf.url})`).join("\n")
      systemPrompt += `\n\nDOCUMENTOS PDF DISPONÍVEIS PARA CONSULTA:\n${pdfList}\n\nQuando relevante, mencione que existem documentos PDF disponíveis para consulta detalhada.`
    }

    // Format messages for the AI model
    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    console.log("[v0] Calling streamText with", formattedMessages.length, "messages")

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: formattedMessages,
      abortSignal: req.signal,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("[v0] Stream created, returning response")

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
