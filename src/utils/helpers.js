/* --- THEME & DRAWING UTILS --- */

export const THEME = {
    bg: "bg-[#0b0d14]", // Deepest space blue
    panel: "bg-[#131722]/90 backdrop-blur-xl border border-slate-700/50",
    accent: "text-cyan-400",
    accentBg: "bg-cyan-500",
    text: "text-slate-200",
    success: "text-emerald-400",
    danger: "text-rose-400",
    grid: "#1e293b"
  };
  
  export const drawArrow = (ctx, fromX, fromY, toX, toY, color = '#00d4ff', label = '') => {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = color;
    ctx.fill();
    if (label) {
      ctx.fillStyle = color;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(label, toX + 10, toY);
    }
  };