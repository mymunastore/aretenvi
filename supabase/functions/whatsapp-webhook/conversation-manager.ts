import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { ConversationData } from "./messages.ts";

export type ConversationStep =
  | "welcome"
  | "collect_name"
  | "collect_email"
  | "collect_phone"
  | "collect_service"
  | "collect_property"
  | "collect_location"
  | "collect_time"
  | "collect_comments"
  | "confirmation"
  | "completed";

export interface ConversationState {
  id: string;
  whatsapp_number: string;
  current_step: ConversationStep;
  collected_data: ConversationData;
  last_interaction: string;
  session_active: boolean;
  registration_id?: string;
}

export class ConversationManager {
  constructor(private supabase: SupabaseClient) {}

  async getState(whatsappNumber: string): Promise<ConversationState | null> {
    const { data, error } = await this.supabase
      .from("whatsapp_conversation_states")
      .select("*")
      .eq("whatsapp_number", whatsappNumber)
      .eq("session_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching conversation state:", error);
      return null;
    }

    return data;
  }

  async createState(
    whatsappNumber: string,
    initialStep: ConversationStep = "welcome"
  ): Promise<ConversationState | null> {
    const { data, error } = await this.supabase
      .from("whatsapp_conversation_states")
      .insert({
        whatsapp_number: whatsappNumber,
        current_step: initialStep,
        collected_data: {},
        session_active: true,
        last_interaction: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation state:", error);
      return null;
    }

    return data;
  }

  async updateState(
    whatsappNumber: string,
    step: ConversationStep,
    data?: Partial<ConversationData>
  ): Promise<boolean> {
    const currentState = await this.getState(whatsappNumber);
    if (!currentState) return false;

    const updatedData = data
      ? { ...currentState.collected_data, ...data }
      : currentState.collected_data;

    const { error } = await this.supabase
      .from("whatsapp_conversation_states")
      .update({
        current_step: step,
        collected_data: updatedData,
        last_interaction: new Date().toISOString()
      })
      .eq("id", currentState.id);

    if (error) {
      console.error("Error updating conversation state:", error);
      return false;
    }

    return true;
  }

  async completeSession(
    whatsappNumber: string,
    registrationId: string
  ): Promise<boolean> {
    const currentState = await this.getState(whatsappNumber);
    if (!currentState) return false;

    const { error } = await this.supabase
      .from("whatsapp_conversation_states")
      .update({
        session_active: false,
        registration_id: registrationId,
        last_interaction: new Date().toISOString()
      })
      .eq("id", currentState.id);

    if (error) {
      console.error("Error completing session:", error);
      return false;
    }

    return true;
  }

  async resetSession(whatsappNumber: string): Promise<boolean> {
    const currentState = await this.getState(whatsappNumber);
    if (!currentState) return false;

    const { error } = await this.supabase
      .from("whatsapp_conversation_states")
      .update({
        session_active: false,
        last_interaction: new Date().toISOString()
      })
      .eq("id", currentState.id);

    if (error) {
      console.error("Error resetting session:", error);
      return false;
    }

    return true;
  }

  async saveRegistration(data: ConversationData): Promise<string | null> {
    const { data: result, error: funcError } = await this.supabase
      .rpc("generate_reference_number");

    if (funcError) {
      console.error("Error generating reference number:", funcError);
      return null;
    }

    const referenceNumber = result as string;

    const { error: insertError } = await this.supabase
      .from("client_registrations")
      .insert({
        reference_number: referenceNumber,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        service_type: data.service_type,
        property_type: data.property_type,
        location: data.location,
        preferred_contact_time: data.preferred_contact_time,
        additional_comments: data.additional_comments,
        registration_source: "whatsapp_bot",
        status: "pending"
      });

    if (insertError) {
      console.error("Error saving registration:", insertError);
      return null;
    }

    return referenceNumber;
  }

  getNextStep(currentStep: ConversationStep): ConversationStep {
    const stepOrder: ConversationStep[] = [
      "welcome",
      "collect_name",
      "collect_email",
      "collect_phone",
      "collect_service",
      "collect_property",
      "collect_location",
      "collect_time",
      "collect_comments",
      "confirmation",
      "completed"
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
      return "completed";
    }

    return stepOrder[currentIndex + 1];
  }
}