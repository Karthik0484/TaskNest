
import { supabase } from "@/integrations/supabase/client";
import { type LinkItem } from "@/contexts/FileContext";

// Convert DB row to LinkItem
const fromRow = (row: any): LinkItem => ({
  id: row.id,
  title: row.title,
  url: row.url,
  description: row.description ?? "",
  tags: row.tags ?? [],
  addedAt: row.added_at,
});

export const fetchLinks = async (userId: string): Promise<LinkItem[]> => {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching links:", error);
    return [];
  }
  return data?.map(fromRow) ?? [];
};

export const createLink = async (link: Omit<LinkItem, "id">, userId: string): Promise<LinkItem | null> => {
  const { data, error } = await supabase
    .from("links")
    .insert([
      {
        user_id: userId,
        title: link.title,
        url: link.url,
        description: link.description ?? "",
        tags: link.tags ?? [],
        added_at: link.addedAt,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating link:", error);
    return null;
  }
  return fromRow(data);
};

export const deleteLinkDB = async (linkId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting link:", error);
    return false;
  }
  return true;
};
