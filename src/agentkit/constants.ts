/**
 * Type-safe constants for agent configuration values.
 * Use these instead of raw strings to avoid typos and get IDE autocomplete.
 */

// Import namespace as value from source (api index uses export type)
import { AgentThinkAgentManagementRequest as AgentThinkRequestNS } from "../api/resources/agentManagement/client/requests/AgentThinkAgentManagementRequest.js";
import { StartAgentsRequest as StartAgentsRequestNS } from "../api/resources/agents/client/requests/StartAgentsRequest.js";

/** Data channel: `"rtm"` | `"datastream"` */
export const DataChannel: typeof StartAgentsRequestNS.Properties.Parameters.DataChannel =
    StartAgentsRequestNS.Properties.Parameters.DataChannel;

/** RTC audio scenario: `"default"` | `"chorus"` | `"aiserver"` */
export const AudioScenario: typeof StartAgentsRequestNS.Properties.Parameters.AudioScenario =
    StartAgentsRequestNS.Properties.Parameters.AudioScenario;

/** Silence action when timeout elapses: `"speak"` | `"think"` (avoids shadowing SilenceAction type) */
export const SilenceActionValues: typeof StartAgentsRequestNS.Properties.Parameters.SilenceConfig.Action =
    StartAgentsRequestNS.Properties.Parameters.SilenceConfig.Action;

/** SAL mode: `"locking"` | `"recognition"` (avoids shadowing SalMode type) */
export const SalModeValues: typeof StartAgentsRequestNS.Properties.Sal.SalMode =
    StartAgentsRequestNS.Properties.Sal.SalMode;

/** Geofence area and exclude area constants */
export const Geofence: typeof StartAgentsRequestNS.Properties.Geofence = StartAgentsRequestNS.Properties.Geofence;

/** Filler word selection rule: `"shuffle"` | `"round_robin"` */
export const FillerWordsSelectionRule: typeof StartAgentsRequestNS.Properties.FillerWords.Content.StaticConfig.SelectionRule =
    StartAgentsRequestNS.Properties.FillerWords.Content.StaticConfig.SelectionRule;

/**
 * Turn detection type (deprecated; use `TurnDetectionNestedConfig.EndOfSpeech` instead).
 * - `AgoraVad`: Agora VAD
 * - `ServerVad`: Server-side VAD (MLLM only)
 * - `SemanticVad`: Semantic VAD (MLLM only)
 */
export const TurnDetectionTypeValues: typeof StartAgentsRequestNS.Properties.TurnDetection.Type =
    StartAgentsRequestNS.Properties.TurnDetection.Type;

/** Think action when the agent is listening: inject custom text without interrupting. */
export const ThinkOnListeningActionInject = AgentThinkRequestNS.OnListeningAction.Inject;

/** Think action when the agent is listening: interrupt and start a new turn. */
export const ThinkOnListeningActionInterrupt = AgentThinkRequestNS.OnListeningAction.Interrupt;

/** Think action when the agent is listening: ignore the request. */
export const ThinkOnListeningActionIgnore = AgentThinkRequestNS.OnListeningAction.Ignore;

/** Think action when the agent is thinking: interrupt and start a new turn. */
export const ThinkOnThinkingActionInterrupt = AgentThinkRequestNS.OnThinkingAction.Interrupt;

/** Think action when the agent is thinking: ignore the request. */
export const ThinkOnThinkingActionIgnore = AgentThinkRequestNS.OnThinkingAction.Ignore;

/** Think action when the agent is speaking: interrupt and start a new turn. */
export const ThinkOnSpeakingActionInterrupt = AgentThinkRequestNS.OnSpeakingAction.Interrupt;

/** Think action when the agent is speaking: ignore the request. */
export const ThinkOnSpeakingActionIgnore = AgentThinkRequestNS.OnSpeakingAction.Ignore;
