import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeferredProfilePicture = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const uploadDeferredProfilePicture = async () => {
      if (!user?.id) return;

      // Check for pending profile picture
      const base64Data = sessionStorage.getItem('pending_profile_picture');
      const fileType = sessionStorage.getItem('pending_profile_picture_type');
      const fileName = sessionStorage.getItem('pending_profile_picture_name');
      const targetUserId = sessionStorage.getItem('pending_profile_picture_user_id');

      // Only proceed if we have data and it's for the current user
      if (!base64Data || !fileType || !fileName || targetUserId !== user.id) return;

      try {
        // Convert base64 to blob
        const base64Response = await fetch(base64Data);
        const blob = await base64Response.blob();
        const file = new File([blob], fileName, { type: fileType });

        // Generate unique filename
        const fileExt = fileName.split('.').pop();
        const uploadFileName = `profile-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${uploadFileName}`;

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
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Clear session storage
        sessionStorage.removeItem('pending_profile_picture');
        sessionStorage.removeItem('pending_profile_picture_type');
        sessionStorage.removeItem('pending_profile_picture_name');
        sessionStorage.removeItem('pending_profile_picture_user_id');

        toast({
          title: "Profile Picture Uploaded",
          description: "Your profile picture has been successfully uploaded!",
        });

      } catch (error) {
        console.error('Failed to upload deferred profile picture:', error);
        
        // Clear session storage on error to prevent repeated attempts
        sessionStorage.removeItem('pending_profile_picture');
        sessionStorage.removeItem('pending_profile_picture_type');
        sessionStorage.removeItem('pending_profile_picture_name');
        sessionStorage.removeItem('pending_profile_picture_user_id');
      }
    };

    uploadDeferredProfilePicture();
  }, [user?.id, toast]);
};