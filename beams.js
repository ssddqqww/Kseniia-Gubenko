// Continuous falling beams animation (no premature collision/explosion)

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

  class Beam {
    constructor(x, speed) {
      this.x = x ?? Math.random() * width;
      this.len = 90 + Math.random() * 80;
      this.y = -this.len;
      this.speed = speed ?? (4.5 + Math.random() * 4);
    }

    update() {
      this.y += this.speed;
      // Traverse all the way from top to bottom
      if (this.y - this.len >= height + 20) {
        return false;
      }
      return true;
    }

    draw() {
      const startY = Math.max(0, this.y - this.len);
      const endY = this.y;
      if (endY <= 0) return;

      const grad = ctx.createLinearGradient(this.x, startY, this.x, endY);
      grad.addColorStop(0, "rgba(255, 64, 129, 0)");
      grad.addColorStop(0.65, "rgba(255, 64, 129, 0.4)");
      grad.addColorStop(0.9, "#ff4081");
      grad.addColorStop(1, "#ffffff");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, startY);
      ctx.lineTo(this.x, endY);
      ctx.stroke();

      // Glowing head
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, endY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let lastSpawn = 0;
  const loop = (t) => {
    ctx.clearRect(0, 0, width, height);

    // Spawn smooth continuous beams across container width
    if (t - lastSpawn > 320) {
      if (beams.length < 14) {
        const margin = width * 0.08;
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

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  // Click interactive: drop a smooth beam from the very top at the clicked X coordinate
  container.addEventListener("click", (e) => {
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const beam = new Beam(clickX, 8);
    beams.push(beam);
  });
}
