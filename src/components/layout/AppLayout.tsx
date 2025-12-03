import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const AppLayoutContent = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {state === "collapsed" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
                title="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <img src="/evior-logo.png" alt="E-vior" className="h-8 w-auto" />
            <ProjectSelector />
          </div>
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
};
