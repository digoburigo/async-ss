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
    const candidateId = searchParams.get("candidate_id");

    let query = supabase
      .from("preboarding_interviews")
      .select("*, candidate:preboarding_candidates(id, name, email, position)")
      .order("scheduled_at", { ascending: true });

    if (candidateId) {
      query = query.eq("candidate_id", candidateId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching interviews:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Error in interviews GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
    const {
      candidate_id,
      scheduled_at,
      duration_minutes = 60,
      interview_type,
      interviewer_name,
      interviewer_email,
      location,
      meeting_link,
      notes,
      create_calendar_event = true,
    } = body;

    if (!(candidate_id && scheduled_at && interview_type)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the interview
    const { data: interview, error } = await supabase
      .from("preboarding_interviews")
      .insert({
        candidate_id,
        scheduled_at,
        duration_minutes,
        interview_type,
        interviewer_name,
        interviewer_email,
        location,
        meeting_link,
        notes,
        status: "scheduled",
      })
      .select("*, candidate:preboarding_candidates(id, name, email, position)")
      .single();

    if (error) {
      console.error("[v0] Error creating interview:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create calendar event if requested
    if (create_calendar_event && interview) {
      const startTime = new Date(scheduled_at);
      const endTime = new Date(
        startTime.getTime() + duration_minutes * 60 * 1000
      );

      const interviewTypeLabels: Record<string, string> = {
        phone: "Entrevista por Telefone",
        video: "Entrevista por Vídeo",
        in_person: "Entrevista Presencial",
        technical: "Entrevista Técnica",
        hr: "Entrevista RH",
        final: "Entrevista Final",
      };

      const candidateName = interview.candidate?.name || "Candidato";
      const eventTitle = `${interviewTypeLabels[interview_type] || "Entrevista"} - ${candidateName}`;

      await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: eventTitle,
        description: `Entrevista com ${candidateName}\n${interview.candidate?.position || ""}\n\nEntrevistador: ${interviewer_name || "Não definido"}\n${location ? `Local: ${location}` : ""}${meeting_link ? `\nLink: ${meeting_link}` : ""}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        all_day: false,
        color: "#8b5cf6", // Purple for interviews
      });
    }

    // Create activity log
    await supabase.from("preboarding_activities").insert({
      candidate_id,
      activity_type: "interview",
      title: "Entrevista agendada",
      description: `${interview_type} agendada para ${new Date(scheduled_at).toLocaleString("pt-BR")}`,
      created_by: user.id,
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error("[v0] Error in interviews POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
