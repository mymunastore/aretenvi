import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Save, Download, History, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createConfigService } from '@/services/configService';
import type { ConfigEntry } from '@/lib/configSync';

interface ConfigGroup {
  [category: string]: ConfigEntry[];
}

export const ConfigurationManager = () => {
  const [configs, setConfigs] = useState<ConfigGroup>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const configService = createConfigService();

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const grouped = await configService.getAllByCategories();
      setConfigs(grouped);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await configService.syncFromFile();

      if (result.success) {
        toast({
          title: 'Sync Complete',
          description: `Successfully synced ${result.configsSynced} configurations`,
        });
        await loadConfigurations();
      } else {
        toast({
          title: 'Sync Issues',
          description: `Synced ${result.configsSynced} configs with ${result.errors.length} errors`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync configurations',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdate = async (category: string, key: string, value: string) => {
    try {
      await configService.update(category, key, value, 'Manual update from UI');
      toast({
        title: 'Configuration Updated',
        description: `${category}.${key} has been updated`,
      });
      await loadConfigurations();

      const configKey = `${category}.${key}`;
      const newEditedValues = { ...editedValues };
      delete newEditedValues[configKey];
      setEditedValues(newEditedValues);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update configuration',
        variant: 'destructive',
      });
    }
  };

  const handleExportEnv = async () => {
    try {
      const envContent = await configService.exportAsEnv();
      const blob = new Blob([envContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `.env.${new Date().getTime()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Configuration exported as .env file',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export configuration',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonContent = await configService.exportAsJSON();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config.${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Configuration exported as JSON file',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export configuration',
        variant: 'destructive',
      });
    }
  };

  const renderConfigInput = (config: ConfigEntry) => {
    const configKey = `${config.category}.${config.key}`;
    const currentValue = editedValues[configKey] ?? (config.value || config.default_value || '');
    const hasChanges = editedValues[configKey] !== undefined;

    const handleChange = (value: string) => {
      setEditedValues({ ...editedValues, [configKey]: value });
    };

    if (config.is_secret) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="password"
              value="***REDACTED***"
              disabled
              className="flex-1"
            />
            <Badge variant="secondary">Secret</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Secret values cannot be viewed or edited from the UI. Update in Supabase dashboard.
          </p>
        </div>
      );
    }

    switch (config.value_type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={currentValue === 'true'}
              onCheckedChange={(checked) => handleChange(String(checked))}
            />
            <span className="text-sm">{currentValue === 'true' ? 'Enabled' : 'Disabled'}</span>
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleUpdate(config.category, config.key, currentValue)}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleUpdate(config.category, config.key, currentValue)}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        );

      case 'array':
      case 'object':
        return (
          <div className="space-y-2">
            <textarea
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full min-h-[100px] p-2 text-sm font-mono border rounded-md"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleUpdate(config.category, config.key, currentValue)}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        );

      default:
        return (
          <div className="flex gap-2">
            <Input
              type="text"
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleUpdate(config.category, config.key, currentValue)}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        );
    }
  };

  const categoryTitles: Record<string, string> = {
    ai: 'AI Configuration',
    rate_limit: 'Rate Limiting',
    storage: 'Storage Settings',
    app: 'Application Settings',
    cache: 'Cache Configuration',
    whatsapp: 'WhatsApp Settings',
    backup: 'Backup Settings',
    integrations: 'External Integrations',
    monitoring: 'Monitoring & Analytics',
    security: 'Security Settings',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Configuration Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage application settings and sync with database
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync from File
          </Button>
          <Button variant="outline" onClick={handleExportEnv}>
            <Download className="w-4 h-4 mr-2" />
            Export .env
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Changes made here update the database only. To apply changes to the running application,
          you must restart the dev server or rebuild the application.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={Object.keys(configs)[0]} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          {Object.keys(configs).map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryTitles[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(configs).map(([category, categoryConfigs]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{categoryTitles[category] || category}</CardTitle>
                <CardDescription>
                  Configure {categoryTitles[category]?.toLowerCase() || category} settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryConfigs.map((config) => (
                  <div key={`${config.category}.${config.key}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={config.key} className="text-base font-semibold">
                        {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      {config.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {config.value_type}
                      </Badge>
                    </div>
                    {config.description && (
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    )}
                    {renderConfigInput(config)}
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ConfigurationManager;
