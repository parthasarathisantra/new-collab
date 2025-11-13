import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { createProject, getProjects, getProject } from "@/services/api";
import type { InsertProject } from "@shared/schema";

export function useProjects() {
  return useQuery({
    queryKey: ["/api/projects"],
    queryFn: getProjects,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["/api/projects", id],
    queryFn: () => id ? getProject(id) : null,
    enabled: !!id,
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: (project: InsertProject) => createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}
