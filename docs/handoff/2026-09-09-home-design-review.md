# Design review — codex/creative-workbench-home vs bản đang chạy trên GitHub Pages

Ngày 2026-09-09. Audit-first theo CLAUDE.md. Đo bằng Chrome headless ở 1440×900 và 390×900,
7 mốc scroll mỗi khổ, so trực tiếp `http://localhost:3000` (branch) với `https://jak3rpham.github.io/` (đã ship).

## Số đo

| | Bản mới (branch) | Bản cũ (đang ship) |
|---|---|---|
| Chiều cao trang, 1440 | 11 490px | 14 844px |
| Chiều cao trang, 390 | 13 945px | 17 777px |
| Tràn ngang | không | không |
| Lỗi runtime | 0 | 0 |
| Unit test | 23 pass / 4 file | — |

Chiều cao desktop 1440: hero 900 · terra 2661 · work 2358 · aru 2400 · video 1181 · about 1132 · contact 755.

## Kết luận

Bản mới thắng bản cũ rõ ràng ở hero, ở tính bằng chứng của từng dự án, và ở positioning.
Không quay lại bản cũ. Việc còn lại là dọn ba thứ: lỗ trống trong lưới, mảnh màu lạc palette,
và một lượng code chết đúng bằng một homepage thứ hai.

---

## KEEP — không được đụng vào

| Thứ | Vì sao |
|---|---|
| Hero WebGL `Assembly` toàn khung + copy đặt đáy trái | Cảm giác vật thể thật, sâu, không phải gradient AI. Đây là thứ mạnh nhất của bản mới. |
| `transform: scale()` + `border-radius` chạy theo document (`PortfolioHome.tsx:52-56`) | Giữ được cảm giác khung khép lại mà không pin, không spacer, không dead scroll. Đúng phương pháp trong CLAUDE.md. |
| Terra đứng đầu, browser chrome nghiêng −3° hover về 0 | Bằng chứng thật, không phải mockup trang trí. |
| Chart 22 tháng + caption "Illustrative trend · case study contains the evidence" | Trung thực. Giữ nguyên chữ này. |
| Nhà Mình tab + `CareIllustration` tương tác | Bằng chứng sản phẩm chứ không phải ảnh chụp. Keyboard nav (Arrow/Home/End) đã đúng. |
| Video archive grid (mốc 05) | Khổ ảnh lệch nhau, dày, đúng chất reel. Mạnh nhất nửa dưới trang. |
| `HomeSchematics` / `HomeRange` kéo lại từ `SystemsStrip` / `About` | Giữ được nội dung gốc thay vì viết lại. |
| Bỏ "Technical enough to build it, creative enough to film it" | Đúng với `no-title-overclaim`. Không được khôi phục. |

## RE-MECHANISM — giữ cảm giác, đổi cách làm

**1. Lưới sản phẩm rách chân (ưu tiên cao nhất).**
`PortfolioHome.module.css:256` — `.product:nth-child(2){margin-top:130px}`. Stagger đang hardcode
theo vị trí. Hậu quả đo được ở 1440: card IELTS và UpHub cùng kết thúc ở y=5415, nhưng phần chữ
của IELTS dừng sớm hơn UpHub ~130px → hai khối meta không cùng đường ngang, đọc như lỗi chứ
không như nhịp cố ý. Giữ ý "khổ lệch nhau", nhưng cho stagger nằm ở **ảnh**, còn khối
`.productMeta` phải bám cùng một baseline. Hoặc: đặt tỉ lệ ảnh cố định theo dự án và bỏ margin-top.

**2. Mảng màu lạc palette.**
`PortfolioHome.module.css:269` — `.product:nth-child(2) .productImage{background:#dfdcf0}` là một
mảng tím lavender trên nền cream + forest, và nó gán theo `nth-child` chứ không theo dự án. Trang
này có một accent duy nhất (forest). Đổi sang sắc độ trong cùng họ, hoặc lấy màu từ chính ảnh của
dự án đó. `#d7e4c8` ở dòng 270 thì ổn.

**3. Sticker "12×".**
Vòng tròn xanh chanh nằm đè góc phải `terraCanvas` đọc như một badge khuyến mãi. Con số 12× thì
xứng đáng nổi bật; cơ chế "sticker tròn" mới là thứ cần đổi. Thử: đặt 12× vào cùng hàng
typographic với 31.4M / 978 / 55→90 ở khối `proof` ngay bên dưới, hoặc set nó bằng type lớn
không nền.

**4. Lỗ trống dưới chân dung ở About.**
Đo 1440: ảnh chân dung kết thúc y=10304, section about kết thúc y=10632 → ~330px cột trái rỗng,
nhìn như trang bị hụt. Cho cột trái nhận thêm nội dung (địa điểm, UEH 2025, VI/EN — bản cũ có,
bản mới bỏ) hoặc kéo ảnh cao hơn cho hai cột kết thúc gần nhau.

**5. `sectionTop` hai cột ở 390px.**
Ở mobile, `02 / IDEAS YOU CAN USE` và `PRODUCT THINKING × AI DIRECTION` chia đôi hàng và mỗi vế
gãy 2 dòng. Cho stack dọc dưới 640px.

**6. Nút tròn "N" nổi góc dưới-trái.**
Ở 390 nó đè lên chữ (thấy rõ ở mốc 02 và 06). Cần offset an toàn hoặc ẩn ở mobile.

**7. Nhịp trong `filmStills`.**
`filmStills a:nth-child(2){margin-top:40px}` — lại là stagger theo vị trí. Ba still Aru đang lệch
nhau bằng một con số tùy ý. Nếu muốn giữ lệch, buộc nó vào tỉ lệ khung hình của từng still.

**8. Scroll rail đã biến mất khỏi `/`.**
`HomeNavRail` vẫn còn trong repo nhưng không còn được mount ở homepage; bản cũ có rail chấm bên
phải và nó là một trong số ít thứ bản cũ làm tốt (biết mình đang ở chương nào trong trang 11 000px).
Đây là một CUT chưa được duyệt. Hoặc mount lại, hoặc xác nhận rõ là bỏ hẳn.
Lưu ý: rail dùng scroll listener + `getBoundingClientRect` **có chủ đích** — không đổi sang
IntersectionObserver, nó không fire ổn định dưới Lenis.

## CUT — xóa hẳn

Trong cây hiện tại có **hai** homepage, chỉ một cái được mount:

- `components/home/Homepage.tsx` (133 dòng) — không ai import. Chết.
- `components/home/HomeInteractions.tsx` (130 dòng) — chỉ `Homepage.tsx` dùng. Chết theo.
- `components/home/Home.module.css` (359 dòng) — chỉ còn `Assembly.tsx` dùng vài class. Tách phần
  `Assembly` cần ra rồi xóa phần còn lại.
- `app/globals.css`: cả block `.home-restored` (12 dòng) — không phần tử nào mang class này. Chết.
- Mồ côi sau khi `app/page.tsx` rút còn 2 dòng: `HeroStage.tsx`, `Hero.tsx`, `StatColumn.tsx`,
  `SequenceSpan.tsx`. Không còn import nào. Quyết định giữ-hay-xóa cần làm dứt khoát — để lại thì
  lần sau lại có người sửa nhầm file không chạy.

## Bản mới thua bản cũ ở đúng một chỗ

Bản cũ mở bằng tên riêng ở cỡ ~100px: "Pham Ngoc Thanh". Bản mới đẩy tên xuống eyebrow mono 14px
và để "Ideas into actual things." chiếm hero. Về mặt thị giác thì bản mới đẹp hơn hẳn; nhưng với
một portfolio, người xem rời hero mà chưa chắc nhớ tên là một cái giá thật. Cần chốt chủ ý: nếu
giữ như hiện tại thì tên phải được nhắc lại sớm và to hơn ở chương kế.

## Cách kiểm tra lại

Harness đã chạy được (sửa ngày 2026-09-09). Terminal 1:

```bash
npm run build && npm run preview
```

Phục vụ `out/` ở http://127.0.0.1:4322. Terminal 2:

```bash
PREVIEW_URL=http://127.0.0.1:4322 npm run qa:home
```

Cùng với `npm run qa:stories`, `npm run qa:preservation`, `npm run qa:design-system` (ba cái này
đã trỏ sẵn 4322). Ảnh chụp ra `artifacts/` (đã gitignore); đổi bằng `QA_OUTPUT_DIR`.

Những gì đã phải sửa để harness chạy được:

- Thêm devDependency `playwright-core` — không phải `playwright`. Mọi script đều dùng
  `channel: 'chrome'` nên chạy Chrome đã cài; bản đầy đủ sẽ tải thừa ~150MB browser bundle.
- Bốn script hardcode đường dẫn vào cache riêng của Codex
  (`C:/Users/jaker/.cache/codex-runtimes/...`) và bốn chỗ ghi ảnh vào
  `C:/Users/jaker/.codex/visualizations/...`. Tất cả chuyển sang
  `process.env.PLAYWRIGHT_MODULE_PATH || 'playwright-core'` và `QA_OUTPUT_DIR`.
  Trước đó các script này chỉ chạy được trong runtime của Codex, không phải trên repo.
- Ba assertion đã lỗi thời so với code hiện tại. `#nha-preview img` giờ là 3 ảnh crossfade chứ
  không phải 1 (check-homepage, check-preservation); `#experience video` là 2 vì
  `FeatureShowcase` cố tình double-buffer để clip kế nạp xong mới swap (check-stories,
  check-preservation). Đã đổi sang assert phần tử **đang hiện** (`[aria-hidden=false]`) thay vì
  đếm phần tử — giữ nguyên ý định thiết kế, chỉ bỏ giả định cũ về số lượng DOM node.

Đừng dùng tab preview trong app để chụp: hero là WebGL nên screenshot treo.

Trạng thái sau khi sửa: cả bốn suite pass ở 1440 và 390. Build export 18 trang. Unit 23 pass.
