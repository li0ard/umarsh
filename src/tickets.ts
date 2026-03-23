import { ProductType } from "./const.js";
import { decodeDate } from "./utils.js";

/** Параметры карты */
export class PassengerCardSettings {
    public readonly cardExpiration: Date;
    public readonly zonePresentation: number;
    public readonly initialZone: number;
    public readonly finalZone: number;
    public readonly offlineCounter: number;
    public readonly lastOperationTermType: number;
    public readonly lastOperationTermNumber: number;
    public readonly lastOperationDate: Date;
    public readonly personalCard: boolean;
    public readonly epDiscountPercent: number = 0;
    public readonly transportCardCode: ProductType;
    public readonly vehicleMask: number;
    public readonly cardActivationState: number;
    public readonly cardLockState: number;
    public readonly validityPeriod: number;
    public readonly transactionParity: number;
    
    constructor(data: Uint8Array) {
        this.cardExpiration = decodeDate((data[17] << 8) | data[18]);
        this.zonePresentation = data[21] >> 7;
        this.initialZone = data[21] & 0b01111111;
        this.finalZone = data[22] & 0b01111111;
        this.offlineCounter = data[23];

        this.lastOperationTermType = data[28] >> 4;

        this.personalCard = (data[30] >> 7) == 1;

        let productType = data[30] & 0b01111111;
        if (productType <= 0x63) {
            this.epDiscountPercent = productType;
            productType = 0;
        }
        this.transportCardCode = productType;
        this.vehicleMask = data[31];

        this.cardActivationState = (~data[34] & 0xFF) >> 7;
        this.validityPeriod = data[34] & 0b01111111;
        this.lastOperationTermNumber = ((data[35] << 16) | (data[36] << 8) | data[37]) >>> 0;
        this.lastOperationDate = decodeDate((data[38] << 8) | data[39]);
        this.transactionParity = data[40] >> 7;
        this.cardLockState = (~data[42] & 0xFF) >> 7;
    }

    toString() {
        return `PassengerCardSettings(cardExpiration=${this.cardExpiration}, zonePresentation=${this.zonePresentation}, initialZone=${this.initialZone}, finalZone=${this.finalZone}, offlineCounter=${this.offlineCounter}, lastOperationTermType=${this.lastOperationTermType}, lastOperationTermNumber=${this.lastOperationTermNumber}, lastOperationDate=${this.lastOperationDate}, personalCard=${this.personalCard}, epDiscountPercent=${this.epDiscountPercent}, transportCardCode=${ProductType[this.transportCardCode]}, vehicleMask=${this.vehicleMask}, cardActivationState=${this.cardActivationState}, cardLockState=${this.cardLockState}, validityPeriod=${this.validityPeriod}, transactionParity=${this.transactionParity})`;
    }
}

/** Абстракция проездного документа */
export abstract class TransitPass {
    constructor(public readonly data: Uint8Array) {}
    /** Тип проездного документа */
    abstract get productType(): ProductType;

    protected get units(): number {
        return ((this.data[40] & 0b01111111) << 8) | this.data[41];
    }

    abstract toString(): string;
}

/**
 * **EP - Electronic Purse**
 * 
 * Проездной документ с автоматическим продлением и балансом в транспортные единицах (копейках)
 */
export class ElectronicPurseCard extends TransitPass {
    get productType(): ProductType { return ProductType.EP; }
    constructor(data: Uint8Array) { super(data); }
    
    /** Баланс */
    get balance(): number {
        return (this.units * 100) + (this.data[42] & 0b01111111);
    }

    toString() {
        return `ElectronicPurseCard(balance=${this.balance}, productType=${ProductType[this.productType]})`;
    }
}

/**
 * **SU - Season unlimited**
 * 
 * Проездной документ на срок и не имеющий ограничение по количеству поездок.
 */
export class SeasonUnlimitedCard extends TransitPass {
    get productType(): ProductType { return ProductType.SU; }
    constructor(data: Uint8Array) { super(data); }
    
    /** Стоимость проездного документа */
    get cost(): number {
        return (this.units * 100) + (this.data[42] & 0b01111111);
    }

    toString() {
        return `SeasonUnlimitedCard(cost=${this.cost}, productType=${ProductType[this.productType]})`;
    }
}

/**
 * **SL - Season limited**
 * 
 * Проездной документ на срок и имеющий ограничение по количеству поездок.
 * С возможностью переноса поездок на следующий срок действия при продлении
 */
export class SeasonLimitedCard extends TransitPass {
    get productType(): ProductType { return ProductType.SL; }
    constructor(data: Uint8Array) { super(data); }
    
    /** Остаток поездок */
    get tripsQuantity(): number { return this.units; }

    toString() {
        return `SeasonLimitedCard(tripsQuantity=${this.tripsQuantity}, productType=${ProductType[this.productType]})`;
    }
}

/**
 * **LT - Limited Trip**
 * 
 * Проездной документ на срок и имеющий ограничение по количеству поездок.
 * Без возможности переноса поездок на следующий срок действия при продлении
 */
export class LimitedCard extends TransitPass {
    get productType(): ProductType { return ProductType.LT; }
    constructor(data: Uint8Array) { super(data); }
    
    /** Остаток поездок */
    get tripsQuantity(): number { return this.units; }
    
    get expireDateNextPeriod(): Date | null {
        return decodeDate((this.data[19] << 8) | this.data[20]);
    }
    
    get tripsQuantityNextPeriod(): number {
        return ((this.data[21] << 8) | this.data[22]) & 0x7FFF;
    }
    
    get ltpCntTripsPurchasedInCurrentPeriod(): number | null {
        if (this.permLt) return ((this.data[16] << 4) & 0b10000000) | (this.data[42] & 0b01111111);
        return null;
    }
    
    get permLt(): boolean {
        return (this.data[30] & 0b01111111) === ProductType.LT && (this.data[16] & 0b00010000) !== 0;
    }

    toString() {
        return `SeasonLimitedCard(tripsQuantity=${this.tripsQuantity}, expireDateNextPeriod=${this.expireDateNextPeriod}, tripsQuantityNextPeriod=${this.tripsQuantityNextPeriod}, ltpCntTripsPurchasedInCurrentPeriod=${this.ltpCntTripsPurchasedInCurrentPeriod}, permLt=${this.permLt}, productType=${ProductType[this.productType]})`;
    }
}

/**
 * **OL - Omsk Limited**
 * 
 * Непополняемый проездной документ с ежемесячным возобновляемым лимитом.
 * Имеет отдельный баланс для городских и для пригородных поездок
 */
export class OmskLimitedCard extends TransitPass {
    get productType(): ProductType { return ProductType.OL; }
    constructor(data: Uint8Array) { super(data); }
    
    /** Остаток поездок */
    get tripsQuantity(): number {
        return (this.units >> 4) & 0x7FF;
    }
    
    /** Остаток поездок (пригород) */
    get tripsQuantitySuburban(): number {
        return (this.data[42] & 0b01111111) | ((this.units & 0b00001111) << 7);
    }

    toString() {
        return `OmskLimitedCard(tripsQuantity=${this.tripsQuantity}, tripsQuantitySuburban=${this.tripsQuantitySuburban}, productType=${ProductType[this.productType]})`;
    }
}