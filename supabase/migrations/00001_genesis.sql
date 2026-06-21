-- Phase 1: Database Genesis
-- Tables: tool_calls, approval_requests, audit_logs
-- Schema: public

-- 1. Create tool_calls table
CREATE TABLE IF NOT EXISTS public.tool_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agent_id TEXT NOT NULL,
    request_payload JSONB NOT NULL,
    risk_score FLOAT DEFAULT 0.0,
    status TEXT DEFAULT 'PENDING'
);

-- 2. Create approval_requests table
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_call_id UUID REFERENCES public.tool_calls(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    holding_reason TEXT NOT NULL,
    status TEXT DEFAULT 'AWAITING_REVIEW',
    resolved_by TEXT,
    resolution_timestamp TIMESTAMP WITH TIME ZONE
);

-- 3. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    actor TEXT NOT NULL,
    details JSONB,
    cryptographic_signature TEXT NOT NULL -- Hash of the record data for tamper-proof logging
);

-- Phase 1.2: Realtime & RLS Enforcement

-- Enable RLS
ALTER TABLE public.tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view
CREATE POLICY "Allow authenticated read on tool_calls" ON public.tool_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on approval_requests" ON public.approval_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- Backend proxy (using service_role key) bypasses RLS inherently, but we can explicitly add a policy if needed
-- However, service_role bypasses RLS by default. We'll ensure anon role is restricted.
CREATE POLICY "Deny anon access on tool_calls" ON public.tool_calls FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access on approval_requests" ON public.approval_requests FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access on audit_logs" ON public.audit_logs FOR ALL TO anon USING (false);

-- Enable Realtime replication
BEGIN;
  -- Remove existing publication if exists to avoid errors, or just add tables to it.
  -- Supabase uses 'supabase_realtime' publication.
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tool_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
