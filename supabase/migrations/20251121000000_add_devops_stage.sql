-- Add devops_stage column to projects table
-- This column tracks the current stage of a project in the DevOps lifecycle

ALTER TABLE public.projects 
ADD COLUMN devops_stage TEXT CHECK (
  devops_stage IS NULL OR 
  devops_stage IN ('plan', 'code', 'build', 'test', 'release', 'deploy', 'operate', 'monitor')
);

-- Add index for devops_stage for efficient filtering
CREATE INDEX idx_projects_devops_stage ON public.projects(devops_stage);

-- Add comment for documentation
COMMENT ON COLUMN public.projects.devops_stage IS 'Current stage in the DevOps lifecycle: plan, code, build, test, release, deploy, operate, monitor. NULL indicates no stage assigned.';
