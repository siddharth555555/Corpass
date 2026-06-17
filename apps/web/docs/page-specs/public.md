# Public & Authentication Pages Spec

## 1. Landing Page (`/`)

### Purpose & Context
The public landing page introduces Corpass as a modern B2B corporate procurement and asset management platform. It directs users to either sign in to their portal workspace or create a new corporate account.

### Layout & Structure
*   **Header Navigation**:
    *   **Left**: Compact white background logo box (`LogoLink`) with rounded corners (`rounded-2xl`), a subtle shadow, and border.
    *   **Right (Desktop)**: Horizontal text link for "Sign in" and button for "Create Account" (`btn-primary`).
    *   **Right (Mobile)**: Hamburger menu toggle icon. Clicking it expands a full-width dropdown below the navbar showing "Sign in" and "Create Account" vertically.
*   **Main Hero Section**:
    *   Centrally aligned, vertical flow.
    *   **Top Badge**: Capsule badge (`inline-flex rounded-full`) with a pulse dot indicating "Enterprise-grade procurement".
    *   **Main Headline**: Large `text-5xl` tracking-tight text with standard bolding, highlighting "managed in one place" in primary theme color.
    *   **Subheadline**: Clean sans-serif descriptive paragraph.
*   **Features Grid**:
    *   `grid grid-cols-1 md:grid-cols-3` layout.
    *   **Cards**: Raised card container styling (`bg-surface rounded-xl border border-border-subtle card-hover`) with a distinctive colored icon box on top:
        1.  *Curated Marketplace* (Primary color icon)
        2.  *Workflow & Approvals* (Accent color icon)
        3.  *Asset Lifecycle* (Highlight color icon)
    *   Each card features a title and a description.
*   **Call-to-Action Buttons**:
    *   Centered row displaying a primary CTA button ("Get started for free") and a secondary link ("Log in to portal →").

### Key Interactivity
*   Responsive mobile menu transition.
*   Hover transformations (`card-hover` / scale / highlight) on feature grids and CTA items.

---

## 2. Login Workspace (`/login`)

### Purpose & Context
Allows existing corporate buyers ("Companies") and sellers ("Sellers") to authenticate and access their respective workspace dashboards.

### Layout & Structure
*   **Container**: Centered box on a canvas background.
*   **Header Section**:
    *   Centered layout.
    *   Top large `LogoLink` container (`mix-blend-multiply` styling).
    *   Headline: "Welcome back" (serif, bold font).
    *   Subheadline: "Sign in to your Corpass workspace."
*   **Role Switcher Tab**:
    *   Full-width pill switcher (`bg-surface-raised rounded-xl border border-border-subtle`) containing two buttons:
        *   "I am a Company" (Buyer Role)
        *   "I am a Seller" (Seller Role)
    *   **Active State**: Slide-in transitions/solid bg highlighting the selected role.
*   **Form**:
    *   Vertical stack containing the inputs:
        1.  *Login ID or Mobile* (Text input)
        2.  *Password* (Password input with hide/reveal option)
    *   **Submit Button**: Full width primary button reading: `Sign In as [Company | Seller]`.
*   **Footer Link**: "Don't have an account? Register your company or store" link redirecting to `/register`.

### Key Interactivity
*   **Dynamic Role Switch**: Toggling the role instantly updates the form submit button label and sets the request context.
*   **URL parameter handling**: Autocleans security query tokens if present on load.

---

## 3. Register Workspace (`/register`)

### Purpose & Context
A comprehensive onboarding portal that collects personal contact info, credentials, and conditional setup variables depending on whether the registering user is a buyer or seller.

### Layout & Structure
*   **Header**: White compact logo link (`LogoLink`) aligned to the top-left corner on desktop.
*   **Container**: Centered registration card (`bg-surface rounded-2xl border border-border-subtle`).
*   **Header Title**:
    *   "Create your Account"
    *   Conditional subtext based on chosen role.
*   **Role Switcher Tab**: Switcher pill styled identically to the login switcher ("I am a Company" vs "I am a Seller").
*   **Form Wizard Flow**:
    1.  **Section 1: Personal Information** (Unified for both roles)
        *   `grid grid-cols-1 md:grid-cols-2` field layout:
            *   *Full Name*
            *   *Login ID*
            *   *Email*
            *   *Dial Code Selection Selector* (`+91`, `+1`, etc.) docked to the left of the *Mobile Phone* field.
            *   *Password* (spanning full width)
            *   *Address* (spanning full width)
            *   *City* & *Pincode* (stacked side-by-side)
    2.  **Section 2: Conditional Setup Configuration**
        *   **If Role = Company (Buyer)**:
            *   *Company Name*
            *   *Company Address*
            *   *Company Type Dropdown* (LLC, Corporation, Partnership, Sole Proprietorship)
            *   *Employee Count Range Dropdown* (1-10, 11-50, 51-200, 201-500, 500+)
        *   **If Role = Seller**:
            *   *GSTIN Input* (Mandatory formatting)
            *   *Delivery Range Capability Selection* (Hyper Local (Within 20 km), Local (Within 100 km), Shipping Available (Pan-region))
    3.  **Submit Button**: Full-width primary button reading: `Complete [Company | Seller] Registration`.
*   **Footer Link**: "Already have an account? Sign in" leading back to `/login`.

### Key Interactivity
*   Dynamic section swap inside the wizard based on the active role switcher choice.
*   Form validation: custom pattern matching for Email, GSTIN, and Mobile parameters.
