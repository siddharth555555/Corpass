# Buyer Workspace Dashboard Spec

## 1. Dashboard Layout

### Layout & Structure
*   **Collapsible Sidebar (Left)**:
    *   Widescreen width: fixed `260px`. On mobile: sliding drawer (`-translate-x-full` to `translate-x-0` via backdrop trigger).
    *   **Top**: White-backed compact logo box.
    *   **Section Title**: Uppercase small tracker text: `"WORKSPACE"`.
    *   **Navigation Links List**: Vertical stack of icons + labels:
        *   *Overview*, *Marketplace*, *Messages*, *Orders*, *Assets*, *Profile*, *Support*.
        *   **Active item style**: Highlights in subtle primary color background, dark colored text, borders, and bold icon states.
    *   **Bottom**: "Sign Out" button styled with warning/logout accent color.
*   **Header (Right)**:
    *   Mobile view: Hamburger button to toggle the sidebar drawer.
    *   Right-hand corner: Profile circle link highlighting user initials, leading to Profile.
*   **Main Workspace Window**:
    *   Fills the remaining area with independent scrolling (`overflow-y-auto`) and default grid spacing.

---

## 2. Overview Page (`/dashboard/buyer`)

### Layout & Structure
*   **Summary Cards Row**:
    *   `grid grid-cols-1 md:grid-cols-3` layout.
    *   **Metric Cards**: Display metric value in bold text, section subtitle, and a colored bottom bar indicator:
        1.  *Total Spend YTD* (Primary indicator)
        2.  *Active Orders* (Neutral)
        3.  *Pending Approvals* (Neutral)
*   **Recent Activity Tracker Card**:
    *   Header title: "Recent Procurement Requests" with a link to "View All".
    *   **Empty State**: Centered vertical block showing inquiry icon, title, description, and primary button redirecting to "Browse Marketplace".
    *   **List State**: Multi-row list with dividers containing:
        *   Product Name (bold text)
        *   Order Number & Creation Date (subtle text)
        *   Estimated/Paid Price & Status Badge (Placed, Confirmed, Shipped, etc.)

---

## 3. Marketplace Page (`/dashboard/buyer/catalog`)

### Layout & Structure
*   **Fulfillment & Location Bar**:
    *   Pincode Input field (6 digit max) with "Apply" button.
    *   Shortcut badges for active user profiles (e.g., "Company", "Personal" default shipping locations).
    *   "Show out-of-range products" toggle checkbox (allows searching items beyond regional shipping zones for inquiry/RFQ purposes).
*   **Search & Filter Row**:
    *   Search Bar: Full width search field with integrated loupe search icon.
    *   Category Dropdown Selector (IT, Software, Furniture, Pantry, Cleaning, etc.).
    *   Rating Dropdown (Any Rating, 4.5+ Stars, 4.0+ Stars, 3.0+ Stars).
    *   Sort Dropdown (Newest, Top Rated, Price Low-High, Price High-Low).
    *   "Clear Filters" button appears when filters are active.
*   **Category Slider**:
    *   Horizontal scrollable row of capsule buttons/chips for quick categories.
*   **Popular Categories**:
    *   `grid grid-cols-2 md:grid-cols-5` showing card selectors for top categories.
*   **Product Catalog Grid**:
    *   Dynamic layout listing item cards:
        *   **Product Card**:
            *   *Top Section*: Aspect-square image container. Category tags/badges layered on top. Custom "Out of Range" overlay when shipping constraints block purchase.
            *   *Bundle FAB*: Hover/focus circular checkbox button layered over the image boundary to add/remove items to bundle carts.
            *   *Info Area*: Product Name, description snippet, supplier info row (avatar circle, name, location pin, review ratings).
            *   *Price Area*: Large bold Price, Unit type (e.g., "per Piece", "from Quote").
            *   *Action Row*: "Buy Now" button (primary) and "Inquire" button (outline).

### Modals & Overlays
*   **Bundle Quote FAB & Panel**:
    *   Appears at the bottom of the viewport when items are selected.
    *   Shows: Supplier details, number of items, estimated total price, and "Request Quote" button.
*   **Inquiry Drawer (Slide-Over)**:
    *   Triggered by "Inquire" or bundle quote.
    *   Header lists item(s) and supplier details.
    *   Fields: Inquiry Type Tab Selector (Get Quote, Feasibility, Availability), Message Textarea, and Submit button.
*   **Buy Now Order Sheet**:
    *   Header lists item price, unit type, and MOQ constraints.
    *   Fields:
        *   *Quantity* (Input validation enforcing Minimum Order Quantity)
        *   *Shipping Address* (Textarea)
        *   *Billing Address Toggle* (Checkbox to mirror shipping address; reveals Billing Address textarea if unchecked)
        *   *Note to Supplier* (Textarea)
    *   Instant Total calculator displaying product price × quantity.

---

## 4. Messages Page (`/dashboard/buyer/messages`)

### Layout & Structure
*   **Two-Column Split Layout**:
    *   **Left Sidebar**: Scrollable list of active supplier conversations, showing supplier logo/name initials, conversation update timestamps, and total thread indicators.
    *   **Right Chat Panel**:
        *   *Header*: Counterparty details, role label, and thread selection dropdown filter.
        *   *Body*: Auto-scrolling chat history. Messages render on the right (blue) for the buyer, and on the left (white/gray border) for the supplier.
        *   *Input Bar*: Single line message text field with "Send" button.

### Inline Interaction Blocks
*   **Counter-Offer Negotiation Card**:
    *   Displays proposed price, proposed quantity, justification notes, and actionable buttons: "Accept Offer" (emerald) and "Decline" (gray/border).

---

## 5. Orders & Invoices Page (`/dashboard/buyer/orders`)

### Layout & Structure
*   **Header Tab Switcher**:
    *   Toggles workspace between "Orders" and "Invoices".
*   **Orders Dashboard**:
    *   *Filters*: Date Range fields, Sort Dropdown.
    *   *List Item*: Styled order cards displaying order ID, status badges (e.g. Placed, Confirmed, Shipped, Delivered), product name, supplier, total cost, quantity breakdown, buyer note, and inline reviews.
    *   *Conditional Action Buttons*:
        *   Cancel Order (only when status is PLACED)
        *   Message / Negotiate (redirects to Messages Thread)
        *   Leave a Review (reveals star review card upon DELIVERED status)
*   **Invoices Dashboard**:
    *   "Create Invoice" button (launches Manual Invoice Creator modal).
    *   *List Item*: Invoice card showing number, type badge (Auto vs Manual), total cost, and a dual-indicator showing acknowledgement states (Buyer / Supplier).
    *   *Actions*: "Acknowledge" (emerald) and "Dispute" (red).

### Modals
*   **Manual Invoice Creator**:
    *   Inputs: Supplier dropdown, Product Name, Unit Price, Quantity, Unit type dropdown, Notes.
*   **Review Submission Dialog**:
    *   Star selection row (1 to 5 stars) and comment textarea.

---

## 6. Asset Management Page (`/dashboard/buyer/assets`)

### Layout & Structure
*   **Asset Catalog Grid**:
    *   Cards representing registered corporate assets:
        *   Asset Name and Type (Category).
        *   Condition Pill: colored badge indicating state (Perfect, Good, Fair, Poor, Broken).
        *   Quantity and Source link (reference link back to purchase order).
        *   Notes snippet (e.g., Serial numbers, assignments).
        *   Edit / Delete footer action links.

### Modals
*   **Add / Edit Asset Dialog**:
    *   Inputs: Asset Name, Type Category Selector (with integrated option for custom "Other" categories), Quantities split by Condition state (Perfect, Good, Fair, etc.), and Notes.

---

## 7. Profile Settings Page (`/dashboard/buyer/profile`)

### Layout & Structure
*   **Profile Overview Header**:
    *   Supplier feedback ratings and entity verification tags.
*   **Information Cards**:
    *   *Contact Info (Personal)*: Name, email, mobile, and personal address details.
    *   *Company Details*: Headquarters billing address, type, and size.
*   **Suppliers Rating Dashboard**:
    *   Average score, total reviews count, and stars breakdown chart.

### Modals
*   **Edit Profile Slide-Over**:
    *   Multi-column settings editing workspace (personal details and corporate details).

---

## 8. Support Page (`/dashboard/buyer/support`)

*   Renders shared Help Desk UI (Help contact cards + submit query form).
