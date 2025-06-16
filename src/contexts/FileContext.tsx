import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { fetchLinks, createLink, deleteLinkDB } from '@/utils/supabaseLinks';

// Define the structure of a file item
export interface FileItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  tags: string[];
  addedAt: string;
}

// Define the structure of a link item
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  addedAt: string;
}

// Define the context type
interface FileContextType {
  files: FileItem[];
  links: LinkItem[];
  addFile: (file: Omit<FileItem, "id">) => void;
  deleteFile: (fileId: string) => void;
  saveLink: (linkData: Omit<LinkItem, "id">) => Promise<LinkItem | null>;
  deleteLink: (linkId: string) => void;
}

// Create the context
const FileContext = createContext<FileContextType | undefined>(undefined);

// Add type for async link save (returns Promise)
type SaveLinkHandler = (linkData: Omit<LinkItem, "id">) => Promise<LinkItem | null>;

// Create a custom hook to use the file context
export const useFile = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};

// Create the provider component
export const FileProvider = ({ children }: { children: React.ReactNode }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const { user } = useAuth();

  // Load links on user change
  useEffect(() => {
    if (user) {
      fetchLinks(user.id).then(setLinks);
    } else {
      setLinks([]);
    }
  }, [user]);

  // Files
  const addFile = (file: Omit<FileItem, "id">) => {
    setFiles(prevFiles => [...prevFiles, { id: uuidv4(), ...file }]);
  };

  const deleteFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  // Links
  const saveLink: SaveLinkHandler = async (linkData) => {
    if (!user) return null;
    const newLink = await createLink(linkData, user.id);
    setLinks((prev) => (newLink ? [newLink, ...prev] : prev));
    return newLink;
  };

  const deleteLink = (linkId: string) => {
    if (!user) return;
    deleteLinkDB(linkId, user.id).then(success => {
      if (success) {
        setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
      }
    });
  };

  // (When adding calendar db sync, use the same async signature/pattern.)

  return (
    <FileContext.Provider value={{
      files,
      links,
      addFile,
      deleteFile,
      saveLink,
      deleteLink,
    }}>
      {children}
    </FileContext.Provider>
  );
};
