(() => {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const $ = (selector, scope = document) => scope.querySelector(selector);

  const ensureContentCss = () => {
    if (document.querySelector('link[data-content-finalization-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/pages/content-finalization.css';
    link.dataset.contentFinalizationCss = 'true';
    document.head.appendChild(link);
  };
  ensureContentCss();

  const setNoIndex = () => {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,follow';
  };

  const replaceUnverifiedContactLinks = () => {
    $$('a[href]').forEach((link) => {
      const href = (link.getAttribute('href') || '').trim();
      const isFakeWhatsapp = href.includes('wa.me/967000000000');
      const isFakeEmail = href.toLowerCase() === 'mailto:hello@ibtikar-tech.com';
      if (!isFakeWhatsapp && !isFakeEmail) return;

      link.setAttribute('href', 'contact.html#quote');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      const label = (link.textContent || '').trim();
      if (/واتساب|بريد|email|whatsapp/i.test(label)) link.textContent = 'اطلب عرض سعر';
    });
  };

  const normalizeGrowthNaming = () => {
    $$('a, h2, h3, span').forEach((node) => {
      if ((node.textContent || '').trim() === 'التسويق والنمو' && node.children.length === 0) {
        node.textContent = 'الظهور والقياس والنمو';
      }
    });
  };

  const hideUnreadySharedNavigation = () => {
    const shell = $$('.ibt-shell-header, .ibt-shell-mobile-menu, .ibt-shell-footer');
    shell.forEach((root) => {
      $$('a[href="portfolio.html"], a[href="knowledge.html"], a[href="legal.html"]', root).forEach((link) => link.remove());
    });
  };

  const cleanHomepage = () => {
    if (path !== 'index.html' && path !== '') return;

    $('#testimonials')?.remove();

    $$('.command-list .command-item').forEach((button) => {
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.includes('آراء وتجارب العملاء') || text.includes('الباقات والأسعار') || text.includes('أعمالنا المختارة')) {
        button.remove();
      }
    });
  };

  const cleanServices = () => {
    if (path !== 'services.html') return;
    $('[data-strategy-service-catalog]')?.remove();
  };

  const cleanProductPageService = () => {
    if (path !== 'product-page-optimization.html') return;
    $('[data-strategy-service-decision]')?.remove();
    $('[data-strategy-service-scope]')?.remove();
  };

  const cleanEcommerce = () => {
    if (path !== 'ecommerce.html') return;

    $('#store-anatomy')?.remove();
    $$('a[href="#store-anatomy"]').forEach((link) => link.remove());

    $$('p').forEach((paragraph) => {
      const text = (paragraph.textContent || '').trim();
      if (text.includes('ستُبنى عليها بقية صفحات الخدمات') || text.includes('ستبنى عليها بقية صفحات الخدمات')) {
        paragraph.textContent = 'صفحة تحسين تجربة المنتج جزء من منظومة خدمات المتاجر، وتوضح مستوى التفصيل المستخدم في صفحات الخدمات المتخصصة.';
      }
    });
  };

  const cleanTharaa = () => {
    if (path !== 'tharaa.html') return;

    $('[data-strategy-tharaa-decision]')?.remove();
    $('[data-strategy-tharaa-governance]')?.remove();
    $('#compare')?.remove();
    $('footer[data-approved-legacy-shell]')?.remove();

    $$('.library-note').forEach((note) => {
      if ((note.textContent || '').includes('Notion')) {
        note.textContent = 'تظهر لكل مكوّن معاينة بصرية مستقلة توضّح شكل القسم ووظيفته داخل المتجر.';
      }
    });

    $$('.faq-item').forEach((item) => {
      const question = (item.querySelector('button')?.textContent || '').replace(/\s+/g, ' ').trim();
      const answer = item.querySelector('.faq-answer p');
      if (!answer) return;

      if (question.includes('هل يناسب العطور فقط')) {
        answer.textContent = 'ليس حصريًا للعطور، لكن تموضعه الأقوى للمتاجر التي تعتمد على الصورة والهوية وتجربة المنتج، خصوصًا العطور والعناية والجمال والهدايا الراقية.';
      }

      if (question.includes('هل توجد معاينة قبل الطلب')) {
        answer.textContent = 'تعرض الصفحة معاينات تفاعلية للمكوّنات وتجربة الجوال وأساليب التخصيص حتى تتضح طريقة عمل الثيم قبل اتخاذ القرار.';
      }

      if (question.includes('هل يشمل الطلب التركيب والتخصيص')) {
        answer.textContent = 'ترخيص الثيم مستقل عن خدمات التركيب والتخصيص. وعند طلب خدمة إضافية يحدد نطاقها ومخرجاتها بشكل منفصل قبل التنفيذ.';
      }
    });

    const support = $('#support');
    if (support) support.remove();
    $$('a[href="#support"]').forEach((link) => {
      link.setAttribute('href', '#faq');
      if (/دعم|خيارات/.test(link.textContent || '')) link.textContent = 'الأسئلة الشائعة';
    });
  };

  const markUnreadyEditorialPages = () => {
    if (['portfolio.html', 'knowledge.html', 'legal.html'].includes(path)) setNoIndex();
  };

  const apply = () => {
    replaceUnverifiedContactLinks();
    normalizeGrowthNaming();
    hideUnreadySharedNavigation();
    cleanHomepage();
    cleanServices();
    cleanProductPageService();
    cleanEcommerce();
    cleanTharaa();
    markUnreadyEditorialPages();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      apply();
      setTimeout(apply, 80);
    }, { once: true });
  } else {
    apply();
    setTimeout(apply, 80);
  }
})();
