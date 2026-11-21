"use client";

import {useEffect, useRef, useState, type CSSProperties} from "react";
import Image from "next/image";
import s from "./home-banners.module.css";
import {useCMSContent} from './cms-content';


export default function HomeBanners() {
  const {homePage:{hero}}=useCMSContent();
  const banners=hero.banners.filter(banner=>banner.visible);
  const [index,setIndex] = useState(0);
  const playing = hero.autoplay;
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const touch = useRef<number|null>(null);
  const advance = (direction:number) => setIndex(value=>(value+direction+banners.length)%banners.length);
  useEffect(()=>{
    if(!hero.enabled || !banners.length || !playing || hovered || focused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer=window.setTimeout(()=>setIndex(value=>(value+1)%banners.length),hero.interval*1000);
    return ()=>window.clearTimeout(timer);
  },[index,playing,hovered,focused,hero.enabled,hero.interval,banners.length]);

  if(!hero.enabled || !banners.length)return null;
  return <section className={s.carousel} aria-label="Explore India banners" aria-roledescription="carousel" data-playing={playing && !hovered && !focused ? "true" : "false"} style={{"--interval":`${hero.interval}s`} as CSSProperties}
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}
    onKeyDown={event=>{if(event.key==="ArrowLeft"){event.preventDefault();advance(-1);}if(event.key==="ArrowRight"){event.preventDefault();advance(1);}}}
    onTouchStart={event=>{touch.current=event.touches[0].clientX;}}
    onTouchEnd={event=>{if(touch.current!==null){const distance=touch.current-event.changedTouches[0].clientX;if(Math.abs(distance)>40)advance(distance>0?1:-1);}touch.current=null;}}>
    {banners.map((banner,position)=>{
      const n=banners.length, current=index%n;
      let offset=((position-current)%n+n)%n; if(offset>n/2)offset-=n;
      const crop=[banner.width,banner.height,banner.left,banner.top];
      const style=crop ? {"--photo-width":`${crop[0]}%`,"--photo-height":`${crop[1]}%`,"--photo-left":`${crop[2]}%`,"--photo-top":`${crop[3]}%`} as CSSProperties : undefined;
      const href=banner.href || (banner.destination ? `/tour-packages?destination=${encodeURIComponent(banner.destination)}` : "/tour-packages");
      return <div key={banner.key||position} className={`${s.panel} ${offset===0?s.current:offset===-1?s.previous:offset===1?s.next:offset<0?s.farPrevious:s.farNext}`} data-banner={banner.artworkOnly?"india":banner.key} style={style} aria-hidden={offset!==0} inert={offset!==0} role="group" aria-roledescription="slide" aria-label={`${position+1} of ${banners.length}: ${banner.title}`}>
        <Image className={s.photo} src={banner.image} alt={banner.alt} width={2560} height={720}
          sizes="(max-width: 600px) calc(100vw - 44px), min(1280px, calc(100vw - 64px))"
          quality={90} loading={Math.abs(offset)<=1?"eager":"lazy"} decoding="async" fetchPriority={offset===0?"high":"auto"} />
        {/* Document navigation opens every banner destination at the page start. */}
        {banner.artworkOnly ? <a className={s.artLink} href={href} aria-label={banner.action} /> : <>
          <div className={s.overlay} />
          <div className={s.copy}><span className={s.badge}>{banner.badge}</span><h2>{banner.title}</h2><p>{banner.tagline}</p><a className={s.cta} href={href}><span className={s.sheen} aria-hidden="true" /><span className={s.ctaLabel}>{banner.action}</span><img src="/figma/home-banners/arrow-right.svg" alt="" loading="lazy" decoding="async" /></a></div>
        </>}
      </div>;
    })}
    {banners.length>1 && <>
      <button type="button" className={`${s.arrow} ${s.arrowLeft}`} aria-label="Previous banner" onClick={()=>advance(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg></button>
      <button type="button" className={`${s.arrow} ${s.arrowRight}`} aria-label="Next banner" onClick={()=>advance(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></button>
      <div className={s.dots}>{banners.map((banner,i)=><button type="button" key={banner.key||i} aria-label={`Show banner ${i+1}: ${banner.title}`} aria-current={i===index%banners.length} onClick={()=>setIndex(i)} />)}</div>
    </>}
  </section>;
}
