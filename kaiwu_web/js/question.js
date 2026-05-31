/* 开物 · 问答页交互（电商带货 8 题） */

(function () {
  'use strict';

  // ====== 电商带货问题集 ======
  const ECOM_QUESTIONS = [
    {
      id: 'product_type',
      title: '你要推广什么产品？',
      type: 'choice',
      options: [
        { value: 'bag',     icon: '👜', label: '包包/配饰' },
        { value: 'cloth',   icon: '👗', label: '衣服/鞋子' },
        { value: 'beauty',  icon: '💄', label: '美妆/护肤' },
        { value: 'food',    icon: '🍜', label: '食品/饮品' },
        { value: 'course',  icon: '📚', label: '课程/知识' },
        { value: 'local',   icon: '🏪', label: '本地门店/服务' },
        { value: 'other',   icon: '📦', label: '其他产品' }
      ]
    },
    {
      id: 'product_name',
      title: '产品叫什么名字？',
      type: 'text',
      placeholder: '例如：夏季通勤托特包、冰淇淋抹茶拿铁……',
      helper: '简短一句话即可，越具体越好'
    },
    {
      id: 'selling_point',
      title: '产品最大卖点是什么？',
      type: 'choice',
      multi: true,
      max: 3,
      multiHint: '可多选 · 主卖点 1 + 辅卖点最多 2',
      options: [
        { value: 'price',   icon: '💰', label: '价格实惠' },
        { value: 'beauty',  icon: '✨', label: '颜值高好看' },
        { value: 'durable', icon: '🔧', label: '实用耐用' },
        { value: 'gift',    icon: '🎁', label: '送礼有面子' },
        { value: 'quality', icon: '⭐', label: '品质口碑好' },
        { value: 'pain',    icon: '💊', label: '解决痛点' }
      ]
    },
    {
      id: 'audience',
      title: '主要卖给谁？',
      type: 'choice',
      multi: true,
      max: 2,
      multiHint: '可多选 · 最多 2 个人群',
      options: [
        { value: 'mom',     icon: '👩‍👧', label: '宝妈/家庭' },
        { value: 'student', icon: '🎓', label: '学生党' },
        { value: 'worker',  icon: '💼', label: '上班族' },
        { value: 'couple',  icon: '💑', label: '情侣/恋人' },
        { value: 'starter', icon: '🚀', label: '创业者' },
        { value: 'senior',  icon: '👴', label: '中老年' }
      ]
    },
    {
      id: 'budget',
      title: '你打算怎么投入制作？',
      type: 'choice',
      options: [
        { value: 'free_ai',    icon: '🤖', label: '0预算，全AI生成' },
        { value: 'paid_tool',  icon: '💳', label: '有预算买工具会员' },
        { value: 'self_show',  icon: '🎥', label: '我自己出镜口播' },
        { value: 'team',       icon: '👥', label: '有素材有团队' }
      ]
    },
    {
      id: 'style',
      title: '视频是什么风格？',
      type: 'choice',
      options: [
        { value: 'plant',     icon: '🌸', label: '种草分享' },
        { value: 'review',    icon: '🔍', label: '测评对比' },
        { value: 'oral',      icon: '🎙️', label: '直接口播' },
        { value: 'drama',     icon: '🎭', label: '剧情反转' },
        { value: 'scene',     icon: '🏙️', label: '场景展示' },
        { value: 'premium',   icon: '💫', label: '高级感' }
      ]
    },
    {
      id: 'platform',
      title: '准备发到哪个平台？',
      type: 'choice',
      multi: true,
      multiHint: '可多选 · 同一稿可以多平台分发',
      options: [
        { value: 'douyin',    icon: '🎵', label: '抖音' },
        { value: 'xhs',       icon: '📕', label: '小红书' },
        { value: 'wechat',    icon: '📺', label: '视频号' },
        { value: 'kuaishou',  icon: '⚡', label: '快手' }
      ]
    },
    {
      id: 'duration',
      title: '想做多长的视频？',
      type: 'choice',
      options: [
        { value: '15s',  icon: '⚡', label: '15 秒' },
        { value: '30s',  icon: '🔥', label: '30 秒' },
        { value: '60s',  icon: '✅', label: '60 秒' },
        { value: '90s',  icon: '📖', label: '90 秒以上' }
      ]
    },
    {
      id: 'specialNeeds',
      title: '还有什么想告诉我们的特殊要求？',
      type: 'text',
      optional: true,
      placeholder: '比如：希望镜头慢一些 · 不想要旁白 · 想突出包包的金属配件 · 想要做成"她视角" ...',
      helper: '这一题不是必填。如果填了，我们会把它当作"长尾需求"特别标注，用来训练更懂你的方法论。'
    }
  ];

  // ====== 状态 ======
  // ====== DEMO 题集（3 题简化版，用于 comic/drama/other 体验） ======
  const DEMO_QUESTIONS = {
    comic: [
      { id: 'theme', title: '你的故事主题是什么？', type: 'choice', options: [
        { value: 'growth',   icon: '🌱', label: '成长治愈' },
        { value: 'romance',  icon: '💕', label: '恋爱甜宠' },
        { value: 'suspense', icon: '🔍', label: '悬疑反转' },
        { value: 'daily',    icon: '☕', label: '日常搞笑' } ] },
      { id: 'style', title: '想要什么画风？', type: 'choice', options: [
        { value: 'jp',  icon: '🌸', label: '日系漫画' },
        { value: 'cn',  icon: '🏮', label: '国漫水墨' },
        { value: 'q',   icon: '🐱', label: 'Q 版萌系' },
        { value: 'ins', icon: '🎨', label: 'INS 插画' } ] },
      { id: 'length', title: '打算做多长？', type: 'choice', options: [
        { value: '4',  icon: '⚡', label: '4 格' },
        { value: '8',  icon: '🔥', label: '8 格' },
        { value: '12', icon: '📖', label: '12 格' } ] }
    ],
    drama: [
      { id: 'genre', title: '剧情是什么类型？', type: 'choice', options: [
        { value: 'sweet',   icon: '💞', label: '甜宠恋爱' },
        { value: 'revenge', icon: '⚔️', label: '逆袭打脸' },
        { value: 'suspense',icon: '🕵️', label: '悬疑烧脑' },
        { value: 'family',  icon: '🏠', label: '家庭伦理' } ] },
      { id: 'duration', title: '单集时长？', type: 'choice', options: [
        { value: '60s',  icon: '⚡', label: '60 秒竖屏' },
        { value: '3min', icon: '🔥', label: '3 分钟' },
        { value: '5min', icon: '📺', label: '5 分钟+' } ] },
      { id: 'tone', title: '整体风格基调？', type: 'choice', options: [
        { value: 'realistic', icon: '🎬', label: '写实电影感' },
        { value: 'bright',    icon: '☀️', label: '明亮青春' },
        { value: 'dark',      icon: '🌙', label: '暗黑高级' } ] }
    ],
    other: [
      { id: 'type', title: '你要做什么内容？', type: 'choice', options: [
        { value: 'promo',   icon: '📣', label: '宣传片' },
        { value: 'science', icon: '🔬', label: '科普内容' },
        { value: 'course',  icon: '📚', label: '课程讲解' },
        { value: 'brand',   icon: '✨', label: '品牌叙事' } ] },
      { id: 'platform', title: '主要发哪个平台？', type: 'choice', options: [
        { value: 'douyin', icon: '🎵', label: '抖音' },
        { value: 'xhs',    icon: '📕', label: '小红书' },
        { value: 'bili',   icon: '📺', label: 'B 站' },
        { value: 'wechat', icon: '💬', label: '视频号' } ] },
      { id: 'goal', title: '核心目标是？', type: 'choice', options: [
        { value: 'awareness', icon: '👁️', label: '提升认知' },
        { value: 'convert',   icon: '💰', label: '促进转化' },
        { value: 'brand',     icon: '🏆', label: '塑造品牌' } ] }
    ]
  };

  const dir = (KW.query('dir') || 'ecom').toLowerCase();
  const isDemo = KW.query('mode') === 'demo' && dir !== 'ecom';
  const dirMeta = (KW.directions && KW.directions[dir]) || KW.directions.ecom;
  const QUESTIONS = isDemo ? (DEMO_QUESTIONS[dir] || DEMO_QUESTIONS.comic) : ECOM_QUESTIONS;

  const state = {
    dir,
    questions: QUESTIONS,
    index: 0,
    answers: {}
  };

  // ====== 工具 ======
  const qs  = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ====== 草稿（状态机：in_progress → completed） ======
  function loadDraft() {
    if (isDemo) return;   // demo 模式不读草稿，永远从头开始
    if (!window.KW_DL) return;
    const d = KW_DL.getDraft();
    if (!d) return;
    // 已完成的工单不再恢复中间状态 — 清掉重来
    if (d.status === 'completed') {
      KW_DL.clearDraft();
      return;
    }
    // in_progress 且方向匹配 → 恢复
    if (d.dir === dir && d.answers) {
      state.index   = Math.min(d.index || 0, QUESTIONS.length - 1);
      state.answers = d.answers || {};
    }
  }
  function saveDraft(notify) {
    if (isDemo) return;   // demo 模式不写草稿
    if (window.KW_DL) {
      KW_DL.saveDraft({
        dir: state.dir,
        index: state.index,
        answers: state.answers
      }, 'in_progress');
    }
    // 旧兼容：同时写一份到 KWStorage
    if (window.KWStorage) {
      KWStorage.saveDraft({
        dir: state.dir, index: state.index, answers: state.answers, ts: Date.now()
      });
    }
    if (notify) KW.toast('草稿已保存，下次回来继续填', 'success');
  }

  // ====== 渲染：进度条 ======
  function renderProgress() {
    const prog = qs('#qaProgress');
    prog.innerHTML = '';
    for (let i = 0; i < QUESTIONS.length; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.textContent = i + 1;
      if (i < state.index) dot.classList.add('done');
      if (i === state.index) dot.classList.add('current');
      prog.appendChild(dot);
      if (i < QUESTIONS.length - 1) {
        const line = document.createElement('div');
        line.className = 'line';
        if (i < state.index) line.classList.add('done');
        prog.appendChild(line);
      }
    }
  }

  // ====== 渲染：当前题目 ======
  function renderQuestion() {
    const q = QUESTIONS[state.index];
    const stage = qs('#stage');
    const ans = state.answers[q.id];
    const ansArr = Array.isArray(ans) ? ans : (ans != null ? [ans] : []);

    // 多选副标
    let multiBadge = '';
    if (q.multi) {
      const max = q.max || q.options.length;
      multiBadge = `
        <div class="qa-multi-bar">
          <span class="qa-multi-tag">${escapeHtml(q.multiHint || '可多选')}</span>
          <span class="qa-multi-count">已选 <strong id="qaMultiCount">${ansArr.length}</strong>${q.max ? ' / ' + q.max : ''}</span>
        </div>
      `;
    }

    let body = '';
    if (q.type === 'choice') {
      const role = q.multi ? 'checkbox' : 'radio';
      const groupRole = q.multi ? 'group' : 'radiogroup';
      const isLocked = (v) => q.multi && q.max && ansArr.length >= q.max && !ansArr.includes(v);
      const isOn = (v) => q.multi ? ansArr.includes(v) : ans === v;
      body = `<div class="qa-options" role="${groupRole}">` +
        q.options.map((opt, i) => `
          <button class="qa-option${isOn(opt.value) ? ' selected' : ''}${isLocked(opt.value) ? ' locked' : ''}"
                  role="${role}"
                  aria-checked="${isOn(opt.value)}"
                  data-value="${escapeHtml(opt.value)}"
                  tabindex="${isOn(opt.value) || (!ansArr.length && i === 0) ? '0' : '-1'}">
            <span class="icon">${opt.icon}</span>
            <span class="label">${escapeHtml(opt.label)}</span>
            <span class="check${q.multi ? ' multi' : ''}"></span>
            ${q.multi && isOn(opt.value) ? `<span class="check-order">${ansArr.indexOf(opt.value) + 1}</span>` : ''}
          </button>
        `).join('') +
        `</div>`;
    } else if (q.type === 'text') {
      body = `
        <textarea class="qa-input" id="qaInput"
                  placeholder="${escapeHtml(q.placeholder || '')}"
                  rows="4">${escapeHtml(typeof ans === 'string' ? ans : '')}</textarea>
        ${q.helper ? `<p class="qa-helper">${escapeHtml(q.helper)}</p>` : ''}
      `;
    }

    stage.innerHTML = `
      <div class="qa-eyebrow">
        <span class="dot-pulse"></span>
        问题 ${state.index + 1} / ${QUESTIONS.length} · ${escapeHtml(dirMeta.title)}${q.optional ? ' · 选填' : ''}
      </div>
      <h1 class="qa-title">${escapeHtml(q.title)}</h1>
      ${multiBadge}
      ${body}
    `;

    // 绑定选项
    stage.querySelectorAll('.qa-option').forEach(btn => {
      btn.addEventListener('click', () => selectOption(q, btn.dataset.value, btn));
    });

    // 绑定文本输入
    const input = stage.querySelector('#qaInput');
    if (input) {
      input.addEventListener('input', e => {
        state.answers[q.id] = e.target.value;
        saveDraft(false);
        updateNavState();
      });
      setTimeout(() => input.focus(), 50);
    } else {
      const selected = stage.querySelector('.qa-option.selected') || stage.querySelector('.qa-option');
      if (selected) setTimeout(() => selected.focus(), 50);
    }

    updateNavState();
  }

  // ====== 选项点击（支持单选 / 多选） ======
  function selectOption(q, value, btn) {
    const qid = typeof q === 'string' ? q : q.id;
    const qDef = typeof q === 'string' ? QUESTIONS.find(x => x.id === q) : q;
    const stage = qs('#stage');

    if (qDef.multi) {
      let cur = Array.isArray(state.answers[qid]) ? state.answers[qid].slice() : [];
      if (cur.includes(value)) {
        cur = cur.filter(v => v !== value);
      } else if (qDef.max && cur.length >= qDef.max) {
        KW.toast(`最多选 ${qDef.max} 项 · 想加请先取消一个`);
        return;
      } else {
        cur.push(value);
      }
      state.answers[qid] = cur;
      // 重新计算所有选项视觉
      updateMultiVisual(stage, qDef, cur);
    } else {
      state.answers[qid] = value;
      stage.querySelectorAll('.qa-option').forEach(b => {
        const on = b === btn;
        b.classList.toggle('selected', on);
        b.setAttribute('aria-checked', on);
        b.tabIndex = on ? 0 : -1;
      });
    }
    saveDraft(false);
    updateNavState();
  }

  function updateMultiVisual(stage, q, cur) {
    const max = q.max || Infinity;
    stage.querySelectorAll('.qa-option').forEach(btn => {
      const v = btn.dataset.value;
      const on = cur.includes(v);
      const locked = !on && cur.length >= max;
      btn.classList.toggle('selected', on);
      btn.classList.toggle('locked', locked);
      btn.setAttribute('aria-checked', on);
      // 顺序标
      let badge = btn.querySelector('.check-order');
      if (on) {
        const idx = cur.indexOf(v) + 1;
        if (badge) badge.textContent = idx;
        else {
          badge = document.createElement('span');
          badge.className = 'check-order';
          badge.textContent = idx;
          btn.appendChild(badge);
        }
      } else if (badge) {
        badge.remove();
      }
    });
    const counterEl = stage.querySelector('#qaMultiCount');
    if (counterEl) counterEl.textContent = cur.length;
  }

  // ====== 底部按钮状态 ======
  function updateNavState() {
    const q = QUESTIONS[state.index];
    const ans = state.answers[q.id];
    let hasAnswer;
    if (q.type === 'text') {
      hasAnswer = typeof ans === 'string' && ans.trim().length > 0;
    } else if (q.multi) {
      hasAnswer = Array.isArray(ans) && ans.length > 0;
    } else {
      hasAnswer = !!ans;
    }
    const btnNext = qs('#btnNext');
    const btnPrev = qs('#btnPrev');
    btnNext.disabled = !hasAnswer && !q.optional;
    btnPrev.disabled = state.index === 0;
    const isLast = state.index === QUESTIONS.length - 1;
    // 选填题 + 没填 → 显示"跳过"
    if (q.optional && !hasAnswer) {
      btnNext.innerHTML = isLast
        ? '跳过 · 生成工单 <span class="arrow">🚀</span>'
        : '跳过 <span class="arrow">→</span>';
      btnNext.classList.add('skip');
    } else {
      btnNext.innerHTML = isLast
        ? '生成工单 <span class="arrow">🚀</span>'
        : '下一步 <span class="arrow">→</span>';
      btnNext.classList.remove('skip');
    }
  }

  // ====== 切题过渡（内联样式，避免类切换+rAF 在 iframe 后台被延迟） ======
  let _inTransition = false;
  function transition(direction) {
    if (_inTransition) return;
    _inTransition = true;
    const stage = qs('#stage');
    saveDraft(false);
    const leaveX = direction === 'forward' ? -40 : 40;
    const enterX = direction === 'forward' ? 40 : -40;

    // 阶段 1：当前题滑出
    stage.style.transition = 'transform 240ms cubic-bezier(.4,0,.2,1), opacity 240ms cubic-bezier(.4,0,.2,1)';
    stage.style.transform = `translateX(${leaveX}px)`;
    stage.style.opacity = '0';

    setTimeout(() => {
      // 重渲染新题（此时仍隐藏）
      renderQuestion();
      renderProgress();
      // 瞬切到入场位置（关闭 transition 避免反弹）
      stage.style.transition = 'none';
      stage.style.transform = `translateX(${enterX}px)`;
      stage.style.opacity = '0';
      // 强制 reflow，让下一行的 transition 生效
      void stage.offsetHeight;
      // 阶段 2：滑入
      stage.style.transition = 'transform 400ms cubic-bezier(.4,0,.2,1), opacity 400ms cubic-bezier(.4,0,.2,1)';
      stage.style.transform = 'translateX(0)';
      stage.style.opacity = '1';
      setTimeout(() => {
        stage.style.transition = '';
        stage.style.transform = '';
        stage.style.opacity = '';
        _inTransition = false;
      }, 420);
    }, 250);
  }

  function nextQuestion() {
    if (qs('#btnNext').disabled) return;
    if (state.index < QUESTIONS.length - 1) {
      state.index++;
      transition('forward');
    } else {
      finish();
    }
  }
  function prevQuestion() {
    if (state.index > 0) {
      state.index--;
      transition('back');
    }
  }

  // ====== 完成：通过 KW_DL 保存工单，跳转到结果页 ======
  function finish() {
    // DEMO 模式：不写入数据层，直接跳 demo 工单展示页
    if (isDemo) {
      if (window.KW_DL) KW_DL.logEvent('demo.complete', { dir: state.dir, answers: state.answers });
      const q = encodeURIComponent(JSON.stringify(state.answers));
      KW.goto(`result.html?mode=demo&dir=${state.dir}&a=${q}`);
      return;
    }
    // 整理答案标签（便于结果页可读）
    const answersResolved = {};
    QUESTIONS.forEach(q => {
      const v = state.answers[q.id];
      if (q.type === 'choice') {
        const opt = (q.options || []).find(o => o.value === (Array.isArray(v) ? v[0] : v));
        answersResolved[q.id] = {
          value: v,
          label: Array.isArray(v)
            ? v.map(vv => (q.options.find(o => o.value === vv) || {}).label).filter(Boolean).join(' / ')
            : (opt ? opt.label : v),
          icon:  opt ? opt.icon : '',
          question: q.title
        };
      } else {
        answersResolved[q.id] = { value: v, label: v, question: q.title };
      }
    });

    // 通过统一数据层保存（包含训练所需的全部字段）
    const order = window.KW_DL ? KW_DL.saveOrder({
      direction:      'ec',
      title:          '', // 由 result 页用 RESULT_TEMPLATES 生成
      inputs:         state.answers,
      inputsResolved: answersResolved
      // output 留空，result 页懒生成（含 templateMatched）
    }) : null;

    // 草稿标完成（result.html 进入时还会兜底再标一次）
    if (window.KW_DL) KW_DL.markDraftCompleted();

    // 兼容旧 sessionStorage
    if (window.KWStorage) {
      const legacy = {
        id: order ? order.id : KW.uid(),
        dir: state.dir,
        dirTitle: dirMeta.title,
        dirIcon:  dirMeta.icon,
        answers:  state.answers,
        answersResolved,
        createdAt: order ? order.createdAt : Date.now()
      };
      KWStorage.saveResult(legacy);
      KWStorage.clearDraft();
    }

    if (window.KW_DL) {
      KW_DL.logEvent('question.complete', { dir: state.dir, count: QUESTIONS.length });
      // 长尾需求：第 9 题填了 → 单独打标，用于训练数据筛选
      const specialNeeds = (state.answers.specialNeeds || state.answers.special || '').trim();
      if (specialNeeds) {
        KW_DL.logEvent('question.longtail', { dir: state.dir, orderId: order && order.id, text: specialNeeds });
        if (order) {
          KW_DL.saveAtom({
            type: 'longtail',
            content: { text: specialNeeds, dir: state.dir },
            source: 'user',
            orderId: order.id,
            tags: [state.dir, 'longtail']
          });
        }
      }
    }
    KW.goto('result.html?id=' + encodeURIComponent(order ? order.id : KW.uid()));
  }

  // ====== 键盘 ======
  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      const inInput = tag === 'TEXTAREA' || tag === 'INPUT';

      // Enter → 下一步（在选项题里直接前进；textarea 里允许换行）
      if (e.key === 'Enter') {
        if (inInput) return; // 让 textarea 自己处理
        const btnNext = qs('#btnNext');
        if (btnNext && !btnNext.disabled) {
          e.preventDefault();
          nextQuestion();
        }
      }

      // ← →  上下题
      if (e.key === 'ArrowLeft' && !inInput) { e.preventDefault(); prevQuestion(); }
      if (e.key === 'ArrowRight' && !inInput) {
        e.preventDefault();
        if (!qs('#btnNext').disabled) nextQuestion();
      }

      // ↑ ↓  选项之间切换焦点
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !inInput) {
        const opts = qsa('.qa-option');
        if (!opts.length) return;
        const idx = opts.indexOf(document.activeElement);
        const next = e.key === 'ArrowDown'
          ? (idx + 1 + opts.length) % opts.length
          : (idx - 1 + opts.length) % opts.length;
        opts[next].focus();
        e.preventDefault();
      }

      // 数字键 1-9：快速选择
      if (!inInput && /^[1-9]$/.test(e.key)) {
        const opts = qsa('.qa-option');
        const i = parseInt(e.key, 10) - 1;
        if (opts[i]) {
          opts[i].click();
          e.preventDefault();
        }
      }
    });
  }

  // ====== 顶部操作 ======
  function bindHeader() {
    qs('#btnSaveDraft').addEventListener('click', () => saveDraft(true));
    qs('#btnExit').addEventListener('click', () => {
      // 简单弹窗确认
      const hasContent = Object.keys(state.answers).length > 0;
      const msg = hasContent ? '确定退出？已填写的内容会保存为草稿，下次可继续。' : '确定退出？';
      if (confirm(msg)) {
        saveDraft(false);
        KW.goto('../index.html');
      }
    });
  }

  // ====== 启动 ======
  function init() {
    loadDraft();
    renderProgress();
    renderQuestion();
    qs('#btnNext').addEventListener('click', nextQuestion);
    qs('#btnPrev').addEventListener('click', prevQuestion);
    bindHeader();
    bindKeyboard();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
