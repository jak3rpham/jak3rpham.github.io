"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function VideoLightbox({ videoId, onClose }: { videoId: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!videoId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [videoId, onClose]);

  return (
    <AnimatePresence>
      {videoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 px-[var(--pad)]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[960px]"
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-cream"
            >
              ✕ Close
            </button>
            <iframe
              className="aspect-video w-full rounded-[10px] border-none"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
