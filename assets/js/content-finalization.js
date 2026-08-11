(() => {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const $ = (selector, scope = document) => scope.querySelector(selector);

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

  const cleanHomepage = () => {
    if (path !== 'index.html' && path !== '') return;

    // Placeholder testimonials must never look like real social proof in production.
    $('#testimonials')?.remove();

    $$('.command-list .command-item').forEach((button) => {
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.includes('آراء وتجارب العملاء') || text.includes('الباقات والأسعار') || text.includes('أعمالنا المختارة')) {
        button.remove();
      }
    });
  };

  const cleanProductPageService = () => {
    if (path !== 'product-page-optimization.html') return;

    // The approved source page already contains fit/scope/deliverables/exclusions.
    // Remove the later strategy layer that duplicated the same decision content.
    $('[data-strategy-service-decision]')?.remove();
    $('[data-strategy-service-scope]')?.remove();
  };

  const cleanEcommerce = () => {
    if (path !== 'ecommerce.html') return;

    // Keep the stronger Commerce Health Lab; remove the second explanatory layer.
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

    // Remove strategy placeholders that expose missing commercial metadata.
    $('[data-strategy-tharaa-decision]')?.remove();
    $('[data-strategy-tharaa-governance]')?.remove();

    // Avoid unsupported competitor-style claims until they are evidence-backed.
    $('#compare')?.remove();

    // Hidden legacy shell contained unverified support channels.
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

    // Until official documentation/support/changelog metadata is approved, do not present roadmap copy as shipped product facts.
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
    cleanHomepage();
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
