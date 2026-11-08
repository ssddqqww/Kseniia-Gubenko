// Aceternity Background Beams with Collision + MovingBorder neon perimeter

const canvas = document.getElementById("beams-canvas");
const container = document.getElementById("beams-container");
const textEl = document.querySelector(".beams-gradient-text");

// ─── 1. MovingBorder: smooth pink neon traveling around the card edge ───
const initThankyouMovingBorder = () => {
  const wrap = document.querySelector(".thankyou-border-wrap");
  const orb = document.querySelector(".thankyou-border-orb");
  if (!wrap || !orb) return;

  let progress = 0;
  const speed = 0.00008; // smooth constant pace around perimeter
  let lastTime = performance.now();

  const step = (now) => {
    const dt = now - lastTime;
    lastTime = now;

    progress = (progress + speed * dt) % 1;

    const w = wrap.offsetWidth;
    const h = wrap.offsetHeight;
    if (w > 0 && h > 0) {
      const r = 32;
      const straightW = Math.max(0, w - 2 * r);
      const straightH = Math.max(0, h - 2 * r);
      const cornerLen = 0.5 * Math.PI * r;
      const totalLen = 2 * straightW + 2 * straightH + 4 * cornerLen;

      const d = progress * totalLen;
      let x = 0;
      let y = 0;

      // 1. Top straight (left to right)
      if (d <= straightW) {
        x = r + d;
        y = 0;
      }
      // 2. Top-right corner
      else if (d <= straightW + cornerLen) {
        const cd = d - straightW;
        const a = -Math.PI / 2 + (cd / cornerLen) * (Math.PI / 2);
        x = w - r + Math.cos(a) * r;
        y = r + Math.sin(a) * r;
      }
      // 3. Right straight (top to bottom)
      else if (d <= straightW + cornerLen + straightH) {
        const sd = d - (straightW + cornerLen);
        x = w;
        y = r + sd;
      }
      // 4. Bottom-right corner
      else if (d <= straightW + 2 * cornerLen + straightH) {
        const cd = d - (straightW + cornerLen + straightH);
        const a = (cd / cornerLen) * (Math.PI / 2);
        x = w - r + Math.cos(a) * r;
        y = h - r + Math.sin(a) * r;
      }
      // 5. Bottom straight (right to left)
      else if (d <= 2 * straightW + 2 * cornerLen + straightH) {
        const sd = d - (straightW + 2 * cornerLen + straightH);
        x = w - r - sd;
        y = h;
      }
      // 6. Bottom-left corner
      else if (d <= 2 * straightW + 3 * cornerLen + straightH) {
        const cd = d - (2 * straightW + 2 * cornerLen + straightH);
        const a = Math.PI / 2 + (cd / cornerLen) * (Math.PI / 2);
        x = r + Math.cos(a) * r;
        y = h - r + Math.sin(a) * r;
      }
      // 7. Left straight (bottom to top)
      else if (d <= 2 * straightW + 3 * cornerLen + 2 * straightH) {
        const sd = d - (2 * straightW + 3 * cornerLen + straightH);
        x = 0;
        y = h - r - sd;
      }
      // 8. Top-left corner
      else {
        const cd = d - (2 * straightW + 3 * cornerLen + 2 * straightH);
        const a = Math.PI + (cd / cornerLen) * (Math.PI / 2);
        x = r + Math.cos(a) * r;
        y = r + Math.sin(a) * r;
      }

      orb.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

initThankyouMovingBorder();

// ─── 2. Background Beams with Collision at the VERY BOTTOM ───
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
      this.len = 65 + Math.random() * 55;
      this.y = -this.len;
      // Drops fall slightly slower, more graceful
      this.speed = speed ?? (2.0 + Math.random() * 1.8);
    }

    update() {
      this.y += this.speed;
      // Break slightly higher up from the very bottom border (~26px above bottom)
      const floorY = height - 26;

      // When the head of the beam reaches the floor
      if (this.y >= floorY) {
        // Spawn small soft puddle
        puddles.push(new Puddle(this.x, floorY));

        // Spawn a few soft splash particles
        const count = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, floorY));
        }

        // Gentle text pulse on landing
        if (textEl && Math.random() < 0.25) {
          textEl.classList.add("is-pulsing");
          setTimeout(() => textEl.classList.remove("is-pulsing"), 280);
        }

        return false; // Beam is done
      }
      return true;
    }

    draw() {
      const startY = Math.max(0, this.y - this.len);
      const floorY = height - 26;
      const endY = Math.min(floorY, this.y);
      if (endY <= 0) return;

      const grad = ctx.createLinearGradient(this.x, startY, this.x, endY);
      grad.addColorStop(0, "rgba(255, 64, 129, 0)");
      grad.addColorStop(0.65, "rgba(255, 64, 129, 0.45)");
      grad.addColorStop(0.9, "#ff4081");
      grad.addColorStop(1, "#ffffff");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
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
      ctx.arc(this.x, endY, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Small soft puddle that expands horizontally and fades gently
  class Puddle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.life = 1.0;
      this.maxLife = 46; // frames (~0.75s, softer and smoother)
      this.currentFrame = 0;
      this.maxRadius = 24 + Math.random() * 16; // 24 - 40px (delicate small puddle)
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
      // Glowing line puddle
      const grad = ctx.createLinearGradient(
        this.x - currentRadius,
        this.y,
        this.x + currentRadius,
        this.y
      );
      grad.addColorStop(0, "rgba(255, 64, 129, 0)");
      grad.addColorStop(0.5, `rgba(255, 64, 129, ${0.65 * alpha})`);
      grad.addColorStop(1, "rgba(255, 64, 129, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(255, 64, 129, 0.6)";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(this.x - currentRadius, this.y);
      ctx.lineTo(this.x + currentRadius, this.y);
      ctx.stroke();

      // Very soft small center glow
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Gentle small splash particles
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2.0;
      this.vy = -(0.8 + Math.random() * 1.8); // gentle soft lift
      this.gravity = 0.08;
      this.life = 1.0;
      this.decay = 0.022 + Math.random() * 0.015;
      this.radius = 0.8 + Math.random() * 0.8;
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
      ctx.fillStyle = `rgba(255, 120, 165, ${0.75 * alpha})`;
      ctx.shadowColor = "rgba(255, 64, 129, 0.7)";
      ctx.shadowBlur = 3;
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
    if (t - lastSpawn > 350) {
      if (beams.length < 12) {
        const margin = width * 0.08;
        const x = margin + Math.random() * (width - 2 * margin);
        beams.push(new Beam(x));
      }
      lastSpawn = t;
    }

    // 1. Draw puddles on bottom floor
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

  // Click interactive: drop a quick beam at clicked X coordinate that falls straight to the bottom and splashes
  container.addEventListener("click", (e) => {
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    beams.push(new Beam(clickX, 7));
  });
}
