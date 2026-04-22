function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ChainxGate — shared shell for UI kits (sidebar + topbar + common) */
const {
  useState,
  useEffect,
  useRef
} = React;

/* Icon — uses dangerouslySetInnerHTML to shield the inner <i>→<svg> swap
   from React reconciliation. Otherwise Lucide's DOM mutation crashes React
   when the parent re-renders frequently (e.g. on API polling). */
const Icon = ({
  name,
  size = 18,
  stroke = 1.75,
  style,
  ...rest
}) => {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({
      attrs: {
        width: size,
        height: size,
        'stroke-width': stroke
      }
    });
  }, [name, size, stroke]);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: `<i data-lucide="${name}"></i>`
    }
  }, rest));
};
const TOKENS = [{
  s: 'ETH',
  file: 'eth.svg',
  running: true
}, {
  s: 'SOL',
  file: 'sol.svg',
  running: true
}, {
  s: 'BNB',
  file: 'bnb.svg',
  running: false
}, {
  s: 'XMR',
  file: 'xmr.svg',
  running: true
}, {
  s: 'AVAX',
  file: 'avax.svg',
  running: true
}, {
  s: 'LINK',
  file: 'link.svg',
  running: false
}, {
  s: 'ARB',
  file: 'arb.svg',
  running: true
}];
const BrandMark = ({
  size = 36
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: size,
    height: size,
    borderRadius: size * 0.28,
    background: 'linear-gradient(135deg,#6366F1,#A855F7)',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 12px rgba(99,102,241,.28)'
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: size * 0.62,
  height: size * 0.62,
  viewBox: "0 0 64 64",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 22 L28 30 L20 38",
  stroke: "#fff",
  strokeWidth: "3.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M44 22 L36 30 L44 38",
  stroke: "#fff",
  strokeWidth: "3.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "32",
  cy: "30",
  r: "3",
  fill: "#fff"
})));

/* ---- Sidebar footer clock: GMT+7 HH:MM:SS with per-second animation ---- */
const _TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Bangkok'
});
const _DATE_FMT = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Bangkok'
});
const _DOW_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'Asia/Bangkok'
});
const SidebarClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = _TIME_FMT.format(now);
  const [hh, mm, ss] = t.split(':');
  const d = _DATE_FMT.format(now); // "2026-04-21"
  const dow = _DOW_FMT.format(now); // "Tue"
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 12,
      padding: '12px 14px',
      borderRadius: 12,
      background: '#fff',
      border: '1px solid #EEF0F4',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 10,
      background: 'rgba(245,158,11,.12)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: '#F59E0B',
      animation: 'cxg-pulse 1.4s infinite',
      boxShadow: '0 0 0 4px rgba(245,158,11,.22)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 17,
      fontWeight: 700,
      color: '#0F172A',
      letterSpacing: '.04em',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", null, hh), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#C7D2FE'
    }
  }, ":"), /*#__PURE__*/React.createElement("span", null, mm), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#C7D2FE'
    }
  }, ":"), /*#__PURE__*/React.createElement("span", {
    key: ss,
    className: "cxg-tick",
    style: {
      color: '#F59E0B',
      minWidth: '2ch',
      display: 'inline-block'
    }
  }, ss)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace',
      letterSpacing: '.04em',
      whiteSpace: 'nowrap'
    }
  }, dow, " ", d), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: '#4338CA',
      background: '#EEF0FF',
      padding: '1px 5px',
      borderRadius: 4,
      letterSpacing: '.04em'
    }
  }, "GMT+7"))));
};
const Sidebar = ({
  active = 'Dashboard',
  onNav
}) => {
  const items = [{
    g: 'MAIN',
    rows: [{
      n: 'Overview',
      i: 'layout-dashboard'
    }, {
      n: 'Wallets',
      i: 'wallet'
    }]
  }, {
    g: 'TRADING & BOTS',
    rows: [{
      n: 'Signal Scanner',
      i: 'radar'
    }, {
      n: 'P.M Monitor',
      i: 'activity'
    }, {
      n: 'AI Bot',
      i: 'bot'
    }]
  }, {
    g: 'CONTROL PANEL',
    rows: [{
      n: 'Config Engine',
      i: 'sliders-horizontal'
    }, {
      n: 'Runtime',
      i: 'cpu'
    }, {
      n: 'Security & API Keys',
      i: 'shield'
    }]
  }];
  return /*#__PURE__*/React.createElement("aside", {
    style: sbStyle.outer
  }, /*#__PURE__*/React.createElement("div", {
    style: sbStyle.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: sbStyle.brand
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(BrandMark, {
    size: 32
  }), /*#__PURE__*/React.createElement("div", {
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
      fontWeight: 800,
      fontSize: 14,
      letterSpacing: .3,
      color: '#0F172A'
    }
  }, "CHAIN", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#6366F1'
    }
  }, "x"), "GATE"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 9,
      fontWeight: 800,
      padding: '2px 6px',
      borderRadius: 999,
      background: '#ECFDF5',
      color: '#047857',
      letterSpacing: '.08em',
      border: '1px solid #A7F3D0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 999,
      background: '#10B981',
      boxShadow: '0 0 0 2px rgba(16,185,129,.22)',
      animation: 'cxg-pulse 1.4s ease-in-out infinite'
    }
  }), "LIVE")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: '#6B7280',
      letterSpacing: 1.2,
      marginTop: 2,
      textTransform: 'uppercase',
      fontWeight: 500
    }
  }, "Never-miss Lab")))), /*#__PURE__*/React.createElement("nav", {
    style: {
      padding: '8px 10px',
      flex: 1,
      overflowY: 'auto'
    }
  }, items.map(grp => /*#__PURE__*/React.createElement("div", {
    key: grp.g
  }, /*#__PURE__*/React.createElement("div", {
    style: sbStyle.group
  }, grp.g), grp.rows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.n,
    onClick: () => (window.__NAV__ && window.__NAV__(r.n)) || (onNav && onNav(r.n)),
    style: {
      ...sbStyle.item,
      ...(active === r.n ? sbStyle.itemActive : {})
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.i,
    size: 16,
    stroke: 1.75
  }), /*#__PURE__*/React.createElement("span", null, r.n)))))), /*#__PURE__*/React.createElement(SidebarClock, null)));
};
const TopBar = ({
  title
}) => {
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setTick] = useState(0);
  const menuRef = React.useRef(null);

  // Close on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  // Tick every 2s so chips reflect live window.cxgBotStatus / cxgExchangeStatus
  // Also fetch directly so chips are correct even when AI Bot tab isn't open
  React.useEffect(() => {
    const refresh = () => {
      fetch('./data/bots.json').then(r => r.json()).then(j => {
        const list = j && Array.isArray(j.bots) ? j.bots : [];
        window.cxgBotStatus = list.reduce((m, b) => {
          m[String(b.coin || '').toUpperCase()] = (b.running_dirs || []).length > 0;
          return m;
        }, {});
        setTick(t => t + 1);
      }).catch(() => {});
      fetch('./data/exchanges.json').then(r => r.json()).then(j => {
        const ex = j && Array.isArray(j.exchanges) ? j.exchanges : [];
        window.cxgExchangeStatus = ex.reduce((m, e) => {
          m[String(e.id || '').toLowerCase()] = !!e.connected;
          return m;
        }, {});
        setTick(t => t + 1);
      }).catch(() => {});
    };
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);
  return /*#__PURE__*/React.createElement("header", {
    style: tbStyle.bar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 220,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: tbStyle.iconBtn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "panel-left",
    size: 16
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      margin: 0,
      color: '#0F172A',
      whiteSpace: 'nowrap'
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: tbStyle.chips
  }, TOKENS.map(t => {
    const live = !!(window.cxgBotStatus && window.cxgBotStatus[t.s]);
    return /*#__PURE__*/React.createElement("div", {
      key: t.s,
      style: {
        ...tbStyle.tchip,
        ...(live ? {} : {
          opacity: .72
        })
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: `/assets/tokens/${t.file}`,
      width: "16",
      height: "16"
    }), /*#__PURE__*/React.createElement("span", null, t.s, " xBot"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 999,
        background: live ? '#10B981' : '#9CA3AF',
        animation: live ? 'cxg-heartbeat-on 1.4s ease-out infinite' : 'none',
        marginLeft: 2
      }
    }));
  }), (() => {
    const exConnected = !!(window.cxgExchangeStatus && window.cxgExchangeStatus.binance);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        ...tbStyle.tchip,
        background: exConnected ? '#ECFDF5' : '#F5F6FA',
        borderColor: exConnected ? '#A7F3D0' : '#E5E7EB',
        color: exConnected ? '#047857' : '#6B7280',
        opacity: exConnected ? 1 : .72
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "/assets/tokens/binance.svg",
      width: "16",
      height: "16"
    }), /*#__PURE__*/React.createElement("span", null, "BINANCE"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 999,
        background: exConnected ? '#10B981' : '#9CA3AF',
        animation: exConnected ? 'cxg-heartbeat-on 1.4s ease-out infinite' : 'none',
        marginLeft: 2
      }
    }));
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...tbStyle.iconBtn,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      background: '#EF4444',
      color: '#fff',
      fontSize: 9,
      fontWeight: 700,
      width: 14,
      height: 14,
      borderRadius: 999,
      display: 'grid',
      placeItems: 'center'
    }
  }, "5")), /*#__PURE__*/React.createElement("button", {
    style: tbStyle.iconBtn,
    onClick: () => setTheme(theme === 'light' ? 'dark' : 'light')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'light' ? 'moon' : 'sun',
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setMenuOpen(!menuOpen),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
      padding: '4px 6px 4px 4px',
      borderRadius: 999,
      border: `1px solid ${menuOpen ? '#C7D2FE' : '#EEF0F4'}`,
      background: menuOpen ? '#EEF0FF' : '#fff',
      transition: 'all 120ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 999,
      background: 'linear-gradient(135deg,#6366F1,#A855F7)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 11,
      display: 'grid',
      placeItems: 'center'
    }
  }, "AD"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14,
    style: {
      transform: menuOpen ? 'rotate(180deg)' : 'none',
      transition: 'transform 160ms'
    }
  })), menuOpen && /*#__PURE__*/React.createElement(ProfileMenu, {
    onClose: () => setMenuOpen(false)
  }))));
};
const ProfileMenu = ({
  onClose
}) => {
  const items = [{
    i: 'user',
    n: 'My Profile',
    k: 'profile'
  }, {
    i: 'settings',
    n: 'Settings',
    k: 'settings'
  }, {
    i: 'help-circle',
    n: 'Help & Support',
    k: 'help'
  }];
  const handleClick = key => {
    onClose();
    if (key === 'logout') {
      // Land on marketing landing (root)
      (window.__LOGOUT__ && window.__LOGOUT__());
    }
  };
  const item = (it, danger) => /*#__PURE__*/React.createElement("div", {
    key: it.k,
    onClick: () => handleClick(it.k),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 14px',
      cursor: 'pointer',
      fontSize: 13,
      color: danger ? '#DC2626' : '#1F2937',
      fontWeight: 500,
      transition: 'background 100ms'
    },
    onMouseOver: e => e.currentTarget.style.background = danger ? '#FEF2F2' : '#F5F6FF',
    onMouseOut: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.i,
    size: 15,
    stroke: 1.9,
    style: {
      color: danger ? '#DC2626' : '#6B7280'
    }
  }), /*#__PURE__*/React.createElement("span", null, it.n));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 0,
      top: 'calc(100% + 8px)',
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #EEF0F4',
      boxShadow: '0 10px 28px rgba(17,24,39,.12), 0 2px 6px rgba(17,24,39,.06)',
      minWidth: 220,
      zIndex: 100,
      overflow: 'hidden',
      animation: 'cxg-tick 160ms cubic-bezier(.2,.8,.2,1) both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 14px 12px',
      borderBottom: '1px solid #F1F3F8',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      background: 'linear-gradient(135deg,#6366F1,#A855F7)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      display: 'grid',
      placeItems: 'center'
    }
  }, "AD"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0F172A'
    }
  }, "Administrator"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 1
    }
  }, "Pro Trader"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 0'
    }
  }, items.map(it => item(it))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #F1F3F8',
      padding: '6px 0'
    }
  }, item({
    i: 'log-out',
    n: 'Logout',
    k: 'logout'
  }, true)));
};
const sbStyle = {
  outer: {
    width: 240,
    flexShrink: 0
  },
  inner: {
    width: 240,
    background: '#FAFBFC',
    borderRight: '1px solid #EEF0F4',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0
  },
  brand: {
    padding: '18px 20px 14px',
    borderBottom: '1px solid #EEF0F4'
  },
  group: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    fontWeight: 700,
    padding: '14px 10px 6px'
  },
  item: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: 2
  },
  itemActive: {
    background: '#6366F1',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(99,102,241,.25)'
  },
  user: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    padding: 14,
    borderTop: '1px solid #EEF0F4'
  }
};
const tbStyle = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '12px 22px',
    borderBottom: '1px solid #EEF0F4',
    background: 'rgba(255,255,255,.85)',
    backdropFilter: 'blur(8px)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: '#6B7280'
  },
  chips: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden'
  },
  tchip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 9px 4px 4px',
    border: '1px solid #E5E7EB',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background: '#fff',
    color: '#1F2937',
    whiteSpace: 'nowrap'
  }
};

/* --- Reusable pieces --- */

const KpiCard = ({
  tile,
  icon,
  label,
  value,
  valueColor,
  pill,
  pillColor,
  footLabel,
  footValue,
  footColor
}) => /*#__PURE__*/React.createElement("div", {
  style: cardStyle.kpi
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: tile,
    display: 'grid',
    placeItems: 'center',
    color: '#fff'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: icon,
  size: 20,
  stroke: 2
})), pill && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 999,
    background: pillColor.bg,
    color: pillColor.fg
  }
}, pill)), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: 500,
    marginBottom: 2
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 22,
    fontWeight: 700,
    color: valueColor || '#0F172A',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-.01em'
  }
}, value), footLabel && /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
    fontSize: 11,
    color: '#6B7280'
  }
}, /*#__PURE__*/React.createElement("span", null, footLabel), /*#__PURE__*/React.createElement("span", {
  style: {
    color: footColor || '#0F172A',
    fontWeight: 600
  }
}, footValue)));
const Pill = ({
  variant = 'neutral',
  children,
  pulse
}) => {
  const map = {
    running: {
      bg: '#ECFDF5',
      fg: '#047857'
    },
    stopped: {
      bg: '#FEF2F2',
      fg: '#B91C1C'
    },
    profit: {
      bg: '#ECFDF5',
      fg: '#047857'
    },
    live: {
      bg: '#ECFDF5',
      fg: '#047857'
    },
    open: {
      bg: '#F3E8FF',
      fg: '#7C3AED'
    },
    apy: {
      bg: '#F3E8FF',
      fg: '#7C3AED'
    },
    up: {
      bg: '#ECFDF5',
      fg: '#047857'
    },
    dn: {
      bg: '#FEF2F2',
      fg: '#B91C1C'
    },
    neutral: {
      bg: '#F3F4F6',
      fg: '#374151'
    }
  };
  const c = map[variant] || map.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg
    }
  }, pulse && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: 'currentColor',
      animation: 'cxg-pulse 1.4s infinite'
    }
  }), children);
};
const Btn = ({
  variant = 'primary',
  icon,
  children,
  onClick,
  style
}) => {
  const map = {
    primary: {
      background: '#6366F1',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(99,102,241,.28)',
      border: '1px solid transparent'
    },
    ghost: {
      background: '#fff',
      color: '#1F2937',
      border: '1px solid #E5E7EB'
    },
    success: {
      background: '#10B981',
      color: '#fff',
      border: '1px solid transparent'
    },
    danger: {
      background: '#fff',
      color: '#DC2626',
      border: '1px solid #FECACA'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 500,
      borderRadius: 8,
      padding: '8px 14px',
      cursor: 'pointer',
      transition: 'all 120ms cubic-bezier(.2,.8,.2,1)',
      ...map[variant],
      ...style
    },
    onMouseOver: e => {
      if (variant === 'primary') e.currentTarget.style.background = '#4F46E5';
      if (variant === 'ghost') e.currentTarget.style.background = '#F3F4F6';
    },
    onMouseOut: e => {
      if (variant === 'primary') e.currentTarget.style.background = '#6366F1';
      if (variant === 'ghost') e.currentTarget.style.background = '#fff';
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14,
    stroke: 2
  }), children);
};
const Tabs = ({
  items,
  active,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'inline-flex',
    background: '#F5F6FA',
    padding: 4,
    borderRadius: 10,
    gap: 2
  }
}, items.map(it => /*#__PURE__*/React.createElement("div", {
  key: it,
  onClick: () => onChange && onChange(it),
  style: {
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: active === it ? '#fff' : '#4B5563',
    background: active === it ? '#6366F1' : 'transparent',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: active === it ? '0 2px 6px rgba(99,102,241,.25)' : 'none',
    transition: 'all 160ms'
  }
}, it)));
const Chips = ({
  items,
  active,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
  }
}, items.map(it => /*#__PURE__*/React.createElement("div", {
  key: it,
  onClick: () => onChange && onChange(it),
  style: {
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 999,
    border: `1px solid ${active === it ? '#6366F1' : '#E5E7EB'}`,
    background: active === it ? '#6366F1' : '#fff',
    color: active === it ? '#fff' : '#4B5563',
    cursor: 'pointer'
  }
}, it)));
const cardStyle = {
  panel: {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 1px 2px rgba(17,24,39,.04), 0 1px 3px rgba(17,24,39,.03)',
    border: '1px solid #EEF0F4'
  },
  kpi: {
    background: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 1px 2px rgba(17,24,39,.04), 0 1px 3px rgba(17,24,39,.03)',
    border: '1px solid #EEF0F4'
  }
};
Object.assign(window, {
  Icon,
  Sidebar,
  TopBar,
  KpiCard,
  Pill,
  Btn,
  Tabs,
  Chips,
  BrandMark,
  TOKENS,
  cardStyle
});