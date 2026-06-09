"use server";

import {
  revalidateClients,
  revalidateServices,
  revalidateTransactions,
  revalidateProjects,
  revalidateTasks,
  revalidateGoals,
  revalidateHome,
  revalidateInternalTasks,
  revalidateUsers,
} from "@/lib/cache.server";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache";

const REVALIDATORS: Record<CacheTag, () => void> = {
  [CACHE_TAGS.clients]: revalidateClients,
  [CACHE_TAGS.services]: revalidateServices,
  [CACHE_TAGS.transactions]: revalidateTransactions,
  [CACHE_TAGS.projects]: revalidateProjects,
  [CACHE_TAGS.tasks]: revalidateTasks,
  [CACHE_TAGS.goals]: revalidateGoals,
  [CACHE_TAGS.home]: revalidateHome,
  [CACHE_TAGS.internalTasks]: revalidateInternalTasks,
  [CACHE_TAGS.users]: revalidateUsers,
};

/**
 * Purge one or more cache tags after a mutation. Call from a client component's
 * success handler (before `router.refresh()`) so the refreshed render misses the
 * Data Cache and re-fetches fresh data — read-your-own-writes, ~0s latency.
 */
export async function revalidateCache(tags: CacheTag[]): Promise<void> {
  for (const tag of tags) REVALIDATORS[tag]?.();
}
