import React, { useState, useEffect } from 'react';
import { IconPhone, IconUser, IconUserCircle } from '@tabler/icons-react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';

const ContactInfo: React.FC = () => {
  const { settings } = useAppSettings();
  const [contactDetails, setContactDetails] = useState({
    tim_phone: '0401 372 025',
    kirsten_phone: '0402 180 915'
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['tim_phone', 'kirsten_phone']);

        if (data && !error) {
          const contactMap: Record<string, string> = {};
          data.forEach(setting => {
            contactMap[setting.setting_key] = setting.setting_value;
          });
          setContactDetails(prev => ({ ...prev, ...contactMap }));
        }
      } catch (error) {
        console.error('Error fetching contact details:', error);
      }
    };

    fetchContactDetails();
  }, []);

  return (
    <div 
      className="p-8 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(255, 154, 0, 0.12) 100%)',
        backdropFilter: 'blur(20px) saturate(2)',
        WebkitBackdropFilter: 'blur(20px) saturate(2)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.12),
          inset 0 1px 1px rgba(255, 255, 255, 0.35),
          inset 0 -1px 1px rgba(0, 0, 0, 0.05)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative glass orb */}
      <div 
        style={{
          position: 'absolute',
          top: '-40%',
          left: '-20%',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />
      
      <div className="text-center relative z-10">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            boxShadow: '0 8px 24px rgba(0, 122, 255, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
          }}
        >
          <IconPhone size={32} className="text-white" stroke={1.5} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#000000', fontFamily: '"Bodoni Moda", serif', letterSpacing: '-0.01em' }}>Get in Touch</h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(0, 0, 0, 0.75)', lineHeight: '1.6', fontFamily: '"Montserrat", sans-serif', fontWeight: '400' }}>
          {settings.contact_message || 'For any questions about the wedding, please don\'t hesitate to reach out to us.'}
        </p>
      </div>
      
      <div
        className="mt-8 rounded-2xl p-6 max-w-sm mx-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0.65) 100%)',
          backdropFilter: 'blur(20px) saturate(2)',
          WebkitBackdropFilter: 'blur(20px) saturate(2)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="space-y-4">
          <a
            href={`tel:${contactDetails.tim_phone.replace(/\s/g, '')}`}
            className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(0, 122, 255, 0.02) 100%)',
              border: '1px solid rgba(0, 122, 255, 0.1)',
              minHeight: '64px'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%)',
                  border: '1px solid rgba(0, 122, 255, 0.2)'
                }}
              >
                <IconUser size={20} style={{ color: '#007AFF' }} stroke={1.5} />
              </div>
              <span className="font-semibold text-lg" style={{ color: '#000000', fontFamily: '"Montserrat", sans-serif' }}>Tim</span>
            </div>
            <span className="text-lg font-medium" style={{ color: '#007AFF' }}>{contactDetails.tim_phone}</span>
          </a>

          <a
            href={`tel:${contactDetails.kirsten_phone.replace(/\s/g, '')}`}
            className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(0, 122, 255, 0.02) 100%)',
              border: '1px solid rgba(0, 122, 255, 0.1)',
              minHeight: '64px'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 45, 85, 0.15) 0%, rgba(255, 45, 85, 0.05) 100%)',
                  border: '1px solid rgba(255, 45, 85, 0.2)'
                }}
              >
                <IconUserCircle size={20} style={{ color: '#FF2D55' }} stroke={1.5} />
              </div>
              <span className="font-semibold text-lg" style={{ color: '#000000', fontFamily: '"Montserrat", sans-serif' }}>Kirsten</span>
            </div>
            <span className="text-lg font-medium" style={{ color: '#007AFF' }}>{contactDetails.kirsten_phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;