"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "./site-chrome";
import {SiteDialog, EnquiryFields, type Modal} from "./site-dialog";
import {type Trip} from "@/data/travel-catalog";
import HomepageMotion from "./homepage-motion";
import HomeBanners from "./home-banners";
import {useCMSContent} from './cms-content';
import { matchesTripDuration } from "./duration-tabs";
import s from "./home.module.css";

const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={asset(name)} alt="" loading="lazy" decoding="async" />;
}
function CarouselArrows({ target, label, count, className }: { target: RefObject<HTMLDivElement | null>; label: string; count: number; className?: string }) {
  const [edges, setEdges] = useState({start:true,end:false});
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    element.scrollTo({left:0});
    const update = () => setEdges({start:element.scrollLeft <= 1,end:element.scrollLeft + element.clientWidth >= element.scrollWidth - 1});
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll",update,{passive:true});
    return () => {observer.disconnect(); element.removeEventListener("scroll",update);};
  }, [target,count]);
  const move = (direction: number) => {
    const element = target.current;
    if (element) element.scrollBy({left:direction * element.clientWidth,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  };
  return <div className={className ?? s.arrows} aria-label={label + " navigation"}><button type="button" aria-label={"Previous " + label} disabled={edges.start} onClick={() => move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg></button><button type="button" aria-label={"Next " + label} disabled={edges.end} onClick={() => move(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></button></div>;
}

function Chips({ labels, value, onChange, label }: { labels: string[]; value: number; onChange: (value: number) => void; label: string }) {
  return <div className={s.chips} role="group" aria-label={label}>
    <button type="button" aria-pressed={value === -1} onClick={() => onChange(-1)}>All</button>
    {labels.map((item, index) => <button type="button" key={item} aria-pressed={value === index} onClick={() => onChange(value === index ? -1 : index)}>{item}</button>)}
  </div>;
}

function PackageCard({ trip, enquire }: { trip: Trip; enquire: (title: string) => void }) {
  const {homePage:{popular:p}}=useCMSContent();
  const photo = <Image src={trip.image} alt={trip.title} width={604} height={480} sizes="(max-width: 600px) 260px, (max-width: 1000px) 45vw, 302px" quality={90} loading="lazy" />;
  return <article className={s.card}>
    {trip.href ? <Link className={s.photo} href={trip.href} aria-label={`View ${trip.title}`}>{photo}{trip.days ? <span className={s.badge}>{trip.days - 1}N / {trip.days}D</span> : null}</Link> : <div className={s.photo}>{photo}</div>}
    {trip.href ? <Link className={s.title} href={trip.href}>{trip.title}</Link> : <button className={s.title} onClick={() => enquire(trip.title)}>{trip.title}</button>}
    <div className={s.priceRow}><div className={s.price}><strong>₹{(trip.price ?? 0).toLocaleString("en-IN")}</strong><span>{p.perPerson}</span></div><button type="button" className={s.callback} onClick={() => enquire(trip.title)}>{p.callbackLabel}</button></div>
  </article>;
}

const chipArrow = <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5" /></svg>;
const whyItems = [
  {title:"Handpicked itineraries",text:"Every package is planned and checked by our travel team.",icon:<><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></>},
  {title:"Local travel experts",text:"650+ specialists who know each destination first-hand.",icon:<><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></>},
  {title:"Transparent pricing",text:"Clear inclusions and exclusions. No surprises later.",icon:<><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.67 0 6.67-10 0-10"/></>},
  {title:"100% customisable",text:"Change days, hotels or vehicle to fit your trip.",icon:<><path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/></>},
];
const tileNotes: Record<string,string> = {Kerala:"Backwaters & hills",Rajasthan:"Forts & palaces",Kashmir:"Lakes & valleys",Himachal:"Mountain towns",Goa:"Beaches & sunsets",Ladakh:"High passes & lakes",Uttarakhand:"Temples & treks"};
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]).join("").toUpperCase();

export default function Home() {
  const {tourPackages,testimonials:allTestimonials,guideDetails,homePage:h,homeSelection}=useCMSContent();
  const testimonials=h.testimonials.useAll?allTestimonials:homeSelection.testimonials.flatMap(name=>allTestimonials.filter(item=>item.name===name));
  const guides=h.guides.useAll?guideDetails:homeSelection.guides.flatMap(name=>guideDetails.filter(item=>item.title===name));
  const popularTrips=h.popular.useAll?tourPackages:homeSelection.popular.flatMap(id=>tourPackages.filter(item=>item.id===id));
  const [duration, setDuration] = useState(-1);
  const [religiousDuration, setReligiousDuration] = useState(-1);
  const popularTrack = useRef<HTMLDivElement>(null);
  const religiousTrack = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const [notice, setNotice] = useState("");
  const [submittingItinerary, setSubmittingItinerary] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<{success: boolean; message: string} | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const enquiry = (title: string) => setModal({ kind: "enquiry", title });
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (!testimonials.length || testimonialPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setTestimonial(value => (value + 1) % testimonials.length), h.testimonials.interval * 1000);
    return () => window.clearInterval(timer);
  }, [testimonialPaused,testimonials.length,h.testimonials.interval]);
  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingItinerary) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmittingItinerary(true);
    setItineraryResult(null);
    try {
      const response = await fetch("/api/itinerary-requests", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(data))});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t submit your request. Please try again.");
      setItineraryResult({success:true, message:h.enquiry.successMessage});
      form.reset();
    } catch (error) {
      setItineraryResult({success:false, message:error instanceof Error ? error.message : "We couldn’t submit your request. Please try again."});
    } finally { setSubmittingItinerary(false); }
  }
  const toTrip = (trip: (typeof tourPackages)[number]): Trip => ({...trip, image: trip.image.startsWith('/') || trip.image.startsWith('http') ? trip.image : `/figma/packages/${trip.image}`, dots: "", category: trip.types[0]});
  const visibleTrips = popularTrips.filter(trip => matchesTripDuration(trip.days, duration)).map(toTrip);
  const religious = (h.religious.useAll ? tourPackages.filter(trip => trip.types.includes('Pilgrimage')) : homeSelection.religious.flatMap(id => tourPackages.filter(trip => trip.id === id))).map(toTrip);
  const visibleReligiousTrips = religious.filter(trip => matchesTripDuration(trip.days, religiousDuration));
  const current = testimonials.length ? testimonials[testimonial % testimonials.length] : null;
  const searches = h.about.linkGroups.flatMap(group => group.links);
  const searchTitle = h.about.linkGroups[0]?.title || "Popular searches";
  const arrow = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
  return <>
    <HomepageMotion />
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader home onAction={(kind, title) => setModal({kind, title})} />
    <main id="main" className={`${s.wrap} home-v2`}>
      <HomeBanners />
      {h.popular.enabled && <section id="destinations" className={s.section}><div className={s.container}>
        <div className={s.head}><div><h1>{h.popular.title}</h1><p>Our most-loved itineraries, planned end to end by local experts.</p></div><div className={s.tools}><Chips label="Trip duration" labels={h.popular.durationLabels.map(item=>item.label)} value={duration} onChange={setDuration} /><CarouselArrows target={popularTrack} label="packages" count={visibleTrips.length} /></div></div>
        <div className={s.trackBleed}><div className={s.track} ref={popularTrack} aria-live="polite">{visibleTrips.map(trip => <PackageCard key={trip.title} trip={trip} enquire={enquiry} />)}</div></div>
        {!visibleTrips.length && <p className={s.empty} role="status">{h.popular.emptyText} <button type="button" onClick={() => setDuration(-1)}>Show all</button></p>}
      </div></section>}
      {h.guides.enabled && guides.length>0 && <section id="explore" className={`${s.section} ${s.cream}`}><div className={s.container}>
        <div className={s.head}><div><h2>{h.guides.title}</h2><p>Pick a region and we’ll match you with the right itinerary.</p></div><Link className={`${s.link} ${s.desktopLink}`} href="/tour-packages">View all destinations →</Link></div>
        <div className={s.tiles}>{guides.slice(0,4).map(guide => <Link className={s.tile} key={guide.title} href={`/tour-packages?destination=${encodeURIComponent(guide.title)}`}><Image src={guide.image||"/figma/imgImageMunnar.png"} alt={`${guide.title} tour packages`} width={604} height={760} sizes="(max-width: 600px) 45vw, (max-width: 1000px) 45vw, 302px" quality={85} loading="lazy" /><span className={s.tileCopy}><strong>{guide.title}</strong><span>{tileNotes[guide.title] ? `${tileNotes[guide.title]} · ` : ""}{h.guides.exploreLabel} →</span></span></Link>)}</div>
        <Link className={`${s.link} ${s.mobileLink}`} href="/tour-packages">View all destinations →</Link>
      </div></section>}
      {h.religious.enabled && religious.length>0 && <section id="religious" className={`${s.section} ${s.dark}`}><div className={s.container}>
        <div className={s.head}><div><h2>{h.religious.title}</h2><p>Comfortable, well-paced yatras with stays and transfers taken care of.</p></div><div className={s.tools}><Chips label="Pilgrimage duration" labels={h.religious.durationLabels.map(item=>item.label)} value={religiousDuration} onChange={setReligiousDuration} /><CarouselArrows target={religiousTrack} label="pilgrimage packages" count={visibleReligiousTrips.length} /></div></div>
        <div className={s.trackBleed}><div className={s.track} ref={religiousTrack} aria-live="polite">{visibleReligiousTrips.map(trip => <PackageCard key={trip.title} trip={trip} enquire={enquiry} />)}</div></div>
        {!visibleReligiousTrips.length && <p className={s.empty} role="status">{h.religious.emptyText} <button type="button" onClick={() => setReligiousDuration(-1)}>{h.religious.clearLabel}</button></p>}
      </div></section>}
      <section className={`${s.container} ${s.why}`} aria-label="Why Deshaatan">{whyItems.map(item => <div className={s.whyCard} key={item.title}><span className={s.whyIcon}><svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg></span><h3>{item.title}</h3><p>{item.text}</p></div>)}</section>
      {h.testimonials.enabled && current && <section className={`${s.section} ${s.cream}`} onMouseEnter={() => setTestimonialPaused(true)} onMouseLeave={() => setTestimonialPaused(false)} onFocusCapture={() => setTestimonialPaused(true)} onBlurCapture={() => setTestimonialPaused(false)}><div className={`${s.container} ${s.reviews}`}>
        <div><p className={s.eyebrow}>{h.testimonials.eyebrow}</p><h2>{h.testimonials.mobileTitle}</h2></div>
        <div className={s.review} aria-live="polite"><span className={s.stars} aria-label={`${current.rating} out of 5 stars`}>{"★".repeat(Math.max(1,Math.round(current.rating)))}</span><p className={s.quote} key={testimonial}>“{current.text}”</p>
          <div className={s.reviewFoot}><div className={s.person}><span className={s.avatar}>{current.avatar ? <img src={current.avatar} alt="" loading="lazy" /> : initials(current.name)}</span><div><strong>{current.name}</strong><small>{current.role}</small></div></div>
          {testimonials.length>1 && <div className={`${s.arrows} ${s.reviewArrows}`}><button type="button" aria-label="Previous testimonial" onClick={() => setTestimonial(value => (value + testimonials.length - 1) % testimonials.length)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg></button><button type="button" aria-label="Next testimonial" onClick={() => setTestimonial(value => (value + 1) % testimonials.length)}>{arrow}</button></div>}</div></div>
      </div></section>}
      {h.enquiry.enabled && <section id="itinerary" className="itinerary"><div className="content"><h2>{h.enquiry.titleBefore} <span>{h.enquiry.titleHighlight}</span> {h.enquiry.titleAfter}</h2><p>{h.enquiry.description}</p><form className="itinerary-form" onSubmit={submitEnquiry} aria-busy={submittingItinerary}><fieldset className="itinerary-fieldset" disabled={submittingItinerary}><EnquiryFields prefix="itinerary-" travelDetails copy={h.enquiry} /></fieldset><div className="form-actions"><button type="submit" className="primary-button" disabled={submittingItinerary}>{submittingItinerary ? h.enquiry.pendingLabel : h.enquiry.button}<Icon name="imgItalicText1" /></button><a className="whatsapp-button" href={h.enquiry.whatsappURL} target="_blank" rel="noreferrer"><Icon name="imgGroup1" />{h.enquiry.whatsappLabel}</a></div>{itineraryResult && <p className={`itinerary-result ${itineraryResult.success ? "success" : "error"}`} role={itineraryResult.success ? "status" : "alert"}>{itineraryResult.message}</p>}<div className="form-promises">{h.enquiry.promises.map((item,i)=><span key={i}>{item.label}</span>)}</div></form></div></section>}
      {h.airport.enabled && <div className={`${s.container} ${s.airportWrap}`}><section className={s.airport} aria-label="Airport transfers"><div className={s.airportArt}><Image className={s.airportPlane} src={h.airport.decorationImage} alt="" width={107} height={81} sizes="107px" quality={75} loading="lazy" /><Image className={s.airportCar} src={h.airport.carImage} alt={h.airport.carAlt} width={279} height={139} sizes="(max-width: 600px) 150px, 230px" quality={80} loading="lazy" /></div><div className={s.airportText}><span className={s.airportLabel}>AIRPORT TRANSFERS</span><h2>{h.airport.title}</h2><p>{h.airport.description}</p></div><button type="button" className={s.airportButton} onClick={() => setModal({kind:"airport-transfer",title:h.airport.enquiryTitle})}>{h.airport.button}{arrow}</button></section></div>}
      {h.about.enabled && <section id="about" className={`${s.container} ${s.about}`}><h2>{h.about.title}</h2><p>{expanded ? h.about.full : h.about.preview}</p><button type="button" className={s.aboutToggle} onClick={() => setExpanded(!expanded)}>{expanded ? h.about.readLess : `${h.about.readMore} →`}</button>
        {searches.length>0 && <div className={s.searches}><h2>{searchTitle}</h2><div className={s.searchList}>{searches.map((link,i)=>link.href?<a key={i} href={link.href}>{link.label}{chipArrow}</a>:<button type="button" key={i} onClick={()=>enquiry(link.label)}>{link.label}{chipArrow}</button>)}</div></div>}
      </section>}
    </main>
    <SiteFooter onInfo={title => setModal({kind: "info", title})} onRentCar={() => setModal({kind:"car-rental",title:"Rent A Car"})} />
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice && <div className="toast" role="status">{notice}</div>}
  </>;
}
