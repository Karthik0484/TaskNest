import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Calendar, Tag } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useFile } from "@/contexts/FileContext";

const Analytics = () => {
  const { tasks } = useTaskContext();
  const { files, links } = useFile();

  // Generate weekly data from actual tasks
  const generateWeeklyData = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const completed = tasks.filter(task => 
        task.status === "Completed" && task.completedAt === dateStr
      ).length;
      
      const total = tasks.filter(task => 
        task.createdAt === dateStr || task.completedAt === dateStr
      ).length;

      weekData.push({
        day: weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1],
        completed,
        total: Math.max(total, completed)
      });
    }
    return weekData;
  };

  // Generate monthly trend from actual tasks
  const generateMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const monthData = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      
      const completed = tasks.filter(task => {
        if (!task.completedAt) return false;
        const taskDate = new Date(task.completedAt);
        return taskDate.getMonth() === monthIndex;
      }).length;

      monthData.push({
        month: monthName,
        completed
      });
    }
    return monthData;
  };

  // Generate category breakdown from tasks
  const generateCategoryData = () => {
    const tagCounts: { [key: string]: number } = {};
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return sortedTags.map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[index] || '#6b7280'
    }));
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const completedThisWeek = tasks.filter(task => 
      task.status === "Completed" && 
      task.completedAt && 
      new Date(task.completedAt) > thisWeek
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "Completed").length;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const avgDaily = completedThisWeek / 7;

    const categoryData = generateCategoryData();
    const mostActiveCategory = categoryData.length > 0 ? categoryData[0].name : "None";
    const mostActivePct = categoryData.length > 0 ? 
      Math.round((categoryData[0].value / totalTasks) * 100) : 0;

    return {
      completedThisWeek,
      avgDaily: Math.round(avgDaily * 10) / 10,
      successRate,
      mostActiveCategory,
      mostActivePct
    };
  };

  // Generate insights
  const generateInsights = () => {
    const metrics = calculateMetrics();
    const insights = [];

    if (metrics.completedThisWeek > 0) {
      insights.push({
        type: 'success',
        title: `Great productivity this week!`,
        description: `You completed ${metrics.completedThisWeek} tasks this week with a ${metrics.successRate}% overall success rate.`
      });
    }

    if (metrics.avgDaily > 1) {
      insights.push({
        type: 'info',
        title: `Consistent daily progress`,
        description: `You're averaging ${metrics.avgDaily} tasks per day. Keep up the momentum!`
      });
    }

    if (metrics.mostActiveCategory !== "None") {
      insights.push({
        type: 'warning',
        title: `Focus area: ${metrics.mostActiveCategory}`,
        description: `${metrics.mostActivePct}% of your tasks are ${metrics.mostActiveCategory.toLowerCase()}-related. You're building strong expertise in this area.`
      });
    }

    return insights;
  };

  const weeklyData = generateWeeklyData();
  const monthlyTrend = generateMonthlyTrend();
  const categoryData = generateCategoryData();
  const metrics = calculateMetrics();
  const insights = generateInsights();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
        <p className="text-slate-600">Insights into your productivity patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span className="text-2xl font-bold">{metrics.completedThisWeek}</span>
              <span className="text-sm opacity-90">tasks completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Average Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="text-blue-500" size={20} />
              <span className="text-2xl font-bold text-slate-800">{metrics.avgDaily}</span>
              <span className="text-sm text-slate-500">tasks/day</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="text-purple-500" size={20} />
              <span className="text-2xl font-bold text-slate-800">{metrics.successRate}%</span>
              <span className="text-sm text-slate-500">completion</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Most Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tag className="text-orange-500" size={20} />
              <span className="text-lg font-bold text-slate-800">{metrics.mostActiveCategory}</span>
              {metrics.mostActivePct > 0 && (
                <Badge variant="secondary" className="text-xs">{metrics.mostActivePct}%</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Tasks completed vs. planned this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#e2e8f0" name="Planned" />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Task completion over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Categories</CardTitle>
            <CardDescription>Breakdown of tasks by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No task categories yet. Add tags to your tasks to see this breakdown.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
            <CardDescription>Overview of your data across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                  <div className="text-sm text-slate-600">Total Tasks</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === "Completed").length}
                  </div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{files.length}</div>
                  <div className="text-sm text-slate-600">Files Stored</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{links.length}</div>
                  <div className="text-sm text-slate-600">Links Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Auto-generated insights based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const bgColor = insight.type === 'success' ? 'bg-green-50 border-green-200' :
                             insight.type === 'info' ? 'bg-blue-50 border-blue-200' :
                             'bg-orange-50 border-orange-200';
              const dotColor = insight.type === 'success' ? 'bg-green-500' :
                              insight.type === 'info' ? 'bg-blue-500' :
                              'bg-orange-500';
              const textColor = insight.type === 'success' ? 'text-green-800' :
                               insight.type === 'info' ? 'text-blue-800' :
                               'text-orange-800';
              const descColor = insight.type === 'success' ? 'text-green-700' :
                               insight.type === 'info' ? 'text-blue-700' :
                               'text-orange-700';

              return (
                <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${bgColor}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${dotColor}`}></div>
                  <div>
                    <div className={`font-medium ${textColor}`}>{insight.title}</div>
                    <div className={`text-sm ${descColor}`}>{insight.description}</div>
                  </div>
                </div>
              );
            })}
            {insights.length === 0 && (
              <div className="text-center text-slate-500 py-4">
                Start adding tasks, files, and links to see personalized insights here!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
