import { test, expect } from "bun:test";
import { BitmapB, ElectronicPurseCard, ProductType } from "../src";

test("Decode transport layout", () => {
    const layout = Uint8Array.fromHex("FFFFFF7F00000080FFFFFF7F807F807F003D9F00000000006009EFCEB75700FF38DE8053FC3832EE001980FEDAB5D772A2A1FA5324DD1780FE0BE23ECC65D921");
    const bitmap = new BitmapB(layout);

    expect(bitmap.version).toBe(0);
    expect(bitmap.methodProcessingOfBlock4).toBe(0);
    expect(bitmap.regionCode).toBe(55);
    expect(bitmap.cardSeries).toBe(87);
    expect(bitmap.cardNumber).toBe(651214);
    expect(bitmap.expireOrActivateDate).toStrictEqual(new Date(2028,5,30));
    expect(bitmap.irreversibleValue).toBe(0x7fffffff);

    // Card settings
    expect(bitmap.cardSettings?.cardExpiration).toStrictEqual(new Date(2030,11,31));
    expect(bitmap.cardSettings?.zonePresentation).toBe(0);
    expect(bitmap.cardSettings?.initialZone).toBe(0);
    expect(bitmap.cardSettings?.finalZone).toBe(0);
    expect(bitmap.cardSettings?.offlineCounter).toBe(0);
    expect(bitmap.cardSettings?.lastOperationTermType).toBe(11);
    expect(bitmap.cardSettings?.lastOperationTermNumber).toBe(5504056);
    expect(bitmap.cardSettings?.lastOperationDate).toStrictEqual(new Date(2025,6,14));
    expect(bitmap.cardSettings?.personalCard).toBe(false);
    expect(bitmap.cardSettings?.epDiscountPercent).toBe(0);
    expect(bitmap.cardSettings?.transportCardCode).toBe(ProductType.EP);
    expect(bitmap.cardSettings?.vehicleMask).toBe(0xff);
    expect(bitmap.cardSettings?.cardActivationState).toBe(false);
    expect(bitmap.cardSettings?.cardLockState).toBe(false);
    expect(bitmap.cardSettings?.validityPeriod).toBe(0);
    expect(bitmap.cardSettings?.transactionParity).toBe(0);

    // Transit pass - EP
    expect((bitmap.transitPass as ElectronicPurseCard).balance).toBe(25 * 100);
    expect(bitmap.transitPass?.productType).toBe(ProductType.EP);
});