import { describe, expect, test, vi } from "vitest";

import { AgoraClient } from "../../src/AgoraPoolClient";
import { Area } from "../../src/core/domain";
import { AgoraError } from "../../src/errors";

describe("AgoraPoolClient", () => {
    test("constructor resolves auth modes and headers", () => {
        const basic = new AgoraClient({
            area: Area.US,
            appId: "appid",
            appCertificate: "cert",
            customerId: "cid",
            customerSecret: "secret",
        });
        expect(basic.authMode).toBe("basic");

        const token = new AgoraClient({
            area: Area.US,
            appId: "appid",
            appCertificate: "cert",
            authToken: "raw-token",
        });
        expect(token.authMode).toBe("token");

        const appCreds = new AgoraClient({
            area: Area.US,
            appId: "appid",
            appCertificate: "cert",
        });
        expect(appCreds.authMode).toBe("app-credentials");
        expect(appCreds.getCurrentURL()).toContain("https://");
    });

    test("delegates region/domain helpers to the pool", async () => {
        const client = new AgoraClient({
            area: Area.US,
            appId: "appid",
            appCertificate: "cert",
        });

        const nextRegion = vi.spyOn(client.pool, "nextRegion");
        const selectBestDomain = vi.spyOn(client.pool, "selectBestDomain").mockResolvedValue(undefined);

        client.nextRegion();
        await client.selectBestDomain();

        expect(nextRegion).toHaveBeenCalled();
        expect(selectBestDomain).toHaveBeenCalled();
    });

    test("stopAgent swallows 404 and rethrows other errors", async () => {
        const client = new AgoraClient({
            area: Area.US,
            appId: "appid",
            appCertificate: "a".repeat(32),
        });

        (client as any)._agents = {
            stop: vi
                .fn()
                .mockRejectedValueOnce(new AgoraError({ statusCode: 404 }))
                .mockRejectedValueOnce(new Error("boom")),
        };

        await expect(client.stopAgent("agent-1")).resolves.toBeUndefined();
        await expect(client.stopAgent("agent-2")).rejects.toThrow("boom");
    });

    test("stopAgent generates auth header in app-credentials mode", async () => {
        const client = new AgoraClient({
            area: Area.US,
            appId: "a".repeat(32),
            appCertificate: "b".repeat(32),
        });

        const stop = vi.fn().mockResolvedValue(undefined);
        (client as any)._agents = { stop };

        await client.stopAgent("agent-3");

        expect(stop).toHaveBeenCalledWith(
            { appid: client.appId, agentId: "agent-3" },
            {
                headers: {
                    Authorization: expect.stringMatching(/^agora token=/),
                },
            },
        );
    });
});
