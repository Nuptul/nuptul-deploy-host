import { supabase } from '@/integrations/supabase/client';

export interface SimpleRSVPData {
  userId: string;
  attendance: 'yes' | 'no' | 'maybe';
  firstName: string;
  lastName: string;
  email: string;
}

interface SimpleRSVPResult {
  success: boolean;
  error?: string;
  rsvpId?: string;
}

/**
 * Submit simplified RSVP - just capture Yes/No/Maybe response
 */
export async function submitSimpleRSVP(data: SimpleRSVPData): Promise<SimpleRSVPResult> {
  try {
    // Log RSVP submission if in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Starting simple RSVP submission...', {
        userId: data.userId,
        attendance: data.attendance,
        email: data.email
      });
    }

    // Step 1: Update profile with basic info and mark RSVP complete
    const profileUpdate = {
      first_name: data.firstName,
      last_name: data.lastName,
      rsvp_completed: true,
      updated_at: new Date().toISOString()
    };

    
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('user_id', data.userId);

    if (profileError) {
      console.error('❌ Profile update error:', profileError);
      throw new Error(`Profile update failed: ${profileError.message}`);
    }
    

    // Step 2: Get main wedding event
    
    const { data: mainEvents, error: eventsError } = await supabase
      .from('wedding_events')
      .select('id, title, event_date')
      .eq('is_main_event', true)
      .order('event_date', { ascending: true })
      .limit(1);

    if (eventsError) {
      console.error('❌ Events fetch error:', eventsError);
      throw new Error(`Events fetch failed: ${eventsError.message}`);
    }

    if (!mainEvents || mainEvents.length === 0) {
      console.error('❌ No main wedding events found');
      throw new Error('No main wedding event found');
    }

    const mainEvent = mainEvents[0];
    

    // Step 3: Check if RSVP already exists
    
    const { data: existingRSVP, error: checkError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('user_id', data.userId)
      .eq('event_id', mainEvent.id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ RSVP check error:', checkError);
      throw new Error(`RSVP check failed: ${checkError.message}`);
    }

    // Step 4: Create simplified RSVP data (constraint fixed, so simple approach works)
    const rsvpData = {
      user_id: data.userId,
      event_id: mainEvent.id,
      status: data.attendance === 'yes' ? 'attending' : 
              data.attendance === 'no' ? 'declined' : 'maybe',
      guest_count: data.attendance === 'yes' ? 1 : 0,
      message: data.attendance === 'maybe' ? 'Guest responded maybe' : 
               data.attendance === 'no' ? 'Guest declined' : null,
      updated_at: new Date().toISOString()
    };

    let rsvpResult;

    if (existingRSVP) {
      
      rsvpResult = await supabase
        .from('rsvps')
        .update(rsvpData)
        .eq('id', existingRSVP.id)
        .select('id')
        .single();
    } else {
      
      rsvpResult = await supabase
        .from('rsvps')
        .insert([{ ...rsvpData, created_at: new Date().toISOString() }])
        .select('id')
        .single();
    }

    if (rsvpResult.error) {
      console.error('❌ RSVP operation error:', rsvpResult.error);
      throw new Error(`RSVP operation failed: ${rsvpResult.error.message}`);
    }

    const rsvpId = rsvpResult.data?.id;
    if (!rsvpId) {
      throw new Error('RSVP operation succeeded but no ID returned');
    }

    

    return {
      success: true,
      rsvpId: rsvpId
    };

  } catch (error) {
    console.error('💥 Simple RSVP submission error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get simplified RSVP status for display
 */
export async function getSimpleRSVPStatus(userId: string) {
  try {
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select(`
        status,
        guest_count,
        created_at,
        wedding_events!inner(is_main_event, title, event_date)
      `)
      .eq('user_id', userId)
      .eq('wedding_events.is_main_event', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching simple RSVP status:', error);
      return null;
    }

    return rsvps?.[0] || null;
  } catch (error) {
    console.error('Error in getSimpleRSVPStatus:', error);
    return null;
  }
}