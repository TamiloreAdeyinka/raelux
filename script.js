const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();

const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuButton && mobileMenu) {
  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  };

  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}

const revealThresholds = new Map([
  [document.querySelector(".about"), 0.15],
  [document.querySelector("#services"), 0.15],
  [document.querySelector("#projects"), 0.12],
  [document.querySelector(".team"), 0.12],
  [document.querySelector(".why"), 0.15],
  [document.querySelector(".final-cta"), 0.2]
]);

revealThresholds.forEach((threshold, section) => {
  if (!section) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    section.classList.add("is-visible");
    observer.disconnect();
  }, { threshold });
  observer.observe(section);
});

const countGroup = document.querySelector("[data-counts]");
if (countGroup) {
  const counters = [...countGroup.querySelectorAll("[data-count-to]")];
  const runCounters = () => {
    if (reduceMotion) {
      counters.forEach((counter) => {
        counter.textContent = `${counter.dataset.countTo}+`;
      });
      return;
    }

    const start = performance.now();
    const duration = 900;

    const frame = (time) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach((counter) => {
        const value = Math.round(Number(counter.dataset.countTo) * eased);
        counter.textContent = `${value}+`;
      });
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const counterObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        runCounters();
        counterObserver.disconnect();
      }
    },
    { threshold: 0.25 }
  );

  counterObserver.observe(document.querySelector(".about") || countGroup);
}

const processList = document.querySelector("[data-process-list]");
if (processList) {
  const steps = [...processList.querySelectorAll(".process-step")];
  let activeStep = 0;
  let hoverIndex = null;
  let focusIndex = null;
  let clickLockScrollY = null;
  let scrollFrame = null;

  const setActive = (index) => {
    activeStep = index;
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
      const button = step.querySelector("button");
      button?.setAttribute("aria-current", stepIndex === index ? "step" : "false");
    });
    processList.style.setProperty("--process-progress", steps.length > 1 ? index / (steps.length - 1) : 0);
  };

  const updateFromScroll = () => {
    const currentY = window.scrollY;
    if (clickLockScrollY !== null && Math.abs(currentY - clickLockScrollY) > 40) {
      clickLockScrollY = null;
    }

    if (hoverIndex !== null || focusIndex !== null || clickLockScrollY !== null) return;

    const lineY = window.innerHeight * 0.45;
    let closest = null;
    let closestDistance = Infinity;

    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const distance = Math.abs(rect.top + rect.height / 2 - lineY);
      if (distance < closestDistance) {
        closest = index;
        closestDistance = distance;
      }
    });

    if (closest !== null && closest !== activeStep) setActive(closest);
  };

  const queueScrollUpdate = () => {
    if (scrollFrame !== null) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      updateFromScroll();
    });
  };

  steps.forEach((step, index) => {
    const button = step.querySelector("button");
    button?.addEventListener("click", () => {
      clickLockScrollY = window.scrollY;
      setActive(index);
    });
    button?.addEventListener("focus", () => {
      focusIndex = index;
      setActive(index);
    });
    button?.addEventListener("blur", () => {
      focusIndex = null;
      updateFromScroll();
    });
    button?.addEventListener("mouseenter", () => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      hoverIndex = index;
      setActive(index);
    });
    button?.addEventListener("mouseleave", () => {
      hoverIndex = null;
      updateFromScroll();
    });
  });

  setActive(0);
  window.addEventListener("scroll", queueScrollUpdate, { passive: true });
  updateFromScroll();
}

const tiltZone = document.querySelector("[data-tilt-zone]");
const tiltBoard = document.querySelector("[data-tilt-board]");
if (tiltZone && tiltBoard && !reduceMotion) {
  tiltZone.addEventListener("mousemove", (event) => {
    const rect = tiltZone.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltBoard.style.transform = `perspective(1400px) rotateX(${py * -6}deg) rotateY(${px * 8}deg)`;
  });

  tiltZone.addEventListener("mouseleave", () => {
    tiltBoard.style.transform = "";
  });
}

const reviewsRoot = document.querySelector("[data-reviews]");
const reviewStage = document.querySelector("[data-review-stage]");
const reviewPrev = document.querySelector("[data-review-prev]");
const reviewNext = document.querySelector("[data-review-next]");
const reviewCounter = document.querySelector("[data-review-counter]");

const reviews = [
  {
    quote: "They took our home from bare carcass to a fully furnished, magazine-ready space.",
    name: "Sample client A",
    role: "Residential project, Lagos, sample review"
  },
  {
    quote: "Raeluxe brought our office space to life with bold, considered design.",
    name: "Sample client B",
    role: "Commercial project, Abuja, sample review"
  },
  {
    quote: "The layouts made practical use of the space while keeping the overall design simple and beautiful.",
    name: "Sample client C",
    role: "Residential project, sample review"
  },
  {
    quote: "Watching the concept evolve from moodboard to a finished, furnished room was the most rewarding part.",
    name: "Sample client D",
    role: "Renovation project, Port Harcourt, sample review"
  },
  {
    quote: "The spaces feel connected, comfortable and thoughtfully planned. It is the little details that make the difference.",
    name: "Sample client E",
    role: "Interior design project, sample review"
  }
];

const desktopSlots = [
  { left: 0, top: 55, rotate: -7, scale: 1, z: 1 },
  { left: 175, top: 28, rotate: -3.5, scale: 1, z: 2 },
  { left: 350, top: 0, rotate: 0, scale: 1.05, z: 3 },
  { left: 525, top: 28, rotate: 3.5, scale: 1, z: 4 },
  { left: 700, top: 12, rotate: 6, scale: 1, z: 5 }
];

const mobileSlots = [
  { offset: -42, top: 16, rotate: -7, scale: 0.94, z: 1, delay: 0 },
  { offset: 42, top: 16, rotate: 7, scale: 0.94, z: 2, delay: 45 },
  { offset: 0, top: 0, rotate: 0, scale: 1.03, z: 3, delay: 90 }
];

let reviewIndex = 0;
let autoplay;
let reviewsRevealed = false;
let reviewMode = null;
let reviewCards = [];

function reviewSurface() {
  return { bg: "#ffffff", fg: "#20221f" };
}

function createReviewCard() {
  const card = document.createElement("article");
  card.className = "review-card";
  return card;
}

function setReviewContent(card, review, surfaceIndex) {
  const surface = reviewSurface(surfaceIndex);
  card.style.setProperty("--bg", surface.bg);
  card.style.setProperty("--fg", surface.fg);
  card.innerHTML = `
    <div class="review-card-head">
      <span class="review-quote-mark" aria-hidden="true">&ldquo;</span>
      <span class="review-label">Sample review</span>
    </div>
    <blockquote>${review.quote}</blockquote>
    <footer>
      <h3>${review.name}</h3>
      <p>${review.role}</p>
    </footer>
  `;
}

function renderReviews() {
  if (!reviewStage) return;
  const isMobile = window.innerWidth < 1024;
  const nextMode = isMobile ? "mobile" : "desktop";
  const slots = isMobile ? mobileSlots : desktopSlots;
  if (reviewMode !== nextMode) {
    reviewMode = nextMode;
    reviewCards = slots.map(() => createReviewCard());
    reviewStage.replaceChildren(...reviewCards);
  }

  const indexes = isMobile
    ? [(reviewIndex + 4) % reviews.length, (reviewIndex + 1) % reviews.length, reviewIndex]
    : slots.map((_, slotIndex) => (slotIndex + reviewIndex) % reviews.length);

  reviewCards.forEach((card, slotIndex) => {
    const slot = slots[slotIndex];
    const reviewItemIndex = indexes[slotIndex];
    setReviewContent(card, reviews[reviewItemIndex], isMobile ? reviewItemIndex : slotIndex);
    card.style.zIndex = slot.z;
    card.style.opacity = reviewsRevealed ? "1" : "0";
    card.style.setProperty("--slot-delay", `${isMobile ? slot.delay : slotIndex * 55}ms`);

    if (isMobile) {
      card.style.setProperty("--top", `${reviewsRevealed ? slot.top : 0}px`);
      card.style.setProperty("--mobile-offset", `${reviewsRevealed ? slot.offset : 0}px`);
      card.style.setProperty("--rotate", `${reviewsRevealed ? slot.rotate : 0}deg`);
      card.style.setProperty("--scale", reviewsRevealed ? slot.scale : 0.85);
      card.style.removeProperty("--left");
    } else {
      card.style.setProperty("--left", `${reviewsRevealed ? slot.left : 350}px`);
      card.style.setProperty("--top", `${reviewsRevealed ? slot.top : 0}px`);
      card.style.setProperty("--rotate", `${reviewsRevealed ? slot.rotate : 0}deg`);
      card.style.setProperty("--scale", reviewsRevealed ? slot.scale : 0.8);
      card.style.removeProperty("--mobile-offset");
    }
  });

  if (reviewCounter) {
    reviewCounter.textContent = `${String(reviewIndex + 1).padStart(2, "0")} / 05`;
  }
}

function moveReview(delta) {
  reviewIndex = (reviewIndex + delta + reviews.length) % reviews.length;
  renderReviews();
}

if (reviewsRoot && reviewStage) {
  renderReviews();
  reviewPrev?.addEventListener("click", () => moveReview(-1));
  reviewNext?.addEventListener("click", () => moveReview(1));
  window.addEventListener("resize", renderReviews);

  let touchStartX = 0;
  let touchStartY = 0;

  reviewStage.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    clearInterval(autoplay);
    autoplay = null;
  }, { passive: true });

  reviewStage.addEventListener("touchend", (event) => {
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      moveReview(dx < 0 ? 1 : -1);
    }
    window.setTimeout(() => startAutoplay(), 3000);
  }, { passive: true });

  const startAutoplay = () => {
    if (reduceMotion || autoplay) return;
    autoplay = window.setInterval(() => moveReview(1), 5000);
  };

  const reviewObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    reviewsRevealed = true;
    renderReviews();
    startAutoplay();
    reviewObserver.disconnect();
  }, { threshold: 0.2 });

  reviewObserver.observe(reviewsRoot);
  reviewsRoot.addEventListener("mouseenter", () => {
    clearInterval(autoplay);
    autoplay = null;
  });
  reviewsRoot.addEventListener("mouseleave", startAutoplay);
}

/* Scroll progress bar — works on every device, purely scroll-driven */
const scrollProgress = document.querySelector(".scroll-progress");
if (scrollProgress) {
  let progressFrame = null;
  const updateProgress = () => {
    progressFrame = null;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    scrollProgress.style.width = `${pct}%`;
  };
  const queueProgress = () => {
    if (progressFrame !== null) return;
    progressFrame = requestAnimationFrame(updateProgress);
  };
  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress);
  updateProgress();
}

/* Hero image motion — scroll parallax runs everywhere (mobile + desktop);
   cursor tilt layers on top for hover-capable pointers only. */
const heroStageEl = document.querySelector(".hero-stage");
const heroHouseEl = document.querySelector(".hero-house");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (heroStageEl && heroHouseEl && !reduceMotion) {
  let scrollShift = 0;
  let scrollScale = 1;
  let tiltX = 0;
  let tiltY = 0;

  const applyHeroTransform = () => {
    heroHouseEl.style.transform =
      `translateY(${scrollShift}px) scale(${scrollScale}) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  };

  let heroFrame = null;
  const updateHeroScroll = () => {
    heroFrame = null;
    const rect = heroStageEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(-1, (vh * 0.5 - rect.top) / (vh * 0.9)));
    scrollShift = progress * 22;
    scrollScale = 1 + Math.max(0, progress) * 0.03;
    applyHeroTransform();
  };
  const queueHeroScroll = () => {
    if (heroFrame !== null) return;
    heroFrame = requestAnimationFrame(updateHeroScroll);
  };
  window.addEventListener("scroll", queueHeroScroll, { passive: true });
  window.addEventListener("resize", queueHeroScroll);
  updateHeroScroll();

  if (canHover) {
    heroStageEl.addEventListener("mousemove", (event) => {
      const rect = heroStageEl.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      tiltY = px * 4;
      tiltX = py * -3;
      applyHeroTransform();
    });
    heroStageEl.addEventListener("mouseleave", () => {
      tiltX = 0;
      tiltY = 0;
      applyHeroTransform();
    });
  }
}

/* Hero card stack — three photos in constant, gentle shuffling motion.
   Each card keeps its own photo; only the fan position (front / back-left /
   back-right) rotates between them, so the stack always looks "in motion". */
const heroStack = document.querySelector("[data-hero-stack]");
const heroCards = heroStack ? Array.from(heroStack.querySelectorAll(".hero-card")) : [];

if (heroCards.length === 3) {
  const heroPoses = [
    { x: "0px", y: "0px", rotate: "0deg", scale: 1, z: 3 },
    { x: "-9%", y: "5%", rotate: "-8deg", scale: 0.92, z: 2 },
    { x: "9%", y: "6%", rotate: "8deg", scale: 0.9, z: 1 }
  ];

  let heroOrder = [0, 1, 2];
  let heroTimer = null;

  const applyHeroPoses = () => {
    heroCards.forEach((card, i) => {
      const pose = heroPoses[heroOrder[i]];
      card.style.setProperty("--offset-x", pose.x);
      card.style.setProperty("--offset-y", pose.y);
      card.style.setProperty("--rotate", pose.rotate);
      card.style.setProperty("--scale", pose.scale);
      card.style.zIndex = pose.z;
    });
  };

  const shuffleHero = (direction = 1) => {
    heroOrder = heroOrder.map((poseIndex) => (poseIndex + direction + heroPoses.length) % heroPoses.length);
    applyHeroPoses();
  };

  applyHeroPoses();

  const startHeroShuffle = () => {
    if (reduceMotion || heroTimer) return;
    heroTimer = window.setInterval(() => shuffleHero(1), 3200);
  };
  const stopHeroShuffle = () => {
    window.clearInterval(heroTimer);
    heroTimer = null;
  };

  startHeroShuffle();
  heroStack.addEventListener("mouseenter", stopHeroShuffle);
  heroStack.addEventListener("mouseleave", startHeroShuffle);

  /* Swipe/drag (touch + mouse, via Pointer Events) triggers a manual shuffle. */
  let dragStartX = 0;
  let dragStartY = 0;
  let isDragging = false;

  heroStack.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    stopHeroShuffle();
  });

  heroStack.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    isDragging = false;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      shuffleHero(dx < 0 ? 1 : -1);
    }
    startHeroShuffle();
  });

  heroStack.addEventListener("pointercancel", () => {
    isDragging = false;
    startHeroShuffle();
  });
}

/* Magnetic buttons + card tilt — desktop hover-capable pointers only.
   Touch devices get their own feedback via the :active press states in CSS. */
if (!reduceMotion && canHover) {
  document.querySelectorAll(".pill-button, .header-cta").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  document.querySelectorAll(".project-card, .service-card").forEach((card) => {
    const tiltAmount = card.classList.contains("project-card") ? 4 : 2.5;
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${py * -tiltAmount}deg) rotateY(${px * tiltAmount}deg) scale(1.012)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  const cursorRing = document.createElement("div");
  cursorRing.className = "cursor-ring";
  document.body.appendChild(cursorRing);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorRing.classList.add("is-visible");
  });

  document.addEventListener("mouseleave", () => {
    cursorRing.classList.remove("is-visible");
  });

  const loopRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loopRing);
  };
  loopRing();

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button")) cursorRing.classList.add("cursor-ring-active");
  });
  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button")) cursorRing.classList.remove("cursor-ring-active");
  });
}
