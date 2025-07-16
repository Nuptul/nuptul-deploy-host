import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, profileData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track if we're currently fetching to prevent duplicates
  const fetchingRef = useRef<string | null>(null);
  const dataCache = useRef<{ profile: Profile | null; userRole: UserRole | null; userId: string } | null>(null);
  const lastFetch = useRef<number>(0);

  const checkAndUploadDeferredProfilePicture = useCallback(async (userId: string) => {
    // Check for pending profile picture
    const base64Data = sessionStorage.getItem('pending_profile_picture');
    const fileType = sessionStorage.getItem('pending_profile_picture_type');
    const fileName = sessionStorage.getItem('pending_profile_picture_name');
    const targetUserId = sessionStorage.getItem('pending_profile_picture_user_id');

    // Only proceed if we have data and it's for the current user
    if (!base64Data || !fileType || !fileName || targetUserId !== userId) return;

    try {
      // Convert base64 to blob
      const base64Response = await fetch(base64Data);
      const blob = await base64Response.blob();
      const file = new File([blob], fileName, { type: fileType });

      // Generate unique filename
      const fileExt = fileName.split('.').pop();
      const uploadFileName = `profile-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${uploadFileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-profiles')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (!updateError) {
        console.log('Deferred profile picture uploaded successfully');
      }

      // Clear session storage
      sessionStorage.removeItem('pending_profile_picture');
      sessionStorage.removeItem('pending_profile_picture_type');
      sessionStorage.removeItem('pending_profile_picture_name');
      sessionStorage.removeItem('pending_profile_picture_user_id');

    } catch (error) {
      console.error('Failed to upload deferred profile picture:', error);
      
      // Clear session storage on error to prevent repeated attempts
      sessionStorage.removeItem('pending_profile_picture');
      sessionStorage.removeItem('pending_profile_picture_type');
      sessionStorage.removeItem('pending_profile_picture_name');
      sessionStorage.removeItem('pending_profile_picture_user_id');
    }
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (fetchingRef.current === userId) {
      return;
    }

    // Use cache if data is fresh (less than 10 seconds old)
    const now = Date.now();
    if (dataCache.current && dataCache.current.userId === userId && now - lastFetch.current < 10000) {
      setProfile(dataCache.current.profile);
      setUserRole(dataCache.current.userRole);
      return;
    }

    fetchingRef.current = userId;

    try {
      // Get current user for email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Fetch both profile and user role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileResult.error);
      }
      
      if (roleResult.error && roleResult.error.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleResult.error);
      }
      
      // If no profile exists, create one
      if (!profileResult.data && currentUser) {
        console.log('Creating missing profile for user:', userId);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            email: currentUser.email || '',
            first_name: currentUser.user_metadata?.firstName || '',
            last_name: currentUser.user_metadata?.lastName || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          profileResult.data = newProfile;
        }
      }
      
      // If no role exists, create default guest role
      if (!roleResult.data && currentUser) {
        console.log('Creating missing role for user:', userId);
        const { data: newRole, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'guest',
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (roleError) {
          console.error('Error creating role:', roleError);
        } else {
          roleResult.data = newRole;
        }
      }
      
      // Update cache
      dataCache.current = {
        profile: profileResult.data,
        userRole: roleResult.data || null,
        userId
      };
      lastFetch.current = Date.now();
      
      // Update state
      setProfile(profileResult.data);
      setUserRole(roleResult.data || null);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      fetchingRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          // Defer Supabase calls to prevent auth deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 100);
        } else {
          setProfile(null);
          setUserRole(null);
          // Clear cache when user logs out
          dataCache.current = null;
          lastFetch.current = 0;
          fetchingRef.current = null;
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array - this effect should only run once

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, profileData?: any) => {
    const redirectUrl = `${window.location.origin}/auth/confirm`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
          phone: profileData?.phone,
          role: 'guest' // Default role for new users
        }
      }
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/confirm`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/confirm`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    let error;
    
    if (existingProfile) {
      // Update existing profile using user_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      error = updateError;
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email || '',
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      error = insertError;
    }
    
    if (!error) {
      // Clear cache and refetch to get updated data
      dataCache.current = null;
      lastFetch.current = 0;
      fetchingRef.current = null;
      await fetchUserData(user.id);
    }
    
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithMagicLink,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};