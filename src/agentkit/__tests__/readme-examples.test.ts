import { Area } from "../../core/domain/index.js";
import { AgoraClient } from "../../AgoraPoolClient.js";
import { Agent } from "../Agent.js";

const AGENT_PROMPT = "You are a concise, technically credible voice assistant. Keep replies short unless the user asks for detail.";
const GREETING = "Hi there! I am your Agora voice assistant. How can I help?";
const SUPPORT_PROMPT = "You are a concise support assistant.";

const client = new AgoraClient({
    area: Area.US,
    appId: "app-id",
    appCertificate: "app-certificate",
});

new Agent({
    client,
    name: `conversation-${Date.now()}`,
    turnDetection: {
        language: "en-US",
        config: {
            speech_threshold: 0.5,
            start_of_speech: {
                mode: "vad",
                vad_config: {
                    interrupt_duration_ms: 160,
                    prefix_padding_ms: 300,
                },
            },
            end_of_speech: {
                mode: "vad",
                vad_config: {
                    silence_duration_ms: 480,
                },
            },
        },
    },
    advancedFeatures: {
        enable_rtm: true,
        enable_tools: true,
    },
    parameters: {
        data_channel: "rtm",
        enable_error_message: true,
    },
})
    .withStt(client.vendors.stt.deepgram({ model: "nova-3", language: "en" }))
    .withLlm(
        client.vendors.llm.openai({
            model: "gpt-4o-mini",
            systemMessages: [{ role: "system", content: AGENT_PROMPT }],
            greetingMessage: GREETING,
            failureMessage: "Please wait a moment.",
            maxHistory: 50,
            params: {
                max_tokens: 1024,
                temperature: 0.7,
                top_p: 0.95,
            },
        }),
    )
    .withTts(
        client.vendors.tts.minimax({
            model: "speech_2_6_turbo",
            voiceId: "English_captivating_female1",
        }),
    )
    .createSession({
        channel: `demo-channel-${Date.now()}`,
        agentUid: "123456",
        remoteUids: ["*"],
        idleTimeout: 30,
    });

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
            agentUid: "1001",
            remoteUids: ["100"],
        });
}

{
    const client = new AgoraClient({
        area: Area.US,
        appId: "app-id",
        appCertificate: "app-certificate",
    });

    new Agent({ client, turnDetection: { language: "en-US" } })
        .withStt(
            client.vendors.stt.deepgram({
                apiKey: "deepgram-key",
                model: "nova-3",
                language: "en",
            }),
        )
        .withLlm(
            client.vendors.llm.openai({
                apiKey: "openai-key",
                url: "https://api.openai.com/v1/chat/completions",
                model: "gpt-4o-mini",
                systemMessages: [{ role: "system", content: SUPPORT_PROMPT }],
                greetingMessage: GREETING,
                maxTokens: 1024,
                temperature: 0.7,
                topP: 0.95,
            }),
        )
        .withTts(
            client.vendors.tts.minimax({
                key: "minimax-key",
                groupId: "minimax-group",
                model: "speech_2_6_turbo",
                voiceId: "English_captivating_female1",
                url: "wss://api-uw.minimax.io/ws/v1/t2a_v2",
            }),
        );
}
