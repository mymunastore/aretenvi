import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ConversationManager, ConversationStep } from "./conversation-manager.ts";
import { ValidationEngine } from "./validation.ts";
import { MessageTemplates, ConversationData } from "./messages.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WhatsAppWebhookPayload {
  From: string;
  Body: string;
  MessageSid?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const conversationManager = new ConversationManager(supabase);

    const contentType = req.headers.get("content-type");
    let payload: WhatsAppWebhookPayload;

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = {
        From: formData.get("From") as string,
        Body: formData.get("Body") as string,
        MessageSid: formData.get("MessageSid") as string,
      };
    } else {
      payload = await req.json();
    }

    const { From: from, Body: message } = payload;

    if (!from || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const whatsappNumber = from.replace("whatsapp:", "");
    const normalizedMessage = message.trim().toLowerCase();

    let state = await conversationManager.getState(whatsappNumber);

    if (!state && (normalizedMessage === "yes" || normalizedMessage === "start")) {
      state = await conversationManager.createState(whatsappNumber, "collect_name");
      const response = MessageTemplates.askName();
      return createTwiMLResponse(response);
    }

    if (normalizedMessage === "help") {
      const response = MessageTemplates.help();
      return createTwiMLResponse(response);
    }

    if (!state) {
      const response = MessageTemplates.welcome();
      await conversationManager.createState(whatsappNumber, "welcome");
      return createTwiMLResponse(response);
    }

    const response = await processMessage(
      state.current_step,
      message,
      state.collected_data,
      conversationManager,
      whatsappNumber
    );

    return createTwiMLResponse(response);

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processMessage(
  step: ConversationStep,
  message: string,
  collectedData: ConversationData,
  manager: ConversationManager,
  whatsappNumber: string
): Promise<string> {
  const normalizedMessage = message.trim();

  switch (step) {
    case "welcome": {
      if (normalizedMessage.toLowerCase() === "yes") {
        await manager.updateState(whatsappNumber, "collect_name");
        return MessageTemplates.askName();
      }
      return MessageTemplates.welcome();
    }

    case "collect_name": {
      const validation = ValidationEngine.validateName(normalizedMessage);
      if (!validation.valid) {
        return validation.error!;
      }
      await manager.updateState(whatsappNumber, "collect_email", {
        full_name: normalizedMessage,
      });
      return MessageTemplates.askEmail(normalizedMessage);
    }

    case "collect_email": {
      const validation = ValidationEngine.validateEmail(normalizedMessage);
      if (!validation.valid) {
        return validation.error!;
      }
      await manager.updateState(whatsappNumber, "collect_phone", {
        email: normalizedMessage,
      });
      return MessageTemplates.askPhone();
    }

    case "collect_phone": {
      const validation = ValidationEngine.validatePhone(normalizedMessage);
      if (!validation.valid) {
        return validation.error!;
      }
      const normalizedPhone = ValidationEngine.normalizePhone(normalizedMessage);
      await manager.updateState(whatsappNumber, "collect_service", {
        phone: normalizedPhone,
      });
      return MessageTemplates.askServiceType();
    }

    case "collect_service": {
      const validation = ValidationEngine.validateChoice(
        normalizedMessage,
        MessageTemplates.serviceOptions
      );
      if (!validation.valid) {
        return validation.error!;
      }
      await manager.updateState(whatsappNumber, "collect_property", {
        service_type: validation.normalized,
      });
      return MessageTemplates.askPropertyType();
    }

    case "collect_property": {
      const validation = ValidationEngine.validateChoice(
        normalizedMessage,
        MessageTemplates.propertyOptions
      );
      if (!validation.valid) {
        return validation.error!;
      }
      await manager.updateState(whatsappNumber, "collect_location", {
        property_type: validation.normalized,
      });
      return MessageTemplates.askLocation();
    }

    case "collect_location": {
      if (normalizedMessage.length < 5) {
        return "Please provide a more detailed location/address.";
      }
      await manager.updateState(whatsappNumber, "collect_time", {
        location: normalizedMessage,
      });
      return MessageTemplates.askContactTime();
    }

    case "collect_time": {
      const validation = ValidationEngine.validateChoice(
        normalizedMessage,
        MessageTemplates.contactTimeOptions
      );
      if (!validation.valid) {
        return validation.error!;
      }
      await manager.updateState(whatsappNumber, "collect_comments", {
        preferred_contact_time: validation.normalized,
      });
      return MessageTemplates.askComments();
    }

    case "collect_comments": {
      const comments =
        normalizedMessage.toLowerCase() === "skip"
          ? undefined
          : normalizedMessage;
      const state = await manager.getState(whatsappNumber);
      const updatedData = { ...state!.collected_data, additional_comments: comments };
      await manager.updateState(whatsappNumber, "confirmation", {
        additional_comments: comments,
      });
      return MessageTemplates.confirmation(updatedData);
    }

    case "confirmation": {
      if (normalizedMessage.toLowerCase() === "yes") {
        const state = await manager.getState(whatsappNumber);
        const referenceNumber = await manager.saveRegistration(
          state!.collected_data
        );

        if (!referenceNumber) {
          return MessageTemplates.error();
        }

        await manager.completeSession(whatsappNumber, referenceNumber);

        const customerCareNumber = "+2349152870616";
        const careNotification = MessageTemplates.customerCareNotification(
          state!.collected_data,
          referenceNumber
        );

        return MessageTemplates.success(
          state!.collected_data.full_name || "Client",
          referenceNumber
        );
      } else if (normalizedMessage.toLowerCase() === "edit") {
        return "To edit your information, please start over by typing 'Start'";
      }
      return "Please reply 'Yes' to confirm or 'Edit' to make changes.";
    }

    default:
      return MessageTemplates.welcome();
  }
}

function createTwiMLResponse(message: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/xml",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}