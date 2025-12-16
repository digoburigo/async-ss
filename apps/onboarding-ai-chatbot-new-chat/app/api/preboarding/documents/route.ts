import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidate_id");

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidate_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("preboarding_candidate_documents")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const candidateId = formData.get("candidate_id") as string;
    const documentType = formData.get("document_type") as string;
    const title = formData.get("title") as string;

    if (!(file && candidateId && documentType && title)) {
      return NextResponse.json(
        { error: "file, candidate_id, document_type, and title are required" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(
      `preboarding/documents/${candidateId}/${file.name}`,
      file,
      {
        access: "public",
      }
    );

    // Save document record to database
    const { data, error } = await supabase
      .from("preboarding_candidate_documents")
      .insert({
        candidate_id: candidateId,
        document_type: documentType,
        title,
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
