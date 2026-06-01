(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.reveal').forEach((el) => {
    if (reducedMotion) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );

    observer.observe(el);
  });

  document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';

    if (reducedMotion || Number.isNaN(target)) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(el);

          const duration = 1200;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            const value = Math.round(target * eased);
            el.textContent = `${prefix}${value}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
  });

  const collectionNav = document.querySelector('.collection-nav');
  if (collectionNav) {
    const sections = [...document.querySelectorAll('.gallery-category[id]')];
    const links = [...collectionNav.querySelectorAll('a')];

    if (sections.length && links.length) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            links.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );

      sections.forEach((section) => navObserver.observe(section));
    }
  }

  document.querySelectorAll('.collection-nav a').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });
})();
