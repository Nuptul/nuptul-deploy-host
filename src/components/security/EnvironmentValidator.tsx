import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface EnvironmentValidatorProps {
  children: React.ReactNode;
  strict?: boolean;
  showValidation?: boolean;
}

interface ValidationResult {
  key: string;
  required: boolean;
  present: boolean;
  secure: boolean;
  message: string;
}

/**
 * Environment Variable Validator
 * Validates required environment variables and security configuration
 */
export const EnvironmentValidator: React.FC<EnvironmentValidatorProps> = ({
  children,
  strict = true,
  showValidation = false,
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const requiredEnvVars = [
    {
      key: 'VITE_SUPABASE_URL',
      required: true,
      validate: (value: string) => {
        if (!value) return { secure: false, message: 'Supabase URL is required' };
        if (!value.startsWith('https://')) {
          return { secure: false, message: 'Supabase URL must use HTTPS' };
        }
        if (value.includes('localhost') && import.meta.env.PROD) {
          return { secure: false, message: 'Production build should not use localhost' };
        }
        return { secure: true, message: 'Valid Supabase URL' };
      },
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      required: true,
      validate: (value: string) => {
        if (!value) return { secure: false, message: 'Supabase anonymous key is required' };
        if (value.length < 32) {
          return { secure: false, message: 'Supabase key appears to be invalid (too short)' };
        }
        if (value.includes('your-key-here') || value.includes('placeholder')) {
          return { secure: false, message: 'Placeholder key detected - replace with actual key' };
        }
        return { secure: true, message: 'Valid Supabase anonymous key' };
      },
    },
    {
      key: 'VITE_MAPBOX_TOKEN',
      required: false,
      validate: (value: string) => {
        if (!value) return { secure: true, message: 'Mapbox token not provided (optional)' };
        if (value.startsWith('pk.')) {
          return { secure: true, message: 'Valid Mapbox public token' };
        }
        return { secure: false, message: 'Invalid Mapbox token format' };
      },
    },
  ] as const;

  useEffect(() => {
    const validateEnvironment = () => {
      const results: ValidationResult[] = requiredEnvVars.map(({ key, required, validate }) => {
        const value = import.meta.env[key] || '';
        const present = Boolean(value);
        const validation = validate(value);

        return {
          key,
          required,
          present,
          secure: validation.secure,
          message: validation.message,
        };
      });

      setValidationResults(results);

      // Check if environment is valid
      const criticalErrors = results.filter(
        (result) => result.required && (!result.present || !result.secure)
      );

      const isEnvironmentValid = criticalErrors.length === 0;
      setIsValid(isEnvironmentValid);

      // Log validation results in development
      if (import.meta.env.DEV) {
        console.group('🔐 Environment Validation');
        results.forEach((result) => {
          const status = result.present && result.secure ? '✅' : result.required ? '❌' : '⚠️';
          console.log(`${status} ${result.key}: ${result.message}`);
        });
        console.groupEnd();
      }

      setLoading(false);
    };

    validateEnvironment();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="glass-card w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            <p className="text-white/80">Validating environment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show validation errors if strict mode and validation failed
  if (strict && !isValid) {
    const criticalErrors = validationResults.filter(
      (result) => result.required && (!result.present || !result.secure)
    );

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-4">
        <Card className="glass-card w-full max-w-2xl border-red-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">Environment Configuration Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                Critical environment variables are missing or misconfigured. Please fix the following issues:
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {criticalErrors.map((error) => (
                <div key={error.key} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-300">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">{error.key}</span>
                  </div>
                  <p className="text-red-200 text-sm mt-1">{error.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-white font-medium mb-2">How to fix:</h4>
              <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
                <li>Create or update your <code>.env</code> file</li>
                <li>Add the missing environment variables</li>
                <li>Restart the development server</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show validation results if requested
  const ValidationDisplay = showValidation && (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="glass-card w-80 border-green-500/20">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <CardTitle className="text-sm text-white">Environment Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {validationResults.map((result) => (
            <div key={result.key} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{result.key}</span>
              <div className="flex items-center space-x-1">
                {result.present && result.secure ? (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                ) : result.required ? (
                  <XCircle className="h-3 w-3 text-red-400" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {children}
      {ValidationDisplay}
    </>
  );
};

export default EnvironmentValidator;