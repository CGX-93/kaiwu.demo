/* 开物 · 全站智能客服浮窗（符文罗盘）
 * 自执行 IIFE，零依赖落地：CSS 动态注入、DOM 动态构建。
 * 软依赖：window.KW.toast（提示）、window.KW_DL.logEvent（埋点）。
 */
(function () {
  if (typeof document === 'undefined') return;
  if (document.getElementById('kwwRoot')) return; // 防重复引入

  /* ---------------- FAQ 数据：4 个 Tab，每 Tab 4 条 ---------------- */
  var TABS = [
    {
      key: 'start',
      label: '新手上路',
      items: [
        { q: '开物到底是做什么的？', a: '开物把你的内容创意拆成可执行的「工单」：脚本、分镜、AI 提示词、剪辑流程一步到位。先在首页选方向，用大白话描述想法，剩下的交给我们。' },
        { q: '第一次用，从哪里开始？', a: '点首页「开始造物」，选一个方向（目前电商带货完整可用），按引导填几句需求，几秒就能拿到一份完整可执行的工单。' },
        { q: '不会写提示词也能用吗？', a: '完全可以。你只需要描述想要的效果，提示词、分镜这些专业部分由开物自动生成，你拿来即用。' },
        { q: '工单生成后还能修改吗？', a: '能。每份工单都支持反馈调整，也能收藏进作品库，随时回看与二次编辑。' }
      ]
    },
    {
      key: 'feature',
      label: '功能工单',
      items: [
        { q: '一份工单里都包含什么？', a: '通常包含：短视频脚本、分镜表、AI 绘画/视频提示词、剪辑步骤，以及可一键复制的文案块。' },
        { q: '电商之外的方向能用吗？', a: '条漫、短剧、其他场景目前是 DEMO 演示，可体验完整流程，更强的能力会陆续开放。' },
        { q: '「原子库」是什么？', a: '把高频复用的卖点、人设、风格拆成最小可复用单元（原子），下次造物直接调用，越用越顺手。' },
        { q: '急救站能帮我解决什么？', a: '当工单效果不理想时，急救站按症状给出诊断和修复方案，帮你快速救活一条内容。' }
      ]
    },
    {
      key: 'member',
      label: '会员算力',
      items: [
        { q: '免费版能用到什么程度？', a: '免费即可体验完整造物流程并生成工单；大师版工单、更高算力补贴等进阶能力面向会员开放。' },
        { q: '算力补贴怎么用？', a: '创作版每月赠 ¥30、专业版 ¥100 算力补贴，自动抵扣生成消耗，省心好用。' },
        { q: '会员怎么选更划算？', a: '个人创作者选创作版（¥299/年）即可；要爆款解析、专项课程选专业版；团队协作选企业版。' },
        { q: '可以先预约再决定吗？', a: '可以。在会员页留邮箱预约，开放或有优惠时第一时间通知你，绝不乱发消息。' }
      ]
    },
    {
      key: 'privacy',
      label: '数据隐私',
      items: [
        { q: '我的创意和数据安全吗？', a: '你的工单、作品、草稿默认存在本地浏览器，开物不会拿你的创意去训练或外传。' },
        { q: '数据具体存在哪里？', a: '主要数据保存在本机 localStorage。换设备或清缓存会丢失，重要内容建议及时导出。' },
        { q: '怎么导出或清空我的数据？', a: '在「数据政策」页可一键导出全部数据为文件，或彻底清空本地数据，操作透明可控。' },
        { q: '注销后数据会怎样？', a: '退出登录只清除身份态，本地业务数据仍在；如需彻底删除可在数据政策页清空。' }
      ]
    }
  ];

  /* ---------------- 软依赖封装 ---------------- */
  function logEvent(type, payload) {
    if (window.KW_DL && KW_DL.logEvent) KW_DL.logEvent(type, payload || {});
  }
  function toast(msg, type) {
    if (window.KW && KW.toast) KW.toast(msg, type || '');
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- CSS 动态注入 ---------------- */
  function injectCSS() {
    if (document.getElementById('kww-style')) return;
    var css = [
      '#kwwRoot{--kww-o:#E8500A;--kww-g:#FFB800;--kww-glass:rgba(22,17,13,.86);--kww-line:rgba(255,184,0,.30);',
      'position:fixed;right:22px;bottom:22px;z-index:160;font-family:inherit;}',

      /* 浮动按钮 + pulse 光环 */
      '#kwwFab{position:relative;width:62px;height:62px;border:0;padding:0;cursor:pointer;border-radius:50%;',
      'background:radial-gradient(120% 120% at 30% 25%,rgba(255,184,0,.22),rgba(22,17,13,.95) 70%);',
      'box-shadow:0 8px 26px rgba(0,0,0,.45),inset 0 0 0 1.5px rgba(255,184,0,.45);',
      'display:flex;align-items:center;justify-content:center;transition:transform .25s cubic-bezier(.2,.9,.3,1.4);}',
      '#kwwFab:hover{transform:scale(1.07);}',
      '#kwwFab:active{transform:scale(.95);}',
      '#kwwFab .kww-pulse{position:absolute;inset:0;border-radius:50%;border:2px solid var(--kww-g);',
      'opacity:.55;pointer-events:none;animation:kwwPulse 2.4s ease-out infinite;}',
      '#kwwFab .kww-compass{width:34px;height:34px;display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));}',
      '#kwwFab .kww-ring{transform-origin:24px 24px;animation:kwwSpin 12s linear infinite;}',
      '@keyframes kwwPulse{0%{transform:scale(1);opacity:.55}70%{opacity:0}100%{transform:scale(1.7);opacity:0}}',
      '@keyframes kwwSpin{to{transform:rotate(360deg)}}',

      /* 面板 */
      '#kwwPanel{position:absolute;right:0;bottom:78px;width:340px;max-width:calc(100vw - 32px);',
      'max-height:78vh;display:flex;flex-direction:column;overflow:hidden;border-radius:18px;',
      'background:var(--kww-glass);backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);',
      'border:1px solid var(--kww-line);box-shadow:0 18px 50px rgba(0,0,0,.55);color:#f3ece2;',
      'opacity:0;transform:translateY(14px) scale(.97);transform-origin:bottom right;pointer-events:none;',
      'transition:opacity .26s ease,transform .26s cubic-bezier(.2,.9,.3,1.2);}',
      '#kwwRoot.open #kwwPanel{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',

      /* 头部 */
      '.kww-head{display:flex;align-items:center;gap:10px;padding:14px 16px;',
      'background:linear-gradient(135deg,rgba(232,80,10,.28),rgba(255,184,0,.12));border-bottom:1px solid var(--kww-line);}',
      '.kww-badge{width:30px;height:30px;border-radius:9px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;',
      'font-weight:800;color:#1a130d;background:linear-gradient(135deg,var(--kww-g),var(--kww-o));font-size:15px;}',
      '.kww-htxt{flex:1;min-width:0;}',
      '.kww-htxt b{display:block;font-size:15px;letter-spacing:.5px;}',
      '.kww-htxt span{display:block;font-size:11px;opacity:.7;margin-top:1px;}',
      '.kww-close{width:28px;height:28px;border:0;border-radius:8px;cursor:pointer;color:#f3ece2;font-size:18px;line-height:1;',
      'background:rgba(255,255,255,.06);transition:background .2s;}',
      '.kww-close:hover{background:rgba(255,255,255,.16);}',

      /* Tabs */
      '.kww-tabs{display:flex;gap:4px;padding:10px 12px 0;}',
      '.kww-tab{flex:1;border:0;cursor:pointer;padding:8px 4px;border-radius:9px 9px 0 0;font-size:12px;',
      'color:#cdbfa9;background:transparent;transition:color .2s,background .2s;white-space:nowrap;}',
      '.kww-tab:hover{color:#f3ece2;}',
      '.kww-tab.active{color:#1a130d;font-weight:700;background:linear-gradient(135deg,var(--kww-g),var(--kww-o));}',

      /* 列表 */
      '.kww-body{flex:1;overflow-y:auto;padding:8px 12px 4px;}',
      '.kww-body::-webkit-scrollbar{width:6px;}',
      '.kww-body::-webkit-scrollbar-thumb{background:rgba(255,184,0,.3);border-radius:3px;}',
      '.kww-list{display:none;}',
      '.kww-list.active{display:block;}',
      '.kww-faq{border-bottom:1px solid rgba(255,255,255,.07);}',
      '.kww-q{width:100%;text-align:left;border:0;background:transparent;cursor:pointer;color:#f3ece2;',
      'font-size:13.5px;padding:12px 26px 12px 4px;position:relative;line-height:1.45;}',
      '.kww-q:after{content:"";position:absolute;right:6px;top:17px;width:8px;height:8px;border-right:2px solid var(--kww-g);',
      'border-bottom:2px solid var(--kww-g);transform:rotate(45deg);transition:transform .25s;opacity:.8;}',
      '.kww-faq.open .kww-q:after{transform:rotate(-135deg);top:20px;}',
      '.kww-a{max-height:0;overflow:hidden;transition:max-height .3s ease;}',
      '.kww-faq.open .kww-a{max-height:420px;}',
      '.kww-a p{margin:0;padding:0 4px 14px;font-size:13px;line-height:1.7;color:#d8ccba;}',

      /* AI 生成中 */
      '.kww-typing{display:flex;align-items:center;gap:6px;padding:2px 4px 14px;font-size:12px;color:#cdbfa9;}',
      '.kww-typing i{width:6px;height:6px;border-radius:50%;background:var(--kww-g);display:inline-block;',
      'animation:kwwDot 1s infinite ease-in-out;}',
      '.kww-typing i:nth-child(2){animation-delay:.16s;}',
      '.kww-typing i:nth-child(3){animation-delay:.32s;}',
      '@keyframes kwwDot{0%,80%,100%{transform:scale(.5);opacity:.4}40%{transform:scale(1);opacity:1}}',

      /* 留邮箱 / 找真人 */
      '.kww-human{padding:12px 14px 14px;border-top:1px solid var(--kww-line);background:rgba(0,0,0,.22);}',
      '.kww-human-tip{margin:0 0 8px;font-size:12px;line-height:1.5;color:#cdbfa9;}',
      '.kww-human-row{display:flex;gap:8px;}',
      '.kww-email{flex:1;min-width:0;border:1px solid var(--kww-line);background:rgba(255,255,255,.05);color:#f3ece2;',
      'border-radius:9px;padding:9px 11px;font-size:13px;outline:none;transition:border-color .2s;}',
      '.kww-email::placeholder{color:#8c7f6c;}',
      '.kww-email:focus{border-color:var(--kww-g);}',
      '.kww-send{flex:0 0 auto;border:0;cursor:pointer;border-radius:9px;padding:9px 14px;font-size:13px;font-weight:700;',
      'color:#1a130d;background:linear-gradient(135deg,var(--kww-g),var(--kww-o));transition:filter .2s,transform .15s;}',
      '.kww-send:hover{filter:brightness(1.08);}',
      '.kww-send:active{transform:scale(.96);}',

      '@media (max-width:480px){#kwwRoot{right:14px;bottom:14px;}#kwwPanel{bottom:74px;}}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'kww-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------------- SVG 符文罗盘 ---------------- */
  function compassSVG() {
    return '' +
      '<svg class="kww-compass" viewBox="0 0 48 48" aria-hidden="true">' +
        '<defs><linearGradient id="kwwGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#FFB800"/><stop offset="1" stop-color="#E8500A"/>' +
        '</linearGradient></defs>' +
        '<circle cx="24" cy="24" r="21" fill="none" stroke="url(#kwwGrad)" stroke-width="1.5" opacity=".9"/>' +
        /* 旋转符文环 */
        '<g class="kww-ring">' +
          '<circle cx="24" cy="24" r="15.5" fill="none" stroke="url(#kwwGrad)" stroke-width="1" stroke-dasharray="1.5 4" opacity=".75"/>' +
          '<path d="M24 9.5l1.4 2.4h-2.8z" fill="url(#kwwGrad)"/>' +
          '<circle cx="38.5" cy="24" r="1.1" fill="url(#kwwGrad)"/>' +
          '<rect x="23.1" y="35.4" width="1.8" height="2.6" rx=".5" fill="url(#kwwGrad)"/>' +
          '<circle cx="9.5" cy="24" r="1.1" fill="url(#kwwGrad)"/>' +
        '</g>' +
        /* 静态指针 */
        '<path d="M24 8 L26.4 24 L21.6 24 Z" fill="#E8500A"/>' +
        '<path d="M24 40 L26.4 24 L21.6 24 Z" fill="#FFB800" opacity=".85"/>' +
        '<circle cx="24" cy="24" r="2.6" fill="#1a130d" stroke="url(#kwwGrad)" stroke-width="1.2"/>' +
      '</svg>';
  }

  /* ---------------- 构建 DOM ---------------- */
  function build() {
    var root = document.createElement('div');
    root.id = 'kwwRoot';

    // 浮动按钮
    var fab = document.createElement('button');
    fab.id = 'kwwFab';
    fab.type = 'button';
    fab.setAttribute('aria-label', '开物助手');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<span class="kww-pulse"></span>' + compassSVG();

    // 面板
    var panel = document.createElement('div');
    panel.id = 'kwwPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '开物助手');

    var tabsHtml = TABS.map(function (t, i) {
      return '<button class="kww-tab' + (i === 0 ? ' active' : '') + '" type="button" data-i="' + i + '">' + esc(t.label) + '</button>';
    }).join('');

    var listsHtml = TABS.map(function (t, i) {
      var faqs = t.items.map(function (it, j) {
        return '<div class="kww-faq" data-key="' + t.key + '-' + j + '">' +
          '<button class="kww-q" type="button" aria-expanded="false">' + esc(it.q) + '</button>' +
          '<div class="kww-a" data-answer="' + esc(it.a) + '"></div>' +
        '</div>';
      }).join('');
      return '<div class="kww-list' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' + faqs + '</div>';
    }).join('');

    panel.innerHTML =
      '<div class="kww-head">' +
        '<span class="kww-badge">开</span>' +
        '<span class="kww-htxt"><b>开物助手</b><span>AI 即时答 · 真人随时在</span></span>' +
        '<button class="kww-close" type="button" aria-label="关闭">&times;</button>' +
      '</div>' +
      '<div class="kww-tabs">' + tabsHtml + '</div>' +
      '<div class="kww-body">' + listsHtml + '</div>' +
      '<form class="kww-human">' +
        '<p class="kww-human-tip">没找到答案？留下邮箱，真人 1 个工作日内回你。</p>' +
        '<div class="kww-human-row">' +
          '<input class="kww-email" type="email" placeholder="you@example.com" autocomplete="email" />' +
          '<button class="kww-send" type="submit">找真人</button>' +
        '</div>' +
      '</form>';

    root.appendChild(panel);
    root.appendChild(fab);
    document.body.appendChild(root);

    wire(root, fab, panel);
  }

  /* ---------------- 事件绑定 ---------------- */
  function wire(root, fab, panel) {
    var currentTab = TABS[0].key;

    function openPanel() {
      root.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      logEvent('widget.open', { tab: currentTab });
    }
    function closePanel() {
      root.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      if (root.classList.contains('open')) closePanel();
      else openPanel();
    }

    fab.addEventListener('click', toggle);
    panel.querySelector('.kww-close').addEventListener('click', closePanel);

    // Tab 切换
    var tabs = panel.querySelectorAll('.kww-tab');
    var lists = panel.querySelectorAll('.kww-list');
    panel.querySelector('.kww-tabs').addEventListener('click', function (e) {
      var btn = e.target.closest('.kww-tab');
      if (!btn) return;
      var idx = +btn.dataset.i;
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', i === idx);
        lists[i].classList.toggle('active', i === idx);
      }
      currentTab = TABS[idx].key;
    });

    // FAQ 手风琴 + 350ms AI 答延迟
    panel.querySelector('.kww-body').addEventListener('click', function (e) {
      var q = e.target.closest('.kww-q');
      if (!q) return;
      var faq = q.parentNode;
      var ans = faq.querySelector('.kww-a');
      var open = faq.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) return;
      logEvent('widget.faq', { tab: currentTab, q: q.textContent });
      if (faq.dataset.gen) return; // 已生成则直接展开
      ans.innerHTML = '<div class="kww-typing">正在为你生成回答<i></i><i></i><i></i></div>';
      var text = ans.getAttribute('data-answer');
      setTimeout(function () {
        ans.innerHTML = '<p>' + esc(text) + '</p>';
        faq.dataset.gen = '1';
      }, 350);
    });

    // 留邮箱 / 找真人
    var form = panel.querySelector('.kww-human');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('.kww-email');
      var val = input.value.trim();
      if (!val || val.indexOf('@') < 1 || val.indexOf('.') < 0) {
        toast('请填写有效的邮箱地址', 'error');
        input.focus();
        return;
      }
      logEvent('widget.human.request', { tab: currentTab, hasEmail: true });
      toast('已收到，真人会尽快联系你 🙌', 'success');
      input.value = '';
    });

    // 点击外部 / Esc 关闭
    document.addEventListener('click', function (e) {
      if (root.classList.contains('open') && !root.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('open')) closePanel();
    });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    injectCSS();
    build();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
