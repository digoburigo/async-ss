-- Seed offboarding checklist steps if table is empty
-- This ensures the offboarding process has steps to track

-- First, clear any existing steps to avoid duplicates
DELETE FROM offboarding_checklist_steps;

-- Insert default offboarding steps by category
INSERT INTO offboarding_checklist_steps (id, category, title, description, order_index, requires_admin_approval) VALUES
-- Transferência (Handover)
(gen_random_uuid(), 'handover', 'Documentar projetos em andamento', 'Criar documentação detalhada de todos os projetos ativos', 1, false),
(gen_random_uuid(), 'handover', 'Transferir responsabilidades', 'Definir e comunicar novo responsável para cada projeto/tarefa', 2, false),
(gen_random_uuid(), 'handover', 'Treinar substituto', 'Realizar treinamento com o funcionário que assumirá as funções', 3, false),
(gen_random_uuid(), 'handover', 'Entregar senhas e acessos', 'Compartilhar credenciais necessárias com responsáveis', 4, true),

-- Documentação
(gen_random_uuid(), 'documentation', 'Atualizar manuais e procedimentos', 'Revisar e atualizar toda documentação de processos', 5, false),
(gen_random_uuid(), 'documentation', 'Criar relatório de status', 'Documentar status atual de todas as atividades', 6, false),
(gen_random_uuid(), 'documentation', 'Arquivar documentos pessoais', 'Organizar e entregar documentos ao RH', 7, false),

-- Administrativo
(gen_random_uuid(), 'administrative', 'Assinar termo de rescisão', 'Assinar documentos de desligamento junto ao RH', 8, true),
(gen_random_uuid(), 'administrative', 'Realizar entrevista de desligamento', 'Participar da entrevista de feedback com RH', 9, false),
(gen_random_uuid(), 'administrative', 'Confirmar dados bancários', 'Verificar dados para pagamento de rescisão', 10, false),
(gen_random_uuid(), 'administrative', 'Entregar crachá e chaves', 'Devolver itens de identificação e acesso físico', 11, false),

-- Equipamentos
(gen_random_uuid(), 'equipment', 'Devolver notebook/computador', 'Entregar equipamento de trabalho ao TI', 12, true),
(gen_random_uuid(), 'equipment', 'Devolver celular corporativo', 'Entregar aparelho e acessórios', 13, false),
(gen_random_uuid(), 'equipment', 'Devolver outros equipamentos', 'Entregar headsets, monitores, teclados, etc.', 14, false),

-- Acessos
(gen_random_uuid(), 'access', 'Revogar acesso ao e-mail', 'Solicitar desativação da conta de e-mail corporativo', 15, true),
(gen_random_uuid(), 'access', 'Revogar acesso aos sistemas', 'Remover acessos a ERPs, CRMs e outros sistemas', 16, true),
(gen_random_uuid(), 'access', 'Remover de grupos e canais', 'Sair de grupos de comunicação (Slack, Teams, etc.)', 17, false);

-- Verify insertion
SELECT category, COUNT(*) as count FROM offboarding_checklist_steps GROUP BY category ORDER BY category;
