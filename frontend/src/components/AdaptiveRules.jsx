import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCw, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Play, 
  History,
  Shield,
  ArrowRight
} from 'lucide-react';

export default function AdaptiveRules({ 
  rules, 
  history, 
  onSimulateShift, 
  onManualUpdate, 
  isSimulating 
}) {
  const [selectedRule, setSelectedRule] = useState(rules[0] ? rules[0].rule_id : 'RULE_TONE_SLANG');
  const [lastShiftResult, setLastShiftResult] = useState(null);

  const handleSimulate = async () => {
    const res = await onSimulateShift(selectedRule);
    if (res && res.before && res.after) {
      setLastShiftResult(res);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders color="#00F0FF" size={24} />
            Adaptive Thresholding & Rule Weighting
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Autonomous sensitivity calibration: Repeated reviewer false-positive overrides automatically lower rule sensitivity to eliminate alert fatigue.
          </p>
        </div>

        {/* Demo trigger: Simulate Overrides */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={selectedRule}
            onChange={(e) => setSelectedRule(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.4)',
              color: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            {rules.map(r => (
              <option key={r.rule_id} value={r.rule_id}>
                {r.rule_name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-demo-pulse"
            onClick={handleSimulate}
            disabled={isSimulating}
            style={{ fontSize: '0.84rem' }}
          >
            <Play size={14} /> Simulate Overrides & Shift Threshold
          </button>
        </div>
      </div>

      {/* Live Demonstrable Shift Card (Before / After) */}
      {lastShiftResult && (
        <div className="glass-panel" style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem', 
          background: 'linear-gradient(135deg, rgba(14, 20, 34, 0.95), rgba(20, 35, 60, 0.95))',
          border: '1px solid var(--cyan-primary)',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.25)',
          animation: 'slideInToast 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-auto-pass">
                <Sparkles size={13} /> Demonstration Verification
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                Adaptive Threshold Shift Demonstrable: {lastShiftResult.rule_name}
              </span>
            </div>
            <button 
              className="btn btn-subtle" 
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              onClick={() => setLastShiftResult(null)}
            >
              Dismiss
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {lastShiftResult.explanation}
          </p>

          <div className="demonstrable-shift-grid">
            {/* Before */}
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Before Overrides (Initial)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--amber-review)' }}>
                Weight: {lastShiftResult.before.weight}x
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Detection Trigger: {Math.round(lastShiftResult.before.threshold * 100)}% severity
              </div>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', color: 'var(--cyan-primary)' }}>
              <ArrowRight size={28} />
            </div>

            {/* After */}
            <div style={{ background: 'rgba(0, 240, 255, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', textTransform: 'uppercase', marginBottom: '0.2rem', fontWeight: 600 }}>
                After Adaptive Learning (Recalibrated)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00F0FF' }}>
                Weight: {lastShiftResult.after.weight}x
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
                Detection Trigger: {Math.round(lastShiftResult.after.threshold * 100)}% severity (Reduced Alert Fatigue)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {rules.map((rule) => {
          const weightPercent = Math.min(100, Math.round((rule.current_weight / 1.5) * 100));
          const thresholdPercent = Math.round(rule.threshold * 100);

          return (
            <div 
              key={rule.rule_id}
              className="glass-panel glow-cyan"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                    {rule.category.toUpperCase()}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {rule.rule_id}
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '0.35rem' }}>
                  {rule.rule_name}
                </h4>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  {rule.description}
                </p>

                {/* Meter: Current Weight */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Sensitivity Multiplier:</span>
                    <span style={{ color: '#00F0FF', fontWeight: 600 }}>{rule.current_weight}x (Default: {rule.default_weight}x)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${weightPercent}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #00F0FF)', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Meter: Threshold */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Severity Trigger Threshold:</span>
                    <span style={{ color: 'var(--amber-review)', fontWeight: 600 }}>{thresholdPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${thresholdPercent}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #F59E0B)', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                <span>Overrides: <strong style={{ color: '#FFFFFF' }}>{rule.override_count}</strong></span>
                <span>False Positives: <strong style={{ color: 'var(--amber-review)' }}>{rule.accept_override_count}</strong></span>
                <span>Confirmed Breaches: <strong style={{ color: '#F43F5E' }}>{rule.reject_override_count}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Sensitivity Tuning Sandbox for Judges & Admins */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="var(--cyan-primary)" />
          Live Manual Sensitivity Adjustment (Judge / Admin Tuning Sandbox)
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Directly alter any antibody rule's sensitivity multiplier in real-time to observe immediate scoring effects on subsequent scans.
        </p>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target;
          const ruleId = form.manual_rule_id.value;
          const weight = parseFloat(form.manual_weight.value);
          const reason = form.manual_reason.value || 'Evaluator custom sensitivity calibration';
          await onManualUpdate({ rule_id: ruleId, manual_weight: weight, reason: reason });
        }} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
              Target Antibody Rule:
            </label>
            <select
              name="manual_rule_id"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                padding: '0.55rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              {rules.map(r => (
                <option key={r.rule_id} value={r.rule_id}>{r.rule_name} ({r.current_weight}x)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
              New Weight (0.1x - 2.0x):
            </label>
            <input
              name="manual_weight"
              type="number"
              step="0.05"
              min="0.1"
              max="2.0"
              defaultValue="0.60"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                padding: '0.55rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
              Adjustment Audit Justification:
            </label>
            <input
              name="manual_reason"
              type="text"
              placeholder="e.g. Tightening brand tone for enterprise launch"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                padding: '0.55rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
          >
            Apply Live Weight
          </button>
        </form>
      </div>

      {/* Weight History / Audit Log */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--cyan-primary)" />
          Adaptive Recalibration History (Immutable Audit Log)
        </h3>

        {history.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recalibration history recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {history.slice(0, 8).map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.15rem' }}>
                    {item.rule_name || item.rule_id}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {item.reason}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--cyan-primary)', fontWeight: 600 }}>
                    {item.previous_weight}x → {item.new_weight}x
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
