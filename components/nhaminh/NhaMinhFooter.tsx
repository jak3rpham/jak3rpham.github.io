"use client";

export function NhaMinhFooter() {
  return (
    <footer className="relative z-[4] border-t border-orange-200/70 bg-[#F5F2EB]/50 px-[var(--pad)] py-8 mt-12">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 font-mono text-[0.68rem] uppercase tracking-wider text-slate-500">
        <span className="flex items-baseline gap-2">
          <b className="font-serif-jp text-[#FF6B4B] font-bold text-sm">Nhà Mình</b> AI Riser Vietnam 2026
        </span>
        <span>© 2026 Pham Ngoc Thanh · Sole Tech & AI Lead</span>
        <a
          href="https://github.com/jak3rpham/ai-riser-namdosan"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-[#FF6B4B] hover:underline"
        >
          GitHub Repository ↗
        </a>
      </div>
    </footer>
  );
}
