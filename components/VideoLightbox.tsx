"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { beginVideoPlayback, endVideoPlayback } from "@/lib/videoPlayback";

export function VideoLightbox({
  videoId,
  title,
  vertical = false,
  onClose,
}: {
  videoId: string | null;
  title?: string;
  vertical?: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!videoId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    // lock background scroll so the page cannot slide behind the open player
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // pause the backdrop while the player is open (it is hidden behind the overlay anyway)
    beginVideoPlayback();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
      endVideoPlayback();
    };
  }, [videoId, onClose]);

  if (typeof document === "undefined") return null;

  // Portal to <body> so the overlay escapes any transformed ancestor (framer-motion sets
  // transforms that trap `position: fixed`, which let later sections paint over the player).
  return createPortal(
    <AnimatePresence>
      {videoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 px-[var(--pad)]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${vertical ? "max-w-[min(420px,80vw)]" : "max-w-[960px]"}`}
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-cream"
            >
              ✕ Close
            </button>
            <iframe
              className={`w-full rounded-[10px] border-none ${vertical ? "aspect-[9/16]" : "aspect-video"}`}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title ?? "YouTube video player"}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
