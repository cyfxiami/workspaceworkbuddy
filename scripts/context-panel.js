/**
 * 右栏会话上下文：输出物、关联模型、关联客户
 */
(function () {
    const MAX_OUTPUTS = 4;

    const state = {
        outputs: [],
        models: [],
        customers: [],
        inputs: [],
        tasks: [],
        fullBundle: null,
        collapsedOutputIds: new Set(),
        activeTab: 'outputs'
    };

    function isOutputExpanded(outputId) {
        return !state.collapsedOutputIds.has(outputId);
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function stableOutputId(seed) {
        const base = String(seed || 'output').replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
        return `out-${base || Date.now()}`;
    }

    function matchOutputKey(item) {
        return `${item?.fileName || ''}|${item?.title || ''}`.toLowerCase();
    }

    function buildDetailSection(title, items) {
        const rows = (items || []).map((row) => `<li>${escapeHtml(row)}</li>`).join('');
        return `<p class="context-output-summary-section"><strong>${escapeHtml(title)}</strong></p><ul class="context-output-summary-list">${rows}</ul>`;
    }

    function buildDetailSummaryHtml(title, sections) {
        return `<p class="context-output-summary-title">${escapeHtml(title)}</p>${sections.join('')}`;
    }

    const OUTPUT_SUMMARY_RULES = [
        {
            test: (item) => /定向增发方案设计手册|方案设计手册/.test(matchOutputKey(item)),
            brief: '方案设计手册演示版，含发行要素、时间安排与认购对象说明。',
            buildDetail: () => buildDetailSummaryHtml('定向增发方案设计手册', [
                buildDetailSection('1. 核心内容', [
                    '发行要素与定价机制说明',
                    '发行时间安排与里程碑节点',
                    '认购对象类型与配售原则'
                ]),
                buildDetailSection('2. 适用场景', [
                    '上市公司定增方案初步设计',
                    '内部评审与跨部门方案沟通'
                ]),
                buildDetailSection('3. 使用建议', [
                    '可结合 Word 模板快速起草项目方案',
                    '如需定制支持，请联系张明（工号8012）'
                ])
            ])
        },
        {
            test: (item) => /方案设计模板|方案word模板/.test(matchOutputKey(item)),
            brief: '可编辑方案模板，用于快速起草项目方案。',
            buildDetail: () => buildDetailSummaryHtml('定增方案设计模板', [
                buildDetailSection('1. 模板结构', [
                    '项目背景与发行目的',
                    '发行规模、定价与认购安排',
                    '募资用途与实施计划'
                ]),
                buildDetailSection('2. 适用场景', [
                    '方案初稿撰写与内部讨论',
                    '与客户沟通前的方案框架整理'
                ]),
                buildDetailSection('3. 使用建议', [
                    '按章节逐项补充客户与项目数据',
                    '与方案设计手册配套使用效果更佳'
                ])
            ])
        },
        {
            test: (item) => /募集资金|可研报告/.test(matchOutputKey(item)),
            brief: '募投项目可研报告框架示例。',
            buildDetail: () => buildDetailSummaryHtml('募投项目可研报告框架', [
                buildDetailSection('1. 框架要点', [
                    '项目建设必要性与可行性分析',
                    '投资估算、效益测算与风险提示',
                    '募投项目合规性说明'
                ]),
                buildDetailSection('2. 适用场景', [
                    '定增募投项目材料准备',
                    '可研报告初稿结构搭建'
                ]),
                buildDetailSection('3. 使用建议', [
                    '按模板章节补充项目数据与测算',
                    '提交前建议与业务、合规同事交叉核验'
                ])
            ])
        },
        {
            test: (item) => /企业多维分析|多维分析报告/.test(matchOutputKey(item)),
            brief: '基于资产、行为、交易、合作记录等维度形成的企业量化分析摘要。',
            buildDetail: (item) => buildDetailSummaryHtml((item.title || '企业多维分析报告').replace(/\.(pdf|docx?)$/i, ''), [
                buildDetailSection('1. 分析维度', [
                    '资产规模与持仓结构',
                    '交易行为与合作记录',
                    '风险等级与跟进建议'
                ]),
                buildDetailSection('2. 核心结论', [
                    '客户价值与业务机会识别',
                    '重点跟进事项与风险提示'
                ]),
                buildDetailSection('3. 下一步建议', [
                    '结合业务分析助手进一步研判',
                    '按需生成方案或服务跟进清单'
                ])
            ])
        },
        {
            test: (item) => /方案草案/.test(matchOutputKey(item)),
            brief: '含发行规模、募资用途与认购安排的方案草案摘要。',
            buildDetail: (item) => buildDetailSummaryHtml((item.title || '方案草案').replace(/\.(pdf|docx?)$/i, ''), [
                buildDetailSection('1. 方案要素', [
                    '发行规模与定价思路',
                    '募资用途与项目安排',
                    '认购对象与配售原则'
                ]),
                buildDetailSection('2. 待确认事项', [
                    '发行窗口与监管口径',
                    '材料清单与内部审批节点'
                ]),
                buildDetailSection('3. 下一步建议', [
                    '补充客户确认后进入执行清单',
                    '联系方案支持同事做合规预检'
                ])
            ])
        },
        {
            test: (item) => /执行清单/.test(matchOutputKey(item)),
            brief: '材料补齐、内部立项、认购沟通、发行窗口研判等执行事项清单。',
            buildDetail: (item) => buildDetailSummaryHtml((item.title || '方案设计执行清单').replace(/\.(docx?|pdf)$/i, ''), [
                buildDetailSection('1. 近期事项', [
                    '材料补齐与内部立项',
                    '认购沟通与买方对接'
                ]),
                buildDetailSection('2. 关键节点', [
                    '发行窗口研判',
                    '信披与合规预检'
                ]),
                buildDetailSection('3. 协同建议', [
                    '按事项逐项跟进并反馈进展',
                    '与客户服务助手联动买方跟进'
                ])
            ])
        },
        {
            test: (item) => /跟进清单|客户服务/.test(matchOutputKey(item)),
            brief: '材料催办、买方对接、信披预检、窗口期沟通等待跟进事项。',
            buildDetail: (item) => buildDetailSummaryHtml((item.title || '客户服务跟进清单').replace(/\.(docx?|pdf)$/i, ''), [
                buildDetailSection('1. 待跟进事项', [
                    '材料催办与补充说明',
                    '买方对接与反馈收集'
                ]),
                buildDetailSection('2. 风险提示', [
                    '信披预检与窗口期沟通',
                    '客户诉求与内部资源协调'
                ]),
                buildDetailSection('3. 下一步计划', [
                    '按优先级逐项闭环',
                    '同步更新客户沟通记录'
                ])
            ])
        },
        {
            test: (item) => /买方匹配/.test(matchOutputKey(item)),
            brief: '买方候选及首轮接触建议摘要。',
            buildDetail: (item) => buildDetailSummaryHtml((item.title || '买方匹配简版').replace(/\.(pdf|docx?)$/i, ''), [
                buildDetailSection('1. 匹配结果', [
                    '买方候选机构与匹配理由',
                    '首轮接触建议与沟通要点'
                ]),
                buildDetailSection('2. 协同建议', [
                    '结合客户诉求调整推介口径',
                    '跟进买方反馈并更新清单'
                ])
            ])
        },
        {
            test: (item) => /待审批|进度清单/.test(matchOutputKey(item)),
            brief: '汇总待审批事项当前节点与预计完成时间。',
            buildDetail: (item) => buildDetailSummaryHtml('待审批事项进度清单', [
                buildDetailSection('1. 当前进度', [
                    '开户绿色通道、融资配套材料等事项节点',
                    '各事项责任人与预计完成时间'
                ]),
                buildDetailSection('2. 风险提示', [
                    '临近截止事项需优先跟进',
                    '材料缺失可能影响审批时效'
                ]),
                buildDetailSection('3. 下一步计划', [
                    '按事项逐项催办并反馈进展',
                    '必要时升级协同处理'
                ])
            ])
        },
        {
            test: (item) => /通知公告摘要/.test(matchOutputKey(item)),
            brief: '包含最新通知公告要点摘要。',
            buildDetail: () => buildDetailSummaryHtml('公司最新通知公告摘要', [
                buildDetailSection('1. 核心内容', [
                    '2026年二季度投行业务协同专项安排',
                    '员工工作台功能升级说明'
                ]),
                buildDetailSection('2. 关注要点', [
                    '执行时间与适用范围',
                    '相关协同与反馈要求'
                ])
            ])
        },
        {
            test: (item) => /正式发文摘要/.test(matchOutputKey(item)),
            brief: '包含最新正式发文要点摘要。',
            buildDetail: () => buildDetailSummaryHtml('公司最新正式发文摘要', [
                buildDetailSection('1. 核心内容', [
                    '投行业务材料报送管理办法（2026修订）',
                    '业务支持中心异常提醒处置指引'
                ]),
                buildDetailSection('2. 关注要点', [
                    '报送标准与闭环时限',
                    '异常分级与处置要求'
                ])
            ])
        },
        {
            test: (item) => /材料清单/.test(matchOutputKey(item)),
            brief: '含基础工商、财务、股权合规、募投项目等材料清单。',
            buildDetail: (item) => buildDetailSummaryHtml((item.title || '客户材料清单').replace(/\.(docx?|pdf)$/i, ''), [
                buildDetailSection('1. 材料类别', [
                    '基础工商与财务资料',
                    '股权合规与募投项目材料'
                ]),
                buildDetailSection('2. 使用建议', [
                    '按清单逐项收集并标注缺口',
                    '提交前与合规口径交叉核验'
                ])
            ])
        }
    ];

    function resolveOutputSummaryRule(item) {
        return OUTPUT_SUMMARY_RULES.find((rule) => rule.test(item)) || null;
    }

    function buildOutputBriefSummary(item) {
        const rule = resolveOutputSummaryRule(item);
        if (rule?.brief) return rule.brief;
        const source = String(item?.briefSummary || item?.content || item?.downloadText || '').trim();
        if (!source) return '暂无摘要内容';
        return source.replace(/^来源：[\s\S]*$/m, '').trim().slice(0, 120) || '暂无摘要内容';
    }

    function buildOutputDetailSummaryHtml(item) {
        if (item?.summaryHtml) return item.summaryHtml;
        const rule = resolveOutputSummaryRule(item);
        if (rule?.buildDetail) return rule.buildDetail(item);
        const title = (item?.title || item?.fileName || '输出物').replace(/\.(pdf|docx?|pptx?|txt)$/i, '');
        const brief = buildOutputBriefSummary(item);
        return buildDetailSummaryHtml(title, [
            buildDetailSection('1. 文档概要', [brief]),
            buildDetailSection('2. 使用建议', ['可在会话中继续追问，获取更完整的分析与协同支持。'])
        ]);
    }

    function enrichOutputSummaries(item) {
        const rule = resolveOutputSummaryRule(item);
        return {
            ...item,
            briefSummary: item.briefSummary || rule?.brief || buildOutputBriefSummary(item),
            summaryHtml: item.summaryHtml || (rule?.buildDetail ? rule.buildDetail(item) : '')
        };
    }

    function getBriefSummaryByDocName(docName, docUrl) {
        const probe = { fileName: docName, title: docName, content: docUrl || '' };
        return buildOutputBriefSummary(probe);
    }

    function getFileIcon(kind) {
        const map = {
            pdf: '📄',
            word: '📝',
            ppt: '📊',
            txt: '📃'
        };
        return map[kind] || '📁';
    }

    function formatFileSize(sizeBytes) {
        const size = Number(sizeBytes) || 0;
        if (size < 1024) return `${size || 1} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    function getFileIconSvg(kind) {
        const safeKind = String(kind || 'txt').replace(/[^a-z0-9_-]/gi, '');
        return `<svg class="context-output-icon-svg context-output-icon-svg--${safeKind}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    }

    function setSectionCount(id, count) {
        const el = document.getElementById(id);
        if (el) el.textContent = String(count);
    }

    function updateContextCount() {
        setSectionCount('context-related-count', (window.AppShell?.getRelatedSessions?.() || []).length);
        setSectionCount('context-customers-count', state.customers.length);
        setSectionCount('context-tasks-count', state.tasks.length);
        setSectionCount('context-inputs-count', state.inputs.length);
        setSectionCount('context-outputs-count', state.outputs.length);
    }

    function render() {
        updateContextCount();

        renderList('context-outputs-list', state.outputs, (item) => {
            const kind = item.fileKind || 'txt';
            const icon = getFileIconSvg(kind);
            const fileName = escapeHtml(item.fileName || item.title || '输出物');
            const isExpanded = isOutputExpanded(item.id);
            const previewClass = 'context-output-preview context-output-preview--detail';
            return `
                <div class="context-output-item${isExpanded ? ' is-expanded' : ' is-collapsed'}" data-type="output" data-id="${item.id}">
                    <div class="context-output-top">
                        ${icon}
                        <div class="context-output-filename">${fileName}</div>
                        <svg class="context-output-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                    <div class="${previewClass}">
                        <div class="context-output-preview-text">${buildOutputDetailSummaryHtml(item)}</div>
                    </div>
                </div>
            `;
        });
    }

    function renderList(containerId, items, tpl) {
        const el = document.getElementById(containerId);
        if (!el) return;
        if (!items.length) {
            el.innerHTML = '<div class="context-empty">暂无输出物</div>';
            return;
        }
        el.innerHTML = items.map(tpl).join('');
    }

    function renderEmpty(containerId, text) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `<div class="context-empty">${escapeHtml(text)}</div>`;
    }

    function renderInputs() {
        const el = document.getElementById('context-inputs-list');
        if (!el) return;
        if (!state.inputs.length) {
            el.innerHTML = '<div class="context-empty">暂无输入物</div>';
            return;
        }
        el.innerHTML = state.inputs.map((item) => {
            const kind = item.fileKind || 'txt';
            const icon = getFileIconSvg(kind);
            const fileName = escapeHtml(item.fileName || item.title || '输入物');
            const size = item.sizeText || '';
            return `
                <div class="context-output-item is-collapsed" data-type="input">
                    <div class="context-output-top">
                        ${icon}
                        <div class="context-output-filename">${fileName}</div>
                        ${size ? `<span class="context-output-size">${escapeHtml(size)}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderCustomers() {
        const el = document.getElementById('context-customers-list');
        if (!el) return;
        if (!state.customers.length) {
            el.innerHTML = '<div class="context-empty">暂无关联客户</div>';
            return;
        }
        el.innerHTML = state.customers.map((c) => {
            const name = escapeHtml(c.name || '客户');
            const type = escapeHtml(c.type || '');
            return `
                <div class="context-customer-card" data-customer-id="${escapeHtml(c.id || '')}">
                    <div class="context-customer-avatar">${escapeHtml((name || '?').slice(0, 1))}</div>
                    <div class="context-customer-info">
                        <div class="context-customer-name">${name}</div>
                        ${type ? `<div class="context-customer-type">${type}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTasks() {
        const el = document.getElementById('context-tasks-list');
        if (!el) return;
        if (!state.tasks.length) {
            el.innerHTML = '<div class="context-empty">暂无关联任务</div>';
            return;
        }
        el.innerHTML = state.tasks.map((t) => {
            const title = escapeHtml(t.title || '任务');
            const status = escapeHtml(t.status || '待处理');
            const due = t.dueDate ? escapeHtml(t.dueDate) : '';
            return `
                <div class="context-task-item" data-task-id="${escapeHtml(t.id || '')}">
                    <div class="context-task-status" data-status="${status}"></div>
                    <div class="context-task-body">
                        <div class="context-task-title">${title}</div>
                        <div class="context-task-meta">
                            <span class="context-task-status-text">${status}</span>
                            ${due ? `<span class="context-task-due">截止：${due}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function formatRelativeTime(ts) {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return mins + '分钟前';
        const hours = Math.floor(mins / 60);
        if (hours < 24) return hours + '小时前';
        const days = Math.floor(hours / 24);
        return days + '天前';
    }

    function renderRelatedSessions() {
        const el = document.getElementById('context-related-list');
        if (!el) return;
        const currentId = window.AppShell?.getCurrentSessionId?.();
        const relatedIds = window.AppShell?.getRelatedSessions?.(currentId) || [];
        if (!relatedIds.length) {
            el.innerHTML = '<div class="context-empty">暂无关联会话</div>';
            return;
        }
        el.innerHTML = relatedIds.map((id) => {
            const s = window.AppShell?.getSessionById?.(id);
            if (!s) return '';
            const title = escapeHtml(s.title || '会话');
            const time = formatRelativeTime(s.timestamp || Date.now());
            const status = s.status || '推进中';
            const statusClass = window.AppShell?.getStatuses?.() ? (window.AppShell?.getSessionStatus?.(id) || status) : status;
            return `
                <div class="context-related-item" data-related-session-id="${escapeHtml(id)}">
                    <span class="context-related-item-title" data-action="jump" title="跳转到该会话">${title}</span>
                    <span class="session-status-tag ${getStatusColorClass(status)}">${status}</span>
                    <span class="context-related-item-time">${time}</span>
                    <button type="button" class="context-related-item-del" data-action="unlink" title="取消关联">×</button>
                </div>
            `;
        }).join('');
    }

    function getStatusColorClass(status) {
        const map = {
            '推进中': 'status-active',
            '目标达成': 'status-done',
            '已暂停': 'status-paused',
            '已取消': 'status-cancelled'
        };
        return map[status] || 'status-active';
    }

    function switchContextTab(tabKey) {
        // 兼容旧调用：单面板模式下统一刷新所有区块
        state.activeTab = tabKey;
        renderAllSections();
    }

    function renderAllSections() {
        renderRelatedSessions();
        renderCustomers();
        renderTasks();
        renderInputs();
        render();
        updateContextCount();
    }

    // 关联现有会话弹层
    let linkPopover = null;
    function openLinkExistingPopover(anchorEl) {
        closeLinkExistingPopover();
        const currentId = window.AppShell?.getCurrentSessionId?.();
        const sessions = (window.AppShell?.getSessions?.() || []).slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const relatedIds = window.AppShell?.getRelatedSessions?.(currentId) || [];
        const candidates = sessions.filter((s) => s.id !== currentId && !relatedIds.includes(s.id));
        const popover = document.createElement('div');
        popover.className = 'context-link-popover';
        popover.innerHTML = `
            <div class="context-link-popover-header">
                <span>选择要关联的会话</span>
                <button type="button" class="context-link-popover-close" data-action="close">×</button>
            </div>
            <div class="context-link-popover-list">
                ${candidates.length ? candidates.map((s) => `
                    <div class="context-link-popover-item" data-action="pick" data-session-id="${escapeHtml(s.id)}">
                        <span class="context-link-popover-item-title">${escapeHtml(s.title || '会话')}</span>
                        <span class="context-link-popover-item-time">${formatRelativeTime(s.timestamp || Date.now())}</span>
                    </div>
                `).join('') : '<div class="context-link-popover-empty">暂无可关联的会话</div>'}
            </div>
        `;
        document.body.appendChild(popover);
        // 定位
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            const popoverRect = popover.getBoundingClientRect();
            let left = rect.left;
            let top = rect.bottom + 6;
            if (left + popoverRect.width > window.innerWidth - 8) {
                left = window.innerWidth - popoverRect.width - 8;
            }
            if (top + popoverRect.height > window.innerHeight - 8) {
                top = rect.top - popoverRect.height - 6;
            }
            popover.style.left = Math.max(8, left) + 'px';
            popover.style.top = Math.max(8, top) + 'px';
        }
        linkPopover = popover;
        popover.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('[data-action="close"]');
            if (closeBtn) { closeLinkExistingPopover(); return; }
            const pickItem = e.target.closest('[data-action="pick"]');
            if (pickItem) {
                const targetId = pickItem.dataset.sessionId;
                if (currentId && targetId) {
                    window.AppShell?.linkSessions?.(currentId, targetId);
                    renderRelatedSessions();
                    updateContextCount();
                }
                closeLinkExistingPopover();
            }
        });
    }
    function closeLinkExistingPopover() {
        if (linkPopover) { linkPopover.remove(); linkPopover = null; }
    }

    function getFileBadgeByKind(kind) {
        const map = {
            pdf: 'PDF',
            word: 'Word',
            ppt: 'PPT',
            txt: 'TXT'
        };
        return map[kind] || '文件';
    }

    function getFileTypeSuffix(kind) {
        const map = {
            pdf: '.PDF',
            word: '.WORD',
            ppt: '.PPT',
            txt: '.TXT'
        };
        return map[kind] || '.FILE';
    }

    function normalizeOutput(payloadOrTitle, type, content) {
        if (payloadOrTitle && typeof payloadOrTitle === 'object') {
            const kind = payloadOrTitle.fileKind || 'txt';
            const textBody = payloadOrTitle.downloadText || payloadOrTitle.content || '';
            const approxSize = payloadOrTitle.sizeBytes || new Blob([textBody]).size;
            const fileName = payloadOrTitle.fileName || `输出物-${Date.now()}.${kind === 'word' ? 'docx' : (kind === 'ppt' ? 'pptx' : kind)}`;
            return enrichOutputSummaries({
                id: payloadOrTitle.id || stableOutputId(fileName),
                title: payloadOrTitle.title || '会话输出',
                type: payloadOrTitle.type || getFileBadgeByKind(kind),
                content: payloadOrTitle.content || '',
                fileName,
                fileKind: kind,
                mime: payloadOrTitle.mime || 'text/plain;charset=utf-8',
                downloadText: payloadOrTitle.downloadText || payloadOrTitle.content || '',
                sizeBytes: approxSize,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                modifiedAt: payloadOrTitle.modifiedAt || new Date().toLocaleString('zh-CN', { hour12: false })
            });
        }

        const fallbackText = content || '';
        const fileName = `会话输出-${Date.now()}.txt`;
        return enrichOutputSummaries({
            id: stableOutputId(fileName),
            title: payloadOrTitle || '会话输出',
            type: type || '文本',
            content: content || '',
            fileName,
            fileKind: 'txt',
            mime: 'text/plain;charset=utf-8',
            downloadText: fallbackText,
            sizeBytes: new Blob([fallbackText]).size,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            modifiedAt: new Date().toLocaleString('zh-CN', { hour12: false })
        });
    }

    function hasContextData() {
        return state.outputs.length > 0;
    }

    function syncContextPanelVisibility() {
        if (hasContextData()) {
            window.AppShell?.expandContextPanel?.();
        }
    }

    function addOutput(payloadOrTitle, type, content) {
        const item = normalizeOutput(payloadOrTitle, type, content);
        const dupIdx = state.outputs.findIndex((o) => o.fileName === item.fileName);
        if (dupIdx >= 0) {
            state.outputs.splice(dupIdx, 1);
        }
        state.outputs.unshift({
            ...item
        });
        while (state.outputs.length > MAX_OUTPUTS) {
            state.outputs.pop();
        }
        render();
        syncContextPanelVisibility();
    }

    function addModel(name, category) {
        const exists = state.models.some((m) => m.name === name);
        if (exists) return;
        state.models.unshift({
            id: 'mod-' + Date.now(),
            name: name || '未命名模型',
            category: category || ''
        });
        if (state.models.length > 15) state.models.pop();
        render();
        syncContextPanelVisibility();
    }

    function getDefaultCustomerDimensions(name, type) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN');
        return [
            {
                section: '基础信息',
                items: [
                    { label: '客户类型', value: type || '客户' },
                    { label: '客户编号', value: `C${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}001` },
                    { label: '开户日期', value: '2024-03-15' },
                    { label: '服务经理', value: '王经理（工号 E1026）' }
                ]
            },
            {
                section: '资产与交易',
                items: [
                    { label: '账户资产', value: '500.00 万元' },
                    { label: '近3月资产变动', value: '+8.6%' },
                    { label: '近12月成交笔数', value: '86 笔' },
                    { label: '近12月成交金额', value: '1,280.00 万元' }
                ]
            },
            {
                section: '持仓结构',
                items: [
                    { label: '股票', value: '45.0%' },
                    { label: '债券', value: '35.0%' },
                    { label: '现金及等价物', value: '20.0%' }
                ]
            },
            {
                section: '跟进记录',
                items: [
                    { label: '最近沟通时间', value: `${dateStr} 10:00` },
                    { label: '沟通方式', value: '电话' },
                    { label: '沟通时长', value: '25 分钟' },
                    { label: '待办事项', value: `补充${name || '客户'}资料 1 项（截止 ${dateStr}）` }
                ]
            }
        ];
    }

    function buildCustomerDimensionsHtml(dimensions) {
        if (!dimensions?.length) {
            return '<div class="context-customer-dimensions-empty">暂无客户维度数据</div>';
        }
        return dimensions.map((group) => `
            <section class="context-customer-dimension-group">
                <h5 class="context-customer-dimension-heading">${escapeHtml(group.section)}</h5>
                <dl class="context-customer-dimension-list">
                    ${(group.items || []).map((row) => `
                        <div class="context-customer-dimension-row">
                            <dt>${escapeHtml(row.label)}</dt>
                            <dd>${escapeHtml(row.value)}</dd>
                        </div>
                    `).join('')}
                </dl>
            </section>
        `).join('');
    }

    function normalizeCustomer(payloadOrName, type) {
        if (payloadOrName && typeof payloadOrName === 'object') {
            return {
                id: 'cus-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                name: payloadOrName.name || '未命名客户',
                type: payloadOrName.type || '客户',
                dimensions: payloadOrName.dimensions || getDefaultCustomerDimensions(payloadOrName.name, payloadOrName.type),
                source: payloadOrName.source || '员工工作台',
                time: payloadOrName.time || new Date().toLocaleString('zh-CN', { hour12: false })
            };
        }
        return {
            id: 'cus-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            name: payloadOrName || '未命名客户',
            type: type || '客户',
            dimensions: getDefaultCustomerDimensions(payloadOrName, type),
            source: '员工工作台',
            time: new Date().toLocaleString('zh-CN', { hour12: false })
        };
    }

    function addCustomer(payloadOrName, type) {
        const customer = normalizeCustomer(payloadOrName, type);
        const exists = state.customers.some((c) => c.name === customer.name);
        if (exists) return;
        state.customers.unshift({
            ...customer
        });
        if (state.customers.length > 15) state.customers.pop();
        render();
        renderCustomers();
        updateContextCount();
        syncContextPanelVisibility();
    }

    function addInput(payload) {
        if (!payload) return;
        const item = {
            id: payload.id || 'in-' + Date.now(),
            fileName: payload.fileName || payload.name || '输入文件',
            title: payload.title || payload.fileName || '输入物',
            fileKind: payload.fileKind || 'txt',
            sizeText: payload.sizeText || payload.size || '',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        const exists = state.inputs.some((i) => i.fileName === item.fileName);
        if (exists) return;
        state.inputs.unshift(item);
        if (state.inputs.length > 20) state.inputs.pop();
        renderInputs();
        updateContextCount();
        syncContextPanelVisibility();
    }

    function addTask(payload) {
        if (!payload) return;
        const item = {
            id: payload.id || 'task-' + Date.now(),
            title: payload.title || '任务',
            status: payload.status || '待处理',
            dueDate: payload.dueDate || ''
        };
        const exists = state.tasks.some((t) => t.title === item.title);
        if (exists) return;
        state.tasks.unshift(item);
        if (state.tasks.length > 20) state.tasks.pop();
        renderTasks();
        updateContextCount();
        syncContextPanelVisibility();
    }

    function getOutputById(id) {
        return state.outputs.find((item) => item.id === id) || null;
    }

    function getCustomerById(id) {
        return state.customers.find((item) => item.id === id) || null;
    }

    function openOutputPreview(outputId) {
        const item = getOutputById(outputId);
        if (!item) return;
        const modal = document.getElementById('context-output-preview-modal');
        const titleEl = document.getElementById('context-output-preview-title');
        const metaEl = document.getElementById('context-output-preview-meta');
        const bodyEl = document.getElementById('context-output-preview-body');
        if (!modal || !titleEl || !metaEl || !bodyEl) return;

        titleEl.textContent = item.title;
        metaEl.textContent = `${item.type} · ${item.fileName} · 修改时间：${item.modifiedAt || item.time} · 大小：${formatFileSize(item.sizeBytes)}`;
        bodyEl.textContent = item.content || item.downloadText || '暂无可预览内容';
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeOutputPreview() {
        const modal = document.getElementById('context-output-preview-modal');
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    function downloadOutput(outputId) {
        const item = getOutputById(outputId);
        if (!item) return;
        const blob = new Blob([item.downloadText || item.content || ''], { type: item.mime || 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.fileName || `输出物-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function openCustomerDetail(customerId) {
        const item = getCustomerById(customerId);
        if (!item) return;
        const drawer = document.getElementById('context-customer-detail-drawer');
        if (!drawer) return;

        document.getElementById('context-customer-detail-title').textContent = item.name;
        const dimensionsEl = document.getElementById('context-customer-detail-dimensions');
        if (dimensionsEl) {
            dimensionsEl.innerHTML = buildCustomerDimensionsHtml(item.dimensions);
        }
        document.getElementById('context-customer-detail-source').textContent = `来源：${item.source || '员工工作台'}`;
        document.getElementById('context-customer-detail-time').textContent = `关联时间：${item.time || ''}`;

        drawer.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeCustomerDetail() {
        const drawer = document.getElementById('context-customer-detail-drawer');
        if (!drawer) return;
        drawer.hidden = true;
        document.body.style.overflow = '';
    }

    function reset() {
        state.outputs = [];
        state.models = [];
        state.customers = [];
        state.inputs = [];
        state.tasks = [];
        state.fullBundle = null;
        state.collapsedOutputIds.clear();
        renderAllSections();
    }

    function bundleHasItems(bundle) {
        if (!bundle) return false;
        return (bundle.outputs?.length || 0) + (bundle.models?.length || 0) + (bundle.customers?.length || 0) + (bundle.tasks?.length || 0) + (bundle.inputs?.length || 0) > 0;
    }

    function inferFileKindFromUrl(url, title) {
        const source = `${url || ''} ${title || ''}`.toLowerCase();
        if (/\.pdf|pdf/.test(source)) return 'pdf';
        if (/\.docx?|word/.test(source)) return 'word';
        if (/\.pptx?|ppt/.test(source)) return 'ppt';
        if (/\.txt/.test(source)) return 'txt';
        return 'txt';
    }

    function extractBundleFromMarkdown(text, options = {}) {
        const bundle = { outputs: [], models: [], customers: [] };
        const source = String(text || '');
        if (!source.trim()) return bundle;

        const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        while ((match = linkPattern.exec(source)) !== null) {
            const title = match[1].replace(/\*\*/g, '').trim();
            const url = match[2].trim();
            if (!title || !url || url.startsWith('#')) continue;
            const tail = source.slice(match.index, match.index + 160);
            const kind = inferFileKindFromUrl(url, `${title} ${tail}`);
            bundle.outputs.push({
                title,
                type: kind.toUpperCase(),
                fileKind: kind,
                fileName: title.includes('.') ? title : `${title}.${kind === 'word' ? 'docx' : (kind === 'ppt' ? 'pptx' : kind)}`,
                modifiedAt: ts,
                content: `来源：会话卡片\n链接：${url}`,
                downloadText: `来源：会话卡片\n链接：${url}`
            });
        }

        const customerQuote = source.match(/客户[「「]([^」」]+)[」」]/);
        if (customerQuote?.[1]) {
            bundle.customers.push({
                name: customerQuote[1],
                type: '企业客户',
                source: '会话分析卡片',
                time: ts
            });
        }

        const headingModel = source.match(/^##\s+(.+?)(?:发行条件|业务操作指引|客户材料清单)/m);
        const designBiz = (source.match(/^#\s*(.+?)方案设计模板/m) || [])[1];
        const resolveModels = window.EmployeeCustomerIbFlow?.resolveContextModels;

        if (/方案设计模板/.test(source) && resolveModels) {
            bundle.models.push(...resolveModels((designBiz || '定增').trim(), 'design', { limit: 4 }));
        } else if (/发行条件与准入标准/.test(source) && resolveModels) {
            const biz = (source.match(/^##\s*(.+?)发行条件与准入标准/m) || [])[1] || '定增';
            bundle.models.push(...resolveModels(biz.trim(), 'analysis', { section: '基本标准', limit: 4 }));
        } else if (/业务操作指引/.test(source) && resolveModels) {
            const biz = (source.match(/^##\s*(.+?)业务操作指引/m) || [])[1] || '定增';
            bundle.models.push(...resolveModels(biz.trim(), 'analysis', { section: '公司标准', limit: 4 }));
        } else if (/客户材料清单/.test(source) && resolveModels) {
            const biz = (source.match(/^##\s*(.+?)客户材料清单/m) || [])[1] || '定增';
            bundle.models.push(...resolveModels(biz.trim(), 'analysis', { limit: 4 }));
        } else if (headingModel?.[1]) {
            bundle.models.push({
                name: headingModel[1].trim(),
                category: options.category || '业务分析 / 会话识别'
            });
        } else if (/多维量化分析|客户分析/.test(source)) {
            bundle.models.push({
                name: '客户多维分析模型',
                category: '客户分析 / 多维量化'
            });
        }

        return bundle;
    }

    function normalizeSnapshotModel(item, index) {
        if (typeof item === 'string') {
            return {
                id: `mod-snap-${index}-${Date.now()}`,
                name: item,
                category: ''
            };
        }
        return {
            id: item.id || `mod-snap-${index}-${Date.now()}`,
            name: item.name || '未命名模型',
            category: item.category || ''
        };
    }

    function matchOutputToDocName(output, docName) {
        const target = String(docName || '').trim().toLowerCase();
        if (!target) return false;
        const fileName = String(output?.fileName || '').trim().toLowerCase();
        const title = String(output?.title || '').trim().toLowerCase();
        const targetBase = target.replace(/\.(pdf|docx?|pptx?|txt)$/i, '');
        const fileBase = fileName.replace(/\.(pdf|docx?|pptx?|txt)$/i, '');
        const titleBase = title.replace(/\.(pdf|docx?|pptx?|txt)$/i, '');
        return fileName === target
            || title === target
            || fileName.includes(target)
            || target.includes(fileName)
            || fileBase.includes(targetBase)
            || targetBase.includes(fileBase)
            || titleBase.includes(targetBase)
            || targetBase.includes(titleBase);
    }

    function findOutputForDocCard(outputs, docName, docUrl) {
        const urlName = String(docUrl || '').split('/').pop()?.split('?')[0] || '';
        return (outputs || []).find((item) =>
            matchOutputToDocName(item, docName) || matchOutputToDocName(item, urlName)
        ) || null;
    }

    function loadSnapshot(bundle, options = {}) {
        if (!bundleHasItems(bundle)) return;
        const normalizedOutputs = (bundle.outputs || []).map((item) => normalizeOutput(item));
        state.fullBundle = {
            outputs: normalizedOutputs.map((item) => ({ ...item })),
            models: (bundle.models || []).map((item, index) => normalizeSnapshotModel(item, index)),
            customers: (bundle.customers || []).map((item) => normalizeCustomer(item)),
            tasks: (bundle.tasks || []).map((item) => ({ ...item })),
            inputs: (bundle.inputs || []).map((item) => ({ ...item }))
        };
        state.outputs = normalizedOutputs;
        state.models = state.fullBundle.models;
        state.customers = state.fullBundle.customers;
        state.tasks = state.fullBundle.tasks;
        state.inputs = state.fullBundle.inputs;
        state.collapsedOutputIds.clear();

        renderAllSections();
        syncContextPanelVisibility();
    }

    function toggleOutputCard(outputId) {
        if (state.collapsedOutputIds.has(outputId)) {
            state.collapsedOutputIds.delete(outputId);
        } else {
            state.collapsedOutputIds.add(outputId);
        }
        // 直接切换 DOM class，避免重新渲染导致闪烁
        const card = document.querySelector(`.context-output-item[data-id="${CSS.escape(outputId)}"]`);
        if (card) {
            const isExpanded = !state.collapsedOutputIds.has(outputId);
            card.classList.toggle('is-expanded', isExpanded);
            card.classList.toggle('is-collapsed', !isExpanded);
        }
    }

    function linkDocCardsInBubble(bubble, bundle) {
        if (!bubble || !bundle?.outputs?.length) return;
        const outputs = (bundle.outputs || []).map((item) => normalizeOutput(item));
        bubble.querySelectorAll('.chat-doc-card').forEach((card) => {
            const docName = card.dataset.docName || '';
            const docUrl = card.dataset.docUrl || '';
            const matched = findOutputForDocCard(outputs, docName, docUrl);
            if (matched) {
                card.dataset.outputId = matched.id;
                const previewEl = card.querySelector('.chat-doc-card-preview-text, .doc-card-desc');
                const brief = matched.briefSummary || buildOutputBriefSummary(matched);
                if (previewEl) previewEl.textContent = brief;
            }
        });
    }

    function showOutputFromBubble(bubble, options = {}) {
        if (!bubble?.dataset?.contextSnapshot) return;
        try {
            const bundle = JSON.parse(bubble.dataset.contextSnapshot);
            loadSnapshot(bundle, options);
        } catch (err) {
            console.warn('showOutputFromBubble failed', err);
        }
    }

    function attachSnapshotToBubble(bubble, bundle) {
        if (!bubble || !bundleHasItems(bundle)) return;
        const normalized = {
            ...bundle,
            outputs: (bundle.outputs || []).map((item) => normalizeOutput(item))
        };
        bubble.dataset.contextSnapshot = JSON.stringify(normalized);
        bubble.classList.add('has-context-snapshot', 'is-context-clickable');
        linkDocCardsInBubble(bubble, normalized);
        loadSnapshot(normalized);
    }

    function restoreSnapshotFromBubble(bubble) {
        showOutputFromBubble(bubble, {});
    }

    function isInteractiveChatTarget(target) {
        return !!target?.closest?.(
            '.chat-prompt-card, .ib-guide-feedback-btn, .ib-guide-feedback-actions, .ib-guide-option, button, a, input, textarea, select, label'
        );
    }

    function isDocCardDownloadTarget(target) {
        return !!target?.closest?.('.chat-doc-card-dl, .doc-card-dl');
    }

    function patchSendMessage() {
        // 历史上这里会包装 sendMainMessage，在原函数执行前主动 createSession 并写消息。
        // 但 sendMainMessage -> startEmployeeChatFromMainInput -> applyEmployeeChatModeUI
        // (createHistory) -> appendChatMessage -> persistEmployeeChat 已完整负责会话创建与
        // 消息持久化，额外的 createSession 会导致侧边栏出现重复会话记录，故此处仅保留
        // 透传调用，不再插手会话/消息写入。
        const orig = window.sendMainMessage;
        if (!orig) return;
        window.sendMainMessage = function (...args) {
            return orig(...args);
        };
    }

    function patchModelGuide() {
        if (!window.EmployeeModelGuide) return;
        const orig = window.EmployeeModelGuide.onModelSelected;
        window.EmployeeModelGuide.onModelSelected = function (business, category, model) {
            if (typeof orig === 'function') orig(business, category, model);
            addModel(model?.name || model, (business || '') + ' / ' + (category || ''));
        };
    }

    function patchDashboard() {
        const orig = window.openDashboardDetail;
        if (!orig) return;
        window.openDashboardDetail = function (type) {
            const labels = { assets: '客户总资产', revenue: '客户总收入', cost: '维护总成本' };
            addOutput(labels[type] || '业绩明细', '业绩看板', type);
            orig(type);
        };
    }

    function init() {
        renderAllSections();
        document.addEventListener('DOMContentLoaded', () => {
            patchSendMessage();
            patchDashboard();
            setTimeout(patchModelGuide, 800);

            document.addEventListener('click', (event) => {
                const docCard = event.target.closest('.chat-doc-card[data-doc-url]');
                if (docCard) {
                    if (isDocCardDownloadTarget(event.target)) return;
                    event.stopPropagation();
                    const bubble = docCard.closest('.chat-bubble-assistant');
                    showOutputFromBubble(bubble, {
                        focusOutputId: docCard.dataset.outputId,
                        focusFileName: docCard.dataset.docName,
                        focusDocUrl: docCard.dataset.docUrl
                    });
                    return;
                }

                const bubble = event.target.closest('.chat-bubble-assistant.has-context-snapshot');
                if (!bubble || isInteractiveChatTarget(event.target)) return;
                restoreSnapshotFromBubble(bubble);
            });

            const contextPanel = document.getElementById('context-panel');
            contextPanel?.addEventListener('click', (event) => {
                // 区块展开/收起（点击 header 切换，但点击 header 内的按钮不触发）
                const toggleHeader = event.target.closest('[data-context-toggle]');
                if (toggleHeader && !event.target.closest('button, a')) {
                    const section = toggleHeader.closest('.context-section');
                    if (section) section.classList.toggle('is-expanded');
                    return;
                }
                // 输出物卡片展开/收起（点击箭头或卡片顶部区域）
                const arrowEl = event.target.closest('.context-output-arrow');
                const outputCard = event.target.closest('.context-output-item[data-type="output"][data-id]');
                if (arrowEl && outputCard) {
                    toggleOutputCard(outputCard.dataset.id);
                    return;
                }
                if (outputCard) {
                    if (event.target.closest('button, a')) return;
                    // 点击卡片顶部区域也触发收起/展开
                    if (event.target.closest('.context-output-top')) {
                        toggleOutputCard(outputCard.dataset.id);
                        return;
                    }
                }
                // 关联会话：跳转
                const jumpEl = event.target.closest('.context-related-item-title[data-action="jump"]');
                if (jumpEl) {
                    const item = jumpEl.closest('.context-related-item');
                    const sid = item?.dataset.relatedSessionId;
                    if (sid) window.AppShell?.switchToSession?.(sid);
                    return;
                }
                // 关联会话：取消关联
                const unlinkBtn = event.target.closest('.context-related-item-del[data-action="unlink"]');
                if (unlinkBtn) {
                    const item = unlinkBtn.closest('.context-related-item');
                    const sid = item?.dataset.relatedSessionId;
                    const currentId = window.AppShell?.getCurrentSessionId?.();
                    if (sid && currentId) {
                        window.AppShell?.unlinkSessions?.(currentId, sid);
                        renderRelatedSessions();
                        updateContextCount();
                    }
                    return;
                }
                // 关联现有会话按钮
                const linkBtn = event.target.closest('#context-link-existing-btn');
                if (linkBtn) {
                    openLinkExistingPopover(linkBtn);
                    return;
                }
            });

            // 点击页面其它位置关闭关联会话弹层
            document.addEventListener('click', (event) => {
                if (!linkPopover) return;
                if (linkPopover.contains(event.target)) return;
                if (event.target.closest('#context-link-existing-btn')) return;
                closeLinkExistingPopover();
            });
        });
    }

    window.ContextPanel = {
        addOutput,
        addModel,
        addCustomer,
        addInput,
        addTask,
        reset,
        loadSnapshot,
        attachSnapshotToBubble,
        restoreSnapshotFromBubble,
        showOutputFromBubble,
        extractBundleFromMarkdown,
        bundleHasItems,
        getBriefSummaryByDocName,
        buildOutputBriefSummary,
        openOutputPreview,
        downloadOutput,
        openCustomerDetail,
        closeCustomerDetail,
        closeOutputPreview,
        switchContextTab,
        renderRelatedSessions,
        renderAllSections,
        getState: () => ({ ...state })
    };

    window.closeContextCustomerDetail = closeCustomerDetail;
    window.closeContextOutputPreview = closeOutputPreview;

    init();
})();
