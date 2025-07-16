import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Car, AlertTriangle, Users, MapPin, Clock } from 'lucide-react';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

const TransportPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen px-3 sm:px-5 pt-8 sm:pt-12 pb-20">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 animate-fade-up">
        <h1 style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: '32px',
          fontWeight: '600',
          color: '#002147',
          marginBottom: '12px'
        }}>
          Transportation
        </h1>
        <p style={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '16px',
          color: 'rgba(0, 0, 0, 0.6)',
          maxWidth: '32rem',
          margin: '0 auto'
        }}>
          Getting to and from Ben Ean for our wedding celebration
        </p>
      </div>

      {/* Coach Transport - Primary Option */}
      <div className="mb-8 animate-fade-up">
        <div 
          className={`p-6 lg:p-8 rounded-2xl ${styles.liquidGlassCard}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
            backdropFilter: 'blur(25px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '24px',
                fontWeight: '600',
                color: '#002147'
              }}>Free Coach Service</h2>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>Recommended transport option</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>Newcastle City Pickup</span>
              </div>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                For guests staying in Newcastle city center and surrounding areas.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#000000'
                }}>Hunter Valley Pickup</span>
              </div>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                For guests staying in Hunter Valley accommodation.
              </p>
            </div>
          </div>

          <div 
            className={`p-4 rounded-xl ${styles.liquidGlassCard}`}
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
          >
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '4px'
                }}>First Come, First Served</p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '12px',
                  color: '#1d4ed8'
                }}>
                  Coach seats are limited and allocated on a first-come, first-served basis. 
                  Please indicate in your RSVP how many seats you need and your pickup location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driving Option */}
      <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '24px',
                fontWeight: '600',
                color: '#002147'
              }}>Driving to the Venue</h2>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>Approximately 1 hour from Newcastle</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                color: '#002147',
                marginBottom: '8px'
              }}>Parking Available</h3>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                There is plenty of on-site parking available at Ben Ean for guests who choose to drive.
              </p>
            </div>
            <div>
              <h3 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                color: '#002147',
                marginBottom: '8px'
              }}>Carpooling</h3>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)',
                marginBottom: '12px'
              }}>
                Let us know in your RSVP if you're planning to drive and would like to carpool or are looking for a seat. 
                We'll connect guests whose travel plans align.
              </p>
              <button 
                onClick={() => navigate('/carpooling')}
                className={`rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${styles.actionButton}`}
                style={{
                  minWidth: '180px',
                  minHeight: '44px',
                  padding: '0 16px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.1) 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                }}
              >
                <Users className="w-4 h-4" style={{ color: '#22c55e' }} />
                <span style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#22c55e'
                }}>Find or Offer a Ride</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Uber Warning */}
      <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div 
          className={`p-4 sm:p-6 rounded-2xl ${styles.liquidGlassCard}`}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
            backdropFilter: 'blur(25px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderLeft: '4px solid #f59e0b',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                color: '#002147',
                marginBottom: '8px'
              }}>
                Important: Uber Not Recommended
              </h3>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.7)',
                lineHeight: '1.5'
              }}>
                We do not recommend using Uber as there is limited availability, particularly in the Hunter Valley area. 
                Please plan to use the coach service or arrange alternative transport.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Address */}
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div 
          className={`p-6 text-center rounded-2xl ${styles.liquidGlassCard}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
            backdropFilter: 'blur(25px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(25px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wedding-navy/10 to-wedding-navy/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MapPin className="w-6 h-6 text-wedding-navy" />
          </div>
          <h3 style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: '20px',
            fontWeight: '600',
            color: '#002147',
            marginBottom: '8px'
          }}>Venue Address</h3>
          <p style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.6)',
            lineHeight: '1.5'
          }}>
            Ben Ean<br />
            119 McDonalds Rd, Pokolbin NSW 2320
          </p>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=119+McDonalds+Rd+Pokolbin+NSW+2320"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '12px',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: '#3b82f6',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransportPage;