import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(req: Request) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const offset = (page - 1) * limit;

		const serviceSupabase = createServiceRoleClient();

		// Get total count for pagination
		const { count, error: countError } = await serviceSupabase
			.from("onboarding_chat_sessions")
			.select("*", { count: "exact", head: true })
			.eq("session_id", user.id); // Query by session_id which contains auth user ID

		if (countError) {
			console.error("[v0] Error counting chat sessions:", countError);
			return NextResponse.json(
				{ error: "Failed to count chat sessions" },
				{ status: 500 },
			);
		}

		// Get paginated sessions ordered by updated_at
		const { data: sessions, error } = await serviceSupabase
			.from("onboarding_chat_sessions")
			.select("*")
			.eq("session_id", user.id) // Query by session_id which contains auth user ID
			.order("updated_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error("[v0] Error fetching all chat sessions:", error);
			return NextResponse.json(
				{ error: "Failed to fetch chat sessions" },
				{ status: 500 },
			);
		}

		const totalPages = Math.ceil((count || 0) / limit);

		return NextResponse.json({
			sessions: sessions || [],
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages,
				hasMore: page < totalPages,
			},
		});
	} catch (error) {
		console.error("[v0] Error in all chat sessions GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
