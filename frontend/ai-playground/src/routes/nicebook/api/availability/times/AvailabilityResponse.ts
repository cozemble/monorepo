export type TimeSlot = {
    time: string; // ISO date string representing the start time
    endTime: string; // ISO date string representing the end time
    slotId: number; // An identifier for the time slot
};

export type AvailabilityResponse = TimeSlot[]; // An array of TimeSlot objects
