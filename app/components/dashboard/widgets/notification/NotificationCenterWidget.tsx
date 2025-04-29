import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-intl';
import Link from 'next/link';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { WidgetProps } from '@/lib/types/widget';

// Notification type definitions
enum NotificationType {
  TASK = 'TASK',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  WEATHER = 'WEATHER',
  ADMIN = 'ADMIN'
}

enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  projectId?: string;
  taskId?: string;
  userId?: string;
  requiresAcknowledgement?: boolean;
  acknowledged?: boolean;
}

// Mock service for notifications
const fetchNotifications = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  
  // Create notifications with various timestamps
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  // Generate mock notifications
  return {
    notifications: [
      {
        id: 'notif-001',
        type: NotificationType.TASK,
        title: 'Task Overdue',
        message: 'The task "Site inspection for foundation" is now overdue.',
        timestamp: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
        read: false,
        priority: NotificationPriority.HIGH,
        actionUrl: '/dashboard/tasks/task-003',
        projectId: 'proj-002',
        taskId: 'task-003'
      },
      {
        id: 'notif-002',
        type: NotificationType.MESSAGE,
        title: 'New Comment',
        message: 'Carlos Rodriguez commented on "Equipment rental scheduling"',
        timestamp: new Date(now.getTime() - 2 * 60 * 60000), // 2 hours ago
        read: true,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/dashboard/tasks/task-302',
        taskId: 'task-302',
        userId: 'user-003'
      },
      {
        id: 'notif-003',
        type: NotificationType.SYSTEM,
        title: 'Backup Completed',
        message: 'Weekly project data backup completed successfully.',
        timestamp: yesterday,
        read: true,
        priority: NotificationPriority.LOW
      },
      {
        id: 'notif-004',
        type: NotificationType.WEATHER,
        title: 'Weather Alert',
        message: 'Heavy rain forecasted for Highland Park Residence site tomorrow.',
        timestamp: new Date(now.getTime() - 5 * 60 * 60000), // 5 hours ago
        read: false,
        priority: NotificationPriority.MEDIUM,
        projectId: 'proj-002'
      },
      {
        id: 'notif-005',
        type: NotificationType.ADMIN,
        title: 'License Expiring',
        message: 'Your BuildTrack Pro license will expire in 15 days.',
        timestamp: new Date(now.getTime() - 8 * 60 * 60000), // 8 hours ago
        read: false,
        priority: NotificationPriority.MEDIUM
      },
      {
        id: 'notif-006',
        type: NotificationType.TASK,
        title: 'Task Assigned',
        message: 'You have been assigned to "Material delivery confirmation"',
        timestamp: yesterday,
        read: true,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/dashboard/tasks/task-505',
        projectId: 'proj-002',
        taskId: 'task-505'
      },
      {
        id: 'notif-007',
        type: NotificationType.SYSTEM,
        title: 'System Maintenance',
        message: 'BuildTrack Pro will be undergoing maintenance on Sunday at 2 AM EST.',
        timestamp: lastWeek,
        read: true,
        priority: NotificationPriority.LOW,
        requiresAcknowledgement: true,
        acknowledged: false
      },
      {
        id: 'notif-008',
        type: NotificationType.ADMIN,
        title: 'Critical Security Update',
        message: 'A critical security update has been applied to your account.',
        timestamp: new Date(now.getTime() - 20 * 60000), // 20 minutes ago
        read: false,
        priority: NotificationPriority.CRITICAL,
        requiresAcknowledgement: true,
        acknowledged: false
      }
    ],
    unreadCount: 4,
    criticalCount: 1
  };
};

// Helper function to group notifications by date
const groupNotificationsByDate = (notifications: Notification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeek = new Date(today);
  thisWeek.setDate(today.getDate() - 7);
  
  return notifications.reduce((groups: Record<string, Notification[]>, notification) => {
    const notifDate = new Date(notification.timestamp);
    notifDate.setHours(0, 0, 0, 0);
    
    let groupKey: string;
    
    if (notifDate.getTime() === today.getTime()) {
      groupKey = 'today';
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groupKey = 'yesterday';
    } else if (notifDate.getTime() >= thisWeek.getTime()) {
      groupKey = 'thisWeek';
    } else {
      groupKey = 'earlier';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(notification);
    
    return groups;
  }, {});
};

// Helper function to format relative time
const formatRelativeTime = (timestamp: Date, t: any) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return t('notification.justNow');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return t('notification.minutesAgo', { count: diffInMinutes });
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t('notification.hoursAgo', { count: diffInHours });
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return t('notification.daysAgo', { count: diffInDays });
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return t('notification.weeksAgo', { count: diffInWeeks });
};

// Helper function to get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.TASK:
      return (
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case NotificationType.MESSAGE:
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case NotificationType.SYSTEM:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case NotificationType.WEATHER:
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case NotificationType.ADMIN:
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// Helper function to get priority style
const getPriorityStyle = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.LOW:
      return '';
    case NotificationPriority.MEDIUM:
      return 'border-l-4 border-blue-400 dark:border-blue-600';
    case NotificationPriority.HIGH:
      return 'border-l-4 border-orange-400 dark:border-orange-600';
    case NotificationPriority.CRITICAL:
      return 'border-l-4 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/10';
    default:
      return '';
  }
};

// Filter options
const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'task', label: 'Tasks' },
  { value: 'message', label: 'Messages' },
  { value: 'system', label: 'System' },
  { value: 'weather', label: 'Weather' },
  { value: 'admin', label: 'Admin' }
];

const NotificationCenterWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslation('dashboard');
  const [notificationsData, setNotificationsData] = useState<any | null>(null);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState('all');
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNotifications();
        setNotificationsData(data);
        setFilteredNotifications(data.notifications);
        setError(null);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError(err instanceof Error ? err : new Error('Failed to load notifications'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadNotifications, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [settings]);
  
  // Apply filter
  useEffect(() => {
    if (!notificationsData) return;
    
    let filtered = [...notificationsData.notifications];
    
    // Apply selected filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      // Filter by notification type
      const typeFilter = filter.toUpperCase() as NotificationType;
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    
    // Sort notifications by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredNotifications(filtered);
  }, [filter, notificationsData]);
  
  // Mark notification as read
  const handleMarkAsRead = (notificationId: string) => {
    if (!notificationsData) return;
    
    const updatedNotifications = notificationsData.notifications.map((notification: Notification) => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    const unreadCount = updatedNotifications.filter((n: Notification) => !n.read).length;
    
    setNotificationsData({
      ...notificationsData,
      notifications: updatedNotifications,
      unreadCount
    });
    
    // Apply current filter to updated notifications
    let filtered = [...updatedNotifications];
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      const typeFilter = filter.toUpperCase() as NotificationType;
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredNotifications(filtered);
    
    // In a real implementation, this would call an API to mark the notification as read
    console.log(`Marking notification ${notificationId} as read`);
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (!notificationsData) return;
    
    const updatedNotifications = notificationsData.notifications.map((notification: Notification) => {
      return { ...notification, read: true };
    });
    
    setNotificationsData({
      ...notificationsData,
      notifications: updatedNotifications,
      unreadCount: 0
    });
    
    // Apply current filter to updated notifications
    let filtered = [...updatedNotifications];
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      const typeFilter = filter.toUpperCase() as NotificationType;
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredNotifications(filtered);
    
    // In a real implementation, this would call an API to mark all notifications as read
    console.log('Marking all notifications as read');
  };
  
  // Acknowledge notification
  const handleAcknowledge = (notificationId: string) => {
    if (!notificationsData) return;
    
    const updatedNotifications = notificationsData.notifications.map((notification: Notification) => {
      if (notification.id === notificationId) {
        return { ...notification, read: true, acknowledged: true };
      }
      return notification;
    });
    
    const unreadCount = updatedNotifications.filter((n: Notification) => !n.read).length;
    
    setNotificationsData({
      ...notificationsData,
      notifications: updatedNotifications,
      unreadCount
    });
    
    // Apply current filter to updated notifications
    let filtered = [...updatedNotifications];
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      const typeFilter = filter.toUpperCase() as NotificationType;
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredNotifications(filtered);
    
    // In a real implementation, this would call an API to acknowledge the notification
    console.log(`Acknowledging notification ${notificationId}`);
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p>{t('widget.errorLoading')}</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }
  
  if (!notificationsData || filteredNotifications.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <BellIcon className="w-8 h-8 mb-2" />
        <p>{
          filter === 'all' 
            ? t('notification.noNotifications') 
            : t('notification.noFilteredNotifications')
        }</p>
      </div>
    );
  }
  
  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  
  return (
    <div className="h-full flex flex-col">
      {/* Notification Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-hide">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                filter === option.value
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t(`notification.filter.${option.value}`)}
              {option.value === 'all' && notificationsData.unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                  {notificationsData.unreadCount}
                </span>
              )}
              {option.value === 'unread' && notificationsData.unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                  {notificationsData.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleMarkAllAsRead}
          disabled={notificationsData.unreadCount === 0}
          className={`flex items-center px-2 py-1 text-xs rounded ${
            notificationsData.unreadCount > 0
              ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <CheckIcon className="w-3 h-3 mr-1" />
          {t('notification.markAllRead')}
        </button>
      </div>
      
      {/* Notification List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {Object.entries(groupedNotifications).map(([dateGroup, notifications]) => (
          <div key={dateGroup}>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
              {t(`notification.dateGroup.${dateGroup}`)}
            </h3>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                  } ${getPriorityStyle(notification.priority)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                          {formatRelativeTime(notification.timestamp, t)}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        {notification.actionUrl ? (
                          <Link 
                            href={notification.actionUrl}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            {t('notification.viewDetails')}
                          </Link>
                        ) : (
                          <span></span>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {notification.requiresAcknowledgement && !notification.acknowledged && (
                            <button
                              onClick={() => handleAcknowledge(notification.id)}
                              className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 dark:text-blue-400 rounded"
                            >
                              {t('notification.acknowledge')}
                            </button>
                          )}
                          
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              {t('notification.markRead')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Widget Footer */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href="/dashboard/notifications"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          {t('notification.viewAll')} 
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default NotificationCenterWidget;
