import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	try {
		const supabase = await createServerClient();
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		console.log("[v0] Fetching jobs with status filter:", status);

		let query = supabase
			.from("preboarding_job_positions")
			.select("*")
			.order("created_at", { ascending: false });

		if (status && status !== "all") {
			query = query.eq("status", status);
		}

		const { data, error } = await query;

		console.log("[v0] Jobs query result:", {
			count: data?.length,
			error: error?.message,
		});

		if (error) {
			console.error("[v0] Error fetching jobs:", error);
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
			.from("preboarding_job_positions")
			.insert({
				...body,
				created_by: user?.id,
			})
			.select()
			.single();

		if (error) {
			console.error("[v0] Error creating job:", error);
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
