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

const DEFAULT_TUNNEL_URL = 'https://picks-gen-comparison-experiments.trycloudflare.com'

const getInitialBackendUrl = () => {
  const saved = localStorage.getItem('custom_backend_url')
  if (saved && (saved.includes('ai-system-live') || saved.includes('trustees-calendar-word-seo') || (saved !== DEFAULT_TUNNEL_URL && saved.includes('trycloudflare.com')) || !saved.trim())) {
    localStorage.setItem('custom_backend_url', DEFAULT_TUNNEL_URL)
    return DEFAULT_TUNNEL_URL
  }
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
  const [testingUrl, setTestingUrl] = useState(false)
  const [settingsNotice, setSettingsNotice] = useState('')

  // Interactive Standalone Demo Fallback Data Generators
  const MOCK_SECTOR_RISKS = [
    { sector: 'AI Tech & Hardware', risk_score: 78, level: 'HIGH', impact_summary: 'HBM3e Memory shortages & GPU cluster power constraints impacting 2026 scaling.' },
    { sector: 'Cybersecurity & Cloud', risk_score: 64, level: 'MEDIUM', impact_summary: 'Zero-day edge router vulnerabilities targeted by autonomous threat actors.' },
    { sector: 'Autonomous Robotics', risk_score: 52, level: 'MEDIUM', impact_summary: 'Regulatory delay in autonomous logistics deployment across EU/US corridors.' },
    { sector: 'Semiconductor Supply', risk_score: 83, level: 'HIGH', impact_summary: 'Export controls on raw gallium & advanced EUV lithography tooling.' }
  ]

  const MOCK_VECTOR_MEMORIES = [
    { id: 'mem_1', doc: 'Analysis of 2026 AI Agent hardware acceleration & persistent vector memory standards.', timestamp: '2026-08-08 01:20', sector: 'AI Tech & Hardware', similarity_score: 0.94 },
    { id: 'mem_2', doc: 'Global semiconductor supply chain bottleneck mitigation strategies.', timestamp: '2026-08-07 18:45', sector: 'Semiconductor Supply', similarity_score: 0.89 },
    { id: 'mem_3', doc: 'Edge router zero-day vulnerability mitigation and automated patching protocol.', timestamp: '2026-08-07 14:10', sector: 'Cybersecurity & Cloud', similarity_score: 0.86 }
  ]

  const generateDemoResults = (userQuery) => {
    const cleanQ = userQuery.trim() || 'Global Technology & AI Market Overview'
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    
    return {
      query: cleanQ,
      llm_used: "Interactive Demo Engine (Connect Live Backend for Gemini 2.0 / GPT-4o)",
      plan: {
        query: cleanQ,
        sub_queries: [
          `Analysis of ${cleanQ} trends and market drivers for 2026`,
          `Risk assessment & security implications regarding ${cleanQ}`,
          `Persistent vector memory retrieval and future projections`
        ],
        execution_steps: [
          "1. Planner Agent: Deconstructing query into sub-domain analysis targets",
          "2. Researcher Agent: Executing dynamic search and retrieving vector embeddings",
          "3. Analyst Agent: Cross-referencing sector risk indicators & key metrics",
          "4. Critic Agent: Auditing factual consistency & eliminating hallucinations",
          "5. Reporter Agent: Compiling executive report & committing vector memory"
        ]
      },
      research_data: {
        web_results: [
          {
            title: `2026 Strategic Intelligence Brief: ${cleanQ}`,
            snippet: `Recent empirical evaluations regarding ${cleanQ} reveal significant operational shifts across enterprise deployments...`,
            url: `https://intelligence-network.org/reports/2026-${encodeURIComponent(cleanQ.toLowerCase().slice(0, 15))}`
          },
          {
            title: `Global Infrastructure & Risk Assessment`,
            snippet: `Autonomous systems and multi-agent frameworks report accelerated adoption rates with integrated persistent RAG memory...`,
            url: `https://tech-monitor.global/analysis/vector-rag-2026`
          }
        ],
        news_articles: [
          {
            title: `Emerging Shifts in ${cleanQ}`,
            source: "Global Intelligence Wire",
            url: "https://globalintelligencewire.com/latest"
          }
        ],
        rag_memories_found: 3
      },
      analytical_insights: `Analysis indicates that ${cleanQ} represents a critical pivot point in 2026 enterprise strategy. Integration of multi-agent orchestration, persistent vector store indexing, and dynamic risk mitigation frameworks drastically reduces latency and operational overhead.`,
      critic_review: `Validation confirmed: Multi-agent logical synthesis holds high confidence score (0.96). No contradictory facts or unverified assertions detected across global intelligence sources.`,
      final_report: `# 📊 Intelligence Report: ${cleanQ}\n\n*Generated on ${dateStr} • Multi-Agent Pipeline (Planner → Researcher → Analyst → Critic → Reporter)*\n\n---\n\n## 💡 Executive Summary\nThis report provides an in-depth strategic analysis of **${cleanQ}**. Based on real-time web scans, persistent vector memory embeddings, and cross-sector risk tracking, the current intelligence index indicates high strategic momentum accompanied by emerging regulatory and supply chain developments.\n\n### 🔑 Key Findings & Strategic Metrics\n- 🚀 **Market Growth & Adoption**: Enterprise multi-agent system adoption reached record highs in 2026, driven by automated RAG memory retention.\n- 🛡️ **Risk Index**: Critical infrastructure indicators remain baseline stable, with targeted monitoring recommended on hardware and cloud edge nodes.\n- ⚙️ **Architecture Integration**: Dynamic fallback cascading between LLM providers ensures high uptime during high-demand analysis operations.\n\n---\n\n## 🤖 Multi-Agent Execution Breakdown\n1. **Planner Agent**: Successfully decomposed original query into targeted sub-queries.\n2. **Researcher Agent**: Scanned web sources and retrieved matching historical vector memories.\n3. **Analyst Agent**: Identified key quantitative indicators and sector risk correlations.\n4. **Critic Agent**: Verified zero hallucinated claims and validated source citations.\n5. **Reporter Agent**: Structured final Markdown output and indexed vector memory.\n\n> 💡 *Note: You are viewing an interactive demo report. To connect your live Gemini 2.0 or OpenAI key and execute live web scans against FastAPI, click "API Settings" in the top bar and launch your live backend!*`
    }
  }

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

    let targetBase = backendUrl.trim().replace(/\/$/, '')
    if (targetBase.endsWith('/api') && targetBase.includes('backend.loca.lt')) {
      targetBase = targetBase.replace(/\/api$/, '')
    }

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
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json()
          if (data && data.status) {
            setSystemStatus({ online: true, message: data.status || 'Live Backend Connected 🚀' })
            return
          }
        }
      }
      
      // Auto-heal: Try fetching active tunnel URL from public json
      try {
        const tunnelRes = await fetch('./tunnel_url.json?t=' + Date.now())
        if (tunnelRes.ok) {
          const tunnelData = await tunnelRes.json()
          if (tunnelData.url && tunnelData.url !== backendUrl) {
            setBackendUrl(tunnelData.url)
            setBackendUrlInput(tunnelData.url)
            localStorage.setItem('custom_backend_url', tunnelData.url)
            const newRes = await fetch(`${tunnelData.url.replace(/\/$/, '')}/`, {
              headers: { 'bypass-tunnel-reminder': 'true', 'ngrok-skip-browser-warning': 'true' }
            })
            if (newRes.ok) {
              const newData = await newRes.json()
              if (newData && newData.status) {
                setSystemStatus({ online: true, message: newData.status || 'Live Backend Connected 🚀' })
                return
              }
            }
          }
        }
      } catch (e) {
        // ignore fallback errors
      }

      setSystemStatus({ online: false, message: 'Standalone Interactive Demo Mode' })
    } catch (err) {
      setSystemStatus({ online: false, message: 'Standalone Interactive Demo Mode' })
    }
  }

  const fetchScanStatus = async () => {
    try {
      const res = await apiFetch('/scan/status')
      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        setScanStatus(data)
        return
      }
    } catch (e) {
      // Fallback
    }
    setScanStatus({
      scheduler_active: true,
      interval_hours: 24,
      monitored_sectors: ["AI Tech & Hardware", "Cybersecurity & Cloud", "Autonomous Robotics", "Semiconductor Supply"],
      total_memories_cached: vectorMemories.length || 4,
      last_scan_timestamp: "2026-08-08 00:00:00"
    })
  }

  const fetchSectorRisks = async () => {
    try {
      const res = await apiFetch('/risks')
      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        if (data.risks && data.risks.length > 0) {
          setSectorRisks(data.risks)
          return
        }
      }
    } catch (e) {
      // Fallback
    }
    setSectorRisks(MOCK_SECTOR_RISKS)
  }

  const fetchVectorMemories = async () => {
    try {
      const res = await apiFetch('/memory')
      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        if (data.memories && data.memories.length > 0) {
          setVectorMemories(data.memories)
          return
        }
      }
    } catch (e) {
      // Fallback
    }
    setVectorMemories(prev => prev.length > 0 ? prev : MOCK_VECTOR_MEMORIES)
  }

  const triggerDailyScan = async () => {
    setScanTriggering(true)
    setScanNotice('')
    try {
      const res = await apiFetch('/scan/daily', { method: 'POST' })
      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        setScanNotice('Automated daily scan batch triggered across all monitored sectors!')
        setTimeout(() => {
          fetchScanStatus()
          fetchVectorMemories()
          fetchSectorRisks()
        }, 3000)
        return
      }
    } catch (e) {
      // Fallback
    }
    setScanNotice('Interactive Demo Mode: Daily background scan simulated successfully.')
    setScanTriggering(false)
  }

  const fetchSettingsStatus = async () => {
    try {
      const res = await apiFetch('/settings/status')
      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        setLlmStatus(data)
        if (data.preferred_provider) setPreferredProviderInput(data.preferred_provider)
      }
    } catch (e) {
      console.log('Error fetching LLM settings status', e)
    }
  }

  const testBackendConnection = async () => {
    setTestingUrl(true)
    setSettingsNotice('')
    try {
      const cleanTarget = backendUrlInput.trim().replace(/\/$/, '')
      const res = await fetch(`${cleanTarget}/`, {
        headers: {
          'bypass-tunnel-reminder': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      })
      if (res && res.ok) {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json()
          setSettingsNotice(`✅ Connection Successful! Target server online: "${data.status || 'Running'}"`)
          localStorage.setItem('custom_backend_url', cleanTarget)
          setBackendUrl(cleanTarget)
          checkHealth()
          return
        } else {
          setSettingsNotice(`⚠️ Tunnel active but localtunnel requires IP password verification. Click to open ${cleanTarget} and approve, then retry.`)
          return
        }
      } else {
        setSettingsNotice(`⚠️ Target responded with status ${res.status}. Ensure backend tunnel process is active.`)
      }
    } catch (e) {
      setSettingsNotice(`❌ Unable to reach ${backendUrlInput}. Run "python backend/launch_tunnel.py" on your machine to start the server!`)
    } finally {
      setTestingUrl(false)
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
        checkHealth()
        setTimeout(() => setSettingsNotice(''), 4000)
      } else {
        setSettingsNotice('Saved Backend URL. Target server offline or keys unverified.')
        checkHealth()
      }
    } catch (e) {
      setSettingsNotice('Saved Backend URL locally. Server unreachable for remote key updates.')
      checkHealth()
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    fetch('./tunnel_url.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.url) {
          const currentSaved = localStorage.getItem('custom_backend_url')
          if (!currentSaved || currentSaved.includes('loca.lt')) {
            localStorage.setItem('custom_backend_url', data.url)
            setBackendUrl(data.url)
            setBackendUrlInput(data.url)
          }
        }
      })
      .catch(() => {})

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

    // Animated step progression helper
    const stepTimer = setInterval(() => {
      setActiveStep(prev => (prev < 4 ? prev + 1 : prev))
    }, 1200)

    try {
      if (!systemStatus.online) {
        // Run in Interactive Standalone Demo Mode
        await new Promise(r => setTimeout(r, 1200))
        setActiveStep(2)
        await new Promise(r => setTimeout(r, 1200))
        setActiveStep(3)
        await new Promise(r => setTimeout(r, 1200))
        setActiveStep(4)
        await new Promise(r => setTimeout(r, 1200))
        setActiveStep(5)

        clearInterval(stepTimer)
        const demoData = generateDemoResults(query.trim())
        setResults(demoData)
        setHistory(prev => [{ query: query.trim(), date: new Date().toLocaleTimeString(), data: demoData }, ...prev.slice(0, 19)])
        setVectorMemories(prev => [
          {
            id: `mem_${Date.now()}`,
            doc: `Interactive Intelligence Report for: "${query.trim()}"`,
            timestamp: new Date().toLocaleString(),
            sector: 'AI Tech & Hardware',
            similarity_score: 0.95
          },
          ...prev
        ])
        return
      }

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
      console.log('Backend request failed, falling back to Interactive Demo Mode', err)
      setActiveStep(5)
      const fallbackData = generateDemoResults(query.trim())
      setResults(fallbackData)
      setHistory(prev => [{ query: query.trim(), date: new Date().toLocaleTimeString(), data: fallbackData }, ...prev.slice(0, 19)])
      setScanNotice('Backend connection unavailable. Generated Interactive Standalone Report.')
      setTimeout(() => setScanNotice(''), 5000)
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

        {/* System Health Badge & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            onClick={() => setSettingsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: systemStatus.online ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${systemStatus.online ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
              cursor: 'pointer'
            }}
            title="Click to configure backend API URL or keys"
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: systemStatus.online ? '#10b981' : '#818cf8',
              boxShadow: systemStatus.online ? '0 0 8px #10b981' : '0 0 8px #818cf8',
              animation: 'pulseGlow 2s infinite'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: systemStatus.online ? '#34d399' : '#c7d2fe' }}>
              {systemStatus.online ? '● Live Backend (FastAPI)' : '● Interactive Demo Mode'}
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      placeholder="https://ai-system-backend.loca.lt or http://127.0.0.1:8000"
                      value={backendUrlInput}
                      onChange={(e) => setBackendUrlInput(e.target.value)}
                      className="input-field"
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'rgba(10, 15, 26, 0.9)', color: '#fff', border: '1px solid var(--border-color)' }}
                    />
                    <button
                      type="button"
                      onClick={testBackendConnection}
                      disabled={testingUrl}
                      className="btn-secondary"
                      style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {testingUrl ? <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Activity style={{ width: '14px', height: '14px', color: '#818cf8' }} />}
                      {testingUrl ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Current Active Target: <strong style={{ color: '#818cf8' }}>{backendUrl}</strong>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                    💡 <em>GitHub Pages requires an HTTPS tunnel URL (e.g. `https://...loca.lt`) to bypass browser mixed-content restrictions.</em>
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
