import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("tutorial_steps")
      .insert({
        section_id: body.section_id,
        title: body.title,
        description: body.description,
        youtube_video_url: body.youtube_video_url,
        duration_minutes: body.duration_minutes,
        order_index: body.order_index || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating tutorial step:", error)
    return NextResponse.json({ error: "Failed to create tutorial step" }, { status: 500 })
  }
}
