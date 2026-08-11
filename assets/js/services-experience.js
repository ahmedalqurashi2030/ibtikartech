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

    const sourceList = lab.querySelector('.service-list');
    if (!sourceList) return;
    const sourceItems = [...sourceList.querySelectorAll('.service-item')];
    sourceList.hidden = true;
    sourceList.setAttribute('aria-hidden','true');

    const toolbar = document.createElement('div');
    toolbar.className = 'services-scenes-toolbar';
    toolbar.innerHTML = `
      <div class="services-scenes-toolbar__copy"><span>DRAG · SWIPE · EXPLORE</span><strong>اختر بطاقة لتغيير المشهد، ثم افتح صفحة الخدمة من زرها.</strong></div>
      <div class="services-scenes-controls" aria-label="أزرار التنقل بين الخدمات">
        <button type="button" data-scenes-prev aria-label="الخدمة السابقة">→</button>
        <button type="button" data-scenes-next aria-label="الخدمة التالية">←</button>
      </div>`;

    const list = document.createElement('div');
    list.className = 'service-list services-scenes-track';
    list.setAttribute('aria-label','التنقل بين مشاهد الخدمات');
    sourceList.before(toolbar,list);

    const cards = sourceItems.map((source,index) => {
      const item = source.cloneNode(true);
      const mode = item.dataset.mode || '';
      const route = sceneRoutes.get(mode) || 'services.html';
      item.classList.toggle('active',index === 0);
      item.classList.add('services-scene-card');
      item.insertAdjacentHTML('afterbegin',thumbMarkup());
      const link = item.querySelector(':scope > a');
      if (link) {
        link.href = route;
        link.textContent = 'استكشف الخدمة ←';
        link.setAttribute('aria-label',`فتح ${item.querySelector('h3')?.textContent?.trim() || 'الخدمة'}`);
      }
      list.appendChild(item);
      return item;
    });

    const shell = lab.querySelector('#visualShell');
    const visualBody = lab.querySelector('#visualBody');
    const stageScreen = lab.querySelector('#stageScreen');
    const stageLabel = lab.querySelector('#stageLabel');
    const stageCount = lab.querySelector('#stageCount');
    const visualTitle = lab.querySelector('#visualTitle');
    const stageCaption = lab.querySelector('#stageCaption');
    let activeIndex = 0;
    let sceneTimer = 0;

    const renderScene = (mode) => {
      if (!shell || !visualBody) return;
      shell.classList.add('switching');
      clearTimeout(sceneTimer);
      sceneTimer = window.setTimeout(() => {
        visualBody.className = 'visual-body';
        let markup = '';
        if (mode === 'store') {
          visualBody.classList.add('store-ui');
          markup = '<div class="store-main"><div class="store-hero"></div><div class="product-row"><i></i><i></i><i></i></div></div><div class="store-side"><i></i><i></i><i></i></div>';
        } else if (mode === 'site') {
          visualBody.classList.add('site-ui');
          markup = '<div class="site-side"></div><div class="site-main"><i></i><i></i><i></i><i></i><i></i></div>';
        } else if (mode === 'app') {
          visualBody.classList.add('app-ui');
          markup = '<div class="phone"><div class="phone-screen"><div class="phone-notch"></div><div class="phone-card"></div><div class="phone-grid"><i></i><i></i><i></i><i></i></div></div></div><span class="api-node">API</span><span class="api-node">Dashboard</span><span class="api-node">Users</span>';
        } else if (mode === 'brand') {
          visualBody.classList.add('brand-ui');
          markup = '<div class="brand-main"><div class="brand-mark"><i></i><i></i><i></i></div></div><div class="palette"><i></i><i></i><i></i><i></i></div>';
        } else if (mode === 'growth') {
          visualBody.classList.add('growth-ui');
          markup = '<div class="metric-row"><i data-v="24"></i><i data-v="38"></i><i data-v="17"></i></div><div class="growth-main"><i style="--h:28%"></i><i style="--h:42%"></i><i style="--h:36%"></i><i style="--h:62%"></i><i style="--h:55%"></i><i style="--h:82%"></i><i style="--h:94%"></i></div>';
        } else {
          visualBody.classList.add('auto-ui');
          markup = '<div class="auto-main"><div class="auto-core">Automation</div><span class="auto-node">Store</span><span class="auto-node">CRM</span><span class="auto-node">WhatsApp</span><span class="auto-node">Analytics</span></div>';
        }
        visualBody.innerHTML = markup;
        if (stageScreen) stageScreen.dataset.mode = mode;
        shell.classList.remove('switching');
      },reducedMotion ? 0 : 180);
    };

    const prev = toolbar.querySelector('[data-scenes-prev]');
    const next = toolbar.querySelector('[data-scenes-next]');
    const syncControls = () => {
      prev.disabled = activeIndex <= 0;
      next.disabled = activeIndex >= cards.length - 1;
    };
    const activate = (index,{scroll = false} = {}) => {
      const safeIndex = Math.max(0,Math.min(cards.length - 1,index));
      const item = cards[safeIndex];
      if (!item) return;
      activeIndex = safeIndex;
      cards.forEach((card,cardIndex) => card.classList.toggle('active',cardIndex === safeIndex));
      if (stageLabel) stageLabel.textContent = item.dataset.label || '';
      if (stageCount) stageCount.textContent = `${String(safeIndex + 1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      if (visualTitle) visualTitle.textContent = item.dataset.title || '';
      if (stageCaption) stageCaption.textContent = item.dataset.caption || '';
      renderScene(item.dataset.mode || 'store');
      syncControls();
      if (scroll) item.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'nearest',inline:'center'});
    };

    cards.forEach((item,index) => {
      item.addEventListener('click',(event) => {
        if (list.dataset.dragMoved === 'true') return;
        if (event.target.closest('a,button,input,select,textarea')) return;
        activate(index,{scroll:true});
      });
    });

    prev.addEventListener('click',()=>activate(activeIndex - 1,{scroll:true}));
    next.addEventListener('click',()=>activate(activeIndex + 1,{scroll:true}));

    let scrollTimer = 0;
    const activateNearest = () => {
      const trackRect = list.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let nearestIndex = activeIndex;
      let nearestDistance = Infinity;
      cards.forEach((card,index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs((rect.left + rect.width / 2) - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      if (nearestIndex !== activeIndex) activate(nearestIndex);
    };
    list.addEventListener('scroll',() => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(activateNearest,90);
    },{passive:true});

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
      window.setTimeout(() => {
        list.dataset.dragMoved = 'false';
        activateNearest();
      },0);
    };
    list.addEventListener('pointerup',endDrag);
    list.addEventListener('pointercancel',endDrag);
    list.addEventListener('click',(event) => {
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
        moved = false;
      }
    },true);

    const directSections = [...main.querySelectorAll(':scope > section')];
    const finalSection = directSections.at(-1);
    if (finalSection && finalSection !== lab) main.insertBefore(lab,finalSection);
    activate(0);
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
