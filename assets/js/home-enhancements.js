(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);

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

  function initHome() {
    const main = $('main');
    if (!main || $('[data-strategy-home-v3]')) return;

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
    document.body.dataset.strategyHomeV3 = 'true';

    const promise = html(`
      <section class="strategy-layer strategy-layer--home-intro" data-strategy-home-v3 aria-labelledby="strategyPromiseTitle">
        <div class="strategy-shell">
          <div class="strategy-compact-head">
            <div><span class="strategy-kicker">BUILD · BRAND · CONNECT · GROW</span><h2 id="strategyPromiseTitle">منظومة واحدة، ونقطة البداية تتغير حسب هدفك.</h2></div>
            <p>الرئيسية تشرح ابتكار تك كمنظومة متكاملة. التفاصيل التخصصية تبقى داخل صفحات التصنيفات مثل المتاجر الإلكترونية والمواقع والهوية.</p>
          </div>
          <div class="strategy-outcome-rail" aria-label="مسارات ابتكار تك">
            <a href="services.html#goals"><b>01</b><span><strong>أطلق</strong><small>متجر، موقع أو منتج رقمي</small></span></a>
            <a href="brand-content.html"><b>02</b><span><strong>ابنِ علامتك</strong><small>هوية ومحتوى وتجربة متماسكة</small></span></a>
            <a href="custom-systems.html"><b>03</b><span><strong>اربط</strong><small>الأنظمة والبيانات والعمليات</small></span></a>
            <a href="growth.html"><b>04</b><span><strong>نمِّ</strong><small>SEO وقياس وتحسين مستمر</small></span></a>
          </div>
        </div>
      </section>`);
    insertAfter(hero, promise);

    if (needs) {
      needs.classList.add('strategy-existing-section', 'strategy-existing-section--goals');
      const stage = html(`
        <section class="strategy-layer strategy-layer--stage" data-strategy-stage>
          <div class="strategy-shell">
            <div class="strategy-head"><span class="strategy-kicker">أين أنت الآن؟</span><h2>مرحلة مشروعك تحدد نقطة البداية، لا اسم الخدمة.</h2><p>هذا القسم عام لكل ابتكار تك: مشروع جديد، مشروع قائم، مشكلة محددة، أو مرحلة توسع.</p></div>
            <div class="strategy-stage-grid">
              <a href="services.html#goals" class="strategy-stage-card"><i>01</i><h3>فكرة أو مشروع جديد</h3><p>نحدد الحل المناسب والبنية والمنصة والنطاق.</p><span>ابدأ من الهدف ←</span></a>
              <a href="services.html#goals" class="strategy-stage-card"><i>02</i><h3>مشروع قائم يحتاج تطويرًا</h3><p>نراجع الوضع الحالي ونرتب الأولويات.</p><span>استكشف الحلول ←</span></a>
              <a href="contact.html#quote" class="strategy-stage-card"><i>03</i><h3>مشكلة محددة</h3><p>نحوّل المشكلة إلى نطاق تنفيذ مركز.</p><span>اطلب تشخيصًا ←</span></a>
              <a href="growth.html" class="strategy-stage-card"><i>04</i><h3>جاهز للتوسع</h3><p>قياس وربط وتحسين يساعد على اتخاذ قرارات أفضل.</p><span>مسار النمو ←</span></a>
            </div>
          </div>
        </section>`);
      insertAfter(needs, stage);
    }

    if (services) {
      services.classList.add('strategy-existing-section', 'strategy-existing-section--services');
      const context = html(`
        <div class="strategy-cinema-context strategy-cinema-context--floating" data-strategy-services-context>
          <div><span class="strategy-kicker">SERVICES / EXPERIENCE</span><strong>استكشف المنظومة بصريًا، ثم ادخل إلى التصنيف الذي يهمك.</strong><p>الرئيسية تعرض العائلات فقط؛ التفاصيل مثل السرعة والجوال وصفحة المنتج والمنصات تبقى في صفحة المتاجر الإلكترونية.</p></div>
          <div class="strategy-chip-row"><a href="services.html">كل الحلول والخدمات</a><a href="ecommerce.html">المتاجر الإلكترونية</a><a href="websites.html">المواقع</a><a href="brand-content.html">الهوية والمحتوى</a></div>
        </div>`);
      insertBefore(services, context);
    }

    if (tharaa) {
      tharaa.classList.add('strategy-existing-section', 'strategy-existing-section--product');
      const productLabel = html(`
        <div class="strategy-product-context" data-strategy-product-context>
          <div><span class="strategy-kicker">ORIGINAL PRODUCT</span><strong>ثراء منتج مستقل داخل منظومة ابتكار تك.</strong><p>يبقى له حضور واضح في الرئيسية لأنه منتج مملوك لابتكار تك، بينما تفاصيل المتاجر وخدمات سلة تبقى في صفحاتها المتخصصة.</p></div>
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
      const continuity = html(`
        <div class="strategy-continuity" data-strategy-continuity>
          <span>بعد التسليم</span><strong>التوثيق والدعم والتحسين جزء من الرحلة.</strong><p>الرئيسية تذكر المبدأ فقط؛ نطاق الدعم الفعلي يظهر في صفحة الخدمة أو المنتج المعني.</p>
        </div>`);
      insertAfter(process, continuity);
    }

    if (finalCta) {
      const knowledge = html(`
        <section class="strategy-layer strategy-layer--knowledge" data-strategy-home-knowledge>
          <div class="strategy-shell">
            <div class="strategy-compact-head"><div><span class="strategy-kicker">KNOWLEDGE</span><h2>المعرفة تساعد القرار قبل التواصل.</h2></div><p>مقالات وأدلة ودراسات حالة وFAQ وموارد مرتبطة بالحلول والمنتجات، دون تحويل الرئيسية إلى مركز محتوى كامل.</p></div>
            <div class="strategy-knowledge-grid"><a href="knowledge.html#articles"><b>01</b><strong>مقالات</strong><span>أسئلة البحث والاختيار</span></a><a href="knowledge.html#guides"><b>02</b><strong>أدلة</strong><span>قبل شراء خدمة أو منتج</span></a><a href="knowledge.html#cases"><b>03</b><strong>دراسات حالة</strong><span>نتائج موثقة عند توفرها</span></a><a href="knowledge.html#faq"><b>04</b><strong>FAQ</strong><span>إجابات قرار سريعة</span></a><a href="knowledge.html#resources"><b>05</b><strong>موارد</strong><span>قوالب وأدوات مستقبلية</span></a></div>
          </div>
        </section>`);
      insertBefore(finalCta, knowledge);
    }

    if (faq) faq.classList.add('strategy-existing-section', 'strategy-existing-section--faq');
    if (platforms) platforms.classList.add('strategy-platforms-original');
  }

  function init() {
    ensureCss();
    initHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
