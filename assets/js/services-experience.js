(() => {
  if (!document.body.classList.contains('source-services')) return;
  if (window.__ibtikarServicesExperience) return;
  window.__ibtikarServicesExperience = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  if (!main) return;

  const sceneRoutes = new Map([
    ['store','ecommerce.html'],
    ['site','websites.html'],
    ['app','custom-systems.html'],
    ['brand','brand-content.html'],
    ['growth','growth.html'],
    ['auto','custom-systems.html']
  ]);

  const thumbMarkup = () => `
    <div class="services-scene-thumb" aria-hidden="true">
      <div class="scene-mini-window">
        <div class="scene-mini-bar"><i></i><i></i><i></i></div>
        <div class="scene-mini-body"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
    </div>`;

  function placeCreativeLab() {
    const lab = main.querySelector('.service-lab');
    if (!lab || lab.dataset.carouselReady === 'true') return;
    lab.dataset.carouselReady = 'true';
    lab.classList.add('services-scenes-carousel');
    lab.id = 'creative-scenes';

    const heading = lab.querySelector('.heading');
    const kicker = heading?.querySelector('.kicker');
    const title = heading?.querySelector('h2');
    const description = heading?.querySelector('p');
    if (kicker) kicker.textContent = 'مشاهد الخدمات الإبداعية';
    if (title) title.textContent = 'اسحب بين الخدمات وشاهد كيف يتغير المشهد.';
    if (description) description.textContent = 'ستة مشاهد تفاعلية تختصر طريقة تفكيرنا في كل مجال. اسحب البطاقات أو استخدم الأسهم، واختر بطاقة لتبديل المشهد قبل فتح تفاصيل الخدمة.';

    const list = lab.querySelector('.service-list');
    if (!list) return;
    list.classList.add('services-scenes-track');
    list.setAttribute('aria-label','التنقل بين مشاهد الخدمات');

    const toolbar = document.createElement('div');
    toolbar.className = 'services-scenes-toolbar';
    toolbar.innerHTML = `
      <div class="services-scenes-toolbar__copy"><span>DRAG · SWIPE · EXPLORE</span><strong>اختر بطاقة لتغيير المشهد، ثم افتح صفحة الخدمة من زرها.</strong></div>
      <div class="services-scenes-controls" aria-label="أزرار التنقل بين الخدمات">
        <button type="button" data-scenes-prev aria-label="الخدمة السابقة">←</button>
        <button type="button" data-scenes-next aria-label="الخدمة التالية">→</button>
      </div>`;
    list.before(toolbar);

    const items = [...list.querySelectorAll('.service-item')];
    items.forEach((item) => {
      const mode = item.dataset.mode || '';
      const route = sceneRoutes.get(mode) || 'services.html';
      item.classList.add('services-scene-card');
      if (!item.querySelector('.services-scene-thumb')) item.insertAdjacentHTML('afterbegin',thumbMarkup());

      const link = item.querySelector(':scope > a');
      if (link) {
        link.href = route;
        link.textContent = 'استكشف الخدمة ←';
        link.setAttribute('aria-label',`فتح ${item.querySelector('h3')?.textContent?.trim() || 'الخدمة'}`);
      }

      item.addEventListener('click',(event) => {
        if (list.dataset.dragMoved === 'true') return;
        if (event.target.closest('a,button,input,select,textarea')) return;
        item.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'nearest',inline:'center'});
      });
    });

    const prev = toolbar.querySelector('[data-scenes-prev]');
    const next = toolbar.querySelector('[data-scenes-next]');
    const cardStep = () => {
      const first = list.querySelector('.services-scene-card');
      return first ? first.getBoundingClientRect().width + 16 : Math.max(320,list.clientWidth * .75);
    };
    const updateControls = () => {
      const max = Math.max(0,list.scrollWidth - list.clientWidth - 2);
      if (document.dir === 'rtl') {
        const logical = Math.abs(list.scrollLeft);
        prev.disabled = logical <= 2;
        next.disabled = logical >= max - 2;
      } else {
        prev.disabled = list.scrollLeft <= 2;
        next.disabled = list.scrollLeft >= max - 2;
      }
    };
    const scrollCards = (direction) => {
      const delta = cardStep() * direction;
      list.scrollBy({left: document.dir === 'rtl' ? -delta : delta,behavior:reducedMotion?'auto':'smooth'});
    };
    prev.addEventListener('click',()=>scrollCards(-1));
    next.addEventListener('click',()=>scrollCards(1));
    list.addEventListener('scroll',()=>requestAnimationFrame(updateControls),{passive:true});
    addEventListener('resize',updateControls,{passive:true});

    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    list.addEventListener('pointerdown',(event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = list.scrollLeft;
      moved = false;
      list.dataset.dragMoved = 'false';
      list.classList.add('is-dragging');
      list.setPointerCapture(pointerId);
    });
    list.addEventListener('pointermove',(event) => {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 6) moved = true;
      if (moved) {
        list.dataset.dragMoved = 'true';
        list.scrollLeft = startScroll - delta;
      }
    });
    const endDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      try { list.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
      list.classList.remove('is-dragging');
      window.setTimeout(()=>{ list.dataset.dragMoved = 'false'; },0);
    };
    list.addEventListener('pointerup',endDrag);
    list.addEventListener('pointercancel',endDrag);
    list.addEventListener('click',(event) => {
      if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
    },true);

    const directSections = [...main.querySelectorAll(':scope > section')];
    const finalSection = directSections.at(-1);
    if (finalSection && finalSection !== lab) main.insertBefore(lab,finalSection);
    updateControls();
  }

  const catalogRoutes = [
    [/إطلاق وتجهيز متجر/, 'ecommerce.html'],
    [/تطوير واجهة متجر قائم/, 'storefront-customization.html'],
    [/تحسين صفحة المنتج/, 'product-page-optimization.html'],
    [/الهوية والمحتوى الرقمي/, 'brand-content.html'],
    [/SEO والقياس والتحسين/, 'growth.html'],
    [/الربط والأتمتة/, 'custom-systems.html'],
    [/أنظمة وحلول مخصصة/, 'custom-systems.html'],
    [/خدمات سلة المتخصصة|حلول سلة ضمن المتاجر الإلكترونية/, 'ecommerce.html#platforms']
  ];

  function enhanceMainServiceCards(scope = document) {
    const catalog = scope.matches?.('[data-strategy-service-catalog]') ? scope : scope.querySelector?.('[data-strategy-service-catalog]');
    const targetCatalog = catalog || document.querySelector('[data-strategy-service-catalog]');
    if (targetCatalog) targetCatalog.id = 'services';

    document.querySelectorAll('[data-strategy-service-catalog] .strategy-service-card').forEach((card) => {
      if (card.dataset.wholeCardLink === 'true') return;
      const heading = card.querySelector('h3')?.textContent?.trim() || '';
      const match = catalogRoutes.find(([pattern]) => pattern.test(heading));
      const fallback = card.querySelector('a')?.getAttribute('href') || 'services.html';
      const href = match?.[1] || fallback;
      const link = card.querySelector('a');
      if (link) link.href = href;
      card.dataset.wholeCardLink = 'true';
      card.addEventListener('click',(event) => {
        if (event.target.closest('a,button,input,select,textarea')) return;
        location.href = href;
      });
    });
  }

  placeCreativeLab();
  enhanceMainServiceCards();

  const observer = new MutationObserver((mutations) => {
    let shouldSync = false;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches?.('[data-strategy-service-catalog]') || node.querySelector?.('[data-strategy-service-catalog]')) shouldSync = true;
      }
    }
    if (shouldSync) enhanceMainServiceCards();
  });
  observer.observe(main,{childList:true,subtree:true});
})();
