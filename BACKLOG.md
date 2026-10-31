# Vision

A Raven mission workspace where a person can understand, direct, and review long-running agent work without losing the relationship between an objective and its delegated tasks.

## Creative guidance (Joe's direction)

The interface should carry the thread of thought: a clear home mission, room for tangents, capture before sorting, gentle returns, and concrete stopping points. Explicitly distinguish exploring an idea from authorizing agent execution. Avoid productivity scores, shame, or overwhelming status panels.

Next design layer: a quick idea pocket; exploration conversations that remain attached to their origin; a small handoff with bring-back / park / keep-exploring choices. These are proposals, not implemented features. Direct specialist messages in 0.2 still execute real agent turns; never label them as a no-action sandbox.

# Current slice

A conversation workspace using Raven's host/target turn streams, persistent specialist instances and handoffs, with a compact task map and node output beside the composer. A labeled example remains available without credentials.

## Task chart direction — Joe's latest feedback, 2026-10-30

Use a fixed, organized org-style hierarchy. Readable properties, useful task actions, and live status remain valuable. Independent dragging and decorative card/connector motion are retired because Joe found the movable chart flickery and confusing.

The implemented slice uses deterministic prerequisite levels, aligned branches, right-angle connectors, native scrolling, a Properties tab, Output/Prompt/Files, expanded inspection, and specialist Talk. Status updates are visible through text, icons, and colors; only the small working indicator rotates, with reduced-motion support. The labeled example playback remains available.

Latest visual direction: parchment work surfaces, dark ink, a dark green developer-tool rail, gold/teal/coral/violet filled emblems, and limited serif headings. The local G:/aura-kit reference inspired a completed-task fill and a small travelling activity flare. These respond to task/host state; the card bodies and connectors remain fixed. Reduced motion suppresses the moving effect. More elaborate particles and configurable aura presets remain future ideas, outside this usable slice.

Planned node slice: a node action menu with Open conversation, View output, and one editable, saved personal note. Keep freeform whiteboarding, editable execution settings, drawn executable connections, and arbitrary custom node types as later proposals, outside the current chart direction. The page-by-page ordering is in [RAVEN_FEATURE_PLAN.md](RAVEN_FEATURE_PLAN.md); one real generated task graph is the next milestone before expanding controls.

Library check: [React Flow custom nodes](https://reactflow.dev/learn/customization/custom-nodes) support embedded interactive React controls and are already used here. [Excalidraw element customData](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/#storing-custom-data-on-excalidraw-elements) and scene updates could link drawings to Raven entities, with an app-owned properties/action UI. [draw.io properties](https://www.drawio.com/docs/reference/plugins/properties-plugin/) and [developer plugins](https://www.drawio.com/docs/reference/plugins/) can extend diagrams; the documented plugin examples are unsupported. Continue with React Flow for fixed, live-status task cards; reconsider a drawing editor if freehand sketching or diagram authoring becomes the primary workflow. No engine migration has been made.

# Expansion path

1. Prove one real model-generated task graph with two independent tasks and a dependent synthesis. This is the next recommended milestone. The saved note/node menu remains a later step toward the idea pocket: capture one tangent without sending a turn, then bring it into the mission when chosen.
2. Complete input parity in small verifiable pieces: attachments, agent creation/configuration, native credential requests, file viewing, and provider controls.
3. Group larger runs and improve navigation while keeping the hierarchy readable.
4. Add an attention inbox and artifact review grounded in Raven events.
5. Explore always-on schedules, playbooks, memory, and multiple harnesses after the first control workflow works reliably.

## Deferred review nit

S3: Rare history-before-replay ordering can briefly duplicate a direct specialist answer until the next four-second history refresh. Sol reproduced it with an in-memory hook stub; the App's target reset on reconnect limits exposure. Deferred from 0.2 because it is transient and does not block the verified workflow. Small follow-up: retain live markers on snapshot messages, drop live assistant snapshot rows when direct stream events begin, and add the ordering regression test.
