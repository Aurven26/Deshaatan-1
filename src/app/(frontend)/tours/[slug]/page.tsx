import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import TourDetail from '@/components/tour-detail';
import {getPublishedItinerary, getPublishedReviews, tourDetail} from '@/cms/tour';

type Props = {params: Promise<{slug: string}>};
export const revalidate = 60;
export function generateStaticParams() { return []; }

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const doc = await getPublishedItinerary((await params).slug);
  if (!doc) notFound();
  const site = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.deshaatan.com';
  const media = [doc.seo?.image, doc.image, doc.thumbnail].find(item => item && typeof item === 'object' && 'url' in item && item.url) as unknown as {url?: string | null} | undefined;
  const image = media?.url ? (media.url.startsWith('http') ? media.url : `${site}${media.url}`) : undefined;
  return {
    title: doc.seo?.title || `${doc.title} | Deshaatan`,
    description: doc.seo?.description || `View the itinerary, trip highlights, inclusions and enquiry options for ${doc.title}.`,
    robots: {index: !doc.seo?.noIndex, follow: true},
    ...(doc.seo?.robots ? {robots: {index: doc.seo.robots.startsWith('index-'), follow: doc.seo.robots.endsWith('-follow')}} : {}),
    keywords: doc.seo?.keywords?.split(',').map(keyword => keyword.trim()).filter(Boolean),
    alternates: {
      canonical: doc.seo?.canonicalURL || `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.deshaatan.com'}/tours/${doc.slug}`,
      languages: Object.fromEntries((doc.seo?.hreflang || []).map(item => [item.language, item.url])),
    },
    ...(image ? {openGraph: {images: [image], title: doc.seo?.title || doc.title, type: 'website'}, twitter: {card: 'summary_large_image', images: [image]}} : {}),
  };
}

export default async function ItineraryPage({params}: Props) {
  const doc = await getPublishedItinerary((await params).slug);
  const tour = doc && tourDetail(doc);
  if (!tour || !doc) notFound();
  const publishedReviews = await getPublishedReviews(doc.id);
  return <TourDetail tour={{...tour,reviews:publishedReviews}} />;
}
