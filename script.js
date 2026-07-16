document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // STICKY NAVBAR BACKDROP DYNAMICS
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  
  const handleNavbarScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Initial call in case user loads page scrolled down

  // ==========================================================================
  // MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const navClose = document.querySelector('.nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openMobileNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('active');
    mobileOverlay.classList.add('active');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.removeAttribute('tabindex');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    
    // Focus the first link or close button inside menu
    navClose.focus();
    
    // Capture focus trap and escape keys
    document.addEventListener('keydown', handleNavKeyboardTrap);
    // Disable body scroll when menu open
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.setAttribute('tabindex', '-1');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    
    document.removeEventListener('keydown', handleNavKeyboardTrap);
    document.body.style.overflow = '';
    navToggle.focus();
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  if (navClose) navClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  function handleNavKeyboardTrap(e) {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
    
    if (e.key === 'Tab') {
      const focusables = mobileNav.querySelectorAll('a, button');
      if (focusables.length === 0) return;
      
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      
      if (e.shiftKey) { // Back tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Normal tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  }

  // ==========================================================================
  // HERO SECTION TYPEWRITER EFFECT
  // ==========================================================================
  const words = ["Full Stack Developer", "B.Tech IT Student", "Problem Solver"];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typewriterEl = document.getElementById('typewriter');

  function runTypewriter() {
    if (!typewriterEl) return;

    // Check accessibility reduced motion state
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      typewriterEl.textContent = words[0];
      return;
    }

    const currentWord = words[wordIdx];
    if (isDeleting) {
      typewriterEl.textContent = currentWord.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typewriterEl.textContent = currentWord.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === currentWord.length) {
      delay = 1800; // Pause showing complete text
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      delay = 300; // Pause before typing next title
    }

    setTimeout(runTypewriter, delay);
  }

  runTypewriter();

  // ==========================================================================
  // SKILLS PROGRESS BAR ANIMATION (INTERSECTION OBSERVER)
  // ==========================================================================
  const skillCards = document.querySelectorAll('.skills-category');

  if ('IntersectionObserver' in window && skillCards.length > 0) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const fills = card.querySelectorAll('.skill-bar-fill');
          fills.forEach(fill => {
            const targetWidth = fill.getAttribute('data-progress');
            fill.style.width = targetWidth;
          });
          observer.unobserve(card); // Animate this card once
        }
      });
    }, { threshold: 0.15 });

    skillCards.forEach(card => {
      skillsObserver.observe(card);
    });
  } else {
    // Fallback if IntersectionObserver not supported
    setTimeout(() => {
      document.querySelectorAll('.skill-bar-fill').forEach(fill => {
        fill.style.width = fill.getAttribute('data-progress');
      });
    }, 500);
  }

  // ==========================================================================
  // EXPERIENCE TIMELINE SCROLL FILL
  // ==========================================================================
  const timeline = document.querySelector('.timeline');
  const timelineFill = document.getElementById('timeline-fill');
  const timelineNodes = document.querySelectorAll('.timeline-node');

  function updateTimeline() {
    if (!timeline || !timelineFill) return;

    const timelineRect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Timeline fill activates when its top enters 75% of viewport
    // and finishes filling when its bottom reaches 25% of viewport
    const startTrigger = viewportHeight * 0.75;
    const endTrigger = viewportHeight * 0.25;

    const totalHeight = timelineRect.height;
    const currentPosition = startTrigger - timelineRect.top;

    let progress = currentPosition / totalHeight;
    progress = Math.max(0, Math.min(1, progress));

    timelineFill.style.height = `${progress * 100}%`;

    // Mark nodes as passed/active depending on trigger boundary crossing
    timelineNodes.forEach(node => {
      const marker = node.querySelector('.node-indicator');
      if (!marker) return;
      
      const markerRect = marker.getBoundingClientRect();
      // If the node indicator is above the start trigger view, mark it as active/passed
      if (markerRect.top < startTrigger) {
        node.classList.add('passed');
      } else {
        node.classList.remove('passed');
      }
    });
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateTimeline);
  }, { passive: true });
  
  // Trigger initial timeline sizing
  updateTimeline();

  // ==========================================================================
  // SCROLL-REVEAL SECTION ANIMATIONS (FADE + TRANSLATEY)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if observer not present
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // ==========================================================================
  // SUBTLE 3D HOVER TILT FOR PROJECT CARDS
  // ==========================================================================
  const projectCards = document.querySelectorAll('.tilt-element');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Restrict rotation to max 5 degrees for sleek movement
      const rotateX = ((centerY - y) / centerY) * 5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

});
