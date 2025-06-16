import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Link, Upload, Plus, Tag, Calendar, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FileUpload from "./FileUpload";
import { useFile, type FileItem, type LinkItem } from "@/contexts/FileContext";

const FileManager = () => {
  const { files, links, addFile, saveLink } = useFile();
  
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [fileFormData, setFileFormData] = useState({
    name: "",
    tags: "",
  });
  const [linkFormData, setLinkFormData] = useState({
    title: "",
    url: "",
    description: "",
    tags: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    const newFileData = {
      name: selectedFile.name,
      type: getFileType(selectedFile.name),
      size: formatFileSize(selectedFile.size),
      tags: fileFormData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      addedAt: new Date().toISOString().split("T")[0],
      url: URL.createObjectURL(selectedFile),
    };
    addFile(newFileData);
    toast({ title: "File uploaded successfully!" });
    setFileFormData({ name: "", tags: "" });
    setSelectedFile(null);
    setIsFileDialogOpen(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFileFormData({ ...fileFormData, name: file.name });
  };

  const getFileType = (filename: string): FileItem["type"] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension || '')) return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'Image';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'Document';
    return 'Other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLinkData = {
      title: linkFormData.title,
      url: linkFormData.url,
      description: linkFormData.description,
      tags: linkFormData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      addedAt: new Date().toISOString().split("T")[0],
    };
    const res = await saveLink(newLinkData);
    if (res) {
      toast({ title: "Link saved successfully!" });
    } else {
      toast({ title: "Failed to save link", variant: "destructive" });
    }
    setLinkFormData({ title: "", url: "", description: "", tags: "" });
    setIsLinkDialogOpen(false);
  };

  const getFileIcon = (type: FileItem["type"]) => {
    return <FileText className="text-blue-500" size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Files & Links</h2>
          <p className="text-slate-600">Manage your files and saved links</p>
        </div>
      </div>

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText size={16} />
            Files ({files.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link size={16} />
            Links ({links.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload size={16} className="mr-2" />
                  Add File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New File</DialogTitle>
                  <DialogDescription>
                    Upload a file to your collection.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFileSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>File Upload</Label>
                      <FileUpload 
                        onFileSelect={handleFileSelect}
                        acceptedTypes="*"
                        maxSize={10}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file-name">File Name</Label>
                      <Input
                        id="file-name"
                        value={fileFormData.name}
                        onChange={(e) => setFileFormData({ ...fileFormData, name: e.target.value })}
                        placeholder="Enter file name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file-tags">Tags (comma-separated)</Label>
                      <Input
                        id="file-tags"
                        value={fileFormData.tags}
                        onChange={(e) => setFileFormData({ ...fileFormData, tags: e.target.value })}
                        placeholder="e.g., work, important, pdf"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsFileDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Upload File
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {files.map((file) => (
              <Card key={file.id} className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <CardTitle className="text-lg text-slate-800">{file.name}</CardTitle>
                        <CardDescription>
                          {file.type} • {file.size}
                        </CardDescription>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {file.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag size={10} />
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="flex items-center gap-1 text-slate-600">
                      <Calendar size={10} />
                      {file.addedAt}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus size={16} className="mr-2" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save New Link</DialogTitle>
                  <DialogDescription>
                    Add a useful link to your collection.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLinkSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="link-title">Title</Label>
                      <Input
                        id="link-title"
                        value={linkFormData.title}
                        onChange={(e) => setLinkFormData({ ...linkFormData, title: e.target.value })}
                        placeholder="Enter link title"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        type="url"
                        value={linkFormData.url}
                        onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="link-description">Description</Label>
                      <Input
                        id="link-description"
                        value={linkFormData.description}
                        onChange={(e) => setLinkFormData({ ...linkFormData, description: e.target.value })}
                        placeholder="Brief description of the link"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="link-tags">Tags (comma-separated)</Label>
                      <Input
                        id="link-tags"
                        value={linkFormData.tags}
                        onChange={(e) => setLinkFormData({ ...linkFormData, tags: e.target.value })}
                        placeholder="e.g., tutorial, inspiration, tools"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                      Save Link
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {links.map((link) => (
              <Card key={link.id} className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link className="text-purple-500" size={20} />
                      <div>
                        <CardTitle className="text-lg text-slate-800">{link.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {link.description}
                        </CardDescription>
                        <div className="text-sm text-blue-600 mt-1 truncate">
                          {link.url}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {link.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag size={10} />
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="flex items-center gap-1 text-slate-600">
                      <Calendar size={10} />
                      {link.addedAt}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileManager;
