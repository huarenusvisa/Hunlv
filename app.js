// Load the approved visual layers.
[
  'ui-phase1.css?v=20260726-1',
  'ui-phase2.css?v=20260726-1',
  'ui-phase3.css?v=20260726-1',
  'ui-phase4.css?v=20260726-1'
].forEach(href => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  document.head.appendChild(stylesheet);
});

// Approved homepage copy.
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

// Compact two-row community.
const communityTitle = document.querySelector('.community .section-heading-row h2');
if (communityTitle) communityTitle.textContent = '交友社区';

const profileGrid = document.getElementById('profileGrid');
if (profileGrid && profileGrid.children.length < 10) {
  const extraProfiles = [
    {tags:'verified ca',name:'Linda · 31',city:'湾区 · 产品经理',meta:'硕士 · 166cm',labels:['热爱生活','认真交友'],image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=86'},
    {tags:'verified ny',name:'Kevin · 36',city:'纽约 · 财务分析',meta:'本科 · 179cm',labels:['稳重真诚','喜欢运动'],image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=86'},
    {tags:'verified ca',name:'Anna · 28',city:'洛杉矶 · 教育行业',meta:'硕士 · 163cm',labels:['阅读旅行','性格开朗'],image:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=86'},
    {tags:'ny',name:'Daniel · 33',city:'纽约 · 工程行业',meta:'硕士 · 181cm',labels:['摄影徒步','责任感强'],image:'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=700&q=86'},
    {tags:'verified ca',name:'Sophia · 30',city:'加州 · 医疗行业',meta:'本科 · 165cm',labels:['瑜伽美食','真诚沟通'],image:'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=86'}
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

// Functional overlay architecture.
const assessmentModal = document.getElementById('assessmentModal');
if (assessmentModal) {
  assessmentModal.innerHTML = `
    <div class="modal-panel wizard-panel">
      <button class="modal-close" data-close aria-label="关闭">×</button>
      <div class="wizard-shell">
        <aside class="wizard-aside">
          <div class="brand-mini"><span>缘</span><strong>免费资格评估</strong></div>
          <h3>找到适合你的婚绿路径</h3>
          <p>回答几个基础问题，系统会生成教育性的流程方向与准备提示。</p>
          <ol class="wizard-progress" id="assessmentProgress">
            <li class="active"><i>1</i><span>担保人身份</span></li>
            <li><i>2</i><span>申请人位置</span></li>
            <li><i>3</i><span>婚姻状态</span></li>
            <li><i>4</i><span>初步结果</span></li>
          </ol>
        </aside>
        <main class="wizard-main" id="assessmentStage"></main>
      </div>
    </div>`;
}

const loginModal = document.getElementById('loginModal');
if (loginModal) {
  loginModal.innerHTML = `
    <div class="modal-panel compact auth-panel">
      <button class="modal-close" data-close aria-label="关闭">×</button>
      <div class="auth-brand"><span class="brand-mark">缘</span><h2>登录华人婚绿网</h2></div>
      <div class="auth-tabs"><button class="active" data-auth-tab="code">验证码登录</button><button data-auth-tab="password">密码登录</button></div>
      <form class="auth-form" id="authForm">
        <label class="text-field">邮箱<input type="email" required placeholder="name@example.com"></label>
        <div class="auth-row" id="codeRow"><label class="text-field">验证码<input inputmode="numeric" required maxlength="6" placeholder="6位验证码"></label><button class="code-button" type="button" id="sendCode">获取验证码</button></div>
        <label class="text-field" id="passwordRow" hidden>密码<input type="password" placeholder="请输入密码"></label>
        <button class="btn btn-primary btn-wide" type="submit">登录</button>
      </form>
      <p class="auth-note">登录即代表同意《用户协议》和《隐私政策》。演示版本不会保存账户信息。</p>
    </div>`;
}

const consultModal = document.getElementById('consultModal');
if (consultModal) {
  consultModal.innerHTML = `
    <div class="modal-panel compact form-panel">
      <button class="modal-close" data-close aria-label="关闭">×</button>
      <span class="section-kicker">律师咨询</span><h2>预约专业咨询</h2>
      <p>提交基础情况后，正式版本将由合作的美国持牌律师团队联系。</p>
      <form id="consultForm">
        <div class="form-grid">
          <label class="text-field">称呼<input required placeholder="请输入称呼"></label>
          <label class="text-field">联系方式<input required placeholder="电话或微信"></label>
          <label class="text-field">担保人身份<select required><option value="">请选择</option><option>美国公民</option><option>绿卡持有人</option><option>其他</option></select></label>
          <label class="text-field">申请人所在地<select required><option value="">请选择</option><option>美国境内</option><option>美国境外</option></select></label>
          <label class="text-field full">希望咨询的问题<textarea rows="5" required placeholder="请简要描述，不要填写A号、护照号等敏感信息"></textarea></label>
        </div>
        <div class="form-submit"><button class="btn btn-primary" type="submit">提交预约 →</button></div>
        <div class="privacy-note">▣ <span>本入口当前为功能演示，信息不会发送或保存。</span></div>
      </form>
    </div>`;
}

const questionModal = document.getElementById('questionModal');
if (questionModal) {
  questionModal.innerHTML = `
    <div class="modal-panel compact form-panel">
      <button class="modal-close" data-close aria-label="关闭">×</button>
      <span class="section-kicker">问题留言</span><h2>告诉我们你的问题</h2>
      <p>你的反馈将帮助我们完善婚绿知识、模拟流程和社区功能。</p>
      <form id="questionForm">
        <div class="form-grid">
          <label class="text-field">问题类型<select required><option>婚绿流程</option><option>材料准备</option><option>模拟提交</option><option>交友社区</option><option>网站建议</option></select></label>
          <label class="text-field">联系邮箱<input type="email" placeholder="选填"></label>
          <label class="text-field full">问题内容<textarea rows="6" required placeholder="请勿提交护照号、A号、收据号等敏感信息"></textarea></label>
        </div>
        <div class="form-submit"><button class="btn btn-primary" type="submit">提交留言 →</button></div>
      </form>
    </div>`;
}

// Add profile and simulation dialogs.
document.body.insertAdjacentHTML('beforeend', `
  <div class="modal" id="profileModal" aria-hidden="true"><div class="modal-panel"><button class="modal-close" data-close aria-label="关闭">×</button><div id="profileDialog"></div></div></div>
  <div class="modal" id="simulationModal" aria-hidden="true"><div class="modal-panel"><button class="modal-close" data-close aria-label="关闭">×</button><div class="sim-panel" id="simulationStage"></div></div></div>
  <div class="toast-stack" id="toastStack" aria-live="polite"></div>`);

const journeyButton = document.querySelector('.journey .btn-wide');
if (journeyButton) journeyButton.dataset.open = 'simulationModal';

function showToast(title, detail = '') {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<strong>${title}</strong>${detail ? `<small>${detail}</small>` : ''}`;
  stack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3400);
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal.show')) document.body.style.overflow = '';
}

// Assessment wizard.
const assessmentQuestions = [
  {
    label:'步骤 1 / 3',title:'担保人目前是什么身份？',lead:'担保人的身份通常决定申请类别、排期和可选择的程序。',key:'sponsor',
    options:[['美国公民','通常可申请直系亲属类别'],['美国绿卡持有人','通常属于F2A配偶类别'],['尚不确定','先从身份文件开始确认'],['其他情况','需要进一步识别申请关系']]
  },
  {
    label:'步骤 2 / 3',title:'申请人目前在哪里？',lead:'申请人所在地点会影响境内调整身份或境外领事程序的选择。',key:'location',
    options:[['美国境内','重点评估I-485调整身份条件'],['美国境外','通常经过NVC和领事馆面谈'],['即将进入美国','需要结合计划入境身份判断'],['尚不确定','先了解两条流程的区别']]
  },
  {
    label:'步骤 3 / 3',title:'双方目前的婚姻状态？',lead:'是否已经合法结婚，会影响I-130配偶申请或K-1等路径。',key:'married',
    options:[['已经合法结婚','可进一步评估配偶移民流程'],['准备近期结婚','可先准备身份和关系证据'],['尚未结婚','公民担保人可了解K-1路径'],['婚姻情况复杂','建议由持牌律师具体判断']]
  }
];
let assessmentStep = 0;
const assessmentAnswers = {};

function assessmentResultText() {
  const sponsor = assessmentAnswers.sponsor;
  const location = assessmentAnswers.location;
  const married = assessmentAnswers.married;
  if (married === '尚未结婚' && sponsor === '美国公民') return ['K-1或婚后配偶申请','可以先比较K-1未婚夫/妻签证与结婚后提交I-130的时间、费用和入境计划。'];
  if (married === '尚未结婚' && sponsor === '美国绿卡持有人') return ['婚后F2A配偶申请','绿卡持有人不能为未婚夫/妻申请K-1，通常需要结婚后评估F2A流程。'];
  if (location === '美国境内' && sponsor === '美国公民') return ['境内同时递交评估','重点确认合法入境、可调整身份条件，并了解I-130、I-130A与I-485同时递交。'];
  if (location === '美国境内' && sponsor === '美国绿卡持有人') return ['F2A境内调整身份评估','重点查看签证排期、合法身份维持和当月USCIS递交表格。'];
  if (location === '美国境外') return ['境外领事程序','通常依次经过I-130、NVC、DS-260、体检及美国领事馆面谈。'];
  return ['需要进一步确认','你的情况需要结合入境方式、婚姻状态和担保人身份继续判断。'];
}

function renderAssessment() {
  const stage = document.getElementById('assessmentStage');
  const progress = document.querySelectorAll('#assessmentProgress li');
  if (!stage) return;
  progress.forEach((item, index) => {
    item.classList.toggle('active', index === Math.min(assessmentStep, 3));
    item.classList.toggle('done', index < assessmentStep);
  });
  if (assessmentStep < assessmentQuestions.length) {
    const q = assessmentQuestions[assessmentStep];
    stage.innerHTML = `
      <span class="wizard-step-label">${q.label}</span><h2>${q.title}</h2><p class="wizard-lead">${q.lead}</p>
      <div class="option-grid">${q.options.map(option => `<button class="option-card ${assessmentAnswers[q.key] === option[0] ? 'selected' : ''}" data-assessment-value="${option[0]}"><strong>${option[0]}</strong><small>${option[1]}</small></button>`).join('')}</div>
      <div class="wizard-actions"><button class="btn btn-light" id="assessmentBack" ${assessmentStep === 0 ? 'disabled' : ''}>← 上一步</button><button class="btn btn-primary" id="assessmentNext" ${assessmentAnswers[q.key] ? '' : 'disabled'}>${assessmentStep === 2 ? '生成结果' : '下一步'} →</button></div>`;
    stage.querySelectorAll('[data-assessment-value]').forEach(button => button.addEventListener('click', () => {
      assessmentAnswers[q.key] = button.dataset.assessmentValue;
      renderAssessment();
    }));
    stage.querySelector('#assessmentBack')?.addEventListener('click', () => { assessmentStep = Math.max(0, assessmentStep - 1); renderAssessment(); });
    stage.querySelector('#assessmentNext')?.addEventListener('click', () => { assessmentStep += 1; renderAssessment(); });
  } else {
    const [title, copy] = assessmentResultText();
    stage.innerHTML = `
      <span class="wizard-step-label">初步评估完成</span><h2>你的流程方向</h2><p class="wizard-lead">根据刚才的选择，系统生成以下教育性提示。</p>
      <div class="wizard-result"><h3>${title}</h3><p>${copy}</p><div class="result-pills"><span>${assessmentAnswers.sponsor || '身份待确认'}</span><span>${assessmentAnswers.location || '位置待确认'}</span><span>${assessmentAnswers.married || '婚姻状态待确认'}</span></div><p>此结果仅用于一般信息和流程教育，不构成法律意见。</p></div>
      <div class="wizard-actions"><button class="btn btn-light" id="assessmentRestart">重新评估</button><a class="btn btn-primary" href="#simulation" data-close>查看模拟流程 →</a></div>`;
    stage.querySelector('#assessmentRestart')?.addEventListener('click', () => { assessmentStep = 0; Object.keys(assessmentAnswers).forEach(key => delete assessmentAnswers[key]); renderAssessment(); });
  }
}
renderAssessment();

// Simulation workspace.
const simulationSteps = [
  {icon:'◎',title:'资格评估',copy:'确认担保人身份、申请人所在地、入境方式和婚姻状态。',items:['确认担保人身份','确认申请人所在地','记录合法入境或签证信息']},
  {icon:'▤',title:'准备材料',copy:'按照境内或境外路径建立双方身份与婚姻关系证据清单。',items:['双方身份证明','结婚证及翻译','真实婚姻关系证据']},
  {icon:'▥',title:'填写表格',copy:'通过教育性模拟了解I-130、I-130A、I-485或DS-260结构。',items:['核对姓名和地址','保持时间线一致','检查签名和版本日期']},
  {icon:'▣',title:'模拟提交',copy:'系统检查空项、前后矛盾及常见材料遗漏。',items:['检查必填问题','整理附件顺序','生成模拟封面清单']},
  {icon:'⌘',title:'追踪进度',copy:'理解收据、补件、生物识别和面谈通知等常见节点。',items:['保存收据号码','记录通知日期','准备补件或面谈']},
  {icon:'✣',title:'面谈与获批',copy:'查看面谈准备、结果类型以及条件绿卡后的下一步。',items:['整理原件','复习关系时间线','了解获批后的责任']}
];
let simulationIndex = 0;

function renderSimulation() {
  const stage = document.getElementById('simulationStage');
  if (!stage) return;
  const step = simulationSteps[simulationIndex];
  stage.innerHTML = `
    <div class="sim-head"><div><span class="section-kicker">流程模拟</span><h2>婚姻绿卡模拟提交</h2></div><span class="sim-progress">步骤 ${simulationIndex + 1} / ${simulationSteps.length}</span></div>
    <div class="sim-track"><span style="width:${((simulationIndex + 1) / simulationSteps.length) * 100}%"></span></div>
    <div class="sim-stage"><div class="sim-icon">${step.icon}</div><div class="sim-copy"><h3>${step.title}</h3><p>${step.copy}</p><div class="sim-checklist">${step.items.map(item => `<label><input type="checkbox">${item}</label>`).join('')}</div></div></div>
    <div class="sim-actions"><button class="btn btn-light" id="simBack" ${simulationIndex === 0 ? 'disabled' : ''}>← 上一步</button><button class="btn btn-primary" id="simNext">${simulationIndex === simulationSteps.length - 1 ? '完成模拟' : '下一步'} →</button></div>`;
  stage.querySelector('#simBack')?.addEventListener('click', () => { simulationIndex = Math.max(0, simulationIndex - 1); renderSimulation(); });
  stage.querySelector('#simNext')?.addEventListener('click', () => {
    if (simulationIndex === simulationSteps.length - 1) {
      closeModal(document.getElementById('simulationModal'));
      showToast('模拟流程已完成','正式版本将支持保存进度和生成个性化材料清单。');
      simulationIndex = 0;
      renderSimulation();
    } else {
      simulationIndex += 1;
      renderSimulation();
    }
  });
}
renderSimulation();

// Navigation and modal events.
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', event => {
  const modal = document.getElementById(button.dataset.open);
  if (!modal) return;
  event.preventDefault();
  openModal(modal);
}));

document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', event => {
  if (event.target === modal || event.target.closest('[data-close]')) closeModal(modal);
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.modal.show').forEach(closeModal);
});

// Authentication tabs and demo forms.
document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-auth-tab]').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  const codeMode = tab.dataset.authTab === 'code';
  document.getElementById('codeRow').hidden = !codeMode;
  document.getElementById('passwordRow').hidden = codeMode;
}));

document.getElementById('sendCode')?.addEventListener('click', event => {
  const button = event.currentTarget;
  button.disabled = true;
  let seconds = 30;
  button.textContent = `${seconds}s后重试`;
  const timer = window.setInterval(() => {
    seconds -= 1;
    button.textContent = seconds > 0 ? `${seconds}s后重试` : '获取验证码';
    if (seconds <= 0) { window.clearInterval(timer); button.disabled = false; }
  }, 1000);
  showToast('验证码演示','正式版本接入邮件服务后才会实际发送。');
});

['authForm','consultForm','questionForm'].forEach(id => document.getElementById(id)?.addEventListener('submit', event => {
  event.preventDefault();
  closeModal(event.currentTarget.closest('.modal'));
  const messages = {
    authForm:['登录演示完成','正式版本接入用户数据库后才会建立账户。'],
    consultForm:['预约信息已完成演示','正式版本将连接律师预约与通知系统。'],
    questionForm:['留言已完成演示','正式版本上线后会保存并发送给网站后台。']
  };
  showToast(...messages[id]);
  event.currentTarget.reset();
}));

// Community filters, favourites and profile details.
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  const filter = tab.dataset.filter;
  document.querySelectorAll('.profile-card').forEach(card => {
    card.classList.toggle('hidden', filter !== 'all' && !card.dataset.tags.includes(filter));
  });
}));

document.querySelectorAll('.profile-info button').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  button.textContent = button.textContent === '♡' ? '♥' : '♡';
  button.setAttribute('aria-label', button.textContent === '♥' ? '取消喜欢' : '喜欢');
}));

document.querySelectorAll('.profile-card').forEach(card => card.addEventListener('click', () => {
  const image = card.querySelector('img')?.src || '';
  const name = card.querySelector('h3')?.textContent.replace('✓','').trim() || '社区用户';
  const city = card.querySelector('p')?.textContent || '';
  const meta = card.querySelector('small')?.textContent || '';
  const labels = [...card.querySelectorAll('em')].map(item => item.textContent);
  const verified = card.dataset.tags.includes('verified');
  const dialog = document.getElementById('profileDialog');
  if (dialog) dialog.innerHTML = `
    <div class="profile-dialog"><div class="profile-dialog-media"><img src="${image}" alt="${name}"><div class="profile-dialog-badge"><strong>${name}</strong><span>${city}</span></div></div>
    <div class="profile-dialog-body"><span class="section-kicker">交友社区</span><h2>${name}</h2><div class="verified-line">${verified ? '✓ 已完成示例认证' : '普通社区资料'}</div>
    <div class="profile-meta-grid"><div><small>所在地区</small><strong>${city.split('·')[0] || '未填写'}</strong></div><div><small>职业方向</small><strong>${city.split('·')[1] || '未填写'}</strong></div><div><small>教育与身高</small><strong>${meta}</strong></div><div><small>兴趣标签</small><strong>${labels.join(' · ')}</strong></div></div>
    <div class="profile-about">希望认识认真、真诚并尊重彼此生活规划的朋友。当前人物和资料均为UI功能展示，不代表真实注册用户。</div>
    <div class="profile-dialog-actions"><button class="btn btn-light" id="profileLike">♡ 收藏资料</button><button class="btn btn-primary" id="profileMessage">发送问候 →</button></div></div></div>`;
  dialog?.querySelector('#profileLike')?.addEventListener('click', event => { event.currentTarget.textContent = '♥ 已收藏'; showToast('已加入收藏','登录后将支持同步到个人中心。'); });
  dialog?.querySelector('#profileMessage')?.addEventListener('click', () => showToast('私信功能演示','正式版本将接入审核、举报和隐私保护机制。'));
  openModal(document.getElementById('profileModal'));
}));

// Highlight the current navigation section.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, {rootMargin:'-22% 0px -65% 0px',threshold:[0,.2,.5]});
  sections.forEach(section => observer.observe(section));
}
