---
sidebar_position: 3
title: AgentSession
description: Manage the full lifecycle of a running Agora Conversational AI agent.
---

# AgentSession

`AgentSession` manages the full lifecycle of a running agent — from starting to stopping, with events and interaction methods in between.

Create a session via [`agent.createSession()`](./agent.md):

```typescript
const session = agent.createSession(client, {
  channel: 'my-room',
  agentUid: '1',
  remoteUids: ['100'],
});
```

Presets are also configured at session creation time. That matches the underlying Agora start/join API, where presets are applied to a specific agent run rather than to the reusable `Agent` definition.

## State machine

A session progresses through these states:

```
idle ──► starting ──► running ──► stopping ──► stopped
                         │
                         ▼
                       error
```

| State | Meaning |
|---|---|
| `idle` | Session created but not yet started |
| `starting` | `start()` called; waiting for the API response |
| `running` | Agent is active in the channel; you can call `say()`, `interrupt()`, `update()` |
| `stopping` | `stop()` called; waiting for the agent to leave |
| `stopped` | Agent has left the channel; session is finished |
| `error` | An unrecoverable error occurred during `start()` or `stop()` |

Read the current state with `session.status`.

## Methods

All interaction methods require the session to be in the `running` state.

| Method | Returns | Description |
|---|---|---|
| `start()` | `Promise<string>` | Start the agent. Transitions `idle → starting → running`. Returns the `agentId`. |
| `stop()` | `Promise<void>` | Stop the agent. Transitions `running → stopping → stopped`. Handles already-stopped agents gracefully. |
| `say(text, options?)` | `Promise<void>` | Instruct the agent to speak `text`. Optional `priority` and `interruptable` fields. |
| `interrupt()` | `Promise<void>` | Interrupt the agent's current speech. |
| `update(config)` | `Promise<void>` | Update the agent configuration mid-session (LLM params, TTS, etc.). |
| `getHistory()` | `Promise<ConversationHistory>` | Fetch conversation history for this session. |
| `getInfo()` | `Promise<SessionInfo>` | Fetch current agent metadata. |
| `on(event, handler)` | `void` | Subscribe to a session event. |
| `off(event, handler)` | `void` | Unsubscribe from a session event. |

## Presets, inferred presets, and BYOK

AgentKit supports three ways to use reseller-backed models:

- Pass `preset` directly in `createSession(...)` when you want explicit control over the base reseller stack.
- Use supported preset-backed vendor models without credentials and let AgentKit infer the matching preset automatically.
- Use the same models with your own vendor credentials when you want BYOK instead.

Examples:

```typescript
const explicitPresetSession = agent.createSession(client, {
  channel: 'my-room',
  agentUid: '1',
  remoteUids: ['100'],
  preset: 'deepgram_nova_3,openai_gpt_5_mini,openai_tts_1',
});
```

```typescript
const inferredPresetAgent = new Agent({ instructions: 'Be concise.' })
  .withStt(new DeepgramSTT({ model: 'nova-3', language: 'en-US' }))
  .withLlm(new OpenAI({ model: 'gpt-5-mini' }))
  .withTts(new OpenAITTS({ voice: 'alloy' }));
```

Supported inferred preset models:

- Deepgram STT: `nova-2`, `nova-3`
- OpenAI LLM: `gpt-4o-mini`, `gpt-4.1-mini`, `gpt-5-nano`, `gpt-5-mini`
- OpenAI TTS: `tts-1`
- MiniMax TTS: `speech-2.6-turbo`, `speech-2.8-turbo`

### SayOptions

| Field | Type | Description |
|---|---|---|
| `priority` | `SpeakPriority` | Priority of the message |
| `interruptable` | `boolean` | Whether this message can be interrupted |

## Events

| Event | Payload | When it fires |
|---|---|---|
| `started` | `{ agentId: string }` | Agent successfully joined the channel |
| `stopped` | `{ agentId: string }` | Agent left the channel |
| `error` | `Error` | An unrecoverable error occurred |

### Example: listening for events

```typescript
import { AgoraClient, Area, Agent, OpenAI, ElevenLabsTTS, DeepgramSTT } from 'agora-agent-server-sdk';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
});

const agent = new Agent({ name: 'event-demo', instructions: 'You are helpful.' })
  .withLlm(new OpenAI({ apiKey: 'your-openai-key', model: 'gpt-4o-mini' }))
  .withTts(new ElevenLabsTTS({ key: 'your-elevenlabs-key', modelId: 'eleven_flash_v2_5', voiceId: 'your-voice-id', sampleRate: 24000 }))
  .withStt(new DeepgramSTT({ apiKey: 'your-deepgram-key', model: 'nova-2' }));

const session = agent.createSession(client, {
  channel: 'my-room',
  agentUid: '1',
  remoteUids: ['100'],
});

// Subscribe before starting
session.on('started', ({ agentId }) => {
  console.log('Agent started:', agentId);
});

session.on('stopped', ({ agentId }) => {
  console.log('Agent stopped:', agentId);
});

session.on('error', (err) => {
  console.error('Session error:', err);
});

const agentId = await session.start();
console.log('Running with agent ID:', agentId);

// Later...
await session.stop();
```

## Properties

| Property | Type | Description |
|---|---|---|
| `status` | `"idle" \| "starting" \| "running" \| "stopping" \| "stopped" \| "error"` | Current state |
| `id` | `string \| null` | Agent ID (available after `start()` resolves) |
| `agent` | `Agent` | The agent configuration this session was created from |
| `appId` | `string` | The App ID for this session |
| `raw` | `AgentsClient` | Direct access to the Fern-generated `AgentsClient` |

### Using `session.raw`

If the Agora API adds a new endpoint before the agentkit is updated, you can call it directly:

```typescript
await session.raw.someNewEndpoint({
  appid: session.appId,
  agentId: session.id!,
});
```

See [AgentSession Reference](../reference/session.md) for full TypeScript signatures.
