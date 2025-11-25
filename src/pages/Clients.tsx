import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Star,
  Trash2,
  Edit2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Client } from "@/types";
import { toast } from "@/components/ui/use-toast";

export default function Clients() {
  const { projects, currentProject } = useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    status: "active" as "active" | "inactive" | "churned",
    cac: "",
    ltv: "",
    mrr: "",
    npsScore: "",
    projectIds: [] as string[],
  });

  useEffect(() => {
    const saved = localStorage.getItem("clients");
    if (saved) {
      setClients(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setClients(
        clients.map((c) =>
          c.id === editingId
            ? {
                ...c,
                ...formData,
                cac: parseFloat(formData.cac) || 0,
                ltv: parseFloat(formData.ltv) || 0,
                mrr: parseFloat(formData.mrr) || 0,
                npsScore: formData.npsScore ? parseFloat(formData.npsScore) : undefined,
              }
            : c
        )
      );
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      setEditingId(null);
    } else {
      const newClient: Client = {
        id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...formData,
        cac: parseFloat(formData.cac) || 0,
        ltv: parseFloat(formData.ltv) || 0,
        mrr: parseFloat(formData.mrr) || 0,
        npsScore: formData.npsScore ? parseFloat(formData.npsScore) : undefined,
        createdAt: new Date().toISOString(),
        userId: "current-user",
      };
      setClients([...clients, newClient]);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      status: "active",
      cac: "",
      ltv: "",
      mrr: "",
      npsScore: "",
      projectIds: [],
    });
    setEditingId(null);
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      industry: client.industry,
      status: client.status,
      cac: client.cac.toString(),
      ltv: client.ltv.toString(),
      mrr: client.mrr.toString(),
      npsScore: client.npsScore?.toString() || "",
      projectIds: client.projectIds,
    });
    setEditingId(client.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    toast({
      title: "Success",
      description: "Client deleted successfully",
    });
  };

  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalMRR = clients.reduce((sum, c) => sum + c.mrr, 0);
  const avgLTV = clients.length > 0 ? clients.reduce((sum, c) => sum + c.ltv, 0) / clients.length : 0;
  const avgCAC = clients.length > 0 ? clients.reduce((sum, c) => sum + c.cac, 0) / clients.length : 0;

  const filteredClients = currentProject
    ? clients.filter((c) => c.projectIds.includes(currentProject.id))
    : clients;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Clients</h1>
          <p className="text-muted-foreground mt-2">
            {currentProject
              ? `Clients for ${currentProject.name}`
              : "Manage your customer relationships and metrics"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingId(null);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Client" : "Add New Client"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>CAC ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cac}
                    onChange={(e) =>
                      setFormData({ ...formData, cac: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>LTV ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.ltv}
                    onChange={(e) =>
                      setFormData({ ...formData, ltv: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>MRR ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.mrr}
                    onChange={(e) =>
                      setFormData({ ...formData, mrr: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>NPS Score</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.npsScore}
                    onChange={(e) =>
                      setFormData({ ...formData, npsScore: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label>Associated Projects</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border border-border/50 rounded-lg p-3 bg-muted/30">
                    {projects.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No projects available</p>
                    ) : (
                      projects.map((project) => (
                        <label
                          key={project.id}
                          className="flex items-center gap-2 p-1 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.projectIds.includes(project.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  projectIds: [
                                    ...formData.projectIds,
                                    project.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  projectIds: formData.projectIds.filter(
                                    (id) => id !== project.id
                                  ),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{project.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update Client" : "Add Client"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length} total clients
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMRR.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly recurring</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgLTV.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg CAC</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgCAC.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Acquisition cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>
            {currentProject ? `${currentProject.name} Clients` : "All Clients"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground">
                {currentProject
                  ? "No clients associated with this project"
                  : "Add your first client to start tracking metrics"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl glass border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {client.company}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                        client.status === "active"
                          ? "bg-success/20 text-success"
                          : client.status === "inactive"
                            ? "bg-muted text-muted-foreground"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3 text-xs">
                    {client.email && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-center mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">MRR</p>
                      <p className="font-semibold text-sm">
                        ${client.mrr.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LTV</p>
                      <p className="font-semibold text-sm">
                        ${client.ltv.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CAC</p>
                      <p className="font-semibold text-sm">
                        ${client.cac.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {client.npsScore && (
                    <div className="flex items-center justify-center gap-1 mb-3 pb-3 border-b border-border/50">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium">
                        NPS: {client.npsScore}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(client)}
                      className="flex-1 gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      className="flex-1 gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
