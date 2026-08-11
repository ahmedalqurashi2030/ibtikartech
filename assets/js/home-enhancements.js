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

  function insertAfter(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target.nextSibling);
  }

  function insertBefore(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target);
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
    const tharaa = sectionOf($('.tharaa-section, #tharaa, .thx', main));
    const faq = sectionOf($('.faq-grid', main));

    if (!hero) return;
    document.body.dataset.strategyHomeV3 = 'true';
    hero.dataset.strategyHomeV3 = 'true';

    // Keep one useful decision layer only: the visitor's current stage.
    if (needs && !$('[data-strategy-stage]', main)) {
      needs.classList.add('strategy-existing-section', 'strategy-existing-section--goals');
      const stage = html(`
        <section class="strategy-layer strategy-layer--stage" data-strategy-stage>
          <div class="strategy-shell">
            <div class="strategy-head"><span class="strategy-kicker">أين أنت الآن؟</span><h2>ابدأ من حالة مشروعك، ثم نحدد الخدمة المناسبة.</h2><p>لا تحتاج أن تعرف الاسم التقني للحل. اختر الحالة الأقرب، وانتقل مباشرة إلى المسار المناسب.</p></div>
            <div class="strategy-stage-grid">
              <a href="services.html#goals" class="strategy-stage-card"><i>01</i><h3>أطلق مشروعًا جديدًا</h3><p>متجر، موقع أو منتج رقمي يحتاج نقطة بداية واضحة.</p><span>ابدأ من الهدف ←</span></a>
              <a href="services.html#goals" class="strategy-stage-card"><i>02</i><h3>طوّر مشروعًا قائمًا</h3><p>نراجع الوضع الحالي ونرتب ما يستحق التحسين أولًا.</p><span>استكشف الحلول ←</span></a>
              <a href="contact.html#quote" class="strategy-stage-card"><i>03</i><h3>حل مشكلة محددة</h3><p>صفحة، تجربة، ربط أو قياس يحتاج نطاقًا مركزًا.</p><span>ابدأ الطلب ←</span></a>
              <a href="growth.html" class="strategy-stage-card"><i>04</i><h3>حسّن الظهور والقياس</h3><p>SEO وبيانات وتحسينات تساعد على اتخاذ قرار أفضل.</p><span>مسار النمو ←</span></a>
            </div>
          </div>
        </section>`);
      insertAfter(needs, stage);
    }

    // Preserve the cinematic service presentation without adding another explanatory block.
    if (services) services.classList.add('strategy-existing-section', 'strategy-existing-section--services');

    // Tharaa remains a product highlight; keep the cross-link focused on the product itself.
    if (tharaa && !$('[data-strategy-product-context]', main)) {
      tharaa.classList.add('strategy-existing-section', 'strategy-existing-section--product');
      const productLabel = html(`
        <div class="strategy-product-context" data-strategy-product-context>
          <div><span class="strategy-kicker">ORIGINAL PRODUCT</span><strong>ثيم ثراء — منتج من ابتكار تك لمتاجر سلة.</strong><p>ثيم يركز على الهوية وتجربة المنتج والجوال للمتاجر التي تعتمد على الصورة والعرض الراقي.</p></div>
          <div class="strategy-actions">${action('tharaa.html','استكشف ثيم ثراء',true)}</div>
        </div>`);
      insertBefore(tharaa, productLabel);
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
