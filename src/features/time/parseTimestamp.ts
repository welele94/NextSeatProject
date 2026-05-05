export function parseTimestamp(timestamp: string): Date {
    const parsedDate = new Date(timestamp);

    if (Number.isNaN(parsedDate.getTime())){
        throw new Error('Invalid timestamp: ${timestamp}'); 

    }

    return parsedDate;
}