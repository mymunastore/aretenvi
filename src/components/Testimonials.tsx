import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Bassey Emenyi",
    role: "Residential Client",
    location: "Uyo",
    rating: 5,
    text: "There have been no concerns regarding the pick-up schedule on our end. I must say your services are excellent. It is also worth noting that we received our monthly allocated garbage bags today (July/August). Great job, everyone, on the value-added service."
  },
  {
    name: "Mr. George Abiam",
    role: "Residential Client",
    location: "Uyo",
    rating: 5,
    text: "I'm delighted with the service provided by ARET Environmental Services. They picked up and disposed of refuse from my house last week in a timely and professional manner. Everything was done neatly and without any inconvenience. Great team, reliable service—highly recommended!"
  },
  {
    name: "Mrs. Dorathy Clement Praise",
    role: "Residential Client",
    location: "Uyo",
    rating: 5,
    text: "Thanks for your swift and efficient services."
  },
  {
    name: "Mr. Enyeokpon Inyang",
    role: "Residential Client",
    location: "Uyo",
    rating: 5,
    text: "Your service is excellent."
  },
];

interface TestimonialsProps {
  showTestimonials?: boolean;
}

const Testimonials = ({ showTestimonials = true }: TestimonialsProps) => {
  if (!showTestimonials) {
    return null;
  }

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-bounce-gentle"></div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-scale">
          <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
            <Star className="text-primary" size={24} />
            <span className="text-primary font-bold text-base tracking-wide">CLIENT TESTIMONIALS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight animate-fade-in-up">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto animate-fade-in-up font-medium leading-relaxed">
            Don't just take our word for it - hear from satisfied customers across Uyo 
            about their experience with ARET Environmental Services.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group card-modern hover:shadow-hover transition-all duration-700 hover:scale-105 animate-fade-in-scale relative"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <Quote size={48} className="text-primary" />
              </div>

              <div className="p-10">
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-primary text-primary" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground leading-relaxed mb-8 italic text-base font-medium">
                  "{testimonial.text}"
                </p>

                {/* Client Info */}
                <div className="text-left border-t border-border/20 pt-6">
                  <h4 className="font-bold text-foreground text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-base text-muted-foreground font-medium">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-primary font-semibold">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;