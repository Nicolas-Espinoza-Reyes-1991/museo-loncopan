function bindSwipe(element, onSwipeLeft, onSwipeRight) {
  let startX = 0;
  let startY = 0;

  element.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches[0];
      startX = touch.screenX;
      startY = touch.screenY;
    },
    { passive: true }
  );

  element.addEventListener(
    'touchend',
    (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.screenX - startX;
      const deltaY = touch.screenY - startY;

      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    },
    { passive: true }
  );
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('.hero-carousel-viewport');
  const slides = carousel.querySelectorAll('.hero-carousel-slide');
  const dots = carousel.querySelectorAll('.hero-carousel-dot');
  const prevBtn = carousel.querySelector('.hero-carousel-btn--prev');
  const nextBtn = carousel.querySelector('.hero-carousel-btn--next');
  let current = 0;
  let autoplayTimer;

  if (!slides.length) return;

  const counter = document.createElement('div');
  counter.className = 'hero-carousel-counter';
  counter.setAttribute('aria-live', 'polite');
  carousel.appendChild(counter);

  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'tabpanel');
    slide.id = `carousel-slide-${index}`;
    slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
  });

  dots.forEach((dot, index) => {
    dot.setAttribute('aria-controls', `carousel-slide-${index}`);
  });

  function goTo(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === current;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    counter.textContent = `${current + 1} / ${slides.length}`;
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(next, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = undefined;
    }
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    next();
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.slide));
      startAutoplay();
    });
  });

  if (viewport) {
    bindSwipe(viewport, next, prev);
  }

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  carousel.addEventListener('carousel:pause', stopAutoplay);
  carousel.addEventListener('carousel:resume', startAutoplay);

  goTo(0);
  startAutoplay();
});
