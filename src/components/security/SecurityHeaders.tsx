import { useEffect } from 'react';

interface SecurityHeadersProps {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
}

/**
 * Security Headers Component
 * Implements OWASP security headers for client-side protection
 * Note: In production, these should be set at the server/CDN level
 */
export const SecurityHeaders: React.FC<SecurityHeadersProps> = ({
  enableCSP = true,
  enableHSTS = true,
  enableXFrameOptions = true,
  enableContentTypeOptions = true,
  enableReferrerPolicy = true,
}) => {
  useEffect(() => {
    // Content Security Policy
    if (enableCSP) {
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-inline/eval needed for React dev
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "font-src 'self' fonts.gstatic.com data:",
        "img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com",
        "connect-src 'self' wss: https://*.supabase.co https://api.mapbox.com",
        "media-src 'self' blob: https://*.supabase.co",
        "object-src 'none'",
        "frame-src 'none'",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ');
      
      // Remove existing CSP meta tag if present
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.remove();
      }
      
      document.head.appendChild(cspMeta);
    }

    // X-Frame-Options (Clickjacking protection)
    if (enableXFrameOptions) {
      const frameMeta = document.createElement('meta');
      frameMeta.httpEquiv = 'X-Frame-Options';
      frameMeta.content = 'DENY';
      
      const existingFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (existingFrame) {
        existingFrame.remove();
      }
      
      document.head.appendChild(frameMeta);
    }

    // X-Content-Type-Options (MIME type sniffing protection)
    if (enableContentTypeOptions) {
      const contentTypeMeta = document.createElement('meta');
      contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
      contentTypeMeta.content = 'nosniff';
      
      const existingContentType = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (existingContentType) {
        existingContentType.remove();
      }
      
      document.head.appendChild(contentTypeMeta);
    }

    // Referrer Policy
    if (enableReferrerPolicy) {
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      
      const existingReferrer = document.querySelector('meta[name="referrer"]');
      if (existingReferrer) {
        existingReferrer.remove();
      }
      
      document.head.appendChild(referrerMeta);
    }

    // Permissions Policy (Feature Policy)
    const permissionsMeta = document.createElement('meta');
    permissionsMeta.httpEquiv = 'Permissions-Policy';
    permissionsMeta.content = [
      'geolocation=(self)',
      'microphone=(self)',
      'camera=(self)',
      'payment=(self)',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'speaker=(self)',
      'vibrate=(self)',
      'fullscreen=(self)'
    ].join(', ');
    
    const existingPermissions = document.querySelector('meta[http-equiv="Permissions-Policy"]');
    if (existingPermissions) {
      existingPermissions.remove();
    }
    
    document.head.appendChild(permissionsMeta);

    // Add HSTS suggestion meta (actual HSTS must be set by server)
    if (enableHSTS) {
      const hstsMeta = document.createElement('meta');
      hstsMeta.name = 'force-https';
      hstsMeta.content = 'true';
      
      const existingHSTS = document.querySelector('meta[name="force-https"]');
      if (existingHSTS) {
        existingHSTS.remove();
      }
      
      document.head.appendChild(hstsMeta);
    }

    // Cleanup function
    return () => {
      // Cleanup is handled by removing existing meta tags before adding new ones
    };
  }, [enableCSP, enableHSTS, enableXFrameOptions, enableContentTypeOptions, enableReferrerPolicy]);

  return null; // This component doesn't render anything visible
};

export default SecurityHeaders;