# Integration Guide: Using PHP Backend with React Frontend

This guide explains how to integrate the PHP/MySQL backend with your existing React frontend.

## Overview

The PHP backend provides a REST API that mirrors the functionality of your Supabase implementation. You can switch between Supabase and PHP backends by changing the API endpoint configuration.

## Setup Steps

### 1. Configure Environment Variables

Add these variables to your React app's `.env` file:

```env
# Option to use PHP backend instead of Supabase
VITE_USE_PHP_BACKEND=true
VITE_PHP_API_URL=http://localhost:8000/api
```

### 2. Create API Adapter

Create a new file `src/lib/php-api.ts` to handle PHP backend communication:

```typescript
const API_URL = import.meta.env.VITE_PHP_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class PhpApi {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as T;
  }

  // Authentication
  async register(email: string, password: string, userData: {
    full_name: string;
    phone: string;
    address?: string;
  }) {
    const data = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Customers
  async getCustomerProfile() {
    return this.request<any>('/customers');
  }

  async updateCustomerProfile(updates: any) {
    return this.request<any>('/customers', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Service Plans
  async getServicePlans() {
    return this.request<any[]>('/service-plans');
  }

  async getServicePlan(id: string) {
    return this.request<any>(`/service-plans/${id}`);
  }

  // Subscriptions
  async getSubscriptions() {
    return this.request<any[]>('/subscriptions');
  }

  async createSubscription(data: any) {
    return this.request<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(id: string, updates: any) {
    return this.request<any>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Waste Collections
  async getCollections(limit = 10) {
    return this.request<any[]>(`/collections?limit=${limit}`);
  }

  async scheduleCollection(data: any) {
    return this.request<any>('/collections/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollectionStatus(id: string, status: string, notes?: string) {
    return this.request<any>(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }
}

export const phpApi = new PhpApi();
```

### 3. Update Authentication Hook

Modify `src/hooks/useAuth.tsx` to support both backends:

```typescript
import { phpApi } from '@/lib/php-api';

const usePhpBackend = import.meta.env.VITE_USE_PHP_BACKEND === 'true';

// In your signUp function:
if (usePhpBackend) {
  const { user, token } = await phpApi.register(email, password, {
    full_name: fullName,
    phone,
    address,
  });
  return { user, error: null };
} else {
  // Existing Supabase code
}

// Similar pattern for signIn, signOut, etc.
```

### 4. Update Service Functions

Modify your service functions in `src/lib/supabase.ts` to use the PHP API when configured:

```typescript
const usePhpBackend = import.meta.env.VITE_USE_PHP_BACKEND === 'true';

export const customers = {
  getByUserId: async (userId: string) => {
    if (usePhpBackend) {
      const data = await phpApi.getCustomerProfile();
      return { data, error: null };
    }
    // Existing Supabase code
  },

  update: async (id: string, updates: any) => {
    if (usePhpBackend) {
      const data = await phpApi.updateCustomerProfile(updates);
      return { data, error: null };
    }
    // Existing Supabase code
  },
};

// Similar pattern for other services
```

## Key Differences

### Authentication

**Supabase:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**PHP Backend:**
```typescript
const { user, token } = await phpApi.login(email, password);
// Token is stored automatically in localStorage
```

### Data Fetching

**Supabase:**
```typescript
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**PHP Backend:**
```typescript
const data = await phpApi.getCustomerProfile();
// Authentication is handled automatically via stored token
```

### Real-time Features

The PHP backend does not support real-time subscriptions like Supabase. For real-time features:

1. **Option A**: Implement polling
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const collections = await phpApi.getCollections();
    setCollections(collections);
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

2. **Option B**: Use WebSockets (requires additional PHP implementation)

3. **Option C**: Keep Supabase for real-time features and use PHP for other operations

## Testing the Integration

1. Start your PHP backend:
```bash
cd php-backend/public
php -S localhost:8000
```

2. Update your React app's `.env`:
```env
VITE_USE_PHP_BACKEND=true
VITE_PHP_API_URL=http://localhost:8000/api
```

3. Start your React app:
```bash
npm run dev
```

4. Test the following flows:
   - User registration
   - User login
   - Viewing service plans
   - Creating subscriptions
   - Scheduling collections

## Switching Between Backends

To switch between PHP and Supabase:

1. **Use PHP Backend:**
```env
VITE_USE_PHP_BACKEND=true
```

2. **Use Supabase:**
```env
VITE_USE_PHP_BACKEND=false
```

Or simply remove the variable to default to Supabase.

## Error Handling

Both backends return errors differently:

**Supabase:**
```typescript
const { data, error } = await supabase.from('table').select();
if (error) {
  console.error(error.message);
}
```

**PHP Backend:**
```typescript
try {
  const data = await phpApi.getServicePlans();
} catch (error) {
  console.error(error.message);
}
```

## Production Considerations

1. **HTTPS**: Always use HTTPS in production
2. **CORS**: Configure CORS_ORIGIN in PHP backend's `.env` to match your production domain
3. **Environment Variables**: Set proper production values
4. **Rate Limiting**: Implement rate limiting on the PHP backend
5. **Caching**: Consider adding Redis for caching frequently accessed data
6. **Load Balancing**: Use a load balancer for multiple PHP backend instances

## Troubleshooting

### CORS Issues
- Ensure `CORS_ORIGIN` in PHP backend matches your React app's URL
- Check that Apache's mod_headers is enabled

### Authentication Failures
- Verify JWT_SECRET is set in PHP backend
- Check token expiry time (JWT_EXPIRY)
- Ensure token is being stored and retrieved correctly

### Database Connection Issues
- Verify database credentials in `.env`
- Check MySQL is running
- Confirm database and tables are created

## Additional Features Not Implemented

The current PHP backend implements core features. Additional features that would require extra implementation:

1. Real-time subscriptions
2. File uploads/storage
3. Email notifications
4. Payment processing
5. Advanced analytics
6. AI recommendations (would need integration with external AI services)

These can be added as needed based on your requirements.
