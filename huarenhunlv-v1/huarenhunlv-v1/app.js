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

  assessmentResult.textContent = `${result} 本结果仅用于一般流程教育，不构成法律意见。`;
});
