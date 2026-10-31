export function formatDuration(ms: number): string {
  if (ms <= 0) return "0m";

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  if (totalHours > 0) {
    return `${totalHours}h ${remainingMinutes}m`;
  }
  return `${totalMinutes}m`;
}

export function calculateResolutionDuration(createdAt: Date | string, resolvedAt: Date | string | null): string | null {
  if (!resolvedAt) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(resolvedAt).getTime();
  return formatDuration(end - start);
}

export function calculateElapsed(createdAt: Date | string): string {
  const start = new Date(createdAt).getTime();
  const now = Date.now();
  return formatDuration(now - start);
}

export function getSLAStatus(priority: string, createdAt: Date | string, resolvedAt: Date | string | null): {
  isBreached: boolean;
  targetHours: number;
} {
  let targetHours = 48; // default
  if (priority === "URGENT") targetHours = 4;
  else if (priority === "HIGH") targetHours = 24;
  else if (priority === "MEDIUM") targetHours = 48;
  else if (priority === "LOW") targetHours = 72;

  const start = new Date(createdAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const elapsedHours = (end - start) / (1000 * 60 * 60);

  return {
    isBreached: elapsedHours > targetHours,
    targetHours,
  };
}
