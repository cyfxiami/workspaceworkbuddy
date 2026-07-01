/**
 * 差旅分析页：分类切换、折线图与行为/建议联动
 */
(function () {
    const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月'];

    const TAB_DATA = {
        flight: {
            subtitle: '个人差旅金额 vs 部门平均',
            yMax: 1600,
            personal: [1150, 1220, 1310, 1400, 1480, 1540],
            dept: [850, 900, 950, 1000, 1050, 1100],
            behavior: [
                '你的差旅预订习惯中，临近出发日（1天）预订占比高达 60%',
                '50% 的差旅消费预订时间处于行业价格高峰时段',
                '退改签次数/占比异常偏高，已超过 50%，接近预警',
                { text: '机票/住宿超标预订占比高达 86.4%！', warning: true }
            ],
            saving: [
                '建议将预订时间提前至 5 天，预计可减少支出 ¥2,400',
                '建议避开价格高峰时段（每天10点及16点）预订，预计可减少支出 ¥1,200',
                '建议严格管控退改签行为，当前已接近预警阈值（50%）',
                '建议将超标预订占比控制到50%以下，预计可减少支出 ¥800'
            ],
            explain: '请说明近期差旅预订、退改签及超标消费的业务必要性，以便合规审核。'
        },
        meal: {
            subtitle: '个人餐费金额 vs 部门平均',
            yMax: 800,
            personal: [620, 650, 680, 690, 670, 700],
            dept: [480, 490, 500, 510, 495, 505],
            behavior: [
                { text: '近期公务用餐集中于 [XX 餐厅]，交易笔数与金额均已临近餐费管控预警阈值。', warning: true }
            ],
            saving: [
                '请补充相关业务依据以说明频繁选择该餐厅用餐的合理性，以便纳入白名单管理。'
            ],
            explain: '请补充公务用餐的业务场景与客户/项目关联说明。'
        },
        car: {
            subtitle: '个人打车金额 vs 部门平均',
            yMax: 500,
            personal: [380, 400, 350, 420, 380, 400],
            dept: [280, 290, 270, 300, 285, 295],
            behavior: [
                '当前用车频率及累计消费金额超出部门平均水平 20%',
                { text: '系统监测到近期多次出行至非工作场所 / 非业务必要的 [xx 地点]！', warning: true }
            ],
            saving: [
                '合并行程、减少单独用车',
                '加强用车事由与公务活动的匹配度'
            ],
            explain: '请说明近期高频用车及非典型目的地出行的公务事由。'
        }
    };

    let currentTab = 'flight';
    let eventsBound = false;

    function renderList(container, items) {
        if (!container) return;
        container.innerHTML = items.map((item) => {
            const text = typeof item === 'string' ? item : item.text;
            const warning = typeof item === 'object' && item.warning;
            return `<li${warning ? ' class="is-warning"' : ''}>${text}</li>`;
        }).join('');
    }

    const CHART_COLORS = {
        personal: '#b8a078',
        dept: '#e8dcc8',
        grid: '#eef0f3',
        axis: '#9ca3af'
    };

    function buildChartSvg(data) {
        const width = 560;
        const height = 280;
        const pad = { top: 16, right: 20, bottom: 36, left: 48 };
        const chartW = width - pad.left - pad.right;
        const chartH = height - pad.top - pad.bottom;
        const yMax = data.yMax;
        const stepX = chartW / (MONTHS.length - 1);

        function toPoint(value, index) {
            const x = pad.left + index * stepX;
            const y = pad.top + chartH - (value / yMax) * chartH;
            return { x, y };
        }

        function linePath(values) {
            return values.map((v, i) => {
                const p = toPoint(v, i);
                return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            }).join(' ');
        }

        function areaPath(values) {
            const points = values.map((v, i) => toPoint(v, i));
            const baseline = pad.top + chartH;
            const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            const last = points[points.length - 1];
            const first = points[0];
            return `${line} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`;
        }

        const yTicks = 5;
        const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = Math.round((yMax / yTicks) * i);
            const y = pad.top + chartH - (val / yMax) * chartH;
            return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="${CHART_COLORS.grid}" stroke-width="1"/>
                <text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${CHART_COLORS.axis}">${val}</text>`;
        }).join('');

        const xLabels = MONTHS.map((label, i) => {
            const x = pad.left + i * stepX;
            return `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="11" fill="${CHART_COLORS.axis}">${label}</text>`;
        }).join('');

        const personalDots = data.personal.map((v, i) => {
            const p = toPoint(v, i);
            return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${CHART_COLORS.personal}"/>`;
        }).join('');

        const deptDots = data.dept.map((v, i) => {
            const p = toPoint(v, i);
            return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${CHART_COLORS.dept}"/>`;
        }).join('');

        return `<defs>
            <linearGradient id="travel-area-personal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${CHART_COLORS.personal}" stop-opacity="0.16"/>
                <stop offset="100%" stop-color="${CHART_COLORS.personal}" stop-opacity="0.02"/>
            </linearGradient>
            <linearGradient id="travel-area-dept" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${CHART_COLORS.dept}" stop-opacity="0.22"/>
                <stop offset="100%" stop-color="${CHART_COLORS.dept}" stop-opacity="0.02"/>
            </linearGradient>
        </defs>
        ${yLines}
        ${xLabels}
        <path d="${areaPath(data.dept)}" fill="url(#travel-area-dept)"/>
        <path d="${areaPath(data.personal)}" fill="url(#travel-area-personal)"/>
        <path d="${linePath(data.dept)}" fill="none" stroke="${CHART_COLORS.dept}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${linePath(data.personal)}" fill="none" stroke="${CHART_COLORS.personal}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${deptDots}
        ${personalDots}`;
    }

    function switchTab(tabKey) {
        const data = TAB_DATA[tabKey];
        if (!data) return;
        currentTab = tabKey;

        document.querySelectorAll('.travel-summary-card').forEach((card) => {
            const active = card.dataset.travelTab === tabKey;
            card.classList.toggle('is-active', active);
            card.setAttribute('aria-selected', String(active));
        });

        const subtitle = document.getElementById('travel-chart-subtitle');
        if (subtitle) subtitle.textContent = data.subtitle;

        const svg = document.getElementById('travel-chart-svg');
        if (svg) svg.innerHTML = buildChartSvg(data);

        renderList(document.getElementById('travel-behavior-list'), data.behavior);
        renderList(document.getElementById('travel-saving-list'), data.saving);
    }

    function bindEvents() {
        document.querySelectorAll('.travel-summary-card').forEach((card) => {
            card.addEventListener('click', () => {
                const tab = card.dataset.travelTab;
                if (tab) switchTab(tab);
            });
        });

        document.getElementById('travel-explain-btn')?.addEventListener('click', () => {
            const msg = TAB_DATA[currentTab]?.explain || '请补充说明相关业务原因。';
            if (typeof window.openEmployeeExplainDialog === 'function') {
                window.openEmployeeExplainDialog(msg);
            } else {
                window.alert(msg);
            }
        });
    }

    window.initTravelAnalysis = function () {
        if (!eventsBound) {
            bindEvents();
            eventsBound = true;
            switchTab('flight');
        } else {
            switchTab(currentTab);
        }
    };

    function escapeHtmlText(text) {
        return String(text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    window.buildTravelAnalysisSummaryChatHtml = function () {
        const sections = [
            { key: 'flight', title: '机票/住宿', icon: '✈️' },
            { key: 'meal', title: '餐费', icon: '🍱' },
            { key: 'car', title: '用车', icon: '🚗' }
        ];

        const renderItems = (items) => {
            return (items || []).map((item) => {
                const text = typeof item === 'string' ? item : item?.text;
                const warning = typeof item === 'object' && item?.warning;
                return `<li${warning ? ' class="is-warning"' : ''}>${escapeHtmlText(text || '')}</li>`;
            }).join('');
        };

        const html = sections.map((sec) => {
            const data = TAB_DATA[sec.key];
            if (!data) return '';
            return `
                <div class="travel-chat-section">
                    <p class="chat-md-h3">${escapeHtmlText(sec.icon)} ${escapeHtmlText(sec.title)} · ${escapeHtmlText(data.subtitle || '')}</p>
                    <p><strong>行为异常</strong></p>
                    <ul class="chat-md-list travel-chat-list">${renderItems(data.behavior)}</ul>
                    <p><strong>节省建议</strong></p>
                    <ul class="chat-md-list travel-chat-list">${renderItems(data.saving)}</ul>
                    <p><strong>解释口径</strong>：${escapeHtmlText(data.explain || '')}</p>
                </div>
            `;
        }).join('');

        return `
            <p class="chat-md-h2">差旅分析汇总</p>
            <p>已将机票/住宿、餐费、用车三类差旅的费用对比、行为异常与节省建议汇总如下：</p>
            ${html}
        `;
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('travel-dashboard')) {
            window.initTravelAnalysis();
        }
    });
})();
