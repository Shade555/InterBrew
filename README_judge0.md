Judge0 local setup (Docker Compose)
===================================

This repository includes a Docker Compose file to run Judge0 CE locally (Judge0, Postgres, Redis).

Files added:
- `docker-compose.judge0.yml` - Compose file for Judge0 CE + Postgres + Redis
- `.env.judge0.example` - example environment variables for the app to connect to Judge0

Quick start
-----------

1. Install Docker and Docker Compose on your machine.

2. Copy the example env to a local env file for your app (not required for Docker Compose):

   ```bash
   cp .env.judge0.example .env.judge0
   ```

3. Start the Judge0 stack:

   ```bash
   docker compose -f docker-compose.judge0.yml up -d
   ```

4. Wait a minute for the services to initialize. Judge0 should be available at:

   - http://localhost:2358/

   (If you are using Docker Desktop on macOS/Linux and have port collisions, change the host port mapping in the compose file.)

5. Configure your application to use Judge0 by setting the environment variable `JUDGE0_URL`.
   Example in macOS zsh:

   ```bash
   export JUDGE0_URL=http://localhost:2358
   # optionally export JUDGE0_KEY=your_token_if_required
   ```

6. Use the existing `/api/phase1/run_code` endpoint in this project to proxy code submissions to Judge0. The endpoint expects JSON: `{ source, languageId, stdin }`.

Notes & troubleshooting
-----------------------
- The `judge0/judge0:latest` image requires a persistent Postgres DB and Redis; the compose file mounts volumes for both.
- If the Judge0 web UI returns 404 or you get network errors, check container logs:

  ```bash
  docker compose -f docker-compose.judge0.yml logs -f judge0
  docker compose -f docker-compose.judge0.yml logs -f db
  docker compose -f docker-compose.judge0.yml logs -f redis
  ```

- If your Judge0 image tag or API port differ, update `docker-compose.judge0.yml` accordingly and update `JUDGE0_URL`.

Security
--------
- Running Judge0 locally is fine for development, but evaluate security for production. Do not expose Judge0 publicly without proper auth and network protections.
