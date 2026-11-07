// Aceternity UI — Background Beams with Collision
// Replicates Radnaabazar's exact beam collision and spark explosion animation in pink theme.

const canvas = document.getElementById("beams-canvas");
const container = document.getElementById("beams-container");
const textEl = document.querySelector(".beams-gradient-text");

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
  const particles = [];
  const flashes = [];

  class Beam {
    constructor(x, targetY) {
      this.x = x ?? Math.random() * width;
      this.y = -60;
      this.targetY = targetY ?? height * (0.65 + Math.random() * 0.2);
      this.speed = 6 + Math.random() * 4;
      this.len = 70 + Math.random() * 60;
      this.color = Math.random() > 0.3 ? "#ff4081" : "#f48fb1";
    }

    update() {
      this.y += this.speed;
      if (this.y >= this.targetY) {
        this.explode();
        return false;
      }
      return true;
    }

    explode() {
      // Trigger subtle text pulse
      if (textEl) {
        textEl.classList.remove("is-pulsing");
        void textEl.offsetWidth;
        textEl.classList.add("is-pulsing");
      }

      // Add collision flash
      flashes.push({
        x: this.x,
        y: this.targetY,
        r: 10,
        maxR: 38 + Math.random() * 20,
        opacity: 0.95
      });

      // Spawn burst particles
      const count = 14 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI + Math.random() * Math.PI; // upwards explosion
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
          x: this.x,
          y: this.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          size: 1.5 + Math.random() * 2.2,
          color: Math.random() > 0.4 ? "#ff4081" : "#ffffff",
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025
        });
      }
    }

    draw() {
      const grad = ctx.createLinearGradient(this.x, this.y - this.len, this.x, this.y);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.7, "rgba(255, 64, 129, 0.4)");
      grad.addColorStop(1, "#ffffff");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.len);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // Glowing head
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let lastSpawn = 0;
  const loop = (t) => {
    ctx.clearRect(0, 0, width, height);

    // Spawn regular ambient beams
    if (t - lastSpawn > 650) {
      if (beams.length < 5) {
        // Spawn around center-ish where the text is
        const margin = width * 0.15;
        const x = margin + Math.random() * (width - 2 * margin);
        beams.push(new Beam(x));
      }
      lastSpawn = t;
    }

    // Update & draw beams
    for (let i = beams.length - 1; i >= 0; i--) {
      if (!beams[i].update()) {
        beams.splice(i, 1);
      } else {
        beams[i].draw();
      }
    }

    // Update & draw flashes
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.r += 2.2;
      f.opacity -= 0.045;
      if (f.opacity <= 0) {
        flashes.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.r * 1.6, f.r * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 64, 129, ${f.opacity * 0.6})`;
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
    }

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  // Click interactive: drop a beam where clicked!
  container.addEventListener("click", (e) => {
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const beam = new Beam(clickX, Math.max(clickY, height * 0.5));
    beam.speed = 10;
    beams.push(beam);
  });
}
