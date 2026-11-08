// Aceternity Background Beams with Collision + Moving Neon Orb on card perimeter

const canvas = document.getElementById("beams-canvas");
const container = document.getElementById("beams-container");

// ─── 1. Moving Neon Orb: smooth, soft, unhurried pink light along perimeter ───
const initThankyouMovingBorder = () => {
  const card = document.getElementById("beams-container");
  if (!card) return;
  const svgRect = card.querySelector(".thankyou-border-svg rect");
  const orb = card.querySelector(".thankyou-border-orb");
  if (!svgRect || !orb) return;

  let progress = 0;
  // 24 seconds per loop: smooth, slow, and unhurried
  const duration = 24000;
  let lastTime = performance.now();

  const step = (now) => {
    const dt = now - lastTime;
    lastTime = now;

    progress = (progress + dt / duration) % 1;

    try {
      const totalLen = svgRect.getTotalLength();
      if (totalLen > 0) {
        // Native SVG path coordinate calculation: perfectly continuous, never vanishes
        const pt = svgRect.getPointAtLength(progress * totalLen);
        orb.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%)`;
      }
    } catch (e) {}

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

initThankyouMovingBorder();

// ─── 2. Background Beams with Collision ───
if (canvas && container) {
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = container.offsetWidth);
  let height = (canvas.height = container.offsetHeight);

  const resize = () => {
    width = canvas.width = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
  };
  window.addEventListener("resize", resize);

  const beams = [];
  const puddles = [];
  const particles = [];

  class Beam {
    constructor(x, speed) {
      this.x = x ?? Math.random() * width;
      this.len = 70 + Math.random() * 60;
      this.y = -this.len;
      // Faster, energetic falling speed
      this.speed = speed ?? (4.2 + Math.random() * 3.5);
    }

    update() {
      this.y += this.speed;
      // Break slightly above the absolute bottom (~24px from bottom edge)
      const floorY = height - 24;

      if (this.y >= floorY) {
        puddles.push(new Puddle(this.x, floorY));

        const count = 7 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, floorY));
        }

        return false;
      }
      return true;
    }

    draw() {
      const startY = Math.max(0, this.y - this.len);
      const floorY = height - 24;
      const endY = Math.min(floorY, this.y);
      if (endY <= 0) return;

      const grad = ctx.createLinearGradient(this.x, startY, this.x, endY);
      grad.addColorStop(0, "rgba(255, 64, 129, 0)");
      grad.addColorStop(0.65, "rgba(255, 64, 129, 0.5)");
      grad.addColorStop(0.92, "#ff4081");
      grad.addColorStop(1, "#ffffff");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, startY);
      ctx.lineTo(this.x, endY);
      ctx.stroke();

      // Glowing head
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, endY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Soft small puddle that expands horizontally and fades
  class Puddle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.life = 1.0;
      this.maxLife = 36;
      this.currentFrame = 0;
      this.maxRadius = 26 + Math.random() * 18;
    }

    update() {
      this.currentFrame++;
      this.life = 1 - this.currentFrame / this.maxLife;
      return this.life > 0;
    }

    draw() {
      const progress = this.currentFrame / this.maxLife;
      const currentRadius = progress * this.maxRadius;
      const alpha = Math.max(0, this.life);

      ctx.save();
      const grad = ctx.createLinearGradient(
        this.x - currentRadius,
        this.y,
        this.x + currentRadius,
        this.y
      );
      grad.addColorStop(0, "rgba(255, 64, 129, 0)");
      grad.addColorStop(0.5, `rgba(255, 64, 129, ${0.75 * alpha})`);
      grad.addColorStop(1, "rgba(255, 64, 129, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(255, 64, 129, 0.7)";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(this.x - currentRadius, this.y);
      ctx.lineTo(this.x + currentRadius, this.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Splash particles
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2.4;
      this.vy = -(1.0 + Math.random() * 2.2);
      this.gravity = 0.1;
      this.life = 1.0;
      this.decay = 0.026 + Math.random() * 0.018;
      this.radius = 0.9 + Math.random() * 0.8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.life -= this.decay;
      return this.life > 0;
    }

    draw() {
      const alpha = Math.max(0, this.life);
      ctx.save();
      ctx.fillStyle = `rgba(255, 115, 160, ${0.85 * alpha})`;
      ctx.shadowColor = "rgba(255, 64, 129, 0.8)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let lastSpawn = 0;
  const loop = (t) => {
    ctx.clearRect(0, 0, width, height);

    // Spawn falling drops
    if (t - lastSpawn > 300) {
      if (beams.length < 14) {
        const margin = width * 0.06;
        const x = margin + Math.random() * (width - 2 * margin);
        beams.push(new Beam(x));
      }
      lastSpawn = t;
    }

    // 1. Draw puddles
    for (let i = puddles.length - 1; i >= 0; i--) {
      if (!puddles[i].update()) {
        puddles.splice(i, 1);
      } else {
        puddles[i].draw();
      }
    }

    // 2. Draw splash particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update()) {
        particles.splice(i, 1);
      } else {
        particles[i].draw();
      }
    }

    // 3. Draw falling beams
    for (let i = beams.length - 1; i >= 0; i--) {
      if (!beams[i].update()) {
        beams.splice(i, 1);
      } else {
        beams[i].draw();
      }
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  // Click interactive: drop a rapid beam at clicked X coordinate
  container.addEventListener("click", (e) => {
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    beams.push(new Beam(clickX, 8));
  });
}
