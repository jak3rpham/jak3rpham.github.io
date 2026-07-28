export function Footer() {
  return (
    <footer className="relative z-[4] border-t border-rule px-[var(--pad)] py-10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-sand">
        <span className="flex items-baseline gap-2">
          <b className="font-serif-jp text-forest">達樹</b> Tatsuki
        </span>
        <span>© 2026 Pham Ngoc Thanh · Growth, product &amp; video</span>
        <a href="https://linkedin.com/in/jkpham03/" target="_blank" rel="noreferrer" className="transition-colors hover:text-forest">
          linkedin.com/in/jkpham03
        </a>
      </div>
    </footer>
  );
}
