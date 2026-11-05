const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const transition = document.querySelector("[data-page-transition]");
const transitionLinks = document.querySelectorAll("[data-transition-link]");
const journeyYears = document.querySelectorAll("[data-journey-year]");
const journeyTimeline = document.querySelector("[data-journey-timeline]");
const journeyProgress = document.querySelector("[data-journey-progress]");
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
    }, 1120);
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

transitionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
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
    }, 1120);
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

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);
const updateJourneyProgress = () => {
  if (!journeyTimeline || !journeyProgress) return;
  const bounds = journeyTimeline.getBoundingClientRect();
  const viewportAnchor = window.innerHeight * 0.45;
  const progress = Math.min(1, Math.max(0, (viewportAnchor - bounds.top) / bounds.height));
  journeyProgress.style.transform = `scaleY(${progress})`;
  journeyYears.forEach((year) => {
    if (year.getBoundingClientRect().top < window.innerHeight * 0.82) year.classList.add("is-active");
  });
};

const updateScrollEffects = () => {
  updateHeader();
  updateJourneyProgress();
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
