# Raven harness in Docker

The root `compose.yaml` runs EverMind Raven's bundled web interface and gateway at **http://127.0.0.1:18793**. This is a separate installation from the custom UI on port 4173 and the host installation in `.raven-local/`.

## Start and stop

Start Docker Desktop, then run these commands from this repository:

```powershell
docker compose up -d --wait --wait-timeout 240
docker compose ps
```

Open http://127.0.0.1:18793. Local browser sign-in is automatic. On a fresh installation, choose a model provider in the setup screen or **Settings > Model providers** before sending a message. No host credentials or sessions are imported automatically.

```powershell
# Stop Raven while preserving its data.
docker compose stop

# Start it again.
docker compose up -d --wait --wait-timeout 240

# Show recent logs (these can contain a private one-time sign-in link).
docker compose logs --tail 80 raven
```

The container has `restart: unless-stopped`, so Docker starts it again when its engine starts unless you explicitly stopped it. Docker Desktop must be running.

## Build on a fresh checkout

Requirements: Docker Desktop using Linux containers, Docker Compose, and Git. The existing source checkout is pinned to `9d9bec90bcd76186d2981fd23b3b6280d83e3684` (Raven 0.2.6).

Only if `upstream-raven` is absent:

```powershell
git clone https://github.com/evermind-ai/raven.git upstream-raven
git -C upstream-raven checkout 9d9bec90bcd76186d2981fd23b3b6280d83e3684
```

Build and start:

```powershell
docker compose up -d --build --wait --wait-timeout 240
```

The image is tagged `raven-harness:9d9bec9` and uses the official, unmodified `upstream-raven/Dockerfile`. On 2026-10-30 the published `evermindshanda/raven:latest` manifest offered ARM64 only, so this installation builds natively for this computer's AMD64 engine. The build retains the official default memory plugins, messaging dependencies, document resources, and LibreOffice previews. Source and the Python lockfile are pinned; base-image tags and the Dockerfile's plugin-install step are controlled by upstream and are not a completely reproducible dependency snapshot.

## Persistent data and local access

- Compose project: `raven-harness`; service: `raven`; container: `raven-harness-raven-1`.
- Named volume: `raven-harness_raven-data`, mounted at `/data`. Raven's home is `/data/.raven`.
- Configuration, sessions, workspace files, logs, and memory under `/data` survive container replacement.
- `docker compose down` keeps the data volume. Adding `--volumes` (or `-v`) deletes it and its saved data.
- The published port binds only to `127.0.0.1`. Automatic browser sign-in is intended for this local access.
- No host project directory, credentials directory, or Docker socket is mounted into the container.

The custom UI still targets the host gateway on port 18792. Connecting that UI to the Docker gateway is a separate follow-up; use port 18793 for the complete bundled Raven interface.

## Verification

Verified locally on 2026-10-30:

- `docker compose config --quiet` passed.
- `docker compose --progress plain build raven` built the native `amd64` image from the pinned checkout; the upstream checkout remained unmodified.
- `docker compose up -d --no-build --wait --wait-timeout 240` returned healthy. Installed package: Raven 0.2.6; memory plugin: 1.4.2.
- `http://127.0.0.1:18793/health` returned HTTP 200 with `ok: true` through the published port.
- An anonymous RPC WebSocket was refused with HTTP 401. Loading the web page supplied the browser cookie; authenticated RPC handshake, setup-status, session-list, and session-title operations passed.
- A disposable saved conversation was renamed through RPC. After `docker compose up -d --no-build --force-recreate --wait --wait-timeout 240`, both its saved message and edited title remained available. The fixture was then removed through RPC.
- Playwright opened the actual page, reached the first-run provider setup, and opened the provider dropdown. The inspected screenshot is `output/playwright/raven-docker-setup.png`. Temporary verification browsers were closed.
- The existing custom UI still returned HTTP 200 on port 4173.

The browser briefly lost its connection during intentional container replacement and required a page reload to reconnect. If a tab remains disconnected after a restart, refresh it.

Build output and the no-model persistence check are in the ignored `output/docker/` directory. No provider credentials were entered or imported, and no model calls ran. Model responses and memory extraction remain unverified until a provider is configured. The official default image also omits the optional PPT/design engines; this installation does not claim all specialists have been exercised.
