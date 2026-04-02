import { afterEach, describe, expect, test, vi } from "vitest";
import { RtcTokenBuilder } from "agora-token";

import {
    ExpiresIn,
    generateConvoAIToken,
    generateRtcToken,
    generateRtcTokenWithAccount,
} from "../../src/agentkit/token";

describe("agentkit token helpers", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("ExpiresIn helpers validate and cap values", () => {
        expect(ExpiresIn.MAX).toBe(86400);
        expect(ExpiresIn.HOUR).toBe(3600);
        expect(ExpiresIn.DAY).toBe(86400);
        expect(ExpiresIn.hours(2)).toBe(7200);
        expect(ExpiresIn.minutes(3)).toBe(180);
        expect(ExpiresIn.seconds(45)).toBe(45);
        expect(() => ExpiresIn.seconds(0)).toThrow(/between 1 and 86400/);
        expect(() => ExpiresIn.minutes(-1)).toThrow(/between 1 and 86400/);

        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(ExpiresIn.hours(25)).toBe(86400);
        expect(warn).toHaveBeenCalled();
    });

    test("token generators return non-empty strings", () => {
        const base = {
            appId: "a".repeat(32),
            appCertificate: "b".repeat(32),
        };

        expect(
            generateRtcToken({
                ...base,
                channel: "room-1",
                uid: 1,
            }),
        ).toEqual(expect.any(String));

        expect(
            generateRtcTokenWithAccount({
                ...base,
                channel: "room-2",
                account: "agent-1",
            }),
        ).toEqual(expect.any(String));

        expect(
            generateConvoAIToken({
                ...base,
                channelName: "room-3",
                account: "agent-1",
                tokenExpire: 600,
            }),
        ).toEqual(expect.any(String));
    });

    test("generateConvoAIToken defaults privilege expiry to token expiry when omitted or zero", () => {
        const spy = vi.spyOn(RtcTokenBuilder, "buildTokenWithRtm");
        const base = {
            appId: "a".repeat(32),
            appCertificate: "b".repeat(32),
            channelName: "room-4",
            account: "agent-1",
            tokenExpire: 600,
        };

        generateConvoAIToken(base);
        generateConvoAIToken({ ...base, privilegeExpire: 0 });
        generateConvoAIToken({ ...base, privilegeExpire: 300 });

        expect(spy).toHaveBeenNthCalledWith(
            1,
            base.appId,
            base.appCertificate,
            base.channelName,
            base.account,
            expect.anything(),
            600,
            600,
        );
        expect(spy).toHaveBeenNthCalledWith(
            2,
            base.appId,
            base.appCertificate,
            base.channelName,
            base.account,
            expect.anything(),
            600,
            600,
        );
        expect(spy).toHaveBeenNthCalledWith(
            3,
            base.appId,
            base.appCertificate,
            base.channelName,
            base.account,
            expect.anything(),
            600,
            300,
        );
    });
});
