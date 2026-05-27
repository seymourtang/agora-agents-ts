---
sidebar_position: 1
title: Installation
description: Install the Agora Conversational AI TypeScript SDK.
---

# Installation

## Prerequisites

- **Node.js 18 or later** — the SDK uses modern APIs (`fetch`, `AbortSignal`, `crypto`) that require Node 18+.
- A package manager: npm, pnpm, or yarn.

## Install

```sh
npm install agora-agents
```

```sh
pnpm add agora-agents
```

```sh
yarn add agora-agents
```

## Runtime compatibility

| Runtime | Minimum version | Notes |
|---|---|---|
| Node.js | 18+ | Primary target |
| Vercel | Supported | Serverless and Edge Functions |
| Cloudflare Workers | Supported | Workers runtime |
| Deno | 1.25+ | Via npm compatibility layer |
| Bun | 1.0+ | Native Node compatibility |
| React Native | Supported | Via polyfills if needed |

## Server-side only

This SDK is designed for server-side use. Do not use it in a browser or expose it client-side — your App Certificate and Customer Secret must never be sent to the client. If you need a client-side integration, use the [Agora RTC SDK](https://docs.agora.io/en/video-calling/overview) for the media layer and call your own backend to manage agents.
