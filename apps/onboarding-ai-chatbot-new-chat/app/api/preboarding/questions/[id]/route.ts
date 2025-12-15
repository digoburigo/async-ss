import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createServerClient();
		const { id } = await params;
		const body = await request.json();

		const { data, error } = await supabase
			.from("preboarding_candidate_questions")
			.update({ ...body, updated_at: new Date().toISOString() })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[v0] Error updating question:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("[v0] Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createServerClient();
		const { id } = await params;

		const { error } = await supabase
			.from("preboarding_candidate_questions")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("[v0] Error deleting question:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
