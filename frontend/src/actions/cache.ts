"use server";

import { revalidateGoals as _revalidateGoals } from "@/lib/cache.server";

export async function revalidateGoalsAction() {
  _revalidateGoals();
}
