/** Pure logic for a collaboration pipeline: statuses, allowed transitions, filtering. */

export type Status = "proposed" | "negotiating" | "active" | "completed" | "declined";

export type Collaboration = {
  id: string;
  partner: string;
  project: string;
  status: Status;
  updatedAt: string; // YYYY-MM-DD
  notes?: string;
};

export const STATUSES: Status[] = ["proposed", "negotiating", "active", "completed", "declined"];

export const TRANSITIONS: Record<Status, Status[]> = {
  proposed: ["negotiating", "declined"],
  negotiating: ["active", "declined"],
  active: ["completed"],
  completed: [],
  declined: ["proposed"], // allow reopening
};

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(c: Collaboration, to: Status, today: string): Collaboration {
  if (!canTransition(c.status, to)) throw new Error(`Cannot move from ${c.status} to ${to}`);
  return { ...c, status: to, updatedAt: today };
}

export function countByStatus(items: Collaboration[]): Record<Status, number> {
  const out = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const c of items) out[c.status]++;
  return out;
}

/** Open work first (in pipeline order), then most recently updated. */
export function sortPipeline(items: Collaboration[]): Collaboration[] {
  return [...items].sort(
    (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function filterCollabs(items: Collaboration[], opts: { status?: Status | null; query?: string }): Collaboration[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return sortPipeline(
    items.filter(
      (c) =>
        (!opts.status || c.status === opts.status) &&
        (!q || [c.partner, c.project, c.notes ?? ""].some((s) => s.toLowerCase().includes(q))),
    ),
  );
}

export function validateNew(partner: string, project: string): string | null {
  if (!partner.trim()) return "Partner is required";
  if (!project.trim()) return "Project is required";
  if (partner.trim().length > 60 || project.trim().length > 80) return "Keep partner ≤ 60 and project ≤ 80 characters";
  return null;
}

export const SAMPLE_COLLABS: Collaboration[] = [
  { id: "k1", partner: "Studio Lumen", project: "Brand refresh video", status: "active", updatedAt: "2025-06-12", notes: "Shoot on 20 June" },
  { id: "k2", partner: "Ploy Illustrates", project: "Children's book cover", status: "negotiating", updatedAt: "2025-06-18" },
  { id: "k3", partner: "Open Data TH", project: "Air-quality dashboard", status: "proposed", updatedAt: "2025-06-20" },
  { id: "k4", partner: "Beanbag Games", project: "Game jam soundtrack", status: "completed", updatedAt: "2025-04-30" },
  { id: "k5", partner: "Crypto Coin Co", project: "Token landing page", status: "declined", updatedAt: "2025-05-02", notes: "Out of scope" },
];
