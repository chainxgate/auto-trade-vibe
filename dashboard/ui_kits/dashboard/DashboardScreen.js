/* ChainxGate — Overview (live: wallet snapshot + pm kpi/positions/history + ai-bot fleet) */
const {
  useState,
  useEffect,
  useMemo
} = React;

/* ---------- API HOOKS (reuse same endpoints as sub-tabs) ---------- */
const useApiPoll = (url, rate, parse) => {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fetchOnce = React.useCallback(() => {
    fetch(url).then(r => r.json()).then(j => {
      setData(parse ? parse(j) : j);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [url]);
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
const useDashWallet = () => useApiPoll('./data/wallet.json', 30000, j => j && j.ok ? j.data : null);
const useDashKpi = () => useApiPoll('./data/kpi.json', 5000);
const useDashOpen = () => useApiPoll('./data/positions.json', 4000, j => Array.isArray(j?.positions) ? j.positions : []);
const useDashBots = () => useApiPoll('./data/bots.json', 5000, j => Array.isArray(j?.bots) ? j.bots : []);
const useDashHistory = () => useApiPoll('./data/history.json', 30000, j => Array.isArray(j?.trades) ? j.trades : []);

// Re-resolve saved wallet addresses — server-backed via ./data/addresses.json
const useSavedAddressBalances = (rate = 60000) => {
  const [resolved, setResolved] = useState({});
  const fetchAll = React.useCallback(() => {
    fetch('./data/addresses.json').then(r => r.json()).then(j => {
      const addrs = j && j.ok && Array.isArray(j.addresses) ? j.addresses : [];
      addrs.forEach(entry => {
        const key = `${entry.network}:${entry.address}:${entry.token || ''}`;
        fetch('./data/config.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: entry.address,
            network: entry.network,
            token: entry.token || ''
          })
        }).then(r => r.json()).then(b => {
          if (b && b.ok) setResolved(prev => ({
            ...prev,
            [key]: b.asset
          }));
        }).catch(() => {});
      });
    }).catch(() => {});
  }, []);
  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, rate);
    return () => clearInterval(id);
  }, [fetchAll, rate]);
  return resolved;
};

/* ---------- VISUALS ---------- */
const fmtUsd = (v, frac = 2) => '$' + Number(v || 0).toLocaleString('en-US', {
  minimumFractionDigits: frac,
  maximumFractionDigits: frac
});

// Server timestamps come back as already-formatted GMT+7 strings ("YYYY-MM-DD HH:MM:SS")
const parseGmt7 = s => {
  if (!s) return NaN;
  let ms = Date.parse(s);
  if (!isNaN(ms)) return ms;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return NaN;
  const [, Y, Mo, D, H, Mi, S] = m;
  return Date.UTC(+Y, +Mo - 1, +D, +H - 7, +Mi, +S);
};
// Index-based palette borrowed from Entry Gate 10-component breakdown.
// Vivid + varied so even 5 assets get distinct warm/cool tones.
const PALETTE = ['#EC4899',
// pink
'#6366F1',
// indigo
'#10B981',
// green
'#F59E0B',
// amber
'#0EA5E9',
// sky blue
'#A855F7',
// purple
'#84CC16',
// lime
'#3B82F6',
// blue
'#FBBF24',
// yellow
'#94A3B8' // slate
];
const colorAt = i => PALETTE[i % PALETTE.length];
const ASSET_COLOR = {}; // kept for compat (legacy ref-by-symbol callers fall back to colorAt)

const DSpark = ({
  data,
  color = '#6366F1',
  h = 36,
  w = 120,
  fill
}) => {
  if (!Array.isArray(data) || data.length < 2) {
    const y = h / 2;
    return /*#__PURE__*/React.createElement("svg", {
      width: w,
      height: h,
      style: {
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement("line", {
      x1: "0",
      y1: y,
      x2: w,
      y2: y,
      stroke: color,
      strokeWidth: "1.25",
      strokeDasharray: "3,3",
      opacity: ".45"
    }));
  }
  const min = Math.min(...data),
    max = Math.max(...data);
  const r = max - min || 1;
  const pts = data.map((v, i) => `${i / (data.length - 1) * w},${h - (v - min) / r * (h - 4) - 2}`);
  const path = 'M' + pts.join(' L');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const id = `dspk-${color.replace('#', '')}-${w}`;
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: id,
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: ".32"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), fill && /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#${id})`
  }), /*#__PURE__*/React.createElement("path", {
    d: path,
    stroke: color,
    strokeWidth: "1.75",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: pts[pts.length - 1].split(',')[0],
    cy: pts[pts.length - 1].split(',')[1],
    r: "2.4",
    fill: color
  }));
};
const DKpi = ({
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
}, sub), spark && /*#__PURE__*/React.createElement(DSpark, {
  data: spark,
  color: color,
  w: 70,
  h: 22,
  fill: true
})));

/* ---------- PORTFOLIO CHART (cumulative PnL from history) ---------- */
const PortfolioChart = ({
  trades,
  range,
  baseEquity
}) => {
  const W = 720,
    H = 150;
  // Bucket trades into the chosen range
  const cutoffMs = (() => {
    const now = Date.now();
    if (range === '24H') return now - 24 * 3600 * 1000;
    if (range === '7D') return now - 7 * 24 * 3600 * 1000;
    if (range === '30D') return now - 30 * 24 * 3600 * 1000;
    return 0; // ALL
  })();
  const valid = (trades || []).map(t => ({
    ts: parseGmt7(t.time || t.closed_at || t.close_ts || ''),
    pnl: Number(t.pnl_usd || 0)
  })).filter(t => !isNaN(t.ts) && t.ts >= cutoffMs).sort((a, b) => a.ts - b.ts);
  // Cumulative equity series
  let cum = baseEquity;
  const series = [{
    ts: cutoffMs || valid[0]?.ts || Date.now(),
    v: cum
  }];
  for (const t of valid) {
    cum += t.pnl;
    series.push({
      ts: t.ts,
      v: cum
    });
  }
  // Benchmark: flat line at base equity (trivial baseline)
  const data = series.map(s => s.v);
  const bench = series.map(() => baseEquity);
  const min = Math.min(...data, ...bench, baseEquity) - 50;
  const max = Math.max(...data, ...bench, baseEquity) + 50;
  const rng = max - min || 1;
  const xy = (v, i, n = data.length) => [i / Math.max(1, n - 1) * W, H - (v - min) / rng * (H - 20) - 10];
  const line = data.length ? 'M' + data.map((v, i) => xy(v, i).join(',')).join(' L') : '';
  const area = data.length ? `${line} L${W},${H} L0,${H} Z` : '';
  const bLine = bench.length ? 'M' + bench.map((v, i) => xy(v, i).join(',')).join(' L') : '';
  const last = data.length ? xy(data[data.length - 1], data.length - 1) : [0, H / 2];
  const fmtTick = v => '$' + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(0));
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "d-port",
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
  })), bLine && /*#__PURE__*/React.createElement("path", {
    d: bLine,
    stroke: "#CBD5E1",
    strokeWidth: "1.5",
    strokeDasharray: "4 4",
    fill: "none"
  }), area && /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#d-port)"
  }), line && /*#__PURE__*/React.createElement("path", {
    d: line,
    stroke: "#6366F1",
    strokeWidth: "2.25",
    fill: "none",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), data.length > 0 && /*#__PURE__*/React.createElement("circle", {
    cx: last[0],
    cy: last[1],
    r: "5",
    fill: "#6366F1",
    stroke: "#fff",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("g", {
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "10",
    fill: "#6B7280"
  }, /*#__PURE__*/React.createElement("text", {
    x: "6",
    y: H * 0.25 - 4
  }, fmtTick(max - rng * 0.25)), /*#__PURE__*/React.createElement("text", {
    x: "6",
    y: H * 0.5 - 4
  }, fmtTick(max - rng * 0.5)), /*#__PURE__*/React.createElement("text", {
    x: "6",
    y: H * 0.75 - 4
  }, fmtTick(max - rng * 0.75))));
};

/* ---------- ALLOCATION (live from wallet snapshot + saved addresses) ---------- */
const AllocationCard = ({
  snap,
  addressAssets
}) => {
  const [hovered, setHovered] = useState(false);
  const segs = useMemo(() => {
    const buckets = new Map(); // symbol → {n, v, tk}
    const add = (sym, val, tk) => {
      if (!sym || !val || val <= 0) return;
      const key = sym.toUpperCase();
      const prev = buckets.get(key) || {
        n: key,
        v: 0,
        tk: tk || key.toLowerCase()
      };
      prev.v += val;
      buckets.set(key, prev);
    };
    const futures = snap?.futures || {};
    const heroBtc = snap?.hero_coins?.BTC || {};
    const heroEth = snap?.hero_coins?.ETH || {};
    const spot = snap?.spot?.top_holdings || [];
    add('USDT', futures.total_wallet_balance_usd, 'usdt');
    add('BTC', heroBtc.value_usd, 'btc');
    add('ETH', heroEth.value_usd, 'eth');
    spot.forEach(h => {
      if (['BTC', 'ETH'].includes(h.asset)) return; // already counted via hero
      add(h.asset, h.value_usd, (h.asset || '').toLowerCase());
    });
    // Saved address balances (LTC, DOGE, SHIB, ETH on-chain, etc.)
    Object.values(addressAssets || {}).forEach(a => add(a.symbol, a.value_usd, (a.symbol || '').toLowerCase()));
    return Array.from(buckets.values()).sort((a, b) => b.v - a.v).slice(0, 6);
  }, [snap, addressAssets]);
  const total = segs.reduce((a, b) => a + (b.v || 0), 0) || 1;
  const size = 110,
    r = size / 2 - 10,
    c = 2 * Math.PI * r;
  let off = 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 14,
      border: '1px solid #EEF0F4'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Asset allocation"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      marginTop: 1
    }
  }, "Across all connected wallets")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      window.location.hash = '#/wallets';
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: hovered ? '#6366F1' : '#EEF0FF',
      border: `1px solid ${hovered ? '#6366F1' : '#C7D2FE'}`,
      borderRadius: 999,
      padding: '5px 12px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: hovered ? '#fff' : '#4338CA',
      fontSize: 11,
      fontWeight: 700,
      transition: 'all 140ms',
      boxShadow: hovered ? '0 4px 12px rgba(99,102,241,.28)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "wallet",
    size: 11,
    stroke: 2.5
  }), " Rebalance", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 11,
    stroke: 2.5
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "#F1F3F8",
    strokeWidth: "11"
  }), segs.map((s, i) => {
    const len = s.v / total * 100 / 100 * c;
    const dash = `${len} ${c - len}`;
    const el = /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      stroke: colorAt(i),
      strokeWidth: "11",
      strokeDasharray: dash,
      strokeDashoffset: -off,
      transform: `rotate(-90 ${size / 2} ${size / 2})`
    });
    off += len;
    return el;
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: '#6B7280',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, "Total"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#0F172A',
      fontVariantNumeric: 'tabular-nums'
    }
  }, total >= 1000 ? '$' + (total / 1000).toFixed(1) + 'K' : fmtUsd(total))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, segs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#9CA3AF',
      textAlign: 'center',
      padding: 14
    }
  }, "Waiting for wallet snapshot\u2026"), segs.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      borderBottom: i === segs.length - 1 ? 'none' : '1px solid #F5F6FA'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: colorAt(i)
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${s.tk}.svg`,
    width: "20",
    height: "20",
    onError: e => e.target.style.display = 'none'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, s.n), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, fmtUsd(s.v)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#0F172A',
      fontFamily: 'JetBrains Mono, monospace',
      minWidth: 40,
      textAlign: 'right'
    }
  }, (s.v / total * 100).toFixed(1), "%"))))));
};

/* ---------- BOT FLEET (live) ---------- */
const BotFleetCard = ({
  bots
}) => {
  const statusColor = {
    running: '#10B981',
    paused: '#F59E0B',
    stopped: '#9CA3AF'
  };
  const rows = (bots || []).map(b => {
    const running = (b.running_dirs || []).length > 0;
    return {
      s: String(b.coin || '').toUpperCase(),
      tk: String(b.coin || '').toLowerCase(),
      status: running ? 'running' : 'stopped',
      trades: Number(b.trades_24h) || 0,
      win: Number(b.win_rate) || 0,
      pnl: Number(b.profit_24h) || 0
    };
  });
  const maxAbs = Math.max(1, ...rows.map(r => Math.abs(r.pnl)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 20,
      border: '1px solid #EEF0F4'
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
  }, "Bot fleet \xB7 live"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, "Status and 24h performance across all xBots")), /*#__PURE__*/React.createElement("a", {
    href: "#/ai-bot",
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#6366F1',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, "Manage bots ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 12,
    stroke: 2.25
  }))), rows.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      textAlign: 'center',
      padding: 20
    }
  }, "No bots configured."), rows.map(b => {
    const pct = Math.min(100, Math.abs(b.pnl) / maxAbs * 100);
    const up = b.pnl >= 0;
    return /*#__PURE__*/React.createElement("div", {
      key: b.s,
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        gap: 14,
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #F5F6FA'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: `/assets/tokens/${b.tk}.svg`,
      width: "28",
      height: "28",
      onError: e => e.target.style.display = 'none'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 999,
        background: statusColor[b.status],
        border: '2px solid #fff'
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, b.s, " xBot"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: statusColor[b.status],
        textTransform: 'uppercase',
        letterSpacing: '.08em'
      }
    }, b.status)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: '#F1F3F8',
        borderRadius: 999,
        overflow: 'hidden',
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${pct}%`,
        background: up ? 'linear-gradient(90deg,#A7F3D0,#10B981)' : 'linear-gradient(90deg,#FECACA,#EF4444)',
        borderRadius: 999
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace',
        textAlign: 'right'
      }
    }, b.trades, " trades", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#0F172A',
        fontWeight: 600
      }
    }, b.win.toFixed(1), "% win")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        color: up ? '#059669' : '#DC2626',
        minWidth: 60,
        textAlign: 'right'
      }
    }, up ? '+' : '−', "$", Math.abs(b.pnl).toFixed(2)));
  }));
};

/* ---------- OPEN TRADES (from ./data/positions.json) ---------- */
const OpenTrades = ({
  positions
}) => {
  const fmtClock = s => {
    if (!s) return '—';
    // server already gave HH:MM:SS in GMT+7 — show that suffix
    const m = String(s).match(/(\d{2}:\d{2}:\d{2})/);
    return m ? m[1] : s;
  };
  const fmtAge = s => {
    const ms = parseGmt7(s);
    if (isNaN(ms)) return '—';
    const dt = Date.now() - ms;
    if (dt < 0) return '—';
    const mi = Math.floor(dt / 60000);
    if (mi < 60) return `${mi}m`;
    const h = Math.floor(mi / 60);
    return h < 24 ? `${h}h ${mi % 60}m` : `${Math.floor(h / 24)}d ${h % 24}h`;
  };
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
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Open trade"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, "Live Tier A positions (", positions?.length || 0, ")")), /*#__PURE__*/React.createElement("a", {
    href: "#/pm-monitor",
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#6366F1',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, "View all ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 12,
    stroke: 2.25
  }))), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: '#FAFBFF'
    }
  }, ['Time', 'Pair', 'Side', 'Entry', 'Live', 'Stage', 'Return', 'PnL', 'Age'].map(h => /*#__PURE__*/React.createElement("th", {
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
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, (positions || []).length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 9,
    style: {
      padding: 28,
      textAlign: 'center',
      fontSize: 12,
      color: '#6B7280'
    }
  }, "No open positions.")), (positions || []).slice(0, 8).map((p, i) => {
    const sym = String(p.symbol || '').toUpperCase();
    const side = String(p.direction || '').toUpperCase();
    const entry = Number(p.entry_price) || 0;
    const live = Number(p.live_price || 0);
    const pnlPct = Number(p.pnl_pct != null ? p.pnl_pct : Number(p.pnl_live || 0) * 100) || 0;
    const sizeUsd = Number(p.position_usd || p.leveraged_usd || 100);
    const pnlUsd = pnlPct / 100 * sizeUsd;
    const up = pnlPct >= 0;
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
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
    }, fmtClock(p.opened_at)), /*#__PURE__*/React.createElement("td", {
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
      src: `/assets/tokens/${sym.toLowerCase()}.svg`,
      width: "20",
      height: "20",
      onError: e => e.target.style.display = 'none'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, sym, "/USDT"))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        background: side === 'LONG' ? '#ECFDF5' : '#FEF2F2',
        color: side === 'LONG' ? '#047857' : '#B91C1C'
      }
    }, side)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: '#0F172A'
      }
    }, entry ? entry.toLocaleString(undefined, {
      maximumFractionDigits: entry < 10 ? 4 : 2
    }) : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: '#0F172A'
      }
    }, live ? live.toLocaleString(undefined, {
      maximumFractionDigits: live < 10 ? 4 : 2
    }) : '—'), /*#__PURE__*/React.createElement("td", {
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
        color: '#4338CA'
      }
    }, p.stage || '—')), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        fontWeight: 700,
        color: up ? '#059669' : '#DC2626'
      }
    }, up ? '+' : '', pnlPct.toFixed(2), "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        fontWeight: 700,
        color: up ? '#059669' : '#DC2626'
      }
    }, up ? '+' : '−', "$", Math.abs(pnlUsd).toFixed(2)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, fmtAge(p.opened_at)));
  }))));
};

/* ---------- SCREEN ---------- */
const DashboardScreen = () => {
  const [range, setRange] = useState('30D');
  const {
    data: snap
  } = useDashWallet();
  const {
    data: kpi
  } = useDashKpi();
  const {
    data: positions
  } = useDashOpen();
  const {
    data: bots
  } = useDashBots();
  const {
    data: history
  } = useDashHistory();
  const addressAssets = useSavedAddressBalances(60000);

  // KPI values
  const addrTotal = Object.values(addressAssets || {}).reduce((s, a) => s + (Number(a?.value_usd) || 0), 0);
  const totalEquity = (snap?.total_value_usd || 0) + addrTotal;

  // Build sparklines from history (oldest → newest, bucketed to ~12 points)
  const sortedTrades = useMemo(() => {
    return (history || []).filter(t => !isNaN(parseGmt7(t.time || t.closed_at))).sort((a, b) => parseGmt7(a.time || a.closed_at) - parseGmt7(b.time || b.closed_at));
  }, [history]);
  const sparks = useMemo(() => {
    const n = sortedTrades.length;
    const step = Math.max(1, Math.ceil(n / 12));
    const equity = [],
      pnl = [],
      wr = [];
    let cumEq = 0,
      cumPnl = 0,
      wins = 0,
      total = 0;
    // baseline point
    equity.push(0);
    pnl.push(0);
    wr.push(0);
    for (let i = 0; i < n; i++) {
      const p = Number(sortedTrades[i].pnl_usd || 0);
      cumEq += p;
      cumPnl += p;
      total++;
      if (Number(sortedTrades[i].pnl_pct || 0) > 0) wins++;
      if ((i + 1) % step === 0 || i === n - 1) {
        equity.push(cumEq);
        pnl.push(cumPnl);
        wr.push(total ? wins / total * 100 : 0);
      }
    }
    // rebase equity around current totalEquity for a nicer curve
    const eqShift = totalEquity - cumEq;
    return {
      equity: equity.map(v => v + eqShift),
      pnl,
      wr,
      botActivity: (bots || []).map(b => Number(b.trades_24h) || 0)
    };
  }, [sortedTrades, bots, totalEquity]);
  const realizedToday = snap?.realized_today_usd || 0;
  const unrealized = (snap?.futures?.unrealized_pnl_usd || 0) + (kpi?.unrealized_usd || 0);
  const allStats = kpi?.all || {
    pnl_usd: 0,
    wins: 0,
    losses: 0,
    wr: 0,
    lr: 0,
    count: 0
  };
  const todayStats = kpi?.today || {
    pnl_usd: 0,
    count: 0
  };
  const botList = bots || [];
  const runningBots = botList.filter(b => (b.running_dirs || []).length > 0).length;
  const openTrades = (positions || []).length;

  // Equity baseline for chart: starting value = current − cumulative PnL
  const cumPnl = allStats.pnl_usd || 0;
  const baseEquity = Math.max(0, totalEquity - cumPnl);

  // Net return / DD for the Portfolio block (from history)
  const trades = history || [];
  const cutoffMs = (() => {
    const now = Date.now();
    if (range === '24H') return now - 24 * 3600 * 1000;
    if (range === '7D') return now - 7 * 24 * 3600 * 1000;
    if (range === '30D') return now - 30 * 24 * 3600 * 1000;
    return 0;
  })();
  const inRange = trades.filter(t => {
    const ms = parseGmt7(t.time || t.closed_at || t.close_ts || '');
    return !isNaN(ms) && ms >= cutoffMs;
  }).sort((a, b) => parseGmt7(a.time || a.closed_at) - parseGmt7(b.time || b.closed_at));
  let cum = baseEquity,
    minE = baseEquity,
    maxE = baseEquity;
  for (const t of inRange) {
    cum += Number(t.pnl_usd || 0);
    if (cum < minE) minE = cum;
    if (cum > maxE) maxE = cum;
  }
  const netReturn = baseEquity ? (cum - baseEquity) / baseEquity * 100 : 0;
  const maxDdPct = maxE ? (minE - maxE) / maxE * 100 : 0;
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
  }, /*#__PURE__*/React.createElement(DKpi, {
    label: "Total portfolio",
    value: fmtUsd(totalEquity),
    sub: `Equity (Binance + spot)`,
    delta: netReturn,
    icon: "briefcase",
    color: "#8B5CF6",
    spark: sparks.equity
  }), /*#__PURE__*/React.createElement(DKpi, {
    label: "Active bots",
    value: `${runningBots} / ${botList.length}`,
    sub: `${openTrades} open trade${openTrades === 1 ? '' : 's'}`,
    delta: botList.length ? runningBots / botList.length * 100 : null,
    icon: "bot",
    color: "#3B82F6",
    spark: sparks.botActivity
  }), /*#__PURE__*/React.createElement(DKpi, {
    label: "Total PnL",
    value: `${(allStats.pnl_usd || 0) >= 0 ? '+' : '−'}${fmtUsd(Math.abs(allStats.pnl_usd || 0))}`,
    sub: `Today ${todayStats.pnl_usd >= 0 ? '+' : '−'}$${Math.abs(todayStats.pnl_usd).toFixed(2)} · ${todayStats.count} closes`,
    delta: baseEquity ? todayStats.pnl_usd / baseEquity * 100 : null,
    icon: "trending-up",
    color: "#10B981",
    spark: sparks.pnl
  }), /*#__PURE__*/React.createElement(DKpi, {
    label: "WR vs LR",
    value: `${(allStats.wr || 0).toFixed(1)}% / ${(allStats.lr || 0).toFixed(1)}%`,
    sub: `Wins ${allStats.wins} · Losses ${allStats.losses}`,
    delta: (kpi?.today?.wr || 0) - (allStats.wr || 0),
    icon: "percent",
    color: "#F97316",
    spark: sparks.wr
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 14,
      border: '1px solid #EEF0F4'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Portfolio performance"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      marginTop: 1
    }
  }, "Cumulative equity vs baseline \xB7 ", range)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      color: '#4B5563'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 2,
      background: '#6366F1',
      borderRadius: 2
    }
  }), "Portfolio"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      color: '#6B7280'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 2,
      background: '#CBD5E1',
      borderRadius: 2
    }
  }), "Baseline")), /*#__PURE__*/React.createElement(Tabs, {
    items: ['24H', '7D', '30D', 'ALL'],
    active: range,
    onChange: setRange
  }))), /*#__PURE__*/React.createElement(PortfolioChart, {
    trades: trades,
    range: range,
    baseEquity: baseEquity
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 14,
      marginTop: 10,
      paddingTop: 10,
      borderTop: '1px solid #F1F3F8'
    }
  }, [{
    l: 'Starting equity',
    v: fmtUsd(baseEquity)
  }, {
    l: 'Current equity',
    v: fmtUsd(totalEquity),
    c: '#0F172A'
  }, {
    l: 'Net return',
    v: `${netReturn >= 0 ? '+' : ''}${netReturn.toFixed(2)}%`,
    c: netReturn >= 0 ? '#059669' : '#DC2626'
  }, {
    l: 'Max drawdown',
    v: `${maxDdPct.toFixed(2)}%`,
    c: '#DC2626'
  }].map(m => /*#__PURE__*/React.createElement("div", {
    key: m.l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
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
      color: m.c || '#0F172A',
      marginTop: 2,
      letterSpacing: '-.01em'
    }
  }, m.v))))), /*#__PURE__*/React.createElement(AllocationCard, {
    snap: snap,
    addressAssets: addressAssets
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.6fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(BotFleetCard, {
    bots: botList
  }), /*#__PURE__*/React.createElement(OpenTrades, {
    positions: positions
  })));
};
window.DashboardScreen = DashboardScreen;