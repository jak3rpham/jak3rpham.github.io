import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASSET_S00,
  BAR,
  BEAT,
  CUTS,
  GEN_DUR,
  SOURCES,
  SOURCE_BY_ID,
  TRACK,
  downbeats,
  screenDur,
  totalGenerated,
  unusedSources,
  usedCount,
} from "./aruData";

const PUBLIC = join(process.cwd(), "public");
const onDisk = (webPath: string) => existsSync(join(PUBLIC, webPath.replace(/^\//, "")));

/**
 * These tests assert facts about the real edit and the real files, not the plan's internal
 * consistency. Where a claim is about the world (a still exists, a frame sequence is present),
 * the test reaches the world — the file system — rather than trusting a number in this module.
 */
describe("aru sources — the 11 generations", () => {
  it("has 11 sources with unique ids", () => {
    expect(SOURCES).toHaveLength(11);
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(11);
  });

  it("points every source still at a file that actually exists", () => {
    for (const s of SOURCES) {
      expect(onDisk(s.still), `${s.label} still missing: ${s.still}`).toBe(true);
    }
  });

  it("gives written prompts to every planned shot, and none to the unplanned climax", () => {
    for (const s of SOURCES) {
      if (s.id === "s10") {
        // emerged in the build, not from a spec — asserting a prompt would be a lie
        expect(s.imgPrompt).toBeUndefined();
      } else {
        expect(s.imgPrompt!.length, `${s.label} image prompt`).toBeGreaterThan(40);
        expect(s.motPrompt!.length, `${s.label} motion prompt`).toBeGreaterThan(40);
      }
    }
  });

  it("records that three generations never made the cut", () => {
    expect(usedCount()).toBe(8);
    expect(unusedSources().map((s) => s.id).sort()).toEqual(["s02", "s03", "s05"]);
  });
});

describe("aru edit — the CapCut timeline", () => {
  it("references only real sources or declared edit constructs", () => {
    for (const c of CUTS) {
      if (c.construct) continue;
      expect(SOURCE_BY_ID[c.source], `cut ${c.index} → unknown source ${c.source}`).toBeDefined();
    }
  });

  it("opens on the skyline and ends on the burning city", () => {
    expect(CUTS[0].source).toBe("s08");
    expect(CUTS[CUTS.length - 1].source).toBe("s10");
  });

  it("only uses sources that are marked used-in-edit", () => {
    for (const c of CUTS) {
      if (c.construct) continue;
      expect(SOURCE_BY_ID[c.source].usedInEdit, `${c.label} not marked used`).toBe(true);
    }
  });

  it("ramps most clips up and leaves the stop at natural speed", () => {
    const ramped = CUTS.filter((c) => !c.construct && c.speed > 1);
    expect(ramped.length).toBeGreaterThan(3);
    const stop = CUTS.find((c) => c.source === "s04");
    expect(stop?.speed).toBe(1.0);
    // speeds seen on the timeline
    const speeds = new Set(CUTS.filter((c) => !c.construct).map((c) => c.speed));
    for (const s of speeds) expect([1.0, 1.3, 1.6, 2.0]).toContain(s);
  });

  it("shows speed compressing the fixed clip: 2.0x halves the 5.04s source", () => {
    const fast = CUTS.find((c) => c.speed === 2.0)!;
    expect(screenDur(fast)).toBeCloseTo(GEN_DUR / 2, 2);
  });
});

describe("aru track — the tempo grid, computed not asserted", () => {
  it("derives the beat and bar from 136 BPM", () => {
    expect(TRACK.bpm).toBe(136);
    expect(BEAT).toBeCloseTo(60 / 136, 5);
    expect(BAR).toBeCloseTo((60 / 136) * 4, 5);
  });

  it("lays downbeats across the whole track starting at zero", () => {
    const db = downbeats();
    expect(db[0]).toBe(0);
    expect(db[db.length - 1]).toBeLessThanOrEqual(TRACK.seconds);
    // ~18-19 bars in 33s at 136 BPM
    expect(db.length).toBeGreaterThan(17);
  });

  it("counts 11 generations of the one length the model makes", () => {
    expect(GEN_DUR).toBe(5.04);
    expect(totalGenerated()).toBeCloseTo(11 * 5.04, 1);
  });
});

describe("aru S00 scroll set piece", () => {
  it("has all 151 frames on disk", () => {
    for (let i = 1; i <= ASSET_S00.frameCount; i++) {
      const f = `${ASSET_S00.frameDir}/${String(i).padStart(4, "0")}.webp`;
      expect(onDisk(f), `frame missing: ${f}`).toBe(true);
    }
  });

  it("uses the walk still as its fallback and that file exists", () => {
    expect(ASSET_S00.still).toContain("s00-walk");
    expect(onDisk(ASSET_S00.still)).toBe(true);
  });
});
