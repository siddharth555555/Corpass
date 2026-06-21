"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { type AdminOrder } from "@/lib/mock-data";
import { formatCurrency, statusColor } from "@/lib/utils";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);
  const columns = [
    { key: "orderNumber", header: "Order #" },
    { key: "product", header: "Product" },
    { key: "buyer", header: "Buyer" },
    { key: "seller", header: "Seller" },
    { key: "amount", header: "Amount", render: (row: AdminOrder) => formatCurrency(row.amount) },
    { key: "status", header: "Status", render: (row: AdminOrder) => (
      <span className={`status-badge ${statusColor(row.status)}`}>{row.status}</span>
    )},
    { key: "createdAt", header: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink tracking-tight font-semibold">Orders</h2>
        <p className="text-sm text-slate mt-1">View and manage all marketplace orders.</p>
      </div>

      <div className="bg-paper border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate">Loading orders...</div>
        ) : (
          <DataTable columns={columns} data={orders} keyField="id" />
        )}
      </div>
    </div>
  );
}
