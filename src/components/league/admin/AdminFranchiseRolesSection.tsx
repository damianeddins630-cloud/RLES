import { useState } from "react";
import type { FranchiseRole } from "../../../types/leagueAdmin";

interface AdminFranchiseRolesSectionProps {
  roles: FranchiseRole[];
  onAdd: (name: string) => void;
  onRemove: (roleId: string) => void;
  onUpdate: (roleId: string, patch: Partial<FranchiseRole>) => void;
}

export function AdminFranchiseRolesSection({
  roles,
  onAdd,
  onRemove,
  onUpdate,
}: AdminFranchiseRolesSectionProps) {
  const [name, setName] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  }

  const sorted = [...roles].sort((a, b) => a.order - b.order);

  return (
    <section className="league-admin-section" aria-labelledby="admin-roles-heading">
      <header className="league-admin-section-head">
        <h2 id="admin-roles-heading" className="league-admin-section-title">
          Franchise roles
        </h2>
        <p className="league-settings-hint">
          Roles for franchise staff and players (Owner, GM, Manager, Player, etc.).
          Assign these to signed-up members.
        </p>
      </header>

      <div className="league-admin-add-row">
        <input
          type="text"
          className="league-settings-input"
          placeholder="Role name (e.g. Assistant Coach)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button type="button" className="league-admin-add-btn" onClick={handleAdd}>
          Add role
        </button>
      </div>

      <ul className="league-admin-table" aria-label="Franchise roles">
        {sorted.map((role) => (
          <li key={role.id} className="league-admin-row glass-panel">
            <label className="league-settings-field league-admin-role-field">
              <span className="league-settings-label">Role name</span>
              <input
                type="text"
                className="league-settings-input"
                value={role.name}
                onChange={(e) => onUpdate(role.id, { name: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="league-admin-remove-btn"
              onClick={() => onRemove(role.id)}
              disabled={roles.length <= 1}
              title={roles.length <= 1 ? "At least one role is required" : "Remove role"}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
