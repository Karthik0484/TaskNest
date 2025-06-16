
import { supabase } from "@/integrations/supabase/client";
import { type FileItem } from "@/contexts/FileContext";

// Convert DB row to FileItem
const fromRow = (row: any): FileItem => ({
  id: row.id,
  name: row.name,
  type: row.type,
  size: row.size,
  tags: row.tags ?? [],
  addedAt: row.added_at,
  url: row.url,
});

export const fetchFiles = async (userId: string): Promise<FileItem[]> => {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching files:", error);
    return [];
  }
  return data?.map(fromRow) ?? [];
};

export const createFile = async (file: Omit<FileItem, "id">, userId: string): Promise<FileItem | null> => {
  const { data, error } = await supabase
    .from("files")
    .insert([
      {
        user_id: userId,
        name: file.name,
        type: file.type,
        size: file.size,
        tags: file.tags ?? [],
        added_at: file.addedAt,
        url: file.url,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating file:", error);
    return null;
  }
  return fromRow(data);
};

export const deleteFileDB = async (fileId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting file:", error);
    return false;
  }
  return true;
};
