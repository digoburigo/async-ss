-- Offboarding Tables for Employee Exit Process
-- This script creates tables for managing the offboarding/exit process

-- Create offboarding checklist steps table
CREATE TABLE IF NOT EXISTS offboarding_checklist_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- handover, documentation, administrative, equipment, access
  order_index INTEGER NOT NULL DEFAULT 0,
  requires_admin_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offboarding processes table (for tracking individual employee offboarding)
CREATE TABLE IF NOT EXISTS offboarding_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  initiated_by UUID NOT NULL, -- admin who started the process
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  department TEXT,
  last_working_day DATE,
  reason TEXT, -- resignation, termination, retirement, transfer
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, pending_approval, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create offboarding progress table
CREATE TABLE IF NOT EXISTS offboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES offboarding_processes(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES offboarding_checklist_steps(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID, -- who marked it complete
  admin_approved BOOLEAN DEFAULT false,
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  admin_approved_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(process_id, step_id)
);

-- Create offboarding handover tasks table
CREATE TABLE IF NOT EXISTS offboarding_handover_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES offboarding_processes(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  task_description TEXT,
  assigned_to UUID, -- employee taking over
  assigned_to_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE offboarding_checklist_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_handover_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offboarding_checklist_steps
CREATE POLICY "Anyone can view offboarding steps" ON offboarding_checklist_steps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage offboarding steps" ON offboarding_checklist_steps
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for offboarding_processes
CREATE POLICY "Users can view their own offboarding process" ON offboarding_processes
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR initiated_by = auth.uid());

CREATE POLICY "Users can view all offboarding processes" ON offboarding_processes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create offboarding processes" ON offboarding_processes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update offboarding processes" ON offboarding_processes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete offboarding processes" ON offboarding_processes
  FOR DELETE TO authenticated USING (initiated_by = auth.uid());

-- RLS Policies for offboarding_progress
CREATE POLICY "Users can view offboarding progress" ON offboarding_progress
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create offboarding progress" ON offboarding_progress
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update offboarding progress" ON offboarding_progress
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for offboarding_handover_tasks
CREATE POLICY "Users can view handover tasks" ON offboarding_handover_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage handover tasks" ON offboarding_handover_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default offboarding checklist steps
INSERT INTO offboarding_checklist_steps (title, description, category, order_index, requires_admin_approval) VALUES
-- Handover Category
('Documentar projetos em andamento', 'Liste todos os projetos ativos, seu status atual e próximos passos necessários', 'handover', 1, false),
('Transferir responsabilidades', 'Identifique e comunique quem assumirá cada uma de suas responsabilidades', 'handover', 2, false),
('Treinar substituto', 'Realize sessões de treinamento com a pessoa que assumirá suas funções', 'handover', 3, false),
('Compartilhar senhas e acessos', 'Transfira senhas de sistemas e acessos necessários de forma segura', 'handover', 4, true),

-- Documentation Category
('Atualizar documentação técnica', 'Revise e atualize toda documentação de processos e sistemas', 'documentation', 5, false),
('Criar guia de procedimentos', 'Documente procedimentos específicos do seu cargo que não estão formalizados', 'documentation', 6, false),
('Organizar arquivos digitais', 'Organize e categorize todos os arquivos importantes nas pastas compartilhadas', 'documentation', 7, false),

-- Administrative Category
('Solicitar carta de referência', 'Se desejar, solicite carta de recomendação ao seu gestor', 'administrative', 8, false),
('Assinar documentos de rescisão', 'Complete toda documentação de desligamento com o RH', 'administrative', 9, true),
('Agendar exame demissional', 'Marque e realize o exame médico demissional', 'administrative', 10, false),
('Confirmar pagamentos pendentes', 'Verifique férias, 13º salário e outras verbas rescisórias', 'administrative', 11, true),

-- Equipment Category
('Devolver equipamentos', 'Devolva notebook, celular corporativo e outros equipamentos da empresa', 'equipment', 12, true),
('Limpar dados pessoais', 'Remova todos os dados pessoais dos equipamentos corporativos', 'equipment', 13, false),
('Devolver crachá e chaves', 'Entregue crachá de acesso, chaves e cartões de estacionamento', 'equipment', 14, true),

-- Access Category
('Revogar acessos a sistemas', 'Solicite a remoção de seus acessos a todos os sistemas corporativos', 'access', 15, true),
('Desconectar e-mail corporativo', 'Configure resposta automática e redirecione e-mails importantes', 'access', 16, false),
('Remover acesso a grupos', 'Saia de grupos de comunicação internos (Slack, Teams, WhatsApp)', 'access', 17, false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offboarding_processes_user_id ON offboarding_processes(user_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_processes_status ON offboarding_processes(status);
CREATE INDEX IF NOT EXISTS idx_offboarding_progress_process_id ON offboarding_progress(process_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_handover_tasks_process_id ON offboarding_handover_tasks(process_id);
