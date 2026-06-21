"use client";

import { useEffect } from "react";
import { useNotifications } from "@/hooks/admin-useNotifications";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function NotificationsList() {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-surface border border-border rounded-xl">
        <p className="text-muted">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface border border-border rounded-xl text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-surface-2 flex items-center justify-center text-muted">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ink">No notifications yet</h3>
        <p className="text-muted max-w-sm mt-1">When there are updates about your orders, inquiries, or support tickets, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-1">
        <h2 className="text-lg font-semibold text-ink">Notifications</h2>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 transition-colors cursor-pointer hover:bg-surface-2 ${notification.isRead ? 'bg-surface' : 'bg-surface-1'}`}
            onClick={() => {
              if (!notification.isRead) markAsRead(notification.id);
            }}
          >
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                {notification.type === 'SUPPORT_TICKET' && (
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
                {notification.type !== 'SUPPORT_TICKET' && (
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-muted">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-semibold truncate ${notification.isRead ? 'text-ink' : 'text-brand-900'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className={`text-sm mt-1 line-clamp-2 ${notification.isRead ? 'text-muted' : 'text-ink'}`}>
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <div className="shrink-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-brand-600 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
