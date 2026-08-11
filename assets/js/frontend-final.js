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

  const requestedBasename = location.pathname.split('/').pop()?.toLowerCase();
  if (document.querySelector('.notfound') && retiredRoutes.has(requestedBasename)) {
    location.replace(retiredRoutes.get(requestedBasename));
    return;
  }

  const rewriteLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
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
  };

  const syncDynamicContent = (scope = document) => {
    if (scope instanceof HTMLAnchorElement) rewriteLink(scope);
    scope.querySelectorAll?.('a[href]').forEach(rewriteLink);

    // Normalize naming across category breadcrumbs.
    scope.querySelectorAll?.('.breadcrumbs a[href="services.html"], .service-detail-breadcrumb a[href="services.html"]').forEach((link) => {
      link.textContent = 'الحلول والخدمات';
    });

    // Services catalog used to point to a retired standalone Salla page.
    if (page === 'services') {
      scope.querySelectorAll?.('.strategy-service-card').forEach((card) => {
        const heading = card.querySelector('h3');
        if (!heading || !/خدمات سلة المتخصصة|حلول سلة ضمن المتاجر/.test(heading.textContent || '')) return;
        heading.textContent = 'حلول سلة ضمن المتاجر الإلكترونية';
        const paragraph = card.querySelector('p');
        if (paragraph) paragraph.textContent = 'إطلاق وتخصيص وتجربة وقياس لمتاجر سلة داخل مسار التجارة الإلكترونية، دون صفحة منصة مستقلة في هذه المرحلة.';
        const link = card.querySelector('a');
        if (link) { link.href = 'ecommerce.html#platforms'; link.textContent = 'استكشف سلة ضمن المتاجر ←'; }
      });
    }
  };

  syncDynamicContent();
  const dynamicObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) syncDynamicContent(node);
    }));
  });
  dynamicObserver.observe(document.body,{childList:true,subtree:true});

  if (page === 'ecommerce') {
    const detailRoutes = new Map([
      ['service-launch','store-launch.html'],
      ['service-customize','storefront-customization.html'],
      ['service-redesign','store-redesign.html'],
      ['service-product','product-page-optimization.html'],
      ['service-growth','ecommerce-growth.html'],
      ['service-support','ecommerce-support.html']
    ]);
    detailRoutes.forEach((href,id) => {
      const card = document.getElementById(id);
      const link = card?.querySelector('.commerce-service-card__footer a');
      if (!link) return;
      link.href = href;
      link.textContent = 'تفاصيل الخدمة';
      link.setAttribute('aria-label', `فتح تفاصيل ${card.querySelector('h3')?.textContent?.trim() || 'الخدمة'}`);
    });

    const platformSection = document.getElementById('platforms');
    const platformIntro = platformSection?.querySelector('.platform-heading p');
    if (platformIntro) {
      platformIntro.textContent = 'المنصة عامل تنفيذ داخل الخدمة، وليست مسارًا منفصلًا حاليًا. نحدد ما يناسب مشروعك وفق التشغيل والتخصيص والقيود، ويمكن إضافة صفحات متخصصة للمنصات مستقبلًا عندما تصبح لها قيمة مستقلة.';
    }
    platformSection?.querySelectorAll('.platform-card').forEach((card) => {
      const link = card.querySelector('a');
      if (!link) return;
      link.href = '#subservices';
      link.textContent = 'استكشف الخدمات المناسبة';
      link.setAttribute('aria-label', `استكشف خدمات المتاجر المناسبة لـ ${card.querySelector('h3')?.textContent?.trim() || 'هذه المنصة'}`);
    });

    const finalCta = document.querySelector('.page-cta .cta-actions');
    const secondary = finalCta?.querySelector('.btn-outline');
    if (secondary) {
      secondary.href = '#platforms';
      secondary.textContent = 'المنصات التي نعمل عليها';
    }
  }

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

  document.querySelectorAll('.related-nav a[href]').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (href && href === pathname) link.setAttribute('aria-current','page');
  });

  document.querySelectorAll('main section:not(:first-of-type) img').forEach((img) => {
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });

  document.querySelectorAll('main section[id], main [id][tabindex="-1"]').forEach((target) => {
    target.style.scrollMarginTop = categoryPages.has(page) ? '150px' : '112px';
  });

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
