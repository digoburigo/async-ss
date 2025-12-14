import { generateText } from "ai"
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    // Fetch available products
    const { data: products, error: productsError } = await supabase.from("products").select("*").eq("active", true)

    const productsText =
      products && products.length > 0
        ? products.map((p) => `- ${p.name}: R$ ${p.unit_price.toFixed(2)}`).join("\n")
        : "Nenhum produto cadastrado ainda no sistema."

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Você é um assistente de vendas brasileiro. Analise o pedido do cliente e extraia os produtos, quantidades E PREÇOS mencionados.

${products && products.length > 0 ? `Produtos disponíveis no sistema:\n${productsText}` : "Nota: Não há produtos cadastrados ainda."}

Pedido do cliente: "${message}"

REGRAS IMPORTANTES DE EXTRAÇÃO DE PREÇOS:
1. Extraia TODOS os produtos e quantidades mencionados
2. DETECTE PREÇOS em QUALQUER formato brasileiro:
   - "por X reais" = preço TOTAL (dividir pela quantidade para obter unit_price)
   - "a X reais cada" = preço UNITÁRIO (usar direto)
   - "X reais cada" = preço UNITÁRIO
   - "custando X" = preço TOTAL
   - "a R$X" = preço UNITÁRIO
   - "R$X" sem "cada" = preço TOTAL
   - Números sem símbolo (ex: "por 10") = assume reais

3. IMPORTANTE: Se o preço é para TODOS os itens (ex: "3 abacates por 10 reais"), 
   DIVIDA o preço pela quantidade para obter o unit_price (10/3 = 3.33)

4. Se não mencionar preço E produto estiver na lista, use preço da lista
5. Se não mencionar preço E produto NÃO estiver na lista, use 0.00
6. Quantidade padrão é 1 se não especificada

EXEMPLOS DE CÁLCULO:
- "3 abacates por 10 reais" → quantity: 3, unit_price: 3.33 (10÷3)
- "5 laranjas por 5 reais" → quantity: 5, unit_price: 1.00 (5÷5)  
- "2 shoyus a R$5 cada" → quantity: 2, unit_price: 5.00
- "3 ketchups por R$8,50 cada" → quantity: 3, unit_price: 8.50
- "1 maionese custando 12 reais" → quantity: 1, unit_price: 12.00
- "4 tomates a 2 reais" → quantity: 4, unit_price: 2.00 (preço unitário)
- "10 ovos por 15" → quantity: 10, unit_price: 1.50 (15÷10)
- "2 shoyus e 1 ketchup" (sem preço) → usar preço da lista ou 0.00

Retorne APENAS um JSON válido no seguinte formato, sem texto adicional:
{
  "items": [
    {
      "product_name": "nome do produto",
      "quantity": número,
      "unit_price": preço_unitário_calculado
    }
  ]
}`,
    })

    // Parse the AI response - handle both plain JSON and markdown code blocks
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
    }

    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        {
          error: "Não foi possível processar o pedido. Tente reformular.",
          items: [],
        },
        { status: 400 },
      )
    }

    const parsedOrder = JSON.parse(jsonMatch[0])

    const itemsWithIds = parsedOrder.items.map((item: any) => {
      const product = products?.find(
        (p) =>
          p.name.toLowerCase().includes(item.product_name.toLowerCase()) ||
          item.product_name.toLowerCase().includes(p.name.toLowerCase()),
      )

      // Priority: 1) Price from AI (user mentioned), 2) Database price, 3) Zero
      const userPrice = item.unit_price
      const dbPrice = product?.unit_price || 0

      // If AI extracted a price > 0, user mentioned it - use that
      // Otherwise fall back to database price
      const finalPrice = userPrice > 0 ? userPrice : dbPrice

      return {
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: finalPrice,
        product_id: product?.id || null,
      }
    })

    return NextResponse.json({ items: itemsWithIds })
  } catch (error) {
    console.error("Error parsing order:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar pedido",
        items: [],
      },
      { status: 500 },
    )
  }
}
