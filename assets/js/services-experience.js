(() => {
  if (!document.body.classList.contains('source-services')) return;
  if (window.__ibtikarServicesExperience) return;
  window.__ibtikarServicesExperience = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  if (!main) return;

  const catalogRoutes = [
    [/إطلاق وتجهيز متجر/, 'ecommerce.html'],
    [/تطوير واجهة متجر قائم/, 'storefront-customization.html'],
    [/تحسين صفحة المنتج/, 'product-page-optimization.html'],
    [/الهوية والمحتوى الرقمي/, 'brand-content.html'],
    [/SEO والقياس والتحسين/, 'growth.html'],
    [/الربط والأتمتة/, 'custom-systems.html'],
    [/أنظمة وحلول مخصصة/, 'custom-systems.html'],
    [/خدمات سلة المتخصصة|حلول سلة ضمن المتاجر الإلكترونية/, 'ecommerce.html#platforms']
  ];

  function resolveRoute(card) {
    const heading = card.querySelector('h3')?.textContent?.trim() || '';
    const match = catalogRoutes.find(([pattern]) => pattern.test(heading));
    return match?.[1] || card.querySelector('a')?.getAttribute('href') || 'services.html';
  }

  function moveBeforeFinalSection(section) {
    const directSections = [...main.children].filter((node) => node.tagName === 'SECTION');
    const finalSection = directSections.at(-1);
    if (finalSection && finalSection !== section && section.nextElementSibling !== finalSection) {
      main.insertBefore(section, finalSection);
    }
  }

  function enhanceFastDiscovery(catalogSection) {
    if (!catalogSection || catalogSection.dataset.fastDiscoveryReady === 'true') return;
    catalogSection.dataset.fastDiscoveryReady = 'true';
    catalogSection.id = 'services';
    catalogSection.classList.add('fast-discovery-carousel');

    const heading = catalogSection.querySelector('.strategy-head');
    const title = heading?.querySelector('h2');
    const description = heading?.querySelector('p');
    if (title) title.textContent = 'استكشف الخدمات بسرعة، ثم ادخل إلى المسار المناسب.';
    if (description) description.textContent = 'اسحب بين بطاقات الخدمات أو استخدم الأسهم. أبقينا مشاهد الخدمات الإبداعية بتجربتها الأصلية، ووضعنا هنا مسارًا سريعًا لاتخاذ القرار قبل نهاية الصفحة.';

    const track = catalogSection.querySelector('.strategy-service-catalog');
    if (!track) return;
    track.classList.add('fast-discovery-track');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'FAST DISCOVERY — بطاقات الخدمات الرئيسية');
    track.tabIndex = 0;

    const cards = [...track.querySelectorAll('.strategy-service-card')];
    cards.forEach((card, index) => {
      const href = resolveRoute(card);
      const link = card.querySelector('a');
      if (link) link.href = href;

      card.classList.add('fast-discovery-card');
      card.dataset.fastDiscoveryIndex = String(index);
      card.dataset.href = href;
      card.tabIndex = 0;
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', `فتح خدمة ${card.querySelector('h3')?.textContent?.trim() || index + 1}`);

      const open = () => { location.href = href; };
      card.addEventListener('click', (event) => {
        if (track.dataset.dragMoved === 'true') return;
        if (event.target.closest('a,button,input,select,textarea')) return;
        open();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
      });
    });

    const filterbar = catalogSection.querySelector('.strategy-filterbar');
    const controls = document.createElement('div');
    controls.className = 'fast-discovery-controls';
    controls.innerHTML = `
      <div class="fast-discovery-controls__copy">
        <span>DRAG · SWIPE · DISCOVER</span>
        <strong>تنقّل بين الخدمات بدون مغادرة السياق.</strong>
      </div>
      <div class="fast-discovery-controls__actions" aria-label="التنقل بين بطاقات الخدمات">
        <button type="button" data-fast-prev aria-label="البطاقة السابقة">→</button>
        <button type="button" data-fast-next aria-label="البطاقة التالية">←</button>
      </div>`;
    (filterbar || track).insertAdjacentElement('afterend', controls);
    if (!filterbar) track.before(controls);

    let activeIndex = 0;
    const visibleCards = () => cards.filter((card) => !card.hidden);

    const focusCard = (index, smooth = true) => {
      const visible = visibleCards();
      if (!visible.length) return;
      activeIndex = Math.max(0, Math.min(index, visible.length - 1));
      visible[activeIndex].scrollIntoView({
        behavior: reducedMotion || !smooth ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    };

    controls.querySelector('[data-fast-prev]')?.addEventListener('click', () => focusCard(activeIndex - 1));
    controls.querySelector('[data-fast-next]')?.addEventListener('click', () => focusCard(activeIndex + 1));

    let scrollTimer = 0;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const visible = visibleCards();
        if (!visible.length) return;
        const rect = track.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        let nearest = 0;
        let distance = Infinity;
        visible.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const nextDistance = Math.abs(cardRect.left + cardRect.width / 2 - center);
          if (nextDistance < distance) {
            distance = nextDistance;
            nearest = index;
          }
        });
        activeIndex = nearest;
      }, 80);
    }, { passive: true });

    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      moved = false;
      track.dataset.dragMoved = 'false';
      track.classList.add('is-dragging');
      try { track.setPointerCapture(pointerId); } catch (_) {}
    });
    track.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 6) moved = true;
      if (!moved) return;
      track.dataset.dragMoved = 'true';
      track.scrollLeft = startScroll - delta;
    });
    const endDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      try { track.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
      track.classList.remove('is-dragging');
      window.setTimeout(() => { track.dataset.dragMoved = 'false'; }, 0);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);

    const resetAfterFilter = () => {
      activeIndex = 0;
      window.requestAnimationFrame(() => {
        track.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    };
    filterbar?.querySelectorAll('[data-strategy-filter]').forEach((button) => button.addEventListener('click', resetAfterFilter));
    filterbar?.querySelector('[data-strategy-service-search]')?.addEventListener('input', resetAfterFilter);

    moveBeforeFinalSection(catalogSection);
  }

  // Important: the original .service-lab / creative service scenes are intentionally untouched.
  // FAST DISCOVERY is the only section transformed into a draggable card experience.
  const sync = () => {
    const catalog = main.querySelector('[data-strategy-service-catalog]');
    if (catalog) enhanceFastDiscovery(catalog);
  };

  sync();
  const observer = new MutationObserver(() => sync());
  observer.observe(main, { childList: true, subtree: true });
})();
