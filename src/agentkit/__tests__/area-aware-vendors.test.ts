import { Area } from "../../core/domain/index.js";
import { AgoraClient } from "../../AgoraPoolClient.js";
import { Agent } from "../Agent.js";
import { AliyunLLM, FengmingSTT, MiniMaxCNTTS } from "../vendors/cn.js";
import { OpenAI } from "../vendors/llm.js";
import { DeepgramSTT } from "../vendors/stt.js";
import { MiniMaxTTS } from "../vendors/tts.js";

const client = new AgoraClient({
    area: Area.US,
    appId: "app-id",
    appCertificate: "app-certificate",
});

client
    .agent({
        turnDetection: { language: "en-US" },
    })
    .withStt(new DeepgramSTT({ model: "nova-3", language: "en-US" }))
    .withLlm(new OpenAI({ model: "gpt-5-mini" }))
    .withTts(new MiniMaxTTS({ model: "speech-2.6-turbo", voiceId: "English_captivating_female1" }))
    .createSession({
        name: "assistant",
        channel: "test-room",
        agentUid: "1",
        remoteUids: ["100"],
    });

// Area and provider may differ.
client.agent({}).withStt(new FengmingSTT());
client.agent({}).withLlm(new AliyunLLM({ url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", model: "qwen-plus" }));
client.agent({}).withTts(new MiniMaxCNTTS({ key: "minimax-key", model: "speech-01-turbo", voiceSetting: { voice_id: "female-shaonv" } }));

{
    const client = new AgoraClient({
        area: Area.CN,
        appId: "app-id",
        appCertificate: "app-certificate",
    });

    client
        .agent({
            turnDetection: { language: "zh-CN" },
        })
        .withStt(new FengmingSTT())
        .withLlm(
            new AliyunLLM({
                url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                model: "qwen-plus",
            }),
        )
        .withTts(
            new MiniMaxCNTTS({
                key: "minimax-key",
                model: "speech-01-turbo",
                voiceSetting: { voice_id: "female-shaonv" },
                audioSetting: { sample_rate: 16000 },
            }),
        )
        .createSession({
            name: "assistant",
            channel: "cn-room",
            agentUid: "1",
            remoteUids: ["100"],
        });

    client.agent({}).withStt(new DeepgramSTT({ model: "nova-3", language: "en-US" }));
    client.agent({}).withLlm(new OpenAI({ model: "gpt-5-mini" }));
    client.agent({}).withTts(new MiniMaxTTS({ model: "speech-2.6-turbo", voiceId: "English_captivating_female1" }));
}

new Agent({
    client,
}).withStt(new DeepgramSTT({ model: "nova-3", language: "en-US" }));
