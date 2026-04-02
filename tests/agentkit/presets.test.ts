import { describe, expect, test } from "vitest";

import {
    AgentPresets,
    normalizePresetInput,
    resolveSessionPresets,
} from "../../src/agentkit/presets";

describe("AgentPresets constants", () => {
    test("preset values match expected strings", () => {
        expect(AgentPresets.asr.deepgramNova2).toBe("deepgram_nova_2");
        expect(AgentPresets.asr.deepgramNova3).toBe("deepgram_nova_3");
        expect(AgentPresets.llm.openaiGpt4oMini).toBe("openai_gpt_4o_mini");
        expect(AgentPresets.llm.openaiGpt41Mini).toBe("openai_gpt_4_1_mini");
        expect(AgentPresets.llm.openaiGpt5Nano).toBe("openai_gpt_5_nano");
        expect(AgentPresets.llm.openaiGpt5Mini).toBe("openai_gpt_5_mini");
        expect(AgentPresets.tts.minimaxSpeech26Turbo).toBe("minimax_speech_2_6_turbo");
        expect(AgentPresets.tts.minimaxSpeech28Turbo).toBe("minimax_speech_2_8_turbo");
        expect(AgentPresets.tts.openaiTts1).toBe("openai_tts_1");
    });
});

describe("normalizePresetInput", () => {
    test("returns undefined for no input", () => {
        expect(normalizePresetInput()).toBeUndefined();
        expect(normalizePresetInput(undefined)).toBeUndefined();
    });

    test("returns a comma-joined string for a string input", () => {
        expect(normalizePresetInput("deepgram_nova_3,openai_gpt_4o_mini")).toBe(
            "deepgram_nova_3,openai_gpt_4o_mini",
        );
    });

    test("returns a joined string for an array input", () => {
        expect(
            normalizePresetInput([AgentPresets.asr.deepgramNova3, AgentPresets.llm.openaiGpt4oMini]),
        ).toBe("deepgram_nova_3,openai_gpt_4o_mini");
    });

    test("trims and filters empty entries", () => {
        expect(normalizePresetInput("  deepgram_nova_3 , , openai_gpt_4o_mini  ")).toBe(
            "deepgram_nova_3,openai_gpt_4o_mini",
        );
    });
});

describe("resolveSessionPresets", () => {
    test("returns no preset when properties have no inferrable vendors", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
            },
        });
        expect(result.preset).toBeUndefined();
    });

    test("infers deepgram ASR preset and strips api_key and model from params", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                asr: {
                    vendor: "deepgram",
                    language: "en-US",
                    params: { api_key: undefined, model: "nova-3" },
                },
            },
        });
        expect(result.preset).toContain("deepgram_nova_3");
        expect(result.properties.asr?.params?.model).toBeUndefined();
    });

    test("infers OpenAI LLM preset and strips api_key and model from params", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                llm: {
                    url: "https://api.openai.com/v1/chat/completions",
                    params: { model: "gpt-4o-mini" },
                },
            },
        });
        expect(result.preset).toContain("openai_gpt_4o_mini");
        expect(result.properties.llm?.api_key).toBeUndefined();
        expect(result.properties.llm?.params?.model).toBeUndefined();
    });

    test("infers openai TTS preset and strips api_key", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                tts: { vendor: "openai", params: { model: "tts-1" } },
            },
        });
        expect(result.preset).toContain("openai_tts_1");
    });

    test("infers minimax TTS preset and strips key", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                tts: {
                    vendor: "minimax",
                    params: {
                        group_id: "g",
                        model: "speech-2.6-turbo",
                        url: "wss://example.com",
                        voice_setting: { voice_id: "v" },
                    },
                },
            },
        });
        expect(result.preset).toContain("minimax_speech_2_6_turbo");
        expect(result.properties.tts?.params?.key).toBeUndefined();
    });

    test("explicit preset takes precedence and suppresses inference for that category", () => {
        const result = resolveSessionPresets({
            preset: "deepgram_nova_2",
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                asr: { vendor: "deepgram", params: { model: "nova-3" } },
                llm: { params: { model: "gpt-4o-mini" } },
            },
        });
        // Explicit deepgram_nova_2 => no nova-3 inferred; gpt-4o-mini still inferred
        expect(result.preset).toContain("deepgram_nova_2");
        expect(result.preset).toContain("openai_gpt_4o_mini");
        expect(result.preset).not.toContain("deepgram_nova_3");
    });

    test("does not infer ASR preset when api_key is present", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                asr: { vendor: "deepgram", params: { api_key: "secret", model: "nova-3" } },
            },
        });
        expect(result.preset).toBeUndefined();
    });

    test("does not infer LLM preset for non-OpenAI URLs or when api_key present", () => {
        const withKey = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                llm: { api_key: "secret", params: { model: "gpt-4o-mini" } },
            },
        });
        expect(withKey.preset).toBeUndefined();

        const customUrl = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                llm: { url: "https://my-proxy.example.com/llm", params: { model: "gpt-4o-mini" } },
            },
        });
        expect(customUrl.preset).toBeUndefined();

        const azureVendor = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                llm: { vendor: "azure", params: { model: "gpt-4o-mini" } },
            },
        });
        expect(azureVendor.preset).toBeUndefined();
    });

    test("does not infer TTS preset when key present for minimax", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                tts: { vendor: "minimax", params: { key: "secret", model: "speech-2.6-turbo" } },
            },
        });
        expect(result.preset).toBeUndefined();
    });

    test("non-preset TTS vendor (microsoft) is left unchanged", () => {
        const result = resolveSessionPresets({
            properties: {
                channel: "c",
                token: "t",
                agent_rtc_uid: "1",
                remote_rtc_uids: ["2"],
                tts: { vendor: "microsoft", params: { key: "k", region: "eastus", voice_name: "Jenny" } },
            },
        });
        expect(result.preset).toBeUndefined();
        expect(result.properties.tts?.vendor).toBe("microsoft");
    });
});
