"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const stages = [
  { number: "01", name: "Kho đỗ", detail: "Xuất đỗ nguyên liệu vào dây chuyền", metric: "Đầu vào", x: 81, y: 44 },
  { number: "02", name: "Luộc đỗ", detail: "Đỗ được luộc chín ở nhiệt độ sôi", metric: "100 kg · 20 phút", x: 90, y: 18 },
  { number: "03", name: "Rang đỗ", detail: "Ba máy rang vận hành theo dòng chảy", metric: "3 × 120 kg/giờ", x: 73, y: 18 },
  { number: "04", name: "Ủ nguội", detail: "Đỗ được phủ kín trong thùng gỗ", metric: "24 giờ", x: 56, y: 18 },
  { number: "05", name: "Vỡ đỗ", detail: "Chà vỏ, sàng, hút bụi và tách kim loại", metric: "2 tấn/7 giờ", x: 46, y: 18 },
  { number: "06", name: "Xay nghiền", detail: "Nghiền đỗ thành bột mịn", metric: "≤ 0,2 mm", x: 36, y: 18 },
  { number: "07", name: "Phối trộn", detail: "Bột đỗ gặp đường hoán tại máy trộn", metric: "114 kg/mẻ", x: 33.5, y: 44 },
  { number: "08", name: "Ủ · Cán", detail: "Ủ kín rồi cán bột thành trạng thái tơi xốp", metric: "24 giờ · 15 phút", x: 57, y: 44 },
  { number: "09", name: "Tạo viên · Đóng gói", detail: "Bánh chạy liên tục qua cụm máy đóng gói", metric: "20 máy · 50 viên/phút", x: 64, y: 63 },
  { number: "10", name: "Vào hộp", detail: "Kiểm tra, vào hộp và chuyển tới kho thành phẩm", metric: "Thành phẩm", x: 64, y: 75 },
];

// Các điểm gấp được đặt theo đúng sơ đồ mũi tên của xưởng.
const beanPath = "M1552 421 V160 H619 V387";
const sugarPath = "M341 725 H399 V171 H512 V381";
const oilPath = "M300 418 H500";
const cakePath = "M628 425 H881 V520 H1328 V608 H531 V705 H1405 V809";
const powderPath = "M642 106 H256";
const powderOutputPath = "M303 283 H363 V819 H634";

function RouteParticle({ pathId, color, duration, delay = 0, radius = 6 }: { pathId: string; color: string; duration: number; delay?: number; radius?: number }) {
  return (
    <circle r={radius} fill={color} className="material-particle">
      <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

function MachineActivity() {
  return (
    <g className="machine-activity" aria-hidden="true">
      <g className="activity-loader">
        <path d="M1370 420 H1480" />
        <circle className="loader-dot loader-dot-a" cx="1370" cy="420" r="5" />
        <circle className="loader-dot loader-dot-b" cx="1370" cy="420" r="4" />
      </g>

      <g className="activity-boiler">
        <ellipse className="boiler-heat" cx="1510" cy="178" rx="55" ry="25" />
        <path className="steam steam-a" d="M1485 135 C1468 112 1498 98 1483 73" />
        <path className="steam steam-b" d="M1510 130 C1494 106 1525 93 1512 65" />
        <path className="steam steam-c" d="M1535 136 C1520 112 1550 100 1538 78" />
      </g>

      <g className="activity-roasters">
        <circle className="machine-ring ring-a" cx="1105" cy="162" r="24" />
        <circle className="machine-ring ring-b" cx="1200" cy="162" r="24" />
        <circle className="machine-ring ring-c" cx="1295" cy="162" r="24" />
      </g>

      <g className="activity-cooling">
        <circle className="cooling-pulse pulse-a" cx="875" cy="142" r="27" />
        <circle className="cooling-pulse pulse-b" cx="930" cy="142" r="27" />
        <circle className="cooling-pulse pulse-c" cx="902" cy="202" r="27" />
      </g>

      <g className="activity-breaker">
        <rect x="742" y="125" width="70" height="95" rx="8" />
        <path d="M754 148 H800 M754 173 H800 M754 198 H800" />
      </g>

      <g className="activity-grinder">
        <circle className="grinder-ring" cx="620" cy="170" r="38" />
        <circle className="grinder-core" cx="620" cy="170" r="11" />
      </g>

      <g className="activity-mixer">
        <ellipse className="mixer-ring" cx="560" cy="414" rx="48" ry="26" />
        <path className="mixer-blade" d="M522 414 H598 M560 390 V438" />
      </g>

      <g className="activity-rollers">
        <circle className="roller roller-a" cx="1008" cy="418" r="18" />
        <circle className="roller roller-b" cx="1048" cy="418" r="18" />
        <path d="M990 418 H1066" />
      </g>

      <g className="activity-packaging">
        <path className="machine-conveyor" d="M545 608 H1305" />
        <rect className="moving-pack pack-a" x="545" y="598" width="18" height="14" rx="3" />
        <rect className="moving-pack pack-b" x="545" y="598" width="18" height="14" rx="3" />
        <rect className="moving-pack pack-c" x="545" y="598" width="18" height="14" rx="3" />
      </g>

      <g className="activity-boxing">
        <path className="machine-conveyor" d="M650 705 H1375" />
        <rect className="moving-box box-a" x="650" y="693" width="22" height="18" rx="3" />
        <rect className="moving-box box-b" x="650" y="693" width="22" height="18" rx="3" />
      </g>
    </g>
  );
}

export default function FlowMap() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const overlayRef = useRef<SVGSVGElement>(null);
  const current = stages[active];
  const progress = useMemo(() => `${((active + 1) / stages.length) * 100}%`, [active]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % stages.length), 5200);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (playing) overlayRef.current?.unpauseAnimations();
    else overlayRef.current?.pauseAnimations();
  }, [playing]);

  return (
    <main className={`flow-app ${playing ? "" : "is-paused"}`}>
      <header className="flow-header">
        <a className="flow-brand" href="#flow-map" aria-label="Lưu đồ sản xuất Hoàng Giang">
          <span>HG</span>
          <div><strong>HOÀNG GIANG</strong><small>Lưu đồ sản xuất bánh đậu xanh</small></div>
        </a>
        <div className="flow-status"><i /> DÂY CHUYỀN ĐANG VẬN HÀNH</div>
        <button className="play-button" type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Tạm dừng chuyển động" : "Tiếp tục chuyển động"}>
          {playing ? "Ⅱ" : "▶"}<span>{playing ? "Tạm dừng" : "Tiếp tục"}</span>
        </button>
      </header>

      <section className="flow-title">
        <div>
          <p>TOÀN BỘ QUY TRÌNH · 01–10</p>
          <h1>Từ hạt đỗ đến <em>viên bánh.</em></h1>
        </div>
        <div className="flow-legend">
          <span><i className="legend-bean" /> Đỗ</span>
          <span><i className="legend-sugar" /> Đường</span>
          <span><i className="legend-oil" /> Dầu</span>
          <span><i className="legend-cake" /> Bánh</span>
          <span><i className="legend-powder" /> Bột</span>
        </div>
      </section>

      <section className="map-viewport" id="flow-map" aria-label="Lưu đồ sản xuất bánh đậu xanh">
        <div className="flow-canvas">
          <div className="map-shade" />

          <svg ref={overlayRef} className="flow-overlay" viewBox="0 0 1680 941" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="flow-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path id="bean-flow" className="flow-line flow-line-bean" d={beanPath} pathLength="1" />
            <path className="flow-line-dashes bean-dashes" d={beanPath} pathLength="1" />

            <path id="sugar-flow" className="flow-line flow-line-sugar" d={sugarPath} pathLength="1" />
            <path className="flow-line-dashes sugar-dashes" d={sugarPath} pathLength="1" />

            <path id="oil-flow" className="flow-line flow-line-oil" d={oilPath} pathLength="1" />
            <path className="flow-line-dashes oil-dashes" d={oilPath} pathLength="1" />

            <path id="cake-flow" className="flow-line flow-line-cake" d={cakePath} pathLength="1" />
            <path className="flow-line-dashes cake-dashes" d={cakePath} pathLength="1" />

            <path id="powder-flow" className="flow-line flow-line-powder" d={powderPath} pathLength="1" />
            <path className="flow-line-dashes powder-dashes" d={powderPath} pathLength="1" />
            <path id="powder-output-flow" className="flow-line flow-line-powder" d={powderOutputPath} pathLength="1" />
            <path className="flow-line-dashes powder-dashes" d={powderOutputPath} pathLength="1" />

            <MachineActivity />

            <RouteParticle pathId="bean-flow" color="#ff765f" duration={48} />
            <RouteParticle pathId="bean-flow" color="#ffb2a4" duration={48} delay={-24} radius={5} />
            <RouteParticle pathId="sugar-flow" color="#ffe08a" duration={36} />
            <RouteParticle pathId="oil-flow" color="#8be9aa" duration={16} />
            <RouteParticle pathId="cake-flow" color="#ff9bd2" duration={50} />
            <RouteParticle pathId="cake-flow" color="#ffd1ea" duration={50} delay={-25} radius={5} />
            <RouteParticle pathId="powder-flow" color="#9be8ff" duration={18} />
            <RouteParticle pathId="powder-output-flow" color="#9be8ff" duration={28} delay={-14} />
            <g className="trolley-particle">
              <rect x="-16" y="-8" width="32" height="17" rx="4" />
              <circle cx="-10" cy="12" r="4" /><circle cx="10" cy="12" r="4" />
              <animateMotion dur="48s" begin="-12s" repeatCount="indefinite" rotate="auto"><mpath href="#bean-flow" /></animateMotion>
            </g>
          </svg>

          {stages.map((stage, index) => (
            <button
              className={`stage-hotspot ${index === active ? "active" : ""}`}
              key={stage.number}
              type="button"
              style={{ left: `${stage.x}%`, top: `${stage.y}%` }}
              onClick={() => { setActive(index); setPlaying(false); }}
              aria-label={`${stage.number}. ${stage.name}`}
            >
              <span>{stage.number}</span>
            </button>
          ))}

          <div className="active-card" key={current.number}>
            <span className="active-number">{current.number}</span>
            <div><small>CÔNG ĐOẠN ĐANG HIỂN THỊ</small><strong>{current.name}</strong><p>{current.detail}</p></div>
            <b>{current.metric}</b>
          </div>
        </div>
      </section>

      <nav className="stage-nav" aria-label="Chọn công đoạn">
        <div className="nav-progress"><i style={{ width: progress }} /></div>
        {stages.map((stage, index) => (
          <button key={stage.number} className={index === active ? "active" : ""} type="button" onClick={() => { setActive(index); setPlaying(false); }}>
            <span>{stage.number}</span><strong>{stage.name}</strong>
          </button>
        ))}
      </nav>
    </main>
  );
}
