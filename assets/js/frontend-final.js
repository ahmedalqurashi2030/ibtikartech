(() => {
  const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const page = pathname.replace(/\.html$/,'') || 'index';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const categoryPages = new Set(['websites','brand-content','growth','custom-systems']);
  const retiredRoutes = new Map([
    ['salla.html','ecommerce.html#platforms'],
    ['zid.html','ecommerce.html#platforms'],
    ['shopify.html','ecommerce.html#platforms'],
    ['woocommerce.html','ecommerce.html#platforms'],
    ['wordpress.html','websites.html#capabilities']
  ]);

  document.body.dataset.page = page;
  if (categoryPages.has(page)) document.body.classList.add('category-hub');

  // If a retired route is requested and the host serves the custom 404 page, recover gracefully.
  const requestedBasename = location.pathname.split('/').pop()?.toLowerCase();
  if (document.body.dataset.page === '404' && retiredRoutes.has(requestedBasename)) {
    location.replace(retiredRoutes.get(requestedBasename));
    return;
  }

  // Rewrite stale links that can remain in approved/reference-derived markup without mutating those sources.
  document.querySelectorAll('a[href]').forEach((link) => {
    const raw = link.getAttribute('href') || '';
    const clean = raw.split('#')[0].toLowerCase();
    if (retiredRoutes.has(clean)) {
      link.href = retiredRoutes.get(clean);
      link.dataset.retiredRouteRewritten = 'true';
    }
    if (link.target === '_blank') {
      const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.rel = [...rel].join(' ');
    }
  });

  // Lightweight progress indicator on content pages. Cinematic approved source pages already own their progress language.
  if (document.body.classList.contains('inner-page') && !document.querySelector('.ibt-page-progress')) {
    const progress = document.createElement('div');
    progress.className = 'ibt-page-progress';
    progress.setAttribute('aria-hidden','true');
    progress.innerHTML = '<span></span>';
    document.body.prepend(progress);
    const bar = progress.firstElementChild;
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      bar.style.transform = `scaleX(${Math.max(0,Math.min(1,scrollY/max))})`;
      ticking = false;
    };
    addEventListener('scroll',() => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },{passive:true});
    addEventListener('resize',update,{passive:true});
    update();
  }

  // Enrich category cards with non-semantic visual scenes without adding fake screenshots or claims.
  if (categoryPages.has(page)) {
    const cards = [...document.querySelectorAll('#capabilities .route-card')];
    cards.forEach((card,index) => {
      if (card.querySelector('.route-card__visual')) return;
      card.dataset.visual = String((index % 6) + 1);
      const visual = document.createElement('div');
      visual.className = 'route-card__visual';
      visual.setAttribute('aria-hidden','true');
      visual.innerHTML = '<span></span><span></span><span></span>';
      const small = card.querySelector('small');
      if (small) small.after(visual); else card.prepend(visual);
    });

    // Stable section IDs and a local task-oriented navigation.
    const main = document.querySelector('main');
    const hero = main?.querySelector('.platform-hero');
    const sections = [...(main?.querySelectorAll(':scope > section') || [])];
    const capabilities = document.getElementById('capabilities');
    const method = sections.find((section) => section !== hero && section !== capabilities && section.querySelector('.timeline'));
    const fit = sections.find((section) => section.querySelector('.platform-grid--2') && /مناسب|حدود/.test(section.textContent || ''));
    const related = sections.find((section) => section.querySelector('.related-nav'));
    const cta = sections.find((section) => section.classList.contains('page-cta'));
    if (method && !method.id) method.id = 'method';
    if (fit && !fit.id) fit.id = 'fit';
    if (related && !related.id) related.id = 'related';
    if (cta && !cta.id) cta.id = 'start';

    if (hero && capabilities && !document.querySelector('.category-local-nav')) {
      const nav = document.createElement('nav');
      nav.className = 'category-local-nav';
      nav.setAttribute('aria-label','التنقل داخل الصفحة');
      const links = [
        ['#capabilities','ما ننفذ'],
        method ? ['#method','طريقة العمل'] : null,
        fit ? ['#fit','هل يناسبك؟'] : null,
        related ? ['#related','مسارات مرتبطة'] : null,
        cta ? ['#start','ابدأ مشروعك'] : null
      ].filter(Boolean);
      nav.innerHTML = `<div class="category-local-nav__inner">${links.map(([href,label],i) => `<a href="${href}"${i===0?' class="is-active"':''}>${label}</a>`).join('')}</div>`;
      hero.insertAdjacentElement('afterend',nav);

      const navLinks = [...nav.querySelectorAll('a')];
      const targets = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
      if ('IntersectionObserver' in window && targets.length) {
        const observer = new IntersectionObserver((entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
          if (!visible) return;
          navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
        },{rootMargin:'-28% 0px -58% 0px',threshold:[0,.1,.4,.7]});
        targets.forEach((target) => observer.observe(target));
      }
    }
  }

  // Self-links in related navigation should read as current context, not as another destination.
  document.querySelectorAll('.related-nav a[href]').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (href && href === pathname) link.setAttribute('aria-current','page');
  });

  // Improve media loading without touching first-view hero imagery.
  document.querySelectorAll('main section:not(:first-of-type) img').forEach((img) => {
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });

  // Keep hash navigation clear of the fixed shell/local nav.
  document.querySelectorAll('main section[id], main [id][tabindex="-1"]').forEach((target) => {
    target.style.scrollMarginTop = categoryPages.has(page) ? '150px' : '112px';
  });

  // Respect reduced motion for programmatic hash navigation as well.
  if (!reducedMotion) {
    document.addEventListener('click',(event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href') === '#') return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'',link.getAttribute('href'));
    });
  }
})();
