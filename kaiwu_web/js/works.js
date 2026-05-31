/* 开物 · 创作开源社区 (works.html) */

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
  function fmtTime(ts) {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff/60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff/3600) + ' 小时前';
    if (diff < 86400 * 7) return Math.floor(diff/86400) + ' 天前';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  }
  function fmtNum(n) {
    if (n == null) return '0';
    n = Number(n);
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/,'') + 'w';
    if (n >= 1000)  return (n / 1000).toFixed(1).replace(/\.0$/,'')  + 'k';
    return String(n);
  }

  const DIR_META = {
    ec:    { name: '🛒 电商',   cls: 'dir-ec' },
    comic: { name: '📖 条漫',   cls: 'dir-comic' },
    drama: { name: '🎬 短剧',   cls: 'dir-drama' },
    idiom: { name: '📜 成语',   cls: 'dir-idiom' },
    other: { name: '🧩 其他',   cls: 'dir-other' }
  };

  function init() {
    if (window.KW_DL) KW_DL.logEvent('works.viewed', { ts: Date.now() });

    renderOpenTab();
    renderFeaturedTab();
    bindTabs();
    bindCTAs();
    bindSubmitModal();
  }

  // ============ Tab 1: 自由创作区 ============
  function renderOpenTab() {
    const cases = (window.KW_DL && KW_DL.getCases({ isPublic: true })) || [];
    qs('#cntOpen').textContent = cases.length;
    const grid = qs('#openCasesGrid');
    const empty = qs('#openEmpty');
    grid.innerHTML = '';

    if (cases.length === 0) {
      grid.style.display = 'none';
      empty.style.display = '';
      return;
    }
    grid.style.display = '';
    empty.style.display = 'none';

    cases.slice().sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
         .forEach(c => grid.appendChild(renderCaseCard(c, 'open')));
  }

  // ============ Tab 2: 开物精选 ============
  function renderFeaturedTab() {
    const featured = (window.KW_DL && KW_DL.getFeaturedCases()) || [];
    qs('#cntFeatured').textContent = featured.length + 1;   // +1 for the 团队的刻舟求剑 hardcoded

    const grid = qs('#featuredCasesGrid');
    const empty = qs('#featuredEmpty');
    grid.innerHTML = '';
    if (featured.length === 0) {
      grid.style.display = 'none';
      empty.style.display = '';
    } else {
      grid.style.display = '';
      empty.style.display = 'none';
      featured.forEach(c => grid.appendChild(renderCaseCard(c, 'featured')));
    }

    // 刻舟求剑卡的"发布时通知我"按钮
    const sub = qs('#btnSubscribe');
    if (sub) sub.addEventListener('click', () => {
      if (window.KW_DL) KW_DL.logEvent('kezhou.subscribe', {});
      KW.toast('已记下 · 首发时会推送', 'success');
    });
  }

  // ============ 案例卡片渲染 ============
  function renderCaseCard(c, fromTab) {
    const card = el('article', { class: 'case-card', data: { id: c.id } });

    // 封面（暂时用占位 — 用户提交未来可加 cover URL）
    const cover = el('div', { class: 'cc-cover' });
    cover.appendChild(el('div', {
      class: 'cc-cover-placeholder',
      text: (c.workTitle || c.orderTitle || '✦').slice(0, 4)
    }));
    if (c.featured) {
      cover.appendChild(el('div', { class: 'cc-featured-badge', text: '⭐ 编辑精选' }));
    }
    card.appendChild(cover);

    // 主体
    const body = el('div', { class: 'cc-body' });

    body.appendChild(el('h3', {
      class: 'cc-title',
      text: c.workTitle || c.orderTitle || '未命名作品'
    }));

    // 创作者 + 关注 + 时间
    const isFollow = window.KW_DL && KW_DL.isFollowing(c.submitterCode);
    const creator = el('div', { class: 'cc-creator' });
    const submitterEl = el('span', {
      class: 'cc-submitter',
      text: c.creatorName ? c.creatorName : '造物者 · ' + c.submitterCode
    });
    // 创作者标签按其会员档位（tier）着色，直接取案例自带字段
    const _ctier = c.creatorTier || 'free';
    submitterEl.style.color = KW.getTierColor(_ctier).main;
    submitterEl.style.fontWeight = '600';
    creator.appendChild(submitterEl);
    const followBtn = el('button', {
      class: 'cc-follow-btn' + (isFollow ? ' followed' : ''),
      text: isFollow ? '已关注' : '+ 关注',
      onClick: e => {
        e.stopPropagation();
        if (!window.KW_DL) return;
        const newState = KW_DL.followCreator(c.submitterCode);
        followBtn.classList.toggle('followed', newState);
        followBtn.textContent = newState ? '已关注' : '+ 关注';
        KW.toast(newState ? '已关注 ' + c.submitterCode : '已取消关注');
      }
    });
    creator.appendChild(followBtn);
    creator.appendChild(el('span', { class: 'cc-time', text: fmtTime(c.submittedAt) }));
    body.appendChild(creator);

    // 主体数据栏：⭐评分 · 👁️浏览 · 👍点赞 · 💬评论
    const stats = el('div', { class: 'cc-stats' });
    if (c.rating) {
      const ratingBox = el('span');
      for (let i = 0; i < 5; i++) {
        ratingBox.appendChild(el('span', {
          class: 'star' + (i < c.rating ? '' : ' dim'),
          text: '★'
        }));
      }
      ratingBox.appendChild(document.createTextNode(' ' + c.rating + '.0'));
      stats.appendChild(ratingBox);
    }
    stats.appendChild(el('span', { text: '👁️ ' + fmtNum(c.viewCount) }));
    stats.appendChild(el('span', { text: '🔄 ' + fmtNum(c.referenceCount) }));
    body.appendChild(stats);

    // 实际数据（如果用户填了 metrics）
    if (c.metrics && (c.metrics.views || c.metrics.likes || c.metrics.comments)) {
      const real = el('div', { class: 'cc-real-data' });
      if (c.metrics.views)    real.appendChild(el('span', { text: '👁️ ' + fmtNum(c.metrics.views) }));
      if (c.metrics.likes)    real.appendChild(el('span', { text: '👍 ' + fmtNum(c.metrics.likes) }));
      if (c.metrics.comments) real.appendChild(el('span', { text: '💬 ' + fmtNum(c.metrics.comments) }));
      body.appendChild(real);
    }

    // 标签 chips
    const chips = el('div', { class: 'cc-chips' });
    if (c.direction) {
      const dirMeta = DIR_META[c.direction] || DIR_META.other;
      chips.appendChild(el('span', { class: 'cc-chip ' + dirMeta.cls, text: dirMeta.name }));
    }
    // 从工单拉 platforms / style
    if (c.orderId && window.KW_DL) {
      const ord = KW_DL.getOrder(c.orderId);
      if (ord && ord.inputs) {
        const plats = Array.isArray(ord.inputs.platform) ? ord.inputs.platform : (ord.inputs.platform ? [ord.inputs.platform] : []);
        plats.slice(0, 2).forEach(p => {
          const meta = { douyin:'抖音', xhs:'小红书', wechat:'视频号', kuaishou:'快手' }[p] || p;
          chips.appendChild(el('span', { class: 'cc-chip', text: meta }));
        });
        if (ord.inputs.style) {
          const style = { plant:'种草', review:'测评', oral:'口播', drama:'剧情', scene:'场景', premium:'高级感' }[ord.inputs.style];
          if (style) chips.appendChild(el('span', { class: 'cc-chip', text: style }));
        }
      }
    }
    if (chips.children.length > 0) body.appendChild(chips);

    // 创作心得
    if (c.thoughts) {
      body.appendChild(el('div', { class: 'cc-thoughts', text: c.thoughts }));
    }

    card.appendChild(body);

    // 底部 3 操作
    const actions = el('div', { class: 'cc-actions' });
    actions.appendChild(el('a', {
      class: 'cc-btn',
      href: c.resultUrl || '#',
      target: c.resultUrl ? '_blank' : null,
      rel: 'noopener noreferrer',
      text: '📹 看成片',
      onClick: e => {
        if (!c.resultUrl) { e.preventDefault(); KW.toast('该作品未填成片链接'); return; }
        if (window.KW_DL) KW_DL.viewCase(c.id, fromTab);
      }
    }));
    actions.appendChild(el('a', {
      class: 'cc-btn',
      href: c.orderId ? 'result.html?id=' + encodeURIComponent(c.orderId) : '#',
      text: '📋 看工单',
      onClick: e => {
        if (!c.orderId) { e.preventDefault(); return; }
        if (window.KW_DL) KW_DL.logEvent('case.order.view', { caseId: c.id, orderId: c.orderId });
      }
    }));
    actions.appendChild(el('button', {
      class: 'cc-btn primary',
      text: '🔄 用这份做一条',
      onClick: () => {
        if (window.KW_DL) {
          KW_DL.referenceCase(c.id);
          KW_DL.logEvent('case.order.reference', { caseId: c.id, fromTab });
        }
        // 复制源工单 inputs 作为新问答的种子（写入草稿 in_progress）
        if (c.orderId && window.KW_DL) {
          const ord = KW_DL.getOrder(c.orderId);
          if (ord && ord.inputs) {
            KW_DL.saveDraft({
              dir: 'ecom',
              index: 0,
              answers: Object.assign({}, ord.inputs)
            }, 'in_progress');
          }
        }
        KW.toast('参考工单已加载 · 跳转到问答页', 'success');
        setTimeout(() => location.href = 'question.html?dir=ecom&ref=' + (c.orderId || ''), 600);
      }
    }));
    card.appendChild(actions);

    // 整卡浏览埋点（一次性，不重复）
    let _seen = false;
    card.addEventListener('mouseenter', () => {
      if (_seen) return; _seen = true;
      if (window.KW_DL) KW_DL.viewCase(c.id, fromTab);
    });

    // 案例深度浏览（鼠标停留 >30s）
    let _stayStart = null;
    card.addEventListener('mouseenter', () => { _stayStart = Date.now(); });
    card.addEventListener('mouseleave', () => {
      if (!_stayStart) return;
      const stay = Math.round((Date.now() - _stayStart) / 1000);
      if (stay >= 30 && window.KW_DL) {
        KW_DL.logEvent('case.deep.read', { caseId: c.id, stayTime: stay });
      }
      _stayStart = null;
    });

    return card;
  }

  // ============ Tab 切换 ============
  function bindTabs() {
    qsa('.wk-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        qsa('.wk-tab').forEach(t => t.classList.toggle('active', t === tab));
        qsa('.wk-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
        if (window.KW_DL) KW_DL.logEvent('works.tab', { tab: target });
      });
    });
  }

  // ============ Other CTAs ============
  function bindCTAs() {
    const btnSigned = document.getElementById('btnSignedInfo');
    if (btnSigned) {
      btnSigned.addEventListener('click', () => {
        if (window.KW_DL) KW_DL.logEvent('works.signed.info', {});
        KW.toast('签约通道即将开放 · 敬请期待');
      });
    }
    qsa('[data-works-cta]').forEach(a => {
      a.addEventListener('click', () => {
        if (window.KW_DL) KW_DL.logEvent('works.bottom.cta', { target: a.dataset.worksCta });
      });
    });
  }

  // ============ 提交弹窗 ============
  let _smRating = 0;

  function bindSubmitModal() {
    const btn = qs('#btnSubmit');
    if (btn) btn.addEventListener('click', openSubmitModal);
    qs('#smCancel').addEventListener('click', closeSubmitModal);
    qs('#smClose').addEventListener('click', closeSubmitModal);
    qsa('.sm-stars .star').forEach((s, i) => {
      s.addEventListener('click', () => setSmRating(i + 1));
    });
    qs('#smSubmit').addEventListener('click', submitCase);
    qs('#smGoOpen').addEventListener('click', e => {
      e.preventDefault();
      closeSubmitModal();
      qs('.wk-tab[data-tab="open"]').click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // 点遮罩关闭
    qs('#submitModal').addEventListener('click', e => {
      if (e.target.id === 'submitModal') closeSubmitModal();
    });
  }

  function openSubmitModal() {
    // 加载用户的历史工单到下拉
    const sel = qs('#smOrderSelect');
    sel.innerHTML = '<option value="">选择一份历史工单 ...</option>';
    if (window.KW_DL) {
      const orders = KW_DL.getOrderHistory();
      if (orders.length === 0) {
        sel.innerHTML = '<option value="">（还没有工单 · 先去答题）</option>';
      } else {
        orders.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o.id;
          opt.textContent = (o.title || '未命名工单') + ' · ' + fmtTime(o.createdAt);
          sel.appendChild(opt);
        });
      }
    }
    // 重置表单
    qs('#smBoxForm').style.display = '';
    qs('#smBoxSuccess').style.display = 'none';
    setSmRating(0);
    ['smWorkTitle','smResultUrl','smViews','smLikes','smComments','smThoughts','smCreatorName'].forEach(id => {
      qs('#' + id).value = '';
    });
    qs('#smIsPublic').checked = true;
    qs('#submitModal').classList.add('show');
    if (window.KW_DL) KW_DL.logEvent('works.submit.open', {});
  }
  function closeSubmitModal() {
    qs('#submitModal').classList.remove('show');
  }
  function setSmRating(n) {
    _smRating = n;
    qsa('.sm-stars .star').forEach((s, i) => s.classList.toggle('on', i < n));
  }

  function submitCase() {
    const orderId   = qs('#smOrderSelect').value;
    const workTitle = qs('#smWorkTitle').value.trim();
    const resultUrl = qs('#smResultUrl').value.trim();
    const views     = qs('#smViews').value.trim();
    const likes     = qs('#smLikes').value.trim();
    const comments  = qs('#smComments').value.trim();
    const thoughts  = qs('#smThoughts').value.trim();
    const creator   = qs('#smCreatorName').value.trim();
    const isPublic  = qs('#smIsPublic').checked;

    if (!orderId)   { KW.toast('请先选一份工单'); return; }
    if (!workTitle) { KW.toast('给作品起个标题吧'); return; }
    if (!resultUrl) { KW.toast('请填上成片链接'); return; }

    const metrics = (views || likes || comments) ? {
      views: views ? Number(views.replace(/[^\d]/g, '')) || views : null,
      likes: likes ? Number(likes.replace(/[^\d]/g, '')) || likes : null,
      comments: comments ? Number(comments.replace(/[^\d]/g, '')) || comments : null
    } : null;

    KW_DL.addCase({
      orderId, workTitle, resultUrl,
      rating: _smRating || null,
      metrics, thoughts, isPublic,
      creatorName: creator || null
    });

    // 切到成功态
    const total = KW_DL.getCaseCount();
    const dataSize = (KW_DL.getAtoms() || []).length +
                     (KW_DL.getCases() || []).length +
                     (KW_DL.exportAllData().events || []).length;
    qs('#smTotalCases').textContent = total;
    qs('#smTotalSize').textContent  = dataSize;
    qs('#smBoxForm').style.display = 'none';
    qs('#smBoxSuccess').style.display = '';

    // 刷新自由创作区
    renderOpenTab();

    KW.toast('✨ 已沉淀到方法论库 · 已发布到自由创作区', 'success');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
