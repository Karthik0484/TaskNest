import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Clock, Calendar, Target } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';
import { toast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    dailyReview: true,
    checkInReminder: true,
    deadlineAlerts: true,
    pushNotifications: true,
  });
  
  const [pendingNotifications, setPendingNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadPendingNotifications();
  }, []);

  const loadPendingNotifications = async () => {
    try {
      const notifications = await NotificationService.getPendingNotifications();
      setPendingNotifications(notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSettingChange = async (setting: string, enabled: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: enabled }));
    
    if (setting === 'dailyReview' && enabled) {
      await NotificationService.scheduleDailyReview();
      toast({ title: 'Daily review reminders enabled' });
    } else if (setting === 'checkInReminder' && enabled) {
      await NotificationService.scheduleCheckInReminder();
      toast({ title: 'Check-in reminders enabled' });
    }
    
    loadPendingNotifications();
  };

  const clearAllNotifications = async () => {
    await NotificationService.clearAllNotifications();
    setPendingNotifications([]);
    toast({ title: 'All notifications cleared' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'daily_review':
        return <Clock className="text-blue-500" size={16} />;
      case 'check_in':
        return <Bell className="text-orange-500" size={16} />;
      case 'deadline':
        return <Target className="text-red-500" size={16} />;
      default:
        return <Calendar className="text-slate-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-blue-500" size={20} />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your push notifications and reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-review" className="text-base">Daily Review</Label>
              <p className="text-sm text-slate-500">Remind me to review my progress daily at 6 PM</p>
            </div>
            <Switch
              id="daily-review"
              checked={settings.dailyReview}
              onCheckedChange={(checked) => handleSettingChange('dailyReview', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="check-in" className="text-base">Check-in Reminders</Label>
              <p className="text-sm text-slate-500">Remind me to log activity if I haven't checked in today</p>
            </div>
            <Switch
              id="check-in"
              checked={settings.checkInReminder}
              onCheckedChange={(checked) => handleSettingChange('checkInReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="deadline-alerts" className="text-base">Deadline Alerts</Label>
              <p className="text-sm text-slate-500">Notify me when task deadlines are approaching</p>
            </div>
            <Switch
              id="deadline-alerts"
              checked={settings.deadlineAlerts}
              onCheckedChange={(checked) => handleSettingChange('deadlineAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
              <p className="text-sm text-slate-500">Enable push notifications on mobile devices</p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-green-500" size={20} />
                Scheduled Notifications
              </CardTitle>
              <CardDescription>
                View and manage your upcoming notifications
              </CardDescription>
            </div>
            <Button variant="outline" onClick={clearAllNotifications}>
              <BellOff size={16} className="mr-2" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingNotifications.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              No scheduled notifications
            </div>
          ) : (
            <div className="space-y-3">
              {pendingNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(notification.extra?.type)}
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {notification.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {notification.body}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {notification.schedule?.at ? 
                      new Date(notification.schedule.at).toLocaleDateString() : 
                      'Scheduled'
                    }
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
