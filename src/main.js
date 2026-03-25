const cursorGlow = document.getElementById("cursorGlow");
if (cursorGlow) {
  window.addEventListener("mousemove", (ev) => {
    cursorGlow.style.left = `${ev.clientX}px`;
    cursorGlow.style.top = `${ev.clientY}px`;
    cursorGlow.style.opacity = "1";
  });
  window.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });
}

const navbar = document.getElementById("navbar");
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    navbar?.classList.toggle("scrolled", y > 60);

    if (scrollProgress) {
      const total =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const pct = (y / total) * 100;
      scrollProgress.style.width = `${pct}%`;
    }
  },
  { passive: true }
);

document.querySelectorAll(".nav-links li").forEach((li, idx) => {
  // Keep this simple; it only matters for initial reveal.
  li.style.animation = `sr-u 0.8s cubic-bezier(0.16,1,0.3,1) both ${
    0.1 + idx * 0.1
  }s`;
});

// Particles
const spiceParticles = document.getElementById("spiceParticles");
if (spiceParticles instanceof HTMLCanvasElement) {
  const ctx = spiceParticles.getContext("2d");
  if (ctx) {
    const palette = ["#D4A853", "#E67E22", "#C0392B", "#8E44AD"];
    const particles = [];

    function resize() {
      spiceParticles.width = window.innerWidth;
      spiceParticles.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor(isInit = false) {
        this.reset(isInit);
      }
      reset(isInit = false) {
        this.x = Math.random() * spiceParticles.width;
        this.y = isInit
          ? Math.random() * spiceParticles.height
          : spiceParticles.height + 10;
        this.size = Math.random() * 4 + 1;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.3 + 0.05;
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const a = Math.floor(this.opacity * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.fillStyle = `${this.color}${a}`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle(true));

    function tick() {
      ctx.clearRect(0, 0, spiceParticles.width, spiceParticles.height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }
}

// Scroll reveal
const srEls = document.querySelectorAll(".sr, .sr-l, .sr-r, .sr-u");
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const ent of entries) {
      if (!ent.isIntersecting) continue;
      ent.target.classList.add("in");
      revealObserver.unobserve(ent.target);
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
srEls.forEach((el) => revealObserver.observe(el));

// Mouse parallax
const floatEls = document.querySelectorAll(".hero-float");
window.addEventListener("mousemove", (ev) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  floatEls.forEach((el) => {
    const speed = Number.parseFloat(el.dataset.speed || "0.03");
    const x = (ev.clientX - cx) * speed;
    const y = (ev.clientY - cy) * speed;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// Quote strip parallax bg
const pqBg = document.querySelector(".pq-bg");
window.addEventListener(
  "scroll",
  () => {
    if (!(pqBg instanceof HTMLElement) || !pqBg.parentElement) return;
    const rect = pqBg.parentElement.getBoundingClientRect();
    const t = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    pqBg.style.transform = `translateY(${(t - 0.5) * 80}px)`;
  },
  { passive: true }
);

// Count-up stats
function animateStat(el) {
  const target = Number.parseInt(el.dataset.target || "0", 10);
  const start = performance.now();

  function frame(now) {
    const p = Math.min((now - start) / 1800, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = String(Math.floor(eased * target));
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = `${target}${el.dataset.suffix || ""}`;
  }

  requestAnimationFrame(frame);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    for (const ent of entries) {
      if (!ent.isIntersecting) continue;
      ent.target
        .querySelectorAll("[data-target]")
        .forEach((n) => animateStat(n));
      statsObserver.unobserve(ent.target);
    }
  },
  { threshold: 0.3 }
);
document.querySelectorAll(".stats").forEach((el) => statsObserver.observe(el));

// Flatpickr (loaded via CDN script tag in HTML)
if (window.flatpickr) {
  window.flatpickr("#resDate", {
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    minDate: "today",
    theme: "dark",
    disableMobile: true,
    altInputClass: "fp-date",
  });
  window.flatpickr("#resTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "h:i K",
    time_24hr: false,
    theme: "dark",
    disableMobile: true,
    altInputClass: "fp-time",
  });
}

// Reservation form feedback
const resForm = document.getElementById("resForm");
if (resForm instanceof HTMLFormElement) {
  resForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const btn = resForm.querySelector('button[type="submit"]');
    if (!(btn instanceof HTMLButtonElement)) return;
    btn.textContent = "✓ Table Reserved!";
    btn.style.background = "linear-gradient(135deg, #2ECC71, #27AE60)";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = "Reserve Now";
      btn.style.background = "";
      btn.disabled = false;
      resForm.reset();
    }, 4000);
  });
}

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks instanceof HTMLElement) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.style.display === "flex";
    navLinks.style.display = open ? "none" : "flex";
    navLinks.style.flexDirection = open ? "" : "column";
    navLinks.style.position = open ? "" : "absolute";
    navLinks.style.top = open ? "" : "70px";
    navLinks.style.left = open ? "" : "0";
    navLinks.style.right = open ? "" : "0";
    navLinks.style.background = open ? "" : "rgba(10,10,10,.97)";
    navLinks.style.padding = open ? "" : "20px 30px";
    navLinks.style.backdropFilter = open ? "" : "blur(20px)";
  });
}

