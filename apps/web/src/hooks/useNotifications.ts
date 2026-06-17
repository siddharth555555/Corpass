import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`http://${window.location.hostname}:3001/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
      
      const resMsgs = await fetch(`http://${window.location.hostname}:3001/notifications/unread-count?type=MESSAGE`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resMsgs.ok) {
        const dataMsgs = await resMsgs.json();
        setUnreadMessagesCount(dataMsgs.count);
      }
    } catch (e) {
      console.error('Failed to fetch unread count', e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`http://${window.location.hostname}:3001/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://${window.location.hostname}:3001/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        return newCount;
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notifications_updated'));
      }
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://${window.location.hostname}:3001/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notifications_updated'));
      }
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s

    const handleUpdate = () => fetchUnreadCount();
    if (typeof window !== 'undefined') {
      window.addEventListener('notifications_updated', handleUpdate);
      window.addEventListener('focus', handleUpdate);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('notifications_updated', handleUpdate);
        window.removeEventListener('focus', handleUpdate);
      }
    };
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    unreadMessagesCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };
}
