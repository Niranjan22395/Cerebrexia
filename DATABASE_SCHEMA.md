# Cerebrexia - Database Schema & Migration Scripts

## 📊 Database Overview

**Database:** PostgreSQL 15+  
**Schema Name:** cerebrexia  
**Character Set:** UTF8  
**Collation:** en_US.UTF-8

---

## 🗂️ Table Definitions

### 1. Users Table

```sql
-- Users table stores all registered users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    college_name VARCHAR(255),
    phone VARCHAR(20),
    profile_completed BOOLEAN DEFAULT FALSE,
    college_id_proof_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    verified_by UUID REFERENCES admin_users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Events Table

```sql
-- Events table stores all event information
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('sports', 'cultural', 'academic', 'technical', 'other')),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    rules TEXT,
    contact_info VARCHAR(255),
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Indexes for events table
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_created_at ON events(created_at);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Event Registrations Table

```sql
-- Event registrations table stores user event registrations
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id VARCHAR(255),
    amount_paid DECIMAL(10,2),
    promo_code_id UUID REFERENCES promo_codes(id),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    participation_status VARCHAR(20) DEFAULT 'registered' CHECK (participation_status IN ('registered', 'attended', 'absent', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- Indexes for event_registrations table
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_payment_status ON event_registrations(payment_status);
CREATE INDEX idx_event_registrations_date ON event_registrations(registration_date);

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. QR Codes Table

```sql
-- QR codes table stores daily QR codes for entry
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    qr_token VARCHAR(500) UNIQUE NOT NULL,
    valid_date DATE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMP,
    scanned_by VARCHAR(255),
    scan_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for qr_codes table
CREATE INDEX idx_qr_codes_token_date ON qr_codes(qr_token, valid_date);
CREATE INDEX idx_qr_codes_user_date ON qr_codes(user_id, valid_date);
CREATE INDEX idx_qr_codes_event_date ON qr_codes(event_id, valid_date);
CREATE INDEX idx_qr_codes_is_used ON qr_codes(is_used);
CREATE INDEX idx_qr_codes_valid_date ON qr_codes(valid_date);

-- Unique constraint to prevent duplicate QR codes for same user/event/date
CREATE UNIQUE INDEX idx_qr_codes_unique_user_event_date 
    ON qr_codes(user_id, event_id, valid_date);
```

### 5. Doctors Table

```sql
-- Doctors table stores doctor payment information
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'online')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    receipt_number VARCHAR(100) UNIQUE,
    receipt_sent BOOLEAN DEFAULT FALSE,
    receipt_sent_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for doctors table
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_payment_status ON doctors(payment_status);
CREATE INDEX idx_doctors_payment_mode ON doctors(payment_mode);
CREATE INDEX idx_doctors_created_at ON doctors(created_at);

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6. Promo Codes Table

```sql
-- Promo codes table stores promotional discount codes
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1000,
    current_uses INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_events UUID[], -- Array of event IDs (NULL means all events)
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_discount_value CHECK (
        (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100) OR
        (discount_type = 'fixed' AND discount_value > 0)
    ),
    CONSTRAINT valid_dates CHECK (valid_until > valid_from)
);

-- Indexes for promo_codes table
CREATE INDEX idx_promo_codes_code ON promo_codes(code) WHERE is_active = true;
CREATE INDEX idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 7. Promo Code Usage Table

```sql
-- Promo code usage table tracks individual promo code uses
CREATE TABLE promo_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_registration_id UUID REFERENCES event_registrations(id) ON DELETE SET NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for promo_usage table
CREATE INDEX idx_promo_usage_promo_code ON promo_usage(promo_code_id);
CREATE INDEX idx_promo_usage_user ON promo_usage(user_id);
CREATE INDEX idx_promo_usage_used_at ON promo_usage(used_at);

-- Unique constraint to prevent duplicate usage per user per promo
CREATE UNIQUE INDEX idx_promo_usage_unique_user_promo 
    ON promo_usage(promo_code_id, user_id);
```

### 8. Visitor Tracking Table

```sql
-- Visitor tracking table stores visitor session information
CREATE TABLE visitor_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    landing_page VARCHAR(500),
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    registered BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    pages_visited INTEGER DEFAULT 1,
    time_spent_seconds INTEGER
);

-- Indexes for visitor_tracking table
CREATE INDEX idx_visitor_tracking_session ON visitor_tracking(session_id);
CREATE INDEX idx_visitor_tracking_registered ON visitor_tracking(registered);
CREATE INDEX idx_visitor_tracking_reminder_sent ON visitor_tracking(reminder_sent);
CREATE INDEX idx_visitor_tracking_visited_at ON visitor_tracking(visited_at);
```

### 9. Email Logs Table

```sql
-- Email logs table stores all email sending records
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN (
        'registration', 'reminder', 'receipt', 'offer', 'verification', 
        'qr_code', 'welcome', 'password_reset', 'notification'
    )),
    subject VARCHAR(500) NOT NULL,
    template_used VARCHAR(100),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened')),
    error_message TEXT,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_entity_id UUID, -- Can reference event, payment, etc.
    related_entity_type VARCHAR(50)
);

-- Indexes for email_logs table
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_email_logs_user ON email_logs(user_id);

-- Partition by month for better performance
CREATE TABLE email_logs_2026_06 PARTITION OF email_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

### 10. Payments Table

```sql
-- Payments table stores all payment transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_registration_id UUID REFERENCES event_registrations(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_signature VARCHAR(500),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN (
        'created', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'
    )),
    payment_method VARCHAR(50),
    payment_method_details JSONB,
    error_code VARCHAR(100),
    error_description TEXT,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payments table
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 11. Admin Users Table

```sql
-- Admin users table stores admin/staff user information
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin', 'finance_manager', 'gate_staff', 'verifier', 'event_manager'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    phone VARCHAR(20),
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin_users table
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 12. Admin Activity Logs Table

```sql
-- Admin activity logs table tracks all admin actions
CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin_activity_logs table
CREATE INDEX idx_admin_activity_logs_admin ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_entity ON admin_activity_logs(entity_type, entity_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
```

### 13. System Settings Table

```sql
-- System settings table stores application configuration
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for system_settings table
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔄 Migration Scripts

### Initial Setup Script

```sql
-- Run this script to set up the database from scratch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS cerebrexia;
SET search_path TO cerebrexia;

-- Create all tables in order (respecting foreign key dependencies)
-- 1. Admin users (no dependencies)
-- 2. Users (no dependencies)
-- 3. Events (depends on admin_users)
-- 4. Promo codes (depends on admin_users)
-- 5. Event registrations (depends on users, events, promo_codes)
-- 6. QR codes (depends on users, events)
-- 7. Doctors (no dependencies)
-- 8. Visitor tracking (depends on users)
-- 9. Email logs (depends on users)
-- 10. Payments (depends on users, event_registrations)
-- 11. Promo usage (depends on promo_codes, users, event_registrations)
-- 12. Admin activity logs (depends on admin_users)
-- 13. System settings (depends on admin_users)

-- [Include all CREATE TABLE statements from above]
```

### Seed Data Script

```sql
-- Seed data for initial setup

-- Insert default admin user (password: Admin@123)
INSERT INTO admin_users (email, name, password_hash, role, is_active)
VALUES (
    'admin@cerebrexia.com',
    'Super Admin',
    '$2b$10$YourHashedPasswordHere', -- Use bcrypt to hash
    'super_admin',
    true
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES
    ('site_name', 'Cerebrexia', 'string', 'Website name', true),
    ('site_url', 'https://cerebrexia.com', 'string', 'Website URL', true),
    ('max_promo_codes', '200', 'number', 'Maximum active promo codes', false),
    ('qr_expiry_hours', '24', 'number', 'QR code validity in hours', false),
    ('email_from_name', 'Cerebrexia', 'string', 'Email sender name', false),
    ('email_from_address', 'noreply@cerebrexia.com', 'string', 'Email sender address', false),
    ('payment_currency', 'INR', 'string', 'Payment currency', true),
    ('enable_registrations', 'true', 'boolean', 'Enable event registrations', true);

-- Insert sample event categories
INSERT INTO events (name, category, description, start_date, end_date, location, registration_fee, is_active)
VALUES
    ('Cricket Tournament', 'sports', 'Inter-college cricket tournament', '2026-07-01', '2026-07-03', 'Sports Complex', 500.00, true),
    ('Dance Competition', 'cultural', 'Solo and group dance performances', '2026-07-05', '2026-07-05', 'Main Auditorium', 300.00, true),
    ('Tech Quiz', 'academic', 'Technology and innovation quiz', '2026-07-07', '2026-07-07', 'Seminar Hall', 200.00, true),
    ('Hackathon', 'technical', '24-hour coding challenge', '2026-07-10', '2026-07-11', 'Computer Lab', 1000.00, true);

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, max_uses, max_uses_per_user, valid_from, valid_until, is_active)
VALUES
    ('EARLY2026', 'Early bird discount', 'percentage', 20.00, 100, 1, '2026-06-01', '2026-06-30', true),
    ('STUDENT50', 'Student discount', 'fixed', 50.00, 500, 1, '2026-06-01', '2026-12-31', true),
    ('COUPLE100', 'Couple registration discount', 'fixed', 100.00, 200, 1, '2026-06-01', '2026-12-31', true);
```

### Backup Script

```sql
-- Create backup of all tables
-- Run this before major updates

CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE events_backup AS SELECT * FROM events;
CREATE TABLE event_registrations_backup AS SELECT * FROM event_registrations;
CREATE TABLE payments_backup AS SELECT * FROM payments;
CREATE TABLE qr_codes_backup AS SELECT * FROM qr_codes;
CREATE TABLE promo_codes_backup AS SELECT * FROM promo_codes;
CREATE TABLE doctors_backup AS SELECT * FROM doctors;
```

### Rollback Script

```sql
-- Restore from backup if needed

TRUNCATE TABLE users CASCADE;
INSERT INTO users SELECT * FROM users_backup;

TRUNCATE TABLE events CASCADE;
INSERT INTO events SELECT * FROM events_backup;

-- Repeat for other tables as needed
```

---

## 📈 Performance Optimization

### Materialized Views

```sql
-- Materialized view for event statistics
CREATE MATERIALIZED VIEW event_statistics AS
SELECT 
    e.id,
    e.name,
    e.category,
    COUNT(DISTINCT er.user_id) as total_registrations,
    COUNT(DISTINCT CASE WHEN er.payment_status = 'completed' THEN er.user_id END) as paid_registrations,
    SUM(CASE WHEN er.payment_status = 'completed' THEN er.amount_paid ELSE 0 END) as total_revenue,
    AVG(CASE WHEN er.payment_status = 'completed' THEN er.amount_paid END) as avg_payment
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id, e.name, e.category;

-- Refresh materialized view (run periodically)
REFRESH MATERIALIZED VIEW event_statistics;

-- Create index on materialized view
CREATE INDEX idx_event_statistics_id ON event_statistics(id);
```

### Query Optimization Examples

```sql
-- Efficient query to get user's upcoming events
CREATE INDEX idx_events_dates ON events(start_date, end_date) WHERE is_active = true;

-- Efficient query to get today's QR codes
CREATE INDEX idx_qr_codes_today ON qr_codes(valid_date, is_used) 
WHERE valid_date = CURRENT_DATE;

-- Efficient query for payment reports
CREATE INDEX idx_payments_date_status ON payments(created_at, status);
```

---

## 🔒 Security Measures

### Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id')::uuid);

-- Policy: Admins can see all data
CREATE POLICY admin_all_access ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = current_setting('app.current_admin_id')::uuid 
            AND is_active = true
        )
    );
```

### Audit Triggers

```sql
-- Trigger to log all changes to sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO admin_activity_logs (
            admin_user_id,
            action,
            entity_type,
            entity_id,
            old_values,
            new_values
        ) VALUES (
            current_setting('app.current_admin_id')::uuid,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO admin_activity_logs (
            admin_user_id,
            action,
            entity_type,
            entity_id,
            old_values
        ) VALUES (
            current_setting('app.current_admin_id')::uuid,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_users AFTER UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_payments AFTER UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 🧹 Maintenance Scripts

### Cleanup Old Data

```sql
-- Delete old visitor tracking data (older than 90 days)
DELETE FROM visitor_tracking 
WHERE visited_at < CURRENT_DATE - INTERVAL '90 days';

-- Archive old email logs (older than 1 year)
CREATE TABLE email_logs_archive AS 
SELECT * FROM email_logs 
WHERE sent_at < CURRENT_DATE - INTERVAL '1 year';

DELETE FROM email_logs 
WHERE sent_at < CURRENT_DATE - INTERVAL '1 year';

-- Delete expired QR codes (older than 30 days)
DELETE FROM qr_codes 
WHERE valid_date < CURRENT_DATE - INTERVAL '30 days';
```

### Database Maintenance

```sql
-- Vacuum and analyze tables
VACUUM ANALYZE users;
VACUUM ANALYZE events;
VACUUM ANALYZE event_registrations;
VACUUM ANALYZE payments;
VACUUM ANALYZE qr_codes;

-- Reindex tables
REINDEX TABLE users;
REINDEX TABLE events;
REINDEX TABLE event_registrations;
REINDEX TABLE payments;

-- Update statistics
ANALYZE users;
ANALYZE events;
ANALYZE event_registrations;
ANALYZE payments;
```

---

## 📊 Useful Queries

### Dashboard Statistics

```sql
-- Get overall statistics
SELECT 
    (SELECT COUNT(*) FROM users WHERE profile_completed = true) as total_users,
    (SELECT COUNT(*) FROM events WHERE is_active = true) as active_events,
    (SELECT COUNT(*) FROM event_registrations WHERE payment_status = 'completed') as total_registrations,
    (SELECT SUM(amount_paid) FROM event_registrations WHERE payment_status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM qr_codes WHERE valid_date = CURRENT_DATE AND is_used = true) as today_entries;
```

### Revenue Report

```sql
-- Get revenue by event
SELECT 
    e.name,
    e.category,
    COUNT(er.id) as registrations,
    SUM(er.amount_paid) as revenue,
    AVG(er.amount_paid) as avg_payment
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
WHERE er.payment_status = 'completed'
GROUP BY e.id, e.name, e.category
ORDER BY revenue DESC;
```

### User Activity Report

```sql
-- Get user registration and participation stats
SELECT 
    u.name,
    u.email,
    u.college_name,
    COUNT(er.id) as events_registered,
    SUM(er.amount_paid) as total_spent,
    COUNT(CASE WHEN qr.is_used = true THEN 1 END) as events_attended
FROM users u
LEFT JOIN event_registrations er ON u.id = er.user_id
LEFT JOIN qr_codes qr ON u.id = qr.user_id
WHERE u.profile_completed = true
GROUP BY u.id, u.name, u.email, u.college_name
ORDER BY events_registered DESC;
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-19  
**Database Version:** PostgreSQL 15+
