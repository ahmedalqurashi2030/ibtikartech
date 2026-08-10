(() => {
  const normalize = (value = '') => value.toString().trim().toLowerCase();

  function initCatalog() {
    const root = document.querySelector('[data-service-catalog]');
    if (!root) return;
    const search = document.querySelector('[data-service-search]');
    const buttons = [...document.querySelectorAll('[data-service-filter]')];
    const cards = [...root.querySelectorAll('[data-service-card]')];
    const empty = document.querySelector('[data-catalog-empty]');
    let active = 'all';

    const render = () => {
      const query = normalize(search?.value);
      let visible = 0;
      cards.forEach((card) => {
        const category = normalize(card.dataset.category);
        const platforms = normalize(card.dataset.platforms);
        const haystack = normalize(card.textContent);
        const matchesFilter = active === 'all' || category.includes(active) || platforms.includes(active);
        const matchesQuery = !query || haystack.includes(query);
        const show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });
      empty?.classList.toggle('is-visible', visible === 0);
      empty?.setAttribute('aria-hidden', String(visible !== 0));
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        active = normalize(button.dataset.serviceFilter) || 'all';
        buttons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        render();
      });
    });

    search?.addEventListener('input', render);
    render();
  }

  function readConfig(path) {
    return path.split('.').reduce((value, key) => value?.[key], window.IBTIKAR_CONFIG);
  }

  const isReadyValue = (value) => typeof value === 'string' && value.trim() && !value.includes('[TODO:');

  function initConfigBindings() {
    document.querySelectorAll('[data-config-href]').forEach((link) => {
      const value = readConfig(link.dataset.configHref || '');
      if (isReadyValue(value)) {
        link.href = value;
        link.removeAttribute('aria-disabled');
        link.classList.remove('is-disabled');
        return;
      }
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('is-disabled');
      link.title = 'يتم تفعيل الرابط بعد اعتماد الرابط الرسمي.';
    });

    document.querySelectorAll('[data-config-text]').forEach((node) => {
      const value = readConfig(node.dataset.configText || '');
      if (isReadyValue(value)) {
        node.textContent = value;
        node.classList.remove('is-pending');
      } else {
        node.textContent = node.dataset.pendingText || 'يُعتمد قبل النشر';
        node.classList.add('is-pending');
      }
    });
  }

  const init = () => {
    initCatalog();
    initConfigBindings();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
