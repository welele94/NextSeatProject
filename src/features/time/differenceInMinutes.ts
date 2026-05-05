function isValidDate(date: Date): boolean {
    return !Number.isNaN(date.getTime());
}

export function differenceInMinutes(start: Date, end: Date): number {
    if (!isValidDate(start) || !isValidDate(end)){
        return 0;
    }

    return Math.round((end.getTime() - start.getTime()) / 60000);
}