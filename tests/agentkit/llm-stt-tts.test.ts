import { describe, expect, test } from "vitest";

import { Anthropic, AzureOpenAI, Gemini, OpenAI } from "../../src/agentkit/vendors/llm";
import { OpenAIRealtime, VertexAI } from "../../src/agentkit/vendors/mllm";
import {
    AmazonSTT,
    AresSTT,
    AssemblyAISTT,
    DeepgramSTT,
    GoogleSTT,
    MicrosoftSTT,
    OpenAISTT,
    SarvamSTT,
    SpeechmaticsSTT,
} from "../../src/agentkit/vendors/stt";
import {
    AmazonTTS,
    CartesiaTTS,
    FishAudioTTS,
    GoogleTTS,
    HumeAITTS,
    MicrosoftTTS,
    MiniMaxTTS,
    MurfTTS,
    OpenAITTS,
    RimeTTS,
    SarvamTTS,
} from "../../src/agentkit/vendors/tts";

describe("llm vendor mappings", () => {
    test("OpenAI maps base and vendor-specific fields", () => {
        const config = new OpenAI({
            apiKey: "key",
            model: "gpt-4o-mini",
            temperature: 0.2,
            topP: 0.9,
            maxTokens: 50,
            greetingConfigs: { mode: "single_first" } as any,
            templateVariables: { name: "Ada" },
            vendor: "custom",
            mcpServers: [{ url: "https://example.com/mcp" } as any],
        }).toConfig();

        expect(config).toMatchObject({
            api_key: "key",
            style: "openai",
            vendor: "custom",
            input_modalities: ["text"],
            params: {
                model: "gpt-4o-mini",
                temperature: 0.2,
                top_p: 0.9,
                max_tokens: 50,
            },
            template_variables: { name: "Ada" },
        });
        expect((config as any).mcp_servers?.[0]?.transport).toBe("streamable_http");
    });

    test("LLM wrappers apply defaults when optional values are omitted", () => {
        expect(new OpenAI({ apiKey: "key", model: "gpt-4o-mini" }).toConfig()).toMatchObject({
            url: "https://api.openai.com/v1/chat/completions",
            input_modalities: ["text"],
        });
        expect(new OpenAI({ model: "gpt-5-mini" }).toConfig()).toMatchObject({
            url: "https://api.openai.com/v1/chat/completions",
            params: { model: "gpt-5-mini" },
        });
        expect(
            new OpenAI({
                apiKey: "key",
                model: "gpt-4o-mini",
                mcpServers: [{ url: "https://example.com/mcp", transport: "streamable_http" } as any],
            }).toConfig(),
        ).toMatchObject({
            mcp_servers: [{ url: "https://example.com/mcp", transport: "streamable_http" }],
        });
        expect(
            new AzureOpenAI({
                apiKey: "key",
                model: "gpt-4",
                resourceName: "resource",
                deploymentName: "deploy",
            }).toConfig().url,
        ).toContain("api-version=2024-08-01-preview");
        expect(new Anthropic({ apiKey: "key", model: "claude-3-5-sonnet" }).toConfig()).toMatchObject({
            input_modalities: ["text"],
        });
        expect(new Gemini({ apiKey: "key", model: "gemini-pro" }).toConfig()).toMatchObject({
            input_modalities: ["text"],
        });
    });

    test("Anthropic and Gemini include temperature and topP when set", () => {
        expect(
            new Anthropic({ apiKey: "key", model: "claude-3-5-sonnet", temperature: 0.5, topP: 0.8 }).toConfig(),
        ).toMatchObject({ params: { temperature: 0.5, top_p: 0.8 } });
        expect(
            new Gemini({ apiKey: "key", model: "gemini-pro", temperature: 0.4, topP: 0.7 }).toConfig(),
        ).toMatchObject({ params: { temperature: 0.4, top_p: 0.7 } });
    });

    test("AzureOpenAI, Anthropic, and Gemini produce expected config shapes", () => {
        expect(
            new AzureOpenAI({
                apiKey: "key",
                model: "gpt-4",
                resourceName: "resource",
                deploymentName: "deploy",
            }).toConfig(),
        ).toMatchObject({
            api_key: "key",
            style: "openai",
            vendor: "azure",
        });

        expect(
            new Anthropic({
                apiKey: "key",
                model: "claude-3-5-sonnet",
                maxTokens: 100,
            }).toConfig(),
        ).toMatchObject({
            api_key: "key",
            style: "anthropic",
            params: { model: "claude-3-5-sonnet", max_tokens: 100 },
        });

        expect(
            new Gemini({
                apiKey: "key",
                model: "gemini-pro",
                topK: 4,
                maxOutputTokens: 256,
            }).toConfig(),
        ).toMatchObject({
            api_key: "key",
            style: "gemini",
            params: { model: "gemini-pro", top_k: 4, max_output_tokens: 256 },
        });
    });
});

describe("mllm vendor mappings", () => {
    test("OpenAIRealtime and VertexAI map config correctly", () => {
        expect(
            new OpenAIRealtime({
                apiKey: "key",
                model: "gpt-4o-realtime-preview",
                messages: [{ role: "system", content: "hi" }],
            }).toConfig(),
        ).toMatchObject({
            vendor: "openai",
            style: "openai",
            api_key: "key",
            params: {
                model: "gpt-4o-realtime-preview",
            },
            messages: [{ role: "system", content: "hi" }],
        });

        expect(
            new VertexAI({
                model: "gemini-live",
                projectId: "project",
                location: "us-central1",
                adcCredentialsString: "adc-json",
                instructions: "Be helpful",
            }).toConfig(),
        ).toMatchObject({
            vendor: "vertexai",
            style: "openai",
            params: {
                model: "gemini-live",
                project_id: "project",
                location: "us-central1",
                adc_credentials_string: "adc-json",
                instructions: "Be helpful",
            },
        });
    });

    test("OpenAIRealtime and VertexAI include optional fields when set", () => {
        const realtimeConfig = new OpenAIRealtime({
            apiKey: "key",
            inputModalities: ["audio"],
            predefinedTools: ["_publish_message"],
            failureMessage: "Retry",
            maxHistory: 3,
        }).toConfig();
        expect(realtimeConfig).toMatchObject({
            input_modalities: ["audio"],
            predefined_tools: ["_publish_message"],
            failure_message: "Retry",
            max_history: 3,
        });

        const vertexConfig = new VertexAI({
            model: "gemini-live",
            url: "wss://vertex.example.com/realtime",
            projectId: "project",
            location: "us-central1",
            adcCredentialsString: "adc",
            greetingMessage: "Hi",
            inputModalities: ["audio"],
            outputModalities: ["text"],
            predefinedTools: ["_publish_message"],
            failureMessage: "Try again",
            maxHistory: 5,
        }).toConfig();
        expect(vertexConfig).toMatchObject({
            url: "wss://vertex.example.com/realtime",
            greeting_message: "Hi",
            input_modalities: ["audio"],
            output_modalities: ["text"],
            predefined_tools: ["_publish_message"],
            failure_message: "Try again",
            max_history: 5,
        });
    });

    test("MLLM wrappers handle optional branches when values are omitted", () => {
        expect(new OpenAIRealtime({ apiKey: "key" }).toConfig()).toMatchObject({
            vendor: "openai",
            style: "openai",
            api_key: "key",
        });
        expect(new OpenAIRealtime({ apiKey: "key" }).toConfig()).not.toHaveProperty("params");

        expect(
            new VertexAI({
                model: "gemini-live",
                projectId: "project",
                location: "us-central1",
                adcCredentialsString: "adc-json",
            }).toConfig(),
        ).not.toHaveProperty("greeting_message");
    });
});

describe("stt vendor mappings", () => {
    test("DeepgramSTT includes smartFormat and punctuation when set", () => {
        const config = new DeepgramSTT({ model: "nova-3", smartFormat: true, punctuation: false }).toConfig();
        expect(config.params).toMatchObject({ smart_format: true, punctuation: false });
    });

    test("all STT wrappers map options to generated config shape", () => {
        expect(
            new SpeechmaticsSTT({
                apiKey: "key",
                language: "en",
                model: "enhanced",
                additionalParams: { diarization: true },
            }).toConfig(),
        ).toMatchObject({
            vendor: "speechmatics",
            language: "en",
            params: { api_key: "key", language: "en", model: "enhanced", diarization: true },
        });

        expect(new DeepgramSTT({ model: "nova-2" }).toConfig()).toEqual({
            vendor: "deepgram",
            language: undefined,
            params: { model: "nova-2" },
        });
        expect(new DeepgramSTT().toConfig()).toEqual({ vendor: "deepgram", language: undefined, params: {} });
        expect(
            new MicrosoftSTT({
                key: "key",
                region: "eastus",
                language: "en-US",
                additionalParams: { format: "detailed" },
            }).toConfig(),
        ).toMatchObject({
            vendor: "microsoft",
            language: "en-US",
            params: { key: "key", region: "eastus", language: "en-US", format: "detailed" },
        });
        expect(new OpenAISTT({ apiKey: "key", model: "whisper-1", language: "en" }).toConfig()).toMatchObject({
            vendor: "openai",
            language: "en",
            params: { api_key: "key", model: "whisper-1" },
        });
        expect(new GoogleSTT({ apiKey: "key", language: "en-US" }).toConfig()).toMatchObject({
            vendor: "google",
            language: "en-US",
            params: { api_key: "key", language: "en-US" },
        });
        expect(
            new AmazonSTT({ accessKey: "ak", secretKey: "sk", region: "us-east-1", language: "en" }).toConfig(),
        ).toMatchObject({
            vendor: "amazon",
            language: "en",
            params: { access_key: "ak", secret_key: "sk", region: "us-east-1", language: "en" },
        });
        expect(new AssemblyAISTT({ apiKey: "key", language: "en" }).toConfig()).toMatchObject({
            vendor: "assemblyai",
            language: "en",
            params: { api_key: "key" },
        });
        expect(new AresSTT().toConfig()).toEqual({ vendor: "ares" });
        expect(new AresSTT({ language: "en", additionalParams: { domain: "general" } }).toConfig()).toEqual({
            vendor: "ares",
            language: "en",
            params: { domain: "general" },
        });
        expect(new SarvamSTT({ apiKey: "key", language: "en", model: "base" }).toConfig()).toMatchObject({
            vendor: "sarvam",
            language: "en",
            params: { api_key: "key", language: "en", model: "base" },
        });
    });
});

describe("tts vendor mappings", () => {
    test("all TTS wrappers map options to generated config shape", () => {
        expect(
            new MicrosoftTTS({
                key: "key",
                region: "eastus",
                voiceName: "Jenny",
                sampleRate: 24000,
                skipPatterns: [1, 2],
            }).toConfig(),
        ).toMatchObject({
            vendor: "microsoft",
            params: { key: "key", region: "eastus", voice_name: "Jenny", sample_rate: 24000 },
            skip_patterns: [1, 2],
        });

        expect(
            new OpenAITTS({
                apiKey: "key",
                voice: "alloy",
                model: "tts-1",
                responseFormat: "pcm",
                speed: 1.1,
            }).toConfig(),
        ).toMatchObject({
            vendor: "openai",
            params: { api_key: "key", voice: "alloy", model: "tts-1", response_format: "pcm", speed: 1.1 },
        });
        expect(new OpenAITTS({ voice: "alloy" }).toConfig()).toMatchObject({
            vendor: "openai",
            params: { voice: "alloy" },
        });
        expect(
            new CartesiaTTS({ apiKey: "key", voiceId: "voice", modelId: "sonic", sampleRate: 24000 }).toConfig(),
        ).toMatchObject({
            vendor: "cartesia",
            params: { api_key: "key", model_id: "sonic", sample_rate: 24000 },
        });
        expect(
            new GoogleTTS({ key: "key", voiceName: "Wavenet", languageCode: "en-US", sampleRate: 24000 }).toConfig(),
        ).toMatchObject({
            vendor: "google",
            params: { key: "key", voice_name: "Wavenet", language_code: "en-US", sample_rate_hertz: 24000 },
        });
        expect(
            new AmazonTTS({ accessKey: "ak", secretKey: "sk", region: "us-east-1", voiceId: "Joanna" }).toConfig(),
        ).toMatchObject({
            vendor: "amazon",
            params: { access_key: "ak", secret_key: "sk", region: "us-east-1", voice_id: "Joanna" },
        });
        expect(new HumeAITTS({ key: "key", configId: "cfg" }).toConfig()).toMatchObject({
            vendor: "humeai",
            params: { key: "key", config_id: "cfg" },
        });
        expect(
            new RimeTTS({
                key: "key",
                speaker: "speaker",
                modelId: "model",
                lang: "en",
                samplingRate: 24000,
                speedAlpha: 1.2,
            }).toConfig(),
        ).toMatchObject({
            vendor: "rime",
            params: {
                key: "key",
                speaker: "speaker",
                model_id: "model",
                lang: "en",
                samplingRate: 24000,
                speedAlpha: 1.2,
            },
        });
        expect(new FishAudioTTS({ key: "key", referenceId: "ref" }).toConfig()).toMatchObject({
            vendor: "fishaudio",
            params: { key: "key", reference_id: "ref" },
        });
        expect(
            new MiniMaxTTS({
                key: "key",
                groupId: "group",
                model: "speech-02-turbo",
                voiceId: "voice",
                url: "wss://example.com",
            }).toConfig(),
        ).toMatchObject({
            vendor: "minimax",
            params: { key: "key", group_id: "group", model: "speech-02-turbo", url: "wss://example.com" },
        });
        expect(
            new MiniMaxTTS({
                groupId: "group",
                model: "speech-2.6-turbo",
                voiceId: "voice",
                url: "wss://example.com",
            }).toConfig(),
        ).toMatchObject({
            vendor: "minimax",
            params: { group_id: "group", model: "speech-2.6-turbo", url: "wss://example.com" },
        });
        expect(new MiniMaxTTS({ model: "speech-2.8-turbo" }).toConfig()).toMatchObject({
            vendor: "minimax",
            params: { model: "speech-2.8-turbo" },
        });
        expect(new SarvamTTS({ key: "key", speaker: "anushka", targetLanguageCode: "en-IN" }).toConfig()).toMatchObject(
            {
                vendor: "sarvam",
                params: { key: "key", speaker: "anushka", target_language_code: "en-IN" },
            },
        );
        expect(new MurfTTS({ key: "key", voiceId: "Ariana", style: "Conversational" }).toConfig()).toMatchObject({
            vendor: "murf",
            params: { key: "key", voice_id: "Ariana", style: "Conversational" },
        });
    });

    test("TTS vendors include skipPatterns when provided", () => {
        expect(new FishAudioTTS({ key: "key", referenceId: "ref", skipPatterns: [1] }).toConfig()).toMatchObject({
            skip_patterns: [1],
        });
        expect(
            new MiniMaxTTS({
                key: "key",
                groupId: "g",
                model: "m",
                voiceId: "v",
                url: "wss://x",
                skipPatterns: [2],
            }).toConfig(),
        ).toMatchObject({ skip_patterns: [2] });
        expect(
            new SarvamTTS({ key: "key", speaker: "s", targetLanguageCode: "en-IN", skipPatterns: [3] }).toConfig(),
        ).toMatchObject({ skip_patterns: [3] });
        expect(new MurfTTS({ key: "key", voiceId: "Ariana", skipPatterns: [4] }).toConfig()).toMatchObject({
            skip_patterns: [4],
        });
    });

    test("TTS wrappers omit optional fields when not provided", () => {
        expect(new CartesiaTTS({ apiKey: "key", voiceId: "voice" }).toConfig()).toMatchObject({
            vendor: "cartesia",
            params: { api_key: "key", voice: { mode: "id", id: "voice" } },
        });
        expect(new GoogleTTS({ key: "key", voiceName: "WaveNet" }).toConfig()).toMatchObject({
            vendor: "google",
            params: { key: "key", voice_name: "WaveNet" },
        });
        expect(new HumeAITTS({ key: "key" }).toConfig()).toEqual({
            vendor: "humeai",
            params: { key: "key" },
        });
        expect(new RimeTTS({ key: "key", speaker: "speaker" }).toConfig()).toEqual({
            vendor: "rime",
            params: { key: "key", speaker: "speaker" },
        });
        expect(
            new SarvamTTS({ key: "key", speaker: "anushka", targetLanguageCode: "en-IN" }).toConfig(),
        ).not.toHaveProperty("skip_patterns");
        expect(new MurfTTS({ key: "key", voiceId: "Ariana" }).toConfig()).toEqual({
            vendor: "murf",
            params: { key: "key", voice_id: "Ariana" },
        });
    });
});
