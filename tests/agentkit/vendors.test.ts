import { describe, expect, test } from "vitest";

import { Agent } from "../../src/agentkit/Agent";
import {
    validateAvatarConfig,
    validateTtsSampleRate,
    isAnamAvatar,
    isAkoolAvatar,
    isHeyGenAvatar,
    isLiveAvatarAvatar,
    toBaseAvatarConfig,
} from "../../src/agentkit/avatar-types";
import { AkoolAvatar, AnamAvatar, HeyGenAvatar, LiveAvatarAvatar } from "../../src/agentkit/vendors/avatar";
import { GeminiLive, VertexAI } from "../../src/agentkit/vendors/mllm";
import { ElevenLabsTTS } from "../../src/agentkit/vendors/tts";

describe("AgentKit vendor wrappers", () => {
    test("GeminiLive maps options to the generated MLLM config shape", () => {
        const config = new GeminiLive({
            apiKey: "google-key",
            model: "gemini-live-2.5-flash",
            url: "wss://generativelanguage.googleapis.com/ws",
            instructions: "Be concise.",
            voice: "Aoede",
            greetingMessage: "Hello from Gemini",
            inputModalities: ["audio"],
            outputModalities: ["text", "audio"],
            messages: [{ role: "system", content: "short memory" }],
            predefinedTools: ["_publish_message"],
            failureMessage: "Please try again.",
            maxHistory: 8,
            additionalParams: { temperature: 0.2 },
        }).toConfig();

        expect(config).toEqual({
            vendor: "gemini",
            style: "openai",
            api_key: "google-key",
            url: "wss://generativelanguage.googleapis.com/ws",
            params: {
                temperature: 0.2,
                model: "gemini-live-2.5-flash",
                instructions: "Be concise.",
                voice: "Aoede",
                messages: [{ role: "system", content: "short memory" }],
            },
            greeting_message: "Hello from Gemini",
            input_modalities: ["audio"],
            output_modalities: ["text", "audio"],
            predefined_tools: ["_publish_message"],
            failure_message: "Please try again.",
            max_history: 8,
        });
    });

    test("VertexAI forwards url into the generated MLLM config", () => {
        const config = new VertexAI({
            model: "gemini-live",
            url: "wss://vertex.example.com/realtime",
            projectId: "project",
            location: "us-central1",
            adcCredentialsString: "adc-json",
        }).toConfig();

        expect(config).toMatchObject({
            vendor: "vertexai",
            style: "openai",
            url: "wss://vertex.example.com/realtime",
            params: {
                model: "gemini-live",
                project_id: "project",
                location: "us-central1",
                adc_credentials_string: "adc-json",
            },
        });
    });

    test("LiveAvatarAvatar emits liveavatar config and passes validation", () => {
        const avatar = new LiveAvatarAvatar({
            apiKey: "liveavatar-key",
            quality: "high",
            agoraUid: "12345",
            avatarId: "avatar-1",
        });

        const config = avatar.toConfig();

        expect(isLiveAvatarAvatar(config as any)).toBe(true);
        expect(config.vendor).toBe("liveavatar");
        expect(config.params).toMatchObject({
            api_key: "liveavatar-key",
            quality: "high",
            agora_uid: "12345",
            avatar_id: "avatar-1",
        });
        expect(() => validateAvatarConfig(config as any)).not.toThrow();
        expect(() => validateTtsSampleRate(config as any, 24000)).not.toThrow();
        expect(() => validateTtsSampleRate(config as any, 16000)).toThrow(/24,000 Hz/);
    });

    test("HeyGen and Akool constructors and validators cover failure branches", () => {
        expect(() => new HeyGenAvatar({ apiKey: "", quality: "high", agoraUid: "1" })).toThrow(/apiKey/);
        expect(() => new HeyGenAvatar({ apiKey: "key", quality: "high", agoraUid: "" })).toThrow(/agoraUid/);
        expect(() => new AkoolAvatar({ apiKey: "" })).toThrow(/apiKey/);
        expect(() => new LiveAvatarAvatar({ apiKey: "", quality: "high", agoraUid: "1" })).toThrow(/apiKey/);
        expect(() => new LiveAvatarAvatar({ apiKey: "key", quality: "high", agoraUid: "" })).toThrow(/agoraUid/);
        expect(() => new AnamAvatar({ apiKey: "" })).toThrow(/apiKey/);

        const heygen = new HeyGenAvatar({
            apiKey: "heygen-key",
            quality: "medium",
            agoraUid: "42",
            agoraToken: "rtc-token",
            avatarId: "avatar-42",
            disableIdleTimeout: true,
            activityIdleTimeout: 5,
        }).toConfig();
        expect(isHeyGenAvatar(heygen as any)).toBe(true);
        expect(heygen).toMatchObject({
            enable: true,
            vendor: "heygen",
            params: {
                api_key: "heygen-key",
                quality: "medium",
                agora_uid: "42",
                agora_token: "rtc-token",
                avatar_id: "avatar-42",
                disable_idle_timeout: true,
                activity_idle_timeout: 5,
            },
        });

        const akool = new AkoolAvatar({ apiKey: "akool-key", avatarId: "avatar-1" }).toConfig();
        expect(isAkoolAvatar(akool as any)).toBe(true);
        expect(() => validateTtsSampleRate(akool as any, 24000)).toThrow(/16,000 Hz/);
        expect(() => validateTtsSampleRate(akool as any, 16000)).not.toThrow();
        expect(toBaseAvatarConfig(akool as any)).toBe(akool);
    });

    test("AnamAvatar emits anam config and can be attached to an agent", () => {
        const avatar = new AnamAvatar({
            apiKey: "anam-key",
            personaId: "persona-1",
        });
        const config = avatar.toConfig();

        expect(isAnamAvatar(config as any)).toBe(true);
        expect(config).toEqual({
            enable: true,
            vendor: "anam",
            params: {
                api_key: "anam-key",
                persona_id: "persona-1",
            },
        });
        expect(() => validateAvatarConfig(config as any)).not.toThrow();

        const agent = new Agent({ name: "anam-agent" })
            .withTts(
                new ElevenLabsTTS({
                    key: "elevenlabs-key",
                    modelId: "eleven_flash_v2_5",
                    voiceId: "voice-id",
                    sampleRate: 24000,
                }),
            )
            .withAvatar(avatar);

        expect(agent.avatar?.vendor).toBe("anam");
    });

    test("HeyGen avatar sample rate validation throws with HeyGen label", () => {
        const heygen = new HeyGenAvatar({ apiKey: "key", quality: "high", agoraUid: "1" }).toConfig();
        expect(() => validateTtsSampleRate(heygen as any, 16000)).toThrow(/HeyGen/);
        expect(() => validateTtsSampleRate(heygen as any, 24000)).not.toThrow();
    });

    test("LiveAvatarAvatar optional params are included when provided", () => {
        const config = new LiveAvatarAvatar({
            apiKey: "la-key",
            quality: "high",
            agoraUid: "42",
            agoraToken: "rtc-token",
            disableIdleTimeout: true,
            activityIdleTimeout: 10,
        }).toConfig();

        expect(config.params).toMatchObject({
            agora_token: "rtc-token",
            disable_idle_timeout: true,
            activity_idle_timeout: 10,
        });
    });

    test("avatar type helpers and validation errors cover generic and invalid branches", () => {
        const generic = { vendor: "custom", params: { foo: "bar" } } as any;
        expect(isHeyGenAvatar(generic)).toBe(false);
        expect(isLiveAvatarAvatar(generic)).toBe(false);
        expect(isAkoolAvatar(generic)).toBe(false);
        expect(isAnamAvatar(generic)).toBe(false);
        expect(() => validateAvatarConfig(generic)).not.toThrow();
        expect(() => validateTtsSampleRate(generic, 12345)).not.toThrow();

        expect(() =>
            validateAvatarConfig({
                vendor: "heygen",
                params: { api_key: "", quality: "high", agora_uid: "1" },
            } as any),
        ).toThrow(/requires api_key/);
        expect(() =>
            validateAvatarConfig({
                vendor: "liveavatar",
                params: { api_key: "key", agora_uid: "1" },
            } as any),
        ).toThrow(/requires quality/);
        expect(() =>
            validateAvatarConfig({
                vendor: "liveavatar",
                params: { api_key: "key", quality: "ultra", agora_uid: "1" },
            } as any),
        ).toThrow(/Invalid quality/);
        expect(() =>
            validateAvatarConfig({
                vendor: "liveavatar",
                params: { api_key: "key", quality: "high" },
            } as any),
        ).toThrow(/requires agora_uid/);
        expect(() =>
            validateAvatarConfig({
                vendor: "akool",
                params: { api_key: "" },
            } as any),
        ).toThrow(/Akool avatar requires api_key/);
        expect(() =>
            validateAvatarConfig({
                vendor: "anam",
                params: { api_key: "" },
            } as any),
        ).toThrow(/Anam avatar requires api_key/);
    });
});
