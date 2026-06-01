const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.getElementById('header');
const MOBILE_BREAKPOINT = 992;

let overlay = document.querySelector('.nav-overlay');

if (!overlay) {
  overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
}

function isMobileNav() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.closest('[hidden]'));
}

function setMenuOpen(isOpen) {
  if (!toggle || !navLinks) return;

  navLinks.classList.toggle('open', isOpen);
  toggle.classList.toggle('active', isOpen);
  overlay.classList.toggle('visible', isOpen);
  document.body.classList.toggle('nav-open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  overlay.setAttribute('aria-hidden', String(!isOpen));

  if (isOpen) {
    const focusables = getFocusableElements(navLinks);
    focusables[0]?.focus();
  }
}

function closeMenu() {
  setMenuOpen(false);
}

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    setMenuOpen(!navLinks.classList.contains('open'));
  });

  overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (!navLinks.classList.contains('open')) return;

    if (event.key === 'Escape') {
      closeMenu();
      toggle.focus();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = getFocusableElements(navLinks);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (!isMobileNav() && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });
}

if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
