import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  Percent,
  Settings,
  RefreshCw,
  AlertTriangle,
  Check,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FeatureFlag, featureFlags } from '@/utils/featureFlags';

interface FeatureFlagFormData {
  flag_key: string;
  flag_name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  flag_type: 'boolean' | 'string' | 'number' | 'json';
  default_value: string;
  target_users: string;
  excluded_users: string;
  conditions: string;
}

interface FeatureFlagManagerProps {
  className?: string;
}

const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({ className }) => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState<FeatureFlagFormData>({
    flag_key: '',
    flag_name: '',
    description: '',
    is_enabled: false,
    rollout_percentage: 0,
    flag_type: 'boolean',
    default_value: 'false',
    target_users: '',
    excluded_users: '',
    conditions: '{}'
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const allFlags = await featureFlags.getAllFlags();
      setFlags(allFlags);
    } catch (error) {
      console.error('Error loading flags:', error);
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate JSON fields
      let parsedConditions = {};
      let parsedDefaultValue: any = formData.default_value;

      try {
        parsedConditions = JSON.parse(formData.conditions);
      } catch {
        toast.error('Invalid JSON in conditions field');
        return;
      }

      // Parse default value based on type
      try {
        switch (formData.flag_type) {
          case 'boolean':
            parsedDefaultValue = formData.default_value === 'true';
            break;
          case 'number':
            parsedDefaultValue = Number(formData.default_value);
            if (isNaN(parsedDefaultValue)) throw new Error('Invalid number');
            break;
          case 'json':
            parsedDefaultValue = JSON.parse(formData.default_value);
            break;
          case 'string':
          default:
            parsedDefaultValue = formData.default_value;
            break;
        }
      } catch {
        toast.error(`Invalid default value for type ${formData.flag_type}`);
        return;
      }

      const flagData: Partial<FeatureFlag> = {
        flag_key: formData.flag_key.toLowerCase().replace(/\s+/g, '_'),
        flag_name: formData.flag_name,
        description: formData.description,
        is_enabled: formData.is_enabled,
        rollout_percentage: formData.rollout_percentage,
        flag_type: formData.flag_type,
        default_value: parsedDefaultValue,
        target_users: formData.target_users.split(',').map(u => u.trim()).filter(Boolean),
        excluded_users: formData.excluded_users.split(',').map(u => u.trim()).filter(Boolean),
        conditions: parsedConditions
      };

      if (editingFlag) {
        flagData.id = editingFlag.id;
      }

      const result = await featureFlags.setFlag(flagData);
      
      if (result) {
        toast.success(`Feature flag ${editingFlag ? 'updated' : 'created'} successfully`);
        setShowCreateDialog(false);
        setEditingFlag(null);
        resetForm();
        loadFlags();
      } else {
        toast.error(`Failed to ${editingFlag ? 'update' : 'create'} feature flag`);
      }
    } catch (error) {
      console.error('Error saving flag:', error);
      toast.error(`Failed to ${editingFlag ? 'update' : 'create'} feature flag`);
    }
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      flag_key: flag.flag_key,
      flag_name: flag.flag_name,
      description: flag.description,
      is_enabled: flag.is_enabled,
      rollout_percentage: flag.rollout_percentage,
      flag_type: flag.flag_type,
      default_value: typeof flag.default_value === 'object' 
        ? JSON.stringify(flag.default_value, null, 2)
        : String(flag.default_value),
      target_users: flag.target_users.join(', '),
      excluded_users: flag.excluded_users.join(', '),
      conditions: JSON.stringify(flag.conditions, null, 2)
    });
    setShowCreateDialog(true);
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      const updatedFlag = await featureFlags.setFlag({
        ...flag,
        is_enabled: !flag.is_enabled
      });

      if (updatedFlag) {
        toast.success(`Flag ${flag.flag_name} ${!flag.is_enabled ? 'enabled' : 'disabled'}`);
        loadFlags();
      }
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast.error('Failed to toggle flag');
    }
  };

  const handleDelete = async (flagKey: string) => {
    try {
      const success = await featureFlags.deleteFlag(flagKey);
      
      if (success) {
        toast.success('Feature flag deleted successfully');
        loadFlags();
      } else {
        toast.error('Failed to delete feature flag');
      }
    } catch (error) {
      console.error('Error deleting flag:', error);
      toast.error('Failed to delete feature flag');
    }
  };

  const resetForm = () => {
    setFormData({
      flag_key: '',
      flag_name: '',
      description: '',
      is_enabled: false,
      rollout_percentage: 0,
      flag_type: 'boolean',
      default_value: 'false',
      target_users: '',
      excluded_users: '',
      conditions: '{}'
    });
  };

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = 
      flag.flag_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.flag_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || flag.flag_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'enabled' && flag.is_enabled) ||
      (statusFilter === 'disabled' && !flag.is_enabled);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getFlagTypeColor = (type: string) => {
    switch (type) {
      case 'boolean': return 'bg-blue-100 text-blue-800';
      case 'string': return 'bg-green-100 text-green-800';
      case 'number': return 'bg-purple-100 text-purple-800';
      case 'json': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDefaultValueForType = (type: string) => {
    switch (type) {
      case 'boolean': return 'false';
      case 'string': return '';
      case 'number': return '0';
      case 'json': return '{}';
      default: return 'false';
    }
  };

  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy flex items-center">
            <Flag className="w-6 h-6 mr-2" />
            Feature Flags
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage feature toggles and rollouts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadFlags}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingFlag(null);
                  resetForm();
                }}
                className="bg-wedding-navy hover:bg-wedding-navy/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-popup max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
                </DialogTitle>
                <DialogDescription>
                  {editingFlag 
                    ? 'Update the feature flag configuration.' 
                    : 'Create a new feature flag for your application.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flag_key">Flag Key</Label>
                      <Input
                        id="flag_key"
                        value={formData.flag_key}
                        onChange={(e) => setFormData({...formData, flag_key: e.target.value})}
                        placeholder="new_feature_enabled"
                        disabled={!!editingFlag}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used in code. Cannot be changed after creation.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="flag_name">Display Name</Label>
                      <Input
                        id="flag_name"
                        value={formData.flag_name}
                        onChange={(e) => setFormData({...formData, flag_name: e.target.value})}
                        placeholder="New Feature Enabled"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe what this flag controls..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Flag Configuration */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flag_type">Flag Type</Label>
                      <Select 
                        value={formData.flag_type} 
                        onValueChange={(value: any) => {
                          setFormData({
                            ...formData, 
                            flag_type: value,
                            default_value: getDefaultValueForType(value)
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="default_value">Default Value</Label>
                      {formData.flag_type === 'json' ? (
                        <Textarea
                          id="default_value"
                          value={formData.default_value}
                          onChange={(e) => setFormData({...formData, default_value: e.target.value})}
                          placeholder="{}"
                          rows={2}
                        />
                      ) : (
                        <Input
                          id="default_value"
                          value={formData.default_value}
                          onChange={(e) => setFormData({...formData, default_value: e.target.value})}
                          placeholder={getDefaultValueForType(formData.flag_type)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData({...formData, is_enabled: checked})}
                    />
                    <Label htmlFor="is_enabled">Enable flag globally</Label>
                  </div>
                </div>

                {/* Rollout Configuration */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Rollout Configuration</h3>
                  <div>
                    <Label htmlFor="rollout_percentage">Rollout Percentage: {formData.rollout_percentage}%</Label>
                    <input
                      type="range"
                      id="rollout_percentage"
                      min="0"
                      max="100"
                      value={formData.rollout_percentage}
                      onChange={(e) => setFormData({...formData, rollout_percentage: Number(e.target.value)})}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target_users">Target Users (User IDs)</Label>
                      <Input
                        id="target_users"
                        value={formData.target_users}
                        onChange={(e) => setFormData({...formData, target_users: e.target.value})}
                        placeholder="user1@example.com, user2@example.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Comma-separated. Always enabled for these users.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="excluded_users">Excluded Users (User IDs)</Label>
                      <Input
                        id="excluded_users"
                        value={formData.excluded_users}
                        onChange={(e) => setFormData({...formData, excluded_users: e.target.value})}
                        placeholder="user3@example.com, user4@example.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Comma-separated. Always disabled for these users.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="conditions">Additional Conditions (JSON)</Label>
                    <Textarea
                      id="conditions"
                      value={formData.conditions}
                      onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                      placeholder='{"userRole": "admin", "environment": "production"}'
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JSON object with context conditions for enabling the flag.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateDialog(false);
                      setEditingFlag(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-wedding-navy hover:bg-wedding-navy/90">
                    <Save className="w-4 h-4 mr-2" />
                    {editingFlag ? 'Update Flag' : 'Create Flag'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flags List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          </div>
        ) : filteredFlags.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No flags found matching your criteria.' 
                  : 'No feature flags created yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredFlags.map((flag) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-wedding-navy">
                            {flag.flag_name}
                          </h3>
                          <Badge className={getFlagTypeColor(flag.flag_type)}>
                            {flag.flag_type}
                          </Badge>
                          <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                            {flag.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {flag.flag_key}
                          </code>
                        </p>
                        <p className="text-sm text-gray-700 mb-4">{flag.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Rollout:</span>
                            <div className="flex items-center mt-1">
                              <Percent className="w-3 h-3 mr-1" />
                              {flag.rollout_percentage}%
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Default:</span>
                            <div className="mt-1 font-mono text-xs">
                              {typeof flag.default_value === 'object' 
                                ? JSON.stringify(flag.default_value) 
                                : String(flag.default_value)
                              }
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Targeted:</span>
                            <div className="flex items-center mt-1">
                              <Users className="w-3 h-3 mr-1" />
                              {flag.target_users.length}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Excluded:</span>
                            <div className="flex items-center mt-1">
                              <X className="w-3 h-3 mr-1" />
                              {flag.excluded_users.length}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(flag)}
                          className={flag.is_enabled ? 'text-green-600' : 'text-gray-400'}
                        >
                          {flag.is_enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(flag)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{flag.flag_name}"? This action cannot be undone
                                and will immediately disable this feature for all users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(flag.flag_key)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Flag
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default FeatureFlagManager;