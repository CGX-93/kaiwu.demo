/* 开物 · 原子库种子（atoms-data.js）
 * AtomCard V2 结构。一个库一批原子，每条独立可检索、可复用。
 * 由 data-layer.js 的 _seedAtomsIfEmpty() 在 DOMContentLoaded 注入（空且未 seeded 才注入）。
 *
 * 字段速查：
 *   核心：id / title / library(中文库名) / libKey(短键，对接首页网格与 atoms.html?type=) / atomType
 *        summary / template / variables[] / domains[] / tags[] / signals{} / source{}
 *   早加：failurePatterns[] / repairSuggestions[]（失败修复，本轮必填）
 *   深层(专业版解锁)：promptTemplate / negativePrompt / mechanism
 *
 * libKey ↔ library 映射（7 库）：
 *   motif=卖点提炼 hook=钩子开头 storyboard=分镜节奏 style=风格锁定
 *   platform=平台调性 case=爆款案例 rescue=失败修复
 */
const ATOMS_SEED = (function () {
  'use strict';
  const TODAY = '2026-05-30';

  // ===== 库 1 · 卖点提炼（motif）· 6 条 =====
  const sellingPoint = [
    {
      id: 'atom_sell_001',
      title: '痛点放大公式',
      library: '卖点提炼', libKey: 'motif', atomType: '痛点',
      summary: '放大用户已存在但没说出口的痛点，制造"这说的就是我"的代入感，给用户继续看下去、并且改变的理由。',
      template: '你是不是也有{痛点场景}？明明{付出/期待}，结果却{落差结果}。',
      variables: [
        { name: '痛点场景', example: '熬夜敷面膜' },
        { name: '付出/期待', example: '用了大牌精华' },
        { name: '落差结果', example: '第二天还是暗沉' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['痛点放大', '代入感', '开篇'],
      signals: { score: 8.7, usageCount: 142, successRate: 0.63, freshnessScore: 8.2 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['痛点太泛，谁都不疼，等于没说', '把痛点直接说成产品功能，开篇变硬广', '连堆三个痛点，用户焦虑到划走'],
      repairSuggestions: ['锁定一个具体到场景的痛点，别用"皮肤不好"这种大词', '前 3 秒只共情不提货，先让用户认领痛点', '一条只打一个痛点，痛点之后立刻给希望'],
      mechanism: '利用"自我相关效应"——大脑对与自己有关的信息优先分配注意力；具体场景比抽象描述更易触发"这就是我"的认领。',
      promptTemplate: '为{产品}写一条短视频开场痛点文案：锁定{目标人群}在{具体场景}下的真实困扰，第二人称、口语化、一句话 12 字以内。',
      negativePrompt: '不要笼统的"效果不好/很烦恼"；痛点句里不要出现产品名和卖点；不要超过一个痛点。'
    },
    {
      id: 'atom_sell_002',
      title: 'FAB 利益转译',
      library: '卖点提炼', libKey: 'motif', atomType: '卖点',
      summary: '把产品参数(Feature)翻译成用户能感知的好处(Benefit)，解决"卖家报参数、买家无感"的鸿沟。',
      template: '{产品}用了{特性}，所以{优势}，对你来说就是{利益}。',
      variables: [
        { name: '特性', example: '医用级硅胶' },
        { name: '优势', example: '不勒不闷' },
        { name: '利益', example: '戴一整天耳朵也不疼' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['FAB', '利益转译', '卖点结构'],
      signals: { score: 8.4, usageCount: 118, successRate: 0.59, freshnessScore: 7.5 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['只报特性不翻译，用户记不住', '利益太虚("提升幸福感")无法感知', '一口气堆五个 FAB，重点被稀释'],
      repairSuggestions: ['每个特性必须落到一个可感知的生活化利益', '利益要能想象出画面，别用形容词堆砌', '一条主推一个 FAB，最多两个'],
      mechanism: '用户决策基于"对我有什么用"而非"它是什么"；Benefit 是把卖方语言翻成买方语言的桥。',
      promptTemplate: '用 FAB 结构为{产品}写卖点：给出{核心特性}，推导一个技术优势，最后翻译成一句具体可感知的用户利益。',
      negativePrompt: '不要停在参数层；不要用"高端大气/提升品质"等无画面感的虚词。'
    },
    {
      id: 'atom_sell_003',
      title: '损失厌恶框架',
      library: '卖点提炼', libKey: 'motif', atomType: '情绪触发',
      summary: '把"买它的好处"换成"不买的代价"，利用损失厌恶——人对失去的痛苦远大于得到的快乐。',
      template: '别等到{延误后果}才后悔，现在{低成本行动}，就能避免{更大损失}。',
      variables: [
        { name: '延误后果', example: '发际线退到遮不住' },
        { name: '低成本行动', example: '每天 2 分钟' },
        { name: '更大损失', example: '植发好几万' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['损失厌恶', '紧迫感', 'CTA'],
      signals: { score: 8.1, usageCount: 96, successRate: 0.55, freshnessScore: 7.0 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['吓唬过度变贩卖焦虑，引发反感', '后果不真实，用户根本不信', '只制造恐慌，没给低成本出口'],
      repairSuggestions: ['后果要真实可信，点到为止不渲染', '制造焦虑后立刻给一个轻量解决动作', '医疗/健康类慎用，避免违规夸大'],
      mechanism: '损失厌恶(Kahneman)——同等量级下损失的负效用约为收益正效用的 2 倍，"避免失去"比"获得"更驱动行动。',
      promptTemplate: '用损失厌恶框架为{产品}写一句 CTA：点出拖延的真实代价，再给一个当下就能做的低成本行动。',
      negativePrompt: '不要夸大不可逆后果；不要制造无解的恐慌；不要用绝对化承诺。'
    },
    {
      id: 'atom_sell_004',
      title: '场景代入卖点',
      library: '卖点提炼', libKey: 'motif', atomType: '卖点',
      summary: '把功能塞进一个具体使用场景里讲，让用户"看见自己在用"，比罗列功能更有画面、更易转化。',
      template: '{具体场景}的时候，{产品}就能{即时好处}，再也不用{原来的麻烦}。',
      variables: [
        { name: '具体场景', example: '挤地铁单手拎包' },
        { name: '即时好处', example: '一拉就开' },
        { name: '原来的麻烦', example: '翻半天找钥匙' }
      ],
      domains: ['电商带货', '短剧', '通用'],
      tags: ['场景化', '画面感', '单点突破'],
      signals: { score: 8.5, usageCount: 130, successRate: 0.61, freshnessScore: 8.0 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['场景太宽泛("日常使用")没画面', '一条塞三个场景，注意力分散', '场景与目标人群不匹配'],
      repairSuggestions: ['选一个最高频且具体的使用场景', '一条只演一个场景，演透', '场景里出现的人就是你的目标用户'],
      mechanism: '情景记忆比语义记忆更易被提取；具体场景激活镜像神经元，让用户"预演"使用过程，降低决策摩擦。',
      promptTemplate: '为{产品}选一个目标人群的高频真实场景，写卖点文案：场景 + 即时好处 + 解决的旧麻烦，口语化。',
      negativePrompt: '不要"适合各种场合"这种泛化；不要一条里塞多个场景。'
    },
    {
      id: 'atom_sell_005',
      title: '对比反差卖点',
      library: '卖点提炼', libKey: 'motif', atomType: '反差',
      summary: '用 before/after 或与旧方案的对比制造反差，让产品价值在对照中被放大。',
      template: '以前{旧方案痛点}，现在{新方案爽点}——差别就在{关键变量}。',
      variables: [
        { name: '旧方案痛点', example: '三脚架又重又占地' },
        { name: '新方案爽点', example: '巴掌大塞进口袋' },
        { name: '关键变量', example: '折叠结构' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['对比反差', 'before-after', '价值放大'],
      signals: { score: 8.3, usageCount: 108, successRate: 0.58, freshnessScore: 7.8 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['指名贬低竞品，引发反感或风险', '对比维度不公平，用户一眼看穿', '反差太弱，没有"哇"的瞬间'],
      repairSuggestions: ['对比"旧方案/过去的自己"，而非点名踩竞品', '选用户最在意的那个维度做对比', 'before 要够痛、after 要够爽，落差才有冲击'],
      mechanism: '对比效应——价值是相对感知的，同一属性在强对照下被放大；before/after 还提供"改变是可能的"证据。',
      promptTemplate: '为{产品}写一条对比反差卖点：先呈现旧方案/过去的痛，再给新方案的爽，点出造成差别的关键设计。',
      negativePrompt: '不要指名道姓贬低竞品；不要用虚假或不可比的对比维度。'
    },
    {
      id: 'atom_sell_006',
      title: '数字锚点卖点',
      library: '卖点提炼', libKey: 'motif', atomType: '卖点',
      summary: '用一个具体、带零头的数字当锚点，把抽象好处量化，制造可信度和记忆点。',
      template: '{具体数字}{单位}，就能{可量化结果}——相当于{生活化类比}。',
      variables: [
        { name: '具体数字', example: '9.9' },
        { name: '单位', example: '块' },
        { name: '可量化结果', example: '用一个月' },
        { name: '生活化类比', example: '一杯奶茶不到' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['数字锚点', '量化', '可信度'],
      signals: { score: 8.0, usageCount: 88, successRate: 0.54, freshnessScore: 7.2 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['数字太整("100%有效")显假', '只给数字不给类比，用户无感', '数字堆太多，记不住'],
      repairSuggestions: ['用带零头的数字(9.9/37 天)，比整数更可信', '每个关键数字配一个生活化类比', '一条只锚定一个核心数字'],
      mechanism: '锚定效应——首个出现的数字会成为后续判断的参照点；带零头的具体数字更被感知为"真实测算"而非拍脑袋。',
      promptTemplate: '为{产品}提炼一个可信的核心数字卖点，配一个生活化类比，把它翻译成用户能感知的量级。',
      negativePrompt: '不要绝对化数字(100%/第一)；不要无依据夸大；不要堆砌多个数字。'
    }
  ];

  // ===== 库 2 · 钩子开头（hook）· 6 条 =====
  const hook = [
    {
      id: 'atom_hook_001',
      title: '悬念前置钩',
      library: '钩子开头', libKey: 'hook', atomType: '钩子',
      summary: '把最冲突/最反常的结果提到第一句，制造"为什么会这样"的信息缺口，逼用户看下去。',
      template: '{反常结果}，原因居然是{出乎意料的关键}。',
      variables: [
        { name: '反常结果', example: '她月薪3千却存下50万' },
        { name: '出乎意料的关键', example: '只改了一个记账习惯' }
      ],
      domains: ['电商带货', '知识科普', '短剧', '通用'],
      tags: ['悬念', '信息缺口', '开篇3秒'],
      signals: { score: 8.8, usageCount: 160, successRate: 0.65, freshnessScore: 8.4 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['悬念太假，沦为标题党被反感', '谜底拖太久不揭，用户失去耐心', '结果不够反常，构不成缺口'],
      repairSuggestions: ['悬念要真实可兑现，别标题党', '3秒抛悬念，15秒内给第一条线索', '选最反直觉的那个点做开头'],
      mechanism: '信息缺口理论(Loewenstein)——当人意识到"已知"与"想知"之间有缺口，会产生类似痒的认知张力，驱动填补。',
      promptTemplate: '为{主题}写一句悬念前置开场：把最反常的结果放第一句，制造"为什么"的信息缺口，不剧透原因。',
      negativePrompt: '不要标题党式虚假悬念；不要第一句就揭晓答案；不要用"震惊体"。'
    },
    {
      id: 'atom_hook_002',
      title: '身份点名钩',
      library: '钩子开头', libKey: 'hook', atomType: '钩子',
      summary: '第一句精准点名目标人群，让"对的人"瞬间对号入座、"错的人"自动划走，提高完播质量。',
      template: '如果你是{目标身份}，还在{具体困扰}，这条一定看完。',
      variables: [
        { name: '目标身份', example: '刚做电商的新手' },
        { name: '具体困扰', example: '拍了视频没人看' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['身份点名', '精准筛选', '开篇'],
      signals: { score: 8.5, usageCount: 138, successRate: 0.62, freshnessScore: 7.9 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['身份太宽("所有人")等于没筛', '点名后承诺不兑现，期待落空', '困扰不痛，对号入座的人少'],
      repairSuggestions: ['身份越具体越好，宁窄勿宽', '点名的承诺必须在正文兑现', '困扰要选目标人群最高频那个'],
      mechanism: '鸡尾酒会效应——人对与自身份相关的信号高度敏感，点名直接触发选择性注意。',
      promptTemplate: '为{产品/主题}写身份点名开场：精准点出{目标人群}+他们最痛的一个具体困扰，让对的人对号入座。',
      negativePrompt: '不要泛指"所有人/大家"；不要点名后正文跑题；困扰不要太轻。'
    },
    {
      id: 'atom_hook_003',
      title: '反常识钩',
      library: '钩子开头', libKey: 'hook', atomType: '反差',
      summary: '第一句推翻一个被普遍相信的认知，用"等等，不是这样？"的认知冲突抓住注意力。',
      template: '别再{大众普遍做法}了，真正{有效目标}的方法其实是{反常识做法}。',
      variables: [
        { name: '大众普遍做法', example: '狂发优惠券' },
        { name: '有效目标', example: '提复购' },
        { name: '反常识做法', example: '先把第7天的提醒做好' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['反常识', '认知冲突', '打破默认'],
      signals: { score: 8.6, usageCount: 124, successRate: 0.6, freshnessScore: 8.1 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['为反而反，立不住会被骂', '推翻的认知没人信，无冲突', '只破不立，没给替代方案'],
      repairSuggestions: ['反常识必须有依据/案例兜底', '选一个真有很多人信的认知去推翻', '破完立刻立，给可执行替代'],
      mechanism: '预期违背——当输入与心理预期冲突，大脑会提高加工深度以消解矛盾，注意力随之拉高。',
      promptTemplate: '为{主题}写反常识开场：推翻一个该领域被普遍相信的做法，给出有依据的反向观点。',
      negativePrompt: '不要无依据为反而反；不要推翻没人信的稻草人观点；不要只破不立。'
    },
    {
      id: 'atom_hook_004',
      title: '数字清单钩',
      library: '钩子开头', libKey: 'hook', atomType: '钩子',
      summary: '用明确数字框定内容量（3个/5种），给大脑"有限、可掌握"的预期，提高点开与完播。',
      template: '{数字}个{品类}，第{序号}个{最大亮点/最反常}。',
      variables: [
        { name: '数字', example: '3' },
        { name: '品类', example: '选品误区' },
        { name: '序号', example: '2' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['数字清单', '结构预期', '利益前置'],
      signals: { score: 8.2, usageCount: 112, successRate: 0.57, freshnessScore: 7.4 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['数字太大(10个)劝退', '清单注水，后几条凑数', '没把最强的放前面预告'],
      repairSuggestions: ['控制在3-5个，宁精勿多', '每条都要硬，别为凑数', '把最反常那条提前剧透勾人'],
      mechanism: '认知闭合需求——明确数量给出"任务边界"，降低不确定感，让人更愿投入完成。',
      promptTemplate: '把{主题}整理成3-5条清单式开场，第一句点明数量并剧透最反常的一条。',
      negativePrompt: '数量不要超过5；不要注水凑数；不要把最弱的放第一条。'
    },
    {
      id: 'atom_hook_005',
      title: '提问互动钩',
      library: '钩子开头', libKey: 'hook', atomType: '钩子',
      summary: '用一个扎心的封闭式提问直接戳中观众，引发内心回答与评论冲动。',
      template: '你有没有过这种时刻：{扎心场景}？',
      variables: [
        { name: '扎心场景', example: '购物车塞满，最后只敢买打折的' }
      ],
      domains: ['电商带货', '短剧', '知识科普', '通用'],
      tags: ['提问', '互动诱饵', '情绪共鸣'],
      signals: { score: 8.0, usageCount: 101, successRate: 0.55, freshnessScore: 7.6 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['问题太泛，激不起反应', '开放式大问题没人想答', '问完不接住，情绪断掉'],
      repairSuggestions: ['问具体到场景的封闭式问题', '问完立刻给共鸣或答案接住', '一条只问一个问题'],
      mechanism: '自我参照 + 蔡格尼克效应——被提问会自动在脑中"作答"，未完成的回答制造继续观看的张力。',
      promptTemplate: '为{主题}写一句提问式开场：一个具体到场景、能让目标人群秒共鸣的封闭式问题。',
      negativePrompt: '不要笼统大问题；不要开放式哲学提问；问完不要立刻跳走。'
    },
    {
      id: 'atom_hook_006',
      title: '进度条剧透钩',
      library: '钩子开头', libKey: 'hook', atomType: '钩子',
      summary: '开头预告"结尾有反转/福利"，给观众看到最后的理由，拉满完播率。',
      template: '{正文承诺}，看到最后有{结尾钩子}。',
      variables: [
        { name: '正文承诺', example: '今天教你3步起号' },
        { name: '结尾钩子', example: '一个能直接抄的模板' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['完播率', '结尾预告', '福利前置'],
      signals: { score: 7.9, usageCount: 94, successRate: 0.53, freshnessScore: 7.1 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['结尾兑现不了，被骂骗完播', '预告太频繁，套路感强', '福利不够诱人，没人等'],
      repairSuggestions: ['结尾必须真给，且值得等', '一条只埋一个结尾钩', '福利要和正文强相关'],
      mechanism: '目标梯度效应——可见的"终点奖励"增强坚持到底的动机，越接近越不愿放弃。',
      promptTemplate: '为{主题}写开场：正文承诺 + 在结尾埋一个值得等到最后的具体福利/反转预告。',
      negativePrompt: '不要承诺结尾却不兑现；不要一条埋多个结尾钩；福利不要与正文无关。'
    }
  ];

  // ===== 库 3 · 分镜节奏（storyboard）· 5 条（含运镜，中性命名，平台作子标签）=====
  const storyboard = [
    {
      id: 'atom_sb_001',
      title: '黄金3秒开场结构',
      library: '分镜节奏', libKey: 'storyboard', atomType: '分镜',
      summary: '规定0-3秒的画面任务：先给冲突画面再上大字幕，用视觉而非口播抓人。',
      template: '0-1s：{冲突/反常画面}；1-3s：{大字幕点题} + {人物入画}。',
      variables: [
        { name: '冲突/反常画面', example: '满桌失败的成片' },
        { name: '大字幕点题', example: '为什么你的视频没人看' },
        { name: '人物入画', example: '博主无奈出镜' }
      ],
      domains: ['电商带货', '短剧', '知识科普', '通用'],
      tags: ['黄金3秒', '开场结构', '视觉优先'],
      signals: { score: 8.7, usageCount: 150, successRate: 0.64, freshnessScore: 8.3 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['开场是logo/片头，浪费黄金期', '纯口播无画面，留不住', '点题字幕太小太晚'],
      repairSuggestions: ['第一帧就是内容，删掉片头', '3秒内必须出现视觉冲突点', '点题字幕做到大、早、居中'],
      mechanism: '前3秒决定划走率；视觉信息处理快于语音，冲突画面先于语言触发停留。',
      promptTemplate: '为{主题}设计0-3秒开场分镜：第一帧冲突画面 + 大字幕点题 + 人物入画的镜头脚本。',
      negativePrompt: '不要片头logo；不要开场纯口播；字幕不要小而晚。'
    },
    {
      id: 'atom_sb_002',
      title: '三段式节奏配比',
      library: '分镜节奏', libKey: 'storyboard', atomType: '分镜',
      summary: '把短视频切成钩子-价值-行动三段，给出经验时长配比，避免节奏失衡。',
      template: '钩子{t1}s（~15%）→ 价值{t2}s（~70%）→ CTA{t3}s（~15%）。',
      variables: [
        { name: 't1', example: '3' },
        { name: 't2', example: '24' },
        { name: 't3', example: '3' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['三段式', '节奏配比', '结构'],
      signals: { score: 8.4, usageCount: 121, successRate: 0.59, freshnessScore: 7.7 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['钩子太长，价值被挤压', '价值段平铺无小高潮', '结尾没CTA，流量不转化'],
      repairSuggestions: ['钩子不超过总长15%', '价值段每7-10秒设一个小钩', '结尾必须有明确下一步动作'],
      mechanism: '注意力呈波浪衰减，分段+段内小钩可周期性拉回注意，维持完播。',
      promptTemplate: '为{时长}秒的{主题}视频排三段式节奏：给出钩子/价值/CTA各段时长与要点。',
      negativePrompt: '钩子不要超过15%；价值段不要一平到底；不要漏掉结尾CTA。'
    },
    {
      id: 'atom_sb_003',
      title: '推近强调运镜参数',
      library: '分镜节奏', libKey: 'storyboard', atomType: '运镜',
      summary: '缓慢推近（push in）把观众视线锁到主体，用于强调卖点或情绪升温的瞬间。',
      template: '镜头从{起幅景别}缓慢推近到{落幅景别}，速度慢而匀，落点对准{强调主体}。',
      variables: [
        { name: '起幅景别', example: '中景' },
        { name: '落幅景别', example: '特写' },
        { name: '强调主体', example: '产品质地 / 人物眼神' }
      ],
      domains: ['电商带货', '短剧', '通用'],
      tags: ['推镜', 'push-in', '强调', '可灵', '即梦', '剪映'],
      signals: { score: 8.1, usageCount: 88, successRate: 0.56, freshnessScore: 7.9 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['推太快显廉价，像变焦', '推近时主体跑出画面', '滥用，每个镜头都推'],
      repairSuggestions: ['匀速慢推，必要时配轻微景深变化', '锁定主体并留足安全框', '一条里推近镜头不超过2-3次'],
      mechanism: '视线随画面收束聚焦——推近改变视场角，强制注意力向落点收敛，强化情绪/卖点。',
      promptTemplate: '生成一段推近运镜：从{起幅}到{落幅}缓慢push in，落点{主体}，节奏沉稳（平台子标签按需替换）。',
      negativePrompt: '不要快速变焦；不要推到主体出框；不要全片滥用推镜。'
    },
    {
      id: 'atom_sb_004',
      title: '环绕展示运镜参数',
      library: '分镜节奏', libKey: 'storyboard', atomType: '运镜',
      summary: '绕主体做弧形环绕（orbit/arc），半环或全环展示产品立体感与质感，适合开箱/特写。',
      template: '镜头以{主体}为圆心做{半环/全环}环绕，半径{近/中}，匀速，配合{补光方向}。',
      variables: [
        { name: '主体', example: '产品' },
        { name: '半环/全环', example: '半环180°' },
        { name: '补光方向', example: '侧逆光' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['环绕', 'orbit', '立体展示', '可灵', '即梦'],
      signals: { score: 7.8, usageCount: 72, successRate: 0.52, freshnessScore: 7.5 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['环绕太快引起眩晕', '背景杂乱，环绕暴露穿帮', '速度忽快忽慢，不匀'],
      repairSuggestions: ['控制角速度，慢而稳', '用干净背景或浅景深虚化', '用稳定器/关键帧保证匀速'],
      mechanism: '多视角运动提供深度线索，大脑据此重建立体形状，提升对产品质感的感知。',
      promptTemplate: '生成环绕运镜：以{主体}为圆心做{半环/全环}匀速orbit，浅景深，{补光}（平台子标签按需替换）。',
      negativePrompt: '不要高速环绕；背景不要杂乱；不要忽快忽慢。'
    },
    {
      id: 'atom_sb_005',
      title: '卡点快切节奏',
      library: '分镜节奏', libKey: 'storyboard', atomType: '分镜',
      summary: '让剪辑点踩在音乐节拍上做快切，制造爽感和推进感，适合多卖点/多场景串联。',
      template: '每{节拍数}拍切一个镜头，切点对齐{重音/鼓点}，画面保持{统一构图/统一运动方向}。',
      variables: [
        { name: '节拍数', example: '1' },
        { name: '重音/鼓点', example: '底鼓' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['卡点', '快切', '节奏', 'BGM'],
      signals: { score: 8.0, usageCount: 97, successRate: 0.55, freshnessScore: 7.3 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['切点没对准节拍，凌乱', '快切但每个镜头信息为零', '全程快切，没有呼吸点'],
      repairSuggestions: ['先定BGM再按鼓点标切点', '每个快切镜头给一个明确信息', '高潮快切，间隙留慢镜呼吸'],
      mechanism: '视听同步——剪辑点与听觉重音对齐时产生"卡点爽感"，节奏感知增强、停留延长。',
      promptTemplate: '为{主题}设计卡点快切：选定BGM鼓点，给出每个切点的镜头内容与统一构图规则。',
      negativePrompt: '切点不要偏离节拍；快切镜头不要空洞；不要全程无呼吸点。'
    }
  ];

  // ===== 库 4 · 风格锁定（style）· 5 条 =====
  const style = [
    {
      id: 'atom_style_001',
      title: '日系清新风格锁',
      library: '风格锁定', libKey: 'style', atomType: '视觉风格',
      summary: '用低饱和、高调柔光、留白构图锁定日系清新感，适合美妆/食品/生活方式。',
      template: '{主体}，日系清新风格，低饱和柔光，色温{色温}，留白构图，细腻胶片颗粒。',
      variables: [
        { name: '主体', example: '一杯冰拿铁' },
        { name: '色温', example: '微暖' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['日系', '清新', '低饱和', '柔光', '留白'],
      signals: { score: 8.3, usageCount: 110, successRate: 0.58, freshnessScore: 7.8 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['饱和度没压住，变糖水片', '光太硬，失去柔感', '留白变成空洞'],
      repairSuggestions: ['压低饱和+提亮阴影做高调', '用柔光/阴天光或柔光罩', '留白处放呼吸感而非纯空'],
      mechanism: '低饱和高明度+留白触发"轻、静、洁净"的通感联想，与清新定位一致。',
      promptTemplate: '{主体}, Japanese fresh aesthetic, low saturation, soft high-key light, airy negative space, fine film grain.',
      negativePrompt: 'oversaturated, harsh shadows, cluttered background, heavy contrast.'
    },
    {
      id: 'atom_style_002',
      title: '国潮东方美学风格锁',
      library: '风格锁定', libKey: 'style', atomType: '视觉风格',
      summary: '用水墨留白、朱砂/黛青配色、传统纹样锁定国潮东方感，适合茶饮/文创/服饰。',
      template: '{主体}，国潮东方美学，{主色}配色，水墨留白，{传统元素}点缀，质感高级。',
      variables: [
        { name: '主体', example: '一盏茶' },
        { name: '主色', example: '黛青+朱砂' },
        { name: '传统元素', example: '祥云纹' }
      ],
      domains: ['电商带货', '条漫', '通用'],
      tags: ['国潮', '东方美学', '水墨', '传统纹样'],
      signals: { score: 8.1, usageCount: 86, successRate: 0.55, freshnessScore: 8.0 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['元素堆砌，土味而非高级', '配色脏，朱砂黛青调不准', '现代与传统割裂'],
      repairSuggestions: ['少即是多，一两个传统元素点睛', '严格控色，参考传统色卡', '用统一光影把古今缝合'],
      mechanism: '文化符号唤起集体记忆与身份认同，留白与正色对照塑造"高级东方"感。',
      promptTemplate: '{主体}, modern Chinese guochao aesthetic, ink-wash negative space, {主色} palette, subtle traditional motifs, premium texture.',
      negativePrompt: 'cluttered motifs, muddy colors, kitschy, low-end render.'
    },
    {
      id: 'atom_style_003',
      title: '赛博朋克霓虹风格锁',
      library: '风格锁定', libKey: 'style', atomType: '视觉风格',
      summary: '用高对比霓虹、青洋红撞色、潮湿反光锁定赛博朋克，适合数码/潮玩/夜场景。',
      template: '{主体}，赛博朋克，霓虹{青/洋红}撞色，潮湿地面反光，高对比暗调，体积光。',
      variables: [
        { name: '主体', example: '一台机械键盘' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['赛博朋克', '霓虹', '高对比', '撞色', '体积光'],
      signals: { score: 7.9, usageCount: 79, successRate: 0.52, freshnessScore: 7.6 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['霓虹乱打，廉价游戏感', '主体淹没在背景特效', '对比过曝，细节全丢'],
      repairSuggestions: ['限定2-3个霓虹色，统一色相', '留一束光打亮主体做主次', '压高光保细节，暗部留层次'],
      mechanism: '高对比撞色+反光制造未来/科技通感，强视觉刺激适配数码潮品定位。',
      promptTemplate: '{主体}, cyberpunk, neon cyan-magenta rim light, wet reflective ground, high-contrast low-key, volumetric light.',
      negativePrompt: 'flat lighting, washed out, subject lost in background, cheap game render.'
    },
    {
      id: 'atom_style_004',
      title: 'Q版扁平插画风格锁',
      library: '风格锁定', libKey: 'style', atomType: '视觉风格',
      summary: '用圆润造型、扁平色块、粗描边锁定Q版插画，适合科普/母婴/教育的亲和表达。',
      template: '{主体}，Q版扁平插画，圆润造型，{主色调}扁平色块，粗描边，简洁背景。',
      variables: [
        { name: '主体', example: '一个储蓄罐角色' },
        { name: '主色调', example: '奶油黄+薄荷绿' }
      ],
      domains: ['知识科普', '条漫', '通用'],
      tags: ['Q版', '扁平', '插画', '描边', '亲和'],
      signals: { score: 7.7, usageCount: 68, successRate: 0.5, freshnessScore: 7.2 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['造型比例失调，不可爱', '色块脏，缺乏统一调性', '细节过多，失去扁平感'],
      repairSuggestions: ['统一圆角与头身比', '限定3-4色，扁平不加复杂渐变', '留白克制，背景简洁'],
      mechanism: '婴儿图式（大头圆眼）触发可爱感与亲近，降低科普/教育内容的认知门槛。',
      promptTemplate: '{主体}, cute flat vector illustration, rounded shapes, {主色} flat color blocks, bold outline, minimal background.',
      negativePrompt: 'realistic shading, complex gradients, cluttered detail, off proportions.'
    },
    {
      id: 'atom_style_005',
      title: '电影感胶片风格锁',
      library: '风格锁定', libKey: 'style', atomType: '视觉风格',
      summary: '用宽画幅、低饱和青橙调、柔和颗粒锁定电影感，适合短剧/品牌叙事/情绪向内容。',
      template: '{场景}，电影感，{画幅}，青橙色调，柔和胶片颗粒，浅景深，自然光比。',
      variables: [
        { name: '场景', example: '雨夜便利店' },
        { name: '画幅', example: '2.39:1 宽银幕' }
      ],
      domains: ['短剧', '电商带货', '通用'],
      tags: ['电影感', '胶片', '青橙', '宽画幅', '浅景深'],
      signals: { score: 8.2, usageCount: 103, successRate: 0.57, freshnessScore: 7.9 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['青橙调过度，肤色发绿', '加黑边假装电影感', '颗粒过重像噪点'],
      repairSuggestions: ['保肤色自然，只在阴影压青', '用真实画幅构图而非裁黑边', '颗粒克制，模拟胶片非噪声'],
      mechanism: '观众把宽画幅+青橙调+颗粒与院线电影经验绑定，触发"高级、可信、有情绪"的预期。',
      promptTemplate: '{场景}, cinematic, {画幅} aspect, teal-and-orange grade, soft film grain, shallow depth of field, natural contrast.',
      negativePrompt: 'green skin tones, fake letterbox bars, heavy digital noise, flat video look.'
    }
  ];

  // ===== 库 5 · 平台调性（platform）· 4 条（抖音/小红书/视频号/快手 各一）=====
  const platform = [
    {
      id: 'atom_pf_douyin',
      title: '抖音调性指南',
      library: '平台调性', libKey: 'platform', atomType: '平台规则',
      summary: '抖音强算法分发，前3秒钩子+强节奏+完播是命门，内容要"爽、快、有信息密度"。',
      template: '抖音版{主题}：3秒强钩子 + {时长}秒高密度 + 卡点节奏 + 评论区埋互动。',
      variables: [
        { name: '主题', example: '选品技巧' },
        { name: '时长', example: '21' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['抖音', '完播率', '强钩子', '算法分发'],
      signals: { score: 8.5, usageCount: 140, successRate: 0.6, freshnessScore: 8.0 },
      source: { type: 'team_preset', platform: '抖音', url: '', collectedAt: TODAY },
      failurePatterns: ['开头慢热，3秒就被划', '信息密度低，中段流失', '无互动设计，评论冷'],
      repairSuggestions: ['黄金3秒必须有钩子或冲突', '每7-10秒一个小高潮', '结尾或评论区埋一个争议/提问'],
      mechanism: '抖音以完播率/互动率为核心推荐信号，前3秒和节奏直接决定流量池晋级。',
      promptTemplate: '把{主题}改造成抖音版脚本：3秒钩子+高密度价值+卡点节奏+一个评论区互动钩。',
      negativePrompt: '不要慢热开场；不要平铺无高潮；不要忽略互动设计。'
    },
    {
      id: 'atom_pf_xhs',
      title: '小红书调性指南',
      library: '平台调性', libKey: 'platform', atomType: '平台规则',
      summary: '小红书重封面与搜索，"干货笔记+真实种草+高级感封面"是点击与收藏的关键。',
      template: '小红书版{主题}：封面{数字/痛点}大字 + 真实使用体验 + {N}个干货点 + 收藏诱导。',
      variables: [
        { name: '主题', example: '平价好物' },
        { name: 'N', example: '5' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['小红书', '封面', '种草', '搜索', '收藏'],
      signals: { score: 8.3, usageCount: 126, successRate: 0.59, freshnessScore: 7.9 },
      source: { type: 'team_preset', platform: '小红书', url: '', collectedAt: TODAY },
      failurePatterns: ['封面无信息，点击率低', '硬广感强，被判营销', '无干货，不被收藏'],
      repairSuggestions: ['封面用大字点明利益/痛点', '先体验后结论，弱化广告感', '给可收藏的干货清单'],
      mechanism: '小红书是"搜索+收藏"型社区，封面决定点击、干货决定收藏，收藏权重高于点赞。',
      promptTemplate: '把{主题}改造成小红书笔记：封面大字方案+真实种草正文+N个干货点+收藏诱导句。',
      negativePrompt: '封面不要纯图无字；不要硬广口吻；不要无干货只夸产品。'
    },
    {
      id: 'atom_pf_shipinhao',
      title: '视频号调性指南',
      library: '平台调性', libKey: 'platform', atomType: '平台规则',
      summary: '视频号靠社交关系链裂变，中长情感向+价值观共鸣+引导转发更易破圈，受众偏成熟。',
      template: '视频号版{主题}：情感切入 + {价值观共鸣点} + 适度时长叙事 + 引导"转发给需要的人"。',
      variables: [
        { name: '主题', example: '家庭理财' },
        { name: '价值观共鸣点', example: '为家人攒下安全感' }
      ],
      domains: ['知识科普', '短剧', '通用'],
      tags: ['视频号', '社交裂变', '情感', '转发', '中长视频'],
      signals: { score: 7.9, usageCount: 88, successRate: 0.53, freshnessScore: 7.4 },
      source: { type: 'team_preset', platform: '视频号', url: '', collectedAt: TODAY },
      failurePatterns: ['太快太炸，不适配成熟受众', '无转发理由，裂变断链', '纯干货无情感，难共鸣'],
      repairSuggestions: ['放慢节奏，重情感与价值观', '给一个"想转给某人"的理由', '结尾落到共鸣而非促销'],
      mechanism: '视频号分发依赖微信社交关系链，转发是核心裂变变量，情感/价值观内容更易被转。',
      promptTemplate: '把{主题}改造成视频号脚本：情感切入+价值观共鸣+引导转发给特定的人。',
      negativePrompt: '不要纯炸点快节奏；不要无转发理由；不要硬促销结尾。'
    },
    {
      id: 'atom_pf_kuaishou',
      title: '快手调性指南',
      library: '平台调性', libKey: 'platform', atomType: '平台规则',
      summary: '快手重真实与信任，"接地气人设+真诚直给+老铁互动"比精致包装更能转化，下沉市场强。',
      template: '快手版{主题}：真实出镜 + 大白话直给 + {利益点} + "老铁"式互动。',
      variables: [
        { name: '主题', example: '源头好物' },
        { name: '利益点', example: '厂价直发不绕弯' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['快手', '真实', '信任', '老铁', '下沉市场'],
      signals: { score: 7.8, usageCount: 74, successRate: 0.51, freshnessScore: 7.2 },
      source: { type: 'team_preset', platform: '快手', url: '', collectedAt: TODAY },
      failurePatterns: ['过度精致，显假失信任', '文绉绉，不接地气', '只卖货不交心'],
      repairSuggestions: ['真人真场景，弱化滤镜包装', '用大白话讲实在利益', '先处关系再带货'],
      mechanism: '快手社区强调"信任电商"，真实感与主播人设带来的信任直接驱动下单。',
      promptTemplate: '把{主题}改造成快手脚本：真实出镜+大白话讲利益+老铁式互动，弱化精致包装。',
      negativePrompt: '不要过度精致摆拍；不要书面文绉绉；不要只卖货不交心。'
    }
  ];

  // ===== 库 6 · 爆款案例（case）· 4 条（占位，后续靠 decode 长大）=====
  const caseLib = [
    {
      id: 'atom_case_001',
      title: '「晚安仪式感」泡脚桶',
      library: '爆款案例', libKey: 'case', atomType: '卖点',
      summary: '把9.9低价泡脚桶从"廉价"重构成"睡前仪式感"，用情绪场景而非价格做卖点，转化提升。',
      template: '{低价品类}不打价格战，改打{情绪场景}：把"{功能}"讲成"{情绪收益}"。',
      variables: [
        { name: '低价品类', example: '泡脚桶' },
        { name: '情绪场景', example: '睡前10分钟' },
        { name: '功能', example: '热水泡脚' },
        { name: '情绪收益', example: '一天的紧绷被泡开' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['情绪卖点', '低价重构', '场景化', '案例'],
      signals: { score: 8.4, usageCount: 60, successRate: 0.62, freshnessScore: 8.1 },
      source: { type: 'team_preset', platform: '抖音', url: '', collectedAt: TODAY },
      failurePatterns: ['只喊便宜，陷入价格战', '情绪太满，不见产品', '场景与人群不符'],
      repairSuggestions: ['弱化价格，主打情绪场景', '情绪里嵌入产品使用瞬间', '锁定加班党/熬夜党等具体人群'],
      mechanism: '价值重构——同一产品换参照系（从"价格"到"情绪仪式"），感知价值上移，摆脱比价。',
      promptTemplate: '为{低价产品}做一条情绪重构脚本：放弃价格战，用一个睡前/独处情绪场景承载卖点。',
      negativePrompt: '不要主打低价；不要情绪空转不见产品；场景不要泛化。'
    },
    {
      id: 'atom_case_002',
      title: '「奶茶换退休金」复利科普',
      library: '爆款案例', libKey: 'case', atomType: '卖点',
      summary: '把抽象的复利概念翻译成"每天少喝一杯奶茶=老了多一年退休金"，用生活化类比降门槛。',
      template: '把{抽象概念}翻译成"{日常小行为} = {长期大结果}"。',
      variables: [
        { name: '抽象概念', example: '复利' },
        { name: '日常小行为', example: '每天少喝一杯奶茶' },
        { name: '长期大结果', example: '多攒一年退休金' }
      ],
      domains: ['知识科普', '通用'],
      tags: ['类比翻译', '复利', '生活化', '案例'],
      signals: { score: 8.6, usageCount: 72, successRate: 0.65, freshnessScore: 8.2 },
      source: { type: 'team_preset', platform: '抖音', url: '', collectedAt: TODAY },
      failurePatterns: ['类比不准，误导概念', '数字夸大，经不起算', '只给类比不给逻辑'],
      repairSuggestions: ['类比要数学上站得住', '用保守可验证的数字', '类比后补一句简单推导'],
      mechanism: '类比认知——把抽象量映射到熟悉的日常经验，调用已有图式，理解与记忆成本骤降。',
      promptTemplate: '把{抽象概念}用"日常小行为=长期大结果"的类比讲清，配一个保守可信的数字。',
      negativePrompt: '类比不要失真；数字不要夸大；不要只类比不解释。'
    },
    {
      id: 'atom_case_003',
      title: '「最后一通电话」情感短剧',
      library: '爆款案例', libKey: 'case', atomType: '钩子',
      summary: '用单一手机听筒视角+环境原声（不配乐）呈现异地恋分手60秒，克制留白反而催泪。',
      template: '{强情绪事件}只用{单一视角/道具}呈现，去配乐留{真实环境音}，靠留白让观众脑补。',
      variables: [
        { name: '强情绪事件', example: '异地恋分手' },
        { name: '单一视角/道具', example: '手机听筒' },
        { name: '真实环境音', example: '街道嘈杂声' }
      ],
      domains: ['短剧', '通用'],
      tags: ['留白', '单视角', '情绪', '案例'],
      signals: { score: 8.5, usageCount: 58, successRate: 0.63, freshnessScore: 8.0 },
      source: { type: 'team_preset', platform: '视频号', url: '', collectedAt: TODAY },
      failurePatterns: ['信息给太满，没有留白', '配乐煽情过度，显廉价', '视角乱切，破坏沉浸'],
      repairSuggestions: ['敢减，只留一个核心道具/视角', '去掉配乐用环境原声', '一镜或极简切换保持沉浸'],
      mechanism: '留白触发观众主动补全（蔡格尼克+投射），自我代入产生的情绪比直给更强。',
      promptTemplate: '把{强情绪事件}写成60秒短剧：限定单一视角/道具，用环境原声替代配乐，靠留白催情绪。',
      negativePrompt: '不要信息给满；不要配乐过度煽情；不要频繁切视角。'
    },
    {
      id: 'atom_case_004',
      title: '「出租屋改造」收纳好物',
      library: '爆款案例', libKey: 'case', atomType: '反差',
      summary: '把收纳产品放进"出租屋一平米改造"的真实before/after里，用空间反差证明产品价值。',
      template: '{产品}放进{真实局促场景}，用{before脏乱}→{after清爽}的反差证明价值。',
      variables: [
        { name: '产品', example: '伸缩收纳架' },
        { name: '真实局促场景', example: '出租屋灶台' },
        { name: 'before脏乱', example: '瓶罐堆满台面' },
        { name: 'after清爽', example: '三层归位清爽' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['before-after', '场景反差', '收纳', '案例'],
      signals: { score: 8.2, usageCount: 54, successRate: 0.6, freshnessScore: 7.8 },
      source: { type: 'team_preset', platform: '小红书', url: '', collectedAt: TODAY },
      failurePatterns: ['场景太理想，不真实没共鸣', 'before摆拍假，after没说服力', '只展示不给购买理由'],
      repairSuggestions: ['用真实有点乱的场景，别样板间', 'before真实、after真改善，落差自然', '改造后点一句产品关键作用'],
      mechanism: 'before/after提供"改变可达成"的视觉证据，局促真实场景增强目标人群代入。',
      promptTemplate: '为{收纳产品}做一条出租屋改造脚本：真实局促场景的before/after反差+产品关键作用。',
      negativePrompt: '场景不要样板间化；before/after不要摆拍失真；不要只秀不给买点。'
    }
  ];

  // ===== 库 7 · 失败修复（rescue）· 6 条 =====
  const rescue = [
    {
      id: 'atom_rs_001',
      title: '完播率低 · 开头废话',
      library: '失败修复', libKey: 'rescue', atomType: '失败模式',
      summary: '前几秒在自我介绍/铺垫，错过黄金3秒，导致大量用户在钩子出现前就划走。',
      template: '症状：{开头内容}占了前{秒数}秒还没进正题 → 完播率断崖。',
      variables: [
        { name: '开头内容', example: '大家好我是…今天天气' },
        { name: '秒数', example: '5' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['完播率', '开头', '黄金3秒', '失败修复'],
      signals: { score: 8.6, usageCount: 130, successRate: 0.66, freshnessScore: 8.1 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['以为要先自我介绍铺垫', '把高潮留到最后才放', '开头无字幕，全靠口播'],
      repairSuggestions: ['删掉一切片头/自我介绍，第一句即钩子', '把最强的点前置到3秒内', '开头加大字幕承接口播'],
      mechanism: '推荐算法用前3秒留存判断内容质量，开头废话直接拉低初始完播、压制流量池。',
      promptTemplate: '诊断这条{主题}视频的开头并改写：删除铺垫，给一个3秒内的钩子开场。',
      negativePrompt: '不要保留自我介绍/片头；不要把高潮后置；不要无字幕开头。'
    },
    {
      id: 'atom_rs_002',
      title: '转化低 · 卖点堆砌',
      library: '失败修复', libKey: 'rescue', atomType: '失败模式',
      summary: '一条视频塞了七八个卖点，没有主次，用户记不住任何一个，决策被信息过载拖垮。',
      template: '症状：一条讲了{数量}个卖点，没有主推 → 用户记不住，转化低。',
      variables: [
        { name: '数量', example: '8' }
      ],
      domains: ['电商带货', '通用'],
      tags: ['转化率', '卖点', '信息过载', '失败修复'],
      signals: { score: 8.4, usageCount: 118, successRate: 0.62, freshnessScore: 7.8 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['怕漏卖点，全都讲', '每个卖点都浅尝辄止', '没有"为什么现在买"的理由'],
      repairSuggestions: ['一条主推1个核心卖点，讲透', '其余卖点一句话带过或留评论区', '补一个紧迫感/限时理由收口'],
      mechanism: '工作记忆容量有限（~3-4块），卖点过载导致编码失败，反而什么都没记住。',
      promptTemplate: '把这条堆了多个卖点的{产品}脚本改成单点突破：选1个核心卖点讲透，其余弱化。',
      negativePrompt: '不要平均用力讲所有卖点；不要每点都浅；不要漏掉购买理由。'
    },
    {
      id: 'atom_rs_003',
      title: '划走快 · 节奏拖沓',
      library: '失败修复', libKey: 'rescue', atomType: '失败模式',
      summary: '中段信息密度低、没有小钩子，注意力自然衰减，用户在价值段中途流失。',
      template: '症状：{时间段}节奏平、无小高潮 → 中段大量划走。',
      variables: [
        { name: '时间段', example: '第10-20秒' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['节奏', '中段流失', '完播率', '失败修复'],
      signals: { score: 8.1, usageCount: 96, successRate: 0.58, freshnessScore: 7.5 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['一种语速一镜到底', '信息密度前高后低', '没有过渡钩，段落松散'],
      repairSuggestions: ['每7-10秒设一个小钩/反转', '变景别、变语速制造节奏', '用"还有更狠的"等过渡钩串段'],
      mechanism: '注意力随时间衰减，缺少周期性刺激（小钩）就无法把注意力拉回，流失加速。',
      promptTemplate: '诊断这条{主题}的中段节奏并加钩：每7-10秒插一个小钩或反转，重排景别与语速。',
      negativePrompt: '不要一镜一速到底；信息不要前重后空；段落之间不要无过渡。'
    },
    {
      id: 'atom_rs_004',
      title: '评论冷 · 无互动诱饵',
      library: '失败修复', libKey: 'rescue', atomType: '失败模式',
      summary: '内容讲完就结束，没有给观众任何评论的理由，互动率低拖累推荐权重。',
      template: '症状：结尾{结束方式}，无提问/无争议 → 评论区冷清。',
      variables: [
        { name: '结束方式', example: '谢谢观看' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['互动率', '评论', '诱饵', '失败修复'],
      signals: { score: 7.9, usageCount: 84, successRate: 0.55, freshnessScore: 7.3 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['结尾"谢谢观看"无钩', '只让"点赞关注"，无话题', '问题太大没人愿答'],
      repairSuggestions: ['抛一个易回答的封闭式问题', '埋一个温和争议点引讨论', '让用户二选一或报数'],
      mechanism: '互动率是推荐核心信号；低门槛提问/争议降低评论成本，撬动评论与二次分发。',
      promptTemplate: '为这条{主题}设计一个评论诱饵结尾：一个低门槛、易回答或带温和争议的互动钩。',
      negativePrompt: '结尾不要只"谢谢观看"；不要空喊点赞关注；不要抛太大的开放问题。'
    },
    {
      id: 'atom_rs_005',
      title: '同质化 · 跟风模板',
      library: '失败修复', libKey: 'rescue', atomType: '失败模式',
      summary: '套用当下烂大街的模板/BGM/句式，内容没有差异化记忆点，淹没在同类里。',
      template: '症状：用了{烂大街元素}，和一堆同行长一样 → 无记忆点，难破圈。',
      variables: [
        { name: '烂大街元素', example: '同款卡点BGM+同款开场句' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['同质化', '差异化', '记忆点', '失败修复'],
      signals: { score: 8.0, usageCount: 90, successRate: 0.56, freshnessScore: 8.3 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['哪个火抄哪个，慢半拍', '只抄形式不抄内核', '无个人/品牌识别符号'],
      repairSuggestions: ['抄结构不抄表皮，注入自有观点', '找一个差异化记忆符号（口头禅/视觉符）', '蹭热点要加自己的角度'],
      mechanism: '过度同质触发"看过了"的适应性忽视；差异化记忆点才能在信息流里形成可识别标记。',
      promptTemplate: '诊断这条跟风{主题}并差异化：保留有效结构，注入一个独特观点或记忆符号。',
      negativePrompt: '不要照抄爆款表皮；不要无自有观点；不要缺少识别符号。'
    },
    {
      id: 'atom_rs_006',
      title: '限流 · 违规/搬运嫌疑',
      library: '失败修复', libKey: 'rescue', atomType: '失败模式',
      summary: '文案含违禁词、或画面有搬运/水印/二创不足，触发平台限流甚至不推荐。',
      template: '症状：{违规点} → 播放异常低，疑似限流。',
      variables: [
        { name: '违规点', example: '文案含绝对化词 / 画面带其他平台水印' }
      ],
      domains: ['电商带货', '知识科普', '通用'],
      tags: ['限流', '合规', '违禁词', '搬运', '失败修复'],
      signals: { score: 8.3, usageCount: 100, successRate: 0.6, freshnessScore: 8.0 },
      source: { type: 'team_preset', platform: '', url: '', collectedAt: TODAY },
      failurePatterns: ['用"最/第一/国家级"等违禁词', '搬运他人素材不做二创', '画面残留其他平台水印/logo'],
      repairSuggestions: ['过一遍违禁词，替换绝对化表达', '素材做实质二创，加原创解说/重剪', '清掉水印，用自有或授权素材'],
      mechanism: '平台用合规与原创度作为分发门槛，违禁词/搬运触发降权，绕过钩子也拿不到流量。',
      promptTemplate: '对这条{主题}做合规体检：列出违禁词与搬运风险点，给出替换与二创方案。',
      negativePrompt: '不要使用绝对化/违禁词；不要直接搬运未二创；不要残留他平台水印。'
    }
  ];

  // 7 库合并：卖点提炼6 + 钩子开头6 + 分镜节奏5 + 风格锁定5 + 平台调性4 + 爆款案例4 + 失败修复6 = 36
  return [].concat(sellingPoint, hook, storyboard, style, platform, caseLib, rescue);
})();
if (typeof window !== 'undefined') window.ATOMS_SEED = ATOMS_SEED;

// 数据就绪后立即同步注入：确保同页后续的同步渲染（如首页网格 home.js 的 renderAtomLibs()）
// 能读到种子。与 data-layer 的 DOMContentLoaded 钩子互为冗余，kw_atoms_seeded flag 保证只注入一次。
// 前提：本文件需在消费方（home.js / atoms.html 内联）之前、data-layer.js 之后引入。
if (typeof window !== 'undefined' && window.KW_DL && KW_DL.seedAtomsIfEmpty) KW_DL.seedAtomsIfEmpty();
