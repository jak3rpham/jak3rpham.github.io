"use client";
import { MotionConfig } from 'framer-motion';
import { TvcStage } from './sections/TvcStage';
import { ProjectTvcIndex } from './sections/ProjectTvcIndex';
import { CommercialFrames } from './sections/CommercialFrames';
import { CampaignFan } from './sections/CampaignFan';
import { MusicWall } from './sections/MusicWall';
import { EventsTimeline } from './sections/EventsTimeline';
import { ReelsStrip } from './sections/ReelsStrip';
import { VideoNavRail } from './VideoNavRail';
import { Story, Action } from '../stories/StoryKit';
import { ScrollArtwork } from '../visual/ScrollArtwork';
import { SECTIONS, HOME_PRIORITY, thumb } from '@/lib/videoData';
import s from './VideoArchive.module.css';
const railItems=Object.values(SECTIONS);

export function VideoArchive() {
  return <MotionConfig reducedMotion="user"><Story next="video"><div className={s.archive} data-zone="dark">
    <section id="hero" className={s.hero}>
      <ScrollArtwork variant="film" images={HOME_PRIORITY.map(f=>({src:thumb(f.yt),alt:f.title}))}/>
      <div className={s.heroCopy}><a href="/" className={s.label}>← Pham Ngoc Thanh / Moving image</a><h1>Every story<br/><em>has a rhythm.</em></h1><div className={s.heroBottom}><p>Brand films. Music. Campaigns.<br/>Different formats, different ways to feel.</p><span>Editor on every film · full scope on the TVCs<br/>Video Manager · SRadio / Vice President · L.O.M<br/>2× Top 1 TVC · Business Challenge, UEH ISB</span></div></div>
    </section>
    <div id="archive"><nav className={s.index} aria-label="Film categories">{Object.values(SECTIONS).map((section,i)=><a key={section.id} href={`#${section.id}`}><span>0{i+1}</span>{section.label}<b>↘</b></a>)}</nav>
    <div id="films-0" className={s.awards}><TvcStage/></div>
    <div id="films-1" className={s.projects}><ProjectTvcIndex/></div>
    <div id="films-2" className={s.commercial}><CommercialFrames/></div>
    <div id="films-3" className={s.campaign}><CampaignFan/></div>
    <div id="films-4" className={s.music}><MusicWall/></div>
    <div id="films-5" className={s.events}><EventsTimeline/></div>
    <div id="films-6" className={s.reels}><ReelsStrip/></div></div>
    <section id="contact" className={s.contact}><h2>A feeling first.<br/><em>Then the frame.</em></h2><div><p>Creative direction, editing and AI-assisted production. I find the form that helps the story land.</p><Action href="mailto:pnthanh.work@gmail.com">Let’s make something</Action></div></section>
    <VideoNavRail items={railItems}/>
  </div></Story></MotionConfig>;
}
