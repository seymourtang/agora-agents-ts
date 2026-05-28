---
sidebar_position: 2
title: Authentication
description: Configure AgoraClient with app credentials and understand other supported auth modes.
---

# Authentication

Create `AgoraClient` with `appId` and `appCertificate` only. The SDK mints a fresh ConvoAI REST token for each API call and generates the RTC join token when the session starts.

## App credentials

```typescript
import { Agent, AgoraClient, Area, DeepgramSTT, OpenAI, MiniMaxTTS } from 'agora-agents';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
});

const agent = new Agent({ instructions: 'Be concise.' })
  .withStt(new DeepgramSTT({ model: 'nova-3', language: 'en-US' }))
  .withLlm(new OpenAI({ model: 'gpt-4o-mini' }))
  .withTts(new MiniMaxTTS({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' }));

const session = agent.createSession(client, {
  channel: 'room-123',
  agentUid: '1',
  remoteUids: ['100'],
});
```

## Why app credentials

- Fresh short-lived tokens per API call instead of reusing long-lived credentials
- No Customer ID / Customer Secret in request headers
- No manual REST or RTC token provisioning in application code

## Inspecting auth mode

```typescript
console.log(client.authMode); // "app-credentials"
```

## Legacy auth modes

The generated client still supports pre-minted REST tokens and HTTP Basic Auth for legacy integrations. Do not use those modes for new session integrations. Use app credentials so AgentKit can mint short-lived ConvoAI REST auth and RTC join tokens for each session.
