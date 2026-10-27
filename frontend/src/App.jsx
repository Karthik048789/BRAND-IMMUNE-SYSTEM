import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReviewQueue from './components/ReviewQueue';
import ReviewDetail from './components/ReviewDetail';
import ProposedRules from './components/ProposedRules';
import AdaptiveRules from './components/AdaptiveRules';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ContentScanner from './components/ContentScanner';
import AdminPanel from './components/AdminPanel';
import DemoTourModal from './components/DemoTourModal';
import Toast from './components/Toast';
import { 
  Layers, 
  Sparkles, 
  Sliders, 
  BarChart3, 
  Send, 
  ShieldAlert, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

// In production (Netlify), VITE_API_URL is set to the Render backend URL.
// In local dev, Vite proxy handles /api -> http://127.0.0.1:8000
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export default function App() {
  // Roles: 'reviewer' | 'brand_manager' | 'admin' | 'submitter'
  const [currentRole, setCurrentRole] = useState('reviewer');
  const [activeTab, setActiveTab] = useState('queue');

  // Core Data State
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [proposedRules, setProposedRules] = useState([]);
  const [ruleWeights, setRuleWeights] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSimulatingShift, setIsSimulatingShift] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Demo tour & toasts
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch initial data from backend API
  const fetchAllData = async () => {
    try {
      const [subsRes, rulesRes, proposedRes, histRes, analyticsRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/content/submissions`),
        fetch(`${API_BASE}/rules/weights`),
        fetch(`${API_BASE}/rules/proposed`),
        fetch(`${API_BASE}/rules/weights/history`),
        fetch(`${API_BASE}/analytics/overview`),
        fetch(`${API_BASE}/analytics/audit-logs`)
      ]);

      if (subsRes.ok) setSubmissions(await subsRes.json());
      if (rulesRes.ok) setRuleWeights(await rulesRes.json());
      if (proposedRes.ok) setProposedRules(await proposedRes.json());
      if (histRes.ok) setWeightHistory(await histRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error("Error loading system data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update active tab when role changes to provide best persona view
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'reviewer') setActiveTab('queue');
    else if (newRole === 'brand_manager') setActiveTab('proposed');
    else if (newRole === 'admin') setActiveTab('admin');
    else if (newRole === 'submitter') setActiveTab('scanner');
  };

  // Human Review Decision Submit
  const handleReviewDecision = async (decisionPayload) => {
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/review/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...decisionPayload,
          reviewer_id: currentRole === 'brand_manager' ? 'brand_manager_marcus' : 'reviewer_alice',
          reviewer_name: currentRole === 'brand_manager' ? 'Marcus Vance (Brand Director)' : 'Alice Jenkins (Senior Brand Guardian)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        addToast(
          "Decision Logged & Memory Updated", 
          `Item marked as ${decisionPayload.decision.toUpperCase()}. New precedent indexed into Vector DB.`
        );
        confetti({ particleCount: 50, spread: 60 });
        await fetchAllData();
        setActiveTab('queue');
        setSelectedSubmission(null);
      } else {
        const err = await res.json();
        addToast("Error Recording Decision", err.detail || "Request failed", "error");
      }
    } catch (err) {
      addToast("Network Error", err.message, "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Candidate Rule Approve
  const handleApproveRule = async (clusterId) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rules/proposed/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cluster_id: clusterId,
          approved: true,
          reviewer_id: 'brand_manager_marcus'
        })
      });
      if (res.ok) {
        addToast("New Antibody Rule Deployed", "Rule is now actively enforced across all future content scans!");
        await fetchAllData();
      }
    } catch (err) {
      addToast("Failed to approve rule", err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Candidate Rule Reject
  const handleRejectRule = async (clusterId) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rules/proposed/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cluster_id: clusterId,
          approved: false,
          notes: "Dismissed by brand manager"
        })
      });
      if (res.ok) {
        addToast("Rule Dismissed", "Candidate cluster discarded.");
        await fetchAllData();
      }
    } catch (err) {
      addToast("Failed to reject rule", err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Discover Demo Rule
  const handleDiscoverDemo = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rules/proposed/discover-demo`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        addToast("Clustering Pattern Discovered!", `Surfaced new candidate rule: "${data.rule.rule_name}"`);
        confetti({ particleCount: 60, spread: 70 });
        await fetchAllData();
      }
    } catch (err) {
      addToast("Discovery Failed", err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Simulate Adaptive Threshold Shift
  const handleSimulateShift = async (ruleId) => {
    setIsSimulatingShift(true);
    try {
      const res = await fetch(`${API_BASE}/rules/weights/simulate-shift?rule_id=${ruleId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        addToast("Adaptive Learning Recalibration Complete", `Shifted ${data.rule_name} threshold.`);
        await fetchAllData();
        return data;
      }
    } catch (err) {
      addToast("Simulation Error", err.message, "error");
    } finally {
      setIsSimulatingShift(false);
    }
  };

  // Scan Content Ingestion
  const handleScanSubmit = async (scanData) => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/content/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData)
      });
      if (res.ok) {
        const newSub = await res.json();
        setLastScanResult(newSub);
        addToast(
          "Multi-Agent Scan Complete", 
          `Decision: ${newSub.routing.decision.toUpperCase()} (Risk: ${Math.round(newSub.routing.combined_score * 100)}%)`
        );
        await fetchAllData();
      } else {
        const err = await res.json();
        addToast("Scan Failed", err.detail || "Validation error", "error");
      }
    } catch (err) {
      addToast("Scan Error", err.message, "error");
    } finally {
      setIsScanning(false);
    }
  };

  // Reset to seed dataset
  const handleResetSeed = async () => {
    if (!confirm("Reset database to clean Hackathon Demo dataset?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reset-seed`, { method: 'POST' });
      if (res.ok) {
        addToast("Database Reset", "Restored initial seed cases and memory bank.");
        await fetchAllData();
        setSelectedSubmission(null);
        setActiveTab('queue');
      }
    } catch (err) {
      addToast("Reset Failed", err.message, "error");
    }
  };

  // Demo Tour Step Execution
  const handleExecuteTourStep = async (actionId) => {
    if (actionId === 'scan_sample') {
      setActiveTab('scanner');
      handleScanSubmit({
        title: "Summer Gaming Tournament Teaser",
        channel: "Twitter/X",
        content_type: "social_post",
        raw_content: "No cap, our new feature drops this Friday and it honestly slaps! Join the Discord before we hit server limits.",
        image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"
      });
    } else if (actionId === 'go_queue') {
      setActiveTab('queue');
    } else if (actionId === 'open_detail') {
      const pending = submissions.find(s => s.status === 'pending_review');
      if (pending) {
        setSelectedSubmission(pending);
        setActiveTab('detail');
      } else if (submissions.length > 0) {
        setSelectedSubmission(submissions[0]);
        setActiveTab('detail');
      }
    } else if (actionId === 'simulate_shift') {
      setActiveTab('rules');
      handleSimulateShift('RULE_TONE_SLANG');
    } else if (actionId === 'go_proposed') {
      setActiveTab('proposed');
    } else if (actionId === 'go_analytics') {
      setActiveTab('analytics');
    }
  };

  const handleManualUpdate = async ({ rule_id, manual_weight, reason }) => {
    try {
      const res = await fetch(`${API_BASE}/rules/weights/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id, manual_weight, reason })
      });
      if (res.ok) {
        addToast("Weight Recalibrated", `Updated ${rule_id} sensitivity to ${manual_weight}x. Immediate effect on active scans.`);
        await fetchAllData();
      }
    } catch (err) {
      addToast("Update Failed", err.message, "error");
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending_review').length;
  const proposedCount = proposedRules.filter(r => r.status === 'pending_approval').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* App Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        proposedCount={proposedCount}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
        onResetSeed={handleResetSeed}
      />

      {/* Navigation Tabs Bar */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <Layers size={16} /> Content Queue
          {pendingCount > 0 && <span className="nav-tab-badge">{pendingCount}</span>}
        </button>

        {selectedSubmission && (
          <button
            className={`nav-tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            <Clock size={16} /> Split Review: {selectedSubmission.id}
          </button>
        )}

        <button
          className={`nav-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <Send size={16} /> Ingestion & Scanner
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'proposed' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposed')}
        >
          <Sparkles size={16} /> Proposed Rules
          {proposedCount > 0 && (
            <span className="nav-tab-badge" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#D8B4FE', borderColor: 'rgba(168, 85, 247, 0.5)' }}>
              {proposedCount} new
            </span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <Sliders size={16} /> Adaptive Thresholds
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} /> Analytics & Metrics
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <ShieldAlert size={16} /> System Audit Trail
        </button>
      </nav>

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'queue' && (
          <ReviewQueue
            submissions={submissions}
            onSelectSubmission={(item) => {
              setSelectedSubmission(item);
              setActiveTab('detail');
            }}
            loading={loading}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'detail' && selectedSubmission && (
          <ReviewDetail
            submission={selectedSubmission}
            onBack={() => setActiveTab('queue')}
            onSubmitDecision={handleReviewDecision}
            isSubmitting={isSubmittingReview}
          />
        )}

        {activeTab === 'scanner' && (
          <ContentScanner
            onScanSubmit={handleScanSubmit}
            isScanning={isScanning}
            lastScanResult={lastScanResult}
            onInspectSubmission={(sub) => {
              setSelectedSubmission(sub);
              setActiveTab('detail');
            }}
          />
        )}

        {activeTab === 'proposed' && (
          <ProposedRules
            proposedRules={proposedRules}
            onApproveRule={handleApproveRule}
            onRejectRule={handleRejectRule}
            onDiscoverDemo={handleDiscoverDemo}
            isActionLoading={isActionLoading}
          />
        )}

        {activeTab === 'rules' && (
          <AdaptiveRules
            rules={ruleWeights}
            history={weightHistory}
            onSimulateShift={handleSimulateShift}
            onManualUpdate={handleManualUpdate}
            isSimulating={isSimulatingShift}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            overview={analytics}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            auditLogs={auditLogs}
            onResetSeed={handleResetSeed}
          />
        )}
      </main>

      {/* Interactive Demo Tour Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onExecuteStep={handleExecuteTourStep}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'detail' && !selectedSubmission && submissions.length > 0) {
            setSelectedSubmission(submissions[0]);
          }
        }}
      />

      {/* Toast Notification Layer */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
