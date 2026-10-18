# Alumni Collective

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat&logo=vite)](https://vitejs.dev/)
[![TanStack Router](https://img.shields.io/badge/TanStack-Router%20%26%20Start-ff4154?style=flat)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)

A modern, editorial-grade alumni engagement and networking platform designed for colleges and universities. **Alumni Collective** bridges the gap between graduates, current students, and academic institutions through high-impact mentorship, opportunity discovery, visual network exploration, microtasks, and philanthropic giving.

Built with an editorial aesthetic—eschewing generic AI templates for warm off-whites, refined typography, generous whitespace, and purposeful asymmetrical layouts.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Routing Conventions](#routing-conventions)
- [Contributing & Development](#contributing--development)
- [License](#license)

---

## Features

### 🔍 Searchable Alumni Directory & Profiles
- Dynamic multi-parameter filtering by graduation year, industry, employer, geographic region, and specialized skills.
- Rich editorial profile views (`/alumni/:id`) with verified credentials, career timelines, and direct outreach actions.

### 🌐 Interactive Network & Regional Map
- Visual alumni connection graph and interactive map view (`/network`) powered by Google Maps API to explore geographic distribution and industry clusters worldwide.

### 🤝 Mentorship Hub
- Structured 1-on-1 mentorship matching (`/mentorship`).
- Booking workflow with goals, availability management, review processes, and ongoing mentorship tracking.

### 💬 Direct Real-Time Messaging
- Unified messaging interface (`/messages`) facilitating conversations between alumni, mentors, and students.

### 💼 Jobs, Internships & Referrals
- Job board (`/jobs`) curated by alumni with direct internal referral requests and application tracking.
- Filter by contract type (Full-time, Internship, Remote), seniority, and alumni affiliation.

### ⚡ Microtasks & Project Bounties
- Project-based micro-internships (`/tasks`) posted by alumni for students to gain real-world portfolio experience.

### 🎓 Student Career Portal
- Tailored hub (`/student`) providing undergraduates with resume reviews, career exploration tools, and alumni access.

### 👥 Affinity Communities & Chapters
- Regional chapters and interest-based discussion groups (`/communities`) with member directories and activity feeds.

### 📅 Events & Reunions
- Event management (`/events`) for alumni galas, homecoming reunions, webinars, and networking meetups with RSVP management.

### 🎁 Philanthropy & Giving Campaigns
- Dedicated fundraising portal (`/give`) with campaign milestones, preset and custom contribution tiers, impact stories, and donation tracking.

### 📊 Network & Class Analytics
- Comprehensive platform dashboards (`/analytics`) showing demographic distributions, employment trends, giving metrics, and engagement statistics.

### 🔒 Role-Based Authentication
- Secure authentication powered by Supabase Auth with email magic links, password resets, and Google OAuth support.
- Role-based experiences for Alumni, Current Students, and Administrators.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Routing & SSR** | [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [Lucide React Icons](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **State & Data Fetching** | [TanStack React Query](https://tanstack.com/query) |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| **Visualizations & Maps** | [Recharts](https://recharts.org/), [@googlemaps/js-api-loader](https://www.npmjs.com/package/@googlemaps/js-api-loader) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |

---

## Directory Structure

```text
alumni-collective/
├── drizzle/                      # Database schema definitions & migrations
├── src/
│   ├── assets/                   # Static assets, branding, and imagery
│   ├── components/               # Reusable UI component library (Radix + Tailwind)
│   ├── hooks/                    # Custom React hooks
│   ├── integrations/
│   │   └── supabase/             # Supabase clients, auth middlewares, and types
│   ├── lib/                      # Utilities, helpers, and formatters
│   ├── routes/                   # File-based routing (TanStack Router)
│   │   ├── __root.tsx            # Global application shell layout
│   │   ├── index.tsx             # Homepage / Editorial landing
│   │   ├── directory.tsx         # Searchable alumni directory
│   │   ├── alumni.$id.tsx        # Individual alumni profile view
│   │   ├── network.tsx           # Interactive network graph & map
│   │   ├── mentorship.tsx        # Mentorship matching & sessions
│   │   ├── messages.tsx          # Real-time direct messaging
│   │   ├── jobs.tsx              # Jobs, internships & referral board
│   │   ├── tasks.tsx             # Microtasks & project bounties
│   │   ├── communities.tsx       # Affinity groups & chapters
│   │   ├── events.tsx            # Events, webinars & RSVP tracking
│   │   ├── give.tsx              # Giving campaigns & donation tiers
│   │   ├── analytics.tsx         # Platform and class analytics
│   │   ├── student.tsx           # Student career portal
│   │   ├── account.tsx           # User settings & profile management
│   │   ├── auth.tsx              # Sign in / Sign up flow
│   │   ├── reset-password.tsx    # Password reset handler
│   │   └── updates.tsx           # Institutional updates & newsletter
│   ├── routeTree.gen.ts          # Auto-generated TanStack router manifest
│   ├── main.tsx                  # Client entry point
│   ├── server.ts                 # Nitro server handler
│   └── styles.css                # Global styles and design system variables
├── .env.example                  # Environment variable template
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js**: Version `20.x` or higher (recommended via `nvm`)
- **Package Manager**: `npm` (or `bun` / `pnpm`)
- **Supabase Account**: A Supabase project with database & authentication configured

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd alumni-collective
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   ```sh
   cp .env.example .env
   ```
   Fill in your Supabase credentials in `.env` (see [Environment Configuration](#environment-configuration)).

4. **Start the local development server:**
   ```sh
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://xyzcompany.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anonymous key for client-side API requests |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase Project reference ID |
| `SUPABASE_URL` | Server-side Supabase URL |
| `SUPABASE_PUBLISHABLE_KEY` | Server-side publishable key |
| `SUPABASE_PROJECT_ID` | Server-side project ID |

> [!NOTE]
> **Google OAuth Setup**:
> Do not put Google Client Secrets into the `.env` file. Configure Google OAuth directly within your **Supabase Dashboard** under **Authentication -> Providers -> Google**.

---

## Available Scripts

| Script | Command | Purpose |
|---|---|---|
| **Development** | `npm run dev` | Runs the Vite development server with Hot Module Replacement |
| **Build** | `npm run build` | Compiles client and server bundles for production |
| **Build (Dev mode)** | `npm run build:dev` | Compiles the project targeting development mode |
| **Preview** | `npm run preview` | Previews the production build locally |
| **Lint** | `npm run lint` | Runs ESLint across the codebase |
| **Format** | `npm run format` | Runs Prettier to format source files |
| **Test** | `npm run test` | Runs the Vitest test suite |
| **Test (Watch)** | `npm run test:watch` | Runs tests in watch mode |

---

## Routing Conventions

This project utilizes [TanStack Start & TanStack Router](https://tanstack.com/router) with file-based routing:

- All routes are defined inside `src/routes/`.
- Dynamic parameters use bare `$` syntax (e.g., `alumni.$id.tsx` for `/alumni/:id`).
- Root layout is managed exclusively in `src/routes/__root.tsx`.
- The `src/routeTree.gen.ts` file is generated automatically by Vite during development. Do not edit it manually.

---

## Lovable Sync

This project is connected with [Lovable](https://lovable.dev).

- Commits pushed to the connected branch automatically sync back to Lovable.
- Avoid rewriting published Git history (`git push --force`, rebasing, or squashing pushed commits) to maintain project continuity with Lovable.

---

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for more information.
