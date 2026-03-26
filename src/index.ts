import { TransportType, TechnologicalType, ProductType } from "./const.js";
import { TransitPass, SeasonUnlimitedCard, SeasonLimitedCard, LimitedCard, OmskLimitedCard, ElectronicPurseCard, PassengerCardSettings } from "./tickets.js";
import { decodeDate, decodeTime } from "./utils.js";

/**
 * **Last trip block (aka ID-sector)**
 * 
 * Located in sector 0, block 1
 */
export class IDSector {
    public readonly transportType: TransportType;
    public readonly date: Date;
    public readonly route: string;
    public readonly transportNum: string;

    constructor(data: Uint8Array) {
        if(data.length != 16) throw new Error("Block must be 16 bytes long");
        this.transportType = data[0] >> 4;

        const time = decodeTime(((data[0] & 0b00001111) << 8) | data[1]);
        const date = decodeDate((data[2] << 8) | data[3]);
        date.setHours(time[0]);
        date.setMinutes(time[1]);
        this.date = date;

        this.route = new TextDecoder().decode(data.subarray(4, 10)).replaceAll("\x00", "");
        this.transportNum = new TextDecoder().decode(data.subarray(10)).replaceAll("\x00", "");
    }

    toString(): string {
        return `IDSector(transportType=${TransportType[this.transportType]}, date=${this.date}, route=${this.route}, transportNum=${this.transportNum})`;
    }
}

/**
 * **Transport layout (aka BitmapB)**
 * 
 * Located in sector 8
 */
export class BitmapB {
    public readonly version: number;
    public readonly methodProcessingOfBlock4: number;
    public readonly regionCode: number;
    public readonly cardSeries: number;
    public readonly expireOrActivateDate: Date;
    public readonly cardNumber: number;

    public readonly irreversibleValue: number;

    public readonly transitPass?: TransitPass;
    public readonly cardSettings?: PassengerCardSettings;

    constructor(public readonly data: Uint8Array) {
        if(data.length < 48) throw new Error("Bitmap must be 48 bytes at least");
        this.version = this.data[16] >> 5;
        this.methodProcessingOfBlock4 = this.data[16] & 1;
        this.regionCode = ((this.data[24] >> 1) & 0b01110000 )| (this.data[28] & 0b00001111);
        this.cardSeries = this.data[29] & 0b01111111;
        this.cardNumber = (((data[24] << 24) | (data[25] << 16) | (data[26] << 8) | data[27]) >>> 0) & 0xFFFFFFF;
        this.expireOrActivateDate = decodeDate((this.data[32] << 8) | this.data[33]);

        this.irreversibleValue = ((data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]) >>> 0;

        if(this.technologicalType == TechnologicalType.Passenger) {
            this.cardSettings = new PassengerCardSettings(data);
            this.transitPass = this.createTransitPass();
        }
    }

    toString(): string {
        return `BitmapB(version=${this.version}, methodProcessingOfBlock4=${this.methodProcessingOfBlock4}, regionCode=${this.regionCode}, cardSeries=${this.cardSeries}, cardNumber=${this.cardNumber}, expireOrActivateDate=${this.expireOrActivateDate}, irreversibleValue=${this.irreversibleValue}, cardSettings=${this.cardSettings?.toString() ?? null}, transitPass=${this.transitPass?.toString() ?? null})`;
    }

    /*private get productType(): ProductType {
        const productType = this.data[30] & 0b01111111;
        if (productType <= 0x63) return ProductType.EP;
        if (productType === 0x64) return ProductType.SU;
        if (productType === 0x65) return ProductType.SL;
        if (productType === 0x69) return ProductType.LT;
        if (productType === 0x6A) return ProductType.OL;
        if (productType === 0x7F) return ProductType.Unknown;

        return ProductType.EP;
    }*/

    private get technologicalType(): TechnologicalType {
        const techType = (this.data[16] >> 1) & 3;
        if (techType === 0) return TechnologicalType.Passenger;
        if (techType === 1) return TechnologicalType.Operator;

        return TechnologicalType.Other;
    }

    private createTransitPass(): TransitPass | undefined {
        if (this.technologicalType !== TechnologicalType.Passenger || !this.cardSettings) return undefined;
        
        switch (this.cardSettings.transportCardCode) {
            case ProductType.SU:
                return new SeasonUnlimitedCard(this.data);
            case ProductType.SL:
                return new SeasonLimitedCard(this.data);
            case ProductType.LT:
                return new LimitedCard(this.data);
            case ProductType.OL:
                return new OmskLimitedCard(this.data);
            case ProductType.Unknown:
                return undefined;
            case ProductType.EP:
            default:
                return new ElectronicPurseCard(this.data);
        }
    }
}

export * from "./const.js";
export * from "./tickets.js";