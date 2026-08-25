import type { TeamStandingRow } from "../../../types/standings";
import { RankCell } from "./standingsUtils";

interface TeamStandingsTableProps {
  teams: TeamStandingRow[];
  title?: string;
}

export function TeamStandingsTable({ teams, title }: TeamStandingsTableProps) {
  if (teams.length === 0) {
    return (
      <p className="league-admin-empty">
        No team standings yet. Report matches on Discord to build the table.
      </p>
    );
  }

  return (
    <div className="standings-block glass-panel">
      {title && <h3 className="standings-block-title">{title}</h3>}
      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Team</th>
              <th scope="col">W</th>
              <th scope="col">L</th>
              <th scope="col">GP</th>
              <th scope="col">Win %</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id}>
                <td><RankCell rank={index + 1} /></td>
                <td>
                  <div className="standings-team-cell">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt="" className="standings-team-logo" />
                    ) : (
                      <span className="standings-team-badge">
                        {team.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span>{team.name}</span>
                  </div>
                </td>
                <td className="standings-num">{team.wins}</td>
                <td className="standings-num">{team.losses}</td>
                <td className="standings-num">{team.gamesPlayed}</td>
                <td className="standings-num">{team.winPct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
