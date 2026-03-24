export enum TransportType {
    BUS = 1,
    TROLLEYBUS,
    TRAMWAY
}

export enum TechnologicalType {
    Passenger,
    Operator,
    Other, // для значений 2 и 3
}

export enum ProductType {
    /** Electronic Purse */
    EP,
    /** Season Unlimited */
    SU = 0x64,
    /** Season Limited */
    SL = 0x65,
    ET = 0x66, // unknown
    CT = 0x67, // unknown
    /** Limited Trip */
    LT = 0x69,
    /** Omsk Limited */
    OL = 0x6a,
    /** Unknown */
    Unknown = 0x7F // mentioned as "BL"
}