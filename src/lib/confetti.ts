/**
 * Lightweight canvas-based confetti animation.
 * No external dependencies — ~80 lines of pure JS.
 * Respects prefers-reduced-motion.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  "#C9973A", // gold
  "#2D6A4F", // green
  "#8B1A1A", // dark red
  "#1a3a5c", // blue
  "#4a1a6b", // purple
  "#F6C547", // bright gold
  "#FFD700", // yellow
  "#FF6B6B", // coral
];

/**
 * Fire confetti animation. Call with "small" for exercise completion,
 * "big" for milestones like 100% tab or badge earned.
 */
export function fireConfetti(size: "small" | "big" = "small") {
  // Respect reduced motion preference
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }

  const count = size === "big" ? 120 : 40;
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const speed = size === "big"
      ? 4 + Math.random() * 8
      : 2 + Math.random() * 5;

    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height * (size === "big" ? 0.4 : 0.5),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (size === "big" ? 6 : 3),
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  const startTime = performance.now();
  const duration = size === "big" ? 2500 : 1500;

  function animate(now: number) {
    const elapsed = now - startTime;
    if (elapsed > duration) {
      canvas.remove();
      return;
    }

    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    const progress = elapsed / duration;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - progress * 1.2);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
