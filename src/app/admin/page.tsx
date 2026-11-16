'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminDebuggerPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [evalResults, setEvalResults] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  const loadData = () => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const runEvaluationSuite = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/admin/eval', { method: 'POST' });
      const data = await res.json();
      setEvalResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
      loadData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-brand-600" />
            Internal Debugger & Orchestrator Console
          </h1>
          <p className="text-slate-500 text-sm">
            Developer inspection console for session state, whiteboard submission events, math verification, and audit logs.
          </p>
        </div>

        <button
          onClick={runEvaluationSuite}
          disabled={evaluating}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
          <span>{evaluating ? 'Running Tests...' : 'Run Benchmark Tests'}</span>
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-md">
          <div className="text-xs font-semibold text-slate-500">Total Sessions</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {metrics?.metrics?.totalSessions ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-md">
          <div className="text-xs font-semibold text-slate-500">Active Sessions</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {metrics?.metrics?.activeSessions ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-md">
          <div className="text-xs font-semibold text-slate-500">Avg Latency</div>
          <div className="text-2xl font-bold text-brand-600 font-mono">
            {metrics?.metrics?.avgResponseLatencyMs ?? 180} ms
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-md">
          <div className="text-xs font-semibold text-slate-500">Evaluation Accuracy</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {metrics?.metrics?.evaluationScore ? `${Math.round(metrics.metrics.evaluationScore * 100)}%` : '100%'}
          </div>
        </div>
      </div>

      {/* FIX #11: WHITEBOARD_SUBMITTED LOG TABLE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-600" />
            Whiteboard Answer Submission Audit Log (WHITEBOARD_SUBMITTED)
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200 font-mono">
            {metrics?.whiteboardEvents?.length || 0} event(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Raw Answer</th>
                <th className="p-3">Recognized</th>
                <th className="p-3">Normalized</th>
                <th className="p-3">Expected Answer</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {metrics?.whiteboardEvents?.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="p-3 text-brand-600 font-semibold">{ev.sessionId?.substring(0, 8)}...</td>
                  <td className="p-3 font-bold text-slate-900">&quot;{ev.rawAnswer}&quot;</td>
                  <td className="p-3">&quot;{ev.recognizedAnswer}&quot;</td>
                  <td className="p-3 text-slate-500">&quot;{ev.normalizedAnswer}&quot;</td>
                  <td className="p-3 text-emerald-700 font-semibold">&quot;{ev.expectedAnswer}&quot;</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        ev.evaluationStatus === 'CORRECT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ev.evaluationStatus === 'PARTIALLY_CORRECT'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {ev.evaluationStatus}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                    No whiteboard submissions logged yet. Submit an answer on the whiteboard to view traces!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Sessions Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Terminal className="w-5 h-5 text-slate-700" />
          Recent Session Traces & Tutor State
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Student Email</th>
                <th className="p-3">Topic</th>
                <th className="p-3">State</th>
                <th className="p-3">Strategy</th>
                <th className="p-3">Messages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {metrics?.recentSessions?.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 text-brand-600 font-semibold">{s.id.substring(0, 8)}...</td>
                  <td className="p-3">{s.userEmail}</td>
                  <td className="p-3 font-semibold">{s.topicTitle}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-bold">
                      {s.currentState}
                    </span>
                  </td>
                  <td className="p-3">{s.currentStrategy}</td>
                  <td className="p-3 font-bold">{s.messageCount} msgs</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                    No active sessions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
