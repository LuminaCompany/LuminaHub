"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  ClipboardList,
  Wallet,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { can } from "@/lib/permissions";
import type { PermResource, Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
  children?: NavChild[];
  /** Resource gating this item; omitted = always visible. */
  resource?: PermResource;
}

interface NavChild {
  label: string;
  href: string;
  badge?: string;
}

interface SidebarProps {
  user: User | null;
  profile?: Profile | null;
  projectCount?: number;
  internalTaskCount?: number;
}

const COLLAPSED_KEY = "luminahub:sidebar-collapsed";

// ─── Nav config ───────────────────────────────────────────────────────────────

function buildNavItems(
  profile: Profile | null | undefined,
  projectCount = 0,
  internalTaskCount = 0
): NavItem[] {
  const items: NavItem[] = [
    {
      label: "Home",
      href: "/home",
      icon: <Home size={16} />,
      resource: "home",
    },
    {
      label: "Métricas",
      href: "/metrics",
      icon: <BarChart3 size={16} />,
      resource: "metrics",
    },
    {
      label: "Tarefas",
      icon: <ClipboardList size={16} />,
      resource: "tasks",
      children: [
        {
          label: "Projetos",
          href: "/tasks/projects",
          badge: projectCount > 0 ? String(projectCount) : undefined,
        },
        {
          label: "Tarefas Internas",
          href: "/tasks/internal",
          badge: internalTaskCount > 0 ? String(internalTaskCount) : undefined,
        },
      ],
    },
    {
      label: "Finanças",
      href: "/finance",
      icon: <Wallet size={16} />,
      resource: "finance",
    },
    {
      label: "Clientes",
      href: "/clients",
      icon: <Users size={16} />,
      resource: "clients",
    },
    {
      label: "Formulários",
      href: "/forms",
      icon: <FileText size={16} />,
      disabled: true,
      badge: "Em breve",
    },
  ];

  // Hide any tab the user cannot at least view.
  return items.filter(
    (item) => !item.resource || can(profile, item.resource, "view")
  );
}

// ─── Nav item components ──────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon,
  badge,
  disabled,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const activeStyle = {
    backgroundColor: "rgba(0,234,255,0.08)",
    color: "var(--cyan)",
  };

  const defaultStyle = {
    color: "var(--fg-2)",
  };

  const disabledStyle = {
    color: "var(--fg-3)",
    cursor: "not-allowed",
    opacity: 0.6,
  };

  const linkContent = (
    <>
      <span style={{ color: disabled ? "var(--fg-3)" : isActive ? "var(--cyan)" : "currentColor", flexShrink: 0 }}>
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{
                backgroundColor: isActive
                  ? "rgba(0,234,255,0.15)"
                  : "rgba(255,255,255,0.06)",
                color: isActive ? "var(--cyan)" : disabled ? "var(--fg-3)" : "var(--fg-2)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {badge}
            </Badge>
          )}
        </>
      )}
    </>
  );

  const wrapWithTooltip = (element: React.ReactNode) => {
    if (!collapsed) return element as React.ReactElement;
    return (
      <Tooltip>
        <TooltipTrigger>{element as React.ReactElement}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  if (disabled) {
    return wrapWithTooltip(
      <span
        className={`flex items-center gap-3 rounded-lg text-sm select-none ${collapsed ? "px-2 py-2 justify-center" : "px-3 py-2"}`}
        style={disabledStyle}
      >
        {linkContent}
      </span>
    );
  }

  return wrapWithTooltip(
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg text-sm transition-colors group ${collapsed ? "px-2 py-2 justify-center" : "px-3 py-2"}`}
      style={isActive ? activeStyle : defaultStyle}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "rgba(255,255,255,0.03)";
          (e.currentTarget as HTMLElement).style.color = "var(--fg-1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "";
          (e.currentTarget as HTMLElement).style.color = "var(--fg-2)";
        }
      }}
    >
      {linkContent}
    </Link>
  );
}

function NavDropdown({
  label,
  icon,
  children,
  collapsed,
  onChildClick,
}: {
  label: string;
  icon: React.ReactNode;
  children: NavChild[];
  collapsed?: boolean;
  onChildClick?: () => void;
}) {
  const pathname = usePathname();
  const isGroupActive = children.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );
  const [open, setOpen] = useState(isGroupActive);

  // When collapsed, render as a tooltip with the first active child highlighted
  if (collapsed) {
    const activeChild = children.find(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
    );
    return (
      <Tooltip>
        <TooltipTrigger>
          <div
            className="flex items-center justify-center px-2 py-2 rounded-lg cursor-pointer transition-colors"
            style={{
              color: isGroupActive ? "var(--cyan)" : "var(--fg-2)",
              backgroundColor: isGroupActive ? "rgba(0,234,255,0.08)" : undefined,
            }}
            onClick={() => setOpen((v) => !v)}
          >
            <span style={{ color: isGroupActive ? "var(--cyan)" : "currentColor" }}>
              {icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs font-medium mb-1" style={{ color: "var(--fg-2)" }}>{label}</span>
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onChildClick}
                className="text-sm py-0.5"
                style={{ color: pathname === child.href ? "var(--cyan)" : "var(--fg-1)" }}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          color: isGroupActive ? "var(--cyan)" : "var(--fg-2)",
          backgroundColor: isGroupActive ? "rgba(0,234,255,0.08)" : undefined,
        }}
        onMouseEnter={(e) => {
          if (!isGroupActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(255,255,255,0.03)";
            (e.currentTarget as HTMLElement).style.color = "var(--fg-1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isGroupActive) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "";
            (e.currentTarget as HTMLElement).style.color = "var(--fg-2)";
          }
        }}
      >
        <span style={{ color: isGroupActive ? "var(--cyan)" : "currentColor" }}>
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        <span style={{ color: "var(--fg-3)" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {open && (
        <div className="mt-0.5 ml-4 pl-3 flex flex-col gap-0.5 border-l" style={{ borderColor: "var(--border)" }}>
          {children.map((child) => {
            const isActive =
              pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onChildClick}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  color: isActive ? "var(--cyan)" : "var(--fg-2)",
                  backgroundColor: isActive ? "rgba(0,234,255,0.06)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--fg-1)";
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--fg-2)";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }
                }}
              >
                <span className="flex-1">{child.label}</span>
                {child.badge && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(0,234,255,0.15)"
                        : "rgba(255,255,255,0.06)",
                      color: isActive ? "var(--cyan)" : "var(--fg-2)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {child.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar inner content ────────────────────────────────────────────────────

function SidebarContent({
  user,
  profile,
  projectCount,
  internalTaskCount,
  collapsed,
  onNavClick,
}: SidebarProps & { collapsed?: boolean; onNavClick?: () => void }) {
  const navItems = buildNavItems(profile, projectCount, internalTaskCount);
  // Configurações is open to everyone; collaborators just see fewer options inside.
  const showSettings = true;

  const displayName =
    profile?.name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Usuário";
  const avatarUrl = profile?.avatar_url ?? null;

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {/* Logo */}
      <div
        className={`border-b ${collapsed ? "px-3 py-5 flex justify-center" : "px-5 py-5"}`}
        style={{ borderColor: "var(--border)" }}
      >
        {collapsed ? (
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--cyan)" }}
          >
            LH
          </span>
        ) : (
          <>
            <h1
              className="text-lg font-bold tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--cyan)",
              }}
            >
              LuminaHub
            </h1>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
            >
              ERP Interno
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          if (item.children) {
            return (
              <NavDropdown
                key={item.label}
                label={item.label}
                icon={item.icon}
                children={item.children}
                collapsed={collapsed}
                onChildClick={onNavClick}
              />
            );
          }
          return (
            <NavLink
              key={item.label}
              href={item.href!}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              disabled={item.disabled}
              collapsed={collapsed}
              onClick={onNavClick}
            />
          );
        })}
      </nav>

      {/* Settings (managers only) — sits just above the user block */}
      {showSettings && (
        <div className={`${collapsed ? "px-2" : "px-3"} pb-1`}>
          <NavLink
            href="/settings"
            label="Configurações"
            icon={<Settings size={16} />}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        </div>
      )}

      {/* User */}
      <div
        className={`border-t ${collapsed ? "px-2 py-3" : "px-3 py-4"}`}
        style={{ borderColor: "var(--border)" }}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex justify-center">
                <Avatar className="h-8 w-8 shrink-0 cursor-default">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback
                    style={{
                      backgroundColor: "rgba(0,234,255,0.12)",
                      color: "var(--cyan)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>{displayName}</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div
            className="flex items-center gap-3 px-2 py-2 rounded-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <Avatar className="h-8 w-8 shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback
                style={{
                  backgroundColor: "rgba(0,234,255,0.12)",
                  color: "var(--cyan)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span
                className="text-sm font-medium truncate"
                style={{ color: "var(--fg-1)" }}
              >
                {displayName}
              </span>
              {user?.email && (
                <span
                  className="text-[11px] truncate"
                  style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
                >
                  {user.email}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function Sidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      // localStorage not available
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        // localStorage not available
      }
      return next;
    });
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r transition-all duration-200"
        style={{
          width: collapsed ? "64px" : "256px",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <SidebarContent {...props} collapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-[72px] z-10 flex items-center justify-center w-6 h-6 rounded-full border transition-colors"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-2)",
            color: "var(--fg-2)",
          }}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>
      </aside>

      {/* Mobile hamburger + Sheet */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--fg-1)",
                }}
              />
            }
          >
            <Menu size={18} />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 border-r"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <SidebarContent
              {...props}
              collapsed={false}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
