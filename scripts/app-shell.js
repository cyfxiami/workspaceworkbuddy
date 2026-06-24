/**
 * 三栏布局壳：导航、会话历史、栏折叠
 */
(function () {
    const LAYOUT_KEY = 'workbench-layout-state';
    const SESSIONS_KEY = 'workbench-sessions-v1';

    let currentBcMenu = 'tasks';
    let currentCenterView = 'session';

    function getCenterModuleEl(view) {
        const isSupport = document.body.classList.contains('support-tab-active');
        const suffix = isSupport ? '-support' : '';
        const map = {
            session: 'center-view-session',
            performance: 'center-view-performance',
            exceptions: 'center-view-exceptions'
        };
        const baseId = map[view];
        if (!baseId) return null;
        return document.getElementById(baseId + suffix) || document.getElementById(baseId);
    }

    function setCenterView(view) {
        currentCenterView = view || 'session';
        ['session', 'performance', 'exceptions'].forEach((name) => {
            const el = getCenterModuleEl(name);
            if (el) el.hidden = name !== currentCenterView;
        });

        const isSupport = document.body.classList.contains('support-tab-active');
        document.body.classList.toggle('support-exceptions-view-active', isSupport && currentCenterView === 'exceptions');
        document.body.classList.toggle('employee-performance-view-active', !isSupport && currentCenterView === 'performance');

        if (currentCenterView === 'performance') {
            const performanceSection = document.getElementById('performance-section');
            if (performanceSection) {
                performanceSection.classList.remove('collapsed');
                const toggleBtn = document.getElementById('performance-toggle');
                if (toggleBtn) toggleBtn.textContent = '收起';
            }
        }

        document.querySelectorAll('.sidebar .bc-item-nav').forEach((item) => {
            const targetView = item.dataset.centerView || 'session';
            item.classList.toggle('is-center-active', targetView === currentCenterView);
        });
    }

    function returnToMainSessionView(options = {}) {
        const { resetChat = false } = options;
        const wasModuleView = currentCenterView !== 'session';
        const wasExceptions = currentCenterView === 'exceptions';
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

                if (item.classList.contains('bc-item-nav')) {
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

    function renderSessionHistory() {
        const list = document.getElementById('sidebar-sessions-list');
        if (!list) return;
        const sessions = getSessions().slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (!sessions.length) {
            list.innerHTML = '<div class="context-empty">暂无历史会话</div>';
            return;
        }
        list.innerHTML = sessions.map((s) =>
            `<button type="button" class="session-item${s.id === currentSessionId ? ' active' : ''}" data-session-id="${s.id}">
                <span class="session-item-title">${escapeHtml(s.title)}</span>
                <span class="session-item-time">${formatRelativeTime(s.timestamp)}</span>
            </button>`
        ).join('');
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function addSession(title) {
        return createSession(title);
    }

    function createSession(title, assistantIndex) {
        const sessions = getSessions();
        const entry = {
            id: 's-' + Date.now(),
            title: (title || '新对话').slice(0, 40),
            timestamp: Date.now(),
            assistantIndex: typeof assistantIndex === 'number' ? assistantIndex : 0,
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

    function saveSessionMessages(sessionId, messages, assistantIndex) {
        if (!sessionId) return;
        const sessions = getSessions();
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;
        session.messages = Array.isArray(messages) ? messages.slice(-100) : [];
        if (typeof assistantIndex === 'number') {
            session.assistantIndex = assistantIndex;
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

        document.querySelectorAll('.quick-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const input = document.getElementById('main-chat-input');
                if (input) {
                    input.value = chip.dataset.prompt || chip.textContent;
                    input.focus();
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
        field.placeholder = '开启我的工作';
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
        touchCurrentSession,
        saveSessionMessages,
        setCurrentSessionId,
        getSessionById,
        highlightSessionInSidebar,
        setCenterView,
        returnToMainSessionView,
        syncBreadcrumbForRole,
        renderSessionHistory,
        switchSidebarTab,
        switchSupportSidebarTab,
        expandContextPanel,
        collapseContextPanel,
        setContextPanelCollapsed,
        applyWorkbenchEntryLayout
    };
})();
