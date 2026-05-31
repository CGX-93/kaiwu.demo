/* 开物 · 失败修复库数据
 * 8 个症状 × 3 个场景 × 完整急救方案
 * 现阶段为 mock 内容，真实方案由团队/创作者持续补充
 */

const RESCUE_DATA = (function () {
  'use strict';

  const symptoms = [
    {
      id: 'image-broken',
      icon: '💥',
      title: '图崩了',
      summary: 'AI 出图人脸畸变、六指、塑料感',
      color: '#FF6B6B',
      gradFrom: '#FF7A7A', gradTo: '#C81F5E',
      scenes: [
        {
          id: 'face-distorted',
          title: '人脸畸变（眼睛错位 / 嘴角歪 / 比例不对）',
          when: '即梦 / 可灵生成人物中近景时，脸越大越容易出问题',
          fix: {
            heading: '修脸三步走',
            steps: [
              '原提示词末尾追加：detailed face, sharp eyes, symmetrical features, natural skin texture, intricate facial details',
              '把重绘强度从默认 0.7 降到 0.55-0.65（高了会重画整张脸）',
              '即梦"修脸"子流程：先全身 0.65 出图 → 圈选脸部 inpaint 0.4 → 第二轮 0.3 微调'
            ],
            params: 'Seed 锁定 · CFG 7-8 · Sampler DPM++ 2M Karras · Steps 30',
            negative: '(deformed face:1.4), (asymmetric eyes:1.3), distorted, ugly'
          }
        },
        {
          id: 'hands-twisted',
          title: '手指畸变（六指 / 缺指 / 手指错位）',
          when: '手出现在画面里，特别是特写或拿东西的镜头',
          fix: {
            heading: '手部修复',
            steps: [
              '提示词追加：detailed hands, five clearly defined fingers, anatomically correct hands, natural finger pose',
              '负面词加强：(extra fingers:1.4), (missing fingers:1.3), (fused fingers:1.3), mutated hands, deformed limbs',
              '画面里有手部 → seed 微调 ±100 直到正常，不要重画整张图浪费 token'
            ],
            params: '模型推荐：Realistic Vision V5 / Juggernaut XL / SDXL 1.0（手指好）',
            negative: 'mutated hands, bad anatomy, malformed limbs'
          }
        },
        {
          id: 'plastic-skin',
          title: '整体画质塑料感（看着像 AI，不像真人）',
          when: '提示词不带胶片关键词 / 直接默认参数出图',
          fix: {
            heading: '加回"皮肤呼吸感"',
            steps: [
              '提示词追加：natural skin pores, soft cinematic film, organic textures, 16mm film grain',
              '负面词加强：plastic skin, AI artifacts, oversharpened, overexposed, hyperreal',
              '后期：剪映 → 滤镜 → 胶片颗粒，叠加 30-50% 不透明度'
            ],
            params: '降 CFG 到 6.5 · 重绘强度 0.6-0.65（不要更高）',
            negative: 'plastic, glossy, doll-like, perfect skin'
          }
        }
      ]
    },
    {
      id: 'character-inconsistent',
      icon: '👤',
      title: '角色不一致',
      summary: '同一角色，多个镜头脸 / 衣 / 身材都不一样',
      color: '#FFB800',
      gradFrom: '#FFB800', gradTo: '#E8500A',
      scenes: [
        {
          id: 'face-swap',
          title: '镜头 2 / 镜头 5 主角已经"换脸"了',
          when: '没锁定 seed，或每个镜头单独生成时提示词前缀有差异',
          fix: {
            heading: '人物锁定 + Seed 锁定',
            steps: [
              '把"人物锁定词"完整复制粘到每个镜头提示词最前面（一字不差）',
              '所有镜头用同一个 seed（推荐 81923 或自选一个稳定的）',
              '改不掉的话：先生成镜头 1 → 用它做参考图喂给镜头 2-N（即梦"参考图"功能）'
            ],
            params: 'Seed 全组一致 · 提示词前缀必须完全相同',
            negative: 'different person, inconsistent character'
          }
        },
        {
          id: 'outfit-change',
          title: '服装颜色 / 款式镜头间跳变（卡其变深灰）',
          when: '提示词里服装描述太短 / 用词太宽泛',
          fix: {
            heading: '把"服装"写到具体',
            steps: [
              '不写"米白上衣"，写：cream-colored high-neck knit sweater, wool texture, slim-fit, with silver metal earrings',
              '锁定关键词加权重：(cream-colored high-neck knit:1.2) (khaki trench coat:1.2)',
              '如果还是变 → 第一镜确定后，把生成图喂给后续镜头做"风格参考"'
            ],
            params: 'CFG 8 · 重绘强度 ≤ 0.65（高了会改变服装）',
            negative: 'different outfit, color shift'
          }
        },
        {
          id: 'body-shift',
          title: '身材 / 发型跨镜头跳变',
          when: '人物锁定词只写了脸，没写身材和发型',
          fix: {
            heading: '锁定词必须三件套：脸 + 发 + 身',
            steps: [
              '每条人物锁定词都包含：发型/发长 + 身材类型 + 身高（不写身高至少写身材线条）',
              '示例：shoulder-length wavy black hair, slim build with average height, gentle posture',
              '远景镜头额外加：full body in frame, proportionally consistent'
            ],
            params: '远 / 近镜头用不同 prompt 但共享人物锁定前缀',
            negative: 'different body type, different hair'
          }
        }
      ]
    },
    {
      id: 'video-incoherent',
      icon: '🎬',
      title: '视频不连贯',
      summary: '镜头之间硬切跳跃 / 主角动作不连续',
      color: '#C97AF2',
      gradFrom: '#C97AF2', gradTo: '#7E40C6',
      scenes: [
        {
          id: 'hard-cut',
          title: '镜头之间硬切跳跃，看起来像"幻灯片"',
          when: '不同镜头出画方向和入画方向没对齐',
          fix: {
            heading: '入画 / 出画方向要对齐',
            steps: [
              '镜头 N 的"出画方向" = 镜头 N+1 的"入画方向"（左出 → 左入）',
              '剪辑时镜头切换前 0.1 秒和后 0.1 秒做一个 12 帧的"惯性匹配"',
              '关键镜头之间加 0.3-0.5s 的"溶解"或"叠化"过渡（不要硬切）'
            ],
            params: '剪映 → 转场库 → 溶解 0.4s / 叠化 0.5s',
            negative: ''
          }
        },
        {
          id: 'motion-broken',
          title: '主角动作在镜头切换时"瞬移"或"重置"',
          when: '可灵从图生视频时没有承接前一镜的动作姿态',
          fix: {
            heading: '动作衔接：末帧 = 起始帧',
            steps: [
              '镜头 N 生成视频后，截末帧图像作为镜头 N+1 的起始参考',
              '可灵 image-to-video 时把"风格保真度"调高，避免动作漂移',
              '复杂动作（走 / 转身）：拆成两个镜头之间留 0.3s 静止过渡'
            ],
            params: '可灵：稳定增强 高 · 风格保真 高',
            negative: ''
          }
        },
        {
          id: 'scene-jump',
          title: '场景突然变化（室内 → 户外没交代）',
          when: '剧本节奏太紧，没给场景过渡留空间',
          fix: {
            heading: '场景过渡的 3 种正确姿势',
            steps: [
              '空镜过渡：插入 0.5-1s 的"门 / 楼梯 / 走廊"空镜头',
              '声音过渡：上一镜环境音延续 0.3s 进入下一镜（声画错位 0.3s）',
              '字幕引导：「3 小时后…」「换到了…」等极简字幕（不要花哨）'
            ],
            params: '环境音淡入淡出 0.3s · 字幕字号 24-28pt',
            negative: ''
          }
        }
      ]
    },
    {
      id: 'style-mismatched',
      icon: '🎨',
      title: '画风不统一',
      summary: '前几镜写实 后几镜偏卡通 整片"散架"',
      color: '#00D4AA',
      gradFrom: '#00D4AA', gradTo: '#00B4D8',
      scenes: [
        {
          id: 'realism-cartoon',
          title: '前几镜写实，后几镜偏卡通 / 插画',
          when: '不同镜头分别生成、提示词的风格词不一致',
          fix: {
            heading: '风格锁定词模板化',
            steps: [
              '建立一组"风格锁定前缀"，所有镜头开头一字不差用它',
              '示例：cinematic film aesthetic, 16mm film grain, soft warm-cool palette, photorealistic',
              '负面词必带：3d render, cartoon, anime, painting, illustration, cgi'
            ],
            params: 'CFG 7.5 · Sampler 全组一致',
            negative: 'cartoon, anime, 3d, cgi, illustration, painting'
          }
        },
        {
          id: 'tone-flip',
          title: '色调忽冷忽暖（一会儿暖橙一会儿冷蓝）',
          when: '光影提示词在不同镜头之间没有协调',
          fix: {
            heading: '统一色温 + 后期 LUT 兜底',
            steps: [
              '光影提示词统一注明：色温（如 4200K warm orange）+ 整体饱和度（如 0.35）',
              '后期套用同一组 LUT：剪映 → 滤镜 → FilmConvert Kodak 2383，强度 60%',
              '极端不齐 → 重新生成最跑偏的那一镜，不要硬调'
            ],
            params: 'LUT 强度 50-65% · 整体饱和度 -10',
            negative: ''
          }
        },
        {
          id: 'style-clash',
          title: '风格关键词冲突（"复古" + "未来感"混着写）',
          when: '风格词堆砌过多、互相矛盾',
          fix: {
            heading: '风格词不超过 4 个，且必须协调',
            steps: [
              '主风格 1 个（如 cinematic）+ 辅修饰 1-2 个（如 16mm grain, warm palette）',
              '不要把对立词放一起：复古 / 未来感 / 极简 / 巴洛克 同时出现 = 灾难',
              '不确定就只用"主风格 + 时代词"两项即可（如 cinematic, 1990s）'
            ],
            params: '提示词前缀控制在 25 词以内',
            negative: 'mixed styles, contradictory aesthetics'
          }
        }
      ]
    },
    {
      id: 'copy-fake',
      icon: '📝',
      title: '文案太假',
      summary: '模板感太重 / 像 AI 写的 / 没人味',
      color: '#FFD56A',
      gradFrom: '#FFD56A', gradTo: '#FFB800',
      scenes: [
        {
          id: 'template-feel',
          title: '"姐妹们我真的想说" 这种开头，太套路',
          when: '直接搬小红书爆款话术模板',
          fix: {
            heading: '把"群体称呼"换成"具体场景"',
            steps: [
              '不要：「姐妹们我真的想说……」',
              '改成：「上班路上挤地铁那一秒，你有没有觉得……」（拉具体场景）',
              '人称：用"你"和"我"，不要用"大家""姐妹们""宝子们"'
            ],
            params: '钩子前 3 秒必须有"具体场景"或"具体细节"',
            negative: ''
          }
        },
        {
          id: 'empty-adjectives',
          title: '形容词堆砌（"超绝""绝美""yyds"）但说不出哪好',
          when: '只描述感受不给细节',
          fix: {
            heading: '形容词后面必须跟一个"具体可验证"的事实',
            steps: [
              '不要：「这个包绝美」',
              '改成：「这个包包面像橘子皮纹理，光打上去会有一层细微的光斑」',
              '感受词 +「为什么有这个感受」=「具体细节」'
            ],
            params: '原则：1 个感受词 + 1 个细节 = 1 个有效句',
            negative: ''
          }
        },
        {
          id: 'no-personal',
          title: '没有"个人体验"，只有"产品介绍"',
          when: '文案像产品页搬运',
          fix: {
            heading: '加入"我"的具体经历',
            steps: [
              '在文案中插入：「我有一次……」「上次我……」（时间锚点）',
              '细节：地点 / 天气 / 心情 / 当时穿什么',
              '不要"我觉得很好用"，要"上周三下午下大雨，我把它扔进湿包里第二天还正常"'
            ],
            params: '比例：30% 个人经历 + 50% 产品细节 + 20% 情绪共鸣',
            negative: ''
          }
        }
      ]
    },
    {
      id: 'no-traffic',
      icon: '📉',
      title: '发出去没流量',
      summary: '播放量个位数 / 完播率低 / 点赞极少',
      color: '#5BE3C0',
      gradFrom: '#5BE3C0', gradTo: '#00D4AA',
      scenes: [
        {
          id: 'no-hook',
          title: '前 3 秒留不住人，70% 用户没看到第 5 秒',
          when: '开头没有冲突 / 没有信息差 / 没有视觉刺激',
          fix: {
            heading: '3 秒钩子的 5 种结构',
            steps: [
              '反常识：「你以为通勤包要装大，其实越能装越累」',
              '具体数字：「试过 7 个品牌，只留下这一只」',
              '场景痛点：「上下班路上，我们最容易被淹没」',
              '直接结论倒装：「这只包让我每天出门多花 2 分钟收拾」（反向钩子）',
              '画面冲突：3 秒内出现一个意料之外的视觉元素'
            ],
            params: '前 3 秒画面 + 字幕 + 旁白三层叠加，信息密度最大',
            negative: ''
          }
        },
        {
          id: 'flat-title',
          title: '标题太平淡（「分享我的通勤包」）',
          when: '标题没钩子词、没反差、没具体数字',
          fix: {
            heading: '标题三要素：数字 + 反差 + 个人体验',
            steps: [
              '不要：「分享我的通勤包」',
              '改成：「通勤了 5 年，终于挑到一只不让自己"消失"的包」',
              '套路：「[数字 / 时长] + [反差或转折] + [情绪 / 结果]」'
            ],
            params: '标题字数：抖音 10-18 字 / 小红书 15-22 字',
            negative: ''
          }
        },
        {
          id: 'wrong-pace',
          title: '节奏不对（前面快后面慢 / 全程一个速度）',
          when: '剪辑节奏没考虑用户耐心曲线',
          fix: {
            heading: '前快中稳后停的剪辑节奏',
            steps: [
              '前 3-5 秒：每个镜头 0.5-1s，快切，信息密度高',
              '中段 5-20s：每个镜头 2-4s，匀速展开',
              '结尾 20-30s：每个镜头 4-6s，留呼吸 + 金句字幕悬停'
            ],
            params: '完播率提示：金句字幕至少悬停 3s 才能被读完',
            negative: ''
          }
        }
      ]
    },
    {
      id: 'lipsync-off',
      icon: '🎤',
      title: '口型对不上',
      summary: 'AI 语音 / 字幕 / 嘴型 三者错位',
      color: '#7C9DFF',
      gradFrom: '#7C9DFF', gradTo: '#3A5FE5',
      scenes: [
        {
          id: 'voice-subtitle',
          title: 'AI 配音和字幕错开 0.3-0.5 秒',
          when: '剪映自动识别字幕时间码不准',
          fix: {
            heading: '字幕手动对齐 + 整体偏移',
            steps: [
              '剪映 → 字幕轨道 → 手动微调每条 ±100ms',
              '整体性偏移：先把字幕轨道整体后移 200ms（覆盖 AI 配音的"起始延迟"）',
              '关键金句单独对齐：用波形图肉眼对齐声音峰值'
            ],
            params: '剪映 → 工具 → 字幕识别 → 重新校准',
            negative: ''
          }
        },
        {
          id: 'voice-pace',
          title: '旁白比画面快 / 慢，整片"喘不过气"或"拖沓"',
          when: '画面镜头时长和旁白长度没匹配',
          fix: {
            heading: '先画面后旁白 + 旁白卡点',
            steps: [
              '正确流程：定画面节奏 → 写旁白 → 录到画面时长里',
              '旁白录长了：在断句处加长停顿 0.5-1s（不要加速）',
              '旁白录短了：在情绪高点处加"留白" 1s 静止画面（不要加废话）'
            ],
            params: 'BGM 不变速 · 旁白可微调 ±5% 语速',
            negative: ''
          }
        },
        {
          id: 'silence-misplaced',
          title: '"金句静音"位置不对，反而让人出戏',
          when: '没按"前 0.5s 静音 → 金句出 → 后留白"的节奏处理',
          fix: {
            heading: '金句的"静默仪式"',
            steps: [
              '金句出现前 0.5s：BGM 和环境音同时降到 0（不是慢慢降）',
              '金句配音：用比平常重的语气 + 比平常慢的语速',
              '金句结束后：留 1s 静止画面 → 再上字幕 → 字幕悬停 4s'
            ],
            params: '完整静默周期 5-6s · 不要少于 4s',
            negative: ''
          }
        }
      ]
    },
    {
      id: 'product-mismatch',
      icon: '📦',
      title: '产品不像实物',
      summary: 'AI 生成的产品偏离原产品 / 关键细节丢失',
      color: '#FF9665',
      gradFrom: '#FF9665', gradTo: '#E8500A',
      scenes: [
        {
          id: 'shape-drift',
          title: '生成的产品形状 / 比例和实物对不上',
          when: '完全靠文字描述产品，没有上传参考图',
          fix: {
            heading: '必须给参考图',
            steps: [
              '即梦 → 参考图功能：上传 2-3 张产品实拍图（正面 + 侧面 + 细节）',
              '提示词里同时写产品形状关键词：「rectangular structured tote with rounded corners」',
              '参考强度调到 0.7（保证形状还原）+ 创意度 0.4（保证场景不僵）'
            ],
            params: '参考图 ≥ 3 张 · 角度互补',
            negative: 'wrong shape, different design'
          }
        },
        {
          id: 'texture-lost',
          title: '材质 / 质感丢失（皮变塑料 / 棉变化纤）',
          when: '提示词没写材质，AI 自动填充成最常见的材质',
          fix: {
            heading: '材质三连：材料 + 质感 + 工艺',
            steps: [
              '写法：「genuine leather with matte finish and visible grain texture」（材料 + 工艺 + 视觉）',
              '常见错误：只写 "leather" 不够 → AI 会给塑料感',
              '产品上有金属配件单独锁：「(brushed silver metal:1.3) accents」'
            ],
            params: '材质类提示词加权重 1.2-1.3',
            negative: 'plastic, fake material, synthetic'
          }
        },
        {
          id: 'detail-replaced',
          title: '关键细节被 AI 自动填补成"它以为的"东西',
          when: '产品有独特设计点（比如品牌 logo / 特殊扣件），但提示词没说',
          fix: {
            heading: '关键细节单独写 + 后期合成',
            steps: [
              '提示词里把每个独特细节都写出来：「visible side zipper, magnetic snap closure, no logo」',
              'logo / 商标：AI 几乎一定会瞎画 → 出无 logo 图 → 后期 Photoshop 合成贴上',
              '细节畸变 → 圈选该区域 inpaint 0.3 重画（不要重画整张）'
            ],
            params: '后期合成时保留 100% 原图，只贴 logo 那一层',
            negative: 'wrong logo, fake brand'
          }
        }
      ]
    }
  ];

  // ID → symptom lookup
  const byId = {};
  symptoms.forEach(s => { byId[s.id] = s; });

  function getSymptom(id) { return byId[id] || null; }
  function getAllSymptoms() { return symptoms; }

  return { symptoms, getSymptom, getAllSymptoms };
})();

if (typeof window !== 'undefined') window.RESCUE_DATA = RESCUE_DATA;
