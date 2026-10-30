# Vision

A spatial Raven control space where a person can understand, direct, and review long-running agent work without losing the relationship between an objective and its delegated tasks.

## Creative guidance (Joe's direction)

The interface should carry the thread of thought: a clear home mission, room for tangents, capture before sorting, gentle returns, and concrete stopping points. Explicitly distinguish exploring an idea from authorizing agent execution. Avoid productivity scores, shame, or overwhelming status panels.

Next design layer: a quick idea pocket; exploration conversations that remain attached to their origin; a small handoff with bring-back / park / keep-exploring choices. These are proposals, not implemented features. Direct specialist messages in 0.2 still execute real agent turns; never label them as a no-action sandbox.

# Current slice

A conversation workspace using Raven's host/target turn streams, persistent specialist instances and handoffs, with a compact task map and node output beside the composer. A labeled example remains available without credentials.

# Expansion path

1. Add a persistent idea pocket: capture one tangent without sending a turn, then bring it into the current mission when chosen. This is the next recommended milestone.
2. Complete input parity in small verifiable pieces: attachments, agent creation/configuration, native credential requests, file viewing, and provider controls.
3. Restore large canvases across sessions; group runs and improve high-density navigation.
4. Add an attention inbox and artifact review grounded in Raven events.
5. Explore always-on schedules, playbooks, memory, and multiple harnesses after the first control workflow works reliably.

## Deferred review nit

S3: Rare history-before-replay ordering can briefly duplicate a direct specialist answer until the next four-second history refresh. Sol reproduced it with an in-memory hook stub; the App's target reset on reconnect limits exposure. Deferred from 0.2 because it is transient and does not block the verified workflow. Small follow-up: retain live markers on snapshot messages, drop live assistant snapshot rows when direct stream events begin, and add the ordering regression test.
