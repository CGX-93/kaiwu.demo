/* 开物 · 我的页面 (profile.html) */

(function () {
  'use strict';

  const qs  = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (v == null) return;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'data') Object.entries(v).forEach(([dk, dv]) => e.dataset[dk] = dv);
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    kids.flat().forEach(k => {
      if (k == null || k === false) return;
      e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    });
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function fmtDate(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function fmtRelative(ts) {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff/60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff/3600) + ' 小时前';
    if (diff < 86400 * 7) return Math.floor(diff/86400) + ' 天前';
    return fmtDate(ts);
  }

  const DIR_LABEL = { ec:'🛒 电商', comic:'📖 条漫', drama:'🎬 短剧', idiom:'📜 成语', other:'🧩 其他' };

  function init() {
    if (window.KW_DL) KW_DL.logEvent('profile.viewed', {});
    renderIdentity();
    renderAcademyStrip();
    renderStats();
    renderBadges();
    renderInvite();
    renderMyWorks();
    bindSignup();
    bindTabs();
  }

  // ===== 造物学院 · 课程横滚条（数据复用 KW.ACADEMY_COURSES）=====
  function renderAcademyStrip() {
    const host = qs('#academyStrip');
    if (!host) return;
    const courses = (window.KW && KW.ACADEMY_COURSES) || [];
    if (!courses.length) return;
    const tier = (window.KW_DL && KW_DL.getMembership) ? KW_DL.getMembership().key : 'free';
    const list = courses.slice(0, 5);

    const cardsHtml = list.map(c => {
      const b = KW.academyAccessBadge(c, tier);
      return '<div class="as-card" data-id="' + c.id + '">' +
        '<div class="as-cover">' + c.cover +
          '<span class="as-badge ' + (b.free ? 'free' : 'paid') + '">' + (b.free ? '✓ ' + b.big : b.big) + '</span>' +
        '</div>' +
        '<div class="as-body">' +
          '<div class="as-name">' + esc(c.name) + '</div>' +
          '<div class="as-meta">' + c.lessons + ' 节 · ' + esc(b.note) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    host.innerHTML =
      '<div class="as-head">' +
        '<span class="as-title">📚 造物学院 · 持续更新</span>' +
        '<a class="as-all" href="academy.html">查看全部 →</a>' +
      '</div>' +
      '<div class="as-scroll" id="asScroll">' + cardsHtml + '</div>';
    host.style.display = '';

    const scroll = qs('#asScroll');
    // 点单卡跳 academy
    scroll.addEventListener('click', e => {
      const card = e.target.closest('.as-card');
      if (!card) return;
      if (window.KW_DL) KW_DL.logEvent('academy.course.click', { id: card.dataset.id, from: 'profile' });
      location.href = 'academy.html';
    });
    // 横滚曝光埋点（首次滚动触发一次）
    let scrolled = false;
    scroll.addEventListener('scroll', () => {
      if (scrolled) return;
      scrolled = true;
      if (window.KW_DL) KW_DL.logEvent('profile.academy.scroll', {});
    }, { passive: true });
  }

  // ===== 身份卡 =====
  function renderIdentity() {
    const p = KW_DL.getUserProfile();
    const card = qs('#identityCard');
    card.style.setProperty('--lv-color', p.level.color);
    card.innerHTML = '';

    // Avatar (clickable to change)
    const avatar = el('div', {
      class: 'id-avatar',
      title: '点击换头像',
      onClick: () => changeAvatar()
    }, p.avatar);
    // 会员档位（tier）光环
    const _mem = (window.KW_DL && KW_DL.getMembership) ? KW_DL.getMembership() : { key: 'free', name: '免费版', icon: '🌱' };
    const _tc = KW.getTierColor(_mem.key);
    avatar.style.boxShadow = '0 0 0 2.5px ' + _tc.main + ', 0 0 16px ' + _tc.glow;
    card.appendChild(avatar);

    // Info
    const info = el('div', { class: 'id-info' });
    const nameRow = el('div', { class: 'id-nickname-row' });
    // 半固定昵称：前缀"造物者·"固定，后缀可编辑（默认 = code）
    const suffix = p.nicknameSuffix || p.code;
    const nameEl = el('span', { class: 'id-nickname' });
    nameEl.innerHTML = '<span style="color:rgba(255,255,255,0.45);font-weight:600;">造物者 · </span>' +
                       '<span class="nick-suffix" style="cursor:pointer;">' + esc(suffix) + '</span>';
    nameEl.querySelector('.nick-suffix').addEventListener('click', () => editNicknameSuffix(nameEl, suffix));
    nameRow.appendChild(nameEl);
    nameRow.appendChild(el('span', { class: 'id-edit-hint', text: '✎ 点后缀可改' }));
    nameRow.appendChild(el('span', {
      class: 'id-level-badge',
      html: '<span class="lv-icon">●</span> Lv.' + p.level.level + ' ' + p.level.name
    }));
    // 会员档位文字（"创作版"等）按 tier 主色
    const _tierBadge = el('span', { class: 'id-tier-badge', html: (_mem.icon || '') + ' ' + _mem.name });
    _tierBadge.style.color = _tc.main;
    _tierBadge.style.border = '1px solid ' + _tc.main;
    _tierBadge.style.borderRadius = '999px';
    _tierBadge.style.padding = '1px 10px';
    _tierBadge.style.marginLeft = '8px';
    _tierBadge.style.fontSize = '12px';
    _tierBadge.style.fontWeight = '700';
    nameRow.appendChild(_tierBadge);
    info.appendChild(nameRow);

    info.appendChild(el('div', { class: 'id-code', html:
      '匿名 ID · <code style="background:rgba(255,255,255,0.06);padding:1px 8px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);">' + p.code + '</code> · ' +
      '加入 ' + fmtDate(p.joinedAt)
    }));

    // 等级进度条
    const prog = el('div', { class: 'id-progress' });
    const pct = p.level.next ? Math.min(100, Math.round(p.level.score / p.level.next * 100)) : 100;
    prog.appendChild(el('div', { class: 'prog-text', html:
      '<span>经验值 ' + p.level.score + (p.level.next ? ' / ' + p.level.next : '') + '</span>' +
      '<span style="color:' + p.level.color + ';">' + p.level.name + (p.level.next ? '' : ' · 已达最高级') + '</span>'
    }));
    const bar = el('div', { class: 'prog-bar' });
    const fill = el('div', { class: 'prog-fill' });
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    prog.appendChild(bar);
    info.appendChild(prog);

    card.appendChild(info);

    // 右侧动作
    const actions = el('div', { class: 'id-actions' });
    // 退出登录：仅已登录时显示（匿名优先，未登录不渲染），位于"导出/管理数据"上方
    if (window.KW_DL && KW_DL.isLoggedIn()) {
      actions.appendChild(el('button', {
        class: 'btn-glow ghost sm',
        text: '🚪 退出登录',
        onClick: () => {
          KW_DL.logout();
          KW.toast('已退出登录');
          setTimeout(() => location.reload(), 600);
        }
      }));
    }
    actions.appendChild(el('a', {
      class: 'btn-glow ghost sm',
      href: 'data-policy.html',
      text: '📥 导出/管理数据'
    }));
    actions.appendChild(el('button', {
      class: 'btn-glow ghost sm',
      text: '📤 分享我的造物档案',
      onClick: shareProfile
    }));
    card.appendChild(actions);
  }

  function changeAvatar() {
    const pool = ['🦊','🐼','🐳','🦉','🐺','🐯','🦁','🐢','🦔','🦖','🐉','🐧','🦄','🐝','🐙','🦋','🐰','🦒','🐘','🦏','🦬','🦓','🦅','🦜'];
    const cur = (KW_DL.getUserProfile().avatar);
    const i = pool.indexOf(cur);
    const next = pool[(i + 1) % pool.length];
    KW_DL.updateUserProfile({ avatar: next });
    renderIdentity();
    KW.toast('头像已更换 · ' + next);
  }

  function editNicknameSuffix(nameEl, currentSuffix) {
    const wrap = el('span', { style: 'display:inline-flex; align-items:center; gap:6px;' });
    wrap.appendChild(el('span', { style: 'color:rgba(255,255,255,0.45);font-weight:600;font-size:22px;', text: '造物者 · ' }));
    const input = el('input', {
      class: 'nickname-input',
      type: 'text',
      maxlength: '12',
      value: currentSuffix || '',
      placeholder: '2-12 字 中英数_'
    });
    wrap.appendChild(input);
    nameEl.replaceWith(wrap);
    input.focus();
    input.select();
    function commit() {
      let v = input.value.trim();
      if (v && !/^[一-龥A-Za-z0-9_]{2,12}$/.test(v)) {
        KW.toast('只能用中英数和下划线，2-12 字');
        input.focus();
        return;
      }
      KW_DL.updateUserProfile({ nickname_suffix: v || null });
      renderIdentity();
      KW.toast(v ? '昵称已更新' : '已恢复默认 ID');
    }
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') { renderIdentity(); }
    });
  }

  function shareProfile() {
    const url = location.origin + location.pathname;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => KW.toast('链接已复制 · 可分享', 'success'));
    } else {
      KW.toast('链接：' + url);
    }
    KW_DL.logEvent('profile.share', { ts: Date.now() });
  }

  // ===== 数据栏 =====
  function renderStats() {
    const orders   = KW_DL.getOrderHistory().length;
    const cases    = KW_DL.getCaseCount();
    const atoms    = KW_DL.getAtoms({ source: 'generated' }).length;
    const learn    = KW_DL.getLearningCount();
    const follows  = (KW_DL.getUserProfile().followedCreators || []).length;
    const refTotal = KW_DL.getCases().reduce((s, c) => s + (c.referenceCount || 0), 0);

    const row = qs('#statsRow');
    row.innerHTML = '';
    const tiles = [
      { icon:'📋', num: orders,    label: '我的工单' },
      { icon:'✨', num: cases,     label: '提交的作品' },
      { icon:'🧩', num: atoms,     label: '沉淀的原子' },
      { icon:'🔄', num: refTotal,  label: '被引用次数' },
      { icon:'💚', num: learn,     label: '学习贡献' }
    ];
    tiles.forEach(t => {
      const tile = el('div', { class: 'stat-tile' });
      tile.innerHTML =
        '<div class="st-icon">' + t.icon + '</div>' +
        '<div class="st-num">' + t.num + '</div>' +
        '<div class="st-label">' + t.label + '</div>';
      row.appendChild(tile);
    });
  }

  // ===== 徽章 =====
  function renderBadges() {
    const badges = KW_DL.computeBadges();
    const unlocked = badges.filter(b => b.unlocked).length;
    qs('#badgeProgress').textContent = unlocked + ' / ' + badges.length + ' 已解锁';

    const grid = qs('#badgeGrid');
    grid.innerHTML = '';
    badges.forEach(b => {
      const card = el('div', { class: 'badge-card ' + (b.unlocked ? 'unlocked' : 'locked'), title: b.desc });
      card.innerHTML =
        (b.unlocked ? '<div class="bc-card-state">已解锁</div>' : '') +
        '<div class="bc-icon">' + b.icon + '</div>' +
        '<div class="bc-name">' + esc(b.name) + '</div>' +
        '<div class="bc-desc">' + esc(b.desc) + '</div>';
      grid.appendChild(card);
    });
  }

  // ===== 邀请同道 =====
  function renderInvite() {
    const box = qs('#inviteSection');
    if (!box || !window.KW_DL) return;
    const inv = KW_DL.getInviteData();

    const tiersHtml = inv.tiers.map(t =>
      '<div class="invite-tier' + (t.done ? ' done' : '') + '">' +
        '<span class="it-check">✓</span>' +
        '<div class="it-n">' + t.n + '<span> 人</span></div>' +
        '<div class="it-reward">' + esc(t.reward) + '</div>' +
      '</div>'
    ).join('');

    const inviteeHtml = inv.invitees.length
      ? inv.invitees.map(it =>
          '<div class="invitee-row"><span class="ir-avatar">🌱</span>造物者 · ' + esc(it.code) +
          ' <span style="margin-left:auto;color:rgba(255,255,255,0.4);font-size:11px;">' + fmtRelative(it.at) + '</span></div>'
        ).join('')
      : '<div class="invitee-empty">还没有邀请记录 · 把链接发给同道，一起壮大开物社区</div>';

    // 用公开 QR API 生成二维码（无需本地库）
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=' + encodeURIComponent(inv.link);

    box.innerHTML =
      '<div class="invite-head">' +
        '<h3>邀请同道，<em>一起壮大开物社区</em></h3>' +
        '<span class="invite-count-badge">已邀请 ' + inv.count + ' 人</span>' +
      '</div>' +
      '<p class="invite-sub">每邀请一位创作者加入，双方都能解锁奖励 · 邀请越多，离签约越近</p>' +
      '<div class="invite-share">' +
        '<div>' +
          '<div class="invite-link-row">' +
            '<input id="inviteLink" readonly value="' + esc(inv.link) + '" />' +
            '<button class="invite-copy-btn" id="inviteCopyBtn">复制链接</button>' +
          '</div>' +
          '<div class="invite-tiers">' + tiersHtml + '</div>' +
        '</div>' +
        '<div class="invite-qr-wrap">' +
          '<div class="invite-qr"><img src="' + qrUrl + '" alt="邀请二维码" /></div>' +
          '<div class="qr-label">扫码加入</div>' +
        '</div>' +
      '</div>' +
      '<div class="invitee-list">' +
        '<div class="il-title">我邀请的人（脱敏）</div>' +
        inviteeHtml +
        '<button class="invite-dev-btn" id="inviteDevBtn">+ 模拟一位被邀请者（演示用）</button>' +
      '</div>';

    qs('#inviteCopyBtn').addEventListener('click', () => {
      const inp = qs('#inviteLink');
      inp.select();
      if (navigator.clipboard) navigator.clipboard.writeText(inp.value);
      else document.execCommand('copy');
      KW.toast('邀请链接已复制 · 快发给同道', 'success');
      KW_DL.logEvent('invite.copy', {});
    });
    qs('#inviteDevBtn').addEventListener('click', () => {
      KW_DL.addInvitee();
      renderInvite();
      renderStats();
      KW.toast('已模拟 +1 位被邀请者');
    });
  }

  // ===== 我的作品 Tab =====
  function renderMyWorks() {
    renderMyCases();
    renderMyOrders();
    renderMyFollows();
  }

  function renderMyCases() {
    const cases = KW_DL.getCases();
    qs('#cntCases').textContent = cases.length;
    const list  = qs('#listCases');
    const empty = qs('#emptyCases');
    list.innerHTML = '';
    if (!cases.length) { list.style.display = 'none'; empty.style.display = ''; return; }
    list.style.display = '';
    empty.style.display = 'none';
    cases.slice().sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)).forEach(c => {
      const item = el('a', { class: 'mw-item', href: c.orderId ? 'result.html?id=' + encodeURIComponent(c.orderId) : '#' });
      const head = el('div', { class: 'mw-item-head' });
      head.appendChild(el('span', { class: 'mw-item-dir', text: DIR_LABEL[c.direction] || '✦ 创作' }));
      head.appendChild(el('span', { class: 'mw-item-time', text: fmtRelative(c.submittedAt) }));
      item.appendChild(head);
      item.appendChild(el('h4', { class: 'mw-item-title', text: c.workTitle || c.orderTitle || '未命名作品' }));
      const meta = el('div', { class: 'mw-item-meta' });
      if (c.rating)         meta.appendChild(el('span', { class: 'st', text: '★ ' + c.rating + '.0' }));
      meta.appendChild(el('span', { text: '👁️ ' + (c.viewCount || 0) }));
      meta.appendChild(el('span', { text: '🔄 ' + (c.referenceCount || 0) }));
      if (c.isPublic) meta.appendChild(el('span', { style: 'color:#5BE3C0', text: '· 已公开' }));
      item.appendChild(meta);
      list.appendChild(item);
    });
  }

  function renderMyOrders() {
    const orders = KW_DL.getOrderHistory();
    qs('#cntOrders').textContent = orders.length;
    const list  = qs('#listOrders');
    const empty = qs('#emptyOrders');
    list.innerHTML = '';
    if (!orders.length) { list.style.display = 'none'; empty.style.display = ''; return; }
    list.style.display = '';
    empty.style.display = 'none';
    orders.forEach(o => {
      const item = el('a', { class: 'mw-item', href: 'result.html?id=' + encodeURIComponent(o.id) });
      const head = el('div', { class: 'mw-item-head' });
      head.appendChild(el('span', { class: 'mw-item-dir', text: DIR_LABEL[o.direction] || '✦' }));
      const madeIt = o.feedback && o.feedback.madeIt;
      if (madeIt) head.appendChild(el('span', {
        style: 'font-size:10.5px; color:#5BE3C0; padding: 2px 8px; background: rgba(0,212,170,0.14); border-radius: 999px; border: 1px solid rgba(0,212,170,0.32);',
        text: '✓ 已做出来'
      }));
      head.appendChild(el('span', { class: 'mw-item-time', text: fmtRelative(o.createdAt) }));
      item.appendChild(head);
      item.appendChild(el('h4', { class: 'mw-item-title', text: o.title || '未命名工单' }));
      list.appendChild(item);
    });
  }

  function renderMyFollows() {
    const p = KW_DL.getUserProfile();
    const follows = p.followedCreators || [];
    qs('#cntFollows').textContent = follows.length;
    const list  = qs('#listFollows');
    const empty = qs('#emptyFollows');
    list.innerHTML = '';
    if (!follows.length) { list.style.display = 'none'; empty.style.display = ''; return; }
    list.style.display = '';
    empty.style.display = 'none';
    follows.forEach(code => {
      // 找该 code 提交的所有作品
      const cs = KW_DL.getCases().filter(c => c.submitterCode === code);
      const lastCase = cs[0];
      const item = el('a', { class: 'mw-item', href: 'works.html' });
      const head = el('div', { class: 'mw-item-head' });
      head.appendChild(el('span', { class: 'mw-item-dir', text: '👥 创作者' }));
      if (lastCase) head.appendChild(el('span', { class: 'mw-item-time', text: '最近 ' + fmtRelative(lastCase.submittedAt) }));
      item.appendChild(head);
      item.appendChild(el('h4', { class: 'mw-item-title', text: '造物者 · ' + code }));
      const meta = el('div', { class: 'mw-item-meta' });
      meta.appendChild(el('span', { text: '作品 ' + cs.length }));
      meta.appendChild(el('span', {
        style: 'color: #5BE3C0; cursor: pointer;',
        text: '已关注 · 点击取消',
        onClick: e => {
          e.preventDefault(); e.stopPropagation();
          KW_DL.followCreator(code);
          KW.toast('已取消关注 ' + code);
          renderMyFollows();
        }
      }));
      item.appendChild(meta);
      list.appendChild(item);
    });
  }

  // ===== Tabs =====
  function bindTabs() {
    qsa('.mw-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const t = tab.dataset.tab;
        qsa('.mw-tab').forEach(x => x.classList.toggle('active', x === tab));
        qsa('.mw-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === t));
        if (window.KW_DL) KW_DL.logEvent('profile.tab', { tab: t });
      });
    });
  }

  // ===== 签约 Modal（基于作品的申请通道） =====
  function bindSignup() {
    const modal = qs('#signupModal');
    const infoBox = qs('#signupBox');
    const applyBox = qs('#applyBox');
    function showInfo() { infoBox.style.display = ''; applyBox.style.display = 'none'; }

    qs('#btnSignupInfo').addEventListener('click', () => {
      showInfo();
      modal.classList.add('show');
      if (window.KW_DL) KW_DL.logEvent('signup.info.opened', {});
    });
    qs('#sbCancel').addEventListener('click', () => modal.classList.remove('show'));
    qs('#sbApply').addEventListener('click', () => {
      infoBox.style.display = 'none';
      applyBox.style.display = '';
      if (window.KW_DL) KW_DL.logEvent('signup.apply.opened', {});
    });
    qs('#applyBack').addEventListener('click', showInfo);
    qs('#applySubmit').addEventListener('click', () => {
      const contact = qs('#applyContact').value.trim();
      const work    = qs('#applyWork').value.trim();
      const intro   = qs('#applyIntro').value.trim();
      if (!contact) { KW.toast('留个联系方式，我们才能找到你'); return; }
      if (!work)    { KW.toast('放一个代表作品链接吧'); return; }
      if (window.KW_DL) {
        KW_DL.addContribution({
          type: 'signup-apply',
          title: '签约申请',
          content: '联系方式：' + contact + '\n作品：' + work + '\n介绍：' + intro,
          sourceType: 'original'
        });
        KW_DL.logEvent('signup.apply.submitted', { hasIntro: !!intro });
      }
      modal.classList.remove('show');
      KW.toast('✓ 申请已提交 · 我们会人工审核你的作品', 'success');
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('show');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
