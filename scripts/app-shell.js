/**
 * 三栏布局壳：导航、会话历史、栏折叠
 */
(function () {
    const LAYOUT_KEY = 'workbench-layout-state';
    const SESSIONS_KEY = 'workbench-sessions-v1';

    let currentBcMenu = 'tasks';
    let currentCenterView = 'session';

    const CENTER_VIEW_IDS = {
        session: 'center-view-session',
        performance: 'center-view-performance',
        travel: 'center-view-travel',
        exceptions: 'center-view-exceptions',
        manageBizAgents: 'center-view-manage-biz-agents',
        manageAssistants: 'center-view-manage-assistants'
    };

    function getActiveWorkbenchPanel() {
        return document.querySelector('.workbench-panel.active')
            || document.getElementById('workbench-panel-employee');
    }

    function getCenterModuleEl(view, panel) {
        const activePanel = panel || getActiveWorkbenchPanel();
        const baseId = CENTER_VIEW_IDS[view];
        if (!activePanel || !baseId) return null;
        const panelKey = activePanel.dataset.panel || 'employee';
        const scopedId = panelKey === 'employee' ? baseId : `${baseId}-${panelKey}`;
        return activePanel.querySelector(`#${scopedId}`)
            || document.getElementById(scopedId)
            || activePanel.querySelector(`#${baseId}`)
            || document.getElementById(baseId);
    }

    function getNavItemPanelKey(item) {
        if (!item) return 'employee';
        if (item.classList.contains('support-only-nav') || item.closest('.support-only-nav')) {
            return 'support';
        }
        return 'employee';
    }

    function ensureSupportPanelActive() {
        document.querySelectorAll('.workbench-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.panel === 'support');
        });
        document.body.classList.add('support-tab-active');
        document.body.classList.remove('org-tab-active', 'employee-chat-mode');
        syncBreadcrumbForRole('support');
    }

    function ensurePanelActiveByNavItem(item) {
        if (!item) return;
        const targetPanelKey = getNavItemPanelKey(item);
        document.querySelectorAll('.workbench-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.panel === targetPanelKey);
        });
        document.body.classList.toggle('support-tab-active', targetPanelKey === 'support');
        document.body.classList.toggle('org-tab-active', false);
    }

    function setCenterView(view) {
        currentCenterView = view || 'session';
        const panel = getActiveWorkbenchPanel();
        Object.keys(CENTER_VIEW_IDS).forEach((name) => {
            const el = getCenterModuleEl(name, panel);
            if (!el) return;
            const isActive = name === currentCenterView;
            el.hidden = !isActive;
            if (isActive) el.removeAttribute('hidden');
            else el.setAttribute('hidden', '');
        });

        const isSupport = panel?.dataset?.panel === 'support';
        document.body.classList.toggle('support-exceptions-view-active', isSupport && currentCenterView === 'exceptions');
        document.body.classList.toggle('employee-performance-view-active', !isSupport && (
            currentCenterView === 'performance'
            || currentCenterView === 'travel'
            || currentCenterView === 'exceptions'
            || currentCenterView === 'manageBizAgents'
            || currentCenterView === 'manageAssistants'
        ));
        document.body.classList.toggle('employee-manage-view-active', !isSupport && (
            currentCenterView === 'manageBizAgents' || currentCenterView === 'manageAssistants'
        ));
        document.body.classList.toggle('support-manage-view-active', isSupport && (
            currentCenterView === 'manageBizAgents' || currentCenterView === 'manageAssistants'
        ));

        // 员工端从会话页切到任一模块页时，退出聊天态样式，避免中栏被聊天布局压空
        if (!isSupport && currentCenterView !== 'session') {
            document.body.classList.remove('employee-chat-mode');
        }

        if (currentCenterView === 'performance') {
            const performanceSection = document.getElementById('performance-section');
            if (performanceSection) {
                performanceSection.classList.remove('collapsed');
                const toggleBtn = document.getElementById('performance-toggle');
                if (toggleBtn) toggleBtn.textContent = '收起';
            }
        }

        if (currentCenterView === 'travel' && typeof window.initTravelAnalysis === 'function') {
            window.initTravelAnalysis();
        }

        if (currentCenterView === 'exceptions' && typeof window.applyAllExceptionBoardScopes === 'function') {
            window.applyAllExceptionBoardScopes();
        }

        if (currentCenterView === 'manageBizAgents') {
            if (typeof window.initAssistantManagement === 'function') {
                window.initAssistantManagement();
            }
            window.renderManageBizAgentsPage?.();
        }
        if (currentCenterView === 'manageAssistants') {
            if (typeof window.initAssistantManagement === 'function') {
                window.initAssistantManagement();
            }
            window.renderManageAssistantsPage?.();
            window.renderManageSkillsPage?.();
        }

        document.querySelectorAll('.sidebar .bc-item-nav').forEach((item) => {
            const targetView = item.dataset.centerView || 'session';
            item.classList.toggle('is-center-active', targetView === currentCenterView);
        });

        if (currentCenterView !== 'session') {
            collapseContextPanel();
        }

        requestAnimationFrame(() => {
            window.initOverlayScrollbars?.();
        });
    }

    function returnToSupportSessionView(options = {}) {
        const { keepChat = false } = options;
        ensureSupportPanelActive();
        setCenterView('session');
        document.body.classList.remove('support-exceptions-view-active');
        document.querySelectorAll('.sidebar .bc-item-nav[data-bc="exceptions"]').forEach((el) => {
            el.classList.remove('is-center-active');
        });
        if (!keepChat && typeof window.exitSupportChatMode === 'function') {
            window.exitSupportChatMode(document.getElementById('workbench-panel-support'));
        } else if (typeof window.syncSupportHomeLayout === 'function') {
            window.syncSupportHomeLayout(document.getElementById('workbench-panel-support'));
        }
        if (typeof window.syncCenterAgentsBar === 'function') {
            window.syncCenterAgentsBar();
        }
    }

    function returnToMainSessionView(options = {}) {
        const { resetChat = false } = options;
        const wasModuleView = currentCenterView !== 'session';
        const wasExceptions = currentCenterView === 'exceptions';
        if (document.body.classList.contains('support-tab-active')) {
            ensureSupportPanelActive();
        }
        setCenterView('session');
        if (wasModuleView) {
            document.querySelectorAll('.sidebar .bc-item-nav').forEach((el) => {
                if (el.dataset.centerView !== currentCenterView) {
                    el.classList.remove('is-center-active');
                }
            });
        }
        if (wasExceptions && document.body.classList.contains('support-tab-active') && typeof window.returnToSupportMainPage === 'function') {
            window.returnToSupportMainPage();
        }
        if (resetChat && typeof window.resetEmployeeChat === 'function') {
            window.resetEmployeeChat();
        }
        if (resetChat && typeof window.resetSupportChatView === 'function' && document.body.classList.contains('support-tab-active')) {
            window.resetSupportChatView();
        }
        if (!resetChat && typeof window.restoreEmployeeSessionView === 'function') {
            window.restoreEmployeeSessionView();
        }
        if (wasModuleView && typeof window.syncCenterAgentsBar === 'function') {
            window.syncCenterAgentsBar();
        }
    }

    function openHistorySession(sessionId) {
        const sessions = getSessions();
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;

        returnToMainSessionView();
        document.querySelectorAll('.session-item').forEach((el) => {
            el.classList.toggle('active', el.dataset.sessionId === sessionId);
        });

        if (typeof window.openEmployeeSession === 'function') {
            window.openEmployeeSession(session);
        }
    }

    function getSidebarBcItems() {
        return document.querySelectorAll('.sidebar .bc-item');
    }

    function initBreadcrumbMenu() {
        getSidebarBcItems().forEach((item) => {
            const trigger = item.querySelector('.bc-trigger');
            const panel = item.querySelector('.bc-panel');
            if (!trigger) return;

            trigger.addEventListener('click', () => {
                const centerView = item.dataset.centerView || 'session';
                ensurePanelActiveByNavItem(item);

                if (item.classList.contains('bc-item-nav')) {
                    const action = item.dataset.action;
                    const isSupport = document.body.classList.contains('support-tab-active');
                    const isEmployee = !isSupport && !document.body.classList.contains('org-tab-active');
                    if (isEmployee && action && typeof window.WorkbenchMenuActions?.handleEmployeeSidebarAction === 'function') {
                        getSidebarBcItems().forEach((other) => {
                            other.classList.remove('is-expanded', 'is-center-active');
                            const otherPanel = other.querySelector('.bc-panel');
                            if (otherPanel) otherPanel.hidden = true;
                        });
                        item.classList.add('is-center-active');
                        currentBcMenu = item.dataset.bc || 'session';
                        returnToMainSessionView({ resetChat: false });
                        window.WorkbenchMenuActions.handleEmployeeSidebarAction(action);
                        return;
                    }
                    if (isSupport && action && typeof window.WorkbenchMenuActions?.handleSupportSidebarAction === 'function') {
                        getSidebarBcItems().forEach((other) => {
                            other.classList.remove('is-expanded', 'is-center-active');
                            const otherPanel = other.querySelector('.bc-panel');
                            if (otherPanel) otherPanel.hidden = true;
                        });
                        item.classList.add('is-center-active');
                        currentBcMenu = item.dataset.bc || 'session';
                        returnToMainSessionView({ resetChat: false });
                        window.WorkbenchMenuActions.handleSupportSidebarAction(action);
                        return;
                    }
                    getSidebarBcItems().forEach((other) => {
                        other.classList.remove('is-expanded', 'is-center-active');
                        const otherPanel = other.querySelector('.bc-panel');
                        if (otherPanel) otherPanel.hidden = true;
                    });
                    item.classList.add('is-center-active');
                    currentBcMenu = item.dataset.bc || 'performance';
                    setCenterView(centerView);
                    return;
                }

                setCenterView('session');
                const isExpanded = item.classList.contains('is-expanded');
                getSidebarBcItems().forEach((other) => {
                    if (other === item) return;
                    other.classList.remove('is-expanded', 'is-center-active');
                    const otherPanel = other.querySelector('.bc-panel');
                    if (otherPanel) otherPanel.hidden = true;
                });

                if (!isExpanded) {
                    item.classList.add('is-expanded', 'is-center-active');
                    if (panel) panel.hidden = false;
                    currentBcMenu = item.dataset.bc || 'tasks';
                } else {
                    item.classList.add('is-center-active');
                }
            });
        });
    }

    function syncBreadcrumbForRole(tabKey) {
        const employeeTabs = document.getElementById('sidebar-tabs');
        const supportTabs = document.getElementById('support-sidebar-tabs');
        if (employeeTabs) employeeTabs.style.display = tabKey === 'employee' ? '' : 'none';
        if (supportTabs) supportTabs.style.display = tabKey === 'support' ? '' : 'none';
        document.querySelectorAll('.employee-only-nav').forEach((el) => {
            el.style.display = tabKey === 'employee' ? '' : 'none';
        });
        document.querySelectorAll('.support-only-nav').forEach((el) => {
            el.style.display = tabKey === 'support' ? '' : 'none';
        });
    }

    function switchSupportSidebarTab(tabKey) {
        const tabSessions = document.getElementById('support-sidebar-tab-sessions');
        const tabTasks = document.getElementById('support-sidebar-tab-tasks');
        const panelSessions = document.getElementById('support-sidebar-panel-sessions');
        const panelTasks = document.getElementById('support-sidebar-panel-tasks');
        const isSessions = tabKey === 'sessions';

        if (tabSessions) {
            tabSessions.classList.toggle('is-active', isSessions);
            tabSessions.setAttribute('aria-selected', String(isSessions));
        }
        if (tabTasks) {
            tabTasks.classList.toggle('is-active', !isSessions);
            tabTasks.setAttribute('aria-selected', String(!isSessions));
        }
        if (panelSessions) {
            panelSessions.classList.toggle('is-active', isSessions);
            panelSessions.hidden = !isSessions;
        }
        if (panelTasks) {
            panelTasks.classList.toggle('is-active', !isSessions);
            panelTasks.hidden = isSessions;
        }
    }

    function initSupportSidebarTabs() {
        document.getElementById('support-sidebar-tab-sessions')?.addEventListener('click', () => switchSupportSidebarTab('sessions'));
        document.getElementById('support-sidebar-tab-tasks')?.addEventListener('click', () => switchSupportSidebarTab('tasks'));
    }

    function switchSidebarTab(tabKey) {
        const tabSessions = document.getElementById('sidebar-tab-sessions');
        const tabTasks = document.getElementById('sidebar-tab-tasks');
        const panelSessions = document.getElementById('sidebar-panel-sessions');
        const panelTasks = document.getElementById('sidebar-panel-tasks');
        const isSessions = tabKey === 'sessions';

        if (tabSessions) {
            tabSessions.classList.toggle('is-active', isSessions);
            tabSessions.setAttribute('aria-selected', String(isSessions));
        }
        if (tabTasks) {
            tabTasks.classList.toggle('is-active', !isSessions);
            tabTasks.setAttribute('aria-selected', String(!isSessions));
        }
        if (panelSessions) {
            panelSessions.classList.toggle('is-active', isSessions);
            panelSessions.hidden = !isSessions;
        }
        if (panelTasks) {
            panelTasks.classList.toggle('is-active', !isSessions);
            panelTasks.hidden = isSessions;
        }
    }

    function initSidebarTabs() {
        document.getElementById('sidebar-tab-sessions')?.addEventListener('click', () => switchSidebarTab('sessions'));
        document.getElementById('sidebar-tab-tasks')?.addEventListener('click', () => switchSidebarTab('tasks'));
    }

    function loadLayoutState() {
        try {
            return JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
        } catch {
            return {};
        }
    }

    function saveLayoutState(state) {
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(state));
    }

    function setEmployeeSessionsCollapsed(collapsed) {
        const btn = document.getElementById('employee-sessions-toggle');
        const body = document.getElementById('employee-sessions-body');
        if (btn) btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (body) body.hidden = !!collapsed;
    }

    function initEmployeeSessionsCollapse() {
        const btn = document.getElementById('employee-sessions-toggle');
        const body = document.getElementById('employee-sessions-body');
        if (!btn || !body) return;
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';

        const state = loadLayoutState();
        const collapsed = state.employeeSessionsCollapsed === true;
        setEmployeeSessionsCollapsed(collapsed);

        btn.addEventListener('click', () => {
            const willCollapse = btn.getAttribute('aria-expanded') !== 'false';
            setEmployeeSessionsCollapsed(willCollapse);
            const next = loadLayoutState();
            next.employeeSessionsCollapsed = willCollapse;
            saveLayoutState(next);
        });
    }

    function setSupportSessionsCollapsed(collapsed) {
        const btn = document.getElementById('support-sessions-toggle');
        const body = document.getElementById('support-sessions-body');
        if (btn) btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (body) body.hidden = !!collapsed;
    }

    function initSupportSessionsCollapse() {
        const btn = document.getElementById('support-sessions-toggle');
        const body = document.getElementById('support-sessions-body');
        if (!btn || !body) return;
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';

        const state = loadLayoutState();
        const collapsed = state.supportSessionsCollapsed === true;
        setSupportSessionsCollapsed(collapsed);

        btn.addEventListener('click', () => {
            const willCollapse = btn.getAttribute('aria-expanded') !== 'false';
            setSupportSessionsCollapsed(willCollapse);
            const next = loadLayoutState();
            next.supportSessionsCollapsed = willCollapse;
            saveLayoutState(next);
        });
    }

    function getSessions() {
        try {
            return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveSessions(list) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(list.slice(0, 50)));
    }

    let currentSessionId = null;

    function setCurrentSessionId(id) {
        currentSessionId = id || null;
    }

    function getSessionById(id) {
        return getSessions().find((s) => s.id === id) || null;
    }

    function highlightSessionInSidebar(sessionId) {
        document.querySelectorAll('.session-item').forEach((el) => {
            el.classList.toggle('active', !!sessionId && el.dataset.sessionId === sessionId);
        });
    }

    function formatRelativeTime(ts) {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return mins + ' 分钟前';
        const hours = Math.floor(mins / 60);
        if (hours < 24) return hours + ' 小时前';
        const days = Math.floor(hours / 24);
        return days + ' 天前';
    }

    const SESSION_ITEM_ICON_HTML = '<span class="session-item-icon" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3.5h10a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H7l-2.5 2V10.5H3a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/><circle cx="5.5" cy="7" r="0.55" fill="currentColor"/><circle cx="8" cy="7" r="0.55" fill="currentColor"/><circle cx="10.5" cy="7" r="0.55" fill="currentColor"/></svg></span>';

    // 会话状态相关
    const SESSION_STATUSES = ['推进中', '目标达成', '已暂停', '已取消'];
    const STATUS_COLORS = {
        '推进中': 'status-active',
        '目标达成': 'status-done',
        '已暂停': 'status-paused',
        '已取消': 'status-cancelled'
    };

    function getSessionStatus(sessionId) {
        const s = getSessionById(sessionId || currentSessionId);
        return s?.status || '推进中';
    }

    function setSessionStatus(sessionId, status) {
        // 允许预设状态与自定义状态文字（非空、长度限制内）
        if (!status || typeof status !== 'string') return;
        status = status.trim().slice(0, 20);
        if (!status) return;
        const id = sessionId || currentSessionId;
        if (!id) return;
        const sessions = getSessions();
        const session = sessions.find((s) => s.id === id);
        if (!session) return;
        session.status = status;
        saveSessions(sessions);
        renderSessionHistory();
        updateChatStatusBadge();
        window.ContextPanel?.renderRelatedSessions?.();
    }

    function getStatusColorClass(status) {
        return STATUS_COLORS[status] || 'status-active';
    }

    function getStatuses() {
        return SESSION_STATUSES.slice();
    }

    function updateChatStatusBadge() {
        const status = getSessionStatus();
        const badge = document.getElementById('chat-status-badge');
        if (badge) {
            badge.textContent = status;
            badge.className = 'chat-status-badge ' + getStatusColorClass(status);
        }
        // 同时刷新成员条
        if (window.WorkbenchApp?.renderChatMembersBar) {
            window.WorkbenchApp.renderChatMembersBar();
        } else if (typeof renderChatMembersBar === 'function') {
            renderChatMembersBar();
        }
    }

    function renderSessionHistory() {
        const list = document.getElementById('sidebar-sessions-list');
        if (!list) return;
        const sessions = getSessions().slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (!sessions.length) {
            list.innerHTML = '<div class="context-empty">暂无历史会话</div>';
            return;
        }
        list.innerHTML = sessions.map((s) => {
            const status = s.status || '推进中';
            const statusClass = getStatusColorClass(status);
            return `<button type="button" class="session-item${s.id === currentSessionId ? ' active' : ''}" data-session-id="${s.id}">
                ${SESSION_ITEM_ICON_HTML}
                <span class="session-item-body">
                    <span class="session-item-title">${escapeHtml(s.title)}</span>
                    <span class="session-item-meta">
                        <span class="session-status-tag ${statusClass}">${status}</span>
                        <span class="session-item-time">${formatRelativeTime(s.timestamp)}</span>
                    </span>
                </span>
            </button>`;
        }).join('');
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function addSession(title) {
        return createSession(title);
    }

    function createSession(title, assistantIndex, options = {}) {
        const sessions = getSessions();
        const entry = {
            id: 's-' + Date.now(),
            title: (title || '新对话').slice(0, 40),
            timestamp: Date.now(),
            assistantIndex: typeof assistantIndex === 'number' ? assistantIndex : null,
            workbenchAssistant: options.workbenchAssistant === true,
            status: options.status || '推进中',
            messages: []
        };
        sessions.unshift(entry);
        saveSessions(sessions);
        currentSessionId = entry.id;
        renderSessionHistory();
        highlightSessionInSidebar(entry.id);
        return entry;
    }

    function touchCurrentSession(title) {
        if (!currentSessionId) return;
        const sessions = getSessions();
        const session = sessions.find((s) => s.id === currentSessionId);
        if (!session) return;
        const fallbackTitle = /对话$/.test(session.title) || session.title === '新对话';
        if (title && fallbackTitle) {
            session.title = title.slice(0, 40);
        }
        session.timestamp = Date.now();
        saveSessions(sessions);
        renderSessionHistory();
        highlightSessionInSidebar(currentSessionId);
    }

    // 获取当前会话的关联会话列表
    function getRelatedSessions(sessionId) {
        const id = sessionId || currentSessionId;
        if (!id) return [];
        const session = getSessionById(id);
        if (!session) return [];
        return Array.isArray(session.relatedSessions) ? session.relatedSessions : [];
    }

    // 双向关联两个会话
    function linkSessions(sessionIdA, sessionIdB) {
        if (!sessionIdA || !sessionIdB || sessionIdA === sessionIdB) return false;
        const sessions = getSessions();
        const a = sessions.find((s) => s.id === sessionIdA);
        const b = sessions.find((s) => s.id === sessionIdB);
        if (!a || !b) return false;
        if (!Array.isArray(a.relatedSessions)) a.relatedSessions = [];
        if (!Array.isArray(b.relatedSessions)) b.relatedSessions = [];
        if (!a.relatedSessions.includes(sessionIdB)) a.relatedSessions.push(sessionIdB);
        if (!b.relatedSessions.includes(sessionIdA)) b.relatedSessions.push(sessionIdA);
        saveSessions(sessions);
        return true;
    }

    // 解除双向关联
    function unlinkSessions(sessionIdA, sessionIdB) {
        if (!sessionIdA || !sessionIdB) return false;
        const sessions = getSessions();
        const a = sessions.find((s) => s.id === sessionIdA);
        const b = sessions.find((s) => s.id === sessionIdB);
        if (a && Array.isArray(a.relatedSessions)) {
            a.relatedSessions = a.relatedSessions.filter((id) => id !== sessionIdB);
        }
        if (b && Array.isArray(b.relatedSessions)) {
            b.relatedSessions = b.relatedSessions.filter((id) => id !== sessionIdA);
        }
        saveSessions(sessions);
        return true;
    }

    // 发起一个与当前会话关联的新会话，返回新会话
    function createRelatedSession(title) {
        const parentSessionId = currentSessionId;
        const newSession = createSession(title || '关联新对话');
        if (parentSessionId && newSession.id !== parentSessionId) {
            linkSessions(parentSessionId, newSession.id);
        }
        return newSession;
    }

    // 跳转到指定会话（加载该会话并切换）
    function switchToSession(sessionId) {
        if (!sessionId) return;
        const session = getSessionById(sessionId);
        if (!session) return;
        currentSessionId = sessionId;
        highlightSessionInSidebar(sessionId);
        // 触发会话切换事件，由 workbench-app 监听并恢复消息
        document.dispatchEvent(new CustomEvent('workbench:switch-session', { detail: { sessionId } }));
    }

    function saveSessionMessages(sessionId, messages, assistantIndex, options = {}) {
        if (!sessionId) return;
        const sessions = getSessions();
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;
        session.messages = Array.isArray(messages) ? messages.slice(-100) : [];
        if (typeof assistantIndex === 'number') {
            session.assistantIndex = assistantIndex;
            session.workbenchAssistant = false;
        } else if (assistantIndex === null || assistantIndex === undefined) {
            session.assistantIndex = null;
        }
        if (options.workbenchAssistant === true) {
            session.workbenchAssistant = true;
            session.assistantIndex = null;
        }
        // 保存右侧边栏上下文快照
        if (options.contextBundle !== undefined) {
            session.contextBundle = options.contextBundle;
        }
        session.timestamp = Date.now();
        saveSessions(sessions);
        renderSessionHistory();
    }

    function applyLayoutState() {
        const state = loadLayoutState();
        const layout = document.getElementById('wb-layout');
        if (!layout) return;
        layout.classList.toggle('is-sidebar-collapsed', state.sidebarCollapsed === true);
        layout.classList.toggle('is-context-collapsed', state.contextCollapsed !== false);
        updatePanelToggleState();
        setEmployeeSessionsCollapsed(state.employeeSessionsCollapsed === true);
    }

    function setContextPanelCollapsed(collapsed, options = {}) {
        const { persist = true } = options;
        const layout = document.getElementById('wb-layout');
        if (!layout) return;
        layout.classList.toggle('is-context-collapsed', collapsed);
        if (persist) {
            const state = loadLayoutState();
            state.contextCollapsed = collapsed;
            saveLayoutState(state);
        }
        updatePanelToggleState();
    }

    function expandContextPanel() {
        setContextPanelCollapsed(false);
    }

    function collapseContextPanel() {
        setContextPanelCollapsed(true);
    }

    function applyWorkbenchEntryLayout() {
        const state = loadLayoutState();
        state.sidebarCollapsed = false;
        state.contextCollapsed = true;
        saveLayoutState(state);
        applyLayoutState();
    }

    function toggleSidebar() {
        const layout = document.getElementById('wb-layout');
        if (!layout) return;
        const collapsed = layout.classList.toggle('is-sidebar-collapsed');
        const state = loadLayoutState();
        state.sidebarCollapsed = collapsed;
        saveLayoutState(state);
        updatePanelToggleState();
    }

    function toggleContext() {
        const layout = document.getElementById('wb-layout');
        if (!layout) return;
        const collapsed = layout.classList.toggle('is-context-collapsed');
        const state = loadLayoutState();
        state.contextCollapsed = collapsed;
        saveLayoutState(state);
        updatePanelToggleState();
    }

    function refreshCenterAgentsLayout() {
        if (typeof window.updateDigitalAvatarsScrollButtons === 'function') {
            window.updateDigitalAvatarsScrollButtons();
        }
        setTimeout(() => {
            window.updateDigitalAvatarsScrollButtons?.();
        }, 280);
    }

    function updatePanelToggleState() {
        const layout = document.getElementById('wb-layout');
        if (!layout) return;
        const sidebarCollapsed = layout.classList.contains('is-sidebar-collapsed');
        const contextCollapsed = layout.classList.contains('is-context-collapsed');
        const sidebarBtn = document.getElementById('sidebar-collapse-btn');
        const contextBtn = document.getElementById('context-collapse-btn');
        if (sidebarBtn) {
            sidebarBtn.setAttribute('aria-expanded', String(!sidebarCollapsed));
            sidebarBtn.setAttribute('aria-label', sidebarCollapsed ? '展开侧栏' : '收起侧栏');
            sidebarBtn.title = sidebarCollapsed ? '展开侧栏' : '收起侧栏';
        }
        if (contextBtn) {
            contextBtn.setAttribute('aria-expanded', String(!contextCollapsed));
            contextBtn.setAttribute('aria-label', contextCollapsed ? '展开会话输出物' : '收起会话输出物');
            contextBtn.title = contextCollapsed ? '展开会话输出物' : '收起会话输出物';
        }
        refreshCenterAgentsLayout();
    }

    function startNewSession() {
        if (typeof window.resetEmployeeChat === 'function') {
            window.resetEmployeeChat();
        }
        const panel = document.getElementById('workbench-panel-employee');
        const messages = panel?.querySelector('#ai-chat-messages');
        if (messages) messages.innerHTML = '';
        const chatView = document.getElementById('ai-chat-view');
        if (chatView) {
            chatView.style.display = 'none';
            chatView.classList.remove('is-visible');
        }
        document.body.classList.remove('employee-chat-mode');
        window.AppShell?.collapseContextPanel?.();
        if (typeof window.ContextPanel !== 'undefined') {
            window.ContextPanel.reset();
        }
        document.getElementById('session-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
        setCenterView('session');
        document.querySelectorAll('.bc-item').forEach((el) => el.classList.remove('is-center-active', 'is-expanded'));
        setCurrentSessionId(null);
        highlightSessionInSidebar(null);
        switchSidebarTab('sessions');
    }

    function bindEvents() {
        document.getElementById('new-chat-btn')?.addEventListener('click', startNewSession);
        document.getElementById('sidebar-logout-btn')?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (typeof window.logoutWorkbench === 'function') {
                window.logoutWorkbench();
            }
        });
        document.getElementById('performance-back-btn')?.addEventListener('click', () => {
            returnToMainSessionView({ resetChat: true });
        });
        document.getElementById('travel-back-btn')?.addEventListener('click', () => {
            returnToMainSessionView();
        });
        document.addEventListener('click', (event) => {
            const backBtn = event.target.closest('.exceptions-back-btn');
            if (!backBtn) return;
            event.preventDefault();
            returnToMainSessionView();
        });
        document.getElementById('support-new-chat-btn')?.addEventListener('click', () => {
            if (typeof window.startSupportNewSession === 'function') {
                window.startSupportNewSession();
            }
        });
        document.getElementById('support-sidebar-sessions-list')?.addEventListener('click', (event) => {
            const item = event.target.closest('.session-item');
            if (!item?.dataset.sessionId) return;
            if (typeof window.openSupportSession === 'function') {
                window.openSupportSession(item.dataset.sessionId);
            }
        });
        document.getElementById('sidebar-sessions-list')?.addEventListener('click', (event) => {
            const item = event.target.closest('.session-item');
            if (!item?.dataset.sessionId) return;
            openHistorySession(item.dataset.sessionId);
        });
        document.getElementById('sidebar-collapse-btn')?.addEventListener('click', toggleSidebar);
        document.getElementById('expand-sidebar-btn')?.addEventListener('click', toggleSidebar);
        document.getElementById('context-collapse-btn')?.addEventListener('click', toggleContext);
        document.getElementById('expand-context-btn')?.addEventListener('click', toggleContext);
        initBreadcrumbMenu();
        initSidebarTabs();
        initSupportSidebarTabs();
        initEmployeeSessionsCollapse();
        initSupportSessionsCollapse();

        document.querySelectorAll('.quick-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const input = document.getElementById('main-chat-input');
                if (input) {
                    input.value = chip.dataset.prompt || chip.textContent;
                    input.focus();
                    window.syncMainSendButtonState?.(document.getElementById('workbench-panel-employee'));
                }
            });
        });

        window.addEventListener('resize', applyLayoutState);
    }

    function patchEnterWorkbench() {
        const orig = window.enterWorkbench;
        if (!orig) return;
        window.enterWorkbench = function (role) {
            orig(role);
            document.body.classList.add('wb-workbench-active');
            syncBreadcrumbForRole(role);
            applyWorkbenchEntryLayout();
            renderSessionHistory();
            if (role === 'support' && typeof window.renderSupportSessionHistory === 'function') {
                window.renderSupportSessionHistory();
            }
            updatePanelToggleState();
        };
    }

    function patchShowLogin() {
        const orig = window.showLoginPage;
        if (!orig) return;
        window.showLoginPage = function () {
            orig();
            document.body.classList.remove('wb-workbench-active');
        };
    }

    function enhanceInput() {
        const field = document.getElementById('main-chat-input');
        if (!field) return;
        if (field.tagName !== 'TEXTAREA') {
            const textarea = document.createElement('textarea');
            textarea.id = field.id;
            textarea.className = field.className + ' enhanced-textarea';
            textarea.rows = 1;
            textarea.setAttribute('onkeydown', 'handleMainInput(event)');
            field.parentNode.replaceChild(textarea, field);
            field = textarea;
        }
        field.placeholder = '发消息...';
        field.classList.add('enhanced-textarea');
    }

    window.initAppShell = function () {
        bindEvents();
        patchEnterWorkbench();
        patchShowLogin();
        enhanceInput();
        applyLayoutState();
        renderSessionHistory();
        updatePanelToggleState();
        setCenterView('session');
        showLoginPage();
    };

    window.AppShell = {
        addSession,
        createSession,
        createRelatedSession,
        touchCurrentSession,
        saveSessionMessages,
        setCurrentSessionId,
        getSessionById,
        getSessions,
        getRelatedSessions,
        linkSessions,
        unlinkSessions,
        switchToSession,
        getCurrentSessionId: () => currentSessionId,
        highlightSessionInSidebar,
        setCenterView,
        returnToMainSessionView,
        returnToSupportSessionView,
        syncBreadcrumbForRole,
        renderSessionHistory,
        switchSidebarTab,
        switchSupportSidebarTab,
        expandContextPanel,
        collapseContextPanel,
        setContextPanelCollapsed,
        applyWorkbenchEntryLayout,
        getSessionStatus,
        setSessionStatus,
        getStatuses,
        updateChatStatusBadge
    };
})();
