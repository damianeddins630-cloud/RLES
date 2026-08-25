import type { FranchiseRole } from "../types/leagueAdmin";

export const DEFAULT_FRANCHISE_ROLES: FranchiseRole[] = [
  { id: "owner", name: "Franchise Owner", order: 0 },
  { id: "gm", name: "General Manager", order: 1 },
  { id: "manager", name: "Manager", order: 2 },
  { id: "player", name: "Player", order: 3 },
];
