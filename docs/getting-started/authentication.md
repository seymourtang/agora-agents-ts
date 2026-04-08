---
sidebar_position: 2
title: Authentication
description: Configure AgoraClient with the recommended app-credentials flow and understand the supported auth modes.
---

# Authentication

The recommended production path is app credentials mode.

Create `AgoraClient` with `appId` and `appCertificate`, then let `AgentSession` generate the ConvoAI REST auth token and the RTC join token automatically.

## Recommended: app credentials

```typescript
import { Agent, AgentPresets, AgoraClient, Area } from 'agora-agent-server-sdk';

const client = new AgoraClient({
  area: Area.US,
  appId: 'your-app-id',
  appCertificate: 'your-app-certificate',
});

const agent = new Agent({ instructions: 'Be concise.' });

const session = agent.createSession(client, {
  channel: 'room-123',
  agentUid: '1',
  remoteUids: ['100'],
  preset: [
    AgentPresets.asr.deepgramNova3,
    AgentPresets.llm.openaiGpt5Mini,
    AgentPresets.tts.openaiTts1,
  ],
});
```

## Why this is the default

- The SDK handles ConvoAI REST auth and RTC join token generation for you.
- Your onboarding code stays focused on agent behavior instead of auth plumbing.
- Your quick start code stays vendor-key free when you use presets.

## Inspecting the resolved auth mode

```typescript
console.log(client.authMode); // "app-credentials"
```

## Other supported modes

`authToken` and `customerId` + `customerSecret` are still supported for advanced or legacy cases, but they are not the default onboarding path.
