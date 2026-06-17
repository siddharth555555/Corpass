"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { type SupportTicket } from "@/lib/mock-data";
import { statusColor } from "@/lib/utils";

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`http://${window.location.hostname}:3001/admin/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);
  const columns = [
    { key: "subject", header: "Subject" },
    { key: "user", header: "User", render: (row: SupportTicket) => (
      <div>
        <p className="font-medium">{row.user}</p>
        <p className="text-xs text-slate">{row.role}</p>
      </div>
    )},
    { key: "priority", header: "Priority", render: (row: SupportTicket) => (
      <span className={`status-badge ${statusColor(row.priority)}`}>{row.priority}</span>
    )},
    { key: "status", header: "Status", render: (row: SupportTicket) => (
      <span className={`status-badge ${statusColor(row.status)}`}>{row.status.replace("_", " ")}</span>
    )},
    { key: "createdAt", header: "Created" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink tracking-tight font-semibold">Support Tickets</h2>
        <p className="text-sm text-slate mt-1">Track and resolve user support requests.</p>
      </div>

      <div className="bg-paper border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate">Loading tickets...</div>
        ) : (
          <DataTable columns={columns} data={tickets} keyField="id" />
        )}
      </div>
    </div>
  );
}
