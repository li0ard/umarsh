/** Тип транспорта */
export enum TransportType {
    BUS = 1,
    TROLLEYBUS,
    TRAMWAY
}

/** Тип карты (технический) */
export enum TechnologicalType {
    /** Карта пассажира */
    Passenger,
    /** Карта оператора */
    Operator,
    /** Прочие карты */
    Other, // для значений 2 и 3
}

/** Тип проездного */
export enum ProductType {
    /** Electronic Purse */
    EP,
    /** Season Unlimited */
    SU = 0x64,
    /** Season Limited */
    SL = 0x65,
    /** Limited Trip */
    LT = 0x69,
    /** Omsk Limited */
    OL = 0x6a,
    /** Unknown */
    Unknown = 0x7F
}