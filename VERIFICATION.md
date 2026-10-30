# Verification — Raven Spatial 0.2

Date: 2026-10-30. Windows, Node 24.19, Python 3.12, Raven 0.2.6 at `9d9bec90bcd76186d2981fd23b3b6280d83e3684`.

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
