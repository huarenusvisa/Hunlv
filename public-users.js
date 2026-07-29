(() => {
  const cfg = window.HUNLV_SUPABASE_CONFIG || {};
  const grid = document.querySelector('[data-public-users]');
  const notice = document.querySelector('[data-users-notice]');
  if (!grid) return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const age = birthDate => {
    const birth = new Date(`${birthDate}T00:00:00`);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) years -= 1;
    return years;
  };

  if (!cfg.url || !cfg.anonKey || !window.supabase) {
    if (notice) notice.textContent = '真实用户数据库尚未连接。当前展示为页面功能示例，不代表真实注册用户。';
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.anonKey);
  client.from('profiles')
    .select('id,display_name,birth_date,city,state,occupation,bio,interests,avatar_url')
    .eq('status', 'approved')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .limit(60)
    .then(({ data, error }) => {
      if (error) {
        if (notice) notice.textContent = `公开资料暂时无法加载：${error.message}`;
        return;
      }
      if (!data?.length) {
        if (notice) notice.textContent = '目前还没有审核通过的公开用户。创建资料并通过审核后会显示在这里。';
        grid.innerHTML = '<div class="empty-state">暂无公开用户</div>';
        return;
      }
      if (notice) notice.textContent = `当前展示 ${data.length} 位本人授权并审核通过的用户。`;
      grid.innerHTML = data.map(profile => {
        const location = [profile.city, profile.state].filter(Boolean).join(' · ');
        const tags = (profile.interests || []).slice(0, 4).map(tag => `<span class="status-chip">${escapeHtml(tag)}</span>`).join('');
        const photo = profile.avatar_url
          ? `<img src="${escapeHtml(profile.avatar_url)}" alt="${escapeHtml(profile.display_name)}的公开头像" loading="lazy">`
          : '<div class="public-user-photo">暂无头像</div>';
        return `<article class="public-user-card">${photo}<div class="content"><h2>${escapeHtml(profile.display_name)} · ${age(profile.birth_date)}</h2><p>${escapeHtml(location)}</p>${profile.occupation ? `<p>${escapeHtml(profile.occupation)}</p>` : ''}${profile.bio ? `<p>${escapeHtml(profile.bio)}</p>` : ''}<div>${tags}</div><a href="report-profile.html?profile=${encodeURIComponent(profile.id)}">举报资料</a></div></article>`;
      }).join('');
    });
})();
