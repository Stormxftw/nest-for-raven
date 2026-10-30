# Sol review ledger

Scope: Raven Spatial 0.2 custom UI, local launcher/configuration helpers, and focused checks. Full upstream Raven feature parity and optional specialist-engine installation are out of scope. Review-only: no edits, commits, push, PR comments, or child agents by the reviewer.

Base: `3f85dcea77b088b04e40b7f954fcc090d3c66b3f` (HEAD; this local repository has no remote).

Provider/model discovered through T3 capabilities: `codex`, `gpt-6.1-sol`; reasoning effort `xhigh`, service tier `default`.

Budget: 3 rounds; 1 reviewer. Round 1 covers the change paths; further rounds cover changed behavior and open findings only. This administrative ledger is outside review scope and can be updated while a reviewer runs.

Consistent tracked diff command:

```text
git diff 3f85dcea77b088b04e40b7f954fcc090d3c66b3f -- README.md .gitignore BACKLOG.md CURRENT_MILESTONE.md VERIFICATION.md index.html package.json package-lock.json public scripts src tsconfig.json vite.config.ts vitest.config.ts
```

All the listed paths except README.md are untracked and must be read explicitly. The downloaded `upstream-raven/` is ignored, clean, and is protocol reference only. `.raven-local/`, `.raven/`, `work/`, `output/`, and node_modules are excluded from review.

Pre-review checks: build passes; 14 tests pass; real Codex-backed host, Raven-General and Raven-Code direct turns pass; real browser send, saved histories, clarification response, cancellation and recovery pass; stored-task inspection passes; example/mobile checks pass.

Baseline size: tracked diff is 1 file, +95/-3; 32 additional untracked review files contain 3,895 nonempty lines, including package-lock.json. No index staging was used to manufacture a diff.

## Round 1 — CHANGES

Task ID: `node:delegated-task:command%3Amcp%3Ae0140cf6-09e8-49b3-bdfe-e1fc46ab1b65%3Adelegate-task%3Araven-spatial-sol-review-r1-20261030`.

- S1 / should / accepted and fixed: selected specialist histories are now read on selection and refreshed every four seconds, including delegated live rows and completion. Removed the permanent messages/running cache guard. Streaming direct answers remain separate from snapshot answer rows, and snapshots crossing a lifecycle boundary are discarded. App passes the selected target to the hook; no separate hydration cache is needed.
- S2 / should / accepted and fixed: host activity comes from session.resume and host events. A second host-specific read after subscribe closes the completion gap, guarded against a newer host lifecycle event. Subscription-wide running no longer marks the host busy.

No findings declined. Reviewer ran the existing 14 tests and stub reproductions; no browser or model checks by the reviewer. Usage was not exposed.

## Round 2 — APPROVE

Task ID: `node:delegated-task:command%3Amcp%3Ae0140cf6-09e8-49b3-bdfe-e1fc46ab1b65%3Adelegate-task%3Araven-spatial-sol-review-r2-20261030`.

S1 and S2 were confirmed resolved. S3 / nit / deferred: rare snapshot-before-replay ordering can temporarily duplicate a specialist's answer until the next history poll. The current App resets its recipient on reconnect, narrowing exposure. Recorded in BACKLOG.md; not a blocker for this milestone. No blocker or should remains open. No behavior changes after approval.

Reviewer independently reran all 19 tests and inspected upstream protocol; it did not rerun build/browser/model checks. Reviewer usage was not exposed. Loop stopped after 2 rounds with gpt-6.1-sol at xhigh. No commit or push was performed during the review.

Changed behavior paths since round 1: src/useConversation.ts, src/session.ts, src/App.tsx. Regression checks in src/useConversation.test.ts; verification documentation updated. No visual or provider changes.

Checks: 19 tests pass; production build passes; real Raven-Code direct conversation/history/handoff and host turn pass; authenticated production browser history, drafts, send/stream/idle path passes after the fixes.

Size before/after review fixes: tracked diff unchanged at +95/-3; 32 untracked files increased from 3,895 to 4,002 nonempty lines before this ledger/document update, chiefly the focused regression tests. Scope expansion was not needed. GitHub publication was requested after approval; only release-status documentation changed afterward.
