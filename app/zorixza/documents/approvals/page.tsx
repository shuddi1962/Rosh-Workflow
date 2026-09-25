'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError } from '@/lib/zorixza/client';

interface Approval extends Record<string, unknown> {
  id: string; entity_type: string; entity_id: string; entity_ref: string | null;
  action: string | null; status: string; requested_by_name: string | null; created_at: string;
}

type Decision = 'approved' | 'returned' | 'rejected';

export default function DocumentsApprovalsPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useZxQuery<{ approvals: Approval[] }>('/api/approvals?limit=300');
  const [target, setTarget] = useState<Approval | null>(null);
  const [decision, setDecision] = useState<Decision>('approved');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Document-control slice of the universal approval inbox.
  const rows = asArray<Approval>(data, ['approvals']).filter((a) =>
    ['document', 'receipt', 'file', 'cloud_file'].includes(String(a.entity_type))
  );

  const columns: ZxColumn<Approval>[] = [
    { key: 'ref', label: 'Document', render: (a) => (
      <span><span className="font-semibold text-slate-800">{String(a.entity_ref || a.entity_id)}</span>
      <span className="block text-xs text-slate-400 font-normal">{String(a.entity_type)}{a.action ? ` · ${String(a.action)}` : ''}</span></span>
    ) },
    { key: 'by', label: 'Submitted by', render: (a) => <span className="text-slate-500">{String(a.requested_by_name ?? '—')}</span> },
    { key: 'at', label: 'Submitted', render: (a) => <span className="text-slate-500 whitespace-nowrap">{String(a.created_at || '').slice(0, 10)}</span> },
    { key: 'status', label: 'Status', render: (a) => {
      const s = String(a.status);
      return <ZxBadge tone={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : s === 'returned' ? 'amber' : 'blue'}>{s}</ZxBadge>;
    } },
    { key: 'act', label: '', align: 'right', render: (a) => String(a.status) === 'pending' ? (
      <button
        onClick={() => { setTarget(a); setDecision('approved'); setComment(''); setFormError(null); }}
        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-emerald-700 transition"
      >
        Decide
      </button>
    ) : <span /> },
  ];

  async function decide(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    if (decision === 'returned' && !comment.trim()) {
      setFormError('A return reason is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch(`/api/approvals/${String(target.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment: comment.trim() }),
      });
      setTarget(null);
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not record decision');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ZxLoading label="Loading document approvals…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title="Document approvals" hint="Submit → review → approve / return / forward — every decision is audited">
      <ZxTable<Approval>
        columns={columns}
        rows={rows}
        searchKeys={['entity_ref', 'entity_id', 'entity_type', 'requested_by_name']}
        searchPlaceholder="Search document, submitter…"
        emptyTitle="No documents awaiting control"
        emptyHint="Receipts, uploads and controlled documents queue here for review."
      />
      {target && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setTarget(null)} />
          <form onSubmit={decide} className="relative bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Decide document</p>
            <p className="font-extrabold text-slate-900 mt-1">{String(target.entity_ref || target.entity_id)}</p>
            <p className="text-xs text-slate-400">{String(target.entity_type)}</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {(['approved', 'returned', 'rejected'] as Decision[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDecision(d)}
                  className={`py-2 rounded-xl text-xs font-extrabold capitalize transition ${decision === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={decision === 'returned' ? 'Return reason (required)…' : 'Comment (optional)…'}
              className="mt-3 w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
            />
            {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
            <div className="flex gap-2 mt-3">
              <button disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Recording…' : `Confirm ${decision}`}
              </button>
              <button type="button" onClick={() => setTarget(null)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </ZxSection>
  );
}
