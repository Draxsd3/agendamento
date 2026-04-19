import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Metrics from "@/components/landing/Metrics";
import Marquee from "@/components/landing/Marquee";
import Calculator from "@/components/landing/Calculator";
import Showcase from "@/components/landing/Showcase";
import Paradox from "@/components/landing/Paradox";
import Algorithm from "@/components/landing/Algorithm";
import Personas from "@/components/landing/Personas";
import HowItWorks from "@/components/landing/HowItWorks";
import FeatureSections from "@/components/landing/FeatureSections";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Metrics />
      <Marquee />
      <Calculator />
      <Showcase />
      <Paradox />
      <Algorithm />
      <Personas />
      <HowItWorks />
      <FeatureSections />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
