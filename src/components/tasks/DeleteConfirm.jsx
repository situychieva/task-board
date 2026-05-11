import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '../ui';

export function DeleteConfirm({ task, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    onConfirm();
  };

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--red-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertTriangle size={18} strokeWidth={1.8} color="var(--red)" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            Delete this task?
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
            "<strong>{task.title}</strong>" will be permanently removed. This can't be undone.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '7px 16px', borderRadius: 'var(--r-sm)',
            fontSize: 13, fontWeight: 500,
            background: 'var(--bg)', border: '0.5px solid var(--sep)',
            color: 'var(--text-2)',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            padding: '7px 18px', borderRadius: 'var(--r-sm)',
            fontSize: 13, fontWeight: 600,
            background: 'var(--red)', color: '#fff',
            border: 'none',
            boxShadow: '0 1px 4px rgba(255,59,48,0.28)',
            opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'opacity 0.15s',
          }}
        >
          {loading && <Spinner size={13} />}
          Delete
        </button>
      </div>
    </div>
  );
}