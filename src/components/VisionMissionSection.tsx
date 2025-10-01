import { Target, Compass, Lightbulb, CircleCheck as CheckCircle } from "lucide-react";

const VisionMissionSection = () => {
  return (
    <section className="py-32 bg-gradient-subtle relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary-glow rounded-full blur-3xl animate-bounce-gentle"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-accent rounded-full blur-2xl animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* Vision Statement */}
          <div className="text-center animate-fade-in-scale">
            <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
              <Lightbulb className="text-primary" size={24} />
              <span className="text-primary font-bold text-base tracking-wide">VISION STATEMENT</span>
            </div>
            
            <div className="card-modern p-10 shadow-hover">
              <p className="text-xl text-foreground leading-relaxed font-medium">
                At ARET Environmental Services, our vision is to revolutionize the waste management landscape by 
                creating an ecosystem where efficiency, sustainability, and innovation converges. We aim to be the catalyst for change 
                in environmental stewardship, fostering a future in which communities and industries alike benefit from a 
                meticulously managed waste system that promotes a cleaner, healthier, and more sustainable environment. Our 
                forward-thinking approach drives us to evolve continuously and set new benchmarks in service 
                excellence, technology integration, and corporate responsibility.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="text-center animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
              <Target className="text-primary" size={24} />
              <span className="text-primary font-bold text-base tracking-wide">MISSION STATEMENT</span>
            </div>
            
            <div className="card-modern p-10 shadow-hover">
              <p className="text-xl text-foreground leading-relaxed mb-8 font-medium">
                Our mission is to provide exceptional waste management services that balance operational efficiency with 
                environmental responsibility. We are committed to:
              </p>
              
              <div className="text-left space-y-6 max-w-5xl mx-auto">
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                  <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                  <p className="text-foreground font-medium">
                    Delivering superior waste collection, disposal, and recycling services.
                  </p>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                  <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                  <p className="text-foreground font-medium">
                    Promoting sustainable practices that reduce landfill waste by 20% within the first two years.
                  </p>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                  <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                  <p className="text-foreground font-medium">
                    Exceeding customer expectations by achieving a minimum 90% satisfaction rate within the first year.
                  </p>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                  <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                  <p className="text-foreground font-medium">
                    Empowering our workforce through continuous training, robust performance reviews, and 
                    competitive compensation packages, including salary reviews twice in the first year and annually thereafter, 
                    along with bonus and rewards packages at the company's discretion.
                  </p>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                  <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                  <p className="text-foreground font-medium">
                    Upholding transparency, accountability, and ethical business practices across all levels of our 
                    organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;