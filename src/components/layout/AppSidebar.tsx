import {
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  CalendarDays,
  FileText,
  Users,
  AlertTriangle,
  DollarSign,
  Activity,
  Wallet,
  Target,
  LogOut,
  User,
  Video,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: Briefcase },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Kanban Board", url: "/kanban", icon: KanbanSquare },
  { title: "Sprints", url: "/sprints", icon: CalendarDays },
  { title: "User Stories", url: "/stories", icon: FileText },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Team", url: "/team", icon: Users },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Video Calls", url: "/video-call", icon: Video },
  { title: "Risk Matrix", url: "/risks", icon: AlertTriangle },
  { title: "Finances", url: "/finances", icon: Wallet },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "DevOps Metrics", url: "/devops", icon: Activity },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="flex flex-col">
      <SidebarHeader className="p-4 flex items-center justify-between gap-2">
        <div className="flex flex-row justify-between w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src="/evior-logo.png" alt="E-vior" className="h-8 w-auto flex-shrink-0" />
            {state === "expanded" && (
              <div className="flex flex-col gap-0 min-w-0">
                <h2 className="font-bold text-sm text-gradient truncate leading-tight">Backlog Pro</h2>
                <p className="text-xs text-muted-foreground truncate leading-tight">Agile Suite</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 flex-shrink-0"
            title={state === "expanded" ? "Close sidebar" : "Open sidebar"}
          >
            {state === "expanded" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* User Profile Section (Requirement 7.1, 7.2) */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2 h-auto hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user ? getUserInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {user?.email || ""}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
