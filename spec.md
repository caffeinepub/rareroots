# Specification

## Summary
**Goal:** Add backend and database integration to RareRoots by implementing a fully functional Motoko backend canister and wiring the frontend query hooks to live canister calls.

**Planned changes:**
- Define stable variables in `backend/main.mo` for all core data types: Producer, Product, Order, LiveStream, and User Profile, ensuring state persists across canister upgrades.
- Implement all public CRUD endpoints for producers, products, orders, live streams, user profiles, and follower management as required by the frontend query hooks.
- Add access control so only producers can manage their own products and only admins can approve/reject producers.
- Integrate `razorpayPaymentId` into the Order data type — stored on creation, returned in queries, and defaulting to null for existing orders via migration logic in `backend/migration.mo`.
- Implement blob storage in the backend (stable byte arrays) with upload/retrieve endpoints for profile photos, product thumbnails, voice notes, and brand logos.
- Replace all mock/stub data in `frontend/src/hooks/useQueries.ts` with live canister calls using the `useActor` hook, and ensure React Query cache invalidation works correctly after mutations.

**User-visible outcome:** The application is fully backed by a live canister — user profiles, producer listings, products, orders, and live streams are all persisted and retrieved from the backend. File uploads (photos, logos, voice notes) are stored on-chain, and payments record Razorpay IDs against orders.
