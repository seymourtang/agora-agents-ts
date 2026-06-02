import { describe, expect, test } from "vitest";
import { Agent } from "../../../src/agentkit/Agent.js";
import { OpenAI } from "../../../src/agentkit/vendors/llm.js";
import { AmazonSTT, AssemblyAISTT, DeepgramSTT, GoogleSTT, OpenAISTT, SpeechmaticsSTT } from "../../../src/agentkit/vendors/stt.js";
import { ElevenLabsTTS } from "../../../src/agentkit/vendors/tts.js";

function baseAgent() {
    return new Agent()
        .withLlm(new OpenAI({ apiKey: "llm-key", model: "gpt-4o-mini", url: "https://api.openai.com/v1/chat/completions" }))
        .withTts(new ElevenLabsTTS({ key: "tts-key", voiceId: "voice", modelId: "eleven_flash_v2_5", baseUrl: "wss://api.elevenlabs.io/v1" }));
}

describe("STT language serialization", () => {
    test("sends matching BCP-47 STT language as asr.language and vendor param", () => {
        const properties = baseAgent()
            .withStt(new SpeechmaticsSTT({ apiKey: "stt-key", language: "en-US" }))
            .toProperties({
                channel: "channel",
                token: "token",
                agentUid: "1001",
                remoteUids: ["1002"],
            });

        expect(properties.asr).toMatchObject({
            vendor: "speechmatics",
            language: "en-US",
            params: {
                api_key: "stt-key",
                language: "en-US",
            },
        });
        expect(properties.turn_detection).toBeUndefined();
    });

    test("keeps bare Speechmatics language as a vendor param only", () => {
        const properties = baseAgent()
            .withStt(new SpeechmaticsSTT({ apiKey: "stt-key", language: "en" }))
            .toProperties({
                channel: "channel",
                token: "token",
                agentUid: "1001",
                remoteUids: ["1002"],
            });

        expect(properties.turn_detection).toBeUndefined();
        expect(properties.asr).toMatchObject({
            vendor: "speechmatics",
            language: "en-US",
            params: {
                api_key: "stt-key",
                language: "en",
            },
        });
    });

    test("uses explicit interaction language when it differs from provider language", () => {
        const properties = new Agent({ interactionLanguage: "en-US" })
            .withLlm(new OpenAI({ apiKey: "llm-key", model: "gpt-4o-mini", url: "https://api.openai.com/v1/chat/completions" }))
            .withTts(new ElevenLabsTTS({ key: "tts-key", voiceId: "voice", modelId: "eleven_flash_v2_5", baseUrl: "wss://api.elevenlabs.io/v1" }))
            .withStt(new SpeechmaticsSTT({ apiKey: "stt-key", language: "en" }))
            .toProperties({
                channel: "channel",
                token: "token",
                agentUid: "1001",
                remoteUids: ["1002"],
            });

        expect(properties.asr).toMatchObject({
            vendor: "speechmatics",
            language: "en-US",
            params: {
                language: "en",
            },
        });
        expect(properties.turn_detection).toBeUndefined();
    });

    test("rejects invalid explicit interaction language", () => {
        expect(() => new Agent({ interactionLanguage: "en" as never })).toThrow("Invalid interaction language: en");
        expect(() => baseAgent().withInteractionLanguage("xx-YY" as never)).toThrow("Invalid interaction language: xx-YY");
        expect(() => new SpeechmaticsSTT({ apiKey: "stt-key", language: "en", interactionLanguage: "xx-YY" as never }).toConfig()).toThrow(
            "Invalid interaction language: xx-YY",
        );
    });

    test("sends default interaction language when STT is omitted", () => {
        const properties = baseAgent().toProperties({
            channel: "channel",
            token: "token",
            agentUid: "1001",
            remoteUids: ["1002"],
        });

        expect(properties.asr).toEqual({ vendor: "ares", language: "en-US" });
    });

    test("serializes documented provider params without promoting provider language", () => {
        expect(new DeepgramSTT({ model: "nova-3", language: "en-US" }).toConfig().params).toMatchObject({
            model: "nova-3",
            language: "en-US",
        });

        expect(() => new DeepgramSTT({ model: "enhanced" } as never)).toThrow(
            "DeepgramSTT requires apiKey unless using a supported Agora-managed model",
        );

        expect(new DeepgramSTT({ apiKey: "dg-key", language: "en" }).toConfig().params).toMatchObject({
            key: "dg-key",
            language: "en",
        });

        expect(new OpenAISTT({ apiKey: "openai-key", model: "gpt-4o-mini-transcribe", language: "en" }).toConfig().params).toEqual({
            api_key: "openai-key",
            input_audio_transcription: {
                model: "gpt-4o-mini-transcribe",
                language: "en",
            },
        });

        expect(new OpenAISTT({ apiKey: "openai-key" }).toConfig().params).toEqual({
            api_key: "openai-key",
            input_audio_transcription: {
                model: "whisper-1",
            },
        });

        expect(
            new GoogleSTT({
                projectId: "project",
                location: "global",
                adcCredentialsString: "{}",
                language: "en-US",
                model: "long",
            }).toConfig().params,
        ).toMatchObject({
            project_id: "project",
            location: "global",
            adc_credentials_string: "{}",
            language: "en-US",
            model: "long",
        });

        expect(new AmazonSTT({ accessKey: "access", secretKey: "secret", region: "us-east-1", language: "en-US" }).toConfig().params).toMatchObject({
            access_key_id: "access",
            secret_access_key: "secret",
            region: "us-east-1",
            language_code: "en-US",
        });

        expect(new AssemblyAISTT({ apiKey: "assembly-key", language: "en-US", uri: "wss://example.test/ws" }).toConfig().params).toMatchObject({
            api_key: "assembly-key",
            language: "en-US",
            uri: "wss://example.test/ws",
        });
    });
});
