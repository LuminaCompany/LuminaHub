import { unstable_cache, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cache";

export { unstable_cache };
export { CACHE_TAGS, type CacheTag } from "./cache";

const DEFAULT_PROFILE = "";

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
