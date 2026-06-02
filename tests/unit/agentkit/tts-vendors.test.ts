import { describe, expect, test } from "vitest";
import {
    AmazonTTS,
    CartesiaTTS,
    ElevenLabsTTS,
    FishAudioTTS,
    GoogleTTS,
    HumeAITTS,
    MiniMaxTTS,
    MurfTTS,
    OpenAITTS,
    RimeTTS,
    SarvamTTS,
} from "../../../src/agentkit/vendors/tts.js";

describe("TTS vendor helpers", () => {
    test("serializes provider params using the generated core shapes", () => {
        expect(new AmazonTTS({ accessKey: "access", secretKey: "secret", region: "us-east-1", voiceId: "Joanna", engine: "neural" }).toConfig().params).toMatchObject({
            aws_access_key_id: "access",
            aws_secret_access_key: "secret",
            region_name: "us-east-1",
            voice: "Joanna",
            engine: "neural",
        });

        expect(new GoogleTTS({ key: "{}", voiceName: "en-US-JennyNeural", languageCode: "en-US", sampleRate: 24000 }).toConfig().params).toMatchObject({
            credentials: "{}",
            VoiceSelectionParams: { name: "en-US-JennyNeural", language_code: "en-US" },
            AudioConfig: { sample_rate_hertz: 24000 },
        });

        expect(new CartesiaTTS({ apiKey: "cartesia-key", voiceId: "voice", modelId: "sonic-2", sampleRate: 24000 }).toConfig().params).toMatchObject({
            api_key: "cartesia-key",
            model_id: "sonic-2",
            voice: { mode: "id", id: "voice" },
            output_format: { container: "raw", sample_rate: 24000 },
        });

        expect(new RimeTTS({ key: "rime-key", speaker: "speaker", modelId: "mist" }).toConfig().params).toMatchObject({
            api_key: "rime-key",
            speaker: "speaker",
            modelId: "mist",
        });

        expect(new FishAudioTTS({ key: "fish-key", referenceId: "ref", backend: "speech-1.5" }).toConfig().params).toMatchObject({
            api_key: "fish-key",
            reference_id: "ref",
            backend: "speech-1.5",
        });

        expect(new ElevenLabsTTS({ key: "eleven-key", modelId: "eleven_flash_v2_5", voiceId: "voice", baseUrl: "wss://api.elevenlabs.io/v1" }).toConfig().params).toMatchObject({
            key: "eleven-key",
            base_url: "wss://api.elevenlabs.io/v1",
            model_id: "eleven_flash_v2_5",
            voice_id: "voice",
        });

        expect(new OpenAITTS({ apiKey: "openai-key", voice: "coral", model: "gpt-4o-mini-tts", baseUrl: "https://api.openai.com/v1" }).toConfig().params).toMatchObject({
            api_key: "openai-key",
            base_url: "https://api.openai.com/v1",
            model: "gpt-4o-mini-tts",
            voice: "coral",
        });

        expect(new OpenAITTS({ voice: "coral" }).toConfig().params).toEqual({
            voice: "coral",
        });

        expect(new HumeAITTS({ key: "hume-key", voiceId: "voice", provider: "CUSTOM_VOICE" }).toConfig().params).toMatchObject({
            key: "hume-key",
            voice_id: "voice",
            provider: "CUSTOM_VOICE",
        });

        expect(new MiniMaxTTS({ key: "minimax-key", groupId: "group", model: "speech-02-turbo", voiceId: "voice", url: "wss://api-uw.minimax.io/ws/v1/t2a_v2" }).toConfig().params).toMatchObject({
            key: "minimax-key",
            group_id: "group",
            model: "speech-02-turbo",
            voice_setting: { voice_id: "voice" },
            url: "wss://api-uw.minimax.io/ws/v1/t2a_v2",
        });

        expect(new SarvamTTS({ key: "sarvam-key", speaker: "anushka", targetLanguageCode: "en-IN", sampleRate: 24000 }).toConfig().params).toMatchObject({
            api_subscription_key: "sarvam-key",
            speaker: "anushka",
            target_language_code: "en-IN",
            sample_rate: 24000,
        });

        expect(
            new MurfTTS({
                key: "murf-key",
                voiceId: "Ariana",
                baseUrl: "wss://murf.example/ws",
                locale: "en-US",
                rate: 0,
                pitch: 0,
                model: "FALCON",
                sampleRate: 24000,
            }).toConfig().params
        ).toMatchObject({
            api_key: "murf-key",
            base_url: "wss://murf.example/ws",
            voiceId: "Ariana",
            locale: "en-US",
            rate: 0,
            pitch: 0,
            model: "FALCON",
            sample_rate: 24000,
        });

        expect(new MurfTTS({ key: "murf-key" }).toConfig().params).toEqual({
            api_key: "murf-key",
        });
    });
});
