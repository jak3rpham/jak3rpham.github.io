"use client";
import { useEffect, useState } from "react";
import { VideoLightbox } from "../VideoLightbox";
import { Panel } from "./AruSection";
import { beginVideoPlayback, endVideoPlayback } from "@/lib/videoPlayback";

const ytThumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

/**
 * A video slot that is honest about being empty.
 *
 * `id === null` renders a labelled placeholder naming the clip it is waiting for, so the page
 * can be built and reviewed before anything is uploaded.
 *
 * `inline` plays the clip in place (swaps the thumbnail for an autoplay iframe in the same box)
 * instead of opening the full-screen lightbox. Used for the shot gallery, where opening a
 * separate player for each of eleven clips would be tedious. Hero / vertical keep the lightbox.
 *
 * Either way it is thumbnail-first: the iframe (and YouTube's player bundle) only loads on click.
 */
export function AruVideo({
  id,
  label,
  title,
  poster,
  vertical = false,
  inline = false,
  className = "",
}: {
  id: string | null;
  label: string;
  title: string;
  poster?: string;
  vertical?: boolean;
  inline?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  // Tell the fixed backdrop to pause its shader while this plays inline, so the two are not
  // decoding + raymarching on the same GPU at once (the contention that blanks the backdrop).
  useEffect(() => {
    if (!(inline && playing)) return;
    beginVideoPlayback();
    return endVideoPlayback;
  }, [inline, playing]);

  const ratio = vertical ? "aspect-[9/16]" : "aspect-video";
  const thumb = poster ?? (id ? ytThumb(id) : undefined);

  if (!id) {
    return (
      <Panel className={className}>
        <div className={`relative ${ratio} w-full`}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          ) : null}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/55 px-6 text-center">
            <span className="font-mono t-micro uppercase tracking-[0.16em] text-forest">
              awaiting upload
            </span>
            <span className="font-mono t-micro text-tan">{label}</span>
            <span className="max-w-[34ch] font-mono t-micro leading-[1.7] text-clay">
              {vertical ? "9:16" : "16:9"} · drop the YouTube id into lib/aruData.ts → YT
            </span>
          </div>
        </div>
      </Panel>
    );
  }

  // inline: play right here in the same box, no lightbox.
  // A clean bordered frame, NOT <Panel>: Panel's hard offset shadow read as a stray box
  // behind the player.
  if (inline && playing) {
    return (
      <div className={`overflow-hidden rounded-[3px] border-2 border-[#0C0906] bg-black ${className}`}>
        <iframe
          className={`block w-full ${ratio}`}
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  const onClick = () => {
    if (inline) setPlaying(true);
    else setOpen(id);
  };

  return (
    <>
      <Panel className={className}>
        <button
          onClick={onClick}
          aria-label={`Play ${title}`}
          className="group relative block w-full cursor-pointer"
        >
          <div className={`relative ${ratio} w-full`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cream/80 bg-ink/50 transition-transform duration-300 group-hover:scale-110">
                <span className="ml-1 block h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-cream" />
              </span>
            </div>
            <span className="absolute bottom-3 left-3 font-mono t-micro uppercase tracking-[0.14em] text-tan">
              {label}
            </span>
          </div>
        </button>
      </Panel>
      {!inline ? (
        <VideoLightbox videoId={open} title={title} vertical={vertical} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
