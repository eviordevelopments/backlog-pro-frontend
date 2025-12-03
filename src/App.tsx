import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ProjectProvider } from "./context/ProjectContext";
import { ClientProvider } from "./context/ClientContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoadingScreen } from "./components/auth/LoadingScreen";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Kanban from "./pages/Kanban";
import Sprints from "./pages/Sprints";
import UserStories from "./pages/UserStories";
import Team from "./pages/Team";
import Risks from "./pages/Risks";
import Finances from "./pages/Finances";
import Clients from "./pages/Clients";
import VideoCall from "./pages/VideoCall";
import Goals from "./pages/Goals";
import Calendar from "./pages/Calendar";
import DevOps from "./pages/DevOps";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Inner component that uses auth context to show loading state
const AppRoutes = () => {
  const { loading } = useAuth();

  // Show loading screen during session restoration
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Unprotected routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/stories" element={<UserStories />} />
          <Route path="/team" element={<Team />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/devops" element={<DevOps />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <ClientProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </AppProvider>
        </ClientProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
