import type * as Agora from "../api/index.js";

export const AgentPresets = {
    asr: {
        deepgramNova2: "deepgram_nova_2",
        deepgramNova3: "deepgram_nova_3",
    },
    llm: {
        openaiGpt4oMini: "openai_gpt_4o_mini",
        openaiGpt41Mini: "openai_gpt_4_1_mini",
        openaiGpt5Nano: "openai_gpt_5_nano",
        openaiGpt5Mini: "openai_gpt_5_mini",
    },
    tts: {
        minimaxSpeech26Turbo: "minimax_speech_2_6_turbo",
        minimaxSpeech28Turbo: "minimax_speech_2_8_turbo",
        openaiTts1: "openai_tts_1",
    },
} as const;

export const DeepgramPresetModels = ["nova-2", "nova-3"] as const;
export const OpenAIPresetModels = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-5-nano", "gpt-5-mini"] as const;
export const OpenAITtsPresetModels = ["tts-1"] as const;
export const MiniMaxPresetModels = [
    "speech-2.6-turbo",
    "speech_2_6_turbo",
    "speech-2.8-turbo",
    "speech_2_8_turbo",
] as const;

export type AsrPreset = (typeof AgentPresets.asr)[keyof typeof AgentPresets.asr];
export type LlmPreset = (typeof AgentPresets.llm)[keyof typeof AgentPresets.llm];
export type TtsPreset = (typeof AgentPresets.tts)[keyof typeof AgentPresets.tts];
export type AgentPreset = AsrPreset | LlmPreset | TtsPreset;
export type PresetInput = AgentPreset | readonly AgentPreset[] | string;
export type DeepgramPresetModel = (typeof DeepgramPresetModels)[number];
export type OpenAIPresetModel = (typeof OpenAIPresetModels)[number];
export type OpenAITtsPresetModel = (typeof OpenAITtsPresetModels)[number];
export type MiniMaxPresetModel = (typeof MiniMaxPresetModels)[number];

type PresetCategory = "asr" | "llm" | "tts";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const deepgramModelToPreset: Record<string, AsrPreset> = {
    "nova-2": AgentPresets.asr.deepgramNova2,
    "nova-3": AgentPresets.asr.deepgramNova3,
};
const openAiModelToPreset: Record<string, LlmPreset> = {
    "gpt-4o-mini": AgentPresets.llm.openaiGpt4oMini,
    "gpt-4.1-mini": AgentPresets.llm.openaiGpt41Mini,
    "gpt-5-nano": AgentPresets.llm.openaiGpt5Nano,
    "gpt-5-mini": AgentPresets.llm.openaiGpt5Mini,
};
const minimaxModelToPreset: Record<string, TtsPreset> = {
    "speech-2.6-turbo": AgentPresets.tts.minimaxSpeech26Turbo,
    speech_2_6_turbo: AgentPresets.tts.minimaxSpeech26Turbo,
    "speech-2.8-turbo": AgentPresets.tts.minimaxSpeech28Turbo,
    speech_2_8_turbo: AgentPresets.tts.minimaxSpeech28Turbo,
};

function normalizeModelName(value: unknown): string | undefined {
    return typeof value === "string" ? value.trim().toLowerCase() : undefined;
}

function getPresetCategory(preset: string): PresetCategory | undefined {
    if (Object.values(AgentPresets.asr).includes(preset as AsrPreset)) return "asr";
    if (Object.values(AgentPresets.llm).includes(preset as LlmPreset)) return "llm";
    if (Object.values(AgentPresets.tts).includes(preset as TtsPreset)) return "tts";
    return undefined;
}

function parsePresetInput(preset?: PresetInput | readonly string[]): string[] {
    if (preset == null) return [];
    if (Array.isArray(preset)) return preset.map((item) => item.trim()).filter(Boolean);
    if (typeof preset !== "string") return [];
    return preset
        .split(",")
        .map((item: string) => item.trim())
        .filter(Boolean);
}

function omitUndefinedKeys<T extends Record<string, unknown>>(value: T): T | undefined {
    const next = Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
    return Object.keys(next).length > 0 ? next : undefined;
}

function inferAsrPreset(asr?: Agora.StartAgentsRequest.Properties.Asr): AsrPreset | undefined {
    if (!asr || asr.vendor !== "deepgram" || asr.params?.api_key) return undefined;
    return deepgramModelToPreset[normalizeModelName(asr.params?.model) ?? ""];
}

function inferLlmPreset(llm?: Agora.StartAgentsRequest.Properties.Llm): LlmPreset | undefined {
    if (!llm || llm.api_key) return undefined;
    if (llm.vendor === "azure" || (llm.url && llm.url !== OPENAI_CHAT_COMPLETIONS_URL)) return undefined;
    return openAiModelToPreset[normalizeModelName(llm.params?.model) ?? ""];
}

function inferTtsPreset(tts?: Agora.Tts): TtsPreset | undefined {
    if (!tts) return undefined;
    if (tts.vendor === "openai") {
        if ((tts.params as unknown as Record<string, unknown> | undefined)?.api_key) return undefined;
        const model = normalizeModelName(tts.params?.model) ?? "tts-1";
        return model === "tts-1" ? AgentPresets.tts.openaiTts1 : undefined;
    }
    if (tts.vendor === "minimax") {
        if (tts.params?.key) return undefined;
        return minimaxModelToPreset[normalizeModelName(tts.params?.model) ?? ""];
    }
    return undefined;
}

function stripInferredPresetFields(
    properties: Agora.StartAgentsRequest.Properties,
    inferredPresets: AgentPreset[],
): Agora.StartAgentsRequest.Properties {
    const inferredCategories = new Set(inferredPresets.map(getPresetCategory).filter(Boolean));

    let asr = properties.asr;
    if (asr && inferredCategories.has("asr")) {
        const inferredPreset = inferAsrPreset(asr);
        asr = {
            ...asr,
            params: omitUndefinedKeys({
                ...asr.params,
                api_key: undefined,
                model:
                    inferredPreset &&
                    deepgramModelToPreset[normalizeModelName(asr.params?.model) ?? ""] === inferredPreset
                        ? undefined
                        : asr.params?.model,
            }),
        };
    }

    let llm = properties.llm;
    if (llm && inferredCategories.has("llm")) {
        const inferredPreset = inferLlmPreset(llm);
        const { url: llmUrl, ...llmRest } = llm;
        llm = {
            ...llmRest,
            api_key: undefined,
            ...(llmUrl && llmUrl !== OPENAI_CHAT_COMPLETIONS_URL && { url: llmUrl }),
            params: omitUndefinedKeys({
                ...llm.params,
                model:
                    inferredPreset &&
                    openAiModelToPreset[normalizeModelName(llm.params?.model) ?? ""] === inferredPreset
                        ? undefined
                        : llm.params?.model,
            }),
        };
    }

    let tts = properties.tts;
    if (tts && inferredCategories.has("tts")) {
        const inferredPreset = inferTtsPreset(tts);
        if (tts.vendor === "openai") {
            tts = {
                ...tts,
                params: omitUndefinedKeys({
                    ...tts.params,
                    api_key: undefined,
                    model:
                        inferredPreset === AgentPresets.tts.openaiTts1 &&
                        (normalizeModelName(tts.params?.model) ?? "tts-1") === "tts-1"
                            ? undefined
                            : tts.params?.model,
                }) as typeof tts.params,
            };
        } else if (tts.vendor === "minimax") {
            tts = {
                ...tts,
                params: omitUndefinedKeys({
                    ...tts.params,
                    key: undefined,
                    model:
                        inferredPreset &&
                        minimaxModelToPreset[normalizeModelName(tts.params?.model) ?? ""] === inferredPreset
                            ? undefined
                            : tts.params?.model,
                }) as unknown as typeof tts.params,
            };
        }
    }

    return { ...properties, asr, llm, tts };
}

export function normalizePresetInput(preset?: PresetInput | readonly string[]): string | undefined {
    const entries = parsePresetInput(preset);
    return entries.length > 0 ? entries.join(",") : undefined;
}

export function resolveSessionPresets(args: {
    preset?: PresetInput;
    properties: Agora.StartAgentsRequest.Properties;
}): { preset?: string; properties: Agora.StartAgentsRequest.Properties } {
    const explicitPresets = parsePresetInput(args.preset);
    const explicitCategories = new Set(explicitPresets.map(getPresetCategory).filter(Boolean));
    const inferredPresets: AgentPreset[] = [];

    if (!explicitCategories.has("asr")) {
        const preset = inferAsrPreset(args.properties.asr);
        if (preset) inferredPresets.push(preset);
    }
    if (!explicitCategories.has("llm")) {
        const preset = inferLlmPreset(args.properties.llm);
        if (preset) inferredPresets.push(preset);
    }
    if (!explicitCategories.has("tts")) {
        const preset = inferTtsPreset(args.properties.tts);
        if (preset) inferredPresets.push(preset);
    }

    return {
        preset: normalizePresetInput([...explicitPresets, ...inferredPresets]),
        properties: stripInferredPresetFields(args.properties, inferredPresets),
    };
}
