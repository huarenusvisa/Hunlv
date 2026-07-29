(() => {
  [
    'hero-ratio-fix.css?v=20260727-1',
    'hero-proportion-final.css?v=20260727-3',
    'homepage-layout-cleanup.css?v=20260727-1',
    'warm-border-accent.css?v=20260727-1'
  ].forEach(href => {
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

  const mainNav = document.getElementById('mainNav');
  if (mainNav && !mainNav.querySelector('a[href="user-center.html"]')) {
    const userLink = document.createElement('a');
    userLink.href = 'user-center.html';
    userLink.textContent = '用户中心';
    mainNav.appendChild(userLink);
  }

  document.querySelectorAll('.community .section-heading-row a, .community a').forEach(link => {
    if ((link.textContent || '').includes('查看更多')) link.href = 'users.html';
  });

  const community = document.querySelector('.community');
  if (community && !community.querySelector('.community-demo-notice')) {
    const notice = document.createElement('p');
    notice.className = 'community-demo-notice';
    notice.textContent = '当前人物资料为功能示例，不代表真实注册用户。真实资料仅展示本人提交、授权并审核通过的用户。';
    const grid = community.querySelector('.profile-grid');
    if (grid) community.insertBefore(notice, grid);
  }

  document.querySelectorAll('.community .profile-card').forEach(card => {
    card.setAttribute('data-profile-status', 'demo');
    card.setAttribute('aria-label', '示例用户资料');
    card.querySelectorAll('.photo-wrap span').forEach(status => { status.textContent = '示例'; });
  });

  const menuToggle = document.getElementById('menuToggle');
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
