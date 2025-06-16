import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import TaskManager from "@/components/TaskManager";
import FileManager from "@/components/FileManager";
import Calendar from "@/components/Calendar";
import Analytics from "@/components/Analytics";
import SearchPanel from "@/components/SearchPanel";
import NotificationSettings from "@/components/NotificationSettings";
import { TaskProvider } from "@/contexts/TaskContext";
import { FileProvider } from "@/contexts/FileContext";
import { useNotifications } from "@/hooks/useNotifications";
import { CalendarProvider } from "@/contexts/CalendarContext";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Call useNotifications at the top-level of the component, not inside useEffect
  useNotifications();

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <TaskManager />;
      case "files":
        return <FileManager />;
      case "calendar":
        return <Calendar />;
      case "analytics":
        return <Analytics />;
      case "search":
        return <SearchPanel />;
      case "notifications":
        return <NotificationSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Track<span className="text-blue-600">Nest</span>
          </h1>
          <p className="text-slate-600">Your productivity and performance tracking hub</p>
        </header>
        
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="mt-8">
          {renderActiveComponent()}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

const Index = () => {
  return (
    <TaskProvider>
      <FileProvider>
        <CalendarProvider>
          <AppContent />
        </CalendarProvider>
      </FileProvider>
    </TaskProvider>
  );
};

export default Index;
