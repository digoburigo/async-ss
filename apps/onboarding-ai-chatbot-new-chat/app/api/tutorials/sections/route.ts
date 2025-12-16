import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("tutorial_sections")
      .insert({
        sector_id: body.sector_id,
        name: body.name,
        description: body.description,
        order_index: body.order_index || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating tutorial section:", error);
    return NextResponse.json(
      { error: "Failed to create tutorial section" },
      { status: 500 }
    );
  }
}
