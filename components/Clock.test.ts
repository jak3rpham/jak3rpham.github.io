import { describe, expect, it } from "vitest";
import { formatHCMC } from "./Clock";

describe("formatHCMC", () => {
  it("shifts UTC time by +7 hours and pads to HH:MM:SS", () => {
    const utcMidnight = new Date(Date.UTC(2026, 0, 1, 0, 0, 5));
    expect(formatHCMC(utcMidnight)).toBe("HCMC 07:00:05");
  });

  it("wraps correctly across a day boundary", () => {
    const lateUtc = new Date(Date.UTC(2026, 0, 1, 23, 30, 0));
    expect(formatHCMC(lateUtc)).toBe("HCMC 06:30:00");
  });

  it("lands exactly on midnight after the +7h shift", () => {
    const utcExactWrap = new Date(Date.UTC(2026, 0, 1, 17, 0, 0));
    expect(formatHCMC(utcExactWrap)).toBe("HCMC 00:00:00");
  });
});
