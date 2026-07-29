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
  const contentRoutes = {
    '婚绿知识': 'knowledge-center.html?category=婚绿知识',
    '材料清单': 'knowledge-center.html?category=材料清单',
    '模拟提交': 'knowledge-center.html?category=模拟提交',
    '成功案例': 'knowledge-center.html?category=成功案例',
    '常见问题': 'knowledge-center.html?category=常见问题'
  };

  if (mainNav) {
    mainNav.querySelectorAll('a').forEach(link => {
      const label = (link.textContent || '').trim();
      if (contentRoutes[label]) link.href = contentRoutes[label];
    });
  }

  document.querySelectorAll('.knowledge a').forEach(link => {
    link.href = 'knowledge-center.html?category=婚绿知识';
  });

  const knowledgeSection = document.querySelector('.knowledge');
  if (knowledgeSection && !knowledgeSection.querySelector('.auto-publish-note')) {
    const style = document.createElement('style');
    style.textContent = `
      .auto-publish-note{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 22px;padding:16px 18px;border:1px solid #e8c47d;border-radius:16px;background:#fffaf0;color:#5c4b2d}
      .auto-publish-note strong{color:#0d4b40;font-size:18px}.auto-publish-note span{color:#8a7652}.auto-publish-note a{flex:0 0 auto;text-decoration:none;color:#fff!important;background:#0d4b40;border-radius:10px;padding:10px 15px;font-weight:700}
      @media(max-width:760px){.auto-publish-note{align-items:flex-start;flex-direction:column}.auto-publish-note a{width:100%;text-align:center}}
    `;
    document.head.appendChild(style);
    const note = document.createElement('div');
    note.className = 'auto-publish-note';
    note.innerHTML = '<div><strong>今日自动发布 150 条婚绿内容</strong><br><span>婚绿知识、材料清单、模拟提交、成功案例、常见问题，每类30条，无需人工审核。</span></div><a href="knowledge-center.html">进入自动内容中心 →</a>';
    const grid = knowledgeSection.querySelector('.knowledge-grid');
    if (grid) knowledgeSection.insertBefore(note, grid);
  }

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
