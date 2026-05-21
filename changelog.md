# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [v1.4.1] — 2026-05-21

### Fixed

- **ESM release output** — Multiline relative exports are now rewritten from `.js` to `.mjs`, and the ESM build fails if relative `.js` imports remain in `dist/esm`.

## [v1.4.0] — 2026-05-13

### Added

- **`DeepgramTTS`** — New TTS vendor wrapper for Deepgram (Beta). Accepts `apiKey`, `model`, `baseUrl`, `sampleRate`, `params`, and `skipPatterns`.
- **`Agent.withTools(enabled = true)`** — Dedicated builder method to enable MCP tool invocation (`advancedFeatures.enable_tools`). Replaces the raw `.withAdvancedFeatures({ enable_tools: true })` call.
- **LLM vendors: `headers` option** — All four LLM vendors (`OpenAI`, `AzureOpenAI`, `Anthropic`, `Gemini`) now accept an optional `headers: Record<string, string>` option. Use this to pass custom HTTP headers to the LLM provider.
- **`AgentSession.think()`** — Send a custom instruction to a running agent through the `agentManagement` API.
- **`Agent.withInterruption()`** — Configure the new top-level `interruption` object for unified interruption control.
- **MLLM turn detection** — `OpenAIRealtime`, `GeminiLive`, and `VertexAI` now accept `turnDetection`, which maps to `mllm.turn_detection` and overrides top-level turn detection for MLLM sessions.
- **`audioScenario` AgentKit support** — Session params and AgentKit request construction now expose the top-level `parameters.audio_scenario` field.

### Fixed

- **MiniMax TTS preset stripping** — When a MiniMax reseller preset is inferred (`minimax_speech_2_6_turbo` or `minimax_speech_2_8_turbo`), the `group_id` and `url` fields are now correctly stripped from `tts.params` alongside `key` and `model`. Previously they were forwarded to the API, causing request failures.
- **MLLM enable flag** — `Agent.withMllm()` now sets `mllm.enable = true` and removes the deprecated `advancedFeatures.enable_mllm` flag from generated requests.
- **MLLM wrapper shape** — MLLM vendors no longer emit removed fields such as `style`; docs and tests now reflect the v2.6 MLLM contract.
- **Preset-backed OpenAI TTS** — `OpenAITTS` no longer requires `apiKey` when a reseller preset supplies credentials server-side.
- **AgentKit parity coverage** — Added regression coverage for interruption, MLLM turn detection, Deepgram TTS, LLM headers, and deprecated MLLM flag cleanup.

## [v1.3.2] — 2026-04-10

### Fixed

- **`GeminiLive` and `VertexAI` were missing the `url` parameter.** The optional WebSocket URL override supported by `OpenAIRealtime` was not exposed on the other two MLLM vendors, making it impossible to point them at a custom endpoint. Both constructors now accept an optional `url` field that is passed through to the API request.

- **`withMllm()` is now self-contained.** Previously, calling `agent.withMllm(vendor)` still required a separate `.withAdvancedFeatures({ enable_mllm: true })` call to bypass the STT/LLM/TTS required-field guards. Omitting it produced a misleading `"TTS configuration is required"` error. `withMllm()` now automatically sets `enable_mllm: true` — no extra configuration needed.

## [v1.3.1] — 2026-04-06

### Fixed

- ESM release output now rewrites multiline re-exports/imports correctly during `.js` -> `.mjs` conversion, including the top-level AgentKit re-export path.
- Added `scripts/verify-esm-imports.js` and wired it into `build:esm` to fail builds when `dist/esm/**/*.mjs` contains broken relative `.js` specifiers that should resolve to `.mjs`.
- ESM token generation path now imports `agora-token` through CJS interop (`default` import) instead of fragile named ESM imports, preventing runtime import failures in strict ESM environments.
- Build now clears `dist/cjs` and `dist/esm` before compilation to avoid stale artifacts being published, and build configs exclude `src/**/__tests__/**`.
- Packaging no longer references a non-existent `LICENSE` file.

## [v1.3.0] — 2026-04-02

### Added

- `AgentSession.getTurns()` for high-level turn analytics access without dropping to `session.raw`.
- Session-level `preset` and `pipelineId` support with automatic reseller preset inference for supported Deepgram, OpenAI, and MiniMax models.
- AgentKit preset constants for discoverable session preset composition.

### Changed

- `AgentSession.start()` now normalizes preset input and resolves inferred presets before sending the request to the low-level SDK.
- AgentKit MLLM wrappers now mirror the generated low-level MLLM contract and no longer expose unsupported wrapper-only fields.
- AgentKit TTS wrappers now mirror the generated low-level TTS contract and no longer expose unsupported wrapper-only fields.
- README and vendor reference docs now describe the low-level SDK as a 1:1 match for the Agora REST API and link to the current CI and coverage badges.

### Fixed

- Preset stripping now uses a single structured inference pass instead of re-deriving presets inside the transform step.
- OpenAI, Deepgram, and MiniMax preset-backed session paths now preserve BYOK behavior while inferring reseller presets only when credentials are omitted.

## [v1.2.0] — 2026-03-27

### Fixed

- **`AresSTT`** — Removed redundant `language` key from the `params` dict. Language is now emitted only at the top level. `params` is only included when `additionalParams` is provided.
- **`OpenAIRealtime` / `VertexAI` (MLLM)** — Agent-level `greeting`, `failureMessage`, and `maxHistory` overrides are now correctly applied when the agent is in MLLM mode. Previously these values were silently dropped.
- **`VertexAI` (MLLM)** — `messages` is now correctly placed inside `params` (required by the Gemini Live API). Previously it was emitted at the top level and silently ignored.

### Changed

- **`OpenAITTS`** — Renamed constructor option `key` → `apiKey` to match the Agora server API expectation. ⚠️ **Breaking change.**
- **`CartesiaTTS`** — Renamed constructor option `key` → `apiKey`. Voice is now serialized as `{"mode": "id", "id": "<voiceId>"}` instead of a flat `voice_id` string. ⚠️ **Breaking change.**
- **`HeyGenAvatar`** — Removed legacy options `avatarName`, `voiceId`, `language`, `version`. Added `agoraToken`, `avatarId`, `enable`, `disableIdleTimeout`, `activityIdleTimeout`. The config now includes a top-level `enable` field (defaults `true`). ⚠️ **Breaking change.**

### Added

- **`OpenAITTS`** — New optional parameters: `responseFormat` (string, e.g. `"pcm"`) and `speed` (number).
- **`CartesiaTTS`** — `voiceId` user-facing option is preserved; voice is serialized to the required nested object format automatically.
- **`RimeTTS`** — New optional parameters: `lang` (string), `samplingRate` (number, serialized as `samplingRate`), `speedAlpha` (number, serialized as `speedAlpha`).
- **`OpenAIRealtime`** — New optional parameters: `predefinedTools` (string[]), `failureMessage` (string), `maxHistory` (number).
- **`VertexAI` (MLLM)** — New optional parameters: `predefinedTools` (string[]), `failureMessage` (string), `maxHistory` (number).
- **`HeyGenAvatar`** — New options: `agoraToken` (string), `avatarId` (string), `enable` (boolean, default `true`), `disableIdleTimeout` (boolean), `activityIdleTimeout` (number).

## [v1.1.0] — 2026-03-17

### Fixed

- `ElevenLabsTTS`: added missing voice tuning params — `optimizeStreamingLatency`, `stability`, `similarityBoost`, `style`, `useSpeakerBoost`
- `Gemini` LLM: `toConfig()` now serializes `temperature`, `topP`, `topK`, and `maxOutputTokens` (fields existed on the interface but were silently dropped)
- `AzureOpenAI` LLM: corrected default `apiVersion` from `2023-05-15` to `2024-08-01-preview`
- `SpeechmaticsSTT`, `SarvamSTT`: added optional `model` field

## [v1.0.0] — 2026-03-11

Initial stable release of the Agora Agent Server SDK for TypeScript.

### Added

- `Agent` builder with fluent API (`.withLlm()`, `.withTts()`, `.withStt()`, `.withMllm()`, `.withAvatar()`)
- `AgentSession` for session lifecycle management (`start()`, `stop()`)
- Automatic token generation — pass `appId` + `appCertificate` and tokens are handled internally
- Token utilities: `generateRtcToken`, `generateConvoAIToken`, `ExpiresIn.hours()`, `ExpiresIn.minutes()`
- Turn detection configuration via `TurnDetectionConfig` with nested `StartOfSpeechConfig` and `EndOfSpeechConfig`
- SAL (Selective Attention Locking) via `SalConfig` with `SalMode`
- Filler words support: `FillerWordsConfig`, `FillerWordsTrigger`, `FillerWordsContent`
- Session parameters: `SessionParams`, `SilenceConfig`, `FarewellConfig`, `ParametersDataChannel`
- Geofencing via `GeofenceConfig`
- Advanced features (MLLM mode) via `AdvancedFeatures`
- Type-safe constants: `DataChannel`, `SilenceActionValues`, `SalModeValues`, `Geofence`, `FillerWordsSelectionRule`, `TurnDetectionTypeValues`
- Vendor integrations:
  - **LLM**: `OpenAI`, `AzureOpenAI`, `Anthropic`, `Gemini`, `VertexAI`
  - **MLLM**: `OpenAIRealtime`
  - **TTS**: `ElevenLabsTTS`, `MicrosoftTTS`, `OpenAITTS`, `CartesiaTTS`, `GoogleTTS`, `AmazonTTS`, `HumeAITTS`, `RimeTTS`, `FishAudioTTS`, `MiniMaxTTS`, `SarvamTTS`
  - **STT**: `DeepgramSTT`, `MicrosoftSTT`, `OpenAISTT`, `GoogleSTT`, `AmazonSTT`, `AssemblyAISTT`, `AresSTT`, `SarvamSTT`, `SpeechmaticsSTT`
  - **Avatar**: `HeyGenAvatar`, `AkoolAvatar`
