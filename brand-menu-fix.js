(() => {
  ['hero-ratio-fix.css?v=20260727-1', 'hero-proportion-final.css?v=20260727-3'].forEach(href => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  });

  const siteName = '华人婚姻绿卡网';
  const fullTitle = '华人美国婚姻绿卡网｜华人婚姻绿卡网｜美国婚姻绿卡申请与交友';

  document.title = fullTitle;
  document.querySelectorAll('.brand strong').forEach(el => { el.textContent = siteName; });
  document.querySelectorAll('[aria-label="华人婚绿网首页"]').forEach(el => el.setAttribute('aria-label', `${siteName}首页`));

  const loginHeading = document.querySelector('#loginModal h2');
  if (loginHeading) loginHeading.textContent = `登录${siteName}`;

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (!menuToggle || !mainNav) return;

  let backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  const setMenu = open => {
    document.body.classList.toggle('mobile-menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  };

  menuToggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    setMenu(!document.body.classList.contains('mobile-menu-open'));
  });

  backdrop.addEventListener('click', () => setMenu(false));
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });
})();