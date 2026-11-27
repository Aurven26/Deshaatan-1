"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SiteHeader, SiteFooter } from "./site-chrome";
import { ShareMenu } from "./share-menu";
import { SiteDialog, type Modal } from "./site-dialog";
import { tourAssets } from "./tour-assets";
import type { Tour } from "@/data/golden-triangle";
import s from "./tour-detail.module.css";
import TravellerCountField from "./traveller-count-field";
import { PackageCard, trackClass } from "./package-card";
import TourMotion from "./tour-motion";
import WriteReviewPopup from "./write-review-popup";
import DurationTabs, { matchesTripDuration } from "./duration-tabs";
import {useCMSContent} from "./cms-content";
import {sectionVisible} from "@/cms/visibility-labels";

const sections = ["Overview", "Itinerary", "Inclusions", "Exclusions", "FAQs", "Reviews"];
const sectionId = (label: string) => label.toLowerCase();
const defaultPhotos = [tourAssets["2032-4185-imgRectangle4661"], tourAssets["2032-4167-imgListItem"]];
function Asset({ name, className = "" }: { name: string; className?: string }) {
  return <img src={tourAssets[name]} className={className} alt="" loading="lazy" />;
}
function TourLinks({links, onEnquire}: {links: NonNullable<Tour['linkSections']>[number]['links']; onEnquire:(title:string)=>void}) {
  return <div>{links.map((link,i) => <button key={i} onClick={() => onEnquire(link.label)}>{link.label}</button>)}</div>;
}
function TabIcon({ label }: { label: string }) {
  const paths: Record<string, string> = {
    Overview: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z",
    Itinerary: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a3 3 0 0 1 3-3h7M18 9v6a3 3 0 0 1-3 3H8",
    Inclusions: "M20 6L9 17l-5-5",
    Exclusions: "M18 6L6 18M6 6l12 12",
    FAQs: "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    Reviews: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  };
  return paths[label] ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[label]} /></svg> : null;
}

function Heading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className={s.sectionHeading} data-m="section-head"><h2>{children}</h2>{action}</div>;
}
function Stars({rating}: {rating:number}) {
  return <span role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`} style={{color:'#ffbd45',letterSpacing:2}}>{Array.from({length:5},(_,i)=>i<Math.round(rating)?'★':'☆').join('')}</span>;
}
function MissingDetail({onEnquire}: {onEnquire:()=>void}) {
  return <p className={s.missingDetail}>The detailed information has not been supplied yet. <button onClick={onEnquire}>Ask our travel expert</button>.</p>;
}

function TravelDateField() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [travelDate, setTravelDate] = useState("");
  const [earliestDate, setEarliestDate] = useState("");
  const [month, setMonth] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  useEffect(() => {
    const today = new Date();
    setEarliestDate(dateKey(today));
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  const days = month ? new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() : 0;
  function changeMonth(offset: number) { if (month) setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1)); }
  return <div ref={root} className={`${s.compactField} ${s.dateField}`} data-empty={!travelDate} onKeyDown={event => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }}>
    <label className={s.srOnly} htmlFor={id}>Travel Date</label>
    <span className={s.datePlaceholder} aria-hidden="true">{travelDate ? new Date(`${travelDate}T00:00:00`).toLocaleDateString("en-GB", {day:"numeric", month:"short", year:"numeric"}) : <>Travel Date <b>*</b></>}</span>
    <input ref={input} id={id} name="date" type="date" min={earliestDate || undefined} value={travelDate} onChange={event => { setTravelDate(event.target.value); setOpen(false); }} tabIndex={-1} required />
    <button ref={toggle} className={s.calendarToggle} type="button" aria-label={travelDate ? `Travel date ${travelDate}, change` : "Choose travel date"} aria-expanded={open} aria-controls={`${id}-calendar`} onClick={() => setOpen(!open)}><img src="/figma/itinerary/date-chevron.svg" alt="" /></button>
    {open && month && <div className={s.calendar} id={`${id}-calendar`} role="dialog" aria-label="Choose travel date">
      <div className={s.calendarHeader}><button type="button" aria-label="Previous month" disabled={dateKey(month).slice(0,7) <= earliestDate.slice(0,7)} onClick={() => changeMonth(-1)}><img src="/figma/itinerary/form-chevron.svg" alt="" /></button><strong aria-live="polite">{month.toLocaleDateString("en-IN", {month:"long", year:"numeric"})}</strong><button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><img src="/figma/itinerary/form-chevron.svg" alt="" /></button></div>
      <div className={s.calendarDays}>{["Su","Mo","Tu","We","Th","Fr","Sa"].map(day => <span key={day}>{day}</span>)}{Array.from({length:month.getDay()}, (_, i) => <span key={`blank-${i}`} />)}{Array.from({length:days}, (_, i) => { const date = new Date(month.getFullYear(), month.getMonth(), i + 1); const value = dateKey(date); return <button type="button" key={value} disabled={value < earliestDate} aria-label={date.toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})} aria-pressed={travelDate === value} onClick={() => {setTravelDate(value); setOpen(false); toggle.current?.focus();}}>{i + 1}</button>; })}</div>
    </div>}
  </div>;
}

function EnquiryForm({ title, message, onReady, price }: { title: string; message: string; price?: string; onReady: (text: string) => void }) {
  const [pending,setPending]=useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(pending)return;
    const travellerButton = event.currentTarget.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"][data-empty]');
    if(travellerButton?.dataset.empty === 'true'){onReady('Please choose the number of travellers.');travellerButton.focus();return;}
    const values = new FormData(event.currentTarget);
    setPending(true);
    try{const response=await fetch('/api/callback-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(values),title})});const result=await response.json();if(!response.ok)throw new Error(result.error || 'Please try again.');onReady('Your enquiry has been submitted successfully.');}
    catch(error){onReady(error instanceof Error?error.message:'Please try again.');}
    finally{setPending(false);}
  }
  return <form id="enquiry" className={s.enquiry} data-m="form" onSubmit={submit}>
    <div className={s.formHead}>
      <h2>Plan this trip with us</h2>
      <p>Share a few details and a travel expert will call you with a plan for your dates.</p>
      {price && <div className={s.formPrice}><span>From</span><strong>₹{price}</strong><span>for 2 people</span></div>}
    </div>
    <div className={s.formBody}>
      <label className={s.field}><span>Full name <b>*</b></span><input name="name" autoComplete="name" placeholder=" " required /></label>
      <div className={s.phoneRow}><label className={s.country}><span className={s.srOnly}>Country code</span><select name="country" autoComplete="tel-country-code" defaultValue="+91"><option>+91</option><option>+1</option><option>+44</option><option>+61</option><option>+971</option></select><img src="/figma/itinerary/form-chevron.svg" alt="" /></label><label className={s.field}><span>Phone number <b>*</b></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder=" " pattern="[0-9 ()-]{7,20}" required /></label></div>
      <label className={s.field}><span>Email <b>*</b></span><input name="email" type="email" autoComplete="email" placeholder=" " required /></label>
      <div className={s.formRow}>
        <TravelDateField />
        <TravellerCountField />
      </div>
      <label className={s.messageField}><span className={s.srOnly}>Message</span><textarea name="message" placeholder="Anything else? (optional)" key={message} defaultValue={message} /></label>
      <button className={s.orangeButton} type="submit" disabled={pending} aria-busy={pending}>{pending ? 'Sending…' : 'Get my free quote'} <img className={s.enquiryArrow} src="/figma/itinerary/enquiry-chevron.svg" alt="" /></button>
      <a className={s.formWhatsapp} href="https://wa.me/917065780780?text=Hello%20Deshaatan%2C%20I%20would%20like%20to%20plan%20a%20trip." target="_blank" rel="noreferrer"><img src="/figma/itinerary/mobile-enquiry-whatsapp.svg" alt="" />Prefer WhatsApp? Chat with us</a>
    </div>
  </form>;
}

function DayText({ text }: { text: string }) {
  const match = text.match(/^([\s\S]*?)\s*Overnight stay:\s*(.+?)\.?\s*$/);
  if (!match) return <p>{text}</p>;
  return <><p>{match[1]}</p><p className={s.overnight}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6M3 18h18M3 18v2M21 18v2M7 9V6h10v3" /></svg><span>Overnight stay: <strong>{match[2]}</strong></span></p></>;
}

function Itinerary({ tour, enquire }: { tour: Tour; enquire:()=>void }) {
  const [expanded, setExpanded] = useState<number[]>([]);
  useEffect(() => { if (window.matchMedia("(min-width: 701px)").matches) setExpanded([0]); }, []);
  const allExpanded = expanded.length === tour.days.length;
  return <section id="itinerary" className={s.itinerarySection}>
    <Heading action={<button className={s.expandAll} onClick={() => setExpanded(allExpanded ? [] : tour.days.map((_, i) => i))}>{allExpanded ? "Collapse All" : "Expand All"}</button>}>Itinerary</Heading>
    <div className={s.days} data-m="days"><span className={s.routeMarker} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M7.5 13h.01M16.5 13h.01M6 11h12" /></svg></span>{tour.days.map((day, i) => <div className={`${s.day} ${day.desktopOnly ? s.desktop : ""}`} key={`${day.day}-${i}`}>
      <h3><button aria-expanded={expanded.includes(i)} aria-controls={`day-${i}`} onClick={() => setExpanded(current => current.includes(i) ? current.filter(n => n !== i) : [...current, i])}><span className={s.dayNumber}>DAY {day.day}</span><span className={s.dayTitle}>{day.mobileTitle ? <><span className={s.desktop}>{day.title}</span><span className={s.mobile}>{day.mobileTitle}</span></> : day.title}</span><Asset name="2163-2995-imgIcon" className={expanded.includes(i) ? s.chevronOpen : s.chevron} /></button></h3>
      <div id={`day-${i}`} hidden={!expanded.includes(i)} className={s.dayBody}>{day.description ? <DayText text={day.description} /> : <MissingDetail onEnquire={enquire} />}</div>
    </div>)}</div>
    <span data-m="end-trip" className={s.endTripWrap}><Asset name="2032-4182-imgImageEndOfTrip" className={s.endTrip} /></span>
  </section>;
}

function Checklist({ items, excluded = false }: { items: string[]; excluded?: boolean }) {
  return <ul className={s.checklist} data-m="checklist">{items.map(item => <li key={item}><Asset name={excluded ? "2163-2994-imgIcon13" : "2163-2994-imgIcon"} /><span>{item}</span></li>)}</ul>;
}

function formatDate(value: string) {
  const date = new Date(value.replace(/\./g, "-"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", {day: "numeric", month: "short", year: "numeric"});
}

function ReviewCard({ review, index }: { review: Tour["reviews"][number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [useful, setUseful] = useState(false);
  return <article className={s.reviewCard}>
    <div className={s.reviewer}><strong>{review.name}</strong><span>BEST</span></div>
    <div className={s.reviewMeta}>{review.rating >= 4 ? <img className={s.reviewStars} src={`/figma/itinerary/review-stars-${review.rating}.png`} alt={`${review.rating} out of 5 stars`} /> : <Stars rating={review.rating} />}<time>{formatDate(review.date)}</time></div>
    <p className={expanded ? s.reviewFull : s.reviewExcerpt} id={`review-${index}`}>{review.text}</p>
    <button className={s.seeMore} aria-expanded={expanded} aria-controls={`review-${index}`} onClick={() => setExpanded(!expanded)}>{expanded ? "See less" : "See more"}</button>
    <div className={s.reviewActions}><button aria-pressed={useful} onClick={() => setUseful(!useful)}><img src="/figma/itinerary/useful.png" alt="" />It&apos;s useful! · {useful ? 1 : 0}</button><button className={s.reviewMore} aria-label={`${expanded ? "Collapse" : "Read full"} review from ${review.name}`} aria-expanded={expanded} aria-controls={`review-${index}`} onClick={() => setExpanded(!expanded)}><Asset name="2146-3115-imgIcon2" /></button></div>
  </article>;
}

function FloatingEnquiry({ visible, active, price, enquire, labels }: {labels:string[]; visible: boolean; active: string; price: string; enquire: (customize?: boolean) => void }) {
  const icons = ["imgIcon", "imgIcon1", "imgIcon2", "imgIcon3", "imgGroup1171275185"];
  return <aside className={`${s.floating} ${visible ? s.floatingVisible : ""}`} aria-label="Trip enquiry" inert={!visible}>
    <div className={s.desktopBar}><nav aria-label="Quick trip sections">{labels.map((label) => <a key={label} href={`#${sectionId(label)}`} aria-current={active === sectionId(label) ? "location" : undefined}><Asset name={`2179-3658-${icons[["Overview","Itinerary","Inclusions","Reviews","FAQs"].indexOf(label)]}`} />{label === "FAQs" ? "FAQ’s" : label}</a>)}</nav><div className={s.floatingPrice}><div><strong>₹{price}</strong><span> for 2 people</span></div><small>Excluding applicable taxes</small></div><button className={s.orangeButton} onClick={() => enquire()}>Send Enquiry</button></div>
    <div className={s.mobileBar}><div className={s.mobileBarBottom}><div className={s.mobilePrice}><strong>₹{price}</strong><span>for 2 people</span></div><a className={s.whatsappContact} href="https://wa.me/917065780780?text=Hello%20Deshaatan%2C%20I%20would%20like%20to%20plan%20a%20trip." target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><img src="/figma/itinerary/mobile-enquiry-whatsapp.svg" alt="" /></a><button className={s.mobileEnquire} onClick={() => enquire()}>Send Enquiry</button></div></div>
  </aside>;
}

export default function TourDetail({ tour }: { tour: Tour }) {
  const {visibility,tourPackages}=useCMSContent();
  const isVisible=(name:string)=>sectionVisible(visibility,"itinerary",name) && tour.sectionVisibility?.[name]!==false;
  const visibleTabs=sections.filter(label=>isVisible(sectionId(label)));
  const photos=tour.photos?.length?tour.photos:defaultPhotos;
  const linkSections = tour.linkSections || [];
  const startCity = tour.startCity ?? tour.startEndCity;
  const endCity = tour.endCity || startCity;
  const reviewCount=tour.reviews.length;
  const average=reviewCount?tour.reviews.reduce((sum,review)=>sum+review.rating,0)/reviewCount:0;
  const sentiment=[tour.reviews.filter(r=>r.rating>=4).length,tour.reviews.filter(r=>r.rating===3).length,tour.reviews.filter(r=>r.rating<=2).length].map(count=>reviewCount?Math.round(count/reviewCount*100):0);
  const [active, setActive] = useState("overview");
  const [floating, setFloating] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const message = "";
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [dialog, setDialog] = useState<"gallery" | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const overviewRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLDetailsElement>(null);
  const [allReviews, setAllReviews] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [relatedDuration, setRelatedDuration] = useState(-1);
  const relatedRef = useRef<HTMLDivElement>(null);
  useEffect(() => { relatedRef.current?.scrollTo({left: 0}); }, [relatedDuration]);
  useEffect(() => { try { setSaved(localStorage.getItem(`saved-tour:${tour.slug}`) === "true"); } catch {} }, [tour.slug]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => { if (faqRef.current) faqRef.current.open = !media.matches; };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const overviewTop = overviewRef.current?.getBoundingClientRect().top ?? Infinity;
      const contentBottom = document.querySelector("[data-tour-content]")?.getBoundingClientRect().bottom ?? Infinity;
      const onPhone = window.matchMedia("(max-width: 700px)").matches;
      setFloating((onPhone || overviewTop <= 160) && contentBottom > window.innerHeight - 120);
      let current = "overview";
      let lastTop = -Infinity; for (const label of sections) { const element = document.getElementById(sectionId(label)); if (!element) continue; const top = Math.round(element.getBoundingClientRect().top); if (top <= 170 && top > lastTop + 2) { current = sectionId(label); lastTop = top; } }
      setActive(current);
    };
    const scroll = () => { if (!scheduled) { scheduled = true; frame = requestAnimationFrame(update); } };
    let frame = requestAnimationFrame(update);
    window.addEventListener("scroll", scroll, {passive: true});
    window.addEventListener("resize", scroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, []);
  useEffect(() => { if (dialog) dialogRef.current?.showModal(); else dialogRef.current?.close(); }, [dialog]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 6000); return () => clearTimeout(timer); }, [notice]);
  function enquire(customize = false) { setModal({kind: "enquiry", title: customize ? "Customize " + tour.title : tour.title}); }
  function openInfo(title: string) { setModal({kind:"info",title}); }
  async function share() {
    try { await navigator.clipboard.writeText(window.location.href.split("#")[0]); setNotice("Tour link copied."); } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setNotice("Please copy the tour address from your browser to share it."); }
  }
  function save() { const next = !saved; setSaved(next); try {localStorage.setItem(`saved-tour:${tour.slug}`, String(next));} catch {setNotice("Saved for this visit; browser storage is unavailable.");} }
  const currentTrip = tourPackages.find(item => item.id === tour.slug);
  const related = tourPackages
    .filter(item => item.id !== tour.slug && item.image)
    .map(item => ({...item, score: (currentTrip && item.destination && item.destination === currentTrip.destination ? 2 : 0) + (currentTrip && item.types.some(type => currentTrip.types.includes(type)) ? 1 : 0)}))
    .sort((a, b) => b.score - a.score)
    .filter(item => matchesTripDuration(item.days, relatedDuration))
    .slice(0, 8);
  return <div className={s.page}>
    {writeReviewOpen && <WriteReviewPopup title={tour.title} slug={tour.slug} onClose={() => setWriteReviewOpen(false)} />}
    <a className="skip-link" href="#tour-content">Skip to itinerary</a>
    <TourMotion />
    <SiteHeader onAction={(kind, title) => setModal({kind, title})} />
    <main id="tour-content" className={s.container}>
      {isVisible("introduction") && <nav className={s.breadcrumb} aria-label="Breadcrumb"><span>Home</span><span aria-hidden="true">〉</span><span>India Tours</span><span aria-hidden="true">〉</span><span aria-current="page">{tour.title}</span></nav>}
      {isVisible("introduction") && <h1 className={s.title}>{tour.title}</h1>}
      {isVisible("introduction") && <div className={s.titleMeta}>{isVisible("reviews") && reviewCount>0 && <a className={s.rating} href="#reviews"><strong>{reviewCount?average.toFixed(1):"New"}</strong>{Math.round(average) >= 4 ? <img className={s.ratingStars} src={`/figma/itinerary/review-stars-${Math.round(average)}.png`} alt={`${average.toFixed(1)} out of 5 stars`} /> : <Stars rating={average} />}<span>({reviewCount} reviews)</span></a>}<p className={s.duration}>{tour.duration ?? 12} days {startCity && <><span>•</span> {startCity === endCity ? <>Start and end in <strong>{startCity}</strong></> : <>Start in <strong>{startCity}</strong> · End in <strong>{endCity}</strong></>}</>}</p><div className={s.titleActions}><ShareMenu title={tour.title} icon="/figma/itinerary/share.svg" inline href={`/tours/${tour.slug}`} onCopy={share} /></div></div>}
      <div className={s.topGrid} style={!isVisible("gallery")||!isVisible("enquiry")?{gridTemplateColumns:"minmax(0,1fr)"}:undefined}>{isVisible("gallery") && <div className={s.gallery}>
        <button className={s.mainPhoto} data-m="photo-main" onClick={() => {setGalleryIndex(0); setDialog("gallery");}} aria-label={`Open ${tour.title} photo gallery`}><Image src={photos[0]} alt={tour.title} fill priority quality={90} sizes="(max-width: 700px) 440px, (max-width: 1100px) 65vw, 634px" />{photos.length>1 && <span className={s.photoCount}><Asset name="2032-4167-imgClarityImageGalleryLine" />{photos.length} photos</span>}</button>
        <div className={s.gallerySide} data-m="photo-side">{photos.length>1 && <button className={s.secondaryPhoto} onClick={() => {setGalleryIndex(1);setDialog("gallery");}} aria-label="View all tour photos"><Image src={photos[1]} alt={tour.title} fill quality={90} sizes="(max-width: 700px) 222px, 340px" /><span><Asset name="2032-4167-imgClarityImageGalleryLine" />View all</span></button>}
          {isVisible("reviews") && isVisible("featuredReview") && tour.reviews[0] && <a className={s.quote} href="#reviews" aria-label="Read traveller reviews"><span className={s.quoteTop}><Asset name="2032-4282-img" /><span className={s.quoteBadge}>Traveller review</span></span><p>{tour.reviews[0].text}</p><footer><span className={s.quoteAvatar} aria-hidden="true">{tour.reviews[0].name.trim().charAt(0).toUpperCase()}</span><span className={s.quoteWho}><strong>{tour.reviews[0].name}</strong><small>{formatDate(tour.reviews[0].date)}</small></span><div><span className={s.blueStars} role="img" aria-label={`${tour.reviews[0].rating} out of 5 stars`}>{Array.from({length: tour.reviews[0].rating}, (_, i) => <Asset key={i} name="2032-4282-imgIcon" />)}</span><span>{tour.reviews[0].rating} - {tour.reviews[0].rating === 5 ? "Excellent" : "Traveller rating"}</span></div></footer></a>}
        </div>
      </div>}{isVisible("enquiry") && <EnquiryForm title={tour.title} price={tour.price} message={message} onReady={setNotice} />}</div>
      <div className={s.contentColumn} data-tour-content>
        {isVisible("navigation") && visibleTabs.length>0 && <nav className={s.tabs} data-tabs aria-label="Trip sections">{visibleTabs.map(label => <a key={label} href={`#${sectionId(label)}`} aria-current={active === sectionId(label) ? "location" : undefined}><TabIcon label={label} />{label}</a>)}</nav>}
        {(isVisible("overview") || isVisible("highlights")) && <section id="overview" ref={overviewRef} className={s.overview}><Heading>Trip Highlights</Heading>{isVisible("overview") && (tour.overview ? <p className={s.overviewCopy}>{overviewOpen || tour.overview.length <= 400 ? tour.overview : `${tour.overview.slice(0, 400)}…`} {tour.overview.length > 400 && <button aria-expanded={overviewOpen} onClick={() => setOverviewOpen(!overviewOpen)}>{overviewOpen ? "Read less" : "Read more"}</button>}</p> : <MissingDetail onEnquire={enquire} />)}{isVisible("highlights") && <ul className={s.highlights} data-m="highlights">{tour.highlights.map(text => <li key={text}><Asset name="2032-4691-imgIcon" />{text}</li>)}</ul>}</section>}
        {isVisible("itinerary") && <Itinerary tour={tour} enquire={enquire} />}
        <div className={s.inclusionsGrid} style={!isVisible("inclusions")||!isVisible("exclusions")?{gridTemplateColumns:"minmax(0,1fr)"}:undefined}>{isVisible("inclusions") && <section id="inclusions"><Heading>What&apos;s inside the package?</Heading><h3>Inclusions</h3><div className={s.desktop}><Checklist items={tour.inclusions} /></div><div className={s.mobile}><Checklist items={tour.mobileInclusions} /></div></section>}{isVisible("exclusions") && <section id="exclusions"><h3>Exclusions</h3><div className={s.desktop}><Checklist items={tour.exclusions} excluded /></div><div className={s.mobile}><Checklist items={tour.mobileExclusions} excluded /></div></section>}</div>
        {isVisible("faqs") && <section id="faqs" className={s.faqs}><details className={s.faqWrapper} ref={faqRef} open><summary><Heading>FAQs</Heading><img className={s.mobile} src="/figma/itinerary/policy-chevron.svg" alt="" /></summary><div className={s.faqList} data-m="faq">{tour.faqs.map((faq, i) => <details key={faq.question} open={i === 0}><summary>{faq.question}<img className={s.faqChevron} src="/figma/itinerary/faq-chevron.svg" alt="" /></summary>{faq.answer ? <p>{faq.answer}</p> : <MissingDetail onEnquire={enquire} />}</details>)}</div></details></section>}
{isVisible("reviews") && <section id="reviews" className={s.reviews}><Heading action={<div className={s.reviewHeadingActions}><button className={s.writeReviewButton} onClick={() => setWriteReviewOpen(true)}><img src="/figma/review/pen.svg" alt="" />Write a review</button></div>}>Reviews ({reviewCount})</Heading><div className={s.reviewSummary} data-m="review-summary"><div className={s.summaryTop}><div className={s.score}><small>{reviewCount?'Traveller rating':'No reviews yet'}</small><strong>{reviewCount?average.toFixed(1):'—'}</strong><Stars rating={average} /></div><div className={s.histogram}>{sentiment.map((value, i) => <div key={i}><b>{value}%</b><span className={value ? s.fullBar : s.emptyBar} /><img src={`/figma/itinerary/sentiment-${i}.png`} alt={["Positive", "Neutral", "Negative"][i]} /></div>)}</div></div><div className={s.googleReviews}><a href="https://www.google.com/search?q=Deshaatan+Private+Limited+reviews" target="_blank" rel="noreferrer"><img src="/figma/itinerary/google.svg" alt="" />Read all reviews on Google<img src="/figma/itinerary/external-link.svg" alt="" /></a><p>Reviews shared by Deshaatan travellers.</p></div></div><div className={`${s.reviewCards} ${allReviews ? s.allReviews : ""}`} data-m="review-cards">{tour.reviews.map((review, i) => <ReviewCard key={review.name} review={review} index={i} />)}</div>{reviewCount>0 && <button className={s.allReviewsButton} onClick={() => setAllReviews(!allReviews)}>{allReviews ? "Show fewer reviews" : "See all reviews"}</button>}</section>}
        
        {isVisible("policies") && <section className={s.policies} data-m="policies" aria-label="Booking policies">{tour.policies?.map((policy, i) => <details key={`${policy.title}-${i}`}><summary>{policy.title}<img className={s.policyChevron} src="/figma/itinerary/policy-chevron.svg" alt="" /></summary>{policy.content ? <p style={{whiteSpace: 'pre-line'}}>{policy.content}</p> : <MissingDetail onEnquire={enquire} />}</details>)}</section>}
      </div>
      {isVisible("related") && <section className={s.related}>
        <div className={s.relatedHeading}>
          <h2>Related Destinations in India</h2>
          <DurationTabs value={relatedDuration} onChange={setRelatedDuration} className={s.durationTabs} label="Related trip duration" />
          <div className={s.relatedArrows}><img src="/figma/itinerary/related-arrows.svg" alt="" /><button aria-label="Previous related destinations" onClick={() => relatedRef.current?.scrollBy({left:-371, behavior:"smooth"})} /><button aria-label="Next related destinations" onClick={() => relatedRef.current?.scrollBy({left:371, behavior:"smooth"})} /></div>
        </div>
        <div className={`${trackClass} ${s.relatedTrack}`} data-m="related" ref={relatedRef} aria-live="polite">{related.map(trip => <PackageCard key={trip.id} trip={{...trip, image: trip.image.startsWith("/") || trip.image.startsWith("http") ? trip.image : `/figma/packages/${trip.image}`, dots: "", category: trip.types[0], href: trip.href || `/tours/${trip.id}`}} enquire={title => setModal({kind: "enquiry", title})} />)}</div>
      </section>}
      <div className={s.cityLinks}>{linkSections.filter((_,i)=>isVisible(i===0?"attractions":"activities")).map((section,i) => <section key={i}><h2>{section.title}</h2><TourLinks links={section.links} onEnquire={title => setModal({kind:"enquiry",title})} /></section>)}</div>
      <div className={s.mobileRelated}>{linkSections.filter((_,i)=>isVisible(i===0?"attractions":"activities")).map((section,i) => <details key={i}><summary>{section.title}<img src="/figma/itinerary/policy-chevron.svg" alt="" /></summary><TourLinks links={section.links} onEnquire={title => setModal({kind:"enquiry",title})} /></details>)}</div>
    </main>
    <SiteFooter onInfo={openInfo} onRentCar={() => setModal({kind:"car-rental",title:"Rent A Car"})} />
    <FloatingEnquiry labels={visibleTabs.filter(label=>label!=="Exclusions")} visible={floating&&isVisible("floatingEnquiry")} active={active} price={tour.price} enquire={enquire} />
    <dialog className={s.dialog} ref={dialogRef} onCancel={() => setDialog(null)} onClick={event => {if (event.target === event.currentTarget) setDialog(null);}} aria-label={`${tour.title} photo gallery`} onKeyDown={event => {if (dialog === "gallery" && ["ArrowLeft", "ArrowRight"].includes(event.key)) {event.preventDefault();setGalleryIndex(i => (i + (event.key === 'ArrowLeft' ? -1 : 1) + photos.length) % photos.length);}}}><button className={s.closeDialog} aria-label="Close dialog" onClick={() => setDialog(null)}>×</button>{dialog === "gallery" ? <div className={s.lightbox}><Image src={photos[galleryIndex]} alt={`${tour.title} photo ${galleryIndex + 1}`} width={1268} height={972} quality={90} sizes="90vw" /><div><button aria-label="Previous photo" onClick={() => setGalleryIndex(i => (i - 1 + photos.length) % photos.length)}>‹</button><span>{galleryIndex + 1} / {photos.length}</span><button aria-label="Next photo" onClick={() => setGalleryIndex(i => (i + 1) % photos.length)}>›</button></div></div> : null}</dialog>
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice && <div className={s.notice} role="status">{notice}</div>}
  </div>;
}
