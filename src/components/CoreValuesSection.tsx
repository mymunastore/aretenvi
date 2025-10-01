import { Shield, Heart, Sparkles, Award } from "lucide-react";

const CoreValuesSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description: "We operate with unwavering honesty and ethical conduct. Integrity is the cornerstone of our relationships with employees, clients, partners, and stakeholders. We are committed to transparent practices, ensuring that every transaction and decision is made with the highest degree of professionalism and moral clarity.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Heart,
      title: "Customer Satisfaction",
      description: "Our clients are at the heart of our operations. We continuously strive to exceed expectations by delivering reliable and innovative waste management solutions. Our success is measured by the trust and satisfaction of our customers, and we invest in proactive service improvements and personalized support to maintain and grow these relationships.",
      gradient: "from-red-500 to-pink-600"
    },
    {
      icon: Sparkles,
      title: "Cleanliness & Care",
      description: "Environmental stewardship is a non-negotiable priority. We are committed to upholding the highest standards of cleanliness and care, both in our operational practices and in our interactions with the communities we serve. Every decision we make is designed to minimize our ecological footprint, promote recycling, and foster a safer environment for all.",
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary-glow rounded-full blur-3xl animate-bounce-gentle"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-accent rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-scale">
          <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
            <Award className="text-primary" size={24} />
            <span className="text-primary font-bold text-base tracking-wide">CORE VALUES</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight">
            Our <span className="text-gradient">Guiding Principles</span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            Our core values are the guiding principles that shape every decision and action within our organization
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {values.map((value, index) => (
            <div 
              key={index} 
              className="group relative card-modern hover:shadow-hover transition-all duration-700 hover:scale-105 animate-fade-in-scale"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
              
              <div className="p-10 text-center relative z-10">
                {/* Icon with Animated Background */}
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className={`relative bg-gradient-to-br ${value.gradient} p-6 rounded-3xl w-24 h-24 mx-auto flex items-center justify-center shadow-card group-hover:shadow-hover transition-all duration-500`}>
                    <value.icon className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-black text-foreground mb-6 group-hover:text-primary transition-colors duration-300 tracking-tight">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-base font-medium">
                  {value.description}
                </p>

                {/* Animated Border */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors duration-500`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-20 animate-fade-in-scale" style={{ animationDelay: '0.8s' }}>
          <div className="card-modern p-8 max-w-2xl mx-auto shadow-hover">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Experience Our Values in Action
            </h3>
            <p className="text-muted-foreground mb-6 font-medium">
              Ready to partner with a company that puts integrity, satisfaction, and environmental care first?
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-modern"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreValuesSection;