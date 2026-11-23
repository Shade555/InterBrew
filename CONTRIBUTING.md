# Contributing to InterBrew

Thank you for helping improve InterBrew. Please keep contributions focused, tested, and consistent with the existing application.

## Before You Start

1. Read the [README](README.md) and search existing issues and pull requests.
2. For a bug, use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
3. For a new idea, use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
4. Do not include credentials, tokens, private user data, or `.env` files in issues or commits.
5. For [Nexus Spring of Code](https://github.com/nexus-spring-of-code), wait for an issue to be assigned to you before opening a PR. NSOC26 contributions use `nsoc26`, with `level1`, `level2`, or `level3` describing the contribution's difficulty.

## Development Prerequisites

Install the following before setting up the project:

- Git
- Node.js 20 or newer and npm
- A Supabase project with access to the Supabase SQL Editor
- A Groq API key for AI interview and report features
- A Resend API key and verified sender domain if working on email reminders

Check the installed versions:

```powershell
node --version
npm --version
git --version
```

The project currently uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, Groq, Resend, Three.js, ReactFlow, and Motion. The repository has separate TypeScript and JavaScript files, so preserve the style of the surrounding file when making a change.

## Fork and Branch

```bash
git clone https://github.com/<your-username>/InterBrew.git
cd InterBrew
git remote add upstream https://github.com/Shade555/InterBrew.git
git switch main
git pull --ff-only upstream main
git switch -c feat/short-description
```

Use a focused branch name such as `feat/add-topic-filter`, `fix/login-error`, or `docs/update-setup`.

## Configure a Local Environment

From the repository root, copy the example below into `.env.local` and replace every placeholder with a value from your own development services:

```dotenv
# Supabase: Project Settings -> Data API/API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# Required by server-side AI routes
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

# Required by email reminder routes
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Only required when running the dashboard seed script
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SEED_USER_ID=your-supabase-auth-user-uuid
```

Variable usage:

| Variable | Required for | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client and API routes | Public application configuration |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser authentication and database access through RLS | Public application configuration |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged API actions and dashboard seeding | **Server-only; never expose or commit** |
| `GROQ_API_KEY` | Mock interviews, scenario insights, and AI reports | **Server-only** |
| `GROQ_MODEL` | Optional model override for Groq requests | Server-only |
| `RESEND_API_KEY` | Sending interview reminder emails | **Server-only** |
| `NEXT_PUBLIC_APP_URL` | Cron callback URL for reminders | Public application configuration |
| `SEED_USER_ID` | Dashboard seed script only | Local shell variable |

Do not use the service-role key in browser code. Supabase client requests made with the anon key depend on Row Level Security policies. If you do not need AI or email functionality, those features will not work locally until their private variables are configured, but the rest of the application can still be developed.

## Set Up Supabase

1. Create a Supabase project and copy its URL and anon key into `.env.local`.
2. In the Supabase dashboard, open **SQL Editor**.
3. Run the scripts below one at a time. Stop if a script reports a missing prerequisite rather than ignoring the error:

   1. `scripts/create_learning_tables.sql`
   2. `scripts/create_collections_table.sql`
   3. `scripts/create_collections_support_tables.sql`
   4. `scripts/create_challenge_tables.sql`
   5. `scripts/create_dashboard_table.sql`
   6. `scripts/create_legacy_user_dashboard.sql`
   7. `scripts/create_user_interviews_table.sql`
   8. `scripts/create_user_ai_reports_table.sql`
   9. `scripts/create_user_module_progress_table.sql`
   10. `scripts/create_user_dashboard_trigger.sql`
   11. `scripts/create_user_interviews_policies.sql`
   12. `scripts/create_collection_resources_policies.sql`
   13. `scripts/alter_readiness_to_jsonb.sql` (only for an existing numeric `readiness_score`)
   14. `scripts/add_streak_column.sql`
   15. `scripts/add_readiness_breakdown.sql`
   16. `scripts/add_daily_xp_to_user_ai_reports.sql`
   17. `scripts/update_leaderboard_categories.sql`

   The first four schema scripts create the application tables that were previously referenced by the codebase but had no repository schema script. The remaining scripts apply existing incremental migrations and policies. These scripts create the tables and columns required by the current application, but they do not seed learning content, collection content, challenge rows, or badges.

4. Confirm that the tables used by the feature you are changing exist and that its RLS policies allow the intended authenticated user access.
5. For local sample data, run the collection seed after the `collections` table exists:

   ```powershell
   node scripts/seed_collections.js
   ```

6. To seed a dashboard row, sign up a local test user, copy that user's Supabase Auth UUID, set `SEED_USER_ID`, and run:

   ```powershell
   $env:SEED_USER_ID = "00000000-0000-0000-0000-000000000000"
   node scripts/seed_dashboard.js
   ```

   The dashboard seed uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS, and must only be run against a development project.

## Install and Run

```powershell
git clone https://github.com/<your-username>/InterBrew.git
Set-Location InterBrew
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The application initializes a daily email-reminder scheduler when the server starts; do not configure a real email provider for local work unless you intend to test that route.

Available npm scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build and run Next.js validation |
| `npm run start` | Serve a completed production build |

## Make Changes

1. Keep changes scoped to one issue or feature.
2. Follow the existing TypeScript/JavaScript, React, Next.js, and CSS patterns.
3. Prefer existing components and utilities over duplicating logic.
4. Keep secrets in environment variables and update documentation when configuration changes.
5. Add or update tests when the behavior can be tested. Verify responsive behavior for UI changes.
6. Preserve the existing GPL-3.0 attribution and license requirements.

## Validate Locally

```bash
npm install
npm run lint
npm run build
```

Run `npm run lint` after each logical change. Run `npm run build` before opening a pull request; it catches type, route, and production compilation issues that the development server may not expose immediately. If a change requires Supabase data or environment variables, explain the setup and validation steps in the pull request. Never paste secret values into logs, screenshots, issue reports, or pull requests.

### Common Setup Problems

- **Invalid Supabase URL/key:** confirm the values come from the correct Supabase project and that the URL starts with `https://`.
- **Unauthorized database request:** check that the user is authenticated and the relevant RLS policy exists; do not solve this by exposing the service-role key.
- **AI route failure:** confirm `GROQ_API_KEY` is present and restart the dev server after changing `.env.local`.
- **Email route failure:** confirm `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, and a verified Resend sender configuration.
- **Seed script failure:** run it from the repository root, confirm the target table exists, and verify that the service-role key is for the same Supabase project.
- **Build failure after changing environment code:** remember that server-only variables must not be referenced from client components.

## Commit and Pull Request

Use clear, imperative commit messages, for example:

```text
Add readiness report loading state
Fix challenge completion validation
Update local setup documentation
```

Push your branch and open a pull request against `Shade555/InterBrew:main`:

```bash
git push -u origin feat/short-description
```

Complete the pull request checklist and describe:

- What changed and why
- How it was tested
- Any database migrations or environment variables required
- Screenshots or recordings for visual changes
- Any known limitations or follow-up work

Maintainers may request revisions before merging. By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
