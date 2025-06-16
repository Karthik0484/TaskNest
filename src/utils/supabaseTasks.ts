
import { supabase } from "@/integrations/supabase/client";
import { type Task } from "@/contexts/TaskContext";

// Utility: allowed status values
const STATUS_VALUES = ["In Progress", "Completed", "Deferred"] as const;
type StatusType = Task["status"];
const parseStatus = (val: string): StatusType =>
  (STATUS_VALUES.includes(val as StatusType) ? (val as StatusType) : "In Progress");

// Utility: safe parse date (string or null to undefined)
const parseOptionalDate = (date: string | null) => (date ?? undefined);

// Parse row from DB into Task
const fromRow = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  status: parseStatus(row.status),
  tags: row.tags ?? [],
  deadline: parseOptionalDate(row.deadline),
  createdAt: row.created_at ?? "",
  completedAt: parseOptionalDate(row.completed_at),
});

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data ? data.map(fromRow) : [];
};

export const createTask = async (task: Omit<Task, "id">, userId: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: userId,
        title: task.title,
        description: task.description,
        status: task.status,
        tags: task.tags,
        deadline: task.deadline ?? null,
        created_at: task.createdAt,
        completed_at: task.completedAt ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }

  return fromRow(data);
};

export const updateTaskDB = async (id: string, userId: string, updated: Partial<Task>): Promise<boolean> => {
  const fields: Record<string, any> = { ...updated };
  // Rename keys
  if ("deadline" in fields && fields.deadline === "") fields.deadline = null;
  if ("completedAt" in fields) fields.completed_at = fields.completedAt;
  if ("createdAt" in fields) fields.created_at = fields.createdAt;
  delete fields.id;

  const { error } = await supabase
    .from("tasks")
    .update(fields)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating task:", error);
    return false;
  }
  return true;
};

export const deleteTaskDB = async (id: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }
  return true;
};
