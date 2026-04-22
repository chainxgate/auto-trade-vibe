/* ChainxGate — P.M Monitor · Tracking Intelligence (detail-view tracking module)
   Usage: <DetailView s={signal}/> inside DetailPane, below the tier row.
   Pulls live Engine detail from ./data/metric.json */

const useApiDetail = (pairKey, direction, rate = 2000) => {
  const [detail, setDetail] = React.useState(null);
  React.useEffect(() => {
    if (!pairKey || !direction) {
      setDetail(null);
      return;
    }
    let alive = true;
    const fetchOnce = async () => {
      try {
        const r = await fetch(`./data/metric.json`);
        if (!r.ok) return;
        const j = await r.json();
        if (!alive) return;
        setDetail(j);
      } catch (e) {}
    };
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    // Browsers throttle setInterval to ≥1/min when tab is hidden. Refetch
    // immediately when the tab becomes visible / window regains focus so the
    // detail panel never lingers with stale pnl/streak data.
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
  }, [pairKey, direction, rate]);
  return detail;
};

/* ---------- 1. SL → Entry → Live → TP RISK RAIL ---------- */

const PriceRail = ({
  s,
  detail
}) => {
  const long = s.side === 'LONG';
  // Consistent layout: LEFT = SL (loss side, red), RIGHT = TP (profit side, green),
  // regardless of LONG/SHORT. For SHORT, SL is at a HIGHER price than entry,
  // so we map: 0% = SL, 100% = TP with correct direction.
  const pct = v => {
    const range = long ? (v - s.stop) / (s.target - s.stop) // LONG:  SL < Entry < TP
    : (s.stop - v) / (s.stop - s.target); // SHORT: SL > Entry > TP
    if (!Number.isFinite(range)) return 0;
    return Math.max(0, Math.min(1, range)) * 100;
  };
  const ePct = pct(s.entry);
  const lPct = pct(s.last);
  const toSL = Math.abs((s.last - s.stop) / s.last * 100);
  const toTP = Math.abs((s.target - s.last) / s.last * 100);

  // Real MFE/MAE from engine detail if available (else fall back to current pnl)
  const mfeReal = detail && detail.mfe_so_far != null ? Number(detail.mfe_so_far) * 100 : null;
  const maeReal = detail && detail.mae_so_far != null ? Number(detail.mae_so_far) * 100 : null;
  const mfe = (mfeReal != null ? mfeReal : Math.max(0, s.pct)).toFixed(2);
  const mae = (maeReal != null ? maeReal : Math.min(0, s.pct)).toFixed(2);
  const rr = (toTP / Math.max(toSL, 0.01)).toFixed(2);

  // Lock = profit locked by current SL position (SL moved past entry)
  // LONG: SL > entry → lock = (SL − entry)/entry · 100
  // SHORT: SL < entry → lock = (entry − SL)/entry · 100
  const entry = Number(s.entry) || 0,
    sl = Number(s.stop) || 0;
  let lockNum = 0;
  if (entry > 0 && sl > 0) {
    if (long && sl > entry) lockNum = (sl - entry) / entry * 100;
    if (!long && sl < entry) lockNum = (entry - sl) / entry * 100;
  }
  const lock = lockNum > 0 ? lockNum.toFixed(2) : '0';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 16px',
      borderTop: '1px solid #F1F3F8',
      background: '#FCFCFD'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '.1em'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#DC2626'
    }
  }, "SL"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#059669'
    }
  }, "TP")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 6,
      borderRadius: 999,
      background: 'linear-gradient(90deg,#FCA5A5 0%,#FDBA74 28%,#FCD34D 52%,#BEF264 76%,#6EE7B7 100%)'
    }
  }, /*#__PURE__*/React.createElement(Marker, {
    x: ePct,
    label: "Entry",
    value: s.entry,
    color: "#475569",
    offset: -34
  }), /*#__PURE__*/React.createElement(Marker, {
    x: lPct,
    label: "Live",
    value: s.last,
    color: "#0F172A",
    offset: -34,
    live: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 20,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      fontWeight: 700,
      color: '#6B7280'
    }
  }, /*#__PURE__*/React.createElement("span", null, s.stop), /*#__PURE__*/React.createElement("span", null, s.target)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginTop: 10,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement(StatPill, {
    k: "to SL",
    v: `${toSL.toFixed(1)}%`,
    c: "#DC2626"
  }), /*#__PURE__*/React.createElement(StatPill, {
    k: "to TP",
    v: `${toTP.toFixed(1)}%`,
    c: "#059669"
  }), /*#__PURE__*/React.createElement(StatPill, {
    k: "MFE",
    v: `${mfe}%`,
    c: "#059669"
  }), /*#__PURE__*/React.createElement(StatPill, {
    k: "MAE",
    v: `${mae}%`,
    c: "#DC2626"
  }), /*#__PURE__*/React.createElement(StatPill, {
    k: "Lock",
    v: `${lock}%`,
    c: "#4338CA"
  }), /*#__PURE__*/React.createElement(StatPill, {
    k: "RR",
    v: rr,
    c: "#0F172A"
  })));
};
const Marker = ({
  x,
  label,
  value,
  color,
  offset = 0,
  live
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: `${x}%`,
    top: -2,
    transform: 'translateX(-50%)',
    pointerEvents: 'none'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: '50%',
    bottom: 16,
    transform: 'translateX(-50%)',
    fontSize: 9,
    fontWeight: 800,
    color,
    whiteSpace: 'nowrap',
    letterSpacing: '.06em'
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 16,
    height: 16,
    borderRadius: 999,
    background: '#fff',
    border: `3px solid ${color}`,
    boxShadow: '0 2px 6px rgba(0,0,0,.12)',
    position: 'relative'
  }
}, live && /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    inset: -6,
    borderRadius: 999,
    border: `2px solid ${color}`,
    opacity: .3,
    animation: 'cxg-pulse 1.4s infinite'
  }
})), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: 22,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 10,
    fontWeight: 700,
    color,
    fontFamily: 'JetBrains Mono, monospace',
    whiteSpace: 'nowrap'
  }
}, value));
const StatPill = ({
  k,
  v,
  c
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: '#9CA3AF',
    fontWeight: 600
  }
}, k), /*#__PURE__*/React.createElement("span", {
  style: {
    color: c,
    fontWeight: 800
  }
}, v));

/* ---------- 2. 4 STAT TILES (Action / Phase / Peak / MFE-MAE) ---------- */

const StatTiles = ({
  s
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
  const mfe = s.pct >= 0 ? s.pct : Math.abs(s.pct) * 0.3;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 10,
      padding: '16px 18px',
      background: '#FAFBFF'
    }
  }, /*#__PURE__*/React.createElement(Tile, {
    label: "Current Action",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: '#0F172A',
        letterSpacing: '-.02em'
      }
    }, "HOLD"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#6B7280',
        marginTop: 3
      }
    }, "T+1 \xB7 stage 1"))
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Phase",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: phaseColor,
        letterSpacing: '-.01em'
      }
    }, s.tier.replace(/_/g, ' ')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#6B7280',
        marginTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, s.tier.replace(/_/g, ' '), " ", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 9,
      stroke: 2.5
    }), " ", s.next.replace(/_/g, ' '), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF'
      }
    }, "| conf=40%")))
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Peak Reference",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: long ? '#059669' : '#DC2626',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '-.02em'
      }
    }, Math.abs(mfe * 7).toFixed(1), "% @T14"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#6B7280',
        marginTop: 4
      }
    }, "avg=1.3% | n=6 \xB7 DNA_REGIME_EXACT"))
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "MFE / MAE",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '-.01em'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#059669'
      }
    }, "+", mfe.toFixed(2), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF'
      }
    }, " / "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#DC2626'
      }
    }, s.pct < 0 ? s.pct.toFixed(2) : '-0.00', "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#6B7280',
        marginTop: 4
      }
    }, "RR = ", (mfe / Math.max(Math.abs(s.pct < 0 ? s.pct : 0.01), 0.01)).toFixed(2)))
  }));
};
const Tile = ({
  label,
  body
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #EEF0F4',
    padding: 14
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 9,
    fontWeight: 700,
    color: '#6B7280',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    marginBottom: 8
  }
}, label), body);

/* ---------- 3. OPERATOR EXPLAIN + V6 SOURCES (two-column) ---------- */

const ExplainAndSources = ({
  s
}) => {
  const [action, setAction] = React.useState('HOLD');
  const actions = [{
    k: 'EXIT',
    hint: '(−5.0%)'
  }, {
    k: 'action 5',
    hint: '(≥ 2.8%)'
  }, {
    k: 'HOLD',
    hint: '(0.5% && −2.0%)'
  }, {
    k: 'action 4',
    hint: '(≤ 3.5% && −2.0%)'
  }, {
    k: 'action 3',
    hint: '(≥ 1.0%)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      padding: '0 18px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #EEF0F4',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cpu",
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
  }, "OPERATOR EXPLAIN")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FAFBFF',
      border: '1px solid #EEF0F4',
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "HOLD ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontFamily: 'JetBrains Mono, monospace',
      color: '#6B7280',
      fontWeight: 600,
      marginLeft: 4
    }
  }, "T+1 \xB7 stage 1")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#4B5563',
      marginBottom: 8
    }
  }, "Phase ", s.tier.replace(/_/g, ' '), " ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 10,
    stroke: 2.5,
    style: {
      color: '#9CA3AF',
      verticalAlign: 'middle',
      margin: '0 2px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#FEF3C7',
      color: '#92400E',
      padding: '2px 7px',
      borderRadius: 6,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '.04em'
    }
  }, "phase 3")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      borderLeft: '2px solid #DC2626',
      paddingLeft: 8
    }
  }, "Gate ", /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 11,
    stroke: 3,
    style: {
      color: '#DC2626'
    }
  }), " stage 1: action 3 requires pnl \u2265 1.0%, current=+0.52%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 6
    }
  }, actions.map(a => {
    const on = a.k === action;
    return /*#__PURE__*/React.createElement("button", {
      key: a.k,
      onClick: () => setAction(a.k),
      style: {
        padding: '8px 4px',
        borderRadius: 8,
        border: on ? 'none' : '1px solid #E5E7EB',
        background: on ? '#6366F1' : '#fff',
        color: on ? '#fff' : '#0F172A',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
        boxShadow: on ? '0 4px 10px rgba(99,102,241,.28)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '.04em'
      }
    }, a.k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        fontFamily: 'JetBrains Mono, monospace',
        opacity: .75
      }
    }, a.hint));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #EEF0F4',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 14,
    stroke: 2.2,
    style: {
      color: '#F59E0B'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: '#0F172A',
      letterSpacing: '.1em'
    }
  }, "V6 SOURCES")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Source, {
    n: 1,
    title: "PEAK REFERENCE",
    color: "#10B981",
    body: `peak=7.1% @T14 | avg=1.3% | n=6\nDNA_REGIME_EXACT`
  }), /*#__PURE__*/React.createElement(Source, {
    n: 2,
    title: "PHASE DETECT",
    color: "#10B981",
    body: `${s.tier.replace(/_/g, ' ')} | conf=40% |\ntick=ACCELERATING |\nadj=tick_log(non-ACCELERATING,phase 5=66%,q=0%)`
  }), /*#__PURE__*/React.createElement(Source, {
    n: 3,
    title: "TIER CONFIG",
    color: "#10B981",
    body: `stage 1 BLOCKED: stage 1: action 3 requires pnl ≥ 1.0%, current=+0.52%`
  }), /*#__PURE__*/React.createElement(Source, {
    n: 4,
    title: "OBE ALERT",
    color: "#9CA3AF",
    body: "no alert",
    dim: true
  }), /*#__PURE__*/React.createElement(Source, {
    n: 5,
    title: "RULEBASE",
    color: "#9CA3AF",
    body: "inactive",
    dim: true,
    wide: true
  }))));
};
const Source = ({
  n,
  title,
  color,
  body,
  dim,
  wide
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: dim ? '#FAFBFF' : '#F0FDF4',
    border: `1px solid ${dim ? '#EEF0F4' : '#BBF7D0'}`,
    borderRadius: 10,
    padding: '10px 11px',
    gridColumn: wide ? 'span 2' : 'auto'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 16,
    height: 16,
    borderRadius: 999,
    background: dim ? '#E5E7EB' : '#10B981',
    color: '#fff',
    fontSize: 9,
    fontWeight: 800,
    display: 'grid',
    placeItems: 'center'
  }
}, n), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 9,
    fontWeight: 800,
    color: dim ? '#9CA3AF' : '#047857',
    letterSpacing: '.08em'
  }
}, title)), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9.5,
    color: dim ? '#9CA3AF' : '#14532D',
    lineHeight: 1.5,
    whiteSpace: 'pre-line'
  }
}, body));

/* ---------- 4. PNL TRAJECTORY (PnL + MFE + MAE lines) ---------- */

const PnlTrajectory = ({
  s,
  detail
}) => {
  const W = 880,
    H = 230,
    pad = {
      l: 38,
      r: 16,
      t: 16,
      b: 26
    };

  // Pull pnl/mae/mfe per action timeline entry (one point per Engine decision).
  // Timeline is DESC by decision_id from server → reverse to chronological.
  const tlRaw = detail && Array.isArray(detail.timeline) ? detail.timeline : [];
  const tl = [...tlRaw].reverse();
  const N = Math.max(2, tl.length || 14);
  const pnl = tl.length ? tl.map(t => +(Number(t.pnl_live) * 100).toFixed(3)) : new Array(14).fill(0);
  const mae = tl.length ? tl.map(t => +(Number(t.mae_live) * 100).toFixed(3)) : new Array(14).fill(0);
  const mfe = tl.length ? tl.map(t => +(Number(t.mfe_live) * 100).toFixed(3)) : pnl.map((_, i) => Math.max(...pnl.slice(0, i + 1)));
  const all = [...pnl, ...mfe, ...mae];
  const min = Math.min(...all, -0.2),
    max = Math.max(...all, 1.0);
  const rng = max - min;
  const x = i => pad.l + i / (N - 1) * (W - pad.l - pad.r);
  const y = v => pad.t + (1 - (v - min) / rng) * (H - pad.t - pad.b);
  const path = data => 'M' + data.map((v, i) => `${x(i)},${y(v)}`).join(' L');
  // X-axis labels = bar_i from timeline entries (sample ~6 evenly)
  const times = tl.length ? (() => {
    const step = Math.max(1, Math.floor(tl.length / 6));
    const out = [];
    for (let i = 0; i < tl.length; i += step) out.push(`T${tl[i].bar_i ?? i}`);
    const lastLabel = `T${tl[tl.length - 1].bar_i ?? tl.length - 1}`;
    if (out[out.length - 1] !== lastLabel) out.push(lastLabel);
    return out;
  })() : ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #EEF0F4',
      padding: 16
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
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "line-chart",
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
  }, "PNL TRAJECTORY")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      fontSize: 11,
      fontWeight: 600,
      color: '#6B7280'
    }
  }, /*#__PURE__*/React.createElement(Legend, {
    c: "#F97316",
    label: "PnL"
  }), /*#__PURE__*/React.createElement(Legend, {
    c: "#10B981",
    label: "MFE",
    dashed: true
  }), /*#__PURE__*/React.createElement(Legend, {
    c: "#EF4444",
    label: "MAE",
    dashed: true
  }))), /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none"
  }, [-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => /*#__PURE__*/React.createElement("g", {
    key: v
  }, /*#__PURE__*/React.createElement("line", {
    x1: pad.l,
    x2: W - pad.r,
    y1: y(v),
    y2: y(v),
    stroke: v === 0 ? '#E5E7EB' : '#F5F6FA',
    strokeWidth: v === 0 ? 1 : 1
  }), /*#__PURE__*/React.createElement("text", {
    x: pad.l - 6,
    y: y(v) + 3,
    textAnchor: "end",
    fontSize: "9",
    fill: "#9CA3AF",
    fontFamily: "JetBrains Mono, monospace"
  }, v.toFixed(1), "%"))), times.map((t, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: pad.l + i / (times.length - 1) * (W - pad.l - pad.r),
    y: H - 6,
    fontSize: "9",
    fill: "#9CA3AF",
    textAnchor: "middle",
    fontFamily: "JetBrains Mono, monospace"
  }, t)), /*#__PURE__*/React.createElement("path", {
    d: `${path(mae)} L${x(N - 1)},${y(0)} L${x(0)},${y(0)} Z`,
    fill: "#FEE2E2",
    opacity: ".6"
  }), /*#__PURE__*/React.createElement("path", {
    d: path(mfe),
    stroke: "#10B981",
    strokeWidth: "1.75",
    fill: "none",
    strokeDasharray: "5 3",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: path(mae),
    stroke: "#EF4444",
    strokeWidth: "1.75",
    fill: "none",
    strokeDasharray: "5 3",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    key: `pnl-${s.id}`,
    className: "cxg-spark-path",
    style: {
      '--cxg-dash': 1800
    },
    d: path(pnl),
    stroke: "#F97316",
    strokeWidth: "2.5",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), pnl.map((v, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: x(i),
    cy: y(v),
    r: "3",
    fill: "#fff",
    stroke: "#F97316",
    strokeWidth: "1.75"
  })), /*#__PURE__*/React.createElement("circle", {
    cx: x(N - 1),
    cy: y(pnl[N - 1]),
    r: "5",
    fill: "#F97316",
    stroke: "#fff",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "r",
    values: "5;8;5",
    dur: "1.4s",
    repeatCount: "indefinite"
  }), /*#__PURE__*/React.createElement("animate", {
    attributeName: "opacity",
    values: "1;.65;1",
    dur: "1.4s",
    repeatCount: "indefinite"
  })))));
};
const Legend = ({
  c,
  label,
  dashed
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "8"
}, /*#__PURE__*/React.createElement("line", {
  x1: "0",
  y1: "4",
  x2: "18",
  y2: "4",
  stroke: c,
  strokeWidth: "2.5",
  strokeDasharray: dashed ? '4 2' : '',
  strokeLinecap: "round"
})), label);

/* ---------- 5. ACTION TIMELINE ---------- */

const phaseTag = p => {
  const map = {
    'phase 3': ['#FEF3C7', '#92400E'],
    'phase 1': ['#EEF0FF', '#4338CA'],
    BREAKOUT: ['#DCFCE7', '#166534'],
    'phase 4': ['#F5F6FA', '#6B7280'],
    FAIR_C_MOMENTUM: ['#EEF0FF', '#4338CA'],
    'phase 8': ['#F3E8FF', '#7C3AED'],
    'phase 6': ['#CCFBF1', '#0F766E'],
    'phase 7': ['#FEE2E2', '#B91C1C']
  };
  return map[p] || map['phase 1'];
};
const ActionTimeline = ({
  detail
}) => {
  const [filter, setFilter] = React.useState('All');
  const tl = detail && Array.isArray(detail.timeline) ? detail.timeline : [];
  const allRows = tl.map(t => {
    const reason = t.reason || '';
    const phase = (t.v4_phase || '').toUpperCase();
    const stageMatch = (reason.match(/V6\(\w+,T\d+,(\w+)\)/) || [])[1];
    const tMatch = (reason.match(/V6\(\w+,(T\d+),/) || [])[1];
    return {
      ts: window.cxgFmt && window.cxgFmt.fmtDateTime ? window.cxgFmt.fmtDateTime(t.ts_eval, false) : (t.ts_eval || '').replace('T', ' ').slice(0, 16),
      t: tMatch || `T${t.bar_i ?? 0}`,
      act: t.action || 'HOLD',
      phase: phase || stageMatch || '',
      pnl: Number(t.pnl_live) * 100,
      mfe: Number(t.mfe_live) * 100,
      mae: Number(t.mae_live) * 100,
      reason
    };
  });

  // Filter by action group
  const matches = (act, f) => {
    if (f === 'All') return true;
    if (f === 'Hold') return act === 'HOLD';
    if (f === 'Trail') return act === 'action 3' || act === 'action 4' || act === 'action 5';
    if (f === 'Exit') return act === 'EXIT';
    return true;
  };
  const rows = allRows.filter(r => matches(r.act, filter));
  const VISIBLE_ROWS = 8;
  const ROW_HEIGHT = 40; // approx padding 12px × 2 + line
  const HEADER_PX = 34;
  const needsScroll = rows.length > VISIBLE_ROWS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #EEF0F4',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderBottom: '1px solid #F1F3F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "list",
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
  }, "ACTION TIMELINE"), allRows.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: '#9CA3AF',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, rows.length === allRows.length ? `${allRows.length} entries` : `${rows.length}/${allRows.length} shown`)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 4,
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      padding: 2,
      background: '#FAFBFF'
    }
  }, ['All', 'Hold', 'Trail', 'Exit'].map(v => {
    const active = filter === v;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => setFilter(v),
      style: {
        padding: '5px 12px',
        fontSize: 10,
        fontWeight: 700,
        border: 'none',
        borderRadius: 6,
        background: active ? '#6366F1' : 'transparent',
        color: active ? '#fff' : '#6B7280',
        cursor: 'pointer',
        boxShadow: active ? '0 2px 6px rgba(99,102,241,.25)' : 'none',
        transition: 'all 160ms',
        fontFamily: 'inherit'
      }
    }, v);
  }))), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      textAlign: 'center',
      fontSize: 11,
      color: '#9CA3AF',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, allRows.length === 0 ? 'No timeline yet · waiting for first decision' : `No ${filter.toLowerCase()} entries`) : /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: needsScroll ? VISIBLE_ROWS * ROW_HEIGHT + HEADER_PX : 'auto',
      overflowY: needsScroll ? 'auto' : 'visible'
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
  }, ['TIME', 'T+', 'ACTION', 'PHASE', 'PNL', 'MFE', 'MAE', 'REASON'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: 'left',
      fontSize: 9,
      fontWeight: 800,
      color: '#6B7280',
      padding: '10px 12px',
      letterSpacing: '.1em',
      borderBottom: '1px solid #F1F3F8',
      background: '#FAFBFF'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => {
    const [bg, fg] = phaseTag(r.phase);
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      style: {
        borderBottom: i < rows.length - 1 ? '1px solid #F5F6FA' : 'none'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontSize: 10,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, r.ts), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#0F172A'
      }
    }, r.t), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontSize: 11,
        fontWeight: 800,
        color: '#0F172A',
        letterSpacing: '.04em'
      }
    }, r.act), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px'
      }
    }, r.phase && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: 6,
        background: bg,
        color: fg,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '.04em'
      }
    }, r.phase)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        fontWeight: 700,
        color: r.pnl >= 0 ? '#059669' : '#DC2626'
      }
    }, r.pnl >= 0 ? '+' : '', r.pnl.toFixed(2), "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        fontWeight: 700,
        color: '#059669'
      }
    }, r.mfe.toFixed(2), "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        fontWeight: 700,
        color: '#DC2626'
      }
    }, r.mae.toFixed(2), "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9.5,
        color: '#6B7280',
        maxWidth: 320,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, r.reason));
  }))))));
};

/* ---------- 6. FREESTYLE — PHASE TRANSITION MAP + V6 SCORE RADAR ---------- */

const StateFlow = ({
  s,
  detail
}) => {
  const stage = detail && (detail.tier || detail.stage) || s && s.stage || '—';
  const prevPhase = detail && detail.phase && detail.phase.prev || '—';
  const currPhase = detail && detail.phase && detail.phase.current || s && s.tier || '—';
  const action = detail && detail.action || s && s.hold || 'HOLD';

  // Build PnL condition string from rule[action] (loaded from rule.json).
  // Server returns thresholds as fractions (0.005 = 0.5%) and directions as "LE"/"GE".
  const rule = detail && detail.rule && detail.rule[action] || null;
  const fmtPct = v => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '';
    const pct = n * 100; // fraction → percent
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  };
  const fmtOp = op => ({
    LE: '≤',
    GE: '≥',
    LT: '<',
    GT: '>',
    EQ: '=',
    NE: '≠',
    '<=': '≤',
    '>=': '≥',
    '<': '<',
    '>': '>'
  })[String(op || '').toUpperCase()] || op || '≥';
  const evalOp = (val, op, thr) => {
    const o = String(op || '').toUpperCase();
    if (o === 'LE' || o === '<=') return val <= thr;
    if (o === 'GE' || o === '>=') return val >= thr;
    if (o === 'LT' || o === '<') return val < thr;
    if (o === 'GT' || o === '>') return val > thr;
    if (o === 'EQ' || o === '=') return val === thr;
    if (o === 'NE' || o === '≠') return val !== thr;
    return false;
  };
  let cond = '';
  let met = false;
  if (rule) {
    const pnlNow = Number(detail && detail.pnl_live != null ? Number(detail.pnl_live) * 100 : s && s.pct || 0);
    const t1 = (Number(rule.threshold) || 0) * 100;
    const t2 = rule.threshold2 != null ? (Number(rule.threshold2) || 0) * 100 : null;
    const p1 = evalOp(pnlNow, rule.direction, t1);
    const p2 = t2 != null ? evalOp(pnlNow, rule.direction2, t2) : null;
    met = rule.enabled && (rule.logic && p2 != null ? rule.logic === 'OR' ? p1 || p2 : p1 && p2 : p1);
    const s1 = `pnl ${fmtOp(rule.direction)} ${fmtPct(rule.threshold)}`;
    const s2 = rule.threshold2 != null ? `pnl ${fmtOp(rule.direction2)} ${fmtPct(rule.threshold2)}` : '';
    cond = rule.logic && s2 ? `${s1} ${rule.logic} ${s2}` : s1;
  }

  // Action meta — vivid when condition met, muted gray otherwise.
  // Color spec: EXIT=red, action 3=orange, action 5=green, action 4=blue, HOLD=gray.
  const ACT = {
    HOLD: {
      c: '#475569',
      bg: '#F1F5F9',
      ring: '#CBD5E1'
    },
    EXIT: {
      c: '#DC2626',
      bg: '#FEF2F2',
      ring: '#FECACA'
    },
    'action 3': {
      c: '#D97706',
      bg: '#FFFBEB',
      ring: '#FDE68A'
    },
    'action 5': {
      c: '#059669',
      bg: '#ECFDF5',
      ring: '#A7F3D0'
    },
    'action 4': {
      c: '#2563EB',
      bg: '#EFF6FF',
      ring: '#BFDBFE'
    }
  };
  const MUTED = {
    c: '#9CA3AF',
    bg: '#FAFBFC',
    ring: '#E5E7EB'
  };
  const actMeta = met ? ACT[action] || ACT.HOLD : MUTED;

  // Extend rule pill: parallel display next to action pill.
  // Active (matched=true at this T) → vivid color of rule.action; else muted.
  const ext = detail && detail.extra_rule || null;
  let extMeta = null;
  if (ext && ext.configured) {
    extMeta = ext.matched ? ACT[ext.rule.action] || ACT.HOLD : MUTED;
  }
  const phaseBadge = (label, highlight) => /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '.04em',
      padding: '6px 12px',
      borderRadius: 999,
      background: highlight ? '#EEF0FF' : '#F5F6FA',
      color: highlight ? '#4338CA' : '#6B7280',
      border: `1px solid ${highlight ? '#C7D2FE' : '#E5E7EB'}`,
      fontFamily: 'JetBrains Mono, monospace',
      whiteSpace: 'nowrap'
    }
  }, label);
  const vConn = /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      height: 16,
      background: '#CBD5E1',
      margin: '4px auto',
      borderRadius: 1
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #EEF0F4',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "git-branch",
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
  }, "LIFECYCLE"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, "live decision flow")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '.06em',
      padding: '7px 16px',
      borderRadius: 8,
      background: '#FFFBEB',
      color: '#92400E',
      border: '1px solid #FDE68A',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: '#B45309',
      marginRight: 6
    }
  }, "STAGE"), stage)), vConn, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10
    }
  }, phaseBadge(prevPhase, false), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14,
    stroke: 2.5,
    style: {
      color: '#9CA3AF'
    }
  }), phaseBadge(currPhase, true)), vConn, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px',
      borderRadius: 10,
      background: actMeta.bg,
      border: `1px solid ${actMeta.ring}`,
      boxShadow: met ? `0 2px 6px ${actMeta.ring}66` : 'none',
      transition: 'all 160ms'
    }
  }, met && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 999,
      background: actMeta.c,
      boxShadow: `0 0 0 3px ${actMeta.ring}`,
      animation: 'cxg-pulse 1.4s ease-in-out infinite'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: met ? actMeta.c : '#9CA3AF',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      opacity: 0.7
    }
  }, "STAGE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '.06em',
      color: actMeta.c,
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, action), cond && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 12,
      background: actMeta.ring
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: met ? '#4B5563' : '#9CA3AF',
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#9CA3AF'
    }
  }, "if"), " ", cond))), extMeta && (() => {
    const opMap = {
      LE: '≤',
      GE: '≥'
    };
    const copMap = {
      GE: '≥',
      LE: '≤'
    };
    const pOp = opMap[ext.rule.op] || '≤';
    const cOp = copMap[ext.rule.cop] || '≥';
    const pThr = Number(ext.rule.pnl_pct);
    const sThr = Number(ext.rule.std_pnl_pct);
    const stdSet = sThr > -100;
    const sign = v => (v >= 0 ? '+' : '') + v.toFixed(1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 10,
        background: extMeta.bg,
        border: `1px solid ${extMeta.ring}`,
        boxShadow: ext.matched ? `0 2px 6px ${extMeta.ring}66` : 'none',
        transition: 'all 160ms',
        flexWrap: 'wrap'
      },
      title: `Rule: pnl ${pOp} ${sign(pThr)}%${stdSet ? ` AND pnl ≥ ${sign(sThr)}%` : ''} AND count ${cOp} ${ext.rule.cn}. Streak walks back from current T inclusive.`
    }, ext.matched && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 999,
        background: extMeta.c,
        boxShadow: `0 0 0 3px ${extMeta.ring}`,
        animation: 'cxg-pulse 1.4s ease-in-out infinite'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: ext.matched ? extMeta.c : '#9CA3AF',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        opacity: 0.75
      }
    }, "EXTEND RULE :"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '.06em',
        color: extMeta.c,
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, ext.rule.action), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, "-"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF'
      }
    }, "if"), ' ', /*#__PURE__*/React.createElement("span", {
      style: {
        color: ext.pnl_gate ? extMeta.c : '#4B5563',
        fontWeight: 700
      }
    }, "pnl ", pOp, " ", sign(pThr), "%"), stdSet && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF',
        margin: '0 4px'
      }
    }, "&"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: ext.std_floor ? extMeta.c : '#4B5563',
        fontWeight: 700
      }
    }, "std \u2265 ", sign(sThr), "%")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF',
        margin: '0 4px'
      }
    }, "&"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: ext.count_pass ? extMeta.c : '#4B5563',
        fontWeight: 700
      }
    }, "cnt ", cOp, ' ', /*#__PURE__*/React.createElement("span", {
      style: {
        color: ext.matched ? extMeta.c : ext.count > 0 ? '#0F172A' : '#9CA3AF',
        fontWeight: 800
      }
    }, ext.count), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#9CA3AF',
        fontWeight: 600
      }
    }, "/", ext.rule.cn)), !ext.pnl_gate && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        color: '#9CA3AF',
        fontStyle: 'italic'
      }
    }, "\xB7 gate fail"), ext.pnl_gate && !ext.std_floor && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        color: '#9CA3AF',
        fontStyle: 'italic'
      }
    }, "\xB7 floor fail"), ext.pnl_gate && ext.std_floor && !ext.count_pass && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        color: '#9CA3AF',
        fontStyle: 'italic'
      }
    }, "\xB7 waiting"), ext.matched && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        color: extMeta.c,
        fontWeight: 800
      }
    }, "\xB7 ARMED")));
  })()));
};
const ActionMix = ({
  detail
}) => {
  // Count action types from engine timeline (full action list from stage rules)
  const ACT_COLORS = {
    HOLD: '#475569',
    EXIT: '#EF4444',
    'action 3': '#F59E0B',
    'action 5': '#10B981',
    'action 4': '#3B82F6' // blue (was purple #A855F7)
  };
  const ACT_KEYS = ['HOLD', 'EXIT', 'action 3', 'action 5', 'action 4'];
  const tl = detail && Array.isArray(detail.timeline) ? detail.timeline : [];
  const MAX_AGE = 80; // stage max age — denominator for distribution bar
  const counts = ACT_KEYS.reduce((m, k) => (m[k] = 0, m), {});
  const seen = new Set();
  const candles = new Set();
  for (const t of tl) {
    const act = (t.action || '').toUpperCase();
    if (counts[act] == null) continue;
    const c = t.bar_i ?? '?';
    candles.add(c);
    const key = c + '|' + act;
    if (seen.has(key)) continue;
    seen.add(key);
    counts[act]++;
  }
  const distinctTotal = Object.values(counts).reduce((a, b) => a + b, 0);
  const radarMax = Math.max(...Object.values(counts), 1);
  // Friendly labels for radar axes
  const LABELS = {
    HOLD: 'Hold',
    EXIT: 'Exit',
    'action 3': 'T****',
    'action 5': 'E****',
    'action 4': 'R****'
  };
  const scores = ACT_KEYS.map(k => ({
    k: LABELS[k],
    raw: k,
    v: counts[k] / radarMax,
    // radar polygon: relative to max action → visible
    bar: counts[k] / MAX_AGE,
    // distribution bar: /stage max age (80)
    n: counts[k],
    // distinct count per (candle, action)
    c: ACT_COLORS[k]
  }));
  const cx = 110,
    cy = 105,
    rMax = 78;
  const n = scores.length;
  const pt = (i, v) => {
    const a = i / n * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rMax * v, cy + Math.sin(a) * rMax * v];
  };
  const outer = scores.map((_, i) => pt(i, 1).join(',')).join(' ');
  const inner = scores.map((s, i) => pt(i, s.v).join(',')).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #EEF0F4',
      padding: 16,
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "radar",
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
  }, "ACTIVITY")), /*#__PURE__*/React.createElement("svg", {
    width: "220",
    height: "210",
    viewBox: "0 0 220 210"
  }, [.25, .5, .75, 1].map(f => /*#__PURE__*/React.createElement("polygon", {
    key: f,
    points: scores.map((_, i) => pt(i, f).join(',')).join(' '),
    fill: "none",
    stroke: "#F1F3F8",
    strokeWidth: "1"
  })), scores.map((_, i) => {
    const [px, py] = pt(i, 1);
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: cx,
      y1: cy,
      x2: px,
      y2: py,
      stroke: "#F1F3F8",
      strokeWidth: "1"
    });
  }), /*#__PURE__*/React.createElement("polygon", {
    points: inner,
    fill: "rgba(99,102,241,.18)",
    stroke: "#6366F1",
    strokeWidth: "2",
    strokeLinejoin: "round"
  }), scores.map((s, i) => {
    const [px, py] = pt(i, s.v);
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: px,
      cy: py,
      r: "3.5",
      fill: "#fff",
      stroke: s.c,
      strokeWidth: "2"
    });
  }), scores.map((s, i) => {
    const [px, py] = pt(i, 1.18);
    return /*#__PURE__*/React.createElement("text", {
      key: i,
      x: px,
      y: py + 3,
      textAnchor: "middle",
      fontSize: "9",
      fontWeight: "800",
      fill: "#6B7280",
      letterSpacing: ".04em",
      fontFamily: "JetBrains Mono, monospace"
    }, s.k);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: '#0F172A',
      letterSpacing: '-.02em'
    }
  }, distinctTotal, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      fontWeight: 600
    }
  }, "actions \xB7 ", candles.size, " candles")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      marginBottom: 10
    }
  }, "Activity summary","",""), scores.map(sc => /*#__PURE__*/React.createElement("div", {
    key: sc.k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 10,
      color: '#4B5563',
      fontWeight: 600
    }
  }, sc.k), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      height: 5,
      background: '#F1F3F8',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.min(sc.bar * 100, 100)}%`,
      height: '100%',
      background: sc.c,
      borderRadius: 999
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 800,
      color: '#0F172A',
      fontFamily: 'JetBrains Mono, monospace',
      width: 42,
      textAlign: 'right'
    }
  }, sc.n, "\xD7 ", (sc.bar * 100).toFixed(0), "%")))));
};
const FreestyleRow = ({
  s,
  detail
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    padding: '0 18px 18px'
  }
}, /*#__PURE__*/React.createElement(StateFlow, {
  s: s,
  detail: detail
}), /*#__PURE__*/React.createElement(ActionMix, {
  detail: detail
}));

/* ---------- WRAPPER ---------- */

const DetailView = ({
  s
}) => {
  const detail = useApiDetail(s && s.pair_key, s && s.direction, 2000);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PriceRail, {
    s: s,
    detail: detail
  }), /*#__PURE__*/React.createElement(FreestyleRow, {
    s: s,
    detail: detail
  }), /*#__PURE__*/React.createElement(ActionTimeline, {
    detail: detail
  }));
};

// Expose detail-aware PnlTrajectory wrapper too (DetailPane calls <PnlTrajectory s={s}/> directly)
const PnlTrajectoryLive = ({
  s
}) => {
  const detail = useApiDetail(s && s.pair_key, s && s.direction, 2000);
  return /*#__PURE__*/React.createElement(PnlTrajectory, {
    s: s,
    detail: detail
  });
};
window.DetailView = DetailView;
window.PnlTrajectory = PnlTrajectoryLive; // DetailPane gets the live wrapper
window.StatTiles = StatTiles;
window.useApiDetail = useApiDetail; // exposed so PMMonitorScreen DetailPane can share detail