export function createSlackTimestamp(now: number = Date.now()): string {
    const seconds = Math.floor(now / 1000); // Convert to seconds
    const microseconds = (now % 1000) * 1000; // Remainder in microseconds

    return `${seconds}.${microseconds}`;
}