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
		const boardId = searchParams.get("boardId");

		if (!boardId) {
			return NextResponse.json(
				{ error: "Board ID is required" },
				{ status: 400 },
			);
		}

		const { data: columns, error } = await supabase
			.from("kanban_columns")
			.select("*")
			.eq("board_id", boardId)
			.order("position", { ascending: true });

		if (error) {
			console.error("[v0] Error fetching columns:", error);
			return NextResponse.json(
				{ error: "Failed to fetch columns", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ columns });
	} catch (error) {
		console.error("[v0] Error in columns GET:", error);
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
		const { boardId, title, position } = body;

		if (!boardId || !title) {
			return NextResponse.json(
				{ error: "Board ID and title are required" },
				{ status: 400 },
			);
		}

		const { data: column, error } = await supabase
			.from("kanban_columns")
			.insert({
				board_id: boardId,
				title,
				position: position ?? 0,
			})
			.select()
			.single();

		if (error) {
			console.error("[v0] Error creating column:", error);
			return NextResponse.json(
				{ error: "Failed to create column", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ column });
	} catch (error) {
		console.error("[v0] Error in columns POST:", error);
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
		const { id, title, position } = body;

		if (!id) {
			return NextResponse.json(
				{ error: "Column ID is required" },
				{ status: 400 },
			);
		}

		const updateData: any = {};
		if (title !== undefined) updateData.title = title;
		if (position !== undefined) updateData.position = position;

		const { data: column, error } = await supabase
			.from("kanban_columns")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[v0] Error updating column:", error);
			return NextResponse.json(
				{ error: "Failed to update column", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ column });
	} catch (error) {
		console.error("[v0] Error in columns PATCH:", error);
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
				{ error: "Column ID is required" },
				{ status: 400 },
			);
		}

		const { error } = await supabase
			.from("kanban_columns")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("[v0] Error deleting column:", error);
			return NextResponse.json(
				{ error: "Failed to delete column", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[v0] Error in columns DELETE:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
