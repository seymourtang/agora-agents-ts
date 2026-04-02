import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import { AgoraClient as GeneratedAgoraClient } from "../../src/Client";
import { AgoraError } from "../../src/errors";
import { AgentSession } from "../../src/agentkit/AgentSession";
import { Agent } from "../../src/agentkit/Agent";
import { AgentPresets } from "../../src/agentkit/presets";
import { OpenAI } from "../../src/agentkit/vendors/llm";
import { DeepgramSTT } from "../../src/agentkit/vendors/stt";
import { ElevenLabsTTS, OpenAITTS } from "../../src/agentkit/vendors/tts";
import { mockServerPool } from "../mock-server/MockServerPool";

beforeAll(() => {
    mockServerPool.listen();
});

afterAll(() => {
    mockServerPool.close();
});

function createTestClient(baseUrl: string) {
    return Object.assign(
        new GeneratedAgoraClient({
            maxRetries: 0,
            username: "test",
            password: "test",
            environment: baseUrl,
        }),
        {
            appId: "appid",
            appCertificate: "appCertificate",
            authMode: "basic" as const,
        },
    );
}

function createTestAgent() {
    return new Agent({
        name: "support-agent",
        instructions: "You are helpful.",
    })
        .withLlm(
            new OpenAI({
                apiKey: "openai-key",
                model: "gpt-4o-mini",
            }),
        )
        .withTts(
            new ElevenLabsTTS({
                key: "elevenlabs-key",
                modelId: "eleven_flash_v2_5",
                voiceId: "voice-id",
                sampleRate: 24000,
            }),
        )
        .withStt(
            new DeepgramSTT({
                apiKey: "deepgram-key",
                model: "nova-2",
                language: "en-US",
            }),
        );
}

describe("AgentSession", () => {
    test("start forwards preset and pipelineId through AgentKit", async () => {
        const server = mockServerPool.createServer();
        const client = createTestClient(server.baseUrl);
        const agent = createTestAgent();

        server
            .mockEndpoint()
            .post("/v2/projects/appid/join")
            .jsonBody({
                name: "support-agent",
                preset: "deepgram_nova_3,openai_gpt_4o_mini,openai_tts_1",
                pipeline_id: "pipeline_123",
                properties: {
                    channel: "room-1",
                    token: "rtc-token",
                    agent_rtc_uid: "1",
                    remote_rtc_uids: ["100"],
                    idle_timeout: 120,
                    enable_string_uid: true,
                    asr: {
                        language: "en-US",
                        vendor: "deepgram",
                        params: {
                            api_key: "deepgram-key",
                            language: "en-US",
                            model: "nova-2",
                        },
                    },
                    tts: {
                        vendor: "elevenlabs",
                        params: {
                            key: "elevenlabs-key",
                            model_id: "eleven_flash_v2_5",
                            voice_id: "voice-id",
                            sample_rate: 24000,
                        },
                    },
                    llm: {
                        url: "https://api.openai.com/v1/chat/completions",
                        api_key: "openai-key",
                        system_messages: [{ role: "system", content: "You are helpful." }],
                        params: { model: "gpt-4o-mini" },
                        input_modalities: ["text"],
                        style: "openai",
                    },
                },
            })
            .respondWith()
            .statusCode(200)
            .jsonBody({
                agent_id: "agent_123",
                create_ts: 1737111452,
                status: "RUNNING",
            })
            .build();

        const session = agent.createSession(client as any, {
            channel: "room-1",
            agentUid: "1",
            remoteUids: ["100"],
            token: "rtc-token",
            idleTimeout: 120,
            enableStringUid: true,
            preset: "deepgram_nova_3,openai_gpt_4o_mini,openai_tts_1",
            pipelineId: "pipeline_123",
        });

        await expect(session.start()).resolves.toBe("agent_123");
    });

    test("start accepts preset arrays and normalizes them for the API", async () => {
        const server = mockServerPool.createServer();
        const client = createTestClient(server.baseUrl);
        const agent = new Agent({ name: "preset-array", instructions: "Use reseller presets." });

        server
            .mockEndpoint()
            .post("/v2/projects/appid/join")
            .jsonBody({
                name: "preset-array",
                preset: "deepgram_nova_3,openai_gpt_5_mini,openai_tts_1",
                properties: {
                    channel: "room-array",
                    token: "rtc-token",
                    agent_rtc_uid: "1",
                    remote_rtc_uids: ["100"],
                },
            })
            .respondWith()
            .statusCode(200)
            .jsonBody({
                agent_id: "agent_array",
                create_ts: 1737111452,
                status: "RUNNING",
            })
            .build();

        const session = agent.createSession(client as any, {
            channel: "room-array",
            agentUid: "1",
            remoteUids: ["100"],
            token: "rtc-token",
            preset: [AgentPresets.asr.deepgramNova3, AgentPresets.llm.openaiGpt5Mini, AgentPresets.tts.openaiTts1],
        });

        await expect(session.start()).resolves.toBe("agent_array");
    });

    test("getTurns exposes turn analytics without using raw", async () => {
        const server = mockServerPool.createServer();
        const client = createTestClient(server.baseUrl);
        const agent = createTestAgent();

        server
            .mockEndpoint()
            .post("/v2/projects/appid/join")
            .respondWith()
            .statusCode(200)
            .jsonBody({
                agent_id: "agent_456",
                create_ts: 1737111452,
                status: "RUNNING",
            })
            .build();

        server
            .mockEndpoint()
            .get("/v2/projects/appid/agents/agent_456/turns")
            .respondWith()
            .statusCode(200)
            .jsonBody({
                turns: [
                    {
                        agent_id: "agent_456",
                        channel: "room-2",
                        turn_id: 1,
                        start: {
                            start_at: 1737111452000,
                            type: "voice_input",
                        },
                        end: {
                            end_at: 1737111453500,
                            type: "ok",
                        },
                        metrics: {
                            e2e_latency_ms: 320,
                        },
                    },
                ],
            })
            .build();

        const session = agent.createSession(client as any, {
            channel: "room-2",
            agentUid: "1",
            remoteUids: ["100"],
            token: "rtc-token",
        });

        await session.start();

        await expect(session.getTurns()).resolves.toEqual({
            turns: [
                {
                    agent_id: "agent_456",
                    channel: "room-2",
                    turn_id: 1,
                    start: {
                        start_at: 1737111452000,
                        type: "voice_input",
                    },
                    end: {
                        end_at: 1737111453500,
                        type: "ok",
                    },
                    metrics: {
                        e2e_latency_ms: 320,
                    },
                },
            ],
        });
    });

    test("start allows preset-only sessions without explicit llm or tts config", async () => {
        const server = mockServerPool.createServer();
        const client = createTestClient(server.baseUrl);
        const agent = new Agent({ name: "preset-agent", instructions: "Use the preset defaults." });

        server
            .mockEndpoint()
            .post("/v2/projects/appid/join")
            .jsonBody({
                name: "preset-agent",
                preset: "deepgram_nova_3,openai_gpt_4o_mini,openai_tts_1",
                properties: {
                    channel: "room-3",
                    token: "rtc-token",
                    agent_rtc_uid: "1",
                    remote_rtc_uids: ["100"],
                },
            })
            .respondWith()
            .statusCode(200)
            .jsonBody({
                agent_id: "agent_789",
                create_ts: 1737111452,
                status: "RUNNING",
            })
            .build();

        const session = agent.createSession(client as any, {
            channel: "room-3",
            agentUid: "1",
            remoteUids: ["100"],
            token: "rtc-token",
            preset: "deepgram_nova_3,openai_gpt_4o_mini,openai_tts_1",
        });

        await expect(session.start()).resolves.toBe("agent_789");
    });

    test("start infers reseller presets from vendor configs when credentials are omitted", async () => {
        const server = mockServerPool.createServer();
        const client = createTestClient(server.baseUrl);
        const agent = new Agent({ name: "auto-preset", instructions: "Use built-in reseller defaults." })
            .withStt(
                new DeepgramSTT({
                    model: "nova-3",
                    language: "en-US",
                    smartFormat: true,
                }),
            )
            .withLlm(
                new OpenAI({
                    model: "gpt-5-mini",
                    temperature: 0.4,
                }),
            )
            .withTts(
                new OpenAITTS({
                    voice: "alloy",
                    speed: 1.1,
                }),
            );

        server
            .mockEndpoint()
            .post("/v2/projects/appid/join")
            .jsonBody({
                name: "auto-preset",
                preset: "deepgram_nova_3,openai_gpt_5_mini,openai_tts_1",
                properties: {
                    channel: "room-auto",
                    token: "rtc-token",
                    agent_rtc_uid: "1",
                    remote_rtc_uids: ["100"],
                    asr: {
                        vendor: "deepgram",
                        language: "en-US",
                        params: {
                            language: "en-US",
                            smart_format: true,
                        },
                    },
                    llm: {
                        system_messages: [{ role: "system", content: "Use built-in reseller defaults." }],
                        params: {
                            temperature: 0.4,
                        },
                        input_modalities: ["text"],
                        style: "openai",
                    },
                    tts: {
                        vendor: "openai",
                        params: {
                            voice: "alloy",
                            speed: 1.1,
                        },
                    },
                },
            })
            .respondWith()
            .statusCode(200)
            .jsonBody({
                agent_id: "agent_auto",
                create_ts: 1737111452,
                status: "RUNNING",
            })
            .build();

        const session = agent.createSession(client as any, {
            channel: "room-auto",
            agentUid: "1",
            remoteUids: ["100"],
            token: "rtc-token",
        });

        await expect(session.start()).resolves.toBe("agent_auto");
    });

    test("session methods enforce state and id guards", async () => {
        const session = new AgentSession({
            client: { agents: {} } as any,
            agent: createTestAgent(),
            appId: "appid",
            name: "guarded",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
        });

        await expect(session.stop()).rejects.toThrow(/Cannot stop session in idle state/);
        await expect(session.say("hi")).rejects.toThrow(/Cannot say in idle state/);
        await expect(session.interrupt()).rejects.toThrow(/Cannot interrupt in idle state/);
        await expect(session.update({})).rejects.toThrow(/Cannot update in idle state/);
        await expect(session.getHistory()).rejects.toThrow(/No agent ID available/);
        await expect(session.getTurns()).rejects.toThrow(/No agent ID available/);
        await expect(session.getInfo()).rejects.toThrow(/No agent ID available/);

        (session as any)._status = "running";
        await expect(session.stop()).rejects.toThrow(/No agent ID available/);
        await expect(session.say("hi")).rejects.toThrow(/No agent ID available/);
        await expect(session.interrupt()).rejects.toThrow(/No agent ID available/);
        await expect(session.update({})).rejects.toThrow(/No agent ID available/);
    });

    test("app-credentials mode adds auth headers and exposes getters/raw client", async () => {
        const agents = {
            start: vi.fn().mockResolvedValue({ agent_id: "agent_auth" }),
            speak: vi.fn().mockResolvedValue(undefined),
            getHistory: vi.fn().mockResolvedValue({ contents: [] }),
            getTurns: vi.fn().mockResolvedValue({ turns: [] }),
            get: vi.fn().mockResolvedValue({ agent_id: "agent_auth" }),
        };
        const client = {
            agents,
            authMode: "app-credentials",
            getCurrentURL: () => "https://example.com",
        } as any;

        const session = new AgentSession({
            client,
            agent: createTestAgent(),
            appId: "a".repeat(32),
            appCertificate: "b".repeat(32),
            name: "auth",
            channel: "room",
            agentUid: "1",
            remoteUids: ["100"],
            debug: true,
        });

        expect(session.raw).toBe(agents);
        expect(session.appId).toBe("a".repeat(32));
        expect(session.id).toBeNull();
        expect(session.status).toBe("idle");

        await session.start();
        await session.say("hello");
        await session.getHistory();
        await session.getTurns();
        await session.getInfo();

        expect(agents.start.mock.calls[0][1].headers.Authorization).toMatch(/^agora token=/);
        expect(agents.speak.mock.calls[0][1].headers.Authorization).toMatch(/^agora token=/);
        expect(agents.getHistory.mock.calls[0][1].headers.Authorization).toMatch(/^agora token=/);
        expect(agents.getTurns.mock.calls[0][1].headers.Authorization).toMatch(/^agora token=/);
        expect(agents.get.mock.calls[0][1].headers.Authorization).toMatch(/^agora token=/);
    });

    test("event handlers can be added, removed, and warning path is exercised", () => {
        const warnings: string[] = [];
        const session = new AgentSession({
            client: { agents: {} } as any,
            agent: createTestAgent(),
            appId: "appid",
            name: "events",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
            warn: (message) => warnings.push(message),
        });

        const started = vi.fn();
        const failing = vi.fn(() => {
            throw new Error("handler boom");
        });

        session.on("started", started);
        session.on("started", failing);
        (session as any)._emit("started", { agentId: "agent-1" });
        expect(started).toHaveBeenCalledWith({ agentId: "agent-1" });
        expect(warnings[0]).toContain("handler boom");

        session.off("started", started);
        (session as any)._emit("started", { agentId: "agent-2" });
        expect(started).toHaveBeenCalledTimes(1);
    });

    test("running session methods call underlying client helpers", async () => {
        const agents = {
            speak: vi.fn().mockResolvedValue(undefined),
            interrupt: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn().mockResolvedValue(undefined),
        };
        const session = new AgentSession({
            client: { agents } as any,
            agent: createTestAgent(),
            appId: "appid",
            name: "runtime",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
        });
        (session as any)._status = "running";
        (session as any)._agentId = "agent-live";

        await session.say("hello", { priority: 1 as any, interruptable: true });
        await session.interrupt();
        await session.update({ greeting_message: "updated" } as any);
        await session.stop();

        expect(agents.speak).toHaveBeenCalledWith(
            {
                appid: "appid",
                agentId: "agent-live",
                text: "hello",
                priority: 1,
                interruptable: true,
            },
            { headers: undefined },
        );
        expect(agents.interrupt).toHaveBeenCalled();
        expect(agents.update).toHaveBeenCalled();
        expect(agents.stop).toHaveBeenCalled();
        expect(session.status).toBe("stopped");
    });

    test("start sets status to error and emits error event on failure", async () => {
        const err = new Error("start failed");
        const session = new AgentSession({
            client: { agents: { start: vi.fn().mockRejectedValue(err) } } as any,
            agent: createTestAgent(),
            appId: "appid",
            name: "failing",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
        });

        const emitted: unknown[] = [];
        session.on("error", (e) => emitted.push(e));

        await expect(session.start()).rejects.toThrow("start failed");
        expect(session.status).toBe("error");
        expect(emitted[0]).toBe(err);
    });

    test("stop swallows 404 and transitions to stopped", async () => {
        const session = new AgentSession({
            client: {
                agents: {
                    stop: vi.fn().mockRejectedValue(new AgoraError({ statusCode: 404 })),
                },
            } as any,
            agent: createTestAgent(),
            appId: "appid",
            name: "already-stopped",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
        });
        (session as any)._status = "running";
        (session as any)._agentId = "agent-gone";

        await expect(session.stop()).resolves.toBeUndefined();
        expect(session.status).toBe("stopped");
    });

    test("stop moves session to error on non-404 failure", async () => {
        const problem = new Error("stop failed");
        const session = new AgentSession({
            client: {
                agents: {
                    stop: vi.fn().mockRejectedValue(problem),
                },
            } as any,
            agent: createTestAgent(),
            appId: "appid",
            name: "stop-error",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
        });
        (session as any)._status = "running";
        (session as any)._agentId = "agent-live";

        await expect(session.stop()).rejects.toThrow("stop failed");
        expect(session.status).toBe("error");
    });

    test("avatar validation warning branches are exercised", async () => {
        const warnings: string[] = [];
        const client = {
            agents: {
                start: vi.fn().mockResolvedValue({ agent_id: "agent_warn" }),
            },
        } as any;

        const baseOptions = {
            client,
            appId: "appid",
            name: "warn",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["100"],
            warn: (message: string) => warnings.push(message),
        };

        const warningAgent = (avatar: any) =>
            new Agent({ avatar }).withLlm(new OpenAI({ apiKey: "openai-key", model: "gpt-4o-mini" })).withTts(
                new ElevenLabsTTS({
                    key: "elevenlabs-key",
                    modelId: "eleven_flash_v2_5",
                    voiceId: "voice-id",
                }),
            );

        await new AgentSession({
            ...baseOptions,
            agent: warningAgent({ vendor: "heygen", params: { api_key: "k", quality: "high", agora_uid: "1" } } as any),
        }).start();
        await new AgentSession({
            ...baseOptions,
            agent: warningAgent({
                vendor: "liveavatar",
                params: { api_key: "k", quality: "high", agora_uid: "1" },
            } as any),
        }).start();
        await new AgentSession({
            ...baseOptions,
            agent: warningAgent({ vendor: "akool", params: { api_key: "k" } } as any),
        }).start();

        expect(warnings.some((message) => message.includes("HeyGen avatar detected"))).toBe(true);
        expect(warnings.some((message) => message.includes("LiveAvatar avatar detected"))).toBe(true);
        expect(warnings.some((message) => message.includes("Akool avatar detected"))).toBe(true);
    });
});
