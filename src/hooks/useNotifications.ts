
import { useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/NotificationService';

// Convert task.id (string) to numeric notification ID (must match TaskManager approach)
const notificationIdForTask = (taskId: string) => {
  return (
    1000 +
    Array.from(taskId)
      .map((c) => c.charCodeAt(0))
      .reduce((a, b) => a + b, 0)
  );
};

export const useNotifications = () => {
  const { tasks } = useTaskContext();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const initNotifications = async () => {
      try {
        await NotificationService.requestPermission();
        await NotificationService.scheduleDailyReview();
        await NotificationService.scheduleCheckInReminder();

        for (const task of tasks) {
          if (task.deadline && task.status !== 'Completed') {
            await NotificationService.scheduleDeadlineReminder(
              task.title,
              task.deadline,
              notificationIdForTask(task.id)
            );
          }
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initNotifications();
  }, [tasks, user]);
};
