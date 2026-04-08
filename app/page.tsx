import Hero from './components/Hero';
import CylindricalCarousel from './components/About';
import OurTeam from './components/OurTeam';
import FAQ from './components/FAQ';

export default function Home() {
  return (
    <main>
      <Hero />
      <CylindricalCarousel />
      <OurTeam />
      <FAQ />
    </main>
  );
}
