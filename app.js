// Load the approved phase-one visual layer.
const phaseOneStyles = document.createElement('link');
phaseOneStyles.rel = 'stylesheet';
phaseOneStyles.href = 'ui-phase1.css?v=20260726-1';
document.head.appendChild(phaseOneStyles);

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
