export function HoverScrollShot({ src, alt, urlLabel }: { src: string; alt: string; urlLabel: string }) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 border-b border-rule bg-black/30 px-4 py-2.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span className="ml-2 font-mono text-[0.64rem] text-sand">{urlLabel}</span>
      </div>
      <div className="relative h-[460px] overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute left-0 top-0 w-full transition-transform duration-[6000ms] ease-out group-hover:translate-y-[calc(460px-100%)]"
        />
        <span className="absolute right-3 top-2.5 z-[2] hidden rounded bg-black/55 px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-cream opacity-90 [@media(hover:hover)]:block">
          hover to scroll ↓
        </span>
      </div>
    </div>
  );
}
