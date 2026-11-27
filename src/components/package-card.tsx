"use client";

import Image from "next/image";
import Link from "next/link";
import { type Trip } from "@/data/travel-catalog";
import { useCMSContent } from "./cms-content";
import s from "./home.module.css";

/** The homepage package card, shared so tour pages show related trips the same way. */
export function PackageCard({ trip, enquire }: { trip: Trip; enquire: (title: string) => void }) {
  const {homePage:{popular:p}}=useCMSContent();
  const photo = <Image src={trip.image} alt={trip.title} width={604} height={480} sizes="(max-width: 600px) 260px, (max-width: 1000px) 45vw, 302px" quality={90} loading="lazy" />;
  return <article className={s.card}>
    {trip.href ? <Link className={s.photo} href={trip.href} aria-label={`View ${trip.title}`}>{photo}{trip.days ? <span className={s.badge}>{trip.days - 1}N / {trip.days}D</span> : null}</Link> : <div className={s.photo}>{photo}</div>}
    {trip.href ? <Link className={s.title} href={trip.href}>{trip.title}</Link> : <button className={s.title} onClick={() => enquire(trip.title)}>{trip.title}</button>}
    <div className={s.priceRow}><div className={s.price}><strong>₹{(trip.price ?? 0).toLocaleString("en-IN")}</strong><span>{p.perPerson}</span></div><button type="button" className={s.callback} onClick={() => enquire(trip.title)}>{p.callbackLabel}</button></div>
  </article>;
}

export const trackClass = s.track;
