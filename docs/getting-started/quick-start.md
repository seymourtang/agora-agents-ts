---
sidebar_position: 3
title: Quick Start
description: Build and run your first Agora Conversational AI agent in TypeScript with token auth and presets.
---

# Quick Start

This guide uses the recommended onboarding path:

- `authToken` for REST API authentication
- `preset` for Agora-managed ASR, LLM, and TTS
- a channel join `token` for the RTC session
- no vendor API keys in application code

## Full example

```typescript
import { Agent, AgentPresets, AgoraClient, Area } from 'agora-agents';

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

## What this does

1. `AgoraClient` uses `authToken` for REST API authentication.
2. `Agent` holds reusable behavior such as instructions, greeting, and history settings.
3. `preset` tells Agora which managed ASR, LLM, and TTS vendors to run.
4. `token` on the session is the RTC join token used when the agent enters the channel.
5. `session.start()` starts the agent and returns the unique agent session ID.

## When to use BYOK instead

Use presets when you want the fastest path to a working agent.

Use BYOK when you need to:

- supply your own vendor API keys
- use models outside the preset catalog
- point at custom vendor endpoints
- manage vendor-specific parameters directly

See [BYOK Guide](../guides/byok.md).

## Next steps

- [Authentication](./authentication.md)
- [BYOK Guide](../guides/byok.md)
- [MLLM Flow](../guides/mllm-flow.md)
- [Agent Reference](../reference/agent.md)
