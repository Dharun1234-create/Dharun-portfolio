document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. AMBIENT CANVAS — Subtle floating dot mesh
  //    ~72 tiny particles with gentle drift and near-invisible connecting lines.
  //    Pauses when tab is hidden. Respects prefers-reduced-motion.
  // ==========================================================================
  const canvas = document.getElementById('ambient-canvas');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let animId = null;
    let isPageVisible = !document.hidden;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const DOT_COUNT = window.innerWidth < 768 ? 36 : 68;
    const CONN_DIST = 110;

    const DOT_COLORS = [
      'rgba(37, 99, 235,',   // cobalt blue
      'rgba(15, 118, 110,',  // teal
      'rgba(100, 116, 139,', // slate
    ];

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    class Particle {
      constructor() { this.reset(); }

      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 0.20;
        this.vy = (Math.random() - 0.5) * 0.16;
        this.r = Math.random() * 1.5 + 0.7;
        this.alpha = Math.random() * 0.14 + 0.05;
        this.colorBase = DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpd = Math.random() * 0.007 + 0.003;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.phase += this.phaseSpd;
        this.currentR = this.r + Math.sin(this.phase) * 0.25;

        const w = window.innerWidth, h = window.innerHeight;
        if (this.x < -10) this.x = w + 10;
        else if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        else if (this.y > h + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentR, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorBase} ${this.alpha})`;
        ctx.fill();
      }
    }

    let particles = [];

    function initParticles() {
      particles = [];
      for (let i = 0; i < DOT_COUNT; i++) particles.push(new Particle());
    }

    function draw() {
      if (!isPageVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Faint connecting lines between close neighbours
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONN_DIST) {
            const a = (1 - dist / CONN_DIST) * 0.055;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeCanvas(); initParticles(); }, 150);
    }, { passive: true });

    resizeCanvas();
    initParticles();
    animId = requestAnimationFrame(draw);
  }

  // ==========================================================================
  // 2. STICKY NAVBAR — adds border + shadow once user scrolls
  // ==========================================================================
  const navbar = document.getElementById('navbar');

  function onNavScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // ==========================================================================
  // 3. SCROLLSPY — highlights active nav link
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link');

  function updateScrollspy() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateScrollspy, { passive: true });
  updateScrollspy();

  // ==========================================================================
  // 4. MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const navClose = document.querySelector('.nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openNav = () => {
    if (!navToggle || !mobileNav || !mobileOverlay) return;
    navToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('active');
    mobileOverlay.classList.add('active');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.removeAttribute('tabindex');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    if (navClose) navClose.focus();
    document.addEventListener('keydown', trapFocus);
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    if (!navToggle || !mobileNav || !mobileOverlay) return;
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.setAttribute('tabindex', '-1');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', trapFocus);
    document.body.style.overflow = '';
    navToggle.focus();
  };

  function trapFocus(e) {
    if (e.key === 'Escape') { closeNav(); return; }
    if (e.key === 'Tab') {
      const focusables = mobileNav.querySelectorAll('a, button');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });
  }
  if (navClose) navClose.addEventListener('click', closeNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeNav);
  mobileLinks.forEach(link => link.addEventListener('click', closeNav));

  // ==========================================================================
  // 5. TYPEWRITER — role cycling
  // ==========================================================================
  const roles = [
    'Web Developer',
    'Full Stack Developer',
    'AI Enthusiast',
    'Software Engineer',
  ];

  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const twEl = document.getElementById('typewriter');

  function runTypewriter() {
    if (!twEl) return;

    if (prefersReducedMotion) {
      twEl.textContent = roles[0];
      return;
    }

    const word = roles[wordIdx];
    twEl.textContent = isDeleting
      ? word.substring(0, charIdx - 1)
      : word.substring(0, charIdx + 1);

    isDeleting ? charIdx-- : charIdx++;

    let delay = isDeleting ? 42 : 78;

    if (!isDeleting && charIdx === word.length) {
      delay = 1900;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % roles.length;
      delay = 300;
    }

    setTimeout(runTypewriter, delay);
  }

  runTypewriter();

  // ==========================================================================
  // 6. SKILL BARS — animate on intersect
  // ==========================================================================
  const skillGroups = document.querySelectorAll('.skill-group');

  if ('IntersectionObserver' in window && skillGroups.length) {
    const skillsObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-progress');
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    skillGroups.forEach(g => skillsObs.observe(g));
  } else {
    setTimeout(() => {
      document.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-progress');
      });
    }, 400);
  }

  // ==========================================================================
  // 7. TIMELINE — scroll-driven fill + node activation
  // ==========================================================================
  const timeline = document.querySelector('.timeline');
  const tlFill = document.getElementById('timeline-fill');
  const tlItems = document.querySelectorAll('.timeline-item');

  function updateTimeline() {
    if (!timeline || !tlFill) return;
    const rect = timeline.getBoundingClientRect();
    const vH = window.innerHeight;
    const trigger = vH * 0.78;
    const progress = Math.max(0, Math.min(1, (trigger - rect.top) / rect.height));
    tlFill.style.height = `${progress * 100}%`;

    tlItems.forEach(item => {
      const marker = item.querySelector('.marker-dot');
      if (!marker) return;
      const mRect = marker.getBoundingClientRect();
      item.classList.toggle('passed', mRect.top < trigger);
    });
  }

  window.addEventListener('scroll', () => requestAnimationFrame(updateTimeline), { passive: true });
  updateTimeline();

  // ==========================================================================
  // 8. SCROLL REVEAL — sections fade + slide up on enter
  // ==========================================================================
  const revealEls = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -36px 0px' });

    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  // ==========================================================================
  // 9. PROJECT CARD MICRO-TILT (desktop hover, reduced-motion safe)
  // ==========================================================================
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const rx = ((r.height / 2 - y) / r.height) * 3;
        const ry = ((x - r.width / 2) / r.width) * 3;
        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

});
