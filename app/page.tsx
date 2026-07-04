import { Hero } from "@/components/Hero";
import { StatStrip } from "@/components/StatStrip";
import { About } from "@/components/About";
import { TerraTeaser } from "@/components/TerraTeaser";
import { BongTeaser } from "@/components/BongTeaser";
import { WorkSection } from "@/components/WorkSection";
import { VideoTeaser } from "@/components/VideoTeaser";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

function Divider() {
  return (
    <div className="relative z-[5] flex items-center justify-center gap-5 px-[var(--pad)]">
      <span className="h-px max-w-[42%] flex-1 bg-gradient-to-r from-transparent via-rule to-transparent" />
      <span className="h-[10px] w-[10px] flex-none rotate-45 border border-amber shadow-[0_0_14px_rgba(120,200,140,0.55)]" />
      <span className="h-px max-w-[42%] flex-1 bg-gradient-to-r from-transparent via-rule to-transparent" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatStrip />
      <About />
      <Divider />
      <TerraTeaser />
      <Divider />
      <BongTeaser />
      <Divider />
      <WorkSection />
      <Divider />
      <VideoTeaser />
      <Divider />
      <Contact />
      <Footer />
    </>
  );
}
