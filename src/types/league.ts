export interface League {
  id: string;
  name: string;
  /** Short label shown when no logo (e.g. RLES) */
  shortLabel: string;
  logoUrl?: string | null;
}
