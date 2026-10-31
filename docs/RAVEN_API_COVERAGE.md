# Raven API coverage appendix

Generated from the local upstream contract at `9d9bec90bcd76186d2981fd23b3b6280d83e3684`. See [the page plan](../RAVEN_FEATURE_PLAN.md) for user workflows, sequencing, and acceptance criteria.

**248 catalog methods, each assigned one owning page.** 20 are explicitly unsupported stubs and 8 have no registered handler in upstream's audit. The remaining methods still require the relevant runtime capabilities, configuration, and a real end-to-end check; this inventory is not a claim of 248 working UI features.

"Referenced" only means a method name occurs in current production UI source. It is not a completion verdict. Shared controls may appear on several pages; the owner below is responsible for the contract. Tool-only and standalone capabilities (Oncall, Sentinel, Heartbeat, ACP/A2A, sandbox, Evolver) are mapped separately in P12/P17 of the plan.

Sources: [OpenRPC](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/rpc-schema/openrpc.json), [unsupported stubs](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/raven/rpc/methods/_stubs.py), [registration gaps](https://github.com/evermind-ai/raven/blob/9d9bec90bcd76186d2981fd23b3b6280d83e3684/tests/test_rpc_registration.py).

Reproduce with `python scripts/check-raven-coverage.py --write`; verify with `python scripts/check-raven-coverage.py --check`. Regenerate after auditing changes to the pinned Raven revision or page ownership.

| RPC method | Owner | Backend evidence | Our UI | Upstream purpose |
| --- | --- | --- | --- | --- |
| `approval.pending` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | The approval requests still waiting for an answer, for a page that lost its sheets. |
| `approval.respond` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Answer a pending approval request. |
| `approval.revoke` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Take back the exec allow rule one approval answer wrote. |
| `browser.close` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Shut the browser down. |
| `browser.frame` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One JPEG of the page. |
| `browser.input` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | A pointer, key, text or scroll event in page coordinates. |
| `browser.manage` | P14 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: browser automation not supported. |
| `browser.mode` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Pop the page into a real window, or fold it back. |
| `browser.open` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Open a url, or move through history. |
| `browser.read` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The page's actionable elements, with stable refs. |
| `browser.state` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Where the page is, and whether a browser can be started at all. |
| `browser.tabs` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List, open, activate or close a tab. |
| `browser.watch` | P14 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Lease or release the live screencast. |
| `bugreport.cancel` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Stop a bug report; one that has not landed is removed, a landed record stays. |
| `bugreport.decide` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Decide every remaining item; linked items that disagree are refused with review_conflict. |
| `bugreport.item` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One item's contexts, grouped by identical text and capped, with the hit positions to highlight. |
| `bugreport.probe` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Ask whether the configured bug report receiver answers, before a report starts; an unreachable receiver is an answer, not an error. |
| `bugreport.retry_upload` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Retry a failed upload when the failure said it may help. |
| `bugreport.start` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Validate the problem fields and the turn selection, then start collecting a bug report; an invalid selection is refused with invalid_params naming each turn. |
| `bugreport.status` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Where a bug report stands: its phase, the items to decide, the summary and the receipt. |
| `bugreport.upload` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Package and upload a frozen report; one that needs review needs the risk accepted. |
| `channels.configure` | P13 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Patch one channel's credential fields, and connect or disconnect it. |
| `channels.qr` | P13 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The pending login QR for one channel, read off the live adapter. |
| `channels.status` | P13 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Which channels are enabled, configured, and whether the gateway is up. |
| `clarify.respond` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Answer a pending ask-user question. |
| `cli.dispatch` | P17 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Dispatch an Raven CLI command in-process, capture rich-rendered output. |
| `clipboard.paste` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Save the clipboard image under the workspace and report where it landed. |
| `command.dispatch` | P17 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Run one slash command by name: a shell-style command or a skill. |
| `commands.catalog` | P17 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Dynamic CLI command catalog reflected from the Typer app (replaces v0.0.2 -32012 stub). |
| `complete.path` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Completion candidates for a filesystem path. |
| `complete.slash` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Completion candidates for a slash name. |
| `config.get` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Read hot-changeable config fields (whitelist). |
| `config.set` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Set a hot-changeable config field. |
| `config.unset` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove a stored override so the default answers again. |
| `confirm.respond` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Answer a pending confirmation from inside a paused cli.dispatch. |
| `credential.pending` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The credential cards still open, for a page that lost them. |
| `credential.skip` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference |  |
| `credential.submit` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The value the user typed into a credential card. Written by the host, never echoed. |
| `cron.delete` | P12 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove a scheduled job. |
| `cron.list` | P12 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every scheduled job, disabled ones included. |
| `cron.run_now` | P12 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Fire a scheduled job immediately, ignoring its schedule. |
| `cron.runs` | P12 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Run history for one job, derived from its cron:<id> session. |
| `cron.save` | P12 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Create or edit a scheduled job. |
| `cron.set_enabled` | P12 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Enable or disable a scheduled job without deleting it. |
| `dag.get` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Read one run_subagent_dag run back off disk. |
| `dag.node` | P04 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Read one DAG node's rendered prompt and output. |
| `deck.templates.list` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The bundled deck templates, with a cover each where this host can render one. |
| `deck.templates.pages` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every page of one bundled deck template as JPEG data URLs, for the picker's page viewer. |
| `deck.templates.pick` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Deposit a bundled deck template under agent home's uploads and answer as fs.upload does. |
| `delegation.pause` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Pause or resume sub-agent spawning. |
| `delegation.status` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The spawn caps and pause flag the delegation HUD renders. |
| `deliverables.list` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every file this conversation handed over through deliver_files. |
| `ext.list` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Everything installed: skills, plugins, tools, and MCP servers. |
| `fs.dirs` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List the subdirectories of one absolute directory, for picking a session's working directory. |
| `fs.list` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List one working-directory folder. |
| `fs.open` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Hand one file to the gateway host's application for it. |
| `fs.pick_dir` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Ask the gateway host's desktop for a folder through its native folder dialog, for pinning a session's working directory. |
| `fs.read` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Read one working-directory file, capped. |
| `fs.reveal` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Show one file in the gateway host's file manager, selected, or one of raven's own locations. |
| `fs.upload` | P05 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Store an uploaded file under agent home and return its path, relative to agent home and absolute. |
| `image.attach` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1. |
| `import.run` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Start a cold-start import of the chosen platforms in the background and return at once. |
| `import.scan` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Scan the other AI tools on this machine for importable memory files and conversations, per platform, and say whether an import can run at all. |
| `import.status` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Progress of the cold-start import: whether one is running in this gateway, and the counts recorded on disk. |
| `import.stop` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Ask the running import to stop after the current item. |
| `imported.upload` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Import a Trajectory Export, Bug Report Package or Trajectory Report as a read-only Imported Conversation; the same bytes imported before answer with that copy and write nothing, unless force asks for a second one. |
| `input.detect_drop` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Report whether dropped text names a file on disk, resolved to its absolute path. |
| `knowledge.bases.create` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Create a knowledge base, sized to the embedding model as configured now. |
| `knowledge.bases.delete` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Drop a base with its documents, their blobs and its collection. |
| `knowledge.bases.list` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every knowledge base, with its document count. |
| `knowledge.bases.rename` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Edit a base's name or description; neither touches its collection. |
| `knowledge.bases.settings` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Write one base's settings. Fields left out are untouched. |
| `knowledge.chunks.create` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Append a piece a person wrote to a document. |
| `knowledge.chunks.delete` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove pieces of one document from the index. |
| `knowledge.chunks.switch` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Turn pieces of one document on or off. |
| `knowledge.chunks.update` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Rewrite one piece's text, and the vector that answers for it. |
| `knowledge.documents.add` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Take an uploaded file into a base; indexing is a separate call. |
| `knowledge.documents.add_note` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Take a typed note into a base as markdown; indexing is a separate call. |
| `knowledge.documents.add_url` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Read one web page and take it into a base as markdown. |
| `knowledge.documents.chunks` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One document's indexed pieces, in reading order. |
| `knowledge.documents.delete` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove one document from its base, with its chunks and blob. |
| `knowledge.documents.index` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Embed one document's chunks and answer where that got to. |
| `knowledge.documents.list` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The documents in one base, with each one's indexing state. |
| `knowledge.documents.move` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | File one document under a folder, or under Root. |
| `knowledge.documents.pages` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every page of one document, numbered and measured. |
| `knowledge.documents.update_note` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Rewrite one note and queue it for indexing again. Notes only. |
| `knowledge.folders.create` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Make a folder in a base. |
| `knowledge.folders.delete` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Drop a folder; its documents return to Root. |
| `knowledge.folders.list` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One base's folders, oldest first. |
| `knowledge.folders.rename` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Rename one folder. |
| `knowledge.search` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Nearest chunks across the named bases. |
| `knowledge.status` | P09 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Whether a knowledge base can be created, and with which embedding model. |
| `machines.add` | P18 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Register an ssh machine: reach it once with the given login, then write the row and its ssh alias. |
| `machines.doctor` | P18 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | What the registry's doctor says about every row: blocking problems and notes, one sentence each. |
| `machines.install_node` | P18 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Put this Raven's node on a registered machine, in the background; machines.list reports the progress and the end. |
| `machines.list` | P18 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every registered machine with the state of its link and node, as the Agent Hub's machines tab shows them. |
| `machines.local_keys` | P18 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The private keys this computer has, as ~/.ssh/<name> paths, ssh's own default identities first; what the register form proposes instead of a placeholder path. |
| `machines.remove` | P18 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Take a machine out of the registry: its row and its ssh alias go, the link from this computer is closed, and the node installed on it stays there. |
| `mcp.list` | P08 | Missing handler (-32601) | Planned / no current UI reference | List MCP servers. |
| `mcp.test` | P08 | Missing handler (-32601) | Planned / no current UI reference | Test connectivity to a single MCP server (handshake probe). |
| `mcp.tools` | P08 | Missing handler (-32601) | Planned / no current UI reference | List tools exposed by an MCP server. |
| `memory.list` | P10 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One page of memories of a kind, or the hits for a query. |
| `memory.stats` | P10 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | How many memories of each kind EverOS holds. |
| `model.add_endpoint` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Add or replace one of a provider's endpoints, keyed by label. |
| `model.add_model` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Append a model id to a provider's curated picker list, with what the caller states about it. The tags are display only and are refused unless every name is in the published vocabulary; they give a model no catalogue carries the icon row every other model has. |
| `model.add_models` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Append several model ids to a provider's curated list in one write; ids already present are skipped. |
| `model.disconnect` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Clear a provider's stored credentials. |
| `model.endpoints` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List a provider's endpoints, api_key redacted for display. |
| `model.fetch_models` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | What a provider can serve: the bundled catalogue unioned with whatever the vendor names when it can be reached. Each row carries the registry's name and tags, its window, the bucket it filters into, whether this provider's list already has it, and which source it came from. A read -- nothing is written until a row is added. |
| `model.oauth_login` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Start an OAuth provider's device-code sign-in for a page: answers with the verification URL, the user code and its lifetime at once, and keeps polling in the background until the token lands or the code expires; model.options then reports the provider authenticated. |
| `model.options` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List providers, their curated models, and the current selection. |
| `model.remove_endpoint` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove one of a provider's endpoints by label. |
| `model.remove_model` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove a model id from a provider's curated picker list. |
| `model.reveal_key` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Read back the API key a provider has saved, for a reader who asked to see it. |
| `model.save_key` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Store an API key (and optional api_base) for a provider. |
| `model.set_fields` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Patch a provider's non-credential fields (api_base, deployment, api_version, extra_headers as a patch of {name: value \| null}); the key stays with model.save_key. |
| `model.set_protocol` | P07 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Set or clear the API protocol override for one model. |
| `playbooks.create` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Generate a playbook from a description of the work and store it in the user layer. Takes a description, never a spec: generation, validation and repair stay inside the composer, which is what keeps a caller from writing an arbitrary graph into the library. A name that is not kebab-case, or one the library already holds, is refused before a generation is spent. A generation that fails answers `created: false` with the composer's reasons in `errors`, because those are a list and an error code carries one string. |
| `playbooks.credentials.clear` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Forget one stored secret param of a playbook. |
| `playbooks.credentials.get` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Which of a playbook's secret params and carried OAuth servers this machine holds credentials for. Names and booleans only, never a value. |
| `playbooks.credentials.set` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Store one secret param's value for a playbook on this machine (0600, under the playbook's own credential scope). Refused for a param the spec does not declare `secret`. |
| `playbooks.delete` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove a user playbook's directory. Refused for a builtin, which ships with the package and would return on the next install -- disable those instead. The name comes off the deny list as it goes, so a later playbook reusing it starts enabled. |
| `playbooks.draft` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The Persona this session generated and has not saved, or null. A generated Harness is held as a draft rather than written to the library, so a turn that generates one leaves nothing behind until a reader saves it. |
| `playbooks.draft_discard` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Let this session's unsaved Persona go. Answers whether there was one. |
| `playbooks.draft_save` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Write this session's generated Persona to the library and adopt it. An optional name renames it on the way in; a collision takes the first free numeric suffix. |
| `playbooks.get` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One playbook, whole: params, nodes and the file it came from. |
| `playbooks.list` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every stored playbook, with the shape of each graph. |
| `playbooks.oauth.authorize` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Start the browser OAuth flow for a server the playbook carries, under the playbook's own credential scope. Answers within a few seconds with the state reached and the authorization URL the flow parked on, if any; the flow continues behind the answer. |
| `playbooks.oauth.clear` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Forget the OAuth tokens this machine holds for a server the playbook carries. |
| `playbooks.run` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Run one playbook, through the same entry the model's tool and `raven playbook run` use. A `dag` playbook dispatches in the background and the reply is the receipt carrying the run id; a `prompt` one answers composition guidance. `gaps` means nothing was dispatched and the reply names what is still needed. The call can block while the graph-level `confirm` gate puts the run to the conversation named by `session_key`, and a conversation still busy at that deadline is a "not now" -- the graph does not run unseen. |
| `playbooks.set_enabled` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Take one playbook off the deny list or put it on it. `enabled` is the state wanted, not a toggle, so two clients asking at once agree. Disabling removes it from what the model is offered and nothing else; it stays runnable by name from the CLI. Answers with the state in force and whether this call changed it. |
| `playbooks.stints.answer` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Answer a question a round left; it reaches the round after this one. |
| `playbooks.stints.extend` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Give a stint more rounds; a stint that is over opens its next round in this engine. |
| `playbooks.stints.get` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One plan in full: its rounds, what was undone, and what it is waiting on. |
| `playbooks.stints.list` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Every multi-round run this machine has started, newest first. |
| `playbooks.stints.pause` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Open no further rounds, and keep the stint so resume can take it up. A round already running finishes and reports first. |
| `playbooks.stints.resume` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Take a stint up again in this engine, from the node it stopped at; finished roles are named, not re-run. |
| `playbooks.stints.stop` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Open no further rounds. A round already running finishes and reports first, unless now is set. |
| `playbooks.validate` | P11 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Check one playbook without running it: the spec's shape, then the field rules, then its steps against this machine's agent table. Answers findings rather than raising, because a playbook that does not validate is the ordinary reason to call this. |
| `plug.auth` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Force-reconnect one server to retry or re-run its authorization. |
| `plug.configure` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Rewrite the credential fields a catalog template put into one installed server; an empty value clears a field. Refused for a server no ledger names. |
| `plug.install` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Install a catalogue entry: disk transaction, then a bounded connect. |
| `plug.remove` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Uninstall: disconnect, then ledger replay (market) or config removal (manual). |
| `plug.retry` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Connect one configured server again without opening a browser: the explicit retry for a server parked in error. |
| `plug.revoke` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Forget one server's OAuth credential and disconnect it. |
| `plug.toggle` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Set the enabled flag on one configured server and reconcile the live connection. |
| `plughub.detail` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One full catalogue entry, plus whether it is installed. |
| `plughub.search` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Search the plugin catalogue; also returns the category list. |
| `process.stop` | P17 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: use Ctrl+C instead. |
| `prompt.background` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1. |
| `prompt.submit` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1: submit inline through the composer. |
| `reload.env` | P16 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1: env is read once at startup. |
| `reload.mcp` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Reconcile the live MCP server set with the config on disk. |
| `rollback.diff` | P17 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: filesystem rollback not supported. |
| `rollback.list` | P17 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: filesystem rollback not supported; use git. |
| `rollback.restore` | P17 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: filesystem rollback not supported. |
| `secret.respond` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1. |
| `session.archive` | P02 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Archive or restore a session; archived sessions are omitted from session.list. |
| `session.branch` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Fork a session at its head into a new diverging child. |
| `session.clear` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Wipe a session's messages in place, keeping the same session_id. |
| `session.close` | P02 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Flush any unpersisted messages for a session. |
| `session.compress` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Archive old messages now instead of waiting for the context window. |
| `session.create` | P02 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Create a new session; the id is minted server-side. |
| `session.delete` | P02 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Delete a session file and invalidate its cache entry. |
| `session.export` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Render a session transcript to a Markdown file and return its path. |
| `session.get` | P03 | Missing handler (-32601) | Planned / no current UI reference | Get a single session by session_key. |
| `session.history` | P03 | Missing handler (-32601) | Planned / no current UI reference | Paginated message history for a session. |
| `session.interrupt` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Cancel the turn in flight on one session. |
| `session.list` | P02 | Not in upstream gap lists; verify runtime | Referenced in current UI source | List selected session channels by latest conversational activity. |
| `session.most_recent` | P02 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Return the most-recently-updated tui session key. |
| `session.pin` | P02 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Pin or unpin a session in the picker; the flag persists in session metadata. |
| `session.resume` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Resume a session, returning its full stored transcript. |
| `session.save` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1: sessions are append-only. |
| `session.set_harness` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Report, bind or unbind the Harness this session runs as. Omitting the harness key reports; a name binds a frozen snapshot of that stored Harness; null unbinds. A window keeps the Harness it was bound to even after the library entry is edited or removed. |
| `session.set_knowledge` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Choose which knowledge bases this session's turns may search. |
| `session.set_mode` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Report, set or clear the sub-agent tier this session dispatches at. Neither field reports; clear=true returns to the configured default; mode=<id> switches from the next turn on. Raven's own effort is the same in every tier. |
| `session.status` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Render `raven status` for the /status slash. |
| `session.steer` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1. |
| `session.title` | P02 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Get or set the title of a session. |
| `session.undo` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Drop the last n turns of a session (default 1). |
| `session.usage` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | What this conversation has spent, its delegations included. |
| `settings.everos` | P10 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The EverOS model roles behind long-term memory. |
| `settings.everosCloud` | P10 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The EverOS Cloud card: whether the hosted memory backend answers, which key it uses, where it points. |
| `settings.everosSet` | P10 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Record which model and provider serve one EverOS role, or clear the role. Deprecated snake_case alias: settings.everos_set. |
| `settings.everos_set` | P10 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Merge fields into one EverOS section, or clear it. |
| `settings.get` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The raw config file, with secret-looking values masked. |
| `settings.set` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Write one whitelisted config key. |
| `settings.usage` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | LLM and tool API usage over a window of days. |
| `setup.status` | P01 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Report whether an LLM provider is configured (hermes startup hook). |
| `shell.exec` | P17 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Run one command through the agent's executor and return its streams and exit code. |
| `skill.list` | P08 | Missing handler (-32601) | Planned / no current UI reference | List skills. |
| `skill.pin` | P08 | Missing handler (-32601) | Planned / no current UI reference | Pin a skill (write action; structured handler). |
| `skill.unpin` | P08 | Missing handler (-32601) | Planned / no current UI reference | Unpin a skill. |
| `skillhub.detail` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One skill plus its SKILL.md body and subscores. |
| `skillhub.install` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Download a skill archive and unpack it into the workspace pool. |
| `skillhub.remove` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Delete a hub-installed skill directory. |
| `skillhub.search` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Search the skill hub; installed skills are flagged. |
| `skills.manage` | P08 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List, inspect, search, browse or install skills; the result carries the fields of the action taken. |
| `skills.reload` | P08 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1: SkillForge reloads on its own. |
| `slash.exec` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Route an unrecognized slash command through the CLI. |
| `spawn_tree.list` | P04 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: spawn_tree topology not supported. |
| `spawn_tree.load` | P04 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: spawn_tree topology not supported. |
| `spawn_tree.save` | P04 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: spawn_tree topology not supported. |
| `subagent.cancel_instance` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Cancel the spawns behind one rendered (agent, handle) pair. |
| `subagent.cancel_session` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Cancel every background sub-agent a session left running. |
| `subagent.context` | P04 | Not in upstream gap lists; verify runtime | Referenced in current UI source | One handed-off call's transcript, in the shape session.resume returns. |
| `subagent.interrupt` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Cancel one running sub-agent by id. |
| `subagent.list` | P04 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List the background calls one conversation handed off, newest first. |
| `subagents.add` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Install a sub-agent from a preset into the running config. A preset that would land enabled first has one real prompt sent through that agent, and the add is refused, reporting why, when it does not answer: that spends one call on the agent's own quota, can take up to the preset's start window plus 60s, then for an acp preset up to two start windows more to record its capabilities (an acp preset on a machine: its node launch, a 120s start window and 60s for the answer, then up to 240s for the record), and a refusal stores nothing at all. While it runs, subagents.test_cancel on the name the entry would land under stops it and the add refuses with cancelled: true in its error data. Only a builtin preset and force: true are exempt. |
| `subagents.build` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Start building one vendored sub-agent's venv, and return as soon as it is under way. |
| `subagents.instance.create` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Create one instance of an enabled, stateful sub-agent and switch to it. |
| `subagents.instance.forget` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Drop one instance's registry row. Its record directories stay on disk. |
| `subagents.instance.history` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Read one instance's direct chat, flattened to alternating user/assistant turns. |
| `subagents.instance.set_mode` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Report, set or clear the operating mode of one direct-chat instance. Neither field reports; clear=true drops the instance override, after which the session's tier (clamped to this agent's menu) is what the next dispatch runs at, and the agent's own default runs only where there is no tier to inherit; mode=<id> switches from the next turn on. Always answers with the override, what is inherited, and the whole menu, so one reply is enough to draw the control. |
| `subagents.instance.set_model` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Report, set or clear the model one direct-chat instance answers with. Neither field reports; clear=true drops the override, after which the instance runs on whatever the agent picked for itself; model=<value> switches from the next turn on. Unlike set_mode there is nothing to inherit: a cleared instance follows the agent's own choice, which this host cannot name, so null means exactly that. Always answers with the override and the whole menu, so one reply is enough to draw the control. |
| `subagents.instance.steer` | P03 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Merge text into the turn one instance is running now. no_turn when nothing runs (nothing is started); unsupported when the run's transport cannot take text mid-turn. |
| `subagents.instances` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | List the sub-agent instances this session has used, most recently updated first. |
| `subagents.list` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | List every configured and preset-installable sub-agent as one overlay row set. |
| `subagents.presets` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | The presets an agent entry can be made from on a registered machine, whether or not one already holds them, and where each already runs. |
| `subagents.probe` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Re-run availability probes for every row and return the refreshed set. |
| `subagents.remove` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Remove a configured sub-agent. |
| `subagents.test` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Send a one-off probe message through a sub-agent and report the reply. |
| `subagents.test_cancel` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Cancel the named sub-agent's run in flight: a subagents.test, which then answers cancelled: true, or the one proof prompt a subagents.add, subagents.toggle or subagents.update sends before writing, together with the capability record an acp row is measured with once it answers, which then refuses with SubagentNotReady carrying cancelled: true in its data and writes nothing. The agent's process ends with the run, on this computer or through the machine's node. |
| `subagents.toggle` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Enable or disable a configured sub-agent. Switching a sub-agent on first sends one real prompt through that agent and refuses the enable, reporting why, when it does not answer: that spends one call on the agent's own quota and can take up to the row's start window plus 60s, then for an acp row up to two start windows more to record its capabilities; subagents.test_cancel on the name stops it meanwhile, and the enable refuses with cancelled: true in its error data. Switching off, a builtin row and force: true are exempt. |
| `subagents.update` | P06 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Rename / redescribe / re-key an already-configured sub-agent. Changing the key or the model of a row that is already enabled first sends one real prompt through it, and the change is refused, reporting why, when it does not answer: that spends one call on the agent's own quota and can take up to the row's start window plus 60s, then for an acp row up to two start windows more to record its capabilities; subagents.test_cancel on the name stops it meanwhile, and the change refuses with cancelled: true in its error data. A row that is off is exempt, as is every other field. |
| `sudo.respond` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1. |
| `system.hello` | P01 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Initial handshake (must be the first RPC call from client). |
| `system.ping` | P01 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Liveness probe. |
| `system.upgrade` | P16 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Install the latest release and restart the gateway. |
| `system.version` | P01 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Report server / schema / package versions. |
| `tasks.list` | P04 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Every unit of delegated work one conversation started, as run-level rows with their nodes inline. |
| `terminal.resize` | P17 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Record the terminal size reported on SIGWINCH. |
| `tools.configure` | P08 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: edit config.json directly. |
| `trajectory.block` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One block of an entry, at the revision and epoch the client holds; paged where the renderer pages. |
| `trajectory.changes` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Entries changed or removed since a revision, in revision order. |
| `trajectory.detail` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | One entry's overview: status, notes and a bounded summary per block. |
| `trajectory.export` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Validate a selection of turns and start exporting them; an invalid selection is refused with invalid_params naming each turn. |
| `trajectory.export_cancel` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Stop a running export, or discard a finished package and its download token. |
| `trajectory.export_status` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Where an export job stands; a finished one carries its download URL. |
| `trajectory.list` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | A consistent snapshot of a session's trajectory entries, paged. |
| `trajectory.state` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | Whether this process serves the trajectory view, and whether tracing records anything. |
| `trajectory.turns` | P15 | Not in upstream gap lists; verify runtime | Planned / no current UI reference | A session's main-line turns, in start order, for picking which to export or report. |
| `turn.cancel` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Abort the current turn (calls AgentLoop.stop()). |
| `turn.send` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Send a user message to a session and start a turn. |
| `turn.subscribe` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Subscribe to streaming TurnEvent notifications for a session. |
| `turn.unsubscribe` | P03 | Not in upstream gap lists; verify runtime | Referenced in current UI source | Stop receiving notifications; turn itself continues. |
| `voice.record` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | Not supported in Raven v0.1. |
| `voice.toggle` | P03 | Unsupported stub (-32012) | Planned / no current UI reference | hermes-only stub: voice not supported in Raven v0.1. |
