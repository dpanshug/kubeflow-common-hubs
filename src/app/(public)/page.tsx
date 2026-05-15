import { Hero } from "@/components/landing/hero";
import { ActivityTicker } from "@/components/landing/activity-ticker";
import { UpcomingEvents } from "@/components/landing/upcoming-events";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedBadges } from "@/components/landing/featured-badges";
import { CommunityVoices } from "@/components/landing/community-voices";
import { CtaSection } from "@/components/landing/cta-section";
import { getUpcomingEvents } from "@/lib/public/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents();

  return (
    <>
      <Hero />
      <ActivityTicker />
      <UpcomingEvents events={upcomingEvents} />
      <HowItWorks />
      <FeaturedBadges />
      <CommunityVoices />
      <CtaSection />
    </>
  );
}
