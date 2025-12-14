-- Create career landing pages table
CREATE TABLE IF NOT EXISTS career_landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  company_name VARCHAR(255) DEFAULT 'Nossa Empresa',
  company_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create career applications table
CREATE TABLE IF NOT EXISTS career_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID REFERENCES career_landing_pages(id) ON DELETE CASCADE,
  job_position_id UUID REFERENCES job_positions(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url TEXT,
  resume_filename VARCHAR(255),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_career_landing_pages_slug ON career_landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_career_landing_pages_active ON career_landing_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_career_applications_landing_page ON career_applications(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_job ON career_applications(job_position_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);

-- Enable RLS
ALTER TABLE career_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for career_landing_pages
-- Anyone can read active landing pages (for public access)
CREATE POLICY "Anyone can view active landing pages" ON career_landing_pages
  FOR SELECT USING (is_active = true);

-- Authenticated users can manage landing pages
CREATE POLICY "Authenticated users can manage landing pages" ON career_landing_pages
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS policies for career_applications
-- Anyone can insert applications (public form submission)
CREATE POLICY "Anyone can submit applications" ON career_applications
  FOR INSERT WITH CHECK (true);

-- Authenticated users can view and manage applications
CREATE POLICY "Authenticated users can manage applications" ON career_applications
  FOR ALL USING (auth.role() = 'authenticated');
