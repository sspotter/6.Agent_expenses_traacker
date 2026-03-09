# Agent Expenses Tracker

This project is an **Agent Expenses Tracker**, designed as a daily payment tracking system for small recurring collections. It supports partial payments, late settlements, and weekly expenses, with a strong audit trail.

## Project Overview

The Agent Expenses Tracker aims to provide a robust system for managing daily collections and expenses. Key functionalities include:

*   **Daily Collection Tracking:** Monitoring expected versus collected amounts, accommodating full, partial, and missed payments.
*   **Settlements:** Allowing past partial payments to be settled in future periods without altering historical data.
*   **Reporting:** Generating monthly summaries and weekly income/expense breakdowns.
*   **User Interface:** A structured interface with month navigation, summary panels, a daily collection grid, and weekly totals. The UI adapts for mobile viewing.

The development methodology emphasizes using Markdown (MD) files in the `docs/` directory as the source of truth, with AI playing a key role in code generation, validation, and documentation updates. The core workflow is: **Docs (MD) → AI → Code → Review → Update Docs → Repeat**.

## Key Technologies

*   **Frontend Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Database Interaction:** Supabase (indicated by `@supabase/supabase-js` dependency)

## Building and Running

The project utilizes npm scripts for common development tasks:

*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    This command starts the Vite development server.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This command compiles the TypeScript code and bundles the application using Vite for production deployment.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    This command serves the production build locally for testing.

*   **Lint Code:**
    ```bash
    npm run lint
    ```
    This command runs ESLint to check for code quality and style issues.

## Development Conventions

*   **Source of Truth:** Project specifications, design decisions, and requirements are meticulously documented in Markdown files within the `docs/` directory. Code generated must align with these documents.
*   **AI Collaboration:** AI tools are leveraged for code generation, logic validation, and documentation updates, driven by context from the Markdown files.
*   **Atomic Changes:** AI-driven updates aim for small, focused tasks per prompt.
*   **Immutability:** Historical data (past months' data) is treated as read-only to ensure data integrity.
*   **Codebase Structure:** The project follows a standard frontend structure with `src/` containing components, hooks, pages, types, and utilities. Extensive documentation is also present in `docs/` and `src/docs/`.
