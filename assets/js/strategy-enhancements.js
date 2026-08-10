(() => {
  const PATH = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
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

  function insertBefore(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target);
  }

  function insertAfter(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target.nextSibling);
  }

  function sectionOf(node) {
    return node?.closest?.('section') || node;
  }

  function action(href, label, primary = false, attrs = '') {
    return `<a class="strategy-action${primary ? ' strategy-action--primary' : ''}" href="${href}" ${attrs}>${label}</a>`;
  }

  function safeConfigValue(value) {
    return value && !String(value).includes('[TODO:') ? value : '';
  }

  function initHome() {
    const main = $('main');
    if (!main || $('[data-strategy-home-v2]')) return;

    const hero = sectionOf($('.hero', main));
    const needs = sectionOf($('.needs-grid', main));
    const services = sectionOf($('.services-grid', main));
    const platforms = $('.platforms', main);
    const tharaa = sectionOf($('.tharaa-section, #tharaa, .thx', main));
    const portfolio = sectionOf($('.portfolio-grid', main));
    const process = sectionOf($('.process-line', main));
    const faq = sectionOf($('.faq-grid', main));
    const finalCta = $('.cta-section', main) || sectionOf($('.cta-card', main));

    if (!hero) return;
    document.body.dataset.strategyHomeV2 = 'true';

    const promise = html(`
      <section class="strategy-layer strategy-layer--home-intro" data-strategy-home-v2 aria-labelledby="strategyPromiseTitle">
        <div class="strategy-shell">
          <div class="strategy-compact-head">
            <div><span class="strategy-kicker">BUILD · BRAND · CONNECT · GROW</span><h2 id="strategyPromiseTitle">منظومة واحدة، لكن نقطة البداية تتغير حسب هدفك.</h2></div>
            <p>نحافظ على التجربة الإبداعية الأصلية للموقع، ونضيف فوقها طبقة قرار تجعل الزائر يفهم ماذا يختار ولماذا وما الخطوة التالية.</p>
          </div>
          <div class="strategy-outcome-rail" aria-label="مسارات ابتكار تك">
            <a href="services.html#goals"><b>01</b><span><strong>أطلق</strong><small>متجر، موقع أو منتج رقمي</small></span></a>
            <a href="brand-content.html"><b>02</b><span><strong>حسّن</strong><small>الهوية والتجربة والمحتوى</small></span></a>
            <a href="custom-systems.html"><b>03</b><span><strong>اربط</strong><small>البيانات والعمليات والأتمتة</small></span></a>
            <a href="growth.html"><b>04</b><span><strong>نمِّ</strong><small>SEO والقياس والتحسين</small></span></a>
          </div>
        </div>
      </section>`);
    insertAfter(hero, promise);

    if (needs) {
      needs.classList.add('strategy-existing-section', 'strategy-existing-section--goals');
      const stage = html(`
        <section class="strategy-layer strategy-layer--stage" data-strategy-stage>
          <div class="strategy-shell">
            <div class="strategy-head"><span class="strategy-kicker">أين أنت الآن؟</span><h2>مرحلة مشروعك تحدد نوع التدخل قبل اسم الخدمة.</h2><p>هذا المسار يترجم ما رصدناه في السوق: العميل يبدأ بالنتيجة والمشكلة، ثم نوصله إلى التنفيذ المناسب.</p></div>
            <div class="strategy-stage-grid">
              <a href="services.html#goals" class="strategy-stage-card"><i>01</i><h3>فكرة أو مشروع جديد</h3><p>نحدد البنية والمنصة والهوية ونطاق الإطلاق.</p><span>مسار الإطلاق ←</span></a>
              <a href="services.html#goals" class="strategy-stage-card"><i>02</i><h3>مشروع قائم يحتاج تطويرًا</h3><p>نراجع التجربة ونرتب الأولويات دون إعادة بناء غير لازمة.</p><span>مسار التحسين ←</span></a>
              <a href="contact.html#quote" class="strategy-stage-card"><i>03</i><h3>مشكلة محددة</h3><p>صفحة، ربط، قياس، ثيم أو تجربة تحتاج تشخيصًا مباشرًا.</p><span>اطلب تشخيصًا ←</span></a>
              <a href="growth.html" class="strategy-stage-card"><i>04</i><h3>جاهز للتوسع</h3><p>نربط القياس والنمو والتحسين المستمر بما يحدث فعليًا.</p><span>مسار النمو ←</span></a>
            </div>
          </div>
        </section>`);
      insertAfter(needs, stage);
    }

    if (services) {
      services.classList.add('strategy-existing-section', 'strategy-existing-section--services');
      const context = html(`
        <div class="strategy-cinema-context strategy-cinema-context--floating" data-strategy-services-context>
          <div><span class="strategy-kicker">SERVICES / EDITORIAL COMMERCE</span><strong>استمتع بأسلوب العرض الحالي، أو انتقل مباشرة للخدمة التي تعرفها.</strong><p>لم نحول الصفحة إلى متجر مزدحم؛ أضفنا مسارًا سريعًا للعميل المستعجل مع بقاء الاستعراض البصري كما هو.</p></div>
          <div class="strategy-chip-row"><a href="services.html">كل الخدمات</a><a href="salla.html">خدمات سلة</a><a href="product-page-optimization.html">تحسين صفحة المنتج</a></div>
        </div>`);
      insertBefore(services, context);
    }

    const platformAnchor = tharaa || services;
    if (platformAnchor) {
      const platformSection = html(`
        <section class="strategy-layer strategy-layer--platforms" data-strategy-platforms aria-labelledby="strategyPlatformsTitle">
          <div class="strategy-shell strategy-platform-layout">
            <div class="strategy-platform-copy"><span class="strategy-kicker">PLATFORM EXPERTISE</span><h2 id="strategyPlatformsTitle">نفس الجودة، لكن التنفيذ يحترم حدود كل منصة.</h2><p>صفحات المنصات ليست شعارات تقنية؛ كل صفحة تشرح ما يمكن تنفيذه، وما يحتاج تطبيقًا أو تخصيصًا، وكيف تبدأ.</p>${action('salla.html','استكشف خدمات سلة',true)}${action('ecommerce.html','كل حلول التجارة')}</div>
            <div class="strategy-platform-stack">
              <a href="salla.html"><b>SALLA</b><span>سلة</span><small>إطلاق · تخصيص · صفحة منتج · قياس</small></a>
              <a href="zid.html"><b>ZID</b><span>زد</span><small>تصميم وتجربة وربط ضمن إمكانات المنصة</small></a>
              <a href="shopify.html"><b>SHOPIFY</b><span>Shopify</span><small>تجارة قابلة للتوسع وتجارب مخصصة</small></a>
              <a href="woocommerce.html"><b>WOO</b><span>WooCommerce</span><small>مرونة WordPress وتكاملات أوسع</small></a>
              <a href="wordpress.html"><b>WP</b><span>WordPress</span><small>مواقع ومحتوى وتجارب قابلة للإدارة</small></a>
            </div>
          </div>
        </section>`);
      insertBefore(platformAnchor, platformSection);

      const sallaSpotlight = html(`
        <section class="strategy-salla-spotlight" data-strategy-salla-spotlight>
          <div class="strategy-shell strategy-salla-spotlight__inner">
            <div class="strategy-salla-orbit" aria-hidden="true"><i></i><i></i><i></i><div><span>S</span><small>SALLA</small></div></div>
            <div class="strategy-salla-copy"><span class="strategy-kicker">السوق السعودي أولًا</span><h2>مسار متخصص لمتاجر سلة، من الإطلاق إلى التطوير والنمو.</h2><p>اختيار الحالة، الخدمات، حدود النطاق، طريقة التنفيذ والدعم في صفحة واحدة واضحة — بينما تبقى الرئيسية مساحة العلامة والتجربة.</p><div class="strategy-actions">${action('salla.html','استكشف خدمات سلة',true)}${action('tharaa.html','ثيم ثراء')}</div></div>
          </div>
        </section>`);
      insertBefore(platformAnchor, sallaSpotlight);
    }

    if (tharaa) {
      tharaa.classList.add('strategy-existing-section', 'strategy-existing-section--product');
      const productLabel = html(`
        <div class="strategy-product-context" data-strategy-product-context>
          <div><span class="strategy-kicker">ORIGINAL PRODUCT</span><strong>ثراء منتج مستقل داخل منظومة ابتكار تك.</strong><p>المشهد والموكابات الحالية تبقى هي البطل؛ نضيف فقط سياق القرار: معاينة، دعم، توثيق، وتركيب منفصل.</p></div>
          <div class="strategy-actions">${action('tharaa.html','صفحة ثراء',true)}${action('tharaa.html#v4-preview','المعاينة')}${action('contact.html#quote','تركيب وتخصيص')}</div>
        </div>`);
      insertBefore(tharaa, productLabel);
    }

    if (portfolio) {
      const evidence = html(`
        <div class="strategy-evidence-bar" data-strategy-evidence>
          <div><span class="strategy-kicker">EVIDENCE FIRST</span><strong>الأعمال تُعرض كحالات، لا كصور فقط.</strong></div>
          <p>عند توفر الدليل: المشكلة → ما نفذناه → النتيجة القابلة للإثبات. لا نعرض نسب نمو أو شعارات عملاء بلا مصدر وإذن.</p>
          <a href="portfolio.html">استكشف الأعمال ←</a>
        </div>`);
      insertAfter(portfolio, evidence);
    }

    if (process) {
      const support = html(`
        <div class="strategy-continuity" data-strategy-continuity>
          <span>بعد التسليم</span><strong>التوثيق والدعم والتحسين ليست حاشية في نهاية المشروع.</strong><p>كل مسار يحدد ما يُسلّم، من يملك الحسابات، كيف تتم المراجعات، وما الذي ينتقل إلى دعم أو تحسين مستمر.</p>
        </div>`);
      insertAfter(process, support);
    }

    if (finalCta) {
      const knowledge = html(`
        <section class="strategy-layer strategy-layer--knowledge" data-strategy-home-knowledge>
          <div class="strategy-shell">
            <div class="strategy-compact-head"><div><span class="strategy-kicker">KNOWLEDGE</span><h2>المحتوى يساعد القرار قبل أن يطلب العميل الخدمة.</h2></div><p>مقالات، أدلة، دراسات حالة، FAQ وموارد عملية مرتبطة بسلة والتجارة والهوية والقياس والأنظمة.</p></div>
            <div class="strategy-knowledge-grid"><a href="knowledge.html#articles"><b>01</b><strong>مقالات</strong><span>أسئلة البحث والاختيار</span></a><a href="knowledge.html#guides"><b>02</b><strong>أدلة</strong><span>قبل شراء خدمة أو منتج</span></a><a href="knowledge.html#cases"><b>03</b><strong>دراسات حالة</strong><span>نتائج موثقة عند توفرها</span></a><a href="knowledge.html#faq"><b>04</b><strong>FAQ</strong><span>إجابات قرار سريعة</span></a><a href="knowledge.html#resources"><b>05</b><strong>موارد</strong><span>قوالب وأدوات مجانية مستقبلًا</span></a></div>
          </div>
        </section>`);
      insertBefore(finalCta, knowledge);
    }

    if (faq) faq.classList.add('strategy-existing-section', 'strategy-existing-section--faq');
    if (platforms) platforms.classList.add('strategy-platforms-original');
  }

  function initServiceFilter(root) {
    const search = $('[data-strategy-service-search]', root);
    const buttons = $$('[data-strategy-filter]', root);
    const cards = $$('[data-category]', root);
    let filter = 'all';
    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      cards.forEach((card) => {
        const categories = card.dataset.category || '';
        const haystack = `${card.textContent} ${categories}`.toLowerCase();
        card.hidden = !(filter === 'all' || categories.includes(filter)) || !!(q && !haystack.includes(q));
      });
    };
    search?.addEventListener('input', apply);
    buttons.forEach((button) => button.addEventListener('click', () => {
      filter = button.dataset.strategyFilter || 'all';
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      apply();
    }));
  }

  function initServices() {
    const main = $('main');
    const goalGrid = $('.goal-grid', main);
    if (!main || !goalGrid || $('[data-strategy-service-catalog]')) return;
    const goalSection = sectionOf(goalGrid);
    goalSection?.classList.add('strategy-existing-section', 'strategy-existing-section--goals');

    const catalog = html(`
      <section class="strategy-layer strategy-layer--catalog" data-strategy-service-catalog aria-labelledby="strategyCatalogTitle">
        <div class="strategy-shell">
          <div class="strategy-head"><span class="strategy-kicker">FAST DISCOVERY</span><h2 id="strategyCatalogTitle">المشهد الإبداعي يبقى، والبحث التجاري يختصر الطريق.</h2><p>ثمانية مسارات رئيسية فقط. كل بطاقة تشرح النتيجة والملاءمة وطريقة التسعير دون اختلاق سعر أو مدة غير معتمدة.</p></div>
          <div class="strategy-filterbar" role="search"><input type="search" placeholder="ابحث: متجر، سلة، هوية، SEO، أتمتة..." aria-label="البحث في الخدمات" data-strategy-service-search><button class="is-active" type="button" aria-pressed="true" data-strategy-filter="all">الكل</button><button type="button" aria-pressed="false" data-strategy-filter="commerce">متاجر</button><button type="button" aria-pressed="false" data-strategy-filter="brand">هوية</button><button type="button" aria-pressed="false" data-strategy-filter="growth">نمو</button><button type="button" aria-pressed="false" data-strategy-filter="systems">أنظمة</button></div>
          <div class="strategy-service-catalog">
            <article class="strategy-service-card" data-category="commerce salla"><small>Commerce / Launch</small><h3>إطلاق وتجهيز متجر</h3><p>من اختيار البنية والمنصة إلى الصفحات والهوية والتجهيز والاختبار.</p><div class="meta"><span>جديد</span><span>حسب النطاق</span><span>سلة · زد · Shopify</span></div><a href="ecommerce.html">استكشف المسار ←</a></article>
            <article class="strategy-service-card" data-category="commerce salla"><small>Commerce / UX</small><h3>تطوير واجهة متجر قائم</h3><p>تحسين الهيكل والهوية والجوال دون إعادة بناء غير لازمة.</p><div class="meta"><span>متجر قائم</span><span>حسب الفحص</span></div><a href="salla.html">استكشف التطوير ←</a></article>
            <article class="strategy-service-card" data-category="commerce salla"><small>Conversion UX</small><h3>تحسين صفحة المنتج</h3><p>وضوح المعلومات والثقة والخيارات والشراء على الجوال وسطح المكتب.</p><div class="meta"><span>خدمة مفردة</span><span>نطاق واضح</span></div><a href="product-page-optimization.html">تفاصيل الخدمة ←</a></article>
            <article class="strategy-service-card" data-category="brand"><small>Brand</small><h3>الهوية والمحتوى الرقمي</h3><p>علامة ومحتوى وواجهات متماسكة بدل أصول منفصلة لا تعمل معًا.</p><div class="meta"><span>هوية</span><span>محتوى</span></div><a href="brand-content.html">استكشف المسار ←</a></article>
            <article class="strategy-service-card" data-category="growth"><small>Growth</small><h3>SEO والقياس والتحسين</h3><p>تحليلات وتتبع وظهور وأولويات تحسين مبنية على بيانات حقيقية.</p><div class="meta"><span>SEO</span><span>Analytics</span></div><a href="growth.html">استكشف المسار ←</a></article>
            <article class="strategy-service-card" data-category="systems"><small>Connect</small><h3>الربط والأتمتة</h3><p>تكامل الأنظمة وتقليل العمل اليدوي وتوضيح تدفق البيانات.</p><div class="meta"><span>Integrations</span><span>Automation</span></div><a href="custom-systems.html">استكشف الربط ←</a></article>
            <article class="strategy-service-card" data-category="systems"><small>Build</small><h3>أنظمة وحلول مخصصة</h3><p>لوحات وأدوات وتطبيقات عندما لا تكفي المنصات الجاهزة.</p><div class="meta"><span>Custom</span><span>Discovery first</span></div><a href="custom-systems.html">استكشف الحلول ←</a></article>
            <article class="strategy-service-card strategy-service-card--accent" data-category="commerce salla"><small>Salla Specialist</small><h3>خدمات سلة المتخصصة</h3><p>صفحة مخصصة للتاجر السعودي: حالة المتجر، المسارات، النطاق، الدعم وثراء.</p><div class="meta"><span>سلة</span><span>السعودية</span></div><a href="salla.html">استكشف خدمات سلة ←</a></article>
          </div>
          <div class="strategy-scope-note"><strong>لماذا لا نعرض سعرًا ومدة وهميين؟</strong><p>التقرير يطلب الوضوح، لا التخمين. عندما تعتمد بيانات السعر والمدة نعرضها من مصدر مركزي؛ وحتى ذلك الوقت نظهر نوع التسعير والعوامل التي تغيّر النطاق.</p></div>
        </div>
      </section>`);
    insertAfter(goalSection, catalog);
    initServiceFilter(catalog);
  }

  function initSalla() {
    const main = $('main');
    if (!main || $('[data-strategy-salla-state]')) return;
    const hero = sectionOf($('.platform-hero', main));
    const services = $('#services', main);
    const timeline = sectionOf($('.timeline', main));
    const faq = sectionOf($('.faq-list', main));
    if (!hero || !services) return;

    const state = html(`
      <section class="strategy-layer strategy-layer--salla-state" data-strategy-salla-state aria-labelledby="sallaStateTitle">
        <div class="strategy-shell"><div class="strategy-head"><span class="strategy-kicker">ابدأ من حالة متجرك</span><h2 id="sallaStateTitle">لا تحتاج أن تعرف اسم الخدمة التقنية.</h2><p>اختر الحالة الأقرب، ثم انتقل إلى المسار المناسب داخل الصفحة.</p></div><div class="strategy-stage-grid">
          <a class="strategy-stage-card" href="#services"><i>01</i><h3>أبدأ من الصفر</h3><p>إطلاق وتجهيز متجر جديد.</p><span>مسار الإطلاق ←</span></a>
          <a class="strategy-stage-card" href="#services"><i>02</i><h3>لدي متجر قائم</h3><p>تطوير التصميم والتجربة والجوال.</p><span>مسار التطوير ←</span></a>
          <a class="strategy-stage-card" href="product-page-optimization.html"><i>03</i><h3>لدي مشكلة محددة</h3><p>صفحة منتج أو ثيم أو قياس أو ربط.</p><span>الخدمة المتخصصة ←</span></a>
          <a class="strategy-stage-card" href="growth.html"><i>04</i><h3>جاهز للنمو</h3><p>SEO وقياس وربط وتحسين مستمر.</p><span>مسار النمو ←</span></a>
        </div></div>
      </section>`);
    insertAfter(hero, state);

    const menu = html(`
      <section class="strategy-layer strategy-layer--salla-menu" data-strategy-salla-menu>
        <div class="strategy-shell"><div class="strategy-compact-head"><div><span class="strategy-kicker">SALLA SERVICE MENU</span><h2>سبعة مسارات واضحة بدل عشرات الخدمات الصغيرة.</h2></div><p>السعر والمدة يظهران فور اعتماد البيانات الرسمية. حاليًا نوضح النطاق ونوع التسعير وما يحتاج فحصًا أولًا.</p></div><div class="strategy-service-catalog strategy-service-catalog--salla">
          <article class="strategy-service-card"><small>Launch</small><h3>إطلاق متجر سلة</h3><p>إعداد وهيكل وصفحات وهوية تطبيقية واختبار.</p><div class="meta"><span>متجر جديد</span><span>عرض حسب النطاق</span></div></article>
          <article class="strategy-service-card"><small>Design</small><h3>تطوير واجهة المتجر</h3><p>تحسين الأقسام والهوية والجوال ضمن الثيم.</p><div class="meta"><span>متجر قائم</span><span>بعد فحص الثيم</span></div></article>
          <article class="strategy-service-card"><small>Theme / CSS</small><h3>تخصيص الثيم</h3><p>CSS وواجهات ومكونات بعد مراجعة القيود والتعارضات.</p><div class="meta"><span>احتياج محدد</span><span>حسب قائمة التعديلات</span></div></article>
          <article class="strategy-service-card"><small>Conversion</small><h3>تحسين صفحة المنتج</h3><p>قرار شراء أوضح وثقة وتجربة جوال أفضل.</p><div class="meta"><span>خدمة مفردة</span><span>تشخيص أولًا</span></div><a href="product-page-optimization.html">التفاصيل ←</a></article>
          <article class="strategy-service-card"><small>Connect</small><h3>الربط والتحليلات</h3><p>تتبع وAnalytics وتكاملات حسب ما تسمح به المنصة.</p><div class="meta"><span>قياس</span><span>تكاملات</span></div></article>
          <article class="strategy-service-card"><small>Grow</small><h3>SEO والتحسين</h3><p>ظهور ومحتوى وأولويات تحسين مرتبطة بالبيانات.</p><div class="meta"><span>متجر يعمل</span><span>مشروع/مسار</span></div></article>
          <article class="strategy-service-card strategy-service-card--accent"><small>Support</small><h3>الدعم والتطوير</h3><p>معالجة تغييرات واضحة ومسار تطوير بعد التسليم.</p><div class="meta"><span>نطاق دعم</span><span>اتفاق واضح</span></div></article>
        </div></div>
      </section>`);
    insertAfter(services, menu);

    if (timeline) {
      const evidence = html(`
        <section class="strategy-layer strategy-layer--evidence" data-strategy-salla-evidence>
          <div class="strategy-shell strategy-proof-layout"><div><span class="strategy-kicker">أعمال سلة</span><h2>قبل/بعد وحالات عمل — فقط عندما نستطيع إثباتها.</h2><p>تم تجهيز مكان الحالات داخل الرحلة، لكن لن نختلق أسماء أو نتائج. عند اعتماد 3–5 أعمال، نعرض المشكلة والتدخل والنتيجة والمقياس.</p></div><div class="strategy-proof-placeholder"><span>CASE STUDY SLOT</span><strong>جاهز لبيانات حقيقية</strong><small>المشكلة → التنفيذ → النتيجة</small></div></div>
        </section>`);
      insertBefore(timeline, evidence);
    }

    if (faq) {
      const policy = html(`
        <section class="strategy-layer strategy-layer--scope" data-strategy-salla-scope>
          <div class="strategy-shell"><div class="strategy-head"><span class="strategy-kicker">النطاق والصلاحيات</span><h2>ما نحتاجه منك، وما نحميك منه قبل التنفيذ.</h2></div><div class="strategy-scope-grid"><article><h3>قبل البداية</h3><ul><li>رابط المتجر والثيم الحالي</li><li>الأهداف والصفحات ذات الأولوية</li><li>المحتوى والأصول المتاحة</li><li>التطبيقات والتكاملات الحالية</li></ul></article><article><h3>الصلاحيات</h3><ul><li>أقل صلاحية لازمة للمهمة</li><li>لا نطلب كلمات مرور في النماذج العامة</li><li>تسليم الحسابات والملكية للعميل</li><li>توثيق ما تم تغييره</li></ul></article><article><h3>المراجعات</h3><ul><li>تُحدد في العرض قبل التنفيذ</li><li>أي طلب خارج النطاق يقيّم منفصلًا</li><li>التسليم يمر باختبار جوال وروابط</li><li>الدعم له نطاق وقناة واضحة</li></ul></article></div></div>
        </section>`);
      insertBefore(faq, policy);
    }
  }

  function initSingleService() {
    const main = $('main');
    if (!main || $('[data-strategy-service-decision]')) return;
    const hero = sectionOf($('.hero, .platform-hero, .page-hero', main));
    if (!hero) return;

    const decision = html(`
      <section class="strategy-layer strategy-layer--service-decision" data-strategy-service-decision>
        <div class="strategy-shell strategy-decision">
          <div class="strategy-decision__main"><span class="strategy-kicker">PRODUCTIZED SERVICE</span><h2>قرار الخدمة يجب أن يكون واضحًا قبل أن تقرأ بقية الصفحة.</h2><p>نحافظ على العرض الأصلي للخدمة، ونضيف معلومات القرار المطلوبة في التقرير: الملاءمة، النطاق، غير المشمول، الاعتمادات، وطريقة التسعير.</p><div class="strategy-actions">${action('contact.html#quote','اطلب تقييم الخدمة',true)}${action('services.html','كل الخدمات')}</div></div>
          <aside class="strategy-decision__side"><dl><div><dt>النتيجة</dt><dd>تحسين وضوح صفحة المنتج وتجربة القرار</dd></div><div><dt>مناسبة لـ</dt><dd>متجر قائم يحتاج تحسينًا محددًا</dd></div><div><dt>التسعير</dt><dd>يُثبت بعد فحص الصفحة والثيم</dd></div><div><dt>المدة</dt><dd>تُحدد بعد تثبيت النطاق والاعتمادات</dd></div></dl></aside>
        </div>
      </section>`);
    insertAfter(hero, decision);

    const scope = html(`
      <section class="strategy-layer strategy-layer--scope" data-strategy-service-scope>
        <div class="strategy-shell"><div class="strategy-scope-grid strategy-scope-grid--service"><article><span class="strategy-kicker">مناسبة لك عندما</span><h3>المشكلة في وضوح القرار وتجربة الصفحة.</h3><ul><li>المعلومات مشتتة أو غير مرتبة</li><li>الجوال يحتاج تسلسلًا أوضح</li><li>الثقة والخيارات وCTA تحتاج تنظيمًا</li></ul></article><article><span class="strategy-kicker">ليست بديلًا عن</span><h3>مشكلات تحتاج نطاقًا آخر.</h3><ul><li>إعادة بناء المتجر بالكامل</li><li>إنتاج محتوى أو تصوير غير متفق عليه</li><li>تطوير تطبيقات أو تكاملات خارج الصفحة</li></ul></article><article><span class="strategy-kicker">قبل التنفيذ</span><h3>اعتمادات ومعلومات مطلوبة.</h3><ul><li>رابط الصفحة والثيم الحالي</li><li>الأهداف والملاحظات الحالية</li><li>الصلاحيات اللازمة فقط</li><li>اعتماد النطاق والمراجعات</li></ul></article></div></div>
      </section>`);
    const faq = sectionOf($('.faq, .faq-grid, .faq-list', main));
    if (faq) insertBefore(faq, scope); else main.appendChild(scope);
  }

  function initTharaa() {
    const main = $('main');
    if (!main || $('[data-strategy-tharaa-decision]')) return;
    const hero = sectionOf($('.hero', main));
    if (!hero) return;
    const preview = $('#v4-preview, #preview, [id*="preview"]', main);
    const features = $('#features', main);
    const support = $('#support', main);

    const decision = html(`
      <section class="strategy-layer strategy-layer--tharaa-decision" data-strategy-tharaa-decision aria-labelledby="tharaaDecisionTitle">
        <div class="strategy-shell strategy-decision strategy-decision--product">
          <div class="strategy-decision__main"><span class="strategy-kicker">THARAA / PRODUCT DECISION</span><h2 id="tharaaDecisionTitle">كل المعاينات والمكوّنات الأصلية تبقى. هنا فقط نوضح قرار الشراء.</h2><p>ثراء صفحة منتج مستقلة: وعد متخصص، معاينة، ملاءمة للقطاع، ترخيص، دعم، توثيق، إصدار وسجل تغييرات — مع فصل خدمة التركيب والتخصيص.</p><div class="strategy-actions">${action('#v4-preview','شاهد المعاينة',true)}${action('#features','المزايا')}${action('#support','الدعم')}</div></div>
          <aside class="strategy-decision__side"><dl><div><dt>المنتج</dt><dd>ثيم ثراء</dd></div><div><dt>المنصة</dt><dd>سلة</dd></div><div><dt>السعر الرسمي</dt><dd data-tharaa-price>يظهر عند اعتماد السعر</dd></div><div><dt>التركيب والتخصيص</dt><dd>خدمة منفصلة من ابتكار تك</dd></div></dl><div class="strategy-product-actions">${action('#','الشراء الرسمي',true,'data-tharaa-purchase aria-disabled="true"')}${action('#v4-preview','المعاينة')}</div></aside>
        </div>
      </section>`);
    insertAfter(hero, decision);

    if (preview) {
      const fit = html(`
        <section class="strategy-layer strategy-layer--tharaa-fit" data-strategy-tharaa-fit>
          <div class="strategy-shell"><div class="strategy-compact-head"><div><span class="strategy-kicker">مصمم لمن؟</span><h2>ثراء لا يحاول أن يكون ثيمًا لكل متجر.</h2></div><p>تموضعه الأقوى: متاجر تعتمد على الصورة والهوية والتجربة الراقية، مع تركيز أولي على العطور والعناية والجمال والهدايا.</p></div><div class="strategy-fit-grid"><article><span>01</span><h3>العطور</h3><p>عرض بصري راقٍ ومجموعات وفئات تحتاج هوية قوية.</p></article><article><span>02</span><h3>العناية والجمال</h3><p>صور منتجات وتفاصيل وثقة وتجربة جوال مهمة.</p></article><article><span>03</span><h3>الهدايا الراقية</h3><p>تجربة تحتاج إحساس العلامة أكثر من ازدحام العناصر.</p></article><article><span>04</span><h3>علامات Premium</h3><p>متاجر تريد أن تبدو كعلامة لا كقالب جاهز.</p></article></div></div>
        </section>`);
      insertBefore(preview, fit);
    }

    if (features) {
      const recipes = html(`
        <section class="strategy-layer strategy-layer--recipes" data-strategy-tharaa-recipes>
          <div class="strategy-shell"><div class="strategy-head"><span class="strategy-kicker">LAUNCH RECIPES</span><h2>وصفات إطلاق تساعد التاجر على الوصول إلى نتيجة أسرع.</h2><p>بدل ترك عشرات الإعدادات بدون توجيه، نربط المكونات الأصلية بسيناريوهات استخدام واضحة. هذه ليست قوالب جديدة؛ هي طرق موصى بها لتركيب ما هو موجود.</p></div><div class="strategy-recipe-grid"><article><b>PERFUME</b><h3>إطلاق متجر عطور</h3><p>Hero هادئ → مجموعات → منتجات مختارة → قصة العلامة → ثقة وFAQ.</p></article><article><b>BEAUTY</b><h3>عناية وجمال</h3><p>روابط سريعة → تصنيفات → منتجات → قبل/بعد → شهادات → محتوى تثقيفي.</p></article><article><b>GIFTS</b><h3>هدايا راقية</h3><p>مناسبات → مجموعات → اقتراحات → تغليف → شحن وثقة → CTA واضح.</p></article></div></div>
        </section>`);
      insertAfter(features, recipes);
    }

    const governanceAnchor = support || main.lastElementChild;
    if (governanceAnchor) {
      const governance = html(`
        <section class="strategy-layer strategy-layer--product-governance" data-strategy-tharaa-governance>
          <div class="strategy-shell"><div class="strategy-compact-head"><div><span class="strategy-kicker">PRODUCT CONTINUITY</span><h2>الثيم لا ينتهي عند زر الشراء.</h2></div><p>الدعم، التوثيق، الإصدار وسجل التغييرات جزء من المنتج. لن نظهر بيانات غير معتمدة، لكن النظام جاهز لها.</p></div><div class="strategy-facts"><article class="strategy-fact"><small>الإصدار الحالي</small><strong data-tharaa-version>يظهر عند الاعتماد</strong></article><article class="strategy-fact"><small>آخر تحديث</small><strong data-tharaa-updated>يظهر عند الاعتماد</strong></article><article class="strategy-fact"><small>سجل التغييرات</small><strong>جاهز للربط</strong></article><article class="strategy-fact"><small>الدعم والتوثيق</small><strong>جزء من رحلة المنتج</strong></article></div><div class="strategy-actions strategy-actions--center">${action('#support','الدعم',true)}${action('contact.html#quote','تركيب وتخصيص ثراء')}</div></div>
        </section>`);
      insertBefore(governanceAnchor, governance);
    }

    const cfg = window.IBTIKAR_CONFIG?.products?.tharaa || {};
    const purchase = safeConfigValue(cfg.purchaseUrl);
    const demo = safeConfigValue(cfg.demoUrl);
    const price = safeConfigValue(cfg.price);
    const version = safeConfigValue(cfg.version);
    const updated = safeConfigValue(cfg.lastUpdated);
    const purchaseBtn = $('[data-tharaa-purchase]');
    if (purchaseBtn && purchase) {
      purchaseBtn.href = purchase;
      purchaseBtn.removeAttribute('aria-disabled');
      purchaseBtn.removeAttribute('data-disabled');
    } else if (purchaseBtn) {
      purchaseBtn.dataset.disabled = 'true';
      purchaseBtn.addEventListener('click', (event) => event.preventDefault());
    }
    $$('[data-tharaa-price]').forEach((el) => { if (price) el.textContent = price; });
    $$('[data-tharaa-version]').forEach((el) => { if (version) el.textContent = version; });
    $$('[data-tharaa-updated]').forEach((el) => { if (updated) el.textContent = updated; });
    if (demo) $$('a[href="#v4-preview"]').forEach((a) => { if (a.closest('[data-strategy-tharaa-decision]')) a.href = demo; });
  }

  function initKnowledgeAnchors() {
    if (PATH !== 'knowledge.html') return;
    const main = $('main');
    if (!main || $('[data-strategy-knowledge-types]')) return;
    const firstContent = main.querySelectorAll('section')[1] || main.firstElementChild;
    const types = html(`
      <section class="strategy-layer strategy-layer--knowledge-types" data-strategy-knowledge-types>
        <div class="strategy-shell"><div class="strategy-head"><span class="strategy-kicker">CONTENT SYSTEM</span><h2>خمسة أنواع، ولكل نوع وظيفة في رحلة العميل.</h2></div><div class="strategy-knowledge-grid"><article id="articles"><b>01</b><strong>مقالات</strong><span>أسئلة البحث والاختيار</span></article><article id="guides"><b>02</b><strong>أدلة</strong><span>قرارات ما قبل الشراء</span></article><article id="cases"><b>03</b><strong>دراسات حالة</strong><span>دليل واقعي ونتائج موثقة</span></article><article id="faq"><b>04</b><strong>FAQ</strong><span>إجابات مختصرة عالية النية</span></article><article id="resources"><b>05</b><strong>موارد</strong><span>قوالب وأدوات مجانية</span></article></div></div>
      </section>`);
    if (firstContent) insertAfter(firstContent, types); else main.appendChild(types);
  }

  function init() {
    ensureCss();
    if (PATH === 'index.html' || PATH === '') initHome();
    if (PATH === 'services.html') initServices();
    if (PATH === 'salla.html') initSalla();
    if (PATH === 'product-page-optimization.html') initSingleService();
    if (PATH === 'tharaa.html') initTharaa();
    initKnowledgeAnchors();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
