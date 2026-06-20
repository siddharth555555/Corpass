# Corpass: Business Logic & Domain Understanding
## For AI Agents — Complete Non-Technical Reference

**Document Type**: Domain Knowledge  
**Purpose**: Give any AI a complete understanding of what Corpass is, why it exists, who uses it, how the business flows work, and the reasoning behind every major design decision.  
**Last Updated**: June 2025

---

## Table of Contents

1. [What is Corpass?](#1-what-is-corpass)
2. [The Problem It Solves](#2-the-problem-it-solves)
3. [The Three Personas](#3-the-three-personas)
4. [The Buyer Journey](#4-the-buyer-journey)
5. [The Seller Journey](#5-the-seller-journey)
6. [The Order Lifecycle](#6-the-order-lifecycle)
7. [The Inquiry / RFQ System](#7-the-inquiry--rfq-system)
8. [The Payment Trust Flow](#8-the-payment-trust-flow)
9. [The Invoice System](#9-the-invoice-system)
10. [Asset Management](#10-asset-management)
11. [The Review & Rating System](#11-the-review--rating-system)
12. [Delivery & Geography](#12-delivery--geography)
13. [Pricing & Units](#13-pricing--units)
14. [Notifications](#14-notifications)
15. [Support & Dispute Resolution](#15-support--dispute-resolution)
16. [Admin Oversight](#16-admin-oversight)
17. [Key Business Rules](#17-key-business-rules)
18. [What's Intentionally Excluded](#18-whats-intentionally-excluded)
19. [Data Model Logic](#19-data-model-logic)
20. [Why This Architecture](#20-why-this-architecture)

---

## 1. What is Corpass?

**Corpass** is a **B2B corporate procurement and asset management platform**. It is a marketplace where:

- **Sellers** (vendors, suppliers, distributors) list products and services for corporate buyers.
- **Buyers** (companies, enterprises, organizations) discover, negotiate, purchase, and track internal assets.
- **Admins** (platform operators) oversee the ecosystem, monitor transactions, and handle support.

Think of it as "Amazon Business meets SAP Ariba, but built for the Indian SMB/enterprise market with mobile-first design and built-in asset tracking."

---

## 2. The Problem It Solves

Corporate procurement in India is fragmented and inefficient:

| Pain Point | How Corpass Solves It |
|------------|----------------------|
| Buyers send RFQs via WhatsApp/Email with no tracking | Structured inquiry threads with status and history |
| No single place to compare vendor quotes | Marketplace with search, filtering, and ratings |
| Orders are tracked in spreadsheets | Built-in order lifecycle with auto-status updates |
| Payments are reconciled manually | Payment records with UTR, acknowledgment, and dispute flags |
| Procured assets are forgotten in a corner | Auto-logging into asset management on delivery |
| No visibility into what the company owns | Centralized asset dashboard with condition tracking |
| Vendor reliability is word-of-mouth | Review and rating system tied to real transactions |

**The core insight**: In B2B, the transaction doesn't end at delivery. The buyer needs to know WHERE the asset is, WHO has it, and WHAT CONDITION it's in. Corpass treats procurement and asset management as one continuous workflow.

---

## 3. The Three Personas

### 3.1 Buyer (Company / Enterprise)

- Represents a **Company** entity (the buyer is an employee authorized to purchase on behalf of the company).
- Can browse the marketplace, send inquiries, place orders, track deliveries, manage assets, and review sellers.
- Must have a company profile (name, address, type, employee count) registered at signup.
- **Key constraint**: A buyer cannot also be a seller. The system enforces this at registration.

### 3.2 Seller (Vendor / Supplier)

- An individual or business entity that sells products or services to corporate buyers.
- Must have a **GSTIN** (Indian tax ID) and a **SellerProfile** (delivery range, cities, pincodes).
- Can list products, manage stock, fulfill orders, generate invoices, and communicate with buyers.
- **Key constraint**: A seller does NOT have a `Company` record. The seller's profile is their business identity.

### 3.3 Admin (Platform Operator)

- Has a birds-eye view of the entire platform.
- Can see user counts, order volumes, revenue, support tickets, and recent activity.
- Does NOT directly transact. The admin's role is oversight and support.
- **Important**: Admin is bootstrapped via a seed script, not via registration. This prevents the public from creating admin accounts.

---

## 4. The Buyer Journey

### Step 1: Registration
- Creates a personal account (name, loginId, email, mobile, password).
- Also creates a **Company** record (companyName, companyAddress, companyType, employeeCount).
- The system automatically links the user to the company via `companyId`.

### Step 2: Marketplace Discovery
- Lands on `/dashboard/buyer/catalog`.
- Sees products across 12+ categories: Office Supplies, Furniture, IT & Electronics, Corporate Gifting, Pantry & Breakroom, Janitorial, Industrial Supplies, Packaging, Software & SaaS, Printing & Signage, Professional Services, Other.
- Can filter by:
  - **Category**: One of the 12 categories above.
  - **Search**: Free text on product name and description.
  - **Sort**: Newest, Price Low→High, Price High→Low, Rating.
  - **Delivery Range**: Products deliverable to the buyer's pincode (via distance calculation).
  - **Min Rating**: Filter by seller's average rating.
- **Pincode-based delivery**: The buyer can set a personal pincode or use their company's registered pincode. Products outside the seller's delivery range are grayed out or hidden unless "Show All" is toggled.

### Step 3: Inquiry (RFQ)
- On a product, the buyer can click "Inquire" to send a Request For Quote.
- The inquiry is **typed**:
  - `QUOTE`: "What is your best price for X quantity?"
  - `FEASIBILITY`: "Can you deliver X to my location by Y date?"
  - `AVAILABILITY`: "Do you have X in stock right now?"
- The buyer writes a message. The seller receives it and can respond.
- The seller's response can include a **Response Price** (a custom price for this specific buyer).
- The buyer can accept the response price, which converts the inquiry into a direct order path, OR continue messaging.
- **Why this exists**: B2B pricing is almost never fixed. Volume, relationship, urgency, and geography all affect price. A static cart checkout like B2C doesn't work for corporate procurement.

### Step 4: Order Placement
- From the marketplace, the buyer can place a direct order for a product with a `FIXED` price.
- For `CONTACT_FOR_QUOTE` products, the buyer MUST send an inquiry first.
- At checkout, the buyer provides:
  - Shipping Address
  - Billing Address
  - Quantity
  - Optional: Payment Mode preference (Bank Transfer, UPI, Cash, Cheque, Other)
  - Optional: Buyer Note (special instructions)
- The order is created with status `PLACED`.
- The seller is immediately notified.

### Step 5: Order Tracking & Negotiation
- The buyer can view all their orders on `/dashboard/buyer/orders`.
- If the seller sends a **Counter Offer** (different price or quantity), the buyer sees it in the order detail and can:
  - **Accept**: Order moves to `CONFIRMED` at the new price.
  - **Decline**: Order returns to `PLACED` (original price remains).
  - **Counter Back**: The buyer can propose yet another price.
- **Why negotiation is built-in**: B2B orders are rarely placed at listed price. The counter-offer system replaces the back-and-forth email/phone negotiation with a structured, auditable workflow.

### Step 6: Payment & Trust
- After the order is `CONFIRMED`, the seller may request an **Advance Payment** (partial payment upfront).
- The buyer records a payment by providing:
  - Amount
  - Payment Date
  - UTR (Unique Transaction Reference) — the bank/UPI reference number
- The seller **acknowledges** the payment (confirming they received it) or **disputes** it (claiming it wasn't received or was the wrong amount).
- **Why this design**: In Indian B2B, payments are almost always via bank transfer or UPI, NOT through an integrated payment gateway. The platform acts as a trust ledger: buyer says "I paid X on Y with UTR Z", seller verifies. This is "payment record + trust" rather than "payment processing."
- Multiple payments can be recorded per order (e.g., 50% advance + 50% on delivery).

### Step 7: Delivery & Asset Logging
- When the seller marks the order as `DELIVERED`, TWO things happen automatically:
  1. An **Invoice** is auto-generated (`AUTO` type) with the final order details.
  2. The product is **auto-logged** into the buyer's Asset Management system in `PERFECT` condition.
- The buyer can then view the asset on `/dashboard/buyer/assets` and update its condition (Perfect → Good → Fair → Poor → Broken) or add notes.
- **Why auto-log assets**: The most common problem in corporate procurement is "we bought 500 chairs last year, where are they?" By auto-logging every delivered item into the asset system, the buyer never loses track of what they own. The procurement department and the facilities/IT department share the same data source.

### Step 8: Review
- After delivery, the buyer can leave a review for the seller (rating 1-5, title, comment).
- This review is tied to the specific order, so it's verified and real (not fake).

---

## 5. The Seller Journey

### Step 1: Registration
- Creates a personal account (same fields as buyer).
- Does NOT create a company. Instead, creates a **SellerProfile** with:
  - GSTIN (mandatory tax ID)
  - Delivery Range (`LOCAL_100KM`, `HYPER_LOCAL_20KM`, or `SHIPPING_AVAILABLE`)
  - Delivery Cities (if LOCAL_100KM)
  - Delivery Pincodes (if HYPER_LOCAL_20KM)
- **Why no company for sellers**: Sellers can be individuals, small distributors, or manufacturers. The seller's identity is their GSTIN + delivery footprint, not a formal company entity in this system.

### Step 2: Product Catalog Management
- Lists products on `/dashboard/seller/catalog`.
- Each product has:
  - Name, Description, Category, Sub-category
  - Price Type: `FIXED` (buyer can order directly) or `CONTACT_FOR_QUOTE` (must inquire first)
  - Price (nullable if CONTACT_FOR_QUOTE)
  - Pricing Unit: PIECE, BOX, KILOGRAM, YEAR, PROJECT, etc. (see Section 13)
  - Pieces Per Unit (e.g., "Box of 50")
  - Minimum Order Quantity (MOQ)
  - Minimum Order Amount
  - Delivery Time (days)
  - Stock Quantity
  - Images (uploaded via Cloudinary)
  - Delivery constraints (can be different from the seller's default profile)
- **Why CONTACT_FOR_QUOTE exists**: For services (consulting, legal, printing) and large custom orders, a fixed price is impossible. The seller needs to see the scope before quoting.

### Step 3: Stock Management
- Dedicated page `/dashboard/seller/stock` shows ALL products with their current stock.
- Stock is **auto-deducted** when an order moves to `SHIPPED`.
- Low stock is visually highlighted (below MOQ).
- The seller can rapidly edit stock quantities without opening the full product edit screen.
- **Why stock is critical**: B2B buyers plan procurement in advance. If a seller shows "in stock" but actually has zero, the buyer's production line stops. Stock accuracy is a trust signal.

### Step 4: Order Fulfillment
- Seller sees all orders on `/dashboard/seller/orders`.
- The seller controls the pipeline:
  - `PLACED` → **Confirm** → `CONFIRMED`
  - `CONFIRMED` → **Ship** → `SHIPPED` (stock auto-deducted here)
  - `SHIPPED` → **Deliver** → `DELIVERED` (auto-generates invoice + logs asset)
- The seller can also **Cancel** orders (if not yet shipped).
- Before shipping, the seller can verify that acknowledged payments cover any requested advance.
- **Why the seller controls the flow**: In B2B, the supplier is responsible for confirming feasibility, packaging, and logistics. The buyer doesn't "auto-ship" anything. Each status change is a real-world action (packed, handed to courier, delivered to buyer's warehouse).

### Step 5: Invoicing
- Two types of invoices:
  1. **AUTO**: Generated automatically on delivery. Contains the exact order details. Seller is auto-acknowledged (since they delivered it). Buyer must acknowledge.
  2. **MANUAL**: Created by either party for off-platform agreements, additional services, or amendments. The creator auto-acknowledges. The other party must acknowledge.
- Both parties can **acknowledge** or **dispute** an invoice.
- **Why both types**: Real-world B2B often involves side agreements, freight charges, or amendments that weren't in the original order. The manual invoice lets the platform handle those without forcing everything through the original order workflow.

### Step 6: Communication
- Unified messaging inbox at `/dashboard/seller/messages`.
- Shows both inquiry threads and order threads.
- Order messages include special types: `MESSAGE`, `COUNTER_OFFER`, `ACCEPT`, `DECLINE`, `SYSTEM_EVENT`.
- **Why messaging is centralized**: In B2B, the same person might be negotiating 20 orders simultaneously. A unified inbox prevents messages from getting lost in WhatsApp/email threads.

---

## 6. The Order Lifecycle

The order is the central entity of the platform. Every order follows a strict state machine:

```
PLACED
  │
  ├──→ COUNTER_OFFERED (buyer or seller proposes new price/qty)
  │      │
  │      ├──→ ACCEPT → CONFIRMED
  │      │
  │      └──→ DECLINE → PLACED (back to original)
  │
  └──→ CONFIRMED (seller accepts original or counter is accepted)
         │
         ├──→ SHIPPED (seller packs & hands to logistics)
         │      │
         │      └──→ DELIVERED (buyer receives goods)
         │             │
         │             └──→ [Auto: Invoice + Asset logged]
         │
         └──→ CANCELLED (either party, before shipping)
```

**Key rules**:
- A seller can only confirm their own orders.
- A buyer can only cancel before the order is shipped.
- Counter-offers can go back and forth but must alternate (you can't counter your own counter).
- Shipping auto-deducts stock from the product catalog.
- Delivery auto-generates an invoice and auto-logs the asset.

---

## 7. The Inquiry / RFQ System

**Why inquiries exist separately from orders**: In B2B, a buyer often needs to check feasibility before committing. An inquiry is a "pre-order" conversation.

**Inquiry Types**:
- `QUOTE`: "What will you charge me for 500 units?"
- `FEASIBILITY`: "Can you customize this? Can you deliver to my remote location?"
- `AVAILABILITY`: "Is this in stock? When can you ship?"

**Inquiry Status**:
- `PENDING`: Seller hasn't responded yet.
- `RESPONDED`: Seller has replied (possibly with a Response Price).

**Conversion to Order**: When a buyer accepts a seller's response price, the system should (ideally) auto-create an order. Currently, the buyer manually places the order with the agreed price. The inquiry thread serves as the negotiation record.

**Why this is sufficient for MVP**: The inquiry system captures the conversation. The buyer can reference the agreed price when placing the order. A full auto-conversion can be added later.

---

## 8. The Payment Trust Flow

B2B in India does NOT use credit cards for large orders. Payments are via:
- NEFT/RTGS/IMPS (bank transfer)
- UPI
- Cash (for small local orders)
- Cheque
- Other (custom arrangements)

**The Corpass Payment Model** is a **trust ledger**, not a payment processor:

1. **Buyer records payment**: "I paid ₹50,000 on June 15 via UPI. UTR: 123456789012."
2. **Seller acknowledges**: "Yes, I received ₹50,000. UTR matches."
3. **Seller disputes**: "I only received ₹45,000." or "UTR not found in my bank statement."

**Why this works**: The platform doesn't hold money. It holds the **truth**. Both parties have a shared, immutable record of who said what about each payment. This prevents the most common B2B dispute: "I paid you" / "No you didn't."

**Advance Payments**: Sellers can request an advance (e.g., "50% advance before shipping"). The system tracks whether acknowledged payments cover the requested advance. The seller cannot ship until the advance is acknowledged.

**Multiple Payments**: A single order can have multiple payment records (e.g., 30% advance + 70% on delivery). Each is tracked independently.

---

## 9. The Invoice System

**Two invoice types by design**:

### AUTO Invoice
- Created automatically when the seller marks an order as `DELIVERED`.
- Contains the exact final order details (price, quantity, addresses).
- The seller is automatically acknowledged (they created it by delivering).
- The buyer must acknowledge it.
- **Why**: This is the standard B2B flow. Seller delivers → generates invoice → buyer receives and acknowledges.

### MANUAL Invoice
- Created by either party independently of an order.
- Used for:
  - Off-platform agreements (e.g., "We agreed on WhatsApp to add freight charges")
  - Additional services not in the original order
  - Professional services (consulting, legal) where there was never a product order
- The creator auto-acknowledges. The other party must acknowledge.
- **Why**: B2B is messy. Not everything fits into a clean product-order-invoice chain. The manual invoice gives flexibility without leaving the platform.

**Invoice Status**:
- `PENDING`: Waiting for both parties to acknowledge.
- `ACKNOWLEDGED`: Both parties have agreed. This is the "settled" state.
- `DISPUTED`: One party has raised a dispute. Cannot be acknowledged until resolved.

---

## 10. Asset Management

**The Problem**: Companies buy things and forget about them. A facilities manager knows they bought 200 chairs, but not WHERE they are, WHO is using them, or what condition they're in. This leads to duplicate purchases, maintenance delays, and compliance issues.

**The Corpass Solution**:

### Auto-Logging
- Every time an order is marked `DELIVERED`, the system automatically creates an **Asset** record for the buyer.
- Asset fields: Name, Type, Quantity, Condition (PERFECT/GOOD/FAIR/POOR/BROKEN), Notes, Source Order link.
- **Why auto-log**: If the buyer has to manually enter every delivered item, they won't do it. By making it automatic, the asset inventory is always up-to-date.

### Manual Entry
- Buyers (especially IT/Admin teams) can manually add existing company assets that were NOT purchased through Corpass.
- This makes Corpass the single source of truth for ALL company assets, not just procured ones.

### Condition Tracking
- `PERFECT`: New or like-new
- `GOOD`: Minor wear, fully functional
- `FAIR`: Visible wear, still functional
- `POOR`: Nearing end of life, frequent issues
- `BROKEN`: Non-functional, needs repair or disposal
- **Why conditions matter**: A company can have 100 laptops. 20 are BROKEN. Without condition tracking, they might buy 20 more laptops when they only need to repair 5 and dispose of 15. Condition tracking turns asset data into actionable maintenance decisions.

---

## 11. The Review & Rating System

**Why reviews are tied to orders**: To prevent fake reviews. Only a buyer who has actually completed an order with a seller can review them. This is a verified transaction review system, not a general Yelp-style review.

**Bilateral Reviews**:
- Buyer reviews seller: "Was the product as described? Was delivery on time?"
- Seller reviews buyer: "Did they pay on time? Were they reasonable to deal with?"
- Both reviews are tied to the same order.
- **Why bilateral**: Both parties have skin in the game. A buyer with a history of late payments should be visible to sellers. A seller with a history of wrong deliveries should be visible to buyers.

**Supplier Stats**: Each seller has an average rating and review count displayed on their product cards. This is calculated from all completed order reviews.

---

## 12. Delivery & Geography

**Why delivery ranges are complex**: B2B delivery is not "ship anywhere." A local furniture maker might deliver within 100km. A hyper-local bakery supplier might only deliver within 20km. A SaaS vendor ships everywhere. These constraints must be visible to buyers BEFORE they place an order.

### Delivery Range Types
- `LOCAL_100KM`: The seller delivers within a 100km radius of their location. Checked by city name matching OR pincode distance calculation.
- `HYPER_LOCAL_20KM`: The seller delivers within 20km. Checked by pincode matching (exact pincodes the seller services).
- `SHIPPING_AVAILABLE`: The seller ships anywhere (national courier).

### Pincode Distance Calculation
- The system uses a pincodes JSON file with lat/lon coordinates for Indian pincodes.
- Haversine formula calculates distance between buyer's pincode and seller's pincode.
- If the distance exceeds the seller's range, the product is marked as "out of range."
- **Why this matters**: A buyer in Mumbai shouldn't see a seller in Delhi who only delivers locally. This prevents wasted inquiries and disappointed buyers.

### Delivery Constraints Per Product
- A seller can set delivery range/cities/pincodes PER PRODUCT (overriding their profile defaults).
- Example: A seller might ship software licenses pan-India but only deliver furniture within their city.

---

## 13. Pricing & Units

**Why B2B needs granular units**: A B2B buyer doesn't buy "1 of something." They buy:
- "5 boxes of 50 pens each"
- "200 kg of steel"
- "1 year of SaaS subscription"
- "1 project of consulting work"

### Pricing Units (24 total)
- **Count**: PIECE, PAIR, SET, PACK, BUNDLE, BOX, CARTON, CASE, DOZEN
- **Weight**: GRAM, KILOGRAM, TONNE, QUINTAL
- **Volume**: MILLILITRE, LITRE
- **Length/Area**: METRE, FOOT, ROLL, SQ_FOOT, SQ_METRE
- **Time**: HOUR, DAY, MONTH, YEAR
- **Project**: PROJECT

### Price Types
- `FIXED`: The seller has set a specific price. The buyer can add to cart and checkout directly.
- `CONTACT_FOR_QUOTE`: The seller has NOT set a fixed price. The buyer MUST send an inquiry first.
- **Why both**: A box of pens can have a fixed price. A consulting engagement cannot.

### Pieces Per Unit
- Optional field. If set, the buyer sees: "₹500 per Box (50 pcs)" — so they know the per-unit cost.
- **Why this matters**: B2B buyers compare on TOTAL cost of ownership, not just headline price. "₹10 per pen" vs "₹500 per box (50 pcs = ₹10/pen)" is the same thing, but the second format is how B2B buyers think.

---

## 14. Notifications

**Why notifications are in-app (not email) for now**: The MVP uses a lightweight polling-based notification system. Every user sees a bell icon with an unread count. Notifications are auto-cleaned (read notifications older than 7 days are deleted).

**Notification Types**:
- `ORDER_UPDATE`: New order received, order confirmed, shipped, delivered, cancelled, counter offer received, offer accepted/declined, advance requested, payment recorded/acknowledged/disputed.
- `MESSAGE`: New message in an inquiry or order thread.
- `SUPPORT_TICKET`: New support ticket raised (for admins).
- `SYSTEM`: Platform-wide announcements.

**Delivery Method**: The frontend polls every 30 seconds. This is a deliberate trade-off for simplicity. Real-time (WebSockets) is a future enhancement.

---

## 15. Support & Dispute Resolution

### Support Tickets
- Any user can create a support ticket with a subject and message.
- The ticket is stored in the `SupportMessage` table.
- When a ticket is created, ALL admins receive a notification.
- **Why simple**: The platform is small-scale initially. A simple ticket system with admin notification is sufficient. Advanced ticketing (assignments, SLAs, priorities) is a future enhancement.

### Dispute Resolution
- **Invoice Disputes**: If a buyer or seller disagrees with an invoice, they can flag it as disputed with a reason (NOT_RECEIVED, LESS_AMOUNT, MORE_AMOUNT, OTHER) and a comment.
- **Payment Disputes**: If a seller claims a payment was not received, they can dispute the payment record.
- **Order Disputes**: Currently handled via messaging (order messages). A formal dispute escalation can be added later.
- **Why disputes are built-in**: In B2B, 10-20% of invoices have some issue (wrong amount, delayed payment, wrong quantity). Without a dispute flag, these issues get lost in chat threads. The dispute flag makes them searchable and trackable.

---

## 16. Admin Oversight

**Why the admin portal is separate**: The admin experience is completely different from the buyer/seller experience. Admins don't buy or sell. They monitor, moderate, and support.

### Admin Dashboard
- Stats cards: Total Users, Active Buyers, Active Sellers, Total Orders, Pending Orders, Total Revenue, Open Tickets, Active Products.
- Recent Activity Feed: Merged stream of new registrations, new orders, and new product listings.
- **Why this matters**: An admin needs to spot trends (e.g., "sudden spike in orders", "5 new sellers today") at a glance, not dig through tables.

### Admin Pages
- **Users**: List all users with role, company, city, status, joined date. Can view details.
- **Orders**: List all orders with buyer, seller, product, amount, status. Can view order details.
- **Products**: List all products with seller, category, price, stock, status. Can moderate listings.
- **Support Tickets**: List all support tickets with user, role, status, date. Can view and respond.
- **Why limited for now**: The admin portal is read-only overview. Edit/approve/reject actions can be added as needed.

---

## 17. Key Business Rules

These rules are non-negotiable and enforced at the database and API level:

| # | Rule | Rationale |
|---|------|-----------|
| 1 | A user is EITHER a Buyer OR a Seller, never both. | Prevents self-dealing and fraud. A buyer company shouldn't also sell to itself. |
| 2 | Buyers MUST have a Company record. Sellers do NOT. | Buyers purchase on behalf of a company. Sellers are independent vendors. |
| 3 | Sellers MUST have a GSTIN. | Tax compliance in India. B2B transactions require GST invoices. |
| 4 | Only sellers can create products. | Buyers should not be able to list items. |
| 5 | Only sellers can update their own product stock. | Ownership verification. A seller cannot edit another seller's inventory. |
| 6 | Stock auto-deducts on SHIPPED, not on PLACED. | Prevents stock from being reserved by orders that never confirm. |
| 7 | Orders can only be cancelled before SHIPPED. | Once shipped, the logistics process has begun. Cancellation is no longer feasible. |
| 8 | Counter-offers must alternate. | Prevents ping-pong spam. A party cannot counter their own counter. |
| 9 | A seller cannot ship if the advance is not acknowledged. | Protects the seller from shipping unpaid orders. |
| 10 | An invoice cannot be disputed if it's already acknowledged. | Prevents abuse of the dispute system after both parties have agreed. |
| 11 | Only delivered orders can be reviewed. | Prevents pre-transaction reviews (fake reviews). |
| 12 | One review per order per role. | A buyer and seller each review once per order. No duplicate reviews. |
| 13 | Admin endpoints require ADMIN role. | Prevents buyers/sellers from accessing platform-wide data. |
| 14 | Notification cleanup: read + 7 days old = deleted. | Prevents notification table from growing infinitely. |
| 15 | Asset auto-log on delivery. | Ensures the buyer's asset inventory is always synchronized with procurement. |

---

## 18. What's Intentionally Excluded

The following features are NOT in the current codebase. They are planned for future phases but are explicitly excluded from the current scope:

- **OAuth / Social Login**: No Google, LinkedIn, or other social auth. All accounts are username/password + company/seller profile.
- **OTP / SMS Verification**: No mobile OTP at registration or login. Mobile numbers are collected but not verified via OTP.
- **Email Delivery**: No SendGrid, SES, or SMTP integration. Notifications are in-app only. No email order confirmations, no invoice emails.
- **Real Payment Gateway**: No Razorpay, Stripe, or PayU integration. The payment system is a trust ledger (record + UTR + acknowledge/dispute), not a payment processor.
- **Real-time Messaging**: No WebSockets. Messages are fetched via 30-second polling.
- **Redis / Caching**: No Redis for sessions, cache, or pub/sub.
- **CDN**: No CDN for static assets beyond Cloudinary for product images.
- **Audit Logs**: No formal `AuditLog` table. Changes are tracked implicitly via timestamps but not with "old value → new value" history.
- **Multi-tenancy**: Beyond user ownership checks, there is no formal row-level security or tenant isolation.
- **Data Export**: No CSV/Excel/PDF export for orders, invoices, or assets.
- **Search Indexing**: Marketplace search uses Prisma `contains` (SQL LIKE), not Elasticsearch or full-text search.

---

## 19. Data Model Logic

The database schema is designed around the following principles:

### User-Centric but Role-Separated
- `User` is the central table. Every human has one `User` record.
- `User.role` (`BUYER`, `SELLER`, `ADMIN`) determines what they can do.
- Buyers link to `Company` via `companyId`. Sellers link to `SellerProfile` via `userId`.

### Transaction-Centric
- `Order` is the most important table. It links buyer → seller → product.
- `Order` status drives the entire business workflow.
- `OrderMessage` captures the conversation history (including counter-offers as structured events).
- `PaymentRecord` is a child of `Order` (and optionally `Invoice`).

### Invoice Independence
- `Invoice` can link to an `Order` (auto invoice) OR be standalone (manual invoice).
- This allows the platform to handle off-platform agreements.

### Asset-Order Link
- `Asset` has an optional `sourceOrderId`. This is the auto-log link.
- Manual assets have `sourceOrderId = null`.

### Polymorphic Payment
- `PaymentRecord` has both `orderId` and `invoiceId` as nullable. A payment is always tied to one parent, but the parent can be either an order or an invoice.
- This is a pragmatic trade-off. A more normalized design would have `OrderPayment` and `InvoicePayment` tables, but the current design reduces complexity for the MVP.

### Notification Decoupling
- `Notification` is a standalone table with no foreign keys to business entities (only `userId`).
- It stores `entityType` and `entityId` as strings for loose coupling.
- This means notifications can reference ANY entity (order, invoice, inquiry, support ticket) without schema changes.

---

## 20. Why This Architecture

### Why NestJS + Prisma + MySQL?
- **NestJS**: Modular, typed, enterprise-grade. Fits the B2B domain's complexity (orders, invoices, payments, assets all interrelated).
- **Prisma**: Type-safe ORM. The schema is the source of truth. Prevents raw SQL mistakes.
- **MySQL**: Ubiquitous, well-supported, ACID-compliant. The `Decimal` type handles currency precisely.

### Why Next.js App Router?
- **Server Components**: Dashboard pages can fetch data server-side where possible (though most pages are client-side due to auth requirements).
- **File-based routing**: `/dashboard/buyer/orders` maps cleanly to the file system.
- **Tailwind + shadcn/ui**: Consistent, fast-to-build UI. The design system is custom but follows established patterns.

### Why Three Separate Frontends?
- **Buyer/Seller Portal (`apps/web`)**: Shared codebase but role-gated routes. Buyers and sellers share UI components (orders page, messaging) but see different data.
- **Admin Portal (`frontend-admin`)**: Completely different UX. No product browsing, no checkout, no asset management. Just monitoring and support. Keeping it separate prevents accidental buyer/seller UI from leaking into admin views.
- **Why not one app?**: The admin has completely different navigation, different data needs, and different security requirements. Separating them reduces complexity and risk.

### Why Monorepo?
- Shared packages (types, UI components, utilities) reduce duplication.
- pnpm workspaces make dependency management clean.
- One command (`pnpm dev`) starts the entire stack.

### Why the Trust Ledger Payment Model?
- B2B in India operates on bank transfers, not credit cards. A payment gateway integration would be unused by 80% of users.
- The UTR-based trust model builds confidence without requiring payment infrastructure.
- When the business scales, a real gateway can be added as an OPTIONAL payment method alongside the trust ledger.

### Why Auto-Asset Logging?
- The single biggest complaint from corporate buyers is "we bought it but we don't know where it is."
- Auto-logging turns procurement into a closed-loop system: buy → receive → track → maintain → dispose.
- This is Corpass's unique differentiator from generic B2B marketplaces.

---

## Quick Reference: Business Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     BUYER       │     │    SELLER       │     │     ADMIN       │
│  (Company)      │     │  (Vendor)       │     │  (Platform)     │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │  1. Browse Marketplace │
         │◄──────────────────────┤
         │  2. Send Inquiry/RFQ  │
         │──────────────────────►│
         │  3. Negotiate Price   │
         │◄──────────────────────►│
         │  4. Place Order       │
         │──────────────────────►│
         │  5. Record Payment    │
         │──────────────────────►│
         │  6. Confirm Payment   │
         │◄──────────────────────┤
         │  7. Ship Order        │
         │◄──────────────────────┤
         │  8. Receive & Log     │
         │◄──────────────────────┤ (Auto: Asset + Invoice)
         │  9. Review Seller     │
         │──────────────────────►│
         │                       │
         │  [Asset Management]   │
         │  Track condition,     │
         │  notes, manual add    │
         │                       │
         │  [Support]            │
         │  Raise ticket ───────►│ (Admin notified)
```

---

*End of Document*
