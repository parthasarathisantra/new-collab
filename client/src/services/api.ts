import axios from "axios";
import type { 
  InsertProject, 
  Project, 
  InsertTask, 
  Task,
  InsertReview,
  Review,
  ProjectProgress,
  TeammateMatch 
} from "@shared/schema";

const api = axios.create({
  baseURL: "/api",
});

// Projects
export const createProject = async (project: InsertProject): Promise<Project> => {
  const { data } = await api.post("/projects", project);
  return data;
};

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get("/projects");
  return data;
};

export const getProject = async (id: string): Promise<Project> => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

// Tasks
export const createTask = async (projectId: string, task: InsertTask): Promise<Task> => {
  const { data } = await api.post(`/projects/${projectId}/tasks`, task);
  return data;
};

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return data;
};

export const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> => {
  const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}`, updates);
  return data;
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
};

// Progress
export const getProjectProgress = async (projectId: string): Promise<ProjectProgress> => {
  const { data } = await api.get(`/projects/${projectId}/progress`);
  return data;
};

// Reviews
export const createReview = async (review: InsertReview): Promise<Review> => {
  const { data } = await api.post("/reviews", review);
  return data;
};

export const getProjectReviews = async (projectId: string): Promise<Review[]> => {
  const { data } = await api.get(`/projects/${projectId}/reviews`);
  return data;
};

// Skill Matching
export const findTeammates = async (skills: string[], interests: string[], projectIdea: string): Promise<TeammateMatch[]> => {
  const { data } = await api.post("/match-teammates", { skills, interests, projectIdea });
  return data;
};

export default api;
