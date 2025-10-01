export interface ConversationData {
  full_name?: string;
  email?: string;
  phone?: string;
  service_type?: string;
  property_type?: string;
  location?: string;
  preferred_contact_time?: string;
  additional_comments?: string;
}

export class MessageTemplates {
  static welcome(): string {
    return `👋 Welcome to ARET Environmental Services!

I'm here to help you get started with our professional waste management solutions.

I'll need to collect some information to match you with the perfect service. This will only take 2 minutes.

Ready to begin? Reply with "Yes" to continue or "Help" if you have questions.`;
  }

  static help(): string {
    return `📞 ARET Environmental Services Help

I can help you register for our services by collecting:
• Your contact information
• Service preferences
• Property details
• Location

At any time, you can:
• Type "Start" to begin registration
• Type "Help" for this message
• Call us at 09152870616
• Visit our website

Ready to start? Reply "Yes"`;
  }

  static askName(): string {
    return `Great! Let's start.

📝 What is your full name?`;
  }

  static askEmail(name: string): string {
    return `Thank you, ${name}!

📧 What is your email address?
(We'll send your service confirmation here)`;
  }

  static askPhone(): string {
    return `Perfect!

📱 What is your phone number?
(In case we need to reach you quickly)`;
  }

  static askServiceType(): string {
    return `Excellent!

🌱 Which service are you interested in?

1️⃣ Residential Waste Collection
2️⃣ Commercial Waste Management
3️⃣ Recycling Services
4️⃣ Emergency Cleanup
5️⃣ Skip Hire Services
6️⃣ Other (please specify)

Reply with the number or service name.`;
  }

  static askPropertyType(): string {
    return `Got it!

🏠 What type of property is this for?

1️⃣ Residential
2️⃣ Commercial
3️⃣ Industrial

Reply with the number or property type.`;
  }

  static askLocation(): string {
    return `Thanks!

📍 What is your location/address in Uyo, Akwa Ibom State?
(This helps us plan the best service route)`;
  }

  static askContactTime(): string {
    return `Almost done!

⏰ When is the best time to reach you?

1️⃣ Morning (9AM-12PM)
2️⃣ Afternoon (12PM-3PM)
3️⃣ Evening (3PM-5PM)

Reply with the number or time preference.`;
  }

  static askComments(): string {
    return `Great!

💬 Do you have any additional comments or special requirements?
(Or type "Skip" to continue)`;
  }

  static confirmation(data: ConversationData): string {
    return `Perfect! Let me confirm your information:

👤 Name: ${data.full_name}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
🌱 Service: ${data.service_type}
🏠 Property: ${data.property_type}
📍 Location: ${data.location}
⏰ Contact Time: ${data.preferred_contact_time}
💬 Comments: ${data.additional_comments || "None"}

Is this information correct?
Reply "Yes" to confirm or "Edit" to make changes.`;
  }

  static success(name: string, referenceNumber: string): string {
    return `✅ Registration Complete!

Thank you, ${name}! Your information has been received.

📋 Reference Number: ${referenceNumber}

🎯 What happens next?
• Our customer care team will review your request
• You'll receive a personalized quote within 24 hours
• We'll contact you at your preferred time

⚡ Transferring you to our customer care team now...

A team member will be with you shortly to discuss your specific needs!`;
  }

  static error(): string {
    return `⚠️ We're experiencing a technical issue.

Don't worry! Your information is saved.

Please try again in a moment, or call us directly at:
📞 09152870616

We apologize for the inconvenience.`;
  }

  static timeout(): string {
    return `⏰ Your session has expired due to inactivity.

Would you like to:
1️⃣ Start a new registration
2️⃣ Speak to customer care

Reply with 1 or 2.`;
  }

  static customerCareNotification(data: ConversationData, referenceNumber: string): string {
    const timestamp = new Date().toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return `🆕 NEW CLIENT REGISTRATION

📋 Ref: ${referenceNumber}

👤 Client: ${data.full_name}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
🌱 Service: ${data.service_type}
🏠 Property: ${data.property_type}
📍 Location: ${data.location}
⏰ Preferred Time: ${data.preferred_contact_time}
💬 Comments: ${data.additional_comments || "None"}

🕐 Registered: ${timestamp}

👉 Please contact this client to provide a quote and schedule service.`;
  }

  static serviceOptions = [
    "Residential Waste Collection",
    "Commercial Waste Management",
    "Recycling Services",
    "Emergency Cleanup",
    "Skip Hire Services",
    "Other"
  ];

  static propertyOptions = [
    "Residential",
    "Commercial",
    "Industrial"
  ];

  static contactTimeOptions = [
    "Morning (9AM-12PM)",
    "Afternoon (12PM-3PM)",
    "Evening (3PM-5PM)"
  ];
}