-- Fix the onboarding progress tracking trigger that's causing "missing FROM-clause entry for table ocp" error
-- The bug occurs when the trigger tries to check if all onboarding steps are completed

-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_track_onboarding_progress ON onboarding_checklist_progress;

-- Drop and recreate the function with fixed SQL (no invalid table aliases)
CREATE OR REPLACE FUNCTION track_onboarding_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_steps INTEGER;
  completed_steps INTEGER;
  v_user_id UUID;
BEGIN
  -- Get the user_id from the record
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Only proceed if this is a completion event (setting completed = true)
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false)) THEN
    
    -- Get total number of onboarding steps for any employee type
    SELECT COUNT(*) INTO total_steps
    FROM onboarding_checklist_steps;
    
    -- Get number of completed steps for this user
    SELECT COUNT(*) INTO completed_steps
    FROM onboarding_checklist_progress
    WHERE user_id = v_user_id
      AND completed = true;
    
    -- If all steps are completed, increment the onboarding_complete action
    IF completed_steps >= total_steps AND total_steps > 0 THEN
      -- Insert or update the action count
      INSERT INTO user_action_counts (user_id, action_type, count, last_action_at)
      VALUES (v_user_id, 'onboarding_complete', 1, NOW())
      ON CONFLICT (user_id, action_type) 
      DO UPDATE SET 
        count = user_action_counts.count + 1,
        last_action_at = NOW(),
        updated_at = NOW();
      
      -- Check if user reached 5 completions for achievement
      PERFORM check_and_award_achievement(v_user_id, 'onboarding_complete');
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the simplified achievement check function if it doesn't exist
CREATE OR REPLACE FUNCTION check_and_award_achievement(p_user_id UUID, p_action_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_achievement_id UUID;
  v_points INTEGER;
BEGIN
  -- Get current count for this action type
  SELECT count INTO v_count
  FROM user_action_counts
  WHERE user_id = p_user_id AND action_type = p_action_type;
  
  -- Check if there's an achievement for this milestone
  SELECT id, points INTO v_achievement_id, v_points
  FROM achievements
  WHERE milestone_type = p_action_type
    AND milestone_count <= COALESCE(v_count, 0)
    AND id NOT IN (
      SELECT achievement_id FROM user_achievements WHERE user_id = p_user_id
    )
  ORDER BY milestone_count DESC
  LIMIT 1;
  
  -- If achievement found and not already earned, award it
  IF v_achievement_id IS NOT NULL THEN
    -- Insert achievement
    INSERT INTO user_achievements (user_id, achievement_id, earned_at)
    VALUES (p_user_id, v_achievement_id, NOW())
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Update user score
    INSERT INTO user_scores (user_id, total_points)
    VALUES (p_user_id, v_points)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = user_scores.total_points + v_points,
      updated_at = NOW();
  END IF;
END;
$$;

-- Recreate the trigger with the fixed function
CREATE TRIGGER trigger_track_onboarding_progress
  AFTER INSERT OR UPDATE ON onboarding_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION track_onboarding_completion();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION track_onboarding_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_achievement(UUID, TEXT) TO authenticated;
