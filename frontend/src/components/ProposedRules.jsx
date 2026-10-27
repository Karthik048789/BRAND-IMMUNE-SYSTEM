import React from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Layers, 
  Tag, 
  ShieldCheck, 
  Clock, 
  Play,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProposedRules({ 
  proposedRules, 
  onApproveRule, 
  onRejectRule, 
  onDiscoverDemo,
  isActionLoading 
}) {
  const handleApprove = (clusterId) => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    onApproveRule(clusterId);
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles color="#A855F7" size={24} />
            AI-Proposed Antibody Rules (Clustering Discovery)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Unwritten brand guidelines automatically discovered by clustering recurring manual reviewer flags and overrides.
          </p>
        </div>

        {/* Demo trigger button */}
        <button
          className="btn btn-demo-pulse"
          onClick={onDiscoverDemo}
          disabled={isActionLoading}
          style={{ fontSize: '0.84rem' }}
        >
          <Play size={14} /> Discover New Cluster (Live ML Demo)
        </button>
      </div>

      {/* Rules Grid */}
      {proposedRules.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Layers size={40} color="var(--purple-cluster)" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '0.35rem' }}>No Candidate Clusters</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            As reviewers manually flag and reject novel patterns, clusters will automatically formulate here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '1.25rem' }}>
          {proposedRules.map((rule) => {
            const isApproved = rule.status === 'approved';
            const isPending = rule.status === 'pending_approval';

            return (
              <div 
                key={rule.cluster_id} 
                className="glass-panel"
                style={{ 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isApproved ? '4px solid #10B981' : isPending ? '4px solid #A855F7' : '4px solid #F43F5E',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-learned-rule" style={{ textTransform: 'capitalize' }}>
                        {rule.category} Layer
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Cluster #{rule.cluster_id}
                      </span>
                    </div>

                    <div>
                      {isApproved ? (
                        <span className="badge badge-auto-pass">
                          <CheckCircle size={12} /> Active in Scanner
                        </span>
                      ) : isPending ? (
                        <span className="badge badge-learned-rule">
                          <Clock size={12} /> Pending Approval
                        </span>
                      ) : (
                        <span className="badge badge-auto-flag">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Pattern Description */}
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.4rem', fontWeight: 600 }}>
                    {rule.rule_name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {rule.pattern_description}
                  </p>

                  {/* Discovered Phrase Tags */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
                      Identified Characteristic Tokens:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {rule.detected_phrases.map((phrase, idx) => (
                        <span 
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            background: 'rgba(168, 85, 247, 0.12)',
                            color: '#D8B4FE',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Tag size={11} /> {phrase}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Supporting Cluster Examples */}
                  <div style={{ marginBottom: '1.25rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Supporting Human Flags ({rule.example_case_ids.length} cases):
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#00F0FF', fontWeight: 600 }}>
                        {Math.round(rule.confidence * 100)}% Cluster Cohesion
                      </span>
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {rule.example_snippets.map((snip, idx) => (
                        <li key={idx} style={{ marginBottom: '3px' }}>{snip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {isPending ? (
                    <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
                      <button
                        className="btn btn-accept"
                        style={{ flex: 1, fontSize: '0.84rem' }}
                        onClick={() => handleApprove(rule.cluster_id)}
                        disabled={isActionLoading}
                      >
                        <ShieldCheck size={15} /> Approve & Deploy Rule
                      </button>
                      <button
                        className="btn btn-reject"
                        style={{ fontSize: '0.84rem' }}
                        onClick={() => onRejectRule(rule.cluster_id)}
                        disabled={isActionLoading}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  ) : isApproved ? (
                    <div style={{ fontSize: '0.78rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> Approved by {rule.approved_by || 'Brand Manager'} — Deployed into live scanner
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Rejected by Brand Manager
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
