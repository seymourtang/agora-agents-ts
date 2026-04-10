import { describe, expect, test, vi } from "vitest";

import { Agent } from "../../src/agentkit/Agent";
import { OpenAI } from "../../src/agentkit/vendors/llm";
import { OpenAIRealtime } from "../../src/agentkit/vendors/mllm";
import { DeepgramSTT } from "../../src/agentkit/vendors/stt";
import { ElevenLabsTTS } from "../../src/agentkit/vendors/tts";

function createAgent() {
    return new Agent({
        name: "base-agent",
        instructions: "Base instructions",
        greeting: "Hello",
        failureMessage: "Failed",
        maxHistory: 5,
    })
        .withLlm(
            new OpenAI({
                apiKey: "openai-key",
                model: "gpt-4o-mini",
                greetingMessage: "Vendor greeting",
            }),
        )
        .withTts(
            new ElevenLabsTTS({
                key: "eleven-key",
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

describe("Agent", () => {
    test("builder methods are immutable and reflected in config/getters", () => {
        const base = new Agent({ name: "a" });
        const updated = base
            .withInstructions("Be concise")
            .withGreeting("Hi")
            .withFailureMessage("Retry")
            .withMaxHistory(7)
            .withTurnDetection({ interrupt_mode: "interrupt" } as any)
            .withSal({ sal_mode: "recognition" } as any)
            .withAdvancedFeatures({ enable_rtm: true })
            .withParameters({ data_channel: "datastream" } as any)
            .withGeofence({ area: "GLOBAL" } as any)
            .withLabels({ team: "dx" })
            .withRtc({ enable: true } as any)
            .withFillerWords({ enable: true } as any)
            .withName("b");

        expect(base.name).toBe("a");
        expect(base.instructions).toBeUndefined();

        expect(updated.name).toBe("b");
        expect(updated.instructions).toBe("Be concise");
        expect(updated.greeting).toBe("Hi");
        expect(updated.failureMessage).toBe("Retry");
        expect(updated.maxHistory).toBe(7);
        expect(updated.stt).toBeUndefined();
        expect(updated.mllm).toBeUndefined();
        expect(updated.turnDetection).toEqual({ interrupt_mode: "interrupt" });
        expect(updated.sal).toEqual({ sal_mode: "recognition" });
        expect(updated.advancedFeatures).toEqual({ enable_rtm: true });
        expect(updated.parameters).toEqual({ data_channel: "datastream" });
        expect(updated.geofence).toEqual({ area: "GLOBAL" });
        expect(updated.labels).toEqual({ team: "dx" });
        expect(updated.rtc).toEqual({ enable: true });
        expect(updated.fillerWords).toEqual({ enable: true });
        expect(updated.config.name).toBe("b");
    });

    test("createSession resolves name from options, agent, or timestamp fallback", () => {
        const client = { appId: "appid", appCertificate: "cert" } as any;

        const agentNamed = new Agent({ name: "agent-name" });
        expect(agentNamed.createSession(client, { channel: "c", agentUid: "1", remoteUids: ["2"] }).agent.name).toBe(
            "agent-name",
        );

        const sessionNamed = agentNamed.createSession(client, {
            name: "session-name",
            channel: "c",
            agentUid: "1",
            remoteUids: ["2"],
        });
        expect((sessionNamed as any)._name).toBe("session-name");

        const now = vi.spyOn(Date, "now").mockReturnValue(123456);
        const unnamed = new Agent().createSession(client, { channel: "c", agentUid: "1", remoteUids: ["2"] });
        expect((unnamed as any)._name).toBe("agent-123456");
        now.mockRestore();
    });

    test("toProperties throws when llm or tts are missing outside preset/pipeline flow", () => {
        const llmOnly = new Agent().withLlm(new OpenAI({ apiKey: "k", model: "m" }));
        const ttsOnly = new Agent().withTts(
            new ElevenLabsTTS({
                key: "k",
                modelId: "model",
                voiceId: "voice",
                sampleRate: 24000,
            }),
        );

        expect(() => llmOnly.toProperties({ channel: "c", token: "t", agentUid: "1", remoteUids: ["2"] })).toThrow(
            /TTS configuration is required/,
        );
        expect(() => ttsOnly.toProperties({ channel: "c", token: "t", agentUid: "1", remoteUids: ["2"] })).toThrow(
            /LLM configuration is required/,
        );
    });

    test("toProperties applies defaults and overrides for standard pipeline", () => {
        const agent = createAgent()
            .withAdvancedFeatures({ enable_rtm: true })
            .withParameters({ max_tokens: 3 } as any)
            .withLabels({ source: "sdk" });

        const properties = agent.toProperties({
            channel: "room-1",
            token: "rtc-token",
            agentUid: "1",
            remoteUids: ["100"],
            idleTimeout: 120,
            enableStringUid: true,
        });

        expect(properties).toMatchObject({
            channel: "room-1",
            token: "rtc-token",
            agent_rtc_uid: "1",
            remote_rtc_uids: ["100"],
            idle_timeout: 120,
            enable_string_uid: true,
            advanced_features: { enable_rtm: true },
            parameters: { max_tokens: 3, data_channel: "rtm" },
            labels: { source: "sdk" },
            asr: {
                vendor: "deepgram",
                language: "en-US",
            },
            tts: {
                vendor: "elevenlabs",
            },
            llm: {
                api_key: "openai-key",
                greeting_message: "Hello",
                failure_message: "Failed",
                max_history: 5,
                system_messages: [{ role: "system", content: "Base instructions" }],
            },
        });
    });

    test("toProperties supports preset or pipeline-backed sessions without llm/tts", () => {
        const properties = new Agent({ instructions: "Preset flow" }).toProperties({
            channel: "room-2",
            token: "rtc-token",
            agentUid: "1",
            remoteUids: ["100"],
            skipVendorValidation: true,
        });

        expect(properties).toMatchObject({
            channel: "room-2",
            token: "rtc-token",
            agent_rtc_uid: "1",
            remote_rtc_uids: ["100"],
        });
        expect(properties.llm).toBeUndefined();
        expect(properties.tts).toBeUndefined();
    });

    test("withMllm() alone is sufficient — no advancedFeatures required", () => {
        // Regression: withMllm() must not require a separate
        // withAdvancedFeatures({ enable_mllm: true }) call. Before the fix,
        // omitting that call caused a "TTS configuration is required" error.
        const agent = new Agent({ greeting: "Hi" }).withMllm(
            new OpenAIRealtime({ apiKey: "openai-key" }),
        );

        expect(agent.advancedFeatures).toMatchObject({ enable_mllm: true });

        // Must not throw even though withTts/withLlm were never called.
        expect(() =>
            agent.toProperties({
                channel: "c",
                token: "t",
                agentUid: "1",
                remoteUids: ["2"],
            }),
        ).not.toThrow();

        const props = agent.toProperties({
            channel: "c",
            token: "t",
            agentUid: "1",
            remoteUids: ["2"],
        });
        expect(props.mllm).toMatchObject({ vendor: "openai" });
        expect(props.llm).toBeUndefined();
        expect(props.tts).toBeUndefined();
        expect(props.asr).toBeUndefined();
    });

    test("withMllm() preserves existing advancedFeatures fields", () => {
        const agent = new Agent()
            .withAdvancedFeatures({ enable_rtm: true })
            .withMllm(new OpenAIRealtime({ apiKey: "key" }));

        expect(agent.advancedFeatures).toMatchObject({
            enable_rtm: true,
            enable_mllm: true,
        });
    });

    test("toProperties generates token and respects MLLM vendor precedence", () => {
        const agent = new Agent({
            greeting: "Agent greeting",
            failureMessage: "Agent failure",
            maxHistory: 9,
        }).withMllm(
            new OpenAIRealtime({
                apiKey: "openai-key",
                model: "gpt-4o-realtime-preview",
                greetingMessage: "Vendor greeting",
                failureMessage: "Vendor failure",
                maxHistory: 4,
            }),
        );

        const properties = agent.toProperties({
            channel: "room-3",
            agentUid: "1",
            remoteUids: ["100"],
            appId: "a".repeat(32),
            appCertificate: "b".repeat(32),
            expiresIn: 600,
        });

        expect(properties.token).toEqual(expect.any(String));
        expect(properties.token.length).toBeGreaterThan(10);
        expect(properties.mllm).toMatchObject({
            vendor: "openai",
            greeting_message: "Vendor greeting",
            failure_message: "Vendor failure",
            max_history: 4,
        });
    });

    test("constructor accepts fillerWords option and llm getter returns configured value", () => {
        const agent = new Agent({ fillerWords: { enable: true } as any });
        expect(agent.fillerWords).toEqual({ enable: true });

        const withLlm = new Agent().withLlm(new OpenAI({ apiKey: "key", model: "gpt-4o-mini" }));
        expect(withLlm.llm).toMatchObject({ api_key: "key" });
    });

    test("toProperties applies agent-level MLLM fallbacks and preserves vendor system messages when instructions are absent", () => {
        const sttConfig = new DeepgramSTT({ apiKey: "deepgram-key", model: "nova-2" }).toConfig();
        const llmAgent = new Agent()
            .withLlm(
                new OpenAI({
                    apiKey: "openai-key",
                    model: "gpt-4o-mini",
                    systemMessages: [{ role: "system", content: "vendor system" }],
                }),
            )
            .withTts(
                new ElevenLabsTTS({
                    key: "eleven-key",
                    modelId: "eleven_flash_v2_5",
                    voiceId: "voice-id",
                    sampleRate: 24000,
                }),
            )
            .withStt(new DeepgramSTT({ apiKey: "deepgram-key", model: "nova-2" }));

        expect(
            llmAgent.toProperties({
                channel: "room-4",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            }).llm,
        ).toMatchObject({
            system_messages: [{ role: "system", content: "vendor system" }],
        });
        expect(llmAgent.stt).toEqual(sttConfig);

        const mllmAgent = new Agent({
            greeting: "Agent greeting",
            failureMessage: "Agent failure",
            maxHistory: 7,
        }).withMllm(
            new OpenAIRealtime({
                apiKey: "openai-key",
            }),
        );

        expect(
            mllmAgent.toProperties({
                channel: "room-5",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["100"],
            }).mllm,
        ).toMatchObject({
            greeting_message: "Agent greeting",
            failure_message: "Agent failure",
            max_history: 7,
        });
        expect(mllmAgent.mllm?.vendor).toBe("openai");
    });
});
