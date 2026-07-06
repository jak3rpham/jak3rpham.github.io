// Single source of truth for the /video page (mirrors docs/videos.csv).
// Each format is its own themed "world" with an accent colour.

export type FormatKey =
  | "tvc"
  | "project-tvc"
  | "commercial"
  | "campaigns"
  | "music"
  | "events"
  | "reels";

export type Film = {
  yt: string;
  title: string;
  meta: string;
  badge?: string;
  date?: string;
  vertical?: boolean;
};

export type SectionMeta = {
  key: FormatKey;
  id: string; // DOM id / anchor
  label: string;
  tag?: string;
  accent: string; // hex, drives the section's world
};

export const SECTIONS: Record<FormatKey, SectionMeta> = {
  tvc: { key: "tvc", id: "tvc", label: "TVC & Competition", tag: "2× Top 1 · national", accent: "#8FD49E" },
  "project-tvc": { key: "project-tvc", id: "project-tvc", label: "University Project TVCs", tag: "ISB · terra", accent: "#86b8b0" },
  commercial: { key: "commercial", id: "commercial", label: "Commercial & Explainer", tag: "Mona · terra", accent: "#7cc7d6" },
  campaigns: { key: "campaigns", id: "campaigns", label: "Communication", tag: "SRadio · L.O.M", accent: "#e0b978" },
  music: { key: "music", id: "music", label: "Music Videos", tag: "L.O.M Music Club", accent: "#e0a3c8" },
  events: { key: "events", id: "events", label: "Events", tag: "L.O.M · SRadio", accent: "#9aa6e0" },
  reels: { key: "reels", id: "reels", label: "Short Reels", tag: "Short-form", accent: "#b79ae0" },
};

// The two crowned TVCs get the hero stage; Young Lions are the "also competed" row.
export const TVC_CROWNED: Film[] = [
  { yt: "0HXLuL7nbKc", badge: "Top 1 · 2023", title: "MR. BROWN", meta: "Business Challenge 2023 · ISB Academic Team" },
  { yt: "Nr8vCC5JWCQ", badge: "Top 1 · 2024", title: "ARISAQUA", meta: "Business Challenge 2024 · ISB Academic Team" },
];

export const TVC_ALSO: Film[] = [
  { yt: "JTaEF48J9gY", title: "Young Lions · TVC 2022", meta: "Competition entry · Young Lions Vietnam" },
  { yt: "jzCHLv6p8v0", title: "Young Lions · TVC 2023", meta: "Competition entry · Young Lions Vietnam" },
  { yt: "1cJGz4wwduA", title: "Let's On Air · Sống Thay Xô Bồ", meta: "Social campaign · S Communications · 2023" },
];

// Homepage teaser — the 6 films ranked by the CSV Priority column (1 → 6).
export const HOME_PRIORITY: Film[] = [
  { yt: "0HXLuL7nbKc", badge: "Top 1 TVC · 2023", title: "Business Challenge 2023 · MR. BROWN", meta: "ISB Academic Team" },
  { yt: "Nr8vCC5JWCQ", badge: "Top 1 TVC · 2024", title: "Business Challenge 2024 · ARISAQUA", meta: "ISB Academic Team" },
  { yt: "jg-vycQAOIE", badge: "Theme · 2023", title: "ISBe Yourself", meta: "Theme Song · ISB" },
  { yt: "OEbzDYj6SGk", badge: "Campaign · 2023", title: "Hoa Niên Liên Khấu · Recap", meta: "SRadio" },
  { yt: "1cJGz4wwduA", badge: "Campaign · 2023", title: "Let's On Air · Sống Thay Xô Bồ", meta: "S Communications" },
  { yt: "X0R0k4jnAkw", badge: "Visualizer", title: "Miền Đất Hứa · stillsi. remix", meta: "Hoàng Thùy Linh × Đen" },
];

export const PROJECT_TVC: Film[] = [
  { yt: "H-hRNQuvgKs", title: "Project TVC I", meta: "Brand TVC · ISB" },
  { yt: "tA-kRl8vCwo", title: "Project TVC II", meta: "Brand TVC · ISB" },
  { yt: "dtBw9qzY02s", title: "Project TVC III", meta: "Brand TVC · ISB" },
  { yt: "XCxPeS1HceY", title: "Project TVC IV", meta: "Brand TVC · ISB" },
  { yt: "H90Xh4iIL3E", badge: "terra", title: "Labor Report Course", meta: "Product TVC · terra" },
];

export const COMMERCIAL: Film[] = [
  { yt: "BWeBzuIDSRk", title: "Shadow Funnel · Bán hàng tự động", meta: "Commercial explainer · Mona Media" },
  { yt: "3xfFHWMzung", title: "Explainer trên iPad", meta: "Product demo · Mona Media" },
  { yt: "xfQZ9phraEs", badge: "terra", title: "Hướng dẫn nộp Báo cáo lao động", meta: "Product explainer · terra" },
  { yt: "tUT2GXCuA8w", badge: "terra", title: "CS Support with System", meta: "Support explainer · terra" },
];

export const CAMPAIGNS: Film[] = [
  { yt: "QX1FstV1GPY", badge: "Teaser", title: "Hoa Niên Liên Khấu · Teaser", meta: "Brand project 2023 · SRadio" },
  { yt: "OEbzDYj6SGk", badge: "Recap", title: "Hoa Niên Liên Khấu · Recap", meta: "Brand project 2023 · SRadio" },
  { yt: "-W4JPxeYuNE", badge: "Insight", title: "1011MHz · Insight", meta: "Yearly Music Show 2025 · L.O.M" },
  { yt: "MRz5gYAfx0A", badge: "Podcast", title: "Tìm Kiếm Cộng Tác Viên", meta: "Recruitment podcast · SRadio" },
  { yt: "IKPXjum0T54", badge: "Podcast", title: "Social Post · Podcast", meta: "SRadio" },
  { yt: "DTece7Bf3y8", badge: "Tết", title: "Tết Tròn Tết Vuông", meta: "Sản phẩm Tết 2023 · SRadio" },
];

export const MUSIC: Film[] = [
  { yt: "jg-vycQAOIE", badge: "Theme", title: "ISBe Yourself", meta: "Theme Song 2023 · ISB · 800+ participants" },
  { yt: "X0R0k4jnAkw", badge: "Visualizer", title: "Miền Đất Hứa · stillsi. remix", meta: "Hoàng Thùy Linh × Đen · lyrics visualizer" },
  { yt: "X3MfrXeryVk", badge: "Theme", title: "We Are The Future", meta: "Theme Song 2022 · ISB" },
  { yt: "U9bid1AHQaU", badge: "MV", title: "Chìm Show · remake", meta: "Music video · L.O.M Music Club" },
  { yt: "aS0Z0w9XWyg", badge: "MV", title: "Until I Found You · remake", meta: "Music video · L.O.M Music Club" },
];

export const EVENTS: Film[] = [
  { yt: "6fZb1WFmKSs", date: "2022", title: "SRadio Birthday · Intro", meta: "Event intro · SRadio" },
  { yt: "JYKFtF7afi0", date: "2022", title: "ISB Orientation Day · Recap", meta: "Event recap · L.O.M Music Club" },
  { yt: "TiNSxvp-dA8", date: "2023", title: "Recruitment · Teamwork Trigger", meta: "Recruitment round · L.O.M Music Club" },
  { yt: "xp9RsUUwFbs", date: "2023", title: "Rhythm Workshop · Recap", meta: "Workshop recap · L.O.M Music Club" },
];

export const REELS: Film[] = [
  { yt: "YQxly3RNvck", title: "SRadio · Reel 1", meta: "SRadio", vertical: true },
  { yt: "KibknqjTRSg", title: "SRadio · Reel 2", meta: "SRadio", vertical: true },
  { yt: "81osIRiu5yA", title: "SRadio · Reel 3", meta: "SRadio", vertical: true },
  { yt: "4CKrgy6ArwE", title: "Duet Challenge", meta: "L.O.M Music Club", vertical: true },
  { yt: "e02CAQ3S2r4", title: "SRadio · Reel 4", meta: "SRadio", vertical: true },
  { yt: "c4Liw5CrcJo", title: "SRadio · Reel 5", meta: "SRadio", vertical: true },
  { yt: "KOyE_1iteRg", title: "Giảm tải báo cáo lao động", meta: "terra · HR", vertical: true },
  { yt: "YhC8UyHONow", title: "Vì sao nên dùng dịch vụ BCLĐ", meta: "terra · HR", vertical: true },
  { yt: "pufHm0nSpUM", title: "terra · Reel 1", meta: "terra", vertical: true },
  { yt: "DqDP5OgD_mA", title: "terra · Reel 2", meta: "terra", vertical: true },
  { yt: "thjQFT3E0gY", title: "terra · Reel 3", meta: "terra", vertical: true },
  { yt: "08Gda8NMtwU", title: "terra · Reel 4", meta: "terra", vertical: true },
  { yt: "eyQwwz9DEt8", title: "terra · Reel 5", meta: "terra", vertical: true },
  { yt: "mGuokmBQNRQ", title: "terra · Reel 6", meta: "terra", vertical: true },
  { yt: "K89Ty9_t6q0", title: "terra · Reel 7", meta: "terra", vertical: true },
  { yt: "sjlbdZN1WWE", title: "terra · Reel 8", meta: "terra", vertical: true },
];

export const thumb = (yt: string, quality: "hq" | "maxres" = "maxres") =>
  `https://img.youtube.com/vi/${yt}/${quality === "hq" ? "hqdefault" : "maxresdefault"}.jpg`;
