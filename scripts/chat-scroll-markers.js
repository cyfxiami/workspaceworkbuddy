/**
 * 聊天滚动条标记悬浮预览交互
 *
 * 触发条件：聊天对话框对话轮次 > 2，窗口出现原生竖向滚动条
 * 标记点位：渲染在竖向滚动条左侧，整体跟随滚动条轻微右移
 * 色块规则：根据每条对话记录的页面滚动偏移，在纵向轨道生成离散独立黑色色块
 * 悬浮气泡：鼠标悬浮色块时弹出蓝色圆角气泡，展示对应完整历史聊天文本
 */
(function () {
    'use strict';

    var MIN_MESSAGES = 3;        // 对话轮次 > 2（至少 3 条消息）
    var TRACK_CLASS = 'chat-scroll-marker-track';
    var MARKER_CLASS = 'chat-scroll-marker';
    var BUBBLE_CLASS = 'chat-scroll-marker-bubble';
    var CONTAINER_CLASS = 'has-scroll-markers';
    var MARKER_SELECTOR = '.' + MARKER_CLASS;
    var TRACK_SELECTOR = '.' + TRACK_CLASS;

    var bubbleEl = null;
    var updateTimer = null;
    var isUpdating = false;
    var resizeObserver = null;
    var mutationObserver = null;
    var currentScrollEl = null;
    var scrollHandler = null;

    /* ---------- 工具函数 ---------- */

    function debounce(fn, delay) {
        return function () {
            var args = arguments;
            var self = this;
            clearTimeout(updateTimer);
            updateTimer = setTimeout(function () {
                fn.apply(self, args);
            }, delay);
        };
    }

    function isElementVisible(el) {
        if (!el) return false;
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
        var rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    /* ---------- 滚动容器探测 ---------- */

    function getScrollContainer() {
        // 优先借助 workbench-app 暴露的 getWorkbenchChatScrollEl
        if (typeof window.getWorkbenchChatScrollEl === 'function') {
            try {
                var el = window.getWorkbenchChatScrollEl();
                if (el && isElementVisible(el)) return el;
            } catch (e) { /* ignore */ }
        }

        // 回退：遍历所有 .ai-chat-messages，取第一个可见且有溢出的
        var candidates = document.querySelectorAll('.ai-chat-messages');
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            if (!isElementVisible(c)) continue;
            var style = window.getComputedStyle(c);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                style.overflow === 'auto' || style.overflow === 'scroll') {
                return c;
            }
        }

        // 再回退：取第一个可见的 .ai-chat-messages
        for (var j = 0; j < candidates.length; j++) {
            if (isElementVisible(candidates[j])) return candidates[j];
        }
        return null;
    }

    /* ---------- 消息探测 ---------- */

    function getChatRows(scrollEl) {
        if (!scrollEl) return [];
        var rows = scrollEl.querySelectorAll('.chat-row');
        return Array.prototype.slice.call(rows);
    }

    function hasScrollbar(scrollEl) {
        if (!scrollEl) return false;
        return scrollEl.scrollHeight > scrollEl.clientHeight + 2;
    }

    /**
     * 获取元素在滚动内容中的纵向偏移（不随滚动变化）
     */
    function getContentOffsetTop(el, scrollEl) {
        return el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
    }

    /**
     * 提取 chat-row 的完整文本（含角色标签）
     */
    function getRowText(row) {
        var bubble = row.querySelector('.chat-bubble');
        if (!bubble) return '';
        var text = bubble.textContent || bubble.innerText || '';
        return text.replace(/\u200b/g, '').trim();
    }

    function getRowRole(row) {
        if (row.classList.contains('chat-row-user')) return '我';
        if (row.classList.contains('chat-row-assistant')) return '助手';
        return '消息';
    }

    /* ---------- 标记渲染 ---------- */

    function removeAllMarkers() {
        // 移除旧滚动监听
        if (currentScrollEl && scrollHandler) {
            currentScrollEl.removeEventListener('scroll', scrollHandler);
        }
        currentScrollEl = null;
        scrollHandler = null;
        lastActiveIndex = -2;  // 重置，确保重建后首次更新生效

        var tracks = document.querySelectorAll(TRACK_SELECTOR);
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].remove();
        }
        var containers = document.querySelectorAll('.' + CONTAINER_CLASS);
        for (var j = 0; j < containers.length; j++) {
            containers[j].classList.remove(CONTAINER_CLASS);
        }
        hideBubble();
    }

    function updateMarkers() {
        if (isUpdating) return;
        isUpdating = true;

        try {
            var scrollEl = getScrollContainer();
            if (!scrollEl) {
                removeAllMarkers();
                return;
            }

            var rows = getChatRows(scrollEl);

            // 触发条件：对话轮次 > 2 且出现竖向滚动条
            if (rows.length < MIN_MESSAGES || !hasScrollbar(scrollEl)) {
                removeAllMarkers();
                return;
            }

            // 轨道放在不滚动的父元素上，固定在可视区域不随内容滚动
            var hostEl = scrollEl.parentElement;
            if (!hostEl) {
                removeAllMarkers();
                return;
            }

            var userRows = rows.filter(function (r) {
                return r.classList.contains('chat-row-user');
            });
            if (userRows.length === 0) {
                removeAllMarkers();
                return;
            }

            // === 增量更新：色块数量不变时只更新位置和 active 状态，不重建 DOM ===
            var existingTrack = hostEl.querySelector(TRACK_SELECTOR);
            if (existingTrack && existingTrack.children.length === userRows.length) {
                var hostRectInc = hostEl.getBoundingClientRect();
                var scrollRectInc = scrollEl.getBoundingClientRect();
                var rightOffsetInc = hostRectInc.right - scrollRectInc.right;
                existingTrack.style.right = (rightOffsetInc + 12) + 'px';

                // 确保 scroll 监听仍然存在
                if (!currentScrollEl || currentScrollEl !== scrollEl) {
                    currentScrollEl = scrollEl;
                    scrollHandler = function () {
                        updateActiveMarkerRaf(scrollEl, existingTrack, userRows);
                    };
                    scrollEl.addEventListener('scroll', scrollHandler, { passive: true });
                }

                updateActiveMarker(scrollEl, existingTrack, userRows);
                return;
            }

            // === 全量重建 ===
            removeAllMarkers();
            hostEl.classList.add(CONTAINER_CLASS);

            var FIXED_TRACK_HEIGHT = 200;
            var FIXED_MARKER_HEIGHT = 4;
            var trackHeight = FIXED_TRACK_HEIGHT;

            // 创建标记轨道（CSS 固定高度并垂直居中）
            var track = document.createElement('div');
            track.className = TRACK_CLASS;

            // 动态计算 right 偏移
            var hostRect = hostEl.getBoundingClientRect();
            var scrollRect = scrollEl.getBoundingClientRect();
            var rightOffset = hostRect.right - scrollRect.right;
            track.style.right = (rightOffset + 12) + 'px';

            hostEl.appendChild(track);

            // 为每条用户消息生成离散色块（均匀分布，间距自适应）

            var rowCount = userRows.length;
            var FIXED_SPACING = 8;  // 条数少时的固定间距
            for (var i = 0; i < userRows.length; i++) {
                var row = userRows[i];
                var markerHeight = FIXED_MARKER_HEIGHT;

                var markerTop;
                // 计算固定间距排列的总高度：N个色块 + (N-1)个间距
                var totalFixedHeight = rowCount * markerHeight + (rowCount - 1) * FIXED_SPACING;
                if (totalFixedHeight <= trackHeight) {
                    // 条数少：固定间距，从中间向两边散开
                    var startTop = (trackHeight - totalFixedHeight) / 2;
                    markerTop = startTop + i * (markerHeight + FIXED_SPACING);
                } else {
                    // 条数多：占满轨道高度，均匀平分间距
                    if (rowCount === 1) {
                        markerTop = (trackHeight - markerHeight) / 2;
                    } else {
                        markerTop = (i / (rowCount - 1)) * (trackHeight - markerHeight);
                    }
                }

                var marker = document.createElement('div');
                marker.className = MARKER_CLASS;
                marker.style.top = markerTop + 'px';
                marker.style.height = markerHeight + 'px';
                marker.dataset.rowIndex = String(i);
                marker.dataset.role = getRowRole(row);

                // 绑定悬浮交互（闭包捕获 row 引用）
                (function (msgRow, markerEl) {
                    markerEl.addEventListener('mouseenter', function (e) {
                        showBubble(e, markerEl, msgRow);
                    });
                    markerEl.addEventListener('mouseleave', hideBubble);
                    markerEl.addEventListener('mousedown', function () {
                        // 点击色块时滚动到对应消息
                        var offsetTop = getContentOffsetTop(msgRow, scrollEl);
                        scrollEl.scrollTo({ top: Math.max(0, offsetTop - 8), behavior: 'smooth' });
                    });
                })(row, marker);

                track.appendChild(marker);
            }

            // 监听滚动：更新可见区域内最新用户消息对应的色块为蓝色
            currentScrollEl = scrollEl;
            var markerTrack = track;
            var markerUserRows = userRows;
            scrollHandler = function () {
                updateActiveMarkerRaf(scrollEl, markerTrack, markerUserRows);
            };
            scrollEl.addEventListener('scroll', scrollHandler, { passive: true });
            // 初始更新一次
            updateActiveMarker(scrollEl, markerTrack, markerUserRows);

            // 监听滚动容器尺寸变化（通过 ResizeObserver）
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(debounce(updateMarkers, 200));
                resizeObserver.observe(scrollEl);
            }
        } finally {
            isUpdating = false;
        }
    }

    /* ---------- 悬浮气泡 ---------- */

    function showBubble(event, marker, row) {
        var text = getRowText(row);
        if (!text) return;

        // 构建气泡内容（只展示消息文本，不显示角色标签）
        bubbleEl.innerHTML = '';
        var textDiv = document.createElement('div');
        textDiv.className = 'chat-scroll-marker-bubble-text';
        textDiv.textContent = text;
        bubbleEl.appendChild(textDiv);

        bubbleEl.classList.add('is-visible');

        // 计算气泡位置（fixed 定位）
        var rect = marker.getBoundingClientRect();
        // 先临时显示以测量尺寸
        bubbleEl.style.left = '0px';
        bubbleEl.style.top = '0px';

        var bubbleWidth = Math.min(300, bubbleEl.scrollWidth || bubbleEl.offsetWidth || 250);
        var bubbleHeight = bubbleEl.scrollHeight || bubbleEl.offsetHeight || 80;

        var left = rect.left - bubbleWidth - 10;
        var top = rect.top + rect.height / 2 - bubbleHeight / 2;

        // 边界修正
        if (left < 8) left = 8;
        if (top < 8) top = 8;
        if (top + bubbleHeight > window.innerHeight - 8) {
            top = window.innerHeight - bubbleHeight - 8;
        }

        bubbleEl.style.left = left + 'px';
        bubbleEl.style.top = top + 'px';
    }

    function hideBubble() {
        if (bubbleEl) bubbleEl.classList.remove('is-visible');
    }

    /* ---------- Active 色块追踪 ---------- */

    var activeRafId = null;
    var lastActiveIndex = -2;  // 初始化为无效值，确保首次一定更新

    function updateActiveMarker(scrollEl, track, userRows) {
        var containerRect = scrollEl.getBoundingClientRect();
        var viewTop = containerRect.top;
        var viewBottom = containerRect.bottom;

        // 从后往前找第一个可见的用户消息（最新一条）
        var activeIndex = -1;
        for (var i = userRows.length - 1; i >= 0; i--) {
            var rowRect = userRows[i].getBoundingClientRect();
            // 判断是否在可见区域内（有交集即可）
            if (rowRect.bottom > viewTop && rowRect.top < viewBottom) {
                activeIndex = i;
                break;
            }
        }

        // 只在 active index 真正变化时才操作 DOM，避免反复添加/移除 class 导致闪烁
        if (activeIndex === lastActiveIndex) return;
        lastActiveIndex = activeIndex;

        var markers = track.children;
        for (var j = 0; j < markers.length; j++) {
            if (j === activeIndex) {
                markers[j].classList.add('is-active');
            } else {
                markers[j].classList.remove('is-active');
            }
        }
    }

    // rAF 节流版本，避免高频 scroll 事件反复操作 DOM
    function updateActiveMarkerRaf(scrollEl, track, userRows) {
        if (activeRafId) return;
        activeRafId = requestAnimationFrame(function () {
            activeRafId = null;
            updateActiveMarker(scrollEl, track, userRows);
        });
    }

    /* ---------- MutationObserver ---------- */

    function shouldProcessMutations(mutations) {
        // 只处理聊天消息相关的新增节点，忽略所有属性变化和其他组件的 DOM 变化
        for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.type !== 'childList' || !m.addedNodes) continue;

            for (var j = 0; j < m.addedNodes.length; j++) {
                var node = m.addedNodes[j];
                if (node.nodeType !== 1) continue;

                // 忽略标记元素自身
                if (node.classList && (node.classList.contains(TRACK_CLASS) ||
                    node.classList.contains(MARKER_CLASS) ||
                    node.classList.contains(BUBBLE_CLASS))) {
                    continue;
                }

                // 只关心聊天消息相关的新增节点
                var inChat = false;
                if (node.classList && (node.classList.contains('chat-row') ||
                    node.classList.contains('chat-conversation-block') ||
                    node.classList.contains('ai-chat-messages'))) {
                    inChat = true;
                } else if (node.querySelector && node.querySelector('.chat-row')) {
                    inChat = true;
                }

                if (inChat) return true;
            }
        }
        return false;
    }

    function startObserving() {
        if (typeof MutationObserver === 'undefined') return;

        mutationObserver = new MutationObserver(function (mutations) {
            if (!shouldProcessMutations(mutations)) return;
            debouncedUpdate();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
            // 不监听 attributes，避免 class/style 变化导致色块频繁重建闪烁
        });
    }

    /* ---------- 初始化 ---------- */

    var debouncedUpdate = debounce(updateMarkers, 180);

    function init() {
        // 创建气泡元素（挂在 body 上，避免被 overflow 裁剪）
        bubbleEl = document.createElement('div');
        bubbleEl.className = BUBBLE_CLASS;
        document.body.appendChild(bubbleEl);

        // 启动 DOM 监听
        startObserving();

        // 窗口尺寸变化
        window.addEventListener('resize', debouncedUpdate);

        // 初次更新
        setTimeout(updateMarkers, 300);
    }

    // 暴露手动刷新接口（供 workbench-app 在消息追加后调用）
    window.ChatScrollMarkers = {
        refresh: debouncedUpdate,
        update: updateMarkers,
        hideBubble: hideBubble
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
