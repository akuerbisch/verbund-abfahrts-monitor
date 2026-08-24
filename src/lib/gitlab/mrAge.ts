export interface MrAgeTier {
    label: string;
    emoji: string;
    minDays: number;
    barOpacity: number;
    badgeColor: "gray" | "warning" | "orange" | "error";
}

// Five discrete bands, from "just opened" to "practically fossilized" — thresholds
// roughly double each time (0/3/7/14/30 days) so the scale still feels meaningful
// whether a project reviews MRs same-day or lets them sit for a month.
export const MR_AGE_TIERS: readonly MrAgeTier[] = [
    { minDays: 0, label: "Fresh", emoji: "🐣", barOpacity: 0, badgeColor: "gray" },
    { minDays: 3, label: "Ripening", emoji: "🍌", barOpacity: 0.3, badgeColor: "warning" },
    { minDays: 7, label: "Vintage", emoji: "🍷", barOpacity: 0.55, badgeColor: "orange" },
    { minDays: 14, label: "Ancient", emoji: "🏺", barOpacity: 0.8, badgeColor: "error" },
    { minDays: 30, label: "Fossil", emoji: "🦴", barOpacity: 1, badgeColor: "error" },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getMrAgeInDays(createdAt: string, now: Date = new Date()): number {
    return Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / MS_PER_DAY);
}

/** The last tier whose threshold the given age has reached. */
export function getMrAgeTier(ageInDays: number): MrAgeTier {
    return MR_AGE_TIERS.reduce((selected, tier) => (ageInDays >= tier.minDays ? tier : selected), MR_AGE_TIERS[0]);
}
