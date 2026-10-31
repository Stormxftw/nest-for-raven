# Verification — Nest for Raven 0.2

## Public release preparation — 2026-10-31

- `npm run build` passes with the Nest for Raven package name, document title, navigation label, footer, and icon. `npm test` passes all **25 tests in four files**.
- `python scripts/check-raven-coverage.py` passes against the pinned Raven checkout. Public source links now point to that exact upstream revision. `docker compose config --quiet` passes; this release check did not rebuild or recreate the existing container.
- `scripts/check-task-map.cjs` passes against the production bundle at desktop, laptop, and phone sizes: fixed pointer/keyboard positions, stable status updates, readable scrolling, task tabs, dependency navigation, specialist Talk, and draft preservation. No browser errors were reported.
- A fresh Example-mode browser check confirms the Nest title, accessible navigation label, footer, and served icon. The inspected **1600 × 1000** screenshot at [docs/nest-for-raven.png](docs/nest-for-raven.png) contains only the bundled illustrative mission. It is the one curated capture included in the public repository.
- High-signal credential patterns were checked across the release files and all **128 existing history blobs**, with no matches. No local Raven data, credentials, dependency checkout, build output, or private test capture is included. This is a focused publication check, not a comprehensive security audit.
- No new live-model turn was run for the naming/publication change. Earlier model and Docker evidence remains dated separately below.
- Published at [Stormxftw/nest-for-raven](https://github.com/Stormxftw/nest-for-raven) with the existing history preserved. Unauthenticated GitHub requests returned HTTP 200 for the public repository metadata, `main` reference, README, and screenshot. The remote commit and both downloaded files matched the local release.

Date: 2026-10-30. Windows, Node 24.19, Python 3.12, Raven 0.2.6 at `9d9bec90bcd76186d2981fd23b3b6280d83e3684`.

## Parchment materials and state-driven activity — 2026-10-30

- Inspected `G:/aura-kit/README.md`, the demo screenshot, and its documented trigger/condition/fill patterns. Raven uses newly written UI code and a local paper texture; no aura-kit runtime code or assets were copied, no dependency was added, and the reference repository was not modified.
- `npm run build` passes; all **25 existing tests** pass. The graph layout/execution contracts are unchanged.
- Replaced dark work surfaces with textured parchment and dark ink, retained a dark green tool rail, and added colored fills to agent emblems. The host uses a feather, design a pen tool, and code a code-window glyph. UI controls remain standard, and serif type is limited to display headings.
- `check-parchment.cjs` passes: the local texture loads; the activity spark's transform actually changes while node positions remain fixed; the effect does not intercept input; reduced motion removes it. Representative base-color text contrast ratios: conversation **11.92:1**, secondary description **5.28:1**, properties **12.04:1**, host agent label **5.52:1**, activity caption **5.24:1**. These are targeted checks, not a complete accessibility audit.
- The activity track's accessible value follows completed/reported task counts. Browser lifecycle checks verify 2/3, 3/3, and 3/4 fills across queued, working, complete, and attention states. The flare appears during running work and disappears at idle/completion/attention without running work. Example Stop pauses it, and runtime reduced-motion changes suppress all activity-track animation. No new model connection is opened by the example.
- Existing map workflow checks pass: fixed pointer/keyboard positions, selection and task tabs, dependency navigation, specialist Talk, host-draft preservation, and desktop/laptop/390px phone layouts. The phone chart remains at scale 1 and has no horizontal overflow. The 1366×768 conversation view initially placed the footer 10px below the viewport; reducing the chart's minimum viewport height fixes that without scaling the cards.
- Connected browser fixture passes: active work shows the flare, completion removes it, task counts update correctly, and repeated polling/mission switching preserve cards. This uses simulated RPC, not a fresh real-model run. Browser console: zero errors and zero warnings.
- The touch-input check passes after waiting for native scroll momentum to settle before its selection tap: a 260px swipe, tap-to-inspect, and return-to-host all work in Chromium mobile emulation. No physical device was used.
- Final browser evidence and captures are stored under `output/playwright/parchment-*.png` (ignored). Reviewed the normal desktop, expanded 1440×1080 chart, 1366×768 conversation, 390×844 map, and mobile touch captures. The earlier org-chart captures remain available for comparison. Human visual acceptance is pending.

The following sections document earlier visual milestones; the paper surfaces and activity track above supersede their dark-only palette and spinner-only activity treatment.

## Fixed hierarchy and restrained fantasy styling — 2026-10-30

- `npm run build` passes. `npm test` passes all **25 tests**, including six hierarchy tests: prerequisites above dependents, aligned branches, snapshot order independence, multi-parent joins/non-overlap, appended-chain stability, scoped/missing dependencies, and finite empty/cyclic fallbacks.
- `scripts/check-task-map.cjs` passes against the production app. Pointer dragging and arrow/delete keys cannot move/remove cards; opacity stays 1 and the card body has no transform during pointer movement. Status replay and draft typing leave coordinates unchanged. Connectors are not animated. Properties, Output/Prompt/Files, dependency navigation, expanded Talk, and draft recovery work.
- Layouts checked at **1440×960, 1366×768, and 390×844**. The phone example has a 336px-wide chart viewport with no horizontal chart or page overflow. Native vertical scrolling keeps the graph at scale 1; task labels are 15px desktop/14px phone and conversation text is 16px system sans-serif.
- `scripts/check-task-motion.cjs` passes for queued → working → complete and review → attention, finite playback, stop/restart, stable existing chain coordinates and viewport, and absence of card-body opacity/transform animations. The working spinner stops under reduced motion, including a preference change during playback. Example playback opens no gateway socket.
- `scripts/check-task-map-refresh.cjs` passes in a fresh browser session with simulated RPC: completion, a new dependent task, repeated polling, and mission switching keep cards visible and the hierarchy stable. Script-like output stays text, with no mutation RPCs or browser errors.
- The connected fixture initially exposed nodes stuck at `visibility:hidden` after a mission switch. Explicit graph-node width/height now avoid waiting for asynchronous measurement to reveal fixed-size cards; the same connected fixture passes after that fix. A lifecycle assertion also caught remaining border/background transitions, which were removed so card bodies are fully still.
- `scripts/check-task-touch.cjs` passes in a separate Chromium mobile context with real dispatched touch start/move/end events: a swipe scrolls the chart **193px**, tapping a task selects its properties, and tapping the up-arrow returns to the host. React Flow's default `touch-action:none` is overridden for native scrolling. An initial high-level synthetic scroll gesture did not move the page; the explicit touch-event check supplies the final gesture evidence. No physical phone was used.
- Inspected captures: `output/playwright/org-chart-desktop.png`, `org-chart-expanded.png`, `org-chart-mobile-map.png`, `org-chart-touch.png`, and `org-chart-attention.png`. Additional laptop, phone conversation, and phone attention captures are in the same ignored folder. The visual system uses warm charcoal, parchment text, antique gold, muted agent accents, and limited serif headings.
- The final connected browser console reports **zero errors and zero warnings**; all example/touch checks also report zero page errors.
- `python scripts/check-raven-coverage.py --check` passes. The roadmap retains 18 Raven-facing surfaces plus the personal-note proposal, with P04/M0/M8 updated for a fixed hierarchy and saved notes rather than manual arrangements. No new roadmap page was implemented.

Limits: no fresh live-model mission was launched in this visual pass. Connected refresh evidence uses simulated RPC; prior real conversation evidence is recorded below. Large graphs can scroll horizontally, and a changed dependency structure can reorganize branches. Status-only/reordered snapshots do not change coordinates. Human visual acceptance remains pending.

The following sections record earlier milestones. Their drag/reset, zoom-to-fit, card entrance, and status-pulse behavior has been superseded by the fixed chart above.

## Animated lifecycle and feature plan — 2026-10-30

- `npm run build` passes. `npm test` passes all 22 tests, including three new placement regressions for reordered snapshots, manually occupied slots, and removed nodes.
- Browser `check-task-motion.cjs` verifies actual CSS card-arrival animations for build/review and four actual 750ms Web Animation status accents: build working/completed, review working/attention. This inspects animation objects/calls in the running page, not just CSS strings.
- Finite example playback, stop/restart, stable dragged position and camera, no pulse on unchanged state, no gateway socket from example playback, 390px layout without horizontal page overflow, and reduced-motion behavior all pass. Changing reduced motion during playback cancels an active accent; new transitions under reduced motion create no animated pulse, and the canvas has no running animations.
- Existing `check-task-map.cjs` passes after the change: independent drag, keyboard movement, reset, properties/dependencies, tabs, specialist Talk, draft preservation, and desktop/phone layouts.
- Extended `check-task-map-refresh.cjs` passes, including a fresh browser session: simulated connected RPC completion animates once, unchanged polling does not replay it, arriving tasks preserve position/viewport, and mission arrangements remain separate and restore. No mutation RPCs, executed output, or browser errors. One earlier run timed out locating the fixture task; the instrumented rerun and fresh-session run passed. That timeout's exact cause was not established.
- Browser console reports zero errors and zero warnings. Captures `output/playwright/motion-attention.png` and `motion-mobile.png` were inspected. An optional CLI recorder returned only after browser closure; its raw video output was not validated. Use the app's Play control for the demonstrated sequence.
- `RAVEN_FEATURE_PLAN.md` covers 18 Raven-facing page/surface owners plus the custom notes/idea-pocket proposal, with source links, acceptance criteria, backend gaps, and ordered milestones. No proposed navigation/page implementation was scaffolded.
- `python scripts/check-raven-coverage.py --check` passes: all 248 OpenRPC catalog methods map to declared page owners, including 20 explicitly unsupported stubs and 8 missing-handler methods from upstream's audit. Local source links in the plan/appendix were checked to exist. This is planning coverage, not 248 implemented/verified UI capabilities.

Limits: no fresh live-model DAG was launched; motion was tested against example state and simulated gateway snapshots. The same task components handle connected data. A real model-generated multi-agent graph is the next milestone. No automatic camera following, exit choreography, persisted layouts, node menus, or execution authoring was added. Human visual/motion acceptance remains pending.

## Readability and movable map follow-up — 2026-10-30

- `npm run build` passes; `npm test` passes all 19 existing tests.
- Replaced DM Sans with the system sans-serif stack (Segoe UI on Windows), removed its unused package, raised conversation text to 16px on desktop and phone, raised small interface labels to at least 12px, and brightened secondary text. Code blocks retain monospace.
- Browser-verified independent mouse dragging, keyboard arrow movement, and position reset. Status replay and typing leave the arranged positions unchanged. Delete cannot remove a Raven task from the UI.
- Browser-verified Properties, status/agent/dependency/usage fields, Output/Prompt/Files, dependency navigation, expanded map, Talk returning to the conversation, and preservation of the host draft.
- Simulated gateway socket test exercised the actual four-second polling path: completion and a newly reported task preserved the moved node and viewport. Missions with identical task/node IDs retained separate layouts; returning to the first restored its arrangement. Script-like output remained text, with no mutation RPCs or browser errors. This is a browser integration fixture, not a new real-model run.
- Inspected captures at 1440×960 and 390×844. No horizontal page overflow in phone conversation or map. Fit View gives an overview; node text scales with zoom, so use zoom or desktop expansion for detailed reading. Expanded desktop view has an 836×710 canvas and a 340px side inspector at the checked viewport. The final expanded layout and Talk return were checked after the CSS refinement.
- Browser console reports zero errors and zero warnings.
- Reproducible scripts: `scripts/check-task-map.cjs` and `scripts/check-task-map-refresh.cjs`. Existing stored-task script now explicitly chooses Output because selecting a card opens Properties.
- Captures: `output/playwright/readability-desktop.png`, `readability-expanded.png`, `readability-mobile.png`, and `readability-mobile-map.png` (ignored local artifacts).

Limits: positions live only in the current page and clear on reload. Properties are read-only Raven data; no property editor, context menu, whiteboard, or new execution controls were implemented. No fresh live-model run or external review was requested for this UI follow-up. Human visual acceptance remains pending.

## Implemented and checked

- TypeScript and Vite production build pass.
- All 19 focused tests pass. They exercise transport failures and response correlation; separate host/target streams; completion and stale-turn filtering; early subscription frames; steering/cancel RPC targeting; rejected sends; mission unsubscribe; scoped human decisions and refused responses. Review regressions cover delegated-history completion, direct-history hydration during replay without duplicate answer text, host inactivity while a specialist runs, host completion in the subscription gap, and a stale history response arriving after completion.
- Real RPC smoke: existing Codex OAuth access snapshot, `gpt-6.1-sol`, real host token stream and completion; Raven-General instance creation, direct response, persisted transcript, and pending host handoff. No fake transport or mocked model in that check.
- Real browser smoke against the production bundle: authenticate; read saved host/specialist conversations; switch recipients with separate drafts; send `RAVEN_BROWSER_OK` prompt; observe assistant response and idle completion; accepted draft clears.
- Raven-Code ACP variant also passes after the working-directory fix: real direct turn, persisted history, and pending host handoff. Its saved history was then opened in the browser and the host consumed its handoff on the next turn.
- Real browser control workflow: create mission; ask_user clarification shown and answered; `RAVEN_DECISION_OK` returned; next turn cancelled; following message completes with `RAVEN_RECOVERED_OK`. No mock transport. Browser console: zero errors or warnings on this production run.
- Example browser smoke: Send disabled, recipient drafts remain separate, Output/Prompt/Files tabs work, 390px Conversation and Team map views have no horizontal overflow.
- Stored-task smoke rerun against this release: real session/task/node reads pass; browser node inspection and dependency navigation pass; embedded script-like fixture text remains inert.
- Screenshots under ignored `output/playwright/`: `v2-example.png`, `v2-live.png`, `v2-mobile.png`, `v2-mobile-map.png`.

## Verification boundaries

- Steering and allow/deny/confirm routing have focused automated checks, but those specific actions were not exercised with a live model. Live cancellation and ask_user clarification were verified separately above.
- The spatial multi-agent example uses fixtures. The real conversation test does not ask a model to generate a task DAG or modify files.
- Optional Research and Design engines are missing. Raven-Code initially failed because its agent home was nested inside the launch working directory; the launcher now uses separate ignored `work/`, and its real turn passed.
- A Vite development dependency-optimization hang was observed after installing test dependencies. The production bundle serves normally. The original HMR duplicate-root warning was fixed by separating the React root entry from App.tsx.
- No full parity, credential-prompt UI, attachment support, provider management, large-graph stress test, or public deployment claim.
- Sol review was completed before the first release commit. Round 1 found two state bugs; both are fixed and regression-tested. Production build and real Raven-Code/host RPC and browser workflow were rerun successfully. Round 2 approved the final behavior with one deferred nit: rare history-before-replay ordering can temporarily display a direct answer twice until the next selected-history poll. No blocker or should finding remains open. See SOL_REVIEW.md.

The earlier 0.1 stored-fixture smoke verified the real gateway's session/task/node reads and inert script-like node output. That fixture is explicitly labeled and is not model work.
