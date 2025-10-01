import { Button } from "@/components/ui/button";
import { ArrowRight, Recycle, Trash2, Leaf, Phone, Sparkles } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive"; 
import { useRealTimeAnimations } from "@/hooks/useRealTimeAnimations";
import heroImage from "@/assets/hero-waste-workers.png";

const Hero = () => {
  const { isMobile, isTablet } = useResponsive();

  const heroRef = useRealTimeAnimations((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-visible');
    }
  });

  const scrollToServices = () => {
    const element = document.querySelector('#services');
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      ref={heroRef}
      id="home" 
      className="relative min-h-screen flex items-center overflow-hidden animate-on-scroll"
    >
      {/* Background Image with Responsive Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="ARET Environmental Services - Professional waste management team in Uyo, Akwa Ibom State" 
          className="w-full h-full object-cover object-center" 
          loading="eager" 
          fetchPriority="high" 
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-30 sm:opacity-20"></div>
      </div>

      {/* Floating Shapes - Responsive sizing */}
      <div className="absolute top-10 sm:top-20 left-4 sm:left-10 opacity-10 sm:opacity-20 parallax">
        <Recycle size={isMobile ? 60 : isTablet ? 90 : 120} className="text-primary-glow animate-float" />
      </div>
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 opacity-10 sm:opacity-20 parallax">
        <Leaf size={isMobile ? 40 : isTablet ? 60 : 80} className="text-primary-glow animate-bounce-gentle" />
      </div>
      <div className="absolute top-1/2 right-4 sm:right-10 opacity-5 sm:opacity-10 parallax">
        <div className={`border-2 border-primary-glow rounded-full animate-pulse ${
          isMobile ? 'w-16 h-16' : isTablet ? 'w-24 h-24' : 'w-32 h-32'
        }`}></div>
      </div>
      <div className="absolute top-1/4 left-1/3 opacity-5 sm:opacity-10 parallax">
        <Sparkles size={isMobile ? 30 : 50} className="text-accent animate-pulse" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-md border-2 border-primary shadow-lg rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 animate-fade-in">
            <Trash2 size={isMobile ? 14 : 16} className="text-primary" />
            <span className={`text-foreground font-semibold ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Professional Waste Management Solutions
            </span>
          </div>

          {/* Main Heading - Responsive */}
          <h1 className={`font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight animate-fade-in-up drop-shadow-lg ${
            isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl md:text-7xl'
          }`} 
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Your Partner in
            <span className="block text-primary-glow drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Sustainability
            </span>
          </h1>

          {/* Subtitle - Responsive */}
          <p className={`text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed animate-fade-in-up drop-shadow-lg ${
            isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl md:text-2xl'
          }`} 
          style={{
            animationDelay: '0.2s',
            textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
          }}>
            Premier waste management solutions in Uyo, Akwa Ibom State. 
            We are committed to reducing environmental impact and promoting 
            sustainability across all sectors.
          </p>

          {/* Action Buttons - Responsive Stack */}
          <div className="responsive-flex mb-8 sm:mb-12 animate-fade-in-up" style={{
            animationDelay: '0.4s'
          }}>
            <Button 
              size={isMobile ? "default" : isTablet ? "default" : "lg"}
              onClick={scrollToServices}
              className="btn-modern bg-primary-glow hover:bg-primary-glow/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold min-h-[48px] w-full sm:w-auto"
            >
              Explore Services
              <ArrowRight className="ml-2" size={isMobile ? 16 : 20} />
            </Button>
            <Button 
              size={isMobile ? "default" : isTablet ? "default" : "lg"}
              variant="default"
              onClick={scrollToContact}
              className="btn-modern bg-background/90 text-primary hover:bg-background px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold backdrop-blur-md min-h-[48px] w-full sm:w-auto"
            >
              <Phone className="mr-2" size={isMobile ? 16 : 20} />
              Contact Us
            </Button>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-16 animate-fade-in-up" style={{
            animationDelay: '0.6s'
          }}>
            <div className="text-center group">
              <div className={`font-black text-primary-foreground mb-2 group-hover:scale-110 transition-spring ${
                isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'
              }`}>
                100+
              </div>
              <div className={`text-primary-foreground/80 ${
                isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'
              }`}>
                Happy Clients
              </div>
            </div>
            <div className="text-center group">
              <div className={`font-black text-primary-foreground mb-2 group-hover:scale-110 transition-spring ${
                isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'
              }`}>
                24/7
              </div>
              <div className={`text-primary-foreground/80 ${
                isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'
              }`}>
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      {!isMobile && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-70">
          <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full">
            <div className="w-1 h-3 bg-primary-glow rounded-full mx-auto mt-2 animate-bounce"></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;