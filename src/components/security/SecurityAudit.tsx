import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'pass' | 'fail' | 'warning' | 'info';
  details: string;
  recommendation?: string;
}

interface SecurityAuditProps {
  onAuditComplete?: (results: SecurityCheck[]) => void;
  showDetails?: boolean;
}

/**
 * OWASP-compliant security audit component
 * Performs client-side security checks and vulnerability assessment
 */
export const SecurityAudit: React.FC<SecurityAuditProps> = ({
  onAuditComplete,
  showDetails = false,
}) => {
  const [auditResults, setAuditResults] = useState<SecurityCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(showDetails);

  const runSecurityAudit = async () => {
    setIsRunning(true);
    const results: SecurityCheck[] = [];

    // Check 1: HTTPS Usage
    const isHTTPS = window.location.protocol === 'https:';
    results.push({
      id: 'https-check',
      name: 'HTTPS Protocol',
      description: 'Verify secure transport layer encryption',
      severity: 'critical',
      status: isHTTPS ? 'pass' : 'fail',
      details: isHTTPS 
        ? 'Application is served over HTTPS' 
        : 'Application is not using HTTPS - data transmission is not encrypted',
      recommendation: isHTTPS 
        ? undefined 
        : 'Configure HTTPS in production environment',
    });

    // Check 2: Content Security Policy
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    results.push({
      id: 'csp-check',
      name: 'Content Security Policy',
      description: 'Check for XSS protection headers',
      severity: 'high',
      status: cspMeta ? 'pass' : 'warning',
      details: cspMeta 
        ? `CSP header configured: ${(cspMeta as HTMLMetaElement).content.substring(0, 100)}...`
        : 'No Content Security Policy meta tag found',
      recommendation: cspMeta 
        ? undefined 
        : 'Implement Content Security Policy to prevent XSS attacks',
    });

    // Check 3: X-Frame-Options
    const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    results.push({
      id: 'frame-options-check',
      name: 'X-Frame-Options',
      description: 'Clickjacking protection',
      severity: 'medium',
      status: frameOptions ? 'pass' : 'warning',
      details: frameOptions 
        ? 'X-Frame-Options header configured'
        : 'No X-Frame-Options protection found',
      recommendation: frameOptions 
        ? undefined 
        : 'Set X-Frame-Options to prevent clickjacking attacks',
    });

    // Check 4: Mixed Content
    const mixedContentElements = document.querySelectorAll('script[src^="http:"], link[href^="http:"], img[src^="http:"]');
    const hasMixedContent = mixedContentElements.length > 0;
    results.push({
      id: 'mixed-content-check',
      name: 'Mixed Content',
      description: 'Check for insecure HTTP resources',
      severity: 'high',
      status: hasMixedContent ? 'fail' : 'pass',
      details: hasMixedContent 
        ? `Found ${mixedContentElements.length} insecure HTTP resources`
        : 'No mixed content detected',
      recommendation: hasMixedContent 
        ? 'Replace all HTTP resources with HTTPS versions'
        : undefined,
    });

    // Check 5: Environment Variables Exposure
    const hasExposedEnv = Object.keys(import.meta.env).some(key => 
      key.includes('SECRET') || key.includes('PRIVATE') || key.includes('PASSWORD')
    );
    results.push({
      id: 'env-exposure-check',
      name: 'Environment Variables',
      description: 'Check for exposed sensitive data',
      severity: 'critical',
      status: hasExposedEnv ? 'fail' : 'pass',
      details: hasExposedEnv 
        ? 'Sensitive environment variables detected in client bundle'
        : 'No sensitive environment variables exposed',
      recommendation: hasExposedEnv 
        ? 'Remove sensitive data from client-side environment variables'
        : undefined,
    });

    // Check 6: Console Logs in Production
    const hasConsoleOverride = typeof 
    results.push({
      id: 'console-logs-check',
      name: 'Console Logs',
      description: 'Check for debug information leakage',
      severity: 'low',
      status: import.meta.env.PROD && !hasConsoleOverride ? 'warning' : 'pass',
      details: import.meta.env.PROD && !hasConsoleOverride
        ? 'Console logs may be exposed in production'
        : 'Console logs properly handled',
      recommendation: import.meta.env.PROD && !hasConsoleOverride
        ? 'Strip console logs in production build'
        : undefined,
    });

    // Check 7: Local Storage Security
    try {
      const localStorageKeys = Object.keys(localStorage);
      const sensitiveKeys = localStorageKeys.filter(key => 
        key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('secret') || 
        key.toLowerCase().includes('token')
      );
      
      results.push({
        id: 'localstorage-check',
        name: 'Local Storage Security',
        description: 'Check for sensitive data in local storage',
        severity: 'medium',
        status: sensitiveKeys.length > 0 ? 'warning' : 'pass',
        details: sensitiveKeys.length > 0 
          ? `Found ${sensitiveKeys.length} potentially sensitive keys in localStorage`
          : 'No sensitive data detected in localStorage',
        recommendation: sensitiveKeys.length > 0 
          ? 'Avoid storing sensitive data in localStorage; use secure, httpOnly cookies instead'
          : undefined,
      });
    } catch (error) {
      results.push({
        id: 'localstorage-check',
        name: 'Local Storage Security',
        description: 'Check for sensitive data in local storage',
        severity: 'info',
        status: 'info',
        details: 'Cannot access localStorage (may be disabled)',
        recommendation: undefined,
      });
    }

    // Check 8: Third-Party Scripts
    const thirdPartyScripts = Array.from(document.querySelectorAll('script[src]'))
      .filter(script => {
        const src = (script as HTMLScriptElement).src;
        return src && !src.startsWith(window.location.origin);
      });
    
    results.push({
      id: 'third-party-scripts-check',
      name: 'Third-Party Scripts',
      description: 'External script security assessment',
      severity: 'medium',
      status: thirdPartyScripts.length > 0 ? 'warning' : 'pass',
      details: thirdPartyScripts.length > 0 
        ? `Found ${thirdPartyScripts.length} third-party scripts`
        : 'No third-party scripts detected',
      recommendation: thirdPartyScripts.length > 0 
        ? 'Review third-party scripts for security and implement Subresource Integrity (SRI)'
        : undefined,
    });

    // Check 9: Form Security
    const forms = document.querySelectorAll('form');
    const insecureForms = Array.from(forms).filter(form => 
      !form.getAttribute('action')?.startsWith('https://') && 
      form.getAttribute('action')?.startsWith('http://')
    );
    
    results.push({
      id: 'form-security-check',
      name: 'Form Security',
      description: 'Form submission security',
      severity: 'high',
      status: insecureForms.length > 0 ? 'fail' : 'pass',
      details: insecureForms.length > 0 
        ? `Found ${insecureForms.length} forms submitting to insecure HTTP endpoints`
        : 'All forms use secure submission methods',
      recommendation: insecureForms.length > 0 
        ? 'Update form actions to use HTTPS endpoints'
        : undefined,
    });

    // Check 10: Cookie Security
    const cookies = document.cookie;
    const hasSecureCookies = cookies.includes('Secure') && cookies.includes('HttpOnly');
    results.push({
      id: 'cookie-security-check',
      name: 'Cookie Security',
      description: 'Cookie security attributes',
      severity: 'medium',
      status: cookies.length === 0 ? 'info' : hasSecureCookies ? 'pass' : 'warning',
      details: cookies.length === 0 
        ? 'No cookies detected'
        : hasSecureCookies 
        ? 'Cookies have proper security attributes'
        : 'Cookies may lack security attributes (Secure, HttpOnly, SameSite)',
      recommendation: cookies.length > 0 && !hasSecureCookies 
        ? 'Set Secure, HttpOnly, and SameSite attributes on cookies'
        : undefined,
    });

    setAuditResults(results);
    setIsRunning(false);
    
    if (onAuditComplete) {
      onAuditComplete(results);
    }
  };

  useEffect(() => {
    runSecurityAudit();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'info': return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info': return <Shield className="h-4 w-4 text-blue-400" />;
      default: return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const criticalIssues = auditResults.filter(r => r.status === 'fail' && r.severity === 'critical').length;
  const highIssues = auditResults.filter(r => r.status === 'fail' && r.severity === 'high').length;
  const warnings = auditResults.filter(r => r.status === 'warning').length;
  const passed = auditResults.filter(r => r.status === 'pass').length;

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: auditResults.length,
        critical: criticalIssues,
        high: highIssues,
        warnings,
        passed,
      },
      results: auditResults,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white">Security Audit</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="text-white"
            >
              {showDetailedResults ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              className="text-white"
              disabled={auditResults.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runSecurityAudit}
              disabled={isRunning}
              className="text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{criticalIssues}</div>
            <div className="text-sm text-red-300">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{highIssues}</div>
            <div className="text-sm text-orange-300">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{warnings}</div>
            <div className="text-sm text-yellow-300">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{passed}</div>
            <div className="text-sm text-green-300">Passed</div>
          </div>
        </div>

        {/* Overall Status */}
        {criticalIssues > 0 && (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Critical security issues detected. Immediate action required.
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Results */}
        {showDetailedResults && (
          <div className="space-y-3">
            {auditResults.map((result) => (
              <div key={result.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className="text-white font-medium">{result.name}</span>
                  </div>
                  <Badge className={getSeverityColor(result.severity)}>
                    {result.severity}
                  </Badge>
                </div>
                
                <p className="text-slate-300 text-sm mb-2">{result.description}</p>
                <p className="text-slate-400 text-xs mb-2">{result.details}</p>
                
                {result.recommendation && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                    <p className="text-blue-200 text-xs">
                      <strong>Recommendation:</strong> {result.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isRunning && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Running security audit...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAudit;