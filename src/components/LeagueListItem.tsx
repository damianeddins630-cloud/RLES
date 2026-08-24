import { useLeagueSettings } from "../hooks/useLeagueSettings";
import type { League } from "../types/league";

interface LeagueListItemProps {
  league: League;
  onSelect: () => void;
}

export function LeagueListItem({ league, onSelect }: LeagueListItemProps) {
  const { settings } = useLeagueSettings(league.id, league.name);
  const logoUrl = settings.logoUrl;
  const displayName = settings.name || league.name;

  return (
    <button type="button" className="league-list-item" onClick={onSelect}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="league-list-logo"
          width={48}
          height={48}
        />
      ) : (
        <span className="league-list-badge" aria-hidden="true">
          {league.shortLabel}
        </span>
      )}
      <span className="league-list-name">{displayName}</span>
    </button>
  );
}
