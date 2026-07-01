/**
 * 客户分析助手 - 制造业融资扩产引导对话（源自员工工作台-song 本地逻辑）
 */
(function () {
    function ibAnyKeyword(text, keywords) {
        return keywords.some((kw) => text.includes(kw));
    }

    function ibExtractBusinessName(text) {
        const map = {
            定增: '定增',
            定向增发: '定增',
            ipo: 'IPO',
            上市: 'IPO',
            可转债: '可转债',
            转债: '可转债',
            公司债: '公司债',
            重整: '破产重整',
            破产: '破产重整',
            信披: '信披判断',
            信息披露: '信披判断'
        };
        for (const [kw, biz] of Object.entries(map)) {
            if (text.includes(kw)) return biz;
        }
        return null;
    }

    function ibExtractCustomerInfo(text) {
        const info = {};
        if (text.includes('上市公司')) info.nature = '上市公司';
        const industries = ['制造业', '科技', '金融', '房地产', '医药', '能源', '消费'];
        for (const ind of industries) {
            if (text.includes(ind)) {
                info.industry = ind;
                break;
            }
        }
        const rm = text.match(/(\d+(?:\.\d+)?)\s*(亿|万)/);
        if (rm) info.revenue = rm[0];
        return info;
    }

    function ibFindBusiness(bizName) {
        const knowledge = window.IB_MODEL_KNOWLEDGE;
        const businesses = knowledge?.businesses || [];
        if (!businesses.length) return null;

        const normalized = String(bizName || '定增').trim();
        const byName = businesses.find((biz) => biz.name === normalized);
        if (byName) return byName;

        const keywordKeys = knowledge.businessKeywords?.[normalized] || [];
        const bizKey = keywordKeys.find((key) => String(key).endsWith('业务模型'));
        if (bizKey) {
            const byKey = businesses.find((biz) => biz.key === bizKey);
            if (byKey) return byKey;
        }

        return businesses.find((biz) => biz.name === '定增') || businesses[0];
    }

    function ibGetColumnLabel(column) {
        const cfg = window.IB_MODEL_KNOWLEDGE?.assistantConfig?.find((item) => item.column === column);
        return cfg?.label || column;
    }

    function ibFormatModelCategory(biz, column, categoryItem) {
        const sectionPath = categoryItem.subSection
            ? `${categoryItem.section} / ${categoryItem.subSection}`
            : categoryItem.section;
        const bizLabel = biz.category ? `${biz.name}（${biz.category}）` : biz.name;
        return `${bizLabel} · ${ibGetColumnLabel(column)} / ${sectionPath}`;
    }

    function ibCollectModelsFromColumn(bizName, column, options = {}) {
        const biz = ibFindBusiness(bizName);
        if (!biz) return [];

        const categories = biz.columns?.[column] || [];
        const sectionFilter = options.section || null;
        const limit = options.limit ?? 4;
        const models = [];

        categories.forEach((categoryItem) => {
            if (sectionFilter && categoryItem.section !== sectionFilter) return;
            const category = ibFormatModelCategory(biz, column, categoryItem);
            (categoryItem.models || []).forEach((modelName) => {
                if (models.length >= limit) return;
                models.push({ name: modelName, category });
            });
        });

        return models.slice(0, limit);
    }

    function ibResolveContextModels(bizName, column, options = {}) {
        const models = ibCollectModelsFromColumn(bizName, column, options);
        if (models.length) return models;

        const biz = ibFindBusiness(bizName);
        const columnLabel = ibGetColumnLabel(column);
        const fallbackName = options.fallbackName || columnLabel;
        return [{
            name: fallbackName,
            category: `${biz?.name || bizName || '定增'} · ${columnLabel}`
        }];
    }

    function ibAppendStandardFollowUps(L, bizName) {
        const biz = bizName || '定增';
        L.push('>>> ' + biz + '找谁支持？');
        L.push('>>> 帮我设计一个' + biz + '方案');
        L.push('>>> ' + biz + '业务怎么做？');
    }

    function ibGenerateAdmission(bizName) {
        const L = [];
        L.push('## ' + bizName + '发行条件与准入标准');
        L.push('');
        L.push('### 一、监管基本标准');
        L.push('- 符合《上市公司证券发行注册管理办法》');
        L.push('- 最近一年财报无保留/否定意见');
        L.push('- 近三年无重大违法行为');
        L.push('- 募集资金用途合规');
        L.push('');
        L.push('### 二、公司资质要求');
        L.push('- 实控人持股30%-60%，质押≤50%');
        L.push('- 近三年扣非净利润为正');
        L.push('- 资产负债率行业合理水平');
        L.push('- 细分领域营收数据可核验（市占率/排名待补录）');
        L.push('');
        L.push('### 三、募集资金用途要求');
        L.push('- 项目建设：符合产业政策');
        L.push('- 补充流动资金：≤30%');
        L.push('- 偿还债务：说明必要性');
        L.push('- 禁止：财务性投资、限制类行业');
        L.push('');
        L.push('### 四、合规性要求');
        L.push('- 近三年无重大违法违规');
        L.push('- 无损害投资者权益情形');
        L.push('- 无立案调查情形');
        L.push('- 舆情风险可控');
        L.push('');
        L.push('> 💡 提示：以上标准为通用准入参考，具体项目需经投行部门尽职调查后确定可行性。');
        L.push('');
        L.push('---');
        L.push('📌 联系支持：张明（工号8012）');
        L.push('');
        ibAppendStandardFollowUps(L, bizName);
        return L.join('\n');
    }

    function ibGenerateDesign(bizName) {
        const L = [];
        L.push('# ' + bizName + '方案设计模板');
        L.push('');
        L.push('## 一、发行基本要素');
        L.push('| 要素 | 标准方案 | 说明 |');
        L.push('|------|---------|------|');
        L.push('| 发行方式 | 向特定对象非公开发行 | 对象≤35名 |');
        L.push('| 发行价格 | 不低于前20日均价80% | 定价基准日为发行期首日 |');
        L.push('| 发行规模 | 不超过总股本30% | 按需确定 |');
        L.push('| 锁定期 | 6个月 | 自发行结束日起 |');
        L.push('| 募集资金 | 按需确定 | 需明确用途 |');
        L.push('');
        L.push('## 二、发行时间安排（标准周期4-6个月）');
        L.push('| 阶段 | 时间 | 主要工作 |');
        L.push('|------|------|---------|');
        L.push('| 方案论证 | 1-2周 | 定规模、用途、定价策略 |');
        L.push('| 尽职调查 | 2-4周 | 财务、法律、业务尽调 |');
        L.push('| 董事会审议 | T日 | 审议通过方案 |');
        L.push('| 股东大会 | T+1月 | 股东大会批准 |');
        L.push('| 申报审核 | 2-3月 | 交易所审核、证监会注册 |');
        L.push('| 发行阶段 | 1月 | 路演、簿记建档、定价 |');
        L.push('| **合计** | **4-6个月** | 自董事会决议至资金到账 |');
        L.push('');
        L.push('## 三、募集资金用途（典型结构）');
        L.push('- 项目建设：70%，符合产业政策方向');
        L.push('- 补充流动资金：≤30%，提升运营能力');
        L.push('- 偶尔可包含偿还展期内带息债务（需说明必要性）');
        L.push('');
        L.push('## 四、认购对象类型');
        L.push('| 类型 | 特点 | 适用情形 |');
        L.push('|------|------|---------|');
        L.push('| 控股股东/实控人 | 体现信心，锁定控制权 | 建议优先参与 |');
        L.push('| 战略投资者 | 带来产业资源 | 有战略合作需求时 |');
        L.push('| 机构投资者 | 公募、券商、保险等 | 主要资金来源 |');
        L.push('| 员工持股计划 | 绑定核心团队 | 规模一般较小 |');
        L.push('');
        L.push('## 五、关键条款设计');
        L.push('**1. 定价机制**：前20日均价×80%（底价），簿记建档市场化确定');
        L.push('**2. 配售原则**：同股同价，优先满足控股股东，机构按报价排序');
        L.push('**3. 调整机制**：派息送转需调整发行价，异常波动时价格稳定');
        L.push('');
        L.push('## 📄 可下载文档');
        L.push('- **[定增方案设计手册（完整版）](/docs/定向增发方案设计手册.pdf)** - PDF，25页');
        L.push('- **[定增方案Word模板](/templates/定增方案设计模板.docx)** - 可编辑');
        L.push('- **[募集资金可研报告模板](/templates/募集资金可行性研究报告.docx)** - 框架示例');
        L.push('');
        L.push('> 💡 点击文档名称即可下载，或联系张明（工号8012）获取定制化方案支持');
        L.push('> 👤 方案支持：张明（工号8012）| 邮箱：zhangm@company.com');
        L.push('');
        L.push('---');
        L.push('>>> ' + bizName + '的发行条件和准入标准是什么？');
        L.push('>>> ' + bizName + '找谁支持？');
        L.push('>>> 帮我核验这个' + bizName + '方案，看看有没有合规问题');
        return L.join('\n');
    }

    function ibGenerateRecommend(rawInput) {
        const L = [];
        const il = (rawInput || '').toLowerCase();
        const rm = (rawInput || '').match(/(\d+(?:\.\d+)?)\s*(亿|万)/);
        const revenueStr = rm ? rm[0] : '';
        let purpose = '融资';
        if (il.includes('扩产')) purpose = '扩产';
        else if (il.includes('并购') || il.includes('收购')) purpose = '并购';
        else if (il.includes('建设')) purpose = '项目建设';
        const isListed = il.includes('上市公司');
        const info = ibExtractCustomerInfo(rawInput);
        L.push('根据提供的客户信息，分析了以下投行业务机会：');
        L.push('');
        L.push('📊 业务推荐结果');
        L.push('');
        L.push('### 1. 定增（推荐度：95%）');
        L.push('与客户合作意图匹配度最高');
        L.push('');
        L.push('适用情形：上市公司股权融资首选，募集资金可直接用于' + purpose + '项目建设');
        L.push('关键要素：');
        L.push('实控人持股比例（建议30%-60%）');
        L.push('融资用途需符合国家产业政策');
        L.push('发行时机选择（市场平稳期）');
        L.push('支持人员：张明（工号8012）— 方案设计、发行定价');
        L.push('');
        L.push('### 2. 可转债（推荐度：85%）');
        L.push('兼顾股债优势');
        L.push('');
        L.push('适用情形：票面利率低于普通公司债，转股后可优化资本结构');
        L.push('关键要素：');
        L.push('主体信用评级（建议AA及以上）');
        L.push('转股溢价率设定');
        L.push('赎回/回售条款设计');
        L.push('支持人员：王强（工号8034）— 条款设计、转股测算');
        L.push('');
        L.push('### 3. 公司债（推荐度：80%）');
        L.push('快速融资通道');
        L.push('');
        L.push('适用情形：发行周期短，资金用途灵活，可补充' + purpose + '配套流动资金');
        L.push('关键要素：');
        L.push('主体评级（一般需AA及以上）');
        L.push('偿债保障能力');
        L.push('发行窗口选择');
        L.push('支持人员：赵敏（工号8045）— 评级沟通、发行窗口');
        L.push('');
        L.push('### 💡 下一步建议');
        L.push('推荐优先级：定增 > 可转债 > 公司债');
        L.push('');
        L.push('理由：');
        L.push('');
        if (isListed) L.push('客户为上市公司，定增是股权融资最直接的方式');
        if (purpose === '扩产') L.push('扩产属于资本性支出，定增的募集资金用途匹配度最高');
        if (revenueStr) L.push('年营收' + revenueStr + '，高于同行业上市公司营收中位数12.6亿元');
        if (info.industry) L.push(info.industry + '行业内定增案例多，审核路径相对成熟');
        L.push('');
        L.push('可以继续问：');
        L.push('');
        L.push('>>> 定增业务怎么做？— 获取详细的操作指引');
        L.push('>>> 定增找谁支持？— 直接对接投行支持人员');
        L.push('>>> 定增需要准备什么材料？— 查看客户材料清单');
        return L.join('\n');
    }

    function ibGenerateHowTo(bizName) {
        const L = [];
        const biz = bizName || '定增';
        L.push('## ' + biz + '业务操作指引');
        L.push('');
        L.push('### 客户资质初筛（1-3天）');
        L.push('| 核查项 | 标准 | 备注 |');
        L.push('|--------|------|------|');
        L.push('| 上市状态 | 已在A股上市 | 主板/创业板/科创板均可 |');
        L.push('| 实控人持股 | 30%-60% | 低于30%需特别论证 |');
        L.push('| 最近三年利润 | 扣非净利润连续为正 | 亏损年度不超过1年 |');
        L.push('| 是否有立案调查 | 无 | 含实控人、董监高 |');
        L.push('| 信息披露合规 | 近三年无重大违规 | 含延迟披露、虚假陈述 |');
        L.push('');
        L.push('### 方案设计与内部立项（1-2周）');
        L.push('- **确定融资规模**：不超过总股本30%，结合项目资金缺口测算');
        L.push('- **确定融资用途**：项目建设为主（≥70%），补流≤30%');
        L.push('- **设定发行价格底线**：前20日均价×80%');
        L.push('- **确定认购对象策略**：控股股东参与 + 机构投资者');
        L.push('- **内部立项审批**：提报投行部门立项会，通过后启动尽调');
        L.push('');
        L.push('### 尽职调查（2-4周）');
        L.push('- **财务尽调**：近三年审计报告、利润质量、资产负债结构');
        L.push('- **法律尽调**：公司章程、股权结构、重大合同、诉讼情况');
        L.push('- **业务尽调**：募投项目可行性、行业分类、同业对比数据');
        L.push('- **合规尽调**：信披记录、监管函件、内控制度');
        L.push('');
        L.push('### 申报材料制作（2-3周）');
        L.push('- 募集说明书（含募投项目可行性研究报告）');
        L.push('- 董事会决议公告');
        L.push('- 发行方案公告');
        L.push('- 中介机构报告（保荐机构、律师事务所、会计师事务所）');
        L.push('');
        L.push('### 内部审核与股东大会（1个月）');
        L.push('- 召开董事会审议通过发行方案');
        L.push('- 股东大会投票通过（一般需2/3以上同意）');
        L.push('- 公告预案、问询回复');
        L.push('');
        L.push('### 交易所审核 + 证监会注册（2-3个月）');
        L.push('- 提交申请材料至交易所');
        L.push('- 回复交易所问询（通常1-3轮）');
        L.push('- 证监会注册程序（科创板/创业板注册制约20个工作日）');
        L.push('');
        L.push('### 发行定价与资金到账（1个月）');
        L.push('- 路演推介：向机构投资者介绍项目');
        L.push('- 簿记建档：收集报价，确定最终发行价格');
        L.push('- 资金划转：认购款到账，完成工商变更登记');
        L.push('');
        L.push('> ⏱ **全程参考周期：4-6个月**（自董事会决议至资金到账）');
        L.push('');
        L.push('> 💡 **关键节点提醒**：股东大会批准后有效期12个月，逾期需重新审议。');
        L.push('');
        L.push('---');
        L.push('👤 业务咨询：张明（工号8012）| zhangm@company.com');
        L.push('');
        L.push('>>> ' + biz + '需要准备什么材料？— 查看客户材料清单');
        L.push('>>> ' + biz + '的发行条件和准入标准是什么？');
        L.push('>>> 帮我设计一个' + biz + '方案');
        return L.join('\n');
    }

    function ibGenerateMaterials(bizName) {
        const L = [];
        const biz = bizName || '定增';
        L.push('## ' + biz + '客户材料清单');
        L.push('');
        L.push('> 📋 以下材料请在启动尽调前准备齐全，可分批提交。');
        L.push('');
        L.push('### 一、基础工商资料');
        L.push('| 材料名称 | 要求 | 备注 |');
        L.push('|----------|------|------|');
        L.push('| 营业执照副本 | 加盖公章，有效期内 | 含经营范围 |');
        L.push('| 公司章程（最新版） | 经股东大会通过版本 | 含历次修订 |');
        L.push('| 股东名册 | 截至上月末 | 含持股比例 |');
        L.push('| 实控人身份证明文件 | 原件扫描 | 个人或企业均需 |');
        L.push('');
        L.push('### 二、财务资料');
        L.push('| 材料名称 | 要求 | 备注 |');
        L.push('|----------|------|------|');
        L.push('| 近三年年度审计报告 | 会计师事务所出具，含审计意见 | 须为标准无保留意见 |');
        L.push('| 最近一期财务报表 | 距申报日不超过6个月 | 资产负债表+利润表+现金流量表 |');
        L.push('| 募投项目可行性研究报告 | 含投资测算、收益预测 | 是核心文件 |');
        L.push('| 现有债务明细 | 银行贷款、债券余额 | 含到期安排 |');
        L.push('');
        L.push('### 三、股权及合规资料');
        L.push('| 材料名称 | 要求 | 备注 |');
        L.push('|----------|------|------|');
        L.push('| 实控人股权质押情况说明 | 截至最近月末 | 质押比例须≤50% |');
        L.push('| 近三年监管函件/问询函回复 | 全部，含交易所及证监会 | 无则出具说明 |');
        L.push('| 重大诉讼仲裁情况说明 | 含标的金额 | 无则出具无诉讼声明 |');
        L.push('| 董监高简历及任职文件 | 含独立董事 | — |');
        L.push('');
        L.push('### 四、募投项目资料');
        L.push('| 材料名称 | 要求 | 备注 |');
        L.push('|----------|------|------|');
        L.push('| 项目立项批复 / 备案证明 | 发改委或行业主管部门 | 按项目类型要求 |');
        L.push('| 环评批复文件 | 适用时提供 | 制造业、能源类必须 |');
        L.push('| 土地使用权证 / 厂房协议 | 项目建设用地证明 | — |');
        L.push('| 项目建设合同（意向） | 主要施工合同或采购意向函 | — |');
        L.push('');
        L.push('### 五、信息披露资料');
        L.push('- 最近三年年度报告、半年报、季报全套');
        L.push('- 历次重大事项临时公告（含交易、关联交易）');
        L.push('- 股东大会、董事会会议纪要（近三年）');
        L.push('');
        L.push('> ⚠️ **注意事项**');
        L.push('> - 所有材料需加盖公司公章，PDF格式电子版 + 纸质版各一套');
        L.push('> - 财务报表须经注册会计师签字');
        L.push('> - 如有境外股东，需提供经公证的翻译件');
        L.push('');
        L.push('---');
        L.push('📬 材料收集协调：张明（工号8012）| zhangm@company.com');
        L.push('');
        L.push('>>> 帮我设计一个' + biz + '方案');
        L.push('>>> ' + biz + '的发行条件和准入标准是什么？');
        L.push('>>> ' + biz + '找谁支持？—— 直接对接投行支持人员');
        return L.join('\n');
    }

    function ibLocalReply(message) {
        const il = (message || '').toLowerCase();
        const bizName = ibExtractBusinessName(il);
        if (ibAnyKeyword(il, ['发行条件', '准入标准', '准入条件', '发行要求', '资质要求'])) {
            return ibGenerateAdmission(bizName || '定增');
        }
        if (ibAnyKeyword(il, ['设计', '帮我设计']) || (ibAnyKeyword(il, ['方案']) && !ibAnyKeyword(il, ['核验', '合规', '风险', '材料', '准备']))) {
            return ibGenerateDesign(bizName || '定增');
        }
        if (ibAnyKeyword(il, ['怎么做', '如何做', '操作步骤', '具体步骤', '操作指引', '怎么操作'])) {
            return ibGenerateHowTo(bizName || '定增');
        }
        if (ibAnyKeyword(il, ['材料', '文件清单', '准备什么', '需要什么', '资料清单'])) {
            return ibGenerateMaterials(bizName || '定增');
        }
        if (ibAnyKeyword(il, ['找谁', '联系', '对接', '谁负责', '支持'])) {
            const biz = bizName || '定增';
            return '**' + biz + '业务支持人员**\n\n- **张明**（工号8012）— 方案设计、发行定价\n- **王强**（工号8034）— 条款设计、转股测算\n- **赵敏**（工号8045）— 评级沟通、发行窗口\n\n可直接发邮件至 zhangm@company.com 发起支持申请。\n\n>>> 帮我设计一个' + biz + '方案\n>>> ' + biz + '的发行条件和准入标准是什么？';
        }
        return ibGenerateRecommend(message);
    }

    const COMPANY_DEMO_FULL = '陈明精工股份有限公司';
    const COMPANY_DEMO_SHORT = '陈明精工';
    const BUSINESS_HANDOFF_PROMPT = '业务分析助手分析该企业的投行业务机会';
    const BUSINESS_HANDOFF_SEND_MESSAGE = '我手头有陈明精工这家制造业上市公司，营收20亿，想融资扩产';
    const BUSINESS_ANALYSIS_ASSISTANT_INDEX = 1;
    const DESIGN_ASSISTANT_INDEX = 2;
    const SERVICE_ASSISTANT_INDEX = 4;

    function generateChenmingDesignReply(message) {
        const L = [];
        L.push('## ' + COMPANY_DEMO_SHORT + ' · 定增方案设计草案');
        L.push('');
        L.push('> 项目对象：**' + COMPANY_DEMO_FULL + '**（603882）| 先进制造/装备制造 | 年营收 **20亿元** | 合作意图：**融资扩产**（资本性支出缺口约 **3.2亿元**）');
        L.push('');
        L.push('### 一、发行基本要素');
        L.push('| 要素 | 方案建议 | 说明 |');
        L.push('|------|---------|------|');
        L.push('| 发行方式 | 向特定对象非公开发行 | 发行对象不超过35名 |');
        L.push('| 发行规模 | **3.00亿元** | 净资产20%与3亿元孰低 |');
        L.push('| 发行价格 | 不低于前20日均价×80% | 定价基准日为发行期首日 |');
        L.push('| 锁定期 | 6个月 | 自发行结束日起 |');
        L.push('| 募资用途 | 扩产70% + 补流30% | 智能产线扩产项目已备案 |');
        L.push('');
        L.push('### 二、募集资金用途结构');
        L.push('- **智能产线扩产项目**：2.24亿元（70%），符合先进制造产业政策方向');
        L.push('- **补充流动资金**：0.96亿元（30%），保障扩产期间营运周转');
        L.push('- **认购安排**：控股股东参与 + 2–3家产业协同/财务投资人');
        L.push('');
        L.push('### 三、发行时间安排（标准周期4–6个月）');
        L.push('| 阶段 | 时间 | 主要工作 |');
        L.push('|------|------|---------|');
        L.push('| 方案论证 | 1–2周 | 定规模、用途、定价策略 |');
        L.push('| 尽职调查 | 2–4周 | 财务、法律、业务尽调 |');
        L.push('| 董事会/股东大会 | T+1月 | 审议通过发行方案 |');
        L.push('| 申报审核 | 2–3月 | 交易所审核、证监会注册 |');
        L.push('| 发行阶段 | 1月 | 路演、簿记建档、定价 |');
        L.push('');
        L.push('### 四、材料缺口与下一步');
        L.push('- 待补充：近3期审计报告、募投项目备案文件、股东名册');
        L.push('- 核对结论：核心要素已核对 **6/8** 项');
        L.push('- 执行建议：发起内部立项评审，同步客户材料清单，预约发行窗口沟通');
        L.push('');
        L.push('### 📄 可下载文档');
        L.push('- **[' + COMPANY_DEMO_SHORT + '-定增方案草案.pdf](/docs/' + COMPANY_DEMO_SHORT + '-定增方案草案.pdf)** — PDF');
        L.push('- **[定增方案Word模板](/templates/定增方案设计模板.docx)** — 可编辑');
        L.push('- **[募集资金可研报告模板](/templates/募集资金可行性研究报告.docx)** — 框架示例');
        L.push('');
        L.push('> 👤 方案支持：张明（工号8012）| zhangm@company.com');
        L.push('');
        L.push('---');
        L.push('>>> ' + COMPANY_DEMO_SHORT + '的发行条件和准入标准是什么？');
        L.push('>>> ' + COMPANY_DEMO_SHORT + '定增需要准备什么材料？');
        L.push('>>> 帮我核验这个定增方案，看看有没有合规问题');
        return L.join('\n');
    }

    function generateChenmingBuyerReply(message) {
        const L = [];
        L.push('## ' + COMPANY_DEMO_SHORT + ' · 买方分析结果');
        L.push('');
        L.push('> 分析对象：**' + COMPANY_DEMO_FULL + '** | 先进制造/装备制造 | 年营收20亿元 | 融资扩产配套');
        L.push('');
        L.push('### 匹配维度');
        L.push('- 产业协同：装备升级、产线扩产上下游整合意愿');
        L.push('- 区域布局：长三角产业基金与制造业并购活跃度');
        L.push('- 投资偏好：历史定增/并购案例、审批周期、资金实力');
        L.push('');
        L.push('### 买方候选（优先级排序）');
        L.push('1. **华创产业资本** — 先进制造赛道布局，近期参与2单装备类定增');
        L.push('2. **精机控股** — 产业链协同强，可与扩产项目形成供应协同');
        L.push('3. **东方装备基金** — 财务投资人，认购节奏快、尽调效率高');
        L.push('');
        L.push('### 首轮接触建议');
        L.push('- 先签署保密协议，提供扩产项目摘要与财务亮点一页纸');
        L.push('- 由张明（工号8012）牵头组织买方路演，目标2周内完成首轮反馈');
        L.push('');
        L.push('### 待确认事项');
        L.push('- 估值区间（建议参考18–22倍PE）');
        L.push('- 交易时间表与认购比例意向');
        L.push('- 保密协议签署与尽调资料清单');
        return L.join('\n');
    }

    function generateChenmingServiceFollowUpReply(message) {
        const L = [];
        L.push('## ' + COMPANY_DEMO_SHORT + ' · 客户服务跟进清单');
        L.push('');
        L.push('> 服务对象：**' + COMPANY_DEMO_FULL + '**（603882）| 合作意图：融资扩产 | 最近沟通：2026-06-10 融资方案沟通');
        L.push('');
        L.push('### 待跟进事项');
        L.push('1. **方案沟通纪要确认** — 6月10日融资方案沟通纪要待客户签字确认（负责人：张明）');
        L.push('2. **配套材料催办** — 近3期审计报告、股东名册（T+3个工作日）');
        L.push('3. **买方对接** — 路演名单与NDA待签署（买方分析模型输出待复核）');
        L.push('4. **信披预检** — 定增启动前需准备《前次募集资金使用情况》');
        L.push('5. **内部评审排期** — 投行部立项会 T+2 确认');
        L.push('');
        L.push('### 下一步建议');
        L.push('- 并行推进材料补齐与买方首轮触达');
        L.push('- 6月内发行窗口研判，预沟通董事会审议安排');
        return L.join('\n');
    }

    function generateChenmingDisclosureReply(message) {
        const L = [];
        L.push('## ' + COMPANY_DEMO_SHORT + ' · 信披合规判断');
        L.push('');
        L.push('### 判断要点');
        L.push('- 定增启动披露：董事会决议、发行方案摘要、前次募集资金使用情况');
        L.push('- 募投项目进展：扩产项目备案与环评披露口径');
        L.push('- 关联交易：认购对象关联关系识别与回避表决');
        L.push('- 业绩预告：是否触发业绩预告或快报披露标准');
        L.push('');
        L.push('### 输出结论');
        L.push('拟启动定增需按顺序准备：**董事会决议公告** → **股东大会通知** → **发行方案披露**；同步更新募投项目进展说明。');
        L.push('');
        L.push('### 待补充');
        L.push('- 扩产项目投资进度量化说明');
        L.push('- 事项影响范围与对经营的量化描述');
        return L.join('\n');
    }

    function generateChenmingAnnouncementReply(message) {
        const L = [];
        L.push('## ' + COMPANY_DEMO_SHORT + ' · 临时公告草案框架');
        L.push('');
        L.push('### 公告要素');
        L.push('- 证券代码：603882');
        L.push('- 公告类型：融资筹划事项提示性公告（框架）');
        L.push('- 触发事项：筹划非公开发行股票事项');
        L.push('');
        L.push('### 草案结构');
        L.push('1. 筹划事项说明（智能产线扩产融资）');
        L.push('2. 对经营影响的不确定性提示');
        L.push('3. 后续安排（尽调、内部决策、监管申报）');
        L.push('');
        L.push('### 待补充');
        L.push('- 董事会决议日期、财务数据核对表、法务复核意见');
        return L.join('\n');
    }

    function getDesignAssistantReply(message) {
        const il = (message || '').toLowerCase();
        const bizName = ibExtractBusinessName(il) || '定增';
        if (ibAnyKeyword(il, ['发行条件', '准入标准', '准入条件', '发行要求', '资质要求'])) {
            return ibGenerateAdmission(bizName);
        }
        if (ibAnyKeyword(il, ['怎么做', '如何做', '操作步骤', '具体步骤', '操作指引', '怎么操作'])) {
            return ibGenerateHowTo(bizName);
        }
        if (ibAnyKeyword(il, ['材料', '文件清单', '准备什么', '需要什么', '资料清单'])) {
            return ibGenerateMaterials(bizName);
        }
        if (ibAnyKeyword(il, ['找谁', '联系', '对接', '谁负责', '支持'])) {
            return '**' + bizName + '业务支持人员**\n\n- **张明**（工号8012）— 方案设计、发行定价\n- **王强**（工号8034）— 条款设计、转股测算\n- **赵敏**（工号8045）— 评级沟通、发行窗口\n\n>>> 为' + COMPANY_DEMO_SHORT + '生成一套融资扩产方案草案';
        }
        return generateChenmingDesignReply(message);
    }

    function getServiceAssistantReply(message) {
        const text = (message || '').trim();
        if (/待跟进|梳理|服务事项|跟进事项/.test(text)) {
            return generateChenmingServiceFollowUpReply(message);
        }
        if (/信披|披露|合规/.test(text)) {
            return generateChenmingDisclosureReply(message);
        }
        if (/公告|业绩预告|临时公告/.test(text)) {
            return generateChenmingAnnouncementReply(message);
        }
        if (/买方|投资人|匹配/.test(text)) {
            return generateChenmingBuyerReply(message);
        }
        return generateChenmingBuyerReply(message);
    }

    function buildChenmingDesignContextBundle() {
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        return {
            models: ibResolveContextModels('定增', 'design', { limit: 4 }),
            outputs: [
                {
                    title: COMPANY_DEMO_SHORT + '-定增方案草案',
                    type: 'PDF',
                    fileKind: 'pdf',
                    fileName: COMPANY_DEMO_SHORT + '-定增方案草案.pdf',
                    modifiedAt: ts,
                    content: '陈明精工定增方案草案，含发行规模、募资用途与认购安排。',
                    downloadText: '陈明精工定增方案草案，含发行规模、募资用途与认购安排。'
                },
                {
                    title: COMPANY_DEMO_SHORT + '-方案设计执行清单',
                    type: 'Word',
                    fileKind: 'word',
                    fileName: COMPANY_DEMO_SHORT + '-方案设计执行清单.docx',
                    modifiedAt: ts,
                    content: '材料补齐、内部立项、认购沟通、发行窗口研判。',
                    downloadText: '材料补齐、内部立项、认购沟通、发行窗口研判。'
                }
            ],
            customers: [{
                name: COMPANY_DEMO_FULL,
                type: '上市公司',
                source: '方案生成助手会话'
            }]
        };
    }

    function buildChenmingServiceContextBundle(kind) {
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        const isFollowUp = kind === 'followup';
        return {
            models: [{
                name: isFollowUp ? '客户服务事项梳理' : '买方分析模型',
                category: '客户服务 / ' + COMPANY_DEMO_SHORT
            }],
            outputs: isFollowUp ? [{
                title: COMPANY_DEMO_SHORT + '-客户服务跟进清单',
                type: 'Word',
                fileKind: 'word',
                fileName: COMPANY_DEMO_SHORT + '-客户服务跟进清单.docx',
                modifiedAt: ts,
                content: '材料催办、买方对接、信披预检、窗口期沟通等待跟进事项。',
                downloadText: '材料催办、买方对接、信披预检、窗口期沟通等待跟进事项。'
            }] : [{
                title: COMPANY_DEMO_SHORT + '-买方匹配简版',
                type: 'PDF',
                fileKind: 'pdf',
                fileName: COMPANY_DEMO_SHORT + '-买方匹配简版.pdf',
                modifiedAt: ts,
                content: '买方候选3家及首轮接触建议。',
                downloadText: '买方候选3家及首轮接触建议。'
            }],
            customers: [{
                name: COMPANY_DEMO_FULL,
                type: '上市公司',
                source: '客户服务助手会话'
            }]
        };
    }

    /** 用户输入已包含企业名称，无需再追问确认 */
    function isExplicitCompanyAnalysisRequest(message) {
        const text = (message || '').trim();
        if (!text) return false;
        return /陈明精工/.test(text);
    }

    /** 识别企业分析意图：含陈明精工，或泛化「分析客户/公司」类表述（demo 默认落到陈明精工） */
    function isCompanyAnalysisRequest(message) {
        const text = (message || '').trim();
        if (!text) return false;
        if (/通知公告|正式发文/.test(text)) return false;
        if (/待审批|审批进度/.test(text)) return false;
        if (/陈明精工/.test(text) && (/(分析|画像|评估|看看|了解)/.test(text) || /(客户|公司|企业)/.test(text))) {
            return true;
        }
        if (/(分析|画像|评估|看看|了解)/.test(text) && /(客户|公司|企业|这位|这个|该)/.test(text)) {
            return true;
        }
        if (/分析.*(客户|公司|企业)|(客户|公司|企业).*分析/.test(text)) {
            return true;
        }
        return false;
    }

    function buildCompanyIntentConfirmPrefix(message) {
        const text = (message || '').trim();
        if (/陈明精工/.test(text)) {
            return '**你要分析的是不是陈明精工股份有限公司这家公司？**\n\n';
        }
        return '**根据你的描述，推测你要分析的企业是陈明精工股份有限公司，对吗？**\n\n';
    }

    function isBusinessHandoffPrompt(promptText) {
        const text = (promptText || '').trim();
        if (!text) return false;
        if (text === BUSINESS_HANDOFF_PROMPT) return true;
        if (text.includes('业务分析助手') && /投行业务|业务机会/.test(text)) return true;
        if (text.includes(BUSINESS_HANDOFF_SEND_MESSAGE) && /业务分析|投行业务/.test(text)) return true;
        if (text.includes('帮我设计一个') || (text.includes('设计') && text.includes('方案'))) return true;
        if (text.includes('发行条件') || text.includes('准入标准') || text.includes('准入条件')) return true;
        return false;
    }

    function generateCompanyCustomerAnalysis(options = {}) {
        const intentConfirm = options.intentConfirm === true;
        const L = [];
        if (intentConfirm) {
            L.push(buildCompanyIntentConfirmPrefix(options.message).trimEnd());
            L.push('');
        }
        L.push('## 企业「' + COMPANY_DEMO_SHORT + '」多维量化分析');
        L.push('');
        L.push('> 已综合资产、行为、交易、合作记录等维度完成分析，核心量化结论如下：');
        L.push('');
        L.push('### 一、企业基础维度');
        L.push('| 维度 | 分析结果 |');
        L.push('|------|----------|');
        L.push('| 企业名称 | ' + COMPANY_DEMO_FULL + '（证券代码：603882） |');
        L.push('| 企业性质 | **A股制造业上市公司** |');
        L.push('| 年营收规模 | **20.00亿元**（2025年报） |');
        L.push('| 行业分类 | 先进制造 / 装备制造（证监会行业代码待补录） |');
        L.push('| 合作意图 | **融资扩产**（募投项目已备案，资本性支出缺口约3.2亿元） |');
        L.push('');
        L.push('### 二、资产维度');
        L.push('| 指标 | 数值/结论 | 说明 |');
        L.push('|------|-----------|------|');
        L.push('| 托管资产规模 | 8,880万元 | 近3月变动 +15% |');
        L.push('| 持仓结构 | 权益类62% / 固收类28% / 现金类10% | 风险测评等级 C4；权益类占比超C3建议上限（40%）22个百分点 |');
        L.push('| 资产稳定性 | 近12月净流出0笔 | 单笔流出≥100万元：0笔，合计流出0万元 |');
        L.push('');
        L.push('### 三、行为与交易维度');
        L.push('| 指标 | 数值/结论 |');
        L.push('|------|-----------|');
        L.push('| 近12个月交易笔数 | 186笔 |');
        L.push('| 近12个月成交金额 | 2.3亿元 |');
        L.push('| 近12月月均交易笔数 | 15.5笔（同业均值9.2笔，+68%） |');
        L.push('| 已询/持仓投行类产品 | 定增配套询价2次、可转债沟通1次、公司债沟通3次（均有CRM记录） |');
        L.push('');
        L.push('### 四、合作记录');
        L.push('- 合作年限：**5年**（首单落地：2021-03-15）');
        L.push('- 历史业务：债券承销2单（合计8.6亿元）、财务顾问1单、研究服务合同1份');
        L.push('- 近一年互动：高层拜访3次、融资方案沟通2次（最近：2026-06-10）');
        L.push('- 客户分级：营业部A类清单客户（清单编号 IB-A-028）');
        L.push('');
        L.push('### 五、风险与合规');
        L.push('| 项目 | 结论 |');
        L.push('|------|------|');
        L.push('| 风险测评等级 | C4 |');
        L.push('| 适当性匹配 | 符合投行股权类产品推介条件（C4≥R3） |');
        L.push('| 舆情与合规 | 近三年监管处罚记录：0条 |');
        L.push('');
        L.push('### 六、综合结论');
        L.push('**' + COMPANY_DEMO_FULL + '** 为**A股制造业上市公司**，年营收**20.00亿元**，当前合作意图为**融资扩产**（募投项目已备案，资本性支出缺口约**3.2亿元**）。托管资产**8,880万元**、合作年限**5年**、近12月成交**2.3亿元**，具备推进**定增、可转债、公司债**三类投行业务的准入数据基础。');
        L.push('');
        L.push('---');
        L.push('💡 **下一步建议**：交由业务分析助手，基于上述企业分析结果匹配投行业务机会。');
        L.push('');
        L.push('>>> ' + BUSINESS_HANDOFF_PROMPT);
        return L.join('\n');
    }

    function buildCompanyContextBundle() {
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        return {
            models: [{
                name: '客户多维分析模型',
                category: '客户分析 / 多维量化'
            }],
            customers: [{
                name: COMPANY_DEMO_FULL,
                type: '上市公司',
                source: '客户分析助手会话卡片',
                time: ts,
                dimensions: [
                    {
                        section: '企业基础维度',
                        items: [
                            { label: '企业名称', value: COMPANY_DEMO_FULL + '（证券代码：603882）' },
                            { label: '企业性质', value: 'A股制造业上市公司' },
                            { label: '年营收规模', value: '20.00亿元（2025年报）' },
                            { label: '行业分类', value: '先进制造 / 装备制造' },
                            { label: '合作意图', value: '融资扩产（资本性支出缺口约3.2亿元）' }
                        ]
                    },
                    {
                        section: '资产维度',
                        items: [
                            { label: '托管资产规模', value: '8,880万元（近3月 +15%）' },
                            { label: '持仓结构', value: '权益类62% / 固收类28% / 现金类10%' },
                            { label: '风险测评等级', value: 'C4' }
                        ]
                    },
                    {
                        section: '行为与交易',
                        items: [
                            { label: '近12个月交易笔数', value: '186笔' },
                            { label: '近12个月成交金额', value: '2.3亿元' },
                            { label: '合作年限', value: '5年' }
                        ]
                    }
                ]
            }],
            outputs: [{
                title: '陈明精工企业多维分析报告',
                type: 'PDF',
                fileKind: 'pdf',
                fileName: '陈明精工-企业多维分析报告.pdf',
                modifiedAt: ts,
                content: '基于资产、行为、交易、合作记录等维度形成的企业量化分析摘要。',
                downloadText: '基于资产、行为、交易、合作记录等维度形成的企业量化分析摘要。'
            }]
        };
    }

    function buildDesignContextBundle(bizName) {
        const biz = bizName || '定增';
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        return {
            models: ibResolveContextModels(biz, 'design', { limit: 4 }),
            outputs: [
                {
                    title: biz + '方案设计手册（完整版）',
                    type: 'PDF',
                    fileKind: 'pdf',
                    fileName: '定向增发方案设计手册.pdf',
                    modifiedAt: ts,
                    content: '方案设计手册演示版，含发行要素、时间安排与认购对象说明。',
                    downloadText: '方案设计手册演示版，含发行要素、时间安排与认购对象说明。'
                },
                {
                    title: biz + '方案Word模板',
                    type: 'Word',
                    fileKind: 'word',
                    fileName: biz + '方案设计模板.docx',
                    modifiedAt: ts,
                    content: '可编辑方案模板，用于快速起草项目方案。',
                    downloadText: '可编辑方案模板，用于快速起草项目方案。'
                },
                {
                    title: '募集资金可研报告模板',
                    type: 'Word',
                    fileKind: 'word',
                    fileName: '募集资金可行性研究报告.docx',
                    modifiedAt: ts,
                    content: '募投项目可研报告框架示例。',
                    downloadText: '募投项目可研报告框架示例。'
                }
            ],
            customers: []
        };
    }

    function buildAdmissionContextBundle(bizName) {
        const biz = bizName || '定增';
        return {
            models: ibResolveContextModels(biz, 'analysis', { section: '基本标准', limit: 4 }),
            outputs: [],
            customers: []
        };
    }

    function buildHowToContextBundle(bizName) {
        const biz = bizName || '定增';
        return {
            models: ibResolveContextModels(biz, 'analysis', { section: '公司标准', limit: 4 }),
            outputs: [],
            customers: []
        };
    }

    function buildMaterialsContextBundle(bizName) {
        const biz = bizName || '定增';
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        return {
            models: ibResolveContextModels(biz, 'analysis', { limit: 4 }),
            outputs: [{
                title: biz + '客户材料清单',
                type: 'Word',
                fileKind: 'word',
                fileName: biz + '客户材料清单.docx',
                modifiedAt: ts,
                content: '含基础工商、财务、股权合规、募投项目等材料清单。',
                downloadText: '含基础工商、财务、股权合规、募投项目等材料清单。'
            }],
            customers: []
        };
    }

    function buildRecommendContextBundle() {
        return {
            models: ibResolveContextModels('定增', 'analysis', { limit: 3 }),
            outputs: [],
            customers: [{
                name: COMPANY_DEMO_FULL,
                type: '上市公司',
                source: '业务推荐结果卡片'
            }]
        };
    }

    function resolveContextBundle(replyText, assistantIndex, userMessage) {
        const text = String(replyText || '');
        if (!text.trim()) return null;

        if (/企业「陈明精工」多维量化分析/.test(text)) {
            return buildCompanyContextBundle();
        }
        if (/方案设计模板/.test(text) || /可下载文档/.test(text)) {
            const biz = (text.match(/^#\s*(.+?)方案设计模板/m) || [])[1]
                || ibExtractBusinessName(text.toLowerCase())
                || '定增';
            return buildDesignContextBundle(biz);
        }
        if (/发行条件与准入标准/.test(text)) {
            const biz = (text.match(/^##\s*(.+?)发行条件与准入标准/m) || [])[1] || '定增';
            return buildAdmissionContextBundle(biz);
        }
        if (/业务操作指引/.test(text)) {
            const biz = (text.match(/^##\s*(.+?)业务操作指引/m) || [])[1] || '定增';
            return buildHowToContextBundle(biz);
        }
        if (/客户材料清单/.test(text)) {
            const biz = (text.match(/^##\s*(.+?)客户材料清单/m) || [])[1] || '定增';
            return buildMaterialsContextBundle(biz);
        }
        if (/业务推荐结果/.test(text)) {
            return buildRecommendContextBundle();
        }
        if (/陈明精工 · 定增方案设计草案/.test(text) || (assistantIndex === DESIGN_ASSISTANT_INDEX && /定增方案设计草案/.test(text))) {
            return buildChenmingDesignContextBundle();
        }
        if (assistantIndex === SERVICE_ASSISTANT_INDEX && /待跟进事项|买方候选|信披合规判断|临时公告草案/.test(text)) {
            const kind = /待跟进事项/.test(text) ? 'followup' : 'buyer';
            return buildChenmingServiceContextBundle(kind);
        }

        if (assistantIndex === 0 && userMessage && isCompanyAnalysisRequest(userMessage)) {
            if (/^\*\*待办事项助手\*\*|^\*\*通知公告助手\*\*/.test(text.trim())) {
                return null;
            }
            return buildCompanyContextBundle();
        }

        return null;
    }

    function getCustomerAnalysisReply(message) {
        if (isCompanyAnalysisRequest(message)) {
            const intentConfirm = !isExplicitCompanyAnalysisRequest(message);
            return generateCompanyCustomerAnalysis({ intentConfirm, message });
        }
        return '**客户分析助手**\n\n请输入「帮我分析陈明精工这家公司」，我将从资产、行为、交易、合作记录等维度为你量化分析。';
    }

    function getReply(message, assistantIndex) {
        if (assistantIndex === 0) {
            return getCustomerAnalysisReply(message);
        }
        if (assistantIndex === BUSINESS_ANALYSIS_ASSISTANT_INDEX) {
            return ibLocalReply(message);
        }
        if (assistantIndex === DESIGN_ASSISTANT_INDEX) {
            return getDesignAssistantReply(message);
        }
        if (assistantIndex === SERVICE_ASSISTANT_INDEX) {
            return getServiceAssistantReply(message);
        }
        return ibLocalReply(message);
    }

    function resolvePromptHandoff(promptText) {
        if (!isBusinessHandoffPrompt(promptText)) return null;
        const text = (promptText || '').trim();
        const isDesignRequest = text.includes('帮我设计一个') || (text.includes('设计') && text.includes('方案'));
        const targetIndex = isDesignRequest ? DESIGN_ASSISTANT_INDEX : BUSINESS_ANALYSIS_ASSISTANT_INDEX;
        return {
            handoff: true,
            targetAssistantIndex: targetIndex,
            sendMessage: promptText,
            displayMessage: promptText
        };
    }

    window.EmployeeCustomerIbFlow = {
        getReply,
        resolveContextBundle,
        resolveContextModels: ibResolveContextModels,
        resolvePromptHandoff,
        usesGuidedFlow(assistantIndex) {
            return assistantIndex === 0
                || assistantIndex === BUSINESS_ANALYSIS_ASSISTANT_INDEX
                || assistantIndex === DESIGN_ASSISTANT_INDEX
                || assistantIndex === SERVICE_ASSISTANT_INDEX;
        },
        DESIGN_ASSISTANT_INDEX,
        SERVICE_ASSISTANT_INDEX,
        isCompanyAnalysisRequest,
        isExplicitCompanyAnalysisRequest,
        // 兼容旧引用
        isChenmingAnalysisRequest: isCompanyAnalysisRequest,
        isExplicitChenmingAnalysisRequest: isExplicitCompanyAnalysisRequest,
        BUSINESS_HANDOFF_PROMPT,
        BUSINESS_ANALYSIS_ASSISTANT_INDEX
    };
})();
