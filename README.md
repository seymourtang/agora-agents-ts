# Agora Agents SDK for TypeScript

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2FAgoraIO-Conversational-AI%2Fagent-server-sdk-ts)
[![npm shield](https://img.shields.io/npm/v/agora-agents)](https://www.npmjs.com/package/agora-agents)
[![ci](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml)
[![coverage](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main)

The Agora Agents SDK for TypeScript lets you build real-time voice agents on Agora Conversational AI with a high-level `Agent` / `AgentSession` API and a generated low-level REST client.

## Installation

```sh
npm install agora-agents
```

## Quick Start

The recommended onboarding path is a server-side builder flow: define the agent once, configure preset-backed providers in the builder, and let AgentKit infer the reseller `preset` values when the session starts.

```typescript
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agents';

const AGENT_PROMPT = `You are a concise, technically credible voice assistant. Keep replies short unless the user asks for detail.`;

const GREETING = 'Hi there! I am your Agora voice assistant. How can I help?';

export async function startConversation(): Promise<string> {
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;

  const client = new AgoraClient({
    area: Area.US,
    appId,
    appCertificate,
  });

  const agent = new Agent({
    name: `conversation-${Date.now()}`,
    instructions: AGENT_PROMPT,
    greeting: GREETING,
    failureMessage: 'Please wait a moment.',
    maxHistory: 50,
    turnDetection: {
      config: {
        speech_threshold: 0.5,
        start_of_speech: {
          mode: 'vad',
          vad_config: {
            interrupt_duration_ms: 160,
            prefix_padding_ms: 300,
          },
        },
        end_of_speech: {
          mode: 'vad',
          vad_config: {
            silence_duration_ms: 480,
          },
        },
      },
    },
    advancedFeatures: {
      enable_rtm: true,
      enable_tools: true,
    },
    parameters: {
      data_channel: 'rtm',
      enable_error_message: true,
    },
  })
    .withStt(
      new DeepgramSTT({
        model: 'nova-3',
        language: 'en',
      }),
    )
    .withLlm(
      new OpenAI({
        model: 'gpt-4o-mini',
        greetingMessage: GREETING,
        failureMessage: 'Please wait a moment.',
        maxHistory: 15,
        params: {
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
        },
      }),
    )
    .withTts(
      new MiniMaxTTS({
        model: 'speech_2_6_turbo',
        voiceId: 'English_captivating_female1',
      }),
    );

  const session = agent.createSession(client, {
    channel: "demo-channel-" + Date.now(),  // Unique channel name
    agentUid: 123456,                       // Unique agent UID. Can be a random number or a specific user ID.
    remoteUids: ['*'],                     // '*' is a wildcard, or use a specific user ID.
    idleTimeout: 30,
    expiresIn: ExpiresIn.hours(1),
    debug: false,
  });

  return await session.start();
}
```

### Why no token or vendor key in the example?

`AgoraClient` generates the required ConvoAI REST auth and RTC join tokens automatically when you provide `appId` and `appCertificate`. AgentKit then inspects the builder-provided vendor configs and infers the matching supported `preset` values for reseller-backed models, so you do not pass vendor API keys in this flow.

### BYOK version of the same builder flow

Use the same `Agent` builder shape, but provide credentials explicitly when you want vendor-managed billing and routing instead of Agora-managed presets.

```typescript
const agent = new Agent({
  instructions: SUPPORT_PROMPT,
  greeting: GREETING,
})
  .withStt(
    new DeepgramSTT({
      apiKey: process.env.DEEPGRAM_API_KEY!,
      model: 'nova-3',
      language: 'en',
    }),
  )
  .withLlm(
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o-mini',
      maxTokens: 1024,
      temperature: 0.7,
      topP: 0.95,
    }),
  )
  .withTts(
    new MiniMaxTTS({
      key: process.env.MINIMAX_API_KEY!,
      groupId: process.env.MINIMAX_GROUP_ID!,
      model: 'speech_2_6_turbo',
      voiceId: 'English_captivating_female1',
    }),
  );
```

## BYOK

If you want to bring your own vendor credentials instead of using Agora-managed presets, use the BYOK guide:

- [BYOK Guide](./docs/guides/byok.md)

## MLLM (Realtime / Multimodal)

Use `withMllm()` for OpenAI Realtime, Gemini Live, Vertex AI, or xAI Grok — no STT, LLM, or TTS vendor needed. MLLM mode is enabled automatically.

```typescript
import { Agent, OpenAIRealtime } from 'agora-agents';

const agent = new Agent({ name: 'realtime-assistant' }).withMllm(
  new OpenAIRealtime({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-realtime-preview',
    greetingMessage: 'Hello! Ready to chat.',
  }),
);
```

See the [MLLM Flow guide](./docs/guides/mllm-flow.md) for full examples with Gemini Live, Vertex AI, and xAI Grok.

> Avatars are not supported with MLLM. The avatar publisher requires the cascading ASR + LLM + TTS pipeline; combining `withMllm()` with `withAvatar()` throws at `Agent.toProperties()` and `AgentSession.start()`.

## Avatars

AgentKit supports LiveAvatar, Generic Avatar, Anam, Akool, and deprecated HeyGen. Avatar `agoraToken` is optional: when omitted, `session.start()` generates a token using the same ConvoAI token format as the agent token, scoped to the avatar `agoraUid`. Avatars require the cascading ASR + LLM + TTS pipeline (not MLLM).

See the [Avatar Integration guide](./docs/guides/avatars.md) for sample-rate requirements and Generic Avatar setup.

## Documentation

- [Overview](./docs/index.md)
- [Authentication](./docs/getting-started/authentication.md)
- [Quick Start](./docs/getting-started/quick-start.md)
- [BYOK Guide](./docs/guides/byok.md)
- [MLLM Flow](./docs/guides/mllm-flow.md)
- [Low-Level API](./docs/guides/low-level-api.md)

## Reference

- [SDK Reference](./reference.md)
- [Agora Conversational AI Docs](https://docs.agora.io/en/conversational-ai/overview)

## Package Rename Compatibility

The legacy npm package name `agora-agent-server-sdk` is maintained as a compatibility shim in [compat/agora-agent-server-sdk](./compat/agora-agent-server-sdk). The release workflow publishes both `agora-agents` and the legacy shim from the same `vX.Y.Z` tag, as long as both package versions are kept in sync.
