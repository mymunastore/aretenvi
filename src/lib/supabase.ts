import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { Session, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SignUpData {
  full_name: string;
  phone: string;
  address?: string;
}

// Type definitions for our custom tables
export type Customer = Database['public']['Tables']['customers']['Row'];
export type ServicePlan = Database['public']['Tables']['service_plans']['Row'];
export type CustomerSubscription = Database['public']['Tables']['customer_subscriptions']['Row'];
export type WasteCollection = Database['public']['Tables']['waste_collections']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type EnvironmentalReport = Database['public']['Tables']['environmental_reports']['Row'];
export type AIRecommendation = Database['public']['Tables']['ai_recommendations']['Row'];

// Authentication helpers
export const auth = {
  signUp: async (email: string, password: string, userData: SignUpData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Customer management
export const customers = {
  create: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();
    return { data, error };
  },

  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// Service plans
export const servicePlans = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('service_plans')
      .select('*')
      .eq('active', true)
      .order('price_monthly');
    return { data, error };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('service_plans')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }
};

// Customer subscriptions
export const subscriptions = {
  create: async (subscriptionData: Omit<CustomerSubscription, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .insert(subscriptionData)
      .select(`
        *,
        service_plan:service_plans(*),
        customer:customers(*)
      `)
      .single();
    return { data, error };
  },

  getByCustomerId: async (customerId: string) => {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .select(`
        *,
        service_plan:service_plans(*),
        customer:customers(*)
      `)
      .eq('customer_id', customerId)
      .eq('status', 'active');
    return { data, error };
  },

  update: async (id: string, updates: Partial<CustomerSubscription>) => {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// Waste collections
export const collections = {
  getByCustomerId: async (customerId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('waste_collections')
      .select(`
        *,
        customer:customers(*),
        driver:drivers(*),
        vehicle:vehicles(*)
      `)
      .eq('customer_id', customerId)
      .order('scheduled_date', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  create: async (collectionData: Omit<WasteCollection, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('waste_collections')
      .insert(collectionData)
      .select()
      .single();
    return { data, error };
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const updates: Partial<WasteCollection> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updates.actual_collection_time = new Date().toISOString();
    }
    
    if (notes) {
      updates.notes = notes;
    }

    const { data, error } = await supabase
      .from('waste_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// Environmental reports
export const environmentalReports = {
  getByCustomerId: async (customerId: string) => {
    const { data, error } = await supabase
      .from('environmental_reports')
      .select('*')
      .eq('customer_id', customerId)
      .order('report_period_end', { ascending: false });
    return { data, error };
  },

  generateReport: async (customerId: string, startDate: string, endDate: string) => {
    // This would typically call a Supabase Edge Function to generate the report
    const { data, error } = await supabase.functions.invoke('generate-environmental-report', {
      body: { customerId, startDate, endDate }
    });
    return { data, error };
  }
};

// AI recommendations
export const aiRecommendations = {
  getByCustomerId: async (customerId: string) => {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .order('priority', { ascending: false });
    return { data, error };
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// Carbon footprint calculation
export const carbonFootprint = {
  calculate: async (wasteAmount: number, wasteType: string, frequency: string) => {
    const { data, error } = await supabase.rpc('calculate_carbon_footprint', {
      waste_amount: wasteAmount,
      waste_type_param: wasteType,
      frequency_param: frequency
    });
    return { data, error };
  }
};

// Real-time subscriptions
export const realtime = {
  subscribeToCollections: (customerId: string, callback: (payload: RealtimePostgresChangesPayload<WasteCollection>) => void) => {
    return supabase
      .channel('waste-collections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waste_collections',
          filter: `customer_id=eq.${customerId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToRecommendations: (customerId: string, callback: (payload: RealtimePostgresChangesPayload<AIRecommendation>) => void) => {
    return supabase
      .channel('ai-recommendations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_recommendations',
          filter: `customer_id=eq.${customerId}`
        },
        callback
      )
      .subscribe();
  }
};

export { supabase };