'use client';

import React, { useState } from 'react';
import { Folder, FileText, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { useZxQuery, asArray, ZxTable, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface DriveFolder extends Record<string, unknown> { id: string; name: string }
interface DriveFile extends Record<string, unknown> {
  id: string; name: string; size_bytes: number; updated_at: string; is_starred: boolean;
}

function fmtBytes(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}

const COLUMNS: ZxColumn<DriveFile>[] = [
  { key: 'name', label: 'File', render: (f) => (
    <span className="flex items-center gap-2">
      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="font-semibold text-slate-800 truncate">{String(f.name)}</span>
      {Boolean(f.is_starred) && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
    </span>
  ) },
  { key: 'size', label: 'Size', align: 'right', render: (f) => <span className="text-slate-500 tabular-nums">{fmtBytes(Number(f.size_bytes || 0))}</span> },
  { key: 'updated', label: 'Modified', render: (f) => <span className="text-slate-500 whitespace-nowrap">{String(f.updated_at || '').slice(0, 10) || '—'}</span> },
];

export default function ZorixzaFilesPage() {
  const [folder, setFolder] = useState('root');
  const folders = useZxQuery<unknown>('/api/drive/folders?limit=200');
  const files = useZxQuery<{ files: DriveFile[] }>(`/api/drive/files?folder=${encodeURIComponent(folder)}&limit=200`);

  const folderRows = asArray<DriveFolder>(folders.data, ['folders']);
  const fileRows = asArray<DriveFile>(files.data, ['files']);

  if (folders.loading || files.loading) return <ZxLoading label="Loading drive…" />;
  if (files.error) return <ZxError message={files.error} onRetry={() => { files.reload(); folders.reload(); }} />;

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-4">
      <ZxSection title="Folders" hint={`${folderRows.length}`}>
        <div className="space-y-1">
          <button
            onClick={() => setFolder('root')}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition',
              folder === 'root' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Folder className="w-4 h-4" /> Root
          </button>
          {folderRows.map((f) => (
            <button
              key={String(f.id)}
              onClick={() => setFolder(String(f.id))}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition truncate',
                folder === String(f.id) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span className="truncate">{String(f.name)}</span>
            </button>
          ))}
        </div>
      </ZxSection>
      <ZxSection title={`Files (${fileRows.length})`} hint={folder === 'root' ? 'Root folder' : 'Selected folder'}>
        <ZxTable<DriveFile>
          columns={COLUMNS}
          rows={fileRows}
          searchKeys={['name']}
          searchPlaceholder="Search files…"
          emptyTitle="Folder is empty"
          emptyHint="Uploads from any workspace land here, tenant-isolated."
        />
      </ZxSection>
    </div>
  );
}
