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
});
