import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET single conversation
export async function GET(
	req: Request,
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

		const { data: conversation, error } = await supabase
			.from("knowledge_chat_conversations")
			.select("*")
			.eq("id", id)
			.eq("user_id", user.id)
			.single();

		if (error) {
			console.error("Error fetching conversation:", error);
			return NextResponse.json(
				{ error: "Conversation not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ conversation });
	} catch (error) {
		console.error("Error in get conversation:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH update conversation
export async function PATCH(
	req: Request,
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

		const { title } = await req.json();

		const { data: conversation, error } = await supabase
			.from("knowledge_chat_conversations")
			.update({ title, updated_at: new Date().toISOString() })
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			console.error("Error updating conversation:", error);
			return NextResponse.json(
				{ error: "Failed to update conversation" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ conversation });
	} catch (error) {
		console.error("Error in update conversation:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE conversation
export async function DELETE(
	req: Request,
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

		const { error } = await supabase
			.from("knowledge_chat_conversations")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error deleting conversation:", error);
			return NextResponse.json(
				{ error: "Failed to delete conversation" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in delete conversation:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
