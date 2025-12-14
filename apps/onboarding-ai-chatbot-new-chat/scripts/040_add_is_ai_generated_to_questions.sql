-- Add is_ai_generated column to distinguish AI vs custom questions
ALTER TABLE preboarding_candidate_questions 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT true;

-- Update existing questions to be AI generated
UPDATE preboarding_candidate_questions 
SET is_ai_generated = true 
WHERE is_ai_generated IS NULL;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_questions_is_ai_generated 
ON preboarding_candidate_questions(candidate_id, is_ai_generated);
