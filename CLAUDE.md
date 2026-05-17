# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build + type check
npm run lint     # ESLint
npx tsc --noEmit # Type check only
```

No test suite is configured yet.

## Stack

- **Next.js 16** (App Router, Turbopack) — uses `src/proxy.ts` instead of `src/middleware.ts` (Next.js 16 renamed it); the export must be named `proxy`, not `middleware`
- **Supabase** — PostgreSQL + Realtime + Auth + Storage (free tier)
- **Zustand** with `persist` for client-side cart state (stored in localStorage as `qr-cart`)
- **Tailwind CSS v4**

## Architecture

### Two user surfaces, one codebase

**Customer (unauthenticated):** `/(customer)/[branchSlug]/table/[tableId]/` — kebab-slug identifies the branch in the URL, UUID identifies the table. No login required; RLS policies allow public insert on `orders`, `order_items`, `staff_calls`.

**Staff (authenticated):** `/kds`, `/pos`, `/admin/*` — protected by `src/proxy.ts` which redirects unauthenticated requests to `/auth/login`.

### Session model

Each time a customer sits down a `sessionId` is generated in `src/store/cart.ts` (Zustand persist). This ID ties together all orders for one visit on one table. It is written into `orders.session_id` and used to scope the order history page.

### Realtime

KDS (`/kds`) and order history (`/orders`) subscribe to Supabase Realtime channels on the `orders` table. POS additionally subscribes to `staff_calls`. Channels are cleaned up on component unmount.

### Payment flow

1. Customer submits cart → `orders` + `order_items` rows created, `payment_status = 'unpaid'`
2. Customer chooses method on `/payment` page:
   - **VietQR**: `src/lib/payments/vietqr.ts` builds a free `img.vietqr.io` URL (no API key needed) using env vars `NEXT_PUBLIC_BANK_ID`, `NEXT_PUBLIC_BANK_ACCOUNT`, `NEXT_PUBLIC_BANK_NAME`
   - **MoMo**: displays phone number from `NEXT_PUBLIC_MOMO_PHONE`, manual transfer
   - **Cash**: sets `payment_status = 'pending'`, staff confirms in POS
3. POS cashier selects orders and marks `payment_status = 'paid'`

### Supabase clients

- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`), used in `'use client'` components
- `src/lib/supabase/server.ts` — server client (`createServerClient` with cookie store), used in Server Components and Route Handlers
- Never mix them; server client requires `await cookies()` from `next/headers`

### Database schema

Full schema + seed data in `supabase/schema.sql`. Run it once in Supabase SQL Editor. Key relationships: `branches → tables`, `branches → categories → menu_items`, `branches → orders → order_items`. Realtime is enabled on `orders`, `order_items`, `staff_calls`.

## Environment variables

All required vars are `NEXT_PUBLIC_*` (no server-only secrets currently). Template is in `.env.local`. For Vercel deployment, also set `NEXT_PUBLIC_APP_URL` to the production domain — this is used to generate QR code URLs in `/admin/tables`.
