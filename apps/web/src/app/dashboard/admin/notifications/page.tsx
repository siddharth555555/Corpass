"use client";

import { NotificationsList } from "@/components/admin/NotificationsList";

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-ink mb-6">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
