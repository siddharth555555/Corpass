# Seller Workspace Dashboard Spec

## 1. Dashboard Layout

### Layout & Structure
*   **Sidebar Layout**:
    *   Styled identically to the buyer layout, but features a seller-focused navigation links menu:
        *   *Overview*, *Product Catalog*, *Messages*, *Orders*, *Stock*, *Profile*, *Support*.
*   **Main Workspace Window**:
    *   Scrollable layout containing page-specific views.

---

## 2. Overview Page (`/dashboard/seller`)

### Layout & Structure
*   **Alert Banner Section**:
    *   Amber warnings appear at the top if the profile's delivery capability is not configured.
*   **Performance Metrics Row**:
    *   `grid grid-cols-1 md:grid-cols-4` layout.
    *   KPI cards featuring:
        1.  *Pending Orders* (Highlighted in theme color)
        2.  *Total Sales YTD*
        3.  *Active Items*
        4.  *Review Rating Score*
*   **Analytics Summary Grid**:
    *   Split into two cards:
        *   *Recent Orders*: Displays a summary of the latest orders (Product Name, ID, amount, date, status).
        *   *Top Active Items*: Highlights top listed items (Image, name, category, pricing, stock level).

---

## 3. Product Catalog Page (`/dashboard/seller/catalog`)

### Layout & Structure
*   **Table View**:
    *   A structured layout displaying:
        *   *Product Details*: thumbnail image, name, and description.
        *   *Category*: pill tags.
        *   *Stock*: counts (color-coded red if low).
        *   *Pricing*: price type (Fixed vs Quote base) and pricing unit details.
        *   *Delivery*: days required or service indicator.

### Modals & Overlays
*   **Add Product Slide-Over**:
    *   A drawer container showing:
        *   *Name & Description* inputs.
        *   *Category & Subcategory* dropdowns.
        *   *Pricing Structure*: Tab selector toggle (Fixed Price vs Contact for Quote).
        *   *Pricing Inputs*: Value input, Unit of Measure group selection, Pieces per unit input.
        *   *Logistics*: Stock level, MOQ, Min Order Value, Physical Delivery toggle, and Delivery Time in days.
        *   *Image Gallery Grid*: Holds up to 5 uploaded product image cards with delete hover controls, and a dashed file upload card selector.

---

## 4. Stock Management Page (`/dashboard/seller/stock`)

### Layout & Structure
*   **Stock Levels Table**:
    *   A fast-update interface showing:
        *   *Product ID*: monospace text font.
        *   *Product Name & Category*.
        *   *Status pill*: Out of Stock (rose), Low Stock (amber), In Stock (emerald).
        *   *In Stock Quantity*: bold numeric indicator.
        *   *Action*: "Update Stock" button.

### Modals
*   **Update Stock Modal**:
    *   Centered dialog inputting "New Stock Quantity" with instant save.

---

## 5. Orders & Invoices Page (`/dashboard/seller/orders`)

*   **Structure**: Shared tab system matching the buyer interface, but with action controls reversed (seller actions).
*   **Seller Order Actions**:
    *   *Placed status*: Confirm, Reject, or Negotiate (redirects to Messages).
    *   *Confirmed status*: Mark Shipped button.
    *   *Shipped status*: Mark Delivered button.
    *   *Delivered status*: Rate Buyer rating control.
*   **Seller Invoices**:
    *   Allows creating manual invoices or viewing auto-generated invoice summaries.
    *   Acknowledge and Dispute buttons for incoming disputes.

---

## 6. Profile Settings Page (`/dashboard/seller/profile`)

### Layout & Structure
*   **Overview Area**: User initials avatar circle, store title name, location address, and GSTIN number.
*   **Fulfillment Settings**: Shows configured delivery capability ranges.
*   **Feedback Ratings Panel**: Displays buyer reviews, rating distribution bar charts, and comments stream.

### Modals
*   **Edit Settings Modal**:
    *   Inputs: Store Name, Mobile, Address, City, Pincode, GSTIN, and Delivery Range Capability dropdown.

---

## 7. Support Page (`/dashboard/seller/support`)

*   Renders shared Help Desk UI (Help contact cards + submit query form).
