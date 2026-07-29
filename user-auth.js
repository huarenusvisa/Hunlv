(() => {
  const cfg = window.HUNLV_SUPABASE_CONFIG || {};
  const status = document.querySelector('[data-auth-status]');
  const setStatus = (message, type = '') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };

  if (!cfg.url || !cfg.anonKey || !window.supabase) {
    setStatus('账号系统尚未完成后台连接。页面结构已上线，连接 Supabase 后即可启用注册和登录。', 'warning');
    document.documentElement.dataset.authReady = 'false';
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.anonKey);
  window.HUNLV_SUPABASE = client;
  document.documentElement.dataset.authReady = 'true';

  const $ = selector => document.querySelector(selector);
  const signUpForm = $('#signUpForm');
  const signInForm = $('#signInForm');
  const profileForm = $('#profileForm');
  const signOutButton = $('#signOutButton');
  const avatarInput = $('#avatar');
  const avatarPreview = $('#avatarPreview');
  let currentUser = null;

  const ageAtLeast18 = birthDate => {
    const birth = new Date(`${birthDate}T00:00:00`);
    const today = new Date();
    const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return birth <= cutoff;
  };

  async function refreshSession() {
    const { data } = await client.auth.getSession();
    currentUser = data.session?.user || null;
    document.body.classList.toggle('is-authenticated', Boolean(currentUser));
    document.body.classList.toggle('is-anonymous', !currentUser);
    const emailTarget = $('[data-user-email]');
    if (emailTarget) emailTarget.textContent = currentUser?.email || '';
    if (currentUser) await loadProfile();
  }

  async function loadProfile() {
    const { data, error } = await client.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
    if (error) return setStatus(`读取资料失败：${error.message}`, 'error');
    if (!data || !profileForm) return;
    Object.entries(data).forEach(([key, value]) => {
      const field = profileForm.elements.namedItem(key);
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else if (Array.isArray(value)) field.value = value.join('，');
      else field.value = value ?? '';
    });
    if (data.avatar_url && avatarPreview) avatarPreview.src = data.avatar_url;
    const moderation = $('[data-moderation-status]');
    if (moderation) moderation.textContent = ({draft:'草稿',pending:'待审核',approved:'已通过',rejected:'未通过',hidden:'已隐藏'})[data.status] || data.status;
  }

  signUpForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(signUpForm);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    if (password.length < 8) return setStatus('密码至少需要8位。', 'error');
    setStatus('正在创建账号…');
    const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/account.html` } });
    if (error) return setStatus(`注册失败：${error.message}`, 'error');
    setStatus('注册成功，请前往邮箱完成验证。', 'success');
    signUpForm.reset();
  });

  signInForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(signInForm);
    setStatus('正在登录…');
    const { error } = await client.auth.signInWithPassword({
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || '')
    });
    if (error) return setStatus(`登录失败：${error.message}`, 'error');
    setStatus('登录成功。', 'success');
    await refreshSession();
  });

  signOutButton?.addEventListener('click', async () => {
    await client.auth.signOut();
    setStatus('已退出登录。', 'success');
    await refreshSession();
  });

  avatarInput?.addEventListener('change', () => {
    const file = avatarInput.files?.[0];
    if (!file || !avatarPreview) return;
    avatarPreview.src = URL.createObjectURL(file);
  });

  profileForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!currentUser) return setStatus('请先登录。', 'error');
    const form = new FormData(profileForm);
    const birthDate = String(form.get('birth_date') || '');
    if (!ageAtLeast18(birthDate)) return setStatus('交友社区仅限年满18岁的用户。', 'error');

    let avatarUrl = String(form.get('existing_avatar_url') || '');
    const file = avatarInput?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return setStatus('照片必须是5MB以内的图片文件。', 'error');
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${currentUser.id}/avatar-${Date.now()}.${extension}`;
      const upload = await client.storage.from('profile-photos').upload(path, file, { upsert: true });
      if (upload.error) return setStatus(`照片上传失败：${upload.error.message}`, 'error');
      avatarUrl = client.storage.from('profile-photos').getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      id: currentUser.id,
      display_name: String(form.get('display_name') || '').trim(),
      birth_date: birthDate,
      gender: String(form.get('gender') || 'private'),
      city: String(form.get('city') || '').trim(),
      state: String(form.get('state') || '').trim(),
      occupation: String(form.get('occupation') || '').trim(),
      bio: String(form.get('bio') || '').trim(),
      interests: String(form.get('interests') || '').split(/[，,]/).map(v => v.trim()).filter(Boolean).slice(0, 12),
      avatar_url: avatarUrl || null,
      adult_confirmed: Boolean(form.get('adult_confirmed')),
      identity_confirmed: Boolean(form.get('identity_confirmed')),
      photo_rights_confirmed: Boolean(form.get('photo_rights_confirmed')),
      public_consent: Boolean(form.get('public_consent')),
      consent_at: new Date().toISOString(),
      status: 'pending',
      is_public: false
    };

    if (!payload.adult_confirmed || !payload.identity_confirmed || !payload.photo_rights_confirmed || !payload.public_consent) {
      return setStatus('请完成全部年龄、身份、照片权利和公开展示确认。', 'error');
    }
    setStatus('正在提交审核…');
    const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) return setStatus(`提交失败：${error.message}`, 'error');
    setStatus('资料已提交，当前状态为待审核。', 'success');
    await loadProfile();
  });

  client.auth.onAuthStateChange(() => refreshSession());
  refreshSession();
})();
