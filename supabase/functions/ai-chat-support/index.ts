import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  sessionId: string;
  message: string;
  customerId?: string;
}

// Simple AI responses for waste management queries
const generateAIResponse = (message: string): { response: string; intent: string; confidence: number } => {
  const lowerMessage = message.toLowerCase();
  
  // Intent detection and responses
  if (lowerMessage.includes('schedule') || lowerMessage.includes('pickup') || lowerMessage.includes('collection')) {
    return {
      response: "Our waste collection is scheduled every Saturday from 10:00 AM to 2:30 PM. You can check your specific pickup time in your customer portal or contact us at 09152870616 for more details.",
      intent: 'schedule_inquiry',
      confidence: 0.95
    };
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('subscription')) {
    return {
      response: "We offer three main plans: Subscription Plan (₦15,000/month), Premium Plan (₦25,000/month), and Enterprise Plan (₦50,000/month). Each plan includes different services and collection frequencies. Would you like me to explain the differences?",
      intent: 'pricing_inquiry',
      confidence: 0.90
    };
  }
  
  if (lowerMessage.includes('recycle') || lowerMessage.includes('recycling')) {
    return {
      response: "Yes! We offer comprehensive recycling services. Our Premium and Enterprise plans include segregated waste collection for recyclable materials. We help reduce your environmental impact by properly processing plastic, paper, glass, and metal waste.",
      intent: 'recycling_inquiry',
      confidence: 0.92
    };
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('immediate')) {
    return {
      response: "For emergency waste collection services, please call our operations line at 09152870617. We can arrange special pickups for urgent situations. Regular complaints and incidents can be reported at 09152870618.",
      intent: 'emergency_request',
      confidence: 0.88
    };
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('address')) {
    return {
      response: "You can reach us at: Phone: 09152870616 (Front Desk), Email: info@aret-environmental-ng.com, Address: No. 576 Oron Road, Uyo, Akwa Ibom State. Our business hours are Monday-Friday 9:00 AM - 5:00 PM, Saturday 10:00 AM - 2:30 PM.",
      intent: 'contact_inquiry',
      confidence: 0.95
    };
  }
  
  if (lowerMessage.includes('carbon') || lowerMessage.includes('environment') || lowerMessage.includes('footprint')) {
    return {
      response: "We're committed to reducing environmental impact! Our services can help reduce your carbon footprint by up to 30% through proper recycling and waste management. We also provide environmental reports showing your sustainability metrics.",
      intent: 'environmental_inquiry',
      confidence: 0.87
    };
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      response: "Hello! Welcome to ARET Environmental Services. I'm here to help you with any questions about our waste management services. How can I assist you today?",
      intent: 'greeting',
      confidence: 0.98
    };
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return {
      response: "You're welcome! Is there anything else I can help you with regarding our waste management services?",
      intent: 'gratitude',
      confidence: 0.95
    };
  }
  
  // Default response
  return {
    response: "Thank you for contacting ARET Environmental Services. I'd be happy to help you with information about our waste collection, recycling services, or subscription plans. For specific account inquiries, please call 09152870616 or email info@aret-environmental-ng.com.",
    intent: 'general_inquiry',
    confidence: 0.70
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, message, customerId }: ChatMessage = await req.json();

    // Generate AI response
    const { response, intent, confidence } = generateAIResponse(message);

    // Store the AI response message
    const { error: messageError } = await supabaseClient
      .from('ai_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: 'ai',
        content: response,
        intent,
        confidence,
        response_time_ms: 150 // Simulated response time
      });

    if (messageError) {
      throw messageError;
    }

    // Update session with last activity
    await supabaseClient
      .from('ai_chat_sessions')
      .update({ 
        updated_at: new Date().toISOString(),
        conversation_summary: `Latest topic: ${intent}`
      })
      .eq('session_id', sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        response,
        intent,
        confidence
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in AI chat support:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process chat message'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});