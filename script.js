const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const transition = document.querySelector("[data-page-transition]");
const transitionLinks = document.querySelectorAll("[data-transition-link]");
const journeyYears = document.querySelectorAll("[data-journey-year]");
const journeyTimeline = document.querySelector("[data-journey-timeline]");
const journeyProgress = document.querySelector("[data-journey-progress]");
const journeyMore = document.querySelector("[data-journey-more]");
const nameTrigger = document.querySelector("[data-name-trigger]");
const transitionStorageKey = "kseniia-page-transition";

if (transition) {
  let shouldAnimateEntry = false;

  try {
    shouldAnimateEntry = sessionStorage.getItem(transitionStorageKey) === "1";
    sessionStorage.removeItem(transitionStorageKey);
  } catch {
    shouldAnimateEntry = false;
  }

  if (shouldAnimateEntry) {
    transition.classList.add("is-entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => transition.classList.add("is-entered"));
    });
    window.setTimeout(() => {
      transition.classList.remove("is-entering", "is-entered");
    }, 950);
  }
}

document.querySelectorAll("[data-social-placeholder]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});

document.documentElement.classList.add("js-ready");

const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  mobileMenu?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
});

mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const floatingNav = document.querySelector("[data-floating-nav]");

transitionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const targetPath = href.split("/").pop();
    if (currentPath === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    event.preventDefault();
    if (transition?.classList.contains("is-leaving")) return;
    closeMenu();
    try {
      sessionStorage.setItem(transitionStorageKey, "1");
    } catch {
      // Navigation still works if storage is unavailable.
    }
    transition?.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 850);
  });
});

nameTrigger?.addEventListener("click", () => {
  nameTrigger.classList.toggle("is-active");
});

const journeyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-active");
      journeyObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -6%" },
);

journeyYears.forEach((year) => journeyObserver.observe(year));
if (journeyMore) journeyObserver.observe(journeyMore);

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);
const updateFloatingNav = () => {
  if (!floatingNav) return;
  const show = window.scrollY > 240;
  floatingNav.classList.toggle("is-visible", show);
};
const updateJourneyProgress = () => {
  if (!journeyTimeline || !journeyProgress) return;
  const bounds = journeyTimeline.getBoundingClientRect();
  const viewportAnchor = window.innerHeight * 0.45;
  const progress = Math.min(1, Math.max(0, (viewportAnchor - bounds.top) / bounds.height));
  journeyProgress.style.transform = `scaleY(${progress})`;
  let currentIndex = -1;
  journeyYears.forEach((year, index) => {
    const yearBounds = year.getBoundingClientRect();
    const yearAnchor = yearBounds.top + Math.min(yearBounds.height * 0.2, 150);
    const reached = yearAnchor <= viewportAnchor;
    year.classList.toggle("is-active", reached);
    year.classList.toggle("is-passed", reached);
    if (reached) currentIndex = index;
  });
  journeyYears.forEach((year, index) => year.classList.toggle("is-current", index === currentIndex));
  if (journeyMore) {
    const moreBounds = journeyMore.getBoundingClientRect();
    journeyMore.classList.toggle("is-reached", moreBounds.top < viewportAnchor + moreBounds.height * 0.45 || progress >= 0.96);
  }
};

const updateScrollEffects = () => {
  updateHeader();
  updateJourneyProgress();
  updateFloatingNav();
};

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateJourneyProgress, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) transition?.classList.remove("is-leaving", "is-entering", "is-entered");
});
window.setTimeout(() => document.body.classList.add("page-ready"), 80);
updateScrollEffects();

// Aceternity UI style moving border orb
const initHonorOrbs = () => {
  const cards = document.querySelectorAll(".honor-card");
  if (!cards.length) return;

  const configs = [
    { speed: 0.0001, dir: 1, offset: 0 },
    { speed: 0.00007, dir: -1, offset: 0.35 },
    { speed: 0.000085, dir: 1, offset: 0.65 },
    { speed: 0.00006, dir: -1, offset: 0.15 }
  ];

  const orbs = [];
  cards.forEach((card, i) => {
    const orb = card.querySelector(".honor-orb");
    if (!orb) return;
    orbs.push({
      card,
      orb,
      cfg: configs[i % configs.length],
      progress: configs[i % configs.length].offset
    });
  });

  if (!orbs.length) return;

  let lastTime = performance.now();
  const step = (time) => {
    const dt = time - lastTime;
    lastTime = time;

    orbs.forEach((item) => {
      const w = item.card.offsetWidth;
      const h = item.card.offsetHeight;
      if (!w || !h) return;

      const r = 22;
      const straightW = Math.max(0, w - 2 * r);
      const straightH = Math.max(0, h - 2 * r);
      const arcLen = 0.5 * Math.PI * r;
      const perimeter = 2 * straightW + 2 * straightH + 4 * arcLen;

      item.progress = (item.progress + item.cfg.dir * item.cfg.speed * dt) % 1;
      if (item.progress < 0) item.progress += 1;

      let dist = item.progress * perimeter;
      let x = 0;
      let y = 0;

      if (dist < straightW) {
        x = r + dist;
        y = 0;
      } else {
        dist -= straightW;
        if (dist < arcLen) {
          const a = -Math.PI / 2 + (dist / arcLen) * (Math.PI / 2);
          x = w - r + Math.cos(a) * r;
          y = r + Math.sin(a) * r;
        } else {
          dist -= arcLen;
          if (dist < straightH) {
            x = w;
            y = r + dist;
          } else {
            dist -= straightH;
            if (dist < arcLen) {
              const a = (dist / arcLen) * (Math.PI / 2);
              x = w - r + Math.cos(a) * r;
              y = h - r + Math.sin(a) * r;
            } else {
              dist -= arcLen;
              if (dist < straightW) {
                x = w - r - dist;
                y = h;
              } else {
                dist -= straightW;
                if (dist < arcLen) {
                  const a = Math.PI / 2 + (dist / arcLen) * (Math.PI / 2);
                  x = r + Math.cos(a) * r;
                  y = h - r + Math.sin(a) * r;
                } else {
                  dist -= arcLen;
                  if (dist < straightH) {
                    x = 0;
                    y = h - r - dist;
                  } else {
                    dist -= straightH;
                    const a = Math.PI + (dist / arcLen) * (Math.PI / 2);
                    x = r + Math.cos(a) * r;
                    y = r + Math.sin(a) * r;
                  }
                }
              }
            }
          }
        }
      }

      item.orb.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

initHonorOrbs();

// ─── Components carousel: Radnaabazar-style scroll reveal ───────────────────
const initCardScrollReveal = () => {
  const section = document.querySelector(".components-life-section");
  const cards = document.querySelectorAll(".components-card");
  if (!cards.length) return;

  let revealed = false;
  const revealCards = () => {
    if (revealed) return;
    revealed = true;
    cards.forEach((card, idx) => {
      card.style.setProperty("--card-delay", String(idx * 110));
      card.classList.add("is-revealed");
    });
  };

  if ("IntersectionObserver" in window && section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealCards();
          observer.disconnect();
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 160px 0px" });
    observer.observe(section);
  } else {
    revealCards();
  }
};

initCardScrollReveal();

// ─── Radnaabazar-style Book Fan Hover Tooltip ──────────────────────────────
const initBookFanTooltips = () => {
  const bookCards = document.querySelectorAll(".book-fan-card[data-book-title]");
  if (!bookCards.length) return;

  const tooltip = document.createElement("div");
  tooltip.className = "book-fan-tooltip";
  tooltip.setAttribute("aria-hidden", "true");
  const titleEl = document.createElement("p");
  titleEl.className = "book-fan-tooltip-title";
  const reasonEl = document.createElement("p");
  reasonEl.className = "book-fan-tooltip-reason";
  tooltip.appendChild(titleEl);
  tooltip.appendChild(reasonEl);
  document.body.appendChild(tooltip);

  const updatePosition = (x, y) => {
    const clampedLeft = Math.max(8, Math.min(x + 14, window.innerWidth - 204));
    const clampedTop = Math.max(8, Math.min(y + 14, window.innerHeight - 96));
    tooltip.style.left = `${clampedLeft}px`;
    tooltip.style.top = `${clampedTop}px`;
  };

  const showTooltip = (card, x, y) => {
    const title = card.getAttribute("data-book-title");
    const reason = card.getAttribute("data-book-reason");
    if (!title) return;
    titleEl.textContent = title;
    reasonEl.textContent = reason || "";
    updatePosition(x, y);
    tooltip.classList.add("is-visible");
  };

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible");
    bookCards.forEach((c) => c.classList.remove("is-active"));
  };

  bookCards.forEach((card) => {
    card.addEventListener("mouseenter", (e) => {
      showTooltip(card, e.clientX, e.clientY);
    });
    card.addEventListener("mousemove", (e) => {
      updatePosition(e.clientX, e.clientY);
    });
    card.addEventListener("mouseleave", () => {
      hideTooltip();
    });
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      bookCards.forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      const rect = card.getBoundingClientRect();
      const x = e.clientX || rect.left + rect.width / 2;
      const y = e.clientY || rect.bottom;
      showTooltip(card, x, y);
    });
  });

  document.addEventListener("click", () => hideTooltip());
  window.addEventListener("scroll", () => hideTooltip(), { passive: true });
};

initBookFanTooltips();

// ─── Floating Music Player (Radnaabazar style) ──────────────────────────────
const initMusicPlayer = () => {
  const player = document.getElementById("music-player");
  const audio = document.getElementById("global-audio");
  const btn = document.getElementById("music-toggle-btn");
  if (!player || !audio || !btn) return;

  const playIcon = btn.querySelector(".music-icon-play");
  const pauseIcon = btn.querySelector(".music-icon-pause");
  const progressBar = document.getElementById("music-progress-bar");

  const updateUI = (isPlaying) => {
    if (playIcon && pauseIcon) {
      playIcon.style.display = isPlaying ? "none" : "block";
      pauseIcon.style.display = isPlaying ? "block" : "none";
    }
  };

  const toggle = (e) => {
    if (e) e.stopPropagation();
    if (audio.paused) {
      audio.play().then(() => updateUI(true)).catch(() => {});
    } else {
      audio.pause();
      updateUI(false);
    }
  };

  btn.addEventListener("click", toggle);
  player.addEventListener("click", toggle);

  audio.addEventListener("timeupdate", () => {
    if (progressBar && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });

  audio.addEventListener("ended", () => {
    updateUI(false);
    if (progressBar) progressBar.style.width = "0%";
  });
};

initMusicPlayer();

// ─── Components of my life carousel arrow navigation ────────────────────────
const initCarouselControls = () => {
  const container = document.querySelector(".components-carousel-container");
  const prevBtn = document.querySelector(".carousel-arrow.carousel-prev");
  const nextBtn = document.querySelector(".carousel-arrow.carousel-next");
  if (!container || !prevBtn || !nextBtn) return;

  const updateButtons = () => {
    const left = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth - 6;
    prevBtn.disabled = left <= 10;
    nextBtn.disabled = left >= maxScroll;
  };

  prevBtn.addEventListener("click", () => {
    container.scrollBy({ left: -340, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    container.scrollBy({ left: 340, behavior: "smooth" });
  });

  container.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons, { passive: true });
  // Initial check once images might have loaded
  updateButtons();
  setTimeout(updateButtons, 300);
  setTimeout(updateButtons, 1000);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarouselControls);
} else {
  initCarouselControls();
}

