# InterBrew

> AI-powered, gamified interview preparation across the technology domain.

InterBrew is a technology interview-preparation platform that combines structured learning, mock interviews, interactive challenges, and performance analytics in one Next.js application. It is designed to help learners build practical understanding and interview confidence across domains such as Data Structures and Algorithms, Operating Systems, Computer Networks, databases, frontend and backend development, cloud, security, and other software-engineering topics.

## Features

- Structured learning modules and scenario practice across multiple technology domains
- Collections of interview questions and problem-solving exercises, including DSA, databases, networking, and software development
- AI-assisted mock interviews and readiness reports
- Interactive challenges covering topics such as memory, deadlocks, scheduling, protocols, algorithms, and other technical concepts
- Dashboard, streaks, XP, badges, certificates, and leaderboard progress
- Supabase-backed authentication, database storage, and progress tracking
- Email reminders and transactional notifications through Resend

## Tech Stack

- Next.js 16 with the App Router and Turbopack
- React 19
- TypeScript and JavaScript
- Tailwind CSS 4, custom CSS, Radix UI, and shadcn/ui
- Supabase (PostgreSQL, authentication, and storage)
- Groq SDK for AI-powered interview and report features
- Three.js, React Three Fiber, ReactFlow, and Motion
- Node.js and npm

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- API credentials for the services used by the features you enable

### Installation

```bash
git clone https://github.com/Shade555/InterBrew.git
cd InterBrew
npm install
```

Create a `.env.local` file in the project root and add the variables described in [`CONTRIBUTING.md`](CONTRIBUTING.md). At minimum, local authentication and data access require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; AI, email, and server-side actions require their corresponding private keys. Never commit secrets; `.env*` files are ignored by Git.

Create the required Supabase tables and policies by following the SQL migration order in [`CONTRIBUTING.md`](CONTRIBUTING.md), then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before submitting a change, run:

```bash
npm run lint
npm run build
```

## Project Structure

```text
app/                 Next.js routes, pages, API routes, and shared UI
components/          Reusable UI components
lib/                 Shared services, scoring, Supabase, and utilities
public/               Images, fonts, audio, and other static assets
scripts/              Database migrations and seed scripts
voice-assistant/     Voice-assistant TypeScript configuration
```

## Contributing

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening an issue or pull request. Bug reports and feature ideas can also use the templates under [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/).

## Credits

InterBrew was originally created by [Shade555](https://github.com/Shade555), [Anzilaa](https://github.com/Anzilaa), and [Giselle728](https://github.com/Giselle728). Please preserve this attribution when redistributing or extending the project.

The original college semester project notes are preserved in [`PROJECT_ARCHIVE.md`](PROJECT_ARCHIVE.md).

## License & Attribution

Copyright (C) 2026 [Shade555](https://github.com/Shade555), [Anzilaa](https://github.com/Anzilaa), and [Giselle728](https://github.com/Giselle728)

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)** — see the [LICENSE](LICENSE) file for details.

Any modifications, distributions, or derivative works must retain this original copyright attribution and be released under the same GPL-3.0 license.
