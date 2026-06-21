export type UserRole = "BUYER" | "SELLER";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  city: string;
  status: "active" | "suspended";
  joinedAt: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  buyer: string;
  seller: string;
  product: string;
  amount: number;
  status: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  seller: string;
  category: string;
  price: number | null;
  stock: number;
  status: "active" | "draft";
}

export interface SupportTicket {
  id: number;
  subject: string;
  user: string;
  role: UserRole;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export const dashboardStats = {
  totalUsers: 248,
  activeBuyers: 186,
  activeSellers: 62,
  totalOrders: 1432,
  pendingOrders: 47,
  totalRevenue: 2847500,
  openTickets: 12,
  activeProducts: 891,
};

export const mockUsers: AdminUser[] = [
  { id: 1, name: "Rajesh Kumar", email: "rajesh@acmecorp.in", role: "BUYER", company: "Acme Corp", city: "Mumbai", status: "active", joinedAt: "2025-11-12" },
  { id: 2, name: "Priya Sharma", email: "priya@buildwell.com", role: "BUYER", company: "BuildWell Ltd", city: "Delhi", status: "active", joinedAt: "2025-10-28" },
  { id: 3, name: "Suresh Patel", email: "suresh@steelworks.in", role: "SELLER", company: "SteelWorks India", city: "Ahmedabad", status: "active", joinedAt: "2025-09-15" },
  { id: 4, name: "Anita Desai", email: "anita@fastsupply.co", role: "SELLER", company: "FastSupply Co", city: "Pune", status: "active", joinedAt: "2025-08-22" },
  { id: 5, name: "Vikram Singh", email: "vikram@infrahub.in", role: "BUYER", company: "InfraHub", city: "Bangalore", status: "suspended", joinedAt: "2025-07-03" },
  { id: 6, name: "Meera Nair", email: "meera@toolmart.in", role: "SELLER", company: "ToolMart", city: "Chennai", status: "active", joinedAt: "2025-06-18" },
];

export const mockOrders: AdminOrder[] = [
  { id: 1, orderNumber: "ORD-2026-0142", buyer: "Rajesh Kumar", seller: "SteelWorks India", product: "Mild Steel Plates 10mm", amount: 125000, status: "PLACED", createdAt: "2026-06-16" },
  { id: 2, orderNumber: "ORD-2026-0141", buyer: "Priya Sharma", seller: "FastSupply Co", product: "Industrial Bearings Set", amount: 34500, status: "CONFIRMED", createdAt: "2026-06-15" },
  { id: 3, orderNumber: "ORD-2026-0140", buyer: "Vikram Singh", seller: "ToolMart", product: "Power Drill 18V", amount: 8900, status: "SHIPPED", createdAt: "2026-06-14" },
  { id: 4, orderNumber: "ORD-2026-0139", buyer: "Rajesh Kumar", seller: "FastSupply Co", product: "Safety Helmets (50pc)", amount: 22000, status: "DELIVERED", createdAt: "2026-06-12" },
  { id: 5, orderNumber: "ORD-2026-0138", buyer: "Priya Sharma", seller: "SteelWorks India", product: "GI Pipes 2 inch", amount: 67800, status: "CANCELLED", createdAt: "2026-06-10" },
];

export const mockProducts: AdminProduct[] = [
  { id: 1, name: "Mild Steel Plates 10mm", seller: "SteelWorks India", category: "Raw Materials", price: 85000, stock: 120, status: "active" },
  { id: 2, name: "Industrial Bearings Set", seller: "FastSupply Co", category: "Components", price: 34500, stock: 45, status: "active" },
  { id: 3, name: "Power Drill 18V", seller: "ToolMart", category: "Tools", price: 8900, stock: 30, status: "active" },
  { id: 4, name: "Safety Helmets (50pc)", seller: "FastSupply Co", category: "Safety", price: 22000, stock: 200, status: "active" },
  { id: 5, name: "Custom Fabrication", seller: "SteelWorks India", category: "Services", price: null, stock: 0, status: "draft" },
];

export const mockTickets: SupportTicket[] = [
  { id: 1, subject: "Order delivery delayed beyond SLA", user: "Rajesh Kumar", role: "BUYER", priority: "high", status: "open", createdAt: "2026-06-16" },
  { id: 2, subject: "Unable to update product catalog", user: "Suresh Patel", role: "SELLER", priority: "medium", status: "in_progress", createdAt: "2026-06-15" },
  { id: 3, subject: "Invoice PDF not generating", user: "Priya Sharma", role: "BUYER", priority: "medium", status: "open", createdAt: "2026-06-14" },
  { id: 4, subject: "Account verification pending", user: "Meera Nair", role: "SELLER", priority: "low", status: "resolved", createdAt: "2026-06-10" },
];

export const recentActivity = [
  { id: 1, action: "New seller registered", detail: "Meera Nair — ToolMart", time: "2 hours ago" },
  { id: 2, action: "Order placed", detail: "ORD-2026-0142 — ₹1,25,000", time: "4 hours ago" },
  { id: 3, action: "Support ticket opened", detail: "Delivery delay — Rajesh Kumar", time: "5 hours ago" },
  { id: 4, action: "Product listed", detail: "Safety Helmets (50pc) — FastSupply Co", time: "1 day ago" },
  { id: 5, action: "User suspended", detail: "Vikram Singh — policy violation", time: "2 days ago" },
];
