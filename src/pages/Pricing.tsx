import { Check, Star, Building, Chrome as Home, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Subscription Plan",
      icon: <Home className="text-primary" size={32} />,
      description: "Perfect for regular residential and small commercial needs",
      benefits: [
        "Frequency: Weekly general waste collection",
        "Services: General waste collection", 
        "Schedule: Saturday service from 10 AM to 2:30 PM",
        "Cost: Competitive pricing based on market rates"
      ],
      popular: false,
      buttonText: "Choose Subscription",
      buttonStyle: "outline"
    },
    {
      name: "Premium Plan", 
      icon: <Star className="text-primary" size={32} />,
      description: "Enhanced service for environmentally conscious clients",
      benefits: [
        "Frequency: Weekly and bi-weekly pickup options",
        "Services: Segregated waste collection, recyclable materials",
        "Schedule: Saturday service from 10 AM to 2:30 PM",
        "Cost: Higher than the subscription plan due to specialized services"
      ],
      popular: true,
      buttonText: "Choose Premium",
      buttonStyle: "default"
    },
    {
      name: "Enterprise Plan",
      icon: <Building className="text-primary" size={32} />,
      description: "Comprehensive solution for large-scale operations", 
      benefits: [
        "Frequency: Daily pickup services available",
        "Services: Comprehensive waste management solutions including composting, recycling and disposal services",
        "Schedule: Flexible scheduling based on client needs",
        "Cost: Negotiable based on volume and specific requirements"
      ],
      popular: false,
      buttonText: "Choose Enterprise", 
      buttonStyle: "outline"
    }
  ];

  const whoWeServe = [
    {
      title: "Residential & Commercial Clients",
      description: "We offer separate plans for residential and commercial clients, considering their different waste generation patterns and needs.",
      icon: "🏠"
    },
    {
      title: "Industrial Clients", 
      description: "We cater to developing tailored plans to suit clients requirements e.g construction sites etc.",
      icon: "🏭"
    }
  ];

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
            Subscription <span className="text-accent">Plans</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl">
            Choose the perfect plan for your waste management needs. All plans include professional waste collection services.
          </p>
        </div>
      </div>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Pickup Schedule Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="text-primary" size={24} />
              <h3 className="text-xl font-bold text-foreground">Pickup Schedule</h3>
            </div>
            <p className="text-muted-foreground">
              <strong>Saturday Service:</strong> 10:00 AM - 2:30 PM
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please ensure your waste is ready for collection during these hours
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 ${
                  plan.popular ? 'border-primary shadow-glow scale-105' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-foreground">Plan Benefits:</h4>
                  {plan.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-start gap-3">
                      <Check className="text-primary flex-shrink-0 mt-1" size={16} />
                      <span className="text-muted-foreground text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full"
                  variant={plan.buttonStyle === 'outline' ? 'outline' : 'default'}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>

          {/* Additional Services */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Who We Serve</h3>
              <p className="text-muted-foreground">
                Our services are designed to meet the diverse needs of different client segments
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {whoWeServe.map((service, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">{service.icon}</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{service.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 max-w-2xl mx-auto">
              <h4 className="text-xl font-bold text-foreground mb-4">
                Need Help Choosing?
              </h4>
              <p className="text-muted-foreground mb-6">
                Contact our team to discuss the best plan for your specific needs or to create a customized solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="tel:07032224738">Call Us: 07032224738</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:info@aret-environmental-ng.com">Email Us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;