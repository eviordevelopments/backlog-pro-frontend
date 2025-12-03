import { useApp } from "@/context/AppContext";
import { useProjectContext } from "@/context/ProjectContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

function TaskCard({ task, index }: { task: Task; index: number }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`glass p-4 rounded-lg cursor-move group glass-hover ${
            snapshot.isDragging ? "opacity-50 rotate-2" : ""
          }`}
        >
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 space-y-2">
              <h4 className="font-medium">{task.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                {task.storyPoints > 0 && (
                  <Badge variant="outline">{task.storyPoints} pts</Badge>
                )}
                {task.assignedTo && (
                  <span className="text-xs text-muted-foreground">
                    @{task.assignedTo}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function Column({
  status,
  title,
  tasks,
}: {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="glass p-4 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 min-h-[500px] transition-colors ${
                snapshot.isDraggingOver ? "bg-primary/5 rounded-lg" : ""
              }`}
            >
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}

export default function Kanban() {
  const { tasks, updateTask } = useApp();
  const { selectedProject: currentProject } = useProjectContext();
  
  const filteredTasks = tasks.filter(task => !currentProject || task.projectId === currentProject.id);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside any droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      const newStatus = destination.droppableId as TaskStatus;
      updateTask(draggableId, { status: newStatus });
      toast.success("Task status updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Kanban Board</h1>
        <p className="text-muted-foreground mt-2">
          Drag and drop tasks between columns
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              status={column.id}
              title={column.title}
              tasks={filteredTasks.filter((task) => task.status === column.id)}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
