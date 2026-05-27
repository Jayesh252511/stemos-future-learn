import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Atom, Sigma, FlaskConical, Play, Pause, RotateCcw, HelpCircle,
  TrendingUp, BarChart2, Plus, Info, Check, ArrowRight
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { useLanguage } from "@/lib/i18n";
import { useLabLanguage } from "@/lib/i18n-lab";
import { DoodleAtom, DoodleFormula, DoodleStar } from "@/components/site/Doodles";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "STEMOS Lab — Interactive STEM Sandboxes" },
      { name: "description", content: "Interactive math, physics, and chemistry simulation engine. Learn Newtonian gravity, dynamic calculus tangent graphing, and particle collisions." },
    ],
  }),
  component: LabPage,
});

type Satellite = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  trail: { x: number; y: number }[];
  color: string;
};

function LabPage() {
  const { t } = useLanguage();
  const { tl } = useLabLanguage();
  const [activeTab, setActiveTab] = useState<"physics" | "math" | "chem">("physics");

  return (
    <Layout>
      <div className="relative overflow-hidden min-h-screen bg-background">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-80 pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-3 py-1 text-xs text-primary font-semibold mb-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>HACKATHON BUILD</span>
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {tl("labTitle")}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {tl("labSubtitle")}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl border bg-surface/50 p-1 backdrop-blur shadow-soft gap-1">
              {[
                { id: "physics", label: tl("physicsTab"), icon: Atom },
                { id: "math", label: tl("mathTab"), icon: Sigma },
                { id: "chem", label: tl("chemTab"), icon: FlaskConical },
              ].map((tb) => {
                const Active = activeTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => setActiveTab(tb.id as any)}
                    className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-medium transition ${
                      Active ? "text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {Active && (
                      <motion.div
                        layoutId="active-lab-tab"
                        className="absolute inset-0 bg-secondary rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <tb.icon className={`h-4 w-4 ${Active ? "text-primary animate-pulse" : ""}`} />
                    <span>{tb.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sandbox Workspace Container */}
          <div className="glass-strong rounded-2xl border bg-surface/65 shadow-card overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "physics" && <PhysicsSandbox tl={tl} />}
              {activeTab === "math" && <MathGrapher tl={tl} />}
              {activeTab === "chem" && <ChemicalArena tl={tl} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ==========================================
   PHYSICS SANDBOX: NEWTONIAN ORBIT MECHANICS
   ========================================== */
function PhysicsSandbox({ tl }: { tl: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [gravity, setGravity] = useState(0.85); // G coefficient
  const [simSpeed, setSimSpeed] = useState(1);
  const [satMass, setSatMass] = useState(10);
  const [traceTrails, setTraceTrails] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  // Simulation Constants
  const sunRef = useRef({ x: 300, y: 220, mass: 15000, radius: 24 });
  const isDraggingSun = useRef(false);
  const mouseDragStart = useRef<{ x: number; y: number } | null>(null);
  const currentMousePos = useRef<{ x: number; y: number } | null>(null);

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 440;
      sunRef.current.x = canvas.width / 2;
      sunRef.current.y = canvas.height / 2;
    }
  }, []);

  // Main Physics loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateAndDraw = () => {
      // 1. CLEAR
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry space grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. PHYSICS UPDATE (only if not paused)
      if (!isPaused) {
        const dt = 0.1 * simSpeed;
        const sun = sunRef.current;
        const G = gravity * 0.15; // scaling factor

        setSatellites((prev) => {
          return prev
            .map((sat) => {
              const dx = sun.x - sat.x;
              const dy = sun.y - sat.y;
              const r2 = dx * dx + dy * dy;
              const r = Math.sqrt(r2);

              if (r < sun.radius + 4) {
                // Collided with Sun
                return null;
              }

              // F_g = G * M * m / r^2
              // a = F_g / m = G * M / r^2
              const a = (G * sun.mass) / Math.max(r2, 100);
              const ax = a * (dx / r);
              const ay = a * (dy / r);

              const nextVx = sat.vx + ax * dt;
              const nextVy = sat.vy + ay * dt;
              const nextX = sat.x + nextVx * dt;
              const nextY = sat.y + nextVy * dt;

              const nextTrail = [...sat.trail];
              if (traceTrails) {
                nextTrail.push({ x: nextX, y: nextY });
                if (nextTrail.length > 250) nextTrail.shift();
              } else {
                nextTrail.length = 0;
              }

              return {
                ...sat,
                x: nextX,
                y: nextY,
                vx: nextVx,
                vy: nextVy,
                trail: nextTrail,
              };
            })
            .filter(Boolean) as Satellite[];
        });
      }

      // 3. RENDER SUN
      const sun = sunRef.current;
      const sunGrad = ctx.createRadialGradient(sun.x, sun.y, 2, sun.x, sun.y, sun.radius);
      sunGrad.addColorStop(0, "#fffbeb");
      sunGrad.addColorStop(0.2, "#fef08a");
      sunGrad.addColorStop(0.8, "#f59e0b");
      sunGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 4. RENDER SATELLITES
      satellites.forEach((sat) => {
        // Draw Trail
        if (sat.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(sat.trail[0].x, sat.trail[0].y);
          for (let i = 1; i < sat.trail.length; i++) {
            ctx.lineTo(sat.trail[i].x, sat.trail[i].y);
          }
          ctx.strokeStyle = sat.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.55;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Draw Planet Body
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, 5 + sat.mass * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.shadowColor = sat.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw direction vector (optional line indicator)
        ctx.beginPath();
        ctx.moveTo(sat.x, sat.y);
        ctx.lineTo(sat.x + sat.vx * 1.5, sat.y + sat.vy * 1.5);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. RENDER CURRENT VECTOR LINE IN LAUNCH
      if (mouseDragStart.current && currentMousePos.current) {
        const start = mouseDragStart.current;
        const curr = currentMousePos.current;

        // Trace line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head at target
        const angle = Math.atan2(curr.y - start.y, curr.x - start.x);
        ctx.beginPath();
        ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#22c55e";
        ctx.fill();
      }

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animId);
  }, [satellites, isPaused, simSpeed, gravity, traceTrails]);

  // Mouse Interaction Functions
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const sun = sunRef.current;
    const distToSun = Math.sqrt((pos.x - sun.x) ** 2 + (pos.y - sun.y) ** 2);

    if (distToSun < sun.radius + 10) {
      isDraggingSun.current = true;
    } else {
      mouseDragStart.current = pos;
      currentMousePos.current = pos;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (isDraggingSun.current) {
      sunRef.current.x = pos.x;
      sunRef.current.y = pos.y;
    } else if (mouseDragStart.current) {
      currentMousePos.current = pos;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingSun.current) {
      isDraggingSun.current = false;
      return;
    }

    if (mouseDragStart.current && currentMousePos.current) {
      const start = mouseDragStart.current;
      const end = currentMousePos.current;

      // Velocity vectors proportional to vector distance
      const vx = (end.x - start.x) * 0.12;
      const vy = (end.y - start.y) * 0.12;

      // Color scheme
      const colors = ["#06b6d4", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newSat: Satellite = {
        id: crypto.randomUUID(),
        x: start.x,
        y: start.y,
        vx,
        vy,
        mass: satMass,
        trail: [],
        color: randomColor,
      };

      setSatellites((prev) => [...prev, newSat]);
    }

    mouseDragStart.current = null;
    currentMousePos.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-border h-full"
    >
      {/* Sandbox Workspace Area */}
      <div ref={containerRef} className="relative bg-[#0b0f19] overflow-hidden min-h-[440px] flex flex-col justify-between">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="block cursor-crosshair w-full"
        />

        {/* Floating Instruction overlay */}
        <div className="absolute top-4 left-4 glass px-3 py-2 rounded-xl text-xs max-w-sm pointer-events-none">
          <p className="text-foreground/90 font-medium leading-relaxed">
            💡 {tl("physicsDesc")}
          </p>
        </div>

        {/* Live Satellites count overlay */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="glass px-3 py-1.5 rounded-lg text-xs font-semibold text-primary flex items-center gap-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {satellites.length} {tl("satellites") || "Satellites"}
          </div>
        </div>
      </div>

      {/* Control Panel Area */}
      <div className="p-6 bg-card flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
            CONTROLS
          </h3>

          {/* Sandbox controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{tl("gravityStrength")}</span>
                <span className="text-primary font-bold">{gravity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.05"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{tl("simSpeed")}</span>
                <span className="text-primary font-bold">{simSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{tl("satelliteMass")}</span>
                <span className="text-primary font-bold">{satMass} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={satMass}
                onChange={(e) => setSatMass(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs font-medium">{tl("orbitTrace")}</span>
              <button
                onClick={() => setTraceTrails(!traceTrails)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  traceTrails ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    traceTrails ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Live Mathematical Calculations */}
        <div className="border-t pt-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Info className="h-3 w-3 text-primary" /> {tl("liveCalculations")}
          </h4>
          <div className="rounded-xl border bg-secondary/30 p-3 space-y-2.5 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Equation:</span>
              <div className="text-[11px] text-foreground font-semibold mt-0.5">
                Fg = G · (M · m) / r²
              </div>
            </div>
            {satellites.length > 0 ? (
              (() => {
                const s = satellites[satellites.length - 1];
                const sun = sunRef.current;
                const r = Math.sqrt((s.x - sun.x) ** 2 + (s.y - sun.y) ** 2);
                const speed = Math.sqrt(s.vx ** 2 + s.vy ** 2);
                const F = (gravity * 10 * sun.mass * s.mass) / (r * r);

                return (
                  <div className="space-y-1.5 border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tl("distance")}:</span>
                      <span className="text-cyan-500 font-bold">{r.toFixed(1)}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tl("currentVelocity")}:</span>
                      <span className="text-violet-500 font-bold">{speed.toFixed(2)}m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{tl("gravForce")}:</span>
                      <span className="text-amber-500 font-bold">{F.toFixed(0)}N</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-4 text-muted-foreground text-[11px]">
                No active orbits. Launch a satellite.
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border bg-surface py-2.5 text-xs font-semibold hover:bg-secondary transition shadow-soft"
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-primary" /> : <Pause className="h-3.5 w-3.5 text-primary" />}
            {isPaused ? tl("play") : tl("pause")}
          </button>
          <button
            onClick={() => setSatellites([])}
            className="inline-flex items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive px-3 py-2.5 text-xs font-semibold hover:bg-destructive/10 transition"
            title={tl("clearAll")}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================
   MATH GRAPHER: CALCULUS GRAPH PLOTTER
   ========================================== */
type PresetKey = "sine" | "damped" | "poly";

function MathGrapher({ tl }: { tl: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [preset, setPreset] = useState<PresetKey>("sine");
  const [amplitude, setAmplitude] = useState(1.5);
  const [frequency, setFrequency] = useState(1.0);
  const [phase, setPhase] = useState(0.0);

  // Tooltip tracking state
  const [hoverData, setHoverData] = useState<{
    mathX: number;
    mathY: number;
    slope: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Grid mapping properties
  const gridParams = {
    xMin: -10,
    xMax: 10,
    yMin: -5,
    yMax: 5,
  };

  // Math equations defined on [-10, 10]
  const evaluateWave = (x: number): { y: number; dy: number } => {
    const A = amplitude;
    const f = frequency;
    const phi = phase;

    if (preset === "sine") {
      // f(x) = A sin(f x + phi)
      const y = A * Math.sin(f * x + phi);
      const dy = A * f * Math.cos(f * x + phi);
      return { y, dy };
    } else if (preset === "damped") {
      // f(x) = A e^(-0.15 x) sin(f x + phi)
      const damp = Math.exp(-0.15 * x);
      const y = A * damp * Math.sin(f * x + phi);
      const dy =
        A * damp * (-0.15 * Math.sin(f * x + phi) + f * Math.cos(f * x + phi));
      return { y, dy };
    } else {
      // complex harmonic: A [sin(f x + phi) + 0.5 sin(2 f x)]
      const y = A * (Math.sin(f * x + phi) + 0.5 * Math.sin(2 * f * x));
      const dy = A * (f * Math.cos(f * x + phi) + f * Math.cos(2 * f * x));
      return { y, dy };
    }
  };

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 440;
    }
  }, []);

  // Handle Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // Coordinate conversion functions
    const toScreenX = (mathX: number) => {
      const pct = (mathX - gridParams.xMin) / (gridParams.xMax - gridParams.xMin);
      return pct * W;
    };
    const toScreenY = (mathY: number) => {
      // screen y is inverted
      const pct = (mathY - gridParams.yMin) / (gridParams.yMax - gridParams.yMin);
      return H - pct * H;
    };

    // 1. Draw Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    // vertical grid lines (every 1 unit)
    for (let gx = gridParams.xMin; gx <= gridParams.xMax; gx++) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(gx), 0);
      ctx.lineTo(toScreenX(gx), H);
      ctx.stroke();
    }
    // horizontal grid lines (every 1 unit)
    for (let gy = gridParams.yMin; gy <= gridParams.yMax; gy++) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(gy));
      ctx.lineTo(W, toScreenY(gy));
      ctx.stroke();
    }

    // 2. Draw Major Axes (X & Y)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(W, toScreenY(0));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), H);
    ctx.stroke();

    // Axis tick labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "10px monospace";
    ctx.fillText("y", toScreenX(0.2), 15);
    ctx.fillText("x", W - 15, toScreenY(-0.3));

    // 3. Draw Wave Curve
    ctx.strokeStyle = "#a855f7"; // purple wave
    ctx.lineWidth = 3.5;
    ctx.beginPath();

    const step = 0.05;
    let first = true;
    for (let mx = gridParams.xMin; mx <= gridParams.xMax; mx += step) {
      const { y } = evaluateWave(mx);
      const sx = toScreenX(mx);
      const sy = toScreenY(y);

      if (first) {
        ctx.moveTo(sx, sy);
        first = false;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.shadowColor = "rgba(168, 85, 247, 0.5)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // 4. Draw Tangent calculus line if hovering
    if (hoverData) {
      const { mathX, mathY, slope } = hoverData;

      // tangent line equation: y - mathY = slope * (x - mathX)
      // y = slope * (x - mathX) + mathY
      ctx.strokeStyle = "#22c55e"; // green tangent
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const tangentX1 = mathX - 4;
      const tangentY1 = slope * (tangentX1 - mathX) + mathY;
      const tangentX2 = mathX + 4;
      const tangentY2 = slope * (tangentX2 - mathX) + mathY;

      ctx.moveTo(toScreenX(tangentX1), toScreenY(tangentY1));
      ctx.lineTo(toScreenX(tangentX2), toScreenY(tangentY2));
      ctx.stroke();

      // Glowing dot at hover coordinates
      ctx.beginPath();
      ctx.arc(toScreenX(mathX), toScreenY(mathY), 6, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [preset, amplitude, frequency, phase, hoverData]);

  // Handle Mouse Hover Event on Graph Grid
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const W = canvas.width;
    const H = canvas.height;

    // Convert screenX coordinates back to mathX
    const mathX =
      gridParams.xMin + (screenX / W) * (gridParams.xMax - gridParams.xMin);

    // Calculate wave coordinates and its instantaneous slope/derivative
    const { y: mathY, dy: slope } = evaluateWave(mathX);

    // Re-verify range to avoid floating bugs
    const toScreenY = (yVal: number) => {
      const pct = (yVal - gridParams.yMin) / (gridParams.yMax - gridParams.yMin);
      return H - pct * H;
    };

    setHoverData({
      mathX,
      mathY,
      slope,
      screenX,
      screenY: toScreenY(mathY),
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-border h-full"
    >
      {/* Sandbox Workspace Area */}
      <div ref={containerRef} className="relative bg-[#0d0a16] overflow-hidden min-h-[440px] flex flex-col justify-between">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block cursor-crosshair w-full"
        />

        {/* Floating Instruction overlay */}
        <div className="absolute top-4 left-4 glass px-3 py-2 rounded-xl text-xs max-w-sm pointer-events-none">
          <p className="text-foreground/90 font-medium leading-relaxed">
            📈 {tl("mathDesc")}
          </p>
        </div>

        {/* Interactive floating math coordinates tool */}
        {hoverData && (
          <div
            className="absolute pointer-events-none glass px-3 py-2 rounded-lg text-[11px] font-mono text-foreground space-y-1 shadow-md"
            style={{
              left: `${Math.min(hoverData.screenX + 15, canvasRef.current!.width - 150)}px`,
              top: `${Math.min(hoverData.screenY - 50, canvasRef.current!.height - 80)}px`,
            }}
          >
            <div className="font-semibold text-primary">Point: ({hoverData.mathX.toFixed(2)}, {hoverData.mathY.toFixed(2)})</div>
            <div className="text-emerald-500 font-medium">dy/dx: {hoverData.slope.toFixed(3)}</div>
          </div>
        )}
      </div>

      {/* Control Panel Area */}
      <div className="p-6 bg-card flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
            PARAMETERS
          </h3>

          {/* Selector */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {tl("selectPreset")}
              </label>
              <select
                value={preset}
                onChange={(e) => {
                  setPreset(e.target.value as PresetKey);
                  setHoverData(null);
                }}
                className="w-full bg-secondary text-foreground text-xs rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-soft"
              >
                <option value="sine">{tl("sineWave")}</option>
                <option value="damped">{tl("dampedWave")}</option>
                <option value="poly">{tl("polynomialWave")}</option>
              </select>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>{tl("amplitude")}</span>
                  <span className="text-primary font-bold">{amplitude.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.05"
                  value={amplitude}
                  onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>{tl("frequency")}</span>
                  <span className="text-primary font-bold">{frequency.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.5"
                  step="0.05"
                  value={frequency}
                  onChange={(e) => setFrequency(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>{tl("phase")}</span>
                  <span className="text-primary font-bold">{phase.toFixed(2)} rad</span>
                </div>
                <input
                  type="range"
                  min="-3.14"
                  max="3.14"
                  step="0.05"
                  value={phase}
                  onChange={(e) => setPhase(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculus insights panel */}
        <div className="border-t pt-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Info className="h-3 w-3 text-primary" /> {tl("calculusInsight")}
          </h4>
          <div className="rounded-xl border bg-secondary/30 p-3 space-y-2.5 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Function Presets:</span>
              <div className="text-[10px] text-foreground font-semibold mt-1">
                {preset === "sine" && "f(x) = A sin(f·x + φ)"}
                {preset === "damped" && "f(x) = A e^(-0.15·x) sin(f·x + φ)"}
                {preset === "poly" && "f(x) = A [sin(f·x) + 0.5 sin(2f·x)]"}
              </div>
            </div>

            <div className="border-t pt-2 mt-1 space-y-2">
              <div>
                <span className="text-muted-foreground">Derivative f'(x):</span>
                <div className="text-[10px] text-emerald-500 font-semibold mt-1 leading-normal">
                  {preset === "sine" && "A·f·cos(f·x + φ)"}
                  {preset === "damped" && "A·e^(-0.15x)[f·cos(f·x + φ) - 0.15sin(f·x + φ)]"}
                  {preset === "poly" && "A [f·cos(f·x) + f·cos(2f·x)]"}
                </div>
              </div>

              {hoverData && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Math X:</span>
                    <span className="text-foreground font-bold">{hoverData.mathX.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Math Y:</span>
                    <span className="text-primary font-bold">{hoverData.mathY.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tl("slope")}:</span>
                    <span className="text-emerald-500 font-bold">{hoverData.slope.toFixed(3)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reset parameters button */}
        <button
          onClick={() => {
            setAmplitude(1.5);
            setFrequency(1.0);
            setPhase(0.0);
            setHoverData(null);
          }}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border bg-surface py-2.5 text-xs font-semibold hover:bg-secondary transition shadow-soft"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          Reset Sandbox
        </button>
      </div>
    </motion.div>
  );
}

/* ==========================================
   CHEMISTRY ARENA: REACTION CALORIMETER CHIP
   ========================================== */
type ReactionKey = "sodium" | "combust" | "neutral";

type ChemParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: "reactantA" | "reactantB" | "product" | "spark";
  color: string;
  life?: number; // for spark decay
};

function ChemicalArena({ tl }: { tl: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [reaction, setReaction] = useState<ReactionKey>("sodium");
  const [isReacting, setIsReacting] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0.0); // 0 to 1
  const [calorimeterTemp, setCalorimeterTemp] = useState(25.0); // baseline ambient 25 degrees
  const [tempHistory, setTempHistory] = useState<number[]>([]);

  // Simulation engine reference arrays
  const particlesRef = useRef<ChemParticle[]>([]);

  // Reaction constants definitions
  const reactionMeta = {
    sodium: {
      name: tl("sodiumWater"),
      equation: "2Na + 2H₂O → 2NaOH + H₂ ↑",
      enthalpy: "-368 kJ/mol",
      category: tl("exothermic"),
      colorScheme: { a: "#fca5a5", b: "#93c5fd", prod: "#fbbf24" }, // red Na, blue H2O, yellow NaOH
      targetTemp: 82.5,
    },
    combust: {
      name: tl("combustion"),
      equation: "CH₄ + 2O₂ → CO₂ + 2H₂O",
      enthalpy: "-890 kJ/mol",
      category: tl("exothermic"),
      colorScheme: { a: "#86efac", b: "#cbd5e1", prod: "#f97316" }, // green Methane, grey O2, orange products
      targetTemp: 98.0,
    },
    neutral: {
      name: tl("neutralization"),
      equation: "HCl + NaOH → NaCl + H₂O",
      enthalpy: "-57.9 kJ/mol",
      category: tl("exothermic"),
      colorScheme: { a: "#f472b6", b: "#c084fc", prod: "#a7f3d0" }, // pink acid, purple base, green neutral pH
      targetTemp: 34.2,
    },
  };

  // Initialize particles
  const initSimulation = () => {
    particlesRef.current = [];
    const meta = reactionMeta[reaction];

    // Spawn 15 particles of Reactant A and 15 particles of Reactant B
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x: 40 + Math.random() * 200,
        y: 80 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: 6,
        type: "reactantA",
        color: meta.colorScheme.a,
      });
      particlesRef.current.push({
        x: 40 + Math.random() * 200,
        y: 80 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: 6,
        type: "reactantB",
        color: meta.colorScheme.b,
      });
    }

    setReactionProgress(0);
    setCalorimeterTemp(25.0);
    setTempHistory([]);
    setIsReacting(false);
  };

  // Trigger setup on change
  useEffect(() => {
    initSimulation();
  }, [reaction]);

  // Main Canvas & Particle loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions
    canvas.width = 460;
    canvas.height = 360;

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      // 1. Draw a glowing laboratory beaker/flask representation
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Draw beaker shape
      ctx.moveTo(100, 60);
      ctx.lineTo(100, 300);
      ctx.arcTo(100, 310, 360, 310, 15);
      ctx.lineTo(360, 300);
      ctx.lineTo(360, 60);
      ctx.stroke();

      // Draw volume markings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      for (let mark = 100; mark <= 250; mark += 50) {
        const my = 300 - mark * 0.8;
        ctx.beginPath();
        ctx.moveTo(100, my);
        ctx.lineTo(115, my);
        ctx.stroke();
        ctx.fillText(`${mark} ml`, 122, my + 3);
      }

      // 2. Draw reaction solution height representation (glowing fluid in beaker)
      const currentFluidColor =
        reaction === "neutral" && reactionProgress > 0.8
          ? "rgba(16, 185, 129, 0.15)" // green neutral universal indicator
          : "rgba(6, 182, 212, 0.08)"; // standard blue solution

      ctx.fillStyle = currentFluidColor;
      ctx.beginPath();
      ctx.moveTo(102, 120);
      ctx.lineTo(358, 120);
      ctx.lineTo(358, 298);
      ctx.lineTo(102, 298);
      ctx.fill();

      // 3. Simulation particles mechanics
      const particles = particlesRef.current;
      const meta = reactionMeta[reaction];

      particles.forEach((p, idx) => {
        if (p.type === "spark") {
          // Spark physics: float upwards, decay
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.15; // float gravity
          p.life = (p.life ?? 10) - 0.35;

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.life * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          return;
        }

        // Standard Particle kinematics bouncing inside beaker bounds [110, 350], [130, 295]
        p.x += p.vx;
        p.y += p.vy;

        // Collision bounds inside beaker
        const left = 110;
        const right = 350;
        const top = 130;
        const bottom = 295;

        if (p.x - p.r < left) {
          p.x = left + p.r;
          p.vx *= -1;
        }
        if (p.x + p.r > right) {
          p.x = right - p.r;
          p.vx *= -1;
        }
        if (p.y - p.r < top) {
          p.y = top + p.r;
          p.vy *= -1;
        }
        if (p.y + p.r > bottom) {
          p.y = bottom - p.r;
          p.vy *= -1;
        }

        // Draw particle representation
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isReacting ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 4. Kinetic reaction collision triggers
        if (isReacting && reactionProgress < 1.0) {
          for (let j = idx + 1; j < particles.length; j++) {
            const other = particles[j];
            if (!other || other.type === "spark") continue;

            // Reactant A + Reactant B -> Product collision check
            const matchesReactants =
              (p.type === "reactantA" && other.type === "reactantB") ||
              (p.type === "reactantB" && other.type === "reactantA");

            if (matchesReactants) {
              const dist = Math.sqrt((p.x - other.x) ** 2 + (p.y - other.y) ** 2);
              if (dist < p.r + other.r + 2) {
                // COLLIDED! Combine to make products!
                p.type = "product";
                p.color = meta.colorScheme.prod;
                p.vx *= 0.6; // slow down post collision
                p.vy *= 0.6;

                // Eliminate other reactant to keep mass balance
                particles.splice(j, 1);

                // Spawn beautiful combustion/neutral sparks!
                const sparkColor =
                  reaction === "sodium"
                    ? "#f59e0b" // yellow sodium spark
                    : reaction === "combust"
                    ? "#ef4444" // red combustion flash
                    : "#60a5fa"; // blue neutral indicator

                for (let k = 0; k < 4; k++) {
                  particles.push({
                    x: p.x,
                    y: p.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.8) * 4,
                    r: 2,
                    type: "spark",
                    color: sparkColor,
                    life: 12,
                  });
                }

                // Increment reaction progression
                setReactionProgress((prev) => Math.min(1.0, prev + 0.068));
                break;
              }
            }
          }
        }
      });

      // Remove dead spark particles
      particlesRef.current = particles.filter(
        (p) => p.type !== "spark" || (p.life ?? 0) > 0
      );

      // Temperature calorimeter calculus
      if (isReacting) {
        const target = reactionMeta[reaction].targetTemp;
        setCalorimeterTemp((current) => {
          const delta = target - current;
          const next = current + delta * 0.015 * reactionProgress;

          // Track temperature history graph
          setTempHistory((prev) => {
            const nextHist = [...prev, next];
            if (nextHist.length > 200) nextHist.shift();
            return nextHist;
          });

          return next;
        });
      }

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animId);
  }, [isReacting, reactionProgress, reaction]);

  // Ignite reaction
  const handleIgnite = () => {
    if (isReacting) return;
    setIsReacting(true);
  };

  const meta = reactionMeta[reaction];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-border h-full"
    >
      {/* Sandbox Workspace Area */}
      <div className="relative bg-[#070b13] overflow-hidden flex flex-col justify-between p-4 min-h-[440px]">
        <div className="flex-1 flex items-center justify-center">
          <canvas ref={canvasRef} className="block border border-white/5 rounded-xl bg-black/45" />
        </div>

        {/* Floating Instruction overlay */}
        <div className="absolute top-4 left-4 glass px-3 py-2 rounded-xl text-xs max-w-sm pointer-events-none">
          <p className="text-foreground/90 font-medium leading-relaxed">
            🧪 {tl("chemDesc")}
          </p>
        </div>

        {/* Dynamic fluid temperature visualizer */}
        <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="text-left">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">{tl("tempTracker")}</span>
            <div className="font-mono text-lg font-bold text-red-500 animate-pulse">
              {calorimeterTemp.toFixed(1)}°C
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">STATE</span>
            <div className="text-xs font-semibold text-foreground">
              {reactionProgress === 0
                ? "Ambient ❄️"
                : reactionProgress >= 0.99
                ? "Equilibrium 🧬"
                : "Active collision 🔥"}
            </div>
          </div>
        </div>

        {/* Beaker fluid graphic temperature graph */}
        {tempHistory.length > 1 && (
          <div className="absolute right-4 bottom-4 glass p-2 rounded-lg w-[120px] h-[75px] flex flex-col justify-between">
            <div className="text-[8px] text-muted-foreground font-mono">Calorimetry Plot</div>
            <div className="flex items-end gap-0.5 h-10 w-full overflow-hidden">
              {tempHistory.map((tVal, i) => {
                const heightPct = Math.min(100, ((tVal - 25) / 75) * 100);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-red-500 rounded-sm"
                    style={{ height: `${Math.max(1, heightPct)}%` }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Control Panel Area */}
      <div className="p-6 bg-card flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
            CALORIMETER SELECT
          </h3>

          {/* Reactor presets selectors */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {(["sodium", "combust", "neutral"] as ReactionKey[]).map((rk) => {
                const active = reaction === rk;
                return (
                  <button
                    key={rk}
                    onClick={() => {
                      setReaction(rk);
                    }}
                    className={`text-left rounded-xl border p-3 text-xs font-semibold transition ${
                      active
                        ? "bg-secondary text-foreground shadow-sm"
                        : "hover:bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    {reactionMeta[rk].name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Calorimetry Calculations Display */}
        <div className="border-t pt-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Info className="h-3 w-3 text-primary" /> {tl("equation")}
          </h4>
          <div className="rounded-xl border bg-secondary/30 p-3 space-y-2.5 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">{tl("equation")}:</span>
              <div className="text-[10px] text-foreground font-semibold mt-1 leading-normal">
                {meta.equation}
              </div>
            </div>

            <div className="border-t pt-2 mt-1 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tl("enthalpy")}:</span>
                <span className="text-red-400 font-bold">{meta.enthalpy}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{tl("thermoType")}:</span>
                <div className="text-[10px] text-amber-500 font-semibold mt-0.5 leading-normal">
                  {meta.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ignite Trigger Button */}
        <div className="flex gap-2">
          <button
            onClick={handleIgnite}
            disabled={isReacting || reactionProgress >= 1.0}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-3.5 w-3.5" />
            {tl("igniteMix")}
          </button>
          <button
            onClick={initSimulation}
            className="inline-flex items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-semibold hover:bg-secondary transition"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
