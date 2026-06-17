import { describe, expect, it } from "vitest";
import {
    isSensetimeAvatar,
    isAvatarTokenManaged,
    validateAvatarConfig,
    type SensetimeAvatarConfig,
} from "../../../src/agentkit/avatar-types.js";

const validSensetimeConfig = (): SensetimeAvatarConfig => ({
    vendor: "sensetime",
    params: {
        agora_uid: "1234",
        agora_token: "agora-token",
        appId: "sensetime-app-id",
        app_key: "sensetime-app-key",
        sceneList: [
            {
                digital_role: {
                    face_feature_id: "face_feature_id",
                    position: { x: 0, y: 0 },
                    url: "https://example.com/avatar.zip",
                },
            },
        ],
    },
});

describe("SensetimeAvatarConfig", () => {
    it("isSensetimeAvatar identifies sensetime vendor", () => {
        const config = validSensetimeConfig();
        expect(isSensetimeAvatar(config)).toBe(true);
    });

    it("validateAvatarConfig accepts a complete sensetime config", () => {
        expect(() => validateAvatarConfig(validSensetimeConfig())).not.toThrow();
    });

    it("validateAvatarConfig rejects missing agora_uid", () => {
        const config = validSensetimeConfig();
        config.params.agora_uid = "";
        expect(() => validateAvatarConfig(config)).toThrow("SenseTime avatar requires agora_uid");
    });

    it("isAvatarTokenManaged includes sensetime vendor", () => {
        expect(isAvatarTokenManaged(validSensetimeConfig())).toBe(true);
    });

    it("validateAvatarConfig accepts sensetime config without agora_token before enrichment", () => {
        const config = validSensetimeConfig();
        delete (config.params as { agora_token?: string }).agora_token;
        expect(() => validateAvatarConfig(config)).not.toThrow();
        expect(() => validateAvatarConfig(config, { requireSessionFields: true })).not.toThrow();
    });

    it("validateAvatarConfig rejects missing appId", () => {
        const config = validSensetimeConfig();
        config.params.appId = "";
        expect(() => validateAvatarConfig(config)).toThrow("SenseTime avatar requires appId");
    });

    it("validateAvatarConfig rejects empty sceneList", () => {
        const config = validSensetimeConfig();
        config.params.sceneList = [];
        expect(() => validateAvatarConfig(config)).toThrow("SenseTime avatar requires a non-empty sceneList");
    });
});
