import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink, FileText, Send } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary-glow rounded-full blur-3xl animate-bounce-gentle"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-scale">
          <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
            <Phone className="text-primary" size={24} />
            <span className="text-primary font-bold text-base tracking-wide">GET IN TOUCH</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight">
            <span className="text-gradient">Contact</span> Us Today
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed">
            Ready to start your waste management journey? Contact us today for 
            a free consultation and personalized quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Contact Information */}
          <div className="space-y-8 animate-fade-in-scale">
            <h3 className="text-3xl font-black text-foreground mb-8">
              Contact Information
            </h3>

            <div className="space-y-8">
              {/* Phone Numbers */}
              <div className="flex items-start gap-6 p-8 card-modern shadow-hover hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-primary p-4 rounded-2xl shadow-card">
                  <Phone className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Phone</h4>
                  <p className="text-foreground font-bold text-lg">Front Desk: 09152870616</p>
                  <p className="text-foreground font-bold text-lg">Alternative: 07032224738</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-6 p-8 card-modern shadow-hover hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-primary p-4 rounded-2xl shadow-card">
                  <Mail className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Email</h4>
                  <p className="text-foreground font-bold text-lg">info@aret-environmental-ng.com</p>
                  <p className="text-foreground font-bold text-base mt-2">support@aret-environmental-ng.com</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-6 p-8 card-modern shadow-hover hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-primary p-4 rounded-2xl shadow-card">
                  <MapPin className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Address</h4>
                  <p className="text-foreground font-bold text-lg">
                    No. 576 Oron Road, Uyo<br />
                    Akwa Ibom State, Nigeria
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-6 p-8 card-modern shadow-hover hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-primary p-4 rounded-2xl shadow-card">
                  <Clock className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Business Hours</h4>
                  <div className="text-foreground font-bold space-y-2 text-lg">
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p>Saturday: 10:00 AM - 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
            <div className="w-full max-w-3xl mx-auto">
              {/* Enhanced Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary/20 rounded-full px-6 py-3 mb-4">
                  <FileText className="text-primary" size={20} />
                  <span className="text-primary font-bold text-sm tracking-wide">CLIENT REGISTRATION</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Start Your Service Today
                </h3>
                <p className="text-muted-foreground">
                  Fill out our quick registration form to get personalized waste management solutions
                </p>
              </div>

              <div className="card-modern shadow-elegant hover:shadow-hover transition-all duration-500 overflow-hidden border-2 border-primary/10 hover:border-primary/20">
                {/* Form Preview with Enhanced Styling */}
                <a 
                  href="https://forms.gle/m3yL5f68ksnn7h6Z6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group relative overflow-hidden"
                >
                  {/* Image Container with Gradient Overlay */}
                  <div className="relative">
                  <img 
                    src="/src/assets/image copy copy.png" 
                    alt="ARET Environmental Services Client Information Form - Click to fill out"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-110 object-cover object-top"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                    
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Enhanced hover overlay with animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/15 to-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-gradient-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-glow transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 flex items-center gap-3">
                      <ExternalLink size={20} />
                      <span>Open Registration Form</span>
                    </div>
                  </div>
                </a>
                
                {/* Enhanced form footer with better styling */}
                <div className="p-8 bg-gradient-to-r from-primary/8 via-primary-glow/5 to-primary/8 border-t-2 border-primary/20">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
                      <FileText className="text-primary" size={20} />
                    Client Information Form
                    </h3>
                    <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                      Click the form above to provide your information and get started with our professional waste management services.
                    </p>
                  </div>
                  
                  {/* Enhanced action button */}
                  <div className="flex justify-center">
                    <a
                      href="https://forms.gle/m3yL5f68ksnn7h6Z6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-modern inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold hover:shadow-glow transition-all duration-300 hover:scale-105 min-h-[48px] w-full sm:w-auto touch-manipulation"
                    >
                      <Send size={18} />
                      Complete Registration Form
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  {/* Additional form benefits */}
                  <div className="mt-8 pt-6 border-t border-primary/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Clock className="text-primary" size={16} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Quick 2-min form</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Phone className="text-primary" size={16} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Same-day response</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <FileText className="text-primary" size={16} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Free consultation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;