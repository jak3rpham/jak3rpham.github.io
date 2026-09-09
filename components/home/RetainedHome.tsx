"use client";
import { SYSTEMS, Schematic } from "../SystemsStrip";
import { LANES } from "../About";
import s from "./PortfolioHome.module.css";
export function HomeSchematics() {
  return <div className={s.homeSchematics} data-preserved="home-schematics">{SYSTEMS.map(system=><a href="/terra#systems" key={system.name}><h3>{system.name}</h3><Schematic stations={system.stations} delta={system.delta}/><p>{system.note}</p><span>Explore workflow ↗</span></a>)}</div>;
}
export function HomeRange() {
  return <div className={s.homeRange} data-preserved="home-disciplines">{LANES.map(lane=><a key={lane.n} href={lane.href}><b>{lane.t}</b><p>{lane.d}</p><span>{lane.go} ↗</span></a>)}</div>;
}
