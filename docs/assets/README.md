# Assets

Documentation-only imagery. **Not** used by the running application —
app-runtime assets (favicons, OG images actually served to users) stay in
`website/public/` exactly as they are today.

| Subfolder | Contains | Naming |
|---|---|---|
| [`diagrams/`](./diagrams/) | Architecture diagrams, ER diagrams, request/event flow exports | `domain-diagramtype.svg`, e.g. `jobs-erd.svg` |
| [`flows/`](./flows/) | User journey maps, wireframes | `persona-journey.svg`, e.g. `fresher-journey.svg` |
| [`brand/`](./brand/) | Logos, icon set, color/type specimens | `logo-{variant}-{size}.svg` |
| [`screenshots/`](./screenshots/) | Product screenshots used inside documentation | `module-view-date.png` |

## Current state

All four subfolders are currently empty (holding only a `.gitkeep` so git
tracks the empty directory). The architecture diagrams referenced in
`docs/architecture/*.md` exist as Mermaid source embedded directly in
those Markdown files — export them here as static images only if a
non-Markdown-rendering context (a slide deck, a printed doc) needs them.
