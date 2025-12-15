import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { progressId, completed, adminApproved, notes } = body;

		const updateData: Record<string, unknown> = {
			updated_at: new Date().toISOString(),
		};

		if (completed !== undefined) {
			updateData.completed = completed;
			updateData.completed_at = completed ? new Date().toISOString() : null;
			updateData.completed_by = completed ? user.id : null;
		}

		if (adminApproved !== undefined) {
			updateData.admin_approved = adminApproved;
			updateData.admin_approved_at = adminApproved
				? new Date().toISOString()
				: null;
			updateData.admin_approved_by = adminApproved ? user.id : null;
		}

		if (notes !== undefined) {
			updateData.notes = notes;
		}

		const { data: progress, error } = await supabase
			.from("offboarding_progress")
			.update(updateData)
			.eq("id", progressId)
			.select()
			.single();

		if (error) {
			console.error("[v0] Error updating progress:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ progress });
	} catch (error) {
		console.error("[v0] Exception updating progress:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
