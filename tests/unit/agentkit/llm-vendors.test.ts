import { describe, expect, test } from "vitest";
import { AmazonBedrock, Anthropic, CustomLLM, Dify, Groq, VertexAILLM } from "../../../src/agentkit/vendors/llm.js";

describe("LLM vendor helpers", () => {
    test("Groq serializes as OpenAI-compatible without exposing style choice", () => {
        expect(new Groq({ apiKey: "groq-key", model: "llama-3.3-70b-versatile", url: "https://api.groq.com/openai/v1/chat/completions" }).toConfig()).toMatchObject({
            url: "https://api.groq.com/openai/v1/chat/completions",
            api_key: "groq-key",
            style: "openai",
            params: { model: "llama-3.3-70b-versatile" },
        });
    });

    test("CustomLLM marks the request as custom", () => {
        expect(
            new CustomLLM({ apiKey: "key", model: "model", url: "https://llm.example.com/chat" }).toConfig(),
        ).toMatchObject({
            url: "https://llm.example.com/chat",
            api_key: "key",
            vendor: "custom",
            style: "openai",
        });
    });

    test("Anthropic serializes required Claude fields", () => {
        expect(new Anthropic({ apiKey: "anthropic-key", model: "claude-3-5-sonnet-20241022", url: "https://api.anthropic.com/v1/messages", headers: { "anthropic-version": "2023-06-01" }, maxTokens: 1024 }).toConfig()).toMatchObject({
            url: "https://api.anthropic.com/v1/messages",
            api_key: "anthropic-key",
            style: "anthropic",
            headers: { "anthropic-version": "2023-06-01" },
            params: {
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
            },
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

    test("AmazonBedrock serializes as Bedrock-style with top-level AWS routing", () => {
        expect(
            new AmazonBedrock({
                accessKey: "aws-access",
                secretKey: "aws-secret",
                region: "us-east-1",
                model: "anthropic.claude-3-5-sonnet-20241022-v2:0",
            }).toConfig(),
        ).toMatchObject({
            url: "https://bedrock-runtime.us-east-1.amazonaws.com/model/anthropic.claude-3-5-sonnet-20241022-v2:0/converse-stream",
            access_key: "aws-access",
            secret_key: "aws-secret",
            region: "us-east-1",
            model: "anthropic.claude-3-5-sonnet-20241022-v2:0",
            style: "bedrock",
        });
    });

    test("Dify serializes conversation fields in Dify params", () => {
        expect(
            new Dify({
                apiKey: "dify-key",
                url: "https://api.dify.ai/v1/chat-messages",
                model: "default",
                user: "user-1",
                conversationId: "conversation-1",
            }).toConfig(),
        ).toMatchObject({
            api_key: "dify-key",
            style: "dify",
            params: { model: "default", user: "user-1", conversation_id: "conversation-1" },
        });
    });
});
