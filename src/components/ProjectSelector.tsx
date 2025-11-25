import { useApp } from "@/context/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const ProjectSelector = () => {
  const { projects, currentProject, setCurrentProject, addProject } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#5b7cfc",
  });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      addProject({
        id: crypto.randomUUID(),
        name: newProject.name,
        description: newProject.description,
        color: newProject.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNewProject({ name: "", description: "", color: "#5b7cfc" });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentProject?.id}
        onValueChange={(value) => {
          const project = projects.find((p) => p.id === value);
          if (project) setCurrentProject(project);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <SelectValue placeholder="Seleccionar proyecto" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Proyecto</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="Mi Proyecto"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                placeholder="Descripción del proyecto..."
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
                  }
                  placeholder="#5b7cfc"
                />
              </div>
            </div>
            <Button onClick={handleCreateProject} className="w-full">
              Crear Proyecto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
