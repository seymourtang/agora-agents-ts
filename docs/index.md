---
sidebar_position: 1
title: Overview
description: The Agora Conversational AI TypeScript SDK — install, concepts, and examples.
---

# Agora Conversational AI TypeScript SDK

The `agora-agents` package lets you build real-time voice AI agents on the [Agora Conversational AI](https://docs.agora.io/en/conversational-ai/overview) platform.

## Two conversation flows

**Cascading flow** uses ASR -> LLM -> TTS and supports the broadest set of vendor combinations.

**MLLM flow** uses a multimodal model such as OpenAI Realtime, Gemini Live, Vertex AI, or xAI Grok for end-to-end audio.

## Choose a starting point

- Use [Quick Start](./getting-started/quick-start.md) if you want the recommended builder-based path with app credentials.
- Use [MLLM Flow Guide](./guides/mllm-flow.md) if you want realtime end-to-end audio with OpenAI Realtime, Gemini Live, Vertex AI, or xAI Grok.
- Use [Cascading Flow Guide](./guides/cascading-flow.md) if you want separate ASR, LLM, and TTS vendors.

## SDK layers

| Layer | What it does | When to use |
|---|---|---|
| **AgentKit** (`Agent`, `AgentSession`, vendor classes) | High-level builder pattern, lifecycle, typed vendors | Most use cases |
| **Fern-generated core** (`client.agents`, `client.telephony`) | Direct REST client mapping every API endpoint | Advanced use cases |

## Install

```sh
npm install agora-agents
```

## Documentation

| Section | What you will find |
|---|---|
| [Installation](./getting-started/installation.md) | Prerequisites, package managers, runtime compatibility |
| [Authentication](./getting-started/authentication.md) | App credentials and other auth modes |
| [Quick Start](./getting-started/quick-start.md) | Recommended builder-based onboarding flow |
| [BYOK](./guides/byok.md) | Bring your own vendor credentials and config |
| [Architecture](./concepts/architecture.md) | Layer design, when to use AgentKit vs. raw client |
| [Agent](./concepts/agent.md) | Builder pattern, immutable reuse, vendor configuration |
| [AgentSession](./concepts/session.md) | State machine, lifecycle methods, events |
| [Vendors](./concepts/vendors.md) | LLM, TTS, STT, MLLM, and Avatar provider catalog |
| [Cascading Flow Guide](./guides/cascading-flow.md) | Step-by-step ASR -> LLM -> TTS |
| [MLLM Flow Guide](./guides/mllm-flow.md) | OpenAI Realtime, Gemini Live, Vertex AI, and xAI Grok |
| [Avatar Integration](./guides/avatars.md) | LiveAvatar, Generic Avatar, Anam, HeyGen, and Akool integration |
| [Agent Builder Features](./guides/agent-builder-features.md) | Turn detection, SAL, filler words, and advanced agent options |
| [Regional Routing](./guides/regional-routing.md) | Area enum, domain pool, failover |
| [Error Handling](./guides/error-handling.md) | AgoraError and API error handling |
| [Error Reference](./reference/errors.md) | v2.7 status codes and error reason values |
| [Pagination](./guides/pagination.md) | Iterate over paginated list endpoints |
| [Advanced](./guides/advanced.md) | Headers, retries, timeouts, logging, custom fetcher |
| [Low-Level API](./guides/low-level-api.md) | Direct `client.agents.start()` usage |
| [AgoraClient Reference](./reference/client.md) | Constructor options, public methods |
| [Agent Reference](./reference/agent.md) | Full builder API with TypeScript signatures |
| [AgentSession Reference](./reference/session.md) | All methods, events, and payload types |
| [Vendor Reference](./reference/vendors.md) | Constructor options for every vendor class |

For Fern-generated raw API types, see the [API Reference](../../reference.md).
