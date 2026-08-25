function rankMedal(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

export function RankCell({ rank }: { rank: number }) {
  const medal = rankMedal(rank);
  return (
    <span className="standings-rank">
      {medal ? (
        <span className="standings-rank-medal" aria-label={`Rank ${rank}`}>{medal}</span>
      ) : (
        rank
      )}
    </span>
  );
}
