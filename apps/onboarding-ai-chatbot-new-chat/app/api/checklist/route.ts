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
    const employeeType = searchParams.get("employeeType");

    if (!employeeType) {
      return NextResponse.json(
        { error: "Missing employee type" },
        { status: 400 }
      );
    }

    console.log(
      "[v0] Loading checklist for user:",
      user.id,
      "type:",
      employeeType
    );

    // Get checklist steps for the employee type
    const { data: steps, error: stepsError } = await supabase
      .from("onboarding_checklist_steps")
      .select("*")
      .eq("employee_type", employeeType)
      .order("order_index", { ascending: true });

    if (stepsError) {
      console.error("[v0] Error fetching steps:", stepsError);
      return NextResponse.json(
        { error: "Failed to fetch checklist steps" },
        { status: 500 }
      );
    }

    console.log("[v0] Found", steps?.length || 0, "checklist steps");

    // Get user's progress
    const { data: progress, error: progressError } = await supabase
      .from("onboarding_checklist_progress")
      .select("*")
      .eq("user_id", user.id);

    if (progressError) {
      console.error("[v0] Error fetching progress:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    console.log("[v0] Found", progress?.length || 0, "progress records");

    // Combine steps with progress
    const stepsWithProgress = steps.map((step) => {
      const stepProgress = progress?.find((p) => p.step_id === step.id);
      return {
        ...step,
        completed: stepProgress?.completed,
        completed_at: stepProgress?.completed_at || null,
      };
    });

    return NextResponse.json({ steps: stepsWithProgress });
  } catch (error) {
    console.error("[v0] Error in checklist GET:", error);
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
    const { stepId, completed } = body;

    if (!stepId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(
      "[v0] Updating progress for user:",
      user.id,
      "step:",
      stepId,
      "completed:",
      completed
    );

    try {
      const { data, error } = await supabase
        .from("onboarding_checklist_progress")
        .upsert(
          {
            user_id: user.id,
            step_id: stepId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          {
            onConflict: "user_id,step_id",
          }
        )
        .select()
        .single();

      if (error) {
        if (error.code === "23502" && error.message?.includes("session_id")) {
          console.log(
            "[v0] Retrying with session_id for backward compatibility"
          );

          const { data: retryData, error: retryError } = await supabase
            .from("onboarding_checklist_progress")
            .upsert(
              {
                user_id: user.id,
                session_id: user.id, // Use user_id as session_id for backward compatibility
                step_id: stepId,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
              },
              {
                onConflict: "session_id,step_id", // Use old constraint for non-migrated databases
              }
            )
            .select()
            .single();

          if (retryError) {
            console.error("[v0] Retry error:", retryError);
            return NextResponse.json(
              {
                error: "Failed to update progress",
                details: retryError.message,
                hint: "Consider running migration script 007_fix_checklist_constraint.sql",
              },
              { status: 500 }
            );
          }

          console.log(
            "[v0] Progress updated successfully (backward compatibility mode)"
          );
          return NextResponse.json({ success: true, data: retryData });
        }

        if (error.code === "42P10") {
          return NextResponse.json(
            {
              error: "Database constraint missing",
              details:
                "Please run the migration script 007_fix_checklist_constraint.sql to add the required unique constraint.",
              technicalError: error.message,
            },
            { status: 500 }
          );
        }

        console.error("[v0] Error updating progress:", error);
        return NextResponse.json(
          { error: "Failed to update progress", details: error.message },
          { status: 500 }
        );
      }

      console.log("[v0] Progress updated successfully");
      return NextResponse.json({ success: true, data });
    } catch (upsertError) {
      console.error("[v0] Upsert error:", upsertError);
      throw upsertError;
    }
  } catch (error) {
    console.error("[v0] Error in checklist POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
