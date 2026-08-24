interface LeagueTabPlaceholderProps {
  title: string;
}

export function LeagueTabPlaceholder({ title }: LeagueTabPlaceholderProps) {
  return (
    <div className="league-main-panel glass-panel">
      <h1 className="league-main-title">{title}</h1>
      <p className="league-main-placeholder">Content coming soon.</p>
    </div>
  );
}
