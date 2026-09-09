import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright-core');
const base = process.env.PREVIEW_URL || 'http://localhost:4321';
const output = process.env.QA_OUTPUT_DIR || 'artifacts/homepage';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
 for (const width of [1440, 390]) {
  const page = await browser.newPage({viewport:{width,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForTimeout(1700);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
  assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/frames/')).length),0);
  await page.screenshot({path:path.join(output,`new-${width}-hero.png`)});
  await page.evaluate(()=>scrollTo(0,450)); await page.waitForTimeout(300);
  await page.setViewportSize({width,height:850}); await page.waitForTimeout(300);
  await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(300);
  const cover=await page.locator('#hero canvas').evaluate(c=>({canvas:c.getBoundingClientRect().height,parent:c.parentElement.getBoundingClientRect().height}));
  assert.ok(Math.abs(cover.canvas-cover.parent)<2,'Canvas covers its mount after resize while scrolled');
  await page.setViewportSize({width,height:900});
  const positions=[];
  for(const y of [200,400,600]) {
   await page.evaluate(y=>scrollTo(0,y),y); await page.waitForTimeout(350);
   positions.push(await page.locator('#terra').evaluate(el=>el.getBoundingClientRect().top));
  }
  assert.ok(positions[0]-positions[1]>190 && positions[1]-positions[2]>190,'Terra advances continuously with scroll, no pin dwell');
  assert.ok(positions[2]<350,'Terra arrives within the first viewport of scrolling');
  assert.notEqual(await page.locator('[data-hero-frame]').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({path:path.join(output,`new-${width}-transition.png`)});
  await page.locator('#terra').evaluate(el=>el.scrollIntoView()); await page.waitForTimeout(700);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  const preview=page.locator('#terra img').first();
  await preview.scrollIntoViewIfNeeded(); await preview.hover(); await page.waitForTimeout(1000);
  assert.notEqual(await preview.evaluate(el=>getComputedStyle(el).translate),'none','Website preview scrolls on hover');
  await page.screenshot({path:path.join(output,`new-${width}-terra.png`)});
  await page.getByRole('tab',{name:'For family'}).click();
  assert.match(await page.locator('#nha-preview img[aria-hidden="false"]').getAttribute('src'),/01-trang-chao-hero/);
  await page.getByRole('tab',{name:'For family'}).press('ArrowRight');
  assert.match(await page.locator('#nha-preview img[aria-hidden="false"]').getAttribute('src'),/12-hai/);
  await page.getByRole('button',{name:'Try a check-in'}).click();
  assert.equal(await page.getByRole('button',{name:'Family updated',exact:false}).getAttribute('aria-pressed'),'true');
  await page.locator('#nhaminh').evaluate(el=>el.scrollIntoView()); await page.waitForTimeout(500);
  await page.screenshot({path:path.join(output,`new-${width}-product.png`)});
  await page.locator('#aru').evaluate(el=>el.scrollIntoView()); await page.waitForTimeout(700);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.screenshot({path:path.join(output,`new-${width}-film.png`)});
  await page.getByRole('button',{name:'Play Aru Otoko film'}).click();
  assert.equal(await page.locator('#aru iframe').count(),1);
  await page.locator('#bong').evaluate(el=>el.scrollIntoView()); await page.waitForTimeout(500);
  await page.screenshot({path:path.join(output,`new-${width}-bong.png`)});
  for (const id of ['terra','nhaminh','work','aru','bong','video','about']) assert.ok(await page.locator(`#${id} img`).count()>0 || id==='aru');
  await page.locator('#about').evaluate(el=>el.scrollIntoView()); await page.waitForTimeout(500);
  assert.equal(await page.locator('[data-animating]').getAttribute('data-animating'),'false');
  const broken=await page.locator('main img').evaluateAll(images=>images.filter(i=>i.complete && i.naturalWidth===0).map(i=>i.src));
  assert.deepEqual(broken,[],'No broken loaded image');
  assert.deepEqual(errors,[]);
  console.log(`${width}px: continuous scroll, shrink, preview hover, product tabs, film, themes, images, stopped offscreen 3D passed`);
  await page.close();
 }
 const page=await browser.newPage({reducedMotion:'reduce'});
 await page.goto(base,{waitUntil:'networkidle'}); await page.waitForTimeout(1700);
 await page.evaluate(()=>scrollTo(0,400)); await page.waitForTimeout(300);
 assert.equal(await page.locator('[data-hero-frame]').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 0)');
 assert.equal(await page.locator('[data-animating]').getAttribute('data-animating'),'false');
 console.log('Reduced motion passed');
} finally {await browser.close();}


