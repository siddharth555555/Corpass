"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import { type AdminProduct } from "@/lib/admin-mock-data";
import { formatCurrency, statusColor } from "@/lib/admin-utils";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);
  const columns = [
    { key: "name", header: "Product" },
    { key: "seller", header: "Seller" },
    { key: "category", header: "Category" },
    { key: "price", header: "Price", render: (row: AdminProduct) =>
      row.price != null ? formatCurrency(row.price) : <span className="text-slate italic">Quote</span>
    },
    { key: "stock", header: "Stock" },
    { key: "status", header: "Status", render: (row: AdminProduct) => (
      <span className={`status-badge ${statusColor(row.status)}`}>{row.status}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink tracking-tight font-semibold">Products</h2>
        <p className="text-sm text-slate mt-1">Browse all catalog listings across sellers.</p>
      </div>

      <div className="bg-paper border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate">Loading products...</div>
        ) : (
          <DataTable columns={columns} data={products} keyField="id" />
        )}
      </div>
    </div>
  );
}
