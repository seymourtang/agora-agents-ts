import { Agent } from "../src/agentkit/Agent.js";
import { AgentSession } from "../src/agentkit/AgentSession.js";
import { describe, expect, it, vi } from "vitest";

describe("agentkit custom tests", () => {
    it("think routes through agentManagement client", async () => {
        const agentThink = vi.fn().mockResolvedValue({ agent_id: "agent-1", channel: "room", start_ts: 1 });
        const fakeClient = {
            agents: {},
            agentManagement: { agentThink },
            authMode: "basic",
        } as any;

        const session = new AgentSession({
            client: fakeClient,
            agent: new Agent(),
            appId: "appid",
            name: "agent",
            channel: "room",
            token: "token",
            agentUid: "1",
            remoteUids: ["2"],
        });
        (session as any)._status = "running";
        (session as any)._agentId = "agent-1";

        const resp = await session.think("Injected instruction", { on_thinking_action: "interrupt" });
        expect(resp.agent_id).toBe("agent-1");
        expect(agentThink).toHaveBeenCalledTimes(1);
        expect(agentThink.mock.calls[0][0]).toMatchObject({
            appid: "appid",
            agentId: "agent-1",
            text: "Injected instruction",
            on_thinking_action: "interrupt",
        });
    });
});
