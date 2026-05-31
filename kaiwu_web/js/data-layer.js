/* 开物 · 通用数据层 (data-layer.js)
 * 所有数据操作的统一接口，为未来训练领域模型积累结构化数据。
 *
 * 数据结构（详见 _KEYS）：
 *  - kaiwu_orders        工单完整记录（含输入/输出/反馈/匹配模板）
 *  - kaiwu_atoms         方法论原子积累（卖点/钩子/分镜/风格/修复）
 *  - kaiwu_rescue_logs   失败修复使用记录（症状-方案-效果三元组）
 *  - kaiwu_decode_records 爆款解析记录（输入+提取元素+用户动作）
 *  - kaiwu_events        通用事件埋点（用于行为分析）
 *  - kaiwu_meta          匿名设备 ID、累计学习计数等元信息
 *
 * 上层模块都通过 KW_DL.* 操作，禁止直接动 localStorage。
 */

const KW_DL = (function () {
  'use strict';

  const _KEYS = {
    ORDERS:         'kaiwu_orders',
    ATOMS:          'kaiwu_atoms',
    RESCUE_LOGS:    'kaiwu_rescue_logs',
    DECODE_RECORDS: 'kaiwu_decode_records',
    EVENTS:         'kaiwu_events',
    META:           'kaiwu_meta',
    DRAFT:          'kaiwu_draft_state',    // { dir, index, answers, status, updatedAt }
    CASES:          'kaiwu_cases',          // 案例库（用户提交的"我做出来了"成果）
    CONTRIB:        'kaiwu_contributions',  // 方法论投稿（待审核）
    INBOX:          'kaiwu_inbox',          // 管理员灵感收纳箱
    AUTH:           'kaiwu_auth',           // 登录状态（手机号绑定）
    ATOM_LIB:       'kaiwu_atom_library'    // 策展原子库（AtomCard V2，可浏览/分层；区别于 kaiwu_atoms 工单抽取原子）
  };

  // ===== 内部工具 =====
  function _readList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (e) { return []; }
  }
  function _writeList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); }
    catch (e) { console.warn('[KW_DL] write failed:', key, e); }
  }
  function _readObj(key, def) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def || {})); }
    catch (e) { return def || {}; }
  }
  function _writeObj(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); }
    catch (e) { console.warn('[KW_DL] write failed:', key, e); }
  }
  function _uid(prefix) {
    return (prefix || 'k') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }
  function _now() { return Date.now(); }

  // 匿名设备 ID（首次访问生成）
  function getDeviceId() {
    const meta = _readObj(_KEYS.META, {});
    if (!meta.deviceId) {
      meta.deviceId = _uid('dev');
      meta.firstSeen = _now();
      _writeObj(_KEYS.META, meta);
    }
    return meta.deviceId;
  }

  // 累计学习次数（首页展示用）
  function bumpLearningCounter(delta) {
    const meta = _readObj(_KEYS.META, {});
    meta.learnCount = (meta.learnCount || 0) + (delta || 1);
    meta.lastBumpAt = _now();
    _writeObj(_KEYS.META, meta);
    return meta.learnCount;
  }
  function getLearningCount() {
    return _readObj(_KEYS.META, {}).learnCount || 0;
  }

  // ===== 工单（kaiwu_orders）=====
  /**
   * saveOrder({direction, inputs, output, templateMatched, title})
   * 若 order.id 已存在则覆盖更新，否则新增。返回完整存档对象。
   */
  function saveOrder(order) {
    if (!order || typeof order !== 'object') throw new Error('order required');
    const list = _readList(_KEYS.ORDERS);
    const id = order.id || _uid('ord');
    const existed = list.find(o => o.id === id);
    const full = {
      id,
      createdAt:       order.createdAt || (existed && existed.createdAt) || _now(),
      updatedAt:       _now(),
      direction:       order.direction || (existed && existed.direction) || 'unknown',
      title:           order.title || (existed && existed.title) || '',
      inputs:          order.inputs  || (existed && existed.inputs)  || {},
      inputsResolved:  order.inputsResolved || (existed && existed.inputsResolved) || {},
      output:          order.output  || (existed && existed.output)  || {},
      templateMatched: order.templateMatched || (existed && existed.templateMatched) || null,
      feedback:        Object.assign({
        moduleLikes:  {},    // { '01': 'up' | 'down' }
        moduleIssues: {},    // { '01': ['脚本','分镜'] }
        madeIt:       false,
        resultUrl:    null,
        rating:       null,
        comment:      ''
      }, (existed && existed.feedback) || {}, order.feedback || {}),
      favorite:        order.favorite != null ? order.favorite : (existed && existed.favorite) || false,
      deviceId:        getDeviceId(),
      schemaVersion:   1
    };
    const idx = list.findIndex(o => o.id === id);
    if (idx >= 0) list[idx] = full;
    else list.unshift(full);
    if (list.length > 500) list.length = 500;
    _writeList(_KEYS.ORDERS, list);
    if (idx < 0) {
      bumpLearningCounter();
      logEvent('order.created', { id, direction: full.direction, template: full.templateMatched });
    }
    return full;
  }

  function getOrder(id) {
    return _readList(_KEYS.ORDERS).find(o => o.id === id) || null;
  }

  /**
   * getOrderHistory({direction, favorite, q})
   */
  function getOrderHistory(filters) {
    let list = _readList(_KEYS.ORDERS);
    if (!filters) return list;
    if (filters.direction) list = list.filter(o => o.direction === filters.direction);
    if (filters.favorite)  list = list.filter(o => !!o.favorite);
    if (filters.q) {
      const q = String(filters.q).toLowerCase();
      list = list.filter(o => {
        const text = (o.title + ' ' + JSON.stringify(o.inputs || {})).toLowerCase();
        return text.includes(q);
      });
    }
    return list;
  }

  function updateOrder(id, patch) {
    const list = _readList(_KEYS.ORDERS);
    const idx = list.findIndex(o => o.id === id);
    if (idx < 0) return null;
    list[idx] = Object.assign({}, list[idx], patch, { updatedAt: _now() });
    _writeList(_KEYS.ORDERS, list);
    return list[idx];
  }

  /**
   * updateOrderFeedback(id, partialFeedback)
   * 合并式更新 feedback。例如 { moduleLikes: {'03': 'up'} } 或 { madeIt: true, resultUrl: '...' }
   */
  function updateOrderFeedback(id, partial) {
    const order = getOrder(id);
    if (!order) return null;
    const fb = Object.assign({}, order.feedback || {});
    // moduleLikes / moduleIssues 用浅合并
    if (partial.moduleLikes)  fb.moduleLikes  = Object.assign({}, fb.moduleLikes,  partial.moduleLikes);
    if (partial.moduleIssues) fb.moduleIssues = Object.assign({}, fb.moduleIssues, partial.moduleIssues);
    ['madeIt','resultUrl','rating','comment'].forEach(k => {
      if (partial[k] !== undefined) fb[k] = partial[k];
    });
    fb.lastUpdatedAt = _now();
    logEvent('order.feedback', { id, keys: Object.keys(partial) });
    return updateOrder(id, { feedback: fb });
  }

  function toggleOrderFavorite(id) {
    const o = getOrder(id);
    if (!o) return false;
    const next = !o.favorite;
    updateOrder(id, { favorite: next });
    logEvent('order.favorite', { id, value: next });
    return next;
  }

  function removeOrder(id, meta) {
    const list = _readList(_KEYS.ORDERS).filter(o => o.id !== id);
    _writeList(_KEYS.ORDERS, list);
    // 同时清理这单产出的原子，避免训练数据被污染
    const atoms = _readList(_KEYS.ATOMS).filter(a => a.orderId !== id);
    _writeList(_KEYS.ATOMS, atoms);
    logEvent('order.deleted', Object.assign({ id }, meta || {}));
  }
  // 别名（匹配规范命名）
  const deleteOrder = removeOrder;

  // ===== 原子（kaiwu_atoms）=====
  /**
   * saveAtom({type, content, source, contributor, tags, rating})
   * type: 'selling-point' | 'hook' | 'storyboard' | 'style' | 'rescue'
   * source: 'team' | 'user' | 'creator'
   */
  function saveAtom(atom) {
    if (!atom || !atom.type) throw new Error('atom.type required');
    const list = _readList(_KEYS.ATOMS);
    const id = atom.id || _uid('atom');
    const full = {
      id,
      type:        atom.type,
      content:     atom.content == null ? '' : atom.content,
      source:      atom.source || 'user',          // 'team' | 'user' | 'creator' | 'generated'
      contributor: atom.contributor || getDeviceId(),
      orderId:     atom.orderId || null,           // 关联的工单 ID
      moduleNum:   atom.moduleNum || null,         // 关联的模块编号
      shotNum:     atom.shotNum || null,           // 关联的镜头编号（如适用）
      tags:        atom.tags || [],
      rating:      atom.rating != null ? atom.rating : 0,
      useCount:    atom.useCount != null ? atom.useCount : 0,
      successCount: atom.successCount || 0,
      successRate: atom.successRate != null ? atom.successRate
                    : (atom.useCount > 0 ? (atom.successCount || 0) / atom.useCount : null),
      embedding:   null,  // 未来训练填充
      createdAt:   atom.createdAt || _now()
    };
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) list[idx] = full;
    else list.unshift(full);
    if (list.length > 2000) list.length = 2000;
    _writeList(_KEYS.ATOMS, list);
    // 新原子（非更新）才 +1 学习次数
    if (idx < 0) bumpLearningCounter(1);
    return full;
  }

  function getAtoms(filters) {
    let list = _readList(_KEYS.ATOMS);
    if (!filters) return list;
    if (filters.type)    list = list.filter(a => a.type    === filters.type);
    if (filters.source)  list = list.filter(a => a.source  === filters.source);
    if (filters.orderId) list = list.filter(a => a.orderId === filters.orderId);
    return list;
  }

  function getAtomsByOrder(orderId) {
    return _readList(_KEYS.ATOMS).filter(a => a.orderId === orderId);
  }

  function updateAtom(id, patch) {
    const list = _readList(_KEYS.ATOMS);
    const idx = list.findIndex(a => a.id === id);
    if (idx < 0) return null;
    list[idx] = Object.assign({}, list[idx], patch);
    _writeList(_KEYS.ATOMS, list);
    return list[idx];
  }

  /**
   * bumpAtomUse(id, success)
   * 每次使用累计；若提供 success(boolean)，也维护成功率
   */
  function bumpAtomUse(id, success) {
    const list = _readList(_KEYS.ATOMS);
    const a = list.find(x => x.id === id);
    if (!a) return null;
    a.useCount = (a.useCount || 0) + 1;
    if (typeof success === 'boolean') {
      if (success) a.successCount = (a.successCount || 0) + 1;
      a.successRate = a.useCount > 0 ? a.successCount / a.useCount : null;
    }
    _writeList(_KEYS.ATOMS, list);
    return a;
  }

  /**
   * bumpAtomRating(id, delta) — 用户对该原子相关模块点赞 / 踩
   */
  function bumpAtomRating(id, delta) {
    const list = _readList(_KEYS.ATOMS);
    const a = list.find(x => x.id === id);
    if (!a) return null;
    // 显式区分 undefined / null（默认 +1）和 0（不变）
    const d = (delta === undefined || delta === null) ? 1 : Number(delta);
    a.rating = (a.rating || 0) + d;
    _writeList(_KEYS.ATOMS, list);
    return a;
  }

  /**
   * bumpAtomSuccess(id) — 用户"做出来了"，对应原子的成功次数 +1
   */
  function bumpAtomSuccess(id) {
    const list = _readList(_KEYS.ATOMS);
    const a = list.find(x => x.id === id);
    if (!a) return null;
    a.successCount = (a.successCount || 0) + 1;
    a.successRate = a.useCount > 0 ? a.successCount / a.useCount : 1;
    _writeList(_KEYS.ATOMS, list);
    return a;
  }

  // ===== 失败修复日志（kaiwu_rescue_logs）=====
  /**
   * logRescueUsage(symptomId, scenarioId, outcome, extra)
   * outcome: 'opened' | 'attempted' | 'solved' | 'partial' | 'failed'
   */
  function logRescueUsage(symptomId, scenarioId, outcome, extra) {
    const list = _readList(_KEYS.RESCUE_LOGS);
    const entry = {
      id: _uid('rl'),
      symptomCategory: symptomId,
      scenarioId:      scenarioId || null,
      usedAt:          _now(),
      userOutcome:     outcome || 'opened',
      feedback:        (extra && extra.feedback) || '',
      deviceId:        getDeviceId()
    };
    list.unshift(entry);
    if (list.length > 1000) list.length = 1000;
    _writeList(_KEYS.RESCUE_LOGS, list);
    if (outcome && outcome !== 'opened') bumpLearningCounter();
    logEvent('rescue.' + (outcome || 'opened'), { symptomId, scenarioId });
    return entry;
  }

  function getRescueStats() {
    const list = _readList(_KEYS.RESCUE_LOGS);
    const stats = {
      total: list.length,
      bySymptom: {},
      byOutcome: {},
      solvedRate: 0
    };
    list.forEach(l => {
      stats.bySymptom[l.symptomCategory] = (stats.bySymptom[l.symptomCategory] || 0) + 1;
      stats.byOutcome[l.userOutcome]     = (stats.byOutcome[l.userOutcome]     || 0) + 1;
    });
    const solved   = stats.byOutcome.solved  || 0;
    const partial  = stats.byOutcome.partial || 0;
    const failed   = stats.byOutcome.failed  || 0;
    const judged   = solved + partial + failed;
    stats.solvedRate = judged > 0 ? (solved + 0.5 * partial) / judged : 0;
    return stats;
  }

  // ===== 爆款解析记录（kaiwu_decode_records）=====
  function saveDecodeRecord(rec) {
    const list = _readList(_KEYS.DECODE_RECORDS);
    const full = {
      id:                rec.id || _uid('dec'),
      sourceUrl:         rec.sourceUrl || '',
      sourceType:        rec.sourceType || 'url',   // url | upload | description
      sourceText:        rec.sourceText || '',
      analyzedAt:        _now(),
      extractedElements: rec.extractedElements || {},
      userActions:       rec.userActions || [],
      deviceId:          getDeviceId()
    };
    list.unshift(full);
    if (list.length > 200) list.length = 200;
    _writeList(_KEYS.DECODE_RECORDS, list);
    bumpLearningCounter(2);   // 解析记录 +2（高价值反向数据）
    logEvent('decode.analyzed', { id: full.id, type: full.sourceType });
    return full;
  }

  function getDecodeRecord(id) {
    return _readList(_KEYS.DECODE_RECORDS).find(r => r.id === id) || null;
  }

  // ===== 通用事件埋点（kaiwu_events）=====
  function logEvent(type, payload) {
    if (!type) return;
    const list = _readList(_KEYS.EVENTS);
    list.unshift({
      id: _uid('e'),
      type,
      payload: payload || {},
      at: _now(),
      deviceId: getDeviceId()
    });
    if (list.length > 2000) list.length = 2000;
    _writeList(_KEYS.EVENTS, list);
  }

  // ===== 用户画像（造物者身份）=====
  /**
   * 用户身份是 meta 的子结构，纯本地匿名 — 不收集真实身份信息
   * { nickname, avatar, joinedAt, badges[] (derived), level (derived) }
   */
  function getUserProfile() {
    const meta = _readObj(_KEYS.META, {});
    if (!meta.deviceId) {
      // 触发 getDeviceId() 写入
      getDeviceId();
      return getUserProfile();
    }
    const code = 'kw_' + meta.deviceId.slice(-4).toUpperCase();
    const profile = meta.profile || {};
    return {
      deviceId:    meta.deviceId,
      code:        code,                          // 脱敏短码（造物者 · kw_XXXX）
      nickname:        profile.nickname || null,
      nicknameSuffix:  profile.nickname_suffix || null,
      avatar:      profile.avatar   || pickAvatarFromCode(code),
      joinedAt:    meta.firstSeen   || _now(),
      followedCreators: meta.followedCreators || [],
      level:       computeLevel(),
      badges:      computeBadges()
    };
  }

  function updateUserProfile(patch) {
    const meta = _readObj(_KEYS.META, {});
    meta.profile = Object.assign({}, meta.profile || {}, patch || {});
    meta.profile.updatedAt = _now();
    _writeObj(_KEYS.META, meta);
    logEvent('profile.updated', { keys: Object.keys(patch || {}) });
    return getUserProfile();
  }

  // ===== 会员档位（tier）颜色系统 =====
  const TIER_META = {
    free:    { key: 'free',    name: '免费版',  icon: '🌱', color: '#5BE3C0', color2: '#00D4AA' },
    creator: { key: 'creator', name: '创作版',  icon: '🟠', color: '#FFB800', color2: '#E8500A' },
    pro:     { key: 'pro',     name: '专业版',  icon: '🟣', color: '#C97AF2', color2: '#7E40C6' },
    signed:  { key: 'signed',  name: '签约创作者', icon: '👑', color: '#FFD700', color2: '#E8A000' }
  };
  function getMembership() {
    const meta = _readObj(_KEYS.META, {});
    const tier = (meta.profile && meta.profile.tier) || 'free';
    return Object.assign({}, TIER_META[tier] || TIER_META.free, {
      reservedEmail: (meta.profile && meta.profile.reservedEmail) || null,
      expireAt: (meta.profile && meta.profile.tierExpireAt) || null
    });
  }
  function setMembership(tier) {
    if (!TIER_META[tier]) return null;
    const meta = _readObj(_KEYS.META, {});
    meta.profile = meta.profile || {};
    meta.profile.tier = tier;
    _writeObj(_KEYS.META, meta);
    logEvent('membership.set', { tier });
    return getMembership();
  }
  // ===== 邀请机制 =====
  function getInviteData() {
    const meta = _readObj(_KEYS.META, {});
    const code = (meta.deviceId || getDeviceId()).slice(-6).toUpperCase();
    const invitees = (meta.profile && meta.profile.invitees) || [];
    const origin = (typeof location !== 'undefined') ? (location.origin + location.pathname.replace(/pages\/.*$/, '')) : '';
    return {
      code,
      link: origin + 'index.html?invite=' + code,
      count: invitees.length,
      invitees,
      tiers: [
        { n: 1,  reward: '解锁种子徽章',        done: invitees.length >= 1 },
        { n: 5,  reward: '创作版会员 7 天体验', done: invitees.length >= 5 },
        { n: 15, reward: '专业版会员 7 天体验', done: invitees.length >= 15 },
        { n: 30, reward: '专业版 15 天体验',    done: invitees.length >= 30 },
        { n: 50, reward: '创作版 30 天体验',    done: invitees.length >= 50 }
      ]
    };
  }
  // mock：模拟收到一个邀请（实际由后端在被邀请者注册时回调）
  function addInvitee(code) {
    const meta = _readObj(_KEYS.META, {});
    meta.profile = meta.profile || {};
    meta.profile.invitees = meta.profile.invitees || [];
    meta.profile.invitees.push({ code: code || ('kw_' + Math.random().toString(36).slice(2,6).toUpperCase()), at: _now() });
    _writeObj(_KEYS.META, meta);
    logEvent('invite.received', { total: meta.profile.invitees.length });
    return meta.profile.invitees.length;
  }

  function reserveMembership(tier, email) {
    const list = _readObj(_KEYS.META, {});
    list.profile = list.profile || {};
    list.profile.reservedEmail = email || null;
    list.profile.reservedTier = tier || null;
    _writeObj(_KEYS.META, list);
    logEvent('membership.reserve', { tier, hasEmail: !!email });
    return true;
  }

  function pickAvatarFromCode(code) {
    // 用 code 末位字符稳定地选一个 emoji
    const pool = ['🦊','🐼','🐳','🦉','🐺','🐯','🦁','🐢','🦔','🦖','🐉','🐧','🦄','🐝','🐙','🦋'];
    let sum = 0;
    for (let i = 0; i < (code || '').length; i++) sum += code.charCodeAt(i);
    return pool[sum % pool.length];
  }

  // 等级算法：根据工单数 / 案例数 / 引用数综合
  function computeLevel() {
    const orderCount     = _readList(_KEYS.ORDERS).length;
    const caseCount      = _readList(_KEYS.CASES).length;
    const referenceCount = _readList(_KEYS.CASES).reduce((s, c) => s + (c.referenceCount || 0), 0);
    const score = orderCount + caseCount * 5 + referenceCount * 3;
    let lv, name, next, color;
    if      (score >= 200) { lv = 5; name = '宗师';   next = null; color = '#FFD56A'; }
    else if (score >= 80)  { lv = 4; name = '匠人';   next = 200;  color = '#C97AF2'; }
    else if (score >= 30)  { lv = 3; name = '熟手';   next = 80;   color = '#00D4AA'; }
    else if (score >= 10)  { lv = 2; name = '学徒';   next = 30;   color = '#00B4D8'; }
    else                   { lv = 1; name = '新晋造物者'; next = 10;  color = '#7C9DFF'; }
    return { level: lv, name, score, next, color };
  }

  // 徽章定义：按使用记录解锁
  const BADGE_DEFS = [
    { id: 'first-order',    icon: '🎉', name: '第一份工单',   desc: '完成首次工单生成',          test: () => _readList(_KEYS.ORDERS).length >= 1 },
    { id: 'first-case',     icon: '✨', name: '首次创作沉淀', desc: '提交第一份完整创作过程',    test: () => _readList(_KEYS.CASES).length >= 1 },
    { id: 'first-rescue',   icon: '🚑', name: '会用修复库',   desc: '至少使用过 1 次失败修复',  test: () => _readList(_KEYS.RESCUE_LOGS).length >= 1 },
    { id: 'first-ref',      icon: '🔄', name: '懂得参考',     desc: '点击过"用这份做一条"',     test: () => _readList(_KEYS.CASES).some(c => (c.referenceCount || 0) > 0)
                                                                                                       || _readList(_KEYS.EVENTS).some(e => e.type === 'case.order.reference') },
    { id: 'follower-3',     icon: '👥', name: '关注 3 位',    desc: '关注超过 3 位创作者',       test: () => (_readObj(_KEYS.META, {}).followedCreators || []).length >= 3 },
    { id: 'order-5',        icon: '🌱', name: '5 份工单',     desc: '累计完成 5 份工单',         test: () => _readList(_KEYS.ORDERS).length >= 5 },
    { id: 'order-10',       icon: '🌳', name: '10 份工单',    desc: '累计完成 10 份工单',        test: () => _readList(_KEYS.ORDERS).length >= 10 },
    { id: 'case-3',         icon: '📚', name: '案例库 3 件',  desc: '提交 3 份完整创作过程',     test: () => _readList(_KEYS.CASES).length >= 3 },
    { id: 'master',         icon: '🏔️', name: '大师版玩家',   desc: '至少切换过一次大师版工单', test: () => _readList(_KEYS.EVENTS).some(e => e.type === 'result.depth.switch' && e.payload && e.payload.to === 'master') },
    { id: 'longtail',       icon: '💡', name: '长尾贡献者',   desc: '提交过特殊需求 / 长尾案例', test: () => _readList(_KEYS.ATOMS).some(a => a.type === 'longtail') }
  ];

  function computeBadges() {
    return BADGE_DEFS.map(b => ({
      id:       b.id,
      icon:     b.icon,
      name:     b.name,
      desc:     b.desc,
      unlocked: !!b.test()
    }));
  }

  // ===== 草稿状态机 =====
  /**
   * Draft 状态: 'in_progress' | 'completed'
   * - in_progress: 用户中途退出 / 切题，可以恢复
   * - completed:   用户已经提交进入 result 页，不该再被引导回中途
   */
  function saveDraft(data, status) {
    const d = Object.assign({}, data || {}, {
      status: status || 'in_progress',
      updatedAt: _now()
    });
    _writeObj(_KEYS.DRAFT, d);
    return d;
  }
  function getDraft() {
    const d = _readObj(_KEYS.DRAFT, null);
    return (d && d.status) ? d : null;
  }
  function markDraftCompleted() {
    const d = _readObj(_KEYS.DRAFT, null);
    if (!d) return null;
    d.status = 'completed';
    d.completedAt = _now();
    _writeObj(_KEYS.DRAFT, d);
    return d;
  }
  function clearDraft() {
    localStorage.removeItem(_KEYS.DRAFT);
  }

  // ===== 案例库（用户提交的完整"创作过程"：工单+成片+实际数据+心得）=====
  /**
   * addCase({orderId, workTitle, resultUrl, rating, metrics, thoughts, isPublic, creatorName})
   * - 同一 orderId 覆盖更新
   * - 公开案例进入 cases_grid（自由创作区）
   */
  function addCase(c) {
    if (!c || !c.orderId) throw new Error('case.orderId required');
    const list = _readList(_KEYS.CASES);
    const existed = list.find(x => x.orderId === c.orderId);
    const id = (existed && existed.id) || _uid('case');
    const order = getOrder(c.orderId);
    const submitterCode = (existed && existed.submitterCode) || ('kw_' + getDeviceId().slice(-4).toUpperCase());
    const full = {
      id,
      orderId:    c.orderId,
      workTitle:  (c.workTitle || '').trim(),         // 用户填的作品标题
      resultUrl:  (c.resultUrl || '').trim() || null, // 成片链接
      rating:     c.rating || null,                   // 1-5 星
      metrics:    c.metrics || null,                  // { views, likes, comments }
      thoughts:   (c.thoughts || '').trim(),          // 创作心得（100 字内）
      isPublic:   c.isPublic !== false,               // 默认公开
      creatorName: (c.creatorName || '').trim() || null,  // 自定义昵称，空则用 submitterCode
      // 旧字段保留兼容
      comment:    (c.thoughts || c.comment || '').trim(),
      // 脱敏关联工单
      direction:  order ? order.direction : null,
      orderTitle: order ? order.title : null,
      submitterCode,
      creatorTier: (existed && existed.creatorTier) || c.creatorTier || getMembership().key,  // 创作者会员档位（默认取提交者当前档位）
      featured:   (existed && existed.featured) || false,  // 编辑精选标记
      viewCount:  (existed && existed.viewCount) || 0,
      referenceCount: (existed && existed.referenceCount) || 0,
      submittedAt: existed ? existed.submittedAt : _now(),
      updatedAt:   _now()
    };
    const idx = list.findIndex(x => x.id === id);
    if (idx >= 0) list[idx] = full;
    else list.unshift(full);
    _writeList(_KEYS.CASES, list);
    // 学习次数加权：案例提交 +5
    bumpLearningCounter(5);
    logEvent('case.submitted', {
      orderId: c.orderId,
      hasUrl: !!c.resultUrl,
      hasMetrics: !!c.metrics,
      isPublic: full.isPublic,
      rating: full.rating
    });
    return full;
  }

  function getCases(filter) {
    let list = _readList(_KEYS.CASES);
    if (!filter) return list;
    if (filter.isPublic !== undefined) list = list.filter(c => !!c.isPublic === !!filter.isPublic);
    if (filter.featured !== undefined) list = list.filter(c => !!c.featured === !!filter.featured);
    if (filter.direction)              list = list.filter(c => c.direction === filter.direction);
    return list;
  }
  function getFeaturedCases() {
    return _readList(_KEYS.CASES).filter(c => c.featured);
  }
  function getCaseCount() {
    return _readList(_KEYS.CASES).length;
  }
  function getCase(id) {
    return _readList(_KEYS.CASES).find(c => c.id === id) || null;
  }

  /** 浏览一次案例（用户进案例卡片或点开成片/工单链接） */
  function viewCase(id, fromTab) {
    const list = _readList(_KEYS.CASES);
    const c = list.find(x => x.id === id);
    if (!c) return null;
    c.viewCount = (c.viewCount || 0) + 1;
    c.lastViewedAt = _now();
    _writeList(_KEYS.CASES, list);
    logEvent('case.viewed', { caseId: id, fromTab: fromTab || 'unknown' });
    return c;
  }

  /** 案例被"用这份做一条"引用 — 高权重训练信号 */
  function referenceCase(id) {
    const list = _readList(_KEYS.CASES);
    const c = list.find(x => x.id === id);
    if (!c) return null;
    c.referenceCount = (c.referenceCount || 0) + 1;
    c.lastReferencedAt = _now();
    _writeList(_KEYS.CASES, list);
    bumpLearningCounter(3);   // 案例被引用 +3
    logEvent('case.order.reference', { caseId: id });
    return c;
  }

  /** 关注创作者（按 deviceId / submitterCode） */
  function followCreator(code) {
    if (!code) return false;
    const meta = _readObj(_KEYS.META, {});
    meta.followedCreators = meta.followedCreators || [];
    const idx = meta.followedCreators.indexOf(code);
    if (idx >= 0) {
      meta.followedCreators.splice(idx, 1);
    } else {
      meta.followedCreators.push(code);
    }
    _writeObj(_KEYS.META, meta);
    logEvent('creator.follow', { code, action: idx >= 0 ? 'unfollow' : 'follow' });
    return idx < 0;
  }
  function isFollowing(code) {
    const meta = _readObj(_KEYS.META, {});
    return (meta.followedCreators || []).indexOf(code) >= 0;
  }

  // ===== 方法论投稿（contributions）=====
  function addContribution(c) {
    const list = _readList(_KEYS.CONTRIB);
    const full = {
      id: _uid('contrib'),
      type: c.type || 'other',              // prompt | storyboard | hook | case | other
      title: (c.title || '').trim(),
      content: (c.content || '').trim(),
      tags: c.tags || [],
      sourceType: c.sourceType || 'original',  // original | repost
      sourceNote: (c.sourceNote || '').trim(),
      status: 'pending',                    // pending | approved | rejected
      contributor: getDeviceId(),
      contributorCode: 'kw_' + getDeviceId().slice(-4).toUpperCase(),
      createdAt: _now()
    };
    list.unshift(full);
    _writeList(_KEYS.CONTRIB, list);
    bumpLearningCounter(2);
    logEvent('contribution.submitted', { type: full.type, sourceType: full.sourceType });
    return full;
  }
  function getContributions(filter) {
    let list = _readList(_KEYS.CONTRIB);
    if (filter && filter.status) list = list.filter(c => c.status === filter.status);
    if (filter && filter.type)   list = list.filter(c => c.type === filter.type);
    return list;
  }
  function updateContribution(id, patch) {
    const list = _readList(_KEYS.CONTRIB);
    const idx = list.findIndex(c => c.id === id);
    if (idx < 0) return null;
    list[idx] = Object.assign({}, list[idx], patch);
    _writeList(_KEYS.CONTRIB, list);
    return list[idx];
  }

  // ===== 管理员灵感收纳箱（inbox）=====
  function addInboxItem(item) {
    const list = _readList(_KEYS.INBOX);
    const text = (item.raw || '').trim();
    // 简易类型识别
    let detected = 'other';
    if (/https?:\/\//.test(text))                    detected = 'link';
    else if (/镜头|分镜|运镜|景别|推拉摇移/.test(text)) detected = 'storyboard';
    else if (/提示词|prompt|--ar|seed|midjourney/i.test(text)) detected = 'prompt';
    else if (/爆款|案例|播放量|点赞|涨粉/.test(text))  detected = 'case';
    const full = {
      id: _uid('inbox'),
      raw: text,
      detectedType: item.type || detected,
      source: item.source || '',           // 来源平台
      score: item.score || 0,              // 价值评分 0-5
      status: item.status || 'unprocessed', // unprocessed | archived | discarded
      createdAt: _now()
    };
    list.unshift(full);
    _writeList(_KEYS.INBOX, list);
    logEvent('inbox.added', { type: full.detectedType });
    return full;
  }
  function getInboxItems(filter) {
    let list = _readList(_KEYS.INBOX);
    if (filter && filter.status) list = list.filter(x => x.status === filter.status);
    return list;
  }
  function updateInboxItem(id, patch) {
    const list = _readList(_KEYS.INBOX);
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return null;
    list[idx] = Object.assign({}, list[idx], patch);
    _writeList(_KEYS.INBOX, list);
    return list[idx];
  }

  // ===== 自由创作区 · 种子案例注入（首次加载且 cases 为空才注入） =====
  // 数据来源：works-data.js 的 window.CASES_SEED（仅在 works.html 加载）。
  // 由于 data-layer.js 先于 works-data.js 解析，注入逻辑挂到 DOMContentLoaded：
  // 那时所有 <script> 已就绪，window.CASES_SEED 在 works 页可用；其他页 undefined，安全跳过。
  function _seedCasesIfEmpty() {
    try {
      const seed = (typeof window !== 'undefined') ? window.CASES_SEED : null;
      if (!Array.isArray(seed) || seed.length === 0) return;
      const list = _readList(_KEYS.CASES);
      if (list.length === 0 && !localStorage.getItem('kw_cases_seeded')) {
        _writeList(_KEYS.CASES, seed.slice());
        localStorage.setItem('kw_cases_seeded', '1');
        logEvent('cases.seeded', { count: seed.length });
      }
    } catch (e) { /* localStorage 不可用时静默跳过 */ }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _seedCasesIfEmpty);
    } else {
      _seedCasesIfEmpty();
    }
  }

  // ===== 策展原子库（AtomCard V2 · kaiwu_atom_library）=====
  // 注意：这与上面的 kaiwu_atoms（工单抽取/投稿的原子飞轮）是两套独立存储与 schema，互不污染。
  // 方法名用 *AtomCard，避免与既有 getAtoms/saveAtom 冲突。
  function addAtomCard(card) {
    if (!card || !card.title) throw new Error('atomCard.title required');
    const list = _readList(_KEYS.ATOM_LIB);
    const id = card.id || _uid('atomc');
    const full = Object.assign({
      id,
      title:    '',
      library:  '',            // 中文库名：卖点提炼 / 钩子开头 / ...
      libKey:   '',            // 短键：motif / hook / ...（对接首页网格与 atoms.html?type=）
      atomType: 'other',
      summary:  '',
      template: '',
      variables: [],
      domains:  [],
      tags:     [],
      signals:  { score: 0, usageCount: 0, successRate: null, freshnessScore: 0 },
      source:   { type: 'team_preset', platform: '', url: '', collectedAt: '' },
      failurePatterns:   [],
      repairSuggestions: [],
      promptTemplate: '',
      negativePrompt: '',
      mechanism:      '',
      createdAt: _now()
    }, card, { id });
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) list[idx] = full;
    else list.unshift(full);
    _writeList(_KEYS.ATOM_LIB, list);
    return full;
  }
  // getAtomCards({ library }) — library 可传中文库名或短键 libKey，二者皆匹配
  function getAtomCards(filter) {
    let list = _readList(_KEYS.ATOM_LIB);
    if (filter && filter.library) {
      const q = filter.library;
      list = list.filter(a => a.library === q || a.libKey === q);
    }
    if (filter && filter.atomType) list = list.filter(a => a.atomType === filter.atomType);
    return list;
  }
  function getAtomCard(id) {
    return _readList(_KEYS.ATOM_LIB).find(a => a.id === id) || null;
  }
  // 种子注入：数据来源 window.ATOMS_SEED（atoms-data.js，仅在原子库相关页加载）。
  // 同 cases 模式：空且未 seeded 才注入，kw_atoms_seeded flag 防重复，DOMContentLoaded 触发。
  function _seedAtomsIfEmpty() {
    try {
      const seed = (typeof window !== 'undefined') ? window.ATOMS_SEED : null;
      if (!Array.isArray(seed) || seed.length === 0) return;
      const list = _readList(_KEYS.ATOM_LIB);
      if (list.length === 0 && !localStorage.getItem('kw_atoms_seeded')) {
        _writeList(_KEYS.ATOM_LIB, seed.slice());
        localStorage.setItem('kw_atoms_seeded', '1');
        logEvent('atoms.seeded', { count: seed.length });
      }
    } catch (e) { /* localStorage 不可用时静默跳过 */ }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _seedAtomsIfEmpty);
    } else {
      _seedAtomsIfEmpty();
    }
  }

  // ===== 轻量登录（手机号 + 验证码，无密码，不强制）=====
  function getAuth() {
    return _readObj(_KEYS.AUTH, { loggedIn: false, phone: null });
  }
  function login(phone) {
    const auth = { loggedIn: true, phone: phone || null, loginAt: _now() };
    _writeObj(_KEYS.AUTH, auth);
    // 绑定到匿名身份
    const meta = _readObj(_KEYS.META, {});
    meta.profile = meta.profile || {};
    meta.profile.boundPhone = phone || null;
    _writeObj(_KEYS.META, meta);
    logEvent('auth.login', { hasPhone: !!phone });
    return auth;
  }
  function logout() {
    _writeObj(_KEYS.AUTH, { loggedIn: false, phone: null });
    logEvent('auth.logout', {});
    return true;
  }
  function isLoggedIn() { return !!getAuth().loggedIn; }

  // ===== 数据透明性：导出 / 清空 =====
  function exportAllData() {
    return {
      schema:        'kaiwu-export-v2',
      exportedAt:    _now(),
      deviceId:      getDeviceId(),
      learnCount:    getLearningCount(),
      orders:        _readList(_KEYS.ORDERS),
      atoms:         _readList(_KEYS.ATOMS),
      atomLibrary:   _readList(_KEYS.ATOM_LIB),
      rescueLogs:    _readList(_KEYS.RESCUE_LOGS),
      decodeRecords: _readList(_KEYS.DECODE_RECORDS),
      cases:         _readList(_KEYS.CASES),
      contributions: _readList(_KEYS.CONTRIB),
      inbox:         _readList(_KEYS.INBOX),
      events:        _readList(_KEYS.EVENTS),
      draft:         _readObj(_KEYS.DRAFT, null),
      auth:          _readObj(_KEYS.AUTH, {}),
      meta:          _readObj(_KEYS.META, {})
    };
  }

  /**
   * downloadAllData() — 触发浏览器下载完整 JSON
   */
  function downloadAllData() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    a.href = url;
    a.download = `kaiwu-data-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
    logEvent('data.exported', { sizes: {
      orders: data.orders.length,
      atoms:  data.atoms.length,
      logs:   data.rescueLogs.length,
      decodes:data.decodeRecords.length,
      events: data.events.length
    }});
  }

  function clearAllData() {
    Object.values(_KEYS).forEach(k => localStorage.removeItem(k));
  }

  // ===== Migration: 把旧 KWStorage（kaiwu_history）数据合并到新表 =====
  function _migrateLegacy() {
    try {
      const legacy = JSON.parse(localStorage.getItem('kaiwu_history') || '[]');
      if (!Array.isArray(legacy) || !legacy.length) return;
      const existing = new Set(_readList(_KEYS.ORDERS).map(o => o.id));
      let added = 0;
      legacy.forEach(item => {
        if (!item || !item.id || existing.has(item.id)) return;
        saveOrder({
          id:              item.id,
          createdAt:       item.createdAt || _now(),
          direction:       item.dir || item.direction || 'unknown',
          title:           item.title || '',
          inputs:          item.answers || {},
          inputsResolved:  item.answersResolved || {},
          output:          item.modules || item.output || {},
          templateMatched: item.templateMatched || null
        });
        added++;
      });
      if (added > 0) {
        console.info('[KW_DL] migrated', added, 'legacy history items');
      }
    } catch (e) {
      console.warn('[KW_DL] migration failed:', e);
    }
  }

  // 自动跑一次迁移
  _migrateLegacy();

  return {
    // 工单
    saveOrder, getOrder, getOrderHistory, updateOrder, updateOrderFeedback,
    toggleOrderFavorite, removeOrder, deleteOrder,
    // 原子（工单抽取飞轮）
    saveAtom, getAtoms, getAtomsByOrder, updateAtom,
    bumpAtomUse, bumpAtomRating, bumpAtomSuccess,
    // 策展原子库（AtomCard V2 · 可浏览/分层）
    addAtomCard, getAtomCards, getAtomCard,
    seedAtomsIfEmpty: _seedAtomsIfEmpty,
    // 修复日志
    logRescueUsage, getRescueStats,
    // 解析记录
    saveDecodeRecord, getDecodeRecord,
    // 草稿状态机
    saveDraft, getDraft, markDraftCompleted, clearDraft,
    // 案例库（创作开源）
    addCase, getCases, getFeaturedCases, getCaseCount, getCase,
    viewCase, referenceCase, followCreator, isFollowing,
    // 通用埋点
    logEvent,
    // 元 / 用户身份
    getDeviceId, getLearningCount, bumpLearningCounter,
    getUserProfile, updateUserProfile, computeBadges, computeLevel,
    getMembership, setMembership, reserveMembership,
    getInviteData, addInvitee,
    // 方法论投稿 / 收纳箱 / 登录
    addContribution, getContributions, updateContribution,
    addInboxItem, getInboxItems, updateInboxItem,
    getAuth, login, logout, isLoggedIn,
    // 透明性
    exportAllData, downloadAllData, clearAllData,
    // 内部（调试用）
    _KEYS
  };
})();

// 暴露到 window 便于跨页与调试
if (typeof window !== 'undefined') window.KW_DL = KW_DL;
