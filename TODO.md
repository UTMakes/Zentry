# Zentry Website Improvements Plan

This document tracks upcoming features, refactoring goals, and technical debt to resolve. Feel free to re-order the priorities!

## Phase 1: Data & Backend Integration

- [ ] **Externalize Data Source:** Move the `catalog` JSON object into a real-time database (e.g., Firebase Firestore, Supabase, or a Vercel Postgres DB) so updates happen instantly without needing a full site redeploy.
- [ ] **Fuzzy Search Integration:** Replace the basic string matching in the search bar with a fast, typo-tolerant library like **Fuse.js** or **Algolia** to improve discoverability.
- [ ] **Dynamic SEO Metadata:** Currently, all pages share the same Open Graph tags. Add logic to dynamically update `<meta property="og:title">` and images when a specific product deep link (e.g. `?id=mc_modpack_01`) is shared.

## Phase 2: User Experience (UX) & Features

- [ ] **User Accounts (Auth):** Integrate simple authentication (e.g., Google OAuth via Firebase) so users can save their "Favorites" to the cloud across devices, replacing the current `localStorage` dependency.
- [ ] **Advanced Theming System:** Build on the "Matrix Protocol" easter egg to add a user-facing toggle that enables Light Mode, Dark Mode, and Custom Accent Colors (e.g., Neon Pink, Cyberpunk Yellow).
- [ ] **Dynamic Live Viewer Counts:** Turn the mock "viewing right now" count into a real-time presence system using WebSockets or Firebase Realtime Database.

## Phase 3: Administrative Workflows

- [ ] **Admin Dashboard:** Create a `/admin` route (password protected) that allows approved users to directly Add, Edit, or Delete software from the catalog without touching code.
- [ ] **Direct File Uploads:** Connect an S3-compatible storage bucket (like AWS S3, R2, or Firebase Storage) to handle artifact uploads directly via the new Admin Dashboard.

## Phase 4: Architectural Overhaul (Optional but recommended long-term)

- [ ] **Migrate to Next.js or Vite (React/Vue):** As the HTML/JS becomes more complex, maintaining UI state (like filters, sorting, modals) gets harder. Migrating to a modern Component-based framework solves this effortlessly while boosting page speed.
