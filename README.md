# Raven Spatial

A custom local web interface for [EverMind AI's Raven](https://github.com/evermind-ai/raven). Version 0.2 puts a working conversation beside a compact, colorful task map. You can send a mission, watch streaming output, steer or stop a turn, resume a specialist conversation, and bring its updates back to the host.

The interface is React/TypeScript. Raven owns models, tools, permissions, storage, and agent execution. Its downloaded source is untouched and Git-ignored. Created in [T3 Code](https://t3.codes).

## Run

Requirements: Node.js 22.12+ (verified with 24.19), npm. From this directory:

```powershell
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:4173**. This starts in labeled **Example mode**. No model work runs there. Explore the team, node Output/Prompt/Files, and replay. Each recipient has its own draft. On phones, switch Conversation / Team map using the top tabs. Use Fit View after resizing.

`npm run dev` is available for editing. The production bundle above is the verified launch path; one development dependency-optimization hang was observed during package installation and switching to the production bundle recovered it.

## Connect Raven

Requirements: Python 3.12, [uv](https://docs.astral.sh/uv/), Git. The clone and environment already exist here. For a fresh checkout:

```powershell
git clone https://github.com/evermind-ai/raven.git upstream-raven
git -C upstream-raven checkout 9d9bec90bcd76186d2981fd23b3b6280d83e3684
uv sync --project upstream-raven --no-dev --no-default-groups
```

To use an existing Codex OAuth sign-in:

```powershell
npm run configure:codex
```

This reads `$CODEX_HOME/auth.json` (or `~/.codex/auth.json`), copies only the access token and account metadata into this project's ignored Raven home, and asks the account for available models. It prefers `gpt-6.1-sol` when available. It never changes the source credential or copies its rotating refresh token. When access expires, sign in through Codex as usual, rerun this command, then restart Raven. It requires an existing OAuth sign-in, not an API-key-only Codex setup. Claude sign-in has not been configured or tested here.

In another terminal, start the gateway:

```powershell
npm run raven
```

Then authenticate the browser:

```powershell
npm run sign-in
```

Sign-in opens Raven's one-time authentication URL on **port 4173**. Choose **Connect your Raven → Connect to Raven**, then **New mission**. Enter sends; Shift+Enter inserts a line break. While a turn is running, the same composer sends steering input; Stop targets that recipient's current turn.

The launcher uses `.raven-local/` for persistent Raven data and `work/` as its working directory. Both are ignored. Keeping `work/` separate from the agent home also satisfies Raven-Code's ACP working-directory validation. This is a separate local installation; it is not an OS sandbox. Tool actions run under Raven's configured local permissions. The smoke prompts request no file or shell work.

Use `127.0.0.1` consistently. The authentication cookie is scoped to the UI proxy port. Services bind to loopback; this setup is not for public hosting. If 18792 is occupied and Raven picks another port, stop that newly started instance and free 18792 before relaunching. The UI proxy and helpers expect 18792.

## Working controls

- Create/open missions; send host messages with streamed output and recent tool activity.
- Select a resumable specialist in the team or recipient picker; read its saved conversation and send targeted turns. Existing instances come from Raven's delegation or native interface.
- Return to the host; pending specialist updates are announced above the conversation and are included by Raven on its next host turn.
- Steer or cancel the active recipient. Respond to per-request Allow once / Deny, confirmation, and clarification cards.
- Inspect delegated task dependencies, prompts, output, and reported file paths. File opening is not implemented.
- Reconnect explicitly after a connection loss. In-page drafts survive recipient/session switching and reconnect; reload resets the UI to example mode and clears unsent drafts.

## Verify

```powershell
npm test
npm run build
```

With both services running, the following exercises actual model turns and consumes the configured account's usage:

```powershell
uv run --project upstream-raven --no-sync python scripts/smoke-conversation.py
# Optional ACP specialist variant:
uv run --project upstream-raven --no-sync python scripts/smoke-conversation.py --agent Raven-Code
```

For stored-task reads without model calls:

```powershell
uv run --project upstream-raven --no-sync python scripts/smoke-raven.py
```

These scripts create an ignored temporary `.raven-local/test-auth.json` for browser tests. Keep it private and remove it after use. `check-example.cjs` and `check-live.cjs` are Playwright CLI browser smoke helpers; use `playwright-cli run-code --filename=...`. Load the temporary state before the live check and run it immediately after the conversation smoke on a fresh example page.

Exact evidence and limitations are in [VERIFICATION.md](VERIFICATION.md).

## Boundaries

This is the first input-capable release, not full Raven feature parity. Attachments, credential entry, provider/agent configuration screens, schedules, playbooks, memory management, file editing, and multi-user hosting remain outside 0.2. Credential requests direct you to Raven's native interface. Only approval cards can be rehydrated through Raven's pending-request API; a clarification/confirmation missed during a disconnected period may require stopping and retrying the turn.

Raven-General runs in-process; other specialists depend on their installed adapters and dependencies. This environment does not have Raven-Design's engine or Raven-Research's optional engine installed. The colorful multi-agent example is illustrative, not a claim that every illustrated specialist is ready locally. Task snapshots refresh every four seconds; conversation tokens stream live. Large graphs currently use a simple compact grid.

The creative direction and future input-functionality inventory are in [BACKLOG.md](BACKLOG.md).
