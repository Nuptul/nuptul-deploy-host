/**
 * Streamlined Guest Registration Form
 * Rock-solid registration flow with blue glassmorphism design
 * Mobile-first responsive with 44px touch targets
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Utensils,
  Heart,
  Users,
  MapPin
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AdaptiveGlassCard from '@/components/AdaptiveGlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GuestMatcher, GuestMatchResult } from '@/utils/guestMatching';

// Validation schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  dietaryRequirements: z.array(z.string()).optional(),
  allergies: z.string().optional(),
  hasPlusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email().optional().or(z.literal('')),
  emergencyContact: z.string().optional(),
  relationshipToCouple: z.string().optional(),
  specialRequests: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.hasPlusOne && !data.plusOneName) {
    return false;
  }
  return true;
}, {
  message: "Plus one name is required",
  path: ["plusOneName"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free',
  'Kosher', 'Halal', 'Pescatarian', 'Keto', 'Low-sodium'
];

const RELATIONSHIP_OPTIONS = [
  'Friend of Bride', 'Friend of Groom', 'Family of Bride', 'Family of Groom',
  'Colleague', 'Neighbor', 'Other'
];

interface StreamlinedRegistrationFormProps {
  onRegistrationComplete: (userData: any) => void;
  onSwitchToSignIn: () => void;
}

export const StreamlinedRegistrationForm: React.FC<StreamlinedRegistrationFormProps> = ({
  onRegistrationComplete,
  onSwitchToSignIn
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [guestMatch, setGuestMatch] = useState<GuestMatchResult | null>(null);
  const [showGuestConfirm, setShowGuestConfirm] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      hasPlusOne: false,
      dietaryRequirements: [],
      allergies: '',
      plusOneName: '',
      plusOneEmail: '',
      emergencyContact: '',
      relationshipToCouple: '',
      specialRequests: ''
    }
  });

  const watchHasPlusOne = form.watch('hasPlusOne');
  const totalSteps = 3;

  // Step validation
  const validateStep = async (step: number): Promise<boolean> => {
    const fields = {
      1: ['firstName', 'lastName', 'email', 'phone'] as const,
      2: ['password', 'confirmPassword'] as const,
      3: [] as const
    };

    const stepFields = fields[step as keyof typeof fields];
    const isValid = await form.trigger(stepFields);
    
    if (step === 1 && isValid) {
      // Check for guest match on step 1
      const formData = form.getValues();
      await checkGuestMatch(formData);
    }
    
    return isValid;
  };

  const checkGuestMatch = async (data: RegistrationFormData) => {
    try {
      const match = await GuestMatcher.matchGuestOnSignup(
        data.email,
        data.firstName,
        data.lastName,
        data.phone
      );
      
      if (match.matched) {
        setGuestMatch(match);
        if (match.confidence === 'medium') {
          setShowGuestConfirm(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking guest match:', error);
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    
    try {
      // Prepare profile data
      const profileData = {
        phone: data.phone,
        dietary_requirements: selectedDietary,
        allergies: data.allergies || null,
        emergency_contact: data.emergencyContact || null,
        relationship_to_couple: data.relationshipToCouple || null,
        plus_one_name: data.hasPlusOne ? data.plusOneName : null,
        plus_one_email: data.hasPlusOne ? data.plusOneEmail : null,
        special_accommodations: data.specialRequests || null,
      };

      // Sign up user
      const { data: authData, error } = await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        profileData
      );

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Link to guest list if matched
      if (guestMatch && guestMatch.matched && guestMatch.guestId && authData?.user?.id) {
        await GuestMatcher.linkUserToGuest(authData.user.id, guestMatch.guestId);
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account.",
      });

      onRegistrationComplete({
        user: authData?.user,
        profile: profileData,
        guestMatch
      });

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmGuestMatch = () => {
    setShowGuestConfirm(false);
    // Continue with registration
  };

  const rejectGuestMatch = () => {
    setGuestMatch(null);
    setShowGuestConfirm(false);
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
    form.setValue('dietaryRequirements', selectedDietary);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/20 text-blue-700 border border-blue-200'
                }`}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step < currentStep ? 'bg-blue-500' : 'bg-blue-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-700 font-medium">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Guest Match Confirmation Modal */}
      <AnimatePresence>
        {showGuestConfirm && guestMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <AdaptiveGlassCard variant="informational" className="p-6 max-w-sm">
                <div className="text-center space-y-4">
                  <Heart className="w-12 h-12 text-blue-600 mx-auto" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Welcome Back!
                  </h3>
                  <p className="text-sm text-blue-700">
                    We found you on our guest list as <strong>{guestMatch.guestName}</strong>. 
                    Is this correct?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={confirmGuestMatch}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      style={{ minHeight: '44px' }}
                    >
                      Yes, that's me
                    </Button>
                    <Button
                      onClick={rejectGuestMatch}
                      variant="outline"
                      className="flex-1"
                      style={{ minHeight: '44px' }}
                    >
                      No, continue
                    </Button>
                  </div>
                </div>
              </AdaptiveGlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AdaptiveGlassCard variant="informational" className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-blue-900 mb-2">
                    Basic Information
                  </h2>
                  <p className="text-sm text-blue-700">
                    Let's start with your basic details
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-blue-900 font-medium">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        className="pl-10 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                        style={{ minHeight: '44px' }}
                        placeholder="First name"
                      />
                    </div>
                    {form.formState.errors.firstName && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-blue-900 font-medium">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        className="pl-10 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                        style={{ minHeight: '44px' }}
                        placeholder="Last name"
                      />
                    </div>
                    {form.formState.errors.lastName && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-900 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      className="pl-10 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                      style={{ minHeight: '44px' }}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-blue-900 font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      className="pl-10 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                      style={{ minHeight: '44px' }}
                      placeholder="+61 400 000 000"
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AdaptiveGlassCard>
      </form>
    </div>
  );
};
