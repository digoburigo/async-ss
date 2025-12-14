import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: sectors, error } = await supabase
      .from("tutorial_sectors")
      .select(`
        *,
        sections:tutorial_sections(
          *,
          steps:tutorial_steps(*)
        )
      `)
      .eq("active", true)
      .order("order_index", { ascending: true })

    if (error) throw error

    return NextResponse.json(sectors)
  } catch (error) {
    console.error("Error fetching tutorial sectors:", error)
    return NextResponse.json({ error: "Failed to fetch tutorial sectors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("tutorial_sectors")
      .insert({
        name: body.name,
        description: body.description,
        icon: body.icon,
        order_index: body.order_index || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating tutorial sector:", error)
    return NextResponse.json({ error: "Failed to create tutorial sector" }, { status: 500 })
  }
}
