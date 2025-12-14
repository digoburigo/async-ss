import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all achievements with user's progress
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('milestone_count', { ascending: true })

    if (achievementsError) {
      console.error("[v0] Error fetching achievements:", achievementsError)
      return NextResponse.json(
        { error: "Failed to fetch achievements" },
        { status: 500 }
      )
    }

    // Get user's earned achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id)

    if (userAchievementsError) {
      console.error("[v0] Error fetching user achievements:", userAchievementsError)
    }

    // Get user's action counts
    const { data: actionCounts, error: actionCountsError } = await supabase
      .from('user_action_counts')
      .select('action_type, count')
      .eq('user_id', user.id)

    if (actionCountsError) {
      console.error("[v0] Error fetching action counts:", actionCountsError)
    }

    // Map action counts for easy lookup
    const countsMap = (actionCounts || []).reduce((acc, item) => {
      acc[item.action_type] = item.count
      return acc
    }, {} as Record<string, number>)

    // Map earned achievements for easy lookup
    const earnedMap = (userAchievements || []).reduce((acc, item) => {
      acc[item.achievement_id] = item.earned_at
      return acc
    }, {} as Record<string, string>)

    // Combine data
    const achievementsWithProgress = achievements.map(achievement => ({
      ...achievement,
      earned: !!earnedMap[achievement.id],
      earned_at: earnedMap[achievement.id] || null,
      current_count: countsMap[achievement.milestone_type] || 0,
      progress_percentage: Math.min(
        ((countsMap[achievement.milestone_type] || 0) / achievement.milestone_count) * 100,
        100
      )
    }))

    return NextResponse.json(achievementsWithProgress)
  } catch (error) {
    console.error("[v0] Achievements API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
