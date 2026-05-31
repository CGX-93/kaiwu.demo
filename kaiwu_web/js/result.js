/* 开物 · 工单结果页控制器 */

(function () {
  'use strict';

  // ===== 配置 =====
  const DEPTH_LEVELS = {
    basic:    { name: '基础版', icon: '🌱', desc: '6 模块·新手友好', includes: ['basic'] },
    standard: { name: '标准版', icon: '🌳', desc: '完整 10 模块（默认）', includes: ['basic','standard'] },
    master:   { name: '大师版', icon: '🏔️', desc: '10 模块 + 导演级细节', includes: ['basic','standard','master'] }
  };
  const DEPTH_KEY = 'kaiwu_result_depth';

  // 模块号 → 原子类型（仅这 5 个模块会解构成原子）
  const ATOM_TYPE_BY_MODULE = {
    '01': 'motif',
    '02': 'character',
    '03': 'storyboard',
    '05': 'prompt',
    '07': 'narration'
  };

  // ===== 工具 =====
  const qs  = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v == null) return;
        if (k === 'class')      e.className = v;
        else if (k === 'html')  e.innerHTML = v;
        else if (k === 'text')  e.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'data') Object.entries(v).forEach(([dk, dv]) => e.dataset[dk] = dv);
        else e.setAttribute(k, v);
      });
    }
    kids.flat().forEach(k => {
      if (k == null || k === false) return;
      e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    });
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ===== 状态 =====
  let state = {
    order:    null,
    depth:    localStorage.getItem(DEPTH_KEY) || 'standard',
    folded:   new Set(),   // module nums that are folded
    activeToc: null
  };

  // ===== 1. 加载工单 =====
  function loadOrder() {
    const id = KW.query('id');
    if (!id) {
      // 兼容旧 sessionStorage
      const cur = KWStorage && KWStorage.getCurrentResult && KWStorage.getCurrentResult();
      if (cur && cur.id) {
        // 老格式 → 转新格式
        const newOrder = KW_DL.saveOrder({
          id: cur.id, createdAt: cur.createdAt,
          direction: cur.dir || 'ec',
          inputs: cur.answers || {},
          inputsResolved: cur.answersResolved || {},
          title: cur.title || ''
        });
        return newOrder;
      }
      return null;
    }
    return KW_DL.getOrder(id);
  }

  // ===== 2. 确保 output 存在（懒生成） =====
  function ensureOutput(order) {
    if (order.output && order.output.modules && order.output.modules.length) return order;
    const gen = RESULT_TEMPLATES.generate(order.inputs, order.inputsResolved);
    const patched = {
      ...order,
      title: order.title || gen.title,
      output: gen,
      templateMatched: order.templateMatched || gen.templateMatched
    };
    KW_DL.updateOrder(order.id, {
      title: patched.title,
      output: patched.output,
      templateMatched: patched.templateMatched
    });
    KW_DL.logEvent('result.viewed', { id: order.id, template: patched.templateMatched });
    return patched;
  }

  // ===== 2.5 自动解构：把工单切成原子塞进方法论库 =====
  function decomposeToAtoms(order) {
    // 如果已经解构过（出现过母题/人物/分镜/提示词/旁白这 5 类中任意一类）则不重复
    // 注意：longtail 原子可能来自 question.js 提前写入，不算"已解构"
    const decomposeTypes = new Set(Object.values(ATOM_TYPE_BY_MODULE));
    const alreadyDecomposed = KW_DL.getAtomsByOrder(order.id)
      .some(a => decomposeTypes.has(a.type));
    if (alreadyDecomposed) return 0;

    const ctx = (order.output && order.output.ctx) || {};
    const mods = (order.output && order.output.modules) || [];
    const baseTags = [
      order.direction || 'ec',
      (order.inputs && order.inputs.product_type) || '',
      ctx.audDesc || '',
      ctx.styleName || '',
      ctx.platName || '',
      ctx.durKey || ''
    ].filter(Boolean);

    let count = 0;
    const commonFields = (extraTags) => ({
      source: 'generated',
      orderId: order.id,
      tags: baseTags.concat(extraTags || []),
      rating: 0,
      useCount: 1,            // 这一次生成算一次"使用"
      successCount: 0
    });

    mods.forEach(m => {
      const atomType = ATOM_TYPE_BY_MODULE[m.num];
      if (!atomType) return;

      if (atomType === 'motif') {
        // 模块 01：3 段 long
        const content = {};
        (m.blocks || []).filter(b => b.type === 'long').forEach(b => {
          if (!b.label) return;
          if (b.label.includes('PROPOSITION')) content.thesis = b.text;
          if (b.label.includes('INSIGHT'))     content.insight = b.text;
          if (b.label.includes('TAGLINE'))     content.tagline = b.text;
        });
        KW_DL.saveAtom({
          type: 'motif', content,
          moduleNum: '01',
          ...commonFields(['sellAxis-' + (ctx.sellAxis || 'na')])
        });
        count++;
      }
      else if (atomType === 'character') {
        const kv = (m.blocks || []).find(b => b.type === 'kv');
        const content = {};
        ((kv && kv.items) || []).forEach(it => { content[it.k] = it.v; });
        // 大师 prompt-ready
        const promptsBlk = (m.blocks || []).find(b => b.type === 'prompts');
        if (promptsBlk && promptsBlk.prompts && promptsBlk.prompts[0]) {
          content.promptReady = promptsBlk.prompts[0].body;
        }
        KW_DL.saveAtom({
          type: 'character', content,
          moduleNum: '02',
          ...commonFields()
        });
        count++;
      }
      else if (atomType === 'storyboard') {
        const shotsBlock = (m.blocks || []).find(b => b.type === 'shots');
        ((shotsBlock && shotsBlock.shots) || []).forEach(s => {
          KW_DL.saveAtom({
            type: 'storyboard',
            content: {
              num: s.num, durLabel: s.durLabel, durSec: s.durSec,
              move: s.move, enter: s.enter, exit: s.exit, perf: s.perf,
              masterBeat: s.masterBeat || null,
              masterEnter: s.masterEnter || null,
              masterExit: s.masterExit || null,
              profile: s._profile || null
            },
            moduleNum: '03', shotNum: s.num,
            ...commonFields(['profile-' + (s._profile || 'na')])
          });
          count++;
        });
      }
      else if (atomType === 'prompt') {
        const promptsBlock = (m.blocks || []).find(b => b.type === 'prompts');
        ((promptsBlock && promptsBlock.prompts) || []).forEach((p, i) => {
          const shotNum = String(i + 1).padStart(2, '0');
          KW_DL.saveAtom({
            type: 'prompt',
            content: { label: p.label, body: p.body, shotNum },
            moduleNum: '05', shotNum,
            ...commonFields()
          });
          count++;
        });
      }
      else if (atomType === 'narration') {
        const long = (m.blocks || []).find(b => b.type === 'long');
        const kv   = (m.blocks || []).find(b => b.type === 'kv');
        const content = { text: long ? long.text : '' };
        ((kv && kv.items) || []).forEach(it => { content[it.k] = it.v; });
        KW_DL.saveAtom({
          type: 'narration', content,
          moduleNum: '07',
          ...commonFields()
        });
        count++;
      }
    });

    KW_DL.logEvent('result.decomposed', { id: order.id, atomCount: count });
    return count;
  }

  // ===== 3. 渲染：Hero =====
  function renderHero(order) {
    const out = order.output || {};
    const ctx = out.ctx || {};
    qs('#resultTitle').innerHTML = esc(out.title || '工单').replace(/·/g, '<span style="opacity:0.5"> · </span>');

    const time = new Date(order.createdAt);
    const pad = n => String(n).padStart(2, '0');
    qs('#resultTime').textContent =
      `${time.getFullYear()}-${pad(time.getMonth()+1)}-${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getMinutes())}`;

    // 摘要
    const summary = `基于你的 ${Object.keys(order.inputs || {}).length} 项回答生成 · ${(out.modules || []).length} 个模块 · ${ctx.shotCount || '-'} 个镜头 · 即梦 / 可灵 / 剪映可用`;
    qs('#resultSubline').textContent = summary;

    // chips
    const chipsBox = qs('#resultChips');
    chipsBox.innerHTML = '';
    [ctx.audDesc, ctx.styleName, ctx.platName, ctx.durKey, ctx.sellAxis ? '主打 ' + ctx.sellAxis : null]
      .filter(Boolean)
      .forEach(t => chipsBox.appendChild(el('span', { class: 'chip', text: t })));

    if (order.templateMatched) {
      chipsBox.appendChild(el('span', {
        class: 'chip', text: '模板 ' + order.templateMatched, title: '匹配到的模板 ID'
      }));
    }

    // 沉淀原子提示
    renderAtomNotice(order);
  }

  // ===== 3.5 原子沉淀提示 =====
  function renderAtomNotice(order) {
    const box = qs('#atomNotice');
    if (!box) return;
    const atoms = KW_DL.getAtomsByOrder(order.id);
    const totalAtoms = KW_DL.getAtoms({ source: 'generated' }).length;
    const byType = atoms.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1; return acc;
    }, {});
    const typeLabel = { motif: '母题', character: '人物', storyboard: '分镜', prompt: '提示词', narration: '旁白' };
    const detail = Object.entries(byType)
      .map(([k, n]) => `${typeLabel[k] || k} × ${n}`)
      .join(' · ');
    box.innerHTML =
      `<span class="an-em">🧩</span>` +
      `<span class="an-text">本次生成已沉淀 <strong>${atoms.length}</strong> 条原子到平台方法论库 ` +
      `<span class="an-detail">${detail}</span></span>` +
      `<span class="an-total">累计共 <strong>${totalAtoms}</strong> 条 · 让开物对你这个类目更准</span>`;
  }

  // ===== 4. 渲染：深度切换 =====
  function renderDepth() {
    const box = qs('#depthSwitch');
    box.innerHTML = '';
    Object.entries(DEPTH_LEVELS).forEach(([key, d]) => {
      const btn = el('button', {
        class: 'depth-chip' + (key === state.depth ? ' active' : ''),
        data: { depth: key },
        onClick: () => setDepth(key)
      },
        el('span', { class: 'dc-icon', text: d.icon }),
        el('div', { class: 'dc-meta' },
          el('div', { class: 'dc-name', text: d.name }),
          el('div', { class: 'dc-desc', text: d.desc })
        )
      );
      box.appendChild(btn);
    });
  }
  function setDepth(d) {
    if (!DEPTH_LEVELS[d]) return;
    const prev = state.depth;
    if (prev === d) return;
    state.depth = d;
    localStorage.setItem(DEPTH_KEY, d);
    KW_DL.logEvent('result.depth.switch', { from: prev, to: d, orderId: state.order.id });
    renderDepth();
    renderModules(state.order);
    renderToc(state.order);
    KW.toast(`已切到 ${DEPTH_LEVELS[d].icon} ${DEPTH_LEVELS[d].name}`);
  }

  // ===== 5. 渲染：TOC =====
  function visibleModules(order) {
    const mods = (order.output && order.output.modules) || [];
    if (state.depth === 'basic') return mods.filter(m => m.inBasic);
    return mods;
  }
  function visibleBlocks(mod) {
    const include = DEPTH_LEVELS[state.depth].includes;
    return (mod.blocks || []).filter(b => {
      const lv = b.levels || ['basic','standard','master'];
      return lv.some(x => include.includes(x));
    });
  }
  function renderToc(order) {
    const box = qs('#resultToc');
    box.innerHTML = '';
    visibleModules(order).forEach(m => {
      const a = el('a', {
        class: 'toc-link', href: '#m' + m.num,
        onClick: e => { e.preventDefault(); document.getElementById('m' + m.num).scrollIntoView({ behavior: 'smooth' }); }
      },
        el('span', { class: 'n', text: m.num }),
        document.createTextNode(' ' + m.icon + ' ' + m.title)
      );
      box.appendChild(a);
    });
  }

  // ===== 6. 渲染：模块 =====
  function renderModules(order) {
    const box = qs('#modules');
    box.innerHTML = '';
    visibleModules(order).forEach(m => box.appendChild(renderModule(m, order)));
  }

  function renderModule(m, order) {
    const isFolded = state.folded.has(m.num);
    const article = el('article', {
      class: 'result-module' + (isFolded ? ' collapsed' : ''),
      id: 'm' + m.num
    });

    // 头部
    const head = el('div', { class: 'rm-head', onClick: (e) => {
      if (e.target.closest('.btn-copy')) return; // 复制不触发折叠
      toggleFold(article, m.num);
    }},
      el('div', { class: 'rm-head-left' },
        el('div', { class: 'rm-num', text: m.num }),
        el('div', { class: 'rm-meta' },
          el('div', { class: 'rm-sub', text: m.sub || '' }),
          el('h2', { class: 'rm-title', html: (m.icon || '') + ' ' + esc(m.title) })
        )
      ),
      el('div', { class: 'rm-head-right' },
        el('button', {
          class: 'btn-copy', onClick: ev => { ev.stopPropagation(); copyModule(m, ev.currentTarget); }
        }, '复制本模块'),
        el('button', { class: 'btn-fold' },
          el('span', { class: 'chev', text: '▾' })
        )
      )
    );
    article.appendChild(head);

    // 内容体
    const body = el('div', { class: 'rm-body' });
    visibleBlocks(m).forEach(b => body.appendChild(renderBlock(b)));

    // 微反馈条
    body.appendChild(renderFeedbackBar(m, order));

    article.appendChild(body);
    return article;
  }

  function toggleFold(article, num) {
    const expanding = state.folded.has(num);  // 当前折叠 → 即将展开
    if (expanding) {
      state.folded.delete(num);
      article.classList.remove('collapsed');
    } else {
      state.folded.add(num);
      article.classList.add('collapsed');
    }
    if (window.KW_DL) {
      KW_DL.logEvent('result.module.expand', {
        moduleId: num,
        orderId: state.order.id,
        action: expanding ? 'expand' : 'collapse'
      });
    }
  }

  // ===== 7. 渲染：各种块类型 =====
  function renderBlock(b) {
    switch (b.type) {
      case 'long':    return renderLong(b);
      case 'kv':      return renderKv(b);
      case 'list':    return renderList(b);
      case 'note':    return renderNote(b);
      case 'shots':   return renderShots(b);
      case 'scenes':  return renderScenes(b);
      case 'kling':   return renderKling(b);
      case 'prompts': return renderPrompts(b);
      case 'platforms': return renderPlatforms(b);
      default:        return el('div', { text: '[未支持的块类型: ' + b.type + ']' });
    }
  }

  function renderLong(b) {
    const cls = 'block-long' + (b.emphasis ? ' tagline' : '');
    return el('div', { class: cls },
      b.label && el('span', { class: 'bl-label', text: b.label }),
      el('p', { class: b.mono ? 'mono' : '', text: b.text })
    );
  }
  function renderKv(b) {
    const dl = el('dl', { class: 'block-kv' });
    (b.items || []).forEach(item => {
      dl.appendChild(el('dt', { text: item.k }));
      dl.appendChild(el('dd', { text: item.v }));
    });
    return dl;
  }
  function renderList(b) {
    const box = el('div', { class: 'block-list' });
    if (b.heading) box.appendChild(el('h4', { text: b.heading }));
    const ul = el('ul');
    (b.items || []).forEach(t => ul.appendChild(el('li', { text: t })));
    box.appendChild(ul);
    return box;
  }
  function renderNote(b) {
    return el('div', { class: 'block-note' },
      el('span', { class: 'icon', text: b.icon || '💡' }),
      el('div', { text: b.text })
    );
  }

  function renderShots(b) {
    const wrap = el('div', { class: 'block-shots' });
    (b.shots || []).forEach(s => {
      const card = el('article', { class: 'shot-card' },
        el('div', { class: 'shot-head' },
          el('span', { class: 'shot-num', text: '镜头 ' + s.num }),
          el('span', { class: 'shot-dur', text: s.durLabel || (s.durSec + 's') }),
          el('span', { class: 'shot-move', text: s.move }),
          el('span', { class: 'shot-dir', text: s.enter + '  →  ' + s.exit })
        ),
        el('div', { class: 'shot-perf' },
          el('span', { class: 'label', text: 'PERF · 人物表演' }),
          document.createTextNode(s.perf)
        )
      );
      // 大师版补充
      if (state.depth === 'master' && (s.masterBeat || s.masterEnter || s.masterExit)) {
        card.appendChild(el('div', { class: 'shot-grid' },
          s.masterBeat ? el('span', { class: 'k', text: '表演节拍' }) : null,
          s.masterBeat ? el('span', { text: s.masterBeat }) : null,
          s.masterEnter ? el('span', { class: 'k', text: '入画铁律' }) : null,
          s.masterEnter ? el('span', { text: s.masterEnter }) : null,
          s.masterExit ? el('span', { class: 'k', text: '出画铁律' }) : null,
          s.masterExit ? el('span', { text: s.masterExit }) : null
        ));
      }
      wrap.appendChild(card);
    });
    return wrap;
  }

  function renderScenes(b) {
    const wrap = el('div', { class: 'block-shots' });
    (b.items || []).forEach(s => {
      wrap.appendChild(el('article', { class: 'shot-card' },
        el('div', { class: 'shot-head' },
          el('span', { class: 'shot-num', text: '镜头 ' + s.shot })
        ),
        el('div', { class: 'shot-grid' },
          el('span', { class: 'k', text: '环境' }),     el('span', { text: s.env }),
          el('span', { class: 'k', text: '光向/色温' }), el('span', { text: s.light }),
          el('span', { class: 'k', text: '色调' }),     el('span', { text: s.tone }),
          el('span', { class: 'k', text: '胶片质感' }), el('span', { text: s.film })
        )
      ));
    });
    return wrap;
  }

  function renderKling(b) {
    const wrap = el('div', { class: 'block-shots' });
    (b.items || []).forEach(s => {
      wrap.appendChild(el('article', { class: 'shot-card' },
        el('div', { class: 'shot-head' },
          el('span', { class: 'shot-num', text: '镜头 ' + s.shot }),
          el('span', { class: 'shot-dur', text: s.dur }),
          el('span', { class: 'shot-move', text: '幅度：' + s.amp })
        ),
        el('div', { class: 'shot-perf', text: s.text }),
        el('div', { class: 'shot-grid' },
          el('span', { class: 'k', text: '增强设置' }), el('span', { text: s.boost })
        )
      ));
    });
    return wrap;
  }

  function renderPrompts(b) {
    const wrap = el('div', { class: 'block-prompts' });
    (b.prompts || []).forEach(p => {
      const card = el('div', { class: 'prompt-card' });
      const copyBtn = el('button', { class: 'prompt-mini-copy', text: '复制' });
      copyBtn.addEventListener('click', () => {
        KW.copy(p.body);
        copyBtn.classList.add('copied');
        copyBtn.textContent = '已复制';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = '复制';
        }, 1500);
      });
      card.appendChild(el('div', { class: 'prompt-head' },
        el('span', { class: 'label', text: p.label }),
        copyBtn
      ));
      card.appendChild(el('div', { class: 'prompt-body', text: p.body }));
      wrap.appendChild(card);
    });
    return wrap;
  }

  function renderPlatforms(b) {
    const wrap = el('div', { class: 'block-platforms' });
    const entries = Object.entries(b.platforms || {});
    const tabs = el('div', { class: 'platform-tabs' });
    const panels = [];
    entries.forEach(([key, p], i) => {
      const tabBtn = el('button', {
        class: 'platform-tab' + (i === 0 ? ' active' : ''),
        data: { platform: key }, text: p.name
      });
      tabs.appendChild(tabBtn);
      const panel = el('div', { class: 'platform-panel' + (i === 0 ? ' active' : ''), data: { platform: key } });
      panel.appendChild(el('dl', { class: 'block-kv', style: 'margin-bottom: 0' },
        el('dt', { text: '标题' }),   el('dd', { text: p.title }),
        el('dt', { text: '正文 / 描述' }), el('dd', { text: p.desc, style: 'white-space: pre-wrap' }),
        el('dt', { text: '话题标签' }), el('dd', { text: (p.tags || []).join(' ') }),
        el('dt', { text: '发布时间' }), el('dd', { text: p.time }),
        p.pinned ? el('dt', { text: '评论区钉顶' }) : null,
        p.pinned ? el('dd', { text: p.pinned }) : null
      ));
      panels.push(panel);
      tabBtn.addEventListener('click', () => {
        tabs.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
        tabBtn.classList.add('active');
        panels.forEach(p => p.classList.remove('active'));
        panel.classList.add('active');
      });
    });
    wrap.appendChild(tabs);
    panels.forEach(p => wrap.appendChild(p));
    return wrap;
  }

  // ===== 8. 微反馈条 =====
  function renderFeedbackBar(m, order) {
    const fb = (order.feedback || {}).moduleLikes || {};
    const issues = (order.feedback || {}).moduleIssues || {};
    const cur = fb[m.num];

    const bar = el('div', { class: 'fb-bar' });
    bar.appendChild(el('span', { class: 'fb-label', text: '这模块有用吗？' }));

    const upBtn = el('button', { class: 'fb-btn' + (cur === 'up' ? ' active up' : ''), data: { v: 'up' } },
      el('span', { class: 'em', text: '👍' }),
      el('span', { text: '有用' })
    );
    const downBtn = el('button', { class: 'fb-btn' + (cur === 'down' ? ' active down' : ''), data: { v: 'down' } },
      el('span', { class: 'em', text: '👎' }),
      el('span', { text: '需要改进' })
    );

    const issuesBox = el('div', { class: 'fb-issues' + (cur === 'down' ? ' show' : '') });
    issuesBox.appendChild(el('span', { class: 'fb-issues-label', text: '哪里不好？' }));
    ['脚本', '分镜', '提示词', '旁白', '剪辑', '其他'].forEach(tag => {
      const on = (issues[m.num] || []).includes(tag);
      const t = el('button', { class: 'fb-tag' + (on ? ' on' : '') }, tag);
      t.addEventListener('click', () => {
        const cur2 = ((KW_DL.getOrder(state.order.id) || {}).feedback || {}).moduleIssues || {};
        const list = new Set(cur2[m.num] || []);
        if (list.has(tag)) list.delete(tag); else list.add(tag);
        const patch = { moduleIssues: {} };
        patch.moduleIssues[m.num] = Array.from(list);
        KW_DL.updateOrderFeedback(state.order.id, patch);
        t.classList.toggle('on');
      });
      issuesBox.appendChild(t);
    });

    upBtn.addEventListener('click', () => onLike(m, 'up', upBtn, downBtn, issuesBox));
    downBtn.addEventListener('click', () => onLike(m, 'down', upBtn, downBtn, issuesBox));

    bar.appendChild(upBtn);
    bar.appendChild(downBtn);
    bar.appendChild(issuesBox);
    return bar;
  }

  function onLike(m, v, upBtn, downBtn, issuesBox) {
    const order = KW_DL.getOrder(state.order.id);
    const cur = (order.feedback || {}).moduleLikes || {};
    const prev = cur[m.num];
    const next = prev === v ? null : v;  // 再次点击取消
    const patch = { moduleLikes: {} };
    patch.moduleLikes[m.num] = next;
    // 重新计算 active 状态
    upBtn.classList.toggle('active', next === 'up');
    upBtn.classList.toggle('up',     next === 'up');
    downBtn.classList.toggle('active', next === 'down');
    downBtn.classList.toggle('down',   next === 'down');
    issuesBox.classList.toggle('show', next === 'down');
    KW_DL.updateOrderFeedback(state.order.id, patch);

    // 联动到对应原子：根据状态变化计算 delta
    const atomType = ATOM_TYPE_BY_MODULE[m.num];
    if (atomType) {
      // 计算每个原子要变多少分
      const delta =
        (next === 'up'   ? +1 : 0) +
        (next === 'down' ? -1 : 0) -
        (prev === 'up'   ? +1 : 0) -
        (prev === 'down' ? -1 : 0);
      if (delta !== 0) {
        const atoms = KW_DL.getAtomsByOrder(state.order.id).filter(a => a.type === atomType);
        atoms.forEach(a => KW_DL.bumpAtomRating(a.id, delta));
      }
    }

    if (next === 'up')   KW.toast('已记下 · 这条原子在方法论库里 +1 分');
    if (next === 'down') KW.toast('感谢反馈 · 标出"哪里不好"会让原子库更精准');
  }

  // ===== 9. 复制模块 =====
  function copyModule(m, btn) {
    const lines = [];
    lines.push(`【模块 ${m.num}】${m.icon || ''} ${m.title}`);
    lines.push('');
    visibleBlocks(m).forEach(b => {
      const txt = serializeBlock(b);
      if (txt) { lines.push(txt); lines.push(''); }
    });
    lines.push('— 来自 开物工单·' + (DEPTH_LEVELS[state.depth].name) + ' —');
    KW.copy(lines.join('\n'));
    btn.classList.add('copied');
    const original = btn.textContent;
    btn.textContent = '已复制';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = original;
    }, 1500);

    _moduleCopyCount++;
    KW_DL.logEvent('result.module.copy', {
      moduleId: m.num,
      moduleNum: m.num,
      orderId: state.order.id,
      depth: state.depth,
      totalCopies: _moduleCopyCount
    });
  }

  function serializeBlock(b) {
    switch (b.type) {
      case 'long':
        return (b.label ? '[' + b.label + ']\n' : '') + b.text;
      case 'kv':
        return (b.items || []).map(i => `• ${i.k}：${i.v}`).join('\n');
      case 'list':
        return (b.heading ? b.heading + '：\n' : '') + (b.items || []).map(t => '  - ' + t).join('\n');
      case 'note':
        return '⚠️ ' + b.text;
      case 'shots':
        return (b.shots || []).map(s => {
          const lines = [
            `镜头 ${s.num} | ${s.durLabel || s.durSec + 's'} | ${s.move} | ${s.enter} → ${s.exit}`,
            `表演：${s.perf}`
          ];
          if (state.depth === 'master') {
            if (s.masterBeat)  lines.push(`节拍：${s.masterBeat}`);
            if (s.masterEnter) lines.push(`入画：${s.masterEnter}`);
            if (s.masterExit)  lines.push(`出画：${s.masterExit}`);
          }
          return lines.join('\n');
        }).join('\n\n');
      case 'scenes':
        return (b.items || []).map(s =>
          `镜头 ${s.shot}\n  环境：${s.env}\n  光向/色温：${s.light}\n  色调：${s.tone}\n  胶片：${s.film}`).join('\n\n');
      case 'kling':
        return (b.items || []).map(s =>
          `镜头 ${s.shot} | 幅度 ${s.amp} | ${s.dur}\n  运镜：${s.text}\n  增强：${s.boost}`).join('\n\n');
      case 'prompts':
        return (b.prompts || []).map(p => `【${p.label}】\n${p.body}`).join('\n\n');
      case 'platforms':
        return Object.entries(b.platforms || {}).map(([key, p]) => {
          const arr = [
            `─── ${p.name} ───`,
            `标题：${p.title}`,
            `正文：${p.desc}`,
            `话题：${(p.tags || []).join(' ')}`,
            `时间：${p.time}`
          ];
          if (p.pinned) arr.push(`钉顶：${p.pinned}`);
          return arr.join('\n');
        }).join('\n\n');
      default: return '';
    }
  }

  // ===== 10. 底部按钮 =====
  function bindFooter() {
    qs('#btnSave').addEventListener('click', () => {
      // 已经自动保存到 history（KW_DL.saveOrder 在 ensureOutput 阶段）
      KW.toast('已保存到历史 · 可在「历史」入口随时查看', 'success');
      KW_DL.logEvent('result.save', { id: state.order.id });
    });
    qs('#btnRegen').addEventListener('click', () => {
      if (!confirm('重新生成会基于当前回答再跑一次。继续？')) return;
      KW_DL.logEvent('result.regen', { id: state.order.id });
      // 复用同一个 inputs 跑新工单：直接清掉 output → 让进入 result 时重新生成
      const fresh = KW_DL.updateOrder(state.order.id, { output: null });
      state.order = fresh;
      state.order = ensureOutput(state.order);
      renderAll();
      KW.toast('已重新生成 · 内容已更新');
    });
    qs('#btnMadeIt').addEventListener('click', () => openFeedbackModal());

    // Modal
    qs('#fbCancel').addEventListener('click', closeFeedbackModal);
    qs('#fbSubmit').addEventListener('click', submitFeedback);
    const closeSuccess = qs('#fbCloseSuccess');
    if (closeSuccess) closeSuccess.addEventListener('click', closeFeedbackModal);
    qsa('.star').forEach((s, i) => {
      s.addEventListener('click', () => setRating(i + 1));
    });
    // 点遮罩关闭
    qs('#feedbackModal').addEventListener('click', e => {
      if (e.target.id === 'feedbackModal') closeFeedbackModal();
    });
  }

  function openFeedbackModal() {
    const order = KW_DL.getOrder(state.order.id);
    const fb = order.feedback || {};
    // 重置为表单态
    qs('#fbBoxForm').style.display = '';
    qs('#fbBoxSuccess').style.display = 'none';
    // 预填工单标题作为作品标题候选
    const wt = qs('#fbWorkTitle');
    if (wt) wt.value = order.title || '';
    qs('#fbUrl').value = fb.resultUrl || '';
    const thoughts = qs('#fbThoughts');
    if (thoughts) thoughts.value = fb.comment || '';
    ['fbViews','fbLikes','fbComments','fbCreatorName'].forEach(id => { const e = qs('#' + id); if (e) e.value = ''; });
    const pub = qs('#fbIsPublic'); if (pub) pub.checked = true;
    setRating(fb.rating || 0);
    qs('#feedbackModal').classList.add('show');
    KW_DL.logEvent('result.madeIt.open', { id: state.order.id });
  }
  function closeFeedbackModal() {
    qs('#feedbackModal').classList.remove('show');
  }
  let _rating = 0;
  function setRating(n) {
    _rating = n;
    qsa('.star').forEach((s, i) => s.classList.toggle('on', i < n));
  }
  function submitFeedback() {
    const url       = qs('#fbUrl').value.trim();
    const workTitle = qs('#fbWorkTitle').value.trim();
    const thoughts  = qs('#fbThoughts').value.trim();
    const views     = qs('#fbViews').value.trim();
    const likes     = qs('#fbLikes').value.trim();
    const comments  = qs('#fbComments').value.trim();
    const creator   = qs('#fbCreatorName').value.trim();
    const isPublic  = qs('#fbIsPublic').checked;

    if (!workTitle) { KW.toast('给作品起个标题吧'); return; }
    if (!url)       { KW.toast('请填上成片链接'); return; }

    const metrics = (views || likes || comments) ? {
      views:    views    ? Number(views.replace(/[^\d]/g,''))    || views    : null,
      likes:    likes    ? Number(likes.replace(/[^\d]/g,''))    || likes    : null,
      comments: comments ? Number(comments.replace(/[^\d]/g,'')) || comments : null
    } : null;

    // 1) 工单 feedback
    KW_DL.updateOrderFeedback(state.order.id, {
      madeIt: true,
      resultUrl: url,
      rating: _rating || null,
      comment: thoughts
    });
    // 2) 案例库（完整创作过程）
    KW_DL.addCase({
      orderId: state.order.id,
      workTitle,
      resultUrl: url,
      rating: _rating || null,
      metrics, thoughts, isPublic,
      creatorName: creator || null
    });
    // 3) 原子成功度
    const atoms = KW_DL.getAtomsByOrder(state.order.id);
    atoms.forEach(a => KW_DL.bumpAtomSuccess(a.id));
    KW_DL.logEvent('atom.batch.success', { orderId: state.order.id, count: atoms.length });

    // 4) 成功态：累计份数 + 训练数据规模
    const totalCases = KW_DL.getCaseCount();
    const dataSize = (KW_DL.getAtoms() || []).length +
                     totalCases * 5 +
                     (KW_DL.exportAllData().events || []).length;
    qs('#fbTotalCases').textContent = totalCases;
    qs('#fbTotalSize').textContent  = dataSize;
    qs('#fbBoxForm').style.display = 'none';
    qs('#fbBoxSuccess').style.display = '';
  }

  // ===== 行为信号收集 =====
  let _moduleCopyCount = 0;
  function bindBehaviorSignals() {
    // 停留时长：页面卸载时记一次
    window.addEventListener('beforeunload', () => {
      const stay = Math.round((Date.now() - state.enterAt) / 1000);
      if (window.KW_DL) {
        KW_DL.logEvent('result.stay', { seconds: stay, orderId: state.order.id, depth: state.depth });
        KW_DL.logEvent('result.exit', { type: 'unload', stayTime: stay, orderId: state.order.id });
      }
    });
    // 可见性切换：tab 切走也算"软退出"
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && window.KW_DL) {
        const stay = Math.round((Date.now() - state.enterAt) / 1000);
        KW_DL.logEvent('result.exit', { type: 'hidden', stayTime: stay, orderId: state.order.id });
      }
    });
  }

  // ===== 11. 启动 =====
  function renderAll() {
    renderHero(state.order);
    renderDepth();
    renderToc(state.order);
    renderModules(state.order);
  }

  // ===== DEMO 模式 =====
  function initDemo() {
    const dir = (KW.query('dir') || 'comic').toLowerCase();
    const DEMO_META = {
      comic: { name: '条漫制作', sample: '《错位》四格 · 关于看不见彼此的两个人' },
      drama: { name: '短剧制作', sample: '《电梯里的 30 秒》· 一次没说出口的告白' },
      other: { name: '其他场景', sample: '城市夜跑品牌片 · 给坚持的人一束光' }
    };
    const meta = DEMO_META[dir] || DEMO_META.comic;

    // 用电商模板引擎生成一份"结构完整"的示例工单（仅展示工单长什么样）
    const gen = RESULT_TEMPLATES.generate(
      { product_name: meta.sample, duration: '30s' }, {}
    );
    const order = {
      id: 'demo-' + dir,
      createdAt: Date.now(),
      direction: dir,
      title: meta.name + ' · DEMO 示例工单',
      inputs: { duration: '30s', _demo: true },
      output: gen,
      feedback: { moduleLikes: {}, moduleIssues: {} },
      _demo: true
    };
    state.order = order;
    state.depth = 'standard';
    state.enterAt = Date.now();

    showDemoBanner(meta.name);
    renderHero(order);
    renderDepth();
    renderToc(order);
    renderModules(order);
    bindDemoFooter();

    if (window.KW_DL) KW_DL.logEvent('demo.result.viewed', { dir });
  }

  function showDemoBanner(dirName) {
    const main = qs('.result-main');
    if (!main) return;
    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.innerHTML =
      '<span class="db-icon">🔒</span>' +
      '<span class="db-text">这是「' + (dirName || 'DEMO') + '」的 <strong>DEMO 示例工单</strong> · ' +
      '完整版（自定义问答 + 真实生成）将在<strong>会员版</strong>开放</span>' +
      '<a class="db-cta" href="membership.html">了解会员 →</a>';
    main.insertBefore(banner, main.firstChild);
  }

  function bindDemoFooter() {
    // demo 下：把底部三按钮替换成"用电商体验完整版 / 看会员"
    const footer = qs('.result-footer');
    if (footer) {
      footer.innerHTML =
        '<div class="rf-text">想要针对你自己内容的完整工单？<br/>电商带货方向现在就能免费体验完整流程。</div>' +
        '<div class="rf-actions">' +
          '<a class="btn-glow ghost" href="question.html?dir=ecom">免费体验电商完整版</a>' +
          '<a class="btn-glow primary" href="membership.html">解锁全部方向 →</a>' +
        '</div>';
    }
    // demo 下隐藏底部原子小字
    const notice = qs('#atomNotice');
    if (notice) notice.style.display = 'none';
  }

  function init() {
    // DEMO 模式分支
    if (KW.query('mode') === 'demo') {
      initDemo();
      return;
    }
    let order = loadOrder();
    if (!order) {
      qs('#emptyState').style.display = 'block';
      qs('#resultMainContent').style.display = 'none';
      return;
    }
    order = ensureOutput(order);
    // 进入 result 页 = 草稿已经走完，标记为 completed
    if (window.KW_DL) KW_DL.markDraftCompleted();
    // 自动解构成原子（首次访问时，后台静默执行）
    decomposeToAtoms(order);
    state.order = order;
    state.enterAt = Date.now();
    renderAll();
    bindFooter();
    bindBehaviorSignals();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
