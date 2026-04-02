import { describe, expect, test } from "vitest";

import { AgoraError } from "../../src/errors/AgoraError";
import { AgoraTimeoutError } from "../../src/errors/AgoraTimeoutError";

describe("AgoraError", () => {
    test("message-only constructor includes message in output", () => {
        const err = new AgoraError({ message: "Something went wrong" });
        expect(err.message).toContain("Something went wrong");
        expect(err.statusCode).toBeUndefined();
        expect(err.body).toBeUndefined();
    });

    test("status-code-only constructor includes status in output", () => {
        const err = new AgoraError({ statusCode: 400 });
        expect(err.message).toContain("Status code: 400");
        expect(err.statusCode).toBe(400);
    });

    test("body-only constructor serializes body into message", () => {
        const err = new AgoraError({ body: { code: "ERR_001", detail: "invalid" } });
        expect(err.message).toContain("ERR_001");
        expect(err.body).toEqual({ code: "ERR_001", detail: "invalid" });
    });

    test("all fields combined produce a complete message", () => {
        const err = new AgoraError({ message: "Not found", statusCode: 404, body: { error: "missing" } });
        expect(err.message).toContain("Not found");
        expect(err.message).toContain("Status code: 404");
        expect(err.message).toContain("missing");
    });
});

describe("AgoraTimeoutError", () => {
    test("is an Error instance with the supplied message", () => {
        const err = new AgoraTimeoutError("Request timed out after 60s");
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Request timed out after 60s");
    });
});
