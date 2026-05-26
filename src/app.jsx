import { useState, useRef, useEffect } from "react";

/* ─── Simulation registry ─────────────────────────────────────────────────── */
const SIMS = [
  { id: "projectile", name: "Projectile Motion",  icon: "⟹", color: "#f97316", desc: "Launch angle and initial speed determine a projectile's parabolic path under gravity.", formula: "x = v₀cosθ · t     y = v₀sinθ · t − ½gt²" },
  { id: "pendulum",   name: "Simple Pendulum",    icon: "◎",  color: "#a78bfa", desc: "A pendulum's period depends only on length and gravity — not on mass or (small) amplitude.", formula: "T = 2π√(L/g)     θ̈ = −(g/L)sinθ" },
  { id: "wave",       name: "Wave Interference",  icon: "≋",  color: "#22d3ee", desc: "Two waves superpose — in phase they amplify (constructive), out of phase they cancel (destructive).", formula: "y = A sin(kx − ωt)     y_total = y₁ + y₂" },
  { id: "spring",     name: "Spring Oscillator",  icon: "⌁",  color: "#34d399", desc: "A mass on a spring trades kinetic and potential energy in simple harmonic motion.", formula: "F = −kx     x(t) = A cos(ωt + φ)     ω = √(k/m)" },
  { id: "gravity",    name: "Orbital Mechanics",  icon: "⊙",  color: "#fbbf24", desc: "A planet orbits a massive star under Newton's universal gravitation — Kepler's laws emerge.", formula: "F = GMm/r²     v_c = √(GM/r)     T² ∝ a³" },
  { id: "gas",        name: "Kinetic Gas Theory", icon: "∴",  color: "#f472b6", desc: "Gas molecules bouncing off walls create pressure — higher temperature means faster molecules.", formula: "PV = nRT     ½mv² = (3/2)kT" },
];

/* ─── Shared UI components ────────────────────────────────────────────────── */
function Slider({ label, value, min, max, step = 1, unit = "", color, onChange }) {
  const disp = step < 1 ? value.toFixed(1) : Math.round(value);
  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>
        {label}: <span style={{ color, fontWeight: 700 }}>{disp}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
    </div>
  );
}

function Btn({ children, onClick, color, outline }) {
  return (
    <button onClick={onClick} style={{
      background: outline ? "transparent" : color,
      color: outline ? color : "#0a0f1a",
      border: `2px solid ${color}`, borderRadius: 6,
      padding: "7px 18px", cursor: "pointer", fontFamily: "inherit",
      fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", transition: "all 0.15s",
    }}>{children}</button>
  );
}

function Pill({ label, value, unit, color }) {
  return (
    <div style={{ background: "#0d1a2a", border: "1px solid #1e3a5a", borderRadius: 6, padding: "4px 10px" }}>
      <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 13, color: color || "#e2e8f0", fontWeight: 700 }}>
        {value}<span style={{ fontSize: 10, color: "#64748b", marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── 1. Projectile Motion ───────────────────────────────────────────────── */
function ProjectileSim() {
  const C = "#f97316";
  const cRef = useRef(); const rafRef = useRef();
  const sRef = useRef({ t: 0, trail: [], last: null, running: false });
  const [p, setP] = useState({ angle: 45, speed: 20, gravity: 10 });
  const [info, setInfo] = useState({ x: "0.0", y: "0.0", vx: "0.0", vy: "0.0", t: "0.00", R: "0.0" });
  const [running, setRunning] = useState(false);

  function draw(t, trail, params) {
    const canvas = cRef.current; if (!canvas) return null;
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const { angle, speed, gravity } = params;
    const rad = angle * Math.PI / 180, vx0 = speed * Math.cos(rad), vy0 = speed * Math.sin(rad);
    const R = vx0 * 2 * vy0 / gravity, maxH = vy0 * vy0 / (2 * gravity);
    const SCALE = Math.min((W - 80) / Math.max(R * 1.15, 1), (H - 70) / Math.max(maxH * 1.55, 1));
    const OX = 50, OY = H - 45;

    ctx.fillStyle = "#060d1a"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#0c1f35"; ctx.lineWidth = 1;
    const gs = Math.max(Math.round(60 / SCALE / 5) * 5, 5);
    for (let m = gs; OX + m * SCALE < W; m += gs) { ctx.beginPath(); ctx.moveTo(OX + m * SCALE, 0); ctx.lineTo(OX + m * SCALE, OY); ctx.stroke(); }
    for (let m = gs; OY - m * SCALE > 5; m += gs) { ctx.beginPath(); ctx.moveTo(OX, OY - m * SCALE); ctx.lineTo(W, OY - m * SCALE); ctx.stroke(); }
    ctx.fillStyle = "#0a1f14"; ctx.fillRect(OX, OY, W - OX, H - OY);
    ctx.strokeStyle = "#1e4a2a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(OX, 0); ctx.lineTo(OX, OY + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, OY); ctx.lineTo(W, OY); ctx.stroke();
    ctx.font = "9px monospace"; ctx.fillStyle = "#2a4060";
    for (let m = gs; OX + m * SCALE < W - 10; m += gs) ctx.fillText(m, OX + m * SCALE - 5, OY + 14);
    for (let m = gs; OY - m * SCALE > 10; m += gs) ctx.fillText(m, 4, OY - m * SCALE + 4);
    ctx.strokeStyle = "rgba(249,115,22,0.18)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const ti = (i / 80) * (2 * vy0 / gravity);
      ctx.lineTo(OX + vx0 * ti * SCALE, OY - Math.max(0, vy0 * ti - 0.5 * gravity * ti * ti) * SCALE);
    }
    ctx.stroke(); ctx.setLineDash([]);
    if (trail.length > 1) {
      ctx.strokeStyle = "rgba(249,115,22,0.85)"; ctx.lineWidth = 2.5; ctx.beginPath();
      trail.forEach((pt, i) => { const f = i === 0 ? "moveTo" : "lineTo"; ctx[f](OX + pt.x * SCALE, OY - pt.y * SCALE); });
      ctx.stroke();
    }
    const bxm = vx0 * t, bym = Math.max(0, vy0 * t - 0.5 * gravity * t * t), cvy = vy0 - gravity * t;
    const bx = OX + bxm * SCALE, by = OY - bym * SCALE;
    const grd = ctx.createRadialGradient(bx, by, 0, bx, by, 20); grd.addColorStop(0, "rgba(249,115,22,0.45)"); grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(bx - 2, by - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    if (t > 0.01) {
      const vm = Math.sqrt(vx0 * vx0 + cvy * cvy), vs = 28 / Math.max(vm, 1);
      const ex = bx + vx0 * vs, ey = by - cvy * vs, a = Math.atan2(ey - by, ex - bx);
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 8 * Math.cos(a - 0.4), ey - 8 * Math.sin(a - 0.4));
      ctx.lineTo(ex - 8 * Math.cos(a + 0.4), ey - 8 * Math.sin(a + 0.4)); ctx.fill();
    }
    ctx.strokeStyle = "rgba(249,115,22,0.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(OX, OY, 30, -rad, 0); ctx.stroke();
    ctx.fillStyle = "#fdba74"; ctx.font = "10px monospace"; ctx.fillText(`${angle}°`, OX + 33, OY - 5);
    if (!sRef.current.running && trail.length > 1) {
      const rx = OX + R * SCALE;
      ctx.strokeStyle = "rgba(249,115,22,0.4)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(OX, OY + 22); ctx.lineTo(rx, OY + 22); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#f97316"; ctx.font = "10px monospace"; ctx.fillText(`R = ${R.toFixed(1)} m`, (OX + rx) / 2 - 20, OY + 34);
    }
    return { x: bxm.toFixed(1), y: bym.toFixed(1), vx: vx0.toFixed(1), vy: cvy.toFixed(1), t: t.toFixed(2), R: R.toFixed(1) };
  }

  function reset(params = p) {
    cancelAnimationFrame(rafRef.current);
    Object.assign(sRef.current, { t: 0, trail: [], running: false, last: null });
    setRunning(false); const r = draw(0, [], params); if (r) setInfo(r);
  }

  function launch() {
    cancelAnimationFrame(rafRef.current);
    const s = sRef.current; s.t = 0; s.trail = [{ x: 0, y: 0 }]; s.running = true; s.last = null;
    setRunning(true); const params = p;
    const { angle, speed, gravity } = params, rad = angle * Math.PI / 180;
    const vx0 = speed * Math.cos(rad), vy0 = speed * Math.sin(rad);
    function loop(ts) {
      if (!s.last) s.last = ts;
      const dt = Math.min((ts - s.last) / 1000, 0.03); s.last = ts; s.t += dt;
      const y = vy0 * s.t - 0.5 * gravity * s.t * s.t;
      s.trail.push({ x: vx0 * s.t, y: Math.max(0, y) });
      const r = draw(s.t, s.trail, params); if (r) setInfo(r);
      if (y < -0.5) { s.running = false; setRunning(false); return; }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => { reset(); }, []);
  useEffect(() => { if (!sRef.current.running) reset(p); }, [p.angle, p.speed, p.gravity]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div>
      <canvas ref={cRef} width={680} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Slider label="Launch angle" value={p.angle} min={5} max={85} unit="°" color={C} onChange={v => setP(q => ({ ...q, angle: v }))} />
        <Slider label="Initial speed" value={p.speed} min={5} max={50} unit=" m/s" color={C} onChange={v => setP(q => ({ ...q, speed: v }))} />
        <Slider label="Gravity g" value={p.gravity} min={1} max={25} unit=" m/s²" color={C} onChange={v => setP(q => ({ ...q, gravity: v }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn color={C} onClick={running ? () => reset() : launch}>{running ? "↺  Reset" : "▶  Launch"}</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {[["x", info.x, "m", C], ["y", info.y, "m", C], ["vₓ", info.vx, "m/s", null], ["vᵧ", info.vy, "m/s", null], ["t", info.t, "s", null], ["Range", info.R, "m", C]].map(([l, v, u, c]) => (
          <Pill key={l} label={l} value={v} unit={u} color={c} />
        ))}
      </div>
    </div>
  );
}

/* ─── 2. Simple Pendulum ─────────────────────────────────────────────────── */
function PendulumSim() {
  const C = "#a78bfa";
  const cRef = useRef(); const rafRef = useRef();
  const sRef = useRef({ theta: 0, omega: 0, last: null, running: false, time: 0, phase: [] });
  const [p, setP] = useState({ length: 1.5, amplitude: 30, gravity: 9.8, damping: 0.05 });
  const [playing, setPlaying] = useState(false);
  const [info, setInfo] = useState({ theta: "0.0", omega: "0.00", T: "0.00", energy: "0.00" });

  function draw(theta, omega, params) {
    const canvas = cRef.current; if (!canvas) return null;
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const { length, gravity } = params;
    const px = W * 0.38, py = 60, SCALE = Math.min((H - 100) / (length + 0.3), 160);
    const bx = px + Math.sin(theta) * length * SCALE, by = py + Math.cos(theta) * length * SCALE;
    const T = 2 * Math.PI * Math.sqrt(length / gravity);

    ctx.fillStyle = "#060d1a"; ctx.fillRect(0, 0, W, H);

    // Phase diagram panel
    const ph = sRef.current.phase;
    const PHX = W * 0.63, PHY = H / 2, PHW = W * 0.32, PHH = (H - 80) * 0.9;
    ctx.strokeStyle = "#1e3a5a"; ctx.lineWidth = 1;
    ctx.strokeRect(PHX - PHW / 2, PHY - PHH / 2, PHW, PHH);
    ctx.fillStyle = "#0a0d1a"; ctx.fillRect(PHX - PHW / 2 + 1, PHY - PHH / 2 + 1, PHW - 2, PHH - 2);
    ctx.fillStyle = "#1e3a5a"; ctx.font = "9px monospace";
    ctx.fillText("Phase space (θ, ω)", PHX - PHW / 2 + 4, PHY - PHH / 2 + 12);
    ctx.fillText("θ →", PHX + PHW / 2 - 18, PHY + 4); ctx.fillText("ω", PHX - PHW / 2 + 4, PHY - 4);
    if (ph.length > 1) {
      const maxT = Math.abs(params.amplitude) * Math.PI / 180 * 1.2;
      const maxO = Math.sqrt(2 * gravity / length * (1 - Math.cos(params.amplitude * Math.PI / 180))) * 1.5 || 1;
      ctx.strokeStyle = C; ctx.lineWidth = 1.5; ctx.beginPath();
      ph.forEach((pt, i) => {
        const dx = PHX + (pt.theta / maxT) * (PHW / 2);
        const dy = PHY - (pt.omega / maxO) * (PHH / 2);
        if (i === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
      });
      ctx.stroke();
      // current point
      const cx2 = PHX + (theta / maxT) * (PHW / 2), cy2 = PHY - (omega / maxO) * (PHH / 2);
      ctx.fillStyle = C; ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Pivot
    ctx.fillStyle = "#1e3a5a"; ctx.fillRect(px - 25, py - 8, 50, 8);
    ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();

    // Angle arc
    ctx.strokeStyle = "rgba(167,139,250,0.3)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(px, py, 50, Math.PI / 2 - 0.01, Math.PI / 2 + theta); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#a78bfa"; ctx.font = "11px monospace";
    const tl = `${(theta * 180 / Math.PI).toFixed(1)}°`;
    ctx.fillText(tl, px + Math.sin(theta / 2) * 58 - 10, py + Math.cos(theta / 2) * 30);

    // Rod
    const grdR = ctx.createLinearGradient(px, py, bx, by); grdR.addColorStop(0, "#334155"); grdR.addColorStop(1, "#64748b");
    ctx.strokeStyle = grdR; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();

    // Bob glow
    const grd = ctx.createRadialGradient(bx, by, 0, bx, by, 22); grd.addColorStop(0, "rgba(167,139,250,0.5)"); grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
    const bobGrd = ctx.createRadialGradient(bx - 3, by - 3, 0, bx, by, 13);
    bobGrd.addColorStop(0, "#ddd6fe"); bobGrd.addColorStop(1, "#7c3aed");
    ctx.fillStyle = bobGrd; ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2); ctx.fill();

    // Velocity indicator
    const vScale = 20; const vx = omega * length * SCALE * Math.cos(theta);
    const vy = -omega * length * SCALE * Math.sin(theta);
    if (Math.abs(omega) > 0.01) {
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + vx * vScale / (length * SCALE), by + vy * vScale / (length * SCALE)); ctx.stroke();
    }

    // Equilibrium line
    ctx.strokeStyle = "rgba(167,139,250,0.15)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + length * SCALE + 20); ctx.stroke(); ctx.setLineDash([]);

    const PE = gravity * length * (1 - Math.cos(theta));
    const KE = 0.5 * (omega * length) * (omega * length);
    return { theta: (theta * 180 / Math.PI).toFixed(1), omega: omega.toFixed(3), T: T.toFixed(3), energy: (KE + PE).toFixed(3) };
  }

  function reset(params = p) {
    cancelAnimationFrame(rafRef.current);
    const s = sRef.current; s.theta = params.amplitude * Math.PI / 180; s.omega = 0; s.last = null; s.running = false; s.time = 0; s.phase = [];
    setPlaying(false); const r = draw(s.theta, 0, params); if (r) setInfo(r);
  }

  function toggle() {
    if (playing) { cancelAnimationFrame(rafRef.current); sRef.current.running = false; sRef.current.last = null; setPlaying(false); return; }
    sRef.current.running = true; setPlaying(true); const params = p;
    function loop(ts) {
      const s = sRef.current;
      if (!s.last) s.last = ts;
      const dt = Math.min((ts - s.last) / 1000, 0.03); s.last = ts;
      const { gravity, length, damping } = params;
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const ddt = dt / steps;
        const alpha = -(gravity / length) * Math.sin(s.theta) - damping * s.omega;
        s.omega += alpha * ddt; s.theta += s.omega * ddt;
      }
      s.time += dt;
      if (s.phase.length > 600) s.phase.shift();
      s.phase.push({ theta: s.theta, omega: s.omega });
      const r = draw(s.theta, s.omega, params); if (r) setInfo(r);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => { reset(); }, []);
  useEffect(() => { if (!sRef.current.running) reset(p); }, [p.length, p.amplitude, p.gravity, p.damping]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const T = (2 * Math.PI * Math.sqrt(p.length / p.gravity)).toFixed(3);
  return (
    <div>
      <canvas ref={cRef} width={680} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Slider label="Length" value={p.length} min={0.3} max={3} step={0.1} unit=" m" color={C} onChange={v => setP(q => ({ ...q, length: v }))} />
        <Slider label="Amplitude" value={p.amplitude} min={5} max={80} unit="°" color={C} onChange={v => setP(q => ({ ...q, amplitude: v }))} />
        <Slider label="Gravity g" value={p.gravity} min={1} max={25} step={0.1} unit=" m/s²" color={C} onChange={v => setP(q => ({ ...q, gravity: v }))} />
        <Slider label="Damping" value={p.damping} min={0} max={0.5} step={0.01} unit="" color={C} onChange={v => setP(q => ({ ...q, damping: v }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn color={C} onClick={toggle}>{playing ? "⏸  Pause" : "▶  Play"}</Btn>
        <Btn color={C} outline onClick={() => reset()}>↺  Reset</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {[["θ", info.theta, "°", C], ["ω", info.omega, "rad/s", null], ["Period T", T, "s", C], ["Energy", info.energy, "J/kg", null]].map(([l, v, u, c]) => (
          <Pill key={l} label={l} value={v} unit={u} color={c} />
        ))}
      </div>
    </div>
  );
}

/* ─── 3. Wave Interference ───────────────────────────────────────────────── */
function WaveSim() {
  const C = "#22d3ee";
  const cRef = useRef(); const rafRef = useRef();
  const tRef = useRef(0); const lastRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [p, setP] = useState({ f1: 1.0, A1: 1.0, f2: 1.5, A2: 1.0, phase: 0 });
  const [info, setInfo] = useState({ type: "—", max: "0.00", min: "0.00" });

  function draw(t, params) {
    const canvas = cRef.current; if (!canvas) return null;
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const { f1, A1, f2, A2, phase } = params;
    const midY = H / 2, panH = H / 4, margin = 30;
    const k1 = 2 * Math.PI / (W - 2 * margin), k2 = 2 * Math.PI / (W - 2 * margin);
    const w1 = 2 * Math.PI * f1 * 0.5, w2 = 2 * Math.PI * f2 * 0.5;
    const ph = phase * Math.PI / 180;

    ctx.fillStyle = "#060d1a"; ctx.fillRect(0, 0, W, H);

    const y1s = [], y2s = [], sums = [];
    for (let i = 0; i <= W - 2 * margin; i++) {
      const x = i / (W - 2 * margin) * W;
      y1s.push(A1 * Math.sin(k1 * x * 5 - w1 * t));
      y2s.push(A2 * Math.sin(k2 * x * 5 - w2 * t + ph));
      sums.push(y1s[i] + y2s[i]);
    }
    const maxSum = Math.max(...sums), minSum = Math.min(...sums);

    function drawWave(ys, cy, scaleH, color, lineW, fill) {
      ctx.strokeStyle = color; ctx.lineWidth = lineW;
      if (fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(margin, cy); }
      else ctx.beginPath();
      ys.forEach((y, i) => {
        const px = margin + i, py = cy - y * scaleH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      if (fill) { ctx.lineTo(margin + ys.length - 1, cy); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else ctx.stroke();
    }

    const panTop1 = 20, panTop2 = H * 0.38;
    const sumTop = H * 0.62;

    // Lane backgrounds
    [[panTop1, panH, "rgba(34,211,238,0.03)"], [panTop2, panH, "rgba(139,92,246,0.03)"], [sumTop, panH * 1.3, "rgba(34,211,238,0.07)"]].forEach(([y, h, c]) => {
      ctx.fillStyle = c; ctx.fillRect(margin, y, W - 2 * margin, h);
      ctx.strokeStyle = "#0c1f35"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(margin, y + h / 2); ctx.lineTo(W - margin, y + h / 2); ctx.stroke();
    });

    // Labels
    ctx.font = "10px monospace"; ctx.fillStyle = "#22d3ee";
    ctx.fillText(`Wave 1  f=${f1}Hz  A=${A1}`, margin + 4, panTop1 + 13);
    ctx.fillStyle = "#a78bfa"; ctx.fillText(`Wave 2  f=${f2}Hz  A=${A2}  φ=${phase}°`, margin + 4, panTop2 + 13);
    ctx.fillStyle = "#34d399"; ctx.fillText("Superposition  (y₁ + y₂)", margin + 4, sumTop + 13);

    drawWave(y1s, panTop1 + panH / 2, (panH / 2 - 8) / 2, "#22d3ee", 2, null);
    drawWave(y2s, panTop2 + panH / 2, (panH / 2 - 8) / 2, "#a78bfa", 2, null);
    drawWave(sums, sumTop + panH * 0.65, (panH * 0.6 - 8) / (A1 + A2), "#34d399", 2.5, "rgba(52,211,153,0.08)");

    // Interference annotation
    const pct = Math.abs(maxSum) / (A1 + A2);
    let type = pct > 0.85 ? "Constructive ✓" : pct < 0.15 ? "Destructive ✗" : "Partial";
    return { type, max: maxSum.toFixed(2), min: minSum.toFixed(2) };
  }

  function startLoop() {
    lastRef.current = null; setPlaying(true);
    const params = { ...p };
    function loop(ts) {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05); lastRef.current = ts;
      tRef.current += dt;
      const r = draw(tRef.current, params); if (r) setInfo(r);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  function pause() { cancelAnimationFrame(rafRef.current); setPlaying(false); }

  useEffect(() => {
    startLoop();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (playing) { cancelAnimationFrame(rafRef.current); startLoop(); }
    else { const r = draw(tRef.current, p); if (r) setInfo(r); }
  }, [p.f1, p.A1, p.f2, p.A2, p.phase]);

  return (
    <div>
      <canvas ref={cRef} width={680} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Slider label="Freq 1" value={p.f1} min={0.5} max={4} step={0.1} unit=" Hz" color="#22d3ee" onChange={v => setP(q => ({ ...q, f1: v }))} />
        <Slider label="Amp 1" value={p.A1} min={0.2} max={2} step={0.1} unit="" color="#22d3ee" onChange={v => setP(q => ({ ...q, A1: v }))} />
        <Slider label="Freq 2" value={p.f2} min={0.5} max={4} step={0.1} unit=" Hz" color="#a78bfa" onChange={v => setP(q => ({ ...q, f2: v }))} />
        <Slider label="Amp 2" value={p.A2} min={0.2} max={2} step={0.1} unit="" color="#a78bfa" onChange={v => setP(q => ({ ...q, A2: v }))} />
        <Slider label="Phase Δ" value={p.phase} min={0} max={360} unit="°" color="#34d399" onChange={v => setP(q => ({ ...q, phase: v }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn color={C} onClick={playing ? pause : startLoop}>{playing ? "⏸  Pause" : "▶  Play"}</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <Pill label="Interference" value={info.type} unit="" color={info.type?.includes("Con") ? "#34d399" : info.type?.includes("Des") ? "#ef4444" : "#fbbf24"} />
        <Pill label="Max amplitude" value={info.max} unit="" color={C} />
        <Pill label="Min amplitude" value={info.min} unit="" />
      </div>
    </div>
  );
}

/* ─── 4. Spring Oscillator ───────────────────────────────────────────────── */
function SpringSim() {
  const C = "#34d399";
  const cRef = useRef(); const rafRef = useRef();
  const sRef = useRef({ x: 0, v: 0, last: null, running: false });
  const [p, setP] = useState({ k: 5, mass: 1, damping: 0.1, amplitude: 1.5 });
  const [playing, setPlaying] = useState(false);
  const [info, setInfo] = useState({ x: "0.00", v: "0.00", KE: "0.00", PE: "0.00", E: "0.00", T: "0.00" });

  function draw(x, v, params) {
    const canvas = cRef.current; if (!canvas) return null;
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const { k, mass, amplitude } = params;
    const SCALE = (W * 0.36) / Math.max(amplitude, 0.5);
    const wallX = 40, eqX = W * 0.5, bobX = eqX + x * SCALE, bobY = H / 2;
    const bobR = Math.max(8, Math.min(14, 10 * Math.sqrt(mass)));
    const T = 2 * Math.PI * Math.sqrt(mass / k);

    ctx.fillStyle = "#060d1a"; ctx.fillRect(0, 0, W, H);

    // wall
    ctx.fillStyle = "#1e3a5a"; ctx.fillRect(wallX - 14, 60, 14, H - 120);
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    for (let y = 70; y < H - 60; y += 12) { ctx.beginPath(); ctx.moveTo(wallX - 14, y); ctx.lineTo(wallX - 1, y + 8); ctx.stroke(); }

    // spring zigzag
    const nCoils = 12, springLen = bobX - wallX - bobR;
    const step = springLen / (nCoils * 2 + 2), amp2 = Math.min(10 + Math.abs(x) * 2, 16);
    ctx.strokeStyle = x > 0 ? "#ef4444" : x < -0.05 ? "#3b82f6" : "#64748b"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(wallX, bobY);
    for (let i = 0; i <= nCoils * 2 + 1; i++) {
      const sx = wallX + i * step + step;
      const sy = bobY + (i % 2 === 0 ? amp2 : -amp2);
      if (i === 0 || i === nCoils * 2 + 1) ctx.lineTo(sx, bobY); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // equilibrium line
    ctx.strokeStyle = "rgba(52,211,153,0.2)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(eqX, 30); ctx.lineTo(eqX, H - 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(52,211,153,0.5)"; ctx.font = "9px monospace"; ctx.fillText("eq", eqX + 4, H - 35);

    // displacement indicator
    if (Math.abs(x) > 0.05) {
      ctx.strokeStyle = "rgba(251,191,36,0.5)"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(eqX, bobY + bobR + 12); ctx.lineTo(bobX, bobY + bobR + 12); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#fbbf24"; ctx.font = "10px monospace"; ctx.fillText(`x=${x.toFixed(2)}m`, (eqX + bobX) / 2 - 20, bobY + bobR + 24);
    }

    // bob glow
    const grd = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobR + 10); grd.addColorStop(0, "rgba(52,211,153,0.4)"); grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(bobX, bobY, bobR + 10, 0, Math.PI * 2); ctx.fill();
    const bGrd = ctx.createRadialGradient(bobX - bobR * 0.3, bobY - bobR * 0.3, 0, bobX, bobY, bobR);
    bGrd.addColorStop(0, "#a7f3d0"); bGrd.addColorStop(1, "#059669");
    ctx.fillStyle = bGrd; ctx.beginPath(); ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2); ctx.fill();

    // velocity arrow
    if (Math.abs(v) > 0.01) {
      const ex = bobX + v * 12, a = v > 0 ? 0 : Math.PI;
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bobX + (v > 0 ? bobR : -bobR), bobY); ctx.lineTo(ex, bobY); ctx.stroke();
      ctx.fillStyle = "#fbbf24"; ctx.beginPath();
      ctx.moveTo(ex, bobY); ctx.lineTo(ex - 8 * Math.cos(a - 0.4), bobY - 8 * Math.sin(a - 0.4)); ctx.lineTo(ex - 8 * Math.cos(a + 0.4), bobY - 8 * Math.sin(a + 0.4)); ctx.fill();
    }

    // Energy bars (right panel)
    const KE = 0.5 * mass * v * v, PE = 0.5 * k * x * x, E = KE + PE;
    const maxE = 0.5 * k * amplitude * amplitude;
    const barX = W - 80, barW = 16, barMaxH = H - 120, barBase = H - 60;
    [["KE", KE, "#22d3ee"], ["PE", PE, "#a78bfa"], ["E", E, "#34d399"]].forEach(([l, val, c], i) => {
      const bh = (val / Math.max(maxE, 0.01)) * barMaxH;
      ctx.fillStyle = "#0d1a2a"; ctx.strokeStyle = "#1e3a5a"; ctx.lineWidth = 1;
      ctx.fillRect(barX + i * 22, barBase - barMaxH, barW, barMaxH);
      ctx.strokeRect(barX + i * 22, barBase - barMaxH, barW, barMaxH);
      ctx.fillStyle = c; ctx.fillRect(barX + i * 22, barBase - bh, barW, bh);
      ctx.fillStyle = "#64748b"; ctx.font = "9px monospace"; ctx.fillText(l, barX + i * 22 + 2, barBase + 12);
    });

    return { x: x.toFixed(3), v: v.toFixed(3), KE: KE.toFixed(3), PE: PE.toFixed(3), E: E.toFixed(3), T: T.toFixed(3) };
  }

  function reset(params = p) {
    cancelAnimationFrame(rafRef.current);
    const s = sRef.current; s.x = params.amplitude; s.v = 0; s.last = null; s.running = false;
    setPlaying(false); const r = draw(s.x, 0, params); if (r) setInfo(r);
  }

  function toggle() {
    if (playing) { cancelAnimationFrame(rafRef.current); sRef.current.last = null; sRef.current.running = false; setPlaying(false); return; }
    sRef.current.running = true; setPlaying(true); const params = p;
    function loop(ts) {
      const s = sRef.current;
      if (!s.last) s.last = ts;
      const dt = Math.min((ts - s.last) / 1000, 0.03); s.last = ts;
      const { k, mass, damping } = params, steps = 20;
      for (let i = 0; i < steps; i++) {
        const ddt = dt / steps;
        const a = -(k / mass) * s.x - (damping / mass) * s.v;
        s.v += a * ddt; s.x += s.v * ddt;
      }
      const r = draw(s.x, s.v, params); if (r) setInfo(r);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => { reset(); }, []);
  useEffect(() => { if (!sRef.current.running) reset(p); }, [p.k, p.mass, p.damping, p.amplitude]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div>
      <canvas ref={cRef} width={680} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Slider label="Spring const k" value={p.k} min={0.5} max={20} step={0.5} unit=" N/m" color={C} onChange={v => setP(q => ({ ...q, k: v }))} />
        <Slider label="Mass" value={p.mass} min={0.1} max={5} step={0.1} unit=" kg" color={C} onChange={v => setP(q => ({ ...q, mass: v }))} />
        <Slider label="Damping" value={p.damping} min={0} max={2} step={0.05} color={C} onChange={v => setP(q => ({ ...q, damping: v }))} />
        <Slider label="Amplitude" value={p.amplitude} min={0.2} max={2.5} step={0.1} unit=" m" color={C} onChange={v => setP(q => ({ ...q, amplitude: v }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn color={C} onClick={toggle}>{playing ? "⏸  Pause" : "▶  Play"}</Btn>
        <Btn color={C} outline onClick={() => reset()}>↺  Reset</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {[["x", info.x, "m", C], ["v", info.v, "m/s", null], ["KE", info.KE, "J", "#22d3ee"], ["PE", info.PE, "J", "#a78bfa"], ["Total E", info.E, "J", C], ["Period T", info.T, "s", null]].map(([l, v, u, c]) => (
          <Pill key={l} label={l} value={v} unit={u} color={c} />
        ))}
      </div>
    </div>
  );
}

/* ─── 5. Orbital Mechanics ───────────────────────────────────────────────── */
function GravitySim() {
  const C = "#fbbf24";
  const cRef = useRef(); const rafRef = useRef();
  const sRef = useRef({ px: 0, py: 0, vx: 0, vy: 0, trail: [], last: null });
  const [p, setP] = useState({ GM: 4000, radius: 120, eccentricity: 0 });
  const [playing, setPlaying] = useState(true);
  const [info, setInfo] = useState({ r: "0", v: "0.0", F: "0.0", T: "0.0" });

  function initOrbit(params, W, H) {
    const { GM, radius, eccentricity } = params;
    const cx = W / 2, cy = H / 2;
    const r0 = radius * (1 - eccentricity);
    const vc = Math.sqrt(GM / radius) * (1 + eccentricity);
    return { px: cx + r0, py: cy, vx: 0, vy: vc };
  }

  function draw(state, trail, params) {
    const canvas = cRef.current; if (!canvas) return null;
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const { GM } = params;

    ctx.fillStyle = "#060d1a"; ctx.fillRect(0, 0, W, H);

    // Stars background
    if (!draw._stars) {
      draw._stars = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 }));
    }
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    draw._stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); });

    // Orbit trail
    if (trail.length > 1) {
      ctx.lineWidth = 1.5;
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        ctx.strokeStyle = `rgba(251,191,36,${alpha * 0.7})`;
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
      }
    }

    // Gravitational field lines
    ctx.strokeStyle = "rgba(251,191,36,0.05)"; ctx.lineWidth = 1;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35); ctx.lineTo(cx + Math.cos(a) * (W / 2), cy + Math.sin(a) * (H / 2)); ctx.stroke();
    }

    // Star glow
    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45); sg.addColorStop(0, "rgba(255,220,50,0.9)"); sg.addColorStop(0.4, "rgba(255,160,20,0.5)"); sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fill();
    const sgg = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, 20); sgg.addColorStop(0, "#fff7a0"); sgg.addColorStop(1, "#f59e0b");
    ctx.fillStyle = sgg; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();

    // Gravity arrow from planet to star
    const dx = cx - state.px, dy = cy - state.py, dr = Math.sqrt(dx * dx + dy * dy);
    const fscale = Math.min(GM / (dr * dr) * 0.8, 30);
    const fex = state.px + (dx / dr) * fscale, fey = state.py + (dy / dr) * fscale;
    const fa = Math.atan2(fey - state.py, fex - state.px);
    ctx.strokeStyle = "rgba(239,68,68,0.7)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(state.px, state.py); ctx.lineTo(fex, fey); ctx.stroke();
    ctx.fillStyle = "rgba(239,68,68,0.7)"; ctx.beginPath();
    ctx.moveTo(fex, fey); ctx.lineTo(fex - 6 * Math.cos(fa - 0.4), fey - 6 * Math.sin(fa - 0.4)); ctx.lineTo(fex - 6 * Math.cos(fa + 0.4), fey - 6 * Math.sin(fa + 0.4)); ctx.fill();

    // Velocity arrow
    const vm = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
    const vs = 20 / Math.max(vm, 1);
    const vex = state.px + state.vx * vs, vey = state.py + state.vy * vs;
    const va = Math.atan2(vey - state.py, vex - state.px);
    ctx.strokeStyle = "#34d399"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(state.px, state.py); ctx.lineTo(vex, vey); ctx.stroke();
    ctx.fillStyle = "#34d399"; ctx.beginPath();
    ctx.moveTo(vex, vey); ctx.lineTo(vex - 6 * Math.cos(va - 0.4), vey - 6 * Math.sin(va - 0.4)); ctx.lineTo(vex - 6 * Math.cos(va + 0.4), vey - 6 * Math.sin(va + 0.4)); ctx.fill();

    // Planet glow + body
    const pg = ctx.createRadialGradient(state.px, state.py, 0, state.px, state.py, 16); pg.addColorStop(0, "rgba(59,130,246,0.5)"); pg.addColorStop(1, "transparent");
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(state.px, state.py, 16, 0, Math.PI * 2); ctx.fill();
    const pbg = ctx.createRadialGradient(state.px - 3, state.py - 3, 0, state.px, state.py, 9); pbg.addColorStop(0, "#93c5fd"); pbg.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = pbg; ctx.beginPath(); ctx.arc(state.px, state.py, 9, 0, Math.PI * 2); ctx.fill();

    // Legend
    ctx.font = "10px monospace";
    [["— velocity", "#34d399", 10], ["— gravity", "#ef4444", 24]].forEach(([t, c, dy]) => {
      ctx.fillStyle = c; ctx.fillText(t, 10, dy);
    });

    const F = GM / (dr * dr);
    return { r: Math.round(dr), v: vm.toFixed(1), F: F.toFixed(2), T: "—" };
  }

  function startLoop(params = p) {
    const canvas = cRef.current; if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const init = initOrbit(params, W, H);
    const s = sRef.current; s.px = init.px; s.py = init.py; s.vx = init.vx; s.vy = init.vy; s.trail = []; s.last = null;
    const { GM } = params;
    const cx = W / 2, cy = H / 2;
    function loop(ts) {
      if (!s.last) s.last = ts;
      const dt = Math.min((ts - s.last) / 1000, 0.05) * 60; s.last = ts;
      const steps = 20, ddt = dt / steps;
      for (let i = 0; i < steps; i++) {
        const dx = cx - s.px, dy = cy - s.py, dr3 = Math.pow(dx * dx + dy * dy, 1.5);
        const ax = GM * dx / dr3, ay = GM * dy / dr3;
        s.vx += ax * ddt; s.vy += ay * ddt; s.px += s.vx * ddt; s.py += s.vy * ddt;
      }
      s.trail.push({ x: s.px, y: s.py });
      if (s.trail.length > 300) s.trail.shift();
      const r = draw({ px: s.px, py: s.py, vx: s.vx, vy: s.vy }, s.trail, params); if (r) setInfo(r);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  function toggle() {
    if (playing) { cancelAnimationFrame(rafRef.current); setPlaying(false); return; }
    setPlaying(true); startLoop(p);
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    const canvas = cRef.current; if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const init = initOrbit(p, W, H);
    const s = sRef.current; s.px = init.px; s.py = init.py; s.vx = init.vx; s.vy = init.vy; s.trail = []; s.last = null;
    setPlaying(false);
    const r = draw({ px: s.px, py: s.py, vx: s.vx, vy: s.vy }, [], p); if (r) setInfo(r);
  }

  useEffect(() => { startLoop(); return () => cancelAnimationFrame(rafRef.current); }, []);
  useEffect(() => { cancelAnimationFrame(rafRef.current); startLoop(p); setPlaying(true); }, [p.GM, p.radius, p.eccentricity]);

  return (
    <div>
      <canvas ref={cRef} width={680} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Slider label="Star mass (GM)" value={p.GM} min={500} max={10000} step={100} color={C} onChange={v => setP(q => ({ ...q, GM: v }))} />
        <Slider label="Orbital radius" value={p.radius} min={50} max={140} unit=" px" color={C} onChange={v => setP(q => ({ ...q, radius: v }))} />
        <Slider label="Eccentricity" value={p.eccentricity} min={0} max={0.85} step={0.01} color={C} onChange={v => setP(q => ({ ...q, eccentricity: v }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn color={C} onClick={toggle}>{playing ? "⏸  Pause" : "▶  Play"}</Btn>
        <Btn color={C} outline onClick={reset}>↺  Reset</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {[["Distance r", info.r, "px", C], ["Speed v", info.v, "px/s", null], ["Force F", info.F, "units", null]].map(([l, v, u, c]) => (
          <Pill key={l} label={l} value={v} unit={u} color={c} />
        ))}
      </div>
    </div>
  );
}

/* ─── 6. Kinetic Gas Theory ──────────────────────────────────────────────── */
function GasSim() {
  const C = "#f472b6";
  const cRef = useRef(); const rafRef = useRef();
  const particlesRef = useRef([]);
  const lastRef = useRef(null);
  const collisionsRef = useRef(0);
  const [p, setP] = useState({ N: 30, temperature: 300, gravity: 0 });
  const [playing, setPlaying] = useState(true);
  const [info, setInfo] = useState({ avgV: "0.0", pressure: "0", KE: "0.0" });

  function makeParticles(params, W, H) {
    const BOX = { x: 30, y: 30, w: W - 60, h: H - 60 };
    const baseSpeed = Math.sqrt(params.temperature / 100) * 80;
    return Array.from({ length: params.N }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.5 + Math.random());
      return {
        x: BOX.x + 10 + Math.random() * (BOX.w - 20),
        y: BOX.y + 10 + Math.random() * (BOX.h - 20),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: 5 + Math.random() * 3,
      };
    });
  }

  function draw(particles, params, collisions) {
    const canvas = cRef.current; if (!canvas) return null;
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const BOX = { x: 30, y: 30, w: W - 60, h: H - 60 };

    ctx.fillStyle = "#060d1a"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#f472b6"; ctx.lineWidth = 2;
    ctx.strokeRect(BOX.x, BOX.y, BOX.w, BOX.h);
    ctx.fillStyle = "rgba(244,114,182,0.03)"; ctx.fillRect(BOX.x + 1, BOX.y + 1, BOX.w - 2, BOX.h - 2);

    let totalV = 0, totalKE = 0;
    const maxV = Math.sqrt(params.temperature / 100) * 160;

    particles.forEach(pt => {
      const v = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
      const ratio = Math.min(v / maxV, 1);
      totalV += v; totalKE += 0.5 * v * v;
      const r = Math.round(ratio * 255), b = Math.round((1 - ratio) * 255);
      const color = `rgb(${r},${Math.round(60 + ratio * 80)},${b})`;
      const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r + 4); grd.addColorStop(0, color + "cc"); grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r + 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
    });

    // velocity histogram
    const bins = 10, histX = BOX.x + BOX.w + 6, histW = W - histX - 6, maxBinH = BOX.h * 0.7;
    const hist = new Array(bins).fill(0);
    particles.forEach(pt => {
      const v = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
      const bin = Math.min(Math.floor((v / maxV) * bins), bins - 1);
      hist[bin]++;
    });
    const maxBin = Math.max(...hist, 1);
    ctx.fillStyle = "#1e3a5a"; ctx.font = "9px monospace"; ctx.fillText("Speed dist.", histX, BOX.y + 10);
    hist.forEach((count, i) => {
      const bh = (count / maxBin) * maxBinH;
      const bx = histX, by = BOX.y + BOX.h - bh - 10, bw = histW - 4;
      const ratio2 = i / bins;
      ctx.fillStyle = `rgb(${Math.round(ratio2 * 255)},80,${Math.round((1 - ratio2) * 255)})`;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = "#0d1a2a"; ctx.lineWidth = 0.5; ctx.strokeRect(bx, by, bw, bh);
    });
    ctx.fillStyle = "#475569"; ctx.font = "8px monospace";
    ctx.fillText("slow", histX, BOX.y + BOX.h + 2); ctx.fillText("fast", histX, BOX.y + BOX.h - maxBinH - 5);

    // temperature indicator
    ctx.fillStyle = "#1e3a5a"; ctx.fillRect(W - 18, BOX.y, 12, BOX.h);
    const tempH = (params.temperature / 1000) * BOX.h;
    const tgrd = ctx.createLinearGradient(0, BOX.y + BOX.h - tempH, 0, BOX.y + BOX.h); tgrd.addColorStop(0, "#ef4444"); tgrd.addColorStop(1, "#3b82f6");
    ctx.fillStyle = tgrd; ctx.fillRect(W - 18, BOX.y + BOX.h - tempH, 12, tempH);
    ctx.fillStyle = "#64748b"; ctx.font = "8px monospace"; ctx.fillText("T", W - 16, BOX.y - 4);

    const avgV = particles.length > 0 ? totalV / particles.length : 0;
    const avgKE = particles.length > 0 ? totalKE / particles.length : 0;
    return { avgV: avgV.toFixed(1), pressure: collisions, KE: avgKE.toFixed(0) };
  }

  function startLoop(params = p) {
    const canvas = cRef.current; if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    particlesRef.current = makeParticles(params, W, H);
    collisionsRef.current = 0; lastRef.current = null;
    const BOX = { x: 30, y: 30, w: W - 60, h: H - 60 };
    function loop(ts) {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05); lastRef.current = ts;
      let wallHits = 0;
      const pts = particlesRef.current;
      const { gravity } = params;
      pts.forEach(pt => {
        pt.vy += gravity * 0.5 * dt;
        pt.x += pt.vx * dt * 60; pt.y += pt.vy * dt * 60;
        if (pt.x - pt.r < BOX.x) { pt.x = BOX.x + pt.r; pt.vx = Math.abs(pt.vx); wallHits++; }
        if (pt.x + pt.r > BOX.x + BOX.w) { pt.x = BOX.x + BOX.w - pt.r; pt.vx = -Math.abs(pt.vx); wallHits++; }
        if (pt.y - pt.r < BOX.y) { pt.y = BOX.y + pt.r; pt.vy = Math.abs(pt.vy); wallHits++; }
        if (pt.y + pt.r > BOX.y + BOX.h) { pt.y = BOX.y + BOX.h - pt.r; pt.vy = -Math.abs(pt.vy); wallHits++; }
      });
      collisionsRef.current += wallHits;
      const r = draw(pts, params, collisionsRef.current); if (r) setInfo(r);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  function toggle() {
    if (playing) { cancelAnimationFrame(rafRef.current); setPlaying(false); return; }
    setPlaying(true); startLoop(p);
  }

  useEffect(() => { startLoop(); return () => cancelAnimationFrame(rafRef.current); }, []);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current); collisionsRef.current = 0;
    startLoop(p); setPlaying(true);
  }, [p.N, p.temperature, p.gravity]);

  return (
    <div>
      <canvas ref={cRef} width={680} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
        <Slider label="Molecules N" value={p.N} min={5} max={80} color={C} onChange={v => setP(q => ({ ...q, N: v }))} />
        <Slider label="Temperature" value={p.temperature} min={50} max={1000} step={10} unit=" K" color={C} onChange={v => setP(q => ({ ...q, temperature: v }))} />
        <Slider label="Gravity" value={p.gravity} min={0} max={5} step={0.1} color={C} onChange={v => setP(q => ({ ...q, gravity: v }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Btn color={C} onClick={toggle}>{playing ? "⏸  Pause" : "▶  Play"}</Btn>
        <Btn color={C} outline onClick={() => { cancelAnimationFrame(rafRef.current); collisionsRef.current = 0; startLoop(p); setPlaying(true); }}>↺  Reset</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <Pill label="Avg speed" value={info.avgV} unit="px/s" color={C} />
        <Pill label="Wall collisions" value={info.pressure} unit="" color={C} />
        <Pill label="Avg KE" value={info.KE} unit="" />
        <Pill label="Temperature" value={p.temperature} unit=" K" color="#ef4444" />
        <Pill label="Molecules" value={p.N} unit="" />
      </div>
    </div>
  );
}

/* ─── Main App ────────────────────────────────────────────────────────────── */
const SIM_COMPONENTS = {
  projectile: ProjectileSim,
  pendulum:   PendulumSim,
  wave:       WaveSim,
  spring:     SpringSim,
  gravity:    GravitySim,
  gas:        GasSim,
};

export default function App() {
  const [selected, setSelected] = useState("projectile");
  const sim = SIMS.find(s => s.id === selected);
  const SimComponent = SIM_COMPONENTS[selected];

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600&family=Space+Grotesk:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #060d1a; } ::-webkit-scrollbar-thumb { background: #1e3a5a; border-radius: 2px; }
        input[type=range] { height: 4px; }
        :focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #0f2035", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#070e1e" }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#22d3ee" }}>Physics</span><span style={{ color: "#e2e8f0" }}>Lab</span>
          </div>
          <div style={{ fontSize: 10, color: "#334155", letterSpacing: "0.12em", marginTop: 2 }}>INTERACTIVE SIMULATIONS</div>
        </div>
        <div style={{ fontSize: 10, color: "#334155", textAlign: "right" }}>
          <div style={{ color: "#1e3a5a" }}>6 simulations</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3ee", boxShadow: "0 0 6px #22d3ee" }} />
            <span style={{ color: "#1e4a6a" }}>LIVE</span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <nav style={{ width: 210, borderRight: "1px solid #0f2035", background: "#070e1e", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "12px 16px 6px", fontSize: 9, color: "#1e3a5a", letterSpacing: "0.15em" }}>SIMULATIONS</div>
          {SIMS.map(s => (
            <button key={s.id} onClick={() => setSelected(s.id)} style={{
              width: "100%", textAlign: "left", background: selected === s.id ? `${s.color}12` : "transparent",
              border: "none", borderLeft: `3px solid ${selected === s.id ? s.color : "transparent"}`,
              padding: "12px 16px", cursor: "pointer", fontFamily: "inherit",
              color: selected === s.id ? s.color : "#475569", fontSize: 12, fontWeight: selected === s.id ? 600 : 400,
              transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 16, opacity: 0.9 }}>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
          <div style={{ margin: "16px", borderTop: "1px solid #0f2035", paddingTop: 16, fontSize: 10, color: "#1e3a5a", lineHeight: 1.6 }}>
            Adjust sliders to explore how physical parameters affect each system in real time.
          </div>
        </nav>

        {/* Main area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Sim header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 22, color: sim.color }}>{sim.icon}</span>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: sim.color, letterSpacing: "-0.01em" }}>{sim.name}</h1>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, maxWidth: 600 }}>{sim.desc}</p>
            <div style={{ marginTop: 10, background: "#0d1a2a", border: "1px solid #1e3a5a", borderRadius: 6, padding: "8px 14px", display: "inline-block" }}>
              <span style={{ fontSize: 9, color: "#334155", letterSpacing: "0.1em" }}>EQUATION  </span>
              <span style={{ fontSize: 12, color: sim.color, fontFamily: "monospace" }}>{sim.formula}</span>
            </div>
          </div>

          {/* Simulation */}
          <SimComponent key={selected} />
        </main>
      </div>
    </div>
  );
}
