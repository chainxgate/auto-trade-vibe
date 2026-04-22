/* ChainxGate — Wallets (live: ./data/wallet.json + ./data/config.json) */
const {
  useState,
  useEffect,
  useMemo
} = React;

/* ---------- TICKER (decorative top strip — kept static) ---------- */
const W_TICKER = [{
  s: 'BTC',
  p: 74_573.43,
  d: 0.88
}, {
  s: 'ETH',
  p: 2_223.28,
  d: 1.14
}, {
  s: 'SOL',
  p: 95.90,
  d: -0.32
}, {
  s: 'BNB',
  p: 615.80,
  d: 0.42
}, {
  s: 'USDC',
  p: 1.00,
  d: 0.00
}, {
  s: 'XMR',
  p: 155.70,
  d: 0.96
}, {
  s: 'AVAX',
  p: 21.23,
  d: 0.21
}, {
  s: 'ARB',
  p: 0.3103,
  d: -0.84
}];

/* ---------- API HOOKS ---------- */
const useApiWalletSnapshot = (rate = 30000) => {
  const [snap, setSnap] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/wallet.json').then(r => r.json()).then(j => {
      if (j && j.ok && j.data) setSnap(j.data);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return {
    snap,
    loaded,
    reload: fetchOnce
  };
};
const useApiPmHistory = (rate = 30000) => {
  const [trades, setTrades] = useState([]);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/history.json').then(r => r.json()).then(j => {
      setTrades(Array.isArray(j?.trades) ? j.trades : []);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return trades;
};
const useApiPmKpi = (rate = 5000) => {
  const [kpi, setKpi] = useState(null);
  const fetchOnce = React.useCallback(() => {
    fetch('./data/kpi.json').then(r => r.json()).then(setKpi).catch(() => {});
  }, []);
  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, rate);
    return () => clearInterval(id);
  }, [fetchOnce, rate]);
  return kpi;
};

// Parse "YYYY-MM-DD HH:MM:SS" GMT+7 strings from ./data/history.json
const parseGmt7 = s => {
  if (!s) return NaN;
  let ms = Date.parse(s);
  if (!isNaN(ms)) return ms;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return NaN;
  const [, Y, Mo, D, H, Mi, S] = m;
  return Date.UTC(+Y, +Mo - 1, +D, +H - 7, +Mi, +S);
};
const useApiNetworks = () => {
  const [networks, setNetworks] = useState([]);
  useEffect(() => {
    fetch('./data/config.json').then(r => r.json()).then(j => {
      if (j && j.ok) setNetworks(j.networks || []);
    }).catch(() => {});
  }, []);
  return networks;
};

// Persisted wallet addresses — server-backed via ./data/addresses.json
// (Previously stored in localStorage — moved to DB so it survives across browsers.)
const useSavedAddresses = () => {
  const [addrs, setAddrs] = useState([]);
  const [resolved, setResolved] = useState({}); // key → address_balance resp.asset
  const [busyKey, setBusyKey] = useState(null);
  const fetchList = React.useCallback(() => {
    return fetch('./data/addresses.json').then(r => r.json()).then(j => {
      const list = j && j.ok && Array.isArray(j.addresses) ? j.addresses : [];
      setAddrs(list);
      return list;
    }).catch(() => []);
  }, []);
  const refreshOne = React.useCallback(entry => {
    const key = `${entry.network}:${entry.address}:${entry.token || ''}`;
    setBusyKey(key);
    return fetch('./data/config.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: entry.address,
        network: entry.network,
        token: entry.token || ''
      })
    }).then(r => r.json()).then(j => {
      setResolved(prev => ({
        ...prev,
        [key]: j && j.ok ? j.asset : {
          error: j && j.error || 'fetch failed'
        }
      }));
      setBusyKey(null);
      return j;
    }).catch(e => {
      setResolved(prev => ({
        ...prev,
        [key]: {
          error: e.message
        }
      }));
      setBusyKey(null);
    });
  }, []);
  const refreshAll = React.useCallback(() => {
    fetchList().then(list => list.forEach(refreshOne));
  }, [fetchList, refreshOne]);
  useEffect(() => {
    refreshAll();
  }, []); // initial load
  useEffect(() => {
    const id = setInterval(refreshAll, 60000);
    return () => clearInterval(id);
  }, [refreshAll]);
  const add = entry => {
    return fetch('./data/addresses.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: entry.address,
        network: entry.network,
        token: entry.token || '',
        label: entry.label || ''
      })
    }).then(r => r.json()).then(j => {
      if (j && j.ok) {
        // Reload list to include new id, then resolve balance
        fetchList().then(() => refreshOne(entry));
      }
      return j;
    });
  };
  const remove = entry => {
    if (!entry?.id) return;
    return fetch(`./data/addresses.json`, {
      method: 'DELETE'
    }).then(r => r.json()).then(() => fetchList());
  };
  return {
    addrs,
    resolved,
    busyKey,
    add,
    remove,
    refreshAll
  };
};

/* ---------- VISUAL HELPERS ---------- */
const fmtUsd = (v, frac = 2) => '$' + Number(v || 0).toLocaleString('en-US', {
  minimumFractionDigits: frac,
  maximumFractionDigits: frac
});
const shortenAddr = a => {
  if (!a) return '';
  if (a.length <= 14) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
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
const ASSET_COLOR = {}; // legacy fallback (per-symbol callers)
const NET_COLOR = {
  Ethereum: '#627EEA',
  Bitcoin: '#F7931A',
  Solana: '#9945FF',
  BSC: '#F3BA2F',
  Arbitrum: '#28A0F0',
  Polygon: '#8247E5'
};
const WTicker = () => /*#__PURE__*/React.createElement("div", {
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
}, W_TICKER.map(t => /*#__PURE__*/React.createElement("div", {
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
const WSpark = ({
  data,
  color = '#6366F1',
  h = 26,
  w = 80
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
  const id = `wspk-${color.replace('#', '')}-${w}`;
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
    stopOpacity: ".3"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: 'M' + pts.join(' L') + ` L${w},${h} L0,${h} Z`,
    fill: `url(#${id})`
  }), /*#__PURE__*/React.createElement("path", {
    d: 'M' + pts.join(' L'),
    stroke: color,
    strokeWidth: "1.5",
    fill: "none",
    strokeLinecap: "round"
  }));
};
const WKpi = ({
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
}, sub), spark && /*#__PURE__*/React.createElement(WSpark, {
  data: spark,
  color: color,
  w: 70,
  h: 22
})));

/* ---------- HERO WALLET CARD ---------- */
const WalletCard = ({
  w,
  active,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onClick,
  style: {
    borderRadius: 20,
    padding: 18,
    color: '#fff',
    height: 180,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: w.color,
    cursor: 'pointer',
    boxShadow: active ? '0 16px 32px rgba(99,102,241,.32)' : '0 12px 24px rgba(17,24,39,.12)',
    transform: active ? 'translateY(-2px)' : 'none',
    transition: 'all 160ms',
    border: active ? '2px solid #fff' : '2px solid transparent',
    position: 'relative',
    overflow: 'hidden'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 999,
    background: 'rgba(255,255,255,.12)'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 999,
    background: 'rgba(255,255,255,.07)'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'rgba(255,255,255,.22)',
    display: 'grid',
    placeItems: 'center',
    backdropFilter: 'blur(6px)'
  }
}, w.icon ? /*#__PURE__*/React.createElement(Icon, {
  name: w.icon,
  size: 16
}) : /*#__PURE__*/React.createElement("img", {
  src: `/assets/tokens/${w.token}.svg`,
  width: "18",
  height: "18"
})), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 10
  }
}, w.name), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    opacity: .85,
    marginTop: 1
  }
}, w.sub)), /*#__PURE__*/React.createElement("span", {
  style: {
    background: 'rgba(255,255,255,.22)',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 999,
    backdropFilter: 'blur(6px)',
    letterSpacing: '.04em'
  }
}, w.type.toUpperCase())), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 10,
    opacity: .85,
    fontFamily: 'JetBrains Mono, monospace'
  }
}, w.addr), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '-.01em',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 2
  }
}, fmtUsd(w.usd)), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    fontSize: 10,
    fontFamily: 'JetBrains Mono, monospace'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    opacity: .92
  }
}, w.chip), /*#__PURE__*/React.createElement("span", {
  style: {
    background: 'rgba(255,255,255,.22)',
    padding: '3px 8px',
    borderRadius: 999
  }
}, w.netLbl))));

/* ---------- DISTRIBUTION BAR ---------- */
const DistributionBar = ({
  assets
}) => {
  const total = assets.reduce((a, b) => a + (b.val || 0), 0) || 1;
  return /*#__PURE__*/React.createElement("div", {
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
  }, "Holdings distribution"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2
    }
  }, "By USD value across all connected wallets")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: '#0F172A',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmtUsd(total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: 18,
      borderRadius: 999,
      overflow: 'hidden',
      marginBottom: 16,
      background: '#F1F3F8'
    }
  }, assets.map((a, i) => {
    const pct = a.val / total * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: `${a.s}-${i}`,
      title: `${a.s} ${pct.toFixed(1)}%`,
      style: {
        width: `${pct}%`,
        background: colorAt(i)
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 14
    }
  }, assets.slice(0, 8).map((a, i) => {
    const color = colorAt(i);
    return /*#__PURE__*/React.createElement("div", {
      key: `${a.s}-${i}`,
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
        background: color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("img", {
      src: `/assets/tokens/${a.tk || (a.s || '').toLowerCase()}.svg`,
      width: "18",
      height: "18",
      onError: e => e.target.style.display = 'none'
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, a.s), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, (a.val / total * 100).toFixed(1), "%")));
  })));
};

/* ---------- CONNECT WALLET MODAL ---------- */
const ConnectWalletModal = ({
  networks,
  onClose,
  onSave
}) => {
  const [networkId, setNetworkId] = useState(networks[0]?.id || '');
  const [tokenKey, setTokenKey] = useState('');
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const network = networks.find(n => n.id === networkId);
  const tokens = network?.tokens || [];
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
  const submit = async () => {
    if (!address.trim() || !networkId) return;
    setBusy(true);
    setErr('');
    try {
      const resp = await fetch('./data/config.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: address.trim(),
          network: networkId,
          token: tokenKey || ''
        })
      });
      const j = await resp.json();
      if (!j.ok) {
        setErr(j.error || 'Validation failed');
        setBusy(false);
        return;
      }
      onSave({
        address: address.trim(),
        network: networkId,
        token: tokenKey || '',
        label: label.trim() || null
      });
      onClose();
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
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
      overflowY: 'auto',
      animation: 'cxg-tick 160ms ease both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: '#fff',
      borderRadius: 14,
      padding: 22,
      width: '100%',
      maxWidth: 520,
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
  }, "Connect wallet by address"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 4
    }
  }, "Public address only \u2014 read balance via RPC. No private keys stored.")), /*#__PURE__*/React.createElement("button", {
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
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Network"), /*#__PURE__*/React.createElement("select", {
    value: networkId,
    onChange: e => {
      setNetworkId(e.target.value);
      setTokenKey('');
    },
    style: {
      ...inp,
      fontFamily: 'inherit'
    }
  }, networks.map(n => /*#__PURE__*/React.createElement("option", {
    key: n.id,
    value: n.id
  }, n.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Token"), /*#__PURE__*/React.createElement("select", {
    value: tokenKey,
    onChange: e => setTokenKey(e.target.value),
    style: {
      ...inp,
      fontFamily: 'inherit'
    }
  }, tokens.map(t => /*#__PURE__*/React.createElement("option", {
    key: t.key,
    value: t.key
  }, t.symbol, " ", t.native ? '(native)' : '')))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Wallet address"), /*#__PURE__*/React.createElement("input", {
    value: address,
    onChange: e => setAddress(e.target.value),
    placeholder: "0x\u2026 / bc1\u2026 / Sol pubkey",
    style: inp
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0F172A',
      marginBottom: 6
    }
  }, "Label (optional)"), /*#__PURE__*/React.createElement("input", {
    value: label,
    onChange: e => setLabel(e.target.value),
    placeholder: "e.g. Ledger Cold \xB7 ETH",
    style: {
      ...inp,
      fontFamily: 'inherit'
    }
  }))), err && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#B91C1C',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12
    }
  }, err), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
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
    onClick: submit,
    disabled: busy || !address.trim(),
    style: {
      padding: '8px 16px',
      borderRadius: 8,
      border: 'none',
      background: busy || !address.trim() ? '#C7D2FE' : '#6366F1',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      cursor: busy || !address.trim() ? 'not-allowed' : 'pointer',
      boxShadow: '0 4px 12px rgba(99,102,241,.28)'
    }
  }, busy ? 'Validating…' : 'Connect'))));
};

/* ---------- TAB PANELS ---------- */
const AssetsPanel = ({
  assets,
  net,
  setNet,
  networks
}) => {
  const filtered = assets.filter(a => net === 'All Networks' || a.net === net);
  const total = assets.reduce((a, b) => a + (b.val || 0), 0) || 1;
  const netItems = ['All Networks', ...Array.from(new Set(assets.map(a => a.net).filter(Boolean)))];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 14,
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Chips, {
    items: netItems.length > 1 ? netItems : ['All Networks'],
    active: net,
    onChange: setNet
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF'
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search tokens\u2026",
    style: {
      padding: '7px 12px 7px 30px',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'inherit',
      width: 220,
      outline: 'none',
      boxSizing: 'border-box'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      borderRadius: 12,
      border: '1px solid #F1F3F8'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: '#FAFBFF'
    }
  }, ['Asset', 'Price', '24h', 'Holdings', 'Allocation', 'Value', 'Network', 'Actions'].map(h => /*#__PURE__*/React.createElement("th", {
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
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filtered.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 8,
    style: {
      padding: 28,
      textAlign: 'center',
      fontSize: 12,
      color: '#6B7280'
    }
  }, "No assets yet \u2014 connect a wallet by address to see balances here.")), filtered.map((a, idx) => {
    const up = (a.ch || 0) >= 0;
    const alloc = a.val / total * 100;
    return /*#__PURE__*/React.createElement("tr", {
      key: `${a.s}-${idx}`,
      style: {
        borderBottom: '1px solid #F5F6FA'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: `/assets/tokens/${a.tk || (a.s || '').toLowerCase()}.svg`,
      width: "24",
      height: "24",
      onError: e => e.target.style.display = 'none'
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, a.n || a.s), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#6B7280',
        fontFamily: 'JetBrains Mono, monospace',
        marginTop: 1
      }
    }, a.s, " \xB7 ", a.src)))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: '#0F172A'
      }
    }, a.p ? '$' + Number(a.p).toLocaleString(undefined, {
      minimumFractionDigits: a.p < 10 ? 4 : 2
    }) : '—'), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        fontWeight: 700,
        color: up ? '#059669' : '#DC2626'
      }
    }, a.ch == null ? '—' : (up ? '↗ +' : '↘ ') + Number(a.ch).toFixed(2) + '%'), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: '#0F172A'
      }
    }, Number(a.hold || 0).toLocaleString(undefined, {
      maximumFractionDigits: 6
    }), " ", a.s), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        minWidth: 140
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 5,
        background: '#F1F3F8',
        borderRadius: 999,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${Math.min(alloc, 100)}%`,
        background: 'linear-gradient(90deg,#6366F1,#A855F7)',
        borderRadius: 999
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0F172A',
        fontFamily: 'JetBrains Mono, monospace',
        minWidth: 34,
        textAlign: 'right'
      }
    }, alloc.toFixed(1), "%"))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        fontWeight: 700,
        color: '#0F172A'
      }
    }, fmtUsd(a.val)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 4,
        background: '#EEF0FF',
        color: '#4338CA'
      }
    }, a.net || '—')), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        background: '#F5F6FA',
        border: 'none',
        borderRadius: 6,
        padding: 6,
        cursor: 'pointer',
        color: '#4B5563'
      },
      title: "Send"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 12
    })), /*#__PURE__*/React.createElement("button", {
      style: {
        background: '#F5F6FA',
        border: 'none',
        borderRadius: 6,
        padding: 6,
        cursor: 'pointer',
        color: '#4B5563'
      },
      title: "Receive"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down-left",
      size: 12
    })), /*#__PURE__*/React.createElement("button", {
      style: {
        background: '#F5F6FA',
        border: 'none',
        borderRadius: 6,
        padding: 6,
        cursor: 'pointer',
        color: '#4B5563'
      },
      title: "Swap"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left-right",
      size: 12
    })))));
  })))));
};
const TransactionsPanel = () => /*#__PURE__*/React.createElement("div", {
  style: {
    overflow: 'hidden',
    borderRadius: 12,
    border: '1px solid #F1F3F8',
    padding: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280'
  }
}, "Transaction history \u2014 wire to ./data/config.json when ready.");
const ConnectedPanel = ({
  wallets,
  onRemove
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: 14
  }
}, wallets.length === 0 && /*#__PURE__*/React.createElement("div", {
  style: {
    gridColumn: '1 / -1',
    padding: 24,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280'
  }
}, "No wallets connected."), wallets.map((w, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #EEF0F4',
    padding: 18,
    display: 'flex',
    gap: 14,
    alignItems: 'center'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: w.color,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    flexShrink: 0
  }
}, w.icon ? /*#__PURE__*/React.createElement(Icon, {
  name: w.icon,
  size: 22
}) : /*#__PURE__*/React.createElement("img", {
  src: `/assets/tokens/${w.token}.svg`,
  width: "26",
  height: "26",
  onError: e => e.target.style.display = 'none'
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
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
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A'
  }
}, w.name), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    background: '#F5F6FA',
    color: '#6B7280',
    letterSpacing: '.04em'
  }
}, w.type.toUpperCase())), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'JetBrains Mono, monospace',
    marginTop: 2
  }
}, w.addr, " \xB7 ", w.netLbl), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0F172A',
    fontFamily: 'JetBrains Mono, monospace'
  }
}, fmtUsd(w.usd)), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 999,
    background: w.error ? '#FEF2F2' : '#ECFDF5',
    color: w.error ? '#B91C1C' : '#047857'
  }
}, w.error ? '◐ Error' : '● Connected'))), w.removable && /*#__PURE__*/React.createElement("button", {
  onClick: () => onRemove(w.entry),
  style: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: 8,
    cursor: 'pointer',
    color: '#DC2626'
  },
  title: "Remove"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "trash-2",
  size: 14
})))));

/* ---------- SCREEN ---------- */
const WalletsScreen = () => {
  const [tab, setTab] = useState('All Assets');
  const [net, setNet] = useState('All Networks');
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    snap,
    loaded,
    reload: reloadSnap
  } = useApiWalletSnapshot(30000);
  const networks = useApiNetworks();
  const {
    addrs,
    resolved,
    add,
    remove,
    refreshAll
  } = useSavedAddresses();
  const history = useApiPmHistory(30000);
  const pmKpi = useApiPmKpi(5000);
  const futures = snap?.futures || {};
  const heroBtc = snap?.hero_coins?.BTC || {};
  const heroEth = snap?.hero_coins?.ETH || {};

  // ── HERO 3 fixed cards (Binance Futures, ETH, BTC) ──
  const heroCards = [{
    id: 'binance-futures',
    type: 'CEX',
    name: 'Binance Futures',
    sub: 'USDT-M Account',
    addr: 'Internal · sub-acct 01',
    usd: futures.total_wallet_balance_usd || 0,
    chip: `uPnL ${(futures.unrealized_pnl_usd || 0) >= 0 ? '+' : '−'}$${Math.abs(futures.unrealized_pnl_usd || 0).toFixed(2)}`,
    color: 'linear-gradient(135deg,#A855F7,#EC4899)',
    icon: 'briefcase',
    token: null,
    netLbl: 'Binance'
  }, {
    id: 'eth-coin',
    type: 'CEX',
    name: 'ETH Coin',
    sub: 'Hero · Spot + Futures',
    addr: heroEth.amount ? `${Number(heroEth.amount).toFixed(4)} ETH` : '— ETH',
    usd: heroEth.value_usd || 0,
    chip: heroEth.price_usd ? `$${Number(heroEth.price_usd).toFixed(2)}/ETH` : '—',
    color: 'linear-gradient(135deg,#6366F1,#3B82F6)',
    icon: null,
    token: 'eth',
    netLbl: 'Ethereum'
  }, {
    id: 'btc-coin',
    type: 'CEX',
    name: 'BTC Coin',
    sub: 'Hero · Spot + Futures',
    addr: heroBtc.amount ? `${Number(heroBtc.amount).toFixed(6)} BTC` : '— BTC',
    usd: heroBtc.value_usd || 0,
    chip: heroBtc.price_usd ? `$${Number(heroBtc.price_usd).toFixed(2)}/BTC` : '—',
    color: 'linear-gradient(135deg,#F59E0B,#F97316)',
    icon: null,
    token: 'btc',
    netLbl: 'Bitcoin'
  }];

  // ── Build assets table from saved addresses ──
  const addrAssets = addrs.map(entry => {
    const key = `${entry.network}:${entry.address}:${entry.token || ''}`;
    const r = resolved[key];
    if (!r) return {
      s: (entry.token || '').toUpperCase() || '…',
      loading: true,
      src: shortenAddr(entry.address),
      net: entry.network,
      val: 0,
      hold: 0,
      p: 0
    };
    if (r.error) return {
      s: (entry.token || '').toUpperCase() || '?',
      n: 'Fetch error',
      src: shortenAddr(entry.address),
      net: entry.network,
      val: 0,
      hold: 0,
      p: 0,
      ch: 0,
      error: r.error
    };
    return {
      n: r.name,
      s: r.symbol,
      tk: (r.symbol || '').toLowerCase(),
      src: `${entry.label ? entry.label + ' · ' : ''}${shortenAddr(entry.address)}`,
      p: r.price_usd,
      ch: r.change_24h_pct,
      hold: r.holdings,
      val: r.value_usd,
      net: r.network_display
    };
  });
  // Also expose hero coins as table rows so the table is non-empty even with no addresses
  const heroAssetRows = [];
  if (heroEth.value_usd) heroAssetRows.push({
    n: 'Ether',
    s: 'ETH',
    tk: 'eth',
    src: 'Binance · Hero',
    p: heroEth.price_usd,
    ch: 0,
    hold: heroEth.amount,
    val: heroEth.value_usd,
    net: 'Binance'
  });
  if (heroBtc.value_usd) heroAssetRows.push({
    n: 'Bitcoin',
    s: 'BTC',
    tk: 'btc',
    src: 'Binance · Hero',
    p: heroBtc.price_usd,
    ch: 0,
    hold: heroBtc.amount,
    val: heroBtc.value_usd,
    net: 'Binance'
  });
  if (futures.total_wallet_balance_usd) heroAssetRows.push({
    n: 'Tether',
    s: 'USDT',
    tk: 'usdt',
    src: 'Binance · Futures wallet',
    p: 1,
    ch: 0,
    hold: futures.total_wallet_balance_usd,
    val: futures.total_wallet_balance_usd,
    net: 'Binance'
  });
  const assets = [...heroAssetRows, ...addrAssets].filter(a => a.val > 0);

  // ── Total / KPI ──
  const totalUsd = (snap?.total_value_usd || 0) + addrAssets.reduce((s, a) => s + (a.val || 0), 0);
  const realizedToday = snap?.realized_today_usd || 0;
  const unrealized = futures.unrealized_pnl_usd || 0;
  const positions = futures.positions_count || 0;
  const availMargin = futures.available_balance_usd || 0;
  const usedMarginPct = futures.total_wallet_balance_usd ? (futures.used_margin_usd || 0) / futures.total_wallet_balance_usd * 100 : 0;

  // ── Connected Wallets ──
  const connectedWallets = [{
    name: 'Binance Futures',
    type: 'CEX',
    addr: 'Internal · sub-acct 01',
    usd: futures.total_wallet_balance_usd || 0,
    color: 'linear-gradient(135deg,#A855F7,#EC4899)',
    icon: 'briefcase',
    token: null,
    netLbl: 'Binance',
    removable: false
  }, ...addrs.map((entry, i) => {
    const key = `${entry.network}:${entry.address}:${entry.token || ''}`;
    const r = resolved[key];
    const sym = r?.symbol || (entry.token || '').toUpperCase() || '—';
    return {
      name: entry.label || `${sym} Wallet`,
      type: 'Address',
      addr: shortenAddr(entry.address),
      usd: r?.value_usd || 0,
      color: `linear-gradient(135deg,${colorAt(i + 1)},#1E293B)`,
      icon: null,
      token: sym.toLowerCase(),
      netLbl: r?.network_display || entry.network,
      removable: true,
      entry,
      error: !!r?.error
    };
  })];

  // ── Build KPI sparks + deltas from ./data/history.json ──
  const sorted = [...history].filter(t => !isNaN(parseGmt7(t.time))).sort((a, b) => parseGmt7(a.time) - parseGmt7(b.time));
  const allPnl = sorted.reduce((s, t) => s + Number(t.pnl_usd || 0), 0);
  const baseEquity = Math.max(0, totalUsd - allPnl);
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();
  const todayTrades = sorted.filter(t => parseGmt7(t.time) >= startMs);
  const sparkEquity = [],
    sparkRealizedToday = [];
  {
    const n = sorted.length;
    const step = Math.max(1, Math.ceil(n / 12));
    let cum = 0;
    sparkEquity.push(baseEquity);
    for (let i = 0; i < n; i++) {
      cum += Number(sorted[i].pnl_usd || 0);
      if ((i + 1) % step === 0 || i === n - 1) sparkEquity.push(baseEquity + cum);
    }
  }
  {
    const n = todayTrades.length;
    const step = Math.max(1, Math.ceil(n / 12));
    let cum = 0;
    sparkRealizedToday.push(0);
    for (let i = 0; i < n; i++) {
      cum += Number(todayTrades[i].pnl_usd || 0);
      if ((i + 1) % step === 0 || i === n - 1) sparkRealizedToday.push(cum);
    }
  }
  // Available margin: utilization % trend (just show two endpoints so guard draws flat dashed line)
  const sparkMargin = [100 - usedMarginPct, 100 - usedMarginPct];
  // Unrealized PnL: build running uPnL seeded from recent trades (best proxy we have)
  const sparkUnreal = sparkEquity.map(v => v - baseEquity);

  // Deltas
  const deltaTotalPct = baseEquity ? allPnl / baseEquity * 100 : null; // all-time net return %
  const deltaRealizedPct = totalUsd ? realizedToday / totalUsd * 100 : null; // today's ROI on equity
  const deltaUnrealPct = futures.total_wallet_balance_usd ? unrealized / futures.total_wallet_balance_usd * 100 : null;
  const deltaMarginPct = usedMarginPct != null ? -usedMarginPct : null; // negative = "used up" indicator

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
  }, /*#__PURE__*/React.createElement(WKpi, {
    label: "Total balance",
    value: fmtUsd(totalUsd),
    sub: `${connectedWallets.length} wallets · ${snap?.errors?.length ? snap.errors.length + ' err' : 'live'}`,
    delta: deltaTotalPct,
    icon: "wallet",
    color: "#8B5CF6",
    spark: sparkEquity
  }), /*#__PURE__*/React.createElement(WKpi, {
    label: "Available margin",
    value: `${fmtUsd(availMargin)} / ${fmtUsd(futures.total_wallet_balance_usd || 0)}`,
    sub: `Used ${usedMarginPct.toFixed(1)}% · Multi-asset ${futures.multi_assets_margin ? 'ON' : 'OFF'}`,
    delta: deltaMarginPct,
    icon: "shield",
    color: "#3B82F6",
    spark: sparkMargin
  }), /*#__PURE__*/React.createElement(WKpi, {
    label: "Unrealized PnL",
    value: `${unrealized >= 0 ? '+' : '−'}${fmtUsd(Math.abs(unrealized))}`,
    sub: `${positions} open positions`,
    delta: deltaUnrealPct,
    icon: "trending-up",
    color: "#10B981",
    spark: sparkUnreal
  }), /*#__PURE__*/React.createElement(WKpi, {
    label: "Realized today",
    value: `${realizedToday >= 0 ? '+' : '−'}${fmtUsd(Math.abs(realizedToday))}`,
    sub: `Since 00:00 UTC · ${snap?.realized_today_count || 0} closes`,
    delta: deltaRealizedPct,
    icon: "circle-dollar-sign",
    color: "#F97316",
    spark: sparkRealizedToday
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
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
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Connected wallets"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, "Click a card to filter the assets view"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setModalOpen(true),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 999,
      border: '1px solid #C7D2FE',
      background: '#EEF0FF',
      color: '#4338CA',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 12,
    stroke: 2.5
  }), " Connect"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 14
    }
  }, heroCards.map((w, i) => /*#__PURE__*/React.createElement(WalletCard, {
    key: w.id,
    w: w,
    active: selectedSlot === i,
    onClick: () => setSelectedSlot(i)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(DistributionBar, {
    assets: assets
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
    items: ['All Assets', 'Transactions', 'Connected Wallets'],
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
      background: loaded ? '#10B981' : '#9CA3AF',
      animation: loaded ? 'cxg-pulse 1.4s infinite' : 'none'
    }
  }), loaded ? 'Balances synced' : 'Loading…', " \xB7 ", new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }))), tab === 'All Assets' && /*#__PURE__*/React.createElement(AssetsPanel, {
    assets: assets,
    net: net,
    setNet: setNet,
    networks: networks
  }), tab === 'Transactions' && /*#__PURE__*/React.createElement(TransactionsPanel, null), tab === 'Connected Wallets' && /*#__PURE__*/React.createElement(ConnectedPanel, {
    wallets: connectedWallets,
    onRemove: remove
  })), modalOpen && /*#__PURE__*/React.createElement(ConnectWalletModal, {
    networks: networks,
    onClose: () => setModalOpen(false),
    onSave: entry => {
      add(entry);
      reloadSnap();
    }
  }));
};
window.WalletsScreen = WalletsScreen;