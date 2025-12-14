-- Preboarding CRM Tables
-- Tables for managing hiring candidates before onboarding

-- Table for candidate stages/pipeline
CREATE TABLE IF NOT EXISTS preboarding_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for candidates
CREATE TABLE IF NOT EXISTS preboarding_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT,
  stage_id UUID REFERENCES preboarding_stages(id) ON DELETE SET NULL,
  source TEXT, -- Where the candidate came from (LinkedIn, Referral, etc.)
  resume_url TEXT,
  expected_salary NUMERIC,
  expected_start_date DATE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hired', 'rejected', 'withdrawn')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for candidate activities/history
CREATE TABLE IF NOT EXISTS preboarding_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES preboarding_candidates(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'stage_change', 'interview', 'email', 'call', 'document', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for interview scheduling
CREATE TABLE IF NOT EXISTS preboarding_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES preboarding_candidates(id) ON DELETE CASCADE,
  interviewer_name TEXT NOT NULL,
  interviewer_email TEXT,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical', 'behavioral')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE preboarding_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE preboarding_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE preboarding_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE preboarding_interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preboarding_stages
CREATE POLICY "Anyone can view stages" ON preboarding_stages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage stages" ON preboarding_stages FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for preboarding_candidates
CREATE POLICY "Authenticated users can view candidates" ON preboarding_candidates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create candidates" ON preboarding_candidates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update candidates" ON preboarding_candidates FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete candidates" ON preboarding_candidates FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for preboarding_activities
CREATE POLICY "Authenticated users can view activities" ON preboarding_activities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create activities" ON preboarding_activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete activities" ON preboarding_activities FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for preboarding_interviews
CREATE POLICY "Authenticated users can view interviews" ON preboarding_interviews FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create interviews" ON preboarding_interviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update interviews" ON preboarding_interviews FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete interviews" ON preboarding_interviews FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert default stages
INSERT INTO preboarding_stages (name, description, color, order_index) VALUES
  ('Novo', 'Candidatos recém adicionados ao sistema', '#6366f1', 0),
  ('Triagem', 'Análise inicial do currículo', '#f59e0b', 1),
  ('Entrevista RH', 'Entrevista com o departamento de RH', '#3b82f6', 2),
  ('Entrevista Técnica', 'Avaliação técnica com a equipe', '#8b5cf6', 3),
  ('Entrevista Final', 'Entrevista com gestores', '#ec4899', 4),
  ('Proposta', 'Proposta enviada ao candidato', '#10b981', 5),
  ('Contratado', 'Candidato aceito e contratado', '#22c55e', 6)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_preboarding_candidates_stage ON preboarding_candidates(stage_id);
CREATE INDEX IF NOT EXISTS idx_preboarding_candidates_status ON preboarding_candidates(status);
CREATE INDEX IF NOT EXISTS idx_preboarding_activities_candidate ON preboarding_activities(candidate_id);
CREATE INDEX IF NOT EXISTS idx_preboarding_interviews_candidate ON preboarding_interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_preboarding_interviews_scheduled ON preboarding_interviews(scheduled_at);
