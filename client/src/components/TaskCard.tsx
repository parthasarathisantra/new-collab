import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Award, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  assigneeName?: string;
}

export function TaskCard({ task, onDelete, onStatusChange, assigneeName }: TaskCardProps) {
  const priorityColors = {
    low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      data-testid={`task-card-${task.id}`}
    >
      <Card className="p-4 hover-elevate cursor-pointer group">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm flex-1" data-testid="text-task-title">
              {task.title}
            </h4>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                data-testid={`button-delete-task-${task.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2" data-testid="text-task-description">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={priorityColor} data-testid="badge-priority">
              {task.priority}
            </Badge>
            
            <Badge variant="secondary" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              +{task.xpReward} XP
            </Badge>

            {task.dueDate && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
          </div>

          {/* Assignee */}
          {assigneeName && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {assigneeName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground" data-testid="text-assignee">
                {assigneeName}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
