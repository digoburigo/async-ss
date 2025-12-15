import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: board, error } = await supabase
			.from("kanban_boards")
			.select("*")
			.eq("id", id)
			.eq("user_id", user.id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Board not found" }, { status: 404 });
			}
			console.error("Error fetching board:", error);
			return NextResponse.json(
				{ error: "Failed to fetch board", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ board });
	} catch (error) {
		console.error("Error in board GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// First, get all columns for this board
		const { data: columns } = await supabase
			.from("kanban_columns")
			.select("id")
			.eq("board_id", id);

		if (columns && columns.length > 0) {
			const columnIds = columns.map((c) => c.id);

			// Delete all cards in these columns
			await supabase.from("kanban_cards").delete().in("column_id", columnIds);

			// Delete all columns
			await supabase.from("kanban_columns").delete().eq("board_id", id);
		}

		// Delete the board
		const { error } = await supabase
			.from("kanban_boards")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error deleting board:", error);
			return NextResponse.json(
				{ error: "Failed to delete board", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in board DELETE:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { title, description } = body;

		const { data: board, error } = await supabase
			.from("kanban_boards")
			.update({
				title,
				description,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			console.error("Error updating board:", error);
			return NextResponse.json(
				{ error: "Failed to update board", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ board });
	} catch (error) {
		console.error("Error in board PATCH:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
