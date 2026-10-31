# Current milestone — Publish Nest for Raven

**Goal:** Publish the current working interface as the public Nest for Raven repository.

**User-visible result:** The app, README, package metadata, and repository use the Nest for Raven name. A public GitHub checkout includes the working UI, feature plan, verification scripts, and optional Docker backend setup.

**Completion checklist:**

- [x] Public name, account, and existing repository inspected
- [x] Branding and public setup documentation updated
- [x] Build, tests, API coverage, Docker configuration, and browser branding verified
- [x] Exact staged files and Git history checked for credentials and local runtime data
- [x] Release committed, pushed, and publicly readable on GitHub

**Published:** [Stormxftw/nest-for-raven](https://github.com/Stormxftw/nest-for-raven), `main`, verified on 2026-10-31. Anonymous requests can read the repository, README, and example screenshot; the remote release matches the local commit. The previous repository history is preserved.

**Not part of this milestone:** New Raven capabilities, a hosted deployment, a package-registry release, changing Docker data volumes, or a new live-model mission.

The broader roadmap is in [RAVEN_FEATURE_PLAN.md](RAVEN_FEATURE_PLAN.md). Next recommended milestone: one real model-generated mission with parallel tasks and dependent synthesis in this UI.

## Previous milestone — Raven in Docker

**Goal:** Install the Raven harness in a local Docker container using its official image recipe.

**User-visible result:** Raven's bundled web interface is available at http://127.0.0.1:18793, with durable data and repeatable start/stop commands.

**Completion checklist:**

- [x] Native AMD64 image builds from the existing pinned upstream checkout
- [x] Container is healthy; the web page and authenticated gateway respond
- [x] A saved session survives container recreation
- [x] Setup and start/stop instructions match the tested commands
- [x] Deployment files are ready to commit

**Not part of this milestone:** Migrating local sessions or credentials, replacing the custom UI's existing backend connection, adding Raven features, or public hosting.

Verification details and commands are in [DOCKER.md](DOCKER.md). Next recommended milestone: configure one model provider in this container and verify a single real conversation. Model execution and long-term memory are not configured or verified in this fresh installation.

## Previous milestone — Parchment materials and task activity

**Goal:** Give Raven a parchment-and-ink visual finish with colorful icon fills and a restrained activity flare inspired by the local aura-kit work.

**User-visible result:** Paper textures across conversation, chart, and inspector; colored, filled agent emblems; a task-count fill and moving spark while work is active. The fixed chart and developer-tool interactions remain usable.

**Completion checklist:**

- [x] Application builds and existing tests pass
- [x] Task-count fill and activity/idle/attention states verified
- [x] Reduced motion suppresses the flare, and example Stop pauses it
- [x] Desktop and phone readability, inspection, draft preservation, and touch scrolling checked
- [x] Screenshots reviewed, run/verification notes updated, changes ready to commit

**Not part of this milestone:** Changing chart placement, new Raven pages, a particle engine, imported aura-kit runtime code, or a new live-model mission.

Reference: G:/aura-kit README, demo screenshot, and state-driven display concepts. The Raven implementation is new local UI code. The broader page plan remains in RAVEN_FEATURE_PLAN.md. Next recommended milestone: prove one real model-generated mission graph with parallel tasks and dependent synthesis. Human visual acceptance is pending.

## Previous milestone — Fixed hierarchy and restrained fantasy styling

**Goal:** Replace the flickering movable map with a neatly organized, static org-style task chart and a warm, subtly mystical visual direction.

**User-visible result:** Readable task cards follow prerequisites from top to bottom, parallel branches align, and normal scrolling keeps text at full size. Selection, properties, output, and specialist conversations still work. The interface uses warm charcoal, parchment text, antique gold, and restrained serif headings.

**Completion checklist:**

- [x] Application builds and all 25 tests pass
- [x] Pointer dragging and keyboard movement leave the hierarchy fixed
- [x] Prerequisite placement, parallel branches, joins, reordered snapshots, and fallback layouts tested
- [x] Desktop, laptop, and phone workflow checked; conversation drafts and inspector actions work
- [x] Connected polling and example lifecycle verified without card movement or flashing
- [x] Setup instructions and page/feature roadmap reflect the static-chart direction
- [x] Final captures reviewed and verification recorded; changes ready to commit

**Not part of this milestone:** Freehand drawing, editable execution edges, persisted manual arrangements, new Raven pages, or a new live-model orchestration run.

The full page/feature roadmap remains in [RAVEN_FEATURE_PLAN.md](RAVEN_FEATURE_PLAN.md). The next recommended milestone is M1: prove one real model-generated task graph. Human visual acceptance is pending.

The entries below are historical. This milestone supersedes their draggable layout, card entrance, and status-pulse behavior.

## Previous milestone — Animated task lifecycle and Raven coverage plan

**Goal:** Make task arrival and state changes understandable through motion, and define the pages needed for Raven feature coverage.

**User-visible result:** A labeled example playback demonstrates arrival, queued, working, complete, and attention states. The same motion responds to connected task snapshots. A source-backed roadmap assigns Raven functionality to pages and independently verifiable milestones.

**Completion checklist:**

- [x] Production build and existing tests pass
- [x] Task arrival and working/completion/attention transitions verified in the browser
- [x] Arranged positions and camera survive updates; unchanged snapshots do not replay transitions
- [x] Reduced motion, stop/restart, and phone layout verified
- [x] Raven pages, features, API gaps, dependencies, and acceptance checks documented
- [x] Verification and run instructions updated; changes ready to commit

**Not part of this milestone:** Implementing every planned page, new execution controls, automatic camera following, persisted canvas layouts, or a drawing-editor migration.

The page/feature roadmap is in [RAVEN_FEATURE_PLAN.md](RAVEN_FEATURE_PLAN.md). Technical checks passed; human motion acceptance is pending. Next: prove one real generated task graph, as milestone M1 in the plan.

## Previous milestone — Readable, movable task map

**Goal:** Make the conversation readable and let Joe arrange and inspect individual task nodes.

**User-visible result:** Familiar system typography, larger high-contrast text, independent node dragging, a clear dependency map, and a Properties tab alongside task output.

**Completion checklist:**

- [x] Application builds and existing tests pass
- [x] Dragging one node leaves other nodes in place and survives task/status refreshes
- [x] Properties, dependencies, output, and specialist conversation actions work
- [x] Desktop and phone layouts checked in a real browser
- [x] Run instructions and verification evidence updated
- [x] Changes ready to commit

**Not part of this milestone:** Replacing the canvas engine, drawing executable connections, editing Raven task configuration, freehand whiteboards, or saving layouts across reloads.

## Previous milestone — Conversation workspace 0.2

**Goal:** Complete one real mission conversation through Raven, including a persistent specialist conversation and return to the host.

**User-visible result:** A compact dark workspace with colorful agent details, a usable composer, live output, targeted conversations, stop/steer controls, human decisions, and task inspection.

**Completion checklist:**

- [x] Application builds
- [x] Real host send/stream/complete works with existing Codex sign-in
- [x] Real Raven-General direct conversation, history, and pending host handoff work
- [x] Real Raven-Code ACP conversation works from the separate working directory
- [x] Primary browser send/history/draft path tested
- [x] Real clarification answer, cancellation, and next-message recovery tested in browser
- [x] Example and 390px mobile layouts exercised
- [x] Setup instructions match tested commands
- [x] Sol review complete on final behavior — approved in round 2
- [x] Reviewed changes ready for release (GitHub publication requested)

**Not part of this milestone:** Full Raven feature parity, attachment uploads, provider/settings editors, credential entry, scheduling, idea capture, multi-user hosting, installing every optional specialist engine.

Technical evidence and known limits are in VERIFICATION.md. One rare temporary duplicate-display nit is recorded in BACKLOG.md. Human visual acceptance is pending.
