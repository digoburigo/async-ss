import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const columnId = searchParams.get("columnId");
		const boardId = searchParams.get("boardId");

		let query = supabase
			.from("kanban_cards")
			.select("*")
			.order("position", { ascending: true });

		if (columnId) {
			query = query.eq("column_id", columnId);
		} else if (boardId) {
			// Get all cards for a board
			const { data: columns } = await supabase
				.from("kanban_columns")
				.select("id")
				.eq("board_id", boardId);

			if (columns && columns.length > 0) {
				const columnIds = columns.map((col) => col.id);
				query = query.in("column_id", columnIds);
			}
		}

		const { data: cards, error } = await query;

		if (error) {
			console.error("[v0] Error fetching cards:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cards", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ cards });
	} catch (error) {
		console.error("[v0] Error in cards GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { columnId, title, description, color, dueDate, position } = body;

		if (!columnId || !title) {
			return NextResponse.json(
				{ error: "Column ID and title are required" },
				{ status: 400 },
			);
		}

		const { data: card, error } = await supabase
			.from("kanban_cards")
			.insert({
				column_id: columnId,
				title,
				description,
				color: color || "#3b82f6",
				due_date: dueDate,
				position: position ?? 0,
			})
			.select()
			.single();

		if (error) {
			console.error("[v0] Error creating card:", error);
			return NextResponse.json(
				{ error: "Failed to create card", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ card });
	} catch (error) {
		console.error("[v0] Error in cards POST:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { id, columnId, title, description, color, dueDate, position } = body;

		if (!id) {
			return NextResponse.json(
				{ error: "Card ID is required" },
				{ status: 400 },
			);
		}

		const updateData: any = {};
		if (columnId !== undefined) updateData.column_id = columnId;
		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (color !== undefined) updateData.color = color;
		if (dueDate !== undefined) updateData.due_date = dueDate;
		if (position !== undefined) updateData.position = position;

		const { data: card, error } = await supabase
			.from("kanban_cards")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[v0] Error updating card:", error);
			return NextResponse.json(
				{ error: "Failed to update card", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ card });
	} catch (error) {
		console.error("[v0] Error in cards PATCH:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Card ID is required" },
				{ status: 400 },
			);
		}

		const { error } = await supabase.from("kanban_cards").delete().eq("id", id);

		if (error) {
			console.error("[v0] Error deleting card:", error);
			return NextResponse.json(
				{ error: "Failed to delete card", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] Error in cards DELETE:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
