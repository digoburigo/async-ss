-- Add rrule column to meetings table for recurrence support
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS rrule text;

-- Add meeting_id column to calendar_events to link meetings with calendar events
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE;

-- Add rrule column to calendar_events for standalone recurring events
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS rrule text;

-- Create index for better performance when querying by meeting_id
CREATE INDEX IF NOT EXISTS idx_calendar_events_meeting_id ON calendar_events(meeting_id);
