import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function expandRecurringEvents(
  events: any[],
  rangeStart: Date,
  rangeEnd: Date
): any[] {
  const expandedEvents: any[] = [];

  for (const event of events) {
    if (!event.rrule) {
      // Non-recurring event, just add it if within range
      expandedEvents.push(event);
      continue;
    }

    // Parse the rrule
    const rruleParts = event.rrule
      .split(";")
      .reduce((acc: Record<string, string>, part: string) => {
        const [key, value] = part.split("=");
        if (key && value) acc[key] = value;
        return acc;
      }, {});

    const freq = rruleParts["FREQ"];
    const count = Number.parseInt(rruleParts["COUNT"] || "52", 10); // Default to 52 occurrences
    const byDay = rruleParts["BYDAY"]?.split(",") || [];

    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    const duration = eventEnd.getTime() - eventStart.getTime();

    let currentDate = new Date(eventStart);
    let occurrences = 0;

    // Generate occurrences
    while (occurrences < count && currentDate <= rangeEnd) {
      // Check if this occurrence is within range
      if (currentDate >= rangeStart && currentDate <= rangeEnd) {
        // For BYDAY rules, check if current day matches
        if (byDay.length > 0) {
          const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
          const currentDayName = dayNames[currentDate.getDay()];
          if (!byDay.includes(currentDayName)) {
            // Move to next day
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
            continue;
          }
        }

        const occurrenceEnd = new Date(currentDate.getTime() + duration);
        expandedEvents.push({
          ...event,
          id: `${event.id}_${occurrences}`,
          original_id: event.id,
          start_time: currentDate.toISOString(),
          end_time: occurrenceEnd.toISOString(),
          is_recurring_instance: true,
        });
        occurrences++;
      }

      // Move to next occurrence based on frequency
      switch (freq) {
        case "DAILY":
          currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "WEEKLY":
          if (byDay.length > 0) {
            // Move to next day for BYDAY rules
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
          } else {
            currentDate = new Date(
              currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
            );
          }
          break;
        case "MONTHLY":
          currentDate = new Date(
            currentDate.setMonth(currentDate.getMonth() + 1)
          );
          break;
        case "YEARLY":
          currentDate = new Date(
            currentDate.setFullYear(currentDate.getFullYear() + 1)
          );
          break;
        default:
          currentDate = new Date(
            currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
          );
      }
    }
  }

  return expandedEvents;
}

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
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const expandRecurring = searchParams.get("expand") !== "false";

    let query = supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_time", { ascending: true });

    // For recurring events, we need to fetch from the original start date
    // and then expand them in memory
    if (startDate && !expandRecurring) {
      query = query.gte("start_time", startDate);
    }
    if (endDate && !expandRecurring) {
      query = query.lte("end_time", endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events", details: error.message },
        { status: 500 }
      );
    }

    let processedEvents = events || [];
    if (expandRecurring && startDate && endDate) {
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      processedEvents = expandRecurringEvents(
        events || [],
        rangeStart,
        rangeEnd
      );
    }

    return NextResponse.json({ events: processedEvents });
  } catch (error) {
    console.error("Error in calendar GET:", error);
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
    const { title, description, start_time, end_time, all_day, color, rrule } =
      body;

    if (!(title && start_time && end_time)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: user.id,
        title,
        description,
        start_time,
        end_time,
        all_day,
        color: color || "#3b82f6",
        rrule: rrule || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json(
        { error: "Failed to create event", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error in calendar POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
    const {
      id,
      title,
      description,
      start_time,
      end_time,
      all_day,
      color,
      rrule,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (all_day !== undefined) updateData.all_day = all_day;
    if (color !== undefined) updateData.color = color;
    if (rrule !== undefined) updateData.rrule = rrule;

    const { data: event, error } = await supabase
      .from("calendar_events")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return NextResponse.json(
        { error: "Failed to update event", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error in calendar PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[v0] Error deleting event:", error);
      return NextResponse.json(
        { error: "Failed to delete event", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error in calendar DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
