(() => {
  'use strict';

  if (!document.body.classList.contains('source-home')) return;
  const section = document.querySelector('.services-cinema');
  if (!section || section.dataset.runtimeV2 === 'true') return;
  section.dataset.runtimeV2 = 'true';

  const html = document.documentElement;
  const stage = section.querySelector('.services-cinema__stage');
  const rail = section.querySelector('.services-cinema__rail');
  const steps = [...section.querySelectorAll('.services-cinema__steps span')];
  const copies = [...section.querySelectorAll('.service-scene-copy')];
  const mobileDeck = section.querySelector('.services-mobile-deck');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 821px)');
  const centers = [.13, .29, .45, .61, .77, .93];

  const getTrigger = () => {
    if (!window.ScrollTrigger?.getAll) return null;
    return window.ScrollTrigger.getAll().find((trigger) => trigger.trigger === section) || null;
  };

  const useFallback = (reason) => {
    html.classList.add('no-immersive-motion');
    section.classList.remove('is-cinema-live');
    section.classList.add('is-services-fallback');
    section.dataset.runtimeState = reason;
    if (mobileDeck) mobileDeck.setAttribute('aria-label', 'الخدمات الرئيسية');
  };

  const scrollToScene = (index) => {
    const safeIndex = Math.max(0, Math.min(centers.length - 1, index));
    const travel = Math.max(1, section.offsetHeight - innerHeight);
    const top = section.getBoundingClientRect().top + scrollY;
    const target = top + travel * centers[safeIndex];

    if (window.ibtikarLenis?.scrollTo) {
      window.ibtikarLenis.scrollTo(target, { duration: .9, offset: 0 });
    } else {
      window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const activeIndex = () => {
    const index = steps.findIndex((step) => step.classList.contains('active'));
    return index >= 0 ? index : 0;
  };

  const makeRailInteractive = () => {
    if (!rail || !steps.length || rail.dataset.interactive === 'true') return;
    rail.dataset.interactive = 'true';
    rail.removeAttribute('aria-hidden');
    rail.setAttribute('aria-label', 'التنقل بين خدمات ابتكار تك');

    steps.forEach((step, index) => {
      step.setAttribute('role', 'button');
      step.tabIndex = 0;
      step.setAttribute('aria-label', `الانتقال إلى الخدمة ${index + 1} من ${steps.length}`);
      const activate = () => scrollToScene(index);
      step.addEventListener('click', activate);
      step.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
          return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          steps[(index + 1) % steps.length].focus();
          return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          steps[(index - 1 + steps.length) % steps.length].focus();
        }
      });
    });

    if (stage && !stage.querySelector('.home-services-cinema-controls')) {
      const controls = document.createElement('div');
      controls.className = 'home-services-cinema-controls';
      controls.setAttribute('aria-label', 'التنقل السريع بين الخدمات');
      controls.innerHTML = '<button type="button" data-service-prev aria-label="الخدمة السابقة">↑</button><button type="button" data-service-next aria-label="الخدمة التالية">↓</button>';
      stage.appendChild(controls);
      controls.querySelector('[data-service-prev]').addEventListener('click', () => scrollToScene(activeIndex() - 1));
      controls.querySelector('[data-service-next]').addEventListener('click', () => scrollToScene(activeIndex() + 1));
    }
  };

  const syncSceneA11y = () => {
    if (!copies.length) return;
    copies.forEach((copy) => {
      const active = copy.classList.contains('active');
      copy.setAttribute('aria-hidden', String(!active));
      const link = copy.querySelector('.scene-link');
      if (link) link.tabIndex = active ? 0 : -1;
    });
  };

  const sceneObserver = new MutationObserver(syncSceneA11y);
  copies.forEach((copy) => sceneObserver.observe(copy, { attributes: true, attributeFilter: ['class'] }));

  const activateDesktop = () => {
    if (!desktop.matches || reduce) {
      useFallback(reduce ? 'reduced-motion' : 'compact-viewport');
      return;
    }

    // Let the original cinematic engine initialize first. If it did not,
    // fall back to the fully styled service deck rather than leaving a blank/stuck stage.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const trigger = getTrigger();
      if (!trigger) {
        useFallback(window.ScrollTrigger ? 'missing-services-trigger' : 'missing-motion-library');
        return;
      }

      html.classList.remove('no-immersive-motion');
      section.classList.remove('is-services-fallback');
      section.classList.add('is-cinema-live');
      section.dataset.runtimeState = 'cinema-live';
      makeRailInteractive();
      syncSceneA11y();

      try { window.ScrollTrigger.refresh(true); } catch (_) {}
    }));
  };

  let refreshFrame = 0;
  const scheduleRefresh = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      if (section.classList.contains('is-cinema-live')) {
        try { window.ScrollTrigger?.refresh?.(); } catch (_) {}
      }
    });
  };

  if ('ResizeObserver' in window && stage) {
    const resizeObserver = new ResizeObserver(scheduleRefresh);
    resizeObserver.observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleRefresh();
  });

  desktop.addEventListener?.('change', activateDesktop);
  if (document.readyState === 'complete') activateDesktop();
  else addEventListener('load', activateDesktop, { once: true });
})();
