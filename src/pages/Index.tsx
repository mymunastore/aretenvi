import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollToTop from "@/components/ScrollToTop";
import AnimatedSection from "@/components/AnimatedSection";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import SEOHead from "@/components/SEOHead";
import { LiveChat } from "@/components/LiveChat";
import MottoSection from "@/components/MottoSection";
import VisionMissionSection from "@/components/VisionMissionSection";
import CoreValuesSection from "@/components/CoreValuesSection";
import CarbonFootprintCalculator from "@/components/CarbonFootprintCalculator";
import EnhancedCarbonCalculator from "@/components/EnhancedCarbonCalculator";
import GoogleMap from "@/components/GoogleMap";
import { MapPin } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (isLoading) {
    return (
      <>
        <SEOHead />
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <PerformanceOptimizer />
      <AccessibilityEnhancer />
      <ScrollProgress />
      <Header 
        showTestimonials={showTestimonials}
        onToggleTestimonials={setShowTestimonials}
      />
      
      <main id="main-content">
        <Hero />
        
        <AnimatedSection delay={50}>
          <MottoSection />
        </AnimatedSection>
        
        <AnimatedSection delay={100}>
          <VisionMissionSection />
        </AnimatedSection>
        
        <AnimatedSection delay={150}>
          <CoreValuesSection />
        </AnimatedSection>
        
        <AnimatedSection delay={200}>
          <EnhancedCarbonCalculator />
        </AnimatedSection>
        
        <AnimatedSection delay={250}>
          <Testimonials showTestimonials={showTestimonials} />
        </AnimatedSection>
        
        <AnimatedSection delay={300}>
          <FAQ showFAQ={!showTestimonials} />
        </AnimatedSection>
        
        <AnimatedSection delay={350}>
          <section id="location" className="py-32 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-20 left-20 w-80 h-80 bg-primary rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary-glow rounded-full blur-2xl animate-bounce-gentle"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 animate-fade-in-scale">
                <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
                  <MapPin className="text-primary" size={24} />
                  <span className="text-primary font-bold text-base tracking-wide">FIND US</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight">
                  Visit Our <span className="text-gradient">Location</span>
                </h2>
                <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed">
                  Located in the heart of Uyo, Akwa Ibom State. Find us easily and get directions to our office.
                </p>
              </div>
              
              <div className="max-w-6xl mx-auto">
                <GoogleMap className="shadow-elegant hover:shadow-hover transition-all duration-500" />
              </div>
            </div>
          </section>
        </AnimatedSection>
        
        <AnimatedSection delay={350}>
          <Contact />
        </AnimatedSection>
      </main>
      
      <Footer />
      <ScrollToTop />
      <LiveChat />
    </div>
  );
};

export default Index;
