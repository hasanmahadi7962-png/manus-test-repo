(() => {
  const header = document.querySelector('#site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const mobileLinks = document.querySelectorAll('[data-mobile-nav]');
  const navLinks = document.querySelectorAll('[data-nav]');
  const year = document.querySelector('#current-year');
  let ticking = false;

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(!menuToggle.classList.contains('is-open'));
  });
  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) setMenu(false);
  });

  // Reveal content as it enters the viewport. The reduced-motion media query makes these visible immediately.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('revealed'));
  }

  // Fill the process line once, independent of scroll speed.
  const processTimeline = document.querySelector('#process-timeline');
  if (processTimeline && 'IntersectionObserver' in window) {
    const processObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        processTimeline.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    processObserver.observe(processTimeline);
  } else {
    processTimeline?.classList.add('is-visible');
  }

  // Keep the compact primary navigation aware of the current scroll position.
  const activeTargets = [
    { key: 'home', node: document.querySelector('#home') },
    { key: 'about', node: document.querySelector('#about') },
    { key: 'projects', node: document.querySelector('#projects') },
    { key: 'contact', node: document.querySelector('#contact') }
  ].filter((item) => item.node);

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const target = activeTargets.find((item) => item.node === visible.target);
      if (!target) return;
      navLinks.forEach((link) => {
        link.toggleAttribute('aria-current', link.dataset.nav === target.key);
      });
    }, { rootMargin: '-44% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] });
    activeTargets.forEach((item) => activeObserver.observe(item.node));
  }

  // Accessible, single-open FAQ accordion.
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    trigger?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      faqItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  if (year) year.textContent = new Date().getFullYear();
})();
