export function formatMinutes(minutes: number): string {
    const safeMinutes = Math.max(Math.round(minutes), 0);

    const hours = Math.floor(safeMinutes / 60); 
    const remainingMinutes = safeMinutes % 60; 

    if (hours === 0){
        return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0){
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}