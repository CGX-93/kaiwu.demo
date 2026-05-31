/* 开物 · 通用 JS 工具 */

const KW = {
  // 方向元数据
  directions: {
    ecom: {
      key: 'ecom',
      title: '电商带货',
      subtitle: 'E-COMMERCE',
      icon: '🛒',
      iconClass: 'c1',
      desc: '把产品卖点拆成可执行的短视频工单：脚本、分镜、提示词、剪辑步骤一气呵成。',
      tags: ['短视频脚本', '分镜', 'AI提示词', '剪辑流程'],
      enabled: true,
      badge: '完整可用'
    },
    comic: {
      key: 'comic',
      title: '条漫制作',
      subtitle: 'WEBCOMIC',
      icon: '📖',
      iconClass: 'c2',
      desc: '把故事想法拆成分格脚本和画面提示词，叙事节奏与视觉细节一次到位。',
      tags: ['分格脚本', '人设设定', '画面提示词', '叙事节奏'],
      enabled: false,
      badge: 'DEMO'
    },
    drama: {
      key: 'drama',
      title: '短剧制作',
      subtitle: 'SHORT DRAMA',
      icon: '🎬',
      iconClass: 'c3',
      desc: '把剧情创意拆成剧本、分镜和镜头提示词，结构清晰，落地直接拍。',
      tags: ['剧本', '分镜', '镜头提示词', '人物设定'],
      enabled: false,
      badge: 'DEMO'
    },
    other: {
      key: 'other',
      title: '其他场景',
      subtitle: 'GENERAL',
      icon: '🧩',
      iconClass: 'c4',
      desc: '宣传、科普、课程、品牌内容——任意主题都能拆成可执行的内容工单。',
      tags: ['宣传片', '科普内容', '课程脚本', '品牌叙事'],
      enabled: false,
      badge: 'DEMO'
    }
  },

  // 跳转
  goto(url) {
    window.location.href = url;
  },

  // Toast 提示
  toast(msg, type = '') {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.className = 'toast ' + type;
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2200);
  },

  // 复制文本
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      KW.toast('已复制到剪贴板', 'success');
      return true;
    } catch (e) {
      // 兜底：textarea + execCommand
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        KW.toast('已复制到剪贴板', 'success');
        return true;
      } catch (err) {
        KW.toast('复制失败，请手动选择', 'error');
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  },

  // URL 参数
  query(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  // 时间格式化
  fmtTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  fmtTimeShort(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
    if (diff < 86400 * 7) return Math.floor(diff / 86400) + ' 天前';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  uid() {
    return 'kw_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }
};

// 注入顶部导航的当前页高亮
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.toLowerCase();
  document.querySelectorAll('.nav-link[data-page]').forEach(el => {
    const p = el.dataset.page;
    if (
      (p === 'home' && (path.endsWith('/index.html') || path.endsWith('/') || path.endsWith('/kaiwu_web/') || path.endsWith('kaiwu_web'))) ||
      path.endsWith('/' + p + '.html')
    ) {
      el.classList.add('active');
    }
  });
});

/* ===================== 会员引导弹窗（3D 悬浮会员卡） ===================== */
KW.MEMBER_TIERS = {
  creator: {
    name: '创作版', en: 'KAIWU MEMBER',
    c1: '#E8500A', c2: '#FFB800',
    priceYear: 299, priceMonth: 29, save: 49,
    popular: true,
    blocks: [
      { big: '∞',    label: '大师版工单' },
      { big: '¥30',  label: '月算力补贴' },
      { big: '全',   label: '学院入门课' }
    ]
  },
  pro: {
    name: '专业版', en: 'KAIWU MEMBER',
    c1: '#7F77DD', c2: '#534AB7',
    priceYear: 499, priceMonth: 49, save: 89,
    popular: false,
    blocks: [
      { big: '∞',    label: '爆款解析' },
      { big: '¥100', label: '月算力补贴' },
      { big: '全',   label: '专项课程' }
    ]
  },
  enterprise: {
    name: '企业版', en: 'KAIWU MEMBER',
    c1: '#378ADD', c2: '#185FA5',
    priceText: '联系我们',
    popular: false,
    blocks: [
      { big: '多人', label: '协作席位' },
      { big: '共享', label: '原子库' },
      { big: '专属', label: '客服经理' }
    ]
  }
};

/**
 * KW.showMemberModal(tier, featureName)
 * tier: 'creator' | 'pro' | 'enterprise'
 */
KW.showMemberModal = function (tier, featureName) {
  const t = KW.MEMBER_TIERS[tier] || KW.MEMBER_TIERS.creator;

  // 复用单例
  let modal = document.getElementById('kwMemberModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.className = 'member-modal';
  modal.id = 'kwMemberModal';
  modal.style.setProperty('--mc1', t.c1);
  modal.style.setProperty('--mc2', t.c2);

  const priceHtml = t.priceText
    ? `<div class="mm-price">${t.priceText}</div>`
    : `<div class="mm-price">¥${t.priceMonth}<em>/月</em></div>` +
      `<div class="mm-save">¥${t.priceYear}/年 · 立省 ¥${t.save}</div>`;

  const blocksHtml = (t.blocks || []).map(b =>
    `<div class="mm-block"><span class="b-big">${b.big}</span><span class="b-label">${b.label}</span></div>`
  ).join('');

  const featNote = featureName
    ? `「${featureName}」为${t.name}及以上会员专属功能`
    : `升级${t.name}解锁更多造物能力`;

  modal.innerHTML =
    '<div class="mm-stage">' +
      '<div class="mm-card tier-' + tier + '">' +
        '<div class="mm-glow" aria-hidden="true"></div>' +
        (t.popular ? '<div class="mm-popular">最受欢迎</div>' : '') +
        '<div class="mm-top">' +
          '<div class="mm-title">' +
            '<span class="mm-en">' + t.en + '</span>' +
            '<span class="mm-name">' + t.name + '</span>' +
          '</div>' +
          '<div class="mm-logo">开</div>' +
        '</div>' +
        '<div class="mm-blocks">' + blocksHtml + '</div>' +
        '<div class="mm-seam">' +
          '<span class="seam-line"></span>' +
          '<span class="seam-text">天工开物 · 人人造物</span>' +
          '<span class="seam-line"></span>' +
        '</div>' +
        '<div class="mm-bottom">' + priceHtml + '</div>' +
      '</div>' +
      '<div class="mm-actions">' +
        '<button class="mm-cta-main" type="button">了解完整权益</button>' +
        '<button class="mm-cta-sub" type="button">以后再说</button>' +
      '</div>' +
      '<div class="mm-feature-note">' + featNote + '</div>' +
    '</div>';

  document.body.appendChild(modal);
  // 触发进场动画
  requestAnimationFrame(() => modal.classList.add('show'));

  // 埋点
  if (window.KW_DL) KW_DL.logEvent('member.modal.shown', { tier, feature: featureName || '' });

  function close(reason) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 380);
    if (reason === 'dismiss' && window.KW_DL) KW_DL.logEvent('member.modal.dismiss', { tier });
  }
  // 跳转到 membership（计算相对路径：pages 内 vs 根）
  function membershipHref() {
    return /\/pages\//.test(location.pathname) ? 'membership.html' : 'pages/membership.html';
  }
  modal.querySelector('.mm-cta-main').addEventListener('click', () => {
    if (window.KW_DL) KW_DL.logEvent('member.modal.cta', { tier });
    location.href = membershipHref();
  });
  modal.querySelector('.mm-cta-sub').addEventListener('click', () => close('dismiss'));
  modal.addEventListener('click', e => { if (e.target === modal) close('dismiss'); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close('dismiss'); document.removeEventListener('keydown', esc); }
  });
};

/* ===================== 会员档位 tier 颜色（全站联动） ===================== */
// 免费=绿 / 创作=橙 / 专业=紫 / 签约=金；glow 为对应主色的半透明光环（box-shadow ring 用）
KW.TIER_COLORS = {
  free:    { main: '#00D4AA', glow: 'rgba(0,212,170,0.5)' },
  creator: { main: '#E8500A', glow: 'rgba(232,80,10,0.5)' },
  pro:     { main: '#6B21A8', glow: 'rgba(107,33,168,0.5)' },
  signed:  { main: '#FFB800', glow: 'rgba(255,184,0,0.5)' }
};
// KW.getTierColor(tier) -> { main, glow }；未知档位回退到 free
KW.getTierColor = function (tier) {
  return KW.TIER_COLORS[tier] || KW.TIER_COLORS.free;
};

/* ===================== 造物学院 · 课程目录（academy + profile 横滚条共享） ===================== */
// 静态 mock 目录，单一数据源；academy.html 与 profile.js 横滚条都读这里，避免双份。
// access: 'intro' = 会员免费 / 非会员单买；'pro' = 专业版免费 / 其他单买
KW.ACADEMY_COURSES = [
  { id: 'ac_intro_01',  cat: 'intro',    cover: '🚀', name: 'AI 做内容从 0 到 1：你的第一条短视频', teacher: '开物教研组',        lessons: 8,  access: 'intro', price: 99,  learners: 18600 },
  { id: 'ac_intro_02',  cat: 'intro',    cover: '📋', name: '读懂工单：把开物生成的脚本拍出来',     teacher: '开物教研组',        lessons: 6,  access: 'intro', price: 79,  learners: 12400 },
  { id: 'ac_ecom_01',   cat: 'ecom',     cover: '🛒', name: '电商带货脚本：把卖点写成钩子',         teacher: '阿岚 · 千万带货操盘手', lessons: 12, access: 'pro',   price: 199, learners: 8900 },
  { id: 'ac_ecom_02',   cat: 'ecom',     cover: '💄', name: '30 秒种草视频的镜头公式',             teacher: '清明 · 美妆 MCN 导演',  lessons: 10, access: 'pro',   price: 199, learners: 6300 },
  { id: 'ac_drama_01',  cat: 'drama',    cover: '🎭', name: '情感短剧分镜入门：60 秒讲完一个故事',   teacher: '见川 · 签约短剧编导',   lessons: 14, access: 'pro',   price: 259, learners: 5400 },
  { id: 'ac_drama_02',  cat: 'drama',    cover: '📖', name: '条漫脚本与分格节奏',                   teacher: '星河 · 头部条漫主笔',   lessons: 9,  access: 'pro',   price: 189, learners: 3100 },
  { id: 'ac_prompt_01', cat: 'prompt',   cover: '✨', name: 'Midjourney 提示词工程实战',           teacher: '砚松 · AI 视觉总监',    lessons: 11, access: 'pro',   price: 229, learners: 9700 },
  { id: 'ac_director_01',cat: 'director', cover: '🎯', name: '像导演一样拆解爆款：节奏 / 转场 / 钩子', teacher: '云溪 · 千万播放操盘',   lessons: 13, access: 'pro',   price: 269, learners: 7200 }
];
// 会员打通：按课程 access + 当前用户档位返回 { free, big, note }
// tier: free | creator | pro | signed
KW.academyAccessBadge = function (course, tier) {
  var isMember = tier && tier !== 'free';            // creator / pro / signed
  var isPro = (tier === 'pro' || tier === 'signed');
  if (course.access === 'intro') {
    return isMember
      ? { free: true,  big: '会员免费', note: '入门课 · 已解锁' }
      : { free: false, big: '¥' + course.price, note: '会员免费 · 非会员单买' };
  }
  return isPro
    ? { free: true,  big: '专业版免费', note: '专项课 · 已解锁' }
    : { free: false, big: '¥' + course.price, note: '专业版会员免费' };
};

// 暴露到 window 便于跨页与调试（与 window.KW_DL 对称）
// 修复：academy 课程网格 / profile 学院横滚条 / widget 找真人 toast 三处依赖 window.KW
if (typeof window !== 'undefined') window.KW = KW;
