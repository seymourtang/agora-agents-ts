import { describe, expect, test } from "vitest";
import { Agent, AgoraClient, Area, DeepgramSTT, MiniMaxTTS, OpenAI } from "../../../src/index.js";

describe("AgoraClient + Agent API", () => {
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
            .withStt(new DeepgramSTT({ model: "nova-3", language: "en-US" }))
            .withLlm(new OpenAI({ model: "gpt-5-mini" }))
            .withTts(
                new MiniMaxTTS({
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

    test("client.agent() binds client and creates sessions without re-passing client", () => {
        const client = new AgoraClient({
            area: Area.US,
            appId: "app-id",
            appCertificate: "app-certificate",
        });

        const agent = client
            .agent({
                name: "assistant",
                turnDetection: { language: "en-US" },
            })
            .withStt(new DeepgramSTT({ model: "nova-3", language: "en-US" }))
            .withLlm(new OpenAI({ model: "gpt-5-mini" }))
            .withTts(
                new MiniMaxTTS({
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
