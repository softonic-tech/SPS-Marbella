import HeroSection from '@/components/home/HeroSection';
import HomeContact from '@/components/home/HomeContact';
import HomeFeature from '@/components/home/HomeFeature';
import HomeIntro from '@/components/home/HomeIntro';
import HomeMethod from '@/components/home/HomeMethod';
import HomeProjects from '@/components/home/HomeProjects';
import HomeServices from '@/components/home/HomeServices';

export default function HomePage() {
  return (
    <>
      {/* The hero artwork is a CSS background so each breakpoint keeps its own
          approved crop; preloading the matching file keeps it the LCP image. */}
      <link
        rel="preload"
        as="image"
        href="/assets/sps-hero-selected-clean.png"
        media="(min-width: 781px)"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/sps-hero-mobile-selected.png"
        media="(max-width: 780px)"
      />

      <HeroSection />

      <div className="home-editorial">
        <HomeIntro />
        <HomeServices />
        <HomeFeature />
        <HomeMethod />
        <HomeProjects />
        <HomeContact />
      </div>
    </>
  );
}
