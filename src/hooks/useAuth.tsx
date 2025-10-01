import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { auth, customers, type Customer } from '@/lib/supabase';

interface SignUpData {
  full_name: string;
  phone: string;
  address?: string;
}

interface AuthResponse {
  data: { user: User | null; session: Session | null } | null;
  error: AuthError | null;
}

interface UpdateResponse {
  data: Customer | null;
  error: Error | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  customer: Customer | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateCustomer: (updates: Partial<Customer>) => Promise<UpdateResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user: currentUser } = await auth.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Get customer profile
        const { data: customerData } = await customers.getByUserId(currentUser.id);
        setCustomer(customerData);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Get or create customer profile
        const { data: customerData, error } = await customers.getByUserId(session.user.id);
        
        if (error && error.code === 'PGRST116') {
          // Customer doesn't exist, create one
          const { data: newCustomer } = await customers.create({
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name || '',
            email: session.user.email || '',
            phone: session.user.user_metadata?.phone || '',
            address: session.user.user_metadata?.address || '',
            customer_type: 'residential'
          });
          setCustomer(newCustomer);
        } else {
          setCustomer(customerData);
        }
      } else {
        setCustomer(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    setLoading(true);
    try {
      const result = await auth.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await auth.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await auth.signOut();
      setUser(null);
      setSession(null);
      setCustomer(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (updates: Partial<Customer>) => {
    if (!customer) return { error: 'No customer profile found' };
    
    const { data, error } = await customers.update(customer.id, updates);
    if (data) {
      setCustomer(data);
    }
    return { data, error };
  };

  const value = {
    user,
    session,
    customer,
    loading,
    signUp,
    signIn,
    signOut,
    updateCustomer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};