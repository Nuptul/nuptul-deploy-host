import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Home } from 'lucide-react';

interface AddressFieldsProps {
  form: UseFormReturn<any>;
  prefix?: string; // For nested fields like 'plusOne.address'
  required?: boolean;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ 
  form, 
  prefix = '', 
  required = false 
}) => {
  const fieldName = (name: string) => prefix ? `${prefix}.${name}` : name;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Address Number */}
        <div className="space-y-2">
          <Label htmlFor={fieldName('addressNumber')} className="flex items-center gap-2">
            <Home className="w-4 h-4 text-wedding-gold" />
            Number
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={fieldName('addressNumber')}
            placeholder="123"
            {...form.register(fieldName('addressNumber'))}
            className="bg-white/50 backdrop-blur-sm border-wedding-gold/20 focus:border-wedding-gold"
          />
          {form.formState.errors[fieldName('addressNumber')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('addressNumber')]?.message}
            </p>
          )}
        </div>

        {/* Street Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={fieldName('addressStreet')} className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-wedding-gold" />
            Street Name
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={fieldName('addressStreet')}
            placeholder="Wedding Lane"
            {...form.register(fieldName('addressStreet'))}
            className="bg-white/50 backdrop-blur-sm border-wedding-gold/20 focus:border-wedding-gold"
          />
          {form.formState.errors[fieldName('addressStreet')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('addressStreet')]?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Street Type */}
        <div className="space-y-2">
          <Label htmlFor={fieldName('addressType')}>
            Street Type
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={form.watch(fieldName('addressType'))}
            onValueChange={(value) => form.setValue(fieldName('addressType'), value)}
          >
            <SelectTrigger className="bg-white/50 backdrop-blur-sm border-wedding-gold/20">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="street">Street</SelectItem>
              <SelectItem value="road">Road</SelectItem>
              <SelectItem value="avenue">Avenue</SelectItem>
              <SelectItem value="boulevard">Boulevard</SelectItem>
              <SelectItem value="lane">Lane</SelectItem>
              <SelectItem value="drive">Drive</SelectItem>
              <SelectItem value="court">Court</SelectItem>
              <SelectItem value="place">Place</SelectItem>
              <SelectItem value="crescent">Crescent</SelectItem>
              <SelectItem value="parade">Parade</SelectItem>
              <SelectItem value="highway">Highway</SelectItem>
              <SelectItem value="close">Close</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors[fieldName('addressType')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('addressType')]?.message}
            </p>
          )}
        </div>

        {/* Suburb */}
        <div className="space-y-2">
          <Label htmlFor={fieldName('addressSuburb')}>
            Suburb
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={fieldName('addressSuburb')}
            placeholder="Merewether"
            {...form.register(fieldName('addressSuburb'))}
            className="bg-white/50 backdrop-blur-sm border-wedding-gold/20 focus:border-wedding-gold"
          />
          {form.formState.errors[fieldName('addressSuburb')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('addressSuburb')]?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State */}
        <div className="space-y-2">
          <Label htmlFor={fieldName('state')}>
            State
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={form.watch(fieldName('state'))}
            onValueChange={(value) => form.setValue(fieldName('state'), value)}
          >
            <SelectTrigger className="bg-white/50 backdrop-blur-sm border-wedding-gold/20">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NSW">NSW</SelectItem>
              <SelectItem value="VIC">VIC</SelectItem>
              <SelectItem value="QLD">QLD</SelectItem>
              <SelectItem value="WA">WA</SelectItem>
              <SelectItem value="SA">SA</SelectItem>
              <SelectItem value="TAS">TAS</SelectItem>
              <SelectItem value="ACT">ACT</SelectItem>
              <SelectItem value="NT">NT</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors[fieldName('state')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('state')]?.message}
            </p>
          )}
        </div>

        {/* Postcode */}
        <div className="space-y-2">
          <Label htmlFor={fieldName('postcode')}>
            Postcode
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={fieldName('postcode')}
            placeholder="2291"
            maxLength={4}
            {...form.register(fieldName('postcode'))}
            className="bg-white/50 backdrop-blur-sm border-wedding-gold/20 focus:border-wedding-gold"
          />
          {form.formState.errors[fieldName('postcode')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('postcode')]?.message}
            </p>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor={fieldName('country')}>
            Country
            {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={form.watch(fieldName('country')) || 'Australia'}
            onValueChange={(value) => form.setValue(fieldName('country'), value)}
          >
            <SelectTrigger className="bg-white/50 backdrop-blur-sm border-wedding-gold/20">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="New Zealand">New Zealand</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors[fieldName('country')] && (
            <p className="text-xs text-red-500">
              {form.formState.errors[fieldName('country')]?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressFields;