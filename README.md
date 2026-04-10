# Agora Agent Server SDK for TypeScript

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2FAgoraIO-Conversational-AI%2Fagent-server-sdk-ts)
[![npm shield](https://img.shields.io/npm/v/agora-agent-server-sdk)](https://www.npmjs.com/package/agora-agent-server-sdk)
[![ci](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml)
[![coverage](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main)

The Agora Agent Server SDK for TypeScript lets you build real-time voice agents on Agora Conversational AI with a high-level `Agent` / `AgentSession` API and a generated low-level REST client.

## Installation

```sh
npm install agora-agent-server-sdk
```

## Quick Start

This is the canonical onboarding path:

- Use `authToken` for REST API authentication.
- Use `preset` on the session to select Agora-managed vendors.
- Pass a channel join `token` when starting the session.
- Do not provide vendor API keys for the preset flow.

```typescript
import { Agent, AgentPresets, AgoraClient, Area } from 'agora-agent-server-sdk';

async function main(): Promise<void> {
  // Provision these in your backend. The SDK expects raw token values.
  const restAuthToken = process.env.AGORA_REST_AUTH_TOKEN!;
  const rtcJoinToken = process.env.AGORA_RTC_JOIN_TOKEN!;

  // Token auth for REST API calls.
  const client = new AgoraClient({
    area: Area.US,
    appId: 'your-app-id',
    appCertificate: 'your-app-certificate',
    authToken: restAuthToken,
  });

  // Agent-level behavior lives here. Vendor selection comes from presets below.
  const agent = new Agent({
    name: 'support-assistant',
    instructions: 'You are a concise support voice assistant.',
    greeting: 'Hello! How can I help you today?',
    maxHistory: 10,
  });

  const session = agent.createSession(client, {
    channel: 'support-room-123',
    agentUid: '1',
    remoteUids: ['100'],
    token: rtcJoinToken,
    idleTimeout: 120,
    preset: [
      AgentPresets.asr.deepgramNova3,
      AgentPresets.llm.openaiGpt5Mini,
      AgentPresets.tts.openaiTts1,
    ],
  });

  const agentSessionId = await session.start();
  console.log('Agent started:', agentSessionId);

  await session.say('Thanks for calling Agora support.');
  await session.stop();
}

void main();
```

### Why two tokens?

- `authToken` authenticates REST API requests.
- `token` inside `createSession(...)` is the RTC join token used when the agent enters the channel.

## BYOK

If you want to bring your own vendor credentials instead of using Agora-managed presets, use the BYOK guide:

- [BYOK Guide](./docs/guides/byok.md)

## MLLM (Realtime / Multimodal)

Use `withMllm()` for OpenAI Realtime or Gemini Live — no STT, LLM, or TTS vendor needed. MLLM mode is enabled automatically.

```typescript
import { Agent, OpenAIRealtime } from 'agora-agent-server-sdk';

const agent = new Agent({ name: 'realtime-assistant' })
  .withMllm(new OpenAIRealtime({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-realtime-preview',
    greetingMessage: 'Hello! Ready to chat.',
  }));
```

See the [MLLM Flow guide](./docs/guides/mllm-flow.md) for full examples with Gemini Live and Vertex AI.

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
