# ReSee Documentation

The single source of truth for what ReSee is, how it's built, and how we
work. Organized by audience — find your section below.

| Folder | Start here if you're... |
|---|---|
| [`product/`](./product/) | a Product Manager or stakeholder — vision, PRD |
| [`architecture/`](./architecture/) | a backend, frontend, or AI engineer planning a change |
| [`modules/`](./modules/) | anyone who needs the detailed spec for one specific feature |
| [`design/`](./design/) | a designer — brand and UX guidelines |
| [`standards/`](./standards/) | any engineer, before their first PR |
| [`adr/`](./adr/) | anyone asking "why did we build it this way?" |
| [`roadmap/`](./roadmap/) | anyone asking "what's next?" |
| [`assets/`](./assets/) | anyone needing a diagram, logo, or screenshot for a doc or deck |

## Reading order for a new contributor

1. `product/vision.md` — what ReSee is and why
2. `architecture/database-architecture.md` → `architecture/system-architecture.md` → `architecture/ai-architecture.md` — how it's built, in that order
3. `standards/` — how we write code and commits
4. `modules/` — the specific feature you're touching

## Document status

Every document states its status (Draft / Accepted / Superseded / Pending)
near the top. A document marked **Pending** describes an intended section
whose real content hasn't been written yet — it is deliberately not
fabricated placeholder content; treat it as a known gap, not a
finished spec.
