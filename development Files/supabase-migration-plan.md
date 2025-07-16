# Supabase Migration Plan: Dev to Production (Nuptial PTY LTD)

## Overview
This document outlines the comprehensive migration plan for moving the Nuptul wedding platform from the development Supabase instance to the production Nuptial PTY LTD Supabase account.

## Migration Details

### Source (Development)
- **Project**: Development instance (personal account)
- **Project Ref**: [To be identified]
- **Data**: Test data, schema, and configurations

### Target (Production)
- **Organization**: Nuptial PTY LTD
- **Project Name**: nuptial-production
- **Project Ref**: `iwmfxcrzzwpmxomydmuq`
- **Region**: Sydney (ap-southeast-2)
- **Plan**: Pro (future upgrade as needed)

## Pre-Migration Checklist

### 1. Environment Preparation
- [ ] Create production project in Nuptial PTY LTD organization
- [ ] Configure project settings (name, region, etc.)
- [ ] Set up team access and permissions
- [ ] Configure custom domain (api.nuptial.com)
- [ ] Enable required Supabase extensions

### 2. Schema Analysis
- [ ] Export complete database schema from dev
- [ ] Review and document all tables, views, functions
- [ ] Identify and document all RLS policies
- [ ] Document all triggers and stored procedures
- [ ] Review indexes for performance optimization

### 3. Data Classification
- [ ] Identify data to migrate (if any)
- [ ] Separate test data from seed data
- [ ] Document data dependencies
- [ ] Plan data transformation requirements

## Migration Process

### Phase 1: Schema Migration (Day 1)

#### 1.1 Create Branch for Testing
```sql
-- Using Supabase MCP
create_branch(name: "migration-test")
```

#### 1.2 Export Development Schema
```bash
# Export schema from dev environment
pg_dump --schema-only --no-owner --no-privileges \
  -h [DEV_HOST] -U postgres -d postgres > schema.sql

# Clean up schema file
sed -i 's/OWNER TO [^;]*;//g' schema.sql
```

#### 1.3 Apply Schema to Test Branch
```sql
-- Using Supabase MCP
apply_migration(
  name: "initial_schema_migration",
  query: [contents of schema.sql]
)
```

#### 1.4 Verify Schema
```sql
-- List all tables
list_tables()

-- Verify specific tables exist
execute_sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
```

### Phase 2: Storage Migration (Day 1)

#### 2.1 Create Storage Buckets
```sql
-- Create required storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('wedding-photos', 'wedding-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword']);
```

#### 2.2 Set Storage Policies
```sql
-- RLS policies for storage buckets
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated
  USING (bucket_id = 'wedding-photos');

CREATE POLICY "Public can view wedding photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'wedding-photos');
```

### Phase 3: Authentication & Security (Day 2)

#### 3.1 Configure Auth Settings
- Enable email authentication
- Configure password requirements
- Set up email templates
- Configure OAuth providers (if needed)
- Set JWT expiry times

#### 3.2 Create Initial Admin Users
```sql
-- Create admin role
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@nuptial.com', crypt('secure_password', gen_salt('bf')), now(), 'service_role');
```

#### 3.3 Set Up Row Level Security
```sql
-- Apply RLS policies from development
-- Guest management policies
CREATE POLICY "Guests can view their own data" ON public.guests
  FOR SELECT USING (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admins have full access" ON public.guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Phase 4: Edge Functions Migration (Day 2)

#### 4.1 Deploy Edge Functions
```javascript
// Using Supabase MCP
deploy_edge_function({
  name: "send-invitation",
  files: [{
    name: "index.ts",
    content: [edge function code]
  }],
  entrypoint_path: "index.ts"
})
```

#### 4.2 Configure Function Secrets
```bash
# Set environment variables for edge functions
supabase secrets set SENDGRID_API_KEY=xxx
supabase secrets set TWILIO_ACCOUNT_SID=xxx
```

### Phase 5: Application Configuration (Day 3)

#### 5.1 Update Environment Variables
```env
# Production environment variables
VITE_SUPABASE_URL=https://iwmfxcrzzwpmxomydmuq.supabase.co
VITE_SUPABASE_ANON_KEY=[production anon key]
VITE_SUPABASE_SERVICE_KEY=[encrypted service key]
```

#### 5.2 Update Application Code
- Replace all dev URLs with production URLs
- Update API endpoints
- Configure CORS settings
- Update security headers

### Phase 6: Testing & Validation (Day 3-4)

#### 6.1 Functional Testing
- [ ] Authentication flows (signup, login, password reset)
- [ ] RSVP system functionality
- [ ] Guest management operations
- [ ] Photo upload and gallery
- [ ] Messaging system
- [ ] Admin dashboard
- [ ] Email notifications

#### 6.2 Performance Testing
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM guests g
JOIN rsvp_responses r ON g.id = r.guest_id
WHERE g.event_id = 'test-event';

-- Create necessary indexes
CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_rsvp_responses_guest_id ON rsvp_responses(guest_id);
```

#### 6.3 Security Validation
- [ ] Verify all RLS policies
- [ ] Test API key restrictions
- [ ] Validate CORS configuration
- [ ] Check SSL/TLS setup
- [ ] Penetration testing

### Phase 7: Data Migration (Day 5) - If Required

#### 7.1 Export Production-Ready Data
```bash
# Export only necessary data
pg_dump --data-only --table=wedding_themes \
  --table=venue_options --table=menu_items \
  -h [DEV_HOST] -U postgres -d postgres > seed_data.sql
```

#### 7.2 Import Data to Production
```sql
-- Import seed data
execute_sql([contents of seed_data.sql])
```

### Phase 8: Cutover (Day 6)

#### 8.1 Final Preparations
- [ ] Backup development database
- [ ] Document rollback procedure
- [ ] Prepare monitoring dashboards
- [ ] Alert team members

#### 8.2 DNS & Domain Configuration
```yaml
# Netlify configuration
[[redirects]]
  from = "/api/*"
  to = "https://iwmfxcrzzwpmxomydmuq.supabase.co/:splat"
  status = 200
```

#### 8.3 Go Live Steps
1. Deploy application to Netlify
2. Update DNS records
3. Configure custom domain in Supabase
4. Enable production monitoring
5. Verify all services

### Phase 9: Post-Migration (Day 7+)

#### 9.1 Monitoring Setup
```sql
-- Enable query performance monitoring
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_duration = on;
```

#### 9.2 Backup Configuration
- Configure daily automated backups
- Set up point-in-time recovery
- Test restore procedures

#### 9.3 Performance Optimization
```sql
-- Analyze table statistics
ANALYZE;

-- Review slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Rollback Plan

### Immediate Rollback (< 1 hour)
1. Switch DNS back to development
2. Restore from backup if data was modified
3. Revert application configuration

### Extended Rollback (> 1 hour)
1. Create new branch from pre-migration state
2. Apply any critical fixes
3. Plan remediation
4. Schedule new migration window

## Monitoring & Success Criteria

### Key Metrics
- **Uptime**: > 99.9%
- **Response Time**: < 200ms for API calls
- **Error Rate**: < 0.1%
- **User Sessions**: Normal patterns

### Monitoring Tools
- Supabase Dashboard
- Application logs
- Error tracking (Sentry)
- Performance monitoring
- User feedback channels

## Agent Integration Points

### Testing Agent
Will continuously monitor:
- API endpoint health
- Authentication flows
- UI functionality
- Performance metrics

### Migration Agent
Will handle:
- Schema comparison
- Data validation
- Migration execution
- Rollback procedures

### Monitoring Agent
Will track:
- System health
- Performance metrics
- Error rates
- User activity

## Timeline Summary

- **Day 1**: Schema and Storage Migration
- **Day 2**: Auth, Security, and Edge Functions
- **Day 3-4**: Application Config and Testing
- **Day 5**: Data Migration (if needed)
- **Day 6**: Cutover
- **Day 7+**: Monitoring and Optimization

## Risk Mitigation

### High-Risk Areas
1. **Data Loss**: Mitigated by comprehensive backups and test migrations
2. **Downtime**: Mitigated by branch testing and quick rollback procedures
3. **Performance**: Mitigated by load testing and index optimization
4. **Security**: Mitigated by security audit and penetration testing

### Contingency Plans
- 24/7 on-call support during migration
- Automated rollback scripts
- Communication plan for users
- Escalation procedures

## Success Notification

Upon successful migration:
1. Notify all stakeholders
2. Update documentation
3. Archive development environment
4. Schedule post-migration review
5. Plan for future optimizations