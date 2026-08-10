(() => {
  const headerSlot = document.querySelector('[data-shell-header]');
  const section = document.body.dataset.section || '';

  const headerMarkup = [
    '<header class="ibt-shell-header" id="ibtikarSiteHeader" data-ibtikar-header>',
    '<div class="ibt-shell-nav">',
    '<a class="ibt-shell-brand" href="index.html" aria-label="ابتكار تك - الرئيسية">',
    '<span class="ibt-shell-logo" aria-hidden="true"><i></i><i></i><i></i></span>',
    '<span class="ibt-shell-brand-copy"><strong>ابتكار تك</strong><small>للحلول والخدمات الرقمية</small></span></a>',
    '<nav class="ibt-shell-desktop-nav" aria-label="التنقل الرئيسي">',
    '<a class="ibt-shell-nav-link" data-nav-key="home" href="index.html">الرئيسية</a>',
    '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
    '<a class="ibt-shell-nav-link" data-nav-key="solutions" href="services.html#solutions">الحلول</a>',
    '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض قائمة الحلول" aria-expanded="false" aria-controls="solutionsMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
    '<div class="ibt-shell-mega" id="solutionsMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
    '<a class="ibt-shell-mega-lead" href="services.html#goals"><span>ابدأ من هدفك</span><strong>مسار واضح قبل اختيار الخدمة</strong><p>نربط الاحتياج بالحل المناسب دون قائمة خدمات مشتتة.</p></a>',
    '<a class="ibt-shell-mega-link" href="ecommerce.html"><strong>إطلاق أو تطوير متجر</strong><span>تجربة تجارة متكاملة من الواجهة حتى القياس.</span></a>',
    '<a class="ibt-shell-mega-link" href="websites.html"><strong>حضور الشركات</strong><span>مواقع وصفحات هبوط ورسالة واضحة تقود للتواصل.</span></a>',
    '<a class="ibt-shell-mega-link" href="growth.html"><strong>النمو والقياس</strong><span>SEO وتحليلات وتحسين مستمر مبني على البيانات.</span></a>',
    '</div></div></div>',
    '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
    '<a class="ibt-shell-nav-link" data-nav-key="services" href="services.html">الخدمات</a>',
    '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض قائمة الخدمات" aria-expanded="false" aria-controls="servicesMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
    '<div class="ibt-shell-mega" id="servicesMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid ibt-shell-mega-grid--services">',
    '<a class="ibt-shell-mega-lead" href="services.html"><span>منظومة الخدمات</span><strong>ستة محاور، تجربة واحدة</strong><p>استراتيجية وتصميم وتقنية وربط ونمو ضمن نطاق واضح.</p></a>',
    '<a class="ibt-shell-mega-link" href="ecommerce.html"><strong>المتاجر الإلكترونية</strong><span>سلة وزد وWooCommerce وShopify.</span></a>',
    '<a class="ibt-shell-mega-link" href="brand-content.html"><strong>الهوية والمحتوى</strong><span>هوية رقمية ومحتوى وواجهات متماسكة.</span></a>',
    '<a class="ibt-shell-mega-link" href="custom-systems.html"><strong>الأنظمة والأتمتة</strong><span>تطبيقات ولوحات وربط عمليات وأدوات.</span></a>',
    '</div></div></div>',
    '<a class="ibt-shell-nav-link" data-nav-key="tharaa" href="tharaa.html">ثيم ثراء</a>',
    '<a class="ibt-shell-nav-link" data-nav-key="portfolio" href="portfolio.html">أعمالنا</a>',
    '<a class="ibt-shell-nav-link" data-nav-key="about" href="about.html">عن ابتكار</a>',
    '</nav>',
    '<div class="ibt-shell-actions">',
    '<a class="ibt-shell-cta" href="contact.html#quote">ابدأ مشروعك</a>',
    '<button class="ibt-shell-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="ibtikarMobileMenu" data-ibt-menu-toggle><span></span><span></span><span></span></button>',
    '</div></div></header>',
    '<nav class="ibt-shell-mobile-menu" id="ibtikarMobileMenu" aria-label="قائمة الجوال" aria-hidden="true">',
    '<a data-nav-key="home" href="index.html">الرئيسية</a>',
    '<details class="ibt-shell-mobile-group"><summary>الحلول</summary><a href="services.html#goals">ابدأ من هدفك</a><a href="ecommerce.html">حلول المتاجر</a><a href="websites.html">حضور الشركات</a><a href="growth.html">النمو والقياس</a></details>',
    '<details class="ibt-shell-mobile-group"><summary>الخدمات</summary><a href="services.html">جميع الخدمات</a><a href="brand-content.html">الهوية والمحتوى</a><a href="custom-systems.html">الأنظمة والأتمتة</a></details>',
    '<a data-nav-key="tharaa" href="tharaa.html">ثيم ثراء</a>',
    '<a data-nav-key="portfolio" href="portfolio.html">أعمالنا</a>',
    '<a data-nav-key="about" href="about.html">عن ابتكار</a>',
    '<a href="contact.html#support">الدعم</a>',
    '<a class="ibt-shell-mobile-cta ibt-shell-cta" href="contact.html#quote">ابدأ مشروعك</a>',
    '</nav>'
  ].join('');

  const footerMarkup = [
    '<footer class="ibt-shell-footer">',
    '<div class="ibt-shell-footer-grid">',
    '<div class="ibt-shell-footer-main"><a class="ibt-shell-brand" href="index.html"><span class="ibt-shell-logo" aria-hidden="true"><i></i><i></i><i></i></span><span class="ibt-shell-brand-copy"><strong>ابتكار تك</strong><small>للحلول والخدمات الرقمية</small></span></a><p>نبني علامات وتجارب ومنتجات رقمية متكاملة تساعد المشاريع على الظهور والعمل والنمو.</p></div>',
    '<div><h3>الحلول</h3><a href="services.html#goals">ابدأ من هدفك</a><a href="ecommerce.html">حلول المتاجر</a><a href="websites.html">حضور الشركات</a><a href="growth.html">النمو والقياس</a></div>',
    '<div><h3>الخدمات</h3><a href="services.html">جميع الخدمات</a><a href="brand-content.html">الهوية والمحتوى</a><a href="custom-systems.html">الأنظمة والأتمتة</a><a href="product-page-optimization.html">تحسين صفحة المنتج</a></div>',
    '<div><h3>المنصات</h3><a href="salla.html">سلة</a><a href="zid.html">زد</a><a href="woocommerce.html">WooCommerce</a><a href="shopify.html">Shopify</a></div>',
    '<div><h3>ابتكار تك</h3><a href="about.html">عن ابتكار</a><a href="portfolio.html">أعمالنا</a><a href="contact.html#support">الدعم</a><a href="legal.html">السياسات</a></div>',
    '</div>',
    '<div class="ibt-shell-footer-bottom"><span>© <span id="year"></span> ابتكار تك. جميع الحقوق محفوظة.</span><div><a href="contact.html#quote">طلب عرض سعر</a><a href="mailto:hello@ibtikar-tech.com">hello@ibtikar-tech.com</a></div></div>',
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