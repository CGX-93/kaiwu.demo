/* 开物 · 历史工单页 */

(function () {
  'use strict';

  const qs  = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
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
  const DIR_META = {
    ec:    { name: '电商带货', cls: 'ec',    icon: '🛒' },
    comic: { name: '条漫制作', cls: 'comic', icon: '📖' },
    drama: { name: '短剧制作', cls: 'drama', icon: '🎬' },
    idiom: { name: '成语短片', cls: 'idiom', icon: '📜' },
    other: { name: '其他场景', cls: 'other', icon: '🧩' }
  };

  function fmtTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function fmtRelative(ts) {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff/60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff/3600) + ' 小时前';
    if (diff < 86400 * 7) return Math.floor(diff/86400) + ' 天前';
    return fmtTime(ts);
  }

  let state = {
    q: '',
    direction: '',
    sort: 'latest',
    deleteTargetId: null,
    deleteTargetTitle: ''
  };

  function init() {
    if (!window.KW_DL) {
      console.error('KW_DL not loaded');
      return;
    }
    KW_DL.logEvent('history.viewed', {});
    bindToolbar();
    bindDeleteModal();
    bindExport();
    render();
  }

  // ===== 渲染 =====
  function render() {
    const all = KW_DL.getOrderHistory();
    const totalCount = all.length;

    // 应用筛选 + 搜索
    let list = all.slice();
    if (state.direction) list = list.filter(o => o.direction === state.direction);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(o => {
        const blob = (o.title || '') + ' ' + JSON.stringify(o.inputs || {}) + ' ' +
                     JSON.stringify(o.inputsResolved || {});
        return blob.toLowerCase().includes(q);
      });
    }
    // 排序
    if (state.sort === 'favorite') {
      list.sort((a, b) => {
        if (!!b.favorite !== !!a.favorite) return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } else if (state.sort === 'madeIt') {
      list.sort((a, b) => {
        const am = (a.feedback && a.feedback.madeIt) ? 1 : 0;
        const bm = (b.feedback && b.feedback.madeIt) ? 1 : 0;
        if (am !== bm) return bm - am;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } else {
      // latest
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    renderStats(all, list);

    // 渲染列表 / 空状态
    const listEl = qs('#histList');
    const emptyEl = qs('#histEmpty');
    if (list.length === 0) {
      listEl.innerHTML = '';
      // 区分"完全没数据"和"过滤后没结果"
      if (totalCount === 0) {
        emptyEl.style.display = 'block';
        emptyEl.querySelector('h2').textContent = '还没有工单';
        emptyEl.querySelector('p').innerHTML = '答几道题，开物会为你生成第一份导演级工单。<br/>每做一份都会自动存到这里。';
      } else {
        emptyEl.style.display = 'block';
        emptyEl.querySelector('.emoji').textContent = '🔍';
        emptyEl.querySelector('h2').textContent = '没有匹配的工单';
        emptyEl.querySelector('p').innerHTML = '换个关键词 / 切换方向 / 重置筛选试试。';
      }
      return;
    }
    emptyEl.style.display = 'none';
    listEl.innerHTML = '';
    list.forEach(o => listEl.appendChild(renderCard(o)));
  }

  function renderStats(all, filtered) {
    const row = qs('#histStats');
    const total = all.length;
    const made = all.filter(o => o.feedback && o.feedback.madeIt).length;
    const favs = all.filter(o => o.favorite).length;
    const atomTotal = (KW_DL.getAtoms({source: 'generated'}) || []).length;
    row.innerHTML =
      '<span class="hist-stat"><strong>' + total + '</strong> 份工单</span>' +
      '<span class="hist-stat"><strong>' + made + '</strong> 已做出来</span>' +
      '<span class="hist-stat"><strong>' + favs + '</strong> 收藏</span>' +
      '<span class="hist-stat"><strong>' + atomTotal + '</strong> 条原子沉淀</span>' +
      (filtered.length !== total ? '<span class="hist-stat" style="color:#FFD56A">显示 ' + filtered.length + ' / ' + total + '</span>' : '');
  }

  function renderCard(o) {
    const dir = DIR_META[o.direction] || DIR_META.other;
    const made = !!(o.feedback && o.feedback.madeIt);
    const fav = !!o.favorite;

    const card = el('article', {
      class: 'hist-card' + (fav ? ' favorite' : ''),
      data: { id: o.id }
    });

    // 主体
    const main = el('div', { class: 'hc-main' });
    const head = el('div', { class: 'hc-head' });
    head.appendChild(el('span', { class: 'hc-dir ' + dir.cls, text: dir.icon + ' ' + dir.name }));
    head.appendChild(el('span', { class: 'hc-time', text: fmtRelative(o.createdAt), title: fmtTime(o.createdAt) }));
    head.appendChild(el('span',
      { class: 'hc-status ' + (made ? 'made' : 'waiting'), text: made ? '✓ 已做出来' : '⌛ 待制作' }
    ));
    // “自己的”用户标识，按当前用户会员档位（tier）着色
    const _mtier = (window.KW_DL && KW_DL.getMembership) ? KW_DL.getMembership().key : 'free';
    const _oc = KW.getTierColor(_mtier);
    const _ownerBadge = el('span', { class: 'hc-owner', text: '你的' });
    _ownerBadge.style.color = _oc.main;
    _ownerBadge.style.border = '1px solid ' + _oc.main;
    _ownerBadge.style.borderRadius = '6px';
    _ownerBadge.style.padding = '1px 8px';
    _ownerBadge.style.fontSize = '11px';
    _ownerBadge.style.fontWeight = '700';
    head.appendChild(_ownerBadge);
    if (fav) head.appendChild(el('span', { class: 'hc-fav-badge', text: '★ 收藏' }));
    main.appendChild(head);

    main.appendChild(el('h3', { class: 'hc-title', text: o.title || '未命名工单' }));

    // chips: 卖点 + 人群 + 平台
    const chips = el('div', { class: 'hc-chips' });
    const resolved = o.inputsResolved || {};
    const inputs = o.inputs || {};
    if (resolved.selling_point && resolved.selling_point.label) chips.appendChild(el('span', { class: 'chip', text: '卖点：' + resolved.selling_point.label }));
    if (resolved.audience      && resolved.audience.label)      chips.appendChild(el('span', { class: 'chip', text: '人群：' + resolved.audience.label }));
    if (resolved.platform      && resolved.platform.label)      chips.appendChild(el('span', { class: 'chip', text: '平台：' + resolved.platform.label }));
    if (inputs.duration) chips.appendChild(el('span', { class: 'chip', text: '时长：' + inputs.duration }));
    if (inputs.specialNeeds || inputs.special) {
      chips.appendChild(el('span', { class: 'chip', style: 'color:#FFD56A; border-color:rgba(255,184,0,0.32)', text: '🌟 长尾需求' }));
    }
    main.appendChild(chips);

    card.appendChild(main);

    // 右侧操作
    const actions = el('div', { class: 'hc-actions' });
    const favBtn = el('button', {
      class: 'hc-icon-btn' + (fav ? ' fav-on' : ''),
      title: fav ? '取消收藏' : '收藏',
      onClick: e => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(o.id); }
    }, '★');
    actions.appendChild(favBtn);
    actions.appendChild(el('button', {
      class: 'hc-icon-btn danger-h',
      title: '删除',
      onClick: e => { e.preventDefault(); e.stopPropagation(); openDeleteModal(o.id, o.title); }
    }, '🗑'));
    actions.appendChild(el('a', {
      class: 'btn-glow primary sm',
      href: 'result.html?id=' + encodeURIComponent(o.id),
      onClick: () => {
        if (window.KW_DL) KW_DL.logEvent('history.order.open', { orderId: o.id });
      }
    }, '打开 ', el('span', { class: 'arrow', text: '→' })));
    card.appendChild(actions);

    // 整卡可点
    card.addEventListener('click', e => {
      // 跳过按钮区域
      if (e.target.closest('.hc-actions')) return;
      if (window.KW_DL) KW_DL.logEvent('history.order.open', { orderId: o.id, via: 'card' });
      location.href = 'result.html?id=' + encodeURIComponent(o.id);
    });

    return card;
  }

  // ===== 工具栏 =====
  function bindToolbar() {
    const search = qs('#histSearch');
    let t = null;
    search.addEventListener('input', e => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.q = e.target.value.trim();
        if (window.KW_DL && state.q) KW_DL.logEvent('history.search', { q: state.q });
        render();
      }, 200);
    });

    qs('#histFilterDir').addEventListener('change', e => {
      state.direction = e.target.value;
      if (window.KW_DL) KW_DL.logEvent('history.filter', { direction: state.direction });
      render();
    });

    qs('#histSort').addEventListener('change', e => {
      state.sort = e.target.value;
      if (window.KW_DL) KW_DL.logEvent('history.sort', { sort: state.sort });
      render();
    });
  }

  // ===== 收藏 =====
  function onToggleFavorite(id) {
    if (!window.KW_DL) return;
    const isFav = KW_DL.toggleOrderFavorite(id);
    KW.toast(isFav ? '已收藏 · 自动置顶' : '已取消收藏');
    render();
  }

  // ===== 删除流程 =====
  function bindDeleteModal() {
    const modal = qs('#delModal');
    qs('#delCancel').addEventListener('click', closeDeleteModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeDeleteModal();
    });
    qsa('.del-reasons label').forEach(lb => {
      lb.addEventListener('click', () => {
        qsa('.del-reasons label').forEach(x => x.classList.remove('checked'));
        lb.classList.add('checked');
        lb.querySelector('input[type=radio]').checked = true;
      });
    });
    qs('#delConfirm').addEventListener('click', confirmDelete);
  }
  function openDeleteModal(id, title) {
    state.deleteTargetId = id;
    state.deleteTargetTitle = title || '未命名工单';
    qs('#delTarget').textContent = title || '未命名工单';
    // 重置选择
    qsa('.del-reasons label').forEach(lb => lb.classList.remove('checked'));
    qsa('.del-reasons input[type=radio]').forEach(r => r.checked = false);
    qs('#delModal').classList.add('show');
  }
  function closeDeleteModal() {
    qs('#delModal').classList.remove('show');
    state.deleteTargetId = null;
  }
  function confirmDelete() {
    const id = state.deleteTargetId;
    if (!id) return;
    const reasonRadio = qs('.del-reasons input[type=radio]:checked');
    const reason = reasonRadio ? reasonRadio.value : 'skipped';
    if (window.KW_DL) {
      KW_DL.logEvent('history.order.delete', { orderId: id, reason });
      KW_DL.removeOrder(id, { reason });
    }
    closeDeleteModal();
    KW.toast('已删除 · 你的反馈已记下');
    render();
  }

  // ===== 导出 =====
  function bindExport() {
    qs('#btnExport').addEventListener('click', () => {
      if (!window.KW_DL) return;
      KW_DL.logEvent('history.export', { ts: Date.now() });
      KW_DL.downloadAllData();
      KW.toast('开始下载完整数据 JSON', 'success');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
