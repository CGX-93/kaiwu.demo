/* 开物 · 作品集数据
 * 成语短片系列 — 10 个作品 mock
 */

const WORKS_DATA = (function () {
  'use strict';

  // 成语作品 - 用古典母题照见现代人困境
  const idiomSeries = [
    {
      id: 'kezhouqiujian',
      idiom: '刻舟求剑',
      glyph: '舟',
      title: '刻舟求剑：我们找的不是剑，是回不去的自己',
      subtitle: '关于「停滞与变化」的现代寓言 · 那些我们以为没变的，其实早已悄悄飘走',
      status: 'coming',           // coming | published | wait
      platforms: ['douyin', 'wechat', 'xhs'],
      cover: { from: '#1E3A5F', to: '#1B7B8F' },  // 深蓝雾色
      stats: null,
      orderId: null               // 真实工单 ID（待接入）
    },
    {
      id: 'yanerdaoling',
      idiom: '掩耳盗铃',
      glyph: '铃',
      title: '掩耳盗铃：把信息差当护身符的我们',
      subtitle: '关于「自我欺骗」的现代寓言',
      status: 'wait',
      platforms: ['douyin', 'wechat'],
      cover: { from: '#3A2E5F', to: '#7E40C6' },
      stats: null,
      orderId: null
    },
    {
      id: 'zhaosanmusi',
      idiom: '朝三暮四',
      glyph: '猴',
      title: '朝三暮四：为什么数字一样，我们还是选了"早三"',
      subtitle: '关于「锚定效应」的现代寓言',
      status: 'wait',
      platforms: ['xhs', 'wechat'],
      cover: { from: '#5F3A2E', to: '#C8651F' },
      stats: null,
      orderId: null
    },
    {
      id: 'xiaozushili',
      idiom: '削足适履',
      glyph: '履',
      title: '削足适履：把自己改造成"应该"的样子',
      subtitle: '关于「自我磨损」的现代寓言',
      status: 'wait',
      platforms: ['douyin', 'xhs'],
      cover: { from: '#2E5F4D', to: '#1F8F7B' },
      stats: null,
      orderId: null
    },
    {
      id: 'handanxuebu',
      idiom: '邯郸学步',
      glyph: '步',
      title: '邯郸学步：抄了一堆爆款，反而忘了怎么走路',
      subtitle: '关于「模仿陷阱」的现代寓言',
      status: 'wait',
      platforms: ['douyin', 'bilibili'],
      cover: { from: '#5F2E3A', to: '#C81F5E' },
      stats: null,
      orderId: null
    },
    {
      id: 'huabingchongji',
      idiom: '画饼充饥',
      glyph: '饼',
      title: '画饼充饥：我们都被"愿景"喂饱过',
      subtitle: '关于「虚幻满足」的现代寓言',
      status: 'wait',
      platforms: ['wechat', 'xhs'],
      cover: { from: '#5F4E2E', to: '#C9A21F' },
      stats: null,
      orderId: null
    },
    {
      id: 'nanyuanbeizhe',
      idiom: '南辕北辙',
      glyph: '辕',
      title: '南辕北辙：越努力越远的那段路',
      subtitle: '关于「方向错位」的现代寓言',
      status: 'wait',
      platforms: ['douyin', 'wechat'],
      cover: { from: '#2E3D5F', to: '#3A5FE5' },
      stats: null,
      orderId: null
    },
    {
      id: 'yegonghaolong',
      idiom: '叶公好龙',
      glyph: '龙',
      title: '叶公好龙：我们口口声声爱的，未必经得起真来',
      subtitle: '关于「叶公心态」的现代寓言',
      status: 'wait',
      platforms: ['xhs', 'bilibili'],
      cover: { from: '#4D2E5F', to: '#7E40C6' },
      stats: null,
      orderId: null
    },
    {
      id: 'maiduhuanzhu',
      idiom: '买椟还珠',
      glyph: '椟',
      title: '买椟还珠：我们爱上的，是包装还是内容',
      subtitle: '关于「本末倒置」的现代寓言',
      status: 'wait',
      platforms: ['xhs', 'douyin'],
      cover: { from: '#2E5F5F', to: '#1F9FA8' },
      stats: null,
      orderId: null
    },
    {
      id: 'shouzhudaitu',
      idiom: '守株待兔',
      glyph: '兔',
      title: '守株待兔：那一次偶然，被我们误读为"方法"',
      subtitle: '关于「侥幸路径依赖」的现代寓言',
      status: 'wait',
      platforms: ['douyin', 'wechat'],
      cover: { from: '#3A5F2E', to: '#5BC81F' },
      stats: null,
      orderId: null
    }
  ];

  const series = [
    {
      id: 'idiom-series',
      name: '成语短片系列',
      desc: '用古典成语母题照见现代人困境',
      planned: 10,
      published: 0,
      works: idiomSeries
    }
    // 未来可加：城市观察系列、职场叙事系列 等
  ];

  // 平台元数据
  const PLATFORMS = {
    douyin:   { icon: '🎵', label: '抖音',  color: '#FF6B9B' },
    xhs:      { icon: '📕', label: '小红书', color: '#FF5252' },
    wechat:   { icon: '📺', label: '视频号', color: '#1AAD19' },
    bilibili: { icon: '🔴', label: 'B站',   color: '#00AEEC' },
    kuaishou: { icon: '⚡', label: '快手',  color: '#FF7300' }
  };

  return { series, PLATFORMS };
})();

if (typeof window !== 'undefined') window.WORKS_DATA = WORKS_DATA;

/* ===================== 自由创作区 · 种子案例（CASES_SEED）=====================
 * 18 条 demo 案例。creatorTier 按 free 40% / creator 35% / pro 15% / signed 10%（实际 7/6/3/2）。
 * 三个领域：电商带货(ec) / 情感短剧(drama) / 知识科普(other) 各 6 条。
 * submittedAt 在 1-29 天梯度分布，避免"全部刚刚"的虚假感。
 * 编辑精选(featured) 4 条均为 pro/signed（质量标杆）。
 * 由 data-layer.js 在 DOMContentLoaded 时检测：若 cases 为空且未 seeded 才注入。
 */
const CASES_SEED = (function () {
  const NOW = Date.now();
  const DAY = 86400000;
  const t = d => NOW - d * DAY;
  return [
    // ===== 电商带货 (ec) · 6 条 =====
    { id:'seed_case_01', orderId:null, workTitle:'9.9 包邮泡脚桶种草：把"廉价感"拍成"晚安仪式感"',
      resultUrl:null, rating:4, metrics:{views:8600,likes:412,comments:38},
      thoughts:'主打"睡前 10 分钟"的情绪场景，比直接喊价格转化高三倍', comment:'', isPublic:true,
      creatorName:'造物者·小南', direction:'ec', orderTitle:null,
      submitterCode:'kw_SN29', creatorTier:'free', featured:false,
      viewCount:1280, referenceCount:12, submittedAt:t(29), updatedAt:t(29) },

    { id:'seed_case_02', orderId:null, workTitle:'平价腮红盘开箱：3 个机位拍出"妆面感"',
      resultUrl:null, rating:4, metrics:{views:12400,likes:880,comments:95},
      thoughts:'侧光+45° 仰视镜头，廉价腮红也能拍出"高级肤感"', comment:'', isPublic:true,
      creatorName:'造物者·阿岚', direction:'ec', orderTitle:null,
      submitterCode:'kw_AL27', creatorTier:'creator', featured:false,
      viewCount:2150, referenceCount:24, submittedAt:t(27), updatedAt:t(27) },

    { id:'seed_case_03', orderId:null, workTitle:'国货护手霜冬季种草：38 秒讲透成分与肤感',
      resultUrl:null, rating:5, metrics:{views:156000,likes:9800,comments:720},
      thoughts:'把成分表当剧情节奏，前 5 秒先抛"为什么去年那瓶没效果"', comment:'', isPublic:true,
      creatorName:'造物者·清明', direction:'ec', orderTitle:null,
      submitterCode:'kw_QM25', creatorTier:'pro', featured:true,
      viewCount:8420, referenceCount:96, submittedAt:t(25), updatedAt:t(25) },

    { id:'seed_case_04', orderId:null, workTitle:'露营折叠椅带货：户外场景化口播 6 镜头模板',
      resultUrl:null, rating:3, metrics:null,
      thoughts:'"轻便+承重"两点拆成两个场景，第二场加狗子镜头会暴涨', comment:'', isPublic:true,
      creatorName:'造物者·豆子', direction:'ec', orderTitle:null,
      submitterCode:'kw_DZ22', creatorTier:'free', featured:false,
      viewCount:640, referenceCount:7, submittedAt:t(22), updatedAt:t(22) },

    { id:'seed_case_05', orderId:null, workTitle:'学生党机械键盘测评：预算 200 的快乐脚本',
      resultUrl:null, rating:4, metrics:{views:23000,likes:1450,comments:210},
      thoughts:'"开箱-码字-上分"三段拍法，码字段用慢动作放大键音', comment:'', isPublic:true,
      creatorName:'造物者·七七', direction:'ec', orderTitle:null,
      submitterCode:'kw_QQ18', creatorTier:'creator', featured:false,
      viewCount:3680, referenceCount:41, submittedAt:t(18), updatedAt:t(18) },

    { id:'seed_case_06', orderId:null, workTitle:'母婴湿巾对比评测：新手妈妈最关心的 3 点',
      resultUrl:null, rating:4, metrics:{views:9700,likes:530,comments:142},
      thoughts:'现场撕开 5 包做"湿润度横评"，比念参数有说服力', comment:'', isPublic:true,
      creatorName:'造物者·小溪', direction:'ec', orderTitle:null,
      submitterCode:'kw_XX14', creatorTier:'free', featured:false,
      viewCount:1820, referenceCount:19, submittedAt:t(14), updatedAt:t(14) },

    // ===== 情感短剧 (drama) · 6 条 =====
    { id:'seed_case_07', orderId:null, workTitle:'《最后一通电话》：异地恋分手前的 60 秒',
      resultUrl:null, rating:5, metrics:{views:480000,likes:38000,comments:4200},
      thoughts:'只用一个手机听筒视角，背景音保留环境噪声不配乐', comment:'', isPublic:true,
      creatorName:'造物者·见川', direction:'drama', orderTitle:null,
      submitterCode:'kw_JC20', creatorTier:'signed', featured:true,
      viewCount:12800, referenceCount:156, submittedAt:t(20), updatedAt:t(20) },

    { id:'seed_case_08', orderId:null, workTitle:'深夜便利店：陌生人递来的那碗关东煮',
      resultUrl:null, rating:4, metrics:{views:38000,likes:2400,comments:380},
      thoughts:'不给主角脸特写，全程拍手和食物，留白让观众代入', comment:'', isPublic:true,
      creatorName:'造物者·阿夜', direction:'drama', orderTitle:null,
      submitterCode:'kw_AY16', creatorTier:'creator', featured:false,
      viewCount:4250, referenceCount:38, submittedAt:t(16), updatedAt:t(16) },

    { id:'seed_case_09', orderId:null, workTitle:'《妈妈的旧手机》：删不掉的 200 条语音',
      resultUrl:null, rating:5, metrics:{views:210000,likes:18500,comments:2800},
      thoughts:'语音条波形当转场，最后一条留空白 3 秒不放声', comment:'', isPublic:true,
      creatorName:'造物者·星河', direction:'drama', orderTitle:null,
      submitterCode:'kw_XH12', creatorTier:'pro', featured:false,
      viewCount:9600, referenceCount:84, submittedAt:t(12), updatedAt:t(12) },

    { id:'seed_case_10', orderId:null, workTitle:'出租屋里的第一顿年夜饭',
      resultUrl:null, rating:3, metrics:null,
      thoughts:'手机支在锅边录，让油烟味"看得见"，比构图更重要', comment:'', isPublic:true,
      creatorName:'造物者·阿橘', direction:'drama', orderTitle:null,
      submitterCode:'kw_AJ10', creatorTier:'free', featured:false,
      viewCount:1340, referenceCount:8, submittedAt:t(10), updatedAt:t(10) },

    { id:'seed_case_11', orderId:null, workTitle:'《重逢》：十年后在地铁站认错的人',
      resultUrl:null, rating:4, metrics:{views:19500,likes:1280,comments:230},
      thoughts:'错过的瞬间用 0.5x 慢放，背景人群正常速度做对比', comment:'', isPublic:true,
      creatorName:'造物者·林深', direction:'drama', orderTitle:null,
      submitterCode:'kw_LS07', creatorTier:'creator', featured:false,
      viewCount:3120, referenceCount:27, submittedAt:t(7), updatedAt:t(7) },

    { id:'seed_case_12', orderId:null, workTitle:'加班到凌晨的她，收到一条迟到的晚安',
      resultUrl:null, rating:4, metrics:{views:5800,likes:320,comments:67},
      thoughts:'手机屏幕反光打在脸上当唯一光源，足够说清情绪', comment:'', isPublic:true,
      creatorName:'造物者·小满', direction:'drama', orderTitle:null,
      submitterCode:'kw_XM04', creatorTier:'free', featured:false,
      viewCount:940, referenceCount:11, submittedAt:t(4), updatedAt:t(4) },

    // ===== 知识科普 (other) · 6 条 =====
    { id:'seed_case_13', orderId:null, workTitle:'为什么便利店总把牛奶放最里面？超市动线心理学',
      resultUrl:null, rating:4, metrics:{views:21000,likes:1180,comments:240},
      thoughts:'开头先抛反问，第 8 秒放鸟瞰动线图，留住完播率', comment:'', isPublic:true,
      creatorName:'造物者·阿楚', direction:'other', orderTitle:null,
      submitterCode:'kw_AC24', creatorTier:'free', featured:false,
      viewCount:2890, referenceCount:33, submittedAt:t(24), updatedAt:t(24) },

    { id:'seed_case_14', orderId:null, workTitle:'3 分钟讲清"复利"：为什么时间比本金更重要',
      resultUrl:null, rating:5, metrics:{views:320000,likes:26000,comments:3100},
      thoughts:'把数学公式翻译成"今天少喝一杯奶茶=老了多一年退休金"', comment:'', isPublic:true,
      creatorName:'造物者·砚松', direction:'other', orderTitle:null,
      submitterCode:'kw_YS09', creatorTier:'pro', featured:true,
      viewCount:14600, referenceCount:178, submittedAt:t(9), updatedAt:t(9) },

    { id:'seed_case_15', orderId:null, workTitle:'多巴胺不是快乐：你被"奖励机制"骗了多久',
      resultUrl:null, rating:5, metrics:{views:580000,likes:46000,comments:5200},
      thoughts:'前 3 秒抛悖论"你刷短视频时其实并不快乐"勾住观众', comment:'', isPublic:true,
      creatorName:'造物者·云溪', direction:'other', orderTitle:null,
      submitterCode:'kw_YX06', creatorTier:'signed', featured:true,
      viewCount:18400, referenceCount:220, submittedAt:t(6), updatedAt:t(6) },

    { id:'seed_case_16', orderId:null, workTitle:'为什么 4 月 1 日要叫"愚人节"？历史比段子有趣',
      resultUrl:null, rating:4, metrics:{views:27000,likes:1640,comments:290},
      thoughts:'把时间线做成"剥洋葱"，每剥一层揭示一个意外', comment:'', isPublic:true,
      creatorName:'造物者·阿淮', direction:'other', orderTitle:null,
      submitterCode:'kw_AH05', creatorTier:'creator', featured:false,
      viewCount:3960, referenceCount:36, submittedAt:t(5), updatedAt:t(5) },

    { id:'seed_case_17', orderId:null, workTitle:'"鸡娃"焦虑的根：内卷不是教育问题，是稀缺感',
      resultUrl:null, rating:4, metrics:{views:16800,likes:980,comments:380},
      thoughts:'不喊"放下焦虑"，而是先承认稀缺感真实存在', comment:'', isPublic:true,
      creatorName:'造物者·暮川', direction:'other', orderTitle:null,
      submitterCode:'kw_MC03', creatorTier:'creator', featured:false,
      viewCount:2640, referenceCount:31, submittedAt:t(3), updatedAt:t(3) },

    { id:'seed_case_18', orderId:null, workTitle:'一张纸折 7 次就到月球？指数级增长的反直觉',
      resultUrl:null, rating:3, metrics:null,
      thoughts:'现场用 A4 纸折给观众看，比口播数字更震撼', comment:'', isPublic:true,
      creatorName:'造物者·小白', direction:'other', orderTitle:null,
      submitterCode:'kw_XB01', creatorTier:'free', featured:false,
      viewCount:580, referenceCount:4, submittedAt:t(1), updatedAt:t(1) }
  ];
})();
if (typeof window !== 'undefined') window.CASES_SEED = CASES_SEED;
