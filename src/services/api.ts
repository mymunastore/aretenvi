import { supabase } from '@/integrations/supabase/client';
import { queueAction } from '@/lib/offlineStorage';
import { logError } from '@/lib/errorTracking';

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

class ApiService {
  private async handleRequest<T>(
    request: () => Promise<{ data: T | null; error: any }>,
    offlineAction?: { type: string; payload: any }
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await request();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      if (!navigator.onLine && offlineAction) {
        await queueAction(offlineAction.type, offlineAction.payload);
        return { data: null, error: new Error('Queued for offline sync') };
      }

      logError(error, { context: 'API Request Failed' });
      return { data: null, error };
    }
  }

  async getCustomer(userId: string) {
    return this.handleRequest(() =>
      supabase.from('customers').select('*').eq('user_id', userId).maybeSingle()
    );
  }

  async updateCustomer(id: string, updates: any) {
    return this.handleRequest(
      () => supabase.from('customers').update(updates).eq('id', id).select().single(),
      { type: 'UPDATE_CUSTOMER', payload: { id, data: updates } }
    );
  }

  async getCollections(customerId: string, limit = 10) {
    return this.handleRequest(() =>
      supabase
        .from('waste_collections')
        .select('*')
        .eq('customer_id', customerId)
        .order('scheduled_date', { ascending: false })
        .limit(limit)
    );
  }

  async createCollection(data: any) {
    return this.handleRequest(
      () => supabase.from('waste_collections').insert(data).select().single(),
      { type: 'CREATE_COLLECTION', payload: data }
    );
  }

  async updateCollectionStatus(id: string, status: string, notes?: string) {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.actual_collection_time = new Date().toISOString();
    }

    if (notes) {
      updates.notes = notes;
    }

    return this.handleRequest(
      () => supabase.from('waste_collections').update(updates).eq('id', id).select().single(),
      { type: 'UPDATE_COLLECTION', payload: { id, data: updates } }
    );
  }

  async getServicePlans() {
    return this.handleRequest(() =>
      supabase.from('service_plans').select('*').eq('active', true)
    );
  }

  async getActiveSubscription(customerId: string) {
    return this.handleRequest(() =>
      supabase
        .from('customer_subscriptions')
        .select('*, service_plan:service_plans(*)')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .maybeSingle()
    );
  }

  async getEnvironmentalReports(customerId: string, limit = 5) {
    return this.handleRequest(() =>
      supabase
        .from('environmental_reports')
        .select('*')
        .eq('customer_id', customerId)
        .order('report_date', { ascending: false })
        .limit(limit)
    );
  }

  async getRecommendations(customerId: string, limit = 5) {
    return this.handleRequest(() =>
      supabase
        .from('ai_recommendations')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  }

  async submitFeedback(data: { customer_id: string; rating: number; message: string; category?: string }) {
    return this.handleRequest(
      () => supabase.from('feedback').insert(data).select().single(),
      { type: 'CREATE_FEEDBACK', payload: data }
    );
  }

  async getInvoices(customerId: string, limit = 10) {
    return this.handleRequest(() =>
      supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId)
        .order('issue_date', { ascending: false })
        .limit(limit)
    );
  }

  async getPayments(customerId: string, limit = 10) {
    return this.handleRequest(() =>
      supabase
        .from('payments')
        .select('*, invoice:invoices(*)')
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false })
        .limit(limit)
    );
  }
}

export const apiService = new ApiService();