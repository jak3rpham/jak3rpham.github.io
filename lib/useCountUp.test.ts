import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCountUp } from "./useCountUp";

describe("useCountUp", () => {
  it("is idempotent: calling start twice only schedules one animation", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
    const { result } = renderHook(() => useCountUp(100));
    act(() => {
      result.current.start();
      result.current.start();
    });
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("counts up to the target value using eased progress", () => {
    let now = 0;
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const { result } = renderHook(() => useCountUp(100, 0, 1000));
    act(() => {
      result.current.start();
    });

    // advance halfway through the duration
    now = 500;
    act(() => {
      const cb = callbacks.shift();
      cb?.(now);
    });
    expect(result.current.value).toBeGreaterThan(0);
    expect(result.current.value).toBeLessThan(100);

    // advance to completion
    now = 1000;
    act(() => {
      const cb = callbacks.shift();
      cb?.(now);
    });
    expect(result.current.value).toBe(100);
  });
});
