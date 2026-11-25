import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import Footer from '@/components/shared/layout/Footer';
import AiConnectSection from '@/pages/Home/AiConnectSection';
import BottomCtaSection from '@/pages/Home/BottomCtaSection';
import ComparisonSection from '@/pages/Home/ComparisonSection';
import DashboardClaritySection from '@/pages/Home/DashboardClaritySection';
import FaqSection from '@/pages/Home/FaqSection';
import HeroSection from '@/pages/Home/HeroSection';
import HowItWorksSection from '@/pages/Home/HowItWorksSection';
import LandingNavbar from '@/pages/Home/LandingNavbar';
import TestimonialsSection from '@/pages/Home/TestimonialsSection';

const HomePage = () => {
  return (
    <>
      <LandingNavbar />
      <ScrollableColumn component={'main'} sx={{ pb: 4, pr: 0 }}>
        <HeroSection />
        <DashboardClaritySection />
        <HowItWorksSection />
        <AiConnectSection />
        <ComparisonSection />
        <FaqSection />
        <TestimonialsSection />
        <BottomCtaSection />
        <Footer />
      </ScrollableColumn>
    </>
  );
};

export default HomePage;
