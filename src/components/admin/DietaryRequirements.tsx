import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit3, Plus, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';

export interface DietaryOption {
  id: string;
  name: string;
  description: string;
  is_allergy: boolean;
}

export interface DietaryRequirement {
  id: string;
  rsvp_id: string;
  dietary_option_id?: string;
  custom_requirement?: string;
  severity?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const PREDEFINED_DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'vegetarian', name: 'Vegetarian', description: 'No meat, poultry, or fish', is_allergy: false },
  { id: 'vegan', name: 'Vegan', description: 'No animal products', is_allergy: false },
  { id: 'gluten_free', name: 'Gluten-Free', description: 'No gluten-containing ingredients', is_allergy: true },
  { id: 'dairy_free', name: 'Dairy-Free', description: 'No dairy products', is_allergy: true },
  { id: 'nut_allergy', name: 'Nut Allergy', description: 'Severe nut allergy', is_allergy: true },
  { id: 'shellfish_allergy', name: 'Shellfish Allergy', description: 'Allergic to shellfish', is_allergy: true },
  { id: 'halal', name: 'Halal', description: 'Halal dietary requirements', is_allergy: false },
  { id: 'kosher', name: 'Kosher', description: 'Kosher dietary requirements', is_allergy: false },
  { id: 'low_sodium', name: 'Low Sodium', description: 'Reduced sodium diet', is_allergy: false },
  { id: 'diabetic', name: 'Diabetic-Friendly', description: 'Low sugar/carb options', is_allergy: false }
];

interface DietaryRequirementsProps {
  rsvpId: string;
  isEditable?: boolean;
  onUpdate?: () => void;
}

const DietaryRequirements: React.FC<DietaryRequirementsProps> = ({ 
  rsvpId, 
  isEditable = false,
  onUpdate 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [requirements, setRequirements] = useState<DietaryRequirement[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customRequirement, setCustomRequirement] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (rsvpId) {
      fetchDietaryRequirements();
    }
  }, [rsvpId]);

  const fetchDietaryRequirements = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('dietary_requirements')
        .select('*')
        .eq('rsvp_id', rsvpId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequirements(data || []);
      
      // Pre-populate form with existing requirements
      const existingOptions = data?.filter(r => r.dietary_option_id).map(r => r.dietary_option_id!) || [];
      setSelectedOptions(existingOptions);
      
      const customReq = data?.find(r => r.custom_requirement);
      if (customReq) {
        setCustomRequirement(customReq.custom_requirement || '');
        setSeverity((customReq.severity as 'mild' | 'moderate' | 'severe') || 'moderate');
        setNotes(customReq.notes || '');
      }
    } catch (error) {
      console.error('Error fetching dietary requirements:', error);
      toast({
        title: "Error",
        description: "Failed to load dietary requirements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDietaryRequirements = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Delete existing requirements for this RSVP
      await (supabase as any)
        .from('dietary_requirements')
        .delete()
        .eq('rsvp_id', rsvpId);

      // Insert new requirements
      const newRequirements = [];

      // Add selected predefined options
      for (const optionId of selectedOptions) {
        newRequirements.push({
          rsvp_id: rsvpId,
          dietary_option_id: optionId,
          severity: PREDEFINED_DIETARY_OPTIONS.find(o => o.id === optionId)?.is_allergy ? severity : null
        });
      }

      // Add custom requirement if specified
      if (customRequirement.trim()) {
        newRequirements.push({
          rsvp_id: rsvpId,
          custom_requirement: customRequirement.trim(),
          severity,
          notes: notes.trim() || null
        });
      }

      if (newRequirements.length > 0) {
        const { error } = await (supabase as any)
          .from('dietary_requirements')
          .insert(newRequirements);

        if (error) throw error;
      }

      // Also update the RSVP table for backward compatibility
      const summaryText = [
        ...selectedOptions.map(id => PREDEFINED_DIETARY_OPTIONS.find(o => o.id === id)?.name),
        customRequirement.trim()
      ].filter(Boolean).join(', ');

      await (supabase as any)
        .from('rsvps')
        .update({ dietary_restrictions: summaryText || null })
        .eq('id', rsvpId);

      toast({
        title: "Success",
        description: "Dietary requirements updated successfully",
      });

      setEditing(false);
      fetchDietaryRequirements();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving dietary requirements:', error);
      toast({
        title: "Error",
        description: "Failed to save dietary requirements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  if (loading && !editing) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-wedding-navy">Dietary Requirements</h3>
        {isEditable && !editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Predefined Options */}
          <div>
            <Label className="text-base font-medium mb-4 block">Select Applicable Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREDEFINED_DIETARY_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleOptionToggle(option.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                      {option.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                    {option.is_allergy && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Allergy
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Requirement */}
          <div>
            <Label htmlFor="custom" className="text-base font-medium">Other Requirements</Label>
            <Textarea
              id="custom"
              value={customRequirement}
              onChange={(e) => setCustomRequirement(e.target.value)}
              placeholder="Describe any other dietary requirements or allergies..."
              className="mt-2 resize-none"
              rows={3}
            />
          </div>

          {/* Severity for allergies */}
          {(selectedOptions.some(id => PREDEFINED_DIETARY_OPTIONS.find(o => o.id === id)?.is_allergy) || customRequirement.trim()) && (
            <div>
              <Label className="text-base font-medium mb-3 block">Severity Level</Label>
              <div className="flex gap-4">
                {['mild', 'moderate', 'severe'].map((level) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value={level}
                      checked={severity === level}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information for the kitchen staff..."
              className="mt-2 resize-none"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveDietaryRequirements}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Requirements
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                fetchDietaryRequirements(); // Reset form
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requirements.length > 0 ? (
            <>
              {requirements.filter(r => r.dietary_option_id).map((req) => {
                const option = PREDEFINED_DIETARY_OPTIONS.find(o => o.id === req.dietary_option_id);
                if (!option) return null;
                
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <div className="font-medium text-wedding-navy">{option.name}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                      {option.is_allergy && req.severity && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {req.severity} severity
                        </Badge>
                      )}
                    </div>
                    {option.is_allergy && (
                      <Badge variant="outline" className="text-xs">
                        Allergy
                      </Badge>
                    )}
                  </div>
                );
              })}
              
              {requirements.filter(r => r.custom_requirement).map((req) => (
                <div key={req.id} className="p-3 rounded-lg bg-secondary/30">
                  <div className="font-medium text-wedding-navy mb-1">Custom Requirement</div>
                  <div className="text-sm text-muted-foreground mb-2">{req.custom_requirement}</div>
                  {req.severity && (
                    <Badge variant="secondary" className="text-xs mr-2">
                      {req.severity} severity
                    </Badge>
                  )}
                  {req.notes && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <strong>Notes:</strong> {req.notes}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No dietary requirements specified</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirements
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default DietaryRequirements;