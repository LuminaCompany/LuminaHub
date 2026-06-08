import { redirect } from "next/navigation";
import { getProfile, serverFetch } from "@/lib/api.server";
import { SettingsClient } from "@/components/settings/settings-client";
import { ProfileCard } from "@/components/settings/profile-card";
import type { User } from "@/types";

export interface CatalogEntry {
  resource: string;
  actions: string[];
}

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/home");
  }

  const isManager = profile.role === "manager";

  // User management data is only loaded for managers.
  const [users, catalog] = isManager
    ? await Promise.all([
        serverFetch<User[]>("/api/v1/admin/users", { revalidate: 0 }),
        serverFetch<CatalogEntry[]>("/api/v1/admin/catalog", { revalidate: 0 }),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-xl font-bold tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--fg-1)" }}
        >
          Configurações
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-3)" }}>
          {isManager
            ? "Gerencie seu perfil, usuários e permissões de acesso."
            : "Gerencie seu perfil."}
        </p>
      </div>

      <ProfileCard profile={profile} />

      {isManager && (
        <SettingsClient
          users={users}
          catalog={catalog}
          currentUserId={profile.id}
        />
      )}
    </div>
  );
}
