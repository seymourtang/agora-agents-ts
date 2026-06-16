import { Area } from "../../core/domain/index.js";
import { AgoraClient } from "../../AgoraPoolClient.js";
import { Agent } from "../Agent.js";

const client = new AgoraClient({
    area: Area.US,
    appId: "app-id",
    appCertificate: "app-certificate",
});

new Agent({
    client,
    name: "assistant",
    turnDetection: { language: "en-US" },
})
    .withStt(client.vendors.stt.deepgram({ model: "nova-3", language: "en-US" }))
    .withLlm(client.vendors.llm.openai({ model: "gpt-5-mini" }))
    .withTts(client.vendors.tts.minimax({ model: "speech-2.6-turbo", voiceId: "English_captivating_female1" }))
    .createSession({
        channel: "test-room",
        agentUid: "1",
        remoteUids: ["100"],
    });

// @ts-expect-error global client should not expose CN STT vendors.
client.vendors.stt.fengming();
// @ts-expect-error global client should not expose CN LLM vendors.
client.vendors.llm.aliyun({ url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", model: "qwen-plus" });
// @ts-expect-error global client should not expose CN TTS vendors.
client.vendors.tts.stepfun({ apiKey: "stepfun-key", model: "step-tts-mini" });

{
    const client = new AgoraClient({
        area: Area.CN,
        appId: "app-id",
        appCertificate: "app-certificate",
    });

    new Agent({
        client,
        name: "assistant",
        turnDetection: { language: "zh-CN" },
    })
        .withStt(client.vendors.stt.fengming())
        .withLlm(
            client.vendors.llm.aliyun({
                url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                model: "qwen-plus",
            }),
        )
        .withTts(
            client.vendors.tts.minimax({
                key: "minimax-key",
                model: "speech-01-turbo",
                voiceSetting: { voice_id: "female-shaonv" },
                audioSetting: { sample_rate: 16000 },
            }),
        )
        .createSession({
            channel: "cn-room",
            agentUid: "1",
            remoteUids: ["100"],
        });

    // @ts-expect-error CN client should not expose global STT vendors.
    client.vendors.stt.deepgram({ model: "nova-3", language: "en-US" });
    // @ts-expect-error CN client should not expose global LLM vendors.
    client.vendors.llm.openai({ model: "gpt-5-mini" });
    // @ts-expect-error CN client should not expose global TTS vendors.
    client.vendors.tts.elevenlabs({
        key: "eleven-key",
        modelId: "eleven_flash_v2_5",
        voiceId: "voice-id",
        baseUrl: "wss://api.elevenlabs.io/v1",
    });
}
