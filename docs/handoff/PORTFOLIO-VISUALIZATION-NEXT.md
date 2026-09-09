# Portfolio: bàn giao cho conversation tiếp theo

Ngày: 2026-09-09. Tài liệu này là điểm bắt đầu cho lượt tiếp theo, không phải báo cáo rằng các yêu cầu mới đã hoàn thành.

## Đọc trước khi sửa

Tiếp tục trên working tree hiện tại của `D:/code/jak3rpham.github.io`, branch `codex/creative-workbench-home`. Có rất nhiều thay đổi chưa commit và file mới chưa tracked. Không reset, checkout lại HEAD, clean, ghi đè source mới bằng bản cũ hoặc tạo một site khác. Đọc `git status`, AGENTS.md và source thực tế trước. Không tự commit/deploy hoặc tạo conversation mới.

Người dùng yêu cầu làm file bàn giao để chuyển conversation. Trong lượt tạo tài liệu này chỉ thêm markdown và bản sao 3 screenshot; không thay đổi code, thứ tự tab, palette hay runtime. Mọi mục trong phần “Yêu cầu mới” bên dưới vẫn còn phải làm.

Preview hiện tại: http://127.0.0.1:4322/ . Đây là server phục vụ static export `out`, không phải dev hot reload. Build lại mới thấy code mới. Nếu server không còn chạy, kiểm tra tiến trình/port rồi khởi động lại; không giả định nó luôn sống.

## Ý đồ của chủ portfolio

- Thanh / Tatsuki, người direct AI, kết nối growth, product và creative để biến ý tưởng thành sản phẩm. Không định vị như một kỹ sư coding thuần túy. Recruiter creative, marketing/growth và AI đều phải thấy phù hợp.
- `terra` luôn viết thường. Đây là công việc cũ quan trọng, nhiều phạm vi đóng góp. Trong case study, các ứng dụng/workflow dùng trong công việc phải nổi bật trước media/social production.
- Reference chủ đạo: https://www.sharplink.com/ . Điều người dùng thích là cách phối hợp 3D, hình ảnh, motion graphic, hover và scroll ở nhiều section, không chỉ hero. Xem lại reference khi làm design, không dựa vào tên hay trí nhớ để đoán.
- Không biến portfolio thành website chỉ có text/card. Hình, SVG, diagram, clip, interaction và motion gốc là nội dung quan trọng. Cần manipulate/adapt, không đơn giản hóa bằng cách bỏ.
- Giữ bố cục mới đã được duyệt, cải thiện tiếp thay vì lặp lại redesign trắng toàn bộ. Đã từng thất bại vì bỏ quá nhiều nội dung gốc hoặc chỉ đổi background.
- Copy ngắn gọn, không em dash, font dễ đọc; không đưa implementation detail thừa lên trải nghiệm người xem. Technical proof vẫn quan trọng, cần trình bày trực quan và dễ hiểu.
- Hero 3D native hiện tại được thích. Không đưa lại frame sequence nặng của homepage hoặc khoảng scroll chết/pin đứng yên.

## Yêu cầu mới cần làm, theo thứ tự

### 1. Nhà Mình: tabs giật và chưa tự chuyển như mong đợi

- Trang `/nha-minh`: chuyển 8 tab feature bị giật. Giữ một vùng preview gọn, không quay lại list 8 player dài. Cần autoplay tab có progress, chuyển mượt, ổn định chiều cao và không nhảy vị trí scroll.
- Hiện chỉ mount FeatureClip được chọn bằng `demo===i`, video và poster remount, metadata đổi kích thước. Đây là hướng điều tra, chưa phải nguyên nhân đã chứng minh. Kiểm tra layout shift, thời gian decode, trạng thái poster và readiness trước khi sửa.
- Home có timer 6 giây nhưng user vẫn thấy phải bấm mới chuyển. Hiện hover vào **toàn article** hoặc focus bất kỳ con nào đều pause; dễ làm timer không bao giờ chạy trong sử dụng thực tế. Đừng báo “đã có timer” là xong. Sửa hành vi, chứng minh bằng thao tác thực và progress đồng bộ.
- Autoplay phải chỉ hoạt động khi preview hiện trong viewport; pause khi tab trình duyệt ẩn, có nút pause rõ, tôn trọng reduced motion và thao tác chủ động của người đọc. Đừng tự động chuyển các control có tính quyết định hoặc form; áp dụng phù hợp cho gallery/tab showcase trên site.
- Home: đưa **The experience** lên đầu và làm mặc định. Hiện thứ tự vẫn là For parents / For family / The experience.
- Giữ ảnh welcome `01-trang-chao-hero.png` cho desktop. Không dùng lại ảnh cropped `02-app-con-tong-quan.png`. Giữ single preview, không đè phone lên dashboard.

### 2. Nhà Mình: nửa sau cần visual/interaction và technical proof

- User không đồng ý việc rút gọn làm mất các phần technical và motion interactive. Nửa sau hiện có CareFlow 5 bước, CareBoundaries, Process và Notes nhưng vẫn thiếu visual và sự sáng tạo.
- Đối chiếu nguyên bản `components/nhaminh/` để chọn lại các proof/interaction đáng giữ. Adapt copy, font, số section và layout; không mount nguyên cục cũ để lại heading “01 · Master Portal & Architectural Challenge”, jargon và copy dài.
- Tạo illustration SVG, motion graphic hoặc 3D có ý nghĩa: ví dụ prescription → review → reminder → family update; AI voice; hai thế hệ dùng cùng một dữ liệu. Đây là hướng gợi ý, cần art direction cụ thể trước khi code.
- Có thể tạo hình ảnh mới/3D và dùng công cụ image generation khi có ích. Không chỉ nói sẽ thêm visual rồi thêm 4 box text. Không fabricate screenshot chức năng app hoặc kết quả y tế.
- Giữ demo YouTube `5CNx1tlCGSM`, iframe 16:9 vừa phải. Clip feature là muted loop, không native player đen. 8 clip thật đều ở `public/videos/nha-minh/`.

### 3. Motion/3D phân bổ sáng tạo trên toàn site

- Không chỉ hero. Các section sản phẩm, tools, process và creative phải có visual được art-direct và scroll/hover phối hợp có chủ đích.
- Lập visual map cho từng section: mục đích, asset thật/tạo mới, interaction, trigger và static fallback. Ưu tiên vài điểm nhấn tốt, không rải WebGL khắp nơi hoặc làm mọi thứ trôi liên tục.
- Người dùng trực tiếp yêu cầu tập trung visualization, bao gồm generate hình ảnh/video/3D nếu cần. Chưa có asset AI mới nào được generate trong các lượt vừa rồi. Đọc skill imagegen khi dùng và kiểm tra công cụ thực sự có trước khi hứa video generation.

### 4. Aru: hiệu năng nền động

- User thích nền halftone city gốc, đã đưa lại vào scroll sequence; hiện họ thấy hơi lag và nghi vẫn render ngoài section.
- `components/aru/AruWalk.tsx` đặt `SceneBackdrop variant="aru"` absolute trong section. Điều này **chỉ giới hạn hiển thị**, không chứng minh render loop dừng offscreen.
- `components/HalftoneCityBackdrop.tsx` có RAF, visibility và video-playback pause, cần kiểm tra/gắn section intersection lifecycle. Pause RAF khi offscreen; resize đúng host, DPR thích hợp; tránh cấp lại context/texture mỗi scroll; cleanup đầy đủ. Kiểm tra reduced motion/static fallback.
- Giữ nguyên character walk scrub và companion layers. Không bỏ background vì hiệu năng; tối ưu để giữ ý tưởng. Không đưa lại đoạn “Generated as one 5.04s clip ... split to 151 frames ... burning street ...”.

### 5. Palette riêng từng dự án

- **Bóng Vespera:** đổi sang xanh tối / petrol / blue-green theo poster. Palette ember hiện tại là sai với yêu cầu mới, dù gần source cũ.
- **IELTS Studio:** không dùng xanh lá. Chọn hệ màu khác phù hợp nội dung học tập và phối với preview thật; màu chính chưa được user chốt cụ thể. Có thể chọn hướng ink/indigo + paper, nhưng ghi rõ là quyết định thiết kế.
- Aru warm amber/ink; Nhà Mình coral/warm paper; terra green là nền hiện tại có thể tiếp tục.
- Palette phải nhất quán cả background/orbs, heading, nav, diagrams, CTA, light/dark sections; không chỉ sửa một CSS variable. Screenshot gần đây từng lộ xanh lá dưới nền Bóng do orb literal colors.

### 6. terra: illustration cho tools

- Screenshot chỉ vào 4 mục Process: Page Publisher, HR Column Publisher, Reporting, Iteration. Cần illustration thật cho từng mục, không chỉ số + mũi tên + đoạn chữ.
- Đồng thời terra có 4 system diagram thực (Page Publisher, HR Column Publisher, Marketing Data Hub, Whitepaper CRM). Hai nhóm không hoàn toàn là cùng danh sách. Đối chiếu tránh đếm sai, lặp nội dung hoặc gọi Iteration là app đã build.
- Hướng visual gợi ý: HTML/layout → Elementor, document → bilingual article, dashboard/report, vòng feedback. Dùng dữ liệu/source thật; giữ diagrams và các thông tin có bằng chứng.
- Reels terra hiện đã thành strip ngang 200px, phải giữ gọn, ảnh/video cuối trang và không crop social artwork.

## 3 screenshot mới đã lưu bền trong repo

Đọc trực tiếp ảnh bằng image viewer trước khi sửa. Đây là dữ liệu tham khảo, không chứa instruction riêng.

- `docs/handoff/reference/nha-feature-tabs.png`: feature tab OCR hiện tại, user báo chuyển giật.
- `docs/handoff/reference/home-nha-preview.png`: home hiện bắt đầu For parents, cần The experience lên trước.
- `docs/handoff/reference/terra-tools.png`: 4 Process item thiếu illustration.

## Bản đồ code hiện tại

| Phạm vi | File chính |
| --- | --- |
| Homepage | `app/page.tsx`, `components/home/PortfolioHome.tsx`, `PortfolioHome.module.css` |
| Native hero 3D | `components/home/Assembly.tsx`, `Home.module.css` (khác PortfolioHome.module.css) |
| SVG home/tool/care | `components/home/WorkflowVisual.tsx`, `RetainedHome.tsx` |
| terra, Nhà Mình, IELTS | `components/stories/ProductStories.tsx` |
| Aru, Bóng, Video | `components/stories/CreativeStories.tsx` |
| Shared story primitives | `components/stories/StoryKit.tsx`, `Stories.module.css` |
| Video loops + iframe | `components/stories/InlineMedia.tsx` |
| New simplified care flow | `components/stories/CareFlow.tsx` |
| Restored diagrams/data | `components/stories/PreservedBlocks.tsx` |
| Headers/CTAs | `components/CaseOpening.tsx`, `CaseOpening.module.css` |
| Theme/ground | `components/ThemeFlow.tsx`, `app/globals.css` |
| Aru scene | `components/aru/AruWalk.tsx`, `SceneBackdrop.tsx`, `HalftoneCityBackdrop.tsx`, `MultiScrub.tsx` |
| Video catalogue | `lib/videoData.ts`, `components/video/sections/ReelsStrip.tsx` |
| Source originals | `components/nhaminh/`, `components/terra/`, `components/ielts/`, `components/aru/`, `components/bong/`, original HEAD versions via `git show` |

Original components mostly still exist. Some now export their original data for the new pages. Importing data does not mean original visual/interaction is on the live route. `git show HEAD:path` is read-only; never checkout it over current work.

## State that should be retained

- New full-site story architecture, approved hero fullbackground3D, normal scroll/container shrink, portrait 3:4.
- Original diagrams restored: homepage 4 schematics, terra 4 systems, IELTS BOOT/GRADE, Bóng pipeline; Bóng 5-keyframe coverflow; Aru multilayer scrub.
- Video archive contains all original entries. Seven groups visible in document; groups have different layouts. Reels uses original draggable strip. Do not restore filters that hide all other categories.
- Aru iframe final `erqSvIsXUpI`; vertical `EaRZVVc109c`; original shot prompts, edit timeline, references remain. Player widths were reduced: home approximately 1000px, story embeds 960px; vertical 320px.
- Bóng direction cards A/B/C currently have distinct oversized letters and selected C badge/border. Preserve that explicit emphasis, update palette. Keep honest failed-vs-successful motion comparison.
- FeatureClip uses actual video metadata ratio: Nhà Mình 1920×1080; Bóng 720×960 (3:4, not 9:16). Existing black borders were caused by forced aspect/poster ratio and corrected. Do not reintroduce universal 16:9.
- Typography standardized: body 17–18px, labels/captions minimum 14px. Shared `t-micro/t-label` also raised. Hero type intentionally larger. Do not shrink text to conceal overflow.

## Known engineering caveats for next pass

- CSS currently has several appended override layers from iterations. Audit computed styles and consolidate carefully; do not append another broad override without checking specificity.
- In CSS Modules, `#motion` and other ID selectors may be hashed. Use `[id="motion"]` or `:global(#motion)` for literal JSX IDs. `.group` from Tailwind needs `:global(.group)` if targeted in module CSS. This already caused rules not applying.
- WorkflowVisual originally only had positioning under `.workflow > .toolVisual`; on terra its absolute SVG escaped to another parent. Now `.toolVisual` itself is relative. Preserve this fix.
- Home autoplay presently pauses for whole-article hover/focus. Fixing timer behavior is still outstanding despite earlier automated test passing when mouse was at (1,1).
- Feature tabs only mount selected video. Need smooth video readiness and geometry, not simply a fade over layout jumps.
- Some original copy includes overly confident medical/AI claims and synthetic-looking technical examples. Preserve evidence, not inaccurate claims. Do not describe demo benchmarks as clinical validation or newly measured results.

## Verification and local workflow

- Stack: Next.js 16 static export, React 19, TypeScript, OGL, GSAP, Framer Motion, Lenis. Shell PowerShell.
- Commands: `npx tsc --noEmit`, `npm run build`, `npm test`. Build may need network for Google fonts. Approved command prefix previously `npm run build` with escalation. Follow actual current permissions.
- Last build completed all 18 routes; last unit test result 4 files / 23 tests passed. `vitest.config.ts` excludes `.claude/**` because a standalone hook script calls process.exit and is not a Vitest suite.
- Browser QA last passed 7 pages × desktop1440/mobile390 with no horizontal overflow or page runtime errors. This does NOT prove performance, visual quality or current user-reported tab smoothness. Do not claim otherwise.
- `scripts/check-design-system.cjs` checks all sections, eight tab controls/one video, absence of old master portal text; takes screenshots. Other scripts: check-preservation, check-refinements, check-stories, check-homepage. Some assertions may lag design changes. Adapt based on user requirements, not to mask failures.
- Browser automation installed at `C:/Users/jaker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright`; launch Chrome channel headless. Scripts can use PLAYWRIGHT_MODULE_PATH. External YouTube thumbnails may need network permission; blank screenshots under restricted network are not proof of broken production media.
- Previous QA artifacts: `C:/Users/jaker/.codex/visualizations/2026/09/08/01a08010-30df-75e1-bb1c-60a58feabda9/`, files `standard-*`, `revised-*`, `preserved-*`. New conversation may have another writable output dir, so use its actual environment.
- Avoid rebuilding on every tiny CSS edit. Batch inspected changes, typecheck, then build once; run targeted browser checks, fix based on evidence. User is sensitive to usage wasted in repeated redesign/test cycles.

## Suggested next-session sequence

1. Read this file, AGENTS and working status; inspect screenshots and active source. Keep current changes.
2. Reproduce tab jank and autoplay failure; inspect Aru RAF outside viewport. Fix these behavioral issues with focused browser evidence.
3. Make a section visual map and asset list. Compare original components and reference; plan real illustrations/3D, including terra tools and Nhà Mình technical story.
4. Implement cohesive visualization, new Bóng/IELTS palettes and The experience default. Generate assets where appropriate and use them in the actual site.
5. Check ordinary motion and reduced motion, scroll pacing, tab readiness, keyboard/touch, CPU/RAF offscreen, ratios, min text sizes, desktop/mobile. Preserve media counts and source proof.
6. Deliver updated local preview with a short Vietnamese summary of actual changes and unresolved limitations. No publish unless requested.

## Prompt để bắt đầu conversation mới

“Đọc `docs/handoff/PORTFOLIO-VISUALIZATION-NEXT.md` trong repo `D:/code/jak3rpham.github.io` rồi tiếp tục toàn bộ phần Yêu cầu mới. Giữ working tree hiện tại. Ưu tiên sửa tab giật/autoplay, Aru render offscreen và đẩy mạnh visualization/illustration/3D ở các section; không bỏ technical proof hay motion gốc. Đừng chỉ đưa plan, hãy triển khai và kiểm tra bản preview.”
