# Nest for Raven — page and feature implementation plan

## Objective and finish line

Give Raven's user-facing capabilities a clear home in this interface, with one complete, verified workflow delivered at a time. This is a **large roadmap**, not authorization to implement every page in the current run.

Current delivery: a fixed prerequisite hierarchy, readable task inspection, a finite example playback, parchment materials, a task-count fill/activity flare, and this plan. The latest direction supersedes manual dragging and card/connector motion. All routes below are **proposed locations**, not newly implemented navigation. Keep the existing React application and Raven gateway; introduce pages when their first workflow is ready.

Full coverage means each supported capability below has a working UI path or an explicit, tested native/CLI handoff. The API inventory alone is not feature completion. Known unsupported upstream methods remain visibly unavailable; they are not represented by working-looking buttons. A backend upgrade requires a fresh contract audit.

Baseline: local Raven 0.2.6 at commit `9d9bec90bcd76186d2981fd23b3b6280d83e3684`, audited 2026-10-30. This plan makes no claim about later Raven releases. Existing verification is recorded in [VERIFICATION.md](VERIFICATION.md).

## Navigation map

Keep the main navigation focused on **Missions, Agents, Knowledge, Automation, and Connections**. Mission-specific tools stay inside a mission. Models, capabilities, memory, usage, and advanced operations are secondary settings destinations. These are product destinations; a destination can be a tab or inspector instead of a separate full-screen page.

| ID | Page or surface | Proposed location | Current state |
| --- | --- | --- | --- |
| P01 | Connection and first-run setup | `/connect` | Partial: connect dialog and setup check; credentials configured outside the UI |
| P02 | Mission library and archive | `/missions` | Partial: list, search, create, switch |
| P03 | Mission conversation and human decisions | `/missions/:id` | Partial: real host/specialist turns, drafts, stop/steer, decision cards |
| P04 | Task canvas and task inspector | `/missions/:id/map` | Partial: task snapshots, fixed hierarchy, properties/output, lifecycle playback; automatic multi-agent run proof remains open |
| P05 | Workspace, attachments, deliverables | `/missions/:id/files` | Partial: reported file paths only |
| P06 | Agent Hub and agent details | `/agents/:name?` | Partial: active mission roster and existing resumable conversations |
| P07 | Providers and model assignments | `/settings/models` | Planned |
| P08 | Skills, tools, MCP, plugins | `/settings/capabilities` | Planned |
| P09 | Knowledge bases and documents | `/knowledge/:base?` | Planned |
| P10 | Memory and recall configuration | `/settings/memory` | Planned |
| P11 | Playbooks and long-running executions | `/automation/playbooks/:id?` | Planned |
| P12 | Schedules, Oncall, proactive work | `/automation` | Planned; mechanisms need separate controls |
| P13 | Messaging connections | `/connections` | Planned |
| P14 | Shared browser | `/missions/:id/browser` | Planned |
| P15 | Run history, imports, export and reporting | `/missions/:id/history`, `/imports` | Planned |
| P16 | General settings, permissions, usage, health | `/settings` | Partial: connection status/error display |
| P17 | Advanced operations and developer tools | `/settings/advanced` | Planned; several capabilities need native handoffs |
| P18 | Registered machines | `/agents/machines` | Planned |
| P19 | Personal notes and idea pocket | Mission/node inspector | Proposal; our product extension, not a Raven parity requirement |

## P01 Connection and first-run setup

**Workflow:** open the app, establish the local gateway connection, understand missing setup, and send one real message.

- Keep explicit Example / Connected / Disconnected states. Add provider readiness, gateway/version compatibility, authentication expiry/reconnect, optional engine readiness, and actionable setup errors. Preserve drafts through reconnect.
- Use `system.hello/ping/version` and `setup.status`; hand provider setup to P07. Keep the existing local sign-in path until a supported native authentication flow is integrated. The UI must not call a provider configured merely because the gateway socket opened.
- **Acceptance:** a fresh browser can connect and send; expired authentication and a stopped gateway produce distinct recovery instructions; the correct Raven home/workspace is visible; Example never sends a turn.
- **Evidence:** [quick start](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/quick-start.md), [setup handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/setup.py), [current transport](src/rpc.ts).

## P02 Mission library and archive

**Workflow:** create a mission, find it later, resume it, and intentionally archive or remove it.

- Add rename, pin, recent/archived grouping, unarchive, delete, and reliable selection after mutations. Keep imported conversations in a separate read-only group, owned by P15. P03 owns branch, undo, compression, and turn history controls.
- APIs: `session.list/create/most_recent/title/pin/archive/delete/close`. Respect the difference between closing a view, archiving a mission, and deleting stored data.
- **Acceptance:** rename/pin/archive survive reload; a mission's selected recipient and unsent draft never leak into another mission; deleting the active mission returns to a valid screen; imports do not become editable sessions.
- **Evidence:** [session handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/session.py), [native rail](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/rail), [WebUI import behavior](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/webui.md).

## P03 Mission conversation and human decisions

**Workflow:** send a goal with the right context, collaborate with the host or a specialist, answer requests, and recover an interrupted turn.

- Existing: streamed host/direct turns, recipient-specific drafts, specialist history, host handoff, stop/steer, approval/clarification/confirmation cards. Finish the deferred duplicate-history ordering bug in BACKLOG before expanding transcript state.
- Add attachment upload/paste/drop through P05; slash/path completion; working-directory, harness, knowledge-base, model, and permission choices; branch/undo/clear/compress and session usage. Expose native credential requests with submit/skip, masked inputs, and pending-request recovery. Transcript rendering must preserve code and structured tool activity without executing document text.
- APIs: `turn.*`, `session.resume/branch/undo/clear/compress/set_harness/set_mode/set_knowledge/usage`, `approval.*`, `confirm.respond`, `clarify.respond`, `credential.*`, `input.detect_drop`, `clipboard.paste`, `complete.*`, `slash.exec`, and instance history/steer/model/mode. Existing steering uses `turn.send` with inject behavior; `session.steer` is an unsupported alias.
- **Acceptance:** host → specialist → host handoff works with real stored history; file context reaches the intended recipient; stop/steer affect the correct turn; reload can recover requests the backend exposes; declined/stale requests stay declined/stale; a secret never enters transcript, logs, or browser persistence. Missing clarification recovery remains an explicit backend limitation until a supported recovery path is proved.
- **Evidence:** [collaboration guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/agent-collaboration.md), [credential broker API](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/credential.py), [current conversation state](src/useConversation.ts).

## P04 Task canvas and task inspector

**Workflow:** give Raven a goal, see its actual delegated work arrive, inspect the result, and return to the relevant conversation.

- Existing: scoped task snapshots and dependencies, a fixed top-down hierarchy, status/properties/output/prompt/files, expanded inspection, specialist Talk, and labeled local playback. Cards remain at readable size with native scrolling. Text/icons/colors explain status. A completed-task fill and a small activity flare respond to reported state; reduced motion suppresses the flare and working spinners. Status-only or reordered snapshots must not move cards.
- Next: prove one real model-created graph with two independent tasks and a dependent synthesis; expose task/run grouping, branch conditions and selected/skipped routes, errors, full output/truncation, live node activity when supported, and clear dependency explanations. Add a node action menu, saved notes, and grouped runs as separate slices. Keep the hierarchy fixed and organized; structural dependency changes may reorganize branches, while status changes must not.
- APIs: `tasks.list`, `dag.get/node`, `subagent.list/context/interrupt/cancel_session/cancel_instance`, `delegation.status/pause`. Validate exact pause/cancel semantics before exposing them. Graph creation, replan, and DAG cancellation are model-tool capabilities, not a generic canvas-write RPC.
- **Acceptance:** a real mission produces task records with scoped IDs and observable dependency ordering; reorder/status polling preserves coordinates and scrolling; new branches remain organized; action targets the correct run/node/instance; interrupted/failed/skipped/attention states remain distinct. A drawn executable edge must be validated and explicitly dispatched through a future supported authoring path; the current chart does not support dragging or execution authoring.
- **Evidence:** [task snapshot reader](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/tasks.py), [DAG guide including branches](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/orchestration.md), [DAG read handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/dag.py).

## P05 Workspace, attachments, and deliverables

**Workflow:** select a working directory, attach one file, receive a generated deliverable, and open the actual result.

- Add directory picking/listing, file upload, text/image/PDF preview where supported, open/reveal/download behavior, and a deliverables shelf linked to the originating task. Integrate deck-template selection for slide work. Distinguish agent home from the working directory, and remote machine paths from local files.
- APIs: `fs.list/dirs/pick_dir/read/upload/reveal/open`, `deliverables.list`, `deck.templates.*`; inspect the gateway's HTTP delivery/preview routes and authentication as well as RPC. `image.attach` is a stub; use the actual upload pipeline. Arbitrary file editing is a later extension unless the backend exposes the needed write contract.
- **Acceptance:** attach → send → response → open deliverable works; missing files, unsupported types, large files, inaccessible paths, and removed files have meaningful states; HTML/script-like content cannot execute in a preview; the native picker/reveal is only offered where the host can provide it.
- **Evidence:** [file helpers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/files.py), [deliverable transport](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/transports/deliverables.py), [native workspace](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/workspace).

## P06 Agent Hub and details

**Workflow:** configure one supported agent, verify it, create a persistent instance, and talk to it from a mission.

- Add installed/preset/custom agent listings; inspect backend, model, mode, tools, machine and readiness; add/update/build/enable/disable/remove; probe/test with cancel; instance creation/forget. Distinguish an installed agent definition, a persistent conversation instance, a one-turn worker role, and a task node.
- APIs: `subagents.list/presets/add/update/remove/build/toggle/probe/test/test_cancel`, `subagents.instance.create/forget`. Direct turn controls live in P03. Remote machines live in P18. Missing Research/Design adapters in this installation must remain explicit instead of inheriting readiness from the example roster.
- **Acceptance:** one configured agent passes probe and a real bounded task; its created instance resumes after reload; missing engine/authentication/command errors are distinguishable; removing an agent does not silently delete unrelated mission history.
- **Evidence:** [agent integrations](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/agent-integrations.md), [agent handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/subagents.py), [instance handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/instances.py).

## P07 Providers and model assignments

**Workflow:** connect one provider, discover/select a model, assign it to a role, and verify a real turn.

- Provider catalogue and endpoint configuration; API key/OAuth connection and disconnection; model fetch, manual/bulk add, field editing, removal, protocol selection, and role defaults. Show saved settings separately from running configuration and restart requirements. Key reveal must require an explicit action and remain transient.
- APIs: `model.*` plus the narrowly required settings fields. Use the native web provider source as the contract reference, not a copied secret/config file.
- **Acceptance:** credential never appears in ordinary config views/logs; invalid auth and unknown model errors are actionable; selected model persists and is actually used by a new turn; disconnect leaves unrelated providers intact.
- **Evidence:** [model handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/model.py), [native model source](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/model), [native provider pages](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/settings/providers).

## P08 Skills, tools, MCP, and plugins

**Workflow:** inspect available capability, add one supported capability, and verify that a task can actually use it.

- Four tabs: Skills (local/Hub, inspect, search, install/remove, block/enable and discovery settings); Tools (group settings, shell rules); MCP (servers, available tools, connection/auth state); Plugins (installed/Hub, configure, enable, auth/retry/revoke/remove). Keep skills, runtime plugins, MCP servers, and agents visibly distinct.
- APIs: `skills.manage`, `skillhub.*`, `ext.list`, `plughub.*`, `plug.*`, `reload.mcp`, supported settings/config fields. The declared `skill.list/pin/unpin` and `mcp.list/test/tools` methods lack handlers in this baseline; use a verified native path or mark the integration gap. `tools.configure` and `skills.reload` are stubs.
- **Acceptance:** install → inspect → enable → actual tool/skill use → remove is verified with one fixture capability; errors identify missing binaries/auth; Hub queries/download behavior and reload needs match saved settings. Exposing a catalogue entry is not an installed/usable verdict.
- **Evidence:** [skills/extensions guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/skills-and-extensions.md), [native installed capability source](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/installed), [settings source](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/settings/source.ts).

## P09 Knowledge bases and documents

**Workflow:** add a document to a base, index it, search it, and use that base in a conversation with traceable passages.

- Base create/rename/settings/delete; folders and moves; file, URL, and editable note ingestion; indexing/status/error recovery; document list/pages/chunks; chunk enable/disable/create/update/delete; source-linked search; per-mission base selection. Keep document content as data and make empty/unindexed/error states clear.
- APIs: `knowledge.*`, upload support from P05, `session.set_knowledge` from P03. Embeddings/provider readiness is a dependency, not a fake-success state.
- **Acceptance:** a distinctive phrase can be retrieved with a source after indexing and used by the intended mission; disabled/deleted content no longer participates; reload retains bases/folders; invalid URLs, index failures, and no-result searches are understandable.
- **Evidence:** [knowledge guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/knowledge.md), [knowledge handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/knowledge.py), [native knowledge page](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/knowledge).

## P10 Memory and recall configuration

**Workflow:** see which memory backend is active, inspect stored memory, and prove recall in a new conversation.

- Backend readiness/health, kind filters, list/search/stats, EverOS configuration and cloud connectivity. Distinguish conversation context compression, stored personal memory, and stored agent experience. Do not promise memory edit/delete or autonomous harness self-improvement without a backend contract.
- APIs: `memory.stats/list`, `settings.everos/everosSet/everos_set/everosCloud`; plugin configuration may be involved. Treat the camel/snake case setters as aliases, not separate features.
- **Acceptance:** one non-sensitive fixture memory is persisted and recalled across sessions; a missing backend stays clearly unavailable; inspect actual returned cases rather than implying all messages are remembered; settings and restart behavior match the active backend.
- **Evidence:** [memory boundaries](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/skills-and-extensions.md), [memory handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/memory.py), [native memory page](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/memory).

## P11 Playbooks and long-running executions

**Workflow:** review a reusable workflow, fill parameters, validate it, run it, and inspect its results.

- List/get/create/draft/save/discard/validate/enable/delete; prompt-mode and DAG-mode editors; typed parameter forms; local credential/OAuth setup; run history; long-running stint details with answer/pause/resume/extend/stop. Show drafted, validated, executing, and successful states separately. An executable visual authoring canvas belongs here after the form/editor path works.
- APIs: `playbooks.*`, including credentials, OAuth, and `stints.*`; task execution is rendered by P04 and conversation input by P03. Validate parameter values beyond substitution; a declared type is not backend access validation.
- **Acceptance:** save → reload → parameter validation → actual bounded run → inspect output passes; missing secrets and invalid graphs do not launch; one stint pauses, accepts input, resumes, and stops; a retry warns when it would repeat side effects.
- **Evidence:** [playbook guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/playbooks.md), [playbook handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/playbooks.py).

## P12 Schedules, Oncall, and proactive work

**Workflow:** intentionally schedule one job, see it run, inspect its result, and disable it.

- Schedules: list/create/edit/enable/disable/delete/run-now/history, explicit timezone/next occurrence and delivery target. Preserve a job's original channel/recipient when editing. Oncall: bounded campaign instructions, progress/results, budgets, questions, stop and follow-up through the actual agent. Separate Sentinel settings/decision history/targets/quiet hours and Heartbeat tasks/status; none is silently enabled by another switch.
- APIs: `cron.*`; Oncall uses P06/P03/P04; Sentinel and Heartbeat require supported config/CLI handoffs or new typed service contracts. Do not invent `sentinel.*` or `heartbeat.*` RPCs. Resident gateway availability must be visible.
- **Acceptance:** a harmless local scheduled fixture fires once, reports evidence, and stops firing after disable; editing preserves its delivery destination; Oncall stops the correct campaign; saved Sentinel settings are not presented as proof a running gateway reloaded them.
- **Evidence:** [proactivity guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/proactivity.md), [Oncall guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/oncall.md), [native schedules](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/cron).

## P13 Messaging connections

**Workflow:** configure one channel, verify an incoming message and its reply, and turn that channel off.

- List readiness and settings for supported channel adapters; configure credentials, enable/disable, QR authentication where supported, sender/group policy, delivery/media limits, and recovery. Support the shipped channel catalogue without assuming every adapter is installed or authenticated.
- APIs: `channels.status/configure/qr` and the native connection source. Provider credentials, agent presets, and messaging connections remain different destinations.
- **Acceptance:** explicit test recipient receives the expected reply; unconfigured/auth-expired states explain recovery; disable stops delivery; editing one channel leaves others unchanged. External test messages require a user-chosen destination and action.
- **Evidence:** [channels guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/channels.md), [native connection catalogue/source](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/connections).

## P14 Shared browser

**Workflow:** open a browser task, inspect the current tab/frame, take control, then return control to the agent.

- Browser state/tabs/open/read/frame/input/mode/watch/close, visible ownership and session scoping, disconnect/recovery and clear unsupported-host states. Start with one tab. Avoid automatically closing user-owned tabs.
- APIs: `browser.state/open/tabs/frame/read/input/mode/close/watch`. `browser.manage` is an unrelated unsupported alias. These are Raven product capabilities; they are not the tools used to test this UI.
- **Acceptance:** the user and agent see the same task tab; ownership changes are explicit; keyboard/pointer input goes to the selected tab; a disconnect does not leave the UI claiming live control; input is unavailable when the backend lacks the capability.
- **Evidence:** [browser collaboration](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/browser-collaboration.md), [browser handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/browser.py), [native browser feature](https://github.com/evermind-ai/raven/tree/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/browser).

## P15 Run history, import, export, and problem reporting

**Workflow:** inspect why a run behaved as it did, export selected finished turns, or produce a reviewed bug report.

- Timeline of inputs/model/tool/reply events, timing and details with lazy large-payload reads; turn selection and async export/cancel/download; separate read-only imported conversations with rename/delete; external AI-data import preview/run/progress/stop. Bug reporting requires description, receiver check, redaction review, deliberate upload, receipt, and retry/local recovery.
- APIs: `trajectory.*`, `bugreport.*`, `imported.upload`, `import.*`, relevant session operations, and HTTP archive downloads. Imports must not expose editable transcript or fake missing artifacts. Raw export and reviewed/redacted report are separate products.
- **Acceptance:** export/reimport round trip preserves selected finished turns; malformed/unsafe/too-new archives fail clearly; importing cannot execute content or turn it into a live mission; reports show uncertain redactions and do not upload merely by opening the wizard; failed uploads retain the recovery path.
- **Evidence:** [WebUI import/export contract](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/webui.md), [trajectory guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/trajectory-debugging.md), [trajectory export handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/trajectory_export.py), [bug-report handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/bugreport.py).

## P16 General settings, permissions, usage, and health

**Workflow:** inspect and change one setting, understand its scope, and verify it took effect.

- General language/appearance/reduced-motion preferences; workspace defaults; tool permission modes/rules and approval revocation; model/tool usage; archived mission entry point; version/update/restart/health diagnostics. Configuration editing must preserve unrelated values and distinguish saved state, active state, and restart-required state.
- APIs: `settings.get/set/usage`, `config.get/set/unset`, system version/upgrade, supported reload paths; permission decisions are owned by P03, providers by P07, memory by P10, schedules by P12. `reload.env` is unsupported and needs a restart handoff.
- **Acceptance:** edit → validation → save → reload/readback works; failure preserves the prior value; masked settings stay masked; a permission change affects the intended scope; usage labels do not imply dollars where only tokens are available; checking for an update never installs it automatically.
- **Evidence:** [permissions guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/permissions.md), [native settings sections](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/ui-web/src/features/settings/store.ts), [configuration handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/config.py).

## P17 Advanced operations and developer tools

**Workflow:** diagnose or operate a supported advanced capability with an explicit, correct native handoff when no web contract exists.

- Command catalogue/help and supported command dispatch; shell/console inspection; host status/doctor/reload; sandbox readiness and native shell handoff; ACP/A2A setup; agent/plugin authoring references; tracing storage maintenance; trajectory replay/labeling; standalone Evolver experiments, budget/gates/artifacts, and service lifecycle guidance.
- APIs: `commands.catalog`, `command.dispatch`, `cli.dispatch`, `shell.exec`, plus documented CLI/library entry points. `terminal.resize` records terminal dimensions; it is not a full PTY contract. The CLI dispatcher excludes interactive/long-running commands; do not route a daemon or interactive login through it. Evolver is a separate benchmark tool, not an automatic self-rewrite toggle in chat.
- **Acceptance:** catalogue shows only runnable supported actions; typed errors distinguish unsupported/timeout/failed exit; one diagnostic command runs with correct home/workdir; terminal-only and standalone workflows have verified copyable commands and accurate prerequisites. Full embedded terminal, service launcher, graph mutation API, and Evolver UI remain integration work until their contracts exist.
- **Evidence:** [CLI dispatch limits](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/cli_dispatch.py), [commands](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/commands.md), [protocols](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/agent-protocols.md), [sandbox](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/sandbox.md), [Evolver](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/evolver.md), [self-hosting](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/self-hosting.md).

## P18 Registered machines

**Workflow:** register one reachable machine, verify its node/agent readiness, run one bounded remote task, and inspect the result.

- Machine list/add/probe/doctor/local keys/install-node/remove; assign supported agent backends to a machine; distinguish host-local, remote workspace, and agent-home paths; disconnect and stale configuration recovery. Removal semantics must be explicit.
- APIs: `machines.*`, P06 agent configuration, and documented remote file operations. Registration and a healthy transport are not proof of a completed remote task.
- **Acceptance:** a named machine passes readiness and one actual task; failed connection/install produces recoverable status; output identifies its machine; local paths are not silently interpreted as remote paths; removing the registry entry respects the documented remote-state boundary.
- **Evidence:** [machines guide](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/docs-site/docs/machines.md), [machine handlers](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/machines.py).

## P19 Personal notes and idea pocket

**Workflow:** capture one tangent without executing it, keep its origin, and deliberately bring it back to a mission.

- Preserve the planned node action menu (Open conversation / View output / saved personal note), pinned notes, idea pocket, and bring-back / park / keep-exploring choices. Save notes across reloads with a clearly scoped store; the task hierarchy is derived from Raven dependencies. These are product proposals; no arbitrary Raven mutation endpoint is assumed.
- **Acceptance:** save → reload → recover the exact note and origin; capturing/parking sends no turn; bringing it to a mission previews what will be sent; exploratory notes are visibly different from specialist messages that execute real work.
- **Evidence:** [creative direction and backlog](BACKLOG.md). This page is not counted toward Raven backend parity.

## Delivery sequence

Each row is a separate shipping milestone. Implement only the committed row, keep existing conversation behavior working, and record build/test/runtime evidence before moving to the next. Do not scaffold all these pages in advance. Rows with multiple steps are split further at execution time if the one demonstrated path would otherwise become too large.

| Order | Milestone | Prerequisite | Observable release check |
| --- | --- | --- | --- |
| M0 | Fixed task hierarchy, readable fantasy styling + this plan | Existing canvas | Aligned branches; still cards/connectors; task lifecycle, scrolling, inspection, and reduced motion verified |
| M1 — next | Prove one real generated task graph | P01/P03, installed Code/General agents | Two bounded independent tasks and a dependent synthesis appear and finish with inspectable real output |
| M2 | Input/file vertical slice (P03/P05) | M1 | Attach one file, use it in a turn, open one returned artifact |
| M3 | Mission lifecycle (P02) | Existing sessions | Rename, pin, archive, restore and reload a mission |
| M4 | Provider/model setup (P07/P01) | Existing connection | Configure one provider/model through UI and complete a real turn |
| M5 | Agent readiness and instance creation (P06) | M4 | Configure/probe one specialist and resume its newly created instance |
| M6 | Complete human decisions and permission controls (P03/P16) | M5 | Approval/clarification/confirmation/credential paths plus disconnect recovery tested |
| M7 | Workspace/deliverable browsing (P05) | M2 | Navigate the correct workspace and open actual task artifacts |
| M8 | Node actions and saved personal note (P04/P19) | M1 | Open output/chat or save a note, then recover the note after reload |
| M9 | Capability management (P08) | M4/M6 | One real skill/plugin/MCP lifecycle; split into one capability type per release |
| M10 | Knowledge ingestion and retrieval (P09) | M2/M4 | Index one document and cite it from the selected mission |
| M11 | Memory inspection and recall (P10) | Working memory plugin | Persist/inspect one fixture memory and verify recall in a new session |
| M12 | Reusable playbook (P11) | M1/M5/M6 | Validate, save, reload and execute one parameterized workflow |
| M13 | Schedule and long-work controls (P12/P11) | M12 + resident gateway | One scheduled run with history/disable; then a separate stint/Oncall release |
| M14 | Messaging connection (P13) | M4/M6 | One explicitly chosen test channel receives/replies and disables correctly |
| M15 | Shared browser task (P14) | Compatible backend | Human/agent ownership and one tab interaction demonstrated |
| M16 | Timeline and portable history (P15) | Real completed runs | Inspect a turn, export/import it read-only; bug reporting is a separate follow-up |
| M17 | Machine workflow (P18) | M5/M6 + a target machine | One scoped remote task completes and its result can be inspected |
| M18 | Remaining settings/ops and parity closeout (P16/P17) | Earlier workflows | Every residual feature has tested UI or native handoff; no unexplained omissions |

Sentinel, Heartbeat, richer conditional-graph authoring/replanning, full idea-pocket behavior, a terminal, standalone Evolver UI, and freeform whiteboarding remain named follow-ups under their owner pages. They are not silently bundled into earlier milestones. The current release does not promise those features.

## Backend gaps and readiness gates

The [complete API ownership appendix](docs/RAVEN_API_COVERAGE.md) maps **all 248 catalog methods** to a page. Upstream's own audit identifies **20 explicit stubs** and **8 missing-handler methods**. These are baseline facts, not current UI bugs to hide.

- Missing handlers: `session.get/history`, `skill.list/pin/unpin`, `mcp.list/test/tools`. Prefer an established native alternative where it exists (`session.resume`, `skills.manage`, native capability/config sources); otherwise schedule an adapter/backend change before a control is built.
- Stub families include voice, rollback, spawn-tree persistence, old prompt staging, old secret/sudo/image interfaces, `browser.manage`, `process.stop`, `tools.configure`, `skills.reload`, `reload.env`, and `session.save/steer`. Real alternatives have different contracts: for example `turn.cancel`, `turn.send` inject behavior, `credential.*`, and file upload. Do not equate names with capabilities.
- Capability-gated handlers require their broker/scheduler/transport dependency. A method in the schema, or a successful handshake, is not a feature-readiness verdict.
- Graph creation/replan/cancel, proactive mechanisms, sandbox operations, ACP/A2A, and Evolver need their documented tool/CLI/library path or a future dedicated API. They are tracked even though they are not additional RPC rows.

## Definition of done for each page

1. Its primary workflow runs end to end against the actual supported backend; fixtures are labeled and are not counted as live proof.
2. Loading, empty, error, unavailable, disconnected and recovery states are implemented. Mutations have accurate scope and useful validation.
3. Data/permissions remain scoped to the selected mission, agent, instance, machine, or provider. Unrelated configuration is preserved.
4. Keyboard navigation, readable text, phone layout and reduced motion are exercised. Status cues explain reported state; they do not invent progress, flash cards, or move the hierarchy on status-only updates.
5. Reload/readback and relevant failure/cancel/retry paths are checked; docs contain the commands actually used.
6. Status is recorded as **implemented**, **technically verified**, **partially verified**, **blocked by backend**, or **human-review pending**. No blanket "Raven parity" claim until all supported rows and documented non-RPC capabilities have evidence.

No new page implementation, optional engine installation, credentials, schedules, external messages, or public deployment was performed merely by writing this plan.
