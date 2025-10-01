-- Create enum types for better data integrity
CREATE TYPE log_level AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');
CREATE TYPE incident_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE source_type AS ENUM ('FILE', 'SYSLOG', 'API', 'FTP', 'USB', 'REALTIME');
CREATE TYPE user_role AS ENUM ('ADMIN', 'ANALYST', 'VIEWER');

-- User profiles table with role-based access
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'VIEWER' NOT NULL,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Log sources configuration
CREATE TABLE log_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type source_type NOT NULL,
  description TEXT,
  connection_config JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Main logs table with full-text search
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  source_id UUID REFERENCES log_sources(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  level log_level NOT NULL,
  message TEXT NOT NULL,
  raw_data TEXT,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  hash TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  search_vector tsvector
);

-- Threat detection rules
CREATE TABLE threat_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  pattern TEXT NOT NULL,
  severity alert_severity NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Threat alerts
CREATE TABLE threat_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity alert_severity NOT NULL,
  status alert_status DEFAULT 'NEW' NOT NULL,
  source TEXT NOT NULL,
  affected_systems TEXT[] DEFAULT ARRAY[]::TEXT[],
  log_id UUID REFERENCES logs(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES threat_rules(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- Security incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity alert_severity NOT NULL,
  status incident_status DEFAULT 'OPEN' NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  alert_ids UUID[] DEFAULT ARRAY[]::UUID[],
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- Analytics cache for performance
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  result JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_source ON logs(source_id);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_search ON logs USING gin(search_vector);
CREATE INDEX idx_logs_ip ON logs(ip_address);
CREATE INDEX idx_threat_alerts_status ON threat_alerts(status);
CREATE INDEX idx_threat_alerts_severity ON threat_alerts(severity);
CREATE INDEX idx_threat_alerts_created ON threat_alerts(created_at DESC);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_assigned ON incidents(assigned_to);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Full-text search trigger for logs
CREATE OR REPLACE FUNCTION logs_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.message, '') || ' ' || COALESCE(NEW.source_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER logs_search_update 
  BEFORE INSERT OR UPDATE ON logs 
  FOR EACH ROW 
  EXECUTE FUNCTION logs_search_trigger();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_log_sources_updated_at BEFORE UPDATE ON log_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threat_rules_updated_at BEFORE UPDATE ON threat_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threat_alerts_updated_at BEFORE UPDATE ON threat_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'VIEWER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for log_sources
CREATE POLICY "Users can view log sources" ON log_sources FOR SELECT USING (true);
CREATE POLICY "Admins and Analysts can manage log sources" ON log_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'ANALYST'))
);

-- RLS Policies for logs
CREATE POLICY "Users can view logs" ON logs FOR SELECT USING (true);
CREATE POLICY "Admins and Analysts can insert logs" ON logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'ANALYST'))
);
CREATE POLICY "Admins can delete logs" ON logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for threat_rules
CREATE POLICY "Users can view threat rules" ON threat_rules FOR SELECT USING (true);
CREATE POLICY "Admins and Analysts can manage threat rules" ON threat_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'ANALYST'))
);

-- RLS Policies for threat_alerts
CREATE POLICY "Users can view threat alerts" ON threat_alerts FOR SELECT USING (true);
CREATE POLICY "Admins and Analysts can manage threat alerts" ON threat_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'ANALYST'))
);

-- RLS Policies for incidents
CREATE POLICY "Users can view incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "Admins and Analysts can manage incidents" ON incidents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'ANALYST'))
);

-- RLS Policies for analytics_cache
CREATE POLICY "Users can view analytics cache" ON analytics_cache FOR SELECT USING (true);
CREATE POLICY "System can manage analytics cache" ON analytics_cache FOR ALL USING (true);

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE logs;
ALTER PUBLICATION supabase_realtime ADD TABLE threat_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;