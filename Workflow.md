
## Principles

1. Documentation is generated with implementation, never afterward.
2. Every change must be visible in UI before completion.
3. UX quality is a first-class requirement.
4. Follow DESIGN_SYSTEM.md for any styling requirement
5. Context compounds — every feature updates project memory.
6. Future enhancements are captured immediately.

---

# Project Structure

/project

/docs
FEATURES.md
BACKLOG.md
ARCHITECTURE.md

/context
feature-name.context.md

/implementation
feature-name.impl.md

/src

/tests
e2e
unit

---

# Workflow

## CASE 1 — New Feature

Input:
"Build Vendor Bundle Builder"

### Step 1 — Create Implementation Plan

Generate:

implementation/vendor-bundle-builder.impl.md

Contains:

* Objective
* Scope
* UX expectations
* Technical approach
* Data changes
* Acceptance criteria
* Edge cases

Template:

Feature:
Purpose:
Components:
API:
DB:
UX:
Tests:
Future Improvements:

---

### Step 2 — Implement

Agent:

* Creates files
* Writes code
* Updates routes
* Generates components

Rules:

* Keep architecture boundaries
* Avoid duplicate abstractions
* Mobile responsive

---

### Step 3 — Generate Context

Create:

context/vendor-bundle-builder.context.md

Store:

* Decisions made
* Files touched
* Known limitations
* Dependencies
* Patterns introduced

Template:

What changed:
Why:
Tradeoffs:
Next considerations:

---

### Step 4 — Run Quality Gate

Checklist:

□ Builds
□ Lint passes
□ Types pass
□ Unit tests pass

---

### Step 5 — Open Chromium

Run E2E:

Test:

* Navigation
* Empty states
* Errors
* Responsive
* Keyboard
* Loading
* Accessibility

Capture:

* screenshots
* recordings

---

### Step 6 — UX Review

Review:

Smoothness:
□ no jank

Responsiveness:
□ mobile
□ tablet
□ desktop

Perceived Performance:
□ skeleton
□ optimistic updates

Visual:
□ spacing
□ hierarchy

---

### Step 7 — Update Product Docs

Update FEATURES.md

Append:

## Vendor Bundle Builder

Description:
Preview:
Status:
Dependencies:
Owner:

---

### Step 8 — Update Backlog

Update BACKLOG.md

Format:

Now
Next
Later

Record:

* enhancements
* technical debt
* ideas

---

# CASE 2 — Existing Change

Input:
"Modify RFQ creation"

Flow:

Read existing context
→ Generate implementation update
→ Implement
→ Update context
→ Regression test
→ Chromium validation
→ Update feature docs
→ Update backlog

---

# FEATURES.md Format

Feature Name

Status:
Live / Beta / Planned

Problem:
What it solves

Flow:
How user uses it

Preview:
Screenshots

Technical:
Modules

Metrics:
Success indicators

Future Enhancements:

---

# UX Rules (Mandatory)

Performance:
<100ms interactions

Loading:
Skeletons > spinners

Forms:
Autosave

Lists:
Virtualize

Errors:
Actionable

Animations:
150–250ms

Accessibility:
Keyboard first

Mobile:
Works before desktop polish

---

# Definition of Done

Code complete
+
Context updated
+
Chromium E2E pass
+
Responsive verified
+
Features updated
+
Backlog updated
+
Enhancements captured
