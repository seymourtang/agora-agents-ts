/**
 * Type-safe Avatar vendor classes.
 *
 * Avatar vendors provide visual representation for voice agents.
 * Different vendors have specific audio sample rate requirements.
 */

import { BaseAvatar } from "./base.js";
import type { HeyGenSampleRate, LiveAvatarSampleRate, AkoolSampleRate } from "./base.js";
import type { AvatarConfig } from "../types.js";

/**
 * Constructor options for HeyGen Avatar.
 */
export interface HeyGenAvatarOptions {
    /** HeyGen API key */
    apiKey: string;
    /** Video quality: "low" (360p), "medium" (480p), or "high" (720p) */
    quality: "low" | "medium" | "high";
    /** RTC UID for the avatar (must be unique in the channel) */
    agoraUid: string;
    /** RTC token for avatar authentication */
    agoraToken?: string;
    /** HeyGen avatar ID */
    avatarId?: string;
    /** Whether to disable idle timeout (default: false) */
    disableIdleTimeout?: boolean;
    /** Idle timeout in seconds (default: 120, only applies if disableIdleTimeout is false) */
    activityIdleTimeout?: number;
    /** Enable avatar (default: true) */
    enable?: boolean;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * HeyGen Avatar vendor.
 *
 * @deprecated HeyGen has been renamed to LiveAvatar. Use {@link LiveAvatarAvatar} instead.
 * This class emits `vendor: "heygen"` for backward compatibility. New deployments
 * should use `LiveAvatarAvatar` which emits `vendor: "liveavatar"`.
 *
 * ⚠️ IMPORTANT: HeyGen avatars ONLY support audio with a sample rate of 24,000 Hz.
 * You must configure your TTS with a 24kHz sample rate or the request will fail.
 *
 * @see https://docs.agora.io/en/conversational-ai/models/avatar/heygen
 */
export class HeyGenAvatar extends BaseAvatar<HeyGenSampleRate> {
    private readonly options: HeyGenAvatarOptions;

    /**
     * HeyGen avatars require TTS sample rate of 24,000 Hz.
     */
    readonly requiredSampleRate = 24000 as const;

    constructor(options: HeyGenAvatarOptions) {
        super();
        this.options = options;

        // Defense-in-depth checks for JavaScript callers that bypass TypeScript types.
        // TypeScript's union type already prevents invalid quality values at compile time.
        // At session start, validateAvatarConfig() in avatar-types.ts performs the same
        // checks on the converted API-format config — two separate layers for two separate
        // object representations (camelCase options here vs. snake_case API config there).
        if (!options.apiKey) {
            throw new Error("HeyGen avatar requires apiKey");
        }
        if (!options.agoraUid) {
            throw new Error("HeyGen avatar requires agoraUid");
        }
    }

    toConfig(): AvatarConfig {
        const {
            apiKey,
            quality,
            agoraUid,
            agoraToken,
            avatarId,
            disableIdleTimeout,
            activityIdleTimeout,
            enable = true,
            additionalParams,
        } = this.options;

        return {
            enable,
            vendor: "heygen",
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                api_key: apiKey,
                quality,
                agora_uid: agoraUid,
                ...(agoraToken && { agora_token: agoraToken }),
                ...(avatarId && { avatar_id: avatarId }),
                ...(disableIdleTimeout !== undefined && { disable_idle_timeout: disableIdleTimeout }),
                ...(activityIdleTimeout !== undefined && { activity_idle_timeout: activityIdleTimeout }),
            },
        };
    }
}

/**
 * Constructor options for Akool Avatar.
 */
export interface AkoolAvatarOptions {
    /** Akool API key */
    apiKey: string;
    /** Akool avatar ID */
    avatarId?: string;
    /** Enable avatar (default: true) */
    enable?: boolean;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Akool Avatar vendor.
 *
 * ⚠️ IMPORTANT: Akool avatars ONLY support audio with a sample rate of 16,000 Hz.
 * You must configure your TTS with a 16kHz sample rate or the request will fail.
 *
 * @example
 * ```typescript
 * import { Agent, AkoolAvatar, ElevenLabsTTS } from 'agora-agent-server-sdk';
 *
 * const avatar = new AkoolAvatar({
 *   apiKey: process.env.AKOOL_API_KEY,
 *   avatarId: 'avatar-id',
 * });
 *
 * // TTS must declare sampleRate: 16000 so withAvatar() enforces the match at compile time.
 * const tts = new ElevenLabsTTS({
 *   key: process.env.ELEVENLABS_API_KEY,
 *   modelId: 'eleven_flash_v2_5',
 *   voiceId: 'voice-id',
 *   sampleRate: 16000, // Required for Akool
 * });
 *
 * const agent = new Agent({ name: 'avatar-assistant' })
 *   .withTts(tts)
 *   .withAvatar(avatar);
 * ```
 *
 * @see https://docs.agora.io/en/conversational-ai/models/avatar/akool
 */
export class AkoolAvatar extends BaseAvatar<AkoolSampleRate> {
    private readonly options: AkoolAvatarOptions;

    /**
     * Akool avatars require TTS sample rate of 16,000 Hz.
     */
    readonly requiredSampleRate = 16000 as const;

    constructor(options: AkoolAvatarOptions) {
        super();
        this.options = options;

        // Defense-in-depth check for JavaScript callers that bypass TypeScript types.
        // See HeyGenAvatar constructor for the two-layer validation rationale.
        if (!options.apiKey) {
            throw new Error("Akool avatar requires apiKey");
        }
    }

    toConfig(): AvatarConfig {
        const { apiKey, avatarId, enable = true, additionalParams } = this.options;

        return {
            enable,
            vendor: "akool",
            params: {
                // additionalParams spread first so that explicit fields always win.
                ...additionalParams,
                api_key: apiKey,
                ...(avatarId && { avatar_id: avatarId }),
            },
        };
    }
}

// =============================================================================
// LiveAvatar (formerly HeyGen)
// =============================================================================

/**
 * Constructor options for LiveAvatar (formerly HeyGen).
 */
export type LiveAvatarAvatarOptions = HeyGenAvatarOptions;

/**
 * LiveAvatar avatar vendor (formerly HeyGen).
 *
 * ⚠️ IMPORTANT: LiveAvatar ONLY supports audio with a sample rate of 24,000 Hz.
 * You must configure your TTS with a 24kHz sample rate or the request will fail.
 *
 * @example
 * ```typescript
 * import { Agent, LiveAvatarAvatar, ElevenLabsTTS } from 'agora-agent-server-sdk';
 *
 * const avatar = new LiveAvatarAvatar({
 *   apiKey: process.env.LIVEAVATAR_API_KEY,
 *   quality: 'high',
 *   agoraUid: '12345',
 *   avatarId: 'avatar-id',
 * });
 *
 * const tts = new ElevenLabsTTS({
 *   apiKey: process.env.ELEVENLABS_API_KEY,
 *   modelId: 'eleven_flash_v2_5',
 *   voiceId: 'voice-id',
 *   sampleRate: 24000, // Required for LiveAvatar
 * });
 *
 * const agent = new Agent({ name: 'avatar-assistant' })
 *   .withTts(tts)
 *   .withAvatar(avatar);
 * ```
 *
 * @see https://docs.agora.io/en/conversational-ai/models/avatar/overview
 */
export class LiveAvatarAvatar extends BaseAvatar<LiveAvatarSampleRate> {
    private readonly options: LiveAvatarAvatarOptions;

    /**
     * LiveAvatar requires TTS sample rate of 24,000 Hz.
     */
    readonly requiredSampleRate = 24000 as const;

    constructor(options: LiveAvatarAvatarOptions) {
        super();
        this.options = options;

        if (!options.apiKey) {
            throw new Error("LiveAvatar requires apiKey");
        }
        if (!options.agoraUid) {
            throw new Error("LiveAvatar requires agoraUid");
        }
    }

    toConfig(): AvatarConfig {
        const {
            apiKey,
            quality,
            agoraUid,
            agoraToken,
            avatarId,
            disableIdleTimeout,
            activityIdleTimeout,
            enable = true,
            additionalParams,
        } = this.options;

        return {
            enable,
            vendor: "liveavatar",
            params: {
                ...additionalParams,
                api_key: apiKey,
                quality,
                agora_uid: agoraUid,
                ...(agoraToken && { agora_token: agoraToken }),
                ...(avatarId && { avatar_id: avatarId }),
                ...(disableIdleTimeout !== undefined && { disable_idle_timeout: disableIdleTimeout }),
                ...(activityIdleTimeout !== undefined && { activity_idle_timeout: activityIdleTimeout }),
            },
        };
    }
}

// =============================================================================
// Anam
// =============================================================================

/**
 * Constructor options for Anam Avatar.
 */
export interface AnamAvatarOptions {
    /** Anam API key */
    apiKey: string;
    /** Anam persona ID */
    personaId?: string;
    /** Enable avatar (default: true) */
    enable?: boolean;
    /** Additional vendor-specific parameters */
    additionalParams?: Record<string, unknown>;
}

/**
 * Anam Avatar vendor (Beta).
 *
 * @example
 * ```typescript
 * import { Agent, AnamAvatar } from 'agora-agent-server-sdk';
 *
 * const avatar = new AnamAvatar({
 *   apiKey: process.env.ANAM_API_KEY,
 *   personaId: 'persona-id',
 * });
 *
 * const agent = new Agent({ name: 'avatar-assistant' })
 *   .withAvatar(avatar);
 * ```
 *
 * @see https://docs.agora.io/en/conversational-ai/models/avatar/overview
 */
export class AnamAvatar extends BaseAvatar<number> {
    private readonly options: AnamAvatarOptions;

    /**
     * Anam does not enforce a specific TTS sample rate. Consult Anam documentation
     * for the sample rate supported by your chosen persona.
     */
    readonly requiredSampleRate = 0 as number;

    constructor(options: AnamAvatarOptions) {
        super();
        this.options = options;

        if (!options.apiKey) {
            throw new Error("Anam avatar requires apiKey");
        }
    }

    toConfig(): AvatarConfig {
        const { apiKey, personaId, enable = true, additionalParams } = this.options;

        return {
            enable,
            vendor: "anam",
            params: {
                ...additionalParams,
                api_key: apiKey,
                ...(personaId && { persona_id: personaId }),
            },
        };
    }
}
