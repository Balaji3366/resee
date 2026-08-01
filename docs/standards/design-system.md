---
status: Accepted
last-reviewed: 2026-08-01
---

# Design System & Shared Platform — Sprint 2, 3 & 4 (Slice 1 each)

The reusable layer every module builds on: design system (Sprint 2),
shared layouts/hooks/utilities (Sprint 3), shared services/forms/state
(Sprint 4). Each is its own **Slice 1** — see each section's "Deferred"
notes for what's intentionally not built yet.

## Tokens — `app/globals.css`

### Color
Unchanged from the v5 redesign — see the `@theme` block's inline role
comments. Summary: `ink` = cream background, `panel`/`panel-2` = card/
badge surfaces, `bone` = ink-black text/border, `slate` = muted text,
`amber`/`amber-dim`/`teal`/`teal-dim` = coral/violet/yellow/gold accents.

### Radius
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 12px | inputs, small controls |
| `--radius-md` | 16px | small cards, menus, popovers |
| `--radius-lg` | 20px | stat tiles |
| `--radius-xl` | 24px | cards |
| `--radius-2xl` | 32px | hero panels |
| `--radius-full` | 9999px | pills, buttons, chips |

### Shadow / elevation
The design language is deliberately flat — ink-border cards, no drop
shadow. Exactly two shadow tokens exist, for surfaces that must
genuinely float above content:
- `--shadow-sm` — tooltips, select menus, dropdown content
- `--shadow-lg` — dialogs, drawers

Do not add a third shadow level without a concrete new use case — this
is not a general elevation scale.

### Animation
- Durations: `--duration-fast` (150ms, e.g. tooltip/hover), `--duration-base`
  (200ms, e.g. dialog/select open), `--duration-slow` (400ms).
- Load-in: `.animate-fade-up` (existing, from the v5 redesign).
- Radix overlay transitions: `.radix-overlay` (backdrop fade) and
  `.radix-content` (scale+fade, driven by Radix's `data-state` attribute)
  — apply both classes to any new Radix-based overlay content.

### Breakpoints
No new breakpoints — Tailwind's default `sm/md/lg/xl/2xl` scale is used
as-is. De facto convention found in the existing codebase: `lg:` gates
sidebar/nav collapse (see `DashboardNavbar.tsx`/`DashboardSidebar.tsx`).
Follow this convention for new layout work rather than introducing a
different breakpoint for the same kind of decision.

### Dark mode
Future-ready, not implemented. A future dark theme would redefine the
same `@theme` token names under `:root[data-theme="dark"]` (see the
comment left in `globals.css`) — no dark palette exists today.

### Icons
`lucide-react` is the official general-purpose icon system (in use
across 69-76 files already). `components/icons/` is reserved for the v5
redesign's screen-specific bespoke animated SVG icons — it is not a
competing general icon system.

## Dependencies added this slice

- `@radix-ui/react-{dialog,tooltip,select,checkbox,radio-group,switch,avatar,slot}`
  — unstyled, accessible primitives. Chosen over hand-rolling focus-trap/
  ARIA/keyboard logic for ~15 components (same architecture shadcn/ui
  uses).
- `clsx` — conditional className joining.
- `class-variance-authority` — variant+size recipe pattern for new
  components (the 5 pre-existing primitives keep their original
  hand-written ternary pattern; not retrofitted).

## Component inventory

### Extended (not rewritten)
| Component | Change |
|---|---|
| `Button.tsx` | added `size` prop (`sm`/`md`/`lg`); now `forwardRef` so it composes with Radix `asChild` |
| `Card.tsx` | added `elevated` prop (uses `--shadow-sm`) |

### New this slice
| Component | Notes |
|---|---|
| `Input.tsx` | label/error/hint slots, left/right icon slots |
| `Textarea.tsx` | label/error/hint slots |
| `Checkbox.tsx` | Radix — Space to toggle, `role="checkbox"` |
| `RadioGroup.tsx` / `RadioItem` | Radix — arrow-key roving selection |
| `Switch.tsx` | Radix |
| `Select.tsx` | Radix — arrow keys, typeahead, Home/End |
| `Tooltip.tsx` + `TooltipProvider` | Radix — hover AND focus, Escape to dismiss. `TooltipProvider` is mounted once in `app/layout.tsx` |
| `Dialog.tsx` (compound: `Dialog`/`DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`/`DialogClose`) | Radix — focus trap, Escape, scroll-lock, return-focus |
| `Alert.tsx` | inline persistent banner, 4 variants |
| `ConfirmDialog.tsx` | built on `Dialog` — the pattern `ConfirmModal.tsx` hand-rolls today |
| `Avatar.tsx` | Radix — correct image-load-failure fallback timing |
| `Badge.tsx` | small status/count indicator (distinct from `Chip.tsx`, which is an interactive filter pill) |
| `Spinner.tsx` | |
| `Skeleton.tsx` | shape-matching loading placeholder |
| `EmptyState.tsx` | consolidates the pattern shared by `JobEmptyState`/`ProgressEmptyState`/`PracticeEmptyState` |
| `ErrorState.tsx` | section/page failure + retry; also covers "Retry UI"/"Network Error UI"/"Offline UI" via its `variant`/`onRetry` props |
| `LoadingState.tsx` | centered `Spinner` + message for a whole section |
| `lib/toast.ts` | `toastSuccess`/`toastError`/`toastInfo` — thin wrapper around the already-installed `sonner`, not a new toast component |

### Error handling pages (new)
`app/not-found.tsx` (404), `app/error.tsx` (route-segment error
boundary), `app/global-error.tsx` (root-level fatal error boundary — the
one place that deliberately does NOT use the component library, since it
replaces the root layout entirely and must render its own minimal
`<html>`/`<body>` per Next.js convention).

### Deferred to a future pass
~~MultiSelect, Dropdown menu, Autocomplete, Date Picker, standalone
Popover, Accordion, Tabs, Drawer, a distinct Notification component,
Pagination, Table, Data Table, Search Bar~~ — all built in **Sprint 2,
Slice 2** below. `Breadcrumb` was actually already built in Sprint 3
(`components/layout/Breadcrumb.tsx`), not deferred.

### Known duplication flagged, not migrated this pass
`ConfirmModal.tsx`/`LogoutModal.tsx`/`DeleteChatModal.tsx`/
`VersionHistoryDrawer.tsx` (4 independent modal implementations that
should eventually migrate to `Dialog`/`ConfirmDialog`), 15 files with
hand-rolled `animate-pulse` skeletons (→ `Skeleton`), 3 near-identical
empty-state components (→ `EmptyState`), `PracticeHistoryList.tsx`/
`InterviewHistoryList.tsx` (near-duplicate list components). All are
business-module files — migrating them is out of scope for a
foundation-only sprint.

## Accessibility checklist

- [x] Checkbox/RadioGroup/Switch/Select/Dialog/Tooltip: keyboard nav and
      ARIA roles handled by Radix — verified via each primitive's own
      documented behavior, not independently re-tested against WAI-ARIA
      APG (Radix's own test suite covers this).
- [x] Every form control (`Input`/`Textarea`/`Select`) associates its
      label via `htmlFor`/`id` (generated with `useId()` when not
      supplied) and wires `aria-invalid`/`aria-describedby` to its error
      message.
- [x] `Dialog` always renders a `DialogTitle` (Radix warns in dev if
      omitted) for screen-reader users, even when visually de-emphasized.
- [x] Icon-only actions (`Dialog`'s close button) carry an `sr-only` label.
- [ ] **Not yet done**: a real screen-reader pass (NVDA/VoiceOver) and an
      automated contrast audit across all variants — flagged as the next
      concrete accessibility step, not claimed as complete here.

## Performance checklist

- [x] `EmptyState`'s link actions use `next/link` (automatic route
      prefetching), not a raw `<a>`.
- [x] Radix overlay content (`Dialog`/`Select`/`Tooltip`) portals and only
      mounts its content when open — no hidden-but-rendered DOM cost.
- [ ] **Not yet done**: none of these components are dynamically
      imported (`next/dynamic`) yet — reasonable for this slice since
      nothing consumes them yet (zero real call sites, see Testing
      checklist). Once a heavy component (e.g. `Select` with a large
      option list, or `Dialog` content with rich forms) gets a real
      call site, wrap it in `next/dynamic` at that call site rather than
      inside the primitive itself.
- [ ] Image optimization (`next/image`) and memoization guidance apply
      per-consumer, not to this foundation layer itself — nothing here
      renders an `<img>` except `Avatar`, which already uses Radix's
      `AvatarImage`.

## Testing checklist

- [x] `npx tsc --noEmit` and `npm run lint` clean.
- [x] Manual smoke-render of every new component (temporary scratch
      import, removed after — see `docs/standards/testing-standards.md`
      for why no automated test runner exists yet in this repo).
- [ ] **Not yet done, and not fabricated as done**: these components
      have zero real call sites as of this slice (same "ships ready for
      adoption" pattern as Sprint 1's `lib/rateLimiting.ts`) — real
      integration testing happens naturally the first time a
      business-module feature adopts one. No automated component test
      suite exists yet; introduce one (Vitest + Testing Library) when a
      real regression first slips through manual verification, per
      `docs/standards/testing-standards.md`'s stated trigger.

---

# Sprint 3 — Shared Platform (Slice 1)

## Real duplication found and fixed

- `app/(dashboard)/layout.tsx` and `app/admin/(panel)/layout.tsx` were a
  **100% duplicate** (identical JSX/classes, differing only in which
  Sidebar/Navbar they imported) — now both are thin wrappers around
  `components/layout/AppShell.tsx`. `DashboardSidebar`/`DashboardNavbar`/
  `AdminSidebar`/`AdminNavbar` themselves are untouched — only the shell
  around them moved.
- `app/login/page.tsx` and `app/signup/page.tsx` were byte-for-byte
  identical shells (background glow, decorative grid, split two-column)
  — now both use `components/layout/AuthLayout.tsx`.
  `forgot-password`/`updat-password` use a different, simpler
  centered-card shape and were **not** migrated onto `AuthLayout`.

## Layouts (`components/layout/`)

| Component | Notes |
|---|---|
| `AppShell.tsx` | render-prop shell (`renderSidebar`/`renderNavbar`) owning the shared mobile-nav-open state — must stay a Client Component (`"use client"`) since it receives function props, which cannot cross a Server→Client boundary; both `app/(dashboard)/layout.tsx` and `app/admin/(panel)/layout.tsx` keep their own `"use client"` for the same reason |
| `AuthLayout.tsx` | the login/signup shell, with a `beforeContent` slot for signup's non-visual `GoalCapture` |
| `ContentWrapper.tsx` | plain max-width + padding primitive |
| `PageContainer.tsx` | `ContentWrapper` + optional back button + optional `SectionHeader` — the real replacement for `components/PageLayout.tsx`'s dead `variant` prop and stale dark background. `PageLayout.tsx` itself is left in place and working; its one consumer (`app/documents/page.tsx`, business-module) is not migrated |
| `ResponsiveGrid.tsx` | `cols`/`gap` props map to a **static lookup table** of literal Tailwind classes, not string-interpolated ones (`` `gap-${gap}` `` would never be picked up by Tailwind's build-time scanner, which needs literal class strings in source — this was caught and fixed during this slice, not shipped) |
| `Breadcrumb.tsx` | new — didn't exist before |
| `SectionHeader.tsx` | new — the title/subtitle/action pattern already repeated inline (Jobs header, Dashboard Overview header) |

## Hooks (`hooks/`)

| Hook | Notes |
|---|---|
| `useAuth.ts` | wraps `useUser()` (not a replacement), adds `signOut()`/`isAuthenticated` |
| `useDebounce.ts` | fills a confirmed gap — zero debounce utility existed anywhere |
| `useSearch.ts` | composes `useDebounce` for search-input state |
| `usePagination.ts` | generic page/pageSize state — no existing pattern conflicts |
| `useMediaQuery.ts` | wraps `window.matchMedia` — zero prior usage, all responsive behavior was Tailwind-class-only |
| `useLocalStorage.ts` | typed, cross-tab-synced — the 3 existing raw localStorage/sessionStorage call sites are not migrated |
| `useLoading.ts` | `{isLoading, start, stop, withLoading}` |
| `useToast.ts` | hook-shaped wrapper around `lib/toast.ts` |
| `usePermissions.ts` | client-side role check, backed by the one new route this slice adds: `app/api/auth/permissions/route.ts` (purely exposes the existing `requireAdmin()` from `lib/adminAuth.ts` — no new authorization logic) |

## Utilities

| File | Notes |
|---|---|
| `lib/format/date.ts` | consolidates the 2 duplicated `formatDate` variants found across 6 files (not migrated) + adds `formatRelativeTime` (genuinely new) |
| `lib/format/currency.ts` | consolidates `formatSalary` (duplicated across 2 files, not migrated) + generic `Intl.NumberFormat`-based `formatCurrency` |
| `lib/format/number.ts` | genuinely new — zero `Intl.NumberFormat` usage existed anywhere |
| `lib/validators.ts` | re-exports `lib/authValidation.ts`'s `isValidEmail` (reused, not duplicated) + adds `isValidUrl`/`isNonEmptyString`/`isInRange` |
| `lib/helpers.ts` | `cn()` — Sprint 2 installed `clsx` but never created this; every component since has hand-joined template literals instead. New components should use `cn()` going forward |
| `constants/enums.ts` | centralizes `ExperienceLevel`/`WorkMode` — found genuinely duplicated as identical literal unions in `types/interview.ts`'s `InterviewExperienceLevel` and `types/jobs.ts`'s `JobExperienceLevel`; neither existing type alias was migrated to import from here |

## Deferred (Sprint 3)

Migrating any of the flagged duplication's existing call sites to the
new utilities/components. A remaining handful of Sprint 2's own deferred
component list (MultiSelect, Accordion, Tabs, Table, etc.).

---

# Sprint 4 — Shared Services (Slice 1)

## What already existed, reused as-is

- **Subscription Service** = `lib/ai/credits.ts` (built in Sprint 1's AI
  architecture phase) — not rebuilt.
- **Permission Service** = `lib/adminAuth.ts` — not rebuilt; only
  exposed to the client via the one new `usePermissions` route.
- **Configuration Service** = `lib/config/*` — not rebuilt.

## New this slice

| File | Notes |
|---|---|
| `lib/apiClient.ts` | client-side request wrapper (`get`/`post`/`put`/`delete`) addressing the confirmed gap that all ~35 existing fetch-hooks hand-write the same try/catch/envelope-check with zero retry and zero cancellation. Retry policy (exponential backoff, gated to 5xx/network failures only, never 4xx) mirrors the exact pattern already proven in `lib/ai/providers/gemini.ts`. **Existing hooks are not migrated to it** — ships ready for new hooks to adopt |
| `lib/clientCache.ts` | minimal in-memory `Map`+TTL cache backing `apiClient`'s optional `cacheTtlSeconds` — no `@tanstack/react-query`/SWR introduced, matching this project's "add infra only when proven necessary" principle |
| `lib/services/storageService.ts` | generalizes `lib/uploadAttachment.ts` (parameterized bucket, user-scoped path, adds remove/list/getPublicUrl) — the original stays in place, its one call site is not migrated |
| `components/ui/Form.tsx` (`Form`, `FormField`) | bridges `react-hook-form` (new dependency, plus `@hookform/resolvers` for the `zod` resolver) to every Sprint 2 form component uniformly via `Controller`, rather than a different integration pattern per component type |
| `components/providers/AuthProvider.tsx` | Context wrapping `useAuth` — stops the `onAuthStateChange` duplication found between `hooks/useUser.ts` and `components/Navbar.tsx` from spreading further (`Navbar.tsx`'s own subscription is not migrated this pass). Also serves as "Session" state — Supabase's session is the session, not duplicated as a second context |
| `components/providers/FeatureFlagsProvider.tsx` | Context wrapping the existing static `featureFlags.config.ts` |
| `components/providers/LoadingProvider.tsx` | a small global loading-state context (e.g. future route-transition indicator) |

All three providers are mounted once in `app/layout.tsx`.

## Explicitly deferred, with reason

- **Notification Service** — not built. No `notifications` table exists
  (confirmed against migrations through `0013`) and no notification UI
  exists anywhere. Building a service against non-existent
  infrastructure would mean fabricating one — this needs the
  Notifications DB domain first (`docs/roadmap/roadmap.md` Phase 2).
- **Theme context** — not built. Sprint 2 left only a structural seam
  for a future dark palette; a context with nothing to switch between
  would be premature.
- **Preferences context** — not built. Already served by
  `hooks/useProfile.ts` (goal/target career/skill level); a second
  context would be a redundant second source of truth.
- **Notifications context** — not built, same reason as the service.
- Migrating any existing hook to `apiClient`/`clientCache`.
- Migrating `Navbar.tsx`'s duplicate auth subscription onto `AuthProvider`.

---

# Sprint 2 — Design System, Slice 2 (remaining component backlog)

Completes the component list Slice 1 deferred. Built autonomously per
standing instruction: complete the achievable backlog in full, document
and skip anything blocked by missing infrastructure, never fabricate.

## Housekeeping done first

- `components/Navbar.tsx` migrated onto `useAuthContext()` — removed its
  own duplicate `useState<any>(null)` + `onAuthStateChange` subscription
  + `loadUser` effect (the exact duplication `AuthProvider` was built in
  Sprint 4 to stop from spreading further). Its `handleLogout()` is
  **unchanged** — still calls `supabase.auth.signOut()` directly and
  redirects to `/`, deliberately not using `AuthProvider.signOut()`
  (which redirects to `/login`) since this is the marketing-site navbar,
  where redirect-to-home is the correct behavior.

## Dependencies added this slice

- `@radix-ui/react-{popover,accordion,tabs,dropdown-menu}` — same
  rationale as Slice 1's Radix set.
- `cmdk` — Autocomplete's combobox behavior (filtering + keyboard nav);
  no Radix combobox primitive exists.
- `react-day-picker` — DatePicker's calendar grid; no Radix calendar
  primitive exists. No default stylesheet is imported — every UI part is
  restyled via its `classNames` prop against our own tokens instead.

## New animation tokens

`accordionDown`/`accordionUp` keyframes + `.radix-accordion-content[data-state]`
classes, added to `app/globals.css`. Deliberately **not** the same
`contentShow`/`contentHide` keyframes Dialog/Select/Popover use — those
are a centered-popup scale+translate transform, while an accordion
section is an in-flow height expand/collapse driven by Radix's own
`--radix-accordion-content-height` custom property. Reusing the wrong
keyframe set was caught before shipping (see git history / prior
session) and would have applied a nonsensical transform to an in-flow
element.

## Component inventory — new this slice

| Component | Notes |
|---|---|
| `Popover.tsx` | `Popover`/`PopoverTrigger`/`PopoverClose`/`PopoverAnchor` (re-exported Radix) + styled `PopoverContent`. Base for `MultiSelect`/`Autocomplete`/`DatePicker` |
| `Accordion.tsx` | `Accordion` (re-exported Radix root) + `AccordionItem({value,title,children})` |
| `Tabs.tsx` | `Tabs`/`TabsContent` (re-exported) + `TabsList({items})` (pill-styled triggers) + `TabPanel` |
| `DropdownMenu.tsx` | `DropdownMenu`/`DropdownMenuTrigger` (re-exported) + `DropdownMenuContent`/`DropdownMenuItem({destructive,disabled})`/`DropdownMenuSeparator`. For action menus, distinct from `Select.tsx` (form value selection) |
| `MultiSelect.tsx` | composes `Popover` + `Checkbox` — no Radix multi-select primitive exists. Distinct from the pre-existing `components/jobs/MultiSelectChips.tsx` (a Jobs-module-specific chip picker, left as-is, not a duplicate) |
| `Autocomplete.tsx` | built on `cmdk`'s `Command`/`CommandInput`/`CommandList`/`CommandItem`/`CommandEmpty`, popover positioning via `@radix-ui/react-popover`'s `Anchor`/`Portal`/`Content` directly (cmdk owns keyboard nav, so the wrapping isn't `Popover.tsx`'s own re-export) |
| `DatePicker.tsx` | `react-day-picker`'s `DayPicker` (single-date mode) inside `Popover.tsx`; every `classNames` part restyled, no default CSS imported |
| `Drawer.tsx` | side-sliding panel — a Dialog variant built directly on `@radix-ui/react-dialog` (not `Dialog.tsx`'s `DialogContent`, since a drawer is edge-anchored/full-height, not centered). Animates via a plain CSS `transition-transform` keyed on `data-state`, not a keyframe animation — a deliberate difference from `Dialog.tsx` that also sidesteps its `animation-fill-mode` revert bug from Slice 1 |
| `Notification.tsx` | pure presentational row (icon/title/message/timestamp/unread-dot/dismiss) — **no backing data source**, same status as `EmptyState`/`ErrorState`. See the Notification Service blocker below |
| `Pagination.tsx` | presentational pager (prev/next + numbered window + ellipsis) driven by plain props; pairs with the `usePagination` hook from Sprint 3 but doesn't require it |
| `Table.tsx` | bare styled primitives (`Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`) — confirmed via research that **no existing hand-rolled `<table>` markup exists anywhere in the app** to preserve visual parity with; the app currently uses card-list layouts exclusively, so this styling is new, not a consolidation |
| `DataTable.tsx` | client-side-sortable table over an already-fetched array, built on `Table.tsx` + `EmptyState` + `Skeleton` — no `@tanstack/react-table`, consistent with the "add infra only when proven necessary" principle. Column definition is `{key, header, accessor, sortValue?, className?}`; only in-memory sort, no built-in pagination (compose with `Pagination.tsx` + `usePagination` separately if a call site needs it) |
| `SearchBar.tsx` | composes `Input.tsx` + the Sprint 3 `useSearch` hook; forwards only the debounced value to `onSearch` |

## Blockers reaffirmed (not new — carried forward from Sprint 4)

- **Notification Service / notification data**: still no `notifications`
  table in the schema (through migration `0013`). `Notification.tsx`
  ships as a presentational primitive only — wiring it to real data
  requires the DB migration + API first, which is a Phase 2 roadmap
  item, not a shared-platform utility.
- **Theme / dark-mode context**: still no dark palette designed. A
  presentational component can't be built against a palette that
  doesn't exist yet; this needs a product decision (what the dark
  palette actually looks like) before any implementation work.

Both are unchanged from the Sprint 4 write-up above — repeated here so
this slice's own "what's deferred and why" is self-contained.

## Verification performed

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean for every file touched/added this slice; the
  18 errors / 3 warnings ESLint reports are all pre-existing issues in
  unrelated business-module files (`app/quiz`, `app/resume/improved`,
  `components/AIChat.tsx`, etc.) untouched by this work.
- Manual smoke test: a temporary route rendered every new component
  (Popover, Accordion, Tabs, DropdownMenu, MultiSelect, Autocomplete,
  DatePicker, Drawer, Notification, Pagination, SearchBar, DataTable)
  against the dev server, confirmed real content + correct default
  `data-state` (open/closed/active/inactive) on every interactive
  element + zero error markers, then deleted; dev server stopped
  afterward.
- `git status` confined to: `components/ui/{Popover,Accordion,Tabs,
  DropdownMenu,MultiSelect,Autocomplete,DatePicker,Drawer,Notification,
  Pagination,Table,DataTable,SearchBar}.tsx` (new), `components/Navbar.tsx`
  (migrated), `app/globals.css` (accordion keyframes), `package.json`
  (new Radix packages + `cmdk` + `react-day-picker`), this doc — no
  Learning/Practice/Resume Studio/Mock Interview/Jobs/AI business-module
  files.

## Still deferred (unchanged from Sprint 3/4)

Migrating any existing hook to `apiClient`/`clientCache`. Migrating
existing `formatDate`/`formatSalary` call sites. Migrating the 4
independent modal implementations onto `Dialog`/`ConfirmDialog`, the 15
hand-rolled skeleton call sites onto `Skeleton`, or the 3 near-duplicate
empty-state components onto `EmptyState`. A real screen-reader pass and
automated contrast audit. Any automated test suite (still no runner
installed).
