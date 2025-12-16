import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("meeting_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching meetings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Error in meetings GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { create_calendar_event, ...meetingData } = body;

    // Create the meeting
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        ...meetingData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (create_calendar_event && meeting) {
      const meetingDate = new Date(meeting.meeting_date);
      const endDate = new Date(
        meetingDate.getTime() + (meeting.duration_minutes || 60) * 60_000
      );

      const calendarEventData: Record<string, unknown> = {
        user_id: user.id,
        meeting_id: meeting.id,
        title: `📅 ${meeting.title}`,
        description: meeting.description || `Reunião: ${meeting.title}`,
        start_time: meetingDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: false,
        color: "#8b5cf6", // Purple for meetings
      };

      // Add rrule if meeting has recurrence
      if (meeting.rrule) {
        calendarEventData.rrule = meeting.rrule;
      }

      const { error: calendarError } = await supabase
        .from("calendar_events")
        .insert(calendarEventData);

      if (calendarError) {
        console.error("Error creating calendar event:", calendarError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error in meetings POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
