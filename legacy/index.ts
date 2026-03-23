// 25F2345A363900000000363035300000 - last trip
// 0036FF00000000006BEBD47BB75780FF - card info
// 36FF8053FC38345A000F805E21A73ADB - ticket info
// 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15

import { decodeDate, decodeTime } from "../src/utils";

/** Тип транспорта */
enum TransportType {
    BUS = 1,
    TROLLEYBUS,
    TRAMWAY
}

/**
 * Блок последней поездки (aka ID-сектор)
 * 
 * Расположен в секторе 0, блок 1
 */
export class LastTripBlock {
    /**
     * Блок последней поездки (aka ID-сектор)
     * @param transportType Тип транспорта
     * @param date Дата поездки (+ время)
     * @param route Номер маршрута
     * @param transportNum Бортовой номер (или ГРНЗ)
     */
    constructor(
        public readonly transportType: TransportType,
        public readonly date: Date,
        public readonly route: string,
        public readonly transportNum: string
    ) {}

    static decode(data: Uint8Array) {
        if(data.length != 16) throw new Error("Invalid last trip block");
        const transportType = data[0] >> 4;

        const time = decodeTime(((data[0] & 0x0F) << 8) | data[1]);
        const date = decodeDate((data[2] << 8) | data[3]);
        date.setHours(time[0]);
        date.setMinutes(time[1]);

        const route = new TextDecoder().decode(data.subarray(4, 10)).replaceAll("\x00", "");
        const transportNum = new TextDecoder().decode(data.subarray(10)).replaceAll("\x00", "");

        return new LastTripBlock(transportType, date, route, transportNum);
    }
}

/**
 * Блок с информацией о носителе проездного
 * 
 * Расположен в секторе 8, блок 1
 */
export class CardInfoBlock {
    /**
     * Блок с информацией о носителе проездного
     * @param cardType Неизвестно (tech flag? 0 - обычная карта, 1,2,3,6 - служебные)
     * @param expiryDate Срок годности носителя
     * @param unknown2 Неизвестно (validationDate?)
     * @param totalTrips Счётчик кол-ва поездок
     * @param refillCounter Счётчик кол-ва пополнений
     * @param regionCode Код региона
     * @param serialNumber Номер носителя
     * @param unknown3 Неизвестно
     * @param fareSettings Настройки тарифа
     */
    constructor(
        public cardType: number,
        public expiryDate: Date,
        public unknown2: Uint8Array,
        public totalTripsCounter: number,
        public refillCounter: number,
        public regionCode: number,
        public serialNumber: number,
        public unknown3: number,
        public fareSettings: Uint8Array
    ) {}

    static decode(data: Uint8Array) {
        if(data.length != 16) throw new Error("Invalid last trip block");
        const cardType = data[0];

        const expiryDate = decodeDate((data[1] << 8) | data[2]);
        
        const unknown2 = data.subarray(3,5);

        const totalTripsCounter = (data[5] << 8) | data[6];
        const refillCounter = data[7];
        
        const regionHiAndSerialNumber = ((data[8] << 24) | (data[9] << 16) | (data[10] << 8) | data[11]) >>> 0;
        const regionHi = regionHiAndSerialNumber >>> 29;
        const serialNumber = regionHiAndSerialNumber & 0x1FFFFFFF;

        const unknown3 = data[12] >> 4;
        const regionLo = data[12] & 0x0F;
        
        const regionCode = (regionHi << 4) | regionLo;
        
        const fareSettings = data.slice(13);
        
        return new CardInfoBlock(cardType, expiryDate, unknown2, totalTripsCounter, refillCounter, regionCode, serialNumber, unknown3, fareSettings);
    }
}

/**
 * Блок с информацией о проездном
 * 
 * Расположен в секторе 8, блок 2
 */
export class TicketInfoBlock {
    /**
     * Блок с информацией о проездном
     * @param expiryDate Срок годности проездного
     * @param unknown1 Неизвестно
     * @param terminalId ID терминала (предположительно терминала инициации)
     * @param lastRefillDate Дата последнего пополнения
     * @param flag Флаг операции (списание/пополнение)
     * @param balance Баланс
     * @param unknown2 Неизвестно (lock state?)
     * @param hash Хэш?
     */
    constructor(
        public expiryDate: Date,
        public unknown1: number,
        public terminalId: number,
        public lastRefillDate: Date,
        public flag: number,
        public balance: number,
        public unknown2: number,
        public hash: Uint8Array
    ) {}

    /** Баланс в поездках (для зелёных соц.карт) */
    get balanceAsTrips(): number {
        return this.balance > 0xFFF ? this.balance >> 8 : (this.balance > 0xFF ? this.balance >> 4 : this.balance);
    }

    static decode(data: Uint8Array) {
        if(data.length != 16) throw new Error("Invalid last trip block");
        const expiryDate = decodeDate((data[0] << 8) | data[1]);

        const unknown1 = data[2];

        const terminalId = ((data[3] << 16) | (data[4] << 8) | data[5]) >>> 0;
        const lastRefillDate = decodeDate((data[6] << 8) | data[7]);
        
        const flagAndBalance = (data[8] << 8) | data[9];
        const flag = (flagAndBalance >> 15) & 1;
        const balance = flagAndBalance & 0x7FFF;

        const unknown2 = data[10];
        const hash = data.slice(11);

        return new TicketInfoBlock(expiryDate, unknown1, terminalId, lastRefillDate, flag, balance, unknown2, hash);
    }
}

const idsec = Uint8Array.fromHex("25F2345A363900000000363035300000");
console.log(LastTripBlock.decode(idsec));

const cardsec = Uint8Array.fromHex("0036FF00000000006BEBD47BB75780FF");
console.log(CardInfoBlock.decode(cardsec));

const ticketsec = Uint8Array.fromHex("36FF8053FC38345A000F805E21A73ADB");
console.log(TicketInfoBlock.decode(ticketsec));