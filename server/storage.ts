import { 
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Review,
  type InsertReview,
  type Milestone,
  type InsertMilestone,
  type ProjectProgress,
  type TeammateMatch
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: string, xpToAdd: number): Promise<User | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Tasks
  getTasksByProject(projectId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<void>;
  
  // Progress
  getProjectProgress(projectId: string): Promise<ProjectProgress>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProject(projectId: string): Promise<Review[]>;
  
  // Milestones
  getMilestonesByProject(projectId: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<Milestone | undefined>;
  
  // Skill Matching
  findTeammates(params: { skills: string[]; interests: string[]; projectIdea: string }): Promise<TeammateMatch[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private reviews: Map<string, Review>;
  private milestones: Map<string, Milestone>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.reviews = new Map();
    this.milestones = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const newXP = user.xp + xpToAdd;
    const xpPerLevel = 100;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;

    const updatedUser = {
      ...user,
      xp: newXP,
      level: newLevel,
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  // Tasks
  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      ...insertTask, 
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    
    // If task is being completed, award XP to assignee
    if (updates.status === "completed" && task.status !== "completed" && task.assignedTo) {
      await this.updateUserXP(task.assignedTo, task.xpReward);
      updatedTask.completedAt = new Date();
    }

    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
  }

  // Progress
  async getProjectProgress(projectId: string): Promise<ProjectProgress> {
    const tasks = await this.getTasksByProject(projectId);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate contributions by user
    const contributionMap = new Map<string, { username: string; tasksCompleted: number; xpEarned: number }>();
    
    for (const task of tasks) {
      if (task.assignedTo && task.status === "completed") {
        const user = await this.getUser(task.assignedTo);
        if (user) {
          const existing = contributionMap.get(task.assignedTo) || {
            username: user.username,
            tasksCompleted: 0,
            xpEarned: 0,
          };
          contributionMap.set(task.assignedTo, {
            username: existing.username,
            tasksCompleted: existing.tasksCompleted + 1,
            xpEarned: existing.xpEarned + task.xpReward,
          });
        }
      }
    }

    const contributions = Array.from(contributionMap.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));

    return {
      projectId,
      totalTasks,
      completedTasks,
      completionPercentage,
      contributions,
    };
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByProject(projectId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.projectId === projectId
    );
  }

  // Milestones
  async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      (milestone) => milestone.projectId === projectId
    );
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = randomUUID();
    const milestone: Milestone = { 
      ...insertMilestone, 
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone) return undefined;

    const updatedMilestone = { ...milestone, ...updates };
    
    if (updates.isCompleted && !milestone.isCompleted) {
      updatedMilestone.completedAt = new Date();
    }

    this.milestones.set(milestoneId, updatedMilestone);
    return updatedMilestone;
  }

  // Skill Matching
  async findTeammates(params: { skills: string[]; interests: string[]; projectIdea: string }): Promise<TeammateMatch[]> {
    const allUsers = Array.from(this.users.values());
    const matches: TeammateMatch[] = [];

    for (const user of allUsers) {
      const matchingSkills = params.skills.filter(skill => 
        user.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );

      const matchingInterests = params.interests.filter(interest =>
        user.interests.some(userInterest =>
          userInterest.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(userInterest.toLowerCase())
        )
      );

      const totalMatches = matchingSkills.length + matchingInterests.length;
      const totalCriteria = params.skills.length + params.interests.length;
      const matchPercentage = totalCriteria > 0 
        ? Math.round((totalMatches / totalCriteria) * 100) 
        : 0;

      if (matchPercentage > 0) {
        matches.push({
          user,
          matchPercentage,
          matchingSkills,
        });
      }
    }

    return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 10);
  }
}

export const storage = new MemStorage();
