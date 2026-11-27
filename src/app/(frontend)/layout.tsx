import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "../globals.css";
import "../animations.css";
import "../responsive-design.css";
import "../footer.css";
import "../itinerary-form.css";
import "../testimonials.css";
import {getWebsiteContent} from '@/cms/content';
import {CMSContentProvider} from '@/components/cms-content';
export const revalidate=60;

export async function generateMetadata():Promise<Metadata> {
  return {
  title: "Deshaatan — Explore India",
  description: "Discover India with Deshaatan. Explore destinations, curated holiday packages, and a custom itinerary for your next adventure.",
  // Brand favicon ships with the site (public/favicon.ico).
  icons:{icon:'/favicon.ico?v=2',shortcut:'/favicon.ico?v=2',apple:'/favicon.ico?v=2'},
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content=await getWebsiteContent();
  return <html lang="en"><body><CMSContentProvider content={content}>{children}</CMSContentProvider></body></html>;
}
