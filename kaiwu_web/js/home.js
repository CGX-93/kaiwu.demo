/* 开物 · 主视觉首页交互（含「混沌→造物」叙事动画） */

(function () {
  'use strict';

  // ===== 1. 浮动导航：滚动后变实心 =====
  const nav = document.getElementById('floatingNav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('solid');
    else nav.classList.remove('solid');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== 2. 「混沌→造物」叙事动画（慢绽放节奏） =====
  // 初始：极简版可见（黑暗+发光符），停留 3.5 秒
  // 触发：停留到时 或 用户开始滚动 → 用 2.8s ease-in-out 缓慢淡入彩色版
  // （不监听鼠标移动，避免随手一动就破坏仪式感）
  let chaosOpened = false;
  function openChaos() {
    if (chaosOpened) return;
    chaosOpened = true;
    document.body.classList.add('chaos-opened');
  }
  // 自动触发：3.5 秒后（给用户充足时间感受"混沌孕育"）
  const HOLD_MS = 3500;
  setTimeout(openChaos, HOLD_MS);
  // 手动触发：首次滚动
  window.addEventListener('scroll', () => {
    if (window.scrollY > 5) openChaos();
  }, { passive: true });

  // ===== 3. Hero 图片鼠标视差（轻微位移） =====
  const imgColor   = document.getElementById('imgColor');
  const imgMinimal = document.getElementById('imgMinimal');
  const heroSec    = document.querySelector('.hero-immersive');

  if (heroSec && (imgColor || imgMinimal)) {
    let raf = null;
    heroSec.addEventListener('mousemove', (e) => {
      const r = heroSec.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dx = (px * 14).toFixed(1);
        const dy = (py * 10).toFixed(1);
        if (imgColor)   imgColor.style.transform   = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px)`;
        if (imgMinimal) imgMinimal.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px)`;
      });
    });
    heroSec.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      if (imgColor)   imgColor.style.transform   = '';
      if (imgMinimal) imgMinimal.style.transform = '';
    });
  }

  // ===== 4. 卡片点击：跳到对应方向 =====
  document.querySelectorAll('.dir-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.key;
      const dir = (KW.directions && KW.directions[key]) || null;
      if (dir && !dir.enabled) {
        // DEMO 方向：进入简化 3 题 + 示例工单
        if (window.KW_DL) KW_DL.logEvent('home.dir.demo', { dir: key });
        KW.goto(`pages/question.html?dir=${key}&mode=demo`);
        return;
      }
      KW.goto(`pages/question.html?dir=${key}`);
    });
  });

  // ===== 5. 修复库横幅点击 =====
  const rescue = document.getElementById('rescueBanner');
  if (rescue) {
    rescue.addEventListener('click', () => KW.goto('pages/rescue.html'));
  }

  // ===== 6. 顶部 CTA 按钮 =====
  document.querySelectorAll('[data-cta]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const cta = btn.dataset.cta;
      if (cta === 'start')   KW.goto('pages/question.html?dir=ecom');
      if (cta === 'rescue')  KW.goto('pages/rescue.html');
      if (cta === 'history') KW.goto('pages/history.html');
    });
  });

  // ===== 7. 「会员专属」链接：弹 3D 会员卡 =====
  document.querySelectorAll('.fn-link.soon').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tier = link.dataset.memberTier;
      const feat = link.dataset.memberFeature;
      if (tier && KW.showMemberModal) KW.showMemberModal(tier, feat);
      else KW.toast(link.dataset.soon || '该模块即将开放');
    });
  });

  // ===== 7.5 五位造物 Agent 卡片：阶段二开放提示（无死链占位页，仅 toast 反馈） =====
  document.querySelectorAll('.agent-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.title = '阶段二开放';
    card.addEventListener('click', () => {
      if (window.KW_DL) KW_DL.logEvent('home.agent.click', { agent: card.dataset.agent });
      KW.toast('阶段二开放 · 届时各 Agent 将有专属工单生成器');
    });
  });

  // ===== 8. 首页累计原子沉淀计数 =====
  function updateAtomPulse() {
    if (!window.KW_DL) return;
    const total = (KW_DL.getAtoms({ source: 'generated' }) || []).length;
    const el = document.getElementById('atomTotal');
    if (el) el.textContent = total;
  }
  updateAtomPulse();

  // ===== 9. 第 5 入口"我的需求很特别"点击埋点 =====
  const dirSpecial = document.getElementById('dirSpecial');
  if (dirSpecial) {
    dirSpecial.addEventListener('click', () => {
      if (window.KW_DL) {
        KW_DL.logEvent('home.special.click', { source: 'home_dir_5th', ts: Date.now() });
      }
    });
  }

  // ===== 11. 方法论原子库 3×3 展示区 =====
  const ATOM_LIBS = [
    { id:'motif',      icon:'📚', name:'卖点提炼公式库', desc:'从产品到爆款卖点的提炼路径',
      atomType:'motif',      unit:'公式', fallback:'团队预置 20+', ac:'#FFB800', ac2:'#E8500A' },
    { id:'hook',       icon:'🎣', name:'钩子开头模板库', desc:'前 3 秒抓住用户的 50 种方法',
      atomType:'hook',       unit:'模板', fallback:'团队预置 50+', ac:'#FFD56A', ac2:'#FF9665' },
    { id:'storyboard', icon:'🎬', name:'分镜节奏库',     desc:'不同时长 / 平台的节奏模板',
      atomType:'storyboard', unit:'模板', fallback:'团队预置 30+', ac:'#C97AF2', ac2:'#7E40C6' },
    { id:'style',      icon:'🎨', name:'风格锁定词库',   desc:'日系 / 国漫 / Q 版等风格提示词组合',
      atomType:'style',      unit:'词库', fallback:'团队预置 40+', ac:'#FF6B9B', ac2:'#C81F5E' },
    { id:'platform',   icon:'📱', name:'平台调性差异指南', desc:'抖音 / 小红书 / 视频号 / 快手 调性差异',
      atomType:'platform',   unit:'调性', fallback:'团队预置 4',   ac:'#7C9DFF', ac2:'#3A5FE5' },
    { id:'case',       icon:'🔥', name:'真实爆款案例库', desc:'互联网上拾取并拆解过的成功案例',
      atomType:'case',       unit:'案例', fallback:'团队预置 100+', ac:'#FF7A3D', ac2:'#C81F5E' },
    { id:'rescue',     icon:'🚑', name:'失败修复库',     desc:'8 大常见症状的急救方案',
      atomType:'rescue',     unit:'方案', fallback:'团队预置 24',   ac:'#00D4AA', ac2:'#00B4D8' }
  ];

  function renderAtomLibs() {
    const wrap = document.getElementById('atomLibs');
    if (!wrap) return;
    wrap.innerHTML = '';

    ATOM_LIBS.forEach(lib => {
      const realCount = window.KW_DL ? (KW_DL.getAtomCards({ library: lib.id }) || []).length : 0;
      const a = document.createElement('a');
      a.className = 'atom-lib-card';
      a.dataset.type = lib.id;
      a.style.setProperty('--ac', lib.ac);
      a.style.setProperty('--ac2', lib.ac2);
      a.href = 'pages/atoms.html?type=' + encodeURIComponent(lib.id);
      a.innerHTML =
        '<div class="alc-head">' +
          '<div class="alc-icon">' + lib.icon + '</div>' +
          '<div class="alc-count' + (realCount === 0 ? ' fallback' : '') + '">' +
            (realCount === 0
              ? '<strong>' + escapeHtml(lib.fallback) + '</strong>'
              : '<strong>' + realCount + '</strong>' + escapeHtml(lib.unit))
          + '</div>' +
        '</div>' +
        '<div class="alc-name">' + escapeHtml(lib.name) + '</div>' +
        '<p class="alc-desc">' + escapeHtml(lib.desc) + '</p>' +
        '<div class="alc-evolve">' +
          '<span>会随社区使用持续学习进化</span>' +
          '<span class="alc-cta">查看 →</span>' +
        '</div>';
      a.addEventListener('click', () => {
        if (window.KW_DL) {
          KW_DL.logEvent('home.atoms.click', { type: lib.id, count: realCount });
          KW_DL.logEvent('atom.library.click', { library: lib.id, count: realCount });
        }
      });
      wrap.appendChild(a);
    });

    // 装饰格 1：更多即将上线
    const d1 = document.createElement('div');
    d1.className = 'atom-lib-deco';
    d1.innerHTML =
      '<div class="deco-em">✨</div>' +
      '<h4>更多原子库</h4>' +
      '<p>剧本结构 · 角色 IP · 商品话术 ...<br/>即将上线</p>';
    wrap.appendChild(d1);

    // 装饰格 2：成为贡献者
    const d2 = document.createElement('div');
    d2.className = 'atom-lib-deco';
    d2.innerHTML =
      '<div class="deco-em">🤝</div>' +
      '<h4>成为原子贡献者</h4>' +
      '<p>把你的好方法论沉淀进开物<br/>签约创作者通道开放后接入</p>';
    wrap.appendChild(d2);

    // 学习次数动态显示
    const learnCount = window.KW_DL ? KW_DL.getLearningCount() : 0;
    const el = document.getElementById('learnCount');
    if (el) el.textContent = learnCount;

    // 整个区曝光埋点（节流）
    if (window.KW_DL) {
      KW_DL.logEvent('home.atoms.viewed', { libsCount: ATOM_LIBS.length, learnCount });
    }
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  renderAtomLibs();

  // ===== 11.5 顶部用户入口（造物者头像/等级） =====
  if (window.KW_DL) {
    try {
      const p = KW_DL.getUserProfile();
      const m = KW_DL.getMembership();
      const avatarEl = document.getElementById('navUserAvatar');
      const nameEl   = document.getElementById('navUserName');
      const lvEl     = document.getElementById('navUserLevel');
      const btn      = document.getElementById('navUserBtn');
      if (avatarEl) {
        avatarEl.textContent = p.avatar || '🦊';
        // 会员等级颜色光环
        avatarEl.style.boxShadow = '0 0 0 2px ' + m.color + ', 0 4px 12px ' + m.color + '66';
      }
      if (nameEl)   nameEl.textContent = p.nickname || ('造物者 · ' + p.code);
      if (lvEl) {
        lvEl.textContent = 'Lv.' + p.level.level + ' ' + p.level.name;
        lvEl.style.color = p.level.color;
      }
      if (btn) {
        btn.addEventListener('click', () => {
          KW_DL.logEvent('home.profile.click', { source: 'nav' });
        });
      }
    } catch (e) { console.warn('user nav render failed:', e); }
  }

  // ===== 12.5 作品集预告条幅点击 =====
  const worksTease = document.getElementById('worksTease');
  if (worksTease) {
    worksTease.addEventListener('click', () => {
      if (window.KW_DL) KW_DL.logEvent('home.works.tease.click', { source: 'home_hero_band' });
    });
  }

  // ===== 12. 平台对比表：曝光 + CTA 点击埋点 =====
  const compareSection = document.getElementById('compareSection');
  if (compareSection && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && window.KW_DL) {
          KW_DL.logEvent('home.compare.viewed', { ts: Date.now() });
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(compareSection);
  }
  document.querySelectorAll('[data-cmp-cta]').forEach(a => {
    a.addEventListener('click', () => {
      if (window.KW_DL) KW_DL.logEvent('home.compare.cta', { target: a.dataset.cmpCta });
    });
  });

  // ===== 10. 失败修复库 / 爆款解析 高亮入口点击埋点 =====
  const rescueEntry = document.getElementById('rescueEntry');
  if (rescueEntry) {
    rescueEntry.addEventListener('click', () => {
      if (window.KW_DL) KW_DL.logEvent('home.rescue.click', { source: 'home_hero_band' });
    });
  }
  const decodeEntry = document.getElementById('decodeEntry');
  if (decodeEntry) {
    decodeEntry.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.KW_DL) KW_DL.logEvent('home.decode.click', { source: 'home_hero_band' });
      KW.showMemberModal('pro', '爆款解析');
    });
  }

})();
