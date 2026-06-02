/**
 * Type-safe LLM (Large Language Model) vendor classes.
 */

import type { OpenAIPresetModel } from "../presets.js";
import type { LlmConfig } from "../types.js";
import { BaseLLM, type BaseLlmOptions } from "./base.js";

/**
 * Constructor options for OpenAI LLM.
 */
type OpenAICommonOptions = BaseLlmOptions & {
    /** OpenAI API key. Optional only for AgentKit-supported Agora-managed models. */
    apiKey?: string;
    /** Model name (e.g., 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo') */
    model: string;
    /** API endpoint URL */
    url?: string;
    /** Maximum number of conversation history messages to cache */
    maxHistory?: number;
    /** Sampling temperature (0.0–2.0) */
    temperature?: number;
    /** Nucleus sampling (0.0–1.0) */
    topP?: number;
    /** Maximum tokens to generate */
    maxTokens?: number;
    /** System messages for the LLM */
    systemMessages?: Record<string, unknown>[];
    /** Greeting message for the agent */
    greetingMessage?: string;
    /** Failure message when LLM call fails */
    failureMessage?: string;
    /** Input modalities (defaults to ["text"]) */
    inputModalities?: string[];
    /** Additional LLM parameters */
    params?: Record<string, unknown>;
    /** Custom headers forwarded to the LLM provider */
    headers?: Record<string, string>;
};

export type OpenAIOptions =
    | (OpenAICommonOptions & {
          apiKey: string;
          url: string;
      })
    | (Omit<OpenAICommonOptions, "model" | "url" | "vendor"> & {
          apiKey?: undefined;
          model: OpenAIPresetModel;
          url?: undefined;
          vendor?: undefined;
      });

/**
 * OpenAI LLM vendor (and OpenAI-compatible APIs).
 *
 * @example
 * ```typescript
 * const llm = new OpenAI({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4o',
 *   url: 'https://api.openai.com/v1/chat/completions',
 * });
 * ```
 */
export class OpenAI extends BaseLLM {
    private readonly options: OpenAIOptions;

    constructor(options: OpenAIOptions) {
        super(options);
        this.options = options;
    }

    toConfig(): LlmConfig {
        const {
            apiKey,
            model,
            url,
            maxHistory,
            temperature,
            topP,
            maxTokens,
            systemMessages,
            greetingMessage,
            failureMessage,
            inputModalities,
            params,
            headers,
        } = this.options;

        return {
            url: url ?? "https://api.openai.com/v1/chat/completions",
            ...(apiKey && { api_key: apiKey }),
            // model is the default; params entries extend it; named fields win.
            params: {
                model,
                ...params,
                ...(temperature !== undefined && { temperature }),
                ...(topP !== undefined && { top_p: topP }),
                ...(maxTokens !== undefined && { max_tokens: maxTokens }),
            },
            headers,
            max_history: maxHistory,
            system_messages: systemMessages,
            greeting_message: greetingMessage,
            failure_message: failureMessage,
            input_modalities: inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "openai",
            vendor: this.vendor,
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}

/**
 * Constructor options for Azure OpenAI LLM.
 */
export interface AzureOpenAIOptions extends BaseLlmOptions {
    /** Azure OpenAI API key */
    apiKey: string;
    /** Model/deployment name */
    model: string;
    /** Azure resource name (e.g., 'my-resource') */
    resourceName: string;
    /** Deployment name in Azure */
    deploymentName: string;
    /** Azure API version (defaults to '2024-08-01-preview') */
    apiVersion?: string;
    /** Maximum number of conversation history messages to cache */
    maxHistory?: number;
    /** Sampling temperature (0.0–2.0) */
    temperature?: number;
    /** Nucleus sampling (0.0–1.0) */
    topP?: number;
    /** Maximum tokens to generate */
    maxTokens?: number;
    /** System messages for the LLM */
    systemMessages?: Record<string, unknown>[];
    /** Greeting message for the agent */
    greetingMessage?: string;
    /** Failure message when LLM call fails */
    failureMessage?: string;
    /** Input modalities (defaults to ["text"]) */
    inputModalities?: string[];
    /** Additional LLM parameters */
    params?: Record<string, unknown>;
    /** Custom headers forwarded to the LLM provider */
    headers?: Record<string, string>;
}

/**
 * Azure OpenAI LLM vendor.
 *
 * @example
 * ```typescript
 * const llm = new AzureOpenAI({
 *   apiKey: process.env.AZURE_OPENAI_API_KEY,
 *   model: 'gpt-4',
 *   resourceName: 'my-azure-resource',
 *   deploymentName: 'gpt-4-deployment',
 * });
 * ```
 */
export class AzureOpenAI extends BaseLLM {
    private readonly options: AzureOpenAIOptions;

    constructor(options: AzureOpenAIOptions) {
        super(options);
        this.options = options;
    }

    toConfig(): LlmConfig {
        const {
            apiKey,
            model,
            resourceName,
            deploymentName,
            apiVersion = "2024-08-01-preview",
            maxHistory,
            temperature,
            topP,
            maxTokens,
            systemMessages,
            greetingMessage,
            failureMessage,
            inputModalities,
            params,
            headers,
        } = this.options;

        return {
            url: `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
            api_key: apiKey,
            // "azure" is required by Agora for Azure OpenAI; user-supplied vendor overrides if needed.
            vendor: this.vendor ?? "azure",
            // model is the default; params entries extend it; named fields win.
            params: {
                model,
                ...params,
                ...(temperature !== undefined && { temperature }),
                ...(topP !== undefined && { top_p: topP }),
                ...(maxTokens !== undefined && { max_tokens: maxTokens }),
            },
            headers,
            max_history: maxHistory,
            system_messages: systemMessages,
            greeting_message: greetingMessage,
            failure_message: failureMessage,
            input_modalities: inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "openai",
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}

/**
 * Constructor options for Anthropic Claude LLM.
 */
export interface AnthropicOptions extends BaseLlmOptions {
    /** Anthropic API key */
    apiKey: string;
    /** Model name (e.g., 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229') */
    model: string;
    /** API endpoint URL */
    url: string;
    /** Maximum number of conversation history messages to cache */
    maxHistory?: number;
    /** Maximum tokens to generate */
    maxTokens: number;
    /** Sampling temperature (0.0–1.0) */
    temperature?: number;
    /** Nucleus sampling (0.0–1.0) */
    topP?: number;
    /** System messages for the LLM */
    systemMessages?: Record<string, unknown>[];
    /** Greeting message for the agent */
    greetingMessage?: string;
    /** Failure message when LLM call fails */
    failureMessage?: string;
    /** Input modalities (defaults to ["text"]) */
    inputModalities?: string[];
    /** Additional LLM parameters */
    params?: Record<string, unknown>;
    /** Custom headers forwarded to the LLM provider */
    headers?: Record<string, string>;
}

/**
 * Anthropic Claude LLM vendor.
 *
 * @example
 * ```typescript
 * const llm = new Anthropic({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-3-5-sonnet-20241022',
 *   url: 'https://api.anthropic.com/v1/messages',
 *   headers: { 'anthropic-version': '2023-06-01' },
 *   maxTokens: 1024,
 * });
 * ```
 */
export class Anthropic extends BaseLLM {
    private readonly options: AnthropicOptions;

    constructor(options: AnthropicOptions) {
        super(options);
        this.options = options;
    }

    toConfig(): LlmConfig {
        const {
            apiKey,
            model,
            url,
            maxHistory,
            maxTokens,
            temperature,
            topP,
            systemMessages,
            greetingMessage,
            failureMessage,
            inputModalities,
            params,
            headers,
        } = this.options;

        return {
            url,
            api_key: apiKey,
            // model is the default; params entries extend it; named fields win.
            params: {
                model,
                ...params,
                ...(maxTokens !== undefined && { max_tokens: maxTokens }),
                ...(temperature !== undefined && { temperature }),
                ...(topP !== undefined && { top_p: topP }),
            },
            headers,
            max_history: maxHistory,
            system_messages: systemMessages,
            greeting_message: greetingMessage,
            failure_message: failureMessage,
            input_modalities: inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "anthropic",
            vendor: this.vendor,
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}

/**
 * Constructor options for Google Gemini LLM.
 */
export interface GeminiOptions extends BaseLlmOptions {
    /** Google API key */
    apiKey: string;
    /** Model name (e.g., 'gemini-pro', 'gemini-pro-vision') */
    model: string;
    /** API endpoint URL (defaults to Google's generativelanguage endpoint) */
    url?: string;
    /** Maximum number of conversation history messages to cache */
    maxHistory?: number;
    /** Sampling temperature (0.0–2.0) */
    temperature?: number;
    /** Nucleus sampling (0.0–1.0) */
    topP?: number;
    /** Top-k sampling */
    topK?: number;
    /** Maximum output tokens to generate */
    maxOutputTokens?: number;
    /** System messages for the LLM */
    systemMessages?: Record<string, unknown>[];
    /** Greeting message for the agent */
    greetingMessage?: string;
    /** Failure message when LLM call fails */
    failureMessage?: string;
    /** Input modalities (defaults to ["text"]) */
    inputModalities?: string[];
    /** Additional LLM parameters */
    params?: Record<string, unknown>;
    /** Custom headers forwarded to the LLM provider */
    headers?: Record<string, string>;
}

/**
 * Google Gemini LLM vendor.
 *
 * @example
 * ```typescript
 * const llm = new Gemini({
 *   apiKey: process.env.GOOGLE_API_KEY,
 *   model: 'gemini-pro',
 * });
 * ```
 */
export class Gemini extends BaseLLM {
    private readonly options: GeminiOptions;

    constructor(options: GeminiOptions) {
        super(options);
        this.options = options;
    }

    toConfig(): LlmConfig {
        const {
            apiKey,
            model,
            url,
            maxHistory,
            temperature,
            topP,
            topK,
            maxOutputTokens,
            systemMessages,
            greetingMessage,
            failureMessage,
            inputModalities,
            params,
            headers,
        } = this.options;

        return {
            url: url ?? "https://generativelanguage.googleapis.com/v1beta/models",
            api_key: apiKey,
            // model is the default; params entries extend it; named fields win.
            params: {
                model,
                ...params,
                ...(temperature !== undefined && { temperature }),
                ...(topP !== undefined && { top_p: topP }),
                ...(topK !== undefined && { top_k: topK }),
                ...(maxOutputTokens !== undefined && { max_output_tokens: maxOutputTokens }),
            },
            headers,
            max_history: maxHistory,
            system_messages: systemMessages,
            greeting_message: greetingMessage,
            failure_message: failureMessage,
            input_modalities: inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "gemini",
            vendor: this.vendor,
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}

type OpenAIStyleOptions = BaseLlmOptions & {
    apiKey: string;
    model: string;
    url: string;
    maxHistory?: number;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    systemMessages?: Record<string, unknown>[];
    greetingMessage?: string;
    failureMessage?: string;
    inputModalities?: string[];
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
};

function openAIStyleConfig(options: OpenAIStyleOptions, vendor?: string): LlmConfig {
    return {
        url: options.url,
        api_key: options.apiKey,
        params: {
            model: options.model,
            ...options.params,
            ...(options.temperature !== undefined && { temperature: options.temperature }),
            ...(options.topP !== undefined && { top_p: options.topP }),
            ...(options.maxTokens !== undefined && { max_tokens: options.maxTokens }),
        },
        headers: options.headers,
        max_history: options.maxHistory,
        system_messages: options.systemMessages,
        greeting_message: options.greetingMessage,
        failure_message: options.failureMessage,
        input_modalities: options.inputModalities ?? ["text"],
        output_modalities: options.outputModalities,
        style: "openai",
        vendor: options.vendor ?? vendor,
        greeting_configs: options.greetingConfigs,
        template_variables: options.templateVariables,
        mcp_servers: options.mcpServers,
    };
}

export type GroqOptions = OpenAIStyleOptions;

export class Groq extends BaseLLM {
    constructor(private readonly options: GroqOptions) {
        super(options);
    }

    toConfig(): LlmConfig {
        return openAIStyleConfig(this.options);
    }
}

export type CustomLLMOptions = OpenAIStyleOptions;

export class CustomLLM extends BaseLLM {
    constructor(private readonly options: CustomLLMOptions) {
        super(options);
    }

    toConfig(): LlmConfig {
        return openAIStyleConfig(this.options, "custom");
    }
}

export interface VertexAILLMOptions extends BaseLlmOptions {
    apiKey: string;
    model: string;
    projectId: string;
    location: string;
    url?: string;
    maxHistory?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    systemMessages?: Record<string, unknown>[];
    greetingMessage?: string;
    failureMessage?: string;
    inputModalities?: string[];
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export class VertexAILLM extends BaseLLM {
    constructor(private readonly options: VertexAILLMOptions) {
        super(options);
    }

    toConfig(): LlmConfig {
        const o = this.options;
        return {
            url: o.url ?? "https://aiplatform.googleapis.com/v1/projects",
            api_key: o.apiKey,
            params: {
                model: o.model,
                project_id: o.projectId,
                location: o.location,
                ...o.params,
                ...(o.temperature !== undefined && { temperature: o.temperature }),
                ...(o.topP !== undefined && { topP: o.topP }),
                ...(o.topK !== undefined && { topK: o.topK }),
                ...(o.maxOutputTokens !== undefined && { maxOutputTokens: o.maxOutputTokens }),
            },
            headers: o.headers,
            max_history: o.maxHistory,
            system_messages: o.systemMessages,
            greeting_message: o.greetingMessage,
            failure_message: o.failureMessage,
            input_modalities: o.inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "gemini",
            vendor: this.vendor,
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}

export interface AmazonBedrockOptions extends BaseLlmOptions {
    /** AWS access key ID. */
    accessKey: string;
    /** AWS secret access key. */
    secretKey: string;
    /** AWS region. */
    region: string;
    model: string;
    maxHistory?: number;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    systemMessages?: Record<string, unknown>[];
    greetingMessage?: string;
    failureMessage?: string;
    inputModalities?: string[];
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export class AmazonBedrock extends BaseLLM {
    constructor(private readonly options: AmazonBedrockOptions) {
        super(options);
    }

    toConfig(): LlmConfig {
        const o = this.options;
        return {
            url: `https://bedrock-runtime.${o.region}.amazonaws.com/model/${o.model}/converse-stream`,
            access_key: o.accessKey,
            secret_key: o.secretKey,
            region: o.region,
            model: o.model,
            params: {
                ...o.params,
                ...(o.maxTokens !== undefined && { max_tokens: o.maxTokens }),
                ...(o.temperature !== undefined && { temperature: o.temperature }),
                ...(o.topP !== undefined && { top_p: o.topP }),
                ...(o.topK !== undefined && { top_k: o.topK }),
            },
            headers: o.headers,
            max_history: o.maxHistory,
            system_messages: o.systemMessages,
            greeting_message: o.greetingMessage,
            failure_message: o.failureMessage,
            input_modalities: o.inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "bedrock",
            vendor: this.vendor,
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}

export interface DifyOptions extends BaseLlmOptions {
    apiKey: string;
    url: string;
    model: string;
    user?: string;
    conversationId?: string;
    maxHistory?: number;
    systemMessages?: Record<string, unknown>[];
    greetingMessage?: string;
    failureMessage?: string;
    inputModalities?: string[];
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export class Dify extends BaseLLM {
    constructor(private readonly options: DifyOptions) {
        super(options);
    }

    toConfig(): LlmConfig {
        const o = this.options;
        return {
            url: o.url,
            api_key: o.apiKey,
            params: {
                model: o.model,
                ...o.params,
                ...(o.user !== undefined && { user: o.user }),
                ...(o.conversationId !== undefined && { conversation_id: o.conversationId }),
            },
            headers: o.headers,
            max_history: o.maxHistory,
            system_messages: o.systemMessages,
            greeting_message: o.greetingMessage,
            failure_message: o.failureMessage,
            input_modalities: o.inputModalities ?? ["text"],
            output_modalities: this.outputModalities,
            style: "dify",
            vendor: this.vendor,
            greeting_configs: this.greetingConfigs,
            template_variables: this.templateVariables,
            mcp_servers: this.mcpServers,
        };
    }
}
