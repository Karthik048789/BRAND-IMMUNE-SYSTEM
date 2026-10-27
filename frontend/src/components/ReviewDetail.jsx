import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Edit3, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle,
  Database,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

export default function ReviewDetail({ 
  submission, 
  onBack, 
  onSubmitDecision, 
  isSubmitting 
}) {
  if (!submission) return null;

  const [decision, setDecision] = useState('accept'); // 'accept' | 'reject' | 'edit'
  const [reasonCode, setReasonCode] = useState('BRAND_ALIGNMENT_EXCEPTION');
  const [comment, setComment] = useState('');
  const [editedContent, setEditedContent] = useState(submission.raw_content || '');
  const [selectedAgentTab, setSelectedAgentTab] = useState('tone');
  const [hoveredSpan, setHoveredSpan] = useState(null);

  useEffect(() => {
    if (submission) {
      setEditedContent(submission.raw_content || '');
      if (submission.human_decision) {
        setDecision(submission.human_decision.decision || 'accept');
        setReasonCode(submission.human_decision.reason_code || 'FALSE_POSITIVE');
        setComment(submission.human_decision.comment || '');
      } else {
        setComment('');
      }
    }
  }, [submission?.id, submission?.raw_content]);

  const routing = submission.routing || {};
  const agentBreakdown = routing.agent_breakdown || {};
  const topMatch = routing.top_memory_match;

  const reasonCodeOptions = [
    { code: 'FALSE_POSITIVE', label: 'False Positive — AI over-flagged acceptable content' },
    { code: 'BRAND_ALIGNMENT_EXCEPTION', label: 'Approved Exception — Contextual audience/channel fit' },
    { code: 'POLICY_BREACH_CONFIRMED', label: 'Confirmed Breach — Genuine brand violation' },
    { code: 'OFF_TONE_CONFIRMED', label: 'Tone Violation — Disparaging, cynical, or off-brand' },
    { code: 'FACTUAL_ERROR_CONFIRMED', label: 'Factual Risk — Unverifiable superlative or metric' },
    { code: 'LEGAL_RISK_CONFIRMED', label: 'Regulatory Risk — Missing mandatory legal disclosure' },
    { code: 'CONTEXTUAL_NUANCE_APPROVED', label: 'Contextual Nuance — Acceptable colloquial style' },
    { code: 'SLIGHT_COPY_EDIT_REQUIRED', label: 'Minor Edit — Copy modified to meet standards' }
  ];

  const handleDecisionSubmit = (e) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 3) {
      alert("A mandatory reviewer comment is required for compliance audit trails.");
      return;
    }

    onSubmitDecision({
      content_id: submission.id,
      decision: decision,
      reason_code: reasonCode,
      comment: comment,
      edited_content: decision === 'edit' ? editedContent : null
    });
  };

  // Render highlighted spans inside content with case-insensitive token mapping
  const renderHighlightedContent = () => {
    const raw = submission.raw_content || '';
    const allSpans = [];
    Object.values(agentBreakdown).forEach(agent => {
      if (agent && agent.flagged_spans) {
        agent.flagged_spans.forEach(span => {
          if (span && span.text && raw.toLowerCase().includes(span.text.toLowerCase())) {
            allSpans.push(span);
          }
        });
      }
    });

    if (allSpans.length === 0) {
      return <span>{raw}</span>;
    }

    // Sort spans by text length descending so longer phrases match first
    allSpans.sort((a, b) => b.text.length - a.text.length);
    const seen = new Set();
    const uniqueSpans = [];
    for (const span of allSpans) {
      const lower = span.text.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueSpans.push(span);
      }
    }

    let elements = [raw];
    uniqueSpans.forEach((span, sIdx) => {
      const newElements = [];
      elements.forEach(item => {
        if (typeof item === 'string') {
          const lowerItem = item.toLowerCase();
          const lowerSpan = span.text.toLowerCase();
          let startIdx = 0;
          let matchIdx = lowerItem.indexOf(lowerSpan, startIdx);

          if (matchIdx === -1) {
            newElements.push(item);
          } else {
            while (matchIdx !== -1) {
              if (matchIdx > startIdx) {
                newElements.push(item.substring(startIdx, matchIdx));
              }
              const matchedText = item.substring(matchIdx, matchIdx + span.text.length);
              newElements.push(
                <span
                  key={`${sIdx}-${matchIdx}`}
                  className={`flagged-span-highlight ${span.severity === 'medium' ? 'medium' : ''}`}
                  onMouseEnter={() => setHoveredSpan(span)}
                  onMouseLeave={() => setHoveredSpan(null)}
                  title={`${span.issue} Suggestion: ${span.suggestion || 'None'}`}
                >
                  {matchedText}
                </span>
              );
              startIdx = matchIdx + span.text.length;
              matchIdx = lowerItem.indexOf(lowerSpan, startIdx);
            }
            if (startIdx < item.length) {
              newElements.push(item.substring(startIdx));
            }
          }
        } else {
          newElements.push(item);
        }
      });
      elements = newElements;
    });

    return elements;
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Navigation Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button 
          className="btn btn-subtle" 
          onClick={onBack}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
        >
          <ArrowLeft size={15} /> Back to Queue
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Submission ID: <strong style={{ color: '#FFFFFF' }}>{submission.id}</strong>
          </span>
          <span style={{ 
            fontSize: '0.75rem', 
            background: 'rgba(255,255,255,0.06)', 
            padding: '3px 10px', 
            borderRadius: '999px',
            color: 'var(--text-muted)'
          }}>
            Channel: <strong>{submission.channel}</strong>
          </span>
        </div>
      </div>

      {/* Split Review Layout */}
      <div className="split-review-container">
        
        {/* LEFT COLUMN: Content Preview & Flagged Spans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Content Asset Preview
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginTop: '2px' }}>
                  {submission.title}
                </h3>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                By: {submission.submitter_id}
              </span>
            </div>

            {/* Image Preview if present */}
            {submission.image_url && (
              <div style={{ marginBottom: '1.25rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <img 
                  src={submission.image_url} 
                  alt="Campaign Asset Preview" 
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  right: '8px', 
                  background: 'rgba(8, 12, 20, 0.85)', 
                  padding: '3px 8px', 
                  borderRadius: '6px', 
                  fontSize: '0.7rem', 
                  color: 'var(--cyan-primary)',
                  border: '1px solid rgba(0, 240, 255, 0.3)'
                }}>
                  Visual Analysis: Logo Lockup Verified
                </div>
              </div>
            )}

            {/* Interactive Content Box */}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.35)', 
              padding: '1.25rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-subtle)',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#F3F4F6',
              minHeight: '110px'
            }}>
              {renderHighlightedContent()}
            </div>

            {/* Hovered Span Tooltip / Card */}
            {hoveredSpan && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.85rem 1rem', 
                background: 'rgba(244, 63, 94, 0.1)', 
                border: '1px solid rgba(244, 63, 94, 0.4)', 
                borderRadius: '8px',
                animation: 'slideInToast 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F43F5E', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <AlertCircle size={15} /> Flagged Span: "{hoveredSpan.text}"
                </div>
                <div style={{ fontSize: '0.82rem', color: '#FFFFFF', marginBottom: '0.35rem' }}>
                  {hoveredSpan.issue}
                </div>
                {hoveredSpan.suggestion && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>Actionable Suggestion:</strong> {hoveredSpan.suggestion}
                  </div>
                )}
              </div>
            )}

            {/* Hint Box */}
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.76rem' }}>
              <Info size={14} color="var(--cyan-primary)" />
              Hover highlighted phrases above to inspect agent violation details & suggestions.
            </div>
          </div>

          {/* Historical Decision (if already decided) */}
          {submission.human_decision && (
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#10B981', fontWeight: 600, fontSize: '0.88rem' }}>
                <Check size={16} /> Human Decision Recorded
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                <strong>Reason:</strong> {submission.human_decision.reason_code}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                "{submission.human_decision.comment}"
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Reviewed by {submission.human_decision.reviewer_name} at {new Date(submission.human_decision.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Explainability, Memory Match, Agent Tabs & Decision Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Explainability Card (PRD FR10) */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Explainability Rationale
                </span>
                <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginTop: '2px' }}>
                  Why Was This Flagged?
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>AI Confidence</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00F0FF' }}>
                  {Math.round((routing.combined_confidence || 0) * 100)}%
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1rem' }}>
              {routing.explainability || routing.route_reason}
            </p>

            {/* Memory Bank Match Precedent */}
            {topMatch ? (
              <div className="memory-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Database size={13} /> Vector Memory Precedent
                  </span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 7px', 
                    borderRadius: '4px',
                    background: topMatch.resolution === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    color: topMatch.resolution === 'approved' ? '#10B981' : '#F43F5E',
                    fontWeight: 600
                  }}>
                    {Math.round(topMatch.similarity * 100)}% Match ({topMatch.resolution.toUpperCase()})
                  </span>
                </div>
                <h5 style={{ fontSize: '0.84rem', color: '#FFFFFF', marginBottom: '0.2rem' }}>
                  Case #{topMatch.case_id}: {topMatch.title}
                </h5>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {topMatch.reason}
                </p>
              </div>
            ) : (
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                No direct historical case match (&gt;35%) found in memory bank. Cold-start precedent initiated.
              </div>
            )}
          </div>

          {/* 4 Multi-Agent Tabs */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              {[
                { id: 'tone', label: 'Tone Agent' },
                { id: 'factual', label: 'Factual Agent' },
                { id: 'visual', label: 'Visual Agent' },
                { id: 'compliance', label: 'Compliance' },
              ].map(tab => {
                const res = agentBreakdown[tab.id];
                const isFlagged = res && res.flagged;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedAgentTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: selectedAgentTab === tab.id ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selectedAgentTab === tab.id ? '#00F0FF' : isFlagged ? '#F43F5E' : 'var(--text-muted)',
                      fontWeight: selectedAgentTab === tab.id ? '600' : '400',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {isFlagged && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F43F5E' }} />}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Selected Agent Details */}
            {agentBreakdown[selectedAgentTab] ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {agentBreakdown[selectedAgentTab].agent_name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span>Score: <strong>{Math.round(agentBreakdown[selectedAgentTab].score * 100)}%</strong></span>
                    <span>Confidence: <strong>{Math.round(agentBreakdown[selectedAgentTab].confidence * 100)}%</strong></span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                  {agentBreakdown[selectedAgentTab].explanation}
                </p>

                {agentBreakdown[selectedAgentTab].suggestions && agentBreakdown[selectedAgentTab].suggestions.length > 0 && (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Recommended Action:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#FFFFFF' }}>
                      {agentBreakdown[selectedAgentTab].suggestions[0]}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No data for agent.</div>
            )}
          </div>

          {/* Reviewer Decision Form (PRD FR5) */}
          <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--cyan-primary)" />
              Human-in-the-Loop Decision Gate
            </h4>

            <form onSubmit={handleDecisionSubmit}>
              {/* Decision Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className={decision === 'accept' ? 'btn btn-accept' : 'btn btn-subtle'}
                  onClick={() => { setDecision('accept'); setReasonCode('FALSE_POSITIVE'); }}
                  style={{ fontSize: '0.8rem', padding: '0.55rem' }}
                >
                  <Check size={14} /> Accept / Pass
                </button>
                <button
                  type="button"
                  className={decision === 'reject' ? 'btn btn-reject' : 'btn btn-subtle'}
                  onClick={() => { setDecision('reject'); setReasonCode('POLICY_BREACH_CONFIRMED'); }}
                  style={{ fontSize: '0.8rem', padding: '0.55rem' }}
                >
                  <X size={14} /> Reject / Block
                </button>
                <button
                  type="button"
                  className={decision === 'edit' ? 'btn btn-edit' : 'btn btn-subtle'}
                  onClick={() => { setDecision('edit'); setReasonCode('SLIGHT_COPY_EDIT_REQUIRED'); }}
                  style={{ fontSize: '0.8rem', padding: '0.55rem' }}
                >
                  <Edit3 size={14} /> Edit & Approve
                </button>
              </div>

              {/* Edit textarea if edit mode selected */}
              {decision === 'edit' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--amber-review)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    Corrected Copy:
                  </label>
                  <textarea
                    rows={3}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#FFFFFF',
                      border: '1px solid var(--amber-review)',
                      borderRadius: '6px',
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* Mandatory Reason Code */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Mandatory Reason Code: <span style={{ color: '#F43F5E' }}>*</span>
                </label>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                  required
                >
                  {reasonCodeOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mandatory Reviewer Comment */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Compliance Audit Comment: <span style={{ color: '#F43F5E' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Explain the rationale for this decision (persists to memory bank)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
              >
                {isSubmitting ? 'Recording Decision & Retraining...' : 'Submit Decision & Update Memory Bank'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
