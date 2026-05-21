---
sidebar_position: 4
title: Vendors
description: Typed vendor classes for LLM, TTS, STT, MLLM, and Avatar providers.
---

# Vendors

Each vendor is a typed class that validates options at construction time and serializes to the wire format for the Agora API. Import all vendors from `agora-agent-server-sdk`.

## LLM vendors

| Class | Provider | Key constructor params |
|---|---|---|
| `OpenAI` | OpenAI Chat Completions | `apiKey`, `model`, `url?`, `maxHistory?`, `greetingMessage?`, `failureMessage?` |
| `AzureOpenAI` | Azure OpenAI | `apiKey`, `model`, `resourceName`, `deploymentName`, `apiVersion?` |
| `Anthropic` | Anthropic Claude | `apiKey`, `model`, `url?`, `maxHistory?` |
| `Gemini` | Google Gemini | `apiKey`, `model`, `url?`, `maxHistory?` |

<!-- snippet: executable -->
```typescript
import { OpenAI } from 'agora-agent-server-sdk';

const llm = new OpenAI({
  apiKey: 'your-openai-key',
  model: 'gpt-4o-mini',
});
```

## TTS vendors

| Class | Provider | `sampleRate` options |
|---|---|---|
| `ElevenLabsTTS` | ElevenLabs | 16000, 22050, 24000, 44100 |
| `MicrosoftTTS` | Azure Speech | 16000, 24000, 48000 |
| `OpenAITTS` | OpenAI TTS | Fixed at 24000 |
| `CartesiaTTS` | Cartesia | 8000, 16000, 22050, 24000, 44100, 48000 |
| `GoogleTTS` | Google Cloud TTS | Not configurable via constructor |
| `AmazonTTS` | Amazon Polly | Not configurable via constructor |
| `HumeAITTS` | Hume AI | Not configurable via constructor |
| `RimeTTS` | Rime | Not configurable via constructor |
| `FishAudioTTS` | Fish Audio | Not configurable via constructor |
| `MiniMaxTTS` | MiniMax | Not configurable via constructor |
| `MurfTTS` | Murf | Not configurable via constructor |
| `DeepgramTTS` | Deepgram | Configurable |
| `SarvamTTS` | Sarvam AI | Not configurable via constructor |

<!-- snippet: executable -->
```typescript
import { ElevenLabsTTS } from 'agora-agent-server-sdk';

const tts = new ElevenLabsTTS({
  key: 'your-elevenlabs-key',
  modelId: 'eleven_flash_v2_5',
  voiceId: 'your-voice-id',
  sampleRate: 24000,
});
```

The `sampleRate` is critical when using avatars. See [Avatar Integration](../guides/avatars.md) for details.

## STT vendors

| Class | Provider | Key constructor params |
|---|---|---|
| `SpeechmaticsSTT` | Speechmatics | `apiKey`, `language` |
| `DeepgramSTT` | Deepgram | `apiKey?`, `model?`, `language?`, `smartFormat?` |
| `MicrosoftSTT` | Azure Speech | `key`, `region`, `language?` |
| `OpenAISTT` | OpenAI Whisper | `apiKey`, `model?`, `language?` |
| `GoogleSTT` | Google Speech | `apiKey`, `language?` |
| `AmazonSTT` | Amazon Transcribe | `accessKey`, `secretKey`, `region`, `language?` |
| `AssemblyAISTT` | AssemblyAI | `apiKey`, `language?` |
| `AresSTT` | Agora ARES | `language?` |
| `SarvamSTT` | Sarvam AI | `apiKey`, `language` |

<!-- snippet: executable -->
```typescript
import { DeepgramSTT } from 'agora-agent-server-sdk';

const stt = new DeepgramSTT({
  apiKey: 'your-deepgram-key',
  model: 'nova-2',
  language: 'en-US',
});
```

## MLLM vendors

MLLM (Multimodal LLM) vendors handle audio end-to-end — no separate STT or TTS step. Call `agent.withMllm(vendor)` and MLLM mode is enabled automatically; no separate `advancedFeatures` flag is needed.

| Class | Provider | Key constructor params |
|---|---|---|
| `OpenAIRealtime` | OpenAI Realtime API | `apiKey`, `model?`, `url?`, `greetingMessage?`, `failureMessage?`, `inputModalities?`, `outputModalities?`, `messages?`, `turnDetection?` |
| `GeminiLive` | Google Gemini Live API | `apiKey`, `model`, `url?`, `voice?`, `greetingMessage?`, `failureMessage?`, `inputModalities?`, `outputModalities?`, `messages?`, `turnDetection?` |
| `VertexAI` | Vertex AI Gemini Live | `model`, `url?`, `projectId`, `location`, `adcCredentialsString`, `voice?`, `greetingMessage?`, `failureMessage?`, `inputModalities?`, `outputModalities?`, `messages?`, `turnDetection?` |
| `XaiGrok` | xAI Grok (`mllm.vendor`: `xai`) | `apiKey`, `url?`, `voice?`, `language?`, `sampleRate?`, `greetingMessage?`, `failureMessage?`, `inputModalities?`, `outputModalities?`, `messages?`, `turnDetection?` |

> Future xAI **STT** and **TTS** vendors will be named `XaiSTT` and `XaiTTS` (cascading pipeline), not `XaiRealtime`. See workspace `docs/AGENTKIT-VENDOR-NAMING.md`.

<!-- snippet: executable -->
```typescript
import { OpenAIRealtime } from 'agora-agent-server-sdk';

const mllm = new OpenAIRealtime({
  apiKey: 'your-openai-key',
  model: 'gpt-4o-realtime-preview',
  greetingMessage: 'Hello! Ready to chat.',
});
```

See [MLLM Flow Guide](../guides/mllm-flow.md) for full examples.

## Avatar vendors

Avatars provide a visual representation for the agent. Several avatar vendors require a specific TTS sample rate — this is enforced at both compile time and runtime.

> Avatars currently require the cascading ASR + LLM + TTS pipeline. They are not supported with MLLM (`OpenAIRealtime`, `GeminiLive`, `VertexAI`, `XaiGrok`); combining the two throws at `Agent.toProperties()` and `AgentSession.start()`.

| Class | Provider | Required TTS sample rate |
|---|---|---|
| `LiveAvatarAvatar` | LiveAvatar (formerly HeyGen) | 24000 Hz |
| `HeyGenAvatar` | HeyGen (deprecated, use `LiveAvatarAvatar`) | 24000 Hz |
| `AkoolAvatar` | Akool | 16000 Hz |
| `AnamAvatar` | Anam | Provider-defined |
| `GenericAvatar` | Custom avatar provider | Provider-defined |

See [Avatar Integration](../guides/avatars.md) for full examples and the sample-rate constraint details.

For detailed constructor options for every vendor, see [Vendor Reference](../reference/vendors.md).
