/**
 * Type-safe STT (Speech-to-Text) vendor classes.
 */

import type { DeepgramPresetModel } from "../presets.js";
import type { InteractionLanguage, SttConfig } from "../types.js";
import { BaseSTT } from "./base.js";

const INTERACTION_LANGUAGES = new Set<string>([
    "ar-EG",
    "ar-JO",
    "ar-SA",
    "ar-AE",
    "bn-IN",
    "zh-CN",
    "zh-HK",
    "zh-TW",
    "nl-NL",
    "en-IN",
    "en-US",
    "fil-PH",
    "fr-FR",
    "de-DE",
    "gu-IN",
    "he-IL",
    "hi-IN",
    "id-ID",
    "it-IT",
    "ja-JP",
    "kn-IN",
    "ko-KR",
    "ms-MY",
    "fa-IR",
    "pt-PT",
    "ru-RU",
    "es-ES",
    "ta-IN",
    "te-IN",
    "th-TH",
    "tr-TR",
    "vi-VN",
]);

function toInteractionLanguage(language?: string, interactionLanguage?: InteractionLanguage): InteractionLanguage | undefined {
    if (interactionLanguage !== undefined) return interactionLanguage;
    return language !== undefined && INTERACTION_LANGUAGES.has(language) ? (language as InteractionLanguage) : undefined;
}

/**
 * Constructor options for Speechmatics STT.
 */
export interface SpeechmaticsSTTOptions {
    /** Speechmatics API key */
    apiKey: string;
    /** Language code (e.g., 'en', 'es', 'fr') */
    language: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Model name */
    model?: string;
    /** Speechmatics streaming WebSocket URL (for example, wss://eu2.rt.speechmatics.com/v2) */
    uri?: string;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Speechmatics STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new SpeechmaticsSTT({
 *   apiKey: process.env.SPEECHMATICS_API_KEY,
 *   language: 'en',
 * });
 * ```
 */
export class SpeechmaticsSTT extends BaseSTT {
    private readonly options: SpeechmaticsSTTOptions;

    constructor(options: SpeechmaticsSTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { apiKey, language, interactionLanguage, model, uri, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "speechmatics",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                api_key: apiKey,
                language,
                ...(model !== undefined && { model }),
                ...(uri !== undefined && { uri }),
            },
        };
    }
}

/**
 * Constructor options for Deepgram STT.
 */
type DeepgramSTTCommonOptions = {
    /** Deepgram API key. Optional only for the Agora-managed `nova-2` and `nova-3` path. */
    apiKey?: string;
    /** Model to use (e.g., 'nova-2', 'enhanced', 'base') */
    model?: string;
    /** Language code (e.g., 'en-US', 'es', 'fr') */
    language?: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Enable smart formatting */
    smartFormat?: boolean;
    /** Enable punctuation */
    punctuation?: boolean;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
};

export type DeepgramSTTOptions =
    | (DeepgramSTTCommonOptions & {
          apiKey: string;
      })
    | (Omit<DeepgramSTTCommonOptions, "model"> & {
          apiKey?: undefined;
          model: DeepgramPresetModel;
      });

/**
 * Deepgram STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new DeepgramSTT({
 *   apiKey: process.env.DEEPGRAM_API_KEY,
 *   model: 'nova-2',
 *   smartFormat: true,
 * });
 * ```
 */
export class DeepgramSTT extends BaseSTT {
    private readonly options: DeepgramSTTCommonOptions;

    constructor(options?: DeepgramSTTOptions) {
        super();
        this.options = options ?? {};
    }

    toConfig(): SttConfig {
        const { apiKey, model, language, interactionLanguage, smartFormat, punctuation, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "deepgram",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                ...(apiKey && { key: apiKey }),
                ...(model && { model }),
                ...(language && { language }),
                ...(smartFormat !== undefined && { smart_format: smartFormat }),
                ...(punctuation !== undefined && { punctuation }),
            },
        };
    }
}

/**
 * Constructor options for Microsoft Azure Speech STT.
 */
export interface MicrosoftSTTOptions {
    /** Microsoft Azure subscription key */
    key: string;
    /** Azure region (e.g., 'eastus', 'westus') */
    region: string;
    /** Language code (e.g., 'en-US', 'es-ES') */
    language: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Microsoft Azure Speech STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new MicrosoftSTT({
 *   key: process.env.AZURE_SPEECH_KEY,
 *   region: 'eastus',
 *   language: 'en-US',
 * });
 * ```
 */
export class MicrosoftSTT extends BaseSTT {
    private readonly options: MicrosoftSTTOptions;

    constructor(options: MicrosoftSTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { key, region, language, interactionLanguage, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "microsoft",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                key,
                region,
                ...(language && { language }),
            },
        };
    }
}

/**
 * Constructor options for OpenAI Whisper STT.
 */
export interface OpenAISTTOptions {
    /** OpenAI API key */
    apiKey: string;
    /** Model to use (default: 'whisper-1') */
    model?: string;
    /** Language code */
    language?: string;
    /** Prompt that guides OpenAI transcription */
    prompt?: string;
    /** Full OpenAI input_audio_transcription override */
    inputAudioTranscription?: Record<string, unknown>;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * OpenAI Whisper STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new OpenAISTT({
 *   apiKey: process.env.OPENAI_API_KEY,
 * });
 * ```
 */
export class OpenAISTT extends BaseSTT {
    private readonly options: OpenAISTTOptions;

    constructor(options: OpenAISTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { apiKey, model, language, prompt, inputAudioTranscription, interactionLanguage, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);
        const transcription = {
            model: "whisper-1",
            ...inputAudioTranscription,
            ...(model && { model }),
            ...(prompt && { prompt }),
            ...(language && { language }),
        };

        return {
            vendor: "openai",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                api_key: apiKey,
                input_audio_transcription: transcription,
            },
        };
    }
}

/**
 * Constructor options for Google Cloud Speech-to-Text STT.
 */
export interface GoogleSTTOptions {
    /** Google Cloud project ID where Speech-to-Text is enabled */
    projectId: string;
    /** Google Cloud region for the recognizer (for example, global) */
    location: string;
    /** Google service account credentials JSON string */
    adcCredentialsString: string;
    /** Language code (e.g., 'en-US', 'es-ES') */
    language: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Recognition model to use */
    model?: string;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Google Cloud Speech-to-Text STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new GoogleSTT({
 *   projectId: process.env.GOOGLE_ASR_PROJECT_ID,
 *   location: 'global',
 *   adcCredentialsString: process.env.GOOGLE_APPLICATION_CREDENTIALS_STRING,
 *   language: 'en-US',
 * });
 * ```
 */
export class GoogleSTT extends BaseSTT {
    private readonly options: GoogleSTTOptions;

    constructor(options: GoogleSTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { projectId, location, adcCredentialsString, language, interactionLanguage, model, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "google",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                project_id: projectId,
                location,
                adc_credentials_string: adcCredentialsString,
                ...(language && { language }),
                ...(model && { model }),
            },
        };
    }
}

/**
 * Constructor options for Amazon Transcribe STT.
 */
export interface AmazonSTTOptions {
    /** AWS Access Key ID */
    accessKey: string;
    /** AWS Secret Access Key */
    secretKey: string;
    /** AWS region (e.g., 'us-east-1') */
    region: string;
    /** Language code */
    language: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Amazon Transcribe STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new AmazonSTT({
 *   accessKey: process.env.AWS_ACCESS_KEY_ID,
 *   secretKey: process.env.AWS_SECRET_ACCESS_KEY,
 *   region: 'us-east-1',
 *   language: 'en-US',
 * });
 * ```
 */
export class AmazonSTT extends BaseSTT {
    private readonly options: AmazonSTTOptions;

    constructor(options: AmazonSTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { accessKey, secretKey, region, language, interactionLanguage, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "amazon",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                access_key_id: accessKey,
                secret_access_key: secretKey,
                region,
                ...(language && { language_code: language }),
            },
        };
    }
}

/**
 * Constructor options for AssemblyAI STT.
 */
export interface AssemblyAISTTOptions {
    /** AssemblyAI API key */
    apiKey: string;
    /** Language code */
    language: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** AssemblyAI streaming WebSocket URL */
    uri?: string;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * AssemblyAI STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new AssemblyAISTT({
 *   apiKey: process.env.ASSEMBLYAI_API_KEY,
 *   language: 'en-US',
 * });
 * ```
 */
export class AssemblyAISTT extends BaseSTT {
    private readonly options: AssemblyAISTTOptions;

    constructor(options: AssemblyAISTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { apiKey, language, interactionLanguage, uri, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "assemblyai",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                api_key: apiKey,
                ...(language && { language }),
                ...(uri && { uri }),
            },
        };
    }
}

/**
 * Constructor options for Agora ARES STT.
 */
export interface AresSTTOptions {
    /** Language code for ARES ASR */
    language?: InteractionLanguage;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Agora ARES (Adaptive Recognition Engine for Speech) STT vendor.
 *
 * @example
 * ```typescript
 * const stt = new AresSTT({
 *   language: 'en-US',
 * });
 * ```
 */
export class AresSTT extends BaseSTT {
    private readonly options: AresSTTOptions;

    constructor(options: AresSTTOptions = {}) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { language, additionalParams } = this.options;

        return {
            vendor: "ares",
            ...(language && { language }),
            ...(additionalParams && Object.keys(additionalParams).length > 0 && { params: additionalParams }),
        };
    }
}

/**
 * Constructor options for Sarvam STT.
 */
export interface SarvamSTTOptions {
    /** Sarvam API key */
    apiKey: string;
    /** Language code (e.g., 'en', 'hi', 'ta') */
    language: string;
    /** Agora interaction language for `asr.language` (BCP-47, finite supported set). */
    interactionLanguage?: InteractionLanguage;
    /** Model name */
    model?: string;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Sarvam STT vendor (Beta).
 *
 * @example
 * ```typescript
 * const stt = new SarvamSTT({
 *   apiKey: process.env.SARVAM_API_KEY,
 *   language: 'en',
 * });
 * ```
 */
export class SarvamSTT extends BaseSTT {
    private readonly options: SarvamSTTOptions;

    constructor(options: SarvamSTTOptions) {
        super();
        this.options = options;
    }

    toConfig(): SttConfig {
        const { apiKey, language, interactionLanguage, model, additionalParams } = this.options;
        const asrLanguage = toInteractionLanguage(language, interactionLanguage);

        return {
            vendor: "sarvam",
            ...(asrLanguage && { language: asrLanguage }),
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                api_key: apiKey,
                language,
                ...(model !== undefined && { model }),
            },
        };
    }
}
