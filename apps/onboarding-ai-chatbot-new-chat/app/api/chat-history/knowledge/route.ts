import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: messages, error } = await supabase
			.from("knowledge_chats")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching knowledge chat history:", error);
			return NextResponse.json(
				{ error: "Failed to fetch chat history" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ messages: messages || [] });
	} catch (error) {
		console.error("Error in knowledge chat history:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const supabase = await createServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { role, content } = await req.json();

		if (!role || !content) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Save message
		const { error } = await supabase.from("knowledge_chats").insert({
			user_id: user.id,
			role,
			content,
		});

		if (error) {
			console.error("Error saving knowledge message:", error);
			return NextResponse.json(
				{ error: "Failed to save message" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in knowledge chat save:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
