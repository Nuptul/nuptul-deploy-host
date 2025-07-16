import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const FixWeddingData: React.FC = () => {
  const [fixing, setFixing] = useState(false);
  const [needsFix, setNeedsFix] = useState(false);

  useEffect(() => {
    // Check if data needs fixing
    const checkData = async () => {
      try {
        const { data } = await supabaseAdmin
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', 'wedding_date')
          .single();
        
        if (data?.setting_value === '2024-06-15') {
          setNeedsFix(true);
        }
      } catch (error) {
        console.error('Error checking data:', error);
      }
    };
    
    checkData();
  }, []);

  const fixWeddingData = async () => {
    setFixing(true);
    try {
      
      
      // Fix app settings wedding date
      const { error: dateError } = await supabaseAdmin
        .from('app_settings')
        .update({ setting_value: '2025-10-05' })
        .eq('setting_key', 'wedding_date');
      
      if (dateError) {
        console.error('Date update error:', dateError);
        toast.error('Failed to update wedding date');
        return;
      }
      
      
      
      // Delete old mock events with wrong dates
      const { error: deleteError } = await supabaseAdmin
        .from('wedding_events')
        .delete()
        .lt('event_date', '2025-01-01');
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
        // Continue anyway - this might fail due to permissions but date fix is more important
      } else {
        
      }
      
      toast.success('Wedding data fixed! The page will refresh in 2 seconds.');
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error fixing wedding data:', error);
      toast.error('Failed to fix wedding data: ' + error.message);
    } finally {
      setFixing(false);
    }
  };

  if (!needsFix) {
    return null; // Don't show if data is already correct
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={fixWeddingData}
        disabled={fixing}
        className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
        size="lg"
      >
        {fixing ? 'Fixing...' : '🔧 Fix Wedding Date'}
      </Button>
    </div>
  );
};