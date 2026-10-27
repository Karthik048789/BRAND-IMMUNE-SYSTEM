import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  Image,
  RefreshCw
} from 'lucide-react';

export default function ContentScanner({ onScanSubmit, isScanning, lastScanResult, onInspectSubmission }) {
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Twitter/X');
  const [contentType, setContentType] = useState('social_post');
  const [rawContent, setRawContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const samplePresets = [
    {
      label: 'Sample: Ambiguous Youth Slang',
      title: 'Summer Gaming Tournament Teaser',
      channel: 'Twitter/X',
      contentType: 'social_post',
      text: 'No cap, our new feature drops this Friday and it honestly slaps! Join the Discord before we hit server limits.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'
    },
    {
      label: 'Sample: Superlative / Physics Breach',
      title: 'Quantum Core Infrastructure Launch',
      channel: 'LinkedIn',
      contentType: 'campaign_asset',
      text: 'Our new Quantum Core delivers 10x faster computing with completely zero latency compared to legacy architectures.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    },
    {
      label: 'Sample: Critical Financial Hazard',
      title: 'VIP Influencer Wealth Partnership',
      channel: 'Instagram',
      contentType: 'social_post',
      text: 'Collab with Brand Immune System! Guaranteed return of 40% monthly yield and you can\'t lose money! Hurry before we run out forever!',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
    },
    {
      label: 'Sample: Clean Compliant Press Release',
      title: 'Q4 Impact & Sustainability Benchmark',
      channel: 'Website',
      contentType: 'press_release',
      text: 'We are proud to share our 2025 impact report. Through systematic investments, our team reduced emissions across all tier-1 operations.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setChannel(preset.channel);
    setContentType(preset.contentType);
    setRawContent(preset.text);
    setImageUrl(preset.image);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawContent || rawContent.trim().length < 5) {
      alert('Please enter at least 5 characters of content to scan.');
      return;
    }

    onScanSubmit({
      title: title || 'Untitled Campaign Copy',
      channel: channel,
      content_type: contentType,
      raw_content: rawContent,
      image_url: imageUrl || null
    });
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles color="#00F0FF" size={24} />
          Autonomous Content Ingestion & Scanner
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Submit copy or creative assets for instant multi-agent evaluation across Tone, Factual Substantiation, Visual Constraints, and Legal Compliance.
        </p>
      </div>

      {/* Preset Quick Loader Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Test Presets:
        </span>
        {samplePresets.map((p, idx) => (
          <button
            key={idx}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="scanner-grid">
        
        {/* FORM */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Title */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                Asset / Campaign Title:
              </label>
              <input
                type="text"
                placeholder="e.g. Q3 Summer Product Launch Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Channel and Type Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Publishing Channel:
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                >
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Website">Website</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Press Release">Press Release</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Content Asset Type:
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                >
                  <option value="social_post">Social Post</option>
                  <option value="campaign_asset">Campaign Asset</option>
                  <option value="press_release">Press Release</option>
                  <option value="text">Marketing Copy</option>
                </select>
              </div>
            </div>

            {/* Raw Content Text */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                Copy / Caption / Text to Scan: <span style={{ color: '#F43F5E' }}>*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Paste or compose your campaign copy here..."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
                required
              />
            </div>

            {/* Image URL (Optional) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                Optional Creative Asset Image URL:
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              {isScanning ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} className="spinning" /> Scanning 4 Agents in Parallel...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={16} /> Scan Content with Brand Immune System
                </span>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isScanning && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="scanning-bar" style={{ marginBottom: '1.5rem' }} />
              <div style={{ fontSize: '1rem', color: '#FFFFFF', fontWeight: 600, marginBottom: '0.5rem' }}>
                Antibody Agent Pipeline Active
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Running parallel checks across Tone, Factual Consistency, Visual Identity, and Statutory Legal Disclosures...
              </p>
            </div>
          )}

          {!isScanning && lastScanResult && (
            <div className="glass-panel" style={{ 
              padding: '1.5rem',
              borderLeft: lastScanResult.routing.decision === 'auto_pass' ? '4px solid #10B981' : 
                          lastScanResult.routing.decision === 'auto_flag' ? '4px solid #F43F5E' : '4px solid #F59E0B'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Immediate Scan Result
                </span>
                {lastScanResult.routing.decision === 'auto_pass' && (
                  <span className="badge badge-auto-pass"><CheckCircle2 size={12} /> Auto-Passed</span>
                )}
                {lastScanResult.routing.decision === 'auto_flag' && (
                  <span className="badge badge-auto-flag"><XCircle size={12} /> Auto-Flagged</span>
                )}
                {lastScanResult.routing.decision === 'human_review' && (
                  <span className="badge badge-human-review"><Clock size={12} /> Routed to Human Queue</span>
                )}
              </div>

              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>
                {lastScanResult.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {lastScanResult.routing.route_reason}
              </p>

              {/* Agent Scores Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {Object.entries(lastScanResult.routing.agent_breakdown || {}).map(([k, res]) => (
                  <div key={k} style={{ 
                    padding: '0.6rem', 
                    borderRadius: '6px', 
                    background: res.flagged ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: res.flagged ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{k} Agent</span>
                      <span style={{ color: res.flagged ? '#F43F5E' : '#10B981', fontWeight: 600 }}>
                        {res.flagged ? 'Flagged' : 'Pass'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {lastScanResult.routing.top_memory_match && (
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--cyan-primary)' }}>
                  <strong>Memory Bank Precedent:</strong> Matches Case #{lastScanResult.routing.top_memory_match.case_id} ({Math.round(lastScanResult.routing.top_memory_match.similarity * 100)}% match)
                </div>
              )}

              {onInspectSubmission && (
                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.86rem', padding: '0.65rem' }}
                    onClick={() => onInspectSubmission(lastScanResult)}
                  >
                    <Clock size={15} /> Inspect in Split Review Screen
                  </button>
                </div>
              )}
            </div>
          )}

          {!isScanning && !lastScanResult && (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <ShieldCheck size={42} color="var(--cyan-primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
              <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '0.35rem' }}>
                Ready to Ingest
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Fill out the submission form or select a test preset on the left to launch the parallel antibody scanning pipeline.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
