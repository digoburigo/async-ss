-- Create job positions table for preboarding
CREATE TABLE IF NOT EXISTS preboarding_job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  location TEXT,
  work_model TEXT DEFAULT 'presencial', -- presencial, remoto, hibrido
  employment_type TEXT DEFAULT 'clt', -- clt, pj, estagio, temporario
  salary_min NUMERIC,
  salary_max NUMERIC,
  vacancies INTEGER DEFAULT 1,
  filled_vacancies INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'normal', -- baixa, normal, alta, urgente
  status TEXT DEFAULT 'aberta', -- aberta, pausada, fechada, cancelada
  hiring_manager TEXT,
  hiring_manager_email TEXT,
  deadline DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add job_position_id to preboarding_candidates table
ALTER TABLE preboarding_candidates 
ADD COLUMN IF NOT EXISTS job_position_id UUID REFERENCES preboarding_job_positions(id);

-- Enable RLS
ALTER TABLE preboarding_job_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view job positions"
  ON preboarding_job_positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create job positions"
  ON preboarding_job_positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job positions"
  ON preboarding_job_positions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete job positions"
  ON preboarding_job_positions FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_job_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_positions_updated_at
  BEFORE UPDATE ON preboarding_job_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_job_positions_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_positions_status ON preboarding_job_positions(status);
CREATE INDEX IF NOT EXISTS idx_candidates_job_position ON preboarding_candidates(job_position_id);
