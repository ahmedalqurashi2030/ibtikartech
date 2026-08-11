(() => {
  document.querySelectorAll('#year').forEach((item) => { item.textContent = new Date().getFullYear(); });
  const megaToggles = [...document.querySelectorAll('[data-ibt-mega-toggle]')];
  const megaRoots = [...document.querySelectorAll('[data-ibt-mega-root]')];
  const managedThemeButtons = [...document.querySelectorAll('[data-ibt-theme-toggle]:not([data-ibt-theme-managed="page"])')];
  const managedMenuButtons = [...document.querySelectorAll('[data-ibt-menu-toggle]:not([data-ibt-menu-managed="page"])')];
  let lastMegaToggle = null;

  const menuFor = (toggle) => toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;

  function closeMega(except = null, restoreFocus = false) {
    megaToggles.forEach((toggle) => {
      if (toggle === except) return;
      const menu = menuFor(toggle);
      const wasOpen = menu?.classList.contains('is-open');
      toggle.setAttribute('aria-expanded','false');
      menu?.classList.remove('is-open');
      menu?.setAttribute('aria-hidden','true');
      if (restoreFocus && wasOpen) toggle.focus();
    });
  }

  function setMega(toggle, open) {
    const menu = menuFor(toggle);
    if (!toggle || !menu) return;
    closeMega(toggle);
    toggle.setAttribute('aria-expanded',String(open));
    menu.classList.toggle('is-open',open);
    menu.setAttribute('aria-hidden',String(!open));
    if (open) lastMegaToggle = toggle;
  }

  megaToggles.forEach((toggle) => {
    const menu = menuFor(toggle);
    toggle.addEventListener('click',(event) => {
      event.preventDefault();
      setMega(toggle,!menu?.classList.contains('is-open'));
    });
  });

  // The text label remains a real link; the adjacent arrow owns menu toggling.
  megaRoots.forEach((root) => {
    const link = root.querySelector(':scope > .ibt-shell-nav-link');
    const toggle = root.querySelector('[data-ibt-mega-toggle]');
    const menu = menuFor(toggle);
    if (!link || !toggle || !menu) return;
    link.setAttribute('aria-haspopup','true');
    link.setAttribute('aria-controls',menu.id);

    root.addEventListener('focusin',() => setMega(toggle,true));
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      root.addEventListener('pointerenter',() => setMega(toggle,true));
      root.addEventListener('pointerleave',() => setMega(toggle,false));
    }
  });

  document.addEventListener('click',(event) => {
    if (!event.target.closest('[data-ibt-mega-root]')) closeMega();
  });

  document.addEventListener('keydown',(event) => {
    if (event.key === 'Escape' && lastMegaToggle) {
      const open = menuFor(lastMegaToggle)?.classList.contains('is-open');
      closeMega(null,open);
      lastMegaToggle = null;
    }
  });

  managedMenuButtons.forEach((button) => {
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    if (!menu) return;

    const focusables = () => [...menu.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')]
      .filter((item) => !item.hidden && item.getClientRects().length);

    const closeMenu = (restoreFocus = false) => {
      menu.classList.remove('open','is-open');
      menu.setAttribute('aria-hidden','true');
      button.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
      if (restoreFocus) button.focus();
    };

    const openMenu = () => {
      closeMega();
      menu.classList.add('open','is-open');
      menu.setAttribute('aria-hidden','false');
      button.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
      requestAnimationFrame(() => focusables()[0]?.focus());
    };

    button.addEventListener('click',() => {
      const open = menu.classList.contains('open');
      if (open) closeMenu(true); else openMenu();
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click',() => closeMenu()));
    menu.querySelectorAll('details').forEach((details) => {
      details.addEventListener('toggle',() => {
        if (!details.open) return;
        menu.querySelectorAll('details[open]').forEach((other) => { if (other !== details) other.open = false; });
      });
    });

    document.addEventListener('keydown',(event) => {
      if (!menu.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize',() => {
      if (innerWidth > 1100 && menu.classList.contains('open')) closeMenu();
    },{passive:true});
  });

  managedThemeButtons.forEach((button) => {
    const saved = localStorage.getItem('ibtikar-theme');
    if (saved) document.documentElement.dataset.theme = saved;
    button.addEventListener('click',() => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('ibtikar-theme',next); } catch (_) {}
    });
  });

  window.IBTIKAR_ANALYTICS?.init?.();
})();
