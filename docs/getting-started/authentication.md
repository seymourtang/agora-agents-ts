---
sidebar_position: 2
title: Authentication
description: Configure AgoraClient with token auth for REST requests and session tokens for channel joins.
---

# Authentication

The recommended production path is token auth.

You provide two different tokens:

- `authToken` on `AgoraClient` for REST API authentication
- `token` on `createSession(...)` for the RTC channel join

## Recommended: token auth

```typescript
import { Agent, AgentPresets, AgoraClient, Area } from 'agora-agent-server-sdk';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
  authToken: process.env.AGORA_REST_AUTH_TOKEN!,
});

const agent = new Agent({ instructions: 'Be concise.' });

const session = agent.createSession(client, {
  channel: 'room-123',
  agentUid: '1',
  remoteUids: ['100'],
  token: process.env.AGORA_RTC_JOIN_TOKEN!,
  preset: [
    AgentPresets.asr.deepgramNova3,
    AgentPresets.llm.openaiGpt5Mini,
    AgentPresets.tts.openaiTts1,
  ],
});
```

## Why this is the default

- REST auth is explicit and easy to rotate.
- Channel join tokens stay scoped to the session.
- Your quick start code stays vendor-key free when you use presets.

## Other supported modes

The SDK also supports app-credentials mode and Basic Auth, but they are intentionally not the default onboarding path.

- App credentials are useful when your backend wants the SDK to mint ConvoAI REST tokens automatically.
- Basic Auth is supported for legacy integrations and account-level workflows.

## Inspecting the resolved auth mode

```typescript
console.log(client.authMode); // "token"
```
