export function Footer() {
  return (
    <footer className="relative z-[4] border-t border-rule px-[var(--pad)] py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-sand">
        <span>
          Tatsuki <b className="font-serif-jp text-forest">達樹</b>
        </span>
        <span>© 2026 Pham Ngoc Thanh · Digital Marketing &amp; Creative</span>
        <a href="https://linkedin.com/in/jkpham03/" target="_blank" rel="noreferrer" className="hover:text-forest">
          linkedin.com/in/jkpham03
        </a>
      </div>
    </footer>
  );
}
