import { useState, useRef, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/components/ThemeToggle";
import { useResponsive } from "@/hooks/useResponsive";
import aretLogo from "@/assets/aret-logo.png";

interface HeaderProps {
  showTestimonials: boolean;
  onToggleTestimonials: (show: boolean) => void;
}

const Header = ({ showTestimonials, onToggleTestimonials }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const headerRef = useRef<HTMLElement>(null);

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "#contact", label: "Contact" },
    { href: "/customer-login", label: "Customer Portal" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    
    if (href.startsWith('/')) {
      // Navigate to different page
      window.location.href = href;
    } else {
      // Smooth scroll with offset for fixed header
      const element = document.querySelector(href);
      if (element) {
        const headerHeight = 120; // Account for both bars
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <header ref={headerRef} className="relative z-40">
      {/* Top Contact Bar - Hidden on small mobile */}
      <div className={`bg-gradient-primary text-primary-foreground transition-all duration-300 ${
        isMobile ? 'py-1 px-2' : 'py-2 px-4'
      } ${isScrolled && isMobile ? 'hidden' : 'block'}`}>
        <div className="container mx-auto flex flex-wrap items-center justify-between text-sm sm:text-base font-medium">
          <div className="flex items-center gap-2 sm:gap-4">
            <a 
              href="tel:09152870616" 
              className="flex items-center gap-1 hover:text-primary-glow transition-colors real-time-hover"
            >
              <Phone size={isMobile ? 12 : 14} />
              <span className="hidden xs:inline">09152870616</span>
            </a>
            <a 
              href="mailto:info@aret-environmental-ng.com" 
              className="hidden sm:flex items-center gap-1 hover:text-primary-glow transition-colors real-time-hover"
            >
              <Mail size={14} />
              <span className="hidden md:inline">info@aret-environmental-ng.com</span>
            </a>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={isMobile ? 12 : 14} />
            <span className="hidden xs:inline">Uyo, Akwa Ibom State</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-background/95 backdrop-blur-xl border-b border-border sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'shadow-elegant' : 'shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isMobile ? 'h-16' : isTablet ? 'h-18' : 'h-20'
          }`}>
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src={aretLogo} 
                alt="ARET Environmental Services Logo" 
                className={`w-auto hover:scale-110 transition-transform duration-300 ${
                  isMobile ? 'h-8' : isTablet ? 'h-10' : 'h-12'
                }`} 
              />
              <div className="hidden sm:block">
                <span className={`font-medium text-foreground ${
                  isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base'
                }`}>
                  <span className="font-black">ARET</span>
                </span>
                <p className={`text-muted-foreground ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  Environmental Services
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className={`hidden md:flex items-center ${
                isTablet ? 'space-x-4' : 'space-x-8'
              }`}>
                {navItems.map(item => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`text-foreground hover:text-primary transition-all duration-300 font-medium relative group ${
                      isTablet ? 'text-sm' : 'text-base'
                    } hover:bg-primary/10 px-4 py-3 rounded-xl font-semibold`}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-1 bg-primary rounded-full transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Testimonials Toggle - Desktop Only */}
              {!isMobile && !isTablet && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 transition-all duration-300 hover:bg-primary/15">
                  <MessageCircle size={16} className="text-muted-foreground" />
                  <Label htmlFor="testimonials-toggle" className="text-sm font-semibold cursor-pointer whitespace-nowrap">
                    {showTestimonials ? 'Hide Reviews' : 'Show Reviews'}
                  </Label>
                  <Switch
                    id="testimonials-toggle"
                    checked={showTestimonials}
                    onCheckedChange={onToggleTestimonials}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              )}
              <ThemeToggle />
              {!isMobile && !isTablet && (
                <Button 
                  size={isTablet ? "sm" : "default"}
                  onClick={() => handleNavClick('#contact')}
                  className="hidden md:flex btn-modern"
                >
                  Get Quote
                </Button>
              )}
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden relative z-50 hover:bg-primary/10 rounded-xl min-h-[48px] min-w-[48px]" 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                aria-label="Toggle menu"
              >
                <div className="relative">
                  <Menu 
                    size={isMobile ? 18 : 20} 
                    className={`transition-all duration-300 ${
                      isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                    }`}
                  />
                  <X 
                    size={isMobile ? 18 : 20} 
                    className={`absolute top-0 left-0 transition-all duration-300 ${
                      isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                    }`}
                  />
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden transition-all duration-500 transform ${
            isMenuOpen 
              ? 'opacity-100 scale-100 translate-y-0 max-h-96' 
              : 'opacity-0 scale-95 -translate-y-4 max-h-0 pointer-events-none'
          } overflow-hidden bg-background/98 backdrop-blur-xl border-t border-border shadow-elegant`}>
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-3">
                {navItems.map((item, index) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full py-4 px-6 text-left text-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 animate-fade-in-left real-time-hover font-semibold text-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-6 border-t border-border/30 space-y-4">
                  {/* Mobile Testimonials Toggle */}
                  <div className="flex items-center justify-between px-4 py-4 bg-primary/5 rounded-xl border border-primary/20 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <MessageCircle size={16} className="text-muted-foreground" />
                      <Label htmlFor="mobile-testimonials-toggle" className="text-base font-semibold">
                        {showTestimonials ? 'Hide Customer Reviews' : 'Show Customer Reviews'}
                      </Label>
                    </div>
                    <Switch
                      id="mobile-testimonials-toggle"
                      checked={showTestimonials}
                      onCheckedChange={onToggleTestimonials}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <Button 
                    size="default" 
                    onClick={() => handleNavClick('#contact')}
                    className="w-full btn-modern animate-scale-bounce h-14 text-base font-bold"
                    style={{ animationDelay: '0.6s' }}
                  >
                    Get Quote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;