/* ChainxGate — Entry Gate (signal scanner + approval cockpit) */
const {
  useState,
  useEffect,
  useMemo
} = React;

/* ---------- DATA ---------- */

const SCANNER = [{
  id: 'eg01',
  sym: 'SOL/USDT',
  tk: 'sol',
  bias: 'LONG',
  entry: 96.10,
  tgt: 97.85,
  stp: 94.20,
  rr: 0.92,
  score: 0.84,
  verdict: 'PASS',
  tier: 'FAIR_C_MOMENTUM',
  cos: 0.88,
  com: 0.82,
  mom: 0.79,
  dna: 0.91,
  reg: 0.74,
  age: '12s'
}, {
  id: 'eg02',
  sym: 'ETH/USDT',
  tk: 'eth',
  bias: 'LONG',
  entry: 2774.5,
  tgt: 2820.0,
  stp: 2735.0,
  rr: 1.18,
  score: 0.78,
  verdict: 'PASS',
  tier: 'BREAKOUT',
  cos: 0.81,
  com: 0.75,
  mom: 0.84,
  dna: 0.72,
  reg: 0.78,
  age: '34s'
}, {
  id: 'eg03',
  sym: 'BNB/USDT',
  tk: 'bnb',
  bias: 'SHORT',
  entry: 614.8,
  tgt: 598.0,
  stp: 622.0,
  rr: 2.33,
  score: 0.71,
  verdict: 'WATCH',
  tier: 'phase 3',
  cos: 0.68,
  com: 0.74,
  mom: 0.65,
  dna: 0.78,
  reg: 0.71,
  age: '1m'
}, {
  id: 'eg04',
  sym: 'AVAX/USDT',
  tk: 'avax',
  bias: 'LONG',
  entry: 21.28,
  tgt: 21.68,
  stp: 20.95,
  rr: 1.21,
  score: 0.66,
  verdict: 'WATCH',
  tier: 'phase 8',
  cos: 0.62,
  com: 0.70,
  mom: 0.58,
  dna: 0.74,
  reg: 0.66,
  age: '2m'
}, {
  id: 'eg05',
  sym: 'XMR/USDT',
  tk: 'xmr',
  bias: 'LONG',
  entry: 155.40,
  tgt: 158.10,
  stp: 153.90,
  rr: 1.80,
  score: 0.81,
  verdict: 'PASS',
  tier: 'BREAKOUT',
  cos: 0.84,
  com: 0.79,
  mom: 0.82,
  dna: 0.85,
  reg: 0.75,
  age: '47s'
}, {
  id: 'eg06',
  sym: 'LINK/USDT',
  tk: 'link',
  bias: 'LONG',
  entry: 9.61,
  tgt: 9.78,
  stp: 9.48,
  rr: 1.31,
  score: 0.59,
  verdict: 'WATCH',
  tier: 'FAIR_C_MOMENTUM',
  cos: 0.55,
  com: 0.60,
  mom: 0.62,
  dna: 0.58,
  reg: 0.61,
  age: '4m'
}, {
  id: 'eg07',
  sym: 'ARB/USDT',
  tk: 'arb',
  bias: 'SHORT',
  entry: 0.3104,
  tgt: 0.3018,
  stp: 0.3155,
  rr: 1.69,
  score: 0.42,
  verdict: 'REJECT',
  tier: 'phase 4',
  cos: 0.38,
  com: 0.45,
  mom: 0.40,
  dna: 0.41,
  reg: 0.46,
  age: '6m'
}, {
  id: 'eg08',
  sym: 'BTC/USDT',
  tk: 'btc',
  bias: 'LONG',
  entry: 68425.0,
  tgt: 69100.0,
  stp: 68050.0,
  rr: 1.80,
  score: 0.74,
  verdict: 'PASS',
  tier: 'phase 8',
  cos: 0.76,
  com: 0.71,
  mom: 0.78,
  dna: 0.72,
  reg: 0.73,
  age: '52s'
}, {
  id: 'eg09',
  sym: 'SOL/USDT',
  tk: 'sol',
  bias: 'SHORT',
  entry: 96.55,
  tgt: 94.80,
  stp: 97.45,
  rr: 1.94,
  score: 0.36,
  verdict: 'REJECT',
  tier: 'phase 7',
  cos: 0.32,
  com: 0.38,
  mom: 0.34,
  dna: 0.40,
  reg: 0.36,
  age: '8m'
}, {
  id: 'eg10',
  sym: 'AVAX/USDT',
  tk: 'avax',
  bias: 'SHORT',
  entry: 21.45,
  tgt: 20.85,
  stp: 21.78,
  rr: 1.82,
  score: 0.51,
  verdict: 'WATCH',
  tier: 'phase 6',
  cos: 0.48,
  com: 0.52,
  mom: 0.50,
  dna: 0.55,
  reg: 0.50,
  age: '11m'
}];
const PENDING = [{
  ts: '04-20 04:14:22',
  sym: 'SOL/USDT',
  side: 'LONG',
  entry: 96.10,
  tgt: 97.85,
  stp: 94.20,
  rr: 0.92,
  score: 0.84,
  mode: 'manual'
}, {
  ts: '04-20 04:13:58',
  sym: 'XMR/USDT',
  side: 'LONG',
  entry: 155.40,
  tgt: 158.10,
  stp: 153.90,
  rr: 1.80,
  score: 0.81,
  mode: 'auto'
}, {
  ts: '04-20 04:13:11',
  sym: 'ETH/USDT',
  side: 'LONG',
  entry: 2774.5,
  tgt: 2820.0,
  stp: 2735.0,
  rr: 1.18,
  score: 0.78,
  mode: 'manual'
}, {
  ts: '04-20 04:12:45',
  sym: 'BTC/USDT',
  side: 'LONG',
  entry: 68425,
  tgt: 69100,
  stp: 68050,
  rr: 1.80,
  score: 0.74,
  mode: 'auto'
}];
const HISTORY = [{
  ts: '04-20 04:08:11',
  sym: 'SOL/USDT',
  side: 'LONG',
  score: 0.86,
  verdict: 'APPROVED',
  outcome: 'filled',
  pnl: 0.57
}, {
  ts: '04-20 04:02:33',
  sym: 'ETH/USDT',
  side: 'LONG',
  score: 0.79,
  verdict: 'APPROVED',
  outcome: 'filled',
  pnl: 0.14
}, {
  ts: '04-20 03:58:14',
  sym: 'BNB/USDT',
  side: 'SHORT',
  score: 0.42,
  verdict: 'REJECTED',
  outcome: 'skipped',
  pnl: 0
}, {
  ts: '04-20 03:55:02',
  sym: 'AVAX/USDT',
  side: 'LONG',
  score: 0.71,
  verdict: 'APPROVED',
  outcome: 'filled',
  pnl: 0.21
}, {
  ts: '04-20 03:51:48',
  sym: 'LINK/USDT',
  side: 'SHORT',
  score: 0.38,
  verdict: 'REJECTED',
  outcome: 'skipped',
  pnl: 0
}, {
  ts: '04-20 03:48:30',
  sym: 'XMR/USDT',
  side: 'LONG',
  score: 0.83,
  verdict: 'APPROVED',
  outcome: 'filled',
  pnl: 0.96
}, {
  ts: '04-20 03:42:11',
  sym: 'ARB/USDT',
  side: 'SHORT',
  score: 0.34,
  verdict: 'REJECTED',
  outcome: 'skipped',
  pnl: 0
}, {
  ts: '04-20 03:38:54',
  sym: 'SOL/USDT',
  side: 'SHORT',
  score: 0.66,
  verdict: 'APPROVED',
  outcome: 'stopped',
  pnl: -1.32
}];

/* ---------- LIVE: Scanner snapshot (from ./data/scanner.json) ---------- */
// Verdict = signal-health label derived from score, NOT from decision.
// PASS = signal đủ khoẻ; WATCH = cần theo dõi; REJECT = yếu.
// Approval (auto-enter) is independent — scanner only shows health.

const verdictOf = score => score >= 0.75 ? 'PASS' : score >= 0.55 ? 'WATCH' : 'REJECT';

// TP/SL for display only — pull from env defaults shipped with executor
const TP_PCT_DEFAULT = 0.085;
const SL_PCT_DEFAULT = 0.045;
const computeTpSl = (entry, bias) => {
  if (!entry || entry <= 0) return {
    tgt: 0,
    stp: 0,
    rr: 0
  };
  const isLong = bias === 'LONG';
  const tgt = isLong ? entry * (1 + TP_PCT_DEFAULT) : entry * (1 - TP_PCT_DEFAULT);
  const stp = isLong ? entry * (1 - SL_PCT_DEFAULT) : entry * (1 + SL_PCT_DEFAULT);
  const rr = SL_PCT_DEFAULT > 0 ? +(TP_PCT_DEFAULT / SL_PCT_DEFAULT).toFixed(2) : 0;
  return {
    tgt,
    stp,
    rr
  };
};
const ageOf = isoUtc => {
  if (!isoUtc) return '—';
  const ts = Date.parse(isoUtc);
  if (isNaN(ts)) return '—';
  const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
};
const transformScannerRow = s => {
  const entry = Number(s.entry) || 0;
  const {
    tgt,
    stp,
    rr
  } = computeTpSl(entry, s.bias);
  // Map 5 components from breakdown for the 5 sub-bars in row UI.
  // Re-scale roughly to 0-1 for visual bar (raw component magnitudes are small).
  const c = s.components || {};
  const norm = v => Math.max(0, Math.min(1, 0.5 + Number(v || 0) * 2.5));
  return {
    id: s.id,
    sym: s.sym,
    tk: s.tk,
    coin: s.coin,
    bias: s.bias,
    entry,
    tgt: +tgt.toFixed(entry < 10 ? 4 : 2),
    stp: +stp.toFixed(entry < 10 ? 4 : 2),
    rr,
    score: Number(s.score) || 0,
    verdict: s.verdict || verdictOf(Number(s.score) || 0),
    tier: s.scenario || s.consensus || '—',
    consensus: s.consensus || '',
    cos: norm(c.cohort),
    // cohort health
    com: norm(c.edge),
    // edge dominance
    mom: norm(c.tick),
    // tick momentum
    dna: norm(c.macro),
    // macro context
    reg: norm(c.memory),
    // stream memory
    components_raw: c,
    breakdown: s.breakdown || {},
    scenario: s.scenario || '',
    reasoning: s.reasoning,
    decided_at: s.decided_at,
    age: ageOf(s.decided_at),
    simulated_should_enter: !!s.simulated_should_enter,
    display_decision: s.display_decision || '',
    decision: s.decision,
    skip_reason: s.skip_reason,
    pos_id: s.pos_id
  };
};
const useLiveScanner = (rate = 4000) => {
  const [raw, setRaw] = useState([]);
  const [todayCounts, setTodayCounts] = useState({
    scanning: 0,
    pass: 0,
    watch: 0,
    reject: 0
  });
  const [kpiHistory, setKpiHistory] = useState({
    scanning: [],
    pass: [],
    watch: [],
    reject: []
  });
  const [kpiDelta, setKpiDelta] = useState({
    scanning: null,
    pass: null,
    watch: null,
    reject: null
  });
  const [, setTick] = useState(0);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/scanner.json').then(r => r.json()).then(j => {
      const scannerRows = Array.isArray(j?.scanner) ? j.scanner : [];
      const currentCounts = {
        scanning: scannerRows.length,
        pass: scannerRows.filter(x => String(x?.verdict || '').toUpperCase() === 'PASS').length,
        watch: scannerRows.filter(x => String(x?.verdict || '').toUpperCase() === 'WATCH').length,
        reject: scannerRows.filter(x => String(x?.verdict || '').toUpperCase() === 'REJECT').length
      };
      setRaw(scannerRows);
      setTodayCounts({
        scanning: Number(j?.today_counts?.scanning) || 0,
        pass: Number(j?.today_counts?.pass) || 0,
        watch: Number(j?.today_counts?.watch) || 0,
        reject: Number(j?.today_counts?.reject) || 0
      });
      setKpiHistory(prev => {
        const next = {
          scanning: [...prev.scanning, currentCounts.scanning].slice(-20),
          pass: [...prev.pass, currentCounts.pass].slice(-20),
          watch: [...prev.watch, currentCounts.watch].slice(-20),
          reject: [...prev.reject, currentCounts.reject].slice(-20)
        };
        const pctDelta = (curr, prevVal) => {
          if (prevVal == null) return null;
          if (prevVal === 0) return curr === 0 ? 0 : 100;
          return (curr - prevVal) / Math.abs(prevVal) * 100;
        };
        setKpiDelta({
          scanning: pctDelta(currentCounts.scanning, prev.scanning[prev.scanning.length - 1]),
          pass: pctDelta(currentCounts.pass, prev.pass[prev.pass.length - 1]),
          watch: pctDelta(currentCounts.watch, prev.watch[prev.watch.length - 1]),
          reject: pctDelta(currentCounts.reject, prev.reject[prev.reject.length - 1])
        });
        return next;
      });
    }).catch(() => {});
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  // 1s tick so `age` derives fresh each render
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    rows: raw.map(transformScannerRow),
    todayCounts,
    kpiHistory,
    kpiDelta
  };
};

/* ---------- VISUALS ---------- */

const Spark = ({
  data,
  color = '#6366F1',
  h = 36,
  w = 120,
  fill
}) => {
  const series = Array.isArray(data) ? data.filter(v => Number.isFinite(v)) : [];
  if (series.length === 0) return null;
  if (series.length === 1) {
    const y = h / 2;
    const x = w - 8;
    return /*#__PURE__*/React.createElement("svg", {
      width: w,
      height: h,
      style: {
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: `M4,${y} L${w - 4},${y}`,
      stroke: color,
      strokeWidth: "1.5",
      fill: "none",
      strokeLinecap: "round",
      opacity: ".35"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: x,
      cy: y,
      r: "2.2",
      fill: color
    }));
  }
  const min = Math.min(...series),
    max = Math.max(...series);
  const r = max - min || 1;
  const pts = series.map((v, i) => `${i / (series.length - 1) * w},${h - (v - min) / r * (h - 4) - 2}`);
  const path = 'M' + pts.join(' L');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const [lastX, lastY] = pts[pts.length - 1].split(',');
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    style: {
      display: 'block'
    }
  }, fill && /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: fill,
    opacity: ".22"
  }), /*#__PURE__*/React.createElement("path", {
    d: path,
    stroke: color,
    strokeWidth: "1.75",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: lastX,
    cy: lastY,
    r: "2.2",
    fill: color
  }));
};
const Kpi = ({
  label,
  value,
  sub,
  delta,
  icon,
  color,
  spark
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: '#fff',
    borderRadius: 16,
    padding: 18,
    border: '1px solid #EEF0F4',
    position: 'relative',
    overflow: 'hidden'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 90,
    height: 90,
    borderRadius: 999,
    background: color,
    opacity: .08
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: color,
    display: 'grid',
    placeItems: 'center',
    color: '#fff'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: icon,
  size: 14,
  stroke: 2.25
})), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 700,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '.08em'
  }
}, label)), delta != null && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 10,
    fontWeight: 700,
    color: delta >= 0 ? '#059669' : '#DC2626',
    fontFamily: 'JetBrains Mono, monospace'
  }
}, delta >= 0 ? '▲' : '▼', " ", Math.abs(delta).toFixed(2), "%")), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0F172A',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-.02em',
    lineHeight: 1
  }
}, value), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: '#6B7280'
  }
}, sub), spark && /*#__PURE__*/React.createElement(Spark, {
  data: spark,
  color: color,
  w: 70,
  h: 22,
  fill: color
})));

/* ---------- VERDICT CHIP + GATE BAR HELPERS ---------- */

const verdictStyle = v => ({
  PASS: {
    bg: '#ECFDF5',
    fg: '#047857',
    dot: '#10B981'
  },
  WATCH: {
    bg: '#FFFBEB',
    fg: '#92400E',
    dot: '#F59E0B'
  },
  REJECT: {
    bg: '#FEF2F2',
    fg: '#B91C1C',
    dot: '#EF4444'
  }
})[v] || {
  bg: '#F1F3F8',
  fg: '#6B7280',
  dot: '#9CA3AF'
};
const VerdictChip = ({
  v,
  large
}) => {
  const s = verdictStyle(v);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: large ? 12 : 10,
      fontWeight: 800,
      padding: large ? '6px 12px' : '3px 9px',
      borderRadius: 999,
      background: s.bg,
      color: s.fg,
      letterSpacing: '.06em',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: large ? 8 : 6,
      height: large ? 8 : 6,
      borderRadius: 999,
      background: s.dot,
      boxShadow: `0 0 0 2px ${s.dot}33`
    }
  }), v);
};
const GateBar = ({
  label,
  value,
  color
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 0'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flex: '0 0 90px',
    fontSize: 10,
    fontWeight: 700,
    color: '#6B7280',
    letterSpacing: '.06em',
    textTransform: 'uppercase'
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    height: 6,
    background: '#F1F3F8',
    borderRadius: 999,
    overflow: 'hidden'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: `${value * 100}%`,
    height: '100%',
    background: color,
    borderRadius: 999,
    transition: 'width 400ms cubic-bezier(.2,.8,.2,1)'
  }
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: '0 0 36px',
    textAlign: 'right',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    fontWeight: 700,
    color: '#0F172A'
  }
}, (value * 100).toFixed(0), "%"));

/* ---------- SCANNER ROW (left list) ---------- */

const ScannerRow = ({
  s,
  active,
  onClick
}) => {
  const long = s.bias === 'LONG';
  const v = verdictStyle(s.verdict);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 12,
      border: `1px solid ${active ? '#C7D2FE' : 'transparent'}`,
      background: active ? '#EEF0FF' : '#fff',
      cursor: 'pointer',
      marginBottom: 6,
      boxShadow: active ? '0 4px 14px rgba(99,102,241,.10)' : 'none',
      transition: 'all 120ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${s.tk}.svg`,
    width: "28",
    height: "28"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 999,
      background: long ? '#10B981' : '#EF4444',
      border: '2px solid #fff',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: long ? 'arrow-up' : 'arrow-down',
    size: 7,
    stroke: 3,
    style: {
      color: '#fff'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: '#0F172A'
    }
  }, s.sym), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: long ? '#047857' : '#B91C1C',
      letterSpacing: '.06em'
    }
  }, s.bias)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      marginTop: 2
    }
  }, s.tier.replace(/_/g, ' '), " \xB7 ", s.age)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 28,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: '#F1F3F8',
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${s.score * 100}%`,
      height: '100%',
      background: v.dot,
      borderRadius: 999,
      transition: 'width 400ms'
    }
  })), /*#__PURE__*/React.createElement("div", {
    key: s.score.toFixed(2),
    className: "cxg-tick",
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: v.fg,
      fontFamily: 'JetBrains Mono, monospace',
      textAlign: 'center',
      marginTop: 3
    }
  }, (s.score * 100).toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: 'center'
    }
  }, /*#__PURE__*/React.createElement(VerdictChip, {
    v: s.verdict
  })));
};

/* ---------- GATE FOCUS PANE (right column) — full diagnostic ---------- */

const COMPONENT_META = [{
  k: 'comp_1',
  label: 'S****',
  color: '#6366F1'
}, {
  k: 'comp_2',
  label: 'O****',
  color: '#A855F7'
}, {
  k: 'comp_3',
  label: 'C****',
  color: '#10B981'
}, {
  k: 'comp_4',
  label: 'S**** (same−opp)',
  color: '#0EA5E9'
}, {
  k: 'comp_5',
  label: 'P**** (opp−same)',
  color: '#F59E0B'
}, {
  k: 'comp_6',
  label: 'C****',
  color: '#EC4899'
}, {
  k: 'comp_7',
  label: 'S****',
  color: '#94A3B8'
}, {
  k: 'comp_8',
  label: 'T****',
  color: '#3B82F6'
}, {
  k: 'comp_9',
  label: 'M****',
  color: '#FBBF24'
}, {
  k: 'comp_10',
  label: 'R****',
  color: '#84CC16'
}];

// Each bar uses ±0.30 as full deflection (covers all clamp ranges in score).
// Bar grows from center marker outward (positive=right colored, negative=left red).
const ComponentBar = ({
  label,
  value,
  color
}) => {
  const v = Number(value || 0);
  const isZero = Math.abs(v) < 0.0005;
  const sign = v >= 0;
  // pct of HALF-bar to fill (0-100% of one side). 0.30 = max.
  const halfPct = Math.min(100, Math.abs(v) / 0.30 * 100);
  const barColor = isZero ? '#E5E7EB' : sign ? color : '#EF4444';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '180px 1fr 64px',
      gap: 12,
      alignItems: 'center',
      padding: '6px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#374151',
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 8,
      background: '#F5F6FA',
      borderRadius: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: -2,
      height: 12,
      width: 1,
      background: '#94A3B8',
      transform: 'translateX(-0.5px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      height: '100%',
      left: sign ? '50%' : `${50 - halfPct / 2}%`,
      width: `${halfPct / 2}%`,
      background: barColor,
      borderRadius: sign ? '0 4px 4px 0' : '4px 0 0 4px',
      transition: 'all 240ms ease'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 700,
      color: isZero ? '#9CA3AF' : sign ? '#059669' : '#DC2626',
      textAlign: 'right'
    }
  }, isZero ? '±0.000' : (sign ? '+' : '') + v.toFixed(3)));
};
const consensusStyle = c => ({
  DOMINANT: {
    bg: '#ECFDF5',
    fg: '#047857'
  },
  LEAN: {
    bg: '#EFF6FF',
    fg: '#1D4ED8'
  },
  MIXED: {
    bg: '#FFFBEB',
    fg: '#B45309'
  },
  CONFLICTED: {
    bg: '#FEF3C7',
    fg: '#92400E'
  },
  'O****': {
    bg: '#FEF2F2',
    fg: '#B91C1C'
  },
  NONE: {
    bg: '#F5F6FA',
    fg: '#6B7280'
  }
})[c] || {
  bg: '#F5F6FA',
  fg: '#6B7280'
};
const decisionLabel = s => {
  const raw = String(s.display_decision || '').trim();
  if (!raw) return null;
  const text = raw.replace(/_/g, ' ');
  const upper = raw.toUpperCase();
  const isEnter = upper.startsWith('ENTER') || upper === 'PASS';
  const isWeak = upper === 'WATCH' || upper === 'WEAK_SIGNAL';
  return {
    text,
    bg: isEnter ? '#ECFDF5' : isWeak ? '#FFFBEB' : '#FEF2F2',
    fg: isEnter ? '#047857' : isWeak ? '#B45309' : '#B91C1C'
  };
};
const GateFocus = ({
  s
}) => {
  if (!s) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #EEF0F4',
        padding: 28,
        display: 'grid',
        placeItems: 'center',
        minHeight: 600
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: '#9CA3AF'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "mouse-pointer-click",
      size: 32,
      stroke: 1.5
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        marginTop: 10,
        fontWeight: 600
      }
    }, "Select a signal"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        marginTop: 4
      }
    }, "Click any LONG/SHORT cell to inspect its full gate breakdown")));
  }
  const long = s.bias === 'LONG';
  const v = verdictStyle(s.verdict);
  const cs = consensusStyle(s.consensus);
  const dec = decisionLabel(s);
  const bd = s.breakdown || {};
  const signalSum = bd._signal_sum;
  const sameRaw = bd._comp_1_raw;
  const oppRaw = bd._comp_2_raw;
  const edgeRaw = bd._comp_3_raw;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      borderBottom: '1px solid #F1F3F8',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      flexShrink: 0,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: '#F5F6FA',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${s.tk}.svg`,
    width: "30",
    height: "30",
    onError: e => e.target.style.display = 'none'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, s.sym), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 10,
      fontWeight: 800,
      padding: '3px 8px',
      borderRadius: 6,
      background: long ? '#ECFDF5' : '#FEF2F2',
      color: long ? '#047857' : '#B91C1C',
      letterSpacing: '.06em'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: long ? 'arrow-up-right' : 'arrow-down-right',
    size: 10,
    stroke: 2.5
  }), s.bias), s.consensus && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 800,
      padding: '3px 8px',
      borderRadius: 6,
      background: cs.bg,
      color: cs.fg,
      letterSpacing: '.06em'
    }
  }, s.consensus)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, s.scenario && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 6,
      background: '#EEF0FF',
      color: '#4338CA',
      letterSpacing: '.04em'
    }
  }, s.scenario.replace(/_/g, ' ')), dec && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 6,
      background: dec.bg,
      color: dec.fg,
      letterSpacing: '.04em'
    }
  }, dec.text)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 6,
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", null, "last eval ", s.age, " ago"), s.pos_id && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#4338CA'
    }
  }, "\xB7 pos #", s.pos_id, " active")))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Score"), /*#__PURE__*/React.createElement("div", {
    key: s.score.toFixed(2),
    className: "cxg-tick",
    style: {
      fontSize: 32,
      fontWeight: 800,
      color: v.fg,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-.02em',
      lineHeight: 1
    }
  }, (s.score * 100).toFixed(0), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      color: '#9CA3AF',
      fontWeight: 600
    }
  }, "/100")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(VerdictChip, {
    v: s.verdict,
    large: true
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      borderBottom: '1px solid #F1F3F8'
    }
  }, [{
    l: 'Entry',
    v: s.entry,
    c: '#0F172A'
  }, {
    l: 'Target',
    v: s.tgt,
    c: '#059669'
  }, {
    l: 'Stop',
    v: s.stp,
    c: '#DC2626'
  }, {
    l: 'R : R',
    v: s.rr.toFixed(2),
    c: s.rr >= 1.5 ? '#059669' : s.rr >= 1 ? '#F59E0B' : '#DC2626'
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.l,
    style: {
      padding: 14,
      borderLeft: i === 0 ? 'none' : '1px solid #F1F3F8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, m.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 16,
      fontWeight: 700,
      color: m.c,
      marginTop: 3
    }
  }, m.v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      borderBottom: '1px solid #F1F3F8',
      background: '#FAFBFF'
    }
  }, [{
    l: 'Same raw',
    v: sameRaw,
    c: (sameRaw || 0) >= 0 ? '#059669' : '#DC2626'
  }, {
    l: 'Opp raw',
    v: oppRaw,
    c: (oppRaw || 0) >= 0 ? '#DC2626' : '#059669'
  }, {
    l: 'Edge raw',
    v: edgeRaw,
    c: (edgeRaw || 0) >= 0 ? '#059669' : '#DC2626'
  }, {
    l: 'Σ signal',
    v: signalSum,
    c: (signalSum || 0) >= 0 ? '#059669' : '#DC2626'
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.l,
    style: {
      padding: 14,
      borderLeft: i === 0 ? 'none' : '1px solid #F1F3F8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, m.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      fontWeight: 700,
      color: m.c,
      marginTop: 3
    }
  }, m.v == null ? '—' : (m.v >= 0 ? '+' : '') + Number(m.v).toFixed(3))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders-horizontal",
    size: 14,
    stroke: 2.2,
    style: {
      color: '#4338CA'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: '#0F172A',
      letterSpacing: '.1em'
    }
  }, "SCORE BREAKDOWN \u2014 10 COMPONENTS"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, "internal model")), COMPONENT_META.map(c => /*#__PURE__*/React.createElement(ComponentBar, {
    key: c.k,
    label: c.label,
    value: bd[c.k],
    color: c.color
  }))), s.reasoning && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px',
      borderTop: '1px solid #F1F3F8',
      background: '#FAFBFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: '#6B7280',
      letterSpacing: '.1em',
      marginBottom: 6
    }
  }, "REASONING"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#1F2937',
      fontFamily: 'JetBrains Mono, monospace',
      lineHeight: 1.55,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  }, s.reasoning)));
};

/* ---------- TAB PANELS ---------- */

/* ---- Compact signal card — same layout style as AI Bot's BotRow ---- */
const ScanCard = ({
  s,
  active,
  dimmed,
  onClick
}) => {
  const long = s.bias === 'LONG';
  const v = verdictStyle(s.verdict);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      gap: 12,
      alignItems: 'center',
      padding: '12px 14px',
      borderRadius: 12,
      border: `1px solid ${active ? '#C7D2FE' : '#EEF0F4'}`,
      background: active ? '#EEF0FF' : '#fff',
      opacity: dimmed ? 0.4 : 1,
      cursor: 'pointer',
      boxShadow: active ? '0 4px 14px rgba(99,102,241,.10)' : '0 1px 2px rgba(17,24,39,.04)',
      transition: 'all 120ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${s.tk}.svg`,
    width: "30",
    height: "30",
    onError: e => e.target.style.display = 'none'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 999,
      border: '2px solid #fff',
      background: long ? '#10B981' : '#EF4444',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: long ? 'arrow-up' : 'arrow-down',
    size: 7,
    stroke: 3,
    style: {
      color: '#fff'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: '#0F172A'
    }
  }, s.sym), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 800,
      color: long ? '#047857' : '#B91C1C',
      letterSpacing: '.06em'
    }
  }, s.bias)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      marginTop: 3,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    title: s.tier
  }, (s.tier || '—').replace(/_/g, ' '), " \xB7 ", s.age)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: '#F1F3F8',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.max(2, s.score * 100)}%`,
      height: '100%',
      background: v.dot,
      borderRadius: 999,
      transition: 'width 400ms'
    }
  })), /*#__PURE__*/React.createElement("div", {
    key: s.score.toFixed(2),
    className: "cxg-tick",
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: v.fg,
      fontFamily: 'JetBrains Mono, monospace',
      textAlign: 'center',
      marginTop: 4
    }
  }, (s.score * 100).toFixed(0), "%")), /*#__PURE__*/React.createElement(VerdictChip, {
    v: s.verdict
  }));
};
const LiveScannerPanel = ({
  scanner,
  selected,
  setSelected,
  filter,
  setFilter
}) => {
  const filtered = scanner.filter(s => {
    if (filter === 'PASS only') return s.verdict === 'PASS';
    if (filter === 'WATCH') return s.verdict === 'WATCH';
    if (filter === 'Long Only') return s.bias === 'LONG';
    if (filter === 'Short Only') return s.bias === 'SHORT';
    return true;
  });
  // Group by coin alphabetical, LONG before SHORT inside each coin → 2 cells in grid render LONG, SHORT side by side
  const sorted = [...filtered].sort((a, b) => {
    if (a.coin !== b.coin) return a.coin.localeCompare(b.coin);
    return a.bias === 'LONG' ? -1 : 1;
  });
  const passCount = scanner.filter(s => s.verdict === 'PASS').length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Scanner"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 999,
      background: '#ECFDF5',
      color: '#047857',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: '#10B981',
      animation: 'cxg-pulse 1.4s infinite'
    }
  }), passCount, " PASS")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, sorted.length, " signals")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    style: {
      position: 'absolute',
      left: 10,
      top: 9,
      color: '#9CA3AF'
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Filter pair\u2026",
    style: {
      width: '100%',
      padding: '8px 10px 8px 32px',
      fontSize: 12,
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Chips, {
    items: ['All', 'PASS only', 'WATCH', 'Long Only', 'Short Only'],
    active: filter,
    onChange: setFilter
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      margin: '0 -2px',
      paddingRight: 2,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      alignContent: 'start'
    }
  }, sorted.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1',
      padding: 28,
      textAlign: 'center',
      fontSize: 12,
      color: '#6B7280'
    }
  }, "Loading scanner\u2026"), sorted.map(s => /*#__PURE__*/React.createElement(ScanCard, {
    key: s.id,
    s: s,
    active: selected?.id === s.id,
    onClick: () => setSelected(s)
  })))), /*#__PURE__*/React.createElement(GateFocus, {
    s: selected
  }));
};

/* ---------- LIVE: Pending entries (from ./data/pending.json) ---------- */
const useApiPending = (rate = 4000) => {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/pending.json').then(r => r.json()).then(j => {
      setData(Array.isArray(j?.pending) ? j.pending : []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return {
    data,
    loaded,
    reload: fetchOnce
  };
};
const PendingPanel = () => {
  const {
    data: pending,
    loaded
  } = useApiPending(4000);
  const passCount = pending.filter(p => p.score >= 0.80).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid #F1F3F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Pending entries \u2014 awaiting trigger"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, pending.length, " armed \xB7 ", passCount, " above auto-fire score 0.80", !loaded && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      color: '#9CA3AF'
    }
  }, "\xB7 loading\u2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    icon: "x"
  }, "Reject all"), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    icon: "check"
  }, "Approve all PASS"))), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: '#FAFBFF'
    }
  }, ['Armed at', 'Pair', 'Side', 'Entry', 'Score', 'Scenario', 'Expires', 'Mode', ''].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: 'left',
      fontSize: 10,
      fontWeight: 700,
      color: '#6B7280',
      padding: '10px 14px',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      borderBottom: '1px solid #F1F3F8'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, pending.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 9,
    style: {
      padding: 28,
      textAlign: 'center',
      fontSize: 12,
      color: '#6B7280'
    }
  }, loaded ? 'No armed entries right now.' : 'Loading…')), pending.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.armed_id,
    style: {
      borderBottom: '1px solid #F5F6FA'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, p.ts || '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${p.coin.toLowerCase()}.svg`,
    width: "20",
    height: "20",
    onError: e => e.target.style.display = 'none'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, p.sym))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 4,
      background: p.side === 'LONG' ? '#ECFDF5' : '#FEF2F2',
      color: p.side === 'LONG' ? '#047857' : '#B91C1C'
    }
  }, p.side)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      color: '#0F172A'
    }
  }, p.entry ? Number(p.entry).toLocaleString(undefined, {
    maximumFractionDigits: p.entry < 10 ? 4 : 2
  }) : '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 5,
      background: '#F1F3F8',
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.min(100, p.score * 100)}%`,
      height: '100%',
      background: p.score >= 0.75 ? '#10B981' : p.score >= 0.55 ? '#F59E0B' : '#EF4444',
      borderRadius: 999
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, (p.score * 100).toFixed(0)))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      fontSize: 11,
      color: '#4338CA',
      fontFamily: 'JetBrains Mono, monospace',
      maxWidth: 220,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    title: p.scenario
  }, p.scenario || '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, p.expire_at || '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 4,
      background: '#EEF0FF',
      color: '#4338CA',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, "auto")), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '8px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      padding: '5px 10px',
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 6,
      border: '1px solid #FECACA',
      background: '#fff',
      color: '#B91C1C',
      cursor: 'pointer'
    }
  }, "Reject"), /*#__PURE__*/React.createElement("button", {
    style: {
      padding: '5px 10px',
      fontSize: 10,
      fontWeight: 800,
      borderRadius: 6,
      border: 'none',
      background: '#10B981',
      color: '#fff',
      cursor: 'pointer'
    }
  }, "Approve"))))))));
};

/* ---------- LIVE: Entry history (from ./data/ehistory.json) ---------- */
const useApiEntryHistory = (range = 'ALL', rate = 8000) => {
  const [data, setData] = useState({
    history: [],
    approved: 0,
    filled: 0,
    count: 0
  });
  const [loaded, setLoaded] = useState(false);
  const fetchOnce = React.useCallback(() => {
    fetch(`./data/ehistory.json`).then(r => r.json()).then(j => {
      setData({
        history: Array.isArray(j?.history) ? j.history : [],
        approved: Number(j?.approved) || 0,
        filled: Number(j?.filled) || 0,
        count: Number(j?.count) || 0
      });
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [range]);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return {
    ...data,
    loaded,
    reload: fetchOnce
  };
};
const RANGE_OPTIONS = ['1H', '1D', '1M', '1Y', 'ALL'];
const VERDICT_FILTERS = ['All', 'Approved', 'Rejected', 'Filled', 'Long Only', 'Short Only'];
const HistoryPanel = () => {
  const [range, setRange] = useState('1D');
  const [vfilter, setVfilter] = useState('All');
  const [search, setSearch] = useState('');
  const {
    history,
    approved,
    filled,
    count,
    loaded
  } = useApiEntryHistory(range, 8000);
  const filtered = history.filter(h => {
    if (vfilter === 'Approved' && h.verdict !== 'APPROVED') return false;
    if (vfilter === 'Rejected' && h.verdict !== 'REJECTED') return false;
    if (vfilter === 'Filled' && h.outcome !== 'filled') return false;
    if (vfilter === 'Long Only' && h.side !== 'LONG') return false;
    if (vfilter === 'Short Only' && h.side !== 'SHORT') return false;
    if (search) {
      const s = search.toLowerCase();
      if (!String(h.coin || '').toLowerCase().includes(s) && !String(h.scenario || '').toLowerCase().includes(s) && !String(h.skip_reason || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });
  const fApproved = filtered.filter(h => h.verdict === 'APPROVED').length;
  const fFilled = filtered.filter(h => h.outcome === 'filled' || h.outcome === 'stopped' || h.outcome === 'open').length;
  const approvalPct = filtered.length ? fApproved / filtered.length * 100 : 0;
  const fillPct = fApproved ? fFilled / fApproved * 100 : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: '1px solid #F1F3F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Decision history \u2014 last ", range), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, filtered.length, " of ", count, " decisions \xB7 ", fApproved, " approved \xB7 ", fFilled, " filled", !loaded && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      color: '#9CA3AF'
    }
  }, "\xB7 loading\u2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    }
  }, RANGE_OPTIONS.map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setRange(r),
    style: {
      padding: '5px 12px',
      fontSize: 11,
      fontWeight: 700,
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      background: range === r ? '#0F172A' : 'transparent',
      color: range === r ? '#fff' : '#6B7280',
      fontFamily: 'inherit',
      letterSpacing: '.04em'
    }
  }, r)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px',
      borderBottom: '1px solid #F1F3F8',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: '0 0 220px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    style: {
      position: 'absolute',
      left: 10,
      top: 9,
      color: '#9CA3AF'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Filter coin / scenario\u2026",
    style: {
      width: '100%',
      padding: '7px 10px 7px 32px',
      fontSize: 12,
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement(Chips, {
    items: VERDICT_FILTERS,
    active: vfilter,
    onChange: setVfilter
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: filtered.length > 12 ? 12 * 46 + 40 : 'auto',
      overflowY: filtered.length > 12 ? 'auto' : 'visible'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: '#FAFBFF'
    }
  }, ['Time', 'Pair', 'Side', 'Score', 'Verdict', 'Outcome', 'Reason', 'PnL'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: 'left',
      fontSize: 10,
      fontWeight: 700,
      color: '#6B7280',
      padding: '10px 14px',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      borderBottom: '1px solid #F1F3F8',
      background: '#FAFBFF'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filtered.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 8,
    style: {
      padding: 28,
      textAlign: 'center',
      fontSize: 12,
      color: '#6B7280'
    }
  }, loaded ? 'No decisions match the current filter.' : 'Loading…')), filtered.map(h => {
    const reasonShort = h.skip_reason || h.scenario || (h.reasoning ? String(h.reasoning).slice(0, 40) + '…' : '—');
    return /*#__PURE__*/React.createElement("tr", {
      key: h.decision_id,
      style: {
        borderBottom: '1px solid #F5F6FA'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, h.ts || '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: `/assets/tokens/${h.coin.toLowerCase()}.svg`,
      width: "20",
      height: "20",
      onError: e => e.target.style.display = 'none'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, h.sym))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        background: h.side === 'LONG' ? '#ECFDF5' : '#FEF2F2',
        color: h.side === 'LONG' ? '#047857' : '#B91C1C'
      }
    }, h.side)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, (h.score * 100).toFixed(0)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        background: h.verdict === 'APPROVED' ? '#ECFDF5' : '#FEF2F2',
        color: h.verdict === 'APPROVED' ? '#047857' : '#B91C1C',
        letterSpacing: '.04em'
      }
    }, h.verdict)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontSize: 11,
        color: '#4B5563',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, h.outcome), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace',
        maxWidth: 220,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      title: h.reasoning
    }, reasonShort), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        fontWeight: 700,
        color: h.pnl > 0 ? '#059669' : h.pnl < 0 ? '#DC2626' : '#9CA3AF'
      }
    }, h.pnl > 0 ? '+' : '', Number(h.pnl).toFixed(2), h.pnl !== 0 ? '%' : ''));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Approval rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2,
      marginBottom: 14
    }
  }, filtered.length, " decisions in ", range, " ", vfilter !== 'All' ? `(${vfilter})` : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 800,
      color: '#0F172A',
      fontVariantNumeric: 'tabular-nums'
    }
  }, approvalPct.toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      height: 6,
      background: '#F1F3F8',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${approvalPct}%`,
      height: '100%',
      background: 'linear-gradient(90deg,#10B981,#34D399)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", null, fApproved, " approved"), /*#__PURE__*/React.createElement("span", null, filtered.length - fApproved, " rejected"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Fill rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2,
      marginBottom: 14
    }
  }, "Approved \u2192 filled"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 800,
      color: '#0F172A',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fillPct.toFixed(0), "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      height: 6,
      background: '#F1F3F8',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${fillPct}%`,
      height: '100%',
      background: 'linear-gradient(90deg,#6366F1,#8B5CF6)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", null, fFilled, " filled"), /*#__PURE__*/React.createElement("span", null, fApproved - fFilled, " unfilled")))));
};
const SettingsPanel = () => {
  const [cosineMin, setCosineMin] = useState(0.65);
  const [commitMin, setCommitMin] = useState(0.60);
  const [autoApprove, setAutoApprove] = useState(0.80);
  const [autoMode, setAutoMode] = useState(true);
  const [tiers, setTiers] = useState({
    FAIR_C_MOMENTUM: true,
    'phase 8': true,
    BREAKOUT: true,
    'phase 3': true,
    'phase 6': true,
    'phase 4': false,
    'phase 7': false
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 360px',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Gate thresholds"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 2
    }
  }, "Reject any signal below the minimum component scores.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost"
  }, "Reset"), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    icon: "check"
  }, "Save changes"))), /*#__PURE__*/React.createElement(SettingRow, {
    label: "Min Cosine",
    hint: "Lowest cosine similarity allowed for entry.",
    valueLabel: cosineMin.toFixed(2)
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "1",
    step: "0.01",
    value: cosineMin,
    onChange: e => setCosineMin(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#6366F1'
    }
  })), /*#__PURE__*/React.createElement(SettingRow, {
    label: "Min Commitment",
    hint: "Minimum directional commitment required.",
    valueLabel: commitMin.toFixed(2)
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "1",
    step: "0.01",
    value: commitMin,
    onChange: e => setCommitMin(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#6366F1'
    }
  })), /*#__PURE__*/React.createElement(SettingRow, {
    label: "Auto-approve at",
    hint: "Composite score above which signals execute without manual review.",
    valueLabel: autoApprove.toFixed(2)
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.5",
    max: "1",
    step: "0.01",
    value: autoApprove,
    onChange: e => setAutoApprove(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#6366F1'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A',
      marginBottom: 4
    }
  }, "Tier eligibility"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginBottom: 14
    }
  }, "Allow entries only from these phase tiers."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 10
    }
  }, Object.entries(tiers).map(([k, v]) => /*#__PURE__*/React.createElement("label", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      border: `1px solid ${v ? '#C7D2FE' : '#E5E7EB'}`,
      background: v ? '#F5F6FF' : '#fff',
      borderRadius: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: v,
    onChange: () => setTiers({
      ...tiers,
      [k]: !v
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, k.replace(/_/g, ' '))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,#0B1020,#1A1F3A)',
      color: '#E5E7EB',
      borderRadius: 16,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.14em',
      color: '#A5B4FC'
    }
  }, "EXECUTION MODE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    on: autoMode,
    onChange: () => setAutoMode(!autoMode)
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: '#fff'
    }
  }, autoMode ? 'Auto-execute' : 'Manual approval only'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,.6)',
      marginTop: 2
    }
  }, autoMode ? `Score ≥ ${autoApprove.toFixed(2)} fires immediately` : 'Every entry needs human click')))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A',
      marginBottom: 12
    }
  }, "Risk caps"), /*#__PURE__*/React.createElement(CapRow, {
    label: "Max open per coin",
    value: "2"
  }), /*#__PURE__*/React.createElement(CapRow, {
    label: "Max concurrent entries",
    value: "6"
  }), /*#__PURE__*/React.createElement(CapRow, {
    label: "Daily loss kill-switch",
    value: "\u22125%"
  }), /*#__PURE__*/React.createElement(CapRow, {
    label: "Min R:R required",
    value: "1.20"
  }))));
};
const SettingRow = ({
  label,
  hint,
  valueLabel,
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: '16px 0',
    borderTop: '1px solid #F1F3F8'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A'
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  }
}, hint)), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 14,
    fontWeight: 700,
    color: '#6366F1',
    fontFamily: 'JetBrains Mono, monospace'
  }
}, valueLabel)), children);
const Toggle = ({
  on,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onChange,
  style: {
    width: 38,
    height: 22,
    borderRadius: 999,
    background: on ? '#6366F1' : '#E5E7EB',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 120ms',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: 2,
    left: on ? 18 : 2,
    width: 18,
    height: 18,
    borderRadius: 999,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    transition: 'left 120ms'
  }
}));
const CapRow = ({
  label,
  value
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #F5F6FA'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: '#4B5563'
  }
}, label), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A'
  }
}, value));

/* ---------- SCREEN ---------- */

const EntryGateScreen = () => {
  const [tab, setTab] = useState('Live Scanner');
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(SCANNER[0].id);
  const {
    rows: liveScanner,
    todayCounts,
    kpiHistory,
    kpiDelta
  } = useLiveScanner(2000);
  const liveSelected = useMemo(() => liveScanner.find(x => x.id === selectedId) || liveScanner[0], [liveScanner, selectedId]);
  const setSelected = s => setSelectedId(s.id);
  const passCount = liveScanner.filter(s => s.verdict === 'PASS').length;
  const watchCount = liveScanner.filter(s => s.verdict === 'WATCH').length;
  const rejectCount = liveScanner.filter(s => s.verdict === 'REJECT').length;
  const scanningCount = liveScanner.length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      background: '#F5F6FA',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Scanning",
    value: scanningCount.toString(),
    sub: `${todayCounts.scanning} scanned today`,
    delta: kpiDelta.scanning,
    icon: "radar",
    color: "#3B82F6",
    spark: kpiHistory.scanning
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Watch",
    value: watchCount.toString(),
    sub: `${todayCounts.watch} watch today`,
    delta: kpiDelta.watch,
    icon: "hourglass",
    color: "#F59E0B",
    spark: kpiHistory.watch
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Pass",
    value: passCount.toString(),
    sub: `${todayCounts.pass} pass today`,
    delta: kpiDelta.pass,
    icon: "check-circle",
    color: "#10B981",
    spark: kpiHistory.pass
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Reject",
    value: rejectCount.toString(),
    sub: `${todayCounts.reject} reject today`,
    delta: kpiDelta.reject,
    icon: "x-circle",
    color: "#EF4444",
    spark: kpiHistory.reject
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 18,
      padding: 16,
      border: '1px solid #EEF0F4'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: ['Live Scanner', 'Pending Entries', 'Entry History', 'Gate Settings'],
    active: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: '#10B981',
      animation: 'cxg-pulse 1.4s infinite'
    }
  }), "Live \xB7 ", new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }))), tab === 'Live Scanner' && /*#__PURE__*/React.createElement(LiveScannerPanel, {
    scanner: liveScanner,
    selected: liveSelected,
    setSelected: setSelected,
    filter: filter,
    setFilter: setFilter
  }), tab === 'Pending Entries' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || PendingPanel, null), tab === 'Entry History' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || HistoryPanel, null), tab === 'Gate Settings' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || SettingsPanel, null)));
};
window.EntryGateScreen = EntryGateScreen;