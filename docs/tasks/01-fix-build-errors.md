# Build Fix Plan (2026-01-23)

## Overview
This document tracks the steps required to resolve the 19 build errors encountered during `npm run build`.

## Identified Issues & Solutions

### 1. Duplicate/Backup Files
**Issue**: Several backup files (`App copy 2.tsx`, `App copy.tsx`, `App_23-01.tsx`) are included in the compilation, causing TypeScript errors due to missing props in older versions of components.
**Solution**: Delete these files as they are redundant and actively harmful to the build.

### 2. `useCollections.ts` Argument Mismatch
**Issue**: `withTimestamp` is called with 4 arguments, but only accepts 1.
**Solution**: Change the logic to use `paymentTimestamp` (which accepts 4 arguments) or correctly use `withTimestamp`. Given the context of "saving collection" with status and amount, `paymentTimestamp` is the correct function to use.

### 3. `useExpensePayments.ts` Conflicts
**Issue**: 
- `paymentTimestamp` is defined locally AND imported, causing a name conflict.
- It is called with 1 argument, but expects 4.
**Solution**: 
- Remove the local definition of `paymentTimestamp`.
- Import `withTimestamp` (or use `simpleTimestamp`) for simple note stamping, OR use `paymentTimestamp` with full arguments if a detailed note is required. *Decision: Use `withTimestamp` for consistency with current single-arg usage.*

### 4. `import.meta.env` and TS Errors
**Issue**: TS doesn't recognize `import.meta.env` in `lib/` files.
**Solution**: Add `vite/client` to the `types` array in `tsconfig.json` (or ensure `vite-env.d.ts` is present and included).

### 5. `vite.config.ts` Module Resolution
**Issue**: Cannot find `@vitejs/plugin-react`.
**Solution**: This is likely a `compilerOptions.moduleResolution` mismatch in `tsconfig.node.json`. Ensure it matches Vite 5+ standards (usually `bundler` or `NodeNext`).

## Execution Log

- [ ] Delete `App copy 2.tsx`
- [ ] Delete `App copy.tsx`
- [ ] Delete `App_23-01.tsx`
- [ ] Update `src/hooks/useCollections.ts`
- [ ] Update `src/hooks/useExpensePayments.ts`
- [ ] Update `tsconfig.json` / `src/vite-env.d.ts`
- [ ] Update `tsconfig.node.json` (if needed) for `vite.config.ts`
