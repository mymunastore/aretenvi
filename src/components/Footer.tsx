import { Recycle, Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import aretLogo from "@/assets/aret-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-primary text-primary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-glow rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent rounded-full blur-2xl animate-float"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center mb-6">
              <img 
                src={aretLogo} 
                alt="ARET Environmental Services Logo" 
                className="h-12 w-auto mr-4 mx-auto md:mx-0"
              />
              <div className="hidden md:block">
                <p className="text-sm opacity-90 font-medium">Environmental Services</p>
              </div>
            </div>
            <p className="text-base opacity-90 mb-6 leading-relaxed font-medium">
              Leading provider of waste collection, management and disposal services for Uyo and 
              Akwa Ibom State communities. Partnering for sustainable solutions.
            </p>
            <div className="text-sm opacity-80 mb-6 p-4 bg-primary-foreground/10 rounded-xl border border-primary-foreground/20">
              <p className="font-semibold">CAC Registration No.: 8278298</p>
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="bg-primary-foreground/15 p-3 rounded-xl hover:bg-primary-foreground/25 transition-all duration-300 cursor-pointer hover:scale-110">
                <Facebook size={20} />
              </div>
              <div className="bg-primary-foreground/15 p-3 rounded-xl hover:bg-primary-foreground/25 transition-all duration-300 cursor-pointer hover:scale-110">
                <Instagram size={20} />
              </div>
              <div className="bg-primary-foreground/15 p-3 rounded-xl hover:bg-primary-foreground/25 transition-all duration-300 cursor-pointer hover:scale-110">
                <Twitter size={20} />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-xl mb-6">Our Services</h4>
            <ul className="space-y-3 text-base opacity-90">
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Waste Collection</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Waste Management</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Waste Disposal</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Recycling Programs</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">General Environmental Services</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-xl mb-6">Quick Links</h4>
            <ul className="space-y-3 text-base opacity-90">
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">About Us</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Our Services</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Contact</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Get Quote</li>
              <li className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium">Emergency Service</li>
              <li>
                <a href="/privacy-policy" className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium hover:text-primary-glow">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-xl mb-6">Contact Info</h4>
            <div className="space-y-4 text-base flex flex-col items-center md:items-start">
              <a
                href="tel:09152870616"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1"
              >
                <Phone size={16} />
                <span className="font-medium">Front Desk: 09152870616</span>
              </a>
              <a
                href="tel:07032224738"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1"
              >
                <Phone size={16} />
                <span className="font-medium">Alternative: 07032224738</span>
              </a>
              <a
                href="tel:09152870617"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1"
              >
                <Phone size={16} />
                <span className="font-medium">Operations: 09152870617</span>
              </a>
              <a
                href="https://wa.me/2349152870616?text=Hello!%20I'm%20interested%20in%20ARET%20Environmental%20Services.%20I'd%20like%20to%20know%20more%20about%20your%20waste%20management%20solutions."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1 hover:text-[#25D366]"
              >
                <MessageCircle size={16} />
                <span className="font-medium">WhatsApp: 09152870616</span>
              </a>
              <a
                href="mailto:info@aret-environmental-ng.com"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1"
              >
                <Mail size={16} />
                <span className="font-medium">info@aret-environmental-ng.com</span>
              </a>
              <div className="flex items-start gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <MapPin size={16} className="mt-1" />
                <span className="font-medium">No. 576 Oron Road, Uyo<br />Akwa Ibom State, Nigeria</span>
              </div>
              <a
                href="tel:09152870618"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1 mt-4"
              >
                <Phone size={16} />
                <span className="text-sm font-medium">Complaints & Incidents: 09152870618</span>
              </a>
              <a
                href="mailto:support@aret-environmental-ng.com"
                className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-all duration-300 hover:translate-x-1"
              >
                <Mail size={16} />
                <span className="text-sm font-medium">support@aret-environmental-ng.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-base opacity-90 gap-4">
          <p className="font-medium">© 2025 ARET Environmental Services. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 md:mt-0">
            <a href="/privacy-policy" className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:text-primary-glow font-medium">Privacy Policy</a>
            <a href="/privacy-policy" className="hover:opacity-100 cursor-pointer transition-all duration-300 hover:text-primary-glow font-medium">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;