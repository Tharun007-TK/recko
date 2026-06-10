-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create firms table
CREATE TABLE firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create firm_members table
CREATE TABLE firm_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- e.g., 'admin', 'member'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (firm_id, profile_id)
);

-- Create reconciliation_jobs table
CREATE TABLE reconciliation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'running', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Create job_files table
CREATE TABLE job_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES reconciliation_jobs(id) ON DELETE CASCADE NOT NULL,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- e.g., 'source', 'target'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create mismatch_items table
CREATE TABLE mismatch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES reconciliation_jobs(id) ON DELETE CASCADE NOT NULL,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'unresolved' NOT NULL, -- e.g., 'unresolved', 'resolved'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create mapping_profiles table
CREATE TABLE mapping_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mappings JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create rule_profiles table
CREATE TABLE rule_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    rules JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX ON firm_members (firm_id);
CREATE INDEX ON firm_members (profile_id);
CREATE INDEX ON reconciliation_jobs (firm_id);
CREATE INDEX ON job_files (job_id);
CREATE INDEX ON job_files (firm_id);
CREATE INDEX ON mismatch_items (job_id);
CREATE INDEX ON mismatch_items (firm_id);
CREATE INDEX ON mapping_profiles (firm_id);
CREATE INDEX ON rule_profiles (firm_id);

-- Function to get user's firm IDs
CREATE OR REPLACE FUNCTION get_user_firm_ids()
RETURNS TABLE(firm_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT fm.firm_id
    FROM firm_members fm
    WHERE fm.profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (id = auth.uid());

ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can view their firm" ON firms FOR SELECT USING (id IN (SELECT firm_id FROM get_user_firm_ids()));

ALTER TABLE firm_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can view other members of their firm" ON firm_members FOR SELECT USING (firm_id IN (SELECT firm_id FROM get_user_firm_ids()));

ALTER TABLE reconciliation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can access jobs of their firm" ON reconciliation_jobs FOR ALL USING (firm_id IN (SELECT firm_id FROM get_user_firm_ids()));

ALTER TABLE job_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can access job files of their firm" ON job_files FOR ALL USING (firm_id IN (SELECT firm_id FROM get_user_firm_ids()));

ALTER TABLE mismatch_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can access mismatch items of their firm" ON mismatch_items FOR ALL USING (firm_id IN (SELECT firm_id FROM get_user_firm_ids()));

ALTER TABLE mapping_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can access mapping profiles of their firm" ON mapping_profiles FOR ALL USING (firm_id IN (SELECT firm_id FROM get_user_firm_ids()));

ALTER TABLE rule_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Firm members can access rule profiles of their firm" ON rule_profiles FOR ALL USING (firm_id IN (SELECT firm_id FROM get_user_firm_ids()));
