"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { type AdminUser } from "@/lib/mock-data";
import { statusColor } from "@/lib/utils";

export default function UsersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "BUYER" | "SELLER">("ALL");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`http://${window.location.hostname}:3001/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const filtered =
    filter === "ALL" ? users : users.filter((u) => u.role === filter);

  const columns = [
    { key: "name", header: "Name", render: (row: AdminUser) => (
      <div>
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-slate">{row.email}</p>
      </div>
    )},
    { key: "role", header: "Role", render: (row: AdminUser) => (
      <span className={`status-badge ${row.role === "BUYER" ? "bg-info-bg text-info" : "bg-brand/10 text-brand"}`}>
        {row.role}
      </span>
    )},
    { key: "company", header: "Company" },
    { key: "city", header: "City" },
    { key: "status", header: "Status", render: (row: AdminUser) => (
      <span className={`status-badge ${statusColor(row.status)}`}>{row.status}</span>
    )},
    { key: "joinedAt", header: "Joined" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-ink tracking-tight font-semibold">Users</h2>
          <p className="text-sm text-slate mt-1">Manage buyers and sellers on the platform.</p>
        </div>
        <div className="flex gap-2">
          {(["ALL", "BUYER", "SELLER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === f ? "bg-ink text-paper" : "bg-paper border border-border text-slate hover:text-ink"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-paper border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate">Loading users...</div>
        ) : (
          <DataTable columns={columns} data={filtered} keyField="id" />
        )}
      </div>
    </div>
  );
}
