import ProjectGoals from '@/components/goals/ProjectGoals';

export default function Goals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Goals</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your project goals
        </p>
      </div>
      <ProjectGoals />
    </div>
  );
}
