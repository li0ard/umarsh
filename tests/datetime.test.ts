import { test, expect } from "bun:test";
import { decodeDate, decodeTime } from "../src/utils";

const tests = [
    {
        encoded: 0x36FF,
        decoded: new Date(2027, 6, 31)
    },
    {
        encoded: 0x0022,
        decoded: new Date(2000, 0, 2)
    },
    {
        encoded: 0x344E,
        decoded: new Date(2026, 1, 14)
    }
];


test("Decode date", () => {
    for(const test of tests) expect(decodeDate(test.encoded)).toStrictEqual(test.decoded);
});

test("Decode time", () => expect(decodeTime(0x5F3)).toStrictEqual([15, 23]));