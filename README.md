# Agora Agent Server SDK for TypeScript

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2FAgoraIO-Conversational-AI%2Fagent-server-sdk-ts)
[![npm shield](https://img.shields.io/npm/v/agora-agent-server-sdk)](https://www.npmjs.com/package/agora-agent-server-sdk)
[![ci](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml)
[![coverage](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main)

The Agora Conversational AI SDK provides convenient access to the Agora Conversational AI APIs, 
enabling you to build voice-powered AI agents with support for both cascading flows (ASR -> LLM -> TTS) 
and multimodal flows (MLLM) for real-time audio processing.


## Installation

```sh
npm i -s agora-agent-server-sdk
```

## Quick Start

Use the **builder pattern** with `Agent` and `AgentSession`:

```typescript
import {
  AgoraClient,
  Area,
  Agent,
  ExpiresIn,
  OpenAI,
  OpenAITTS,
  DeepgramSTT,
} from 'agora-agent-server-sdk';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
});

const agent = new Agent({
  name: 'support-assistant',
  instructions: 'You are a helpful voice assistant.',
  greeting: 'Hello! How can I help you today?',
  maxHistory: 10,
})
  // Configure Agent flow: STT → LLM → TTS (no vendor API keys required for this setup)
  .withStt(new DeepgramSTT({ model: 'nova-3', language: 'en-US' }))
  .withLlm(new OpenAI({ model: 'gpt-5-mini', temperature: 0.3 }))
  .withTts(new OpenAITTS({ voice: 'alloy' }));
// .withAvatar(new HeyGenAvatar({ ... })) // optional

const session = agent.createSession(client, {
  channel: 'support-room-123',
  agentUid: '1',
  remoteUids: ['100'],
  idleTimeout: 120,
  expiresIn: ExpiresIn.hours(12), // optional — default is ExpiresIn.DAY (24 h)
});

// start() returns a session ID unique to this agent session
const agentSessionId = await session.start();

// In production, stop is typically called when your client signals the session has ended.
// Your server receives that request and calls session.stop().
await session.stop();
```

This setup works without vendor API keys. If you use other models or custom vendor endpoints, provide vendor credentials explicitly (BYOK).

### Presets and reseller models

Agora exposes `preset` on the session start request, so AgentKit treats presets as a session concern as well. That keeps the high-level wrapper aligned with the REST API and lets the same `Agent` be reused across sessions with different preset mixes or `pipelineId` values.

See Agora preset documentation: https://docs.agora.io/en/conversational-ai/develop/presets

You can pass presets explicitly:

```typescript
import { AgentPresets } from 'agora-agent-server-sdk';

const session = agent.createSession(client, {
  channel: 'support-room-123',
  agentUid: '1',
  remoteUids: ['100'],
  preset: [
    AgentPresets.asr.deepgramNova3,
    AgentPresets.llm.openaiGpt5Mini,
    AgentPresets.tts.minimaxSpeech26Turbo,
  ],
});
```

Or let AgentKit infer preset-backed reseller models from your vendor config when you omit credentials:

```typescript
import { Agent, DeepgramSTT, OpenAI, OpenAITTS } from 'agora-agent-server-sdk';

const presetAgent = new Agent({ instructions: 'Be concise.' })
  .withStt(new DeepgramSTT({ model: 'nova-3', language: 'en-US' }))
  .withLlm(new OpenAI({ model: 'gpt-5-mini', temperature: 0.3 }))
  .withTts(new OpenAITTS({ voice: 'alloy' }));

// AgentKit sends:
// preset: "deepgram_nova_3,openai_gpt_5_mini,openai_tts_1"
// and keeps the remaining asr/llm/tts settings as overrides.
```

If you choose a model outside the supported reseller preset list, TypeScript requires you to provide the corresponding vendor API key.

### Session lifecycle

`start()` joins the agent to the channel and returns a **session ID** — a unique identifier for this agent session. The session stays active until `stop()` is called.

There are two ways to stop a session depending on how your server is structured:

**Option 1 — Hold the session in memory:**

```typescript
// start-session handler
const agentSessionId = await session.start(); // unique ID for this session
// stop-session handler (same process, session still in scope)
await session.stop();
```

**Option 2 — Store the session ID and stop by ID (stateless servers):**

```typescript
// start-session handler: return session ID to your client app
const agentSessionId = await session.start();
res.json({ agentSessionId });

// stop-session handler: client sends back agentSessionId
const client = new AgoraClient({
  area: Area.US,
  appId: '...',
  appCertificate: '...',
});
await client.stopAgent(agentSessionId);
```

### Manual tokens (for debugging)

Generate tokens yourself and pass them in — useful when inspecting or reusing tokens:

```typescript
import {
  AgoraClient,
  Area,
  Agent,
  generateConvoAIToken,
  ExpiresIn,
} from 'agora-agent-server-sdk';

const APP_ID = 'your-app-id';
const APP_CERT = 'your-app-certificate';
const CHANNEL = 'support-room-123';
const AGENT_UID = '1';

// Auth header token — used by the SDK to authenticate REST API calls
const authToken = generateConvoAIToken({
  appId: APP_ID,
  appCertificate: APP_CERT,
  channelName: CHANNEL,
  account: AGENT_UID,
  tokenExpire: ExpiresIn.hours(12),
});

// Channel join token — embedded in the start request so the agent can join the channel
const joinToken = generateConvoAIToken({
  appId: APP_ID,
  appCertificate: APP_CERT,
  channelName: CHANNEL,
  account: AGENT_UID,
  tokenExpire: ExpiresIn.hours(12),
});

const client = new AgoraClient({
  area: Area.US,
  appId: APP_ID,
  appCertificate: APP_CERT,
  authToken: authToken, // Optional Debugging: uses this token for REST API auth header when set.
});

const session = agent.createSession(client, {
  channel: CHANNEL,
  agentUid: AGENT_UID,
  remoteUids: ['100'],
  token: joinToken, // channel join token
});
```

## Documentation

API reference documentation is available [here](https://docs.agora.io/en/conversational-ai/overview).

## Reference

A full reference for this library is available [here](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/blob/HEAD/./reference.md).

## MLLM Flow

For real-time voice-to-voice agents, use the AgentKit MLLM wrappers instead of wiring the low-level request shape yourself:

```typescript
import {
  AgoraClient,
  Area,
  Agent,
  OpenAIRealtime,
} from 'agora-agent-server-sdk';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
});

const agent = new Agent({
  name: 'realtime-assistant',
  advancedFeatures: { enable_mllm: true },
})
  .withMllm(
    new OpenAIRealtime({
      apiKey: 'your-openai-key',
      model: 'gpt-4o-realtime-preview',
      greetingMessage: "Hello! I'm ready to chat in real time.",
      inputModalities: ['audio'],
      outputModalities: ['text', 'audio'],
    }),
  );
```

You can also use `GeminiLive` for direct Google Gemini Live access or `VertexAI` for Gemini Live through Vertex AI.

## Low-Level API

If you need direct access to the generated SDK, import the `Agora` namespace and call the low-level client:

The low-level API is intentionally structured to match the Agora RESTful API 1:1. Method names, request shapes, and response types are designed to map directly to the underlying REST endpoints.

```typescript
import { AgoraClient, Area, Agora } from 'agora-agent-server-sdk';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
});

const request: Agora.StartAgentsRequest = {
  appid: client.appId,
  name: 'raw-agent',
  properties: {
    channel: 'room-123',
    token: 'your-token',
    agent_rtc_uid: '1',
    remote_rtc_uids: ['100'],
  },
};

await client.agents.start(request);
```

## More Docs

- High-level API reference: [docs/reference/agent.md](./docs/reference/agent.md)
- Session API reference: [docs/reference/session.md](./docs/reference/session.md)
- Full generated reference: [reference.md](./reference.md)
- Agora Conversational AI docs: https://docs.agora.io/en/conversational-ai/overview
