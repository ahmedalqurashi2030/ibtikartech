(() => {
  const headerSlot = document.querySelector('[data-shell-header]');
  const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const platformPages = new Set(['salla.html', 'zid.html', 'shopify.html', 'woocommerce.html', 'wordpress.html']);
  const productPages = new Set(['tharaa.html']);
  const knowledgePages = new Set(['knowledge.html']);
  let section = document.body.dataset.section || '';

  if (platformPages.has(pathname)) section = 'platforms';
  if (productPages.has(pathname)) section = 'products';
  if (knowledgePages.has(pathname)) section = 'knowledge';

  const headerMarkup = [
    '<header class="ibt-shell-header" id="ibtikarSiteHeader" data-ibtikar-header>',
    '<div class="ibt-shell-nav">',
    '<a class="ibt-shell-brand" href="index.html" aria-label="ابتكار تك - الرئيسية">',
    '<span class="ibt-shell-logo" aria-hidden="true"><i></i><i></i><i></i></span>',
    '<span class="ibt-shell-brand-copy"><strong>ابتكار تك</strong><small>للحلول والخدمات الرقمية</small></span></a>',
    '<nav class="ibt-shell-desktop-nav" aria-label="التنقل الرئيسي">',
    '<a class="ibt-shell-nav-link" data-nav-key="home" href="index.html">الرئيسية</a>',

    '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
    '<a class="ibt-shell-nav-link" data-nav-key="services" href="services.html">الحلول والخدمات</a>',
    '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض قائمة الحلول والخدمات" aria-expanded="false" aria-controls="solutionsServicesMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
    '<div class="ibt-shell-mega" id="solutionsServicesMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
    '<a class="ibt-shell-mega-lead" href="services.html#goals"><span>ابدأ من هدفك</span><strong>اختر النتيجة قبل اسم الخدمة</strong><p>أطلق مشروعك، حسّن التجربة، اربط العمليات أو ابدأ مسار النمو.</p></a>',
    '<a class="ibt-shell-mega-link" href="ecommerce.html"><strong>المتاجر الإلكترونية</strong><span>إطلاق وتجربة وقياس عبر المنصات المناسبة.</span></a>',
    '<a class="ibt-shell-mega-link" href="websites.html"><strong>المواقع وصفحات الهبوط</strong><span>حضور رقمي واضح يقود إلى التواصل والتحويل.</span></a>',
    '<a class="ibt-shell-mega-link" href="brand-content.html"><strong>الهوية والمحتوى</strong><span>علامة ومحتوى وواجهات متماسكة.</span></a>',
    '<a class="ibt-shell-mega-link" href="growth.html"><strong>التسويق والنمو</strong><span>SEO وقياس وتحسين مبني على البيانات.</span></a>',
    '<a class="ibt-shell-mega-link" href="custom-systems.html"><strong>الأنظمة والأتمتة</strong><span>حلول مخصصة وربط عمليات وأدوات داخلية.</span></a>',
    '</div></div></div>',

    '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
    '<a class="ibt-shell-nav-link" data-nav-key="platforms" href="salla.html">المنصات</a>',
    '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض قائمة المنصات" aria-expanded="false" aria-controls="platformsMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
    '<div class="ibt-shell-mega" id="platformsMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
    '<a class="ibt-shell-mega-lead" href="salla.html"><span>السوق السعودي أولًا</span><strong>تخصص في منصات التجارة</strong><p>نحدد ما تسمح به المنصة وما يحتاج تخصيصًا قبل الوعد والتنفيذ.</p></a>',
    '<a class="ibt-shell-mega-link" href="salla.html"><strong>Salla — سلة</strong><span>إطلاق، تصميم، تخصيص، قياس ودعم.</span></a>',
    '<a class="ibt-shell-mega-link" href="zid.html"><strong>Zid — زد</strong><span>تجارب متاجر وربط وتحسين ضمن إمكانات المنصة.</span></a>',
    '<a class="ibt-shell-mega-link" href="shopify.html"><strong>Shopify</strong><span>واجهات وتجارب تجارة قابلة للتوسع.</span></a>',
    '<a class="ibt-shell-mega-link" href="woocommerce.html"><strong>WooCommerce</strong><span>متاجر WordPress مرنة وتكاملات مخصصة.</span></a>',
    '<a class="ibt-shell-mega-link" href="wordpress.html"><strong>WordPress</strong><span>مواقع ومحتوى وحلول رقمية قابلة للإدارة.</span></a>',
    '</div></div></div>',

    '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
    '<a class="ibt-shell-nav-link" data-nav-key="products" href="tharaa.html">منتجاتنا</a>',
    '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض منتجات ابتكار تك" aria-expanded="false" aria-controls="productsMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
    '<div class="ibt-shell-mega" id="productsMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
    '<a class="ibt-shell-mega-lead" href="tharaa.html"><span>منتج أصلي من ابتكار تك</span><strong>ثيم ثراء لمتاجر سلة</strong><p>منتج مستقل له معاينة وترخيص ودعم وتوثيق وخدمات تخصيص منفصلة.</p></a>',
    '<a class="ibt-shell-mega-link" href="tharaa.html"><strong>استكشف ثيم ثراء</strong><span>المزايا، الجوال، صفحة المنتج، الترخيص والتحديثات.</span></a>',
    '<a class="ibt-shell-mega-link" href="contact.html#quote"><strong>تركيب وتخصيص ثراء</strong><span>خدمة تنفيذ منفصلة عن ترخيص الثيم حسب نطاق المتجر.</span></a>',
    '</div></div></div>',

    '<a class="ibt-shell-nav-link" data-nav-key="portfolio" href="portfolio.html">أعمالنا</a>',

    '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
    '<a class="ibt-shell-nav-link" data-nav-key="knowledge" href="knowledge.html">المعرفة</a>',
    '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض مركز المعرفة" aria-expanded="false" aria-controls="knowledgeMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
    '<div class="ibt-shell-mega" id="knowledgeMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
    '<a class="ibt-shell-mega-lead" href="knowledge.html"><span>معرفة تساعد القرار</span><strong>من السؤال إلى اختيار أفضل</strong><p>محتوى يشرح الخيارات والقيود قبل شراء خدمة أو منتج.</p></a>',
    '<a class="ibt-shell-mega-link" href="knowledge.html#articles"><strong>المقالات</strong><span>أسئلة البحث والاختيار والتطوير.</span></a>',
    '<a class="ibt-shell-mega-link" href="knowledge.html#guides"><strong>الأدلة</strong><span>خطوات عملية قبل التنفيذ والشراء.</span></a>',
    '<a class="ibt-shell-mega-link" href="knowledge.html#cases"><strong>دراسات الحالة</strong><span>مشكلة، تدخل ونتيجة قابلة للإثبات.</span></a>',
    '<a class="ibt-shell-mega-link" href="knowledge.html#faq"><strong>الأسئلة الشائعة</strong><span>إجابات مباشرة على الاحتكاكات المتكررة.</span></a>',
    '<a class="ibt-shell-mega-link" href="knowledge.html#resources"><strong>الموارد</strong><span>قوالب وأدوات مجانية عند اعتمادها.</span></a>',
    '</div></div></div>',

    '<a class="ibt-shell-nav-link" data-nav-key="about" href="about.html">عن ابتكار</a>',
    '</nav>',
    '<div class="ibt-shell-actions">',
    '<a class="ibt-shell-cta" href="contact.html#quote">اطلب عرض سعر</a>',
    '<button class="ibt-shell-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="ibtikarMobileMenu" data-ibt-menu-toggle><span></span><span></span><span></span></button>',
    '</div></div></header>',

    '<nav class="ibt-shell-mobile-menu" id="ibtikarMobileMenu" aria-label="قائمة الجوال" aria-hidden="true">',
    '<a data-nav-key="home" href="index.html">الرئيسية</a>',
    '<details class="ibt-shell-mobile-group"><summary>الحلول والخدمات</summary><a href="services.html#goals">ابدأ من هدفك</a><a href="ecommerce.html">المتاجر الإلكترونية</a><a href="websites.html">المواقع وصفحات الهبوط</a><a href="brand-content.html">الهوية والمحتوى</a><a href="growth.html">التسويق والنمو</a><a href="custom-systems.html">الأنظمة والأتمتة</a></details>',
    '<details class="ibt-shell-mobile-group"><summary>المنصات</summary><a href="salla.html">سلة</a><a href="zid.html">زد</a><a href="shopify.html">Shopify</a><a href="woocommerce.html">WooCommerce</a><a href="wordpress.html">WordPress</a></details>',
    '<details class="ibt-shell-mobile-group"><summary>منتجاتنا</summary><a href="tharaa.html">ثيم ثراء</a><a href="contact.html#quote">تركيب وتخصيص ثراء</a></details>',
    '<a data-nav-key="portfolio" href="portfolio.html">أعمالنا</a>',
    '<details class="ibt-shell-mobile-group"><summary>المعرفة</summary><a href="knowledge.html">مركز المعرفة</a><a href="knowledge.html#articles">المقالات</a><a href="knowledge.html#guides">الأدلة</a><a href="knowledge.html#cases">دراسات الحالة</a><a href="knowledge.html#faq">الأسئلة الشائعة</a><a href="knowledge.html#resources">الموارد</a></details>',
    '<a data-nav-key="about" href="about.html">عن ابتكار</a>',
    '<a href="contact.html#support">الدعم</a>',
    '<a class="ibt-shell-mobile-cta ibt-shell-cta" href="contact.html#quote">اطلب عرض سعر</a>',
    '</nav>'
  ].join('');

  const footerMarkup = [
    '<footer class="ibt-shell-footer">',
    '<div class="ibt-shell-footer-grid">',
    '<div class="ibt-shell-footer-main"><a class="ibt-shell-brand" href="index.html"><span class="ibt-shell-logo" aria-hidden="true"><i></i><i></i><i></i></span><span class="ibt-shell-brand-copy"><strong>ابتكار تك</strong><small>للحلول والخدمات الرقمية</small></span></a><p>نبني علامات وتجارب ومنتجات رقمية متكاملة تساعد المشاريع على الإطلاق والعمل والنمو.</p></div>',
    '<div><h3>الحلول والخدمات</h3><a href="services.html#goals">ابدأ من هدفك</a><a href="ecommerce.html">المتاجر الإلكترونية</a><a href="brand-content.html">الهوية والمحتوى</a><a href="growth.html">التسويق والنمو</a></div>',
    '<div><h3>المنصات</h3><a href="salla.html">سلة</a><a href="zid.html">زد</a><a href="shopify.html">Shopify</a><a href="woocommerce.html">WooCommerce</a></div>',
    '<div><h3>منتجاتنا</h3><a href="tharaa.html">ثيم ثراء</a><a href="contact.html#quote">تركيب وتخصيص ثراء</a><a href="contact.html#support">الدعم</a></div>',
    '<div><h3>ابتكار تك</h3><a href="portfolio.html">أعمالنا</a><a href="knowledge.html">المعرفة</a><a href="about.html">عن ابتكار</a><a href="legal.html">السياسات</a></div>',
    '</div>',
    '<div class="ibt-shell-footer-bottom"><span>© <span id="year"></span> ابتكار تك. جميع الحقوق محفوظة.</span><div><a href="contact.html#quote">طلب عرض سعر</a><a href="contact.html#support">قنوات التواصل والدعم</a></div></div>',
    '</footer>'
  ].join('');

  if (headerSlot) {
    headerSlot.insertAdjacentHTML('afterend', headerMarkup);
    headerSlot.remove();
  }

  const injectFooter = () => {
    const footerSlot = document.querySelector('[data-shell-footer]');
    if (!footerSlot) return false;
    footerSlot.insertAdjacentHTML('afterend', footerMarkup);
    footerSlot.remove();
    document.querySelectorAll('#year').forEach((item) => { item.textContent = new Date().getFullYear(); });
    return true;
  };

  if (!injectFooter() && document.readyState === 'loading') {
    const footerObserver = new MutationObserver(() => {
      if (injectFooter()) footerObserver.disconnect();
    });
    footerObserver.observe(document.body, { childList: true });
    document.addEventListener('DOMContentLoaded', () => {
      footerObserver.disconnect();
      injectFooter();
    }, { once: true });
  }

  document.querySelectorAll('[data-nav-key]').forEach((link) => {
    const active = link.dataset.navKey === section;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
  });
})();
