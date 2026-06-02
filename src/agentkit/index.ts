/**
 * Agentkit layer for the Agora Conversational AI SDK.
 *
 * This module provides a cleaner, more ergonomic API on top of the
 * Fern-generated SDK types and methods.
 *
 * ## Maintenance Notes
 *
 * This agentkit is designed to minimize maintenance burden:
 *
 * 1. **Type aliases** (in types.ts) re-export Fern types directly.
 *    When Fern adds new fields, they're automatically available.
 *
 * 2. **The `raw` property** on AgentSession exposes the underlying
 *    Fern-generated AgentsClient. When Fern adds new endpoints,
 *    they're immediately available via `session.raw.newEndpoint()`.
 *
 * 3. **Convenience methods** (say, stop, interrupt, etc.) are the only
 *    parts that need manual updates when adding new sugar.
 */

// Re-export the underlying client type for advanced usage
export type { AgentsClient } from "../api/resources/agents/client/Client.js";
export type { AgentOptions } from "./Agent.js";
// Core classes
export { Agent } from "./Agent.js";
export type {
    AgentSessionEvent,
    AgentSessionEventHandler,
    AgentSessionOptions,
} from "./AgentSession.js";
export { AgentSession } from "./AgentSession.js";
// Vendor-specific avatar types with strict constraints
export type {
    AkoolAvatarConfig,
    AnamAvatarConfig,
    GenericAvatarConfig,
    HeyGenAvatarConfig,
    LiveAvatarAvatarConfig,
    StrictAvatarConfig,
} from "./avatar-types.js";
export {
    isAkoolAvatar,
    isAnamAvatar,
    isAvatarTokenManaged,
    isGenericAvatar,
    isHeyGenAvatar,
    isLiveAvatarAvatar,
    toBaseAvatarConfig,
    validateAvatarConfig,
    validateTtsSampleRate,
} from "./avatar-types.js";
// Type-safe constants
export {
    AudioScenario,
    DataChannel,
    FillerWordsSelectionRule,
    Geofence,
    InterruptionDisabledStrategy,
    InterruptionDisabledStrategyAppend,
    InterruptionDisabledStrategyIgnore,
    InterruptionModeKeywords,
    InterruptionModeStartOfSpeech,
    InterruptionModeValues,
    MllmTurnDetectionModeAgoraVad,
    MllmTurnDetectionModeSemanticVad,
    MllmTurnDetectionModeServerVad,
    MllmTurnDetectionModeValues,
    SalModeValues,
    SilenceActionValues,
    SpeakPriorityAppend,
    SpeakPriorityIgnore,
    SpeakPriorityInterrupt,
    SpeakPriorityValues,
    ThinkOnListeningActionIgnore,
    ThinkOnListeningActionInject,
    ThinkOnListeningActionInterrupt,
    ThinkOnSpeakingActionIgnore,
    ThinkOnSpeakingActionInterrupt,
    ThinkOnThinkingActionIgnore,
    ThinkOnThinkingActionInterrupt,
    TurnDetectionTypeValues,
} from "./constants.js";
export type {
    AgentPreset,
    AsrPreset,
    DeepgramPresetModel,
    LlmPreset,
    MiniMaxPresetModel,
    OpenAIPresetModel,
    OpenAITtsPresetModel,
    PresetInput,
    TtsPreset,
} from "./presets.js";
export { AgentPresets, normalizePresetInput } from "./presets.js";
export type {
    GenerateConvoAITokenOptions,
    GenerateTokenOptions,
} from "./token.js";
// Token generation
export {
    ExpiresIn,
    generateConvoAIToken,
    generateRtcToken,
    MAX_EXPIRY_SECONDS,
} from "./token.js";
// Clean type aliases
export type {
    AdvancedFeatures,
    // Agent configuration
    AgentConfig,
    AgentConfigUpdate,
    AmazonTts,
    AmazonTtsParams,
    AsrConfig,
    AvatarConfig,
    AvatarVendor,
    CartesiaTts,
    CartesiaTtsParams,
    // Conversation types
    ConversationHistory,
    ConversationRole,
    ConversationSessionTurn,
    ConversationTurn,
    ConversationTurns,
    Eagerness,
    ElevenLabsTts,
    ElevenLabsTtsParams,
    EndOfSpeechConfig,
    EndOfSpeechMode,
    EndOfSpeechSemanticConfig,
    EndOfSpeechVadConfig,
    FarewellConfig,
    FillerWordsConfig,
    FillerWordsContent,
    FillerWordsContentSelectionRule,
    FillerWordsContentStaticConfig,
    FillerWordsTrigger,
    FillerWordsTriggerFixedTimeConfig,
    FishAudioTts,
    FishAudioTtsParams,
    GeofenceArea,
    GeofenceConfig,
    GeofenceExcludeArea,
    GetTurnsOptions,
    GoogleTts,
    GoogleTtsParams,
    HumeAiTts,
    HumeAiTtsParams,
    InteractionLanguage,
    InterruptionConfig,
    InterruptionMode,
    InterruptMode,
    Labels,
    // Core configuration types
    LlmConfig,
    LlmGreetingConfigs,
    LlmGreetingConfigsMode,
    LlmStyle,
    McpServersItem,
    // TTS vendor-specific types
    MicrosoftTts,
    MicrosoftTtsParams,
    MinimaxTts,
    MinimaxTtsParams,
    MllmConfig,
    MllmTurnDetectionConfig,
    MllmTurnDetectionMode,
    MllmVendor,
    MurfTts,
    MurfTtsParams,
    OpenAiTts,
    OpenAiTtsParams,
    ParametersAudioScenario,
    ParametersDataChannel,
    RimeTts,
    RimeTtsParams,
    RtcConfig,
    SalConfig,
    SalMode,
    SarvamTts,
    SarvamTtsParams,
    // Say/Speak types
    SayOptions,
    SessionInfo,
    SessionListResponse,
    // Session types
    SessionOptions,
    SessionParams,
    SessionParamsInput,
    SessionStatus,
    SessionSummary,
    SilenceAction,
    SilenceConfig,
    SpeakPriority,
    StartOfSpeechConfig,
    StartOfSpeechDisabledConfig,
    StartOfSpeechDisabledConfigStrategy,
    StartOfSpeechKeywordsConfig,
    StartOfSpeechMode,
    StartOfSpeechVadConfig,
    SttConfig,
    SttVendor,
    ThinkOnListeningAction,
    ThinkOnSpeakingAction,
    ThinkOnThinkingAction,
    ThinkOptions,
    ThinkResponse,
    TtsConfig,
    TurnDetectionConfig,
    TurnDetectionNestedConfig,
    TurnDetectionType,
} from "./types.js";
export type {
    AkoolAvatarOptions,
    AnamAvatarOptions,
    GenericAvatarOptions,
    HeyGenAvatarOptions,
    LiveAvatarAvatarOptions,
} from "./vendors/avatar.js";
// Avatar vendor classes
export {
    AkoolAvatar,
    AnamAvatar,
    GenericAvatar,
    HeyGenAvatar,
    LiveAvatarAvatar,
} from "./vendors/avatar.js";
// Sample rate types
export type {
    AkoolSampleRate,
    CartesiaSampleRate,
    ElevenLabsSampleRate,
    HeyGenSampleRate,
    LiveAvatarSampleRate,
    MicrosoftSampleRate,
    SampleRate,
} from "./vendors/base.js";
// Base vendor classes
export {
    BaseAvatar,
    BaseLLM,
    type BaseLlmOptions,
    BaseMLLM,
    BaseSTT,
    BaseTTS,
    type GoogleTTSSampleRate,
} from "./vendors/base.js";
export type {
    AmazonBedrockOptions,
    AnthropicOptions,
    AzureOpenAIOptions,
    CustomLLMOptions,
    DifyOptions,
    GeminiOptions,
    GroqOptions,
    OpenAIOptions,
    VertexAILLMOptions,
} from "./vendors/llm.js";
// LLM vendor classes
export {
    AmazonBedrock,
    Anthropic,
    AzureOpenAI,
    CustomLLM,
    Dify,
    Gemini,
    Groq,
    OpenAI,
    VertexAILLM,
} from "./vendors/llm.js";
export type {
    GeminiLiveOptions,
    OpenAIRealtimeOptions,
    VertexAIOptions,
    XaiGrokOptions,
} from "./vendors/mllm.js";
// MLLM vendor classes
export {
    GeminiLive,
    OpenAIRealtime,
    VertexAI,
    XaiGrok,
} from "./vendors/mllm.js";
export type {
    AmazonSTTOptions,
    AresSTTOptions,
    AssemblyAISTTOptions,
    DeepgramSTTOptions,
    GoogleSTTOptions,
    MicrosoftSTTOptions,
    OpenAISTTOptions,
    SarvamSTTOptions,
    SpeechmaticsSTTOptions,
} from "./vendors/stt.js";
// STT vendor classes
export {
    AmazonSTT,
    AresSTT,
    AssemblyAISTT,
    DeepgramSTT,
    GoogleSTT,
    MicrosoftSTT,
    OpenAISTT,
    SarvamSTT,
    SpeechmaticsSTT,
} from "./vendors/stt.js";
export type {
    AmazonTTSOptions,
    CartesiaTTSOptions,
    DeepgramTTSOptions,
    ElevenLabsTTSOptions,
    FishAudioTTSOptions,
    GoogleTTSOptions,
    HumeAITTSOptions,
    MicrosoftTTSOptions,
    MiniMaxTTSOptions,
    MurfTTSOptions,
    OpenAITTSOptions,
    RimeTTSOptions,
    SarvamTTSOptions,
} from "./vendors/tts.js";
// TTS vendor classes
export {
    AmazonTTS,
    CartesiaTTS,
    DeepgramTTS,
    ElevenLabsTTS,
    FishAudioTTS,
    GoogleTTS,
    HumeAITTS,
    MicrosoftTTS,
    MiniMaxTTS,
    MurfTTS,
    OpenAITTS,
    RimeTTS,
    SarvamTTS,
} from "./vendors/tts.js";
