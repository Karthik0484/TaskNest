import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, CheckCircle, Clock, Calendar, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTaskContext, type Task } from "@/contexts/TaskContext";
import { NotificationService } from "@/services/NotificationService";

// Convert task.id (string) to numeric notification ID for NotificationService
const notificationIdForTask = (taskId: string) => {
  // simple hash: sum char codes, plus 1000 for legacy support
  return (
    1000 +
    Array.from(taskId)
      .map((c) => c.charCodeAt(0))
      .reduce((a, b) => a + b, 0)
  );
};

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "In Progress" as Task["status"],
    tags: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      deadline: formData.deadline || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      toast({ title: "Task updated successfully!" });
      
      // Cancel old notification and schedule new one if deadline changed
      if (editingTask.deadline !== taskData.deadline) {
        await NotificationService.cancelNotification(notificationIdForTask(editingTask.id));
        if (taskData.deadline) {
          await NotificationService.scheduleDeadlineReminder(
            taskData.title, 
            taskData.deadline, 
            notificationIdForTask(editingTask.id)
          );
        }
      }
    } else {
      // Await for consistency as addTask is async
      const newTask = await addTask(taskData);
      toast({ title: "Task created successfully!" });
      
      // Schedule deadline notification for new task
      if (taskData.deadline) {
        await NotificationService.scheduleDeadlineReminder(
          taskData.title, 
          taskData.deadline, 
          notificationIdForTask(newTask.id)
        );
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "In Progress",
      tags: "",
      deadline: "",
    });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      tags: task.tags.join(", "),
      deadline: task.deadline || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await NotificationService.cancelNotification(notificationIdForTask(id));
    deleteTask(id);
    toast({ title: "Task deleted successfully!" });
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "In Progress":
        return <Clock className="text-blue-500" size={16} />;
      case "Deferred":
        return <Calendar className="text-orange-500" size={16} />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Deferred":
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Task Manager</h2>
          <p className="text-slate-600">Organize and track your tasks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask ? "Update your task details below." : "Add a new task to your list."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Task["status"]) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., coding, design, urgent"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className="transition-transform hover:scale-110"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  <div>
                    <CardTitle className={`text-lg ${task.status === "Completed" ? "line-through text-slate-500" : "text-slate-800"}`}>
                      {task.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {task.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>
                    <Edit size={14} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(task.id)}>
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag size={10} />
                    {tag}
                  </Badge>
                ))}
                {task.deadline && (
                  <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-200">
                    <Calendar size={10} />
                    Due: {task.deadline}
                  </Badge>
                )}
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Created: {task.createdAt}
                {task.completedAt && (
                  <span className="ml-4">Completed: {task.completedAt}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
