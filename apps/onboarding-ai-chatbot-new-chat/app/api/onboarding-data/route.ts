import { NextResponse } from "next/server";

export async function GET() {
	// This endpoint could be used to fetch data from a database
	// For now, it returns a success response since we're using localStorage
	return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
	// This endpoint could be used to save data to a database
	// For now, it returns a success response since we're using localStorage
	const body = await req.json();
	return NextResponse.json({ success: true, data: body });
}
