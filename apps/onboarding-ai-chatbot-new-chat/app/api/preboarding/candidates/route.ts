import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	try {
		const supabase = await createServerClient();
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status") || "active";
		const stageId = searchParams.get("stage_id");

		let query = supabase
			.from("preboarding_candidates")
			.select(`
        *,
        stage:preboarding_stages(id, name, color, order_index)
      `)
			.order("created_at", { ascending: false });

		if (status !== "all") {
			query = query.eq("status", status);
		}

		if (stageId) {
			query = query.eq("stage_id", stageId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("[v0] Error fetching candidates:", error);
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

export async function POST(request: Request) {
	try {
		const supabase = await createServerClient();
		const body = await request.json();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		const { data, error } = await supabase
			.from("preboarding_candidates")
			.insert({
				...body,
				created_by: user?.id,
			})
			.select(`
        *,
        stage:preboarding_stages(id, name, color, order_index)
      `)
			.single();

		if (error) {
			console.error("[v0] Error creating candidate:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Create activity log
		if (data) {
			await supabase.from("preboarding_activities").insert({
				candidate_id: data.id,
				activity_type: "note",
				title: "Candidato adicionado",
				description: `${data.name} foi adicionado ao pipeline para a vaga de ${data.position}`,
				created_by: user?.id,
			});
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
