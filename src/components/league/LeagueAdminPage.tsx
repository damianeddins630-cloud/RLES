import { useState } from "react";
import type { AdminSection } from "../../types/leagueAdmin";
import { useLeagueAdmin } from "../../hooks/useLeagueAdmin";
import { AdminMembersSection } from "./admin/AdminMembersSection";
import { AdminPlayersSection } from "./admin/AdminPlayersSection";
import { AdminTeamsSection } from "./admin/AdminTeamsSection";
import { AdminTierCapsSection } from "./admin/AdminTierCapsSection";
import { AdminTierManageSection } from "./admin/AdminTierManageSection";

const SECTIONS: { id: AdminSection; label: string }[] = [
  { id: "tiers", label: "Tiers & caps" },
  { id: "teams", label: "Teams" },
  { id: "members", label: "Members" },
  { id: "players", label: "Players" },
];

interface LeagueAdminPageProps {
  leagueId: string;
}

export function LeagueAdminPage({ leagueId }: LeagueAdminPageProps) {
  const [section, setSection] = useState<AdminSection>("tiers");
  const admin = useLeagueAdmin(leagueId);
  const { data } = admin;

  return (
    <div className="league-admin glass-panel">
      <header className="league-admin-header">
        <div>
          <h1 className="league-settings-title">League admin</h1>
          <p className="league-settings-subtitle">
            Manage tiers, teams, members, rosters, tracker links, and salary caps.
          </p>
        </div>
        <div className="league-admin-header-actions">
          <button type="button" className="league-settings-save-btn" onClick={admin.save}>
            Save changes
          </button>
          {admin.saved && (
            <span className="league-settings-saved" role="status">Saved.</span>
          )}
        </div>
      </header>

      <nav className="league-admin-nav" aria-label="Admin sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`league-admin-nav-btn${section === s.id ? " league-admin-nav-btn--active" : ""}`}
            aria-current={section === s.id ? "page" : undefined}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="league-admin-body">
        {section === "tiers" && (
          <>
            <AdminTierManageSection
              tiers={data.tiers}
              onAdd={admin.addTier}
              onRemove={admin.removeTier}
              onUpdate={admin.updateTier}
            />
            <AdminTierCapsSection
              tiers={data.tiers}
              tierConfigs={data.tierConfigs}
              onUpdate={admin.updateTierConfig}
            />
          </>
        )}
        {section === "teams" && (
          <AdminTeamsSection
            tiers={data.tiers}
            teams={data.teams}
            getTeamSalaryTotal={admin.getTeamSalaryTotal}
            getTierConfig={admin.getTierConfig}
            onAdd={admin.addTeam}
            onRemove={admin.removeTeam}
            onUpdate={admin.updateTeam}
          />
        )}
        {section === "members" && (
          <AdminMembersSection
            tiers={data.tiers}
            teams={data.teams}
            members={data.members}
            tierConfigs={data.tierConfigs}
            onAdd={admin.addMember}
            onRemove={admin.removeMember}
            onUpdate={admin.updateMember}
          />
        )}
        {section === "players" && (
          <AdminPlayersSection
            tiers={data.tiers}
            teams={data.teams}
            members={data.members}
            players={data.players}
            tierConfigs={data.tierConfigs}
            getTeamSalaryTotal={admin.getTeamSalaryTotal}
            getTierConfig={admin.getTierConfig}
            onAddPlayer={admin.addPlayer}
            onRemovePlayer={admin.removePlayer}
          />
        )}
      </div>
    </div>
  );
}
