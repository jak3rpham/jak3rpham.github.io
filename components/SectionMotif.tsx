type MotifVariant = "radar" | "bars" | "aurora" | "stripes" | "eq" | "signal";

const BAR_HEIGHTS = [0.32, 0.55, 0.4, 0.72, 0.48, 0.85, 0.42];
const BAR_DELAYS = [0, 0.4, 0.8, 0.2, 0.6, 0.3, 0.7];
const EQ_DELAYS = [0, 0.3, 0.6, 0.2, 0.5, 0.85, 0.1, 0.45, 0.7, 0.25, 0.55, 0.9, 0.15, 0.4, 0.65, 0.35];

export function SectionMotif({ variant }: { variant: MotifVariant }) {
  if (variant === "radar") {
    return (
      <div className="sbg">
        <div className="motif motif-radar">
          <span />
          <span />
          <span />
          <i />
        </div>
      </div>
    );
  }
  if (variant === "bars") {
    return (
      <div className="sbg">
        <div className="motif motif-bars">
          {BAR_HEIGHTS.map((h, i) => (
            <span key={i} style={{ "--h": h, animationDelay: `${BAR_DELAYS[i]}s` } as React.CSSProperties} />
          ))}
        </div>
      </div>
    );
  }
  if (variant === "aurora") {
    return (
      <div className="sbg">
        <div className="motif motif-aurora" />
        <span className="tw" style={{ top: "28%", left: "58%" }} />
        <span className="tw" style={{ top: "52%", left: "42%" }} />
        <span className="tw" style={{ top: "68%", left: "64%" }} />
      </div>
    );
  }
  if (variant === "stripes") {
    return (
      <div className="sbg">
        <div className="motif motif-stripes" />
      </div>
    );
  }
  if (variant === "eq") {
    return (
      <div className="sbg">
        <div className="motif motif-eq">
          {EQ_DELAYS.map((d, i) => (
            <span key={i} style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="sbg">
      <div className="motif motif-signal">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
