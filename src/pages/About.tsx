import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recycle, RotateCcw, Minus, ArrowRight, Shield, Clock, Heart, Users, Leaf, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import about3Rs from "@/assets/about-3rs.jpg";

const principles = [
  {
    icon: Heart,
    title: "ARET Cares",
    description: "Like a nurturing mother, ARET Environmental Services cares for our community and environment with dedication and love.",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Community Education",
    description: "We educate and empower our community to make environmentally conscious decisions for a sustainable future.",
    color: "text-accent",
  },
  {
    icon: Leaf,
    title: "Environmental Stewardship",
    description: "Our commitment to protecting and preserving the environment guides every aspect of our operations.",
    color: "text-primary-glow",
  },
];

const About = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Button 
            onClick={goBack}
            variant="outline"
            className="mb-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            About <span className="text-accent">ARET</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl">
            Learn more about our mission, values, and commitment to sustainable waste management solutions.
          </p>
        </div>
      </div>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content Side - CEO Welcome Message */}
            <div>
              <div className="mb-6">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Welcome Message <span className="text-primary">From The CEO</span>
                </h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  Dear valued customers and community members, As the CEO of our waste collection and disposal company, I am 
                  honoured to extend a warm welcome to you. Our organization is deeply committed to providing exceptional service 
                  while prioritizing the well-being of our community and the environment. We understand that effective waste 
                  management is crucial not only for maintaining cleanliness but also for fostering a sustainable future.
                </p>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Our Commitment to You:</h3>
                  <div className="space-y-3">
                    <p>
                      <strong className="text-foreground">Customer Satisfaction:</strong> We strive to deliver reliable, efficient, and 
                      personalized waste management solutions tailored to your needs. Whether you are a residential, commercial, or 
                      industrial client, we are dedicated to ensuring your satisfaction and peace of mind.
                    </p>
                    <p>
                      <strong className="text-foreground">Community Engagement:</strong> We believe in being an active and responsible 
                      member of our community. Through partnerships with local organizations and initiatives, we aim to contribute 
                      positively to environmental conservation and social welfare.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Sustainability:</h3>
                  <p>
                    Our operations are guided by a strong sustainability framework. We aim to invest in innovative technologies and 
                    practices that minimize waste, promote recycling, and reduce our environmental footprint. Our goal is to support 
                    a circular economy where resources are valued and utilized responsibly.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Looking Forward:</h3>
                  <p>
                    As we continue to grow and evolve, we remain steadfast in our commitment to you and our community. We are excited 
                    about the opportunities ahead to enhance our services, expand our sustainability initiatives, and make a lasting impact.
                  </p>
                  <p>
                    Thank you for choosing us as your waste management partner. We look forward to working together to create a cleaner, 
                    greener future for everyone.
                  </p>
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-foreground font-medium">Warm regards,</p>
                  <p className="text-primary font-bold">CEO, ARET Environmental Services</p>
                </div>
              </div>

              <Button className="mt-8 bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 hover:scale-105">
                Learn More About Our Mission
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>

            {/* Visual Section with ARET Cares Cards */}
            <div className="space-y-6">
              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden mb-8">
                <img 
                  src={about3Rs} 
                  alt="ARET Environmental Services - Caring for Community and Environment"
                  className="w-full h-64 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-primary-foreground">
                    ARET Cares
                  </h3>
                  <p className="text-primary-foreground/90 text-sm">
                    Nurturing our community like a caring mother
                  </p>
                </div>
              </div>

              {/* ARET Cares Cards */}
              {principles.map((principle, index) => (
                <Card key={index} className="group hover:shadow-elegant transition-all duration-300 border-0 bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-primary p-3 rounded-xl group-hover:shadow-glow transition-all duration-300">
                        <principle.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          {principle.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Core Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do at ARET Environmental Services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-8 hover:shadow-elegant transition-all duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Integrity</h3>
              <p className="text-muted-foreground">
                We conduct our business with honesty, transparency, and ethical practices in all our interactions.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-elegant transition-all duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Customer Satisfaction</h3>
              <p className="text-muted-foreground">
                We are committed to exceeding client expectations through reliable and personalized service delivery.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-elegant transition-all duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Environmental Care</h3>
              <p className="text-muted-foreground">
                We prioritize environmental stewardship and sustainable practices in all our operations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-elegant transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To provide exceptional waste management services that protect our environment, 
                serve our community, and promote sustainable practices. We are committed to 
                being the trusted partner for all waste management needs in Akwa Ibom State.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-elegant transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To be the leading environmental services company in Nigeria, recognized for 
                our innovation, sustainability, and positive impact on communities. We envision 
                a cleaner, greener future where waste becomes a resource.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;