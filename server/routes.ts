import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

// Flask backend URL (will default to localhost for development)
const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5001";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy routes to Flask backend
  // These routes forward requests to the existing Flask backend
  
  // User signup
  app.post("/api/signup", async (req, res) => {
    try {
      // Validate required fields
      const { email, username, firebaseUid } = req.body;
      if (!email || !username || !firebaseUid) {
        return res.status(400).json({ error: "Missing required fields: email, username, firebaseUid" });
      }

      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message || "Failed to create user" });
    }
  });

  // User login (Firebase handles auth, this is for user data sync)
  app.post("/api/login", async (req, res) => {
    try {
      const { firebaseUid } = req.body;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  // Get user by Firebase UID
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tasks endpoints
  app.get("/api/projects/:id/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasksByProject(req.params.id);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:id/tasks", async (req, res) => {
    try {
      const task = await storage.createTask({ ...req.body, projectId: req.params.id });
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:projectId/tasks/:taskId", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.taskId, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/projects/:projectId/tasks/:taskId", async (req, res) => {
    try {
      await storage.deleteTask(req.params.taskId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Progress endpoint
  app.get("/api/projects/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getProjectProgress(req.params.id);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reviews endpoints
  app.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProject(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Skill matching endpoint
  app.post("/api/match-teammates", async (req, res) => {
    try {
      const matches = await storage.findTeammates(req.body);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Milestones endpoints
  app.get("/api/projects/:id/milestones", async (req, res) => {
    try {
      const milestones = await storage.getMilestonesByProject(req.params.id);
      res.json(milestones);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const milestone = await storage.createMilestone(req.body);
      res.json(milestone);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user XP
  app.patch("/api/users/:id/xp", async (req, res) => {
    try {
      const { xpToAdd } = req.body;
      if (typeof xpToAdd !== "number") {
        return res.status(400).json({ error: "xpToAdd must be a number" });
      }
      const user = await storage.updateUserXP(req.params.id, xpToAdd);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
