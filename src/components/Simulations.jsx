import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { drawArrow } from '../utils/helpers';
import { Slider } from './UIComponents';
import { SimLayout, SimControls } from './SimLayout';

// 1. RAMP & FORCES
export const RampSim = () => {
  const canvasRef = useRef(null);
  const [params, setParams] = useState({ angle: 30, mass: 5, mu: 0.2, g: 9.8 });
  const [state, setState] = useState({ x: 0, v: 0, t: 0, running: false });
  const RAMP_LEN = 600;

  useEffect(() => {
    if (!state.running) return;
    let animId;
    const rad = (params.angle * Math.PI) / 180;
    
    const fGravityParallel = params.mass * params.g * Math.sin(rad);
    const fNormal = params.mass * params.g * Math.cos(rad);
    const maxFriction = params.mu * fNormal;
    
    let fNet = fGravityParallel - maxFriction;
    if (fNet < 0) fNet = 0;
    
    const acc = fNet / params.mass;

    const loop = () => {
      setState(prev => {
        const dt = 0.016;
        const newV = prev.v + acc * dt;
        let newX = prev.x + (prev.v * dt) + (0.5 * acc * dt * dt);
        
        if (newX > RAMP_LEN) return { ...prev, running: false, x: RAMP_LEN };
        return { ...prev, t: prev.t + dt, v: newV, x: newX };
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [state.running, params]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const { width, height } = cvs;
    const rad = (params.angle * Math.PI) / 180;

    ctx.clearRect(0,0,width,height);
    const startX = 50;
    const startY = height - 50;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + RAMP_LEN * Math.cos(rad), startY - RAMP_LEN * Math.sin(rad));
    ctx.lineTo(startX + RAMP_LEN * Math.cos(rad), startY);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    const boxSize = 40;
    const boxDist = state.x;

    ctx.save();
    ctx.translate(startX + boxDist * Math.cos(rad), startY - boxDist * Math.sin(rad));
    ctx.rotate(-rad);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(0, -boxSize, boxSize, boxSize);
    ctx.rotate(rad);
    drawArrow(ctx, boxSize/2, -boxSize/2, boxSize/2, -boxSize/2 + 60, '#10b981', 'mg');
    ctx.rotate(-rad);
    drawArrow(ctx, boxSize/2, -boxSize, boxSize/2, -boxSize - 50, '#f472b6', 'N');
    if (params.mu > 0) drawArrow(ctx, 0, -5, -40, -5, '#facc15', 'f');
    ctx.restore();

    ctx.beginPath();
    ctx.arc(startX, startY, 40, 0, -rad, true);
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillText(`${params.angle}°`, startX + 45, startY - 10);
  }, [params, state.x]);

  const concept = {
    title: "Inclined Plane Mechanics",
    description: "An object on a ramp is subject to gravity. We decompose gravity into two components: one pulling it down the ramp (parallel) and one pulling it into the ramp (perpendicular).",
    formulas: [
      { label: "Force Parallel", tex: "F_p = mg \\sin(\\theta)" },
      { label: "Force Normal", tex: "F_N = mg \\cos(\\theta)" },
      { label: "Friction", tex: "f_k = \\mu F_N" },
      { label: "Acceleration", tex: "a = g(\\sin\\theta - \\mu\\cos\\theta)" }
    ],
    applications: ["Highway Banking", "Loading Ramps", "Landslides"],
    questions: [
      { q: "A block of mass m is placed on a smooth inclined plane of inclination θ. What is the force exerted by the plane on the block?", a: "The force exerted by the plane is the Normal Force.\nAns: mg cos(θ)" },
      { q: "If the coefficient of friction is μ, what is the angle of repose (θ) at which the block just starts to slide?", a: "At the point of sliding, mg sin(θ) = μ mg cos(θ).\ntan(θ) = μ\nAns: θ = tan⁻¹(μ)" },
      { q: "A block slides down an incline of 30° with an acceleration of g/4. Find the coefficient of kinetic friction.", a: "a = g(sin 30° - μ cos 30°)\ng/4 = g(0.5 - μ(√3/2))\n0.25 = 0.5 - 0.866μ\nAns: μ ≈ 0.29" },
      { q: "Why is it easier to pull a body up an inclined plane than to lift it vertically?", a: "On an incline, you only overcome the component mg sin(θ) (plus friction), which is less than the full weight mg (since sin θ < 1 for θ < 90°)." },
      { q: "Calculate the work done by gravity on a block of mass 2kg sliding down 5m along an incline of 30°.", a: "Work = Force_parallel × distance\nW = (mg sin 30°) × d\nW = 2 × 9.8 × 0.5 × 5\nAns: 49 Joules" }
    ]
  };

  return <SimLayout 
    Controls={
      <>
        <Slider label="Ramp Angle" value={params.angle} min={5} max={60} step={1} onChange={v => setParams({...params, angle: v})} unit="°" />
        <Slider label="Mass" value={params.mass} min={1} max={50} step={1} onChange={v => setParams({...params, mass: v})} unit="kg" />
        <Slider label="Friction Coeff (μ)" value={params.mu} min={0} max={1} step={0.05} onChange={v => setParams({...params, mu: v})} unit="" />
        <SimControls running={state.running} onToggle={() => setState(s => ({...s, running: !s.running}))} onReset={() => setState(s => ({...s, x:0, v:0, t:0, running:false}))} />
      </>
    }
    Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />}
    Data={[
      { l: "Velocity", v: state.v, u: "m/s" },
      { l: "Distance", v: state.x, u: "m" },
      { l: "Net Force", v: params.mass * ((params.g * Math.sin(params.angle*Math.PI/180)) - (params.g * Math.cos(params.angle*Math.PI/180)*params.mu)), u: "N" }
    ]}
    Concept={concept}
  />
};

// 2. PROJECTILE MOTION
export const ProjectileSim = () => {
  const canvasRef = useRef(null);
  const [params, setParams] = useState({ v0: 50, angle: 45, h0: 0 });
  const [state, setState] = useState({ t: 0, running: false, landed: false, hit: false });
  const [tgt, setTgt] = useState({ x: 300, w: 40 });

  useEffect(() => { setTgt({ x: 200 + Math.random() * 400, w: 50 }); }, []);

  useEffect(() => {
    if (!state.running || state.landed) return;
    let animId;
    const rad = (params.angle * Math.PI) / 180;
    const vx = params.v0 * Math.cos(rad);
    const vy = params.v0 * Math.sin(rad);
    const g = 9.81;

    const loop = () => {
      setState(prev => {
        const dt = 0.05;
        const newT = prev.t + dt;
        const y = params.h0 + (vy * newT) - (0.5 * g * newT * newT);
        const x = vx * newT;

        if (y < 0) {
          const isHit = Math.abs((x * 4 + 50) - (tgt.x + tgt.w/2)) < tgt.w;
          return { ...prev, t: newT, running: false, landed: true, hit: isHit };
        }
        return { ...prev, t: newT };
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [state.running, params, tgt]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const { width, height } = cvs;
    const scale = 4;
    const startY = height - 50;
    const startX = 50;

    ctx.clearRect(0,0,width,height);
    
    // Ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, startY, width, 50);

    // Target
    ctx.fillStyle = state.hit ? '#10b981' : '#f43f5e';
    ctx.fillRect(tgt.x, startY - 10, tgt.w, 10);
    ctx.fillStyle = '#fff';
    ctx.fillText(state.hit ? "HIT!" : "TARGET", tgt.x, startY + 20);

    // Cannon
    ctx.beginPath();
    ctx.arc(startX, startY - (params.h0 * scale), 10, 0, Math.PI*2);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();

    // Trajectory
    const rad = (params.angle * Math.PI) / 180;
    const vx = params.v0 * Math.cos(rad);
    const vy = params.v0 * Math.sin(rad);
    const g = 9.81;

    // Ghost Path
    ctx.beginPath();
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([5,5]);
    for(let t=0; t<20; t+=0.1) {
      const gx = startX + (vx * t * scale);
      const gy = startY - ((params.h0 + vy * t - 0.5 * g * t*t) * scale);
      if (gy > startY) break;
      ctx.lineTo(gx, gy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball
    const bx = startX + (vx * state.t * scale);
    const by = startY - ((params.h0 + vy * state.t - 0.5 * g * state.t*state.t) * scale);
    if (by <= startY) {
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI*2);
      ctx.fillStyle = '#facc15';
      ctx.fill();
      // Vectors
      if (state.running) {
        drawArrow(ctx, bx, by, bx + vx, by, '#38bdf8', '');
        drawArrow(ctx, bx, by, bx, by - (vy - g*state.t), '#a78bfa', '');
      }
    }

  }, [state, params, tgt]);

  const concept = {
    title: "Projectile Motion",
    description: "Motion in two dimensions. The horizontal velocity is constant (ignoring air resistance), while vertical velocity changes due to gravity (-g).",
    formulas: [
      { label: "Horizontal Pos", tex: "x(t) = v_0 \\cos(\\theta) t" },
      { label: "Vertical Pos", tex: "y(t) = v_0 \\sin(\\theta) t - \\frac{1}{2}gt^2" },
      { label: "Range", tex: "R = \\frac{v^2 \\sin(2\\theta)}{g}" }
    ],
    applications: ["Sports Ballistics", "Rocket Launches", "Water Fountains"],
    questions: [
      { q: "At what angle of projection is the horizontal range maximum?", a: "Range R = (v² sin 2θ)/g. R is max when sin 2θ = 1, so 2θ = 90°.\nAns: 45°" },
      { q: "Two projectiles are fired at angles 30° and 60° with the same speed. Compare their ranges.", a: "Ranges are equal for complementary angles (θ and 90°-θ).\nRange at 30° = Range at 60°.\nAns: Ratio 1:1" },
      { q: "What is the angle between velocity and acceleration at the highest point of a projectile path?", a: "At the highest point, velocity is purely horizontal (vx) and acceleration is purely vertical (g downward).\nAns: 90°" },
      { q: "If the maximum height H equals the horizontal range R, find the angle of projection.", a: "H = R\n(v² sin²θ)/2g = (v² 2sinθcosθ)/g\n(sin²θ)/2 = 2sinθcosθ\ntan θ = 4\nAns: θ = tan⁻¹(4) ≈ 76°" },
      { q: "A ball is thrown with 20 m/s at 30°. Find the time of flight. (g=10 m/s²)", a: "T = (2u sin θ)/g\nT = (2 × 20 × 0.5) / 10\nAns: 2 seconds" }
    ]
  };

  return <SimLayout 
    Controls={
      <>
        <Slider label="Velocity" value={params.v0} min={10} max={100} step={1} onChange={v => setParams({...params, v0: v})} unit="m/s" />
        <Slider label="Angle" value={params.angle} min={0} max={90} step={1} onChange={v => setParams({...params, angle: v})} unit="°" />
        <Slider label="Height" value={params.h0} min={0} max={50} step={1} onChange={v => setParams({...params, h0: v})} unit="m" />
        <SimControls running={state.running} onToggle={() => setState(s => ({...s, running: !s.running}))} onReset={() => setState({t: 0, running: false, landed: false, hit: false})} />
        <button onClick={() => setTgt({ x: 100 + Math.random() * 600, w: 40 + Math.random() * 40})} className="w-full mt-4 text-xs text-cyan-400 hover:underline">Reposition Target</button>
      </>
    }
    Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />}
    Data={[
      { l: "Time", v: state.t, u: "s" },
      { l: "Height", v: Math.max(0, params.h0 + (params.v0 * Math.sin(params.angle*Math.PI/180) * state.t) - (0.5 * 9.81 * state.t**2)), u: "m" },
      { l: "Range", v: params.v0 * Math.cos(params.angle*Math.PI/180) * state.t, u: "m" }
    ]}
    Concept={concept}
  />
};

// 3. CIRCULAR MOTION
export const CircularSim = () => {
  const canvasRef = useRef(null);
  const [params, setParams] = useState({ r: 100, v: 5, m: 2 });
  const [angle, setAngle] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    let req;
    const loop = () => {
      setAngle(a => a + (params.v / params.r) * 0.5); // 0.5 speed factor
      req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [running, params]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const { width, height } = cvs;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0,0,width,height);
    
    // Path
    ctx.beginPath();
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([5,5]);
    ctx.arc(cx, cy, params.r, 0, Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);

    const bx = cx + params.r * Math.cos(angle);
    const by = cy + params.r * Math.sin(angle);

    // Radius line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // Mass
    ctx.beginPath();
    ctx.arc(bx, by, 10 + params.m*2, 0, Math.PI*2);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();

    // Vectors
    // Velocity (Tangent)
    const vx = -Math.sin(angle) * 40;
    const vy = Math.cos(angle) * 40;
    drawArrow(ctx, bx, by, bx+vx, by+vy, '#facc15', 'v');

    // Force (Inward)
    const fx = -Math.cos(angle) * 40;
    const fy = -Math.sin(angle) * 40;
    drawArrow(ctx, bx, by, bx+fx, by+fy, '#f43f5e', 'Fc');

  }, [angle, params]);

  const concept = {
    title: "Uniform Circular Motion",
    description: "An object moving in a circle at constant speed is constantly changing direction. This requires a net force directed towards the center (Centripetal Force).",
    formulas: [
      { label: "Centripetal Accel", tex: "a_c = \\frac{v^2}{r}" },
      { label: "Centripetal Force", tex: "F_c = \\frac{mv^2}{r}" },
      { label: "Angular Vel", tex: "\\omega = \\frac{v}{r}" }
    ],
    applications: ["Satellites", "Car Turns", "Centrifuges"],
    questions: [
      { q: "What provides the centripetal force for a car turning on a level road?", a: "Friction between the tires and the road provides the necessary centripetal force.\nFc = f_friction ≤ μN" },
      { q: "A cyclist bends inwards while turning. Why?", a: "To generate a component of the Normal reaction that provides the necessary centripetal force and to balance the torque due to friction." },
      { q: "Calculate the banking angle for a road curve of radius 20m for a speed of 10 m/s (g=10).", a: "tan θ = v²/rg\ntan θ = (10)² / (20 × 10) = 100/200 = 0.5\nAns: θ = tan⁻¹(0.5)" },
      { q: "In a vertical circle, where is the tension in the string maximum?", a: "At the lowest point.\nT = mg + (mv²/r)\nGravity and Centrifugal force both pull/push outward relative to center." },
      { q: "What is the minimum speed required at the top of a vertical loop to complete the circle?", a: "At the top, Tension T ≥ 0.\nmg = mv²/r\nv² = rg\nAns: v = √rg" }
    ]
  };

  return <SimLayout 
    Controls={
      <>
        <Slider label="Radius" value={params.r} min={50} max={200} step={10} onChange={v => setParams({...params, r: v})} unit="m" />
        <Slider label="Velocity" value={params.v} min={1} max={20} step={1} onChange={v => setParams({...params, v: v})} unit="m/s" />
        <Slider label="Mass" value={params.m} min={1} max={10} step={1} onChange={v => setParams({...params, m: v})} unit="kg" />
        <SimControls running={running} onToggle={() => setRunning(!running)} onReset={() => { setRunning(false); setAngle(0); }} />
      </>
    }
    Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />}
    Data={[
      { l: "Centripetal F", v: (params.m * params.v**2)/params.r * 10, u: "N" },
      { l: "Angular Vel", v: params.v / params.r, u: "rad/s" },
      { l: "Period", v: (2 * Math.PI * params.r) / params.v, u: "s" }
    ]}
    Concept={concept}
  />
};

// 4. ORBITAL GRAVITY
export const OrbitSim = () => {
  const canvasRef = useRef(null);
  const [params, setParams] = useState({ starMass: 1000, planetMass: 10, v0: 4 });
  const [state, setState] = useState({ x: 200, y: 0, vx: 0, vy: 4, trail: [] });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setState(s => ({ ...s, vy: params.v0, trail: [] }));
  }, [params.v0]);

  useEffect(() => {
    if (!running) return;
    let req;
    const G = 1;
    const dt = 0.5;

    const loop = () => {
      setState(prev => {
        const distSq = prev.x*prev.x + prev.y*prev.y;
        const dist = Math.sqrt(distSq);
        const force = -(G * params.starMass) / distSq;
        
        const ax = force * (prev.x / dist);
        const ay = force * (prev.y / dist);

        const newVx = prev.vx + ax * dt;
        const newVy = prev.vy + ay * dt;
        const newX = prev.x + newVx * dt;
        const newY = prev.y + newVy * dt;

        let newTrail = [...prev.trail];
        if (newTrail.length > 100) newTrail.shift();
        if (Math.floor(Date.now()) % 5 === 0) newTrail.push({x: newX, y: newY});

        if (dist < 30) return { ...prev, running: false };

        return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy, trail: newTrail };
      });
      req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [running, params]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const { width, height } = cvs;
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#0b0d14';
    ctx.fillRect(0,0,width,height);

    const starGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 30);
    starGrad.addColorStop(0, '#fef08a');
    starGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = starGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#facc15';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    state.trail.forEach((p, i) => {
      if (i===0) ctx.moveTo(cx + p.x, cy + p.y);
      else ctx.lineTo(cx + p.x, cy + p.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx + state.x, cy + state.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    drawArrow(ctx, cx + state.x, cy + state.y, cx + state.x + state.vx * 10, cy + state.y + state.vy * 10, '#fff', '');

  }, [state]);

  const concept = {
    title: "Kepler's Laws & Gravity",
    description: "Gravity provides the centripetal force required to keep planets in orbit. The velocity must be perfectly balanced with gravity; too slow and it crashes, too fast and it escapes.",
    formulas: [
      { label: "Universal Gravity", tex: "F_g = G \\frac{M m}{r^2}" },
      { label: "Orbital Speed", tex: "v = \\sqrt{\\frac{GM}{r}}" },
      { label: "Centripetal Force", tex: "F_c = \\frac{mv^2}{r}" }
    ],
    applications: ["Satellites", "ISS Docking", "Solar System Dynamics"],
    questions: [
      { q: "According to Kepler's Third Law, how is the time period T related to orbital radius r?", a: "The square of the time period is proportional to the cube of the semi-major axis.\nAns: T² ∝ r³" },
      { q: "If the distance between Earth and Sun were doubled, how would the gravitational force change?", a: "F ∝ 1/r².\nIf r becomes 2r, F becomes 1/(2)² = 1/4.\nAns: Force becomes 1/4th of original." },
      { q: "What is the condition for a geostationary satellite?", a: "1. Time period must be 24 hours (same as Earth).\n2. Must orbit in the equatorial plane.\n3. Height approx 36,000 km." },
      { q: "Define Escape Velocity.", a: "The minimum velocity required for an object to escape the gravitational field of a planet.\nVe = √(2GM/R) = √2 × V_orbital" },
      { q: "Why do astronauts feel weightless in the ISS?", a: "They are in a state of free fall. The ISS and astronauts are both falling towards Earth at the same rate (centripetal acceleration), so Normal force is zero." }
    ]
  };

  return <SimLayout 
    Controls={
      <>
        <Slider label="Star Mass" value={params.starMass} min={500} max={2000} step={100} onChange={v => setParams({...params, starMass: v})} unit="M☉" />
        <Slider label="Initial Speed" value={params.v0} min={1} max={8} step={0.1} onChange={v => setParams({...params, v0: v})} unit="km/s" />
        <SimControls running={running} onToggle={() => setRunning(!running)} onReset={() => { setRunning(false); setState(s => ({ ...s, x: 200, y: 0, vx: 0, vy: params.v0, trail: [] }))}} />
      </>
    }
    Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />}
    Data={[
      { l: "Distance", v: Math.sqrt(state.x**2 + state.y**2), u: "AU" },
      { l: "Velocity", v: Math.sqrt(state.vx**2 + state.vy**2), u: "km/s" },
      { l: "Force (G)", v: (params.starMass * 10) / (state.x**2 + state.y**2), u: "N" }
    ]}
    Concept={concept}
  />
};

// 5. WAVES SIM
export const WaveSim = () => {
  const canvasRef = useRef(null);
  const [params, setParams] = useState({ f1: 2, a1: 30, f2: 3, a2: 30, speed: 0.1 });
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let req;
    const loop = () => {
      setOffset(prev => prev + params.speed);
      req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [params]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const { width, height } = cvs;
    
    ctx.clearRect(0,0,width,height);
    const centerY = height / 2;
    
    const drawWave = (freq, amp, color, yOff, label) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = yOff + Math.sin(x * 0.02 * freq + offset) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillText(label, 10, yOff - amp - 10);
    };

    drawWave(params.f1, params.a1, '#f472b6', centerY - 100, 'Wave A');
    drawWave(params.f2, params.a2, '#22d3ee', centerY - 100, 'Wave B');

    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    for (let x = 0; x < width; x++) {
      const y1 = Math.sin(x * 0.02 * params.f1 + offset) * params.a1;
      const y2 = Math.sin(x * 0.02 * params.f2 + offset) * params.a2;
      const ySum = centerY + 100 + (y1 + y2);
      if (x === 0) ctx.moveTo(x, ySum);
      else ctx.lineTo(x, ySum);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.fillText('Superposition (A + B)', 10, centerY + 60);

  }, [offset, params]);

  const concept = {
    title: "Wave Interference",
    description: "When two waves meet, they add up (superposition). If peaks align, we get constructive interference. If a peak meets a trough, they cancel out.",
    formulas: [
      { label: "Wave Equation", tex: "y(x,t) = A \\sin(kx - \\omega t)" },
      { label: "Superposition", tex: "y_{net} = y_1 + y_2" },
      { label: "Beat Frequency", tex: "f_{beat} = |f_1 - f_2|" }
    ],
    applications: ["Noise Cancelling", "Musical Tuning", "Holography"],
    questions: [
      { q: "What is the phase difference required for constructive interference?", a: "For maximum amplitude (constructive), waves must be in phase.\nAns: Δφ = 2nπ (where n = 0, 1, 2...)" },
      { q: "Two waves have amplitude ratio 3:1. What is the ratio of maximum to minimum intensity?", a: "Imax ∝ (A1+A2)² = (3+1)² = 16\nImin ∝ (A1-A2)² = (3-1)² = 4\nRatio = 16:4\nAns: 4:1" },
      { q: "Define Beat Frequency.", a: "The difference in frequency of two superimposed sound waves of slightly different frequencies.\nAns: f_beat = |f1 - f2|" },
      { q: "In a standing wave, what is the distance between two consecutive nodes?", a: "Distance between consecutive nodes is half the wavelength.\nAns: λ/2" },
      { q: "Does the energy of waves get destroyed during destructive interference?", a: "No. Energy is redistributed. It is minimum at destructive points and maximum at constructive points. Conservation of energy holds." }
    ]
  };

  return <SimLayout 
    Controls={
      <>
        <h3 className="text-cyan-400 text-xs font-bold mb-2">WAVE A (Pink)</h3>
        <Slider label="Frequency" value={params.f1} min={1} max={10} step={0.5} onChange={v => setParams({...params, f1: v})} unit="Hz" />
        <Slider label="Amplitude" value={params.a1} min={10} max={60} step={5} onChange={v => setParams({...params, a1: v})} unit="px" />
        <div className="my-4 border-t border-slate-700"></div>
        <h3 className="text-cyan-400 text-xs font-bold mb-2">WAVE B (Blue)</h3>
        <Slider label="Frequency" value={params.f2} min={1} max={10} step={0.5} onChange={v => setParams({...params, f2: v})} unit="Hz" />
        <Slider label="Amplitude" value={params.a2} min={10} max={60} step={5} onChange={v => setParams({...params, a2: v})} unit="px" />
      </>
    }
    Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />}
    Data={[
      { l: "Phase Diff", v: Math.abs(params.f1 - params.f2).toFixed(2), u: "rad" },
      { l: "Max Amp", v: params.a1 + params.a2, u: "px" }
    ]}
    Concept={concept}
  />
};

// 6. SPRING SIM
export const SpringSim = () => {
    const canvasRef = useRef(null);
    const [params, setParams] = useState({ k: 5, m: 2, damping: 0.05 });
    const [state, setState] = useState({ y: 150, v: 0, running: false });

    useEffect(() => {
        if (!state.running) return;
        let req;
        const loop = () => {
            setState(s => {
                const fSpring = -params.k * s.y;
                const fDamp = -params.damping * s.v * 10;
                const acc = (fSpring + fDamp) / params.m;
                const newV = s.v + acc;
                const newY = s.y + newV;
                return { ...s, y: newY, v: newV };
            });
            req = requestAnimationFrame(loop);
        };
        req = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(req);
    }, [state.running, params]);

    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        const { width, height } = cvs;
        
        ctx.clearRect(0,0,width,height);
        const anchorX = width / 2;
        const anchorY = 50;
        const eqY = 250;
        const bobY = eqY + state.y;

        ctx.beginPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.moveTo(anchorX, anchorY);
        const coils = 12;
        const springLen = bobY - anchorY;
        for(let i=0; i<=coils; i++) {
            const y = anchorY + (springLen/coils) * i;
            const x = anchorX + (i % 2 === 0 ? 10 : -10);
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#10b981';
        ctx.fillRect(anchorX - 25, bobY, 50, 50);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#475569';
        ctx.setLineDash([5,5]);
        ctx.moveTo(anchorX - 100, eqY + 25);
        ctx.lineTo(anchorX + 100, eqY + 25);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Equilibrium', anchorX + 110, eqY + 25);

        if (Math.abs(state.y) > 5) {
            drawArrow(ctx, anchorX + 60, bobY + 25, anchorX + 60, bobY + 25 - (state.y * 0.5), '#facc15', 'Fs');
        }

    }, [state, params]);

    const concept = {
        title: "Hooke's Law & Damping",
        description: "Springs exert a force proportional to displacement (Hooke's Law). Damping acts as friction, removing energy from the system over time.",
        formulas: [
          { label: "Hooke's Law", tex: "F_s = -kx" },
          { label: "Potential Energy", tex: "PE = \\frac{1}{2}kx^2" },
          { label: "Period", tex: "T = 2\\pi\\sqrt{\\frac{m}{k}}" }
        ],
        applications: ["Car Suspension", "Seismographs", "Watches"],
        questions: [
          { q: "If a spring is cut into two equal halves, what is the spring constant of each half?", a: "Spring constant k is inversely proportional to length. Halving length doubles k.\nAns: 2k" },
          { q: "A mass m oscillates with period T. If mass is quadrupled (4m), what is the new period?", a: "T ∝ √m\nNew T' = √(4m) = 2√m = 2T.\nAns: Period doubles." },
          { q: "Where is the Kinetic Energy maximum in Simple Harmonic Motion?", a: "Kinetic energy is max where velocity is max, which is at the Mean Position (equilibrium point)." },
          { q: "Two springs k1 and k2 are connected in series. What is the effective k?", a: "In series, forces are same, extensions add.\n1/k_eq = 1/k1 + 1/k2\nAns: k_eq = (k1 k2)/(k1 + k2)" },
          { q: "What happens to the total energy of a damped harmonic oscillator?", a: "It decreases exponentially with time as energy is dissipated against the damping force (friction/viscosity)." }
        ]
    };

    return <SimLayout 
        Controls={
            <>
                <Slider label="Spring Constant (k)" value={params.k} min={1} max={10} step={0.5} onChange={v => setParams({...params, k: v})} unit="N/m" />
                <Slider label="Mass (m)" value={params.m} min={1} max={10} step={0.5} onChange={v => setParams({...params, m: v})} unit="kg" />
                <Slider label="Damping" value={params.damping} min={0} max={0.2} step={0.01} onChange={v => setParams({...params, damping: v})} unit="" />
                
                <div className="flex gap-2 mt-4">
                     <button onClick={() => setState(s => ({...s, running: !s.running}))} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded font-bold">
                        {state.running ? "PAUSE" : "OSCILLATE"}
                     </button>
                     <button onClick={() => setState({y: 150, v:0, running: false})} className="p-2 bg-slate-700 rounded text-white"><RotateCcw/></button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">Click Reset to pull spring down</p>
            </>
        }
        Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />}
        Data={[
          { l: "Displacement", v: state.y, u: "px" },
          { l: "Potential E.", v: 0.5 * params.k * (state.y/100)**2, u: "J" },
          { l: "Kinetic E.", v: 0.5 * params.m * state.v**2, u: "J" }
        ]}
        Concept={concept}
    />
};

// 7. PENDULUM SIM
export const PendulumSim = () => {
  const canvasRef = useRef(null);
  const [params, setParams] = useState({ len: 200, m: 2, angle: 45 });
  const [state, setState] = useState({ theta: 45 * Math.PI/180, omega: 0, running: false });

  useEffect(() => {
    if (!state.running) {
        setState(s => ({ ...s, theta: params.angle * Math.PI/180, omega: 0 }));
    }
  }, [params.angle, params.len, state.running]);

  useEffect(() => {
    if (!state.running) return;
    let req;
    const g = 0.5; // Visual gravity scaling
    const loop = () => {
      setState(s => {
        const alpha = (-g / params.len) * Math.sin(s.theta);
        let newOmega = s.omega + alpha;
        const newTheta = s.theta + newOmega;
        newOmega *= 0.995; // damp
        return { ...s, theta: newTheta, omega: newOmega };
      });
      req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [state.running, params.len]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if(!cvs) return;
    const ctx = cvs.getContext('2d');
    const {width, height} = cvs;
    const cx = width/2;
    const cy = 50;

    ctx.clearRect(0,0,width,height);
    
    // Pivot
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx-50, cy-10, 100, 10);

    const bx = cx + params.len * Math.sin(state.theta);
    const by = cy + params.len * Math.cos(state.theta);

    // String
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    // Bob
    ctx.beginPath();
    ctx.arc(bx, by, 10 + params.m*3, 0, Math.PI*2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    // Vectors
    drawArrow(ctx, bx, by, bx, by + 50, '#10b981', 'mg'); // g
    const tx = bx - Math.sin(state.theta)*60;
    const ty = by - Math.cos(state.theta)*60;
    drawArrow(ctx, bx, by, tx, ty, '#a78bfa', 'T'); // tension

  }, [state, params]);

  const concept = {
    title: "Simple Pendulum",
    description: "A mass suspended from a pivot acts as a harmonic oscillator. The restoring force is the component of gravity perpendicular to the string.",
    formulas: [
      { label: "Period (Small Angle)", tex: "T \\approx 2\\pi \\sqrt{\\frac{L}{g}}" },
      { label: "Restoring Force", tex: "F = -mg \\sin(\\theta)" },
      { label: "Potential Energy", tex: "PE = mgL(1 - \\cos\\theta)" }
    ],
    applications: ["Grandfather Clocks", "Seismometers", "Metronomes"],
    questions: [
      { q: "How does the time period of a simple pendulum depend on the mass of the bob?", a: "It does NOT depend on mass. T = 2π√(L/g). Mass cancels out in the restoring force equation." },
      { q: "A pendulum clock is taken to the moon (g_moon = g/6). Will it run fast or slow?", a: "T ∝ 1/√g. If g decreases, T increases (takes longer to tick).\nAns: It will run Slow." },
      { q: "What is the length of a Second's Pendulum (Time period = 2s)?", a: "2 = 2π√(L/9.8)\n1 = π²(L/9.8)\nSince π² ≈ 9.8, L ≈ 1 meter.\nAns: ~1 meter" },
      { q: "If a lift accelerates upwards with acceleration 'a', what happens to the period?", a: "Effective gravity becomes (g + a). Since g_eff increases, T decreases.\nAns: Period decreases (oscillates faster)." },
      { q: "Why is the small angle approximation (sin θ ≈ θ) necessary for SHM?", a: "For SHM, Force must be proportional to displacement (F ∝ -x). This is true for pendulum only if sin θ ≈ θ (linear relation). For large angles, it's non-linear." }
    ]
  };

  return <SimLayout 
    Controls={
      <>
        <Slider label="Length" value={params.len} min={100} max={300} step={10} onChange={v => setParams({...params, len: v})} unit="px" />
        <Slider label="Start Angle" value={params.angle} min={-90} max={90} step={1} onChange={v => setParams({...params, angle: v})} unit="°" />
        <Slider label="Mass" value={params.m} min={1} max={10} step={1} onChange={v => setParams({...params, m: v})} unit="kg" />
        <SimControls running={state.running} onToggle={() => setState(s => ({...s, running: !s.running}))} onReset={() => setState(s => ({...s, running: false, theta: params.angle*Math.PI/180, omega:0}))} />
      </>
    }
    Canvas={<canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />}
    Data={[
      { l: "Angle", v: (state.theta * 180/Math.PI).toFixed(0), u: "°" },
      { l: "Velocity", v: state.omega * params.len, u: "px/s" },
      { l: "Est. Period", v: 2 * Math.PI * Math.sqrt(params.len/98), u: "s" }
    ]}
    Concept={concept}
  />
};

// 8. ELASTIC COLLISION
export const CollisionSim = () => {
    const canvasRef = useRef(null);
    const [b1, setB1] = useState({ x: 100, v: 5, m: 2, r: 25, c: '#22d3ee' });
    const [b2, setB2] = useState({ x: 500, v: -3, m: 2, r: 25, c: '#f472b6' });
    const [running, setRunning] = useState(false);
    const stateRef = useRef({ b1, b2 });

    useEffect(() => { stateRef.current = { b1, b2 }; }, [b1, b2]);

    useEffect(() => {
        if (!running) return;
        let req;
        const loop = () => {
            const s = stateRef.current;
            let n1 = { ...s.b1, x: s.b1.x + s.b1.v };
            let n2 = { ...s.b2, x: s.b2.x + s.b2.v };

            if (Math.abs(n1.x - n2.x) <= n1.r + n2.r) {
                 const v1 = ((n1.m - n2.m)*n1.v + 2*n2.m*n2.v)/(n1.m+n2.m);
                 const v2 = ((n2.m - n1.m)*n2.v + 2*n1.m*n1.v)/(n1.m+n2.m);
                 n1.v = v1; n2.v = v2;
                 n1.x = n2.x - (n1.r+n2.r) - 1; 
            }
            if (n1.x < n1.r || n1.x > 800-n1.r) n1.v *= -1;
            if (n2.x < n2.r || n2.x > 800-n2.r) n2.v *= -1;

            stateRef.current = { b1: n1, b2: n2 };
            setB1(n1); setB2(n2); 
            req = requestAnimationFrame(loop);
        };
        req = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(req);
    }, [running]);

    useEffect(() => {
        const cvs = canvasRef.current;
        if(!cvs) return;
        const ctx = cvs.getContext('2d');
        const {width, height} = cvs;

        ctx.clearRect(0,0,width,height);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(50, height/2+26, width-100, 10);

        const drawBall = (b) => {
            ctx.beginPath();
            ctx.arc(b.x, height/2, b.r, 0, Math.PI*2);
            ctx.fillStyle = b.c;
            ctx.fill();
            drawArrow(ctx, b.x, height/2, b.x + b.v*10, height/2, '#fff');
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(b.m + 'kg', b.x, height/2+5);
        };
        drawBall(b1);
        drawBall(b2);
    }, [b1, b2]);

    const concept = {
        title: "Elastic Collision",
        description: "In a perfectly elastic collision, both Momentum and Kinetic Energy are conserved. Objects bounce off each other without losing energy to heat or sound.",
        formulas: [
            { label: "Momentum", tex: "p = mv" },
            { label: "Conservation", tex: "m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'" },
            { label: "Kinetic Energy", tex: "KE = \\frac{1}{2}mv^2" }
        ],
        applications: ["Billiards", "Particle Physics", "Newton's Cradle"],
        questions: [
            { q: "In an elastic collision between two identical masses, if one is at rest, what happens after collision?", a: "They exchange velocities. The moving mass comes to rest, and the stationary mass moves with the initial velocity of the first." },
            { q: "What is the coefficient of restitution (e) for a perfectly elastic collision?", a: "Velocity of separation = Velocity of approach.\nAns: e = 1" },
            { q: "Is Kinetic Energy conserved in an Inelastic Collision?", a: "No. Some KE is lost to heat, sound, or deformation. Only Momentum is conserved." },
            { q: "Two bodies move towards each other and stick together. What type of collision is this?", a: "Perfectly Inelastic Collision. The loss of Kinetic Energy is maximum in this case." },
            { q: "Define Impulse.", a: "Impulse is the change in momentum. Also defined as the integral of Force over time.\nJ = Δp = F_avg × Δt" }
        ]
    };

    return <SimLayout 
        Controls={
            <>
                <h3 className="text-cyan-400 text-xs font-bold mb-2">OBJECT 1</h3>
                <Slider label="Mass" value={stateRef.current.b1.m} min={1} max={10} step={1} onChange={v => setB1({...b1, m: v})} unit="kg" />
                <Slider label="Velocity" value={stateRef.current.b1.v} min={-10} max={10} step={1} onChange={v => setB1({...b1, v: v})} unit="m/s" />
                <div className="my-4 border-t border-slate-700"></div>
                <h3 className="text-pink-400 text-xs font-bold mb-2">OBJECT 2</h3>
                <Slider label="Mass" value={stateRef.current.b2.m} min={1} max={10} step={1} onChange={v => setB2({...b2, m: v})} unit="kg" />
                <Slider label="Velocity" value={stateRef.current.b2.v} min={-10} max={10} step={1} onChange={v => setB2({...b2, v: v})} unit="m/s" />
                <SimControls running={running} onToggle={() => setRunning(!running)} onReset={() => { setRunning(false); setB1({...b1, x:100, v:5}); setB2({...b2, x:500, v:-3}); }} />
            </>
        }
        Canvas={<canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-cover" />}
        Data={[
            { l: "Momentum", v: (b1.m*b1.v + b2.m*b2.v), u: "kg m/s" },
            { l: "Kinetic E", v: 0.5*b1.m*b1.v**2 + 0.5*b2.m*b2.v**2, u: "J" }
        ]}
        Concept={concept}
    />
};