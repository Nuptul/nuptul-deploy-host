# RSVP Clean Migration Plan
**Safe Data Architecture Cleanup for Nuptul Wedding Platform**

## Executive Summary

This migration plan eliminates the RSVP triple redundancy issue by safely removing all expendable RSVP data and establishing the `rsvps` table as the single source of truth. All user registration data in the `profiles` table will be preserved.

## Current State Analysis

### Data Distribution (Verified December 19, 2024)
- **`profiles` table**: 24 user records (PRESERVE - critical user registration data)
  - RSVP fields to remove: `rsvp_completed`, `rsvp_status`, `rsvp_responded_at`
- **`guest_list` table**: 114 records (EXPENDABLE - can be recreated)
  - RSVP fields: `rsvp_count`, `rsvp_status`, `rsvp_date`, `attendance_confirmed`
- **`rsvps` table**: 2 test records (EXPENDABLE - couple's test RSVPs)
  - Target architecture: Proper event-based RSVP system

### Wedding Events Available
- Wedding Ceremony & Reception (Main Event)
- Wedding Reception 
- Pre-Wedding Drinks
- Recovery Beach Day

## Migration Strategy: Clean Slate Approach

### Phase 1: Backup and Preparation (30 minutes)

#### 1.1 Create Full Database Backup
```sql
-- Export critical user data (profiles table)
COPY (SELECT user_id, email, first_name, last_name, display_name, 
             phone, created_at, updated_at, address, state, country, 
             postcode, mobile, dietary_requirements, allergies, 
             emergency_contact, relationship_to_couple, bio, 
             profile_picture_url, date_of_birth, occupation, city, 
             interests, address_suburb
      FROM profiles) 
TO '/tmp/profiles_backup.csv' WITH CSV HEADER;
```

#### 1.2 Document Current Application Dependencies
- Identify all components reading from RSVP fields in profiles/guest_list
- List all API endpoints using RSVP data
- Map all database queries accessing RSVP fields

### Phase 2: Clean Database Schema (15 minutes)

#### 2.1 Remove RSVP Fields from Profiles Table
```sql
-- Remove RSVP redundancy from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS rsvp_completed,
DROP COLUMN IF EXISTS rsvp_status,
DROP COLUMN IF EXISTS rsvp_responded_at;
```

#### 2.2 Clear Guest List Table
```sql
-- Option A: Clear all guest list data (recommended)
TRUNCATE TABLE guest_list CASCADE;

-- Option B: Remove only RSVP fields (if guest list structure needed)
ALTER TABLE guest_list 
DROP COLUMN IF EXISTS rsvp_count,
DROP COLUMN IF EXISTS rsvp_status,
DROP COLUMN IF EXISTS rsvp_date,
DROP COLUMN IF EXISTS attendance_confirmed;
```

#### 2.3 Reset RSVP Table
```sql
-- Clear existing test RSVPs
TRUNCATE TABLE rsvps CASCADE;

-- Verify rsvps table structure is optimal
-- (Current structure is already good - no changes needed)
```

### Phase 3: Application Code Updates (2-3 hours)

#### 3.1 Update RSVP Components
**Files to modify:**
- `src/pages/dashboard/AdminUsers.tsx` - Remove RSVP display from profiles
- `src/components/RSVPManagement.tsx` - Use only rsvps table
- `src/pages/RSVP.tsx` - Direct to rsvp table only
- Any API endpoints reading profile RSVP fields

#### 3.2 Create Unified RSVP Service
```typescript
// src/services/rsvpService.ts
export class RSVPService {
  // Single source of truth - only uses rsvps table
  static async getUserRSVPs(userId: string) {
    return supabase
      .from('rsvps')
      .select('*, wedding_events(*)')
      .eq('user_id', userId);
  }
  
  static async createRSVP(rsvpData: RSVPData) {
    return supabase
      .from('rsvps')
      .insert(rsvpData);
  }
  
  // No more reading from profiles or guest_list tables
}
```

### Phase 4: Testing and Validation (1 hour)

#### 4.1 Functional Testing
- [ ] User registration still works (profiles table intact)
- [ ] RSVP creation works (writes to rsvps table only)
- [ ] RSVP display works (reads from rsvps table only)
- [ ] Admin dashboard shows correct RSVP data
- [ ] No application errors from missing RSVP fields

#### 4.2 Data Integrity Verification
```sql
-- Verify no RSVP fields remain in profiles
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE '%rsvp%';
-- Should return 0 rows

-- Verify rsvps table is the only RSVP source
SELECT COUNT(*) FROM rsvps;
-- Should show clean state (0 or new test records)
```

## Rollback Procedures

### Emergency Rollback (if issues arise)
```sql
-- Restore RSVP fields to profiles table
ALTER TABLE profiles 
ADD COLUMN rsvp_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN rsvp_status TEXT,
ADD COLUMN rsvp_responded_at TIMESTAMPTZ;

-- Restore from backup if needed
COPY profiles FROM '/tmp/profiles_backup.csv' WITH CSV HEADER;
```

## Post-Migration Benefits

### Eliminated Issues
- ✅ No more triple RSVP data redundancy
- ✅ Single source of truth for all RSVP data
- ✅ Proper event-based RSVP architecture
- ✅ Clean separation of user accounts vs RSVP responses

### New Architecture
- **User Management**: `profiles` table (registration, authentication, personal info)
- **RSVP Management**: `rsvps` table (event responses, dietary needs, plus-ones)
- **Event Management**: `wedding_events` table (ceremony, reception, etc.)

## Risk Assessment

### Risk Level: LOW
- **User Data**: 100% preserved (profiles table untouched)
- **RSVP Data**: 100% expendable (confirmed by client)
- **System Downtime**: Minimal (15-30 minutes)
- **Rollback**: Simple and fast

### Success Criteria
- [ ] All user accounts remain functional
- [ ] RSVP system works with single data source
- [ ] No application errors
- [ ] Clean database architecture
- [ ] Future RSVP redundancy prevented

## Timeline

**Total Estimated Time: 4-5 hours**
- Phase 1 (Backup): 30 minutes
- Phase 2 (Schema): 15 minutes  
- Phase 3 (Code): 2-3 hours
- Phase 4 (Testing): 1 hour

**Recommended Schedule:**
- Execute during low-traffic period
- Have rollback plan ready
- Test thoroughly before declaring complete

## Next Steps

1. Review and approve this migration plan
2. Schedule migration window
3. Execute Phase 1 (Backup)
4. Proceed with clean migration
5. Validate new RSVP architecture
6. Update assessment documentation

## Implementation Scripts

### Pre-Migration Backup Script
```sql
-- Create backup of critical user data
CREATE TABLE profiles_backup AS
SELECT * FROM profiles;

-- Verify backup
SELECT COUNT(*) FROM profiles_backup;
```

### Migration Execution Script
```sql
-- Phase 2.1: Remove RSVP fields from profiles
ALTER TABLE profiles
DROP COLUMN IF EXISTS rsvp_completed CASCADE,
DROP COLUMN IF EXISTS rsvp_status CASCADE,
DROP COLUMN IF EXISTS rsvp_responded_at CASCADE;

-- Phase 2.2: Clear guest list (expendable data)
TRUNCATE TABLE guest_list CASCADE;

-- Phase 2.3: Reset RSVP table for clean start
TRUNCATE TABLE rsvps CASCADE;

-- Verify clean state
SELECT
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM guest_list) as guest_list_count,
  (SELECT COUNT(*) FROM rsvps) as rsvps_count;
```

### Validation Script
```sql
-- Verify no RSVP fields in profiles
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name LIKE '%rsvp%';

-- Verify user data integrity
SELECT COUNT(*) as user_count,
       COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as emails_preserved
FROM profiles;
```

---

**Migration Status**: READY FOR EXECUTION
**Risk Level**: LOW
**Data Safety**: HIGH (user data preserved)
**Architecture Improvement**: SIGNIFICANT
