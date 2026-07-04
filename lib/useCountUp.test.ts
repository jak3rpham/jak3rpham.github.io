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

  it("counts up using the cubic ease-out curve, not linear progress", () => {
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

    now = 200; // p = 0.2 of a 1000ms duration
    act(() => {
      callbacks.shift()?.(now);
    });
    // eased = 1 - (1-0.2)^3 = 0.488 -> value = 48.8 -> toFixed(0) = 49
    expect(result.current.value).toBe(49);
  });

  it("reaches the exact target value at completion", () => {
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

    now = 1000;
    act(() => {
      callbacks.shift()?.(now);
    });
    expect(result.current.value).toBe(100);
  });
});
