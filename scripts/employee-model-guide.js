/**
 * 员工工作台 - 投行业务模型引导对话
 * 依赖 window.IB_MODEL_KNOWLEDGE（由 scripts/extract-ib-models.js 从根目录投行业务模型清单文件-v5.2.html 生成）
 */
(function () {
    const KNOWLEDGE = () => window.IB_MODEL_KNOWLEDGE;
    const CATALOG_URL = '投行业务模型清单文件-v5.2.html';

    const PROMPT_SUGGESTIONS = {
        0: [
            '帮我分析陈明这个客户',
            '分析客户张某：资产888万、近3月变动15%、持仓结构',
            '对比客户合作记录与近12个月交易行为'
        ],
        1: [
            '分析定增项目是否符合基本标准',
            '识别IPO项目股东与实控人结构',
            '比对破产重整公司准入条件'
        ],
        2: [
            '设计定增发行方案核心要素',
            '编制IPO发行方案要点清单',
            '梳理破产重整偿债与转股方案'
        ],
        3: [
            '交叉验证定增项目财务数据一致性',
            '复核IPO招股书关键假设',
            '比对并购标的治理结构与公开披露'
        ],
        4: [
            '生成买方客户分析报告框架',
            '判断上市公司信披合规要点',
            '起草临时公告（业绩预告）'
        ]
    };

    const CUSTOMER_ANALYSIS_MODELS = [
        { bizName: '客户分析', model: '客户多维分析模型', desc: '资产、行为、交易、合作记录' },
        { bizName: '客户资产分析', model: '客户资产变动分析模型', desc: '资产规模、变动率、持仓结构' },
        { bizName: '客户行为分析', model: '客户交易行为分析模型', desc: '成交笔数、金额、换手率' },
        { bizName: '客户风险分析', model: '客户风险测评模型', desc: '风险等级、持仓风险占比' },
        { bizName: '客户分层', model: '客户分层模型', desc: '分层结论、跟进优先级' }
    ];

    function getKnowledge() {
        return KNOWLEDGE() || { businesses: [], serviceModels: [], assistantConfig: [], keywords: {}, businessKeywords: {} };
    }

    function getAssistantColumn(index) {
        const cfg = getKnowledge().assistantConfig?.find((item) => item.index === index);
        return cfg?.column || 'analysis';
    }

    function getAssistantModelLabel(index) {
        const cfg = getKnowledge().assistantConfig?.find((item) => item.index === index);
        return cfg?.label || '业务模型';
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(text) {
        return escapeHtml(text).replace(/'/g, '&#39;');
    }

    function getEmployeeGuideState(panel) {
        const state = window.getPanelState?.(panel);
        if (!state) return null;
        if (!state.employeeModelGuide) {
            state.employeeModelGuide = {
                step: 'business',
                bizKey: null,
                categoryIndex: null,
                pendingUserMessage: '',
                lastPayload: null,
                lastResultRowId: null,
                regenerateCount: 0
            };
        }
        return state.employeeModelGuide;
    }

    function resetEmployeeGuideState(panel, assistantIndex) {
        const guide = getEmployeeGuideState(panel);
        if (!guide) return;
        guide.step = 'business';
        guide.bizKey = null;
        guide.categoryIndex = null;
        guide.assistantIndex = assistantIndex;
    }

    function findBusinessByKey(key) {
        return getKnowledge().businesses.find((biz) => biz.key === key);
    }

    function matchAssistantFromMessage(message) {
        const text = message.trim();
        const { keywords } = getKnowledge();
        let bestIndex = null;
        let bestScore = 0;

        Object.entries(keywords || {}).forEach(([index, words]) => {
            let score = 0;
            words.forEach((word) => {
                if (text.includes(word)) score += word.length;
            });
            if (score > bestScore) {
                bestScore = score;
                bestIndex = Number(index);
            }
        });

        return bestScore > 0 ? bestIndex : null;
    }

    function matchBusinessFromMessage(message) {
        const text = message.trim();
        const { businesses, businessKeywords } = getKnowledge();
        let best = null;
        let bestScore = 0;

        businesses.forEach((biz) => {
            const words = businessKeywords?.[biz.name] || [biz.name];
            words.forEach((word) => {
                if (text.includes(word) && word.length >= bestScore) {
                    bestScore = word.length;
                    best = biz;
                }
            });
        });

        return best;
    }

    function getCategoriesForAssistant(biz, assistantIndex) {
        const column = getAssistantColumn(assistantIndex);
        if (column === 'service') return [];
        return biz?.columns?.[column] || [];
    }

    function getServiceModels() {
        return getKnowledge().serviceModels || [];
    }

    function formatCategoryLabel(item) {
        return item.subSection ? `${item.section} / ${item.subSection}` : item.section;
    }

    function matchServiceIntent(message) {
        const text = message.trim();
        const serviceModels = getServiceModels();
        let serviceIndex = null;
        let sectionIndex = null;
        let model = null;

        serviceModels.forEach((service, sIdx) => {
            const nameHit = text.includes(service.name) || text.includes(service.name.replace('模型', ''));
            if (!nameHit) return;
            serviceIndex = sIdx;
            (service.sections || []).forEach((section, secIdx) => {
                if (text.includes(section.section)) sectionIndex = secIdx;
                (section.models || []).forEach((m) => {
                    if (text.includes(m)) {
                        model = m;
                        sectionIndex = secIdx;
                    }
                });
            });
        });

        if (serviceIndex == null) return null;
        const service = serviceModels[serviceIndex];
        return {
            bizName: service?.name,
            category: sectionIndex != null ? service.sections[sectionIndex]?.section : null,
            model,
            serviceIndex,
            sectionIndex,
            partial: !model
        };
    }

    function buildDirectResultPayload(assistantIndex, message) {
        const text = message.trim();
        if (assistantIndex === 0) {
            return {
                bizName: '客户分析',
                category: null,
                model: '客户多维分析模型'
            };
        }

        const serviceModels = getServiceModels();
        let matched = null;

        serviceModels.forEach((service) => {
            const shortName = service.name.replace('模型', '');
            if (text.includes(service.name) || text.includes(shortName)) {
                matched = service;
            }
        });

        if (!matched && (text.includes('买方') || text.includes('投资人'))) {
            matched = serviceModels.find((s) => s.name.includes('买方'));
        }
        if (!matched && (text.includes('信披') || text.includes('披露') || text.includes('合规'))) {
            matched = serviceModels.find((s) => s.name.includes('信披'));
        }
        if (!matched && (text.includes('公告') || text.includes('业绩预告') || text.includes('临时公告'))) {
            matched = serviceModels.find((s) => s.name.includes('公告'));
        }
        if (!matched) {
            matched = serviceModels[0];
        }

        return {
            bizName: '客户服务',
            category: matched?.tagline || null,
            model: matched?.name || '客户服务处理模型'
        };
    }

    function usesDirectResult(assistantIndex) {
        const column = getAssistantColumn(assistantIndex);
        return column === 'customer' || column === 'service';
    }

    function matchIntentFromMessage(message, assistantIndex) {
        const text = message.trim();
        const column = getAssistantColumn(assistantIndex);

        if (column === 'service') {
            return matchServiceIntent(text);
        }

        const biz = matchBusinessFromMessage(text);
        if (!biz) return null;

        const categories = getCategoriesForAssistant(biz, assistantIndex);
        let categoryIndex = null;
        let model = null;

        categories.forEach((cat, idx) => {
            (cat.models || []).forEach((m) => {
                if (text.includes(m)) {
                    model = m;
                    categoryIndex = idx;
                }
            });
            if (categoryIndex == null && (text.includes(cat.section) || text.includes(formatCategoryLabel(cat)))) {
                categoryIndex = idx;
            }
        });

        if (categoryIndex == null && categories.length === 1) {
            categoryIndex = 0;
            if (!model && categories[0].models?.length === 1) {
                model = categories[0].models[0];
            }
        }

        return {
            bizKey: biz.key,
            bizName: biz.name,
            categoryIndex,
            category: categoryIndex != null ? formatCategoryLabel(categories[categoryIndex]) : null,
            model,
            partial: model == null
        };
    }

    function findBusinessByName(name) {
        if (!name) return null;
        return getKnowledge().businesses.find((biz) => biz.name === name) || null;
    }

    function formatContextModelCategory(assistantIndex, payload) {
        const biz = findBusinessByName(payload.bizName);
        const bizLabel = biz?.category ? `${payload.bizName}（${biz.category}）` : (payload.bizName || '业务');
        const columnLabel = getAssistantModelLabel(assistantIndex);
        return payload.category
            ? `${bizLabel} · ${columnLabel} / ${payload.category}`
            : `${bizLabel} · ${columnLabel}`;
    }

    function pickResolvedModelName(biz, assistantIndex, preferredModel, preferredCategoryIndex) {
        if (preferredModel) return preferredModel;
        const categories = getCategoriesForAssistant(biz, assistantIndex);
        const column = getAssistantColumn(assistantIndex);
        const rawIndex = typeof preferredCategoryIndex === 'number' ? preferredCategoryIndex : 0;
        const safeIndex = categories.length
            ? Math.min(Math.max(rawIndex, 0), categories.length - 1)
            : 0;
        const category = categories[safeIndex];
        if (category?.models?.[0]) return category.models[0];
        const fromCatalog = window.EmployeeCustomerIbFlow?.resolveContextModels?.(biz?.name || '定增', column, { limit: 1 });
        return fromCatalog?.[0]?.name || category?.section || biz?.name || column;
    }

    function resolveAnalysisPayloadFromIntent(assistantIndex, intent) {
        const { businesses } = getKnowledge();
        const column = getAssistantColumn(assistantIndex);

        const resolveFromBusiness = (biz, preferredCategoryIndex, preferredModel) => {
            if (!biz) return null;
            const categories = getCategoriesForAssistant(biz, assistantIndex);
            const rawIndex = typeof preferredCategoryIndex === 'number' ? preferredCategoryIndex : 0;
            const safeIndex = categories.length
                ? Math.min(Math.max(rawIndex, 0), categories.length - 1)
                : 0;
            const category = categories[safeIndex];
            const model = pickResolvedModelName(biz, assistantIndex, preferredModel, safeIndex);
            return {
                bizName: biz.name,
                category: category ? formatCategoryLabel(category) : null,
                model
            };
        };

        if (intent?.bizKey) {
            const biz = findBusinessByKey(intent.bizKey);
            const payload = resolveFromBusiness(biz, intent.categoryIndex, intent.model);
            if (payload) return payload;
        }

        const fallbackBiz = businesses.find((biz) => {
            if (column === 'service') return false;
            return getCategoriesForAssistant(biz, assistantIndex).length > 0;
        }) || businesses[0];

        return resolveFromBusiness(fallbackBiz, intent?.categoryIndex ?? 0, intent?.model) || {
            bizName: fallbackBiz?.name || '定增',
            category: null,
            model: pickResolvedModelName(fallbackBiz, assistantIndex, intent?.model, 0)
        };
    }

    function buildPromptChipsHtml(assistantIndex) {
        const prompts = PROMPT_SUGGESTIONS[assistantIndex] || [];
        if (!prompts.length) return '';
        return `
            <div class="employee-prompt-chips">
                ${prompts.map((prompt) => `
                    <button type="button" class="employee-prompt-chip" onclick="EmployeeModelGuide.sendPromptChip('${escapeAttr(prompt)}')">${escapeHtml(prompt)}</button>
                `).join('')}
            </div>
        `;
    }

    function buildGuideCardHeader(assistantIndex, subtitle) {
        const modelLabel = getAssistantModelLabel(assistantIndex);
        return `
            <div class="ib-guide-card">
                <div class="ib-guide-subtitle">${escapeHtml(subtitle || `请选择${modelLabel}对应的业务与模型`)}</div>
        `;
    }

    function openOptionRow(mode) {
        const modifier = mode ? ` ib-guide-option-row--${mode}` : '';
        return `<div class="ib-guide-option-row${modifier}">`;
    }

    function closeOptionRow() {
        return '</div>';
    }

    function buildBusinessPickerHtml(assistantIndex) {
        const { businesses } = getKnowledge();
        const column = getAssistantColumn(assistantIndex);
        const groups = ['股权类', '债权类', '并购类'];
        let body = buildGuideCardHeader(assistantIndex, column === 'service'
            ? '选择客户服务模型'
            : `选择业务类型，按${getAssistantModelLabel(assistantIndex)}继续`);

        if (column === 'service') {
            body += openOptionRow();
            getServiceModels().forEach((model, index) => {
                body += `
                    <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickServiceModel(${assistantIndex}, ${index})">
                        <strong>${escapeHtml(model.name)}</strong>
                        <span>${escapeHtml(model.tagline)}</span>
                    </button>
                `;
            });
            body += closeOptionRow();
        } else {
            groups.forEach((group) => {
                const items = businesses.filter((biz) => biz.category === group);
                if (!items.length) return;
                body += `<div class="ib-guide-group-label">${escapeHtml(group)}</div>`;
                body += openOptionRow();
                items.forEach((biz) => {
                    body += `
                        <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickBusiness(${assistantIndex}, '${escapeAttr(biz.key)}')">
                            <strong>${escapeHtml(biz.name)}</strong>
                            <span>${escapeHtml(biz.key)}</span>
                        </button>
                    `;
                });
                body += closeOptionRow();
            });
        }

        body += `</div>`;
        return body;
    }

    function buildCategoryPickerHtml(assistantIndex, bizKey) {
        const biz = findBusinessByKey(bizKey);
        const categories = getCategoriesForAssistant(biz, assistantIndex);
        let body = buildGuideCardHeader(assistantIndex, `业务：${biz?.name || ''}。选择模型大类`);

        if (!categories.length) {
            body += `<div class="ib-guide-subtitle">当前助手下无可选模型大类，请重新选择业务。</div>`;
        } else {
            body += openOptionRow('auto');
            categories.forEach((item, index) => {
                body += `
                    <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickCategory(${assistantIndex}, '${escapeAttr(bizKey)}', ${index})">
                        <strong>${escapeHtml(formatCategoryLabel(item))}</strong>
                        <span>${escapeHtml(item.models.slice(0, 2).join('、'))}${item.models.length > 2 ? '…' : ''}</span>
                    </button>
                `;
            });
            body += closeOptionRow();
        }

        body += `
                <div class="ib-guide-actions">
                    <button type="button" class="solution-btn-cancel" onclick="EmployeeModelGuide.backToBusiness(${assistantIndex})">重新选择业务</button>
                </div>
            </div>
        `;
        return body;
    }

    function buildModelPickerHtml(assistantIndex, bizKey, categoryIndex) {
        const biz = findBusinessByKey(bizKey);
        const categories = getCategoriesForAssistant(biz, assistantIndex);
        const category = categories[categoryIndex];
        let body = buildGuideCardHeader(assistantIndex, `${biz?.name || ''} / ${formatCategoryLabel(category || {})}。选择具体模型`);

        body += openOptionRow('auto');
        (category?.models || []).forEach((model, index) => {
            body += `
                <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickModel(${assistantIndex}, '${escapeAttr(bizKey)}', ${categoryIndex}, ${index})">
                    <strong>${escapeHtml(model)}</strong>
                    <span>点击确认使用该模型</span>
                </button>
            `;
        });
        body += closeOptionRow();

        body += `
                <div class="ib-guide-actions">
                    <button type="button" class="solution-btn-cancel" onclick="EmployeeModelGuide.backToCategory(${assistantIndex}, '${escapeAttr(bizKey)}')">返回大类</button>
                </div>
            </div>
        `;
        return body;
    }

    function buildServiceSectionPickerHtml(assistantIndex, serviceIndex) {
        const service = getServiceModels()[serviceIndex];
        let body = buildGuideCardHeader(assistantIndex, `已选择「${service?.name || ''}」，请选择模型大类`);
        body += openOptionRow('auto');
        (service?.sections || []).forEach((section, index) => {
            body += `
                <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickServiceSection(${assistantIndex}, ${serviceIndex}, ${index})">
                    <strong>${escapeHtml(section.section)}</strong>
                    <span>${escapeHtml(section.models.slice(0, 2).join('、'))}</span>
                </button>
            `;
        });
        body += closeOptionRow();
        body += `
                <div class="ib-guide-actions">
                    <button type="button" class="solution-btn-cancel" onclick="EmployeeModelGuide.backToBusiness(${assistantIndex})">重新选择模型</button>
                </div>
            </div>
        `;
        return body;
    }

    function buildServiceModelPickerHtml(assistantIndex, serviceIndex, sectionIndex) {
        const service = getServiceModels()[serviceIndex];
        const section = service?.sections?.[sectionIndex];
        let body = buildGuideCardHeader(assistantIndex, `「${service?.name || ''} / ${section?.section || ''}」请选择具体模型`);
        body += openOptionRow('auto');
        (section?.models || []).forEach((model, index) => {
            body += `
                <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickServiceModelItem(${assistantIndex}, ${serviceIndex}, ${sectionIndex}, ${index})">
                    <strong>${escapeHtml(model)}</strong>
                    <span>点击确认使用该模型</span>
                </button>
            `;
        });
        body += closeOptionRow();
        body += `
                <div class="ib-guide-actions">
                    <button type="button" class="solution-btn-cancel" onclick="EmployeeModelGuide.backToServiceModel(${assistantIndex}, ${serviceIndex})">返回大类</button>
                </div>
            </div>
        `;
        return body;
    }

    function buildCustomerModelPickerHtml(assistantIndex) {
        let body = buildGuideCardHeader(assistantIndex, '选择客户分析能力与模型');
        body += openOptionRow('auto');
        CUSTOMER_ANALYSIS_MODELS.forEach((item, index) => {
            body += `
                <button type="button" class="ib-guide-option" onclick="EmployeeModelGuide.pickCustomerModel(${assistantIndex}, ${index})">
                    <strong>${escapeHtml(item.model)}</strong>
                    <span>${escapeHtml(item.bizName)} · ${escapeHtml(item.desc)}</span>
                </button>
            `;
        });
        body += closeOptionRow();
        body += `</div>`;
        return body;
    }

    function buildManualPickerHtml(assistantIndex) {
        const column = getAssistantColumn(assistantIndex);
        if (column === 'customer') {
            return buildCustomerModelPickerHtml(assistantIndex);
        }
        return buildBusinessPickerHtml(assistantIndex);
    }

    function generateMockResultBody(assistantIndex, payload, userMessage, variant) {
        const modelLabel = getAssistantModelLabel(assistantIndex);
        const v = variant || 0;
        if (assistantIndex === 0) {
            const assetDelta = v % 2 === 0 ? '15%' : '12%';
            const tradeCount = 23 + v * 3;
            const monthlyAmount = 42 - v * 2;
            const coopCount = 2 + (v % 2);
            const riskLevel = v % 2 === 0 ? 'C3（平衡型）' : 'C3（平衡型，复核待确认）';
            const tier = v % 2 === 0 ? 'A2' : 'A2-';
            return `
                <ul class="ib-guide-result-list">
                    <li>分析对象：${escapeHtml(userMessage)}</li>
                    <li>资产规模：账户总资产约 888 万元，较上季度变动约 ${assetDelta}</li>
                    <li>交易行为：近12个月主动交易 ${tradeCount} 笔，月均成交金额约 ${monthlyAmount} 万元</li>
                    <li>合作记录：存续合作项目 ${coopCount} 项，最近一笔合作签署日 2025-11-08</li>
                    <li>风险测评：${riskLevel}，持仓 R3 产品占比 62%</li>
                    <li>分层结论：${tier} 类客户，流动性安排中等、跟进优先级较高</li>
                    <li>待跟进动作：①核验近3月单笔银证转入≥100万元来源 ②安排季度复盘邀约 ③同步 R4 产品适配说明</li>
                    <li>版本：${v + 1}</li>
                </ul>
            `;
        }
        if (assistantIndex === 4) {
            const modelName = payload.model || '';
            let detailLines;
            if (modelName.includes('买方')) {
                detailLines = v % 2 === 0
                    ? ['匹配维度：产业协同、财务投资意愿、历史并购案例', '输出：买方候选 3 家（优先级排序）+ 首轮接触建议', '待确认：标的估值区间、交易时间表']
                    : ['匹配维度：区域集中度、资金实力、审批周期', '输出：买方候选 4 家（更新匹配分）+ 二次触达话术', '待确认：保密协议签署、尽调资料清单'];
            } else if (modelName.includes('信披')) {
                detailLines = v % 2 === 0
                    ? ['判断要点：重大事项标准、披露时限、公告格式', '输出：是否触发披露义务 + 建议公告类型', '待补充：事项金额、影响范围、董事会决议日期']
                    : ['判断要点：关联交易识别、回避表决、披露口径', '输出：披露义务结论（更新）+ 合规风险提示 2 条', '待补充：交易对手关联关系证明'];
            } else {
                detailLines = v % 2 === 0
                    ? ['公告要素：债券代码、余额、到期日、主体评级', '输出：临时公告草案（业绩预告框架）', '待补充：触发事项说明、对经营影响量化描述']
                    : ['公告要素：触发事项、披露时点、后续安排', '输出：临时公告草案（修订版）+ 信披流程节点', '待补充：财务数据核对表、法务复核意见'];
            }
            return `
                <ul class="ib-guide-result-list">
                    <li>任务：${escapeHtml(userMessage)}</li>
                    <li>处理模块：${escapeHtml(modelName)}</li>
                    <li>${escapeHtml(detailLines[0])}</li>
                    <li>${escapeHtml(detailLines[1])}</li>
                    <li>${escapeHtml(detailLines[2])}</li>
                    <li>版本：${v + 1}</li>
                </ul>
            `;
        }
        const checklistItems = [
            '核心要素已核对 6/8 项',
            '待补充材料 2 项（近3期财报、股东名册）',
            '下一步：发起内部评审并同步客户材料清单'
        ];
        const altItems = [
            '核心要素已核对 7/8 项（更新口径后）',
            '待补充材料 1 项（关联交易说明）',
            '下一步：安排交叉验证并锁定执行时间表'
        ];
        const items = v % 2 === 0 ? checklistItems : altItems;
        return `
            <ul class="ib-guide-result-list">
                <li>输入：${escapeHtml(userMessage)}</li>
                <li>调用：${escapeHtml(modelLabel)} · ${escapeHtml(payload.model || '')}</li>
                <li>核对结论：${escapeHtml(items[0])}</li>
                <li>材料缺口：${escapeHtml(items[1])}</li>
                <li>执行建议：${escapeHtml(items[2])}</li>
                <li>版本：${v + 1}</li>
            </ul>
        `;
    }

    function buildFeedbackActionsHtml(assistantIndex) {
        const reselectBtn = `
                    <button type="button" class="ib-guide-feedback-btn" onclick="EmployeeModelGuide.showManualPicker()">重新选择业务/模型</button>`;
        return `
            <div class="ib-guide-feedback">
                <span class="ib-guide-feedback-label">结果是否符合预期？</span>
                <div class="ib-guide-feedback-actions">
                    ${reselectBtn}
                    <button type="button" class="ib-guide-feedback-btn ib-guide-feedback-btn--primary" onclick="EmployeeModelGuide.regenerate()">重新生成</button>
                </div>
            </div>
        `;
    }

    function buildResultCardHtml(assistantIndex, payload, userMessage, variant) {
        const assistant = window.getEmployeeAssistant?.(assistantIndex);
        const modelLabel = getAssistantModelLabel(assistantIndex);
        const direct = usesDirectResult(assistantIndex);
        return `
            <div class="ib-guide-result-card">
                <div class="ib-guide-result-title">${escapeHtml(assistant?.name || '助手')} · 处理结果</div>
                <div class="ib-guide-result-meta">
                    <div class="ib-guide-result-row"><span>业务</span><strong>${escapeHtml(payload.bizName || '—')}</strong></div>
                    ${direct ? '' : `<div class="ib-guide-result-row"><span>模型列</span><strong>${escapeHtml(modelLabel)}</strong></div>`}
                    ${payload.category ? `<div class="ib-guide-result-row"><span>大类</span><strong>${escapeHtml(payload.category)}</strong></div>` : ''}
                    <div class="ib-guide-result-row"><span>${direct ? '能力' : '模型'}</span><strong>${escapeHtml(payload.model || '客户多维分析')}</strong></div>
                </div>
                <div class="ib-guide-result-body">${generateMockResultBody(assistantIndex, payload, userMessage, variant)}</div>
                ${buildFeedbackActionsHtml(assistantIndex)}
            </div>
        `;
    }

    function appendGuideMessage(html, panel, blockId) {
        const p = panel || window.getActiveWorkbenchPanel?.();
        const messagesEl = window.getPanelEl?.('ai-chat-messages', p);
        if (!messagesEl) return null;

        const rowId = blockId || `guide-row-${Date.now()}`;
        const index = window.getPanelState?.(p).currentCardIndex ?? 0;
        const row = document.createElement('div');
        row.className = 'chat-row chat-row-assistant';
        row.id = rowId;
        row.innerHTML = `
            ${window.buildEmployeeChatAvatarHtml?.(index) || ''}
            <div class="chat-bubble chat-bubble-assistant">${html}</div>
        `;

        const lastBlock = messagesEl.querySelector('.chat-conversation-block:last-of-type');
        (lastBlock || messagesEl).appendChild(row);
        scrollGuideRowIntoView(p, row);
        return rowId;
    }

    function getGuideScrollAnchor(row) {
        return row?.querySelector('.chat-bubble-assistant') || row;
    }

    function scrollGuideRowIntoView(panel, row) {
        if (!row) return;
        if (typeof window.scrollLastChatCardIntoView === 'function') {
            window.scrollLastChatCardIntoView(panel, { card: row, padding: 8 });
            return;
        }
        scrollElementToTopInChat(panel, getGuideScrollAnchor(row), 8);
    }

    function getChatScrollEl(panel) {
        return window.getWorkbenchChatScrollEl?.(panel) || window.getPanelEl?.('ai-chat-view', panel);
    }

    function scrollElementToTopInChat(panel, element, padding = 8) {
        const scrollEl = getChatScrollEl(panel);
        if (!scrollEl || !element) return;

        const align = () => {
            const containerRect = scrollEl.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            scrollEl.scrollTop += elementRect.top - containerRect.top - padding;
        };

        align();
        requestAnimationFrame(() => {
            align();
            requestAnimationFrame(align);
        });
    }

    function replaceGuideInBlock(blockId, html) {
        const row = document.getElementById(blockId);
        const bubble = row?.querySelector('.chat-bubble-assistant');
        if (bubble) bubble.innerHTML = html;
    }

    function ensureBlockId(panel) {
        const guide = getEmployeeGuideState(panel);
        if (!guide) return `guide-${Date.now()}`;
        if (!guide.lastResultRowId) {
            guide.lastResultRowId = `guide-${Date.now()}`;
        }
        return guide.lastResultRowId;
    }

    function getGuideBlockId(panel) {
        return getEmployeeGuideState(panel)?.lastResultRowId || null;
    }

    function scrollGuideBlockIntoView(panel) {
        const blockId = getGuideBlockId(panel);
        if (!blockId) return;
        const row = document.getElementById(blockId);
        scrollGuideRowIntoView(panel, row);
    }

    function updateGuideBlock(panel, html) {
        const blockId = getGuideBlockId(panel);
        if (!blockId) return false;
        replaceGuideInBlock(blockId, html);
        scrollGuideBlockIntoView(panel);
        return true;
    }

    function setGuideContent(panel, html) {
        const blockId = ensureBlockId(panel);
        if (document.getElementById(blockId)) {
            replaceGuideInBlock(blockId, html);
        } else {
            appendGuideMessage(html, panel, blockId);
        }
        scrollGuideBlockIntoView(panel);
        return blockId;
    }

    function getDemoCustomersByAssistant(assistantIndex, userMessage) {
        const pools = {
            0: [
                {
                    name: '客户张某（账户资产888万）',
                    type: '个人客户',
                    dimensions: [
                        {
                            section: '基础信息',
                            items: [
                                { label: '客户类型', value: '个人客户' },
                                { label: '客户编号', value: 'P202406180012' },
                                { label: '开户日期', value: '2022-08-09' },
                                { label: '风险测评等级', value: 'C3（稳健型）' },
                                { label: '服务经理', value: '王经理（工号 E1026）' }
                            ]
                        },
                        {
                            section: '资产概况',
                            items: [
                                { label: '账户资产', value: '888.00 万元' },
                                { label: '近3月资产变动', value: '+15.2%' },
                                { label: '近12月资产峰值', value: '912.40 万元' },
                                { label: '近12月资产谷值', value: '756.30 万元' }
                            ]
                        },
                        {
                            section: '持仓结构',
                            items: [
                                { label: '股票', value: '52.0%（461.76 万元）' },
                                { label: '债券', value: '28.0%（248.64 万元）' },
                                { label: '现金及等价物', value: '20.0%（177.60 万元）' }
                            ]
                        },
                        {
                            section: '交易记录',
                            items: [
                                { label: '近12月成交笔数', value: '126 笔' },
                                { label: '近12月成交金额', value: '3,420.00 万元' },
                                { label: '近12月换手率', value: '38.5%' },
                                { label: '最近一笔交易', value: '2026-06-20 买入 50.00 万元' }
                            ]
                        },
                        {
                            section: '跟进事项',
                            items: [
                                { label: '最近沟通时间', value: '2026-06-18 14:30' },
                                { label: '沟通方式', value: '电话' },
                                { label: '沟通时长', value: '32 分钟' },
                                { label: '待补充资料', value: '2 项（近3期财报、股东名册）' },
                                { label: '下次回访截止', value: '2026-06-25' }
                            ]
                        }
                    ]
                },
                {
                    name: '客户吴九（转入资金待确认）',
                    type: '个人客户',
                    dimensions: [
                        {
                            section: '基础信息',
                            items: [
                                { label: '客户类型', value: '个人客户' },
                                { label: '客户编号', value: 'P202503220087' },
                                { label: '开户日期', value: '2023-11-02' },
                                { label: '风险测评等级', value: 'C4' }
                            ]
                        },
                        {
                            section: '资金待确认',
                            items: [
                                { label: '待确认金额', value: '120.00 万元' },
                                { label: '待确认笔数', value: '2 笔' },
                                { label: '发起时间', value: '2026-06-23 09:15' },
                                { label: '预计到账', value: '2026-06-24 16:00' }
                            ]
                        },
                        {
                            section: '账户现状',
                            items: [
                                { label: '当前账户资产', value: '356.80 万元' },
                                { label: '近3月资产变动', value: '+6.8%' },
                                { label: '冻结资金', value: '120.00 万元' }
                            ]
                        }
                    ]
                }
            ],
            1: [
                {
                    name: '测试科技有限公司',
                    type: '企业客户',
                    dimensions: [
                        {
                            section: '企业概况',
                            items: [
                                { label: '统一社会信用代码', value: '91310000MA1FL2X38K' },
                                { label: '注册资本', value: '5,000.00 万元' },
                                { label: '成立日期', value: '2018-05-16' },
                                { label: '员工人数', value: '380 人' }
                            ]
                        },
                        {
                            section: '经营数据（2025年度）',
                            items: [
                                { label: '营业收入', value: '2.30 亿元' },
                                { label: '净利润', value: '3,200.00 万元' },
                                { label: '资产负债率', value: '42.6%' },
                                { label: '研发投入占比', value: '12.4%' }
                            ]
                        },
                        {
                            section: '合作账户',
                            items: [
                                { label: '托管资产规模', value: '1.85 亿元' },
                                { label: '在途项目数', value: '3 个' },
                                { label: '授信额度', value: '8,000.00 万元' },
                                { label: '已用授信', value: '3,200.00 万元（40.0%）' }
                            ]
                        }
                    ]
                },
                {
                    name: '演示项目SPV公司',
                    type: '企业客户',
                    dimensions: [
                        {
                            section: '项目主体',
                            items: [
                                { label: '项目编号', value: 'SPV-2026-0042' },
                                { label: '注册资本', value: '1,000.00 万元' },
                                { label: '成立日期', value: '2026-01-10' },
                                { label: '项目阶段', value: '立项评审（第2轮）' }
                            ]
                        },
                        {
                            section: '融资结构',
                            items: [
                                { label: '拟募集规模', value: '3.50 亿元' },
                                { label: '已认购金额', value: '1.20 亿元（34.3%）' },
                                { label: '优先级占比', value: '70.0%' },
                                { label: '劣后级占比', value: '30.0%' }
                            ]
                        }
                    ]
                }
            ],
            2: [
                {
                    name: '示例资本管理有限公司',
                    type: '机构客户',
                    dimensions: [
                        {
                            section: '机构概况',
                            items: [
                                { label: '管理规模（AUM）', value: '128.60 亿元' },
                                { label: '在管产品数', value: '24 只' },
                                { label: '成立日期', value: '2015-07-22' },
                                { label: '备案编号', value: 'P1063287' }
                            ]
                        },
                        {
                            section: '业绩指标（近12月）',
                            items: [
                                { label: '组合收益率', value: '+9.8%' },
                                { label: '最大回撤', value: '-4.2%' },
                                { label: '夏普比率', value: '1.36' },
                                { label: '年化波动率', value: '11.5%' }
                            ]
                        }
                    ]
                },
                {
                    name: '星云并购基金',
                    type: '机构客户',
                    dimensions: [
                        {
                            section: '基金概况',
                            items: [
                                { label: '基金规模', value: '15.00 亿元' },
                                { label: '已投项目数', value: '6 个' },
                                { label: '剩余可投金额', value: '4.20 亿元' },
                                { label: '基金到期日', value: '2028-12-31' }
                            ]
                        },
                        {
                            section: '在投项目（TOP3）',
                            items: [
                                { label: '项目A', value: '投资 2.50 亿元 / 持股 18.0%' },
                                { label: '项目B', value: '投资 1.80 亿元 / 持股 22.5%' },
                                { label: '项目C', value: '投资 1.20 亿元 / 持股 15.0%' }
                            ]
                        }
                    ]
                }
            ],
            3: [
                {
                    name: '中联数据科技股份有限公司',
                    type: '企业客户',
                    dimensions: [
                        {
                            section: '上市信息',
                            items: [
                                { label: '股票代码', value: '688XXX.SH' },
                                { label: '总市值', value: '186.40 亿元' },
                                { label: '流通市值', value: '92.30 亿元' },
                                { label: '市盈率（TTM）', value: '38.6 倍' }
                            ]
                        },
                        {
                            section: '财务指标（2025年报）',
                            items: [
                                { label: '营业收入', value: '28.60 亿元（同比 +22.4%）' },
                                { label: '归母净利润', value: '4.12 亿元（同比 +18.7%）' },
                                { label: '毛利率', value: '56.3%' },
                                { label: '研发费用率', value: '15.8%' }
                            ]
                        }
                    ]
                },
                {
                    name: '润泽科技控股有限公司',
                    type: '企业客户',
                    dimensions: [
                        {
                            section: '股权结构',
                            items: [
                                { label: '控股股东持股', value: '41.2%' },
                                { label: '机构投资者持股', value: '32.6%' },
                                { label: '流通股占比', value: '26.2%' }
                            ]
                        },
                        {
                            section: '合规事项',
                            items: [
                                { label: '关联交易披露', value: '3 笔 / 合计 1,280.00 万元' },
                                { label: '待回复问询', value: '1 项（截止 2026-06-28）' },
                                { label: '信披评级', value: 'A 级（连续 3 年）' }
                            ]
                        }
                    ]
                }
            ],
            4: [
                {
                    name: '某省城投集团',
                    type: '机构客户',
                    dimensions: [
                        {
                            section: '主体评级',
                            items: [
                                { label: '主体信用评级', value: 'AAA' },
                                { label: '评级机构', value: '中诚信国际' },
                                { label: '评级日期', value: '2026-03-15' },
                                { label: '展望', value: '稳定' }
                            ]
                        },
                        {
                            section: '债务概况',
                            items: [
                                { label: '有息负债总额', value: '428.60 亿元' },
                                { label: '一年内到期', value: '86.20 亿元（20.1%）' },
                                { label: '综合融资成本', value: '4.35%' },
                                { label: '现金短债比', value: '1.28 倍' }
                            ]
                        }
                    ]
                },
                {
                    name: '客户李四（私募签约）',
                    type: '个人客户',
                    dimensions: [
                        {
                            section: '签约信息',
                            items: [
                                { label: '签约产品', value: '星云稳健1号私募证券投资基金' },
                                { label: '签约金额', value: '500.00 万元' },
                                { label: '签约日期', value: '2026-06-10' },
                                { label: '产品封闭期', value: '12 个月' }
                            ]
                        },
                        {
                            section: '账户表现',
                            items: [
                                { label: '当前净值', value: '1.0326' },
                                { label: '成立以来收益率', value: '+3.26%' },
                                { label: '持仓份额', value: '484,200.00 份' }
                            ]
                        }
                    ]
                }
            ]
        };
        const candidates = pools[assistantIndex] || pools[0];
        const count = userMessage.length % 2 === 0 ? 2 : 1;
        return candidates.slice(0, count).map((item) => ({
            ...item,
            source: '模型识别结果卡片',
            time: new Date().toLocaleString('zh-CN', { hour12: false })
        }));
    }

    function getDemoOutputsByAssistant(assistantIndex, payload, userMessage) {
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        const base = `任务：${userMessage}\n业务：${payload.bizName || '—'}\n模型：${payload.model || '—'}\n生成时间：${ts}\n`;
        return [
            {
                title: `${payload.bizName || '业务'}分析报告`,
                type: 'PDF',
                fileKind: 'pdf',
                fileName: `${(payload.bizName || '业务').replace(/\s+/g, '')}-分析报告.pdf`,
                sizeBytes: 1_820_000 + assistantIndex * 120_000,
                modifiedAt: ts,
                content: `${base}\n【报告摘要】\n- 关键结论与风险提示\n- 数据口径与假设说明\n- 跟进动作清单`,
                downloadText: `${base}\n（演示版PDF文本内容）`
            },
            {
                title: `${payload.model || '模型'}执行清单`,
                type: 'Word',
                fileKind: 'word',
                fileName: `${(payload.model || '模型').replace(/\s+/g, '')}-执行清单.docx`,
                sizeBytes: 620_000 + assistantIndex * 80_000,
                modifiedAt: ts,
                content: `${base}\n【执行清单】\n1. 客户核验\n2. 资料补齐\n3. 内部评审\n4. 跟进回访`,
                downloadText: `${base}\n（演示版Word文本内容）`
            },
            {
                title: `${payload.bizName || '业务'}汇报简版`,
                type: 'PPT',
                fileKind: 'ppt',
                fileName: `${(payload.bizName || '业务').replace(/\s+/g, '')}-汇报简版.pptx`,
                sizeBytes: 2_450_000 + assistantIndex * 150_000,
                modifiedAt: ts,
                content: `${base}\n【PPT结构】\n- 页1：项目背景\n- 页2：核心结论\n- 页3：风险与建议\n- 页4：推进计划`,
                downloadText: `${base}\n（演示版PPT文本内容）`
            }
        ].slice(0, 3);
    }

    function buildContextBundleFromPayload(assistantIndex, payload, userMessage) {
        const column = getAssistantColumn(assistantIndex);
        const hasCatalogModel = payload.model
            && !String(payload.model).includes('识别结果')
            && payload.model !== '模型识别结果'
            && payload.model !== '客户服务处理模型';

        let models = [];
        if (hasCatalogModel) {
            models = [{
                name: payload.model,
                category: formatContextModelCategory(assistantIndex, payload)
            }];
        } else if (column === 'customer') {
            models = CUSTOMER_ANALYSIS_MODELS.slice(0, 3).map((item) => ({
                name: item.model,
                category: `${item.bizName} / ${item.desc}`
            }));
        } else if (column === 'service') {
            const service = getServiceModels().find((item) => item.name === payload.model) || getServiceModels()[0];
            models = [{
                name: service?.sections?.[0]?.models?.[0] || payload.model || service?.name || '产业投资人匹配',
                category: `${service?.name || payload.bizName || '客户服务'} / ${payload.category || service?.sections?.[0]?.section || '买方筛选'}`
            }];
        } else {
            models = window.EmployeeCustomerIbFlow?.resolveContextModels?.(
                payload.bizName || '定增',
                column,
                { limit: 4 }
            ) || [];
        }

        return {
            models,
            outputs: getDemoOutputsByAssistant(assistantIndex, payload, userMessage),
            customers: getDemoCustomersByAssistant(assistantIndex, userMessage)
        };
    }

    function deliverResult(panel, assistantIndex, payload, userMessage, options) {
        window.collapseTopSections?.(panel);
        const guide = getEmployeeGuideState(panel);
        guide.lastPayload = { ...payload };
        guide.pendingUserMessage = userMessage;
        if (!options?.keepRegenerateCount) {
            guide.regenerateCount = 0;
        }
        const variant = guide.regenerateCount || 0;
        const html = buildResultCardHtml(assistantIndex, payload, userMessage, variant);
        const blockId = setGuideContent(panel, html);
        guide.step = 'result';
        if (!options?.skipContextSync) {
            const row = document.getElementById(blockId);
            const bubble = row?.querySelector('.chat-bubble-assistant');
            const bundle = buildContextBundleFromPayload(assistantIndex, payload, userMessage);
            window.ContextPanel?.attachSnapshotToBubble?.(bubble, bundle);
        }
    }

    function buildPickerHtmlForIntent(panel, assistantIndex, intent) {
        ensureBlockId(panel);
        const guide = getEmployeeGuideState(panel);

        if (getAssistantColumn(assistantIndex) === 'service') {
            if (intent?.serviceIndex != null && intent.sectionIndex == null) {
                return buildServiceSectionPickerHtml(assistantIndex, intent.serviceIndex);
            }
            if (intent?.serviceIndex != null && intent.sectionIndex != null && !intent.model) {
                return buildServiceModelPickerHtml(assistantIndex, intent.serviceIndex, intent.sectionIndex);
            }
            return buildBusinessPickerHtml(assistantIndex);
        }

        if (intent?.bizKey && intent.categoryIndex != null && !intent.model) {
            guide.bizKey = intent.bizKey;
            guide.step = 'model';
            return buildModelPickerHtml(assistantIndex, intent.bizKey, intent.categoryIndex);
        }

        if (intent?.bizKey) {
            guide.bizKey = intent.bizKey;
            guide.step = 'category';
            return buildCategoryPickerHtml(assistantIndex, intent.bizKey);
        }

        return buildBusinessPickerHtml(assistantIndex);
    }

    function showPickerForIntent(panel, assistantIndex, intent) {
        setGuideContent(panel, buildPickerHtmlForIntent(panel, assistantIndex, intent));
    }

    function processUserMessage(message, panel, assistantIndex) {
        if (window.EmployeeCustomerIbFlow?.usesGuidedFlow?.(assistantIndex)) {
            window.collapseTopSections?.(panel);
            setTimeout(() => {
                const reply = window.EmployeeCustomerIbFlow.getReply(message, assistantIndex);
                window.appendChatMessage?.(reply, 'assistant', panel, { assistantIndex, userMessage: message });
            }, 400);
            return;
        }

        const guide = getEmployeeGuideState(panel);
        guide.pendingUserMessage = message;
        guide.lastResultRowId = null;
        guide.lastPayload = null;
        guide.regenerateCount = 0;

        if (usesDirectResult(assistantIndex)) {
            deliverResult(panel, assistantIndex, buildDirectResultPayload(assistantIndex, message), message);
            return;
        }

        const intent = matchIntentFromMessage(message, assistantIndex);
        const payload = resolveAnalysisPayloadFromIntent(assistantIndex, intent);
        deliverResult(panel, assistantIndex, payload, message);
    }

    function usesIbModelGuide(assistantIndex) {
        const column = getAssistantColumn(assistantIndex);
        return column === 'analysis' || column === 'design' || column === 'validation';
    }

    function getGuideWelcomeText(assistantIndex) {
        const tagline = getKnowledge().assistantConfig?.find((item) => item.index === assistantIndex)?.tagline || '';
        const lines = {
            0: `**客户分析助手**\n\n从资产、行为、交易、合作记录等维度量化分析客户价值与风险。\n\n输入示例：帮我分析陈明这个客户`,
            1: `**业务分析助手**\n\n基于业务分析模型（${tagline}）自动识别意图并直接生成结果卡片。`,
            2: `**方案生成助手**\n\n基于方案设计模型（${tagline}）自动识别意图并直接生成结果卡片。`,
            3: `**交叉验证助手**\n\n基于交叉验证模型（${tagline}）自动识别意图并直接生成结果卡片。`,
            4: `**客户服务助手**\n\n处理买方分析、信披判断、临时公告生成等任务。点选提示词或输入事项，直接生成处理结果。`
        };
        const assistant = window.getEmployeeAssistant?.(assistantIndex);
        return lines[assistantIndex] || `**${assistant?.name || '助手'}**\n\n说明当前能力与操作入口。`;
    }

    function buildWelcomeHtml(blockId, assistantIndex) {
        const welcome = window.markdownToHtml?.(getGuideWelcomeText(assistantIndex)) || '';
        return `${welcome}${buildPromptChipsHtml(assistantIndex)}`;
    }

    function openCatalog(bizKey) {
        const url = bizKey ? `${CATALOG_URL}#detail-view` : `${CATALOG_URL}#list-view`;
        window.open(url, '_blank');
    }

    function finalizeSelection(panel, assistantIndex, payload) {
        const guide = getEmployeeGuideState(panel);
        const userMessage = guide.pendingUserMessage || '';
        deliverResult(panel, assistantIndex, payload, userMessage);
        resetEmployeeGuideState(panel, assistantIndex);
    }

    const EmployeeModelGuide = {
        getWelcomeHtml: buildWelcomeHtml,
        usesIbModelGuide,
        usesDirectResult,
        reset: resetEmployeeGuideState,
        matchAssistantFromMessage,
        matchBusinessFromMessage,
        openCatalog,

        sendPromptChip(text) {
            const panel = window.getActiveWorkbenchPanel?.();
            window.collapseTopSections?.(panel);
            window.appendChatMessage?.(text, 'user', panel);
            const state = window.getPanelState?.(panel);
            const assistantIndex = state?.currentCardIndex ?? 0;
            processUserMessage(text, panel, assistantIndex);
        },

        showManualPicker() {
            const panel = window.getActiveWorkbenchPanel?.();
            const state = window.getPanelState?.(panel);
            const currentIndex = state?.currentCardIndex ?? 0;
            resetEmployeeGuideState(panel, currentIndex);
            if (!getGuideBlockId(panel)) {
                ensureBlockId(panel);
            }
            setGuideContent(panel, buildManualPickerHtml(currentIndex));
        },

        regenerate() {
            const panel = window.getActiveWorkbenchPanel?.();
            const state = window.getPanelState?.(panel);
            const assistantIndex = state?.currentCardIndex ?? 0;
            const guide = getEmployeeGuideState(panel);
            if (!guide?.lastPayload || !guide.lastResultRowId) return;
            guide.regenerateCount = (guide.regenerateCount || 0) + 1;
            const html = buildResultCardHtml(
                assistantIndex,
                guide.lastPayload,
                guide.pendingUserMessage || '',
                guide.regenerateCount
            );
            updateGuideBlock(panel, html);
        },

        pickBusiness(assistantIndex, bizKey) {
            const panel = window.getActiveWorkbenchPanel?.();
            const guide = getEmployeeGuideState(panel);
            if (!guide) return;
            guide.step = 'category';
            guide.bizKey = bizKey;
            guide.assistantIndex = assistantIndex;
            updateGuideBlock(panel, buildCategoryPickerHtml(assistantIndex, bizKey));
        },

        pickCategory(assistantIndex, bizKey, categoryIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            const guide = getEmployeeGuideState(panel);
            if (!guide) return;
            guide.step = 'model';
            guide.bizKey = bizKey;
            guide.categoryIndex = categoryIndex;
            updateGuideBlock(panel, buildModelPickerHtml(assistantIndex, bizKey, categoryIndex));
        },

        pickModel(assistantIndex, bizKey, categoryIndex, modelIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            const biz = findBusinessByKey(bizKey);
            const category = getCategoriesForAssistant(biz, assistantIndex)[categoryIndex];
            const model = category?.models?.[modelIndex];
            if (window.ContextPanel && model) {
                window.ContextPanel.addModel(model.name || model, (biz?.name || '') + ' / ' + formatCategoryLabel(category || {}));
            }
            finalizeSelection(panel, assistantIndex, {
                bizName: biz?.name,
                category: formatCategoryLabel(category || {}),
                model
            });
        },

        pickServiceModel(assistantIndex, serviceIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            updateGuideBlock(panel, buildServiceSectionPickerHtml(assistantIndex, serviceIndex));
        },

        pickServiceSection(assistantIndex, serviceIndex, sectionIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            updateGuideBlock(panel, buildServiceModelPickerHtml(assistantIndex, serviceIndex, sectionIndex));
        },

        pickServiceModelItem(assistantIndex, serviceIndex, sectionIndex, modelIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            const service = getServiceModels()[serviceIndex];
            const section = service?.sections?.[sectionIndex];
            const model = section?.models?.[modelIndex];
            finalizeSelection(panel, assistantIndex, {
                bizName: service?.name,
                category: section?.section,
                model
            });
        },

        pickCustomerModel(assistantIndex, modelIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            const item = CUSTOMER_ANALYSIS_MODELS[modelIndex];
            if (!item) return;
            finalizeSelection(panel, assistantIndex, {
                bizName: item.bizName,
                category: null,
                model: item.model
            });
        },

        backToBusiness(assistantIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            resetEmployeeGuideState(panel, assistantIndex);
            updateGuideBlock(panel, buildBusinessPickerHtml(assistantIndex));
        },

        backToCategory(assistantIndex, bizKey) {
            const panel = window.getActiveWorkbenchPanel?.();
            updateGuideBlock(panel, buildCategoryPickerHtml(assistantIndex, bizKey));
        },

        backToServiceModel(assistantIndex, serviceIndex) {
            const panel = window.getActiveWorkbenchPanel?.();
            updateGuideBlock(panel, buildServiceSectionPickerHtml(assistantIndex, serviceIndex));
        },

        handleUserMessage(message, panel) {
            const p = panel || window.getActiveWorkbenchPanel?.();
            const state = window.getPanelState?.(p);
            const assistantIndex = state?.currentCardIndex ?? 0;
            processUserMessage(message, p, assistantIndex);
            return true;
        }
    };

    window.EmployeeModelGuide = EmployeeModelGuide;
})();
