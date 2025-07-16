import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SupabaseTest: React.FC = () => {
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test 1: Check guest_list table
        console.log('Testing guest_list table...');
        try {
          const { data: guestData, error: guestError } = await supabase
            .from('guest_list')
            .select('id, name')
            .limit(1);

          if (guestError) {
            console.error('Guest list error:', guestError);
            setError(`Guest list error: ${guestError.message}`);
            return;
          }

          console.log('Sample guest data:', guestData);

          const { count: guestCount } = await supabase
            .from('guest_list')
            .select('*', { count: 'exact', head: true });

          setGuestCount(guestCount || 0);
          console.log('Guest count:', guestCount);
        } catch (err) {
          console.error('Guest list exception:', err);
          setError(`Guest list exception: ${err}`);
          return;
        }

        // Test 2: Check auth.users (admin access)
        console.log('Testing auth.users access...');
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

        if (userError) {
          console.error('User auth error:', userError);
          setError(`Auth error: ${userError.message}`);
          return;
        }

        setUserCount(userData?.users?.length || 0);
        console.log('User count:', userData?.users?.length);

        console.log('All tests passed!');
      } catch (err) {
        console.error('Test error:', err);
        setError(`Connection error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white/20">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      
      {loading && <p>Testing connection...</p>}
      
      {error && (
        <div className="text-red-600 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="space-y-2">
          <div className="text-green-600">
            ✅ <strong>Guest List:</strong> {guestCount} guests found
          </div>
          <div className="text-green-600">
            ✅ <strong>Users:</strong> {userCount} users found
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;