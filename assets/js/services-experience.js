(() => {
  'use strict';

  if (!document.body.classList.contains('source-services')) return;
  if (window.__ibtikarServicesExperienceV3) return;
  window.__ibtikarServicesExperienceV3 = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  if (!main) return;

  const SERVICE_FAMILIES = [
    {
      mode: 'store',
      index: '01',
      eyebrow: 'COMMERCE',
      title: 'المتاجر الإلكترونية',
      description: 'إطلاق وتطوير تجربة متجر واضحة من الواجهة وصفحة المنتج حتى القياس والتحسين.',
      href: 'ecommerce.html',
      tags: ['إطلاق', 'تخصيص', 'CRO']
    },
    {
      mode: 'site',
      index: '02',
      eyebrow: 'WEB',
      title: 'المواقع وصفحات الهبوط',
      description: 'مواقع شركات وصفحات هبوط سريعة ومنظمة توضّح القيمة وتقود إلى الإجراء.',
      href: 'websites.html',
      tags: ['Web', 'Landing', 'Content']
    },
    {
      mode: 'app',
      index: '03',
      eyebrow: 'PRODUCTS',
      title: 'التطبيقات والأنظمة المخصصة',
      description: 'منتجات ولوحات وأنظمة رقمية مبنية حول العمليات الحقيقية للمشروع.',
      href: 'custom-systems.html',
      tags: ['Apps', 'Dashboards', 'APIs']
    },
    {
      mode: 'brand',
      index: '04',
      eyebrow: 'BRAND',
      title: 'الهوية والمحتوى',
      description: 'هوية بصرية ولفظية ومحتوى يحافظ على اتساق العلامة عبر نقاط الاتصال.',
      href: 'brand-content.html',
      tags: ['Brand', 'Identity', 'Content']
    },
    {
      mode: 'growth',
      index: '05',
      eyebrow: 'GROWTH',
      title: 'الظهور والقياس والنمو',
      description: 'SEO وتتبع وقياس وتحسين مستمر يساعد على اتخاذ قرارات مبنية على البيانات.',
      href: 'growth.html',
      tags: ['SEO', 'GA4', 'Optimization']
    },
    {
      mode: 'auto',
      index: '06',
      eyebrow: 'AUTOMATION',
      title: 'الربط والأتمتة',
      description: 'ربط الأنظمة والقنوات والبيانات لتقليل العمل اليدوي ورفع كفاءة التشغيل.',
      href: 'custom-systems.html',
      tags: ['Automation', 'Webhooks', 'CRM']
    }
  ];

  function moveBeforeFinalSection(section) {
    const directSections = [...main.children].filter((node) => node.tagName === 'SECTION');
    const finalSection = directSections.at(-1);
    if (finalSection && finalSection !== section && section.nextElementSibling !== finalSection) {
      main.insertBefore(section, finalSection);
    }
  }

  function enhancePrimaryCinema() {
    const lab = main.querySelector('.service-lab');
    if (!lab || lab.dataset.primaryCinemaReady === 'true') return;
    lab.dataset.primaryCinemaReady = 'true';
    lab.classList.add('services-primary-cinema');
    lab.id = 'services';

    const heading = lab.querySelector('.heading');
    const kicker = heading?.querySelector('.kicker');
    const title = heading?.querySelector('h2');
    const description = heading?.querySelector('p');
    if (kicker) kicker.textContent = 'مشاهد الخدمات الإبداعية';
    if (title) title.textContent = 'ستة محاور رئيسية. مشهد واحد يتبدل معك.';
    if (description) description.textContent = 'مرّر بين المحاور الستة؛ يبقى المشهد ثابتًا ويتحوّل بصريًا مع كل خدمة، بينما يشرح النص ما الذي نقدمه وأين تبدأ.';

    const items = [...lab.querySelectorAll('.service-item')];
    items.forEach((item, index) => {
      const family = SERVICE_FAMILIES[index];
      if (!family) return;
      const link = item.querySelector(':scope > a');
      if (link) {
        link.href = family.href;
        link.textContent = `استكشف ${family.title} ←`;
      }
    });

    if (!heading || heading.querySelector('.cinema-chapters')) return;

    const chapters = document.createElement('nav');
    chapters.className = 'cinema-chapters';
    chapters.setAttribute('aria-label', 'التنقل بين الخدمات الرئيسية');
    chapters.innerHTML = SERVICE_FAMILIES.map((family, index) => `
      <button type="button" data-cinema-chapter="${index}" aria-current="${index === 0 ? 'true' : 'false'}">
        <span>${family.index}</span><b>${family.title}</b>
      </button>`).join('');
    heading.appendChild(chapters);

    const buttons = [...chapters.querySelectorAll('[data-cinema-chapter]')];
    const setActive = (activeItem) => {
      const activeIndex = Math.max(0, items.indexOf(activeItem));
      buttons.forEach((button, index) => button.setAttribute('aria-current', String(index === activeIndex)));
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const item = items[index];
        if (!item) return;
        item.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      });
    });

    const activeObserver = new MutationObserver(() => {
      const active = items.find((item) => item.classList.contains('active')) || items[0];
      if (active) setActive(active);
    });
    items.forEach((item) => activeObserver.observe(item, { attributes: true, attributeFilter: ['class'] }));
    if (items[0]) setActive(items[0]);
  }

  function buildFastDiscoverySlides(track) {
    track.innerHTML = SERVICE_FAMILIES.map((family) => `
      <article class="fast-discovery-slide" data-family="${family.mode}">
        <div class="fast-discovery-slide__top">
          <span class="fast-discovery-slide__number">${family.index}</span>
          <small>${family.eyebrow}</small>
        </div>
        <div class="fast-discovery-slide__visual" aria-hidden="true">
          <i></i><i></i><i></i><i></i>
        </div>
        <h3>${family.title}</h3>
        <p>${family.description}</p>
        <div class="fast-discovery-slide__tags">${family.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <a href="${family.href}">فتح صفحة الخدمة <span aria-hidden="true">←</span></a>
      </article>`).join('');
  }

  function enhanceFastDiscovery(catalogSection) {
    if (!catalogSection || catalogSection.dataset.fastDiscoveryReady === 'true') return;
    catalogSection.dataset.fastDiscoveryReady = 'true';
    catalogSection.id = 'fast-discovery';
    catalogSection.classList.add('fast-discovery-slider');

    const heading = catalogSection.querySelector('.strategy-head');
    const kicker = heading?.querySelector('.strategy-kicker');
    const title = heading?.querySelector('h2');
    const description = heading?.querySelector('p');
    if (kicker) kicker.textContent = 'FAST DISCOVERY';
    if (title) title.textContent = 'الخدمات الرئيسية في شرائح سريعة.';
    if (description) description.textContent = 'هذا القسم للاكتشاف السريع فقط: اسحب الشرائح أو استخدم الأسهم، ثم افتح صفحة الخدمة. التفاصيل والمشهد الإبداعي موجودان في القسم السينمائي أعلاه.';

    // FAST DISCOVERY is intentionally a simple slider, not a search/catalog or cinematic scene.
    catalogSection.querySelector('.strategy-filterbar')?.remove();
    catalogSection.querySelector('.strategy-scope-note')?.remove();

    const track = catalogSection.querySelector('.strategy-service-catalog');
    if (!track) return;
    track.className = 'fast-discovery-track';
    track.setAttribute('aria-label', 'شرائح الخدمات الرئيسية');
    track.tabIndex = 0;
    buildFastDiscoverySlides(track);

    const controls = document.createElement('div');
    controls.className = 'fast-discovery-controls';
    controls.innerHTML = `
      <div class="fast-discovery-controls__status" aria-live="polite"><b data-fast-current>01</b><span>/ 06</span></div>
      <div class="fast-discovery-controls__actions" aria-label="التنقل بين الشرائح">
        <button type="button" data-fast-prev aria-label="الشريحة السابقة">→</button>
        <button type="button" data-fast-next aria-label="الشريحة التالية">←</button>
      </div>`;
    track.before(controls);

    const slides = [...track.querySelectorAll('.fast-discovery-slide')];
    let activeIndex = 0;
    let dragMoved = false;

    const visibleWidth = () => slides[0]?.getBoundingClientRect().width || 320;
    const syncActive = () => {
      if (!slides.length) return;
      const rect = track.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let nearest = 0;
      let nearestDistance = Infinity;
      slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const distance = Math.abs(slideRect.left + slideRect.width / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      activeIndex = nearest;
      slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeIndex));
      controls.querySelector('[data-fast-current]').textContent = String(activeIndex + 1).padStart(2, '0');
      controls.querySelector('[data-fast-prev]').disabled = activeIndex === 0;
      controls.querySelector('[data-fast-next]').disabled = activeIndex === slides.length - 1;
    };

    const goTo = (index) => {
      activeIndex = Math.max(0, Math.min(slides.length - 1, index));
      slides[activeIndex]?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      });
      window.setTimeout(syncActive, reducedMotion ? 0 : 260);
    };

    controls.querySelector('[data-fast-prev]').addEventListener('click', () => goTo(activeIndex - 1));
    controls.querySelector('[data-fast-next]').addEventListener('click', () => goTo(activeIndex + 1));

    let scrollTimer = 0;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(syncActive, 80);
    }, { passive: true });

    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      dragMoved = false;
      track.classList.add('is-dragging');
      try { track.setPointerCapture(pointerId); } catch (_) {}
    });
    track.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 5) dragMoved = true;
      if (dragMoved) track.scrollLeft = startScroll - delta;
    });
    const endDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      try { track.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
      track.classList.remove('is-dragging');
      window.setTimeout(syncActive, 30);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (event) => {
      if (!dragMoved) return;
      event.preventDefault();
      event.stopPropagation();
      dragMoved = false;
    }, true);

    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex + 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex - 1);
      }
    });

    // Avoid accidental auto-cinema behavior: no autoplay, canvas or sticky state is attached here.
    track.style.setProperty('--fast-slide-width', `${Math.round(visibleWidth())}px`);
    moveBeforeFinalSection(catalogSection);
    syncActive();
  }

  enhancePrimaryCinema();

  const syncFastDiscovery = () => {
    const catalog = main.querySelector('[data-strategy-service-catalog]');
    if (catalog) enhanceFastDiscovery(catalog);
  };

  syncFastDiscovery();
  const observer = new MutationObserver(() => syncFastDiscovery());
  observer.observe(main, { childList: true, subtree: true });
})();
