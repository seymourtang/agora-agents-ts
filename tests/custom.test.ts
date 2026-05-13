import { Agent } from "../src/agentkit/Agent.js";
import { AgentSession } from "../src/agentkit/AgentSession.js";
import { resolveSessionPresets } from "../src/agentkit/presets.js";
import { OpenAI } from "../src/agentkit/vendors/llm.js";
import { OpenAIRealtime } from "../src/agentkit/vendors/mllm.js";
import { DeepgramTTS, OpenAITTS } from "../src/agentkit/vendors/tts.js";
import { describe, expect, it, vi } from "vitest";

describe("agentkit custom tests", () => {
    it("think routes through agentManagement client", async () => {
        const agentThink = vi.fn().mockResolvedValue({ agent_id: "agent-1", channel: "room", start_ts: 1 });
        const fakeClient = {
            agents: {},
            agentManagement: { agentThink },
            authMode: "basic",
        } as any;

        const session = new AgentSession({
            client: fakeClient,
            agent: new Agent(),
            appId: "appid",
            name: "agent",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["2"],
        });
        (session as any)._status = "running";
        (session as any)._agentId = "agent-1";

        const resp = await session.think("Injected instruction", { on_thinking_action: "interrupt" });
        expect(resp.agent_id).toBe("agent-1");
        expect(agentThink).toHaveBeenCalledTimes(1);
        expect(agentThink.mock.calls[0][0]).toMatchObject({
            appid: "appid",
            agentId: "agent-1",
            text: "Injected instruction",
            on_thinking_action: "interrupt",
        });
    });

    it("minimax preset strips group_id, url, and model when no key provided", () => {
        const { preset, properties } = resolveSessionPresets({
            properties: {
                tts: {
                    vendor: "minimax",
                    params: {
                        group_id: "my-group",
                        model: "speech-2.6-turbo",
                        url: "wss://api-uw.minimax.io/ws/v1/t2a_v2",
                        voice_id: "English_captivating_female1",
                    } as any,
                },
            },
        });
        expect(preset).toBe("minimax_speech_2_6_turbo");
        const params = properties.tts?.params as Record<string, unknown>;
        expect(params).not.toHaveProperty("key");
        expect(params).not.toHaveProperty("group_id");
        expect(params).not.toHaveProperty("url");
        expect(params).not.toHaveProperty("model");
        expect(params?.voice_id).toBe("English_captivating_female1");
    });

    it("minimax preset strips group_id, url, and model for speech-2.8-turbo", () => {
        const { preset, properties } = resolveSessionPresets({
            properties: {
                tts: {
                    vendor: "minimax",
                    params: {
                        group_id: "org-123",
                        model: "speech-2.8-turbo",
                        url: "wss://api.minimax.io/ws/v1/t2a_v2",
                        voice_id: "some-voice",
                    } as any,
                },
            },
        });
        expect(preset).toBe("minimax_speech_2_8_turbo");
        const params = properties.tts?.params as Record<string, unknown>;
        expect(params).not.toHaveProperty("key");
        expect(params).not.toHaveProperty("group_id");
        expect(params).not.toHaveProperty("url");
        expect(params).not.toHaveProperty("model");
    });

    it("minimax preset is not inferred when key is present", () => {
        const { preset } = resolveSessionPresets({
            properties: {
                tts: {
                    vendor: "minimax",
                    params: {
                        key: "user-secret",
                        group_id: "my-group",
                        model: "speech-2.6-turbo",
                    } as any,
                },
            },
        });
        expect(preset).toBeUndefined();
    });

    it("llm vendor headers are forwarded to properties", () => {
        const agent = new Agent()
            .withLlm(
                new OpenAI({
                    apiKey: "openai-key",
                    model: "gpt-4o-mini",
                    headers: { "X-Trace-Id": "trace-123" },
                    outputModalities: ["text", "audio"],
                    greetingConfigs: { mode: "single_first" },
                    templateVariables: { caller_name: "Ada" },
                }),
            )
            .withTts(new OpenAITTS({ apiKey: "tts-key", voice: "alloy" }));

        const properties = agent.toProperties({
            channel: "room",
            token: "rtc-token",
            agentUid: "1",
            remoteUids: ["2"],
        });

        expect(properties.llm?.headers).toEqual({ "X-Trace-Id": "trace-123" });
        expect(properties.llm?.output_modalities).toEqual(["text", "audio"]);
        expect(properties.llm?.greeting_configs).toEqual({ mode: "single_first" });
        expect(properties.llm?.template_variables).toEqual({ caller_name: "Ada" });
    });

    it("withTurnDetection forwards config to properties", () => {
        const turnDetection = {
            type: "agora_vad",
            threshold: 0.5,
        } as any;

        const properties = new Agent().withTurnDetection(turnDetection).toProperties({
            channel: "room",
            token: "rtc-token",
            agentUid: "1",
            remoteUids: ["2"],
            skipVendorValidation: true,
        });

        expect(properties.turn_detection).toEqual(turnDetection);
    });

    it("withMllm sets the legacy enable_mllm flag", () => {
        const properties = new Agent()
            .withMllm(new OpenAIRealtime({ apiKey: "openai-key" }))
            .toProperties({
                channel: "room",
                token: "rtc-token",
                agentUid: "1",
                remoteUids: ["2"],
            });

        expect(properties.mllm?.enable).toBe(true);
        expect(properties.advanced_features?.enable_mllm).toBe(true);
    });

    it("withTools sets enable_tools", () => {
        const properties = new Agent().withTools().toProperties({
            channel: "room",
            token: "rtc-token",
            agentUid: "1",
            remoteUids: ["2"],
            skipVendorValidation: true,
        });

        expect(properties.advanced_features?.enable_tools).toBe(true);
    });

    it("deepgram tts vendor config matches the documented payload", () => {
        const config = new DeepgramTTS({
            apiKey: "deepgram-key",
            model: "aura-2-thalia-en",
            baseUrl: "wss://api.deepgram.com/v1/speak",
            sampleRate: 24000,
            params: { encoding: "linear16" },
        }).toConfig() as any;

        expect(config).toEqual({
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
});
