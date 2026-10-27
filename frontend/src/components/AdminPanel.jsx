import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Terminal, 
  CheckCircle2, 
  RotateCcw, 
  Server, 
  FileCode,
  Search
} from 'lucide-react';

export default function AdminPanel({ auditLogs, onResetSeed }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = (auditLogs || []).filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.actor || '').toLowerCase().includes(term) ||
      (log.action || '').toLowerCase().includes(term) ||
      (log.entity || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Shield color="#00F0FF" size={24} />
          System Administration & Compliance Audit Trail
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Immutable ledger of all agent evaluations, reviewer overrides, and rule weight recalibrations.
        </p>
      </div>

      {/* System Status Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Health */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Microservices Status
            </span>
            <span className="badge badge-auto-pass">
              <CheckCircle2 size={12} /> Online & Operational
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tone Agent Service:</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Active (v1.2)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Factual Consistency Agent:</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Active (v1.2)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Visual/Logo Agent:</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Active (v1.2)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Compliance & Legal Agent:</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Active (v1.2)</span>
            </div>
          </div>
        </div>

        {/* Vector DB status */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Memory Bank Vector DB
            </span>
            <Database size={16} color="var(--cyan-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
            16 Indexed Precedents
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            High-dimensional dense embeddings store historical human review decisions with cosine similarity retrieval.
          </p>
          <button 
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            onClick={onResetSeed}
          >
            <RotateCcw size={12} /> Reset Database to Pristine Seed
          </button>
        </div>

        {/* API Gateway Webhook Endpoints */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              API Gateway Webhook Integrations
            </span>
            <Terminal size={16} color="var(--purple-cluster)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Scan Endpoint:</span>
              <div className="font-mono" style={{ color: 'var(--cyan-primary)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                POST /api/content/scan
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Review Feedback:</span>
              <div className="font-mono" style={{ color: '#D8B4FE', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                POST /api/review/decision
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={18} color="var(--cyan-primary)" />
              Immutable Governance Audit Log
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Non-repudiable log of every scan, human decision, and system weight shift
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <Search size={14} color="var(--text-dim)" />
            <input 
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Event ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Actor (Role)</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Target Entity</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="font-mono" style={{ padding: '0.75rem 0.5rem', color: 'var(--cyan-primary)' }}>
                    {log.id}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-dim)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#FFFFFF' }}>
                    {log.actor} <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>({log.role})</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      background: 'rgba(255,255,255,0.06)', 
                      padding: '2px 7px', 
                      borderRadius: '4px',
                      color: 'var(--text-main)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                    {log.entity}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)', maxWidth: '350px' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
