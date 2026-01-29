import './App.css'

import { useEffect, useReducer } from 'react'

type Mode = 'work' | 'break'

type Preset = {
  id: string
  label: string
  workMinutes: number
  breakMinutes: number
}

const PRESETS: Preset[] = [
  { id: '50-10', label: '50 / 10 (deep work)', workMinutes: 50, breakMinutes: 10 },
  { id: '25-5', label: '25 / 5 (classic)', workMinutes: 25, breakMinutes: 5 },
  { id: '52-17', label: '52 / 17 (flow)', workMinutes: 52, breakMinutes: 17 },
  { id: '90-20', label: '90 / 20 (ultra focus)', workMinutes: 90, breakMinutes: 20 },
  { id: '20-5', label: '20 / 5 (quick sprint)', workMinutes: 20, breakMinutes: 5 },
]

type State = {
  presetId: string
  workMinutes: number
  breakMinutes: number
  mode: Mode
  isRunning: boolean
  secondsRemaining: number
}

type Action =
  | { type: 'select_preset'; presetId: string }
  | { type: 'set_work'; minutes: number }
  | { type: 'set_break'; minutes: number }
  | { type: 'toggle_running' }
  | { type: 'reset' }
  | { type: 'skip' }
  | { type: 'tick' }

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${pad2(mm)}:${pad2(ss)}`
}

function SonoranMark({ mode }: { mode: Mode }) {
  // Original abstract mark: rounded-square + "C"-like desert arc.
  const tint = mode === 'work' ? '#7CFFDA' : '#FFD39A'
  return (
    <svg className="mark" viewBox="0 0 64 64" role="img" aria-label="Sonoran mark">
      <defs>
        <linearGradient id="markBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A0F1F" />
          <stop offset="1" stopColor="#1B1A3A" />
        </linearGradient>
        <radialGradient id="markGlow" cx="30%" cy="25%" r="80%">
          <stop offset="0" stopColor={tint} stopOpacity="0.55" />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#markBg)" />
      <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#markGlow)" />
      <path
        d="M44.5 20.5c-3.2-3-7.6-4.8-12.4-4.8-10 0-18.1 8.1-18.1 18.1s8.1 18.1 18.1 18.1c4.8 0 9.2-1.8 12.4-4.8"
        fill="none"
        stroke={tint}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
      <path
        d="M23 33.8c2.9-7.8 11.1-14 20.2-14.9"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
        filter="url(#soft)"
      />
    </svg>
  )
}

function DesertBackdrop() {
  return (
    <svg className="backdrop" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#090A14" />
          <stop offset="0.45" stopColor="#121136" />
          <stop offset="1" stopColor="#1A0F2E" />
        </linearGradient>
        <radialGradient id="sun" cx="70%" cy="25%" r="55%">
          <stop offset="0" stopColor="#FFB86B" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#FF5DA2" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FF5DA2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="duneA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2C1B3A" />
          <stop offset="1" stopColor="#0E1A2A" />
        </linearGradient>
        <linearGradient id="duneB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A1F2F" />
          <stop offset="1" stopColor="#0F2436" />
        </linearGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.95  0 0 0 0.12 0" />
        </filter>
      </defs>

      <rect width="1200" height="700" fill="url(#sky)" />
      <rect width="1200" height="700" fill="url(#sun)" />

      <g opacity="0.18" filter="url(#grain)">
        <rect width="1200" height="700" />
      </g>

      {/* Dunes */}
      <path
        d="M0 520 C 220 470, 380 610, 560 570 C 760 525, 920 420, 1200 520 L 1200 700 L 0 700 Z"
        fill="url(#duneA)"
        opacity="0.95"
      />
      <path
        d="M0 575 C 260 530, 420 670, 660 630 C 860 597, 980 510, 1200 560 L 1200 700 L 0 700 Z"
        fill="url(#duneB)"
        opacity="0.95"
      />

      {/* Saguaro silhouettes */}
      <g fill="#08141D" opacity="0.9">
        <path d="M150 700 V520 c0-20 18-36 38-36s38 16 38 36v56c0 10 8 18 18 18s18-8 18-18v-42c0-17 14-31 31-31s31 14 31 31v166H150Z" />
        <path d="M980 700 V500 c0-18 16-33 35-33s35 15 35 33v62c0 9 7 16 16 16s16-7 16-16v-28c0-14 12-26 26-26s26 12 26 26v166H980Z" />
        <path d="M670 700 V545 c0-15 13-28 29-28s29 13 29 28v42c0 8 6 14 14 14s14-6 14-14v-20c0-12 10-22 22-22s22 10 22 22v133H670Z" />
      </g>
    </svg>
  )
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select_preset': {
      const p = PRESETS.find((x) => x.id === action.presetId)
      if (!p) return state
      return {
        presetId: p.id,
        workMinutes: p.workMinutes,
        breakMinutes: p.breakMinutes,
        mode: 'work',
        isRunning: false,
        secondsRemaining: p.workMinutes * 60,
      }
    }

    case 'set_work': {
      const workMinutes = clampInt(action.minutes, 5, 180)
      return {
        ...state,
        workMinutes,
        // If paused, keep timer aligned to the current mode.
        secondsRemaining:
          state.isRunning || state.mode !== 'work' ? state.secondsRemaining : workMinutes * 60,
      }
    }

    case 'set_break': {
      const breakMinutes = clampInt(action.minutes, 1, 60)
      return {
        ...state,
        breakMinutes,
        secondsRemaining:
          state.isRunning || state.mode !== 'break' ? state.secondsRemaining : breakMinutes * 60,
      }
    }

    case 'toggle_running':
      return { ...state, isRunning: !state.isRunning }

    case 'reset':
      return { ...state, isRunning: false, mode: 'work', secondsRemaining: state.workMinutes * 60 }

    case 'skip': {
      const next: Mode = state.mode === 'work' ? 'break' : 'work'
      const nextSeconds = (next === 'work' ? state.workMinutes : state.breakMinutes) * 60
      return { ...state, isRunning: false, mode: next, secondsRemaining: nextSeconds }
    }

    case 'tick': {
      if (!state.isRunning) return state
      const nextSeconds = state.secondsRemaining - 1
      if (nextSeconds > 0) return { ...state, secondsRemaining: nextSeconds }

      const nextMode: Mode = state.mode === 'work' ? 'break' : 'work'
      const resetSeconds = (nextMode === 'work' ? state.workMinutes : state.breakMinutes) * 60
      return { ...state, mode: nextMode, secondsRemaining: resetSeconds }
    }
  }
}

function App() {
  const initialPreset = PRESETS[0] ?? { id: '25-5', label: '25 / 5', workMinutes: 25, breakMinutes: 5 }
  const [state, dispatch] = useReducer(reducer, {
    presetId: initialPreset.id,
    workMinutes: initialPreset.workMinutes,
    breakMinutes: initialPreset.breakMinutes,
    mode: 'work',
    isRunning: false,
    secondsRemaining: initialPreset.workMinutes * 60,
  })

  // Interval tick.
  useEffect(() => {
    if (!state.isRunning) return
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => window.clearInterval(id)
  }, [state.isRunning])

  // Tab title vibes.
  useEffect(() => {
    const label = state.mode === 'work' ? 'Focus' : 'Breathe'
    document.title = `${formatClock(state.secondsRemaining)} · ${label}`
  }, [state.secondsRemaining, state.mode])

  const totalThisMode = state.mode === 'work' ? state.workMinutes * 60 : state.breakMinutes * 60
  const progress =
    totalThisMode <= 0 ? 0 : (totalThisMode - state.secondsRemaining) / totalThisMode
  const vibe = state.mode === 'work' ? 'saguaro focus' : 'desert break'

  return (
    <div className="app" style={{ ['--progress' as string]: String(progress) }}>
      <DesertBackdrop />

      <header className="topbar">
        <div className="brand">
          <SonoranMark mode={state.mode} />
          <div className="brandText">
            <div className="brandName">Sonoran Pomodoro</div>
            <div className="brandTag">rad • vibes • chill • {vibe}</div>
          </div>
        </div>

        <div className="controlsRow">
          <label className="field">
            <span className="fieldLabel">Preset</span>
            <select
              className="select"
              value={state.presetId}
              onChange={(e) => dispatch({ type: 'select_preset', presetId: e.target.value })}
              aria-label="Preset"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="fieldLabel">Work</span>
            <input
              className="input"
              type="number"
              min={5}
              max={180}
              step={1}
              value={state.workMinutes}
              onChange={(e) => dispatch({ type: 'set_work', minutes: Number(e.target.value) })}
              disabled={state.isRunning}
              aria-label="Work minutes"
            />
          </label>

          <label className="field">
            <span className="fieldLabel">Break</span>
            <input
              className="input"
              type="number"
              min={1}
              max={60}
              step={1}
              value={state.breakMinutes}
              onChange={(e) => dispatch({ type: 'set_break', minutes: Number(e.target.value) })}
              disabled={state.isRunning}
              aria-label="Break minutes"
            />
          </label>
        </div>
      </header>

      <main className="main">
        <section className="timerCard" aria-live="polite">
          <div className="ring" role="img" aria-label="Timer progress ring">
            <div className="ringInner">
              <div className="modePill" data-mode={state.mode}>
                {state.mode === 'work' ? 'WORK' : 'BREAK'}
              </div>
              <div className="time">{formatClock(state.secondsRemaining)}</div>
              <div className="sub">
                {state.mode === 'work'
                  ? 'Settle in. One dune at a time.'
                  : 'Hydrate. Stretch. Let your mind cool.'}
              </div>
            </div>
          </div>

          <div className="buttons">
            <button
              className="btn primary"
              onClick={() => dispatch({ type: 'toggle_running' })}
              aria-label={state.isRunning ? 'Pause' : 'Start'}
            >
              {state.isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              className="btn"
              onClick={() => dispatch({ type: 'reset' })}
              aria-label="Reset"
            >
              Reset
            </button>
            <button
              className="btn"
              onClick={() => dispatch({ type: 'skip' })}
              aria-label="Skip to next session"
            >
              Skip
            </button>
          </div>

          <div className="footerNote">
            Tip: change durations while paused. Presets reset the timer.
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
