import { describe, expect, test } from "vitest";

import {
    DataChannel,
    FillerWordsSelectionRule,
    Geofence,
    SalModeValues,
    SilenceActionValues,
    TurnDetectionTypeValues,
} from "../../src/agentkit/constants";

describe("agentkit constants", () => {
    test("re-export generated enum-like values", () => {
        expect(DataChannel).toMatchObject({
            Rtm: "rtm",
            Datastream: "datastream",
        });
        expect(SilenceActionValues).toMatchObject({
            Speak: "speak",
            Think: "think",
        });
        expect(SalModeValues).toMatchObject({
            Locking: "locking",
            Recognition: "recognition",
        });
        expect(Geofence.Area.Global).toBe("GLOBAL");
        expect(FillerWordsSelectionRule).toMatchObject({
            Shuffle: "shuffle",
            RoundRobin: "round_robin",
        });
        expect(TurnDetectionTypeValues).toMatchObject({
            AgoraVad: "agora_vad",
            ServerVad: "server_vad",
            SemanticVad: "semantic_vad",
        });
    });
});
