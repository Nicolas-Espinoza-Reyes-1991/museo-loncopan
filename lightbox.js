(function () {
  const AUTO_GROUP_SELECTORS = [
    '.split-visual',
    '.features-grid',
    '.gallery-preview-grid',
    '.gallery-category',
  ];

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Vista ampliada de imagen');
  dialog.innerHTML = `
    <div class="lightbox-panel">
      <button type="button" class="lightbox-close" aria-label="Cerrar vista ampliada">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <button type="button" class="lightbox-nav lightbox-nav--prev" aria-label="Imagen anterior">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <figure class="lightbox-figure">
        <img class="lightbox-image" src="" alt="">
        <figcaption class="lightbox-caption"></figcaption>
      </figure>
      <button type="button" class="lightbox-nav lightbox-nav--next" aria-label="Siguiente imagen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(dialog);

  const imageEl = dialog.querySelector('.lightbox-image');
  const captionEl = dialog.querySelector('.lightbox-caption');
  const prevBtn = dialog.querySelector('.lightbox-nav--prev');
  const nextBtn = dialog.querySelector('.lightbox-nav--next');
  const closeBtn = dialog.querySelector('.lightbox-close');
  const panel = dialog.querySelector('.lightbox-panel');

  let items = [];
  let index = 0;
  let lastFocus = null;
  let pauseTarget = null;

  function getItem(trigger) {
    const img = trigger.querySelector('img') || trigger;
    return {
      src: img.currentSrc || img.src,
      alt: img.alt || '',
    };
  }

  function render() {
    const item = items[index];
    if (!item) return;

    imageEl.src = item.src;
    imageEl.alt = item.alt;
    captionEl.textContent = item.alt;
    captionEl.hidden = !item.alt;

    const showNav = items.length > 1;
    prevBtn.hidden = !showNav;
    nextBtn.hidden = !showNav;
  }

  function open(group, startIndex, target) {
    items = group;
    index = startIndex;
    lastFocus = document.activeElement;
    pauseTarget = target?.closest('[data-carousel]') || null;

    render();
    pauseTarget?.dispatchEvent(new CustomEvent('carousel:pause'));
    document.body.classList.add('lightbox-open');
    dialog.showModal();
    closeBtn.focus();
  }

  function close() {
    if (!dialog.open) return;

    dialog.close();
    document.body.classList.remove('lightbox-open');
    pauseTarget?.dispatchEvent(new CustomEvent('carousel:resume'));
    pauseTarget = null;
    imageEl.removeAttribute('src');
    lastFocus?.focus();
  }

  function goTo(nextIndex) {
    index = (nextIndex + items.length) % items.length;
    render();
  }

  function wrapImage(img) {
    if (img.closest('[data-lightbox-item]') || img.dataset.lightboxReady) {
      return null;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lightbox-trigger';
    button.dataset.lightboxItem = '';
    const label = img.alt ? `Ampliar: ${img.alt}` : 'Ampliar imagen';
    button.setAttribute('aria-label', label.length > 120 ? `${label.slice(0, 117)}…` : label);

    img.parentNode.insertBefore(button, img);
    button.appendChild(img);
    img.dataset.lightboxReady = 'true';
    return button;
  }

  function initGroup(groupEl) {
    if (groupEl.dataset.lightboxInit) return;
    groupEl.dataset.lightboxInit = 'true';

    groupEl.querySelectorAll('img').forEach((img) => {
      wrapImage(img);
    });

    const triggers = groupEl.querySelectorAll('[data-lightbox-item]');
    if (!triggers.length) return;

    const group = Array.from(triggers, getItem);

    triggers.forEach((trigger, triggerIndex) => {
      if (trigger.dataset.lightboxBound) return;
      trigger.dataset.lightboxBound = 'true';

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        open(group, triggerIndex, groupEl);
      });
    });
  }

  closeBtn.addEventListener('click', close);

  prevBtn.addEventListener('click', () => {
    goTo(index - 1);
  });

  nextBtn.addEventListener('click', () => {
    goTo(index + 1);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  panel.addEventListener('click', (event) => {
    if (event.target === panel) {
      close();
    }
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  });

  function bindSwipe(element) {
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
        if (deltaX < 0) goTo(index + 1);
        else goTo(index - 1);
      },
      { passive: true }
    );
  }

  bindSwipe(panel);

  document.querySelectorAll('[data-lightbox]').forEach(initGroup);
  AUTO_GROUP_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach(initGroup);
  });
})();
