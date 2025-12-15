import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const audioFile = formData.get("audio") as File;

		if (!audioFile) {
			return NextResponse.json(
				{ error: "No audio file provided" },
				{ status: 400 },
			);
		}

		// Convert audio file to base64
		const arrayBuffer = await audioFile.arrayBuffer();
		const base64Audio = Buffer.from(arrayBuffer).toString("base64");

		// Use OpenAI's Whisper model via the AI Gateway for transcription
		const { text } = await generateText({
			model: "openai/whisper-1",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "file",
							data: base64Audio,
							mediaType: audioFile.type || "audio/webm",
						},
					],
				},
			],
		});

		return NextResponse.json({ transcript: text });
	} catch (error) {
		console.error("[v0] Error transcribing audio:", error);
		return NextResponse.json(
			{ error: "Failed to transcribe audio" },
			{ status: 500 },
		);
	}
}
