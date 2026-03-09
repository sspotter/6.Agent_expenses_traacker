
# Vercel Routing & Default Worker – Implementation Guide

## 1. Problem Statement

When deploying the application to **Vercel**, direct navigation or page refresh on worker-specific routes (e.g. `/adhama`, `/worker/:id`) results in a **404 error**. Additionally, the application currently requires explicit worker selection or password entry, which creates friction for first-time or casual users.

This document defines the **official implementation strategy** to:

* Support SPA routing on Vercel
* Introduce a **default worker** that loads automatically
* Preserve password-protected workers
* Ensure future scalability for authentication and admin roles

---

## 2. Root Cause Analysis

### 2.1 Vercel 404 Issue

* The app is a **Single Page Application (SPA)** using client-side routing (React Router).
* Vercel attempts to resolve URLs as physical files.
* Routes like `/adhama` do not exist as files → Vercel returns 404.

### 2.2 Default Worker Gap

* No canonical entry point worker exists.
* Refreshing or opening `/` has no guaranteed worker context.
* Password-protected workers lose unlock state on reload.

---

## 3. Vercel SPA Routing Fix (Required)

### 3.1 Implementation

Create a file named `vercel.json` in the project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3.2 Effect

* All routes are served through `index.html`
* React Router handles routing
* Page refresh and direct links work correctly

### 3.3 Deployment Steps

1. Add `vercel.json`
2. Commit changes
3. Redeploy to Vercel

---

## 4. Default Worker Concept

### 4.1 Definition

A **Default Worker** is a public-facing worker that:

* Loads automatically when the app opens
* Requires no password
* Acts as the main entry point

This avoids forced authentication while preserving worker isolation.

---

## 5. Database Schema Changes

### 5.1 Workers Table Additions

```sql
ALTER TABLE workers
ADD COLUMN is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
```

### 5.2 Constraints

* Only **one worker** may have `is_default = true`
* Enforced at application logic level (initially)

### 5.3 Example Default Worker

```json
{
  "name": "Main Worker",
  "is_default": true,
  "is_admin": true,
  "password_hash": null
}
```

---

## 6. App Startup & Routing Logic

### 6.1 On Application Load

1. Parse route parameters
2. If a valid worker slug exists → load that worker
3. Else → fetch default worker
4. Redirect to default worker route

### 6.2 Pseudocode

```ts
if (!routeWorkerSlug) {
  const defaultWorker = await fetchDefaultWorker();
  navigate(`/${defaultWorker.slug}`, { replace: true });
}
```

---

## 7. Password & Session Behavior

### 7.1 Unlock Persistence

* Unlocked workers should be stored in `localStorage`
* Refreshing the page should NOT require re-entering the password

Example:

```ts
localStorage.setItem('unlocked_workers', JSON.stringify([...ids]));
```

---

## 8. Admin Role Behavior

* Admin is implemented as a **special worker** (`is_admin = true`)
* Admin can:

  * Edit financial data
  * Change worker rates
  * Suspend / unsuspend workers
  * Remove passwords
  * Export / import data

No separate authentication system is introduced at this stage.

---

## 9. Definition of Done

* [ ] Vercel routes no longer return 404 on refresh
* [ ] `/` always redirects to default worker
* [ ] Default worker loads without password
* [ ] Password-protected workers remain protected
* [ ] Unlock state persists across refresh
* [ ] Worker switching works reliably

---

