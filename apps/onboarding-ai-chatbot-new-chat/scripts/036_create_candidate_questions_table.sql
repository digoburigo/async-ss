-- Create table for candidate interview questions
CREATE TABLE IF NOT EXISTS preboarding_candidate_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES preboarding_candidates(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('hard_skills', 'soft_skills')),
  question TEXT NOT NULL,
  expected_answer TEXT,
  answer TEXT,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_candidate_questions_candidate_id ON preboarding_candidate_questions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_questions_type ON preboarding_candidate_questions(question_type);

-- Enable RLS
ALTER TABLE preboarding_candidate_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view questions"
  ON preboarding_candidate_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create questions"
  ON preboarding_candidate_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update questions"
  ON preboarding_candidate_questions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete questions"
  ON preboarding_candidate_questions FOR DELETE
  TO authenticated
  USING (true);
