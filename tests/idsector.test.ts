import { test, expect } from "bun:test";
import { IDSector, TransportType } from "../src";

test("Decode ID sector", () => {
    const lasttrip = new IDSector(Uint8Array.fromHex("25F33472363900000000363035300000"));

    expect(lasttrip.transportType).toBe(TransportType.TROLLEYBUS);
    expect(lasttrip.date).toStrictEqual(new Date(2026,2,18,15,23));
    expect(lasttrip.route).toBe("69");
    expect(lasttrip.transportNum).toBe("6050");
});