import { describe, expect, test, vi } from "vitest";
import { GeminiLive, VertexAI } from "../../src/agentkit/vendors/mllm";
import type { InterruptionConfig } from "../../src/index";
import {
    Agent,
    AkoolAvatar,
    AnamAvatar,
    AresSTT,
    AudioScenario,
    DeepgramSTT,
    DeepgramTTS,
    ElevenLabsTTS,
    GenericAvatar,
    generateAvatarRtcToken,
    isAvatarTokenManaged,
    isGenericAvatar,
    LiveAvatarAvatar,
    MiniMaxTTS,
    OpenAI,
    OpenAIRealtime,
    OpenAITTS,
    validateAvatarConfig,
    XaiGrok,
} from "../../src/index";

const APP_ID = "0123456789abcdef0123456789abcdef";
const APP_CERTIFICATE = "fedcba9876543210fedcba9876543210";

type StartRequest = {
    preset?: string;
    properties: Record<string, unknown>;
};

type MockClient = Parameters<Agent["createSession"]>[0] & {
    agents: {
        start: ReturnType<typeof vi.fn>;
        getTurns: ReturnType<typeof vi.fn>;
    };
    agentManagement: {
        agentThink: ReturnType<typeof vi.fn>;
    };
};

function asRecord(value: unknown): Record<string, unknown> {
    return (value ?? {}) as Record<string, unknown>;
}

function requireRequest(request: StartRequest | undefined): StartRequest {
    if (!request) {
        throw new Error("Expected start request to be captured");
    }
    return request;
}

function createClient(overrides: Record<string, unknown> = {}): MockClient {
    return {
        appId: APP_ID,
        appCertificate: APP_CERTIFICATE,
        agents: {
            start: vi.fn(async () => ({ agent_id: "agent_123", status: "RUNNING" })),
            getTurns: vi.fn(),
        },
        agentManagement: {
            agentThink: vi.fn(async () => ({ ok: true })),
        },
        ...overrides,
    } as unknown as MockClient;
}

describe("AgentKit parity", () => {
    test("builder forwards RTM defaults, tools, interruption, audio scenario, and pause state config", () => {
        const enableRtm = true;
        const interruption = {
            enable: false,
            disabled_config: { strategy: "ignore" },
        } satisfies InterruptionConfig;

        const props = new Agent({
            advancedFeatures: { enable_rtm: enableRtm },
            turnDetection: {
                mode: "default",
                config: {
                    end_of_speech: {
                        mode: "semantic",
                        semantic_config: { pause_state_enabled: true, max_wait_ms: 3000 },
                    },
                },
            },
        })
            .withTools(true)
            .withInterruption(interruption)
            .withAudioScenario(AudioScenario.Aiserver)
            .toProperties({
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
                skipVendorValidation: true,
            });

        expect(props.parameters?.data_channel).toBe("rtm");
        expect(props.parameters?.audio_scenario).toBe("aiserver");
        expect(props.advanced_features?.enable_tools).toBe(true);
        expect(props.interruption).toEqual(interruption);
        expect(props.turn_detection?.config?.end_of_speech?.semantic_config?.pause_state_enabled).toBe(true);
    });

    test("withMllm enables MLLM and removes deprecated advanced_features.enable_mllm", () => {
        const props = new Agent({
            advancedFeatures: { enable_mllm: true, enable_rtm: true },
            greeting: "hello from agent",
            failureMessage: "try again",
            maxHistory: 5,
        })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .toProperties({
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });

        expect(props.mllm?.enable).toBe(true);
        expect(props.mllm?.greeting_message).toBe("hello from agent");
        expect(props.mllm?.failure_message).toBe("try again");
        expect("max_history" in asRecord(props.mllm)).toBe(false);
        expect(props.advanced_features?.enable_mllm).toBeUndefined();
        expect(props.advanced_features?.enable_rtm).toBe(true);
    });

    test("preset inference strips provider-owned fields but preserves BYOK fields", async () => {
        const client = createClient();
        let request: StartRequest | undefined;
        client.agents.start = vi.fn(async (body: StartRequest) => {
            request = body;
            return { agent_id: "agent_123", status: "RUNNING" };
        });

        const agent = new Agent({ name: "managed-agent" })
            .withStt(new DeepgramSTT({ model: "nova-3" }))
            .withLlm(new OpenAI({ model: "gpt-5-mini" }))
            .withTts(new MiniMaxTTS({ model: "speech_2_6_turbo", voiceId: "English_captivating_female1" }));

        await agent
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            })
            .start();

        const started = requireRequest(request);
        const startedProps = asRecord(started.properties);
        const startedAsrParams = asRecord(asRecord(startedProps.asr).params);
        const startedLlm = asRecord(startedProps.llm);
        const startedLlmParams = asRecord(startedLlm.params);
        const startedTtsParams = asRecord(asRecord(startedProps.tts).params);
        expect(started.preset).toBe("deepgram_nova_3,openai_gpt_5_mini,minimax_speech_2_6_turbo");
        expect(startedAsrParams.api_key).toBeUndefined();
        expect(startedAsrParams.model).toBeUndefined();
        expect(startedLlm.api_key).toBeUndefined();
        expect(startedLlmParams.model).toBeUndefined();
        expect(startedTtsParams.key).toBeUndefined();
        expect(startedTtsParams.group_id).toBeUndefined();
        expect(startedTtsParams.model).toBeUndefined();

        const byokProps = new Agent()
            .withStt(new DeepgramSTT({ apiKey: "deepgram-key", model: "nova-3" }))
            .withLlm(new OpenAI({ apiKey: "openai-key", model: "gpt-5-mini", headers: { "X-Trace-Id": "trace" } }))
            .withTts(new MiniMaxTTS({ key: "minimax-key", groupId: "group", model: "speech_2_6_turbo", voiceId: "v" }))
            .toProperties({ channel: "room", token: "rtc-token", agentUid: "1", remoteUids: ["100"] });

        expect(byokProps.asr?.params?.api_key).toBe("deepgram-key");
        expect(byokProps.llm?.api_key).toBe("openai-key");
        expect(byokProps.llm?.headers).toEqual({ "X-Trace-Id": "trace" });
        expect(byokProps.tts?.params?.key).toBe("minimax-key");
    });

    test("vendor config shapes match v2.7 contracts", () => {
        expect(new AresSTT({ language: "en-US", additionalParams: { sample_rate: 16000 } }).toConfig()).toEqual({
            vendor: "ares",
            language: "en-US",
            params: { sample_rate: 16000 },
        });

        expect(
            new DeepgramTTS({
                apiKey: "deepgram-key",
                model: "aura-2-thalia-en",
                baseUrl: "wss://api.deepgram.com/v1/speak",
                sampleRate: 24000,
                params: { encoding: "linear16" },
            }).toConfig(),
        ).toEqual({
            vendor: "deepgram",
            params: {
                api_key: "deepgram-key",
                model: "aura-2-thalia-en",
                base_url: "wss://api.deepgram.com/v1/speak",
                sample_rate: 24000,
                encoding: "linear16",
            },
        });
    });

    test("MLLM vendors emit v2.7 fields and no removed style field", () => {
        const xai = new XaiGrok({
            apiKey: "xai-key",
            voice: "eve",
            language: "en",
            sampleRate: 24000,
            greetingMessage: "Hello",
            turnDetection: { mode: "server_vad", server_vad_config: { threshold: 0.5 } },
        }).toConfig();
        const xaiParams = asRecord(xai.params);

        expect(xai.vendor).toBe("xai");
        expect(xai.api_key).toBe("xai-key");
        expect(xai.url).toBe("wss://api.x.ai/v1/realtime");
        expect(xaiParams).toMatchObject({ voice: "eve", language: "en", sample_rate: 24000 });
        expect("style" in xai).toBe(false);

        const gemini = new GeminiLive({
            apiKey: "google-key",
            model: "gemini-live-2.5-flash",
            messages: [{ role: "system", content: "be concise" }],
        }).toConfig();
        const geminiParams = asRecord(gemini.params);
        expect(gemini.messages).toEqual([{ role: "system", content: "be concise" }]);
        expect(geminiParams.messages).toBeUndefined();

        const vertex = new VertexAI({
            model: "gemini-live",
            projectId: "project",
            location: "us-central1",
            adcCredentialsString: "{}",
            failureMessage: "Try again",
        }).toConfig();
        expect(vertex.failure_message).toBe("Try again");
        expect("style" in vertex).toBe(false);
        expect("max_history" in vertex).toBe(false);
        expect("predefined_tools" in vertex).toBe(false);
    });

    test("generic avatar config and session enrichment fill app id, channel, and token", async () => {
        const client = createClient();
        let request: StartRequest | undefined;
        client.agents.start = vi.fn(async (body: StartRequest) => {
            request = body;
            return { agent_id: "agent_123", status: "RUNNING" };
        });

        const avatar = new GenericAvatar({
            apiKey: "avatar-key",
            apiBaseUrl: "https://avatar.example.com",
            avatarId: "avatar-id",
            agoraUid: "200",
        });

        const config = avatar.toConfig();
        const configParams = asRecord(config.params);
        expect(configParams.agora_appid).toBeUndefined();
        expect(configParams.agora_channel).toBeUndefined();
        expect(configParams.agora_token).toBeUndefined();
        expect(isGenericAvatar(config as unknown as Parameters<typeof isGenericAvatar>[0])).toBe(true);
        expect(() => validateAvatarConfig(config as Parameters<typeof validateAvatarConfig>[0])).not.toThrow();

        const agentToken = "prebuilt-agent-token";
        await new Agent({ name: "avatar-agent" })
            .withStt(new AresSTT())
            .withLlm(new OpenAI({ apiKey: "openai-key", model: "gpt-4o-mini" }))
            .withTts(new OpenAITTS({ apiKey: "openai-tts-key", model: "tts-1", voice: "alloy" }))
            .withAvatar(avatar)
            .createSession(client, {
                channel: "room",
                token: agentToken,
                agentUid: "1",
                remoteUids: ["100"],
            })
            .start();

        const started = requireRequest(request);
        const avatarConfig = asRecord(started.properties.avatar);
        const params = asRecord(avatarConfig.params);
        expect(params.agora_appid).toBe(APP_ID);
        expect(params.agora_channel).toBe("room");
        expect(params.agora_token).toBeTruthy();
        expect(params.agora_token).not.toBe(agentToken);
        validateAvatarConfig(started.properties.avatar as Parameters<typeof validateAvatarConfig>[0], {
            requireSessionFields: true,
        });
    });

    test("avatar token overrides are preserved and UID collisions warn", async () => {
        const warnings: string[] = [];
        const client = createClient();
        let request: StartRequest | undefined;
        client.agents.start = vi.fn(async (body: StartRequest) => {
            request = body;
            return { agent_id: "agent_123", status: "RUNNING" };
        });

        await new Agent({ name: "avatar-agent" })
            .withStt(new AresSTT())
            .withLlm(new OpenAI({ apiKey: "openai-key", model: "gpt-4o-mini" }))
            .withTts(new OpenAITTS({ apiKey: "openai-tts-key", model: "tts-1", voice: "alloy" }))
            .withAvatar(
                new LiveAvatarAvatar({
                    apiKey: "live-key",
                    quality: "high",
                    agoraUid: "1",
                    agoraToken: "user-avatar-token",
                }),
            )
            .createSession(client, {
                channel: "room",
                token: "agent-token",
                agentUid: "1",
                remoteUids: ["100"],
                warn: (message) => warnings.push(message),
            })
            .start();

        const started = requireRequest(request);
        const avatarConfig = asRecord(started.properties.avatar);
        const params = asRecord(avatarConfig.params);
        expect(params.agora_token).toBe("user-avatar-token");
        expect(warnings.some((message) => message.includes("avatar agora_uid matches agent_rtc_uid"))).toBe(true);
    });

    test("think passes all actions including interrupt", async () => {
        const client = createClient();
        const session = new Agent({ name: "think-agent" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });
        await session.start();

        await session.think("do it", {
            on_listening_action: "interrupt",
            on_thinking_action: "interrupt",
            on_speaking_action: "ignore",
            interruptable: false,
            metadata: { source: "test" },
        });

        expect(client.agentManagement.agentThink).toHaveBeenCalledWith(
            expect.objectContaining({
                on_listening_action: "interrupt",
                on_thinking_action: "interrupt",
                on_speaking_action: "ignore",
                interruptable: false,
                metadata: { source: "test" },
            }),
            expect.anything(),
        );
    });

    test("getTurns forwards pagination and getAllTurns aggregates pages", async () => {
        const client = createClient();
        client.agents.getTurns = vi
            .fn()
            .mockResolvedValueOnce({
                turns: [{ turn_id: 1 }],
                pagination: { page_index: 1, total_pages: 2, is_last_page: false },
            })
            .mockResolvedValueOnce({
                turns: [{ turn_id: 2 }],
                pagination: { page_index: 2, total_pages: 2, is_last_page: true },
            });

        const session = new Agent({ name: "turn-agent" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });
        await session.start();

        const turns = await session.getAllTurns({ page_size: 1 });

        expect(turns.turns?.map((turn) => turn.turn_id)).toEqual([1, 2]);
        expect(client.agents.getTurns).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ page_index: 1, page_size: 1 }),
            expect.anything(),
        );
        expect(client.agents.getTurns).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ page_index: 2, page_size: 1 }),
            expect.anything(),
        );
    });

    test("getAllTurns fails fast when pagination does not advance", async () => {
        const client = createClient();
        client.agents.getTurns = vi
            .fn()
            .mockResolvedValueOnce({
                turns: [{ turn_id: 1 }],
                pagination: { page_index: 1, is_last_page: false },
            })
            .mockResolvedValueOnce({
                turns: [{ turn_id: 1 }],
                pagination: { page_index: 1, is_last_page: false },
            });

        const session = new Agent({ name: "turn-agent" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });
        await session.start();

        await expect(session.getAllTurns({ page_size: 1 })).rejects.toThrow("pagination did not advance");
    });

    test("getAllTurns fails fast when pagination metadata is insufficient", async () => {
        const client = createClient();
        client.agents.getTurns = vi.fn().mockResolvedValueOnce({
            turns: [{ turn_id: 1 }],
            pagination: { is_last_page: false },
        });

        const session = new Agent({ name: "turn-agent" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });
        await session.start();

        await expect(session.getAllTurns({ page_size: 1 })).rejects.toThrow("pagination cannot continue");
    });

    test("LLM greeting interruptable is serialized", () => {
        const props = new Agent()
            .withStt(new AresSTT())
            .withLlm(
                new OpenAI({
                    apiKey: "openai-key",
                    model: "gpt-4o-mini",
                    greetingConfigs: { mode: "single_first", interruptable: false },
                }),
            )
            .withTts(new OpenAITTS({ apiKey: "openai-tts-key", model: "tts-1", voice: "alloy" }))
            .toProperties({ channel: "room", token: "rtc-token", agentUid: "1", remoteUids: ["100"] });

        expect(props.llm?.greeting_configs).toEqual({ mode: "single_first", interruptable: false });
    });

    test("MLLM combined with an enabled avatar is rejected up-front", () => {
        // Mirrors Go's TestMllmWithEnabledAvatarIsRejectedWithoutRequiringTts:
        // the guard must fire even when no TTS is configured, and must not
        // surface the unrelated "TTS configuration is required" error.
        const agent = new Agent({ name: "mllm-avatar-agent" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .withAvatar(
                new LiveAvatarAvatar({
                    apiKey: "live-key",
                    quality: "high",
                    agoraUid: "200",
                    agoraToken: "avatar-token",
                }),
            );

        try {
            agent.toProperties({
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });
            throw new Error("expected toProperties to throw");
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            expect(message).toMatch(/Avatars are only supported with the cascading/);
            expect(message).not.toMatch(/TTS configuration is required/);
        }
    });

    test("MLLM + avatar guard fires before token generation (fail-fast)", () => {
        // When appId/appCertificate are supplied (no pre-built token), token
        // generation requires non-empty values. Pass empty strings to make
        // token generation fail loudly if it ever runs — the MLLM+avatar guard
        // must throw first.
        const agent = new Agent({ name: "mllm-avatar-fail-fast" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .withAvatar(
                new LiveAvatarAvatar({
                    apiKey: "live-key",
                    quality: "high",
                    agoraUid: "200",
                    agoraToken: "avatar-token",
                }),
            );

        expect(() =>
            agent.toProperties({
                channel: "room",
                appId: "",
                appCertificate: "",
                agentUid: "1",
                remoteUids: ["100"],
            }),
        ).toThrow(/Avatars are only supported with the cascading/);
    });

    test("MLLM + avatar with vendor.enable omitted (default-enabled) is rejected", () => {
        // Avatar with no `enable` field should be treated as enabled, matching
        // Go's `avatarConfigEnabled` (which returns true when the key is missing)
        // and Python's `avatar.get("enable", True)`.
        const agent = new Agent({ name: "mllm-avatar-default-enabled" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .withAvatar(
                new LiveAvatarAvatar({
                    apiKey: "live-key",
                    quality: "high",
                    agoraUid: "200",
                    agoraToken: "avatar-token",
                    // enable intentionally omitted
                }),
            );

        expect(() =>
            agent.toProperties({
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            }),
        ).toThrow(/Avatars are only supported with the cascading/);
    });

    test("MLLM + disabled avatar is allowed and does not require TTS", () => {
        // Mirrors Go's TestMllmWithDisabledAvatarDoesNotRequireTts: a disabled
        // avatar must not trip the MLLM+avatar guard, must not require TTS,
        // and the (disabled) avatar must still be forwarded to the server.
        const props = new Agent({ name: "mllm-disabled-avatar" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .withAvatar(
                new LiveAvatarAvatar({
                    apiKey: "live-key",
                    quality: "high",
                    agoraUid: "200",
                    agoraToken: "avatar-token",
                    enable: false,
                }),
            )
            .toProperties({
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });

        expect(props.mllm?.enable).toBe(true);
        expect(props.tts).toBeUndefined();
        expect(props.llm).toBeUndefined();
        expect(props.asr).toBeUndefined();
        expect(props.avatar).toBeDefined();
        expect(props.avatar?.enable).toBe(false);
    });

    test("MLLM mode does not require TTS or LLM configuration", async () => {
        const client = createClient();
        let request: StartRequest | undefined;
        client.agents.start = vi.fn(async (body: StartRequest) => {
            request = body;
            return { agent_id: "agent_123", status: "RUNNING" };
        });

        await new Agent({ name: "mllm-only" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            })
            .start();

        const started = requireRequest(request);
        const props = asRecord(started.properties);
        expect(props.tts).toBeUndefined();
        expect(props.llm).toBeUndefined();
        expect(props.asr).toBeUndefined();
        expect(asRecord(props.mllm).enable).toBe(true);
    });

    test("AgentSession.start() rejects MLLM + avatar before issuing a request", async () => {
        const client = createClient();
        const startSpy = client.agents.start as ReturnType<typeof vi.fn>;

        const session = new Agent({ name: "mllm-avatar-session" })
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .withAvatar(
                new LiveAvatarAvatar({
                    apiKey: "live-key",
                    quality: "high",
                    agoraUid: "200",
                    agoraToken: "avatar-token",
                }),
            )
            .createSession(client, {
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            });

        await expect(session.start()).rejects.toThrow(/Avatars are only supported with the cascading/);
        expect(startSpy).not.toHaveBeenCalled();
    });

    test("isAvatarTokenManaged is true only for HeyGen, LiveAvatar, and Generic avatars", () => {
        expect(
            isAvatarTokenManaged(
                new LiveAvatarAvatar({
                    apiKey: "k",
                    quality: "high",
                    agoraUid: "1",
                }).toConfig() as unknown as Parameters<typeof isAvatarTokenManaged>[0],
            ),
        ).toBe(true);
        expect(
            isAvatarTokenManaged(
                new GenericAvatar({
                    apiKey: "k",
                    apiBaseUrl: "https://example.com",
                    avatarId: "avatar",
                    agoraUid: "1",
                }).toConfig() as unknown as Parameters<typeof isAvatarTokenManaged>[0],
            ),
        ).toBe(true);
        expect(
            isAvatarTokenManaged(
                new AkoolAvatar({ apiKey: "k" }).toConfig() as unknown as Parameters<typeof isAvatarTokenManaged>[0],
            ),
        ).toBe(false);
        expect(
            isAvatarTokenManaged(
                new AnamAvatar({ apiKey: "k" }).toConfig() as unknown as Parameters<typeof isAvatarTokenManaged>[0],
            ),
        ).toBe(false);
    });

    test("Akool and Anam avatars never receive an auto-generated agora_token", async () => {
        const client = createClient();
        let request: StartRequest | undefined;
        client.agents.start = vi.fn(async (body: StartRequest) => {
            request = body;
            return { agent_id: "agent_123", status: "RUNNING" };
        });

        await new Agent({ name: "akool-agent" })
            .withStt(new AresSTT())
            .withLlm(new OpenAI({ apiKey: "openai-key", model: "gpt-4o-mini" }))
            .withTts(
                new ElevenLabsTTS({
                    key: "elevenlabs-key",
                    modelId: "eleven_flash_v2_5",
                    voiceId: "voice",
                    sampleRate: 16000,
                }),
            )
            .withAvatar(new AkoolAvatar({ apiKey: "akool-key" }))
            .createSession(client, {
                channel: "room",
                token: "agent-token",
                agentUid: "1",
                remoteUids: ["100"],
            })
            .start();

        let started = requireRequest(request);
        let avatarParams = asRecord(asRecord(started.properties.avatar).params);
        expect(avatarParams.agora_token).toBeUndefined();
        expect(avatarParams.agora_uid).toBeUndefined();

        request = undefined;
        await new Agent({ name: "anam-agent" })
            .withStt(new AresSTT())
            .withLlm(new OpenAI({ apiKey: "openai-key", model: "gpt-4o-mini" }))
            .withTts(new OpenAITTS({ apiKey: "openai-tts-key", model: "tts-1", voice: "alloy" }))
            .withAvatar(new AnamAvatar({ apiKey: "anam-key" }))
            .createSession(client, {
                channel: "room",
                token: "agent-token",
                agentUid: "1",
                remoteUids: ["100"],
            })
            .start();

        started = requireRequest(request);
        avatarParams = asRecord(asRecord(started.properties.avatar).params);
        expect(avatarParams.agora_token).toBeUndefined();
        expect(avatarParams.agora_uid).toBeUndefined();
    });

    test("generateAvatarRtcToken uses the same token format path as agent tokens", () => {
        const token = generateAvatarRtcToken({
            appId: APP_ID,
            appCertificate: APP_CERTIFICATE,
            channel: "room",
            uid: "avatar-uid",
            expirySeconds: 3600,
        });

        expect(token).toMatch(/^007/);
    });
});
