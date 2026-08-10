(() => {
  document.querySelectorAll('#year').forEach((item) => { item.textContent = new Date().getFullYear(); });
  const megaToggles = [...document.querySelectorAll('[data-ibt-mega-toggle]')];
  const managedThemeButtons = [...document.querySelectorAll('[data-ibt-theme-toggle]:not([data-ibt-theme-managed="page"])')];
  const managedMenuButtons = [...document.querySelectorAll('[data-ibt-menu-toggle]:not([data-ibt-menu-managed="page"])')];

  function closeMega(except) {
    megaToggles.forEach((toggle) => {
      if (toggle === except) return;
      const menu = document.getElementById(toggle.getAttribute('aria-controls'));
      toggle.setAttribute('aria-expanded', 'false');
      menu?.classList.remove('is-open');
      menu?.setAttribute('aria-hidden', 'true');
    });
  }

  function setMega(toggle, open) {
    const menu = document.getElementById(toggle?.getAttribute('aria-controls'));
    if (!toggle || !menu) return;
    closeMega(toggle);
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
  }

  megaToggles.forEach((toggle) => {
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      setMega(toggle, !menu?.classList.contains('is-open'));
    });
  });

  document.querySelectorAll('[data-ibt-mega-root] > .ibt-shell-nav-link').forEach((link) => {
    const root = link.closest('[data-ibt-mega-root]');
    const toggle = root?.querySelector('[data-ibt-mega-toggle]');
    const menu = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
    if (!toggle || !menu) return;
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-controls', menu.id);
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setMega(toggle, !menu.classList.contains('is-open'));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-ibt-mega-root]')) closeMega();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMega();
  });

  managedMenuButtons.forEach((button) => {
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    const closeMenu = (restoreFocus = false) => {
      menu?.classList.remove('open', 'is-open');
      menu?.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (restoreFocus) button.focus();
    };
    button.addEventListener('click', () => {
      const open = !menu?.classList.contains('open');
      menu?.classList.toggle('open', open);
      menu?.classList.toggle('is-open', open);
      menu?.setAttribute('aria-hidden', String(!open));
      button.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (open) menu?.querySelector('a, summary')?.focus();
    });
    menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu?.classList.contains('open')) closeMenu(true);
    });
  });

  managedThemeButtons.forEach((button) => {
    const saved = localStorage.getItem('ibtikar-theme');
    if (saved) document.documentElement.dataset.theme = saved;
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('ibtikar-theme', next);
    });
  });
  window.IBTIKAR_ANALYTICS?.init?.();
})();
