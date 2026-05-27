---
sidebar_position: 2
title: Agent
description: Full API reference for the Agent builder class.
---

# Agent Reference

<!-- snippet: fragment -->
```typescript
import { Agent } from 'agora-agents';
```

## Constructor

<!-- snippet: fragment -->
```typescript
new Agent<TTSSampleRate extends number = number>(options?: AgentOptions)
```

### AgentOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `undefined` | Agent name (used as default session name) |
| `instructions` | `string` | `undefined` | System prompt injected as a system message to the LLM |
| `greeting` | `string` | `undefined` | First message spoken when the session starts |
| `failureMessage` | `string` | `undefined` | Message spoken when an LLM call fails |
| `maxHistory` | `number` | `undefined` | Max conversation turns kept in standard LLM context; does not apply to MLLM |
| `turnDetection` | `TurnDetectionConfig` | `undefined` | Voice activity detection settings |
| `interruption` | `InterruptionConfig` | `undefined` | Unified interruption control settings |
| `sal` | `SalConfig` | `undefined` | Selective Attention Locking configuration |
| `avatar` | `AvatarConfig` | `undefined` | Avatar configuration |
| `advancedFeatures` | `AdvancedFeatures` | `undefined` | Enable MLLM mode, AI-VAD, etc. |
| `parameters` | `SessionParams` | `undefined` | Session parameters (silence config, farewell config) |
| `geofence` | `GeofenceConfig` | `undefined` | Regional access restriction |
| `labels` | `Labels` | `undefined` | Custom key-value labels (returned in callbacks) |
| `rtc` | `RtcConfig` | `undefined` | RTC media encryption |
| `fillerWords` | `FillerWordsConfig` | `undefined` | Filler words while waiting for LLM |

## Builder methods

All methods return a **new** `Agent` instance. The original is never modified.

### `withLlm(vendor: BaseLLM): Agent<TTSSampleRate>`

Set the LLM vendor. Pass an instance of `OpenAI`, `AzureOpenAI`, `Anthropic`, or `Gemini`.

### `withTts<SR extends number>(vendor: BaseTTS<SR>): Agent<SR>`

Set the TTS vendor. The sample rate type `SR` is captured and tracked for avatar compatibility.

### `withStt(vendor: BaseSTT): Agent<TTSSampleRate>`

Set the STT vendor. Pass an instance of any STT class (`DeepgramSTT`, `SpeechmaticsSTT`, etc.).

### `withMllm(vendor: BaseMLLM): Agent<TTSSampleRate>`

Set the MLLM vendor for multimodal mode. Pass `OpenAIRealtime`, `GeminiLive`, `VertexAI`, or `XaiGrok`. Calling `withMllm()` automatically sets `mllm.enable = true`. MLLM mode does not require `withTts()` / `withLlm()` / `withStt()`.

> Avatars are only supported with the cascading ASR + LLM + TTS pipeline. Combining `withMllm()` with `withAvatar()` throws at `toProperties()` and `session.start()`.

### `withAvatar<RequiredSR extends number>(this: Agent<RequiredSR>, vendor: BaseAvatar<RequiredSR>): Agent<RequiredSR>`

Set the avatar vendor. The `this` constraint enforces that the Agent's TTS sample rate matches the avatar's required rate at compile time. Requires the cascading ASR + LLM + TTS pipeline; avatars are not supported with MLLM.

### `withTurnDetection(config: TurnDetectionConfig): Agent<TTSSampleRate>`

Configure cascading-flow turn detection. Use `config.start_of_speech` and `config.end_of_speech` for SOS/EOS detection. Use `withInterruption()` for interruption behavior and MLLM vendor `turnDetection` for MLLM turn detection.

### `withInterruption(config: InterruptionConfig): Agent<TTSSampleRate>`

Configure unified interruption behavior using the top-level `interruption` object. Use this for `start_of_speech` and `keywords` interruption modes.

### `withInstructions(instructions: string): Agent<TTSSampleRate>`

Override the system prompt.

### `withGreeting(greeting: string): Agent<TTSSampleRate>`

Override the greeting message.

### `withName(name: string): Agent<TTSSampleRate>`

Override the agent name.

### `withSal(config: SalConfig): Agent<TTSSampleRate>`

Set SAL (Selective Attention Locking) configuration.

### `withAdvancedFeatures(features: AdvancedFeatures): Agent<TTSSampleRate>`

Set advanced features (e.g. `enable_rtm`).

### `withTools(enabled = true): Agent<TTSSampleRate>`

Enable or disable MCP tool invocation by setting `advanced_features.enable_tools`.

### `withParameters(parameters: SessionParams): Agent<TTSSampleRate>`

Set session parameters (silence config, farewell config, data channel, etc.).

### `withAudioScenario(audioScenario: ParametersAudioScenario): Agent<TTSSampleRate>`

Set `parameters.audio_scenario`. Use the exported `AudioScenario` constants for discoverability:

<!-- snippet: fragment -->
```typescript
agent.withAudioScenario(AudioScenario.Aiserver)
```

### `withFailureMessage(message: string): Agent<TTSSampleRate>`

Set the message spoken via TTS when the LLM call fails.

### `withMaxHistory(maxHistory: number): Agent<TTSSampleRate>`

Set the maximum conversation history length for the standard LLM pipeline. The v2.7 MLLM core schema does not expose a `max_history` field.

### `withGeofence(geofence: GeofenceConfig): Agent<TTSSampleRate>`

Set geofence configuration (restricts backend server regions).

### `withLabels(labels: Labels): Agent<TTSSampleRate>`

Set custom labels (key-value pairs returned in notification callbacks).

### `withRtc(rtc: RtcConfig): Agent<TTSSampleRate>`

Set RTC configuration.

### `withFillerWords(fillerWords: FillerWordsConfig): Agent<TTSSampleRate>`

Set filler words configuration (played while waiting for LLM response).

## Getter properties

| Property | Type | Description |
|---|---|---|
| `name` | `string \| undefined` | The agent name |
| `llm` | `LlmConfig \| undefined` | LLM config (set via `withLlm`) |
| `tts` | `TtsConfig \| undefined` | TTS config (set via `withTts`) |
| `stt` | `SttConfig \| undefined` | STT config (set via `withStt`) |
| `mllm` | `MllmConfig \| undefined` | MLLM config (set via `withMllm`) |
| `avatar` | `AvatarConfig \| undefined` | Avatar config (set via `withAvatar`) |
| `turnDetection` | `TurnDetectionConfig \| undefined` | Turn detection config |
| `interruption` | `InterruptionConfig \| undefined` | Interruption config |
| `instructions` | `string \| undefined` | System prompt |
| `greeting` | `string \| undefined` | Greeting message |
| `failureMessage` | `string \| undefined` | Message spoken when LLM fails |
| `maxHistory` | `number \| undefined` | Max conversation history length for the standard LLM pipeline |
| `sal` | `SalConfig \| undefined` | SAL configuration |
| `advancedFeatures` | `AdvancedFeatures \| undefined` | Advanced features |
| `parameters` | `SessionParams \| undefined` | Session parameters |
| `geofence` | `GeofenceConfig \| undefined` | Geofence configuration |
| `labels` | `Labels \| undefined` | Custom labels |
| `rtc` | `RtcConfig \| undefined` | RTC configuration |
| `fillerWords` | `FillerWordsConfig \| undefined` | Filler words configuration |
| `config` | `AgentOptions` | Full read-only configuration snapshot |

## `createSession(client, options): AgentSession`

Creates a new `AgentSession` bound to the given client and channel.

<!-- snippet: fragment -->
```typescript
createSession(
  client: AgoraClient & { readonly appId: string; readonly appCertificate?: string },
  options: SessionOptions,
): AgentSession
```

### SessionOptions

| Option | Type | Required | Description |
|---|---|---|---|
| `channel` | `string` | Yes | Channel name to join |
| `agentUid` | `string` | Yes | The agent's RTC UID |
| `remoteUids` | `string[]` | Yes | Remote user UIDs to subscribe to |
| `name` | `string` | No | Session name (defaults to agent name or `agent-{timestamp}`) |
| `token` | `string` | No | Pre-built RTC+RTM token (omit to auto-generate) |
| `expiresIn` | `number` | No | Token lifetime in seconds (default: `86400` = 24 h, Agora max). Only applies when the token is auto-generated. Use `ExpiresIn.hours()` or `ExpiresIn.minutes()` for clarity. Valid range: 1–86400. |
| `idleTimeout` | `number` | No | Seconds before auto-exit if no audio (0 = disabled) |
| `enableStringUid` | `boolean` | No | Use string UIDs instead of numeric |
| `preset` | `string \| AgentPreset[]` | No | Session-level preset IDs to use as the base ASR/LLM/TTS configuration. Accepts either a comma-separated string or an array of exported `AgentPresets.*` values. |
| `pipelineId` | `string` | No | Published AI Studio pipeline ID to use as the base configuration |
| `debug` | `boolean` | No | Log API requests to console |
| `warn` | `(message: string) => void` | No | Custom warning logger; pass a no-op to silence warnings |

`preset` is session-scoped because the underlying Agora start/join API applies presets per session, not per reusable `Agent` definition.

When you omit credentials for supported reseller-backed vendor models, AgentKit also infers the matching session preset automatically:

- Deepgram STT: `nova-2`, `nova-3`
- OpenAI LLM: `gpt-4o-mini`, `gpt-4.1-mini`, `gpt-5-nano`, `gpt-5-mini`
- OpenAI TTS: `tts-1`
- MiniMax TTS: `speech-2.6-turbo`, `speech-2.8-turbo`

If you provide your own vendor API key for those same models, AgentKit keeps the request in BYOK mode and does not infer a preset.

## `toProperties(opts): StartAgentsRequest.Properties`

Low-level method to convert the agent config to the Fern request format. Used internally by `AgentSession.start()`. You typically don't need to call this directly unless building custom request bodies.

## Type aliases

Public aliases over Fern-generated types include `LlmConfig`, `SttConfig`, `AsrConfig` (= `SttConfig`), `MllmConfig`, `AvatarConfig`, session/conversation types, and think types (`ThinkOnListeningAction`, etc.).

Think value constants: `ThinkOnListeningActionInject`, `ThinkOnListeningActionInterrupt`, `ThinkOnListeningActionIgnore`, `ThinkOnThinkingActionInterrupt`, `ThinkOnThinkingActionIgnore`, `ThinkOnSpeakingActionInterrupt`, `ThinkOnSpeakingActionIgnore`.

## Cross-SDK discovery map

| Concept | TypeScript | Python | Go |
|---|---|---|---|
| STT payload alias (wire: `asr`) | `SttConfig` / `AsrConfig` | `SttConfig` / `AsrConfig` | `AsrConfig` / `SttConfig` |
| xAI MLLM (primary) | `XaiGrok` | `XaiGrok` | `XaiGrok` / `NewXaiGrok` |
| Avatar token helper | `isAvatarTokenManaged` | `is_avatar_token_managed` | `IsAvatarTokenManaged` |
| Think inject constant | `ThinkOnListeningActionInject` | `ThinkOnListeningActionInject` | `ThinkOnListeningActionInject` |
