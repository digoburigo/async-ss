-- Create candidate documents table
CREATE TABLE IF NOT EXISTS preboarding_candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES preboarding_candidates(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'resume', 'certificate', 'portfolio', 'reference', 'other'
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  -- AI Analysis fields
  ai_analysis TEXT,
  adherence_score DECIMAL(5,2), -- Score from 0 to 100
  analyzed_at TIMESTAMP WITH TIME ZONE,
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate_id ON preboarding_candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_type ON preboarding_candidate_documents(document_type);

-- Enable RLS
ALTER TABLE preboarding_candidate_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view documents"
  ON preboarding_candidate_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create documents"
  ON preboarding_candidate_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
  ON preboarding_candidate_documents
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete documents"
  ON preboarding_candidate_documents
  FOR DELETE
  TO authenticated
  USING (true);
