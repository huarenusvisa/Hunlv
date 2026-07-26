// Load the approved visual layers.
['ui-phase1.css?v=20260726-1','ui-phase2.css?v=20260726-1','ui-phase3.css?v=20260726-1'].forEach(href => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  document.head.appendChild(stylesheet);
});

// Match the approved homepage UI copy without changing the page architecture.
const brandTagline = document.querySelector('.brand small');
if (brandTagline) brandTagline.textContent = '专业 · 高效 · 安心';

const eyebrow = document.querySelector('.hero .eyebrow');
if (eyebrow) eyebrow.textContent = '♡ 专注婚姻绿卡 · 助力华人家庭团聚';

const heroTitle = document.querySelector('.hero h1');
if (heroTitle) heroTitle.textContent = '婚姻绿卡申请';

const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
  heroSubtitle.textContent = '从条件评估到获批，一站式婚姻绿卡申请指南。真实模拟提交步骤、专业材料指引，可信赖的社区与交流陪伴您走好每一步。';
}

const heroButtons = document.querySelectorAll('.hero-actions .btn');
const heroButtonLabels = ['开始了解', '立即模拟提交', '律师咨询', '问题留言'];
heroButtons.forEach((button, index) => {
  if (!heroButtonLabels[index]) return;
  const arrow = button.querySelector('span');
  button.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
  });
  button.insertAdjacentText('afterbegin', heroButtonLabels[index]);
  if (!arrow) button.insertAdjacentHTML('beforeend', '<span>→</span>');
});

const proofText = document.querySelector('.social-proof p');
if (proofText) proofText.innerHTML = '<strong>已有 26,476 位用户</strong> 使用婚绿申请指引与材料清单';

// Phase two: reproduce the compact two-row community in the approved UI.
const communityTitle = document.querySelector('.community .section-heading-row h2');
if (communityTitle) communityTitle.textContent = '交友社区';

const profileGrid = document.getElementById('profileGrid');
if (profileGrid && profileGrid.children.length < 10) {
  const extraProfiles = [
    {
      tags:'verified ca', name:'Linda · 31', city:'湾区 · 产品经理', meta:'硕士 · 166cm', labels:['热爱生活','认真交友'],
      image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=560&q=84'
    },
    {
      tags:'verified ny', name:'Kevin · 36', city:'纽约 · 财务分析', meta:'本科 · 179cm', labels:['稳重真诚','喜欢运动'],
      image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=560&q=84'
    },
    {
      tags:'verified ca', name:'Anna · 28', city:'洛杉矶 · 教育行业', meta:'硕士 · 163cm', labels:['阅读旅行','性格开朗'],
      image:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=560&q=84'
    },
    {
      tags:'ny', name:'Daniel · 33', city:'纽约 · 工程行业', meta:'硕士 · 181cm', labels:['摄影徒步','责任感强'],
      image:'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=560&q=84'
    },
    {
      tags:'verified ca', name:'Sophia · 30', city:'加州 · 医疗行业', meta:'本科 · 165cm', labels:['瑜伽美食','真诚沟通'],
      image:'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=560&q=84'
    }
  ];

  extraProfiles.forEach(profile => {
    profileGrid.insertAdjacentHTML('beforeend', `
      <article class="profile-card" data-tags="${profile.tags}">
        <div class="photo-wrap"><img src="${profile.image}" alt="${profile.name} 示例头像" loading="lazy"><span>在线</span></div>
        <div class="profile-info"><h3>${profile.name} <i>✓</i></h3><p>${profile.city}</p><small>${profile.meta}</small><div><em>${profile.labels[0]}</em><em>${profile.labels[1]}</em><button aria-label="喜欢">♡</button></div></div>
      </article>`);
  });
}

const journeyTitle = document.querySelector('.journey .center-heading h2');
if (journeyTitle) journeyTitle.textContent = '模拟提交婚姻绿卡流程';

const journeyIntro = document.querySelector('.journey .center-heading p');
if (journeyIntro) journeyIntro.textContent = '按真实申请顺序了解资格、材料、表格、提交、进度与面谈。';

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.getElementById(button.dataset.open);
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal(modal) {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.matches('[data-close]')) closeModal(modal);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.modal.show').forEach(closeModal);
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.filter;
    document.querySelectorAll('.profile-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && !card.dataset.tags.includes(filter));
    });
  });
});

document.querySelectorAll('.profile-info button').forEach(button => {
  button.addEventListener('click', () => {
    button.textContent = button.textContent === '♡' ? '♥' : '♡';
    button.setAttribute('aria-label', button.textContent === '♥' ? '取消喜欢' : '喜欢');
  });
});

const assessmentForm = document.getElementById('assessmentForm');
const assessmentResult = document.getElementById('assessmentResult');

assessmentForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(assessmentForm);
  const sponsor = data.get('sponsor');
  const location = data.get('location');
  const married = data.get('married');

  let result = '';
  if (married === '尚未结婚') {
    result = sponsor === '美国公民'
      ? '初步方向：可先了解 K-1 未婚夫/妻签证，或结婚后再评估配偶移民路径。'
      : '初步方向：绿卡持有人不能申请 K-1；通常需要结婚后再评估 F2A 配偶移民路径。';
  } else if (location === '美国境内') {
    result = sponsor === '美国公民'
      ? '初步方向：重点评估是否可在美国境内同时递交 I-130、I-130A 与 I-485。'
      : '初步方向：重点查看 F2A 排期、合法身份维持以及当月 USCIS 是否允许使用表B。';
  } else {
    result = '初步方向：通常经过 I-130、NVC、DS-260、体检与美国领事馆面谈。';
  }

  assessmentResult.textContent = `${result} 本结果仅为流程演示，不构成法律意见。`;
  assessmentResult.classList.add('show');
});

document.querySelectorAll('.demo-form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.innerHTML = '<div class="demo-success"><strong>已收到演示提交。</strong><br>正式版本接入数据库和邮件系统后，信息才会实际保存和发送。</div>';
  });
});
