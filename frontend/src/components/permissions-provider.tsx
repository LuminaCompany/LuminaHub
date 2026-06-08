"use client";

import { createContext, useContext, useMemo } from "react";
import { can as resolveCan, isManager } from "@/lib/permissions";
import type { PermAction, PermResource, Profile } from "@/types";

interface PermissionsContextValue {
  profile: Profile | null;
  isManager: boolean;
  can: (resource: PermResource, action?: PermAction) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  profile,
  children,
}: {
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const value = useMemo<PermissionsContextValue>(
    () => ({
      profile,
      isManager: isManager(profile?.role),
      can: (resource, action = "view") => resolveCan(profile, resource, action),
    }),
    [profile]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    // Fail closed: no provider means no permissions.
    return {
      profile: null,
      isManager: false,
      can: () => false,
    };
  }
  return ctx;
}

/** Conditionally render children when the user has the given permission. */
export function Can({
  resource,
  action = "view",
  children,
  fallback = null,
}: {
  resource: PermResource;
  action?: PermAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  return <>{can(resource, action) ? children : fallback}</>;
}
