/* 开物 · 失败修复库 详情页
 * 渲染单个症状的所有场景 + 急救方案 + 复制 + 三选反馈接入训练数据
 */

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

  let CURRENT = null;          // 当前症状对象
  let SCENE_VOTES = {};        // 当前页面用户对每个场景的投票记录 { sceneId: 'solved'|'partial'|'failed' }

  function init() {
    const id = KW.query('id');
    const s = RESCUE_DATA.getSymptom(id);
    if (!s) {
      qs('#detailMain').style.display = 'none';
      qs('#emptyState').style.display = 'block';
      return;
    }
    CURRENT = s;

    // 设置主题色 CSS 变量
    document.body.style.setProperty('--sc-from', s.gradFrom);
    document.body.style.setProperty('--sc-to',   s.gradTo);

    // 进入页面 → 记一条 'opened' (区别于入口卡的 'viewed')
    if (window.KW_DL) {
      KW_DL.logRescueUsage(s.id, null, 'opened');
      // 同时把 8 症状每条都先确保有一条 type='rescue' 原子（用于未来 rating 累积）
      ensureRescueAtoms();
    }

    renderHero(s);
    renderScenes(s);
    renderOthers(s);
  }

  function renderHero(s) {
    const box = qs('#rsdHero');
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'rsd-symbol', text: s.icon }));
    box.appendChild(el('div', { class: 'rsd-info' },
      el('div', { class: 'rsd-pill', text: 'SYMPTOM · 症状 #' + (RESCUE_DATA.symptoms.findIndex(x => x.id === s.id) + 1) }),
      el('h1', { class: 'rsd-title', text: s.title }),
      el('p',  { class: 'rsd-summary', text: s.summary })
    ));
  }

  function renderScenes(s) {
    const box = qs('#rsdScenes');
    box.innerHTML = '';
    s.scenes.forEach((scene, i) => {
      box.appendChild(renderScene(s, scene, i));
    });
  }

  function renderScene(symptom, scene, idx) {
    const card = el('article', { class: 'scene-card', id: 'sc-' + scene.id });
    // 头
    card.appendChild(el('div', { class: 'scene-head' },
      el('div', { class: 'scene-num', text: String(idx + 1).padStart(2, '0') }),
      el('div', { class: 'scene-name' },
        el('h3', { text: scene.title }),
        el('div', { class: 'scene-when', text: scene.when })
      )
    ));

    // 急救方案
    const fix = scene.fix || {};
    const fixBox = el('div', { class: 'scene-fix' });
    const copyBtn = el('button', { class: 'btn-copy-fix', text: '一键复制方案' });
    copyBtn.addEventListener('click', () => copyFix(symptom, scene, copyBtn));
    fixBox.appendChild(el('div', { class: 'fix-head' },
      el('span', { class: 'fix-heading', text: fix.heading || '急救步骤' }),
      copyBtn
    ));
    if (fix.steps && fix.steps.length) {
      const ol = el('ol', { class: 'fix-steps' });
      fix.steps.forEach(t => ol.appendChild(el('li', { text: t })));
      fixBox.appendChild(ol);
    }
    if (fix.params || fix.negative) {
      const meta = el('div', { class: 'fix-meta' });
      if (fix.params) {
        meta.appendChild(el('span', { class: 'k', text: '参数' }));
        meta.appendChild(el('span', { html: highlightCode(fix.params) }));
      }
      if (fix.negative) {
        meta.appendChild(el('span', { class: 'k', text: '负面提示词' }));
        meta.appendChild(el('span', { html: highlightCode(fix.negative) }));
      }
      fixBox.appendChild(meta);
    }
    card.appendChild(fixBox);

    // 反馈条
    card.appendChild(renderFeedback(symptom, scene));

    // 成功案例占位
    card.appendChild(el('div', { class: 'scene-case' },
      el('span', { class: 'em', text: '🎬' }),
      el('div', { html: '<strong>成功案例：</strong>看他们用这个方法后做出的成品（即将开放 · 等签约创作者作品上线）' })
    ));

    return card;
  }

  function highlightCode(text) {
    if (!text) return '';
    // 简单把每个英文 token 或参数=值 用 code 包一下
    return esc(text)
      .replace(/(Seed|CFG|Steps|Sampler|DPM\+\+ 2M Karras)/g, '<code>$1</code>')
      .replace(/(\d+\.\d+|\d+%|\d+s)/g, '<code>$1</code>');
  }

  function renderFeedback(symptom, scene) {
    const bar = el('div', { class: 'scene-feedback', data: { sceneId: scene.id } });
    bar.appendChild(el('span', { class: 'fb-q', text: '这个方案有用吗？' }));

    const VOTES = [
      { v: 'solved',  label: '👍 有用',     cls: 'solved'  },
      { v: 'partial', label: '🤔 部分有用', cls: 'partial' },
      { v: 'failed',  label: '👎 没用',     cls: 'failed'  }
    ];
    const buttons = {};
    VOTES.forEach(opt => {
      const btn = el('button', { class: 'fb-vote', data: { v: opt.v }, text: opt.label });
      btn.addEventListener('click', () => onVote(symptom, scene, opt.v, buttons, bar));
      buttons[opt.v] = btn;
      bar.appendChild(btn);
    });

    // 失败时收集反馈的表单（默认隐藏）
    const form = el('div', { class: 'fb-failed-form' },
      el('label', { text: '说说哪里不对（你的真实情况会让方案库更精准）' }),
      el('textarea', { id: 'failedReason_' + scene.id, placeholder: '比如：人脸还是畸变，加了 detailed face 反而更糊 / 重绘强度调到 0.5 也没用 / 即梦不支持那个参数 ...' }),
      el('div', { class: 'submit-row' },
        el('button', { class: 'fb-submit', text: '提交反馈',
          onClick: () => submitFailed(symptom, scene) })
      )
    );
    bar.appendChild(form);
    return bar;
  }

  function onVote(symptom, scene, vote, buttons, bar) {
    const prev = SCENE_VOTES[scene.id];
    const next = prev === vote ? null : vote;
    SCENE_VOTES[scene.id] = next;

    // 视觉
    Object.entries(buttons).forEach(([k, btn]) => {
      btn.classList.toggle('active', k === next);
      btn.classList.toggle(k, k === next);
    });
    bar.querySelector('.fb-failed-form').classList.toggle('show', next === 'failed');

    if (!next) {
      // 取消投票时不再 log（避免噪音）
      return;
    }

    // 写训练数据
    if (window.KW_DL) {
      KW_DL.logRescueUsage(symptom.id, scene.id, next);
      // 更新对应 rescue 原子的 rating / successCount
      const atomId = atomKeyFor(symptom.id, scene.id);
      const list = KW_DL.getAtoms({ type: 'rescue' });
      const atom = list.find(a => a.content && a.content.key === atomKeyFor(symptom.id, scene.id));
      if (atom) {
        if (next === 'solved')  { KW_DL.bumpAtomRating(atom.id, +1); KW_DL.bumpAtomSuccess(atom.id); }
        if (next === 'partial') { KW_DL.bumpAtomRating(atom.id,  0); }
        if (next === 'failed')  { KW_DL.bumpAtomRating(atom.id, -1); }
      }
    }

    if (next === 'solved')  KW.toast('谢谢！这一条会在方法论库里 +1 分', 'success');
    if (next === 'partial') KW.toast('收到 · 我们会标"部分有用"再优化');
    if (next === 'failed')  KW.toast('感谢！说说哪里不对，会帮我们更准');
  }

  function submitFailed(symptom, scene) {
    const ta = qs('#failedReason_' + scene.id);
    const text = (ta.value || '').trim();
    if (!text) {
      KW.toast('写几句话再提交吧');
      return;
    }
    if (window.KW_DL) {
      KW_DL.logRescueUsage(symptom.id, scene.id, 'failed', { feedback: text });
    }
    ta.value = '';
    KW.toast('已提交 · 你的反馈会让方案库更精准', 'success');
  }

  function copyFix(symptom, scene, btn) {
    const lines = [];
    lines.push('【急救方案】' + scene.title);
    lines.push('（来自开物·失败修复库 · 症状：' + symptom.title + '）');
    lines.push('');
    if (scene.when) lines.push('触发时机：' + scene.when);
    if (scene.fix && scene.fix.heading) lines.push('—— ' + scene.fix.heading + ' ——');
    if (scene.fix && scene.fix.steps) {
      scene.fix.steps.forEach((t, i) => lines.push((i + 1) + '. ' + t));
    }
    if (scene.fix && scene.fix.params)   lines.push('参数：' + scene.fix.params);
    if (scene.fix && scene.fix.negative) lines.push('负面提示词：' + scene.fix.negative);
    KW.copy(lines.join('\n'));
    btn.classList.add('copied');
    const orig = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = orig; }, 1500);

    if (window.KW_DL) {
      KW_DL.logRescueUsage(symptom.id, scene.id, 'attempted');
    }
  }

  function renderOthers(curr) {
    const box = qs('#rsdOthersGrid');
    box.innerHTML = '';
    RESCUE_DATA.symptoms.filter(s => s.id !== curr.id).forEach(s => {
      const a = el('a', {
        class: 'rsd-other',
        href: 'rescue-detail.html?id=' + encodeURIComponent(s.id),
        onClick: () => {
          if (window.KW_DL) KW_DL.logRescueUsage(s.id, null, 'viewed');
        }
      },
        el('span', { class: 'em', text: s.icon }),
        el('span', { class: 'nm', text: s.title })
      );
      box.appendChild(a);
    });
  }

  function atomKeyFor(symptomId, sceneId) {
    return 'rescue:' + symptomId + ':' + sceneId;
  }

  // 确保每个症状的每个场景都有一条 rescue 原子（用于聚合 rating）
  function ensureRescueAtoms() {
    const existing = KW_DL.getAtoms({ type: 'rescue' });
    const have = new Set(existing.map(a => a.content && a.content.key).filter(Boolean));
    RESCUE_DATA.symptoms.forEach(s => {
      s.scenes.forEach(sc => {
        const key = atomKeyFor(s.id, sc.id);
        if (have.has(key)) return;
        KW_DL.saveAtom({
          type: 'rescue',
          source: 'team',
          content: {
            key,
            symptom: s.id,
            scene: sc.id,
            title: sc.title,
            fix: sc.fix
          },
          tags: ['rescue', s.id],
          useCount: 0,
          rating: 0,
          successCount: 0
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
