"use client";

/**
 * A tiny ref-counted signal for "a video is playing over the fixed WebGL backdrop".
 *
 * The HalftoneCityBackdrop raymarcher and a decoding video compete for the same GPU. On some
 * machines that contention makes the browser drop the backdrop canvas's WebGL context, which
 * (with alpha:false) blanks it to opaque black — the "black box behind the video" bug. While a
 * video plays we pause the shader loop to remove the contention. Ref-counted so overlapping
 * players (e.g. a shot detail plus the hero) all have to stop before the loop resumes.
 */
const EVT = "aru:video-playback";
let active = 0;

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVT, { detail: { active: active > 0 } }));
}

export function beginVideoPlayback() {
  active += 1;
  emit();
}

export function endVideoPlayback() {
  active = Math.max(0, active - 1);
  emit();
}

/** Subscribe to playback changes. Returns an unsubscribe fn. */
export function onVideoPlaybackChange(fn: (playing: boolean) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => fn((e as CustomEvent<{ active: boolean }>).detail.active);
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}
