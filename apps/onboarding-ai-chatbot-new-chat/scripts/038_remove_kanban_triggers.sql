-- Script to completely remove problematic gamification triggers from kanban_cards
-- This is a simpler solution that just removes the trigger without recreating complex gamification logic

-- Drop any triggers on kanban_cards table
DROP TRIGGER IF EXISTS on_kanban_card_created ON kanban_cards;
DROP TRIGGER IF EXISTS on_kanban_card_insert ON kanban_cards;
DROP TRIGGER IF EXISTS on_kanban_card_update ON kanban_cards;
DROP TRIGGER IF EXISTS track_kanban_gamification_trigger ON kanban_cards;
DROP TRIGGER IF EXISTS kanban_gamification_trigger ON kanban_cards;

-- Drop the problematic function if it exists with wrong signature
DROP FUNCTION IF EXISTS increment_action_count(uuid, text);
DROP FUNCTION IF EXISTS increment_action_count(uuid, unknown);
DROP FUNCTION IF EXISTS track_kanban_gamification();

-- Create a simple no-op trigger function for future use if needed
CREATE OR REPLACE FUNCTION track_kanban_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple logging, no gamification dependency
  -- This can be enhanced later if gamification is needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify no triggers remain on kanban_cards
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'kanban_cards'::regclass;
