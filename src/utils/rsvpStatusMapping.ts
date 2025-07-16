/**
 * Utility functions to standardize RSVP status values across the application
 * 
 * Database schema uses: 'pending', 'attending', 'not_attending', 'maybe'
 * Some UI components use: 'confirmed', 'declined'
 * 
 * This module provides mapping functions to ensure consistency
 */

export type DatabaseRSVPStatus = 'pending' | 'attending' | 'not_attending' | 'maybe';
export type UIRSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

/**
 * Convert UI status to database status
 */
export function mapUIToDatabase(uiStatus: UIRSVPStatus | string): DatabaseRSVPStatus {
  switch (uiStatus) {
    case 'confirmed':
      return 'attending';
    case 'declined':
      return 'not_attending';
    case 'pending':
      return 'pending';
    case 'maybe':
      return 'maybe';
    // Pass through if already in database format
    case 'attending':
      return 'attending';
    case 'not_attending':
      return 'not_attending';
    default:
      return 'pending';
  }
}

/**
 * Convert database status to UI status
 */
export function mapDatabaseToUI(dbStatus: DatabaseRSVPStatus | string | null): UIRSVPStatus {
  switch (dbStatus) {
    case 'attending':
      return 'confirmed';
    case 'not_attending':
      return 'declined';
    case 'pending':
      return 'pending';
    case 'maybe':
      return 'maybe';
    // Pass through if already in UI format
    case 'confirmed':
      return 'confirmed';
    case 'declined':
      return 'declined';
    default:
      return 'pending';
  }
}

/**
 * Get display text for RSVP status
 */
export function getStatusDisplayText(status: DatabaseRSVPStatus | UIRSVPStatus | string | null): string {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case 'attending':
    case 'confirmed':
      return 'Attending';
    case 'not_attending':
    case 'declined':
      return 'Not Attending';
    case 'maybe':
      return 'Maybe';
    case 'pending':
    default:
      return 'Pending';
  }
}

/**
 * Get status color classes for UI components
 */
export function getStatusColorClasses(status: DatabaseRSVPStatus | UIRSVPStatus | string | null): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case 'attending':
    case 'confirmed':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600'
      };
    case 'not_attending':
    case 'declined':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600'
      };
    case 'maybe':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: 'text-yellow-600'
      };
    case 'pending':
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600'
      };
  }
}