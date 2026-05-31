/* 开物 · 工单结果模板生成器
 * 根据用户回答匹配电商方向的导演级 10 模块工单。
 * 每个模块的 blocks 标注 levels: ['basic'|'standard'|'master']
 * - 基础版：仅渲染 inBasic=true 的模块；模块内只渲染 levels 包含 'basic' 的块
 * - 标准版：渲染所有 10 模块；模块内渲染 'basic' 或 'standard' 块
 * - 大师版：渲染所有模块 + 全部块（含 'master' 专属导演级细节）
 */

const RESULT_TEMPLATES = (function () {
  'use strict';

  // ===== 字典：把 value 映射成人话 =====
  const DICT = {
    audience: {
      mom:     { age: 31, gender: '女性', desc: '宝妈/家庭主理人',
                 look: '齐肩低马尾，自然黑发，明亮但带一点点疲惫的眼睛，瓜子脸，自然光下偏暖的肤色',
                 wear: '米白棉麻或针织上衣 · 卡其色直筒裤 · 银色简约耳钉 · 哑光质感',
                 vibe: '温柔克制 · 眼神温和 · 习惯性把碎发别到耳后' },
      student: { age: 20, gender: '女性', desc: '学生党',
                 look: '中长直发，深棕，清亮大眼，圆脸偏婴儿肥，自然偏白肤色',
                 wear: '牛仔外套 + 白 T · 牛仔短裙 · 帆布鞋 · 双肩帆布包',
                 vibe: '略带紧张但好奇 · 嘴角容易微微上扬 · 眨眼频率偏高' },
      worker:  { age: 26, gender: '女性', desc: '上班族',
                 look: '齐肩黑色短发微卷，自然黑发，明亮但带倦意的双眼，瓜子脸，自然光下偏冷的肤色',
                 wear: '米白色高领针织 · 卡其色风衣 · 银色金属耳钉 · 棕色腕表 · 哑光质感',
                 vibe: '克制温柔 · 眼神里有一点点疲惫 · 偶尔下意识抿嘴' },
      couple:  { age: 27, gender: '女性', desc: '情侣 / 恋人',
                 look: '长发卷成柔波，深棕色，温暖大眼，柔和五官，自然偏暖肤色',
                 wear: '浅米色毛衣 · 长裙 · 轻饰品 · 棕色腕表',
                 vibe: '温柔可亲 · 眼里有光 · 笑时嘴角上扬不夸张' },
      starter: { age: 30, gender: '男性', desc: '创业者',
                 look: '短发整洁，自然黑，目光坚定，棱角分明的轮廓，自然肤色',
                 wear: '灰色衬衫 · 深色西装外套（无领带）· 简约金属腕表 · 棕色皮鞋',
                 vibe: '沉稳务实 · 话不多眼神准 · 习惯性握拳放在桌面' },
      senior:  { age: 55, gender: '女性', desc: '中老年',
                 look: '半长发自然卷，银丝点缀，温润眼神，自然轻微皱纹，自然温暖肤色',
                 wear: '暖灰针织 · 真丝围巾 · 淡金耳环 · 软底舒适皮鞋',
                 vibe: '优雅从容 · 眼神有阅历感 · 微笑时眼角自然弯' }
    },
    selling_point: {
      price:   { axis: '价格', insight: '我们什么都想买，却没谁问过我们真正需要什么',
                 thesis: '省下的不是钱，是把钱花到下一件值得的事情上的底气',
                 tagline: '不是省下来，是腾出来。' },
      beauty:  { axis: '颜值', insight: '我们不是没有审美，是没有"被认真对待"的耐心',
                 thesis: '在通勤的疲惫里，有一件东西能让你"被看到"',
                 tagline: '工作之外，我也想是个值得被精心打扮的人。' },
      durable: { axis: '耐用', insight: '我们被"买完就过时"的节奏裹挟，但好东西的标准没变过',
                 thesis: '买一件就用十年，是对自己最朴素的体面',
                 tagline: '不是不爱新，是不想再被消耗一次。' },
      gift:    { axis: '送礼', insight: '送礼这件事，我们都怕"用力过猛"，又怕"不够当真"',
                 thesis: '把心意装进恰到好处的体面里',
                 tagline: '不夸张，也不敷衍。' },
      quality: { axis: '品质', insight: '我们见过太多"看起来很好"的东西，只有用过才知道真假',
                 thesis: '好东西自己会说话，但你得先把它讲对',
                 tagline: '能讲出细节的，才是真的好。' },
      pain:    { axis: '痛点', insight: '那些我们以为"忍一忍就过去"的小麻烦，其实早该被认真对待',
                 thesis: '一个小小的设计改变，可能就是你一整天的清静',
                 tagline: '少一点琢磨，多一点清静。' }
    },
    platform: {
      douyin:   { name: '抖音',   desc: '强钩子前 3 秒 + 标签流量',  postTime: '工作日 7:30-8:30 / 19:00-21:00' },
      xhs:      { name: '小红书', desc: '生活感正文 + 关键词搜索',   postTime: '工作日 12:00-14:00 / 21:00-23:00' },
      wechat:   { name: '视频号', desc: '社交分发 + 朋友点赞推送',   postTime: '工作日 19:00-22:00' },
      kuaishou: { name: '快手',   desc: '人格化 + 老铁文化 + 直评',   postTime: '工作日 11:00-13:00 / 20:00-22:00' },
      multi:    { name: '多平台', desc: '一稿四发，需差异化标题与正文', postTime: '按各平台高峰时间分发' }
    },
    style: {
      plant:   { name: '种草分享', tone: '冷静沉缓，末尾轻微下沉' },
      review:  { name: '测评对比', tone: '客观清晰，重音落在关键词' },
      oral:    { name: '直接口播', tone: '亲切平视，第一人称' },
      drama:   { name: '剧情反转', tone: '前段平淡后段提速' },
      scene:   { name: '场景展示', tone: '画外音冷静，画内情绪丰满' },
      premium: { name: '高级感',   tone: '极简慢板，留白多' }
    }
  };

  // ===== 入口：构建上下文 =====
  function buildContext(inputs, resolved) {
    const a = inputs || {};
    const r = resolved || {};

    // 兼容多选（数组）和单选（字符串）
    const arr = v => Array.isArray(v) ? v : (v != null ? [v] : []);
    const first = v => arr(v)[0];

    const productName = (a.product_name || '').trim() || '我的产品';
    const audKey   = first(a.audience)      || 'worker';
    const sellKey  = first(a.selling_point) || 'beauty';
    const sellKeys = arr(a.selling_point);     // 多卖点
    const audKeys  = arr(a.audience);          // 多人群
    const platKey  = first(a.platform)      || 'douyin';
    const platKeys = arr(a.platform);          // 多平台
    const styleKey = a.style    || 'plant';
    const budgetKey= a.budget   || 'paid_tool';
    const durKey   = a.duration || '30s';
    const durSec   = parseInt(durKey, 10) || 30;
    const shotCount = durSec <= 15 ? 4 : durSec <= 30 ? 6 : durSec <= 60 ? 8 : 10;

    return {
      productName,
      productType: a.product_type || 'other',
      sellKey, sellKeys, audKey, audKeys, platKey, platKeys, styleKey, budgetKey,
      durKey, durSec, shotCount,
      AUD:   DICT.audience[audKey]      || DICT.audience.worker,
      SELL:  DICT.selling_point[sellKey] || DICT.selling_point.beauty,
      STYLE: DICT.style[styleKey]        || DICT.style.plant,
      PLAT:  DICT.platform[platKey]      || DICT.platform.douyin,
      specialNeeds: a.specialNeeds || a.special || '',  // 第 9 题（特殊需求）
      special:      a.specialNeeds || a.special || '',  // 向后兼容
      // 派生的英文 hint
      hookHint: a.product_name || a.product_type || 'product',
      extraSellings: sellKeys.slice(1).map(k => DICT.selling_point[k]).filter(Boolean)
    };
  }

  // ===== 工具 =====
  function pad(n) { return String(n).padStart(2, '0'); }
  function timeRange(start, dur) {
    const s = start, e = start + dur;
    return `${pad(Math.floor(s/60))}:${pad(s%60)} - ${pad(Math.floor(e/60))}:${pad(e%60)}`;
  }
  function distributeDurations(totalSec, count) {
    // 节奏：前 1/3 慢，中段中，结尾慢一拍。和约束 totalSec。
    if (count === 4) return [3, 4, 4, totalSec - 11];
    if (count === 6) return [3, 5, 6, 6, 6, totalSec - 26].map(x => Math.max(2, x));
    if (count === 8) return [4, 6, 8, 8, 9, 8, 8, totalSec - 51].map(x => Math.max(3, x));
    // 10
    const base = Math.floor(totalSec / count);
    const arr = Array(count).fill(base);
    arr[arr.length - 1] = totalSec - base * (count - 1);
    return arr;
  }

  function matchedTemplateId(ctx) {
    return ['ec', ctx.productType, ctx.audKey, ctx.budgetKey, ctx.styleKey, ctx.durKey].join('_');
  }

  function generateTitle(ctx) {
    return `${ctx.productName} · ${ctx.durKey} ${ctx.STYLE.name}工单`;
  }

  // ============================================================
  // 模块 01 · 母题与核心表达
  // ============================================================
  function m01(ctx) {
    const S = ctx.SELL, A = ctx.AUD;
    const dilemma = S.insight;
    const thesis  = S.thesis + '——这就是「' + ctx.productName + '」对' + A.desc + '的真实意义。';
    const tagline = S.tagline;

    const blocks = [
      { type: 'long', label: 'PROPOSITION · 核心论点',
        text: thesis,
        levels: ['basic','standard','master'] },
      { type: 'long', label: 'INSIGHT · 现代人困境',
        text: dilemma,
        levels: ['basic','standard','master'] },
      { type: 'long', label: 'TAGLINE · 金句（可上字幕）',
        text: tagline, emphasis: true,
        levels: ['basic','standard','master'] }
    ];

    // 大师版：叙事母题原型 & 情绪锚点
    blocks.push({
      type: 'kv',
      items: [
        { k: '情绪锚点', v: ctx.STYLE.name === '剧情反转' ? '前段克制 → 末段释怀' : '低饱和疲惫 → 一束微光' },
        { k: '叙事母题原型', v: ctx.styleKey === 'drama' ? '英雄旅程：召唤 → 拒绝 → 接受' : '日常切片：困境 → 一次让步 → 自我和解' },
        { k: '受众心理映射', v: `「${A.desc}」在「${S.axis}」上长期积压的小疲惫，被一件事温柔击穿` }
      ],
      levels: ['master']
    });

    return {
      num: '01', icon: '🎯', title: '母题与核心表达', sub: 'CORE THEME',
      inBasic: true, blocks
    };
  }

  // ============================================================
  // 模块 02 · 人物锁定
  // ============================================================
  function m02(ctx) {
    const A = ctx.AUD;
    const blocks = [
      {
        type: 'kv',
        items: [
          { k: '基础信息', v: `${A.age} 岁${A.gender} · 1.66m · 标准身材 · 中国都市${A.desc}` },
          { k: '外貌锁定', v: A.look },
          { k: '服装锁定', v: A.wear },
          { k: '气质锁定', v: A.vibe }
        ],
        levels: ['basic','standard','master']
      },
      {
        type: 'note', icon: '⚠️',
        text: '每个镜头的提示词都要把上面四项完整拼上，否则即梦 / 可灵会"换脸"。把这一段当成所有提示词的"前缀模板"。',
        levels: ['basic','standard','master']
      }
    ];

    // 大师版：即梦/可灵 prompt-ready 整段英文
    blocks.push({
      type: 'prompts',
      prompts: [{
        label: 'PROMPT READY · 一键可拷',
        body: `a ${A.age}-year-old Chinese ${A.gender === '女性' ? 'woman' : 'man'}, ${A.look.replace(/，/g, ', ').replace(/、/g, ', ')}, wearing ${A.wear.replace(/·/g, ',').replace(/、/g, ', ')}, ${A.vibe.replace(/·/g, ', ')}, consistent character across all shots, same face same outfit same vibe`
      }],
      levels: ['master']
    });

    blocks.push({
      type: 'kv',
      items: [
        { k: '不要让她变', v: '同一身材线 · 同一发型轮廓 · 同一耳饰' },
        { k: '可微调的', v: '表情幅度 · 头部角度 · 手部动作' },
        { k: '换镜头时务必', v: '提示词前缀完全一致 · seed 锁定 · 重绘强度 ≤ 0.65' }
      ],
      levels: ['master']
    });

    return {
      num: '02', icon: '🧑', title: '人物锁定', sub: 'CHARACTER LOCK',
      inBasic: true, blocks
    };
  }

  // ============================================================
  // 模块 03 · 镜头时间轴
  // ============================================================
  function m03(ctx) {
    const durs = distributeDurations(ctx.durSec, ctx.shotCount);
    let acc = 0;

    // 6 镜默认模板（电商带货 · 通勤场景 · 上班族 · 种草分享）
    // 其他 shotCount 时按比例复用/裁剪
    const PROFILE = [
      {
        kind: 'hook',
        move: '中景推近',
        enter: '左侧入画',
        exit:  '右侧出画',
        perf:  `站在地铁出口栏杆边，右手悬停在手机屏幕上方，下巴微震 0.5 秒，目光从屏幕缓慢抬起，在镜头外停顿 1.5 秒后眨眼一次`,
        masterEnter: '脚步要先于身体进入画面，节拍 1-2-停；身体微侧 15°，肩膀不冲镜头',
        masterExit:  '不要直线退出，要先转 30°，再侧身让出空间给下一镜',
        masterBeat:  '节拍：拿手机(1) - 抬眼(2) - 停顿(3) - 眨眼(4)'
      },
      {
        kind: 'detail',
        move: '特写 跟手',
        enter: '自下入画',
        exit:  '上方出画',
        perf:  `手指从${ctx.productName.slice(0,4)}的一处材质滑到金属配件，节拍 1-1-2，最后一拍翻面，露出内侧细节 0.5 秒`,
        masterEnter: '手指从画框外 1/3 处缓慢滑入，不要"啪"地一下闯入',
        masterExit:  '手指带产品离开时镜头不动，让出框线引出下一镜',
        masterBeat:  '节拍：触摸(1) - 滑动(1) - 翻面停顿(2)'
      },
      {
        kind: 'travel',
        move: '中景 跟随步速',
        enter: '接续镜头 02',
        exit:  '右侧出画',
        perf:  `主角侧身穿过人潮，肩膀让一次（不停步），目光保持向前不与任何人对视，产品在右臂自然摆动`,
        masterEnter: '上镜头结束的一拍就开始走，连贯不中断',
        masterExit:  '走出画框前留 0.3 秒空镜，给下一镜呼吸',
        masterBeat:  '节拍：起步(1) - 让人(2) - 出画(2)'
      },
      {
        kind: 'pause',
        move: '中近景 静止固定',
        enter: '已入定（locked-off）',
        exit:  '镜头不动',
        perf:  `在咖啡店门口推门，手停在门把上 0.5 秒，再轻推开（不发力），${ctx.productName.slice(0,4)}贴在身侧`,
        masterEnter: '镜头先于人物到位，等待主角入位',
        masterExit:  '门关上 0.3 秒后再切下一镜',
        masterBeat:  '节拍：到位(1) - 触门(0.5) - 停顿(0.5) - 推开(1)'
      },
      {
        kind: 'closeup-still',
        move: '特写 桌面',
        enter: '自侧入画',
        exit:  '静止',
        perf:  `产品被随意放在桌沿，主角的手从背景中抽走，手机被放下，画面只剩产品 + 一杯咖啡 + 远处光斑`,
        masterEnter: '产品入画时机要快(0.3s)，但停下后画面要静',
        masterExit:  '保持构图直到下一镜开始',
        masterBeat:  '节拍：放置(0.3) - 手撤走(1) - 静止(剩余)'
      },
      {
        kind: 'tagline',
        move: '中景静态 平视',
        enter: '已入定',
        exit:  '静止淡出',
        perf:  `抬眼看向窗外，嘴角微微上扬 0.3 秒后保持，停留 2.5 秒后金句叠上字幕`,
        masterEnter: '保持构图，光线从画外缓慢压暗 5%',
        masterExit:  '最后一帧定格 0.5 秒再切黑',
        masterBeat:  '节拍：抬眼(1) - 微笑(0.3) - 保持(剩余)'
      }
    ];

    const shots = [];
    for (let i = 0; i < ctx.shotCount; i++) {
      const prof = PROFILE[Math.min(i, PROFILE.length - 1)];
      const d = durs[i];
      const tr = timeRange(acc, d);
      acc += d;
      shots.push({
        num: pad(i + 1),
        durLabel: tr,
        durSec: d,
        move: prof.move,
        enter: prof.enter,
        exit:  prof.exit,
        perf:  prof.perf,
        // master only
        masterEnter: prof.masterEnter,
        masterExit:  prof.masterExit,
        masterBeat:  prof.masterBeat,
        _profile: prof.kind
      });
    }

    return {
      num: '03', icon: '🎬', title: '镜头时间轴', sub: 'SHOT TIMELINE',
      inBasic: true,
      blocks: [
        { type: 'shots', shots, levels: ['basic','standard','master'] }
      ]
    };
  }

  // ============================================================
  // 模块 04 · 场景与光影
  // ============================================================
  function m04(ctx) {
    const SCENES = [
      { env: '地铁出口栏杆边 · 黄昏 17:30 · 都市背景虚化',
        light: '主光左侧 4200K 暖橙 + 顶部背光 6500K 冷蓝',
        tone: '冷蓝偏调 · 饱和度 0.35 · 高对比 0.7',
        film: '16mm 胶片颗粒 · 轻微暗角' },
      { env: '同地铁出口 · 同时段 · 产品近距背景',
        light: '产品面采用环境反射 + 顶部柔光板补 5500K',
        tone: '暖肤色 vs 冷蓝背景 · 饱和度 0.4',
        film: '柔焦边缘 · 高频颗粒' },
      { env: '地铁出口至街道 · 黄昏 17:35 · 人群虚化',
        light: '主光来自上方街灯 5500K · 侧逆光勾边',
        tone: '中性偏冷 · 饱和度 0.4 · 中对比',
        film: '颗粒柔化 · 街景反差略压' },
      { env: '咖啡店门口 · 黄昏转夜 19:00',
        light: '主光来自店内暖灯 3200K · 背光街景冷蓝',
        tone: '暖橙调 · 饱和度 0.55 · 暖肤色',
        film: '16mm 胶片颗粒 · 玻璃反光保留' },
      { env: '咖啡店内桌面 · 夜 19:10 · 自然窗光',
        light: '主光从右后入侧打 + 桌面反射补光',
        tone: '高对比 0.65 · 饱和度 0.5',
        film: '弱颗粒 · 焦外柔化光斑' },
      { env: '同咖啡店内 · 夜 19:12 · 落地窗背景',
        light: '主光自外窗 5500K · 室内点光源 2700K 反差',
        tone: '中性低饱和 0.4 · 中对比',
        film: '弱颗粒 · 阴影低噪点' }
    ];

    const items = [];
    for (let i = 0; i < ctx.shotCount; i++) {
      const sc = SCENES[Math.min(i, SCENES.length - 1)];
      items.push({
        shot: pad(i + 1),
        env: sc.env, light: sc.light, tone: sc.tone, film: sc.film
      });
    }

    return {
      num: '04', icon: '🌅', title: '场景与光影调性', sub: 'SCENE & LIGHTING',
      inBasic: false,
      blocks: [
        {
          type: 'scenes', items,
          levels: ['standard','master']
        },
        {
          type: 'kv',
          items: [
            { k: '反差比', v: '主光：补光 = 4:1 · 阴影保留细节但不死黑' },
            { k: '色彩工程', v: 'LUT 推荐：FilmConvert Nitrate Kodak 2383 · 强度 60%' },
            { k: '后期建议', v: '高光降饱和 -15 · 阴影加冷蓝 +5 · 整体绿色通道 -3' }
          ],
          levels: ['master']
        }
      ]
    };
  }

  // ============================================================
  // 模块 05 · AI 出图提示词
  // ============================================================
  function m05(ctx) {
    const A = ctx.AUD, S = ctx.SELL;
    const charLock =
      `${A.age}-year-old Chinese ${A.gender === '女性' ? 'woman' : 'man'}, ` +
      `${A.look.replace(/，/g, ', ').replace(/、/g, ', ')}, ` +
      `wearing ${A.wear.replace(/·/g, ',').replace(/、/g, ', ')}, ${A.vibe.replace(/·/g, ', ')}`;

    const SCENES = [
      { sceneEn: 'standing by the railing at subway exit, dusk 5:30pm, blurred city background, modern urban',
        actionEn: 'gaze slowly lifting from phone, chin trembles slightly, eyes stop off-camera',
        lightEn: 'main light from left 4200K warm orange, background cool blue 6500K, low saturation 0.35, high contrast',
        lensEn: 'medium shot push-in, 50mm, shallow DOF f/1.8, entering from left' },
      { sceneEn: 'close-up of hands holding the product, same subway exit background, soft focus',
        actionEn: 'fingers slide from fabric to metal accent, rhythm 1-1-2, last beat flips the product',
        lightEn: 'reflective top light, warm skin tone against cool background, saturation 0.4',
        lensEn: 'macro close-up, 85mm, very shallow DOF f/2.0, enters from below' },
      { sceneEn: 'walking through subway crowd, dusk, blurred passersby, urban street',
        actionEn: 'sidesteps once without stopping, eyes forward, product swings naturally',
        lightEn: 'top street light 5500K, side rim light, neutral cool tone, saturation 0.4',
        lensEn: 'medium tracking shot, 35mm, hand-held feel, continues from previous frame, exits right' },
      { sceneEn: 'in front of a cafe entrance, dusk to night 7pm, warm interior light through glass',
        actionEn: 'hand on the door handle paused 0.5s, gently pushes open, product against side',
        lightEn: 'warm interior light 3200K main, cool street light backlit, saturation 0.55',
        lensEn: 'medium close-up locked-off, 50mm, f/2.5, no camera movement' },
      { sceneEn: 'product placed on cafe table edge, night, natural window light, blurred bokeh background',
        actionEn: 'product gently lands, hand withdraws from frame, phone placed down',
        lightEn: 'right-back natural light, table reflection fills, high contrast 0.65',
        lensEn: 'tabletop close-up, 85mm, f/2.0, slow side-entry' },
      { sceneEn: 'medium shot at cafe with floor-to-ceiling window, night, gentle moody atmosphere',
        actionEn: 'looks up at the window, slight smile holds for 2.5s, then tagline overlay',
        lightEn: 'outside window 5500K key, interior 2700K accent, neutral low sat 0.4',
        lensEn: 'medium static shot eye-level, 50mm, f/2.8, locked-off' }
    ];

    const promptsForShot = (i) => {
      const sc = SCENES[Math.min(i, SCENES.length - 1)];
      return [
        '【风格】 cinematic film aesthetic, minimalist commute mood, 16mm film grain, soft warm-cool palette',
        '【人物锁定】 ' + charLock + ', consistent character across all shots',
        '【场景】 ' + sc.sceneEn,
        '【动作】 ' + sc.actionEn,
        '【光影】 ' + sc.lightEn,
        '【镜头语言】 ' + sc.lensEn
      ].join('\n');
    };

    const promptCards = [];
    for (let i = 0; i < ctx.shotCount; i++) {
      promptCards.push({
        label: '镜头 ' + pad(i + 1),
        body: promptsForShot(i)
      });
    }

    return {
      num: '05', icon: '✨', title: 'AI 出图提示词', sub: 'AI IMAGE PROMPTS',
      inBasic: true,
      blocks: [
        {
          type: 'note', icon: '💡',
          text: '通用格式：[风格] + [人物锁定] + [场景] + [动作] + [光影] + [镜头语言]。每镜独立一段，已为即梦/可灵调优。',
          levels: ['basic','standard','master']
        },
        {
          type: 'prompts', prompts: promptCards,
          levels: ['basic','standard','master']
        },
        {
          type: 'kv',
          items: [
            { k: '负面提示词', v: 'blurry, low quality, distorted face, twisted hands, watermark, ugly, deformed, plastic skin, AI artifacts, overexposed, text, logo' },
            { k: 'Seed', v: '81923（本组镜头统一，保证人物一致性）' },
            { k: 'Sampler', v: 'DPM++ 2M Karras · Steps 30 · CFG 7.5' },
            { k: '尺寸', v: '9:16 (1024 × 1820) · 抖音 / 小红书竖版' },
            { k: '重绘强度', v: '0.62 - 0.68（>0.7 会换脸）' }
          ],
          levels: ['standard','master']
        },
        {
          type: 'list',
          heading: '兜底提示词（哪里坏了加哪里）',
          items: [
            '人脸畸变 → 追加 "detailed face, sharp eyes, natural skin texture, intricate"',
            '手指畸变 → 追加 "detailed hands, five clearly defined fingers"',
            '服装错乱 → 追加 "consistent outfit, structured, well-tailored, fabric details"',
            '场景模糊 → 追加 "detailed background, photographic, sharp focus"',
            '画质塑料感 → 追加 "natural skin pores, soft cinematic film, organic textures"'
          ],
          levels: ['standard','master']
        },
        {
          type: 'kv',
          items: [
            { k: '即梦优先', v: '写实质感更稳，建议风格选 "电影感"，参数推荐：参考强度 0.6 / 创意度 0.5' },
            { k: '可灵优先', v: '动态镜头更稳，建议先用即梦出关键帧再喂入可灵 image-to-video' },
            { k: '修脸子流程', v: '先全身 0.65 → 圈选脸部 inpaint 0.45 → 第二轮 0.3 微调' }
          ],
          levels: ['master']
        }
      ]
    };
  }

  // ============================================================
  // 模块 06 · 运镜参数（平台中性；具体平台设置作为行内适配信息）
  // ============================================================
  function m06(ctx) {
    const KLING = [
      { amp:'中', text:'缓慢推近，从中景到中近景，1.2x 焦距变化', dur:'3s', boost:'动态增强 开 / 风格保真 高' },
      { amp:'低', text:'保持手部居中，焦点跟随，0.95x 微变',     dur:'5s', boost:'稳定增强 开 / 微距细节 高' },
      { amp:'高', text:'横向跟随，2x 空间移动，0.5x 焦距压缩',     dur:'6s', boost:'主体增强 开 / 运动模糊 中' },
      { amp:'低', text:'固定锁定，不动',                          dur:'6s', boost:'稳定增强 高 / 风格保真 高' },
      { amp:'中', text:'缓慢上抬，从桌面到主角脸部预备，0.5x 变化', dur:'6s', boost:'稳定增强 高 / 主体增强 开' },
      { amp:'低', text:'完全静止，光线微微变化',                  dur:'4s', boost:'风格保真 高' }
    ];
    const items = [];
    for (let i = 0; i < ctx.shotCount; i++) {
      const k = KLING[Math.min(i, KLING.length - 1)];
      items.push({ shot: pad(i + 1), ...k });
    }

    return {
      num: '06', icon: '🎥', title: '运镜参数', sub: 'CAMERA MOTION',
      inBasic: false,
      blocks: [
        { type: 'kling', items, levels: ['standard','master'] },
        {
          type: 'list',
          heading: '大师版避坑',
          items: [
            '关键帧锁定：第 1 帧 + 最后 1 帧都喂入即梦同 seed 出图',
            '运动幅度高的镜头：先在即梦出 3 帧（开始/中段/结束），再可灵串',
            '人物连续镜头：从镜头 X 末帧裁出做镜头 X+1 起始帧，可显著减少跳变',
            '动态模糊会破坏字幕：字幕镜头一律选"低幅度 / 固定锁定"'
          ],
          levels: ['master']
        }
      ]
    };
  }

  // ============================================================
  // 模块 07 · 旁白与对白
  // ============================================================
  function m07(ctx) {
    const S = ctx.SELL, P = ctx.productName;
    // 不同时长的旁白长度
    const lines30 = `上下班路上的${P}，不能太花，但也不能太普通。我挑了三个月，最后选了它。 [停 1s]
不是因为它最贵，是因为它装下了我所有的东西，还让我看起来——还像那个我。`;
    const lines60 = `${lines30}\n\n[停 1.5s]\n你有没有过这种时刻：站在镜子前，觉得包配不上自己，又觉得自己配不上更好的包。 [停 1s]\n这只${P}解了我的纠结——它不是最贵的，但是它让我每次出门，都觉得自己被认真对待了。`;
    const lines15 = `${P}选了三个月，留下这一只。 [停 0.5s] 装得下，撑得住，还像我自己。`;

    const lines = ctx.durSec <= 15 ? lines15 : ctx.durSec >= 60 ? lines60 : lines30;

    const blocks = [
      {
        type: 'long', label: '旁白原文 · 含停顿标记',
        text: lines, mono: true,
        levels: ['basic','standard','master']
      },
      {
        type: 'kv',
        items: [
          { k: '语气', v: ctx.STYLE.tone + '；末尾"还像那个我"前 0.5s 静音，金句结束后画面静止 1s 再上字幕' },
          { k: '推荐配音（剪映 AI）', v: '小雨（温柔女声·推荐）/ 佳州（中性沉稳·备选）/ 小安（年轻女声·适合学生党人设）' },
          { k: '语速', v: '0.95x（比默认稍慢，保留呼吸感）' }
        ],
        levels: ['basic','standard','master']
      }
    ];

    blocks.push({
      type: 'list',
      heading: '断句呼吸标记（^ 重音 · | 换气 · _ 弱化）',
      items: [
        '上下班路上的 ' + P + ' | ，不能太^花 | ，但也不能太^普通。',
        '我^挑了 | 三个月 | ，最后选了它。 [停 1s]',
        '不是因为它最_贵 | ，是因为它^装下了我所有的东西 | ，还让我^看起来 | —— 还像那个^我。'
      ],
      levels: ['master']
    });

    blocks.push({
      type: 'kv',
      items: [
        { k: '金句处特殊处理', v: '"还像那个我"前 0.5s 完全静音 → 金句出 → 留 1s 静止画面 → 才上字幕 → 字幕悬停 4s' },
        { k: '是否重复', v: '抖音版可在 0:30 末尾静音重复一次（嘴型不动，纯字幕），强化记忆点' }
      ],
      levels: ['master']
    });

    return {
      num: '07', icon: '🎙️', title: '旁白与对白', sub: 'VOICEOVER',
      inBasic: true, blocks
    };
  }

  // ============================================================
  // 模块 08 · BGM 与音效节点
  // ============================================================
  function m08(ctx) {
    return {
      num: '08', icon: '🎵', title: 'BGM 与音效节点', sub: 'BGM & SFX',
      inBasic: false,
      blocks: [
        {
          type: 'kv',
          items: [
            { k: 'BGM 类型', v: '极简钢琴 + 弦乐铺底 · BPM 60-70 · 无鼓点 · 4 秒淡入淡出。冷调底色但情绪温柔，类比电影《Lost in Translation》开场配乐' },
            { k: '剪映搜索词', v: '"minimal piano" / "cinematic ambient slow" / "通勤" / "电影感慢板" / "iWasOk - 通勤"' },
            { k: '音量配比', v: 'BGM 25% · 旁白 100% · 环境音 15%（金句处 BGM 降到 18%）' }
          ],
          levels: ['standard','master']
        },
        {
          type: 'list',
          heading: '关键节点音效（按时间轴）',
          items: [
            '0:00 - 0:01  地铁通报声轻渐出（1s 淡出）',
            '0:08 - 0:13  街道脚步声混响淡入，0:13 自然过渡到推门',
            '0:14         推门"咔哒"特写 0.2s + 玻璃震声 0.1s',
            '0:20 - 0:21  产品落桌轻音 0.15s（不要太响）',
            '0:26 - 0:28  金句前 0.5s 完全静音（连环境音都拿掉）',
            '0:30         结尾纸张翻动音 0.4s 作为视觉静止的呼吸结尾'
          ],
          levels: ['standard','master']
        },
        {
          type: 'kv',
          items: [
            { k: 'EQ 推荐', v: '旁白：80Hz 高通 + 200Hz -2dB + 3kHz +1.5dB（增加清晰度）' },
            { k: '混响', v: '旁白：极小厅 6% wet（避免干瘪）；环境音保留原混响' },
            { k: 'BGM 处理', v: '高频 +1dB / 低频 -2dB（避免和旁白低频打架）' },
            { k: '侧链', v: '旁白进时 BGM 自动 ducking -6dB，attack 80ms / release 200ms' }
          ],
          levels: ['master']
        }
      ]
    };
  }

  // ============================================================
  // 模块 09 · 剪辑节奏指引
  // ============================================================
  function m09(ctx) {
    return {
      num: '09', icon: '✂️', title: '剪辑节奏指引', sub: 'EDITING PACE',
      inBasic: false,
      blocks: [
        {
          type: 'kv',
          items: [
            { k: '整体节奏', v: '前 8s 慢（3-5s/镜，让人沉下来）· 中段 8-20s 中速（3-4s/镜）· 结尾 20-30s 极慢（5-6s/镜，留呼吸）' },
            { k: '转场设计', v: '镜头 1→2 溶解 0.5s / 2→3 硬切 / 3→4 左推 0.3s / 4→5 硬切 / 5→6 渐隐到黑 1s' },
            { k: '字幕样式', v: '思源黑体 Bold · 42pt · #FFFFFF · 黑色描边 2px · 居中下方 1/4 · 阴影 (0,2,8) 透明度 50%' }
          ],
          levels: ['standard','master']
        },
        {
          type: 'list',
          heading: '重点镜头提醒',
          items: [
            '镜头 02（手部细节）多停 0.5s — 给观众感受质感的时间',
            '镜头 06（金句）字幕悬停 4s — 留出"再读一遍"的时间',
            '镜头 03（人群跟随）不要快切 — 慢一拍才有"心里有事"的感觉'
          ],
          levels: ['standard','master']
        },
        {
          type: 'kv',
          items: [
            { k: '关键帧动效', v: '字幕入场：从下淡入 + 缓动 0.4s；出场：直接消失（不要做花哨退出）' },
            { k: '稳定后处理', v: '镜头 03 跟随后期加 5% smooth；其余镜头保持原样' },
            { k: '色彩匹配', v: '镜头 1-3 套用同一组 LUT，镜头 4-6 套用第二组（暖度 +5）以体现"进入安全区"的转变' }
          ],
          levels: ['master']
        }
      ]
    };
  }

  // ============================================================
  // 模块 10 · 发布策略
  // ============================================================
  function m10(ctx) {
    const P = ctx.productName, A = ctx.AUD, S = ctx.SELL;

    // 4 个平台版本
    const platforms = {
      douyin: {
        name: '抖音',
        title: `通勤了 5 年，终于挑到一只不让自己"消失"的${P}`,
        desc: `上班路上，我们最容易被淹没。试过 7 个品牌，最后留下这只——装得下也撑得住。`,
        tags: ['#通勤包', '#职场穿搭', '#包包推荐', '#日常', '#小众设计', '#' + P],
        time: '工作日 7:30-8:30（通勤高峰前）或 19:00-21:00'
      },
      xhs: {
        name: '小红书',
        title: `通勤五年，被我留下的${P}🤎 | 通勤包真心话`,
        desc:
`姐妹们我真的想说‼️
上下班路上扛过多少只包了…
这只是我用了 8 个月没换的👇

✅ 装得下：14 寸笔记本+雨伞+水杯
✅ 撑得住：连续 5 个雨天没变形
✅ 配什么都不打架

很多人问我为啥不换——
因为${S.tagline}
你们懂这种感觉吗？`,
        tags: ['#通勤包', '#职场穿搭', '#包包分享', '#自律生活', '#' + P],
        time: '工作日 12:00-14:00 / 21:00-23:00',
        pinned: '颜色 + 价位 + 是否还在售 + 链接（"想要同款，私我`通勤`两个字"）'
      },
      wechat: {
        name: '视频号',
        title: '通勤五年，挑包的逻辑变了',
        desc: '不是更贵的好，是更"在你身边"的好。',
        tags: ['#通勤', '#职场'],
        time: '工作日 19:00-22:00'
      },
      kuaishou: {
        name: '快手',
        title: `上班党看过来，这${P}我装下了一整个班`,
        desc: '老铁们，这只包真的太能装了，给你们看下我每天背啥。',
        tags: ['#通勤', '#职场', '#包包'],
        time: '工作日 11:00-13:00 / 20:00-22:00'
      }
    };

    return {
      num: '10', icon: '📣', title: '发布策略', sub: 'PUBLISH STRATEGY',
      inBasic: true,
      blocks: [
        {
          type: 'platforms',
          platforms,
          levels: ['basic','standard','master']
        },
        {
          type: 'list',
          heading: '评论区互动策略（提高互动 = 提高推流）',
          items: [
            '主动留：第一条评论自己来：「你的通勤包用了多久了？」',
            '拆题：「如果你也通勤，留 1，下一期拍你的通勤穿搭」',
            '钉顶：「想要同款链接的，私我 `' + P + '` 两个字」',
            '回复策略：前 1 小时每条评论都要回，特别是质疑型评论（不要删，认真答）'
          ],
          levels: ['basic','standard','master']
        },
        {
          type: 'kv',
          items: [
            { k: 'AB 测试', v: '同一条视频做两个封面（一张产品特写 / 一张人物正脸），同时各发一遍，4 小时后看数据留'  },
            { k: '冷启动', v: '首发后前 30 分钟自然刷：每 5 分钟看一条评论 + 回复一条；不要主动点赞自己' },
            { k: '复看引导', v: '在 0:14 处加一个"等会看完看 0:26"的悬念字幕，提高完播率' },
            { k: '违规预防', v: '不要出现"最好/第一/绝对"等绝对化用词；不要直接出现价格数字；产品功效不要打包票' }
          ],
          levels: ['master']
        }
      ]
    };
  }

  // ===== 主入口 =====
  function generate(inputs, resolved) {
    const ctx = buildContext(inputs, resolved);
    const modules = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10].map(fn => fn(ctx));
    return {
      title: generateTitle(ctx),
      templateMatched: matchedTemplateId(ctx),
      modules,
      ctx: {
        productName: ctx.productName,
        durKey: ctx.durKey, durSec: ctx.durSec,
        shotCount: ctx.shotCount,
        audDesc: ctx.AUD.desc,
        styleName: ctx.STYLE.name,
        platName: ctx.PLAT.name,
        sellAxis: ctx.SELL.axis,
        specialNeeds: ctx.specialNeeds,
        special:      ctx.specialNeeds   // 向后兼容
      }
    };
  }

  return { generate, buildContext, DICT };
})();

if (typeof window !== 'undefined') window.RESULT_TEMPLATES = RESULT_TEMPLATES;
