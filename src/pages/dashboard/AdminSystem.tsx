import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, AlertCircle } from 'lucide-react';
import SystemActions from '@/components/admin/SystemActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

const AdminSystem: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
          }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(0, 0, 0, 0.7)' }} />
        </button>
        <div>
          <h1 style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: '28px',
            fontWeight: '600',
            color: '#002147'
          }}>System Management</h1>
          <p style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.6)'
          }}>Execute system-level actions and maintenance tasks</p>
        </div>
      </div>

      {/* Warning Alert */}
      <div 
        className={`mb-6 p-4 rounded-2xl flex items-start gap-3 ${styles.liquidGlassCard}`}
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderLeft: '4px solid #f59e0b',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '4px'
          }}>Admin Access Only</h3>
          <p style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '14px',
            color: '#b45309'
          }}>
            These actions can significantly affect system data and performance. 
            Please ensure you understand the implications before executing any action.
          </p>
        </div>
      </div>

      {/* System Information */}
      <div 
        className={`mb-6 p-6 rounded-2xl ${styles.liquidGlassCard}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-wedding-navy" />
          <h2 style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: '20px',
            fontWeight: '600',
            color: '#002147'
          }}>System Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
            }}
          >
            <div style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>Environment</div>
            <div style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#002147'
            }}>
              {window.location.hostname === 'localhost' ? 'Development' : 'Production'}
            </div>
          </div>
          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
            }}
          >
            <div style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>Database</div>
            <div style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#002147'
            }}>Supabase PostgreSQL</div>
          </div>
          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(31, 38, 135, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)'
            }}
          >
            <div style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.6)'
            }}>Storage</div>
            <div style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#002147'
            }}>Supabase Storage</div>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div 
        className={`p-6 rounded-2xl ${styles.liquidGlassCard}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <h2 style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: '20px',
          fontWeight: '600',
          color: '#002147',
          marginBottom: '16px'
        }}>System Actions</h2>
        <SystemActions />
      </div>
    </div>
  );
};

export default AdminSystem;