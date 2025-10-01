import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, CreditCard, Calendar, MessageSquare, Settings, Phone, Mail, MapPin, CreditCard as Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CustomerDashboard from './CustomerDashboard';
import AIChat from './AIChat';

const CustomerPortal = () => {
  const { customer, updateCustomer, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: customer?.full_name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    postal_code: customer?.postal_code || ''
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const handleSaveProfile = async () => {
    try {
      await updateCustomer(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please log in to access the customer portal.</p>
            <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ARET Customer Portal</h1>
            <p className="opacity-90">Manage your waste management services</p>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <tab.icon size={20} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && <CustomerDashboard />}
            
            {activeTab === 'profile' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Profile
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Full Name</label>
                          <Input
                            value={editForm.full_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            value={editForm.phone}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Address</label>
                          <Textarea
                            value={editForm.address}
                            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">City</label>
                          <Input
                            value={editForm.city}
                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Postal Code</label>
                          <Input
                            value={editForm.postal_code}
                            onChange={(e) => setEditForm(prev => ({ ...prev, postal_code: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-medium">{customer.full_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{customer.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Customer Type</p>
                            <Badge variant="outline">{customer.customer_type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{customer.address}</p>
                            <p className="text-sm text-muted-foreground">{customer.city}, {customer.state} {customer.postal_code}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Billing features will be available soon. For billing inquiries, please contact our support team.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'support' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Customer Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => setShowAIChat(true)}
                      className="h-16 flex flex-col items-center justify-center"
                    >
                      <MessageSquare className="h-6 w-6 mb-1" />
                      AI Chat Support
                    </Button>
                    <Button 
                      variant="outline"
                      asChild
                      className="h-16 flex flex-col items-center justify-center"
                    >
                      <a href="tel:09152870616">
                        <Phone className="h-6 w-6 mb-1" />
                        Call Support
                      </a>
                    </Button>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Support Hours</p>
                    <p className="font-medium">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="font-medium">Saturday: 10:00 AM - 2:30 PM</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Account settings will be available soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* AI Chat Component */}
      <AIChat
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        isMinimized={isChatMinimized}
      />

      {/* Floating AI Chat Button */}
      {!showAIChat && (
        <Button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default CustomerPortal;