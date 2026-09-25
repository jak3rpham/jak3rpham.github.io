// Chup anh that tu ban demo VITALITE dang chay, cho case study /vitalite.
//
// Yeu cau: ban demo phai dang duoc phuc vu o http://localhost:8000
//   cd E:\Repo\vitalite-website
//   python docs/make-site-preview.py
//   python -m http.server 8000 -d deliverables/preview/site
//
// Roi:  node scripts/shoot-vitalite.mjs
//
// Vi sao chup tu server that chu khong dung anh co san: moi anh o day la mot
// trang DUNG DUOC, khong phai mockup ve tay. Trang case study vi the khong
// bao gio quang cao mot thu ma ban demo khong lam duoc.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright-core');
const sharp = require('sharp');

const BASE = process.env.VITALITE_DEMO_URL || 'http://localhost:8000';
const OUT = path.join(process.cwd(), 'public', 'images', 'vitalite');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });

// deviceScaleFactor 2: anh retina. Trang portfolio hien chung o be ngang toi
// 1400px, nen chup 1440@2x roi de trinh duyet thu nho lai la sac net.
async function shot(name, url, { width = 1440, height = 900, scale = 2, before } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  // Font web tai xong roi moi chup, neu khong chu nhay sang font du phong.
  await page.evaluate(() => document.fonts.ready);
  if (before) await before(page);
  await page.waitForTimeout(400);
  // Playwright chi xuat PNG/JPEG. PNG 2x cua mot trang co anh san pham nang
  // 0.8 den 2.8 MB moi tam; ca bo la 6.8 MB, qua nang cho mot trang case study.
  // webp q82 giu duoc chu mono 11px sac net ma ca bo chi con 0.6 MB.
  const png = await page.screenshot();
  const file = path.join(OUT, name + '.webp');
  await sharp(png).webp({ quality: 82, effort: 6 }).toFile(file);
  const kb = (fs.statSync(file).size / 1024).toFixed(0);
  console.log(`  ${name.padEnd(22)} ${String(width).padStart(4)}px  ${kb} KB`);
  await page.close();
}

console.log('Chup tu', BASE);

// 0. Anh HERO: lay THANG mot frame goc cua chuoi scroll, khong phai anh chup
//    man hinh trang About.
//
//    🔴 Chup man hinh trang About lam nen hero la sai, da thu va da bo: trang
//    do TU NO da co mot tieu de lon ("HEAVY IN WEIGHT."). Dat "VITALITÉ." de
//    len tren thanh hai tieu de chong nhau, doc ra la trang vo chu khong phai
//    trang co chieu sau.
//
//    Frame goc khong co chu nao, va nen ben trai toi san - dung cho tieu de
//    cua trang case study se nam.
{
  const page = await browser.newPage();
  const res = await page.goto(BASE + '/wp-content/uploads/seq/0823/048.webp');
  const buf = await res.body();
  const file = path.join(OUT, 'hero.webp');
  // 2560 goc xuong 1920: van sac o man 2x be ngang 960, ma nhe hon mot nua.
  await sharp(buf).resize({ width: 1920 }).webp({ quality: 80, effort: 6 }).toFile(file);
  console.log(`  ${'hero (frame 048)'.padEnd(22)} 1920px  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  await page.close();
}

// 1. Luoi shop voi catalog THAT - 4 san pham, gia that, cham mau
await shot('shop-grid', '/shop.html');

// 2. PDP - anh chinh + dai thumbnail, swatch mau Grey
await shot('pdp-grey', '/product.html');

// 3. PDP sau khi bam Pure White: anh chinh doi, dai thumbnail mo ra ca 4 anh
await shot('pdp-white', '/product.html', {
  before: async page => {
    const swatches = page.locator('.vpd-swatch');
    await swatches.nth(1).click();
    await page.waitForTimeout(500);
  },
});

// 4. Trang chu - hero video + slide
await shot('home-hero', '/index.html', {
  before: async page => { await page.waitForTimeout(1200); },
});

// 5. Trang chu cuon toi luoi san pham - cho thay luat luoi co theo so the
await shot('home-grid', '/index.html', {
  before: async page => { await page.evaluate(() => scrollTo(0, 980)); await page.waitForTimeout(600); },
});

// 6. Gio hang - mot man Woo that, khong phai mockup
await shot('cart', '/cart.html');

// 7. Mobile - luoi 2 cot, khong tran ngang
await shot('shop-mobile', '/shop.html', { width: 390, height: 844 });

// 8. About - chuoi 96 frame
await shot('about-sequence', '/about.html', {
  before: async page => { await page.evaluate(() => scrollTo(0, 1400)); await page.waitForTimeout(900); },
});

await browser.close();
console.log('\nXong ->', path.relative(process.cwd(), OUT));
