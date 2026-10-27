import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Database,
  Layers,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DemoTourModal({ 
  isOpen, 
  onClose, 
  onExecuteStep, 
  onNavigateTab 
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Autonomous Multi-Agent Ingestion",
      tab: "scanner",
      icon: <Sparkles size={24} color="#00F0FF" />,
      tag: "Multi-Agent Scanning (FR1 & FR2)",
      description: "Submit a new marketing campaign asset. Four specialized antibody agents (Tone, Factual Substantiation, Visual/Logo, and Statutory Compliance) evaluate the content in parallel within milliseconds.",
      actionLabel: "Inject & Scan Sample Content",
      actionId: "scan_sample"
    },
    {
      title: "2. Confidence Scoring & Routing Engine",
      tab: "queue",
      icon: <Layers size={24} color="#F59E0B" />,
      tag: "Vector DB & Routing (FR3 & FR4)",
      description: "The system matches embeddings against past resolved cases in the Vector Memory Bank. Borderline confidence scores route content to the Human Review Queue instead of premature auto-decisions.",
      actionLabel: "View Pending Review Queue",
      actionId: "go_queue"
    },
    {
      title: "3. Split-Screen Review & Explainability",
      tab: "detail",
      icon: <ShieldCheck size={24} color="#00F0FF" />,
      tag: "Human-in-the-Loop Gate (FR5 & FR10)",
      description: "Reviewers inspect content with interactive highlighted spans, explainability narratives ('Why flagged'), and historical case precedents before submitting an Accept/Reject/Edit with mandatory reason codes.",
      actionLabel: "Open Split Review Screen",
      actionId: "open_detail"
    },
    {
      title: "4. Demonstrable Adaptive Threshold Shift",
      tab: "rules",
      icon: <Sliders size={24} color="#10B981" />,
      tag: "Adaptive Learning (FR6 & PRD Page 8)",
      description: "Watch the active learning feedback loop in action! When reviewers repeatedly accept over-flagged content (False Positives), the rule sensitivity weight adaptively drops and the threshold shifts to eliminate alert fatigue.",
      actionLabel: "Simulate Overrides & View Shift",
      actionId: "simulate_shift"
    },
    {
      title: "5. Clustering & New Rule Discovery",
      tab: "proposed",
      icon: <Sparkles size={24} color="#A855F7" />,
      tag: "ML Clustering (FR7 & PRD Page 8)",
      description: "The clustering engine analyzes recurring manual flags (cases AI missed) and surfaces AI-proposed new antibody rules with characteristic tokens and supporting clusters for Brand Manager approval.",
      actionLabel: "Review AI-Proposed Rules",
      actionId: "go_proposed"
    },
    {
      title: "6. Executive Analytics & Risk Dashboard",
      tab: "analytics",
      icon: <BarChart3 size={24} color="#10B981" />,
      tag: "Audit & Live Metrics (FR8)",
      description: "Monitor live KPI trends: 58% reduction in false-positive alert fatigue, real-time <2.5s turnaround speeds, and channel risk matrices.",
      actionLabel: "Inspect Governance Metrics",
      actionId: "go_analytics"
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      onNavigateTab(steps[currentStep + 1].tab);
    } else {
      confetti({ particleCount: 100, spread: 80 });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onNavigateTab(steps[currentStep - 1].tab);
    }
  };

  const handleTriggerAction = () => {
    onExecuteStep(step.actionId);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(4, 7, 13, 0.82)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '640px',
        width: '100%',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(14, 20, 34, 0.98), rgba(20, 32, 54, 0.98))',
        border: '1px solid var(--border-highlight)',
        boxShadow: '0 0 50px rgba(0, 240, 255, 0.25)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span className="badge badge-learned-rule">
            {step.tag}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(0, 240, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 240, 255, 0.3)'
          }}>
            {step.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF' }}>
              {step.title}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--cyan-primary)' }}>
              Hackathon Evaluation Path
            </span>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          {step.description}
        </p>

        {/* Interactive Step Trigger */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Execute this step in the live application:
          </span>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
            onClick={handleTriggerAction}
          >
            <Play size={13} /> {step.actionLabel}
          </button>
        </div>

        {/* Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button
            className="btn btn-subtle"
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ fontSize: '0.84rem' }}
          >
            <ArrowLeft size={14} /> Previous
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {steps.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentStep ? 'var(--cyan-primary)' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ fontSize: '0.84rem' }}
          >
            {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
