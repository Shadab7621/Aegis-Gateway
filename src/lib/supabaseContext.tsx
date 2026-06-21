'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

type ToolCall = {
  id: string;
  created_at: string;
  agent_id: string;
  request_payload: any;
  risk_score: number;
  status: string;
};

type ApprovalRequest = {
  id: string;
  tool_call_id: string;
  created_at: string;
  holding_reason: string;
  risk_score: number;
  status: string;
  resolved_by?: string;
  resolution_timestamp?: string;
};

interface SupabaseContextType {
  toolCalls: ToolCall[];
  approvalRequests: ApprovalRequest[];
  resolveRequest: (toolCallId: string, resolution: 'approved' | 'denied') => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchInitialData = async () => {
      const { data: calls } = await supabase
        .from('tool_calls')
        .select('*, approval_requests(id, status, risk_score)')
        .order('created_at', { ascending: false })
        .limit(50);
      const { data: approvals } = await supabase
        .from('approval_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (calls) setToolCalls(calls as ToolCall[]);
      if (approvals) setApprovalRequests(approvals as ApprovalRequest[]);
    };

    fetchInitialData();

    // Realtime subscriptions
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tool_calls' },
        (payload) => {
          setToolCalls(prev => [payload.new as ToolCall, ...prev]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tool_calls' },
        (payload) => {
          setToolCalls(prev => 
            prev.map(c => c.id === payload.new.id ? payload.new as ToolCall : c)
          );
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'approval_requests' },
        async (payload) => {
          setApprovalRequests(prev => [payload.new as ApprovalRequest, ...prev]);
          const { data } = await supabase
            .from('tool_calls')
            .select('*')
            .eq('id', payload.new.tool_call_id)
            .single();
          if (data) {
            setToolCalls(prev => 
              prev.map(c => c.id === data.id ? data as ToolCall : c)
            );
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'approval_requests' },
        (payload) => {
          setApprovalRequests(prev =>
            prev.map(a => a.id === payload.new.id ? payload.new as ApprovalRequest : a)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const resolveRequest = async (toolCallId: string, resolution: 'approved' | 'denied') => {
    // Optimistic update first
    setToolCalls(prev => prev.map(c =>
      c.id === toolCallId
        ? { ...c, status: resolution === 'approved' ? 'COMPLETED' : 'BLOCKED' }
        : c
    ));
    setApprovalRequests(prev => prev.map(a =>
      a.tool_call_id === toolCallId
        ? { 
            ...a, 
            status: resolution === 'approved' ? 'APPROVED' : 'REJECTED',
            resolved_by: 'Admin',
            resolution_timestamp: new Date().toISOString()
          }
        : a
    ));

    try {
      const proxyUrl = process.env.NEXT_PUBLIC_PROXY_SERVER_URL || 'http://localhost:3001';
      await fetch(`${proxyUrl}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Resolve-Token': process.env.NEXT_PUBLIC_RESOLVE_SECRET || 'aegis-secret-2024'
        },
        body: JSON.stringify({ tool_call_id: toolCallId, resolution })
      });

      await supabase.from('approval_requests')
        .update({ 
          status: resolution === 'approved' ? 'APPROVED' : 'REJECTED',
          resolved_by: 'Admin',
          resolution_timestamp: new Date().toISOString()
        })
        .eq('tool_call_id', toolCallId);

      await supabase.from('tool_calls')
        .update({ status: resolution === 'approved' ? 'COMPLETED' : 'BLOCKED' })
        .eq('id', toolCallId);

    } catch (err) {
      console.error('Failed to resolve request:', err);
      // Revert optimistic update on failure
      setToolCalls(prev => prev.map(c =>
        c.id === toolCallId ? { ...c, status: 'BLOCKED' } : c
      ));
    }
  };

  return (
    <SupabaseContext.Provider value={{ toolCalls, approvalRequests, resolveRequest }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
