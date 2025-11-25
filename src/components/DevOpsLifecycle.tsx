import { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Project, Task, DevOpsStage } from "@/types";
import { useApp } from "@/context/AppContext";
import {
  Lightbulb, Code, Package, TestTube, Rocket, Cloud, Settings, Activity,
  CheckCircle2, Circle, Plus, LucideIcon, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interfaces y datos (sin cambios)
interface DevOpsLifecycleProps { project: Project; }
interface Stage { id: DevOpsStage; name: string; icon: LucideIcon; color: string; bgColor: string; position: { top: string; left: string }; }
interface TaskFormData { title: string; description: string; assigned_to: string; }
const stages: Stage[] = [
    { id: "plan", name: "Plan", icon: Lightbulb, color: "from-blue-400 to-blue-600", bgColor: "#3b82f6", position: { top: "15%", left: "50%" } },
    { id: "code", name: "Code", icon: Code, color: "from-purple-400 to-purple-600", bgColor: "#a855f7", position: { top: "30%", left: "80%" } },
    { id: "build", name: "Build", icon: Package, color: "from-pink-400 to-pink-600", bgColor: "#ec4899", position: { top: "50%", left: "90%" } },
    { id: "test", name: "Test", icon: TestTube, color: "from-red-400 to-red-600", bgColor: "#ef4444", position: { top: "70%", left: "80%" } },
    { id: "release", name: "Release", icon: Rocket, color: "from-orange-400 to-orange-600", bgColor: "#f97316", position: { top: "85%", left: "50%" } },
    { id: "deploy", name: "Deploy", icon: Cloud, color: "from-yellow-400 to-yellow-600", bgColor: "#eab308", position: { top: "70%", left: "20%" } },
    { id: "operate", name: "Operate", icon: Settings, color: "from-green-400 to-green-600", bgColor: "#22c55e", position: { top: "50%", left: "10%" } },
    { id: "monitor", name: "Monitor", icon: Activity, color: "from-teal-400 to-teal-600", bgColor: "#14b8a6", position: { top: "30%", left: "20%" } },
];

// Función de curva (sin cambios)
function getCatmullRomPath(points: { x: number; y: number }[], tension = 0.5, isClosed = true) {
    if (points.length < 2) return "";
    const path = []; const pts = [...points];
    if (isClosed) { pts.unshift(points[points.length - 1]); pts.push(points[0], points[1]); }
    else { pts.unshift(points[0]); pts.push(points[points.length - 1]); }
    path.push(`M ${pts[1].x} ${pts[1].y}`);
    for (let i = 1; i < pts.length - 2; i++) {
        const [p0, p1, p2, p3] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
        const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension; const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
        const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension; const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
        path.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
    }
    return path.join(' ');
}

// Hook de medición (sin cambios)
const useStagePositions = (stages: Stage[]) => {
    const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const measurePositions = () => {
            const newPositions = new Map<string, { x: number; y: number }>();
            const containerRect = container.getBoundingClientRect();
            if (containerRect.width === 0) return;
            stageRefs.current.forEach((el, id) => {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const x = rect.left + rect.width / 2 - containerRect.left;
                    const y = rect.top + rect.height / 2 - containerRect.top;
                    newPositions.set(id, { x, y });
                }
            });
            if (newPositions.size !== positions.size) {
                 setPositions(newPositions);
            }
        };
        const timeoutId = setTimeout(measurePositions, 50);
        const resizeObserver = new ResizeObserver(measurePositions);
        resizeObserver.observe(container);
        return () => { clearTimeout(timeoutId); resizeObserver.disconnect(); };
    }, [stages.length, positions.size]);
    const getStageRef = (id: string) => (el: HTMLButtonElement | null) => {
        if (el) stageRefs.current.set(id, el); else stageRefs.current.delete(id);
    };
    return { containerRef, getStageRef, positions };
};

export default function DevOpsLifecycle({ project }: DevOpsLifecycleProps) {
  const { tasks, teamMembers, updateProject, addTask } = useApp();
  
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormData>({ title: "", description: "", assigned_to: "" });
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const { containerRef, getStageRef, positions } = useStagePositions(stages);

  const pathD = useMemo(() => {
      if (positions.size < stages.length) return "";
      const orderedPoints = stages.map(stage => positions.get(stage.id)!).filter(Boolean);
      if (orderedPoints.length < stages.length) return "";
      return getCatmullRomPath(orderedPoints, 1, true);
  }, [positions, stages]);

  if (!project) {
    return ( <div className="flex items-center justify-center min-h-[400px]">...</div> );
  }

  const currentStageIndex = project.devops_stage ? stages.findIndex(stage => stage.id === project.devops_stage) : -1;

  // --- FUNCIONES RESTAURADAS ---
  const handleStageClick = async (stage: Stage) => {
    setIsUpdatingStage(true);
    try {
      // Esta es la lógica que faltaba
      updateProject(project.id, { devops_stage: stage.id });
      setSelectedStage(stage);
      toast({
        title: "Stage Updated",
        description: `Project moved to ${stage.name} stage`,
      });
    } catch (error) {
      console.error("Failed to update project stage:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update project stage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const getTasksForStage = (stageId: string): Task[] => {
    return tasks.filter(task => task.projectId === project.id && task.tags.includes(stageId));
  };
  
  const handleCreateTask = async () => {
    setFormError("");
    if (!taskForm.title.trim() || !selectedStage) {
      setFormError("Title and stage are required");
      return;
    }
    setIsCreatingTask(true);
    try {
      const newTask: Task = {
        id: `task-${Date.now()}`, projectId: project.id, title: taskForm.title, description: taskForm.description, status: "todo", priority: "medium",
        storyPoints: 0, assignedTo: taskForm.assigned_to, estimatedDate: "", tags: [selectedStage.id], createdAt: new Date().toISOString(), userId: project.userId,
      };
      addTask(newTask);
      toast({ title: "Task Created", description: `Task "${taskForm.title}" added` });
      setTaskDialogOpen(false);
      setTaskForm({ title: "", description: "", assigned_to: "" });
    } catch (error) {
      console.error("Failed to create task:", error);
      setFormError("Failed to create task. Please try again.");
    } finally {
      setIsCreatingTask(false);
    }
  };
  
  const getUserName = (userId: string): string => {
    return teamMembers.find(member => member.id === userId)?.name || "Unknown";
  };
  // --- FIN DE FUNCIONES RESTAURADAS ---

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">DevOps Lifecycle</h2>
        <p className="text-muted-foreground">Track your project through the continuous DevOps cycle</p>
      </div>
      
      <div ref={containerRef} className="relative h-[700px] glass rounded-lg self-start">
        {isUpdatingStage && ( <div className="absolute inset-0 ...">...</div> )}
        
        {pathD && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${containerRef.current?.clientWidth || 0} ${containerRef.current?.clientHeight || 0}`}
          >
            <defs>
              <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" /><stop offset="25%" stopColor="#a855f7" /><stop offset="50%" stopColor="#ec4899" />
                <stop offset="75%" stopColor="#f97316" /><stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <motion.path
              d={pathD}
              fill="none" stroke="url(#loopGradient)" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </svg>
        )}

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = currentStageIndex === index;
          const isCompleted = currentStageIndex > index && currentStageIndex !== -1;
          
          return (
            <motion.button
              ref={getStageRef(stage.id)}
              key={stage.id}
              onClick={() => handleStageClick(stage)} // Esta línea es la que llama a la función
              disabled={isUpdatingStage}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer disabled:opacity-50 z-10`}
              style={{ top: stage.position.top, left: stage.position.left, visibility: pathD ? 'visible' : 'hidden' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isActive ? 1.2 : 1, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
              whileHover={{ scale: isActive ? 1.25 : 1.1 }} whileTap={{ scale: 0.95 }}
            >
               <div className="relative">
                {isActive && (
                  <motion.div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 20px 5px ${stage.bgColor}` }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center ${isActive ? 'shadow-2xl' : 'shadow-lg'} relative`}>
                  {isCompleted ? <CheckCircle2 className="w-8 h-8 text-white" /> : <Icon className="w-8 h-8 text-white" />}
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">{stage.name}</span>
            </motion.button>
          );
        })}
      </div>

      {selectedStage && (
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = selectedStage.icon;
                  return <Icon className="w-6 h-6" />;
                })()}
                <div>
                  <CardTitle>{selectedStage.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getTasksForStage(selectedStage.id).length} tasks
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setTaskDialogOpen(true)}
                size="sm"
                className="gap-2"
                disabled={isCreatingTask}
              >
                <Plus className="w-4 h-4" />
                Assign Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTasksForStage(selectedStage.id).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks for this stage yet
                </p>
              ) : (
                getTasksForStage(selectedStage.id).map((task) => {
                  const TaskIcon = task.status === "done" ? CheckCircle2 : Circle;
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg glass"
                    >
                      <TaskIcon
                        className={`w-5 h-5 mt-0.5 ${
                          task.status === "done"
                            ? "text-success"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Assigned to: {getUserName(task.assignedTo)}</span>
                          <span>•</span>
                          <span className="capitalize">{task.status.replace("-", " ")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task to {selectedStage?.name}</DialogTitle>
            <DialogDescription>
              Create a new task for the {selectedStage?.name} stage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task description (optional)"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assign to</Label>
              <Select
                value={taskForm.assigned_to}
                onValueChange={(value) =>
                  setTaskForm({ ...taskForm, assigned_to: value })
                }
                disabled={teamMembers.length === 0}
              >
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder={
                    teamMembers.length === 0 
                      ? "No team members available" 
                      : "Select team member (optional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No team members available
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {teamMembers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  You can still create tasks without assigning them to team members
                </p>
              )}
            </div>
          </div>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTaskDialogOpen(false);
                setFormError("");
              }}
              disabled={isCreatingTask}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={isCreatingTask || !taskForm.title.trim()}
            >
              {isCreatingTask ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
