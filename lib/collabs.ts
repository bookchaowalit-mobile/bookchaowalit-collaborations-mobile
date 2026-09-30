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

/** Comparison/search key: NFKC, zero-width/BOM stripped, whitespace collapsed, lowercase. */
export function textKey(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Length as people count it (an emoji is 1, not 2 UTF-16 units). */
const charLength = (text: string) => Array.from(text.trim()).length;

export function filterCollabs(items: Collaboration[], opts: { status?: Status | null; query?: string }): Collaboration[] {
  const q = textKey(opts.query ?? "");
  return sortPipeline(
    items.filter(
      (c) =>
        (!opts.status || c.status === opts.status) &&
        (!q || [c.partner, c.project, c.notes ?? ""].some((s) => textKey(s).includes(q))),
    ),
  );
}

/**
 * Validate a new collaboration. Pass the existing `items` to also reject a
 * duplicate partner + project (ignoring case, spacing, Unicode form and
 * invisible characters), e.g. from a double tap.
 */
export function validateNew(partner: string, project: string, items: Collaboration[] = []): string | null {
  if (!textKey(partner)) return "Partner is required";
  if (!textKey(project)) return "Project is required";
  if (charLength(partner) > 60 || charLength(project) > 80) return "Keep partner ≤ 60 and project ≤ 80 characters";
  const key = `${textKey(partner)}\u0000${textKey(project)}`;
  if (items.some((c) => `${textKey(c.partner)}\u0000${textKey(c.project)}` === key)) {
    return "This partner and project are already in the pipeline";
  }
  return null;
}

export const SAMPLE_COLLABS: Collaboration[] = [
  { id: "k1", partner: "Studio Lumen", project: "Brand refresh video", status: "active", updatedAt: "2025-06-12", notes: "Shoot on 20 June" },
  { id: "k2", partner: "Ploy Illustrates", project: "Children's book cover", status: "negotiating", updatedAt: "2025-06-18" },
  { id: "k3", partner: "Open Data TH", project: "Air-quality dashboard", status: "proposed", updatedAt: "2025-06-20" },
  { id: "k4", partner: "Beanbag Games", project: "Game jam soundtrack", status: "completed", updatedAt: "2025-04-30" },
  { id: "k5", partner: "Crypto Coin Co", project: "Token landing page", status: "declined", updatedAt: "2025-05-02", notes: "Out of scope" },
];

/** Type guard used when loading the pipeline from local storage. */
export function isCollaboration(value: unknown): value is Collaboration {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.partner === "string" &&
    c.partner.trim().length > 0 &&
    typeof c.project === "string" &&
    c.project.trim().length > 0 &&
    STATUSES.includes(c.status as Status) &&
    typeof c.updatedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(c.updatedAt) &&
    (c.notes === undefined || typeof c.notes === "string")
  );
}
