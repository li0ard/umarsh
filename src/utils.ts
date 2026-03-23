export const decodeDate = (date: number): Date => {
    const year = ((date >> 9) & 0x7F) + 2000;
    const month = (date >> 5) & 0x0F;
    const day = date & 0x1F;

    return new Date(year, month - 1, day);
}

export const decodeTime = (date: number): number[] => [Math.floor(date / 100), date % 100];