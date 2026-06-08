export const CACHE_TAGS = {
  clients: "clients",
  services: "services",
  transactions: "transactions",
  projects: "projects",
  tasks: "tasks",
  goals: "goals",
  home: "home",
  internalTasks: "internal-tasks",
  users: "users",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
