export function HoverScrollShot({ src, alt, urlLabel }: { src: string; alt: string; urlLabel: string }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between gap-3 border-b border-rule bg-ink/50 px-4 py-2.5">
        <span className="font-mono text-[0.64rem] lowercase tracking-[0.04em] text-sand">{urlLabel}</span>
        <span className="hidden font-mono text-[0.56rem] uppercase tracking-[0.08em] text-sand [@media(hover:hover)]:inline">
          hover to scroll ↓
        </span>
      </div>
      <div className="relative h-[460px] overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute left-0 top-0 w-full transition-transform duration-[6000ms] ease-out group-hover:translate-y-[calc(460px-100%)]"
        />
      </div>
    </div>
  );
}
