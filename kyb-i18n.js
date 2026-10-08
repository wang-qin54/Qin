(function () {
  const STORAGE_KEY = 'kyb-lang';

  const translations = {
    en: {
      pageTitle: 'KYB — Institutional Verification Flow Redesign',
      title: 'Institutional Verification Flow Redesign',
      meta1: '// 2 weeks | UX UI Design',
      meta2: '// 2 Designers + 1 P0 + 1 Front-End Engineers',
      backToWork: 'Back',
      caseNavLabel: 'Case study navigation',
      langToggleLabel: 'Language',

      s1_title: 'Intro',
      s1_p1: '· Institutional clients contribute <b>30% to 70%</b> of trading volume on crypto exchanges.',
      s1_p2: '· Institutional verification is crucial for organizations to prove their legitimacy. Once verified, they can access higher deposit limits and larger withdrawals, enhancing their trading capabilities.',
      s1_p3: '· User research indicates <b>low conversion rates</b> in the KYB verification step due to unclear instructions.',

      s2_title: 'Data-driven insight',
      s2_h5_1: 'KYB failed reason: file uploading is lack of <b>clarity and guidance</b>.',
      s2_p1: '· User research indicates that <b>82% </b>of users <b>submitted multiple applications</b>, with approximately <b>40%</b> taking <b>more than 5 days</b> to complete their Know Your Business (KYB) processes.',
      s2_p2: '· The <b>conversion rate</b> for document uploads is notably low at <b>41%</b>, primarily because users are often confused about which materials to upload in various scenarios. The previous design failed to provide the necessary clarity and guidance.',
      s2_h5_2: 'Current design: text-heavy',
      s2_p3: 'Users had to read through <b>lengthy text instructions</b> to understand what documents were required. This approach was not user-friendly and led to frustration.',

      s3_title: 'Competitor Analysis',
      s3_p_intro: 'Key takeway:',
      s3_p1: '· <b>Pre-select country and institution type</b> to show relevant files.',
      s3_p2: '· Provide a <b>document checklist upfront</b> to help users gather materials efficiently.',
      s3_p3: '· Include <b>straightforward instructions</b> for uploading files.',

      s4_title: 'Key Iterations',
      s4_p1: '1. Replaced the text reading with <b>guided selection</b>.',
      s4_p2: '2. Established a <b>visual hierarchy</b>.',
      s4_p3: '3. Added an <b>additional section </b>for uploads to increase the chances of success.',

      s5_title: 'Final',

      s6_title: 'Impact & Measurement',
      s6_intro: 'The redesign shipped to the institutional onboarding flow serving KuCoin\'s global institutional client base — the segment responsible for <b>30–70% of exchange trading volume</b>.',
      s6_h5_1: 'Pre-launch baseline',
      s6_p1: '· <b>41%</b> document-upload completion rate — established as the measurement baseline before release.',
      s6_p2: '· <b>82%</b> repeat-submission rate — the primary friction signal the redesign was built to address.',
      s6_p3: '· <b>~40%</b> of applicants taking more than 5 days to complete — a secondary cycle-time indicator.',
      s6_h5_2: 'What we set up to track',
      s6_p4: '· <b>Document-upload completion rate</b> (primary) — direct measure of whether the new checklist and guided selection resolved the clarity gap.',
      s6_p5: '· <b>Repeat submission rate</b> (leading indicator) — if users are submitting the right materials the first time, this should drop from the 82% baseline.',
      s6_p6: '· <b>Application cycle time</b> (secondary) — tracking whether the upfront document checklist reduces the >5-day tail.',
      s6_h5_3: 'Why I\'m confident in the direction despite pending data',
      s6_p7: 'Development capacity constraints meant the A/B validation had not run at the time of this writing. The design rationale, however, rests on three things:',
      s6_p8: '1. <b>Direct behavioural evidence</b>: The 82% repeat-submission rate pointed to a clarity problem, not a motivation problem. The new design specifically addresses the information architecture — entity selection upfront, jurisdiction-specific document checklist, and inline guidance at the moment of upload confusion.',
      s6_p9: '2. <b>Competitor pattern consistency</b>: Guided entity selection + upfront document checklist was the dominant pattern across three institutional verification flows we analysed. It reduces the cognitive load of "what do I need to prepare" before users enter the upload step.',
      s6_p10: '3. <b>Internal validation</b>: Compliance and operations teams confirmed the checklist contents were accurate and comprehensive — resolving a key source of confusion that the previous text-heavy design buried in paragraph form.',
      s6_h5_4: 'What I\'d do differently',
      s6_p11: 'The research was primarily derived from submission data and internal interviews. The next iteration would include direct sessions with the institutional decision-makers doing the actual verification — finance controllers, legal officers, and compliance teams at the applying organizations — to validate whether the entity-type selection logic matches how they think about their own corporate structure.',

      s7_title: 'Other work at KC',

      nav_s1: 'Intro',
      nav_s2: 'Data-driven Insight',
      nav_s3: 'Competitor Analysis',
      nav_s4: 'Key Iterations',
      nav_s5: 'Final',
      nav_s6: 'Impact & Measurement',
      nav_s7: 'Other work at KC',
      nav_top: 'Back to Top',
    },
    zh: {
      pageTitle: 'KYB — 机构认证流程重设计',
      title: '机构认证流程重设计',
      meta1: '// 2 周 | UX / UI 设计',
      meta2: '// 2 名设计师 + 1 名产品负责人 + 1 名前端工程师',
      backToWork: '返回',
      caseNavLabel: '案例导航',
      langToggleLabel: '语言',

      s1_title: '简介',
      s1_p1: '· 机构客户占加密货币交易所交易量的 <b>30% 至 70%</b>。',
      s1_p2: '· 机构认证对组织证明其合法性至关重要。通过认证后，机构可获得更高的充值限额和更大的提现额度，从而提升交易能力。',
      s1_p3: '· 用户研究表明，由于指引不清晰，KYB 认证环节的<b>转化率较低</b>。',

      s2_title: '数据洞察',
      s2_h5_1: 'KYB 失败原因：文件上传缺乏<b>清晰指引</b>。',
      s2_p1: '· 用户研究表明，<b>82%</b> 的用户<b>多次提交申请</b>，约 <b>40%</b> 的用户完成 KYB 流程<b>超过 5 天</b>。',
      s2_p2: '· 文件上传的<b>转化率</b>仅为 <b>41%</b>，主要因为用户在不同场景下不清楚应上传哪些材料。旧版设计未能提供必要的清晰指引。',
      s2_h5_2: '现有设计：文字过多',
      s2_p3: '用户需要阅读<b>冗长的文字说明</b>才能了解需要哪些文件，体验不友好，也导致挫败感。',

      s3_title: '竞品分析',
      s3_p_intro: '关键结论：',
      s3_p1: '· <b>预先选择国家和机构类型</b>，以展示相关文件。',
      s3_p2: '· 提前提供<b>文件清单</b>，帮助用户高效准备材料。',
      s3_p3: '· 提供<b>简洁明了的上传指引</b>。',

      s4_title: '关键迭代',
      s4_p1: '1. 用<b>引导式选择</b>替代纯文字阅读。',
      s4_p2: '2. 建立清晰的<b>视觉层级</b>。',
      s4_p3: '3. 增加<b>补充上传区域</b>，提高提交成功率。',

      s5_title: '最终方案',

      s6_title: '影响与衡量',
      s6_intro: '该重设计已上线至 KuCoin 全球机构客户的入驻流程——这一群体贡献了交易所 <b>30–70% 的交易量</b>。',
      s6_h5_1: '上线前基线',
      s6_p1: '· 文件上传完成率 <b>41%</b>——作为发布前的衡量基线。',
      s6_p2: '· 重复提交率 <b>82%</b>——重设计主要要解决的摩擦信号。',
      s6_p3: '· 约 <b>40%</b> 的申请人完成流程<b>超过 5 天</b>——辅助的周期指标。',
      s6_h5_2: '我们设置的追踪指标',
      s6_p4: '· <b>文件上传完成率</b>（主要指标）——直接衡量新清单和引导式选择是否解决了清晰度问题。',
      s6_p5: '· <b>重复提交率</b>（领先指标）——若用户首次即提交正确材料，该指标应从 82% 基线下降。',
      s6_p6: '· <b>申请周期</b>（次要指标）——追踪提前文件清单是否缩短超过 5 天的长尾。',
      s6_h5_3: '为何在数据尚未出炉时仍对方向有信心',
      s6_p7: '受开发资源限制，撰写本文时 A/B 验证尚未运行。但设计依据建立在三点之上：',
      s6_p8: '1. <b>直接行为证据</b>：82% 的重复提交率指向清晰度问题，而非动机问题。新设计针对信息架构——前置实体选择、按司法辖区定制的文件清单，以及在上传困惑时的内联指引。',
      s6_p9: '2. <b>竞品模式一致性</b>：引导式实体选择 + 前置文件清单，是我们分析的三套机构认证流程中的主流模式。它降低了用户进入上传步骤前「我需要准备什么」的认知负担。',
      s6_p10: '3. <b>内部验证</b>：合规与运营团队确认清单内容准确且完整——解决了旧版文字堆砌设计中将关键信息埋在段落里的主要困惑来源。',
      s6_h5_4: '下次我会怎么做',
      s6_p11: '研究主要来自提交数据与内部访谈。下一版迭代将直接与实际负责认证的企业决策者——财务负责人、法务与合规团队——进行访谈，验证实体类型选择逻辑是否匹配他们对自身企业结构的认知方式。',

      s7_title: 'KC 其他作品',

      nav_s1: '简介',
      nav_s2: '数据洞察',
      nav_s3: '竞品分析',
      nav_s4: '关键迭代',
      nav_s5: '最终方案',
      nav_s6: '影响与衡量',
      nav_s7: 'KC 其他作品',
      nav_top: '回到顶部',
    },
  };

  function getStoredLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'zh' ? 'zh' : 'en';
  }

  function setLang(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = dict.pageTitle || document.title;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const pairs = el.getAttribute('data-i18n-attr').split(';');
      pairs.forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key && dict[key] !== undefined) {
          el.setAttribute(attr, dict[key]);
        }
      });
    });

    document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const lang = getStoredLang();
    setLang(lang);

    document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextLang = btn.getAttribute('data-lang');
        if (nextLang) setLang(nextLang);
      });
    });
  });
})();
