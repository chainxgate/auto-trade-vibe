/* ChainxGate — A.I Bot (modern redesign to match P.M Monitor vocabulary) */
const {
  useState,
  useEffect,
  useMemo
} = React;

/* ---------- INLINE GLYPHS (filled play / stop for crisp recognition) ---------- */
const PlayGlyph = ({
  size = 12
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M7 4.5v15a1 1 0 0 0 1.55.83l11-7.5a1 1 0 0 0 0-1.66l-11-7.5A1 1 0 0 0 7 4.5z"
}));
const StopGlyph = ({
  size = 12
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("rect", {
  x: "6",
  y: "6",
  width: "12",
  height: "12",
  rx: "1.5"
}));

/* ---------- DATA ---------- */
const AB_TICKER = [{
  s: 'BTC',
  p: 74_573.43,
  d: 0.88
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

/* ---------- API CLIENT (live bot fleet from ./data/bots.json) ---------- */

const transformBot = b => {
  const sym = String(b.coin || '').toUpperCase();
  const runningDirs = (b.running_dirs || []).map(d => String(d).toUpperCase());
  return {
    sym,
    tk: sym.toLowerCase(),
    pair: b.pair || `${sym}/USDT`,
    strat: b.strategy || 'Tier A Mirror',
    trades: Number(b.trades_24h) || 0,
    pnl: Number(b.profit_24h) || 0,
    pnlPct: 0,
    win: Number(b.win_rate) || 0,
    dirs: {
      long: !!b.allow_long,
      short: !!b.allow_short
    },
    running: runningDirs.length > 0,
    running_dirs: runningDirs,
    runtime: '—',
    health: Math.max(0, Math.min(100, Math.round(Number(b.win_rate) || 0))),
    exchange: 'Binance Futures',
    lastTrade: b.last_action_ts || '',
    heat: [],
    open_positions: Number(b.open_positions) || 0,
    live_pnl: Number(b.live_pnl) || 0,
    closed_24h: Number(b.closed_24h) || 0,
    wins_24h: Number(b.wins_24h) || 0,
    losses_24h: Number(b.losses_24h) || 0,
    ready_exchanges: Number(b.ready_exchanges) || 0
  };
};
const useApiBots = (rate = 3000) => {
  const [bots, setBots] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/bots.json').then(r => r.json()).then(j => {
      const list = (j && Array.isArray(j.bots) ? j.bots : []).map(transformBot);
      setBots(list);
      setLoaded(true);
      // publish to global so TopBar chips can reflect live bot status
      window.cxgBotStatus = list.reduce((m, b) => (m[b.sym] = b.running, m), {});
    }).catch(() => setLoaded(true));
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return {
    bots,
    loaded,
    reload: fetchOnce
  };
};
const useApiExchanges = (rate = 5000) => {
  const [exchanges, setExchanges] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/exchanges.json').then(r => r.json()).then(j => {
      if (j && j.ok !== false) {
        const ex = Array.isArray(j.exchanges) ? j.exchanges : [];
        setExchanges(ex);
        setCatalog(Array.isArray(j.catalog) ? j.catalog : []);
        // publish live exchange status for TopBar chip
        window.cxgExchangeStatus = ex.reduce((m, e) => {
          m[String(e.id || '').toLowerCase()] = !!e.connected;
          return m;
        }, {});
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return {
    exchanges,
    catalog,
    loaded,
    reload: fetchOnce
  };
};

/* ---------- SHARED VISUALS ---------- */
const AbSpark = ({
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
  const id = `abspk-${color.replace('#', '')}-${w}`;
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
    stopOpacity: ".35"
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
const AbTicker = () => /*#__PURE__*/React.createElement("div", {
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
}, AB_TICKER.map(t => /*#__PURE__*/React.createElement("div", {
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
const AbKpi = ({
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
}, sub), spark && /*#__PURE__*/React.createElement(AbSpark, {
  data: spark,
  color: color,
  w: 70,
  h: 22,
  fill: true
})));

/* ---------- BOT ROW (list item) ---------- */
const BotRow = ({
  b,
  active,
  onClick,
  onToggle
}) => {
  const up = b.pnl >= 0;
  const healthColor = b.health >= 70 ? '#10B981' : b.health >= 40 ? '#F59E0B' : '#EF4444';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto auto',
      gap: 12,
      alignItems: 'center',
      padding: '12px 14px',
      borderRadius: 12,
      border: `1px solid ${active ? '#C7D2FE' : '#EEF0F4'}`,
      background: active ? '#EEF0FF' : '#fff',
      cursor: 'pointer',
      boxShadow: active ? '0 4px 14px rgba(99,102,241,.10)' : '0 1px 2px rgba(17,24,39,.04)',
      transition: 'all 120ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${b.tk}.svg`,
    width: "30",
    height: "30"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 999,
      background: b.running ? '#10B981' : '#9CA3AF',
      border: '2px solid #fff',
      animation: b.running ? 'cxg-pulse 1.4s infinite' : 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
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
  }, b.sym, " xBot"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: b.running ? '#047857' : '#6B7280',
      letterSpacing: '.06em'
    }
  }, b.running ? 'RUNNING' : 'STOPPED')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      marginTop: 2
    }
  }, b.pair, " \xB7 ", b.strat)), /*#__PURE__*/React.createElement(AbSpark, {
    data: b.heat,
    color: up ? '#10B981' : '#EF4444',
    w: 60,
    h: 28,
    fill: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: up ? '#059669' : '#DC2626'
    }
  }, up ? '+' : '−', "$", Math.abs(b.pnl).toFixed(2)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      marginTop: 2
    }
  }, b.trades, " trades \xB7 ", b.win.toFixed(0), "%")), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onToggle();
    },
    style: {
      background: b.running ? '#FEF2F2' : '#ECFDF5',
      color: b.running ? '#DC2626' : '#047857',
      border: 'none',
      borderRadius: 8,
      padding: '7px 10px',
      fontSize: 11,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, b.running ? /*#__PURE__*/React.createElement(StopGlyph, {
    size: 10
  }) : /*#__PURE__*/React.createElement(PlayGlyph, {
    size: 10
  }), b.running ? 'Stop' : 'Start'));
};

/* ---------- BOT DETAIL PANE ---------- */
const BotDirectionsModal = ({
  b,
  onClose,
  onSave
}) => {
  const [dirs, setDirs] = useState(b.dirs);
  const dirBtn = (key, label, icon) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setDirs({
      ...dirs,
      [key]: !dirs[key]
    }),
    style: {
      flex: 1,
      padding: '14px 16px',
      borderRadius: 10,
      border: dirs[key] ? '1px solid #6366F1' : '1px solid #E5E7EB',
      background: dirs[key] ? '#6366F1' : '#fff',
      color: dirs[key] ? '#fff' : '#0F172A',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: dirs[key] ? '0 4px 12px rgba(99,102,241,.32)' : 'none',
      transition: 'all 160ms'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    stroke: 2.5
  }), label);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(15,23,42,.42)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'grid',
      placeItems: 'center',
      padding: 16,
      animation: 'cxg-tick 160ms ease both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: '#fff',
      borderRadius: 14,
      padding: 22,
      width: '100%',
      maxWidth: 460,
      boxShadow: '0 20px 50px rgba(15,23,42,.25), 0 4px 12px rgba(15,23,42,.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Bot Directions"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 4,
      lineHeight: 1.5
    }
  }, b.sym, "/USDT \xB7 save allowed directions before starting the bot")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      width: 30,
      height: 30,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      color: '#6B7280',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14,
    stroke: 2.5
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 10
    }
  }, "Allowed Directions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, dirBtn('long', 'LONG', 'arrow-up-right'), dirBtn('short', 'SHORT', 'arrow-down-right'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      background: '#FAFBFC',
      border: '1px solid #EEF0F4',
      borderRadius: 10,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Runtime behavior"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      lineHeight: 1.55
    }
  }, "Start uses the saved allowed directions. If the bot is stopped, Tier A paper positions still run normally, but no exchange intents are mirrored until the bot is started again.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      padding: '9px 18px',
      borderRadius: 8,
      border: '1px solid #E5E7EB',
      background: '#fff',
      color: '#1F2937',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onSave(dirs);
      onClose();
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 18px',
      borderRadius: 8,
      border: 'none',
      background: '#6366F1',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(99,102,241,.28)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "save",
    size: 13,
    stroke: 2.5
  }), " Save"))));
};
const BotPane = ({
  b,
  onToggle,
  onUpdate
}) => {
  const [cfgOpen, setCfgOpen] = useState(false);
  const sym = b ? b.sym : '';
  const data = useMemo(() => {
    const arr = [];
    let v = 100;
    for (let i = 0; i < 50; i++) {
      v += (Math.sin(i / 4 + sym.length) + (Math.random() - 0.45)) * 2.5;
      arr.push(v);
    }
    return arr;
  }, [sym]);
  if (!b) return null;
  const up = b.pnl >= 0;
  const W = 640,
    H = 280;
  const min = Math.min(...data),
    max = Math.max(...data);
  const rng = max - min || 1;
  const xy = (v, i) => [i / (data.length - 1) * W, H - (v - min) / rng * (H - 20) - 10];
  const line = 'M' + data.map((v, i) => xy(v, i).join(',')).join(' L');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const healthColor = b.health >= 70 ? '#10B981' : b.health >= 40 ? '#F59E0B' : '#EF4444';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EEF0F4',
      overflow: 'hidden'
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
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 48,
      height: 48,
      borderRadius: 14,
      background: '#F5F6FA',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `/assets/tokens/${b.tk}.svg`,
    width: "30",
    height: "30"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: -3,
      right: -3,
      width: 14,
      height: 14,
      borderRadius: 999,
      background: b.running ? '#10B981' : '#9CA3AF',
      border: '2px solid #fff',
      animation: b.running ? 'cxg-pulse 1.4s infinite' : 'none'
    }
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
  }, b.sym, " xBot"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: '3px 8px',
      borderRadius: 6,
      background: b.running ? '#ECFDF5' : '#F5F6FA',
      color: b.running ? '#047857' : '#6B7280',
      letterSpacing: '.06em'
    }
  }, b.running ? '● RUNNING' : '○ STOPPED'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 6,
      background: '#EEF0FF',
      color: '#4338CA',
      letterSpacing: '.06em'
    }
  }, b.strat.toUpperCase())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      marginTop: 4,
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", null, b.pair), /*#__PURE__*/React.createElement("span", null, "\xB7 ", b.exchange), /*#__PURE__*/React.createElement("span", null, "\xB7 Runtime ", b.runtime), /*#__PURE__*/React.createElement("span", null, "\xB7 Last trade ", b.lastTrade ? window.cxgFmt ? window.cxgFmt.fmtDateTime(b.lastTrade) : b.lastTrade : '—')))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, "24h PnL"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: up ? '#059669' : '#DC2626',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-.01em',
      lineHeight: 1.1
    }
  }, up ? '+' : '−', "$", Math.abs(b.pnl).toFixed(2)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: up ? '#059669' : '#DC2626',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, up ? '+' : '', b.pnlPct.toFixed(2), "%"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Bot equity \xB7 last 24h"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, ['1h', '4h', '1D', '7D', '30D'].map((tf, i) => /*#__PURE__*/React.createElement("button", {
    key: tf,
    style: {
      padding: '4px 10px',
      fontSize: 11,
      fontWeight: 600,
      border: 'none',
      background: i === 2 ? '#0F172A' : 'transparent',
      color: i === 2 ? '#fff' : '#6B7280',
      borderRadius: 6,
      cursor: 'pointer'
    }
  }, tf)))), /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: `gb-${b.sym}`,
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: up ? '#10B981' : '#EF4444',
    stopOpacity: ".28"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: up ? '#10B981' : '#EF4444',
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
    fill: `url(#gb-${b.sym})`
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    stroke: up ? '#10B981' : '#EF4444',
    strokeWidth: "2",
    fill: "none",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,1fr)',
      borderTop: '1px solid #F1F3F8'
    }
  }, [{
    l: 'Trades 24h',
    v: b.trades,
    c: '#0F172A'
  }, {
    l: 'Win rate',
    v: `${b.win.toFixed(1)}%`,
    c: '#0F172A'
  }, {
    l: 'Directions',
    v: `${(b.dirs.long ? 1 : 0) + (b.dirs.short ? 1 : 0)} / 2`,
    c: '#0F172A'
  }, {
    l: 'Health',
    v: `${b.health}`,
    c: healthColor
  }, {
    l: 'Runtime',
    v: b.runtime,
    c: '#0F172A'
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
  }, m.v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderTop: '1px solid #F1F3F8',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#FAFBFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontWeight: 700,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, "Allowed"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 9px',
      background: b.dirs.long ? '#ECFDF5' : '#F5F6FA',
      color: b.dirs.long ? '#047857' : '#9CA3AF',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 11,
    stroke: 2.5
  }), " LONG"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 9px',
      background: b.dirs.short ? '#FEF2F2' : '#F5F6FA',
      color: b.dirs.short ? '#B91C1C' : '#9CA3AF',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-down-right",
    size: 11,
    stroke: 2.5
  }), " SHORT")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCfgOpen(true),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      padding: '7px 12px',
      borderRadius: 8,
      border: '1px solid #E5E7EB',
      background: '#fff',
      cursor: 'pointer',
      color: '#1F2937'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 13,
    stroke: 2
  }), " Configure"), /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      padding: '7px 14px',
      borderRadius: 8,
      border: 'none',
      background: b.running ? '#EF4444' : '#6366F1',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: b.running ? '0 4px 12px rgba(239,68,68,.28)' : '0 4px 12px rgba(99,102,241,.28)'
    }
  }, b.running ? /*#__PURE__*/React.createElement(StopGlyph, {
    size: 12
  }) : /*#__PURE__*/React.createElement(PlayGlyph, {
    size: 12
  }), " ", b.running ? 'Stop bot' : 'Start bot')), cfgOpen && onUpdate && /*#__PURE__*/React.createElement(BotDirectionsModal, {
    b: b,
    onClose: () => setCfgOpen(false),
    onSave: dirs => onUpdate({
      ...b,
      dirs
    })
  }));
};

/* ---------- TAB PANELS ---------- */
const AllBotsPanel = ({
  bots,
  selected,
  setSelected,
  onToggle,
  onUpdate,
  filter,
  setFilter
}) => {
  const filtered = bots.filter(b => {
    if (filter === 'Running') return b.running;
    if (filter === 'Stopped') return !b.running;
    if (filter === 'Profitable') return b.pnl >= 0;
    if (filter === 'Losing') return b.pnl < 0;
    return true;
  });
  const running = filtered.filter(b => b.running).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
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
  }, "Bot fleet"), /*#__PURE__*/React.createElement("span", {
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
  }), running, " running")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, filtered.length, " bots")), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "Search bots\u2026",
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
    items: ['All', 'Running', 'Stopped', 'Profitable', 'Losing'],
    active: filter,
    onChange: setFilter
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      margin: '0 -6px',
      paddingRight: 4,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
      alignContent: 'start'
    }
  }, filtered.map(b => /*#__PURE__*/React.createElement(BotRow, {
    key: b.sym,
    b: b,
    active: selected?.sym === b.sym,
    onClick: () => setSelected(b),
    onToggle: () => onToggle(b.sym)
  })))), /*#__PURE__*/React.createElement(BotPane, {
    b: selected,
    onToggle: () => selected && onToggle(selected.sym),
    onUpdate: onUpdate
  }));
};
const RiskPanel = () => {
  const [stop, setStop] = useState(2.5);
  const [risk, setRisk] = useState(1.0);
  const [maxPos, setMaxPos] = useState(10);
  const [dd, setDd] = useState(5);
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
      fontSize: 16,
      fontWeight: 700,
      color: '#0F172A',
      marginBottom: 4
    }
  }, "Risk management"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 22
    }
  }, "Global limits applied to every bot in the fleet."), [{
    l: 'Per-trade stop loss',
    h: 'Max loss tolerated per position before auto-exit.',
    v: stop,
    set: setStop,
    min: 0.5,
    max: 10,
    step: 0.1,
    unit: '%'
  }, {
    l: 'Risk per trade',
    h: 'Percentage of equity allocated per position.',
    v: risk,
    set: setRisk,
    min: 0.1,
    max: 5,
    step: 0.1,
    unit: '%'
  }, {
    l: 'Max concurrent positions',
    h: 'Hard cap on simultaneously open trades across all bots.',
    v: maxPos,
    set: setMaxPos,
    min: 1,
    max: 30,
    step: 1,
    unit: ''
  }, {
    l: 'Daily drawdown limit',
    h: 'Disables all bots if portfolio drops this much in a day.',
    v: dd,
    set: setDd,
    min: 1,
    max: 20,
    step: 0.5,
    unit: '%'
  }].map(row => /*#__PURE__*/React.createElement("div", {
    key: row.l,
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
  }, row.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 1
    }
  }, row.h)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#6366F1',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, row.v, row.unit)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: row.min,
    max: row.max,
    step: row.step,
    value: row.v,
    onChange: e => row.set(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#6366F1'
    }
  })))), /*#__PURE__*/React.createElement("div", {
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
  }, "RISK PROFILE"), /*#__PURE__*/React.createElement("div", {
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
  }, "1% risk/trade \xB7 10 positions \xB7 5% daily DD limit")), /*#__PURE__*/React.createElement("div", {
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
  }, "Auto-disable triggers"), [{
    i: 'alert-triangle',
    l: '3 consecutive losses',
    on: true
  }, {
    i: 'trending-down',
    l: 'Daily DD > 5%',
    on: true
  }, {
    i: 'wifi-off',
    l: 'Exchange disconnect',
    on: true
  }, {
    i: 'clock',
    l: 'Stale signal > 10m',
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
      width: 28,
      height: 28,
      borderRadius: 8,
      background: '#F5F6FA',
      display: 'grid',
      placeItems: 'center',
      color: '#6B7280'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.i,
    size: 13
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 12,
      color: '#0F172A',
      fontWeight: 600
    }
  }, c.l), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 22,
      borderRadius: 999,
      background: c.on ? '#6366F1' : '#E5E7EB',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 2,
      left: c.on ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: 999,
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,.2)'
    }
  })))))));
};
const NotificationsPanel = () => /*#__PURE__*/React.createElement("div", {
  style: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #EEF0F4',
    padding: 22,
    maxWidth: 720
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 4
  }
}, "Notification channels"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 22
  }
}, "How bots let you know about key events."), [{
  i: 'smartphone',
  l: 'Mobile push',
  sub: 'iOS & Android app — instant',
  on: true
}, {
  i: 'mail',
  l: 'Email digest',
  sub: 'Hourly summary + critical alerts',
  on: true
}, {
  i: 'send',
  l: 'Telegram bot',
  sub: 'Direct messages to @chainxgate_bot',
  on: false
}, {
  i: 'link',
  l: 'Custom webhook',
  sub: 'POST to your endpoint',
  on: false
}, {
  i: 'slack',
  l: 'Slack workspace',
  sub: 'Per-channel routing',
  on: false
}].map(c => /*#__PURE__*/React.createElement("div", {
  key: c.l,
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 0',
    borderTop: '1px solid #F1F3F8'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#F5F6FA',
    display: 'grid',
    placeItems: 'center',
    color: '#6366F1'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: c.i === 'slack' ? 'hash' : c.i,
  size: 16
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A'
  }
}, c.l), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  }
}, c.sub)), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 38,
    height: 22,
    borderRadius: 999,
    background: c.on ? '#6366F1' : '#E5E7EB',
    position: 'relative',
    cursor: 'pointer'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: 2,
    left: c.on ? 18 : 2,
    width: 18,
    height: 18,
    borderRadius: 999,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)'
  }
})))));
const EXCHANGES = [{
  id: 'BINANCE',
  label: 'Binance',
  color: '#F0B90B',
  tint: '#FFFBEB'
}, {
  id: 'COINBASE',
  label: 'Coinbase',
  color: '#0052FF',
  tint: '#EFF6FF'
}];
const ExchangeConnectionModal = ({
  onClose,
  onSave
}) => {
  const [exId, setExId] = useState(null);
  const [accountLabel, setAccountLabel] = useState('Main Account');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [perms] = useState(['Read', 'Trade']);
  const ex = EXCHANGES.find(e => e.id === exId);
  const exCard = e => {
    const active = exId === e.id;
    return /*#__PURE__*/React.createElement("button", {
      key: e.id,
      onClick: () => setExId(e.id),
      style: {
        flex: 1,
        padding: '14px 16px',
        borderRadius: 10,
        border: `1px solid ${active ? e.color : '#E5E7EB'}`,
        background: active ? e.tint : '#fff',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: active ? `0 4px 10px ${e.color}26` : 'none',
        transition: 'all 160ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 999,
        background: e.tint,
        display: 'grid',
        placeItems: 'center',
        color: e.color,
        fontSize: 11,
        fontWeight: 800,
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, e.id.slice(0, 1)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        color: e.color,
        letterSpacing: '.08em'
      }
    }, e.id), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: '#0F172A',
        marginTop: 2
      }
    }, e.label)));
  };
  const inp = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    background: '#fff',
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    boxSizing: 'border-box'
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(15,23,42,.42)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'grid',
      placeItems: 'center',
      padding: 16,
      overflowY: 'auto',
      animation: 'cxg-tick 160ms ease both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: '#fff',
      borderRadius: 14,
      padding: 24,
      width: '100%',
      maxWidth: 720,
      boxShadow: '0 20px 50px rgba(15,23,42,.25), 0 4px 12px rgba(15,23,42,.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Exchange Connection"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 4
    }
  }, "Choose one of the allowed exchanges and store its API credentials.")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      width: 30,
      height: 30,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      color: '#6B7280',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14,
    stroke: 2.5
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 8
    }
  }, "Exchange Id"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, EXCHANGES.map(exCard))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 8
    }
  }, "Label"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: ex ? ex.tint : '#EEF0FF',
      border: `1px solid ${ex ? ex.color + '33' : '#C7D2FE'}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 8,
      background: '#fff',
      display: 'grid',
      placeItems: 'center',
      color: ex ? ex.color : '#6366F1'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plug",
    size: 16,
    stroke: 2
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, ex ? ex.label : 'Pick an exchange'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 1
    }
  }, ex ? `Brand styling auto-applied for ${ex.label}.` : 'Select a preset above to auto-fill the exchange label and brand styling.')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Account Label"), /*#__PURE__*/React.createElement("input", {
    value: accountLabel,
    onChange: e => setAccountLabel(e.target.value),
    style: {
      ...inp,
      fontFamily: 'inherit'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Permissions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 10px',
      border: '1px solid #C7D2FE',
      background: '#EEF0FF',
      borderRadius: 8,
      minHeight: 38,
      boxSizing: 'border-box'
    }
  }, perms.map(p => /*#__PURE__*/React.createElement("span", {
    key: p,
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      background: '#fff',
      border: '1px solid #C7D2FE',
      color: '#4338CA',
      borderRadius: 999
    }
  }, p)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "API Key"), /*#__PURE__*/React.createElement("input", {
    value: apiKey,
    onChange: e => setApiKey(e.target.value),
    placeholder: "Paste API key",
    style: inp
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "API Secret"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: apiSecret,
    onChange: e => setApiSecret(e.target.value),
    placeholder: "Paste API secret",
    style: inp
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      background: '#EEF0FF',
      border: '1px solid #C7D2FE',
      borderRadius: 10,
      padding: '14px 16px',
      fontSize: 12,
      color: '#4338CA',
      lineHeight: 1.55
    }
  }, "If API key or API secret is empty, bottrade will keep the paper engine running but skip sending exchange intents for this venue."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      padding: '9px 18px',
      borderRadius: 8,
      border: '1px solid #E5E7EB',
      background: '#fff',
      color: '#1F2937',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onSave({
        id: exId,
        label: ex ? ex.label : '',
        accountLabel,
        apiKey,
        apiSecret
      });
      onClose();
    },
    disabled: !exId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 18px',
      borderRadius: 8,
      border: 'none',
      background: exId ? '#6366F1' : '#C7D2FE',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      cursor: exId ? 'pointer' : 'not-allowed',
      boxShadow: exId ? '0 4px 12px rgba(99,102,241,.28)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "save",
    size: 13,
    stroke: 2.5
  }), " Save Exchange"))));
};
const ConfirmModal = ({
  title,
  body,
  confirmLabel,
  danger,
  onCancel,
  onConfirm
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onCancel,
  style: {
    position: 'fixed',
    inset: 0,
    zIndex: 220,
    background: 'rgba(15,23,42,.42)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'grid',
    placeItems: 'center',
    padding: 16,
    animation: 'cxg-tick 160ms ease both'
  }
}, /*#__PURE__*/React.createElement("div", {
  onClick: e => e.stopPropagation(),
  style: {
    background: '#fff',
    borderRadius: 14,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 50px rgba(15,23,42,.25), 0 4px 12px rgba(15,23,42,.12)'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: danger ? '#FEF2F2' : '#EEF0FF',
    color: danger ? '#DC2626' : '#4338CA',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: danger ? 'alert-triangle' : 'info',
  size: 18,
  stroke: 2.25
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0F172A'
  }
}, title), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 1.5
  }
}, body))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18
  }
}, /*#__PURE__*/React.createElement("button", {
  onClick: onCancel,
  style: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#1F2937',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  }
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  onClick: onConfirm,
  style: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: danger ? '#EF4444' : '#6366F1',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: danger ? '0 4px 12px rgba(239,68,68,.28)' : '0 4px 12px rgba(99,102,241,.28)'
  }
}, confirmLabel || 'Confirm'))));
const ApiPanel = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    exchanges,
    loaded,
    reload
  } = useApiExchanges(5000);
  const [busy, setBusy] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const onSave = async payload => {
    try {
      await fetch('./data/config.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: payload.id,
          label: payload.label,
          account_label: payload.accountLabel,
          api_key: payload.apiKey,
          api_secret: payload.apiSecret,
          permissions: ['read', 'trade']
        })
      });
    } catch (e) {}
    reload();
  };
  const onSync = async id => {
    setBusy(id + ':sync');
    try {
      await fetch(`./data/config.json`, {
        method: 'POST'
      });
    } catch (e) {}
    setBusy(null);
    reload();
  };
  const doRemove = async id => {
    setConfirmId(null);
    setBusy(id + ':remove');
    try {
      const resp = await fetch(`./data/config.json`, {
        method: 'DELETE'
      });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok || j.ok === false) {
        window.alert('Remove failed: ' + (j.error || resp.status));
      }
    } catch (e) {
      window.alert('Remove failed: ' + e.message);
    }
    setBusy(null);
    reload();
  };
  const confirmTarget = confirmId ? exchanges.find(x => x.id === confirmId) : null;
  return /*#__PURE__*/React.createElement("div", {
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
      alignItems: 'flex-start',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Exchange connections"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 2
    }
  }, "API keys bots use to place orders. Encrypted at rest.")), /*#__PURE__*/React.createElement(Btn, {
    variant: "primary",
    icon: "plus",
    onClick: () => setModalOpen(true)
  }, "Add exchange")), modalOpen && /*#__PURE__*/React.createElement(ExchangeConnectionModal, {
    onClose: () => setModalOpen(false),
    onSave: onSave
  }), (() => {
    const visible = exchanges.filter(x => x.has_api_key || x.has_api_secret);
    if (loaded && visible.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '24px 0',
          fontSize: 12,
          color: '#6B7280',
          textAlign: 'center'
        }
      }, "No exchanges connected yet. Click ", /*#__PURE__*/React.createElement("b", null, "Add exchange"), " to link one.");
    }
    return null;
  })(), exchanges.filter(x => x.has_api_key || x.has_api_secret).map(x => {
    const connected = !!x.connected;
    const perms = (x.permissions_label || 'Read').split(',').map(s => s.trim()).filter(Boolean);
    const label = x.label || (x.id || '').toUpperCase();
    const brandHex = x.brand_hex || '#6366F1';
    const brandBg = x.brand_bg || '#EEF0FF';
    const masked = x.masked_api_key || (x.has_api_key ? '••••' : '—');
    const lastSync = x.last_sync_at || '—';
    return /*#__PURE__*/React.createElement("div", {
      key: x.id,
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto auto',
        gap: 14,
        alignItems: 'center',
        padding: '14px 0',
        borderTop: '1px solid #F1F3F8'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: brandBg,
        display: 'grid',
        placeItems: 'center',
        color: brandHex,
        fontWeight: 700,
        fontSize: 13,
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, label[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, label, x.account_label ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: '#6B7280'
      }
    }, " \xB7 ", x.account_label) : null), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace',
        marginTop: 2
      }
    }, "Key ", masked, " \xB7 Last sync ", lastSync)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4
      }
    }, perms.map(p => /*#__PURE__*/React.createElement("span", {
      key: p,
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        background: '#EEF0FF',
        color: '#4338CA'
      }
    }, p))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 999,
        background: connected ? '#ECFDF5' : '#FFFBEB',
        color: connected ? '#047857' : '#B45309',
        textTransform: 'uppercase',
        letterSpacing: '.06em'
      }
    }, connected ? '● Connected' : '◐ Read only'), /*#__PURE__*/React.createElement("button", {
      onClick: () => onSync(x.id),
      disabled: busy === x.id + ':sync',
      style: {
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: '6px 10px',
        cursor: busy === x.id + ':sync' ? 'wait' : 'pointer',
        color: '#4338CA',
        fontSize: 11,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw",
      size: 12
    }), " Sync"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setConfirmId(x.id),
      disabled: busy === x.id + ':remove',
      style: {
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: 8,
        cursor: busy === x.id + ':remove' ? 'wait' : 'pointer',
        color: '#6B7280'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2",
      size: 14
    })));
  }), confirmTarget && /*#__PURE__*/React.createElement(ConfirmModal, {
    title: "Remove exchange connection?",
    body: `This will delete the ${confirmTarget.label || confirmTarget.id} connection (${confirmTarget.account_label || 'Main Account'}). Bots will stop mirroring orders to this venue until you reconnect.`,
    confirmLabel: "Remove",
    danger: true,
    onCancel: () => setConfirmId(null),
    onConfirm: () => doRemove(confirmTarget.id)
  }));
};

/* ---------- SCREEN ---------- */
const AIBotScreen = () => {
  const [tab, setTab] = useState('All Bots');
  const [filter, setFilter] = useState('All');
  const {
    bots,
    loaded,
    reload
  } = useApiBots(3000);
  const [selectedSym, setSelectedSym] = useState(null);
  const selected = bots.find(b => b.sym === selectedSym) || bots[0] || null;
  const setSelected = b => setSelectedSym(b ? b.sym : null);
  const toggle = async sym => {
    const bot = bots.find(b => b.sym === sym);
    if (!bot) return;
    const coin = encodeURIComponent(sym);
    const url = bot.running ? `./data/config.json` : `./data/config.json`;
    try {
      await fetch(url, {
        method: 'POST'
      });
    } catch (e) {}
    reload();
  };
  const updateBot = async newBot => {
    const coin = encodeURIComponent(newBot.sym);
    try {
      await fetch(`./data/config.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allow_long: !!newBot.dirs.long,
          allow_short: !!newBot.dirs.short
        })
      });
    } catch (e) {}
    reload();
  };
  const running = bots.filter(b => b.running).length;
  const totalPnl = bots.reduce((a, b) => a + b.pnl, 0);
  const totalTrades = bots.reduce((a, b) => a + b.trades, 0);
  const wins = bots.length ? bots.reduce((a, b) => a + b.win, 0) / bots.length : 0;
  const readyExchanges = bots.length ? bots[0].ready_exchanges || 0 : 0;

  // Heartbeat tick — refresh time every 1s + reflect fleet status
  const [, setHbTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHbTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const exLabel = readyExchanges > 0 ? `${readyExchanges} exchange${readyExchanges === 1 ? '' : 's'}` : 'no exchange';
  const hb = !loaded ? {
    label: 'Heartbeat SYNC · loading',
    color: '#6B7280',
    bg: '#F5F6FA'
  } : readyExchanges === 0 ? {
    label: `Heartbeat WAIT · ${exLabel} ready`,
    color: '#F59E0B',
    bg: '#FFFBEB'
  } : running > 0 ? {
    label: `Heartbeat OK · ${running} live · ${exLabel}`,
    color: '#10B981',
    bg: '#ECFDF5'
  } : {
    label: `Heartbeat IDLE · all stopped · ${exLabel}`,
    color: '#F59E0B',
    bg: '#FFFBEB'
  };
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
  }, /*#__PURE__*/React.createElement(AbKpi, {
    label: "Active bots",
    value: `${running} / ${bots.length}`,
    sub: `${readyExchanges} exchange${readyExchanges === 1 ? '' : 's'} ready`,
    delta: 2.1,
    icon: "bot",
    color: "#8B5CF6",
    spark: [3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5]
  }), /*#__PURE__*/React.createElement(AbKpi, {
    label: "Trades today",
    value: totalTrades,
    sub: "All Tier A mirrors",
    delta: 3.8,
    icon: "activity",
    color: "#3B82F6",
    spark: [4, 6, 8, 10, 12, 14, 16, 18, 19, 20, 20, 20]
  }), /*#__PURE__*/React.createElement(AbKpi, {
    label: "Realized PnL",
    value: `+$${totalPnl.toFixed(2)}`,
    sub: "24h across fleet",
    delta: 4.3,
    icon: "trending-up",
    color: "#A855F7",
    spark: [2, 5, 10, 14, 18, 24, 28, 32, 38, 42, 46, 48]
  }), /*#__PURE__*/React.createElement(AbKpi, {
    label: "Win rate",
    value: `${wins.toFixed(1)}%`,
    sub: "Fleet-wide average",
    delta: 1.2,
    icon: "target",
    color: "#10B981",
    spark: [78, 80, 82, 83, 85, 86, 86, 87, 87, 79, 79, 79]
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
    items: ['All Bots', 'Risk Management', 'Notifications', 'API Connections'],
    active: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: hb.color,
      fontFamily: 'JetBrains Mono, monospace',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 10px',
      background: hb.bg,
      borderRadius: 999,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: hb.color,
      animation: running > 0 ? 'cxg-pulse 1.4s infinite' : 'none'
    }
  }), hb.label, " \xB7 ", new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }))), tab === 'All Bots' && /*#__PURE__*/React.createElement(AllBotsPanel, {
    bots: bots,
    selected: selected,
    setSelected: setSelected,
    onToggle: toggle,
    onUpdate: updateBot,
    filter: filter,
    setFilter: setFilter
  }), tab === 'Risk Management' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || RiskPanel, null), tab === 'Notifications' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || NotificationsPanel, null), tab === 'API Connections' && /*#__PURE__*/React.createElement(window.__LOCK_BANNER__ || ApiPanel, null)));
};
window.AIBotScreen = AIBotScreen;