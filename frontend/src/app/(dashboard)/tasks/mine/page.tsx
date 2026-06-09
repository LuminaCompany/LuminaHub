import { serverFetch } from "@/lib/api.server";
import { CACHE_TAGS } from "@/lib/cache";
import type { Goal, MyTask } from "@/types";
import { MyTasksClient } from "@/components/tasks/my-tasks-client";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

async function fetchMyTasks(): Promise<MyTask[]> {
  return serverFetch<MyTask[]>("/api/v1/tasks/mine", {
    tags: [CACHE_TAGS.tasks],
    revalidate: 2,
  });
}

async function fetchActiveGoals(): Promise<Goal[]> {
  try {
    return await serverFetch<Goal[]>("/api/v1/goals?status=active", {
      tags: [CACHE_TAGS.goals],
      revalidate: 2,
    });
  } catch {
    // Collaborators without goals visibility still see their tasks.
    return [];
  }
}

async function fetchUsers(): Promise<UserSummary[]> {
  return serverFetch<UserSummary[]>("/api/v1/auth/users", {
    tags: [CACHE_TAGS.users],
    revalidate: 2,
  });
}

export default async function MyTasksPage() {
  const [tasks, goals, users] = await Promise.all([
    fetchMyTasks(),
    fetchActiveGoals(),
    fetchUsers(),
  ]);

  return <MyTasksClient tasks={tasks} goals={goals} users={users} />;
}
