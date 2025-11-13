import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Home from "@/pages/Home";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ProjectHub from "@/pages/ProjectHub";
import TaskBoard from "@/pages/TaskBoard";
import SkillMatchmaking from "@/pages/SkillMatchmaking";
import PeerReview from "@/pages/PeerReview";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/projects" component={ProjectHub} />
        <Route path="/projects/:id/tasks" component={TaskBoard} />
        <Route path="/matchmaking" component={SkillMatchmaking} />
        <Route path="/reviews" component={PeerReview} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
