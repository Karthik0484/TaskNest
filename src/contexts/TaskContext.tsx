import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchTasks,
  createTask,
  updateTaskDB,
  deleteTaskDB,
} from "@/utils/supabaseTasks";

export interface Task {
  id: string; // uuid
  title: string;
  description: string;
  status: "In Progress" | "Completed" | "Deferred";
  tags: string[];
  deadline?: string;
  createdAt: string;
  completedAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Omit<Task, 'id'>) => Promise<Task | null>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setTasks([]);
      return;
    }
    (async () => {
      const userTasks = await fetchTasks(user.id);
      setTasks(userTasks);
    })();
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id'>): Promise<Task | null> => {
    if (!user?.id) return null;
    const newTask = await createTask(taskData, user.id);
    if (newTask) {
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    }
    return null;
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    if (!user?.id) return;
    const ok = await updateTaskDB(id, user.id, updatedTask);
    if (ok) {
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? { ...task, ...updatedTask }
            : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    if (!user?.id) return;
    const ok = await deleteTaskDB(id, user.id);
    if (ok) setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = async (id: string) => {
    const existing = tasks.find(t => t.id === id);
    if (!existing || !user?.id) return;
    const newStatus = existing.status === "Completed" ? "In Progress" : "Completed";
    const completedAt = newStatus === "Completed"
      ? new Date().toISOString().split("T")[0]
      : undefined;

    await updateTask(id, { status: newStatus, completedAt });
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
