import { describe, expect, it } from "vitest";
import { isCollaboration, SAMPLE_COLLABS, transition } from "./collabs";
import { encodeEnvelope, listCodec } from "./persist";

describe("pipeline persistence", () => {
  const codec = listCodec(isCollaboration);

  it("round-trips the pipeline after a transition", () => {
    const list = SAMPLE_COLLABS.map((c, i) => (i === 2 ? transition(c, "negotiating", "2026-01-05") : c));
    expect(codec.decode(codec.encode(list))).toEqual(list);
  });

  it("drops entries with unknown status or bad dates", () => {
    const good = SAMPLE_COLLABS[0];
    const raw = encodeEnvelope([good, { ...good, id: "s", status: "archived" }, { ...good, id: "d", updatedAt: "yesterday" }]);
    expect(codec.decode(raw)?.map((c) => c.id)).toEqual([good.id]);
  });
});
