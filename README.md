# Agora Agent Server SDK for TypeScript

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2FAgoraIO-Conversational-AI%2Fagent-server-sdk-ts)
[![npm shield](https://img.shields.io/npm/v/agora-agent-server-sdk)](https://www.npmjs.com/package/agora-agent-server-sdk)
[![ci](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AgoraIO-Conversational-AI/agent-server-sdk-ts/actions/workflows/ci.yml)
[![coverage](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/AgoraIO-Conversational-AI/agent-server-sdk-ts/branch/main)

The Agora Conversational AI SDK provides convenient access to the Agora Conversational AI APIs, enabling you to build voice-powered AI agents with support for both cascading flows (ASR -> LLM -> TTS) and multimodal flows (MLLM) for real-time audio processing.

## Requirements

- Node.js 18+

## Installation

```sh
npm install agora-agent-server-sdk
```

## Quick Start

Minimal builder-based example using supported preset-backed models with no vendor API keys:

```typescript
import { Agent, AgoraClient, Area, DeepgramSTT, OpenAI, OpenAITTS } from 'agora-agent-server-sdk';

async function main() {
  const client = new AgoraClient({
    area: Area.US,
    appId: 'your-app-id',
    appCertificate: 'your-app-certificate',
  });

  const agent = new Agent({
    instructions: 'You are a concise voice assistant.',
    greeting: 'Hello! How can I help you today?',
  })
    .withStt(new DeepgramSTT({ model: 'nova-3' }))
    .withLlm(new OpenAI({ model: 'gpt-5-mini' }))
    .withTts(new OpenAITTS({ voice: 'alloy' }));

  const session = agent.createSession(client, {
    channel: 'support-room-123',
    agentUid: '1',
    remoteUids: ['100'],
  });

  const agentId = await session.start();
  console.log(agentId);
}

main().catch(console.error);
```

### Why no token or vendor key in the example?

The SDK-managed path is the recommended path. `AgoraClient` generates the required ConvoAI REST auth and RTC join tokens automatically, and AgentKit infers the matching supported presets from the vendor configs when you omit vendor API keys.

## BYOK

If you want to bring your own vendor credentials instead of using Agora-managed presets, use the BYOK guide:

- [BYOK Guide](./docs/guides/byok.md)

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
