export const STAT_CATEGORIES = {
  goals: { label: "Goals", field: "goals" as const },
  assists: { label: "Assists", field: "assists" as const },
  saves: { label: "Saves", field: "saves" as const },
  shots: { label: "Shots", field: "shots" as const },
  demos: { label: "Demos", field: "demos" as const },
  score: { label: "Score", field: "score" as const },
  matches: { label: "Matches Played", field: "matchesPlayed" as const },
} as const;

export type StatCategory = keyof typeof STAT_CATEGORIES;

export const STAT_CATEGORY_CHOICES = Object.entries(STAT_CATEGORIES).map(
  ([value, { label }]) => ({ name: label, value })
);

export function isStatCategory(value: string): value is StatCategory {
  return value in STAT_CATEGORIES;
}
