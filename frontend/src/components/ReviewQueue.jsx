import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ReviewQueue({ 
  submissions, 
  onSelectSubmission, 
  loading, 
  onRefresh 
}) {
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered submissions with null-safe accessors
  const filtered = submissions.filter((item) => {
    if (!item) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (channelFilter !== 'all' && (item.channel || '').toLowerCase() !== channelFilter.toLowerCase()) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(term) ||
        (item.raw_content || '').toLowerCase().includes(term) ||
        (item.channel || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_review':
        return <span className="badge badge-human-review"><Clock size={12} /> Pending Review</span>;
      case 'auto_passed':
        return <span className="badge badge-auto-pass"><CheckCircle2 size={12} /> Auto-Passed</span>;
      case 'auto_flagged':
        return <span className="badge badge-auto-flag"><XCircle size={12} /> Auto-Flagged</span>;
      case 'reviewed_accepted':
        return <span className="badge badge-auto-pass"><CheckCircle2 size={12} /> Reviewed: Approved</span>;
      case 'reviewed_rejected':
        return <span className="badge badge-auto-flag"><XCircle size={12} /> Reviewed: Rejected</span>;
      case 'reviewed_edited':
        return <span className="badge badge-human-review"><Sparkles size={12} /> Reviewed: Edited</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getAgentPills = (routing) => {
    if (!routing || !routing.agent_breakdown) return null;
    const breakdown = routing.agent_breakdown;
    
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Object.entries(breakdown).map(([key, res]) => {
          if (!res) return null;
          const isFlagged = res.flagged;
          return (
            <span 
              key={key}
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: isFlagged ? 'rgba(244, 63, 94, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                color: isFlagged ? '#F43F5E' : 'var(--text-dim)',
                border: isFlagged ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-subtle)',
                fontWeight: isFlagged ? '600' : '400',
                textTransform: 'capitalize'
              }}
              title={res.explanation}
            >
              {key}: {intToPercent(res.score)}%
            </span>
          );
        })}
      </div>
    );
  };

  const intToPercent = (val) => Math.round((val || 0) * 100);

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Top Banner / Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers color="#00F0FF" size={24} />
            Content Governance Queue
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Real-time multi-agent scan results with automated routing and human-in-the-loop verification.
          </p>
        </div>

        {/* Quick status tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'pending_review', label: 'Human Queue', count: submissions.filter(s => s.status === 'pending_review').length },
            { id: 'auto_flagged', label: 'Auto-Flagged', count: submissions.filter(s => s.status === 'auto_flagged').length },
            { id: 'auto_passed', label: 'Auto-Passed', count: submissions.filter(s => s.status === 'auto_passed').length },
            { id: 'all', label: 'All Cases', count: submissions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === tab.id ? 'rgba(0, 240, 255, 0.16)' : 'transparent',
                color: statusFilter === tab.id ? '#00F0FF' : 'var(--text-muted)',
                fontWeight: statusFilter === tab.id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
              <span style={{ 
                fontSize: '0.7rem', 
                background: statusFilter === tab.id ? '#00F0FF' : 'rgba(255,255,255,0.08)',
                color: statusFilter === tab.id ? '#080C14' : 'var(--text-muted)',
                padding: '1px 5px',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, background: 'rgba(0,0,0,0.25)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <Search size={16} color="var(--text-dim)" />
          <input 
            type="text"
            placeholder="Search campaign copy, title, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              width: '100%',
              fontSize: '0.88rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-dim)" />
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          >
            <option value="all">All Channels</option>
            <option value="twitter/x">Twitter/X</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="website">Website</option>
            <option value="packaging">Packaging</option>
          </select>
        </div>
      </div>

      {/* Table / Cards List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>All Caught Up!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No submissions match the current filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((item) => {
            const routing = item.routing || {};
            const isPending = item.status === 'pending_review';

            return (
              <div 
                key={item.id}
                className="glass-panel glow-cyan queue-item-card"
                style={{ 
                  borderLeft: isPending ? '4px solid #F59E0B' : item.status === 'auto_flagged' ? '4px solid #F43F5E' : '4px solid #10B981'
                }}
              >
                {/* Left: Content snippet & metadata */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      background: 'rgba(255,255,255,0.06)', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      color: 'var(--text-muted)' 
                    }}>
                      {item.channel}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      ID: {item.id}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      By: {item.submitter_id}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '0.4rem', fontWeight: 600 }}>
                    {item.title}
                  </h4>

                  <p style={{ 
                    fontSize: '0.86rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{item.raw_content}"
                  </p>
                </div>

                {/* Middle: Agent breakdown */}
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
                    Antibody Agent Scan:
                  </div>
                  {getAgentPills(routing)}
                  {routing.top_memory_match && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: '#00F0FF' }}>
                      Precedent: Case #{routing.top_memory_match.case_id} ({intToPercent(routing.top_memory_match.similarity)}% match)
                    </div>
                  )}
                </div>

                {/* Status & Confidence */}
                <div>
                  <div style={{ marginBottom: '0.4rem' }}>
                    {getStatusBadge(item.status)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Confidence: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{intToPercent(routing.combined_confidence)}%</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Violation Risk: <span style={{ color: routing.combined_score > 0.5 ? '#F43F5E' : '#10B981', fontWeight: 600 }}>{intToPercent(routing.combined_score)}%</span>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    className={isPending ? 'btn btn-primary' : 'btn btn-subtle'}
                    style={{ width: '100%', fontSize: '0.84rem', padding: '0.55rem 0.85rem' }}
                    onClick={() => onSelectSubmission(item)}
                  >
                    {isPending ? 'Review Case' : 'View Audit'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
