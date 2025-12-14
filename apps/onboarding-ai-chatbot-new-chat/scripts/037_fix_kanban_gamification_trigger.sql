-- Fix the kanban_cards gamification trigger
-- The trigger is trying to call increment_action_count(uuid, text) but the function now uses trigger context

-- First, drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_kanban_card_created ON kanban_cards;

-- Recreate the increment_action_count function to handle the trigger properly
CREATE OR REPLACE FUNCTION increment_action_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_action_type TEXT;
  current_count INTEGER;
BEGIN
  -- Determine user_id based on the table
  IF TG_TABLE_NAME = 'sales_orders' THEN
    v_user_id := NEW.user_id;
    v_action_type := 'sales';
  ELSIF TG_TABLE_NAME = 'calendar_events' THEN
    v_user_id := NEW.user_id;
    v_action_type := 'events';
  ELSIF TG_TABLE_NAME = 'kanban_cards' THEN
    -- For kanban cards, get the user from the board
    SELECT kb.user_id INTO v_user_id
    FROM kanban_columns kc
    JOIN kanban_boards kb ON kc.board_id = kb.id
    WHERE kc.id = NEW.column_id;
    v_action_type := 'kanban_tasks';
  ELSIF TG_TABLE_NAME = 'onboarding_progress' THEN
    v_user_id := NEW.user_id;
    v_action_type := 'onboarding';
  ELSE
    RETURN NEW;
  END IF;

  -- Skip if no user found
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update or insert the action count
  INSERT INTO user_action_counts (user_id, action_type, count)
  VALUES (v_user_id, v_action_type, 1)
  ON CONFLICT (user_id, action_type)
  DO UPDATE SET 
    count = user_action_counts.count + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_action_count() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_action_count() TO service_role;

-- Create the trigger for kanban cards
CREATE TRIGGER on_kanban_card_created
  AFTER INSERT ON kanban_cards
  FOR EACH ROW
  EXECUTE FUNCTION increment_action_count();

-- Also ensure triggers exist for other tables
DROP TRIGGER IF EXISTS on_sales_order_created ON sales_orders;
CREATE TRIGGER on_sales_order_created
  AFTER INSERT ON sales_orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_action_count();

DROP TRIGGER IF EXISTS on_calendar_event_created ON calendar_events;
CREATE TRIGGER on_calendar_event_created
  AFTER INSERT ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION increment_action_count();

DROP TRIGGER IF EXISTS on_onboarding_progress_created ON onboarding_progress;
CREATE TRIGGER on_onboarding_progress_created
  AFTER INSERT ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION increment_action_count();
