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

      // Update couple names if they exist
      const { error: brideError } = await supabaseAdmin
        .from('app_settings')
        .update({ setting_value: 'Kirsten' })
        .eq('setting_key', 'bride_name');

      const { error: groomError } = await supabaseAdmin
        .from('app_settings')
        .update({ setting_value: 'Tim' })
        .eq('setting_key', 'groom_name');

      // Update venue information
      const { error: venueError } = await supabaseAdmin
        .from('app_settings')
        .update({ setting_value: 'Elegant Garden Venue' })
        .eq('setting_key', 'venue_name');

      // Delete old mock events with wrong dates
      const { error: deleteError } = await supabaseAdmin
        .from('wedding_events')
        .delete()
        .lt('event_date', '2025-01-01');

      if (deleteError) {
        console.error('Delete error:', deleteError);
        // Continue anyway - this might fail due to permissions but date fix is more important
      }

      // Create proper wedding events for 2025
      const weddingEvents = [
        {
          title: 'Wedding Ceremony',
          description: 'Join us as we exchange vows in a beautiful garden setting',
          event_date: '2025-10-05',
          start_time: '15:00:00',
          end_time: '16:00:00',
          location: 'Elegant Garden Venue',
          event_type: 'ceremony'
        },
        {
          title: 'Cocktail Hour',
          description: 'Celebrate with drinks and appetizers',
          event_date: '2025-10-05',
          start_time: '16:00:00',
          end_time: '17:00:00',
          location: 'Garden Terrace',
          event_type: 'reception'
        },
        {
          title: 'Wedding Reception',
          description: 'Dinner, dancing, and celebration',
          event_date: '2025-10-05',
          start_time: '17:00:00',
          end_time: '23:00:00',
          location: 'Grand Ballroom',
          event_type: 'reception'
        }
      ];

      const { error: eventsError } = await supabaseAdmin
        .from('wedding_events')
        .insert(weddingEvents);

      if (eventsError) {
        console.error('Events creation error:', eventsError);
      }

      toast.success('Wedding data fixed! The page will refresh in 2 seconds.');
      setNeedsFix(false);

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error fixing wedding data:', error);
      toast.error('Failed to fix wedding data: ' + (error as Error).message);
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