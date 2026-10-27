import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Sliders, 
  Sparkles, 
  Play, 
  RotateCcw,
  Activity
} from 'lucide-react';

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  activeTab, 
  setActiveTab, 
  pendingCount, 
  proposedCount,
  onStartDemoTour,
  onResetSeed
}) {
  const roles = [
    { id: 'reviewer', label: 'Human Reviewer', desc: 'Triage & verify ambiguous content' },
    { id: 'brand_manager', label: 'Brand Manager', desc: 'Approve new rules & monitor risk' },
    { id: 'admin', label: 'System Admin', desc: 'Audit trails & rule sensitivity' },
    { id: 'submitter', label: 'Content Creator', desc: 'Scan and test campaign copy' }
  ];

  return (
    <header className="app-header">
      <div className="brand-badge" onClick={() => setActiveTab('queue')}>
        <div className="logo-shield">
          <ShieldCheck size={22} color="#080C14" strokeWidth={2.6} />
        </div>
        <div>
          <div className="brand-title">
            BRAND IMMUNE SYSTEM
            <span style={{ 
              fontSize: '0.68rem', 
              background: 'rgba(0, 240, 255, 0.15)', 
              color: '#00F0FF', 
              padding: '2px 7px', 
              borderRadius: '999px',
              border: '1px solid rgba(0, 240, 255, 0.3)' 
            }}>
              v1.0 ACTIVE
            </span>
          </div>
          <div className="brand-subtitle">Autonomous Brand Governance & Self-Learning Layer</div>
        </div>
      </div>

      {/* Role Switcher Pill Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Acting Role:
          </span>
          <div className="role-pill-group">
            {roles.map((r) => (
              <button
                key={r.id}
                className={`role-pill ${currentRole === r.id ? 'active' : ''}`}
                onClick={() => setCurrentRole(r.id)}
                title={r.desc}
              >
                {r.id === 'reviewer' && <UserCheck size={14} />}
                {r.id === 'brand_manager' && <Sparkles size={14} />}
                {r.id === 'admin' && <Sliders size={14} />}
                {r.id === 'submitter' && <Activity size={14} />}
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn btn-demo-pulse"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
            onClick={onStartDemoTour}
            title="Launch interactive step-by-step hackathon demo walk-through"
          >
            <Play size={14} /> Run Demo Tour
          </button>

          <button 
            className="btn btn-subtle"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
            onClick={onResetSeed}
            title="Reset system to clean seed data state"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
    </header>
  );
}
