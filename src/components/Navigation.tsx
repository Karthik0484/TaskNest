
import { Button } from "@/components/ui/button";
import { Home, CheckSquare, FolderOpen, Calendar, BarChart3, Search } from "lucide-react";
import UserMenu from "./UserMenu";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "files", label: "Files & Links", icon: FolderOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "search", label: "Search", icon: Search },
  ];

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <IconComponent size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          );
        })}
      </div>
      <UserMenu />
    </nav>
  );
};

export default Navigation;
