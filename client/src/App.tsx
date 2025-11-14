import { Switch, Route, useLocation } from "wouter";
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

import PrivateRoute from "@/components/PrivateRoute";

function Router() {
  const [location] = useLocation();

  // Hide navbar on these routes
  const HIDE_NAV_ROUTES = ["/login", "/signup"];

  return (
    <>
      {!HIDE_NAV_ROUTES.includes(location) && <Navbar />}

      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          component={() => <PrivateRoute component={Dashboard} />}
        />

        <Route
          path="/projects"
          component={() => <PrivateRoute component={ProjectHub} />}
        />

        <Route
          path="/projects/:id/tasks"
          component={() => <PrivateRoute component={TaskBoard} />}
        />

        <Route
          path="/matchmaking"
          component={() => <PrivateRoute component={SkillMatchmaking} />}
        />

        <Route
          path="/reviews"
          component={() => <PrivateRoute component={PeerReview} />}
        />

        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
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
