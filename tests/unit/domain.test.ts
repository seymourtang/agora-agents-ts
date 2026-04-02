import { describe, expect, test } from "vitest";

import { Area, Pool, createPool } from "../../src/core/domain";

describe("domain pool", () => {
    test("getArea returns the configured area", () => {
        const pool = new Pool(Area.EU);
        expect(pool.getArea()).toBe(Area.EU);
    });

    test("createPool creates a Pool for the given area", () => {
        const pool = createPool(Area.AP);
        expect(pool).toBeInstanceOf(Pool);
        expect(pool.getArea()).toBe(Area.AP);
    });
});
