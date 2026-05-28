---
sidebar_position: 3
title: Quick Start
description: Build and run your first Agora Conversational AI agent in TypeScript with app credentials and the builder API.
---

# Quick Start

This guide starts with the standard AgentKit path:

- `appId`, `appCertificate`, and `area` on `AgoraClient`
- the `Agent` builder with `.withStt()`, `.withLlm()`, and `.withTts()`
- automatic ConvoAI REST auth and RTC join token generation
- no vendor API keys when using supported Agora-managed models

## Full example

```typescript
import { Agent, AgoraClient, Area, DeepgramSTT, OpenAI, MiniMaxTTS } from 'agora-agents';

async function main(): Promise<void> {
  const client = new AgoraClient({
    area: Area.US,
    appId: 'your-app-id',
    appCertificate: 'your-app-certificate',
  });

  const agent = new Agent({
    name: 'support-assistant',
    instructions: 'You are a concise support voice assistant.',
    greeting: 'Hello! How can I help you today?',
    maxHistory: 10,
  })
    .withStt(new DeepgramSTT({ model: 'nova-3', language: 'en-US' }))
    .withLlm(new OpenAI({ model: 'gpt-4o-mini' }))
    .withTts(new MiniMaxTTS({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' }));

  const session = agent.createSession(client, {
    channel: 'support-room-123',
    agentUid: '1',
    remoteUids: ['100'],
    idleTimeout: 120,
  });

  const agentSessionId = await session.start();
  console.log('Agent started:', agentSessionId);

  await session.say('Thanks for calling Agora support.');
  await session.stop();
}

void main();
```

## What this does

1. `AgoraClient` runs in app-credentials mode when you pass `appId` and `appCertificate` only.
2. `Agent` holds reusable behavior such as instructions, greeting, and history settings.
3. Vendor classes on the builder select the ASR, LLM, and TTS stack. Leave vendor credentials unset for supported Agora-managed models, or provide keys when you want BYOK.
4. `session.start()` generates the required auth tokens and returns the unique agent session ID.

## When to use BYOK instead

Use the builder without vendor API keys when you are using supported Agora-managed models.

Use BYOK when you need to:

- supply your own vendor API keys
- use models outside the Agora-managed catalog
- point at custom vendor endpoints
- manage vendor-specific parameters directly

See [BYOK Guide](../guides/byok.md).

## Next steps

- [Authentication](./authentication.md)
- [BYOK Guide](../guides/byok.md)
- [MLLM Flow](../guides/mllm-flow.md)
- [Agent Reference](../reference/agent.md)
