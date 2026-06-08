import { unstable_cache, revalidateTag } from "next/cache";

export { unstable_cache };

// Entity cache tags
export const CACHE_TAGS = {
  clients: "clients",
  services: "services",
  transactions: "transactions",
  projects: "projects",
  tasks: "tasks",
  goals: "goals",
  home: "home",
  internalTasks: "internal-tasks",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

// Profile to use for revalidation — empty string means invalidate all profiles
const DEFAULT_PROFILE = "";

// Typed revalidation helpers
export function revalidateClients() {
  revalidateTag(CACHE_TAGS.clients, DEFAULT_PROFILE);
}

export function revalidateServices() {
  revalidateTag(CACHE_TAGS.services, DEFAULT_PROFILE);
}

export function revalidateTransactions() {
  revalidateTag(CACHE_TAGS.transactions, DEFAULT_PROFILE);
}

export function revalidateProjects() {
  revalidateTag(CACHE_TAGS.projects, DEFAULT_PROFILE);
}

export function revalidateTasks() {
  revalidateTag(CACHE_TAGS.tasks, DEFAULT_PROFILE);
}

export function revalidateGoals() {
  revalidateTag(CACHE_TAGS.goals, DEFAULT_PROFILE);
}

export function revalidateHome() {
  revalidateTag(CACHE_TAGS.home, DEFAULT_PROFILE);
}

export function revalidateInternalTasks() {
  revalidateTag(CACHE_TAGS.internalTasks, DEFAULT_PROFILE);
}

/**
 * Typed wrapper around unstable_cache.
 * Usage:
 *   const data = await cachedFetch(
 *     () => fetchSomething(),
 *     ['cache-key'],
 *     { tags: [CACHE_TAGS.clients], revalidate: 60 }
 *   );
 */
export function cachedFetch<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: { tags?: string[]; revalidate?: number | false } = {}
): Promise<T> {
  return unstable_cache(fn, keyParts, {
    tags: options.tags,
    revalidate: options.revalidate ?? 60,
  })();
}
