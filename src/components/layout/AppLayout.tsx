import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <ProjectSelector />
            <ThemeToggle />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
