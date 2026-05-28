import { describe, expect, test } from "vitest";
import { AmazonBedrock, CustomLLM, Dify, Groq, VertexAILLM } from "../../../src/agentkit/vendors/llm.js";

describe("LLM vendor helpers", () => {
    test("Groq serializes as OpenAI-compatible without exposing style choice", () => {
        expect(new Groq({ apiKey: "groq-key", model: "llama-3.3-70b-versatile" }).toConfig()).toMatchObject({
            url: "https://api.groq.com/openai/v1/chat/completions",
            api_key: "groq-key",
            style: "openai",
            params: { model: "llama-3.3-70b-versatile" },
        });
    });

    test("CustomLLM marks the request as custom", () => {
        expect(new CustomLLM({ apiKey: "key", model: "model", url: "https://llm.example.com/chat" }).toConfig()).toMatchObject({
            url: "https://llm.example.com/chat",
            api_key: "key",
            vendor: "custom",
            style: "openai",
        });
    });

    test("VertexAILLM includes project routing in Gemini-style params", () => {
        expect(
            new VertexAILLM({
                apiKey: "vertex-token",
                model: "gemini-2.0-flash",
                projectId: "project",
                location: "us-central1",
            }).toConfig(),
        ).toMatchObject({
            api_key: "vertex-token",
            style: "gemini",
            params: {
                model: "gemini-2.0-flash",
                project_id: "project",
                location: "us-central1",
            },
        });
    });

    test("AmazonBedrock serializes as Anthropic-style", () => {
        expect(
            new AmazonBedrock({
                apiKey: "bedrock-key",
                url: "https://bedrock.example.com/messages",
                model: "anthropic.claude-3-5-sonnet-20241022-v2:0",
            }).toConfig(),
        ).toMatchObject({
            api_key: "bedrock-key",
            style: "anthropic",
            params: { model: "anthropic.claude-3-5-sonnet-20241022-v2:0" },
        });
    });

    test("Dify serializes conversation fields in Dify params", () => {
        expect(
            new Dify({
                apiKey: "dify-key",
                url: "https://api.dify.ai/v1/chat-messages",
                user: "user-1",
                conversationId: "conversation-1",
            }).toConfig(),
        ).toMatchObject({
            api_key: "dify-key",
            style: "dify",
            params: { user: "user-1", conversation_id: "conversation-1" },
        });
    });
});
