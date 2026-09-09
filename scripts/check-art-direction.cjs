const {chromium}=require('playwright-core');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const output='artifacts/art-direction';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  for(const width of [1440,390]) {
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const [route,selectors] of Object.entries({video:['#hero','#tvc','#project-tvc','#commercial','#campaigns','#music','#events','#reels'], '':['#hero','#work','#about'],terra:['[data-artwork=publishing]'],'nha-minh':['[data-artwork=care]'],'ielts-studio':['[data-artwork=learning]'],'aru-otoko':['[data-artwork=edit]'],'bong-vespera':['[data-artwork=world]']})) {
    await page.goto('http://127.0.0.1:4322/'+route,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2600);
    for(const selector of selectors) {
     const el=page.locator(selector).first();await el.evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-65));
     await page.waitForTimeout(1000);
     await el.locator('img').evaluateAll(async imgs=>{await Promise.race([new Promise(resolve=>setTimeout(resolve,5000)),Promise.all(imgs.filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).map(i=>i.decode().catch(()=>{})))]);});
     await page.screenshot({path:`${output}/${route||'home'}-${selector.replace(/[^a-z-]/g,'')}-${width}.png`});
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow');
    }
    if(route==='video') {
     assert.equal(await page.locator('#archive img').count(),46);
     if(width===1440) {const card=page.locator('#campaigns button').first();await card.focus();await page.waitForTimeout(700);assert.equal(await card.evaluate(e=>e.style.zIndex),'50');await card.press('Enter');assert.ok(await page.locator('iframe').count());await page.keyboard.press('Escape');}
    }
    for(const art of await page.locator('[data-artwork] > img').all()) {await art.scrollIntoViewIfNeeded();await art.evaluate(img=>img.decode());assert.ok(await art.evaluate(img=>img.naturalWidth>1000));}
    console.log(width,route||'home','art and layout passed');
   }
   assert.deepEqual(errors,[]);await page.close();
  }
 } finally {await browser.close();}
})();
