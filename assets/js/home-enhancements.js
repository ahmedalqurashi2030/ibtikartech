(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function ensureCss() {
    if ($('link[data-strategy-enhancements]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/pages/strategy-enhancements.css';
    link.dataset.strategyEnhancements = 'true';
    document.head.appendChild(link);
  }

  function html(markup) {
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    return template.content.firstElementChild;
  }

  function sectionOf(node) {
    return node?.closest?.('section') || node;
  }

  function insertBefore(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target);
  }

  function insertAfter(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target.nextSibling);
  }

  function action(href, label, primary = false) {
    return `<a class="strategy-action${primary ? ' strategy-action--primary' : ''}" href="${href}">${label}</a>`;
  }

  function repairHomeServices(main) {
    const cinema = $('.services-cinema', main);
    if (!cinema || cinema.dataset.homeServicesReady === 'true') return;
    cinema.dataset.homeServicesReady = 'true';
    cinema.classList.add('strategy-existing-section', 'strategy-existing-section--services');

    const routes = [
      { href: 'ecommerce.html', label: 'استكشف المتاجر الإلكترونية' },
      { href: 'websites.html', label: 'استكشف المواقع وصفحات الهبوط' },
      { href: 'brand-content.html', label: 'استكشف الهوية والمحتوى' },
      { href: 'growth.html', label: 'استكشف التسويق والنمو' },
      { href: 'custom-systems.html', label: 'استكشف الربط والأتمتة' },
      { href: 'custom-systems.html', label: 'استكشف الأنظمة والحلول المخصصة' }
    ];

    $$('.service-scene-copy', cinema).forEach((scene, index) => {
      const route = routes[index];
      if (!route) return;
      const link = $('.scene-link', scene);
      if (!link) return;
      link.href = route.href;
      link.textContent = route.label;
      link.setAttribute('aria-label', route.label);
    });

    $$('.services-mobile-card', cinema).forEach((card, index) => {
      const route = routes[index];
      if (!route) return;
      card.dataset.href = route.href;
      card.setAttribute('role', 'link');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent?.trim() || 'الخدمة'} — ${route.label}`);

      if (!card.querySelector('.home-service-mobile-action')) {
        const cue = document.createElement('span');
        cue.className = 'home-service-mobile-action';
        cue.textContent = `${route.label} ←`;
        cue.setAttribute('aria-hidden', 'true');
        card.appendChild(cue);
      }

      const open = () => { location.href = route.href; };
      card.addEventListener('click', (event) => {
        if (event.target.closest('a,button,input,select,textarea')) return;
        open();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
      });
    });

    const mobileTrack = $('.services-mobile-track', cinema);
    if (mobileTrack) {
      mobileTrack.setAttribute('aria-label', 'الخدمات الرئيسية — اسحب للتنقل بين البطاقات');
      mobileTrack.setAttribute('tabindex', '0');
    }
  }

  function initHome() {
    const main = $('main');
    if (!main || document.body.dataset.strategyHomeClean === 'true') return;

    const needs = sectionOf($('.needs-grid', main));
    const tharaa = sectionOf($('.tharaa-section, #tharaa, .thx', main));
    const portfolio = sectionOf($('.portfolio-grid', main));
    const process = sectionOf($('.process-line', main));
    const faq = sectionOf($('.faq-grid', main));

    document.body.dataset.strategyHomeClean = 'true';

    // Homepage intentionally does not inject BUILD · BRAND · CONNECT · GROW or KNOWLEDGE.
    // Their dedicated destinations remain available through navigation and inner pages.
    document.querySelector('[data-strategy-home-v3]')?.remove();
    document.querySelector('[data-strategy-home-knowledge]')?.remove();

    if (needs && !document.querySelector('[data-strategy-stage]')) {
      needs.classList.add('strategy-existing-section', 'strategy-existing-section--goals');
      const stage = html(`
        <section class="strategy-layer strategy-layer--stage" data-strategy-stage>
          <div class="strategy-shell">
            <div class="strategy-head"><span class="strategy-kicker">أين أنت الآن؟</span><h2>مرحلة مشروعك تحدد نقطة البداية، لا اسم الخدمة.</h2><p>مشروع جديد، مشروع قائم، مشكلة محددة، أو مرحلة توسع — نبدأ من الوضع الفعلي ثم نحدد المسار.</p></div>
            <div class="strategy-stage-grid">
              <a href="services.html#goals" class="strategy-stage-card"><i>01</i><h3>فكرة أو مشروع جديد</h3><p>نحدد الحل المناسب والبنية والمنصة والنطاق.</p><span>ابدأ من الهدف ←</span></a>
              <a href="services.html#services" class="strategy-stage-card"><i>02</i><h3>مشروع قائم يحتاج تطويرًا</h3><p>نراجع الوضع الحالي ونرتب الأولويات.</p><span>استكشف الخدمات ←</span></a>
              <a href="contact.html#quote" class="strategy-stage-card"><i>03</i><h3>مشكلة محددة</h3><p>نحوّل المشكلة إلى نطاق تنفيذ مركز.</p><span>اطلب تشخيصًا ←</span></a>
              <a href="growth.html" class="strategy-stage-card"><i>04</i><h3>جاهز للتوسع</h3><p>قياس وربط وتحسين يساعد على اتخاذ قرارات أفضل.</p><span>مسار النمو ←</span></a>
            </div>
          </div>
        </section>`);
      insertAfter(needs, stage);
    }

    repairHomeServices(main);

    if (tharaa && !document.querySelector('[data-strategy-product-context]')) {
      tharaa.classList.add('strategy-existing-section', 'strategy-existing-section--product');
      const productLabel = html(`
        <div class="strategy-product-context" data-strategy-product-context>
          <div><span class="strategy-kicker">ORIGINAL PRODUCT</span><strong>ثراء منتج مستقل داخل منظومة ابتكار تك.</strong><p>يبقى له حضور واضح في الرئيسية لأنه منتج مملوك لابتكار تك، بينما تفاصيل خدمات المتاجر تبقى داخل صفحات الخدمات.</p></div>
          <div class="strategy-actions">${action('tharaa.html','صفحة ثراء',true)}</div>
        </div>`);
      insertBefore(tharaa, productLabel);
    }

    if (portfolio && !document.querySelector('[data-strategy-evidence]')) {
      const evidence = html(`
        <div class="strategy-evidence-bar" data-strategy-evidence>
          <div><span class="strategy-kicker">EVIDENCE FIRST</span><strong>الأعمال تُعرض كحالات، لا كصور فقط.</strong></div>
          <p>عند توفر الدليل: المشكلة → ما نفذناه → النتيجة القابلة للإثبات. لا نعرض نسب نمو أو شعارات عملاء بلا مصدر وإذن.</p>
          <a href="portfolio.html">استكشف الأعمال ←</a>
        </div>`);
      insertAfter(portfolio, evidence);
    }

    if (process && !document.querySelector('[data-strategy-continuity]')) {
      const continuity = html(`
        <div class="strategy-continuity" data-strategy-continuity>
          <span>بعد التسليم</span><strong>التوثيق والدعم والتحسين جزء من الرحلة.</strong><p>نطاق الدعم الفعلي يظهر داخل صفحة الخدمة أو المنتج المعني.</p>
        </div>`);
      insertAfter(process, continuity);
    }

    if (faq) faq.classList.add('strategy-existing-section', 'strategy-existing-section--faq');
  }

  function init() {
    ensureCss();
    initHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
