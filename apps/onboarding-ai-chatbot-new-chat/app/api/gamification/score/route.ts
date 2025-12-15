import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createServerClient();

		// Get authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user's gamification summary using the database function
		const { data, error } = await supabase.rpc(
			"get_user_gamification_summary",
			{ p_user_id: user.id },
		);

		if (error) {
			console.error("[v0] Error fetching gamification summary:", error);
			return NextResponse.json(
				{ error: "Failed to fetch gamification data" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			data || {
				total_points: 0,
				achievements_earned: 0,
				recent_achievements: [],
				action_counts: {},
				available_achievements: [],
			},
		);
	} catch (error) {
		console.error("[v0] Gamification API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
