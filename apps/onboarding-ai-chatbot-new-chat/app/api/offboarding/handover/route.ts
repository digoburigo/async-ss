import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		const {
			process_id,
			task_title,
			task_description,
			assigned_to,
			assigned_to_name,
			priority,
			due_date,
		} = body;

		const { data: task, error } = await supabase
			.from("offboarding_handover_tasks")
			.insert({
				process_id,
				task_title,
				task_description,
				assigned_to,
				assigned_to_name,
				priority,
				due_date,
				status: "pending",
			})
			.select()
			.single();

		if (error) {
			console.error("[v0] Error creating handover task:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ task });
	} catch (error) {
		console.error("[v0] Exception creating handover task:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: Request) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		const { taskId, ...updateData } = body;

		if (updateData.status === "completed") {
			updateData.completed_at = new Date().toISOString();
		}

		const { data: task, error } = await supabase
			.from("offboarding_handover_tasks")
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
			.eq("id", taskId)
			.select()
			.single();

		if (error) {
			console.error("[v0] Error updating handover task:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ task });
	} catch (error) {
		console.error("[v0] Exception updating handover task:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const taskId = searchParams.get("taskId");

		if (!taskId) {
			return NextResponse.json({ error: "Task ID required" }, { status: 400 });
		}

		const { error } = await supabase
			.from("offboarding_handover_tasks")
			.delete()
			.eq("id", taskId);

		if (error) {
			console.error("[v0] Error deleting handover task:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] Exception deleting handover task:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
