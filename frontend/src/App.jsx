import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Brain, 
  Search, 
  BarChart3, 
  CheckCircle2, 
  FileText, 
  Database, 
  Play, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  Cpu,
  Clock,
  ChevronRight,
  Copy,
  Check,
  Radio,
  AlertTriangle,
  HardDrive,
  Calendar,
  Zap,
  History,
  Trash2,
  ExternalLink,
  Activity,
  Globe,
  Settings,
  Key,
  Sliders,
  ShieldCheck
} from 'lucide-react'

const DEFAULT_TUNNEL_URL = 'https://ai-system-live.loca.lt'

const getInitialBackendUrl = () => {
  const saved = localStorage.getItem('custom_backend_url')
  if (saved && saved.trim()) return saved.trim()
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return DEFAULT_TUNNEL_URL
  }
  return 'http://127.0.0.1:8000'
}

export default function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [systemStatus, setSystemStatus] = useState({ online: false, message: 'Checking server...' })
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('report')
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Backend Connection URL State
  const [backendUrl, setBackendUrl] = useState(getInitialBackendUrl)
  const [backendUrlInput, setBackendUrlInput] = useState(backendUrl)

  // Automated Scans, Risks & Persistent Vector Memory
  const [scanStatus, setScanStatus] = useState(null)
  const [sectorRisks, setSectorRisks] = useState([])
  const [vectorMemories, setVectorMemories] = useState([])
  const [scanTriggering, setScanTriggering] = useState(false)
  const [scanNotice, setScanNotice] = useState('')
  const [memoryModalDoc, setMemoryModalDoc] = useState(null)

  // API Key & Model Provider Settings
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [llmStatus, setLlmStatus] = useState(null)
  const [openaiKeyInput, setOpenaiKeyInput] = useState('')
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [preferredProviderInput, setPreferredProviderInput] = useState('auto')
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsNotice, setSettingsNotice] = useState('')

  // Helper for cross-origin backend calls with tunnel bypass headers
  const apiFetch = async (endpoint, options = {}) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const headers = {
      'bypass-tunnel-reminder': 'true',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {})
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const localRes = await fetch(`/api${cleanEndpoint}`, { ...options, headers })
        if (localRes && (localRes.ok || localRes.status !== 404)) return localRes
      } catch (e) {
        // Fallback to explicit backendUrl
      }
    }

    const targetBase = backendUrl.trim().replace(/\/$/, '')
    return await fetch(`${targetBase}${cleanEndpoint}`, { ...options, headers })
  }

  // Loading text animation
  const [loadingText, setLoadingText] = useState('Initializing pipeline...')
  const loadingTexts = [
    'Initializing pipeline...',
    'Planner Agent decomposing query...',
    'Researcher Agent fetching live data...',
    'Analyst Agent extracting insights...',
    'Critic Agent refining analysis...',
    'Reporter Agent generating report...'
  ]

  // Typewriter loading text
  useEffect(() => {
    if (!loading) return
    let idx = 0
    const timer = setInterval(() => {
      idx = (idx + 1) % loadingTexts.length
      setLoadingText(loadingTexts[idx])
    }, 2000)
    return () => clearInterval(timer)
  }, [loading])

  // Check backend server status
  const checkHealth = async () => {
    try {
      const res = await apiFetch('/')
      if (res && res.ok) {
        const data = await res.json()
        setSystemStatus({ online: true, message: data.status || 'System Running 🚀' })
      } else {
        setSystemStatus({ online: false, message: `Server unreachable (${backendUrl})` })
      }
    } catch (err) {
      setSystemStatus({ online: false, message: `Server offline (${backendUrl})` })
    }
  }

  const fetchScanStatus = async () => {
    try {
      const res = await apiFetch('/scan/status')
      if (res && res.ok) {
        const data = await res.json()
        setScanStatus(data)
      }
    } catch (e) {
      console.log('Error fetching scan status', e)
    }
  }

  const fetchSectorRisks = async () => {
    try {
      const res = await apiFetch('/risks')
      if (res && res.ok) {
        const data = await res.json()
        setSectorRisks(data.risks || [])
      }
    } catch (e) {
      console.log('Error fetching risks', e)
    }
  }

  const fetchVectorMemories = async () => {
    try {
      const res = await apiFetch('/memory')
      if (res && res.ok) {
        const data = await res.json()
        setVectorMemories(data.memories || [])
      }
    } catch (e) {
      console.log('Error fetching vector memories', e)
    }
  }

  const triggerDailyScan = async () => {
    setScanTriggering(true)
    setScanNotice('')
    try {
      const res = await apiFetch('/scan/daily', { method: 'POST' })
      if (res && res.ok) {
        setScanNotice('Automated daily scan batch triggered across all monitored sectors!')
        setTimeout(() => {
          fetchScanStatus()
          fetchVectorMemories()
          fetchSectorRisks()
        }, 3000)
      }
    } catch (e) {
      setScanNotice('Failed to trigger scan batch.')
    } finally {
      setScanTriggering(false)
    }
  }

  const fetchSettingsStatus = async () => {
    try {
      const res = await apiFetch('/settings/status')
      if (res && res.ok) {
        const data = await res.json()
        setLlmStatus(data)
        if (data.preferred_provider) setPreferredProviderInput(data.preferred_provider)
      }
    } catch (e) {
      console.log('Error fetching LLM settings status', e)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    setSettingsNotice('')
    try {
      const newUrl = backendUrlInput.trim().replace(/\/$/, '')
      if (newUrl) {
        localStorage.setItem('custom_backend_url', newUrl)
        setBackendUrl(newUrl)
      }

      const body = {
        openai_key: openaiKeyInput.trim() || null,
        gemini_key: geminiKeyInput.trim() || null,
        preferred_provider: preferredProviderInput
      }
      const res = await apiFetch('/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res && res.ok) {
        const data = await res.json()
        setLlmStatus(data.status)
        setSettingsNotice('Settings & Backend Server URL saved successfully!')
        setOpenaiKeyInput('')
        setGeminiKeyInput('')
        setTimeout(() => setSettingsNotice(''), 4000)
      } else {
        setSettingsNotice('Saved Backend URL. Failed to update API keys.')
      }
    } catch (e) {
      setSettingsNotice('Saved Backend URL. Could not reach server for key updates.')
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    checkHealth()
    fetchScanStatus()
    fetchSectorRisks()
    fetchVectorMemories()
    fetchSettingsStatus()

    const interval = setInterval(() => {
      checkHealth()
      fetchScanStatus()
      fetchSectorRisks()
      fetchVectorMemories()
      fetchSettingsStatus()
    }, 10000)

    return () => clearInterval(interval)
  }, [])


  const samplePrompts = [
    "AI Agent Market Trends in 2026",
    "Quantum Computing Breakthroughs",
    "Autonomous Robotics Security",
    "Global Semiconductor Industry Risks"
  ]

  const agentSteps = [
    { id: 1, name: 'Planner Agent', role: 'Decomposing query into structured research steps', icon: Brain, color: '#6366f1' },
    { id: 2, name: 'Researcher Agent', role: 'Fetching web data, News API & RAG memory', icon: Search, color: '#06b6d4' },
    { id: 3, name: 'Analyst Agent', role: 'Extracting key insights, risks, and trends', icon: BarChart3, color: '#10b981' },
    { id: 4, name: 'Critic Agent', role: 'Refining clarity & eliminating hallucinations', icon: CheckCircle2, color: '#f59e0b' },
    { id: 5, name: 'Reporter Agent', role: 'Generating final Intelligence Report & storing to Memory', icon: FileText, color: '#ec4899' }
  ]

  const handleRunPipeline = async (e) => {
    if (e) e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setErrorMsg('')
    setResults(null)
    setActiveStep(1)
    setLoadingText('Initializing pipeline...')

    // Simulate animated step progression while backend processes
    const stepTimer = setInterval(() => {
      setActiveStep(prev => (prev < 4 ? prev + 1 : prev))
    }, 1500)

    try {
      const res = await apiFetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      })

      clearInterval(stepTimer)

      if (!res || !res.ok) {
        const errData = await res?.json().catch(() => ({}))
        throw new Error(errData?.detail || `Server returned status ${res?.status || 'network error'}`)
      }

      const data = await res.json()
      setActiveStep(5)
      setResults(data)
      setHistory(prev => [{ query: query.trim(), date: new Date().toLocaleTimeString(), data }, ...prev.slice(0, 19)])
      fetchVectorMemories()
    } catch (err) {
      clearInterval(stepTimer)
      setErrorMsg(err.message || 'Failed to communicate with multi-agent pipeline.')
      setActiveStep(0)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadHistoryItem = (item) => {
    setResults(item.data)
    setQuery(item.query)
    setActiveStep(5)
    setActiveTab('report')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(9, 13, 22, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Cpu style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Autonomous Multi-Agent System
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Planner • Researcher • Analyst • Critic • Reporter • Vector Store Memory
            </p>
          </div>
        </div>

        {/* System Health Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: systemStatus.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${systemStatus.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: systemStatus.online ? '#10b981' : '#f43f5e',
              boxShadow: systemStatus.online ? '0 0 8px #10b981' : '0 0 8px #f43f5e',
              animation: systemStatus.online ? 'pulseGlow 2s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: systemStatus.online ? '#34d399' : '#fb7185' }}>
              {systemStatus.message}
            </span>
          </div>
          <button 
            onClick={() => { checkHealth(); fetchScanStatus(); fetchSectorRisks(); fetchVectorMemories(); fetchSettingsStatus(); }}
            title="Refresh status"
            className="btn-secondary"
            style={{ padding: '6px 10px', borderRadius: '8px' }}
          >
            <RefreshCw style={{ width: '14px', height: '14px' }} />
          </button>
          <button 
            onClick={() => setSettingsModalOpen(true)}
            title="API & LLM Engine Settings"
            className="btn-secondary"
            style={{ 
              padding: '6px 14px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              border: '1px solid rgba(99, 102, 241, 0.4)', 
              background: 'rgba(99, 102, 241, 0.12)', 
              color: '#a5b4fc' 
            }}
          >
            <Settings style={{ width: '14px', height: '14px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>API Settings</span>
            {llmStatus?.active_provider && (
              <span style={{ 
                padding: '2px 6px', 
                borderRadius: '4px', 
                background: llmStatus.active_provider === 'smart_synthesizer' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                color: llmStatus.active_provider === 'smart_synthesizer' ? '#fde047' : '#6ee7b7', 
                fontSize: '0.7rem', 
                fontWeight: '600', 
                textTransform: 'uppercase' 
              }}>
                {llmStatus.active_provider}
              </span>
            )}
          </button>
        </div>
      </header>


      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Automated Daily Scans & Risk Control Bar */}
        <section className="glass-panel fade-in-up" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <Radio style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Automated Daily Scans & Long-Term Memory
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    Active 24h Schedule
                  </span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Monitored Sectors: {scanStatus?.monitored_sectors?.join(' • ') || 'AI Tech • Cybersecurity • Autonomous Robotics • Semiconductors'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Last Scan: <strong style={{ color: '#e5e7eb' }}>{scanStatus?.last_scan || 'Scheduled'}</strong></div>
                <div style={{ color: 'var(--text-dim)' }}>Total Scans Committed: <strong style={{ color: '#34d399' }}>{scanStatus?.total_scans || 0}</strong></div>
              </div>
              
              <button 
                onClick={triggerDailyScan}
                disabled={scanTriggering}
                className="btn-primary"
                style={{ borderRadius: '10px', padding: '10px 18px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {scanTriggering ? (
                  <>
                    <RefreshCw className="spinning" style={{ width: '16px', height: '16px' }} />
                    Initiating Batch...
                  </>
                ) : (
                  <>
                    <Zap style={{ width: '16px', height: '16px' }} />
                    Run Daily Scan Now
                  </>
                )}
              </button>
            </div>
          </div>

          {scanNotice && (
            <div className="fade-in-up" style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem' }}>
              ✓ {scanNotice}
            </div>
          )}
        </section>

        {/* Sector Risk Indicators Grid */}
        {sectorRisks.length > 0 && (
          <section className="fade-in-up">
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              Tracked Sector Risk Indicators
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {sectorRisks.map((risk, idx) => {
                const isHigh = risk.severity === 'High'
                const isMed = risk.severity === 'Medium'
                const badgeBg = isHigh ? 'rgba(244, 63, 94, 0.15)' : isMed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'
                const badgeColor = isHigh ? '#fb7185' : isMed ? '#fbbf24' : '#34d399'

                return (
                  <div 
                    key={idx}
                    className="glass-panel slide-in"
                    style={{
                      padding: '18px',
                      borderLeft: `4px solid ${badgeColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      animationDelay: `${idx * 100}ms`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                        {risk.sector}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: badgeBg, color: badgeColor }}>
                        {risk.severity} Risk
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f3f4f6' }}>{risk.risk_type}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{risk.description}</p>
                    
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Logged: {risk.timestamp}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Search & Query Card */}
        <section className="glass-panel fade-in-up" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles style={{ color: 'var(--accent-primary)', width: '20px', height: '20px' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Intelligence Request Console</h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Powered by Autonomous Agents & Persistent RAG Memory</span>
          </div>

          <form onSubmit={handleRunPipeline} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-text" 
              placeholder="Enter research topic (e.g. Next-generation AI model architectures & industry impact)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !query.trim()}
              style={{ minWidth: '180px', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="spinning" style={{ width: '18px', height: '18px' }} />
                  Processing...
                </>
              ) : (
                <>
                  <Play style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
                  Run Pipeline
                </>
              )}
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Prompts:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(prompt)}
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-sans)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)' }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        {/* Loading Status Bar */}
        {loading && (
          <div className="fade-in-up" style={{
            padding: '14px 20px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#a5b4fc'
          }}>
            <Activity className="pulsing" style={{ width: '18px', height: '18px', color: '#818cf8' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{loadingText}</span>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="fade-in-up" style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fb7185'
          }}>
            <ShieldAlert style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Pipeline Error:</strong> {errorMsg}
            </div>
          </div>
        )}

        {/* Agent Workflow Execution Pipeline */}
        <section className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '20px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers style={{ width: '18px', height: '18px', color: 'var(--accent-cyan)' }} />
            Autonomous Agent Orchestration Pipeline
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {agentSteps.map((step) => {
              const Icon = step.icon
              const isActive = activeStep === step.id
              const isCompleted = activeStep > step.id || (activeStep === 5 && step.id === 5)
              
              return (
                <div 
                  key={step.id}
                  className={isActive ? 'border-glow-active' : ''}
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${isActive ? step.color : isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                    borderRadius: '14px',
                    padding: '18px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? `0 0 24px ${step.color}33` : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                      boxShadow: `0 0 12px ${step.color}`
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${step.color}20`,
                      border: `1px solid ${step.color}50`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.color
                    }}>
                      <Icon style={{ width: '20px', height: '20px' }} />
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isActive ? `${step.color}30` : 'rgba(255, 255, 255, 0.05)',
                      color: isCompleted ? '#34d399' : isActive ? step.color : 'var(--text-dim)'
                    }}>
                      {isCompleted ? '✓ Completed' : isActive ? '● Active' : 'Standby'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>{step.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{step.role}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Results Section — Rendered Markdown */}
        {results && (
          <section className="glass-panel fade-in-up" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={activeTab === 'report' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setActiveTab('report')}
                  style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Intelligence Report
                </button>
                <button
                  className={activeTab === 'plan' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setActiveTab('plan')}
                  style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Brain style={{ width: '16px', height: '16px' }} />
                  Research Plan
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {results.provider && (
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    background: results.provider === 'smart_synthesizer' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                    color: results.provider === 'smart_synthesizer' ? '#fde047' : '#6ee7b7',
                    border: `1px solid ${results.provider === 'smart_synthesizer' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    textTransform: 'uppercase'
                  }}>
                    Engine: {results.provider}
                  </span>
                )}
                <button 
                  onClick={() => copyToClipboard(activeTab === 'report' ? results.report : results.plan)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >

                  {copied ? <Check style={{ width: '14px', height: '14px', color: '#10b981' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Rendered Markdown Content */}
            <div style={{
              background: 'rgba(10, 15, 26, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeTab === 'report' ? results.report : results.plan}
                </ReactMarkdown>
              </div>
            </div>
          </section>
        )}

        {/* Session History Panel */}
        {history.length > 0 && (
          <section className="glass-panel fade-in-up" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History style={{ width: '18px', height: '18px', color: '#818cf8' }} />
                Session Query History ({history.length})
              </h3>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                onClick={() => setHistory([])}
              >
                <Trash2 style={{ width: '13px', height: '13px' }} />
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {history.map((item, idx) => (
                <div 
                  key={idx}
                  className="history-item"
                  onClick={() => loadHistoryItem(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Search style={{ width: '14px', height: '14px', color: '#818cf8', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#e5e7eb' }}>{item.query}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        <Clock style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        {item.date}
                      </span>
                      <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Persistent Vector Memory Store Explorer */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive style={{ width: '18px', height: '18px', color: 'var(--accent-emerald)' }} />
              Persistent Vector Memory Store ({vectorMemories.length} Stored Reports)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Saved to vector_memory.json</span>
          </div>

          {vectorMemories.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Database style={{ width: '32px', height: '32px', color: 'var(--text-dim)', margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              No documents currently in persistent vector store.<br />
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Click "Run Daily Scan Now" or run a query to populate memory.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {vectorMemories.map((doc, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setMemoryModalDoc(doc)}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)' }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0 }}>
                      #{doc.id || idx + 1}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e5e7eb' }}>
                        {doc.sector || doc.category || 'Intelligence Scan'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.content?.substring(0, 100)}...
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                      <Calendar style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {doc.timestamp || 'Recent'}
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-dim)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Memory View Modal — with Markdown Rendering */}
        {memoryModalDoc && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}
            onClick={(e) => { if (e.target === e.currentTarget) setMemoryModalDoc(null) }}
          >
            <div className="glass-panel fade-in-up" style={{ maxWidth: '850px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database style={{ width: '18px', height: '18px', color: '#818cf8' }} />
                  Vector Memory #{memoryModalDoc.id} — {memoryModalDoc.sector || 'Intelligence'}
                </h3>
                <button 
                  onClick={() => setMemoryModalDoc(null)}
                  className="btn-secondary"
                  style={{ padding: '4px 12px', borderRadius: '6px' }}
                >
                  Close ✕
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span><Calendar style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Committed: {memoryModalDoc.timestamp}</span>
                <span>Category: <strong style={{ color: '#e5e7eb' }}>{memoryModalDoc.category}</strong></span>
                <span>Source: <strong style={{ color: '#e5e7eb' }}>{memoryModalDoc.source || 'Multi-Agent Pipeline'}</strong></span>
              </div>

              <div style={{
                background: 'rgba(10, 15, 26, 0.8)',
                padding: '20px',
                borderRadius: '8px',
                overflowY: 'auto',
                flex: 1
              }}>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {memoryModalDoc.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API & Model Settings Modal */}
        {settingsModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}
            onClick={(e) => { if (e.target === e.currentTarget) setSettingsModalOpen(false) }}
          >
            <div className="glass-panel fade-in-up" style={{ maxWidth: '650px', width: '100%', display: 'flex', flexDirection: 'column', padding: '28px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#f3f4f6' }}>
                  <Settings style={{ width: '22px', height: '22px', color: '#818cf8' }} />
                  API & LLM Engine Settings
                </h3>
                <button 
                  onClick={() => setSettingsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', borderRadius: '8px' }}
                >
                  Close ✕
                </button>
              </div>

              {/* Status Summary Banner */}
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Engine Pipeline Status</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#a5b4fc', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck style={{ width: '18px', height: '18px', color: '#34d399' }} />
                    {llmStatus?.status_message || 'Initializing status...'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', background: llmStatus?.openai_key_configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: llmStatus?.openai_key_configured ? '#34d399' : '#fb7185' }}>
                    OpenAI {llmStatus?.openai_key_configured ? '✓' : '✗'}
                  </span>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', background: llmStatus?.gemini_key_configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: llmStatus?.gemini_key_configured ? '#34d399' : '#fb7185' }}>
                    Gemini {llmStatus?.gemini_key_configured ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {settingsNotice && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#6ee7b7',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  marginBottom: '16px'
                }}>
                  {settingsNotice}
                </div>
              )}

              {/* Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '6px' }}>
                    Live Backend API Server URL
                  </label>
                  <input 
                    type="text"
                    placeholder="https://ai-system-live.loca.lt or http://127.0.0.1:8000"
                    value={backendUrlInput}
                    onChange={(e) => setBackendUrlInput(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(10, 15, 26, 0.9)', color: '#fff', border: '1px solid var(--border-color)' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Current Active Target: <strong style={{ color: '#818cf8' }}>{backendUrl}</strong>
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '6px' }}>
                    Preferred LLM Provider Strategy
                  </label>
                  <select 
                    value={preferredProviderInput}
                    onChange={(e) => setPreferredProviderInput(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(10, 15, 26, 0.9)', color: '#fff', border: '1px solid var(--border-color)' }}
                  >
                    <option value="auto">Auto Cascade (OpenAI / Gemini / Smart Synthesizer)</option>
                    <option value="gemini">Google Gemini (Gemini 2.0 / 1.5 Flash)</option>
                    <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '6px' }}>
                    <span>OpenAI API Key (sk-...)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {llmStatus?.openai_key_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </label>
                  <input 
                    type="password"
                    placeholder={llmStatus?.openai_key_configured ? '••••••••••••••••••••••••' : 'Enter OpenAI API Key'}
                    value={openaiKeyInput}
                    onChange={(e) => setOpenaiKeyInput(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(10, 15, 26, 0.9)', color: '#fff', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#e5e7eb', marginBottom: '6px' }}>
                    <span>Google Gemini API Key (AIzaSy...)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {llmStatus?.gemini_key_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </label>
                  <input 
                    type="password"
                    placeholder={llmStatus?.gemini_key_configured ? '••••••••••••••••••••••••' : 'Enter Google Gemini API Key'}
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(10, 15, 26, 0.9)', color: '#fff', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    onClick={() => setSettingsModalOpen(false)}
                    className="btn-secondary"
                    style={{ padding: '10px 20px', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveSettings}
                    disabled={savingSettings}
                    className="btn-primary"
                    style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {savingSettings ? <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Key style={{ width: '16px', height: '16px' }} />}
                    {savingSettings ? 'Saving Settings...' : 'Save & Update Engine'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu style={{ width: '12px', height: '12px', color: 'white' }} />
            </div>
            <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Autonomous Multi-Agent Intelligence System</span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span>FastAPI + LangChain + React + Vector Memory</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe style={{ width: '12px', height: '12px' }} />
            v1.0.0
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span>Built with multi-agent orchestration</span>
        </div>
      </footer>
    </div>
  )
}
