(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const panel = $('#panel');
  let data, tab = 'profile', dirty = false;

  const toast = (msg, bad) => { const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : ''); clearTimeout(t._t); t._t = setTimeout(() => t.className = 'toast', 2600); };
  const markDirty = () => { dirty = true; $('#dirty').hidden = false; };
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  async function api(action, body, isForm) {
    const res = await fetch('api.php?action=' + action, {
      method: 'POST', headers: { 'X-CSRF-Token': window.CSRF, ...(isForm ? {} : { 'Content-Type': 'application/json' }) },
      body: isForm ? body : JSON.stringify(body)
    });
    const out = await res.json().catch(() => ({ error: 'Server error' }));
    if (!res.ok) throw new Error(out.error || 'Request failed');
    return out;
  }

  async function upload(file) {
    const fd = new FormData(); fd.append('file', file);
    const r = await api('upload', fd, true); return r.path;
  }

  /* ---------- field helpers ---------- */
  // path like "profile.name" or "skills.2.level"
  const get = path => path.split('.').reduce((o, k) => o?.[k], data);
  const set = (path, val) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((o, k) => o[k], data)[last] = val; markDirty(); };

  const input = (label, path, type = 'text', extra = '') =>
    `<label class="f">${label}<input type="${type}" data-path="${path}" value="${esc(get(path))}" ${extra}></label>`;
  const inputAr = (label, path) =>
    `<label class="f f--ar">${label} <em>عربي</em><input dir="rtl" data-path="${path}_ar" value="${esc(get(path + '_ar'))}"></label>`;
  const bi = (label, path) => input(label, path) + inputAr(label, path);
  const textareaAr = (label, path, rows = 4) =>
    `<label class="f f--full f--ar">${label} <em>عربي</em><textarea dir="rtl" data-path="${path}_ar" rows="${rows}">${esc(get(path + '_ar'))}</textarea></label>`;
  const biText = (label, path, rows) => textarea(label, path, rows) + textareaAr(label, path, rows);
  const textarea = (label, path, rows = 4) =>
    `<label class="f f--full">${label}<textarea data-path="${path}" rows="${rows}">${esc(get(path))}</textarea></label>`;
  const listInput = (label, path, hint, ar) =>
    `<label class="f f--full${ar ? ' f--ar' : ''}">${label}${ar ? ' <em>عربي</em>' : ''}<input ${ar ? 'dir="rtl"' : ''} data-list="${path}" value="${esc((get(path) || []).join(', '))}"><small>${hint}</small></label>`;
  const fileInput = (label, path, accept) => {
    const v = get(path) || '';
    const preview = v && /\.(jpe?g|png|webp|gif)$/i.test(v) ? `<img src="../${esc(v)}" alt="">` : (v ? `<a href="../${esc(v)}" target="_blank">${esc(v.split('/').pop())}</a>` : '<span class="muted">No file</span>');
    return `<div class="f f--file"><span>${label}</span><div class="file">${preview}
      <label class="btn btn--ghost btn--sm">Upload<input type="file" hidden accept="${accept}" data-upload="${path}"></label>
      ${v ? `<button class="btn btn--ghost btn--sm" data-clear="${path}">Remove</button>` : ''}</div></div>`;
  };

  /* ---------- list editor ---------- */
  function listEditor(key, titleFn, bodyFn, blank) {
    const items = data[key];
    return `<div class="list-head"><span class="muted">${items.length} item(s) — use ↑↓ to reorder</span>
      <button class="btn btn--sm" data-add="${key}">+ Add new</button></div>
      <div class="list">${items.map((it, i) => `
        <details class="item" ${it._open ? 'open' : ''} data-i="${i}">
          <summary><span class="item__title">${titleFn(it, i)}</span>
            <span class="item__tools">
              <button data-move="${key}.${i}.-1" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
              <button data-move="${key}.${i}.1" title="Move down" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
              <button data-del="${key}.${i}" class="danger" title="Delete">🗑</button>
            </span></summary>
          <div class="grid">${bodyFn(i)}</div>
        </details>`).join('')}</div>`;
    }
  const blanks = {
    skills: () => ({ name: 'New skill', level: 80, category: 'Backend' }),
    stats: () => ({ value: 10, suffix: '+', label: 'New stat' }),
    experience: () => ({ role: 'New role', company: '', location: '', from: '', to: 'Present', description: '' }),
    projects: () => ({ title: 'New project', subtitle: '', description: '', tags: [], link: '', image: '', featured: false })
  };

  /* ---------- views ---------- */
  const views = {
    profile: () => `<div class="card"><h2>Personal info</h2><div class="grid">
        ${bi('Full name', 'profile.name')}${bi('Short name (hero)', 'profile.shortName')}
        ${bi('Title', 'profile.title')}${bi('Location', 'profile.location')}
        ${bi('Military status', 'profile.military')}${bi('Education', 'profile.education')}
        ${input('Birth date', 'profile.birthDate', 'date')}
        ${listInput('Typing roles (hero)', 'profile.roles', 'Comma separated — shown with the typing animation')}
        ${listInput('Typing roles (hero)', 'profile.roles_ar', 'مفصولة بفاصلة — تظهر في النسخة العربية', true)}
        ${biText('About me', 'profile.about', 5)}
      </div></div>
      <div class="card"><h2>Contact & links</h2><div class="grid">
        ${input('Email', 'profile.email', 'email')}${input('Phone', 'profile.phone', 'tel')}
        ${input('WhatsApp number (with country code)', 'profile.whatsapp', 'tel', 'placeholder="2010xxxxxxxx"')}
        ${input('LinkedIn URL', 'profile.linkedin', 'url')}${input('GitHub URL', 'profile.github', 'url')}
      </div></div>
      <div class="card"><h2>SEO</h2><div class="grid">
        ${input('Website URL (your domain)', 'profile.siteUrl', 'url', 'placeholder="https://mohamedgalal.com"')}
        <p class="muted small f--full">Used for Google (canonical, sitemap) and link previews on WhatsApp / LinkedIn / Facebook. Leave empty to auto-detect. Title &amp; description come from your Title and About fields.</p>
      </div></div>
      <div class="card"><h2>Files</h2><div class="grid">
        ${fileInput('Profile photo', 'profile.photo', 'image/*')}${fileInput('CV (PDF)', 'profile.cv', 'application/pdf')}
        <label class="f f--check f--full"><input type="checkbox" data-path="profile.cvHidden" ${get('profile.cvHidden') ? 'checked' : ''}> Hide CV from the website (download button + link)</label>
      </div></div>`,
    stats: () => `<div class="card">${listEditor('stats', s => `<b>${esc(s.value)}${esc(s.suffix)}</b> ${esc(s.label)}`,
      i => input('Number', `stats.${i}.value`, 'number') + input('Suffix', `stats.${i}.suffix`) + bi('Label', `stats.${i}.label`))}</div>`,
    skills: () => `<div class="card">${listEditor('skills', s => `${esc(s.name)} <span class="pill">${esc(s.category || '-')}</span><span class="meter"><i style="width:${+s.level}%"></i></span><span class="muted">${+s.level}%</span>`,
      i => input('Skill name', `skills.${i}.name`) + input('Category', `skills.${i}.category`, 'text', 'list="cats"') +
        `<label class="f f--full">Level: <b data-out="skills.${i}.level">${get(`skills.${i}.level`)}%</b><input type="range" min="0" max="100" data-path="skills.${i}.level" value="${get(`skills.${i}.level`)}"></label>`)}
      <datalist id="cats">${[...new Set(data.skills.map(s => s.category).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>`,
    experience: () => `<div class="card">${listEditor('experience', j => `<b>${esc(j.role)}</b> <span class="muted">@ ${esc(j.company)} · ${esc(j.from)} – ${esc(j.to)}</span>`,
      i => bi('Role', `experience.${i}.role`) + bi('Company', `experience.${i}.company`) + bi('Location', `experience.${i}.location`) +
        input('From', `experience.${i}.from`, 'text', 'placeholder="01/2024"') + input('To', `experience.${i}.to`, 'text', 'placeholder="Present"') +
        biText('Description', `experience.${i}.description`))}</div>`,
    projects: () => `<div class="card">${listEditor('projects', p => `${p.featured ? '★ ' : ''}<b>${esc(p.title)}</b> <span class="muted">${esc(p.subtitle)}</span>`,
      i => bi('Title', `projects.${i}.title`) + bi('Subtitle', `projects.${i}.subtitle`) + input('Live link', `projects.${i}.link`, 'url', 'placeholder="https://"') +
        `<label class="f f--check"><input type="checkbox" data-path="projects.${i}.featured" ${get(`projects.${i}.featured`) ? 'checked' : ''}> Featured project</label>` +
        listInput('Tags / technologies', `projects.${i}.tags`, 'Comma separated, e.g. Laravel, MySQL, Livewire') +
        biText('Description', `projects.${i}.description`) + fileInput('Cover image', `projects.${i}.image`, 'image/*'))}</div>`,
    security: () => `<div class="card narrow"><h2>Change login</h2><form id="pwForm" class="grid">
        <label class="f f--full">Username<input name="username" value="admin"></label>
        <label class="f f--full">Current password<input type="password" name="current" required></label>
        <label class="f f--full">New password (min 8 chars)<input type="password" name="new" minlength="8" required></label>
        <button class="btn">Update password</button></form>
        <p class="muted small">Default password is <code>admin123</code> — change it before going live.</p></div>`
  };

  function show(t) {
    tab = t;
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
    $('#tabTitle').textContent = $(`#tabs [data-tab="${t}"]`).textContent.replace(/^\S+\s/, '');
    $('#saveBtn').hidden = t === 'security';
    panel.innerHTML = views[t]();
    panel.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
  }

  /* ---------- events ---------- */
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });

  panel.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.path) {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.type === 'number' || el.type === 'range') v = Number(v);
      set(el.dataset.path, v);
      const out = panel.querySelector(`[data-out="${el.dataset.path}"]`); if (out) out.textContent = v + '%';
    }
    if (el.dataset.list) set(el.dataset.list, el.value.split(',').map(s => s.trim()).filter(Boolean));
  });
  // refresh summaries on blur so titles update
  panel.addEventListener('change', e => {
    if (!e.target.closest('details')) return;
    const open = [...panel.querySelectorAll('details')].map(d => d.open);
    const key = { stats: 'stats', skills: 'skills', experience: 'experience', projects: 'projects' }[tab];
    if (!key || e.target.type === 'file') return;
    data[key].forEach((it, i) => Object.defineProperty(it, '_open', { value: open[i], enumerable: false, writable: true, configurable: true }));
    const y = scrollY; panel.innerHTML = views[tab](); scrollTo(0, y);
  });

  panel.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.add) {
      e.preventDefault(); const it = blanks[b.dataset.add]();
      Object.defineProperty(it, '_open', { value: true, enumerable: false, writable: true });
      data[b.dataset.add].unshift(it); markDirty(); show(tab);
    } else if (b.dataset.del) {
      e.preventDefault(); const [k, i] = b.dataset.del.split('.');
      if (confirm('Delete this item?')) { data[k].splice(+i, 1); markDirty(); show(tab); }
    } else if (b.dataset.move) {
      e.preventDefault(); const [k, i, d] = b.dataset.move.split('.'); const a = data[k], j = +i + +d;
      [a[i], a[j]] = [a[j], a[i]]; markDirty(); show(tab);
    } else if (b.dataset.clear) {
      e.preventDefault(); set(b.dataset.clear, ''); show(tab);
    }
  });

  panel.addEventListener('change', async e => {
    const el = e.target; if (!el.dataset.upload || !el.files[0]) return;
    try { toast('Uploading…'); const p = await upload(el.files[0]); set(el.dataset.upload, p); show(tab); toast('Uploaded — remember to save'); }
    catch (err) { toast(err.message, true); }
  });

  panel.addEventListener('submit', async e => {
    if (e.target.id !== 'pwForm') return; e.preventDefault();
    try { await api('password', Object.fromEntries(new FormData(e.target))); e.target.reset(); toast('Password updated ✓'); }
    catch (err) { toast(err.message, true); }
  });

  async function save() {
    const b = $('#saveBtn'); b.disabled = true; b.textContent = 'Saving…';
    try { await api('save', data); dirty = false; $('#dirty').hidden = true; toast('Saved — website updated ✓'); }
    catch (err) { toast(err.message, true); }
    b.disabled = false; b.textContent = 'Save changes';
  }
  $('#saveBtn').addEventListener('click', save);
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });

  fetch('../data/portfolio.json?v=' + Date.now()).then(r => r.json()).then(d => {
    data = d; ['stats', 'skills', 'experience', 'projects'].forEach(k => data[k] ||= []); data.profile.roles ||= []; data.profile.roles_ar ||= [];
    show('profile');
  });
})();
