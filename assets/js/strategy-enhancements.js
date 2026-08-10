(() => {
  const PATH = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function ensureCss() {
    if (document.querySelector('link[data-strategy-enhancements]')) return;
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

  function action(href, label, primary = false) {
    return `<a class="strategy-action${primary ? ' strategy-action--primary' : ''}" href="${href}">${label}</a>`;
  }

  function enhanceHome() {
    const servicesCinema = document.querySelector('.services-cinema');
    const tharaaCinema = document.querySelector('.tharaa-cinema');
    if (!servicesCinema && !tharaaCinema) return;

    if (servicesCinema && !document.querySelector('[data-strategy-home-router]')) {
      const router = html(`
        <section class="strategy-layer strategy-layer--soft" data-strategy-home-router aria-labelledby="strategyHomeTitle">
          <div class="strategy-shell">
            <div class="strategy-head">
              <span class="strategy-kicker">ابدأ من النتيجة</span>
              <h2 id="strategyHomeTitle">اختر ما تريد تحقيقه، ثم دع المشهد يشرح كيف ننفذه</h2>
              <p>المشهد السينمائي الأصلي يبقى جزءًا أساسيًا من تجربة ابتكار تك؛ أضفنا قبله طبقة قرار تساعد العميل على فهم المسار قبل الدخول في الاستعراض البصري للخدمات.</p>
            </div>
            <div class="strategy-grid">
              <article class="strategy-card"><small>BUILD</small><h3>أطلق مشروعك</h3><p>متجر، موقع أو منتج رقمي يحتاج نقطة بداية واضحة وتنفيذًا منظمًا.</p><a href="services.html#goals">ابدأ مسار الإطلاق</a></article>
              <article class="strategy-card"><small>BRAND</small><h3>حسّن التجربة والعلامة</h3><p>طوّر الواجهة، المحتوى والهوية حتى تبدو التجربة كعلامة لا كقالب.</p><a href="brand-content.html">استكشف الهوية والتجربة</a></article>
              <article class="strategy-card"><small>CONNECT</small><h3>اربط العمليات</h3><p>تكاملات، أتمتة وأنظمة تقلل العمل اليدوي وتوضح تدفق البيانات.</p><a href="custom-systems.html">استكشف الربط والأتمتة</a></article>
              <article class="strategy-card"><small>GROW</small><h3>نمِّ مشروعك</h3><p>SEO وقياس وتحسين مستمر مبني على ما يحدث فعليًا داخل المشروع.</p><a href="growth.html">استكشف النمو والقياس</a></article>
            </div>
          </div>
        </section>`);
      insertBefore(servicesCinema, router);

      const context = html(`
        <div class="strategy-cinema-context" data-strategy-services-context>
          <div><strong>المشهد السينمائي للخدمات</strong><p>نحافظ عليه ونستخدمه لشرح المنظومة بصريًا بدل استبداله بقائمة بطاقات تقليدية.</p></div>
          <div class="strategy-chip-row"><a href="services.html">كل الخدمات</a><a href="salla.html">خدمات سلة</a><a href="contact.html#quote">اطلب تشخيص مشروعك</a></div>
        </div>`);
      insertBefore(servicesCinema, context);

      const bridge = html(`
        <section class="strategy-bridge" data-strategy-services-bridge>
          <div class="strategy-bridge__inner"><div><h3>أعجبك المسار؟ حوّل المشهد إلى نطاق تنفيذ واضح</h3><p>انتقل من الاستعراض إلى صفحة الخدمات التي توضح الملاءمة والنطاق وطريقة الطلب.</p></div><div class="strategy-actions">${action('services.html','استكشف الحلول والخدمات',true)}${action('contact.html#quote','اطلب عرض سعر')}</div></div>
        </section>`);
      insertAfter(servicesCinema, bridge);
    }

    if (tharaaCinema && !document.querySelector('[data-strategy-tharaa-home-context]')) {
      const context = html(`
        <div class="strategy-cinema-context" data-strategy-tharaa-home-context>
          <div><strong>ثراء منتج أصلي من ابتكار تك</strong><p>المشهد الحالي يبقى كما هو، ونضيف له سياقًا يوضح أنه منتج مستقل له تجربة ومعاينة ودعم وخدمة تخصيص منفصلة.</p></div>
          <div class="strategy-chip-row"><a href="tharaa.html">صفحة ثراء</a><a href="tharaa.html#v4-preview">المعاينة</a><a href="tharaa.html#support">الدعم</a></div>
        </div>`);
      insertBefore(tharaaCinema, context);

      const bridge = html(`
        <section class="strategy-bridge" data-strategy-tharaa-home-bridge>
          <div class="strategy-bridge__inner"><div><h3>استكشف ثراء كتجربة كاملة، لا كبطاقة داخل الرئيسية</h3><p>صفحة المنتج تحافظ على المعاينات والمكونات الأصلية وتضيف طبقة قرار أوضح حولها.</p></div><div class="strategy-actions">${action('tharaa.html','استكشف ثيم ثراء',true)}${action('contact.html#quote','تركيب وتخصيص ثراء')}</div></div>
        </section>`);
      insertAfter(tharaaCinema, bridge);
    }
  }

  function enhanceServices() {
    const goals = document.querySelector('#goals');
    if (!goals || document.querySelector('[data-strategy-service-catalog]')) return;
    const catalog = html(`
      <section class="strategy-layer" data-strategy-service-catalog aria-labelledby="strategyCatalogTitle">
        <div class="strategy-shell">
          <div class="strategy-head"><span class="strategy-kicker">اكتشاف الخدمات</span><h2 id="strategyCatalogTitle">احتفظنا بالمشهد والتجربة الأصلية، وأضفنا طبقة بحث وقرار</h2><p>هذه الطبقة لا تستبدل الأقسام الموجودة؛ تساعد العميل الذي يعرف ما يريد على الوصول للخدمة مباشرة.</p></div>
          <div class="strategy-filterbar"><input type="search" placeholder="ابحث: متجر، سلة، هوية، SEO، أتمتة..." aria-label="البحث في الخدمات" data-strategy-service-search><button class="is-active" data-strategy-filter="all">الكل</button><button data-strategy-filter="commerce">متاجر</button><button data-strategy-filter="brand">هوية</button><button data-strategy-filter="growth">نمو</button><button data-strategy-filter="systems">أنظمة</button></div>
          <div class="strategy-service-catalog">
            <article class="strategy-service-card" data-category="commerce salla"><small>Commerce</small><h3>إطلاق وتطوير المتاجر</h3><p>بناء أو تطوير تجربة متجر من الهيكل إلى القياس.</p><div class="meta"><span>سلة</span><span>زد</span><span>Shopify</span></div><a href="ecommerce.html">عرض المسار ←</a></article>
            <article class="strategy-service-card" data-category="commerce salla"><small>Conversion UX</small><h3>تحسين صفحة المنتج</h3><p>تحسين وضوح القرار والثقة وتجربة الجوال في الصفحة.</p><div class="meta"><span>متجر قائم</span><span>صفحة منتج</span></div><a href="product-page-optimization.html">تفاصيل الخدمة ←</a></article>
            <article class="strategy-service-card" data-category="brand"><small>Brand</small><h3>الهوية والمحتوى</h3><p>توحيد العلامة والمحتوى والواجهات عبر نقاط الاتصال.</p><div class="meta"><span>هوية</span><span>محتوى</span></div><a href="brand-content.html">عرض المسار ←</a></article>
            <article class="strategy-service-card" data-category="growth"><small>Grow</small><h3>SEO والقياس والنمو</h3><p>قياس وتحسين مبني على بيانات حقيقية بدل التخمين.</p><div class="meta"><span>SEO</span><span>Analytics</span></div><a href="growth.html">عرض المسار ←</a></article>
            <article class="strategy-service-card" data-category="systems"><small>Connect</small><h3>الأنظمة والأتمتة</h3><p>ربط العمليات والبيانات وبناء الأدوات المخصصة عند الحاجة.</p><div class="meta"><span>تكاملات</span><span>أتمتة</span></div><a href="custom-systems.html">عرض المسار ←</a></article>
            <article class="strategy-service-card" data-category="commerce salla brand"><small>Salla</small><h3>خدمات سلة المتخصصة</h3><p>مسار خاص للتاجر السعودي من الإطلاق حتى التطوير والنمو.</p><div class="meta"><span>سلة</span><span>السوق السعودي</span></div><a href="salla.html">استكشف سلة ←</a></article>
          </div>
        </div>
      </section>`);
    insertAfter(goals, catalog);
    initServiceFilter(catalog);
  }

  function initServiceFilter(root) {
    const search = root.querySelector('[data-strategy-service-search]');
    const buttons = [...root.querySelectorAll('[data-strategy-filter]')];
    const cards = [...root.querySelectorAll('[data-category]')];
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
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    }));
  }

  function enhanceTharaa() {
    const main = document.querySelector('main');
    if (!main || document.querySelector('[data-strategy-tharaa-decision]')) return;
    const hero = main.querySelector('.hero');
    const trust = main.querySelector('.trust-strip');
    const preview = main.querySelector('#v4-preview, #preview, [id*="preview"]');
    const features = main.querySelector('#features');
    const support = main.querySelector('#support');

    const decision = html(`
      <section class="strategy-layer strategy-layer--soft" data-strategy-tharaa-decision aria-labelledby="tharaaDecisionTitle">
        <div class="strategy-shell strategy-decision">
          <div class="strategy-decision__main"><span class="strategy-kicker">صفحة قرار المنتج</span><h2 id="tharaaDecisionTitle">نحافظ على المعاينات والمكوّنات الأصلية، ونوضح قرار ثراء حولها</h2><p>ثراء يبقى تجربة بصرية غنية كما صُمم أصلًا. الإضافة هنا تنظّم ما يحتاجه المشتري: الملاءمة، المعاينة، الدعم، الترخيص وخدمة التركيب والتخصيص المنفصلة.</p><div class="strategy-actions">${action('#v4-preview','شاهد المعاينة',true)}${action('#features','استكشف المزايا')}${action('#support','الدعم')}</div></div>
          <aside class="strategy-decision__side" aria-label="معلومات قرار ثراء"><dl><div><dt>نوع العرض</dt><dd>منتج رقمي مستقل</dd></div><div><dt>المنصة</dt><dd>متاجر سلة</dd></div><div><dt>الشراء والترخيص</dt><dd>يُعرض عبر القناة الرسمية المعتمدة</dd></div><div><dt>التركيب والتخصيص</dt><dd>خدمة منفصلة من ابتكار تك</dd></div></dl>${action('contact.html#quote','اطلب تخصيص ثراء')}</aside>
        </div>
      </section>`);
    if (trust) insertAfter(trust, decision); else if (hero) insertAfter(hero, decision); else main.prepend(decision);

    if (preview && !document.querySelector('[data-strategy-preview-context]')) {
      const previewContext = html(`<div class="strategy-cinema-context" data-strategy-preview-context><div><strong>المعاينة الأصلية هي مركز قرار الشراء</strong><p>لم نحذفها أو نستبدلها؛ نستخدمها لإثبات تجربة الرئيسية وصفحة المنتج والجوال قبل الانتقال للمزايا.</p></div><div class="strategy-chip-row"><a href="#product">صفحة المنتج</a><a href="#features">المزايا</a><a href="#request">اطلب المعاينة</a></div></div>`);
      insertBefore(preview, previewContext);
    }

    if (features && !document.querySelector('[data-strategy-feature-context]')) {
      const featureContext = html(`<div class="strategy-cinema-context" data-strategy-feature-context><div><strong>المزايا تبقى كما صُممت</strong><p>نرتبها ذهنيًا حول تجربة الجوال، صفحة المنتج، المرونة، الهوية والثقة بدل اختصارها إلى قائمة عامة.</p></div><div class="strategy-chip-row"><span>Mobile-first</span><span>Product UX</span><span>RTL</span><span>Customization</span></div></div>`);
      insertBefore(features, featureContext);
    }

    if (support && !document.querySelector('[data-strategy-support-bridge]')) {
      const supportBridge = html(`<section class="strategy-bridge" data-strategy-support-bridge><div class="strategy-bridge__inner"><div><h3>المنتج لا ينتهي عند المعاينة</h3><p>الدعم، التوثيق والتخصيص عناصر مستقلة عن تجربة الثيم نفسها وتكمل قرار العميل.</p></div><div class="strategy-actions">${action('#support','الدعم',true)}${action('contact.html#quote','تركيب وتخصيص')}</div></div></section>`);
      insertBefore(support, supportBridge);
    }
  }

  function enhanceServiceDetail() {
    const main = document.querySelector('main');
    if (!main || document.querySelector('[data-strategy-service-decision]')) return;
    const firstSection = main.querySelector('section');
    if (!firstSection) return;
    const layer = html(`
      <section class="strategy-layer strategy-layer--soft" data-strategy-service-decision>
        <div class="strategy-shell strategy-decision"><div class="strategy-decision__main"><span class="strategy-kicker">قرار الخدمة</span><h2>نضيف الوضوح التجاري دون حذف شرح الخدمة أو أمثلتها الأصلية</h2><p>الخدمة المفردة يجب أن تجيب بسرعة: لمن تناسب، ماذا تعالج، ما النطاق، وما الذي يحتاج مراجعة قبل تثبيت السعر والمدة.</p><div class="strategy-actions">${action('contact.html#quote','اطلب تشخيص الخدمة',true)}${action('services.html','كل الحلول والخدمات')}</div></div><aside class="strategy-decision__side"><dl><div><dt>التسعير</dt><dd>بعد مراجعة النطاق</dd></div><div><dt>المدة</dt><dd>تثبت بعد المتطلبات</dd></div><div><dt>المراجعات</dt><dd>تحدد في عرض التنفيذ</dd></div><div><dt>القياس</dt><dd>بحسب البيانات المتاحة</dd></div></dl></aside></div>
      </section>`);
    insertAfter(firstSection, layer);
  }

  function init() {
    ensureCss();
    if (PATH === 'index.html' || PATH === '') enhanceHome();
    if (PATH === 'services.html') enhanceServices();
    if (PATH === 'tharaa.html') enhanceTharaa();
    if (PATH === 'product-page-optimization.html') enhanceServiceDetail();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
