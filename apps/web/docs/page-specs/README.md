# Corpass Page Specification & Design Docs

This directory contains detailed layout, feature, and interaction specification documents for all pages in the Corpass web application. These documents are structured specifically for product designers and UI/UX developers to build high-fidelity wireframes, components, and interactive prototypes.

## Table of Contents

### 1. [Public & Authentication Pages](file:///Users/siddharth/Github/Corpass/apps/web/docs/page-specs/public.md)
*   **Landing Page (`/`)**: Corporate landing and marketing page with navigation, hero area, and feature grid.
*   **Login Workspace (`/login`)**: Secure role-based portal login with a dynamic switch.
*   **Register Workspace (`/register`)**: Unified registration wizard with step-by-step conditional configurations.

### 2. [Buyer Workspace Dashboard](file:///Users/siddharth/Github/Corpass/apps/web/docs/page-specs/buyer-dashboard.md)
*   **Dashboard Layout (`/dashboard/buyer/*`)**: Sidebar navigation, mobile responsive header with profile control.
*   **Overview (`/dashboard/buyer`)**: Procurement summary KPIs, YTD spend metrics, and recent activity tracker.
*   **Marketplace (`/dashboard/buyer/catalog`)**: Searchable, categorizable vendor catalog featuring geolocation delivery checks, single-supplier bundling, rapid inquiry forms, and instant order checkouts.
*   **Messages (`/dashboard/buyer/messages`)**: Unified chat workspace mapping negotiations to specific orders/inquiries, complete with inline counter-offer negotiation banners.
*   **Orders & Invoices (`/dashboard/buyer/orders`)**: Procurement order lifecycle monitoring, invoice acknowledgment/dispute tabs, offline manual invoice records, and supplier star rating systems.
*   **Asset Management (`/dashboard/buyer/assets`)**: Inventory grids monitoring condition metrics (Perfect, Good, Fair, Poor, Broken) and assignment history.
*   **Profile Settings (`/dashboard/buyer/profile`)**: Corporate identity profile with ratings breakdown and settings modifier.
*   **Support & Help (`/dashboard/buyer/support`)**: Help center form and instant WhatsApp/Email escalation cards.

### 3. [Seller Workspace Dashboard](file:///Users/siddharth/Github/Corpass/apps/web/docs/page-specs/seller-dashboard.md)
*   **Dashboard Layout (`/dashboard/seller/*`)**: Seller-specific workspace layout with custom analytics indicators.
*   **Overview (`/dashboard/seller`)**: High-level sales YTD chart stats, delivery config status alerts, top selling items, and pending order prompts.
*   **Product Catalog (`/dashboard/seller/catalog`)**: Inventory directory showing unit pricing models (fixed vs custom quote), packaging size configurations, and physical delivery settings. Includes image uploader.
*   **Stock Management (`/dashboard/seller/stock`)**: Quick stock adjustments view featuring status badges for Out of Stock, Low Stock, and In Stock.
*   **Orders & Invoices (`/dashboard/seller/orders`)**: Incoming purchase orders manager, price/qty counter-offer sheets, manual invoice creators, and buyer rating feedback.
*   **Profile Settings (`/dashboard/seller/profile`)**: Fulfillment range settings (Hyper Local, Regional, National), GSTIN verification fields, and buyer review stats.
*   **Support & Help (`/dashboard/seller/support`)**: Vendor-centric troubleshooting channels.
