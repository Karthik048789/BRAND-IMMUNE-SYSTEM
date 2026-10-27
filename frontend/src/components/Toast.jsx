import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast" style={{
          borderLeft: t.type === 'error' ? '4px solid #F43F5E' : t.type === 'warning' ? '4px solid #F59E0B' : '4px solid #10B981'
        }}>
          {t.type === 'error' ? (
            <AlertCircle size={18} color="#F43F5E" />
          ) : t.type === 'warning' ? (
            <AlertCircle size={18} color="#F59E0B" />
          ) : (
            <CheckCircle2 size={18} color="#10B981" />
          )}

          <div style={{ flex: 1, fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{t.title}</div>
            {t.message && <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t.message}</div>}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
