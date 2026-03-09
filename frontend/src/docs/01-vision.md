# Vision

**A daily payment tracking system for small recurring collections, supporting partial payments, late settlements, and weekly expenses, with a strong audit trail.**

## Core Philosophy
This project is built on the principle of **Docs as Code**. We use Markdown (MD) files as the **Source of Truth** for all product thinking, specifications, and design.

- **Living Documents**: The `docs/` folder is not just for reading; it drives the development.
- **AI Collaboration**: AI acts as a "junior engineer + product designer" that reads these docs to generate code, validate logic, and find inconsistencies.
- **Immutability & Trust**: The system is designed to be a reliable financial tool where history is sacred. Past data is never silently edited; changes are recorded as new transactions (settlements).

## The Workflow
1. **Think in MD**: Store product thinking in `.md` files.
2. **Validate with AI**: Ask AI to review docs for edge cases.
3. **Generate Code**: Use AI to scaffold code based on specific docs (e.g., "Build SQL schema from `05-data-model.md`").
4. **Update Docs**: Reflection of code changes back into docs to keep them current.

## Key Features
- **Daily Collection Tracking**: Full, Partial, and Missed states.
- **Settlements**: Handling late payments for past partials without rewriting history.
- **Weekly Expenses**: Clear separation of income and operational costs.
- **Reporting**: Instant monthly summaries and weekly breakdowns.
