import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Users, Send, Heart, Utensils, FileText, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { SignUpFormData, signUpSchema } from '@/lib/auth-validation';
import GlassCard from '@/components/GlassCard';
import { GuestMatcher, GuestMatchResult } from '@/utils/guestMatching';
import { supabase } from '@/integrations/supabase/client';
import ProfilePictureSignup from '@/components/ui/ProfilePictureSignup';
import { RSVPRadioButtons } from '@/components/ui/RSVPButtons';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan', 
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
  'Kosher',
  'Halal',
  'Low-sodium',
  'Keto',
  'Pescatarian'
];

const ALLERGY_OPTIONS = [
  'Nuts',
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat/Gluten',
  'Fish',
  'Sesame',
  'Sulfites',
  'Other'
];

const RELATIONSHIP_OPTIONS = [
  // Wedding Party
  { group: '👰🤵 Wedding Party', options: [
    'Best Man',
    'Maid of Honor', 
    'Bridesmaid',
    'Groomsman',
    'Flower Girl',
    'Ring Bearer'
  ]},
  // Immediate Family
  { group: '👨‍👩‍👧‍👦 Immediate Family', options: [
    'Father',
    'Mother',
    'Sister', 
    'Brother',
    'Son',
    'Daughter'
  ]},
  // Extended Family
  { group: '👴👵 Extended Family', options: [
    'Grandfather',
    'Grandmother',
    'Great Grandfather',
    'Great Grandmother',
    'Uncle',
    'Aunt',
    'Cousin'
  ]},
  // In-Laws
  { group: '💑 In-Laws', options: [
    'Father-in-law',
    'Mother-in-law',
    'Sister-in-law',
    'Brother-in-law'
  ]},
  // Friends & Others
  { group: '👥 Friends & Others', options: [
    'Close Friend',
    'University Friend',
    'Work Colleague',
    'Childhood Friend',
    'Family Friend',
    'Neighbor',
    'Plus One',
    'Other'
  ]}
];

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [guestMatch, setGuestMatch] = useState<GuestMatchResult | null>(null);
  const [showGuestConfirm, setShowGuestConfirm] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [hasExistingRSVP, setHasExistingRSVP] = useState(false);
  
  const { signUp, signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      hasPlusOne: false,
      plusOneName: '',
      plusOneEmail: '',
      dietaryRequirements: [],
      allergies: [],
      emergencyContact: '',
      relationshipToCouple: '',
      specialAccommodations: '',
      bio: '',
    }
  });

  const watchHasPlusOne = signUpForm.watch('hasPlusOne');

  const checkGuestMatch = async (data: SignUpFormData) => {
    const match = await GuestMatcher.matchGuestOnSignup(
      data.email, 
      data.firstName, 
      data.lastName, 
      data.mobile
    );
    
    if (match.matched) {
      setGuestMatch(match);
      setShowGuestConfirm(true);
      
      // Check if guest has already RSVP'd
      if (match.rsvpRespondedAt) {
        setHasExistingRSVP(true);
        toast({
          title: "Welcome back!",
          description: "We already have your RSVP response on file.",
        });
      }
      
      return true;
    }
    return false;
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    try {
      // First check for guest match
      const hasMatch = await checkGuestMatch(data);
      
      if (hasMatch && guestMatch && guestMatch.confidence === 'medium') {
        // Show confirmation for medium confidence matches
        return;
      }

      // Get RSVP response from form (only if they haven't already RSVP'd)
      const formElement = document.querySelector('form');
      const attendingResponse = hasExistingRSVP 
        ? (guestMatch?.rsvpStatus === 'attending' ? 'yes' : 'no')
        : formElement?.querySelector('input[name="attending"]:checked')?.value;
      
      const profileData = {
        mobile: data.mobile,
        address: data.address,
        address_suburb: data.suburb,
        state: data.state,
        country: data.country,
        postcode: data.postcode,
        emergencyContact: data.emergencyContact,
        relationshipToCouple: data.relationshipToCouple,
        dietaryRequirements: data.dietaryRequirements,
        allergies: data.allergies,
        specialAccommodations: data.specialAccommodations,
        bio: data.bio,
        // Profile picture will be uploaded after user creation
        hasPlusOne: data.hasPlusOne,
        plusOneName: data.plusOneName,
        plusOneEmail: data.plusOneEmail,
        rsvp_status: attendingResponse === 'yes' ? 'attending' : 'not_attending',
        rsvp_responded_at: new Date().toISOString(),
      };

      const { data: authData, error } = await signUp(data.email, data.password, data.firstName, data.lastName, profileData);
      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Auto-link to guest list if high confidence match
      if (guestMatch && guestMatch.matched && guestMatch.guestId && authData?.user?.id) {
        const linked = await GuestMatcher.linkUserToGuest(authData.user.id, guestMatch.guestId);
        if (linked) {
          toast({
            title: "Welcome back!",
            description: `Linked to guest list as ${guestMatch.guestName}`,
          });
        }
      }

      // Upload profile picture if selected (using session storage for temporary persistence)
      if (profilePictureFile && authData?.user?.id) {
        try {
          // Store the file temporarily in sessionStorage as base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Data = reader.result as string;
            sessionStorage.setItem('pending_profile_picture', base64Data);
            sessionStorage.setItem('pending_profile_picture_type', profilePictureFile.type);
            sessionStorage.setItem('pending_profile_picture_name', profilePictureFile.name);
            sessionStorage.setItem('pending_profile_picture_user_id', authData.user.id);
          };
          reader.readAsDataURL(profilePictureFile);
        } catch (uploadError) {
          console.error('Failed to store profile picture for deferred upload:', uploadError);
        }
      }

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });
      
      // If they have a plus one, show the magic link option
      if (data.hasPlusOne && data.plusOneEmail) {
        setCurrentStep(4);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const confirmGuestMatch = async () => {
    setShowGuestConfirm(false);
    // Proceed with signup - the guest will be linked in onSignUpSubmit
    const data = signUpForm.getValues();
    await onSignUpSubmit(data);
  };

  const rejectGuestMatch = () => {
    setGuestMatch(null);
    setShowGuestConfirm(false);
    // Continue signup without guest linking
    const data = signUpForm.getValues();
    onSignUpSubmit(data);
  };

  const sendPlusOneMagicLink = async () => {
    const plusOneEmail = signUpForm.getValues('plusOneEmail');
    const plusOneName = signUpForm.getValues('plusOneName');
    const mainUserEmail = signUpForm.getValues('email');
    
    if (plusOneEmail && plusOneName) {
      try {
        // Create a plus one guest record linked to the main invitee
        const { error: guestError } = await supabase
          .from('guest_list')
          .insert([{
            name: plusOneName,
            email_address: plusOneEmail,
            guest_count: 1,
            rsvp_status: 'pending',
            invitation_code: `PLUS${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            notes: `Plus one for ${mainUserEmail}`,
            save_the_date_sent: false,
            invite_sent: true,
            rsvp_count: 0,
            is_plus_one: true,
            plus_one_of: mainUserEmail
          }]);

        if (guestError) throw guestError;

        // Send magic link with special plus one redirect
        const magicLinkUrl = `${window.location.origin}/auth?plusone=true&invited_by=${encodeURIComponent(mainUserEmail)}`;
        const { error } = await signInWithMagicLink(plusOneEmail, {
          emailRedirectTo: magicLinkUrl
        });
        
        if (error) {
          toast({
            title: "Error",
            description: "Failed to send magic link to plus one.",
            variant: "destructive",
          });
        } else {
          setMagicLinkSent(true);
          toast({
            title: "Magic Link Sent!",
            description: `Invitation sent to ${plusOneEmail}. They'll be linked as your plus one.`,
          });
        }
      } catch (error) {
        console.error('Error creating plus one record:', error);
        toast({
          title: "Error",
          description: "Failed to send magic link.",
          variant: "destructive",
        });
      }
    }
  };

  const saveLinkForLater = () => {
    const userEmail = signUpForm.getValues('email');
    const plusOneName = signUpForm.getValues('plusOneName');
    const plusOneEmail = signUpForm.getValues('plusOneEmail');
    
    const message = `Hi! Here's the wedding app link for ${plusOneName} (${plusOneEmail}): ${window.location.origin}/auth`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
      toast({
        title: "Link Copied!",
        description: "You can now text this to yourself or your plus one.",
      });
    });
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Guest match confirmation dialog
  if (showGuestConfirm && guestMatch) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold font-dolly mb-2">Guest List Match Found</h3>
          <p className="text-muted-foreground mb-4">
            We found a potential match on our guest list
          </p>
        </div>

        <GlassCard className="p-4 border-green-200 bg-green-50/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Guest Name:</span>
              <span>{guestMatch.guestName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Match Type:</span>
              <span className="capitalize">{guestMatch.matchType?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Confidence:</span>
              <span className={`capitalize ${
                guestMatch.confidence === 'high' ? 'text-green-600' : 
                guestMatch.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {guestMatch.confidence}
              </span>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-3">
          <Button
            onClick={confirmGuestMatch}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-dolly"
          >
            Yes, this is me - Link to Guest List
          </Button>
          <Button
            onClick={rejectGuestMatch}
            variant="outline"
            className="w-full font-dolly"
          >
            No, this is not me - Continue without linking
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Linking to the guest list will help us track your RSVP and provide personalized information.
        </p>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold font-dolly mb-2">Plus One Invitation</h3>
          <p className="text-muted-foreground">
            Send a magic link to {signUpForm.getValues('plusOneName')} at {signUpForm.getValues('plusOneEmail')}
          </p>
        </div>

        {!magicLinkSent ? (
          <div className="space-y-4">
            <Button
              onClick={sendPlusOneMagicLink}
              className="w-full bg-wedding-navy hover:bg-wedding-navy-light font-dolly"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Magic Link Now
            </Button>
            
            <Button
              variant="outline"
              onClick={saveLinkForLater}
              className="w-full font-dolly"
            >
              Save Link to Text Later
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300">
                Magic link sent successfully! Your plus one will receive an email with login instructions.
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-wedding-navy hover:bg-wedding-navy-light font-dolly"
            >
              Continue to App
            </Button>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-glass-blue hover:text-glass-blue/80 transition-colors text-sm font-dolly"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4 sm:space-y-6">
      {currentStep === 1 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-dolly">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  className="glass-input pl-10 font-dolly"
                  placeholder="Enter first name"
                  {...signUpForm.register('firstName')}
                />
              </div>
              {signUpForm.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-dolly">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  className="glass-input pl-10 font-dolly"
                  placeholder="Enter last name"
                  {...signUpForm.register('lastName')}
                />
              </div>
              {signUpForm.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-dolly">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="glass-input pl-10 font-dolly"
                placeholder="Enter your email"
                {...signUpForm.register('email')}
              />
            </div>
            {signUpForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="font-dolly">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                className="glass-input pl-10 font-dolly"
                placeholder="Enter mobile number"
                {...signUpForm.register('mobile')}
              />
            </div>
            {signUpForm.formState.errors.mobile && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.mobile.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-dolly">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="glass-input pr-10 font-dolly"
                placeholder="Create a password"
                {...signUpForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {signUpForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.password.message}
              </p>
            )}
            <PasswordStrengthMeter password={signUpForm.watch('password') || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-dolly">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="glass-input pr-10 font-dolly"
                placeholder="Confirm your password"
                {...signUpForm.register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {signUpForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={nextStep}
            className="w-full bg-wedding-navy hover:bg-wedding-navy-light min-h-[44px] font-dolly"
          >
            Next: Address Details
          </Button>
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="space-y-2">
            <Label htmlFor="address" className="font-dolly">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                id="address"
                className="glass-input pl-10 font-dolly resize-none"
                placeholder="Enter your full address"
                rows={3}
                {...signUpForm.register('address')}
              />
            </div>
            {signUpForm.formState.errors.address && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suburb" className="font-dolly">Suburb</Label>
            <Input
              id="suburb"
              type="text"
              className="glass-input font-dolly"
              placeholder="Enter suburb"
              {...signUpForm.register('suburb')}
            />
            {signUpForm.formState.errors.suburb && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.suburb.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="font-dolly">State/Province</Label>
              <Input
                id="state"
                type="text"
                className="glass-input font-dolly"
                placeholder="Enter state/province"
                {...signUpForm.register('state')}
              />
              {signUpForm.formState.errors.state && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.state.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="font-dolly">Country</Label>
              <Input
                id="country"
                type="text"
                className="glass-input font-dolly"
                placeholder="Enter country"
                {...signUpForm.register('country')}
              />
              {signUpForm.formState.errors.country && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.country.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postcode" className="font-dolly">Postcode/Zip Code</Label>
            <Input
              id="postcode"
              type="text"
              className="glass-input font-dolly"
              placeholder="Enter postcode/zip"
              {...signUpForm.register('postcode')}
            />
            {signUpForm.formState.errors.postcode && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.postcode.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasPlusOne" 
                checked={watchHasPlusOne}
                onCheckedChange={(checked) => signUpForm.setValue('hasPlusOne', checked as boolean)}
              />
              <Label htmlFor="hasPlusOne" className="font-dolly flex items-center">
                <Users className="w-4 h-4 mr-2" />
                I'm bringing a plus one
              </Label>
            </div>

            {watchHasPlusOne && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="plusOneName" className="font-dolly">Plus One Name</Label>
                  <Input
                    id="plusOneName"
                    type="text"
                    className="glass-input font-dolly"
                    placeholder="Enter plus one's name"
                    {...signUpForm.register('plusOneName')}
                  />
                  {signUpForm.formState.errors.plusOneName && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.plusOneName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plusOneEmail" className="font-dolly">Plus One Email</Label>
                  <Input
                    id="plusOneEmail"
                    type="email"
                    className="glass-input font-dolly"
                    placeholder="Enter plus one's email"
                    {...signUpForm.register('plusOneEmail')}
                  />
                  {signUpForm.formState.errors.plusOneEmail && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.plusOneEmail.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    We'll send them a magic link to join the app after you sign up.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex-1 font-dolly"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1 bg-wedding-navy hover:bg-wedding-navy-light min-h-[44px] font-dolly"
            >
              Next: Wedding Details
            </Button>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="space-y-2">
            <Label htmlFor="relationshipToCouple" className="font-dolly">Relationship to Couple</Label>
            <Select 
              value={signUpForm.watch('relationshipToCouple')} 
              onValueChange={(value) => signUpForm.setValue('relationshipToCouple', value)}
            >
              <SelectTrigger className="glass-input font-dolly">
                <SelectValue placeholder="Select your relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((group) => (
                  <div key={group.group}>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.group}
                    </div>
                    {group.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {signUpForm.formState.errors.relationshipToCouple && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.relationshipToCouple.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="font-dolly">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              type="text"
              className="glass-input font-dolly"
              placeholder="Name and phone number"
              {...signUpForm.register('emergencyContact')}
            />
            {signUpForm.formState.errors.emergencyContact && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.emergencyContact.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium font-dolly flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Dietary Requirements
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {DIETARY_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dietary-${option}`}
                      checked={signUpForm.watch('dietaryRequirements')?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const current = signUpForm.getValues('dietaryRequirements') || [];
                        if (checked) {
                          signUpForm.setValue('dietaryRequirements', [...current, option]);
                        } else {
                          signUpForm.setValue('dietaryRequirements', current.filter(item => item !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`dietary-${option}`} className="text-sm font-dolly">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-base font-medium font-dolly">Allergies</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ALLERGY_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergy-${option}`}
                      checked={signUpForm.watch('allergies')?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const current = signUpForm.getValues('allergies') || [];
                        if (checked) {
                          signUpForm.setValue('allergies', [...current, option]);
                        } else {
                          signUpForm.setValue('allergies', current.filter(item => item !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`allergy-${option}`} className="text-sm font-dolly">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {hasExistingRSVP && guestMatch && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">You've already RSVP'd!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                We have your response as: {guestMatch.rsvpStatus === 'attending' ? "Yes, attending" : "Not attending"}
              </p>
            </div>
          )}

          {!hasExistingRSVP && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border-2 border-wedding-navy/20">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold font-dolly text-wedding-navy">
                    Tim & Kirsten's Wedding
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    October 5th, 2025 • Ben Ean Winery
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Arrival: 2:30 PM • Ceremony: 3:00 PM
                  </p>
                </div>
                <Label className="text-base font-medium font-dolly flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-wedding-navy" />
                  Will you be able to attend our wedding?
                </Label>
                <RSVPRadioButtons 
                  name="attending" 
                  defaultValue="yes"
                  className="mt-2"
                />
            </div>
          </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="specialAccommodations" className="font-dolly">Special Accommodations</Label>
            <Textarea
              id="specialAccommodations"
              className="glass-input font-dolly resize-none"
              placeholder="Any accessibility needs, special requests, or accommodations..."
              rows={3}
              {...signUpForm.register('specialAccommodations')}
            />
            {signUpForm.formState.errors.specialAccommodations && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.specialAccommodations.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="font-dolly flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tell us about yourself (Bio)
            </Label>
            <Textarea
              id="bio"
              className="glass-input font-dolly resize-none"
              placeholder="Share a little about yourself, your hobbies, or your connection to the couple..."
              rows={4}
              {...signUpForm.register('bio')}
            />
            {signUpForm.formState.errors.bio && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="font-dolly text-base font-medium">Profile Picture (Optional)</Label>
            <div className="flex justify-center">
              <ProfilePictureSignup
                onImageSelect={setProfilePictureFile}
                size="lg"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex-1 font-dolly"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-wedding-navy hover:bg-wedding-navy-light min-h-[44px] font-dolly"
              disabled={signUpForm.formState.isSubmitting}
            >
              {signUpForm.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-glass-blue hover:text-glass-blue/80 transition-colors min-h-[44px] text-sm px-2 py-2 font-dolly"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
};