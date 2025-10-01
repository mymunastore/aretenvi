import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, CircleHelp as HelpCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQProps {
  showFAQ?: boolean;
}

const FAQ = ({ showFAQ = true }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    // General Information
    {
      category: "General Information",
      question: "What does ARET Environmental Services do?",
      answer: "ARET Environmental Services provides comprehensive waste collection, disposal, and recycling solutions for households, commercial establishments, and institutions. We also offer specialized services for general waste, construction debris, and event-specific waste management, all while prioritizing sustainability and environmental responsibility."
    },
    {
      category: "General Information", 
      question: "Where is ARET Environmental Services located?",
      answer: "Our office is at No. 576 Oron Road, Uyo, Akwa Ibom State, Nigeria."
    },
    {
      category: "General Information",
      question: "What are ARET's core values?",
      answer: "We operate on three core values: Integrity (honesty and ethical conduct), Customer Satisfaction (exceeding client expectations), and Cleanliness & Care (environmental stewardship and community well-being)."
    },
    
    // Service Offerings
    {
      category: "Service Offerings",
      question: "What types of waste do you collect?",
      answer: "We collect general, recyclable, hazardous, and construction waste from residential, commercial, and institutional clients."
    },
    {
      category: "Service Offerings",
      question: "Do you offer recycling services?",
      answer: "Yes, we actively promote recycling by efficiently segregating and processing recyclable materials, which supports a circular economy and reduces our reliance on landfills."
    },
    {
      category: "Service Offerings",
      question: "Can you customize services for large businesses?",
      answer: "Absolutely. We develop tailored waste management plans for corporate clients, assign dedicated account managers, and conduct regular service reviews to ensure your needs are met."
    },
    {
      category: "Service Offerings",
      question: "How is the waste collected?",
      answer: "By the bagged method."
    },
    {
      category: "Service Offerings",
      question: "What days are scheduled for pickup?",
      answer: "Clients are mapped out to zones, and each zone has a designated day."
    },

    // Client Portal & Account Management
    {
      category: "Client Portal & Account Management",
      question: "What is the Zoho Client Profile Portal?",
      answer: "This secure online portal provides clients with 24/7 access to update their contact information, view contracts and invoices, access reports, and communicate directly with our team in one convenient location."
    },
    {
      category: "Client Portal & Account Management",
      question: "How do I access the portal?",
      answer: "Clients receive access after providing a valid email address. If you haven't received your portal instructions, please get in touch with us to set up your profile."
    },
    {
      category: "Client Portal & Account Management",
      question: "What if my contact details change?",
      answer: "You can update your information directly through the portal or by contacting our office. Keeping your details current ensures you don't miss critical updates."
    },

    // Billing & Payments
    {
      category: "Billing & Payments",
      question: "How and when will I receive my invoices?",
      answer: "Invoices are accessible through the Zoho Client Profile Portal. You can view and download them at any time."
    },
    {
      category: "Billing & Payments",
      question: "What should I do if there's a billing error?",
      answer: "Contact our Client Relations Officer (CRO) immediately. Minor billing issues (Level 1 complaints) are typically resolved within one business day."
    },

    // Complaints & Feedback
    {
      category: "Complaints & Feedback",
      question: "How do I make a complaint?",
      answer: "You can submit complaints via phone, email, WhatsApp, written letter, or through the client portal. A dedicated complaints resolution line is also available: 08151324463 / 09152870617."
    },
    {
      category: "Complaints & Feedback",
      question: "How are complaints handled?",
      answer: "All complaints are logged and categorized (Level 1–4). The CRO acknowledges your complaint within 2 hours, assesses the issue, and assigns it to the appropriate team. Resolution timelines depend on the severity, ranging from one day (for minor issues) to a week (for significant/strategic issues)."
    },
    {
      category: "Complaints & Feedback",
      question: "Will I be updated on the progress of my complaints?",
      answer: "Yes, you'll receive an acknowledgment with a unique Complaint ID and regular updates until the issue is resolved."
    },
    {
      category: "Complaints & Feedback",
      question: "Can I provide general feedback?",
      answer: "Absolutely. We welcome all feedback, positive or constructive—through the portal, email, phone, or in person. Your input helps us improve our services."
    },

    // Health, Safety & Compliance
    {
      category: "Health, Safety & Compliance",
      question: "What safety measures do you have in place?",
      answer: "We enforce strict safety protocols, provide regular training, and maintain emergency response plans. All employees are equipped with safety gear, and incidents are promptly reported and reviewed."
    },
    {
      category: "Health, Safety & Compliance",
      question: "How do you handle incidents or accidents?",
      answer: "Any incident (injury, property damage, environmental hazard, equipment failure, etc.) must be reported using our Incident Report Form within 24 hours. Immediate corrective actions are taken, and root causes are analyzed to prevent recurrence."
    },
    {
      category: "Health, Safety & Compliance",
      question: "Are you compliant with environmental regulations?",
      answer: "Yes, we adhere to all local, state, and federal regulations. Compliance is monitored monthly, and any concerns are addressed immediately."
    },

    // Contact & Support
    {
      category: "Contact & Support",
      question: "How can I reach ARET Environmental Services?",
      answer: "Call us at 0915 287 0617 or 0915 287 0618, 09152870616. email info@aret-environmental-ng.com, use WhatsApp, or visit our office."
    },
    {
      category: "Contact & Support",
      question: "Who is my main point of contact?",
      answer: "For most issues, your first point of contact is the Client Relations Officer. For complex or recurring problems, issues are escalated to the General Manager, COO, or CEO as needed."
    }
  ];

  // Group FAQs by category
  const categories = [...new Set(faqData.map(item => item.category))];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-32 bg-gradient-subtle relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-80 h-80 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary-glow rounded-full blur-2xl animate-float"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-scale">
          <div className="inline-flex items-center gap-3 bg-primary/15 border-2 border-primary/30 rounded-full px-8 py-4 mb-10 shadow-card">
            <HelpCircle className="text-primary" size={24} />
            <span className="text-primary font-bold text-base tracking-wide">FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight">
            <span className="text-gradient">FAQ</span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 font-medium leading-relaxed">
            Find answers to common questions about our waste management services and processes.
          </p>
        </div>

        {/* FAQ Content - Conditionally Rendered */}
        {showFAQ ? (
          <div className="max-w-5xl mx-auto animate-fade-in-scale">
            {categories.map((category, categoryIndex) => (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b-2 border-primary/30 text-center">
                  {category}
                </h3>
                
                <div className="space-y-6">
                  {faqData
                    .filter(item => item.category === category)
                    .map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex; // Unique index
                      const isOpen = openIndex === globalIndex;
                      
                      return (
                        <div 
                          key={globalIndex}
                          className="card-modern shadow-card hover:shadow-hover transition-all duration-500"
                        >
                          <button
                            onClick={() => toggleFAQ(globalIndex)}
                            className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-primary/5 transition-colors rounded-2xl"
                          >
                            <span className="font-bold text-foreground pr-4 text-lg">
                              {faq.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="text-primary flex-shrink-0" size={24} />
                            ) : (
                              <ChevronDown className="text-primary flex-shrink-0" size={24} />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-8 pb-6">
                              <p className="text-foreground leading-relaxed text-base font-medium">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            <div className="text-center mt-16 animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
              <div className="card-modern p-10 shadow-hover">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Still Have Questions?
                </h3>
                <p className="text-muted-foreground mb-8 text-lg font-medium">
                  Our team is here to help with any additional questions you may have.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a 
                    href="tel:09152870616" 
                    className="btn-modern inline-flex items-center justify-center"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call: 09152870616
                  </a>
                  <a 
                    href="mailto:info@aret-environmental-ng.com" 
                    className="btn-modern bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground inline-flex items-center justify-center"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center animate-fade-in-scale">
            <div className="bg-card border border-border rounded-xl p-12 shadow-card">
              <HelpCircle className="mx-auto h-20 w-20 text-muted-foreground mb-6 opacity-50" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                FAQ Section Hidden
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                The FAQ section is currently hidden. Use the reviews toggle in the header to show customer testimonials instead, or contact us directly for immediate assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:09152870616" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call: 09152870616
                </a>
                <a 
                  href="mailto:info@aret-environmental-ng.com" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default FAQ;