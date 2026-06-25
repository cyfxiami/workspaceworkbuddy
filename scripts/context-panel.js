/**
 * 右栏会话上下文：输出物、关联模型、关联客户
 */
(function () {
    const MAX_OUTPUTS = 4;

    const state = {
        outputs: [],
        models: [],
        customers: []
    };

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    function render() {
        renderList('context-outputs-list', state.outputs, (item) =>
            `<div class="context-card" data-type="output" data-id="${item.id}">
                <div class="context-file-title-row">
                    <span class="context-file-icon context-file-icon--${escapeHtml(item.fileKind || 'txt')}">${getFileIcon(item.fileKind)}</span>
                    <div class="context-file-title-text">
                        <div class="context-card-title">${escapeHtml(item.title)}</div>
                        <span class="context-file-type-suffix">${escapeHtml(getFileTypeSuffix(item.fileKind))}</span>
                    </div>
                </div>
                <div class="context-card-meta">修改时间：${escapeHtml(item.modifiedAt || item.time)} · 大小：${escapeHtml(formatFileSize(item.sizeBytes))}</div>
                <div class="context-output-actions">
                    <button type="button" class="context-action-btn" data-action="preview" data-output-id="${item.id}">预览</button>
                    <button type="button" class="context-action-btn" data-action="download" data-output-id="${item.id}">下载</button>
                </div>
            </div>`
        );

        renderList('context-models-list', state.models, (item) =>
            `<div class="context-card" data-type="model" data-id="${item.id}">
                <div class="context-card-title">${escapeHtml(item.name)}</div>
                <div class="context-card-meta">${escapeHtml(item.category || '')}</div>
            </div>`
        );

        renderList('context-customers-list', state.customers, (item) =>
            `<div class="context-card" data-type="customer" data-id="${item.id}">
                <div class="context-card-title">${escapeHtml(item.name)}</div>
                <div class="context-card-meta">${escapeHtml(item.type || '客户')}</div>
            </div>`
        );
    }

    function renderList(containerId, items, tpl) {
        const el = document.getElementById(containerId);
        if (!el) return;
        if (!items.length) {
            el.innerHTML = '<div class="context-empty">暂无</div>';
            return;
        }
        el.innerHTML = items.map(tpl).join('');
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
            return {
                id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                title: payloadOrTitle.title || '会话输出',
                type: payloadOrTitle.type || getFileBadgeByKind(kind),
                content: payloadOrTitle.content || '',
                fileName: payloadOrTitle.fileName || `输出物-${Date.now()}.${kind === 'word' ? 'docx' : (kind === 'ppt' ? 'pptx' : kind)}`,
                fileKind: kind,
                mime: payloadOrTitle.mime || 'text/plain;charset=utf-8',
                downloadText: payloadOrTitle.downloadText || payloadOrTitle.content || '',
                sizeBytes: approxSize,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                modifiedAt: payloadOrTitle.modifiedAt || new Date().toLocaleString('zh-CN', { hour12: false })
            };
        }

        const fallbackText = content || '';
        return {
            id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            title: payloadOrTitle || '会话输出',
            type: type || '文本',
            content: content || '',
            fileName: `会话输出-${Date.now()}.txt`,
            fileKind: 'txt',
            mime: 'text/plain;charset=utf-8',
            downloadText: fallbackText,
            sizeBytes: new Blob([fallbackText]).size,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            modifiedAt: new Date().toLocaleString('zh-CN', { hour12: false })
        };
    }

    function hasContextData() {
        return state.outputs.length > 0 || state.models.length > 0 || state.customers.length > 0;
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
                source: payloadOrName.source || '业务团队工作台',
                time: payloadOrName.time || new Date().toLocaleString('zh-CN', { hour12: false })
            };
        }
        return {
            id: 'cus-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            name: payloadOrName || '未命名客户',
            type: type || '客户',
            dimensions: getDefaultCustomerDimensions(payloadOrName, type),
            source: '业务团队工作台',
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
        document.getElementById('context-customer-detail-source').textContent = `来源：${item.source || '业务团队工作台'}`;
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
        render();
        syncContextPanelVisibility();
    }

    function patchSendMessage() {
        const orig = window.sendMainMessage;
        if (!orig) return;
        window.sendMainMessage = function () {
            const input = document.getElementById('main-chat-input');
            const text = input?.value?.trim();
            if (text && window.AppShell?.touchCurrentSession) {
                window.AppShell.touchCurrentSession(text.slice(0, 30));
            }
            orig();
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
        render();
        document.addEventListener('DOMContentLoaded', () => {
            patchSendMessage();
            patchDashboard();
            setTimeout(patchModelGuide, 800);

            document.getElementById('context-panel')?.addEventListener('click', (event) => {
                const previewBtn = event.target.closest('[data-action="preview"][data-output-id]');
                if (previewBtn) {
                    event.stopPropagation();
                    openOutputPreview(previewBtn.dataset.outputId);
                    return;
                }

                const downloadBtn = event.target.closest('[data-action="download"][data-output-id]');
                if (downloadBtn) {
                    event.stopPropagation();
                    downloadOutput(downloadBtn.dataset.outputId);
                    return;
                }

                const customerCard = event.target.closest('.context-card[data-type="customer"][data-id]');
                if (customerCard) {
                    openCustomerDetail(customerCard.dataset.id);
                    return;
                }

                const outputCard = event.target.closest('.context-card[data-type="output"][data-id]');
                if (outputCard) {
                    openOutputPreview(outputCard.dataset.id);
                }
            });
        });
    }

    window.ContextPanel = {
        addOutput,
        addModel,
        addCustomer,
        reset,
        openOutputPreview,
        downloadOutput,
        openCustomerDetail,
        closeCustomerDetail,
        closeOutputPreview,
        getState: () => ({ ...state })
    };

    window.closeContextCustomerDetail = closeCustomerDetail;
    window.closeContextOutputPreview = closeOutputPreview;

    init();
})();
