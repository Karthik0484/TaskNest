import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Link, TrendingUp, Target } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useFile } from "@/contexts/FileContext";

const Dashboard = () => {
  const { tasks } = useTaskContext();
  const { files, links } = useFile();

  // Calculate stats from actual data
  const today = new Date().toISOString().split("T")[0];
  const tasksCompletedToday = tasks.filter(task => 
    task.status === "Completed" && task.completedAt === today
  ).length;
  const totalTasksToday = tasks.filter(task => 
    task.status === "In Progress" || 
    (task.status === "Completed" && task.completedAt === today)
  ).length;

  const filesAddedToday = files.filter(file => file.addedAt === today).length;
  const linksAddedToday = links.filter(link => link.addedAt === today).length;

  // Get recent items
  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const recentFiles = files
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 3);

  const recentLinks = links
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 3);

  const todayStats = {
    tasksCompleted: tasksCompletedToday,
    tasksTotal: Math.max(totalTasksToday, tasksCompletedToday),
    filesAdded: filesAddedToday,
    linksAdded: linksAddedToday,
  };

  const completionPercentage = todayStats.tasksTotal > 0 
    ? Math.round((todayStats.tasksCompleted / todayStats.tasksTotal) * 100)
    : 0;

  // Get upcoming deadlines
  const upcomingDeadlines = tasks
    .filter(task => task.deadline && task.status !== "Completed")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 2);

  // Calculate performance streak (simplified)
  const getPerformanceStreak = () => {
    let streak = 0;
    const sortedTasks = tasks
      .filter(task => task.status === "Completed" && task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
    let currentDate = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const hasTasksOnDate = sortedTasks.some(task => task.completedAt === dateStr);
      if (hasTasksOnDate) {
        streak++;
      } else if (dateStr !== today) {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.tasksCompleted}/{todayStats.tasksTotal}</div>
            <Progress value={completionPercentage} className="mt-2 bg-blue-400/30" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Performance Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-500" size={20} />
              <span className="text-2xl font-bold text-slate-800">{getPerformanceStreak()}</span>
              <span className="text-sm text-slate-500">days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Files Added Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="text-orange-500" size={20} />
              <span className="text-2xl font-bold text-slate-800">{todayStats.filesAdded}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Links Saved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Link className="text-purple-500" size={20} />
              <span className="text-2xl font-bold text-slate-800">{todayStats.linksAdded}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-blue-500" size={20} />
              Recent Tasks
            </CardTitle>
            <CardDescription>Your latest task activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {task.status === "Completed" ? (
                    <CheckCircle className="text-green-500" size={16} />
                  ) : (
                    <Clock className="text-orange-500" size={16} />
                  )}
                  <span className={`text-sm ${task.status === "Completed" ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {task.tags.slice(0, 1).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <div className="text-center text-slate-500 py-4">
                No tasks yet. Create your first task!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-orange-500" size={20} />
              Recent Files
            </CardTitle>
            <CardDescription>Recently added files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-700">{file.name}</div>
                  <div className="text-xs text-slate-500">{file.type}</div>
                </div>
                {file.addedAt === today && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                    Today
                  </Badge>
                )}
              </div>
            ))}
            {recentFiles.length === 0 && (
              <div className="text-center text-slate-500 py-4">
                No files yet. Upload your first file!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="text-purple-500" size={20} />
              Recent Links
            </CardTitle>
            <CardDescription>Recently saved links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-700">{link.title}</div>
                  <div className="text-xs text-slate-500 truncate">{link.url}</div>
                </div>
                {link.addedAt === today && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                    Today
                  </Badge>
                )}
              </div>
            ))}
            {recentLinks.length === 0 && (
              <div className="text-center text-slate-500 py-4">
                No links yet. Save your first link!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-red-500" size={20} />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Tasks with approaching deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => {
              const daysUntilDeadline = Math.ceil(
                (new Date(task.deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysUntilDeadline <= 2;
              
              return (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  isUrgent ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                }`}>
                  <div>
                    <div className="text-sm font-medium text-slate-700">{task.title}</div>
                    <div className={`text-xs ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                      Due in {daysUntilDeadline} days
                    </div>
                  </div>
                  <Badge variant={isUrgent ? "destructive" : "outline"} className={`text-xs ${
                    !isUrgent ? 'text-yellow-600 border-yellow-200' : ''
                  }`}>
                    {isUrgent ? 'High Priority' : 'Medium Priority'}
                  </Badge>
                </div>
              );
            })}
            {upcomingDeadlines.length === 0 && (
              <div className="text-center text-slate-500 py-4">
                No upcoming deadlines
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
