import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();

		const { data: steps, error } = await supabase
			.from("offboarding_checklist_steps")
			.select("*")
			.order("order_index", { ascending: true });

		if (error) {
			console.error("[v0] Error fetching offboarding steps:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ steps });
	} catch (error) {
		console.error("[v0] Exception fetching offboarding steps:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
