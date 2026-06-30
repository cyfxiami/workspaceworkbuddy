/**
 * 业务助理 / 功能助手 / 技能 管理
 */
(function () {
    const STORAGE_BIZ = 'wb-installed-biz-agents-v1';
    const STORAGE_BIZ_SUPPORT = 'wb-installed-biz-agents-support-v1';
    const STORAGE_ASSISTANTS = 'wb-installed-assistants-v1';
    const STORAGE_ASSISTANTS_SUPPORT = 'wb-installed-assistants-support-v1';
    const STORAGE_SKILLS = 'wb-installed-skills-v1';
    const STORAGE_BIZ_ORDER = 'wb-biz-agents-order-v1';
    const STORAGE_BIZ_ORDER_SUPPORT = 'wb-biz-agents-order-support-v1';
    const STORAGE_ASSISTANT_ORDER = 'wb-assistants-order-v1';
    const STORAGE_ASSISTANT_ORDER_SUPPORT = 'wb-assistants-order-support-v1';

    const DEFAULT_BIZ_IDS = ['ib', 'asset', 'retail', 'invest', 'sales', 'institution', 'research', 'credit'];
    /** 顶部业务助理栏不展示的 ID（两工作台共用） */
    const HIDDEN_TOP_BIZ_AGENT_IDS = ['verify'];
    const DEFAULT_ASSISTANT_IDS = ['canmou', 'tanma', 'junshi', 'jiaocha', 'tianyan'];
    const DEFAULT_SUPPORT_ASSISTANT_IDS = ['support-tasks', 'support-exceptions'];
    const DEFAULT_SKILL_IDS = ['skill-customer-portrait', 'skill-business-match', 'skill-solution-gen', 'skill-cross-verify', 'skill-service-reply'];

    const BIZ_AGENT_CATALOG = [
        { id: 'ib', name: '投行业务助理', image: 'images/Avatar1.png' },
        { id: 'asset', name: '资管业务助理', image: 'images/Avatar2.png' },
        { id: 'retail', name: '零售业务助理', image: 'images/Avatar3.png' },
        { id: 'invest', name: '投资业务助理', image: 'images/Avatar4.png' },
        { id: 'sales', name: '销交业务助理', image: 'images/Avatar5.png' },
        { id: 'institution', name: '机构业务助理', image: 'images/Avatar6.png' },
        { id: 'research', name: '研究业务助理', image: 'images/Avatar8.png' },
        { id: 'credit', name: '信用业务助理', image: 'images/Avatar9.png' },
        { id: 'verify', name: '交叉验证助理', image: 'images/Avatar7.png' },
        { id: 'wealth', name: '财富业务助理', image: 'images/Avatar2.png', isNew: true },
        { id: 'fixed', name: '固收业务助理', image: 'images/Avatar6.png', isNew: true },
        { id: 'quant', name: '量化业务助理', image: 'images/Avatar4.png', isNew: true }
    ];

    const ASSISTANT_CATALOG = [
        { id: 'canmou', name: '客户分析助手', emoji: '🧠', desc: '多维分析看客户', avatarClass: 'canmou', chatIndex: 0 },
        { id: 'tanma', name: '业务分析助手', emoji: '🐎', desc: '业务分析找客户', avatarClass: 'tanma', chatIndex: 1 },
        { id: 'junshi', name: '方案生成助手', emoji: '📋', desc: '生成方案显韬略', avatarClass: 'junshi', chatIndex: 2 },
        { id: 'jiaocha', name: '交叉验证助手', emoji: '🔍', desc: '交叉核验保准确', avatarClass: 'jiaocha', chatIndex: 3 },
        { id: 'tianyan', name: '客户服务助手', emoji: '👁️', desc: '专业高效做服务', avatarClass: 'tianyan', chatIndex: 4 },
        { id: 'hegui', name: '合规审查助手', emoji: '⚖️', desc: '合规风险快筛查', avatarClass: 'canmou', chatIndex: 0, isNew: true },
        { id: 'shuju', name: '数据洞察助手', emoji: '📊', desc: '数据穿透看经营', avatarClass: 'tanma', chatIndex: 1, isNew: true },
        { id: 'xuqiu', name: '意图识别助手', emoji: '💡', desc: '合作意图深识别', avatarClass: 'junshi', chatIndex: 2, isNew: true }
    ];

    const SUPPORT_ASSISTANT_CATALOG = [
        { id: 'support-tasks', name: '今日任务助手', image: 'images/daily-task-assistant-avatar.png', desc: '待办协同事项汇总', avatarClass: 'support-home-card-avatar--tasks', supportCard: 'tasks' },
        { id: 'support-exceptions', name: '异常提醒助手', emoji: '⚠️', desc: '需关注异常汇总', avatarClass: 'support-exceptions-avatar', supportCard: 'exceptions' }
    ];

    const SKILL_CATALOG = [
        { id: 'skill-customer-portrait', name: '客户分析', category: '客户分析', desc: '从资产、行为、交易等维度做客观分层分析' },
        { id: 'skill-business-match', name: '业务模型匹配', category: '业务分析', desc: '按业务分析模型自动匹配目标与路径' },
        { id: 'skill-solution-gen', name: '方案自动生成', category: '方案生成', desc: '基于模板与上下文生成业务方案' },
        { id: 'skill-cross-verify', name: '交叉验证核验', category: '交叉验证', desc: '多源数据交叉比对，识别异常与偏差' },
        { id: 'skill-service-reply', name: '客户服务应答', category: '客户服务', desc: '买方分析、信披判断与公告生成' },
        { id: 'skill-travel-audit', name: '差旅合规审计', category: '交叉验证', desc: '差旅预订、退改签与超标行为分析', isNew: true },
        { id: 'skill-expense-check', name: '费用报销核验', category: '交叉验证', desc: '报销频次、金额与部门均值对比', isNew: true },
        { id: 'skill-kpi-forecast', name: '绩效收入预测', category: '业务分析', desc: '基于历史数据预测绩效收入区间', isNew: true },
        { id: 'skill-doc-summary', name: '文档智能摘要', category: '通用', desc: '长文档快速提炼要点与行动项', isNew: true }
    ];

    let eventsBound = false;
    let currentManageTab = 'assistants';
    let dragDidMove = false;
    const dragState = { sourceId: null, storageType: null };

    function readStorage(key, defaults) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return defaults.slice();
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : defaults.slice();
        } catch {
            return defaults.slice();
        }
    }

    function writeStorage(key, ids) {
        localStorage.setItem(key, JSON.stringify(ids));
    }

    function getPanelKey(panel) {
        return panel?.dataset?.panel || 'employee';
    }

    function isSupportPanelKey(panelKey) {
        return panelKey === 'support';
    }

    function getSupportManageAssistantCatalog() {
        return SUPPORT_ASSISTANT_CATALOG.concat(ASSISTANT_CATALOG);
    }

    function getAssistantCatalog(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        return isSupportPanelKey(key) ? getSupportManageAssistantCatalog() : ASSISTANT_CATALOG;
    }

    function getDefaultAssistantIds(panelKey) {
        return isSupportPanelKey(panelKey) ? DEFAULT_SUPPORT_ASSISTANT_IDS : DEFAULT_ASSISTANT_IDS;
    }

    function getAssistantStorageKey(panelKey) {
        return isSupportPanelKey(panelKey) ? STORAGE_ASSISTANTS_SUPPORT : STORAGE_ASSISTANTS;
    }

    function getAssistantOrderStorageKey(panelKey) {
        return isSupportPanelKey(panelKey) ? STORAGE_ASSISTANT_ORDER_SUPPORT : STORAGE_ASSISTANT_ORDER;
    }

    function getBizStorageKey(panelKey) {
        return isSupportPanelKey(panelKey) ? STORAGE_BIZ_SUPPORT : STORAGE_BIZ;
    }

    function getBizOrderStorageKey(panelKey) {
        return isSupportPanelKey(panelKey) ? STORAGE_BIZ_ORDER_SUPPORT : STORAGE_BIZ_ORDER;
    }

    function getInstalledBizIds(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        return readStorage(getBizStorageKey(key), DEFAULT_BIZ_IDS)
            .filter((id) => !HIDDEN_TOP_BIZ_AGENT_IDS.includes(id));
    }

    function getInstalledAssistantIds(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        return readStorage(getAssistantStorageKey(key), getDefaultAssistantIds(key));
    }

    function getInstalledSkillIds() {
        return readStorage(STORAGE_SKILLS, DEFAULT_SKILL_IDS);
    }

    function setInstalledBizIds(ids, panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        writeStorage(getBizStorageKey(key), sortInstalledByCatalogOrder(ids, getBizCatalogOrder(key)));
        syncCenterAgentsBar();
    }

    function setInstalledAssistantIds(ids, panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        writeStorage(
            getAssistantStorageKey(key),
            sortInstalledByCatalogOrder(ids, getAssistantCatalogOrder(key))
        );
        if (isSupportPanelKey(key)) {
            syncSupportHomeCards();
        } else {
            syncAiCardsFan();
        }
    }

    function setInstalledSkillIds(ids) {
        writeStorage(STORAGE_SKILLS, ids);
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getActiveWorkbenchPanel() {
        return document.querySelector('.workbench-panel.active') || document.getElementById('workbench-panel-employee');
    }

    function getPanelScopedId(baseId) {
        const panel = getActiveWorkbenchPanel();
        const key = panel?.dataset?.panel;
        if (key && key !== 'employee') return baseId + '-' + key;
        return baseId;
    }

    function getCenterAgentsListElements() {
        const lists = [];
        const mainList = document.getElementById('center-agents-list');
        if (mainList) lists.push(mainList);
        queryInPanels('[id^="center-agents-list"]').forEach((el) => {
            if (!lists.includes(el)) lists.push(el);
        });
        return lists;
    }

    function queryInPanels(selector) {
        const employee = document.getElementById('workbench-panel-employee');
        const support = document.getElementById('workbench-panel-support');
        const results = [];
        [employee, support].forEach((panel) => {
            if (!panel) return;
            panel.querySelectorAll(selector).forEach((el) => results.push(el));
        });
        return results;
    }

    function reorderIds(ids, sourceId, targetId) {
        const from = ids.indexOf(sourceId);
        const to = ids.indexOf(targetId);
        if (from < 0 || to < 0 || from === to) return ids;
        const next = ids.slice();
        next.splice(from, 1);
        next.splice(to, 0, sourceId);
        return next;
    }

    function mergeCatalogOrder(storedIds, catalog) {
        const allIds = catalog.map((item) => item.id);
        const seen = new Set();
        const merged = [];
        storedIds.forEach((id) => {
            if (allIds.includes(id) && !seen.has(id)) {
                merged.push(id);
                seen.add(id);
            }
        });
        allIds.forEach((id) => {
            if (!seen.has(id)) {
                merged.push(id);
                seen.add(id);
            }
        });
        return merged;
    }

    function getBizCatalogOrder(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        return mergeCatalogOrder(
            readStorage(getBizOrderStorageKey(key), BIZ_AGENT_CATALOG.map((a) => a.id)),
            BIZ_AGENT_CATALOG
        );
    }

    function getAssistantCatalogOrder(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        const catalog = getAssistantCatalog(key);
        return mergeCatalogOrder(
            readStorage(getAssistantOrderStorageKey(key), catalog.map((a) => a.id)),
            catalog
        );
    }

    function sortInstalledByCatalogOrder(installedIds, catalogOrder) {
        const installedSet = new Set(installedIds);
        const ordered = catalogOrder.filter((id) => installedSet.has(id));
        installedIds.forEach((id) => {
            if (!ordered.includes(id)) ordered.push(id);
        });
        return ordered;
    }

    function getOrderedBizCatalog(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        const map = Object.fromEntries(BIZ_AGENT_CATALOG.map((a) => [a.id, a]));
        return getBizCatalogOrder(key).map((id) => map[id]).filter(Boolean);
    }

    function getOrderedAssistantCatalog(panelKey) {
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        const map = Object.fromEntries(getAssistantCatalog(key).map((a) => [a.id, a]));
        return getAssistantCatalogOrder(key).map((id) => map[id]).filter(Boolean);
    }

    function applyCatalogDragReorder(type, sourceId, targetId, panelKey) {
        if (type === 'biz') {
            const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
            const newOrder = reorderIds(getBizCatalogOrder(key), sourceId, targetId);
            writeStorage(getBizOrderStorageKey(key), newOrder);
            writeStorage(getBizStorageKey(key), sortInstalledByCatalogOrder(getInstalledBizIds(key), newOrder));
            syncCenterAgentsBar();
            renderManageBizAgentsPage();
            return;
        }
        const key = panelKey || getPanelKey(getActiveWorkbenchPanel());
        const newOrder = reorderIds(getAssistantCatalogOrder(key), sourceId, targetId);
        writeStorage(getAssistantOrderStorageKey(key), newOrder);
        writeStorage(
            getAssistantStorageKey(key),
            sortInstalledByCatalogOrder(getInstalledAssistantIds(key), newOrder)
        );
        if (isSupportPanelKey(key)) {
            syncSupportHomeCards();
        } else {
            syncAiCardsFan();
        }
        renderManageAssistantsPage();
    }

    function bindManagePageDragSort(listEl, type) {
        if (!listEl) return;
        listEl.dataset.dragBound = '';
        bindDragSort(listEl, {
            itemSelector: '.manage-item-card.is-draggable',
            idAttr: 'manageId',
            onReorder(sourceId, targetId) {
                applyCatalogDragReorder(type, sourceId, targetId, getPanelKey(getActiveWorkbenchPanel()));
            }
        });
    }

    function bindDragSort(container, config) {
        if (!container || container.dataset.dragBound === '1') return;
        container.dataset.dragBound = '1';

        const { itemSelector, idAttr, storageType, onReorder } = config;

        container.addEventListener('dragstart', (event) => {
            if (event.target.closest('button, label, input, .manage-toggle, .manage-summon-btn, .center-agents-add-btn, .ai-cards-add-btn')) {
                event.preventDefault();
                return;
            }
            const item = event.target.closest(itemSelector);
            if (!item) return;
            const id = item.dataset[idAttr];
            if (!id) return;
            dragDidMove = false;
            dragState.sourceId = id;
            dragState.storageType = storageType;
            item.classList.add('is-dragging');
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', id);
        });

        container.addEventListener('dragover', (event) => {
            const item = event.target.closest(itemSelector);
            if (!item || item.dataset[idAttr] === dragState.sourceId) return;
            event.preventDefault();
            dragDidMove = true;
            container.querySelectorAll(`${itemSelector}.is-drag-over`).forEach((el) => el.classList.remove('is-drag-over'));
            item.classList.add('is-drag-over');
        });

        container.addEventListener('dragleave', (event) => {
            const item = event.target.closest(itemSelector);
            if (item) item.classList.remove('is-drag-over');
        });

        container.addEventListener('drop', (event) => {
            event.preventDefault();
            const target = event.target.closest(itemSelector);
            if (!target || !dragState.sourceId) return;
            const targetId = target.dataset[idAttr];
            target.classList.remove('is-drag-over');
            if (!targetId || targetId === dragState.sourceId) return;

            if (typeof onReorder === 'function') {
                onReorder(dragState.sourceId, targetId);
            } else if (storageType === 'biz') {
                const panelKey = getPanelKey(getActiveWorkbenchPanel());
                const newOrder = reorderIds(getBizCatalogOrder(panelKey), dragState.sourceId, targetId);
                writeStorage(getBizOrderStorageKey(panelKey), newOrder);
                writeStorage(getBizStorageKey(panelKey), sortInstalledByCatalogOrder(getInstalledBizIds(panelKey), newOrder));
                syncCenterAgentsBar();
            } else if (storageType === 'assistant') {
                const newOrder = reorderIds(getAssistantCatalogOrder('employee'), dragState.sourceId, targetId);
                writeStorage(STORAGE_ASSISTANT_ORDER, newOrder);
                writeStorage(STORAGE_ASSISTANTS, sortInstalledByCatalogOrder(getInstalledAssistantIds('employee'), newOrder));
                syncAiCardsFan();
            }
            dragState.sourceId = null;
            dragState.storageType = null;
        });

        container.addEventListener('dragend', (event) => {
            const item = event.target.closest(itemSelector);
            if (item) item.classList.remove('is-dragging', 'is-drag-over');
            dragState.sourceId = null;
            dragState.storageType = null;
            if (dragDidMove) {
                setTimeout(() => { dragDidMove = false; }, 0);
            }
        });
    }

    function bindHomeDragSort() {
        getCenterAgentsListElements().forEach((listEl) => {
            bindDragSort(listEl, {
                itemSelector: '.avatar-item[draggable="true"]',
                idAttr: 'avatarType',
                storageType: 'biz'
            });
        });
    }

    function syncCenterAgentsBar() {
        const panelKey = getPanelKey(getActiveWorkbenchPanel());
        const installed = sortInstalledByCatalogOrder(getInstalledBizIds(panelKey), getBizCatalogOrder(panelKey));
        const catalogMap = Object.fromEntries(BIZ_AGENT_CATALOG.map((a) => [a.id, a]));

        getCenterAgentsListElements().forEach((listEl) => {
            const html = installed
                .map((id) => catalogMap[id])
                .filter(Boolean)
                .map((agent) => `
                    <div class="avatar-item is-draggable" draggable="true" data-avatar-type="${agent.id}" title="按住可拖拽调整顺序">
                        <div class="avatar-img-wrap" onclick="if(!window.__wbDragDidMove){handleTopAvatarClick('${agent.id}')}"><img src="${agent.image}" alt="" class="avatar-img"></div>
                        <span class="avatar-name">${escapeHtml(agent.name)}</span>
                    </div>
                `).join('');
            listEl.innerHTML = html;
            listEl.dataset.dragBound = '';
            bindDragSort(listEl, {
                itemSelector: '.avatar-item[draggable="true"]',
                idAttr: 'avatarType',
                storageType: 'biz'
            });
        });

        if (typeof window.updateDigitalAvatarsScrollButtons === 'function') {
            window.updateDigitalAvatarsScrollButtons();
        }
        if (typeof window.updateSupportAvatarPendingDots === 'function') {
            window.updateSupportAvatarPendingDots();
        }
    }

    function getSupportHomeCardDesc(agent) {
        if (agent.supportCard === 'tasks') {
            const count = typeof window.getSupportTotalTaskCount === 'function' ? window.getSupportTotalTaskCount() : 0;
            return `${count} 项待办协同`;
        }
        if (agent.supportCard === 'exceptions') {
            const count = typeof window.collectSupportExceptionAlerts === 'function'
                ? window.collectSupportExceptionAlerts().length
                : 0;
            return `${count} 项需关注`;
        }
        return agent.desc || '';
    }

    function buildSupportHomeCardAvatarHtml(agent) {
        if (agent.image) {
            return `<img src="${escapeHtml(agent.image)}" alt="" class="support-home-card-avatar-img">`;
        }
        return agent.emoji || '';
    }

    function buildSupportHomeCardHtml(agent) {
        if (agent.supportCard) {
            const label = agent.supportCard === 'tasks' ? '查看今日任务助手' : '查看异常提醒助手';
            const iconHtml = agent.supportCard === 'tasks'
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M7 3.5V7"/><path d="M17 3.5V7"/><path d="M3.5 9h17"/></svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l9 16H3l9-16z"/><path d="M12 9v5"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/></svg>`;
            return `
                <button type="button" class="employee-home-assistant-tab support-home-card support-home-card-tab ${agent.supportCard === 'tasks' ? 'support-home-card-tab--tasks' : 'support-home-card-tab--exceptions'}" data-support-card="${agent.supportCard}" aria-label="${label}">
                    <span class="employee-home-assistant-tab-icon support-home-card-tab-icon" aria-hidden="true">${iconHtml}</span>
                    <span class="employee-home-assistant-tab-text">${escapeHtml(agent.supportCard === 'tasks' ? '今日任务' : '异常提醒')}</span>
                </button>
            `;
        }
        return '';
    }

    function syncSupportHomeCards(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const fanEl = p?.querySelector('.support-home-cards-fan');
        if (!fanEl) return;

        const installed = sortInstalledByCatalogOrder(
            getInstalledAssistantIds('support'),
            getAssistantCatalogOrder('support')
        );
        const catalogMap = Object.fromEntries(getSupportManageAssistantCatalog().map((a) => [a.id, a]));

        fanEl.innerHTML = installed.map((id) => {
            const agent = catalogMap[id];
            if (!agent?.supportCard) return '';
            return buildSupportHomeCardHtml(agent);
        }).join('') || '<div class="manage-empty-hint">暂无已展示助手，请前往「新增」添加</div>';

        requestAnimationFrame(() => window.syncHomeCardsFanLayout?.(p));
        window.syncSupportInputAgentPickers?.();
        window.syncSupportAssistantTags?.(p);
    }

    function getInstalledSupportAssistantsForHome() {
        const installed = sortInstalledByCatalogOrder(
            getInstalledAssistantIds('support'),
            getAssistantCatalogOrder('support')
        );
        const catalogMap = Object.fromEntries(getSupportManageAssistantCatalog().map((a) => [a.id, a]));
        return installed.map((id, listIndex) => {
            const agent = catalogMap[id];
            if (!agent) return null;
            return {
                id: agent.id,
                name: agent.name,
                emoji: agent.emoji,
                image: agent.image,
                avatarClass: agent.avatarClass,
                supportCard: agent.supportCard || null,
                listIndex
            };
        }).filter(Boolean);
    }

    function syncAiCardsFan() {
        const installed = sortInstalledByCatalogOrder(getInstalledAssistantIds('employee'), getAssistantCatalogOrder('employee'));
        const catalogMap = Object.fromEntries(ASSISTANT_CATALOG.map((a) => [a.id, a]));
        const fanEl = document.getElementById('ai-cards-fan');
        if (!fanEl) return;

        const cards = installed.map((id, index) => {
            const agent = catalogMap[id];
            if (!agent) return '';
            const activeClass = index === 0 ? ' active' : '';
            return `
                <div class="ai-card-fan${activeClass}" data-index="${index}" data-assistant-id="${agent.id}" onclick="bringToFront(this)">
                    <div class="ai-card-fan-inner">
                        <div class="ai-card-fan-avatar ${agent.avatarClass}">${agent.emoji}</div>
                        <div class="ai-card-fan-name">${escapeHtml(agent.name)}</div>
                        <div class="ai-card-fan-desc">${escapeHtml(agent.desc)}</div>
                    </div>
                </div>
            `;
        }).join('');

        fanEl.innerHTML = cards || '<div class="manage-empty-hint">暂无已安装助手，请前往「新增」添加</div>';

        const indicators = document.querySelector('#ai-carousel-view .card-indicators');
        if (indicators) {
            indicators.innerHTML = installed.map((_, i) =>
                `<span class="indicator${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
            ).join('');
        }

        requestAnimationFrame(() => window.syncHomeCardsFanLayout?.());
        const employeePanel = document.getElementById('workbench-panel-employee');
        if (employeePanel) window.refreshInputSkillPickers?.(employeePanel);
        window.syncEmployeeMiniAvatars?.();
        window.syncEmployeeAssistantTags?.();
    }

    function getInstalledEmployeeAssistantsForHome() {
        const installed = sortInstalledByCatalogOrder(getInstalledAssistantIds('employee'), getAssistantCatalogOrder('employee'));
        const catalogMap = Object.fromEntries(ASSISTANT_CATALOG.map((a) => [a.id, a]));
        return installed.map((id, listIndex) => {
            const agent = catalogMap[id];
            if (!agent) return null;
            return {
                id: agent.id,
                name: agent.name,
                emoji: agent.emoji,
                avatarClass: agent.avatarClass,
                chatIndex: typeof agent.chatIndex === 'number' ? agent.chatIndex : listIndex,
                listIndex
            };
        }).filter(Boolean);
    }

    function refreshManageOverlayScrollbars() {
        const panel = getActiveWorkbenchPanel();
        if (panel) window.initOverlayScrollbars?.(panel);
        else window.initOverlayScrollbars?.();
    }

    function buildManageCard(item, installed, type) {
        const isOn = installed.includes(item.id);
        const statusClass = isOn ? 'is-installed' : 'is-not-installed';
        const statusText = isOn ? '已展示' : '未展示';
        const avatarHtml = type === 'biz' || item.image
            ? `<img src="${item.image}" alt="" class="manage-item-avatar-img">`
            : `<span class="manage-item-avatar-emoji ${item.avatarClass || ''}" aria-hidden="true">${item.emoji || '🤖'}</span>`;

        return `
            <article class="manage-item-card is-draggable ${statusClass}" draggable="true" role="listitem" data-manage-type="${type}" data-manage-id="${item.id}" title="按住可拖拽调整顺序">
                <div class="manage-item-avatar">${avatarHtml}</div>
                <div class="manage-item-body">
                    <div class="manage-item-head">
                        <h3 class="manage-item-name">${escapeHtml(item.name)}</h3>
                    </div>
                    <p class="manage-item-desc">${escapeHtml(item.desc || '业务条线专属助理')}</p>
                </div>
                <div class="manage-item-actions">
                    <button type="button" class="manage-summon-btn" data-summon-type="${type}" data-summon-id="${item.id}">召唤</button>
                    <span class="manage-item-status">${statusText}</span>
                    <label class="manage-toggle" aria-label="${isOn ? '取消展示' : '展示'} ${escapeHtml(item.name)}">
                        <input type="checkbox" class="manage-toggle-input" data-manage-type="${type}" data-manage-id="${item.id}" ${isOn ? 'checked' : ''}>
                        <span class="manage-toggle-track"></span>
                    </label>
                </div>
            </article>
        `;
    }

    function renderManageBizAgentsPage() {
        const listEl = document.getElementById(getPanelScopedId('manage-biz-agents-list'));
        if (!listEl) return;
        const panelKey = getPanelKey(getActiveWorkbenchPanel());
        const installed = getInstalledBizIds(panelKey);
        listEl.innerHTML = getOrderedBizCatalog(panelKey).map((item) => buildManageCard(item, installed, 'biz')).join('');
        bindManagePageDragSort(listEl, 'biz');
        refreshManageOverlayScrollbars();
    }

    function renderManageAssistantsPage() {
        const listEl = document.getElementById(getPanelScopedId('manage-assistants-list'));
        if (!listEl) return;
        const panelKey = getPanelKey(getActiveWorkbenchPanel());
        const installed = getInstalledAssistantIds(panelKey);
        listEl.innerHTML = getOrderedAssistantCatalog(panelKey).map((item) => buildManageCard(item, installed, 'assistant')).join('');
        bindManagePageDragSort(listEl, 'assistant');
        refreshManageOverlayScrollbars();
    }

    function renderManageSkillsPage() {
        const listEl = document.getElementById(getPanelScopedId('manage-skills-list'));
        if (!listEl) return;
        const installed = getInstalledSkillIds();

        listEl.innerHTML = SKILL_CATALOG.map((skill) => {
            const isOn = installed.includes(skill.id);
            return `
                <article class="manage-skill-card ${isOn ? 'is-installed' : 'is-not-installed'}" role="listitem" data-skill-id="${skill.id}">
                    <div class="manage-skill-main">
                        <div class="manage-skill-head">
                            <h3 class="manage-skill-name">${escapeHtml(skill.name)}</h3>
                            <span class="manage-skill-tag">${escapeHtml(skill.category)}</span>
                        </div>
                        <p class="manage-skill-desc">${escapeHtml(skill.desc)}</p>
                    </div>
                    <div class="manage-skill-action">
                        <span class="manage-skill-status">${isOn ? '已安装' : '未安装'}</span>
                        <button type="button" class="manage-skill-btn${isOn ? ' manage-skill-btn--installed' : ''}" data-skill-id="${skill.id}" data-skill-installed="${isOn}">
                            ${isOn ? '卸载' : '安装'}
                        </button>
                    </div>
                </article>
            `;
        }).join('');
        refreshManageOverlayScrollbars();
    }

    function switchManageTab(tabKey) {
        currentManageTab = tabKey;
        const panel = getActiveWorkbenchPanel();
        if (!panel) return;

        panel.querySelectorAll('.manage-tab').forEach((tab) => {
            const active = tab.dataset.manageTab === tabKey;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', String(active));
        });

        panel.querySelectorAll('.manage-tab-panel').forEach((panelEl) => {
            const active = panelEl.dataset.managePanel === tabKey;
            panelEl.classList.toggle('is-active', active);
            panelEl.hidden = !active;
        });

        if (tabKey === 'skills') renderManageSkillsPage();
        else renderManageAssistantsPage();
    }

    function toggleBizAgent(id, enabled) {
        const panelKey = getPanelKey(getActiveWorkbenchPanel());
        let ids = getInstalledBizIds(panelKey);
        if (enabled && !ids.includes(id)) ids.push(id);
        if (!enabled) ids = ids.filter((x) => x !== id);
        if (!ids.length) ids = [id];
        setInstalledBizIds(ids, panelKey);
        renderManageBizAgentsPage();
    }

    function toggleAssistant(id, enabled) {
        const panelKey = getPanelKey(getActiveWorkbenchPanel());
        let ids = getInstalledAssistantIds(panelKey);
        if (enabled && !ids.includes(id)) ids.push(id);
        if (!enabled) ids = ids.filter((x) => x !== id);
        if (!ids.length) ids = [id];
        setInstalledAssistantIds(ids, panelKey);
        renderManageAssistantsPage();
    }

    function toggleSkill(id) {
        let ids = getInstalledSkillIds();
        if (ids.includes(id)) {
            ids = ids.filter((x) => x !== id);
        } else {
            ids.push(id);
        }
        setInstalledSkillIds(ids);
        renderManageSkillsPage();
        window.refreshInputSkillPickers?.();
    }

    function getAssistantSkillOwnerKey(assistantName) {
        if (!assistantName) return '';
        return String(assistantName).replace(/(助手|助理)$/, '').trim();
    }

    function getSkillById(skillId) {
        return SKILL_CATALOG.find((skill) => skill.id === skillId) || null;
    }

    function getInstalledSkillsForOwner(ownerKey) {
        const key = (ownerKey || '').trim();
        const installed = new Set(getInstalledSkillIds());
        return SKILL_CATALOG.filter((skill) => {
            if (!installed.has(skill.id)) return false;
            if (skill.category === '通用') return true;
            return key && skill.category === key;
        });
    }

    function summonBizAgent(id) {
        const agent = BIZ_AGENT_CATALOG.find((a) => a.id === id);
        const name = agent?.name || '业务助理';
        window.AppShell?.returnToMainSessionView({ resetChat: true });
        setTimeout(() => {
            if (typeof handleTopAvatarClick === 'function') {
                handleTopAvatarClick(id);
            } else {
                window.alert(`正在跳转至「${name}」工作台…`);
            }
        }, 120);
    }

    function summonFunctionalAssistant(id) {
        const panelKey = getPanelKey(getActiveWorkbenchPanel());
        const catalog = getAssistantCatalog(panelKey);
        const agent = catalog.find((a) => a.id === id);
        if (!agent) return;

        window.AppShell?.returnToMainSessionView({ resetChat: true });
        setTimeout(() => {
            if (isSupportPanelKey(panelKey) && agent.supportCard) {
                window.openSupportHomeCardInChat?.(agent.supportCard, { fromSummon: true });
                return;
            }
            if (isSupportPanelKey(panelKey)) {
                window.openSupportFunctionalAssistantInChat?.(agent.id);
                return;
            }
            window.openEmployeeAssistantInChat?.(agent.id);
        }, 120);
    }

    function bindEventsOnce() {
        if (eventsBound) return;
        eventsBound = true;

        document.addEventListener('dragstart', () => {
            dragDidMove = false;
        }, true);

        document.addEventListener('dragover', () => {
            dragDidMove = true;
            window.__wbDragDidMove = true;
        }, true);

        document.addEventListener('dragend', () => {
            if (dragDidMove) {
                window.__wbDragDidMove = true;
                setTimeout(() => { window.__wbDragDidMove = false; }, 200);
            }
        }, true);

        document.addEventListener('click', (event) => {
            const addBizBtn = event.target.closest('#center-agents-add-btn, #center-agents-add-btn-support');
            if (addBizBtn) {
                event.preventDefault();
                window.openManageBizAgents?.();
                return;
            }

            const addCardsBtn = event.target.closest('#ai-cards-add-btn, #support-home-cards-add-btn');
            if (addCardsBtn) {
                event.preventDefault();
                window.openManageAssistants?.();
                return;
            }

            const backBiz = event.target.closest('.manage-biz-back-btn');
            if (backBiz) {
                event.preventDefault();
                window.AppShell?.returnToMainSessionView({ resetChat: true });
                return;
            }

            const backAssistants = event.target.closest('.manage-assistants-back-btn');
            if (backAssistants) {
                event.preventDefault();
                window.AppShell?.returnToMainSessionView({ resetChat: true });
                return;
            }

            const manageTab = event.target.closest('.manage-tab');
            if (manageTab?.dataset.manageTab) {
                event.preventDefault();
                switchManageTab(manageTab.dataset.manageTab);
                return;
            }

            const summonBtn = event.target.closest('.manage-summon-btn');
            if (summonBtn?.dataset.summonId) {
                event.preventDefault();
                if (summonBtn.dataset.summonType === 'biz') {
                    summonBizAgent(summonBtn.dataset.summonId);
                } else {
                    summonFunctionalAssistant(summonBtn.dataset.summonId);
                }
                return;
            }

            const skillBtn = event.target.closest('.manage-skill-btn');
            if (skillBtn?.dataset.skillId) {
                event.preventDefault();
                toggleSkill(skillBtn.dataset.skillId);
                return;
            }
        });

        document.addEventListener('change', (event) => {
            const input = event.target.closest('.manage-toggle-input');
            if (!input) return;
            const { manageType, manageId } = input.dataset;
            if (manageType === 'biz') toggleBizAgent(manageId, input.checked);
            if (manageType === 'assistant') toggleAssistant(manageId, input.checked);
        });
    }

    window.openManageBizAgents = function () {
        window.AppShell?.setCenterView('manageBizAgents');
        renderManageBizAgentsPage();
        requestAnimationFrame(() => {
            const panel = getActiveWorkbenchPanel();
            const scrollEl = panel?.querySelector('.center-manage-biz-view:not([hidden]) .module-page-scroll');
            if (scrollEl) scrollEl.scrollTop = 0;
        });
    };

    window.openManageAssistants = function (tabKey) {
        window.AppShell?.setCenterView('manageAssistants');
        if (tabKey) switchManageTab(tabKey);
        else {
            switchManageTab(currentManageTab || 'assistants');
        }
        requestAnimationFrame(() => {
            const panel = getActiveWorkbenchPanel();
            const scrollEl = panel?.querySelector('.center-manage-assistants-view:not([hidden]) .module-page-scroll');
            if (scrollEl) scrollEl.scrollTop = 0;
        });
    };

    window.renderManageBizAgentsPage = renderManageBizAgentsPage;
    window.renderManageAssistantsPage = renderManageAssistantsPage;
    window.renderManageSkillsPage = renderManageSkillsPage;
    window.syncCenterAgentsBar = syncCenterAgentsBar;

    function bindManageAddButtons() {
        queryInPanels('#center-agents-add-btn, #ai-cards-add-btn, #support-home-cards-add-btn').forEach((btn) => {
            if (btn.dataset.manageAddBound === '1') return;
            btn.dataset.manageAddBound = '1';
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (btn.id === 'center-agents-add-btn' || btn.id === 'center-agents-add-btn-support') {
                    window.openManageBizAgents?.();
                    return;
                }
                window.openManageAssistants?.();
            });
        });
    }

    window.syncSupportHomeCards = syncSupportHomeCards;
    window.getInstalledSupportAssistantsForHome = getInstalledSupportAssistantsForHome;
    window.getSupportFunctionalAssistantMeta = function (id) {
        return ASSISTANT_CATALOG.find((a) => a.id === id) || null;
    };
    window.getAssistantCatalogEntry = function (id, panelKey) {
        return getAssistantCatalog(panelKey || getPanelKey(getActiveWorkbenchPanel())).find((a) => a.id === id) || null;
    };
    window.getInstalledEmployeeAssistantsForHome = getInstalledEmployeeAssistantsForHome;
    window.getAssistantSkillOwnerKey = getAssistantSkillOwnerKey;
    window.getInstalledSkillsForOwner = getInstalledSkillsForOwner;
    window.getSkillById = getSkillById;

    window.initAssistantManagement = function () {
        bindEventsOnce();
        syncCenterAgentsBar();
        syncAiCardsFan();
        syncSupportHomeCards();
        bindHomeDragSort();
        bindManageAddButtons();
        window.refreshInputSkillPickers?.();
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.initAssistantManagement();
    });
})();
