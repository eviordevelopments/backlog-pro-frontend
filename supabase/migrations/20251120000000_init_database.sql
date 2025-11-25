-- Backlog Pro - Complete Database Schema with Authentication
-- Safe to run multiple times - includes cleanup

-- ============================================================================
-- CLEANUP
-- ============================================================================

DROP TABLE IF EXISTS public.devops_metrics CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.finances CASCADE;
DROP TABLE IF EXISTS public.profit_sharing CASCADE;
DROP TABLE IF EXISTS public.risks CASCADE;
DROP TABLE IF EXISTS public.acceptance_criteria CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.user_stories CASCADE;
DROP TABLE IF EXISTS public.sprints CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Developer' CHECK (role IN ('Product Owner', 'Scrum Master', 'Developer', 'DevOps')),
  avatar TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability INTEGER DEFAULT 100 CHECK (availability >= 0 AND availability <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (true);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#5b7cfc',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete their projects" ON public.projects FOR DELETE USING (true);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TEAM_MEMBERS TABLE
-- ============================================================================

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Users can manage team members" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update team members" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Users can delete team members" ON public.team_members FOR DELETE USING (true);

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SPRINTS TABLE
-- ============================================================================

CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  velocity INTEGER DEFAULT 0,
  committed_points INTEGER DEFAULT 0,
  completed_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprints are viewable by everyone" ON public.sprints FOR SELECT USING (true);
CREATE POLICY "Users can manage sprints" ON public.sprints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sprints" ON public.sprints FOR UPDATE USING (true);
CREATE POLICY "Users can delete sprints" ON public.sprints FOR DELETE USING (true);

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- USER_STORIES TABLE
-- ============================================================================

CREATE TABLE public.user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  benefit TEXT NOT NULL,
  description TEXT,
  story_points INTEGER DEFAULT 0,
  business_value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User stories are viewable by everyone" ON public.user_stories FOR SELECT USING (true);
CREATE POLICY "Users can manage user stories" ON public.user_stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update user stories" ON public.user_stories FOR UPDATE USING (true);
CREATE POLICY "Users can delete user stories" ON public.user_stories FOR DELETE USING (true);

CREATE TRIGGER update_user_stories_updated_at BEFORE UPDATE ON public.user_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ACCEPTANCE_CRITERIA TABLE
-- ============================================================================

CREATE TABLE public.acceptance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_story_id UUID NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceptance criteria are viewable by everyone" ON public.acceptance_criteria FOR SELECT USING (true);
CREATE POLICY "Users can manage acceptance criteria" ON public.acceptance_criteria FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update acceptance criteria" ON public.acceptance_criteria FOR UPDATE USING (true);
CREATE POLICY "Users can delete acceptance criteria" ON public.acceptance_criteria FOR DELETE USING (true);

CREATE TRIGGER update_acceptance_criteria_updated_at BEFORE UPDATE ON public.acceptance_criteria FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  user_story_id UUID REFERENCES public.user_stories(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  story_points INTEGER DEFAULT 0,
  assigned_to TEXT,
  estimated_date DATE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can manage tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RISKS TABLE
-- ============================================================================

CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  probability INTEGER CHECK (probability >= 1 AND probability <= 5),
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  mitigation TEXT,
  owner TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Risks are viewable by everyone" ON public.risks FOR SELECT USING (true);
CREATE POLICY "Users can manage risks" ON public.risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update risks" ON public.risks FOR UPDATE USING (true);
CREATE POLICY "Users can delete risks" ON public.risks FOR DELETE USING (true);

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PROFIT_SHARING TABLE
-- ============================================================================

CREATE TABLE public.profit_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, team_member_id)
);

ALTER TABLE public.profit_sharing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profit sharing is viewable by everyone" ON public.profit_sharing FOR SELECT USING (true);
CREATE POLICY "Users can manage profit sharing" ON public.profit_sharing FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update profit sharing" ON public.profit_sharing FOR UPDATE USING (true);
CREATE POLICY "Users can delete profit sharing" ON public.profit_sharing FOR DELETE USING (true);

CREATE TRIGGER update_profit_sharing_updated_at BEFORE UPDATE ON public.profit_sharing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FINANCES TABLE
-- ============================================================================

CREATE TABLE public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  revenue DECIMAL(12, 2) DEFAULT 0,
  expenses DECIMAL(12, 2) DEFAULT 0,
  profit DECIMAL(12, 2) GENERATED ALWAYS AS (revenue - expenses) STORED,
  month DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, month)
);

ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finances are viewable by everyone" ON public.finances FOR SELECT USING (true);
CREATE POLICY "Users can manage finances" ON public.finances FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update finances" ON public.finances FOR UPDATE USING (true);
CREATE POLICY "Users can delete finances" ON public.finances FOR DELETE USING (true);

CREATE TRIGGER update_finances_updated_at BEFORE UPDATE ON public.finances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GOALS TABLE
-- ============================================================================

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(12, 2),
  current_value DECIMAL(12, 2) DEFAULT 0,
  progress_percentage INTEGER GENERATED ALWAYS AS (CASE WHEN target_value = 0 THEN 0 ELSE CAST((current_value / target_value * 100) AS INTEGER) END) STORED,
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goals are viewable by everyone" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Users can manage goals" ON public.goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update goals" ON public.goals FOR UPDATE USING (true);
CREATE POLICY "Users can delete goals" ON public.goals FOR DELETE USING (true);

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DEVOPS_METRICS TABLE
-- ============================================================================

CREATE TABLE public.devops_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deployment_frequency DECIMAL(10, 2) DEFAULT 0,
  lead_time INTEGER DEFAULT 0,
  mttr INTEGER DEFAULT 0,
  change_failure_rate DECIMAL(5, 2) DEFAULT 0,
  uptime_percentage DECIMAL(5, 2) DEFAULT 100,
  incident_count INTEGER DEFAULT 0,
  month DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, month)
);

ALTER TABLE public.devops_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DevOps metrics are viewable by everyone" ON public.devops_metrics FOR SELECT USING (true);
CREATE POLICY "Users can manage devops metrics" ON public.devops_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update devops metrics" ON public.devops_metrics FOR UPDATE USING (true);
CREATE POLICY "Users can delete devops metrics" ON public.devops_metrics FOR DELETE USING (true);

CREATE TRIGGER update_devops_metrics_updated_at BEFORE UPDATE ON public.devops_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_team_members_project_id ON public.team_members(project_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_sprints_project_id ON public.sprints(project_id);
CREATE INDEX idx_sprints_user_id ON public.sprints(user_id);
CREATE INDEX idx_sprints_status ON public.sprints(status);
CREATE INDEX idx_user_stories_project_id ON public.user_stories(project_id);
CREATE INDEX idx_user_stories_sprint_id ON public.user_stories(sprint_id);
CREATE INDEX idx_user_stories_user_id ON public.user_stories(user_id);
CREATE INDEX idx_acceptance_criteria_user_story_id ON public.acceptance_criteria(user_story_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_sprint_id ON public.tasks(sprint_id);
CREATE INDEX idx_tasks_user_story_id ON public.tasks(user_story_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_risks_project_id ON public.risks(project_id);
CREATE INDEX idx_risks_user_id ON public.risks(user_id);
CREATE INDEX idx_risks_status ON public.risks(status);
CREATE INDEX idx_profit_sharing_project_id ON public.profit_sharing(project_id);
CREATE INDEX idx_profit_sharing_team_member_id ON public.profit_sharing(team_member_id);
CREATE INDEX idx_finances_project_id ON public.finances(project_id);
CREATE INDEX idx_finances_month ON public.finances(month);
CREATE INDEX idx_goals_project_id ON public.goals(project_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_devops_metrics_project_id ON public.devops_metrics(project_id);
CREATE INDEX idx_devops_metrics_month ON public.devops_metrics(month);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

INSERT INTO public.users (id, email, password_hash, name, role, avatar, skills, availability)
VALUES 
  (gen_random_uuid(), 'pedro@evior.dev', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'Pedro', 'Product Owner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', ARRAY['Leadership', 'Strategy', 'Product Management'], 100),
  (gen_random_uuid(), 'david@evior.dev', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'David', 'Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', ARRAY['React', 'TypeScript', 'Node.js'], 100),
  (gen_random_uuid(), 'morena@evior.dev', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'Morena', 'Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morena', ARRAY['Frontend', 'UI/UX', 'CSS'], 100),
  (gen_random_uuid(), 'franco@evior.dev', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'Franco', 'DevOps', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Franco', ARRAY['Docker', 'Kubernetes', 'CI/CD'], 100)
ON CONFLICT (email) DO NOTHING;
