import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Truck, Leaf, DollarSign, TrendingUp, Recycle, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { collections, environmentalReports, aiRecommendations, subscriptions, type WasteCollection, type EnvironmentalReport, type AIRecommendation, type CustomerSubscription } from '@/lib/supabase';

const CustomerDashboard = () => {
  const { customer } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState<CustomerSubscription | null>(null);
  const [recentCollections, setRecentCollections] = useState<WasteCollection[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalReport[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!customer) return;

    try {
      // Load subscription
      const { data: subscriptionData } = await subscriptions.getByCustomerId(customer.id);
      setActiveSubscription(subscriptionData?.[0] || null);

      // Load recent collections
      const { data: collectionsData } = await collections.getByCustomerId(customer.id, 5);
      setRecentCollections(collectionsData || []);

      // Load environmental reports
      const { data: reportsData } = await environmentalReports.getByCustomerId(customer.id);
      setEnvironmentalData(reportsData || []);

      // Load AI recommendations
      const { data: recommendationsData } = await aiRecommendations.getByCustomerId(customer.id);
      setRecommendations(recommendationsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    if (customer) {
      loadDashboardData();
    }
  }, [customer, loadDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Customer Profile Required</h2>
            <p className="text-muted-foreground">Please complete your customer profile to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [latestReport] = environmentalData;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {customer.full_name}</h1>
            <p className="text-muted-foreground">Customer ID: {customer.customer_code}</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Badge variant="outline" className="text-primary border-primary">
              {customer.customer_type}
            </Badge>
            <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {customer.status}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Collection</p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeSubscription?.collection_day || 'Saturday'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collections This Month</p>
                  <p className="text-2xl font-bold text-foreground">
                    {recentCollections.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recycling Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {latestReport?.recycling_rate?.toFixed(1) || '0'}%
                  </p>
                </div>
                <Recycle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Carbon Saved</p>
                  <p className="text-2xl font-bold text-foreground">
                    {latestReport?.carbon_saved_kg?.toFixed(1) || '0'} kg
                  </p>
                </div>
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="collections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Recent Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCollections.length > 0 ? (
                    recentCollections.map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <p className="font-medium">
                              {new Date(collection.scheduled_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {collection.bags_collected || 0} bags • {collection.weight_kg || 0} kg
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {collection.customer_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{collection.customer_rating}</span>
                            </div>
                          )}
                          <Badge className={getStatusColor(collection.status)}>
                            {collection.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No collections found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environmental Tab */}
          <TabsContent value="environmental" className="space-y-6">
            {latestReport ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5" />
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Waste:</span>
                      <span className="font-semibold">{latestReport.total_waste_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recycled:</span>
                      <span className="font-semibold text-green-600">{latestReport.recycled_waste_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Footprint:</span>
                      <span className="font-semibold">{latestReport.carbon_footprint_kg} kg CO₂</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Saved:</span>
                      <span className="font-semibold text-green-600">{latestReport.carbon_saved_kg} kg CO₂</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Sustainability Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Recycling Rate:</span>
                      <span className="font-semibold">{latestReport.recycling_rate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waste Reduction:</span>
                      <span className="font-semibold">{latestReport.waste_reduction_percentage?.toFixed(1)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Report Period: {new Date(latestReport.report_period_start).toLocaleDateString()} - {new Date(latestReport.report_period_end).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Leaf className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Environmental Data Yet</h3>
                  <p className="text-muted-foreground">Environmental reports will be generated after your first few collections.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((recommendation) => (
                      <div key={recommendation.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {recommendation.description}
                            </p>
                          </div>
                          <Badge className={getPriorityColor(recommendation.priority || 'medium')}>
                            {recommendation.priority}
                          </Badge>
                        </div>
                        
                        {recommendation.potential_savings && (
                          <div className="text-sm text-green-600">
                            Potential savings: ₦{recommendation.potential_savings.toFixed(2)}
                          </div>
                        )}
                        
                        {recommendation.environmental_benefit && (
                          <div className="text-sm text-primary">
                            {recommendation.environmental_benefit}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => aiRecommendations.updateStatus(recommendation.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => aiRecommendations.updateStatus(recommendation.id, 'rejected')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No recommendations available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {activeSubscription ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Active Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-semibold">{activeSubscription.service_plan?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rate</p>
                      <p className="font-semibold">₦{activeSubscription.monthly_rate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collection Day</p>
                      <p className="font-semibold capitalize">{activeSubscription.collection_day}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Slot</p>
                      <p className="font-semibold">{activeSubscription.collection_time_slot}</p>
                    </div>
                  </div>
                  
                  {activeSubscription.special_instructions && (
                    <div>
                      <p className="text-sm text-muted-foreground">Special Instructions</p>
                      <p className="text-sm">{activeSubscription.special_instructions}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline">Modify Plan</Button>
                    <Button variant="outline">Update Instructions</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-4">Subscribe to one of our plans to start waste collection services.</p>
                  <Button>View Available Plans</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;