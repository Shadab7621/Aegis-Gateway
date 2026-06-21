'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

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
};

export function AnalyticsView({
  toolCalls, approvalRequests,
}: { toolCalls: ToolCall[]; approvalRequests: ApprovalRequest[] }) {

  const threatDistribution = useMemo(() => {
    const dist: Record<string, number> = { 'Prompt Injection': 0, 'Path Traversal': 0, 'Command Injection': 0, 'Recon Attempt': 0, Safe: 0 };
    toolCalls.forEach(call => {
      const reason = (call.request_payload?.threat_reason || '') as string;
      if (reason.includes('Prompt Injection')) dist['Prompt Injection']++;
      else if (reason.includes('Path Traversal')) dist['Path Traversal']++;
      else if (reason.includes('Command') || reason.includes('High Risk')) dist['Command Injection']++;
      else if (reason.includes('Recon')) dist['Recon Attempt']++;
      else dist['Safe']++;
    });
    return dist;
  }, [toolCalls]);

  const threatColors: Record<string, string> = {
    'Prompt Injection': '#7B6EFF',
    'Path Traversal': '#FFB347',
    'Command Injection': '#FF4D6A',
    'Recon Attempt': '#3ECFCF',
    Safe: '#34D399',
  };
  const totalThreats = Object.values(threatDistribution).reduce((a, b) => a + b, 0) || 1;

  const agentActivity = useMemo(() => {
    const agents: Record<string, { total: number; blocked: number }> = {};
    toolCalls.forEach(call => {
      const id = call.agent_id || 'unknown';
      if (!agents[id]) agents[id] = { total: 0, blocked: 0 };
      agents[id].total++;
      if (call.status === 'BLOCKED') agents[id].blocked++;
    });
    return Object.entries(agents).sort((a, b) => b[1].total - a[1].total).slice(0, 8);
  }, [toolCalls]);

  const timelineData = useMemo(() => {
    const buckets: Record<string, { safe: number; flagged: number; blocked: number }> = {};
    toolCalls.forEach(call => {
      const hour = new Date(call.created_at).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
      if (!buckets[hour]) buckets[hour] = { safe: 0, flagged: 0, blocked: 0 };
      if (call.status === 'BLOCKED') buckets[hour].blocked++;
      else if (call.status === 'FLAGGED') buckets[hour].flagged++;
      else buckets[hour].safe++;
    });
    return Object.entries(buckets).slice(-12);
  }, [toolCalls]);

  const stats = useMemo(() => {
    const total = toolCalls.length;
    const blocked = toolCalls.filter(c => c.status === 'BLOCKED').length;
    const pending = approvalRequests.filter(r => r.status === 'AWAITING_REVIEW').length;
    const avgRisk = total > 0 ? toolCalls.reduce((s, c) => s + (c.risk_score ?? 0), 0) / total : 0;
    return { total, blocked, pending, avgRisk };
  }, [toolCalls, approvalRequests]);

  const handleExportReport = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const H = 297;

    const colors = {
      base: [6, 6, 15],
      cyan: [62, 207, 207],
      red: [255, 77, 106],
      green: [52, 211, 153],
      amber: [255, 179, 71],
      purple: [123, 110, 255],
      white: [255, 255, 255],
      gray: [120, 130, 150],
      darkGray: [40, 50, 65],
      panelBg: [13, 13, 26],
      rowAlt: [17, 17, 32],
    };

    doc.setFontSize(36);
    doc.setTextColor(13, 13, 26);
    doc.text('AEGIS CONFIDENTIAL', W / 2, H / 2, { align: 'center', angle: 45 });

    doc.setFillColor(...(colors.base as [number, number, number]));
    doc.rect(0, 0, W, H, 'F');

    doc.setFontSize(38);
    doc.setTextColor(...(colors.cyan as [number, number, number]));
    doc.setFont('helvetica', 'bold');
    doc.text('AEGIS', 15, 28);

    doc.setFillColor(...(colors.cyan as [number, number, number]));
    doc.rect(15, 30, 42, 0.4, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...(colors.gray as [number, number, number]));
    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(2);
    doc.text('GATEWAY SECURITY INTELLIGENCE REPORT', 15, 36, { maxWidth: 120 });
    doc.setCharSpace(0);

    doc.setFontSize(7);
    doc.text(`GENERATED: ${new Date().toLocaleString('en-US')}`, 15, 42, { maxWidth: 120 });
    doc.text('CLASSIFICATION: TOP SECRET // AEGIS', 15, 47, { maxWidth: 120 });
    doc.text('ANALYST: SecOps Command Automated System', 15, 52, { maxWidth: 120 });

    const stampX = W - 68;
    const stampW = 52;
    const stampCX = stampX + stampW / 2;
    doc.setDrawColor(...(colors.red as [number, number, number]));
    doc.setLineWidth(0.8);
    doc.setFillColor(30, 8, 15);
    doc.roundedRect(stampX, 12, stampW, 26, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(...(colors.red as [number, number, number]));
    doc.setFont('helvetica', 'bold');
    doc.text('CLASSIFIED', stampCX, 22, { align: 'center' });

    doc.setFillColor(...(colors.red as [number, number, number]));
    doc.rect(stampX + 4, 24, stampW - 8, 0.3, 'F');

    const reportId = Math.random().toString(16).slice(2, 10).toUpperCase();
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...(colors.gray as [number, number, number]));
    doc.text(`RPT-${reportId}`, stampCX, 29, { align: 'center' });
    doc.text(new Date().toLocaleDateString('en-US'), stampCX, 34, { align: 'center' });

    doc.setFillColor(...(colors.red as [number, number, number]));
    doc.rect(stampX, 12, 4, 0.8, 'F');
    doc.rect(stampX, 12, 0.8, 4, 'F');
    doc.rect(stampX + stampW - 4, 12 + 26 - 0.8, 4, 0.8, 'F');
    doc.rect(stampX + stampW - 0.8, 12 + 26 - 4, 0.8, 4, 'F');

    doc.setFillColor(...(colors.cyan as [number, number, number]));
    doc.rect(15, 56, W - 30, 0.4, 'F');

    let y = 64;

    function checkPageBreak(needed: number) {
      if (y + needed > H - 20) {
        doc.addPage();
        doc.setFillColor(...(colors.base as [number, number, number]));
        doc.rect(0, 0, W, H, 'F');
        doc.setFontSize(36);
        doc.setTextColor(13, 13, 26);
        doc.text('AEGIS CONFIDENTIAL', W / 2, H / 2, { align: 'center', angle: 45 });
        y = 20;
      }
    }

    function sectionTitle(title: string) {
      checkPageBreak(15);
      doc.setFontSize(9);
      doc.setTextColor(...(colors.cyan as [number, number, number]));
      doc.setFont('helvetica', 'bold');
      doc.setCharSpace(1.5);
      doc.text(title, 15, y);
      doc.setCharSpace(0);
      doc.setFillColor(...(colors.darkGray as [number, number, number]));
      doc.rect(15, y + 2, W - 30, 0.3, 'F');
      y += 10;
    }

    function metricBox(label: string, value: string, color: number[], x: number, w: number) {
      doc.setFillColor(...(colors.panelBg as [number, number, number]));
      doc.setDrawColor(...(color as [number, number, number]));
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, w, 22, 2, 2, 'FD');

      doc.setFontSize(20);
      doc.setTextColor(...(color as [number, number, number]));
      doc.setFont('helvetica', 'bold');
      const cx = x + w / 2;
      doc.text(value, cx, y + 13, { align: 'center' });

      doc.setFontSize(6);
      doc.setTextColor(100, 110, 130);
      doc.setFont('helvetica', 'normal');
      doc.text(label, cx, y + 19, { align: 'center', maxWidth: w - 4 });
    }

    sectionTitle('01 // EXECUTIVE SUMMARY');
    const boxW = (W - 30 - 12) / 4;
    metricBox('TOTAL REQUESTS', stats.total.toString(), colors.cyan, 15, boxW);
    metricBox('BLOCKED', stats.blocked.toString(), colors.red, 15 + boxW + 4, boxW);
    metricBox('PENDING ALERTS', stats.pending.toString(), colors.amber, 15 + (boxW + 4) * 2, boxW);
    metricBox('AVG RISK SCORE', `${(stats.avgRisk * 100).toFixed(0)}%`, colors.purple, 15 + (boxW + 4) * 3, boxW);
    y += 30;

    sectionTitle('02 // THREAT DISTRIBUTION');
    const threats = [
      { name: 'Command Injection', color: colors.red },
      { name: 'Prompt Injection', color: colors.purple },
      { name: 'Path Traversal', color: colors.amber },
      { name: 'Recon Attempt', color: colors.cyan },
      { name: 'Safe', color: colors.green },
    ];
    const maxThreat = Math.max(...Object.values(threatDistribution), 1);
    const barMaxW = W - 30 - 50 - 20;
    threats.forEach(({ name, color }) => {
      const count = threatDistribution[name] || 0;
      const pct = ((count / (toolCalls.length || 1)) * 100).toFixed(0);
      const barW = (count / maxThreat) * barMaxW;
      checkPageBreak(10);
      doc.setFontSize(7.5);
      doc.setTextColor(...(colors.white as [number, number, number]));
      doc.setFont('helvetica', 'normal');
      doc.text(name, 15, y + 4);
      doc.setFillColor(...(colors.darkGray as [number, number, number]));
      doc.roundedRect(65, y, barMaxW, 5, 1, 1, 'F');
      if (barW > 0) {
        doc.setFillColor(...(color as [number, number, number]));
        doc.roundedRect(65, y, barW, 5, 1, 1, 'F');
      }
      doc.setFontSize(7);
      doc.setTextColor(...(color as [number, number, number]));
      doc.text(`${count} (${pct}%)`, W - 15, y + 4, { align: 'right' });
      y += 9;
    });
    y += 6;

    sectionTitle('03 // AGENT ACTIVITY MATRIX');
    doc.setFillColor(...(colors.darkGray as [number, number, number]));
    doc.rect(15, y, W - 30, 7, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...(colors.cyan as [number, number, number]));
    doc.setFont('helvetica', 'bold');
    doc.text('AGENT ID', 18, y + 5);
    doc.text('TOTAL CALLS', 85, y + 5, { align: 'center' });
    doc.text('BLOCKED', 120, y + 5, { align: 'center' });
    doc.text('RISK LEVEL', 160, y + 5, { align: 'center' });
    y += 7;

    agentActivity.forEach(([agent, data], i) => {
      const dangerPct = data.total > 0 ? data.blocked / data.total : 0;
      const riskLabel = dangerPct > 0.5 ? 'HIGH' : dangerPct > 0.2 ? 'MEDIUM' : 'LOW';
      const riskColor = dangerPct > 0.5 ? colors.red : dangerPct > 0.2 ? colors.amber : colors.green;

      checkPageBreak(8);
      doc.setFillColor(...(i % 2 === 0 ? colors.panelBg : colors.rowAlt) as [number, number, number]);
      doc.rect(15, y, W - 30, 7, 'F');

      doc.setFontSize(7);
      doc.setTextColor(...(colors.white as [number, number, number]));
      doc.setFont('helvetica', 'normal');
      doc.text(agent.slice(0, 30), 18, y + 5);
      doc.text(data.total.toString(), 85, y + 5, { align: 'center' });
      doc.setTextColor(...(colors.red as [number, number, number]));
      doc.text(data.blocked.toString(), 120, y + 5, { align: 'center' });

      doc.setFillColor(...(riskColor.map(v => v * 0.15) as [number, number, number]));
      doc.setDrawColor(...(riskColor as [number, number, number]));
      doc.setLineWidth(0.3);
      doc.roundedRect(145, y + 1.5, 30, 4, 1, 1, 'FD');
      doc.setTextColor(...(riskColor as [number, number, number]));
      doc.setFont('helvetica', 'bold');
      doc.text(riskLabel, 160, y + 5, { align: 'center' });
      y += 7;
    });
    y += 8;

    sectionTitle('04 // CONTROLS & COMPLIANCE MATRIX');
    const controls = [
      { name: 'AI Threat Inspection', detail: 'LLM payload analysis via Groq / Gemini' },
      { name: 'Rate Limiting', detail: 'Sliding window — 10 req/min per agent' },
      { name: 'Heuristic Filter Engine', detail: 'Regex threat signature matching layer' },
      { name: 'Access Policy Controller', detail: 'Permitted action allowlist enforcement' },
      { name: 'Audit Log Store', detail: 'Persistent tamper-evident PostgreSQL logs' },
      { name: 'Backpressure Buffer', detail: 'Circular queue for high-load spikes' },
      { name: 'Honeypot Decoy System', detail: 'Per-row decoy activation with modal UI' },
    ];
    controls.forEach((ctrl, i) => {
      checkPageBreak(8);
      doc.setFillColor(...(i % 2 === 0 ? colors.panelBg : colors.rowAlt) as [number, number, number]);
      doc.rect(15, y, W - 30, 7, 'F');

      doc.setFillColor(...(colors.green as [number, number, number]));
      doc.circle(20, y + 3.5, 1.5, 'F');

      doc.setFontSize(7.5);
      doc.setTextColor(...(colors.white as [number, number, number]));
      doc.setFont('helvetica', 'bold');
      doc.text(ctrl.name, 25, y + 5);

      doc.setTextColor(...(colors.green as [number, number, number]));
      doc.setFont('helvetica', 'normal');
      doc.text('[OK] ACTIVE', 95, y + 5);

      doc.setTextColor(...(colors.gray as [number, number, number]));
      doc.text(ctrl.detail, 130, y + 5);
      y += 7;
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = H - 12;
      doc.setFillColor(...(colors.cyan as [number, number, number]));
      doc.rect(15, footerY - 4, W - 30, 0.3, 'F');
      doc.setFontSize(6.5);
      doc.setTextColor(...(colors.gray as [number, number, number]));
      doc.setFont('helvetica', 'normal');
      doc.text('AEGIS GATEWAY v0.1.0 // EYES ONLY — AUTHORIZED PERSONNEL ONLY', 15, footerY);
      doc.text(`${i} of ${pageCount}`, W / 2, footerY, { align: 'center' });
      doc.text(`GENERATED ${new Date().toLocaleString('en-US')}`, W - 15, footerY, { align: 'right' });
    }

    doc.save('aegis-intelligence-report.pdf');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Threat analytics</h2>
          <p className="text-[11px] text-white/40">Aggregated from {toolCalls.length} requests · {approvalRequests.length} reviews</p>
        </div>
        <button
          onClick={handleExportReport}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#06060F]"
          style={{ background: 'linear-gradient(90deg, #3ECFCF, #7B6EFF)', boxShadow: '0 0 20px rgba(62,207,207,0.3)' }}
        >
          ↓ Export report
        </button>
      </div>

      {/* Threat distribution — plain bars, no recharts */}
      <GlassPanel className="lg:col-span-2 p-5">
        <Header title="Threat distribution" sub={`${toolCalls.length} requests`} />
        <div className="mt-4 space-y-3">
          {Object.entries(threatDistribution).map(([name, count]) => {
            const pct = (count / totalThreats) * 100;
            const color = threatColors[name] || '#3ECFCF';
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">{name}</span>
                  <span className="text-xs font-bold font-mono" style={{ color }}>{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <Header title="Top offenders" sub="Blocks by agent" />
        <div className="mt-4 space-y-3">
          {agentActivity.length === 0 && (
            <p className="text-xs text-white/20 text-center py-8">No agent activity yet</p>
          )}
          {agentActivity.slice(0, 6).map(([agent, data]) => {
            const dangerPct = data.total > 0 ? (data.blocked / data.total) * 100 : 0;
            const barColor = dangerPct > 50 ? '#FF4D6A' : dangerPct > 20 ? '#FFB347' : '#34D399';
            return (
              <div key={agent} className="flex items-center gap-3">
                <span className="text-xs text-white/70 font-mono w-24 truncate">{agent}</span>
                <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${dangerPct}%`, backgroundColor: barColor }} />
                </div>
                <span className="text-[10px] font-mono text-white/40">{data.blocked}/{data.total}</span>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Traffic timeline — plain SVG-free div bars */}
      <GlassPanel className="lg:col-span-3 p-5">
        <Header title="Traffic timeline" sub="Recent activity" />
        {timelineData.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-8">No timeline data yet</p>
        ) : (
          <div className="flex items-end gap-2 h-40 mt-4">
            {timelineData.map(([hour, data]) => {
              const maxVal = Math.max(...timelineData.map(([, d]) => d.safe + d.flagged + d.blocked), 1);
              const total = data.safe + data.flagged + data.blocked;
              const heightPct = (total / maxVal) * 100;
              return (
                <motion.div
                  key={hour}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 5)}%` }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="flex-1 rounded-t-md relative group cursor-pointer"
                  style={{
                    background: data.blocked > 0
                      ? 'linear-gradient(to top, rgba(255,77,106,0.4), rgba(255,77,106,0.1))'
                      : data.flagged > 0
                        ? 'linear-gradient(to top, rgba(255,179,71,0.4), rgba(255,179,71,0.1))'
                        : 'linear-gradient(to top, rgba(52,211,153,0.4), rgba(52,211,153,0.1))',
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {total}
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/20 font-mono whitespace-nowrap">
                    {hour}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#34D399]/40" /><span className="text-[10px] text-white/30">Safe</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#FFB347]/40" /><span className="text-[10px] text-white/30">Flagged</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#FF4D6A]/40" /><span className="text-[10px] text-white/30">Blocked</span></div>
        </div>
      </GlassPanel>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      {sub && <span className="text-[11px] uppercase tracking-[0.16em] text-white/40">{sub}</span>}
    </div>
  );
}
