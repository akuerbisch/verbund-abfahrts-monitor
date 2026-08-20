// Age at which the highlight reaches full intensity — merge requests open
// longer than this are as "old" as the color scale gets.
export const MR_AGE_INTENSITY_MAX_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getMrAgeInDays(createdAt: string, now: Date = new Date()): number {
    return Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / MS_PER_DAY);
}

/** 0 for a freshly opened MR, ramping linearly to 1 at MR_AGE_INTENSITY_MAX_DAYS and beyond. */
export function getMrAgeIntensity(ageInDays: number): number {
    return Math.min(1, Math.max(0, ageInDays / MR_AGE_INTENSITY_MAX_DAYS));
}
