import { Shield, Eye, TriangleAlert as AlertTriangle, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const policies = [
    {
      icon: <Eye className="text-primary" size={24} />,
      title: "Privacy Policy",
      content: [
        "At ARET Environmental Services, we are committed to safeguarding sensitive information. Our strict privacy policies cover the following:",
        "• Personal data of employees, clients, and partners",
        "• Confidential business strategies, financial records, and operational details", 
        "• Digital communications and electronic records",
        "Employees must handle all confidential information with discretion and comply with all applicable privacy laws and company guidelines. Breaches of confidentiality are taken very seriously and may result in immediate corrective actions, including potential termination."
      ]
    },
    {
      icon: <AlertTriangle className="text-primary" size={24} />,
      title: "Conflict of Interest Policy",
      content: [
        "A conflict of interest arises when personal interests interfere with professional obligations. To maintain the integrity of our operations, employees are required to:",
        "1. Disclose any potential conflicts of interest to their immediate supervisor or the HR Division",
        "2. Abstain from participating in any decision-making processes where personal interests may compromise objectivity",
        "3. Refrain from engaging in external business activities that directly compete with or undermine our corporate interests",
        "Failure to report or address conflicts of interest may lead to disciplinary action, including termination."
      ]
    },
    {
      icon: <Lock className="text-primary" size={24} />,
      title: "Data Security and Digital Ethics Policy", 
      content: [
        "In today's digital era, data security is paramount. Our policies ensure that:",
        "1. All digital communications, data storage, and online transactions are conducted using secure, company-approved systems",
        "2. Employees are trained in cybersecurity best practices to prevent unauthorized access and data breaches",
        "3. Any suspicious activity or potential threats to data security are immediately reported to the IT Department",
        "Digital ethics require that employees maintain professionalism online, ensuring that all interactions and shared content reflect our core values and corporate mission."
      ]
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
          <div className="flex items-center justify-center mb-4">
            <Shield className="text-primary-foreground mr-3" size={32} />
            <h1 className="text-4xl md:text-6xl font-bold">
              Privacy Policy & <span className="text-accent">Standards</span>
            </h1>
          </div>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto text-center">
            We maintain the highest standards of business ethics, data security, and professional conduct.
          </p>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 md:gap-12">
              {policies.map((policy, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      {policy.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {policy.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {policy.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Questions About Our Policies?
              </h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions about our privacy policies or data handling practices, please don't hesitate to contact us.
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

export default PrivacyPolicy;