import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskCard } from "@/components/TaskCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { Plus, ArrowLeft } from "lucide-react";
import type { TaskStatus } from "@shared/schema";

export default function TaskBoard() {
  const params = useParams();
  const projectId = params.id;
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: tasks = [], isLoading } = useTasks(projectId);
  const createTaskMutation = useCreateTask(projectId || "");
  const updateTaskMutation = useUpdateTask(projectId || "");
  const deleteTaskMutation = useDeleteTask(projectId || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    xpReward: 10,
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) return;

    try {
      await createTaskMutation.mutateAsync({
        projectId,
        title: formData.title,
        description: formData.description || null,
        status: "not_started",
        assignedTo: null,
        priority: formData.priority,
        xpReward: formData.xpReward,
        dueDate: null,
      });

      setDialogOpen(false);
      setFormData({ title: "", description: "", priority: "medium", xpReward: 10 });
      
      toast({
        title: "Success!",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast({
        title: "Task deleted",
        description: "Task has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        updates: { status: newStatus },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const columns = [
    { id: "not_started", title: "Not Started", color: "border-muted" },
    { id: "in_progress", title: "In Progress", color: "border-chart-4" },
    { id: "completed", title: "Completed", color: "border-chart-2" },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setLocation("/projects")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Task Board</h1>
              <p className="text-muted-foreground text-lg">
                Organize and track your project tasks
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-task">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      placeholder="Implement feature X"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      data-testid="input-task-title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the task..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      data-testid="input-task-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="xp">XP Reward</Label>
                      <Input
                        id="xp"
                        type="number"
                        value={formData.xpReward}
                        onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                        min={1}
                        data-testid="input-xp-reward"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-submit-task">
                    Create Task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className={`border-l-4 ${column.color} pl-4`}>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">
                  {column.title}
                </h3>
                <p className="text-2xl font-bold" data-testid={`count-${column.id}`}>
                  {getTasksByStatus(column.id).length}
                </p>
              </div>

              <div className="space-y-3">
                {getTasksByStatus(column.id).length === 0 ? (
                  <Card className="p-8 border-dashed text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </Card>
                ) : (
                  getTasksByStatus(column.id).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
