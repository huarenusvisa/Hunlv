(() => {
  const cfg = window.HUNLV_SUPABASE_CONFIG || {};
  const status = document.querySelector('[data-admin-status]');
  const table = document.querySelector('[data-admin-users]');
  const setStatus = message => { if (status) status.textContent = message; };
  if (!cfg.url || !cfg.anonKey || !window.supabase) return setStatus('Supabase 尚未连接，审核后台暂未启用。');
  const client = window.supabase.createClient(cfg.url, cfg.anonKey);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  async function ensureAdmin() {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) throw new Error('请先在账号中心登录管理员账号。');
    const { data, error } = await client.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    if (error || !data) throw new Error('当前账号没有管理员权限。');
    return user;
  }

  async function loadPending() {
    try {
      await ensureAdmin();
      const { data, error } = await client.from('profiles').select('id,display_name,city,birth_date,adult_confirmed,photo_rights_confirmed,status,avatar_url').order('created_at', { ascending: true });
      if (error) throw error;
      setStatus(`共读取 ${data.length} 条用户资料。`);
      table.innerHTML = data.map(profile => `<tr><td>${escapeHtml(profile.display_name)}</td><td>${escapeHtml(profile.city)}</td><td>${profile.adult_confirmed ? '已确认' : '未确认'}</td><td>${profile.photo_rights_confirmed ? '已确认' : '未确认'}</td><td>${escapeHtml(profile.status)}</td><td><button class="approve" data-id="${profile.id}" data-action="approved">通过</button><button data-id="${profile.id}" data-action="rejected">拒绝</button><button data-id="${profile.id}" data-action="hidden">隐藏</button></td></tr>`).join('') || '<tr><td colspan="6">暂无资料</td></tr>';
    } catch (error) {
      setStatus(error.message || String(error));
    }
  }

  table?.addEventListener('click', async event => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    button.disabled = true;
    const updates = { status: action, is_public: action === 'approved' };
    const { error } = await client.from('profiles').update(updates).eq('id', id);
    if (error) setStatus(`审核失败：${error.message}`);
    else await loadPending();
    button.disabled = false;
  });

  loadPending();
})();
