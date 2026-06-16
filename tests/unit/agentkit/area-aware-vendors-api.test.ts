import { describe, expect, test } from "vitest";
import { Agent, AgoraClient, Area } from "../../../src/index.js";

describe("AgoraClient vendors + Agent(client=...) API", () => {
    test("global client exposes global vendor factories", () => {
        const client = new AgoraClient({
            area: Area.US,
            appId: "app-id",
            appCertificate: "app-certificate",
        });

        const stt = client.vendors.stt.deepgram({ model: "nova-3", language: "en-US" }).toConfig();
        const llm = client.vendors.llm.openai({ model: "gpt-5-mini" }).toConfig();
        const tts = client.vendors.tts.minimax({
            model: "speech-2.6-turbo",
            voiceId: "English_captivating_female1",
        }).toConfig();

        expect(stt.vendor).toBe("deepgram");
        expect(llm.vendor).toBeUndefined();
        expect(tts.vendor).toBe("minimax");
    });

    test("cn client exposes cn vendor factories", () => {
        const client = new AgoraClient({
            area: Area.CN,
            appId: "app-id",
            appCertificate: "app-certificate",
        });

        const stt = client.vendors.stt.fengming().toConfig();
        const microsoftStt = client.vendors.stt.microsoft({
            key: "ms-key",
            region: "chinaeast2",
            language: "zh-CN",
        }).toConfig();
        const llm = client.vendors.llm.aliyun({
            url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
            model: "qwen-plus",
        }).toConfig();
        const customLlm = client.vendors.llm.custom({
            apiKey: "cn-custom-key",
            url: "https://llm.example.cn/chat/completions",
            model: "custom-model",
        }).toConfig();
        const tts = client.vendors.tts.minimax({
            key: "minimax-key",
            model: "speech-01-turbo",
            voiceSetting: { voice_id: "female-shaonv" },
            audioSetting: { sample_rate: 16000 },
        }).toConfig();
        const microsoftTts = client.vendors.tts.microsoft({
            key: "ms-key",
            region: "chinaeast2",
            voiceName: "zh-CN-YunxiNeural",
            sampleRate: 24000,
        }).toConfig();

        expect(stt.vendor).toBe("fengming");
        expect(microsoftStt.vendor).toBe("microsoft");
        expect(llm.vendor).toBe("aliyun");
        expect(customLlm.vendor).toBe("custom");
        expect(tts.vendor).toBe("minimax");
        expect(microsoftTts.vendor).toBe("microsoft");
        expect((tts.params as Record<string, unknown>).audio_setting).toEqual({ sample_rate: 16000 });
    });

    test("Agent binds client and creates sessions without re-passing client", () => {
        const client = new AgoraClient({
            area: Area.US,
            appId: "app-id",
            appCertificate: "app-certificate",
        });

        const agent = new Agent({
            client,
            name: "assistant",
            turnDetection: { language: "en-US" },
        })
            .withStt(client.vendors.stt.deepgram({ model: "nova-3", language: "en-US" }))
            .withLlm(client.vendors.llm.openai({ model: "gpt-5-mini" }))
            .withTts(
                client.vendors.tts.minimax({
                    model: "speech-2.6-turbo",
                    voiceId: "English_captivating_female1",
                }),
            );

        const session = agent.createSession({
            channel: "test-room",
            agentUid: "1",
            remoteUids: ["100"],
        });

        expect(session.agent.config.name).toBe("assistant");
        expect(session.appId).toBe("app-id");
    });
});
