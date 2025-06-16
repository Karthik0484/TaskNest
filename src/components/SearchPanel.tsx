
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, CheckCircle, Clock, Calendar, FileText, Link, Tag, ExternalLink } from "lucide-react";

interface SearchResult {
  id: number;
  type: "task" | "file" | "link";
  title: string;
  description: string;
  tags: string[];
  date: string;
  status?: "In Progress" | "Completed" | "Deferred";
  url?: string;
}

const SearchPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock search results
  const allResults: SearchResult[] = [
    {
      id: 1,
      type: "task",
      title: "Design homepage mockup",
      description: "Create wireframes and visual design for the new homepage",
      tags: ["design", "ui"],
      date: "2025-06-15",
      status: "In Progress",
    },
    {
      id: 2,
      type: "task",
      title: "Write API documentation",
      description: "Document all REST endpoints for the user management system",
      tags: ["writing", "api"],
      date: "2025-06-12",
      status: "Completed",
    },
    {
      id: 3,
      type: "file",
      title: "Project_Proposal.pdf",
      description: "Detailed project proposal and timeline",
      tags: ["work", "proposal"],
      date: "2025-06-14",
    },
    {
      id: 4,
      type: "link",
      title: "React Documentation",
      description: "Official React documentation and guides",
      tags: ["coding", "react", "documentation"],
      date: "2025-06-13",
      url: "https://react.dev",
    },
    {
      id: 5,
      type: "task",
      title: "Team standup meeting",
      description: "Weekly team sync and progress updates",
      tags: ["meeting", "team"],
      date: "2025-06-16",
      status: "Completed",
    },
    {
      id: 6,
      type: "file",
      title: "Design_System.png",
      description: "UI component library and design tokens",
      tags: ["design", "ui", "system"],
      date: "2025-06-11",
    },
  ];

  const filteredResults = allResults.filter(result => {
    const matchesQuery = !searchQuery || 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || result.type === typeFilter;
    
    const matchesTag = tagFilter === "all" || result.tags.includes(tagFilter);
    
    const matchesDate = dateFilter === "all" || result.date === dateFilter;
    
    return matchesQuery && matchesType && matchesTag && matchesDate;
  });

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "task":
        return <CheckCircle className="text-blue-500" size={18} />;
      case "file":
        return <FileText className="text-orange-500" size={18} />;
      case "link":
        return <Link className="text-purple-500" size={18} />;
    }
  };

  const getStatusIcon = (status?: SearchResult["status"]) => {
    if (!status) return null;
    switch (status) {
      case "Completed":
        return <CheckCircle className="text-green-500" size={14} />;
      case "In Progress":
        return <Clock className="text-blue-500" size={14} />;
      case "Deferred":
        return <Calendar className="text-orange-500" size={14} />;
    }
  };

  const getStatusColor = (status?: SearchResult["status"]) => {
    if (!status) return "";
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Deferred":
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  // Get unique tags and dates for filter options
  const allTags = Array.from(new Set(allResults.flatMap(r => r.tags))).sort();
  const allDates = Array.from(new Set(allResults.map(r => r.date))).sort().reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Search & Filter</h2>
        <p className="text-slate-600">Find tasks, files, and links across your workspace</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="text-blue-500" size={20} />
            Search
          </CardTitle>
          <CardDescription>Search across all your tasks, files, and links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search tasks, files, links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="link">Links</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                {allDates.map(date => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || typeFilter !== "all" || tagFilter !== "all" || dateFilter !== "all") && (
            <div className="flex items-center gap-2 mt-4">
              <Filter size={16} className="text-slate-500" />
              <span className="text-sm text-slate-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-red-500">×</button>
                </Badge>
              )}
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {typeFilter}
                  <button onClick={() => setTypeFilter("all")} className="ml-1 hover:text-red-500">×</button>
                </Badge>
              )}
              {tagFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {tagFilter}
                  <button onClick={() => setTagFilter("all")} className="ml-1 hover:text-red-500">×</button>
                </Badge>
              )}
              {dateFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {dateFilter}
                  <button onClick={() => setDateFilter("all")} className="ml-1 hover:text-red-500">×</button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Results ({filteredResults.length})
          </h3>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({filteredResults.length})</TabsTrigger>
            <TabsTrigger value="task">
              Tasks ({filteredResults.filter(r => r.type === "task").length})
            </TabsTrigger>
            <TabsTrigger value="file">
              Files ({filteredResults.filter(r => r.type === "file").length})
            </TabsTrigger>
            <TabsTrigger value="link">
              Links ({filteredResults.filter(r => r.type === "link").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No results found</h3>
                  <p className="text-slate-500">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredResults.map((result) => (
                <Card key={result.id} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getResultIcon(result.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-800">{result.title}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{result.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {result.status && (
                              <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(result.status)}`}>
                                {getStatusIcon(result.status)}
                                {result.status}
                              </Badge>
                            )}
                            {result.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                                <Tag size={8} />
                                {tag}
                              </Badge>
                            ))}
                            <Badge variant="outline" className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar size={8} />
                              {result.date}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {result.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {["task", "file", "link"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-3">
              {filteredResults
                .filter((r) => r.type === type)
                .map((result) => (
                  <Card key={result.id} className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getResultIcon(result.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 mb-1">{result.title}</h4>
                            <p className="text-sm text-slate-600 mb-2">{result.description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              {result.status && (
                                <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(result.status)}`}>
                                  {getStatusIcon(result.status)}
                                  {result.status}
                                </Badge>
                              )}
                              {result.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                                  <Tag size={8} />
                                  {tag}
                                </Badge>
                              ))}
                              <Badge variant="outline" className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar size={8} />
                                {result.date}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {result.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SearchPanel;
