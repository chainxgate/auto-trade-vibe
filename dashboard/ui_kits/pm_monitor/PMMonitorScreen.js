/* ChainxGate — P.M Monitor (modern redesign) */
const {
  useState,
  useEffect,
  useRef,
  useMemo
} = React;

/* ---------- DATA ---------- */

const SIGNALS = [{
  id: 's01',
  sym: 'SOL/USDT',
  tk: 'sol',
  ts: '09:25:14',
  age: '2m',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 95.9908,
  last: 96.5384,
  target: 97.1273,
  stop: 93.7521,
  pct: 0.57,
  usd: 2.86,
  tier: 'FAIR_C_MOMENTUM',
  next: 'phase 8',
  spark: [12, 13, 14, 12, 15, 17, 16, 18, 20, 19, 22, 24, 23, 25]
}, {
  id: 's02',
  sym: 'ETH/USDT',
  tk: 'eth',
  ts: '09:25:02',
  age: '2m',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 2770.11,
  last: 2773.99,
  target: 2833.84,
  stop: 2710.45,
  pct: 0.14,
  usd: 0.69,
  tier: 'phase 3',
  next: 'phase 3',
  spark: [22, 21, 20, 22, 23, 22, 24, 23, 24, 25, 24, 25, 26, 26]
}, {
  id: 's03',
  sym: 'ARB/USDT',
  tk: 'arb',
  ts: '08:08:45',
  age: '1h',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 0.3129,
  last: 0.3103,
  target: 0.3180,
  stop: 0.3011,
  pct: -0.84,
  usd: -4.21,
  tier: 'phase 4',
  next: 'phase 4',
  spark: [18, 19, 18, 17, 16, 17, 16, 15, 16, 15, 14, 14, 13, 14]
}, {
  id: 's04',
  sym: 'LINK/USDT',
  tk: 'link',
  ts: '06:35:11',
  age: '3h',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 9.5895,
  last: 9.6107,
  target: 9.7421,
  stop: 9.3488,
  pct: 0.22,
  usd: 1.09,
  tier: 'FAIR_C_MOMENTUM',
  next: 'phase 8',
  spark: [15, 14, 15, 16, 17, 16, 17, 18, 17, 18, 19, 18, 19, 20]
}, {
  id: 's05',
  sym: 'AVAX/USDT',
  tk: 'avax',
  ts: '09:06:22',
  age: '20m',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 21.1878,
  last: 21.2322,
  target: 21.6412,
  stop: 20.5502,
  pct: 0.21,
  usd: 1.04,
  tier: 'FAIR_C_MOMENTUM',
  next: 'phase 8',
  spark: [10, 11, 12, 11, 12, 13, 14, 15, 14, 15, 16, 15, 16, 17]
}, {
  id: 's06',
  sym: 'BNB/USDT',
  tk: 'bnb',
  ts: '07:30:07',
  age: '2h',
  side: 'SHORT',
  hold: 'TOHOLD',
  entry: 615.80,
  last: 614.69,
  target: 587.22,
  stop: 621.45,
  pct: -0.18,
  usd: -0.89,
  tier: 'phase 6',
  next: 'phase 6',
  spark: [20, 21, 22, 21, 22, 23, 22, 23, 22, 23, 24, 23, 22, 23]
}, {
  id: 's07',
  sym: 'ARB/USDT',
  tk: 'arb',
  ts: '06:25:55',
  age: '3h',
  side: 'SHORT',
  hold: 'TOHOLD',
  entry: 0.3127,
  last: 0.3045,
  target: 0.3004,
  stop: 0.3198,
  pct: -2.61,
  usd: -13.03,
  tier: 'phase 7',
  next: 'phase 7',
  spark: [25, 24, 22, 21, 22, 21, 20, 18, 17, 16, 15, 14, 13, 12]
}, {
  id: 's08',
  sym: 'LINK/USDT',
  tk: 'link',
  ts: '06:18:30',
  age: '3h',
  side: 'SHORT',
  hold: 'TOHOLD',
  entry: 9.8228,
  last: 9.6587,
  target: 9.4398,
  stop: 9.9754,
  pct: -1.67,
  usd: -8.36,
  tier: 'phase 7',
  next: 'phase 7',
  spark: [22, 21, 20, 19, 18, 18, 17, 16, 17, 16, 15, 14, 15, 14]
}, {
  id: 's09',
  sym: 'AVAX/USDT',
  tk: 'avax',
  ts: '06:18:12',
  age: '3h',
  side: 'SHORT',
  hold: 'TOHOLD',
  entry: 21.5795,
  last: 21.2191,
  target: 20.9801,
  stop: 21.8012,
  pct: -1.67,
  usd: -8.36,
  tier: 'phase 7',
  next: 'phase 7',
  spark: [20, 19, 20, 18, 17, 16, 15, 14, 15, 14, 13, 12, 13, 12]
}, {
  id: 's10',
  sym: 'SOL/USDT',
  tk: 'sol',
  ts: '06:18:02',
  age: '3h',
  side: 'SHORT',
  hold: 'TOHOLD',
  entry: 95.3365,
  last: 94.0777,
  target: 93.1401,
  stop: 96.2014,
  pct: -1.32,
  usd: -6.61,
  tier: 'phase 3',
  next: 'phase 3',
  spark: [22, 23, 22, 21, 22, 20, 19, 18, 19, 18, 17, 17, 16, 16]
}, {
  id: 's11',
  sym: 'XMR/USDT',
  tk: 'xmr',
  ts: '05:41:00',
  age: '4h',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 154.22,
  last: 155.70,
  target: 158.10,
  stop: 150.92,
  pct: 0.96,
  usd: 4.82,
  tier: 'BREAKOUT',
  next: 'BREAKOUT',
  spark: [10, 11, 11, 12, 13, 12, 14, 15, 16, 17, 18, 19, 20, 21]
}, {
  id: 's12',
  sym: 'ETH/USDT',
  tk: 'eth',
  ts: '05:20:18',
  age: '4h',
  side: 'LONG',
  hold: 'TOHOLD',
  entry: 2761.04,
  last: 2789.22,
  target: 2820.11,
  stop: 2729.10,
  pct: 1.02,
  usd: 5.10,
  tier: 'BREAKOUT',
  next: 'BREAKOUT',
  spark: [12, 13, 14, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
}];
const TICKER = [{
  s: 'BTC',
  p: 68_421.5,
  d: 0.42
}, {
  s: 'ETH',
  p: 2_773.99,
  d: 0.14
}, {
  s: 'SOL',
  p: 96.53,
  d: 0.57
}, {
  s: 'BNB',
  p: 614.69,
  d: -0.18
}, {
  s: 'XMR',
  p: 155.70,
  d: 0.96
}, {
  s: 'AVAX',
  p: 21.23,
  d: 0.21
}, {
  s: 'LINK',
  p: 9.61,
  d: 0.22
}, {
  s: 'ARB',
  p: 0.3103,
  d: -0.84
}];
const HISTORY = [{
  ts: '2026/04/20 05:12',
  sym: 'ETH/USDT',
  side: 'LONG',
  entry: 2748.91,
  exit: 2789.22,
  pct: 1.47,
  usd: 40.31,
  duration: '12m',
  outcome: 'target'
}, {
  ts: '2026/04/20 04:48',
  sym: 'SOL/USDT',
  side: 'LONG',
  entry: 95.12,
  exit: 96.41,
  pct: 1.36,
  usd: 12.89,
  duration: '7m',
  outcome: 'target'
}, {
  ts: '2026/04/20 04:20',
  sym: 'LINK/USDT',
  side: 'SHORT',
  entry: 9.91,
  exit: 9.62,
  pct: 2.93,
  usd: 29.13,
  duration: '22m',
  outcome: 'target'
}, {
  ts: '2026/04/20 03:55',
  sym: 'BNB/USDT',
  side: 'LONG',
  entry: 612.20,
  exit: 616.01,
  pct: 0.62,
  usd: 3.81,
  duration: '4m',
  outcome: 'target'
}, {
  ts: '2026/04/20 03:15',
  sym: 'ARB/USDT',
  side: 'LONG',
  entry: 0.3155,
  exit: 0.3088,
  pct: -2.12,
  usd: -6.67,
  duration: '1h 08m',
  outcome: 'stop'
}, {
  ts: '2026/04/20 02:40',
  sym: 'AVAX/USDT',
  side: 'LONG',
  entry: 20.94,
  exit: 21.21,
  pct: 1.29,
  usd: 2.70,
  duration: '18m',
  outcome: 'target'
}, {
  ts: '2026/04/20 02:10',
  sym: 'XMR/USDT',
  side: 'LONG',
  entry: 153.10,
  exit: 155.20,
  pct: 1.37,
  usd: 21.00,
  duration: '31m',
  outcome: 'target'
}, {
  ts: '2026/04/20 01:42',
  sym: 'SOL/USDT',
  side: 'SHORT',
  entry: 96.80,
  exit: 95.01,
  pct: 1.85,
  usd: 17.90,
  duration: '14m',
  outcome: 'target'
}];

/* ---------- API CLIENT (live polling — swap setInterval to WebSocket later) ---------- */

const API_BASE = ''; // same-origin (Flask serves dist/)

/* All time displays normalized to GMT+7 (Asia/Bangkok), regardless of browser timezone. */
const TZ_GMT7 = 'Asia/Bangkok';

// Parse server timestamp. If it has explicit TZ marker (Z or ±HH:MM) trust it.
// Otherwise assume server already produces GMT+7 wall-clock time (server uses _to_gmt7).
const parseToDate = s => {
  if (!s) return null;
  if (s instanceof Date) return isNaN(s.getTime()) ? null : s;
  const str = String(s).trim();
  const hasTz = /([Zz]|[+\-]\d{2}:?\d{2})$/.test(str);
  const iso = str.includes('T') ? str : str.replace(' ', 'T');
  const d = new Date(hasTz ? iso : iso + '+07:00');
  return isNaN(d.getTime()) ? null : d;
};
const fmtAge = iso => {
  const d = parseToDate(iso);
  if (!d) return '';
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
};

// HH:MM:SS rendered in GMT+7
const fmtTs = iso => {
  const d = parseToDate(iso);
  if (!d) return '';
  return d.toLocaleTimeString('en-GB', {
    timeZone: TZ_GMT7,
    hour12: false
  });
};

// Full date+time in GMT+7, e.g. "2026-04-20 15:46:00"
const fmtDateTime = (iso, withSeconds = true) => {
  const d = parseToDate(iso);
  if (!d) return iso || '';
  return d.toLocaleString('en-GB', {
    timeZone: TZ_GMT7,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? {
      second: '2-digit'
    } : {}),
    hour12: false
  }).replace(',', '').replace(/\//g, '-');
};

// Expose to globals so Tracking.jsx (loaded after this file) can reuse without re-defining
window.cxgFmt = {
  parseToDate,
  fmtAge,
  fmtTs,
  fmtDateTime,
  TZ_GMT7
};

// Map server position → UI signal shape used everywhere downstream
const transformPosition = (p, idx) => {
  const tk = (p.symbol || '').toLowerCase();
  const entry = Number(p.entry_price) || 0;
  const last = Number(p.live_price) || 0;
  const side = p.direction || 'LONG';
  const sizeUsd = Number(p.position_usd) || Number(p.leveraged_usd) || 100;
  // Recompute pnl from entry+last+side so pct + usd stay consistent.
  // Server's pnl_pct / pnl_live can lag (only refreshed at Engine cycle, ~1min)
  // while live_price is fresher (tick worker updates ~5s). Trusting server
  // pnl_pct showed +0.00% with USD -$3.30 (mismatch) — recompute fixes it.
  let pctFresh = 0;
  if (entry > 0 && last > 0) {
    pctFresh = side === 'LONG' ? (last - entry) / entry * 100 : (entry - last) / entry * 100;
  }
  const usdFresh = pctFresh / 100 * sizeUsd;
  return {
    id: p.pair_key || `s${String(idx + 1).padStart(2, '0')}`,
    pair_key: p.pair_key || '',
    direction: side,
    sym: `${(p.symbol || '').toUpperCase()}/USDT`,
    tk,
    side,
    hold: p.action || 'TOHOLD',
    ts: fmtTs(p.opened_at),
    age: fmtAge(p.opened_at),
    entry,
    last,
    target: Number(p.take_profit) || 0,
    stop: Number(p.stop_loss) || 0,
    pct: +pctFresh.toFixed(2),
    usd: +usdFresh.toFixed(2),
    tier: (p.phase || p.stage || 'UNKNOWN').toUpperCase(),
    prev: (p.prev_phase || p.phase || '').toUpperCase(),
    next: (p.phase || p.stage || 'UNKNOWN').toUpperCase(),
    // mirror current per spec
    spark: Array.isArray(p.spark) && p.spark.length ? p.spark : [],
    // server may add later
    // pass-through for downstream
    stage: p.stage || '',
    bar_i: p.bar_i || 0,
    tp_progress: p.tp_progress || 0,
    sl_progress: p.sl_progress || 0,
    position_usd: Number(p.position_usd) || 0
  };
};
const useApiSignals = (rate = 2000) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    let alive = true;
    const fetchOnce = async () => {
      try {
        const r = await fetch(`./data/positions.json`);
        const j = await r.json();
        if (!alive) return;
        const list = (j.positions || []).map(transformPosition);
        setData(list);
      } catch (e) {/* keep old data on transient errors */}
    };
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    // Browsers throttle setInterval to ≥1/min when tab is hidden. Force an
    // immediate refresh when tab becomes visible / window regains focus so
    // stale data doesn't linger.
    const onVisible = () => {
      if (!document.hidden) fetchOnce();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', fetchOnce);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', fetchOnce);
    };
  }, [rate]);
  return data;
};

// Keep a rolling spark buffer client-side for KPI cards (server returns scalar values).
// Active Position = currently OPEN (from open_count).
// Win rate, Realized PnL use ALL-TIME aggregate stats. Unrealized = sum over open positions.
const useApiKpis = (signals, rate = 2500) => {
  const [k, setK] = useState({
    active: {
      value: 0,
      sub: '',
      spark: []
    },
    win: {
      value: 0,
      sub: '',
      spark: []
    },
    realized: {
      value: 0,
      sub: 'All-time realized',
      spark: []
    },
    unrealized: {
      value: 0,
      sub: '',
      spark: []
    }
  });
  useEffect(() => {
    let alive = true;
    const fetchOnce = async () => {
      try {
        const r = await fetch(`./data/kpi.json`);
        const j = await r.json();
        if (!alive) return;
        const all = j.all || {};
        const today = j.today || {};
        const open = j.open_count ?? 0;
        const wr = all.wr ?? 0; // ← all-time win rate
        const realized = all.pnl_usd ?? 0; // ← all-time realized PnL
        // Unrealized: prefer server field if exists, else derive from current signals
        let unreal = j.unrealized_usd;
        if (unreal == null) {
          unreal = (signalsRef.current || []).reduce((a, s) => a + (s.usd || 0), 0);
        }
        unreal = +Number(unreal).toFixed(2);
        // Dynamic sub texts
        const todayClosed = today.count ?? 0;
        const allWins = all.wins ?? 0,
          allLosses = all.losses ?? 0;
        setK(prev => ({
          active: {
            value: open,
            sub: `+${todayClosed} closed today`,
            spark: pushSpark(prev.active.spark, open)
          },
          win: {
            value: wr,
            sub: `${allWins} wins / ${allLosses} losses`,
            spark: pushSpark(prev.win.spark, wr)
          },
          realized: {
            value: realized,
            sub: `All-time · ${all.count ?? 0} closed`,
            spark: pushSpark(prev.realized.spark, realized)
          },
          unrealized: {
            value: unreal,
            sub: `${open} open positions`,
            spark: pushSpark(prev.unrealized.spark, unreal)
          }
        }));
      } catch (e) {}
    };
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    const onVisible = () => {
      if (!document.hidden) fetchOnce();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', fetchOnce);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', fetchOnce);
    };
  }, [rate]);

  // Seed spark from history, bucketed by DAY so each point = that day's P&L and WR.
  // Shows actual rise/fall between days (not monotonic cumulative).
  useEffect(() => {
    let alive = true;
    fetch(`./data/history.json`).then(r => r.ok ? r.json() : {
      trades: []
    }).then(j => {
      if (!alive) return;
      const trades = j.trades || [];
      if (trades.length < 2) return;
      // Bucket by day (time format from server: "YYYY/MM/DD HH:MM:SS" or "MM-DD HH:MM")
      // Extract day portion: first 10 chars usually enough
      const byDay = new Map();
      for (const t of trades) {
        const day = String(t.time || '').slice(0, 10);
        if (!day) continue;
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day).push(t);
      }
      // Sort days ascending (oldest first), take last 12
      const days = Array.from(byDay.keys()).sort();
      const recent = days.slice(-12);
      if (recent.length < 2) return;
      const dailyPnl = recent.map(d => {
        const dayTrades = byDay.get(d) || [];
        return +dayTrades.reduce((a, t) => a + (Number(t.pnl_usd) || 0), 0).toFixed(2);
      });
      const dailyWR = recent.map(d => {
        const dayTrades = byDay.get(d) || [];
        const wins = dayTrades.filter(t => Number(t.pnl_pct) > 0).length;
        return dayTrades.length ? +(wins / dayTrades.length * 100).toFixed(1) : 0;
      });
      // Active Position proxy: number of trades closed per day (activity volume).
      // Static per day — only changes when a new day starts. Today's tail point
      // will be appended via live pushSpark with `open_count`.
      const dailyActive = recent.map(d => (byDay.get(d) || []).length);
      setK(prev => ({
        ...prev,
        active: {
          ...prev.active,
          spark: dailyActive
        },
        realized: {
          ...prev.realized,
          spark: dailyPnl
        },
        win: {
          ...prev.win,
          spark: dailyWR
        }
      }));
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Keep latest signals in a ref so unrealized fallback uses fresh data without re-subscribing
  const signalsRef = React.useRef(signals);
  useEffect(() => {
    signalsRef.current = signals;
  }, [signals]);
  return k;
};
const pushSpark = (arr, v, max = 12) => {
  const n = Number(v) || 0;
  // Seed with 2 identical points on first push so sparkline has something to draw.
  if (arr.length === 0) return [n, n];
  // De-dupe: if value hasn't changed since last point, don't append.
  // Prevents all-time cumulative metrics (which rarely change) from washing
  // out the historical seeded buckets into a flat line.
  if (arr[arr.length - 1] === n) return arr;
  const next = [...arr, n];
  return next.length > max ? next.slice(-max) : next;
};

// Simple delta from first→last point of spark buffer (percentage change vs baseline)
const sparkDelta = spark => {
  if (!Array.isArray(spark) || spark.length < 2) return null;
  const first = spark[0],
    last = spark[spark.length - 1];
  if (first === last) return 0;
  if (first === 0) return last > 0 ? 100 : -100;
  return (last - first) / Math.abs(first) * 100;
};

// History — fetch once + refresh on tab visit (no need to poll fast)
const useApiHistory = (rate = 15000) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    let alive = true;
    const fetchOnce = async () => {
      try {
        const r = await fetch(`./data/history.json`);
        const j = await r.json();
        if (!alive) return;
        const trades = (j.trades || []).map(t => ({
          ts: fmtDateTime(t.time, false),
          // GMT+7 display
          sym: t.pair || '',
          side: t.direction || '',
          entry: Number(t.entry) || 0,
          exit: Number(t.exit) || 0,
          pct: Number(t.pnl_pct) || 0,
          usd: Number(t.pnl_usd) || 0,
          duration: t.hold || '',
          // outcome derived from pnl sign per spec (TP hit ≈ positive, SL hit ≈ negative)
          outcome: (Number(t.pnl_pct) || 0) >= 0 ? 'target' : 'stop',
          stage: t.stage || '',
          source: t.source || '',
          pair_key: t.pair_key || ''
        }));
        setData(trades);
      } catch (e) {}
    };
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    const onVisible = () => {
      if (!document.hidden) fetchOnce();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', fetchOnce);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', fetchOnce);
    };
  }, [rate]);
  return data;
};

/* ---------- VISUALS ---------- */

const Spark = ({
  data,
  color = '#6366F1',
  h = 36,
  w = 120,
  fill
}) => {
  // Guard: need ≥2 points; otherwise render a flat baseline so layout is preserved.
  if (!Array.isArray(data) || data.length < 2) {
    return /*#__PURE__*/React.createElement("svg", {
      width: w,
      height: h,
      style: {
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: h - 2,
      x2: w,
      y2: h - 2,
      stroke: "#E5E7EB",
      strokeWidth: "1",
      strokeDasharray: "3 3"
    }));
  }
  const min = Math.min(...data),
    max = Math.max(...data);
  const r = max - min || 1;
  const pts = data.map((v, i) => `${i / (data.length - 1) * w},${h - (v - min) / r * (h - 4) - 2}`);
  const path = 'M' + pts.join(' L');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1].split(',');
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
    cx: last[0],
    cy: last[1],
    r: "2.2",
    fill: color
  }));
};
const ProgressBar = ({
  entry,
  last,
  target,
  stop,
  side
}) => {
  // Map position between stop and target with `last` and `entry` marked.
  const lo = Math.min(target, stop, entry, last);
  const hi = Math.max(target, stop, entry, last);
  const range = hi - lo || 1;
  const pos = v => (v - lo) / range * 100;
  const long = side === 'LONG';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 6,
      background: '#F1F3F8',
      borderRadius: 999,
      margin: '14px 0 22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${pos(Math.min(target, stop))}%`,
      right: `${100 - pos(Math.max(target, stop))}%`,
      top: 0,
      bottom: 0,
      background: long ? 'linear-gradient(90deg,#FECACA,#A7F3D0)' : 'linear-gradient(90deg,#A7F3D0,#FECACA)',
      borderRadius: 999
    }
  }), /*#__PURE__*/React.createElement(Tick, {
    x: pos(entry),
    color: "#9CA3AF",
    label: "Entry",
    value: entry
  }), /*#__PURE__*/React.createElement(Tick, {
    x: pos(last),
    color: "#0F172A",
    label: "Last",
    value: last,
    bold: true
  }), /*#__PURE__*/React.createElement(EndLabel, {
    x: pos(stop),
    color: "#DC2626",
    text: `Stop ${stop}`,
    align: stop < target ? 'left' : 'right'
  }), /*#__PURE__*/React.createElement(EndLabel, {
    x: pos(target),
    color: "#059669",
    text: `Target ${target}`,
    align: target > stop ? 'right' : 'left'
  }));
};
const Tick = ({
  x,
  color,
  label,
  value,
  bold
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: `${x}%`,
    top: -4,
    transform: 'translateX(-50%)'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 2,
    height: 14,
    background: color,
    borderRadius: 1
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 9,
    color,
    whiteSpace: 'nowrap',
    fontWeight: bold ? 700 : 500,
    fontFamily: 'JetBrains Mono, monospace'
  }
}, label, " ", value));
const EndLabel = ({
  x,
  color,
  text,
  align
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: `${x}%`,
    top: -18,
    transform: align === 'right' ? 'translateX(0)' : 'translateX(-100%)',
    fontSize: 9,
    color,
    fontWeight: 700,
    letterSpacing: '.04em',
    whiteSpace: 'nowrap'
  }
}, text);
const Donut = ({
  size = 120,
  segments
}) => {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, b) => a + b.v, 0);
  let off = 0;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "#F1F3F8",
    strokeWidth: "14"
  }), segments.map((s, i) => {
    const len = s.v / total * c;
    const dash = `${len} ${c - len}`;
    const el = /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      stroke: s.c,
      strokeWidth: "14",
      strokeDasharray: dash,
      strokeDashoffset: -off,
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
      strokeLinecap: "butt"
    });
    off += len;
    return el;
  }));
};

/* ---------- HEADER STRIP (ticker + live status) ---------- */

const Ticker = () => /*#__PURE__*/React.createElement("div", {
  style: {
    background: 'linear-gradient(90deg,#0B1020 0%, #1A1F3A 100%)',
    color: '#E5E7EB',
    borderRadius: 14,
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    overflow: 'hidden',
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.14em',
    color: '#A5B4FC',
    whiteSpace: 'nowrap'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: '#10B981',
    boxShadow: '0 0 0 4px rgba(16,185,129,.2)',
    animation: 'cxg-pulse 1.4s infinite'
  }
}), "LIVE \xB7 BINANCE"), /*#__PURE__*/React.createElement("div", {
  style: {
    height: 18,
    width: 1,
    background: 'rgba(255,255,255,.1)'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 22,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  }
}, TICKER.map(t => /*#__PURE__*/React.createElement("div", {
  key: t.s,
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: '#A5B4FC',
    fontWeight: 600
  }
}, t.s), /*#__PURE__*/React.createElement("span", {
  style: {
    color: '#fff',
    fontWeight: 600
  }
}, t.p.toLocaleString(undefined, {
  minimumFractionDigits: t.p < 10 ? 4 : 2
})), /*#__PURE__*/React.createElement("span", {
  style: {
    color: t.d >= 0 ? '#34D399' : '#F87171',
    fontWeight: 600
  }
}, t.d >= 0 ? '+' : '', t.d.toFixed(2), "%")))));

/* ---------- KPI STRIP ---------- */

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

/* ---------- SIGNAL LIST ROW (left column) ---------- */

const SignalRow = ({
  s,
  active,
  onClick
}) => {
  const up = s.pct >= 0;
  const long = s.side === 'LONG';
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
  }, s.side)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      marginTop: 2
    }
  }, s.ts, " \xB7 ", s.tier.replace(/_/g, ' '))), /*#__PURE__*/React.createElement(Spark, {
    data: s.spark,
    color: up ? '#10B981' : '#EF4444',
    w: 56,
    h: 28,
    fill: up ? '#10B981' : '#EF4444'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: s.pct.toFixed(2),
    className: "cxg-tick",
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: up ? '#059669' : '#DC2626'
    }
  }, up ? '+' : '', s.pct.toFixed(2), "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      marginTop: 2
    }
  }, up ? '+' : '−', "$", Math.abs(s.usd).toFixed(2))));
};

/* ---------- HERO INLINE STAT TILES (compact 4-tile strip) ---------- */

const HeroStatTiles = ({
  s,
  detail
}) => {
  const long = s.side === 'LONG';
  const phaseColor = {
    FAIR_C_MOMENTUM: '#6366F1',
    'phase 8': '#8B5CF6',
    'phase 3': '#F59E0B',
    'phase 4': '#9CA3AF',
    'phase 6': '#14B8A6',
    BREAKOUT: '#10B981',
    'phase 7': '#EF4444'
  }[s.tier] || '#6366F1';
  // Real MFE/MAE from server detail (fractions → ×100); fallback to s.pct sign-only
  const mfe = detail && detail.mfe_so_far != null ? Number(detail.mfe_so_far) * 100 : Math.max(0, Number(s.pct) || 0);
  const maeN = detail && detail.mae_so_far != null ? Number(detail.mae_so_far) * 100 : Math.min(0, Number(s.pct) || 0);
  const maeVal = maeN.toFixed(2);
  const rr = (Math.abs(mfe) / Math.max(Math.abs(maeN), 0.01)).toFixed(2);
  const prevPhase = (s.prev || s.tier || '').replace(/_/g, ' ');
  const currPhase = (s.tier || '').replace(/_/g, ' ');
  // Real action / candle / stage from signal (filled by transformPosition)
  const actionTxt = detail && detail.action || s.hold || 'HOLD';
  const tPlus = `T${detail && detail.bar_i != null ? detail.bar_i : s.bar_i ?? 0}`;
  const stageTxt = (detail && detail.tier || s.stage || s.tier || '').toUpperCase().replace(/_/g, ' ');
  // Peak from server: prefer detail.peak (parsed from reason); else fall back to mfe
  const peakPct = detail && detail.peak && detail.peak.value != null ? Number(detail.peak.value) * 100 : mfe;
  const peakAt = detail && detail.peak && detail.peak.bar_i != null ? `@T${detail.peak.bar_i}` : '';
  const peakAvg = detail && detail.peak && detail.peak.avg != null ? `${(Number(detail.peak.avg) * 100).toFixed(1)}%` : '—';
  const peakN = detail && detail.peak && detail.peak.n != null ? detail.peak.n : '—';
  // Phase tile — full style swap:
  //   big slot shows CURRENT (prominent: phaseColor + bold 800)
  //   small slot shows "from PREV" (subtle: plain gray + mono small)
  const phaseValue = /*#__PURE__*/React.createElement("span", {
    style: {
      color: phaseColor,
      fontWeight: 800
    }
  }, currPhase);
  const phaseSub = /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      color: '#9CA3AF'
    }
  }, "from ", prevPhase || '—');
  const tiles = [{
    label: 'Action',
    value: actionTxt,
    color: '#0F172A',
    sub: `${tPlus} · ${stageTxt || '—'}`
  }, {
    label: 'Phase',
    value: phaseValue,
    color: phaseColor,
    sub: phaseSub
  }, {
    label: 'Peak',
    value: `${peakPct.toFixed(2)}%${peakAt ? ' ' + peakAt : ''}`,
    color: long ? '#059669' : '#DC2626',
    sub: `avg ${peakAvg} · n=${peakN}`
  }, {
    label: 'MFE/MAE',
    value: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#059669'
      }
    }, mfe >= 0 ? '+' : '', mfe.toFixed(2), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF'
      }
    }, " / "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#DC2626'
      }
    }, maeVal, "%")),
    color: '#0F172A',
    sub: `RR ${rr}`
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      gap: 8,
      padding: '0 16px',
      minWidth: 0
    }
  }, tiles.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.label,
    style: {
      flex: 1,
      minWidth: 0,
      textAlign: 'center',
      borderLeft: i === 0 ? 'none' : '1px solid #F1F3F8',
      padding: '2px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: '#9CA3AF',
      letterSpacing: '.08em',
      textTransform: 'uppercase'
    }
  }, t.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: t.color,
      marginTop: 3,
      fontFamily: typeof t.value === 'string' && /[\d@%]/.test(t.value) ? 'JetBrains Mono, monospace' : 'inherit',
      letterSpacing: '-.01em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, t.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      fontFamily: 'JetBrains Mono, monospace',
      color: '#6B7280',
      marginTop: 2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, t.sub))));
};

/* ---------- FOCUS PANE (right column) ---------- */

const DetailPane = ({
  s
}) => {
  if (!s) return null;
  // Pull live engine detail once at this level so HeroStatTiles + (later) PriceRail can share it.
  // Falls back gracefully if window.useApiDetail isn't available yet (Tracking.jsx not loaded).
  const detail = typeof window.useApiDetail === 'function' ? window.useApiDetail(s.pair_key, s.direction, 2000) : null;
  const up = s.pct >= 0;
  const long = s.side === 'LONG';
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
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: '#F5F6FA',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${s.tk}.svg`,
    width: "30",
    height: "30"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
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
  }), s.side), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 6,
      background: '#EEF0FF',
      color: '#4338CA',
      letterSpacing: '.06em'
    }
  }, s.hold)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      marginTop: 4,
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Opened ", s.ts, " \xB7 ", s.age, " ago"), /*#__PURE__*/React.createElement("span", null, "Signal ID ", s.id)))), /*#__PURE__*/React.createElement(HeroStatTiles, {
    s: s,
    detail: detail
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, "Unrealized"), /*#__PURE__*/React.createElement("div", {
    key: s.pct.toFixed(2),
    className: "cxg-tick",
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: up ? '#059669' : '#DC2626',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-.01em',
      lineHeight: 1.1
    }
  }, up ? '+' : '', s.pct.toFixed(2), "%"), /*#__PURE__*/React.createElement("div", {
    key: s.usd.toFixed(2),
    className: "cxg-tick",
    style: {
      fontSize: 12,
      color: up ? '#059669' : '#DC2626',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, up ? '+' : '−', "$", Math.abs(s.usd).toFixed(2), " USD"))), /*#__PURE__*/React.createElement(PnlTrajectory, {
    s: s
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      borderTop: '1px solid #F1F3F8'
    }
  }, [{
    l: 'Entry',
    v: s.entry,
    mono: true,
    c: '#0F172A'
  }, {
    l: 'Last',
    v: s.last,
    mono: true,
    c: up ? '#059669' : '#DC2626'
  }, {
    l: 'Target',
    v: s.target,
    mono: true,
    c: '#059669'
  }, {
    l: 'Stop',
    v: s.stop,
    mono: true,
    c: '#DC2626'
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
      fontSize: 15,
      fontWeight: 700,
      color: m.c,
      marginTop: 3
    }
  }, m.v)))), /*#__PURE__*/React.createElement(DetailView, {
    s: s
  }));
};

/* ---------- TAB PANELS ---------- */

const ActiveSignalsPanel = ({
  signals,
  selected,
  setSelected,
  filter,
  setFilter
}) => {
  const filtered = signals.filter(s => {
    if (filter === 'Long Only') return s.side === 'LONG';
    if (filter === 'Short Only') return s.side === 'SHORT';
    if (filter === 'PnL (+)') return s.pct >= 0;
    if (filter === 'PnL (−)') return s.pct < 0;
    return true;
  });
  const winners = filtered.filter(s => s.pct >= 0).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
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
  }, "Live feed"), /*#__PURE__*/React.createElement("span", {
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
  }), filtered.length, " open")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, winners, "\u2191 / ", filtered.length - winners, "\u2193")), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "Search pair\u2026",
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
    items: ['All', 'Long Only', 'Short Only', 'PnL (+)', 'PnL (−)'],
    active: filter === 'All Signals' ? 'All' : filter,
    onChange: v => setFilter(v === 'All' ? 'All Signals' : v)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      margin: '0 -6px',
      paddingRight: 4
    }
  }, filtered.map(s => /*#__PURE__*/React.createElement(SignalRow, {
    key: s.id,
    s: s,
    active: selected?.id === s.id,
    onClick: () => setSelected(s)
  })))), /*#__PURE__*/React.createElement(DetailPane, {
    s: selected
  }));
};
const HistoryPanel = () => {
  const HISTORY_RAW = useApiHistory(15000);
  // Sort newest → oldest by ts (GMT+7 string "YYYY/MM/DD HH:MM" is lexicographically sortable)
  const HISTORY = useMemo(() => [...HISTORY_RAW].sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || ''))), [HISTORY_RAW]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  // Auto-clear selection if the selected trade is no longer in history (refreshed away)
  useEffect(() => {
    if (selectedTrade && !HISTORY.find(h => h.pair_key === selectedTrade.pair_key && h.ts === selectedTrade.ts)) {
      setSelectedTrade(null);
    }
  }, [HISTORY, selectedTrade]);
  const wins = HISTORY.filter(h => h.outcome === 'target').length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: selectedTrade ? '380px 1fr' : '1fr 320px',
      gap: 16,
      transition: 'grid-template-columns 200ms'
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
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Closed Position \u2014 last 24h"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, HISTORY.length, " positions \xB7 ", wins, " targeted \xB7 ", HISTORY.length - wins, " stopped")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    icon: "calendar"
  }, "Last 24h"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    icon: "download"
  }, "Export CSV"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: HISTORY.length > 11 ? 11 * 46 + 40 : 'auto',
      overflowY: HISTORY.length > 11 ? 'auto' : 'visible'
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
  }, ['Time', 'Pair', 'Side', 'Entry', 'Exit', 'Return', 'PnL', 'Duration', ''].map(h => /*#__PURE__*/React.createElement("th", {
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
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, HISTORY.map((h, i) => {
    const up = h.pct >= 0;
    const isSel = selectedTrade && selectedTrade.pair_key === h.pair_key && selectedTrade.ts === h.ts;
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      onClick: () => setSelectedTrade(isSel ? null : h),
      style: {
        borderBottom: '1px solid #F5F6FA',
        cursor: 'pointer',
        background: isSel ? '#EEF0FF' : 'transparent',
        transition: 'background 120ms'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, h.ts), /*#__PURE__*/React.createElement("td", {
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
      src: `/assets/tokens/${h.sym.split('/')[0].toLowerCase()}.svg`,
      width: "20",
      height: "20"
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
        fontSize: 12,
        color: '#0F172A'
      }
    }, h.entry), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: '#0F172A'
      }
    }, h.exit), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        fontWeight: 700,
        color: up ? '#059669' : '#DC2626'
      }
    }, up ? '+' : '', h.pct.toFixed(2), "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        fontWeight: 700,
        color: up ? '#059669' : '#DC2626'
      }
    }, up ? '+' : '−', "$", Math.abs(h.usd).toFixed(2)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, h.duration), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        background: h.outcome === 'target' ? '#ECFDF5' : '#FEF2F2',
        color: h.outcome === 'target' ? '#047857' : '#B91C1C',
        textTransform: 'uppercase',
        letterSpacing: '.04em'
      }
    }, h.outcome)));
  }))))), selectedTrade ? /*#__PURE__*/React.createElement(ClosedTradeDetail, {
    trade: selectedTrade,
    onClose: () => setSelectedTrade(null)
  }) : /*#__PURE__*/React.createElement("div", {
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
      color: '#0F172A',
      marginBottom: 4
    }
  }, "Outcome split"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginBottom: 14
    }
  }, "Target vs stop hits, 24h"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    size: 120,
    segments: [{
      v: wins,
      c: '#10B981'
    }, {
      v: HISTORY.length - wins,
      c: '#EF4444'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(LegendItem, {
    c: "#10B981",
    label: "Target",
    value: `${wins} · ${HISTORY.length ? Math.round(wins / HISTORY.length * 100) : 0}%`
  }), /*#__PURE__*/React.createElement(LegendItem, {
    c: "#EF4444",
    label: "Stop",
    value: `${HISTORY.length - wins} · ${HISTORY.length ? Math.round((HISTORY.length - wins) / HISTORY.length * 100) : 0}%`
  })))), (() => {
    // Derive realized PnL over last 7 days from HISTORY trades
    const now = Date.now();
    const cutoff = now - 7 * 24 * 3600 * 1000;
    // Parse time formats: "YYYY/MM/DD HH:MM:SS" or "MM-DD HH:MM"
    const toTs = str => {
      if (!str) return 0;
      const s = String(str);
      // Try ISO-like first
      const d = new Date(s.replace(/\//g, '-').replace(' ', 'T'));
      if (!isNaN(d.getTime())) return d.getTime();
      return 0;
    };
    const recent = HISTORY.filter(h => {
      const t = toTs(h.ts);
      return t === 0 || t >= cutoff; // keep if can't parse
    });
    const total = recent.reduce((a, h) => a + (Number(h.usd) || 0), 0);
    const color = total >= 0 ? '#059669' : '#DC2626';
    const sign = total >= 0 ? '+' : '−';
    // Bucket by day for spark
    const byDay = new Map();
    for (const h of recent) {
      const day = String(h.ts || '').slice(0, 10);
      if (!day) continue;
      byDay.set(day, (byDay.get(day) || 0) + (Number(h.usd) || 0));
    }
    const days = Array.from(byDay.keys()).sort();
    const dailyPnl = days.map(d => +byDay.get(d).toFixed(2));
    return /*#__PURE__*/React.createElement("div", {
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
        marginBottom: 4
      }
    }, "Realized PnL \xB7 7d"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        color,
        fontVariantNumeric: 'tabular-nums'
      }
    }, sign, "$", Math.abs(total).toFixed(2)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2
      }
    }, recent.length, " closed \xB7 ", days.length, " day", days.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(Spark, {
      data: dailyPnl,
      color: color,
      fill: color,
      w: 280,
      h: 70
    })));
  })()));
};

// Detail panel for a CLOSED trade — reuses DetailPane by synthesizing a pseudo-signal
// from the trade record + ./data/metric.json/detail data.
const ClosedTradeDetail = ({
  trade,
  onClose
}) => {
  const pseudoSignal = {
    id: trade.pair_key,
    pair_key: trade.pair_key,
    direction: trade.side,
    sym: trade.sym,
    tk: (trade.sym || '').split('/')[0].toLowerCase(),
    side: trade.side,
    hold: 'CLOSED',
    ts: trade.ts,
    age: trade.duration,
    entry: Number(trade.entry) || 0,
    last: Number(trade.exit) || 0,
    target: Number(trade.exit) || 0,
    // no target in history — fallback to exit
    stop: Number(trade.entry) || 0,
    // fallback so rail math doesn't divide by zero
    pct: Number(trade.pct) || 0,
    usd: Number(trade.usd) || 0,
    tier: (trade.stage || '').toUpperCase(),
    prev: '',
    next: (trade.stage || '').toUpperCase(),
    spark: [],
    stage: trade.stage || '',
    position_usd: 0
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      zIndex: 5,
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      width: 30,
      height: 30,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      color: '#6B7280',
      boxShadow: '0 2px 6px rgba(17,24,39,.06)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14,
    stroke: 2.5
  })), /*#__PURE__*/React.createElement(DetailPane, {
    s: pseudoSignal
  }));
};
const LegendItem = ({
  c,
  label,
  value
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 0'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 10,
    height: 10,
    borderRadius: 3,
    background: c
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: 500
  }
}, label)), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0F172A',
    fontFamily: 'JetBrains Mono, monospace'
  }
}, value));
const PerformancePanel = () => {
  const perPair = [{
    s: 'ETH',
    tk: 'eth',
    w: 18,
    l: 1,
    pnl: 412.30
  }, {
    s: 'SOL',
    tk: 'sol',
    w: 14,
    l: 2,
    pnl: 208.40
  }, {
    s: 'LINK',
    tk: 'link',
    w: 9,
    l: 2,
    pnl: 128.10
  }, {
    s: 'BNB',
    tk: 'bnb',
    w: 7,
    l: 1,
    pnl: 64.80
  }, {
    s: 'AVAX',
    tk: 'avax',
    w: 6,
    l: 2,
    pnl: 48.20
  }, {
    s: 'ARB',
    tk: 'arb',
    w: 4,
    l: 3,
    pnl: -22.10
  }, {
    s: 'XMR',
    tk: 'xmr',
    w: 3,
    l: 0,
    pnl: 54.00
  }];
  const maxPnl = Math.max(...perPair.map(p => Math.abs(p.pnl)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Equity curve"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, "Cumulative realized \xB7 last 30 days")), /*#__PURE__*/React.createElement(Tabs, {
    items: ['24H', '7D', '30D', 'ALL'],
    active: "30D",
    onChange: () => {}
  })), /*#__PURE__*/React.createElement(EquityChart, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 18,
      marginTop: 18,
      paddingTop: 18,
      borderTop: '1px solid #F1F3F8'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Win rate",
    value: "96.4%",
    delta: 1.2
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Avg win",
    value: "+$24.13"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Avg loss",
    value: "\u2212$7.02",
    negative: true
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Profit factor",
    value: "3.44"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Top pairs \xB7 30d"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2,
      marginBottom: 14
    }
  }, "Realized PnL by symbol"), perPair.map(p => {
    const up = p.pnl >= 0;
    const total = p.w + p.l;
    return /*#__PURE__*/React.createElement("div", {
      key: p.s,
      style: {
        padding: '10px 0',
        borderBottom: '1px solid #F5F6FA'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: `/assets/tokens/${p.tk}.svg`,
      width: "22",
      height: "22"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, p.s), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: '#6B7280'
      }
    }, p.w, "W / ", p.l, "L \xB7 ", Math.round(p.w / total * 100), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: 13,
        fontWeight: 700,
        color: up ? '#059669' : '#DC2626',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, up ? '+' : '−', "$", Math.abs(p.pnl).toFixed(2))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 6,
        background: '#F1F3F8',
        borderRadius: 999,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: up ? 0 : `${100 - Math.abs(p.pnl) / maxPnl * 100}%`,
        width: `${Math.abs(p.pnl) / maxPnl * 100}%`,
        top: 0,
        bottom: 0,
        background: up ? 'linear-gradient(90deg,#A7F3D0,#10B981)' : 'linear-gradient(90deg,#EF4444,#FECACA)',
        borderRadius: 999
      }
    })));
  })));
};
const Metric = ({
  label,
  value,
  delta,
  negative
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 600,
    letterSpacing: '.06em',
    textTransform: 'uppercase'
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 20,
    fontWeight: 700,
    color: negative ? '#DC2626' : '#0F172A',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 3,
    letterSpacing: '-.01em'
  }
}, value), delta != null && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 700,
    marginTop: 2
  }
}, "\u25B2 ", delta.toFixed(1), "% vs prev"));
const EquityChart = () => {
  const W = 680,
    H = 200;
  const data = [0, 12, 18, 24, 22, 32, 38, 44, 52, 58, 66, 72, 68, 82, 94, 102, 110, 116, 128, 140, 138, 152, 168, 180, 192, 198, 210, 224, 238, 248];
  const min = 0,
    max = Math.max(...data);
  const pts = data.map((v, i) => [i / (data.length - 1) * W, H - v / (max || 1) * (H - 14) - 7]);
  const line = 'M' + pts.map(p => p.join(',')).join(' L');
  const area = `${line} L${W},${H} L0,${H} Z`;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "eq",
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#6366F1",
    stopOpacity: ".28"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#6366F1",
    stopOpacity: "0"
  }))), [0.25, 0.5, 0.75].map(f => /*#__PURE__*/React.createElement("line", {
    key: f,
    x1: "0",
    x2: W,
    y1: H * f,
    y2: H * f,
    stroke: "#F1F3F8"
  })), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#eq)"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    stroke: "#6366F1",
    strokeWidth: "2.25",
    fill: "none",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: pts[pts.length - 1][0],
    cy: pts[pts.length - 1][1],
    r: "5",
    fill: "#6366F1",
    stroke: "#fff",
    strokeWidth: "2"
  }));
};
const SettingsPanel = () => {
  const [entryBuf, setEntryBuf] = useState(0.15);
  const [stopBuf, setStopBuf] = useState(2.5);
  const [maxConc, setMaxConc] = useState(15);
  const [tiers, setTiers] = useState({
    FAIR_C_MOMENTUM: true,
    'phase 8': true,
    'phase 3': true,
    'phase 4': false,
    'phase 6': true,
    BREAKOUT: true,
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
  }, "Monitor configuration"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 2
    }
  }, "Rules applied to every signal the monitor surfaces.")), /*#__PURE__*/React.createElement("div", {
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
    label: "Entry buffer",
    hint: "Minimum distance from last price before a LONG/SHORT signal arms.",
    valueLabel: `${entryBuf.toFixed(2)}%`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "1",
    step: "0.01",
    value: entryBuf,
    onChange: e => setEntryBuf(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#6366F1'
    }
  })), /*#__PURE__*/React.createElement(SettingRow, {
    label: "Stop buffer",
    hint: "Distance from last price to place protective stop.",
    valueLabel: `${stopBuf.toFixed(2)}%`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.5",
    max: "10",
    step: "0.1",
    value: stopBuf,
    onChange: e => setStopBuf(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#6366F1'
    }
  })), /*#__PURE__*/React.createElement(SettingRow, {
    label: "Max concurrent signals",
    hint: "Hard cap on simultaneously open positions.",
    valueLabel: maxConc
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "30",
    step: "1",
    value: maxConc,
    onChange: e => setMaxConc(+e.target.value),
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
  }, "Tier subscriptions"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginBottom: 14
    }
  }, "Which signal tiers feed the monitor."), /*#__PURE__*/React.createElement("div", {
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
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, k.replace(/_/g, ' ')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      marginTop: 1
    }
  }, tierHint(k)))))))), /*#__PURE__*/React.createElement("div", {
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
  }, "ACTIVE PROFILE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: '#fff',
      marginTop: 4
    }
  }, "Balanced \u2014 Tier A"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,.6)',
      marginTop: 4
    }
  }, "Moderate stop buffer, long-biased, cap 15 open."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      padding: '9px 12px',
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,.18)',
      background: 'transparent',
      color: '#fff',
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer'
    }
  }, "Change profile"), /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      padding: '9px 12px',
      borderRadius: 8,
      border: 'none',
      background: '#6366F1',
      color: '#fff',
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer'
    }
  }, "Clone"))), /*#__PURE__*/React.createElement("div", {
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
      marginBottom: 10
    }
  }, "Notification channels"), [{
    i: 'smartphone',
    l: 'Mobile push',
    on: true
  }, {
    i: 'mail',
    l: 'Email digest',
    on: true
  }, {
    i: 'send',
    l: 'Telegram bot',
    on: false
  }, {
    i: 'webhook',
    l: 'Custom webhook',
    on: false
  }].map(c => /*#__PURE__*/React.createElement("div", {
    key: c.l,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid #F5F6FA'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      background: '#F5F6FA',
      display: 'grid',
      placeItems: 'center',
      color: '#6B7280'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.i === 'webhook' ? 'link' : c.i,
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 12,
      color: '#0F172A',
      fontWeight: 600
    }
  }, c.l), /*#__PURE__*/React.createElement(Toggle, {
    on: c.on
  }))))));
};
const tierHint = t => ({
  FAIR_C_MOMENTUM: 'Conservative momentum entries',
  'phase 8': 'Standard momentum follow-through',
  'phase 3': 'Counter-trend phase 3 entries',
  'phase 4': 'Low-volatility range signals',
  'phase 6': 'Bounces from oversold zones',
  BREAKOUT: 'Range-break continuation',
  'phase 7': 'High-risk reversal candidates'
})[t] || '';
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

/* ---------- SCREEN ---------- */

const PMMonitorScreen = () => {
  const [tab, setTab] = useState('Active Position');
  const [filter, setFilter] = useState('All Signals');
  const [selectedId, setSelectedId] = useState(SIGNALS[0].id);
  const liveSignals = useApiSignals(2000);
  const liveKpis = useApiKpis(liveSignals, 2500);
  const liveSelected = useMemo(() => liveSignals.find(x => x.id === selectedId) || liveSignals[0], [liveSignals, selectedId]);
  const setSelected = s => setSelectedId(s.id);
  const fmtUsd = v => `${v >= 0 ? '+' : '−'}$${Math.abs(v).toFixed(2)}`;
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
    label: "Active Position",
    value: Math.round(liveKpis.active.value).toString(),
    sub: liveKpis.active.sub || '',
    delta: sparkDelta(liveKpis.active.spark),
    icon: "radio",
    color: "#10B981",
    spark: liveKpis.active.spark
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Win rate",
    value: `${liveKpis.win.value.toFixed(1)}%`,
    sub: liveKpis.win.sub || '',
    delta: sparkDelta(liveKpis.win.spark),
    icon: "target",
    color: "#6366F1",
    spark: liveKpis.win.spark
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Realized PnL",
    value: fmtUsd(liveKpis.realized.value),
    sub: liveKpis.realized.sub || '',
    delta: sparkDelta(liveKpis.realized.spark),
    icon: "trending-up",
    color: "#A855F7",
    spark: liveKpis.realized.spark
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Unrealized PnL",
    value: fmtUsd(liveKpis.unrealized.value),
    sub: liveKpis.unrealized.sub || '',
    delta: sparkDelta(liveKpis.unrealized.spark),
    icon: "clock",
    color: "#F97316",
    spark: liveKpis.unrealized.spark
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
    items: ['Active Position', 'Position History', 'Performance'],
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
  }), "Live \xB7 ", new Date().toLocaleTimeString('en-GB', {
    timeZone: TZ_GMT7,
    hour12: false
  }))), tab === 'Active Position' && /*#__PURE__*/React.createElement(ActiveSignalsPanel, {
    signals: liveSignals,
    selected: liveSelected,
    setSelected: setSelected,
    filter: filter,
    setFilter: setFilter
  }), tab === 'Position History' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || HistoryPanel, null), tab === 'Performance' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || PerformancePanel, null), tab === 'Bot Settings' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || SettingsPanel, null)));
};
window.PMMonitorScreen = PMMonitorScreen;