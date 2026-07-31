# Architecture Documentation

Read in this order — each builds on the last:

1. [`database-architecture.md`](./database-architecture.md) — the Universal Data Model: every table, relationship, RLS policy, and index across all ten product domains.
2. [`system-architecture.md`](./system-architecture.md) — how every layer (Presentation → API → Business → Repository → Infrastructure) communicates, request/event flow, the AI Orchestrator, and scaling strategy.
3. [`ai-architecture.md`](./ai-architecture.md) — the AI service layer (`website/lib/ai/**`) in implementation-level detail: providers, prompts, credits, caching, memory.

## Status legend

Both `database-architecture.md` and `system-architecture.md` mark every
section as either **shipped** (real, working code) or **proposed** (a
target design, not yet built). Take the "shipped" label literally — it
means the described table, route, or file exists in `website/` today.
