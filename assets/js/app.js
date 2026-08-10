const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const gsapGate = window.IBTIKAR_GSAP;

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js-ready");

function initHeader() {
  const header = qs("[data-site-header], [data-ibtikar-header]");
  if (!header) return;

  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    header.classList.toggle("is-scrolled", y > 20);
    const hide = y > lastY && y > 180 && !document.body.classList.contains("menu-open");
    header.classList.toggle("hide", hide);
    header.classList.toggle("cinematic-hidden", hide);
    lastY = y;
  }, { passive: true });

  const bar = qs("#progressBar");
  if (bar) {
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }, { passive: true });
  }
}

function initMobileMenuPage() {
  const menuBtn = qs("#menuBtn, [data-ibt-menu-toggle][data-ibt-menu-managed='page']");
  const mobileMenu = qs("#mobileMenu, [data-mobile-menu]");
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => {
    const open = !mobileMenu.classList.contains("open") && !mobileMenu.classList.contains("is-open");
    mobileMenu.classList.toggle("open", open);
    mobileMenu.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  });

  qsa("a", mobileMenu).forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open", "is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    });
  });
}

function initReveal() {
  const items = qsa(".reveal");
  if (!items.length || prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible", "in"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible", "in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  items.forEach((item) => observer.observe(item));
}

function initFAQ() {
  qsa(".faq, [data-faq-item], .accordion-item").forEach((item) => {
    const button = qs("button", item);
    if (!button) return;
    button.addEventListener("click", () => {
      const open = !(item.classList.contains("open") || item.classList.contains("is-open"));
      item.classList.toggle("open", open);
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      const icon = qs("i", button);
      if (icon && icon.textContent) icon.textContent = open ? "−" : "+";
    });
  });
}

function initForms() {
  const cfg = window.IBTIKAR_CONFIG || {};
  const honeypot = cfg.forms?.honeypotField || "ibt_website";

  qsa("[data-mock-form], [data-ibt-form]").forEach((form) => {
    const state = qs("[data-form-state]", form);
    const submit = qs("button[type='submit']", form);
    let started = false;

    form.addEventListener("input", () => {
      if (!started) {
        started = true;
        window.IBTIKAR_ANALYTICS?.track(cfg.events?.formStart || "form_start", { form: form.id || form.name });
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const hp = qs(`[name="${honeypot}"]`, form);
      if (hp && hp.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        if (state) state.textContent = "يرجى إكمال الحقول المطلوبة.";
        window.IBTIKAR_ANALYTICS?.track(cfg.events?.formError || "form_error", { form: form.id });
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent;
        submit.textContent = "جار الإرسال...";
      }
      if (state) {
        state.className = "form-message is-loading";
        state.textContent = "يتم تجهيز الطلب...";
      }

      window.setTimeout(() => {
        const payload = Object.fromEntries(new FormData(form).entries());
        localStorage.setItem("ibtikar:lastBrief", JSON.stringify({ ...payload, createdAt: new Date().toISOString() }));
        if (state) {
          state.className = "form-message is-success";
          state.textContent = "تم حفظ الطلب على هذا الجهاز للمعاينة فقط. لن يصل إلى الفريق قبل ربط الإرسال.";
        }
        window.IBTIKAR_ANALYTICS?.track(
          form.dataset.analytics || cfg.events?.formSubmit || "form_submit",
          { form: form.id }
        );
        form.reset();
        started = false;
        if (submit) {
          submit.disabled = false;
          submit.textContent = submit.dataset.originalText || "إرسال";
        }
      }, 800);
    });
  });
}

function initContactSteps() {
  const wrap = qs("[data-form-steps]");
  if (!wrap) return;
  const steps = qsa("[data-step]", wrap);
  const panels = qsa("[data-step-panel]", wrap);
  const nextBtns = qsa("[data-step-next]", wrap);
  const prevBtns = qsa("[data-step-prev]", wrap);
  let current = 0;

  function showStep(index) {
    current = Math.max(0, Math.min(index, panels.length - 1));
    panels.forEach((panel, i) => panel.hidden = i !== current);
    steps.forEach((step, i) => step.classList.toggle("is-active", i === current));
  }

  nextBtns.forEach((btn) => btn.addEventListener("click", () => {
    const panel = panels[current];
    const inputs = qsa("input, select, textarea", panel).filter((el) => el.required);
    const valid = inputs.every((el) => el.checkValidity());
    if (!valid) {
      panel.querySelector(":invalid")?.reportValidity();
      return;
    }
    showStep(current + 1);
  }));

  prevBtns.forEach((btn) => btn.addEventListener("click", () => showStep(current - 1)));
  showStep(0);
}

function initCanvas() {
  if (prefersReducedMotion || gsapGate?.isLowPower?.()) return;

  qsa("[data-network-canvas], .hero-canvas, .lab-canvas").forEach((canvas) => {
    if (!canvas.id && !canvas.dataset.networkCanvas) canvas.dataset.networkCanvas = "true";
    runNetworkCanvas(canvas);
  });
}

function runNetworkCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let frame = 0;
  let running = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.15 : 1.55);
    width = canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    height = canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const count = window.innerWidth < 760 ? 28 : 52;
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22 * dpr,
      vy: (Math.random() - 0.5) * 0.22 * dpr,
      r: (Math.random() * 1.4 + 0.45) * dpr
    }));
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    const colors = ["16,200,232", "79,125,243", "124,58,237", "236,72,153"];
    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${colors[index % colors.length]}, .5)`;
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = index + 1; j < points.length; j += 1) {
        const other = points[j];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        const limit = 125 * dpr;
        if (distance < limit) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${colors[index % colors.length]}, ${(1 - distance / limit) * 0.1})`;
          ctx.lineWidth = 0.65 * dpr;
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });
    frame = window.requestAnimationFrame(draw);
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting && !document.hidden;
    if (running) draw();
    else window.cancelAnimationFrame(frame);
  });

  resize();
  draw();
  visibilityObserver.observe(canvas);
  window.addEventListener("resize", resize, { passive: true });
}

function initYear() {
  qsa("#year").forEach((el) => { el.textContent = new Date().getFullYear(); });
}

function initThemePage() {
  const btn = qs("#themeToggle[data-ibt-theme-managed='page'], [data-ibt-theme-toggle][data-ibt-theme-managed='page']");
  if (!btn) return;
  const saved = localStorage.getItem("ibtikar-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ibtikar-theme", next);
  });
}

function init() {
  initHeader();
  initMobileMenuPage();
  initReveal();
  initFAQ();
  initForms();
  initContactSteps();
  initCanvas();
  initYear();
  initThemePage();
  window.IBTIKAR_ANALYTICS?.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
