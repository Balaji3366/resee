# Security Policy

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a security vulnerability.

Instead, report it privately to the repository owner (see `.github/CODEOWNERS`)
with:

- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any relevant logs or proof-of-concept (redact real user data)

We will acknowledge receipt and work with you on a fix timeline before any
public disclosure.

## Scope

Particular areas of sensitivity in this codebase, given its architecture
(see `docs/architecture/system-architecture.md` § Security):

- Row Level Security policies on any Supabase table
- Admin authorization (`website/lib/adminAuth.ts`, `admin_users` grants)
- AI credit/subscription enforcement (`website/lib/ai/credits.ts`)
- Any endpoint that accepts user-supplied content forwarded to an AI provider

## Supported versions

This project has not yet reached a 1.0 release (see `docs/standards/versioning.md`).
Security fixes are applied to the `main` branch only until a formal release
train exists.
