    // 登录处理函数
    function handleLogin() {
        alert('登录功能即将上线，敬请期待！');
    }
    
    // 打开数字人聊天界面
    function handleTopAvatarClick(avatarType) {
        if (getPanelKey() === 'org') {
            selectOrgAgent(avatarType);
            return;
        }
        if (getPanelKey() === 'support') {
            openSupportAvatarChat(avatarType);
            return;
        }
        openAvatarChat(avatarType);
    }

    function openAvatarChat(avatarType) {
        const assistant = getTopBusinessAssistant(avatarType);
        if (!assistant) return;

        switchWorkbenchTab('employee');
        const panel = document.getElementById('workbench-panel-employee');
        if (!panel) return;

        const state = getPanelState(panel);

        // 点击顶部业务助理不进入聊天模式，仅在输入框显示 @业务助理名 chip
        state.currentTopBusinessAssistant = assistant.id;
        state.currentExtraAssistantId = null;
        state.currentCatalogAssistant = null;
        state.currentCardIndex = null;
        state.currentInputSkillId = null;
        state.exceptionChatActive = false;

        updateTopAvatarActive(avatarType);

        refreshInputSkillPicker(panel);
        updateEmployeeInputPlaceholder(panel);
    }
    
    // 打开业绩看板详情（客户总资产/总收入）
    function openDashboardDetail(type) {
        // 复用toggleCustomerDetails函数打开对应的二级页面
        toggleCustomerDetails(type);
    }
    
    // 打开客户详情二级页面
    function toggleCustomerDetails(type) {
        const detailPage = document.getElementById('detail-page');
        const assetsDetails = document.getElementById('assets-details-page');
        const revenueDetails = document.getElementById('revenue-details-page');
        const costDetails = document.getElementById('cost-details-page');
        const detailTitle = document.getElementById('detail-page-title');
        
        // 隐藏所有详情
        assetsDetails.style.display = 'none';
        revenueDetails.style.display = 'none';
        costDetails.style.display = 'none';
        
        // 根据类型显示对应详情
        if (type === 'assets') {
            detailTitle.textContent = '客户总资产及明细';
            assetsDetails.style.display = 'block';
        } else if (type === 'revenue') {
            detailTitle.textContent = '客户带来的总收入及明细';
            revenueDetails.style.display = 'block';
        } else if (type === 'cost') {
            detailTitle.textContent = '维护客户的总成本及明细';
            costDetails.style.display = 'block';
        }
        
        // 显示二级页面
        detailPage.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 禁止背景滚动
    }
    
    // 关闭二级页面
    function closeDetailPage() {
        const detailPage = document.getElementById('detail-page');
        detailPage.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }
    
    // 计算绩效奖金
    function calculateBonus() {
        const startDate = getPanelEl('start-date')?.value;
        const endDate = getPanelEl('end-date')?.value;
        
        if (!startDate || !endDate) {
            alert('请选择开始和结束日期');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能晚于结束日期');
            return;
        }
        
        // 模拟计算逻辑（实际应用中应该从后端获取数据）
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // 根据选择的时间段计算收入（这里使用示例数据）
        let revenue = 30; // 基础收入30万元
        
        // 如果是2026年1月，显示示例数据
        if (startDate === '2026-01-01' && endDate === '2026-01-31') {
            revenue = 30;
        } else {
            // 根据天数比例计算（示例算法）
            revenue = Math.round((daysDiff / 31) * 30 * 100) / 100;
        }
        
        const bonusRate = 20; // 20%提取比例（后台参数，不显示）
        const bonusAmount = Math.round(revenue * (bonusRate / 100) * 100) / 100;
        
        // 更新显示 - 只显示收入和奖金，不显示提取比例
        getPanelEl('customer-revenue').textContent = revenue + '万元';
        getPanelEl('bonus-amount').textContent = bonusAmount + '万元';
        
        // 添加动画效果
        const resultDiv = getPanelEl('calculation-result');
        resultDiv.style.opacity = '0.5';
        setTimeout(() => {
            resultDiv.style.opacity = '1';
        }, 200);
    }
    
    // 按时间点查询客户总资产
    function queryAssetsByDate() {
        const date = document.getElementById('assets-date').value;
        if (!date) {
            alert('请选择查询日期');
            return;
        }
        
        // 格式化日期显示
        const dateObj = new Date(date);
        const formattedDate = dateObj.getFullYear() + '年' + (dateObj.getMonth() + 1) + '月' + dateObj.getDate() + '日';
        
        // 更新时间显示
        const displayElements = document.querySelectorAll('#assets-details-page .current-time-display');
        displayElements.forEach(el => {
            el.textContent = '当前显示：' + formattedDate + ' 数据';
        });
        
        // 模拟数据变化（实际应用中应该从后端获取数据）
        // 这里添加动画效果
        const summaryCards = document.querySelectorAll('#assets-details-page .summary-card');
        summaryCards.forEach(card => {
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 200);
        });
        
        // 提示用户
        alert('已更新至 ' + formattedDate + ' 的资产数据');
    }
    
    // 按时间段查询客户收入
    function queryRevenueByRange() {
        const startDate = document.getElementById('revenue-start-date').value;
        const endDate = document.getElementById('revenue-end-date').value;
        
        if (!startDate || !endDate) {
            alert('请选择开始和结束日期');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能晚于结束日期');
            return;
        }
        
        // 格式化日期显示
        const startObj = new Date(startDate);
        const endObj = new Date(endDate);
        const formattedStart = startObj.getFullYear() + '年' + (startObj.getMonth() + 1) + '月' + startObj.getDate() + '日';
        const formattedEnd = endObj.getFullYear() + '年' + (endObj.getMonth() + 1) + '月' + endObj.getDate() + '日';
        
        // 更新时间显示
        const displayElements = document.querySelectorAll('#revenue-details-page .current-time-display');
        displayElements.forEach(el => {
            el.textContent = '当前显示：' + formattedStart + ' - ' + formattedEnd + ' 数据';
        });
        
        // 模拟数据变化动画
        const summaryCards = document.querySelectorAll('#revenue-details-page .summary-card');
        summaryCards.forEach(card => {
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 200);
        });
        
        // 提示用户
        alert('已更新 ' + formattedStart + ' 至 ' + formattedEnd + ' 的收入数据');
    }
    
    // 按时间段查询客户成本
    function queryCostByRange() {
        const startDate = document.getElementById('cost-start-date').value;
        const endDate = document.getElementById('cost-end-date').value;
        
        if (!startDate || !endDate) {
            alert('请选择开始和结束日期');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能晚于结束日期');
            return;
        }
        
        // 格式化日期显示
        const startObj = new Date(startDate);
        const endObj = new Date(endDate);
        const formattedStart = startObj.getFullYear() + '年' + (startObj.getMonth() + 1) + '月' + startObj.getDate() + '日';
        const formattedEnd = endObj.getFullYear() + '年' + (endObj.getMonth() + 1) + '月' + endObj.getDate() + '日';
        
        // 更新时间显示
        const displayElements = document.querySelectorAll('#cost-details-page .current-time-display');
        displayElements.forEach(el => {
            el.textContent = '当前显示：' + formattedStart + ' - ' + formattedEnd + ' 数据';
        });
        
        // 模拟数据变化动画
        const summaryCards = document.querySelectorAll('#cost-details-page .summary-card');
        summaryCards.forEach(card => {
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 200);
        });
        
        // 提示用户
        alert('已更新 ' + formattedStart + ' 至 ' + formattedEnd + ' 的成本数据');
    }
    
    // ========== 工作台 Tab 切换 ==========
    const workbenchPanelState = {
        support: { chatModeActive: false, currentCardIndex: 0, miniAvatarsInitialized: false, currentSupportAgent: null, currentSupportInputAgent: null, currentTaskAgentId: null, currentTask: null, currentTodoStep: null, supportWelcomeShown: false, currentSessionId: null, supportChatMessages: [], currentInputSkillId: null, currentExtraAssistantId: null, mentionedEmployees: [] },
        org: { chatModeActive: true, currentCardIndex: 0, miniAvatarsInitialized: false, currentOrgAgent: null, currentInputSkillId: null },
        employee: { chatModeActive: false, currentCardIndex: null, miniAvatarsInitialized: false, currentSessionId: null, chatMessages: [], employeeModelGuide: null, currentInputSkillId: null, currentExtraAssistantId: null, exceptionChatActive: false, currentTopBusinessAssistant: null, mentionedEmployees: [] }
    };

    const supportCategoryAgentTasks = {
        organizer: {
            ib: [
                {
                    id: 'ib-1',
                    title: '机构客户"测试科技有限公司"开户绿色通道申请待审批',
                    description: '机构客户"测试科技有限公司"开户绿色通道申请待审批，需协调运营部加急处理。',
                    completedSteps: ['开户申请已提交至运营系统', '客户资料初审已完成', '已标记绿色通道加急标签'],
                    nextSteps: ['需协调运营部加急处理']
                },
                {
                    id: 'ib-2',
                    title: '客户张三（账户资产待核验）拟参与"演示一号"股权投资项目',
                    description: '客户张三（账户资产待核验）拟参与"演示一号"股权投资项目，需协助完成投资者准入认定（金融资产≥300万元）。',
                    completedSteps: ['客户表达参与意向', '初步核验资产与风险测评', '收集投资者准入材料清单（资产证明、收入证明）'],
                    nextSteps: ['需协助完成投资者准入认定（金融资产≥300万元）']
                }
            ]
        },
        investment_manager: {
            asset: [
                {
                    id: 'asset-1',
                    title: '客户李四"测试一号"私募基金双录视频待合规审核',
                    description: '客户李四"测试一号"私募基金双录视频待合规审核，需协助推进产品签约流程。',
                    completedSteps: ['客户已完成风险揭示书签署', '双录视频已上传系统', '产品合同草案已生成'],
                    nextSteps: ['需协助推进产品签约流程']
                }
            ]
        },
        account_service: {
            retail: [
                {
                    id: 'retail-1',
                    title: '团队定投缺口8户且客户周八（C1持有R4）待复核',
                    description: '团队定投缺口8户；客户周八触发规则「C1不得持有R4产品」，待督导客户经理复核。',
                    completedSteps: ['定投任务完成率已统计（22/30户）', 'C1持有R4客户已标记', '客户经理名单已梳理'],
                    nextSteps: ['需督导客户经理并协调资源']
                }
            ]
        }
    };

    const supportAgents = [
        {
            id: 'ib',
            name: '投行业务助理',
            image: 'images/Avatar1.png',
            tasks: []
        },
        {
            id: 'asset',
            name: '资管业务助理',
            image: 'images/Avatar2.png',
            tasks: []
        },
        {
            id: 'retail',
            name: '零售业务助理',
            image: 'images/Avatar3.png',
            tasks: [
                {
                    id: 'retail-1',
                    title: '协和医院赵宇主任开户跟进',
                    description: '赵宇主任已提交开户资料，并提出调降两融费率的申请，今日需联系确认。',
                    completedSteps: ['收到并审核开户资料', '完成适当性评估', '梳理两融费率政策依据'],
                    nextSteps: ['今日与赵主任电话沟通确认', '准备费率调整申请方案', '跟进账户开通进度']
                },
                {
                    id: 'retail-2',
                    title: '账户资产500万以上客户资产配置',
                    description: '为账户资产500万以上的客户制定季度资产配置建议，需结合持仓结构与风险测评结果。',
                    completedSteps: ['更新客户风险测评结果', '梳理当前持仓结构', '完成大类资产研判'],
                    nextSteps: ['出具资产配置建议书', '预约客户面谈讲解', '跟进调仓执行方案']
                },
                {
                    id: 'retail-3',
                    title: '两融业务费率策略优化',
                    description: '针对活跃两融客户群体，分析费率策略与客户留存关系。',
                    completedSteps: ['提取近三月两融客户数据', '完成费率敏感度分析', '对标同业费率水平'],
                    nextSteps: ['制定差异化费率方案', '提交审批并配置系统', '通知客户经理执行口径']
                }
            ]
        },
        {
            id: 'invest',
            name: '投资业务助理',
            image: 'images/Avatar4.png',
            tasks: [
                {
                    id: 'invest-1',
                    title: '中银金租新能源研究服务',
                    description: '中银金租有新能源方面的研究服务安排，需协调研究所研究员路演。',
                    completedSteps: ['确认客户研究服务范围', '联系新能源领域首席研究员', '初步拟定路演提纲'],
                    nextSteps: ['本周安排研究员路演', '准备新能源行业对比分析材料', '路演后跟进客户反馈']
                },
                {
                    id: 'invest-2',
                    title: '某行业Research Memo',
                    description: '撰写半导体行业Research Memo，覆盖投资逻辑与核心标的筛选。',
                    completedSteps: ['完成行业产业链梳理', '收集核心公司财务数据', '整理政策文件与可验证行业指标'],
                    nextSteps: ['撰写投资逻辑与风险提示', '完成核心标的对比表', '提交内部评审']
                },
                {
                    id: 'invest-3',
                    title: '投资组合风险评估',
                    description: '对现有投资组合进行季度风险评估与压力测试。',
                    completedSteps: ['更新持仓与市场数据', '完成VaR测算', '识别集中度风险点'],
                    nextSteps: ['撰写风险评估报告', '提出调仓建议', '组织投研讨论会']
                }
            ]
        },
        {
            id: 'sales',
            name: '销交业务助理',
            image: 'images/Avatar5.png',
            tasks: [
                {
                    id: 'sales-1',
                    title: '机构客户债券销售路演',
                    description: '某省城投债发行项目，需向机构客户开展销售路演。',
                    completedSteps: ['完成路演材料初稿', '确定目标客户名单', '预约首轮路演时间'],
                    nextSteps: ['完善路演PPT与FAQ', '开展机构客户路演', '汇总意向认购反馈']
                },
                {
                    id: 'sales-2',
                    title: '大客户交易服务方案',
                    description: '为战略机构客户制定专属交易服务方案，提升客户粘性。',
                    completedSteps: ['梳理客户历史交易特征', '访谈客户交易意向', '对标同业服务方案'],
                    nextSteps: ['撰写专属服务方案', '协调交易台资源支持', '提交客户确认']
                },
                {
                    id: 'sales-3',
                    title: '市场行情策略简报',
                    description: '整理本周债券市场行情与交易策略要点，供销售团队使用。',
                    completedSteps: ['收集宏观与政策动态', '整理收益率曲线变化', '汇总热门品种成交情况'],
                    nextSteps: ['撰写策略简报', '销售晨会宣讲', '更新客户推送话术']
                }
            ]
        },
        {
            id: 'institution',
            name: '机构业务助理',
            image: 'images/Avatar6.png',
            tasks: [
                {
                    id: 'institution-1',
                    title: '海南农商行机构准入',
                    description: '海南农商行机构准入事项已与黄亮副行长沟通，建议本周安排与金融市场部赵翔鹏总经理面谈。',
                    completedSteps: ['完成准入申请材料准备', '与黄亮副行长初步沟通', '梳理合作业务方向'],
                    nextSteps: ['本周安排赵翔鹏总经理面谈', '准备路演与合作方案材料', '跟进准入审批进度']
                },
                {
                    id: 'institution-2',
                    title: '机构客户年度服务计划',
                    description: '为重点机构客户制定年度服务计划，覆盖研究、交易、产品等多维度。',
                    completedSteps: ['完成客户分析记录更新', '梳理年度合作回顾', '收集各部门服务资源'],
                    nextSteps: ['撰写年度服务计划书', '预约客户高层拜访', '确定季度服务里程碑']
                },
                {
                    id: 'institution-3',
                    title: '跨境业务合作合规要点',
                    description: '推进与境外机构跨境业务合作，需梳理合规要点与审批流程。',
                    completedSteps: ['研读最新跨境监管规定', '梳理现有合作模式', '识别合规风险点'],
                    nextSteps: ['形成合规要点清单', '提交合规部门预审', '更新合作协议模板']
                }
            ]
        },
        {
            id: 'research',
            name: '研究业务助理',
            image: 'images/Avatar8.png',
            tasks: []
        },
        {
            id: 'credit',
            name: '信用业务助理',
            image: 'images/Avatar9.png',
            tasks: []
        },
        {
            id: 'verify',
            name: '交叉验证助理',
            image: 'images/Avatar7.png',
            tasks: [
                {
                    id: 'verify-1',
                    title: 'IPO尽调数据交叉验证',
                    description: '对某IPO项目尽调报告中的财务数据进行多来源交叉验证。',
                    completedSteps: ['收集招股书与审计报告数据', '比对工商与公开披露信息', '标记初步差异项'],
                    nextSteps: ['逐项核实差异原因', '撰写交叉验证报告', '反馈项目组补充说明']
                },
                {
                    id: 'verify-2',
                    title: '研究结论关键假设复核',
                    description: '复核新能源行业对比分析报告中的关键假设与结论逻辑。',
                    completedSteps: ['提取报告核心结论与假设', '核对数据来源与计算过程', '标注待确认假设项'],
                    nextSteps: ['与研究员沟通确认', '更新复核意见', '归档复核工作底稿']
                },
                {
                    id: 'verify-3',
                    title: '合规要件完整性核验',
                    description: '核验某资管产品发行前的合规要件是否完整齐备。',
                    completedSteps: ['梳理合规要件清单', '逐项核对已提交材料', '记录缺失与待补项'],
                    nextSteps: ['督促相关部门补齐材料', '完成最终核验确认', '出具合规核验意见']
                }
            ]
        }
    ];

    const supportBadgeAgentIds = ['ib', 'asset', 'retail'];

    const supportAgentCategoryMap = {
        ib: 'organizer',
        asset: 'investment_manager',
        retail: 'account_service',
        invest: 'investment_manager',
        sales: 'account_service',
        institution: 'organizer',
        research: 'investment_manager',
        credit: 'account_service',
        verify: 'product_design'
    };

    const supportTopCategories = [
        { id: 'organizer', name: '组织者助理', desc: '统筹项目资源与进度', icon: 'users', badgeAgentIds: ['ib'] },
        { id: 'investment_manager', name: '投资经理助理', desc: '管理投资组合与收益', icon: 'trending-up', badgeAgentIds: ['asset'] },
        { id: 'account_service', name: '账户服务助理', desc: '处理账户相关事务', icon: 'shield', badgeAgentIds: ['retail'] },
        { id: 'product_design', name: '产品设计助理', desc: '设计金融产品方案', icon: 'layers', badgeAgentIds: [] }
    ];

    let currentSupportCategoryId = null;

    const orgAgents = [
        {
            id: 'ib',
            name: '投行业务助理',
            image: 'images/Avatar1.png',
            prompts: [
                '帮我梳理IPO项目尽调清单',
                '生成招股书核心章节写作框架',
                '对比同行业上市公司资产负债与现金流',
                '整理投行业务合规审查要点',
                '撰写IPO路演PPT核心内容提纲',
                '梳理定增项目关键审批流程',
                '对比近期同行业IPO定价策略'
            ],
            getReply: (msg) => `关于「${msg}」，我将从项目尽调、发行方案、合规审查等维度为你提供支持。请补充具体项目名称或客户信息，以便进一步分析。`
        },
        {
            id: 'asset',
            name: '资管业务助理',
            image: 'images/Avatar2.png',
            prompts: [
                '设计一款固收+资管产品方案',
                '分析客户风险测评结果与产品匹配',
                '整理资管合同关键条款要点',
                '生成产品说明书核心内容框架',
                '对比同类资管产品收益与风险特征',
                '梳理私募产品投资者准入认定流程（金融资产≥300万元）',
                '撰写资管产品路演材料提纲'
            ],
            getReply: (msg) => `针对「${msg}」，我可以协助你完成产品设计、风险匹配与合规要点梳理。请告诉我目标客户类型与产品方向。`
        },
        {
            id: 'retail',
            name: '零售业务助理',
            image: 'images/Avatar3.png',
            prompts: [
                '为账户资产500万以上的客户制定资产配置建议',
                '分析两融业务客户意向与费率策略',
                '生成客户拜访谈话要点',
                '整理零售客户投诉处理流程',
                '梳理新开客户开户与适当性匹配流程',
                '撰写理财产品营销话术要点',
                '分析近期活跃客户交易行为特征'
            ],
            getReply: (msg) => `关于「${msg}」，我将结合客户分析结果与业务规则为你提供建议。请补充客户基本情况。`
        },
        {
            id: 'invest',
            name: '投资业务助理',
            image: 'images/Avatar4.png',
            prompts: [
                '分析某行业投资逻辑与核心标的',
                '生成Research Memo研究框架',
                '对比同赛道竞品财务指标',
                '梳理投资组合风险评估要点',
                '撰写行业对比分析框架提纲',
                '分析宏观政策对某板块的影响',
                '整理投研会议纪要关键结论'
            ],
            getReply: (msg) => `针对「${msg}」，我将从对比对象、比较维度、资产负债与现金流等方面协助你。请提供具体行业或标的名称。`
        },
        {
            id: 'sales',
            name: '销交业务助理',
            image: 'images/Avatar5.png',
            prompts: [
                '整理机构客户交易意向对接流程',
                '生成债券销售路演材料提纲',
                '分析市场行情与交易策略要点',
                '梳理大客户交易服务方案',
                '撰写固收产品推介核心卖点',
                '对比同类债券发行利率水平',
                '整理机构客户分级服务体系'
            ],
            getReply: (msg) => `关于「${msg}」，我可以协助整理对接流程、路演材料与交易策略。请说明具体业务场景。`
        },
        {
            id: 'institution',
            name: '机构业务助理',
            image: 'images/Avatar6.png',
            prompts: [
                '准备机构客户准入路演材料',
                '梳理机构业务合作方案框架',
                '分析机构客户分层与业务机会',
                '生成机构拜访会议纪要模板',
                '撰写机构客户年度服务计划提纲',
                '整理跨境业务合作合规要点',
                '分析重点机构客户业务渗透空间'
            ],
            getReply: (msg) => `针对「${msg}」，我将协助你完成准入材料、合作方案与客户分析。请提供机构客户名称。`
        },
        {
            id: 'research',
            name: '研究业务助理',
            image: 'images/Avatar8.png',
            prompts: [
                '撰写行业对比分析框架（对比对象+比较维度）',
                '整理宏观策略周报核心观点',
                '分析某上市公司资产负债、现金流与资产配置',
                '梳理研究所路演材料要点',
                '对比同行业竞品财务与经营指标',
                '生成Research Memo研究提纲',
                '汇总最新政策对行业影响分析'
            ],
            getReply: (msg) => `关于「${msg}」，我将从资产负债、现金流、资产配置及对比维度等方面协助你。请提供具体研究主题或标的。`
        },
        {
            id: 'credit',
            name: '信用业务助理',
            image: 'images/Avatar9.png',
            prompts: [
                '分析客户信用评级与授信方案',
                '梳理两融业务风险监控要点',
                '生成股票质押项目尽调清单',
                '整理信用业务合规审查流程',
                '评估客户担保品折算率调整建议',
                '撰写信用风险预警报告框架',
                '对比同业信用业务产品方案'
            ],
            getReply: (msg) => `针对「${msg}」，我将从授信评估、风险监控、合规审查等维度为你提供支持。请补充客户或项目基本情况。`
        },
        {
            id: 'verify',
            name: '交叉验证助理',
            image: 'images/Avatar7.png',
            prompts: [
                '交叉验证财务数据一致性',
                '复核研究结论关键假设',
                '核验合规要件完整性',
                '比对多来源信息差异点',
                '梳理尽调报告逻辑漏洞检查清单',
                '验证定价模型关键参数与公开数据一致性',
                '比对招股书与公开披露信息差异'
            ],
            getReply: (msg) => `关于「${msg}」，我将从数据一致性、结论复核、合规核验等维度为你交叉验证。请提供需验证的材料或数据来源。`
        }
    ];

    const orgDefaultPrompts = [
        '请示事项：帮我汇总本周待审批请示事项，并跟踪流转进度',
        '经营看板：展示各业务条线核心经营指标、收入成本与同比环比趋势',
        '风险提示：汇总当前合规、操作与市场等各类风险提示清单',
        '队伍状况：查看各部门人员配置、出勤情况与团队绩效概况',
        '应急组织：展示应急预案、应急联络机制与当前响应状态'
    ];

    function getOrgDefaultPromptReply(message) {
        const replies = {
            '请示事项：帮我汇总本周待审批请示事项，并跟踪流转进度': '你好，这里是组织协同管理平台。我已收到你的请示事项查询，可为你汇总本周待审批事项清单、跟踪各节点流转进度，并提醒即将到期的关键审批。请说明具体请示类型、涉及部门或优先级，我将为你整理明细。',
            '经营看板：展示各业务条线核心经营指标、收入成本与同比环比趋势': '你好，这里是组织协同管理平台。我可以为你展示投行、资管、经纪等各业务条线的核心经营指标，包括收入、成本、利润及同比环比变化趋势。请告诉我你关注的业务条线、统计口径或时间范围（如本月、本季度）。',
            '风险提示：汇总当前合规、操作与市场等各类风险提示清单': '你好，这里是组织协同管理平台。我可以汇总当前需关注的合规风险、操作风险与市场风险预警信息，并按优先级分类展示。请说明你需要查看的风险类别（如合规、信用、流动性等）或关注范围。',
            '队伍状况：查看各部门人员配置、出勤情况与团队绩效概况': '你好，这里是组织协同管理平台。我可以提供各部门人员编制、在岗出勤、梯队结构及绩效达成概况，帮助你掌握队伍运行状态。请告诉我你需要了解的部门、团队或管理层级范围。',
            '应急组织：展示应急预案、应急联络机制与当前响应状态': '你好，这里是组织协同管理平台。我可以展示现有应急预案、各层级应急联络机制及当前响应状态，协助你快速掌握应急组织运行情况。请说明需要查看的应急场景或事件类型（如系统故障、舆情、业务中断等）。'
        };
        return replies[message] || `你好，这里是组织协同管理平台。关于「${message}」，我将从组织协同视角为你提供支持。你也可以先选择上方业务助理获得更专业的协助。`;
    }

    function getActiveWorkbenchPanel() {
        return document.querySelector('.workbench-panel.active');
    }

    const WORKBENCH_ROLE_STORAGE_KEY = 'workbenchRole';
    const WORKBENCH_LOGIN_STORAGE_KEY = 'workbenchLoggedIn';
    /** 临时隐藏：顶部业务助理新增、助手卡片新增、输入框技能选择（改为 false 即可恢复） */
    const WB_HIDE_MANAGE_ENTRIES = true;
    /** 临时隐藏：侧栏业绩绩效入口（改为 false 即可恢复） */
    const WB_HIDE_PERFORMANCE_ENTRY = true;
    const WORKBENCH_LOGIN_USER_KEY = 'workbenchLoginUser';

    const EMPLOYEE_LOGIN_PROFILES = {
        demo: { name: '陈小明', dept: '投行一部' },
        chenming: { name: '陈小明', dept: '投行一部' },
        mingchen: { name: '陈小明', dept: '投行一部' },
        chengong: { name: '陈小明', dept: '投行一部' }
    };

    const EXCEPTION_SUPPORT_NAME_MASK = {
        周强: '张三',
        王磊: '王五',
        李航: '赵六',
        赵静: '孙七',
        钱七: '周八',
        张某: '王某'
    };
    const SUPPORT_SESSIONS_KEY = 'workbench-sessions-support-v1';
    let currentWorkbenchRole = null;
    let loginAccountMode = 'oa';
    let workbenchInitialized = false;

    const loginAccountModeConfig = {
        oa: {
            label: 'OA账号',
            placeholder: '请输入OA账号',
            toggleText: '使用用户名登录',
            emptyHint: '请输入OA账号和密码'
        },
        username: {
            label: '用户名',
            placeholder: '请输入用户名',
            toggleText: '使用OA账号登录',
            emptyHint: '请输入用户名和密码'
        }
    };

    function applyLoginAccountMode(mode, options = {}) {
        const config = loginAccountModeConfig[mode] || loginAccountModeConfig.oa;
        loginAccountMode = mode;

        const labelEl = document.getElementById('login-account-label');
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const toggleBtn = document.getElementById('login-mode-toggle-btn');
        const errorEl = document.getElementById('login-error');

        if (labelEl) labelEl.textContent = config.label;
        if (usernameInput) {
            usernameInput.placeholder = config.placeholder;
            if (options.clearInputs) {
                usernameInput.value = '';
            } else if (mode === 'oa' && !usernameInput.value.trim()) {
                usernameInput.value = 'demo';
            }
        }
        if (passwordInput && options.clearInputs) {
            passwordInput.value = '';
        } else if (passwordInput && mode === 'oa' && !passwordInput.value) {
            passwordInput.value = '123456';
        }
        if (toggleBtn) toggleBtn.textContent = config.toggleText;
        if (errorEl) errorEl.hidden = true;

        if (options.focusInput && usernameInput) {
            usernameInput.focus();
        }
    }

    function toggleLoginAccountMode() {
        const nextMode = loginAccountMode === 'oa' ? 'username' : 'oa';
        applyLoginAccountMode(nextMode, { clearInputs: true, focusInput: true });
        if (nextMode === 'oa') {
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');
            if (usernameInput) usernameInput.value = 'demo';
            if (passwordInput) passwordInput.value = '123456';
        }
    }

    function resetLoginFormState() {
        applyLoginAccountMode('oa', { clearInputs: false });
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        if (usernameInput) usernameInput.value = 'demo';
        if (passwordInput) passwordInput.value = '123456';
    }

    function getStoredWorkbenchRole() {
        const role = sessionStorage.getItem(WORKBENCH_ROLE_STORAGE_KEY);
        return role === 'support' ? 'support' : 'employee';
    }

    function isWorkbenchLoggedIn() {
        return sessionStorage.getItem(WORKBENCH_LOGIN_STORAGE_KEY) === 'true';
    }

    function getWorkbenchBrandTitle(role) {
        const resolvedRole = role || currentWorkbenchRole || 'employee';
        return resolvedRole === 'support' ? '业务支持中心工作台' : '员工工作台';
    }

    function getWorkbenchUserLabel(role) {
        const resolvedRole = role || currentWorkbenchRole || 'employee';
        return resolvedRole === 'support' ? '业务支持人员' : '业务团队人员';
    }

    function updateNavTitleForRole(role) {
        const resolvedRole = role || currentWorkbenchRole || 'employee';
        const brandTitle = getWorkbenchBrandTitle(resolvedRole);
        const userLabel = getWorkbenchUserLabel(resolvedRole);
        const sidebarTitleEl = document.getElementById('sidebar-title');
        const heroTitleEl = document.getElementById('center-hero-title');
        const sidebarUserNameEl = document.getElementById('sidebar-user-name');
        const sidebarUserAvatarEl = document.getElementById('sidebar-user-avatar');
        if (sidebarTitleEl) sidebarTitleEl.textContent = brandTitle;
        if (sidebarUserNameEl) {
            sidebarUserNameEl.textContent = resolvedRole === 'employee'
                ? getLoggedInEmployeeProfile().name
                : userLabel;
        }
        if (sidebarUserAvatarEl) {
            const avatarSource = resolvedRole === 'employee'
                ? getLoggedInEmployeeProfile().name
                : userLabel;
            sidebarUserAvatarEl.textContent = avatarSource ? avatarSource.charAt(0) : '';
        }
        // 员工端首页主标题为“员工 AI 工作台”，不随角色标题变更

        const supportHeroTitle = document.querySelector('#workbench-panel-support #center-hero-title-support');
        const supportHeroSub = document.querySelector('#workbench-panel-support .center-hero-sub');
        if (supportHeroTitle && resolvedRole === 'support') {
            supportHeroTitle.textContent = '员工 AI 工作台';
        }
        if (supportHeroSub && resolvedRole === 'support') {
            supportHeroSub.textContent = '基于公司自动驾驶大模型驱动';
        }

        const titleEl = document.getElementById('nav-page-title');
        const brandEl = titleEl?.closest('.nav-brand');
        if (!titleEl) return;

        if (resolvedRole === 'support') {
            titleEl.classList.add('nav-title-multiline');
            brandEl?.classList.add('nav-brand-support-title');
            titleEl.innerHTML = '<span class="nav-title-line-main">业务支持中心</span><span class="nav-title-line-sub">工作台</span>';
        } else {
            titleEl.classList.add('nav-title-multiline');
            brandEl?.classList.remove('nav-brand-support-title');
            titleEl.innerHTML = '<span class="nav-title-line-main">员工</span><span class="nav-title-line-sub">工作台</span>';
        }
    }

    function showLoginPage() {
        document.getElementById('login-page')?.removeAttribute('hidden');
        document.getElementById('app-workbench')?.setAttribute('hidden', '');
        document.body.classList.remove('support-tab-active', 'org-tab-active', 'wb-workbench-active', 'wb-hide-manage-entries', 'employee-chat-mode');
        document.body.style.overflow = '';
        resetLoginFormState();
    }

    function logoutWorkbench() {
        const lastRole = currentWorkbenchRole || getStoredWorkbenchRole();
        try {
            sessionStorage.removeItem(WORKBENCH_LOGIN_STORAGE_KEY);
            sessionStorage.removeItem(WORKBENCH_ROLE_STORAGE_KEY);
            sessionStorage.removeItem(WORKBENCH_LOGIN_USER_KEY);
            currentWorkbenchRole = null;

            hideSupportAvatarsNav();
            restoreSupportSecondaryAvatarFullNames();
            setSupportSecondaryNavExpanded(false);

            const supportPanel = document.getElementById('workbench-panel-support');
            if (supportPanel) {
                const supportState = getPanelState(supportPanel);
                supportState.currentSessionId = null;
                supportState.supportChatMessages = [];
                supportState.supportWelcomeShown = false;
            }
            highlightSupportSessionInSidebar(null);

            if (typeof window.resetEmployeeChat === 'function') {
                window.resetEmployeeChat();
            }
            if (typeof window.resetSupportChatView === 'function') {
                window.resetSupportChatView();
            }
            if (window.ContextPanel?.reset) {
                window.ContextPanel.reset();
            }
            if (window.AppShell?.setCurrentSessionId) {
                window.AppShell.setCurrentSessionId(null);
            }
            if (window.AppShell?.returnToMainSessionView) {
                window.AppShell.returnToMainSessionView();
            }

            document.body.classList.remove('support-tab-active', 'org-tab-active', 'employee-chat-mode');
            document.body.style.overflow = '';

            const loginError = document.getElementById('login-error');
            if (loginError) loginError.hidden = true;
            const roleInput = document.querySelector(`input[name="workbench-role"][value="${lastRole}"]`)
                || document.querySelector('input[name="workbench-role"][value="employee"]');
            if (roleInput) roleInput.checked = true;
        } catch (error) {
            console.error('退出登录清理失败', error);
        } finally {
            if (typeof window.showLoginPage === 'function') {
                window.showLoginPage();
            } else {
                showLoginPage();
            }
        }
    }

    window.logoutWorkbench = logoutWorkbench;
    window.showLoginPage = showLoginPage;

    function enterWorkbench(role) {
        const resolvedRole = role === 'support' ? 'support' : 'employee';
        currentWorkbenchRole = resolvedRole;
        sessionStorage.setItem(WORKBENCH_LOGIN_STORAGE_KEY, 'true');
        sessionStorage.setItem(WORKBENCH_ROLE_STORAGE_KEY, resolvedRole);

        localStorage.removeItem('workbench_employee_exceptions_read');
        localStorage.removeItem('workbench_employee_approval_read');
        localStorage.removeItem('workbench_support_exceptions_read');
        localStorage.removeItem('workbench_support_approval_read');

        document.getElementById('login-page')?.setAttribute('hidden', '');
        document.getElementById('app-workbench')?.removeAttribute('hidden');
        document.body.classList.add('wb-workbench-active');
        document.body.classList.toggle('wb-hide-manage-entries', WB_HIDE_MANAGE_ENTRIES);
        document.body.classList.toggle('wb-hide-performance-entry', WB_HIDE_PERFORMANCE_ENTRY);
        updateNavTitleForRole(resolvedRole);

        if (!workbenchInitialized) {
            initWorkbenchTabs();
            initEmployeeDailyTasks();
            workbenchInitialized = true;
        }
        switchWorkbenchTab(resolvedRole);
    }

    function handleLoginSubmit(event) {
        event.preventDefault();
        const errorEl = document.getElementById('login-error');
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();
        const roleInput = document.querySelector('input[name="workbench-role"]:checked');
        const emptyHint = loginAccountModeConfig[loginAccountMode]?.emptyHint || '请输入账号和密码';

        if (!username || !password) {
            if (errorEl) {
                errorEl.textContent = emptyHint;
                errorEl.hidden = false;
            }
            return;
        }
        if (!roleInput) {
            if (errorEl) {
                errorEl.textContent = '请选择登录角色';
                errorEl.hidden = false;
            }
            return;
        }
        if (errorEl) errorEl.hidden = true;
        sessionStorage.setItem(WORKBENCH_LOGIN_USER_KEY, username.toLowerCase());
        enterWorkbench(roleInput.value);
    }

    function getPanelKey(panel) {
        if (panel?.dataset?.panel) return panel.dataset.panel;
        const activePanel = getActiveWorkbenchPanel();
        if (activePanel?.dataset?.panel) return activePanel.dataset.panel;
        return currentWorkbenchRole || getStoredWorkbenchRole();
    }

    function getPanelState(panel) {
        return workbenchPanelState[getPanelKey(panel)];
    }

    function getPanelEl(id, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p) return document.getElementById(id);
        const key = getPanelKey(p);
        if (key === 'employee') {
            return p.querySelector('#' + id) || document.getElementById(id);
        }
        return p.querySelector('#' + id + '-' + key);
    }

    function getScrollableAncestor(element) {
        let parent = element?.parentElement;
        const scrollables = [];
        while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                scrollables.push(parent);
            }
            parent = parent.parentElement;
        }

        for (const el of scrollables) {
            if (el.scrollHeight > el.clientHeight + 1) {
                return el;
            }
        }

        return scrollables[0] || null;
    }

    function getWorkbenchChatScrollEl(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const card = getLastChatCardElement(p);
        const fromCard = card ? getScrollableAncestor(card) : null;
        if (fromCard) return fromCard;

        const key = getPanelKey(p);
        if (key === 'org') {
            return p.querySelector('.org-workbench-scroll');
        }

        const candidates = [];
        if (key === 'employee') {
            candidates.push(
                getPanelEl('ai-chat-messages', p),
                getPanelEl('ai-chat-view', p),
                document.getElementById('session-scroll')
            );
        } else if (key === 'support') {
            candidates.push(getPanelEl('ai-chat-view', p));
        } else {
            candidates.push(getPanelEl('ai-chat-view', p));
        }

        for (const el of candidates) {
            if (!el) continue;
            const overflowY = window.getComputedStyle(el).overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') {
                return el;
            }
        }

        return candidates.find(Boolean) || null;
    }

    function getLastChatCardElement(panel) {
        const messagesEl = getPanelEl('ai-chat-messages', panel);
        if (!messagesEl) return null;
        const rows = messagesEl.querySelectorAll('.chat-row');
        if (rows.length) return rows[rows.length - 1];
        const blocks = messagesEl.querySelectorAll('.chat-conversation-block');
        return blocks.length ? blocks[blocks.length - 1] : null;
    }

    function getChatCardHeight(card) {
        if (!card) return 0;
        const style = window.getComputedStyle(card);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        return card.offsetHeight + marginTop + marginBottom;
    }

    function scrollLastChatCardIntoView(panel, options = {}) {
        const padding = typeof options.padding === 'number' ? options.padding : 8;
        const card = options.card || getLastChatCardElement(panel);
        const scrollEl = getWorkbenchChatScrollEl(panel);
        if (!scrollEl || !card) return;

        const applyScroll = () => {
            const viewportHeight = scrollEl.clientHeight;
            const cardHeight = getChatCardHeight(card);

            if (cardHeight <= viewportHeight) {
                scrollEl.scrollTop = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
                return;
            }

            const containerRect = scrollEl.getBoundingClientRect();
            const elementRect = card.getBoundingClientRect();
            scrollEl.scrollTop += elementRect.top - containerRect.top - padding;
        };

        applyScroll();
        requestAnimationFrame(() => {
            applyScroll();
            requestAnimationFrame(applyScroll);
        });
    }

    function scrollWorkbenchChatToBottom(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getLastChatCardElement(p)) {
            scrollLastChatCardIntoView(p);
            return;
        }

        const scrollEl = getWorkbenchChatScrollEl(p);
        if (!scrollEl) return;

        const doScroll = () => {
            scrollEl.scrollTop = scrollEl.scrollHeight;
        };

        doScroll();
        requestAnimationFrame(() => {
            doScroll();
            requestAnimationFrame(doScroll);
        });
    }

    function scrollChatElementToTop(panel, element, padding = 12) {
        if (!element) return;
        scrollLastChatCardIntoView(panel, { card: element, padding });
    }

    function getLoggedInEmployeeProfile() {
        const loginId = (sessionStorage.getItem(WORKBENCH_LOGIN_USER_KEY) || 'demo').toLowerCase();
        return EMPLOYEE_LOGIN_PROFILES[loginId] || EMPLOYEE_LOGIN_PROFILES.demo;
    }

    function getExceptionBoardScope(board) {
        if (!board) return 'employee';
        if (board.id === 'exception-reminder-board-support') return 'support';
        if (board.closest('#workbench-panel-support')) return 'support';
        return 'employee';
    }

    function maskExceptionSupportText(text) {
        let result = String(text || '');
        Object.entries(EXCEPTION_SUPPORT_NAME_MASK).forEach(([real, fake]) => {
            result = result.split(real).join(fake);
        });
        return result;
    }

    function getExceptionScopedDesc(card, scope) {
        const fallback = card.querySelector('.exception-alert-desc')?.textContent?.trim() || '';
        if (scope === 'employee') {
            return card.dataset.exceptionDescEmployee || fallback;
        }
        return card.dataset.exceptionDescSupport || fallback;
    }

    function applyExceptionCardScopedCopy(card, scope) {
        const descEl = card.querySelector('.exception-alert-desc');
        if (!descEl) return;

        const deptEl = card.querySelector('.exception-alert-dept');
        const desc = getExceptionScopedDesc(card, scope);
        const dept = scope === 'employee'
            ? (card.dataset.exceptionDeptEmployee || deptEl?.textContent?.trim() || '')
            : (card.dataset.exceptionDeptSupport || deptEl?.textContent?.trim() || '');

        card.dataset.exceptionDescOriginal = desc;
        if (deptEl && dept) {
            card.dataset.exceptionDeptOriginal = dept;
        }

        if (scope === 'employee') {
            descEl.textContent = desc;
            if (deptEl && dept) deptEl.textContent = dept;
            delete card.dataset.supportMasked;
            return;
        }

        applySupportNameMaskToCard(card);
    }

    function refreshExceptionCardOriginalText(card) {
        if (!card) return;
        const dept = card.querySelector('.exception-alert-dept');
        const desc = card.querySelector('.exception-alert-desc');
        if (dept) card.dataset.exceptionDeptOriginal = dept.textContent.trim();
        if (desc) card.dataset.exceptionDescOriginal = desc.textContent.trim();
    }

    function cacheExceptionCardOriginalText(card) {
        if (!card || card.dataset.exceptionDeptOriginal) return;
        const dept = card.querySelector('.exception-alert-dept');
        const desc = card.querySelector('.exception-alert-desc');
        if (dept) card.dataset.exceptionDeptOriginal = dept.textContent.trim();
        if (desc) card.dataset.exceptionDescOriginal = desc.textContent.trim();
    }

    function restoreExceptionCardOriginalText(card) {
        if (!card) return;
        const dept = card.querySelector('.exception-alert-dept');
        const desc = card.querySelector('.exception-alert-desc');
        if (dept && card.dataset.exceptionDeptOriginal) {
            dept.textContent = card.dataset.exceptionDeptOriginal;
        }
        if (desc && card.dataset.exceptionDescOriginal) {
            desc.textContent = card.dataset.exceptionDescOriginal;
        }
        delete card.dataset.supportMasked;
    }

    function applySupportNameMaskToCard(card) {
        const dept = card.querySelector('.exception-alert-dept');
        const desc = card.querySelector('.exception-alert-desc');
        if (dept && card.dataset.exceptionDeptOriginal) {
            dept.textContent = maskExceptionSupportText(card.dataset.exceptionDeptOriginal);
        }
        if (desc && card.dataset.exceptionDescOriginal) {
            desc.textContent = maskExceptionSupportText(card.dataset.exceptionDescOriginal);
        }
        card.dataset.supportMasked = 'true';
    }

    function getEmployeeVisibleExceptionIds() {
        const employeeBoard = document.getElementById('exception-reminder-board');
        if (!employeeBoard) return new Set();
        return new Set(
            Array.from(employeeBoard.querySelectorAll('.exception-alert-card'))
                .filter((card) => {
                    const assignee = card.dataset.exceptionAssignee || '';
                    return assignee === getLoggedInEmployeeProfile().name;
                })
                .map((card) => card.dataset.exceptionId)
                .filter(Boolean)
        );
    }

    function ensureSupportShowsEmployeeExceptions(supportBoard) {
        if (!supportBoard || getExceptionBoardScope(supportBoard) !== 'support') return;
        const sharedIds = getEmployeeVisibleExceptionIds();
        supportBoard.querySelectorAll('.exception-alert-card').forEach((card) => {
            const id = card.dataset.exceptionId;
            if (id && sharedIds.has(id)) {
                card.classList.remove('is-scope-hidden');
            }
        });
    }

    function applyExceptionBoardScope(board) {
        if (!board) return;
        const scope = getExceptionBoardScope(board);
        const profile = getLoggedInEmployeeProfile();

        board.querySelectorAll('.exception-alert-card').forEach((card) => {
            const assignee = card.dataset.exceptionAssignee || '';
            if (scope === 'employee') {
                const visible = assignee === profile.name;
                card.classList.toggle('is-scope-hidden', !visible);
                if (visible) {
                    applyExceptionCardScopedCopy(card, 'employee');
                }
                return;
            }

            card.classList.remove('is-scope-hidden');
            applyExceptionCardScopedCopy(card, 'support');
        });

        if (scope === 'support') {
            ensureSupportShowsEmployeeExceptions(board);
        }

        if (scope === 'employee') {
            syncEmployeeExceptionTabs(board);
            updateEmployeeSidebarNavCounts();
        }
        syncExceptionBoardStats(board);
        board.querySelectorAll('.exception-tab-panel').forEach((panel) => {
            const filterKey = board.dataset.exceptionView === 'all'
                ? (board.dataset.exceptionFilter || 'all')
                : (panel.dataset.exceptionFilter || 'all');
            if (board.dataset.exceptionView === 'all') return;
            applyExceptionListFilter(panel, filterKey);
        });
        if (board.dataset.exceptionView === 'all') {
            applyExceptionAllViewFilter(board, board.dataset.exceptionFilter || 'all');
        }
    }

    function syncEmployeeExceptionTabs(board) {
        if (getExceptionBoardScope(board) !== 'employee') return;
        if (board.dataset.exceptionView === 'all') return;

        board.querySelectorAll('.exception-tab').forEach((tab) => {
            tab.hidden = false;
        });

        const panelKeys = ['behavior', 'employee'];
        let firstVisibleKey = null;
        panelKeys.forEach((key) => {
            const panel = board.querySelector(`.exception-tab-panel[data-exception-panel="${key}"]`);
            const count = panel?.querySelectorAll('.exception-alert-card:not(.is-scope-hidden)').length || 0;
            if (count > 0 && !firstVisibleKey) firstVisibleKey = key;
        });

        const activePanel = board.querySelector('.exception-tab-panel.is-active:not([hidden])');
        const activeCount = activePanel?.querySelectorAll('.exception-alert-card:not(.is-scope-hidden)').length || 0;
        if (!activeCount && firstVisibleKey) {
            activateExceptionTab(board, firstVisibleKey);
        }
    }

    function injectSupportOnlyExceptionCards(board) {
        if (!board || board.dataset.supportInjected === 'true') return;
        if (getExceptionBoardScope(board) !== 'support') return;

        const list = board.querySelector('[data-exception-panel="behavior"] .exception-alert-list');
        if (!list) return;

        const card = document.createElement('article');
        card.className = 'exception-alert-card exception-alert-card--processing';
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        card.dataset.exceptionId = 'large-fund-transfer';
        card.dataset.exceptionAssignee = '钱七';
        card.dataset.exceptionSupportOnly = 'true';
        card.dataset.exceptionInjectedSupport = 'true';
        card.innerHTML = `
            <div class="exception-alert-accent" aria-hidden="true"></div>
            <div class="exception-alert-body">
                <div class="exception-alert-head">
                    <div class="exception-alert-title-line">
                        <h3 class="exception-alert-title">大额异常资金划转</h3>
                        <span class="exception-alert-dept">自营投资部-钱七</span>
                    </div>
                </div>
                <p class="exception-alert-desc">监测到自营投资部钱七名下账户发生单笔超5000万元资金划转，与常规操作模式不符，请组织核实并同步风控。</p>
                <div class="exception-alert-footer">
                    <span class="exception-status-tag exception-status-tag--processing">处理中</span>
                    <time class="exception-alert-time" datetime="2026-06-25T10:40">2026-06-25 10:40</time>
                </div>
            </div>
            <span class="exception-alert-arrow" aria-hidden="true">›</span>
        `;
        list.appendChild(card);
        board.dataset.supportInjected = 'true';
    }

    function bindExceptionAlertCard(board, card) {
        card.removeAttribute('onclick');
        ensureExceptionStatusTagButton(card);

        const handleOpen = (event) => {
            if (event?.target?.closest?.('.exception-status-tag')) return;
            openExceptionAlertFromCard(card);
        };

        if (card.dataset.exceptionCardBound === 'true') return;
        card.dataset.exceptionCardBound = 'true';
        card.addEventListener('click', handleOpen);
        card.querySelector('.exception-status-tag')?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openExceptionAlertFromCard(card);
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openExceptionAlertFromCard(card);
            }
        });
    }

    function applyAllExceptionBoardScopes() {
        const employeeBoard = document.getElementById('exception-reminder-board');
        const supportBoard = document.getElementById('exception-reminder-board-support');
        if (employeeBoard) applyExceptionBoardScope(employeeBoard);
        if (supportBoard) applyExceptionBoardScope(supportBoard);
    }

    window.applyAllExceptionBoardScopes = applyAllExceptionBoardScopes;

    function getLocalDateKey(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatExceptionCardTime(date) {
        if (!date || Number.isNaN(date.getTime())) return '';
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${getLocalDateKey(date)} ${hh}:${mm}`;
    }

    function syncExceptionDemoTodayDates(board) {
        const today = new Date();
        board?.querySelectorAll('[data-exception-demo-today="true"]').forEach((card) => {
            const timeEl = card.querySelector('.exception-alert-time');
            if (!timeEl) return;
            const existing = parseExceptionCardCreatedAt(card);
            const hours = existing?.getHours() ?? 9;
            const minutes = existing?.getMinutes() ?? 0;
            const updated = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                hours,
                minutes,
                0,
                0
            );
            const hh = String(hours).padStart(2, '0');
            const mm = String(minutes).padStart(2, '0');
            timeEl.setAttribute('datetime', `${getLocalDateKey(updated)}T${hh}:${mm}`);
            timeEl.textContent = formatExceptionCardTime(updated);
        });
    }

    function parseExceptionCardCreatedAt(card) {
        const timeEl = card?.querySelector('.exception-alert-time');
        if (!timeEl) return null;
        const raw = (timeEl.getAttribute('datetime') || timeEl.textContent || '').trim();
        if (!raw) return null;
        const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
        const dt = new Date(normalized);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    function isExceptionCardCreatedToday(card) {
        const created = parseExceptionCardCreatedAt(card);
        if (!created) return false;
        return getLocalDateKey(created) === getLocalDateKey();
    }

    function getExceptionCardStatusKey(card) {
        const status = card.querySelector('.exception-status-tag')?.textContent?.trim() || '';
        if (status === '处理中') return 'processing';
        if (status === '已处理') return 'done';
        return 'pending';
    }

    function cardMatchesExceptionFilter(card, filterKey) {
        if (!filterKey || filterKey === 'all') return true;
        if (filterKey === 'today') return isExceptionCardCreatedToday(card);
        return getExceptionCardStatusKey(card) === filterKey;
    }

    const EXCEPTION_STAT_FILTER_MAP = {
        new: 'today',
        processing: 'processing',
        done: 'done'
    };

    function updateExceptionBoardChrome(board) {
        if (!board) return;
        const isAllView = board.dataset.exceptionView === 'all';
        const allBtn = board.querySelector('.exception-all-btn');
        allBtn?.setAttribute('aria-pressed', isAllView ? 'true' : 'false');
        board.classList.toggle('is-all-exceptions-view', isAllView);
    }

    function updateExceptionStatsFilterUI(statsRow, filterKey) {
        const key = filterKey || 'all';
        statsRow?.querySelectorAll('.exception-stat-card').forEach((stat) => {
            const statType = stat.classList.contains('exception-stat-card--new') ? 'new'
                : stat.classList.contains('exception-stat-card--processing') ? 'processing'
                : stat.classList.contains('exception-stat-card--done') ? 'done'
                : '';
            const mapped = EXCEPTION_STAT_FILTER_MAP[statType];
            stat.classList.toggle('is-filter-active', key !== 'all' && mapped === key);
            stat.setAttribute('aria-pressed', key !== 'all' && mapped === key ? 'true' : 'false');
        });
    }

    function updateExceptionFilterUI(panel, filterKey) {
        const key = filterKey || 'all';
        const board = panel?.closest('.exception-reminder-board');
        const isAllView = board?.dataset.exceptionView === 'all';
        updateExceptionStatsFilterUI(panel?.querySelector('.exception-stats-row'), key);
        if (board && !isAllView) {
            updateExceptionBoardChrome(board);
        }
    }

    function updateExceptionAllViewFilterUI(board, filterKey) {
        const allView = board?.querySelector('.exception-all-view');
        updateExceptionStatsFilterUI(allView?.querySelector('.exception-stats-row'), filterKey);
    }

    function applyExceptionListFilter(panel, filterKey) {
        if (!panel) return;
        const key = filterKey || 'all';
        panel.dataset.exceptionFilter = key;
        panel.querySelectorAll('.exception-alert-card').forEach((card) => {
            if (card.classList.contains('is-scope-hidden')) {
                card.classList.add('is-filter-hidden');
                return;
            }
            const show = cardMatchesExceptionFilter(card, key);
            card.classList.toggle('is-filter-hidden', !show);
        });
        updateExceptionFilterUI(panel, key);
    }

    function applyExceptionAllViewFilter(board, filterKey) {
        const allView = board?.querySelector('.exception-all-view');
        if (!allView) return;
        const key = filterKey || 'all';
        board.dataset.exceptionFilter = key;
        allView.querySelectorAll('.exception-alert-card').forEach((card) => {
            if (card.classList.contains('is-scope-hidden')) {
                card.classList.add('is-filter-hidden');
                return;
            }
            const show = cardMatchesExceptionFilter(card, key);
            card.classList.toggle('is-filter-hidden', !show);
        });
        updateExceptionAllViewFilterUI(board, key);
    }

    function markExceptionCardOrigins(board) {
        board?.querySelectorAll('.exception-tab-panel').forEach((panel) => {
            const key = panel.dataset.exceptionPanel;
            if (!key) return;
            panel.querySelectorAll('.exception-alert-card').forEach((card) => {
                card.dataset.exceptionOriginPanel = key;
            });
        });
    }

    function restoreExceptionCardsToPanels(board) {
        if (!board) return;
        board.querySelectorAll('.exception-alert-card').forEach((card) => {
            const origin = card.dataset.exceptionOriginPanel;
            const list = origin
                ? board.querySelector(`.exception-tab-panel[data-exception-panel="${origin}"] .exception-alert-list`)
                : null;
            if (list) list.appendChild(card);
        });
    }

    function ensureExceptionAllView(board) {
        let allView = board.querySelector('.exception-all-view');
        if (allView) return allView;

        const templateStats = board.querySelector('.exception-tab-panel .exception-stats-row');
        allView = document.createElement('div');
        allView.className = 'exception-all-view';
        allView.hidden = true;

        if (templateStats) {
            const statsRow = templateStats.cloneNode(true);
            statsRow.setAttribute('aria-label', '全部异常统计');
            statsRow.querySelectorAll('.exception-stat-card').forEach((statCard) => {
                delete statCard.dataset.bound;
                statCard.classList.remove('is-filter-active');
                statCard.setAttribute('aria-pressed', 'false');
            });
            allView.appendChild(statsRow);
        }

        const list = document.createElement('div');
        list.className = 'exception-alert-list';
        allView.appendChild(list);

        board.querySelector('.exception-board-header')?.insertAdjacentElement('afterend', allView);
        allView.querySelectorAll('.exception-stat-card').forEach((statCard) => {
            bindExceptionStatCard(board, statCard);
        });
        return allView;
    }

    function bindExceptionStatCard(board, statCard) {
        if (!statCard || statCard.dataset.bound === 'true') return;
        statCard.dataset.bound = 'true';
        statCard.setAttribute('role', 'button');
        statCard.setAttribute('tabindex', '0');

        const activateFilter = () => {
            if (board.dataset.exceptionView === 'all') {
                if (!statCard.closest('.exception-all-view')) return;
                const statType = statCard.classList.contains('exception-stat-card--new') ? 'new'
                    : statCard.classList.contains('exception-stat-card--processing') ? 'processing'
                    : 'done';
                const filterKey = EXCEPTION_STAT_FILTER_MAP[statType];
                if (!filterKey) return;
                const current = board.dataset.exceptionFilter || 'all';
                const nextKey = current === filterKey ? 'all' : filterKey;
                applyExceptionAllViewFilter(board, nextKey);
                return;
            }

            const panel = statCard.closest('.exception-tab-panel');
            if (!panel || panel.hidden) return;
            const statType = statCard.classList.contains('exception-stat-card--new') ? 'new'
                : statCard.classList.contains('exception-stat-card--processing') ? 'processing'
                : 'done';
            const filterKey = EXCEPTION_STAT_FILTER_MAP[statType];
            if (!filterKey) return;
            const current = panel.dataset.exceptionFilter || 'all';
            const nextKey = current === filterKey ? 'all' : filterKey;
            applyExceptionListFilter(panel, nextKey);
        };

        statCard.addEventListener('click', activateFilter);
        statCard.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activateFilter();
            }
        });
    }

    function getActiveExceptionTabPanel(board) {
        return board?.querySelector('.exception-tab-panel.is-active:not([hidden])')
            || board?.querySelector('.exception-tab-panel:not([hidden])');
    }

    function resetExceptionPanelFilter(panel) {
        applyExceptionListFilter(panel, 'all');
    }

    function activateExceptionTab(board, tabKey) {
        const tabs = board.querySelectorAll('.exception-tab');
        const panels = board.querySelectorAll('.exception-tab-panel');
        const allView = board.querySelector('.exception-all-view');
        board.dataset.exceptionView = 'tab';
        delete board.dataset.exceptionFilter;
        if (allView) allView.hidden = true;
        restoreExceptionCardsToPanels(board);
        updateExceptionBoardChrome(board);

        tabs.forEach((item) => {
            const active = item.dataset.exceptionTab === tabKey;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-selected', String(active));
        });
        panels.forEach((panel) => {
            const show = panel.dataset.exceptionPanel === tabKey;
            panel.hidden = !show;
            panel.classList.toggle('is-active', show);
            if (show) {
                syncExceptionPanelStats(panel);
                resetExceptionPanelFilter(panel);
            }
        });
    }

    function sortExceptionCardsByCreatedAtDesc(cards) {
        return [...cards].sort((a, b) => {
            const aTime = parseExceptionCardCreatedAt(a)?.getTime() ?? 0;
            const bTime = parseExceptionCardCreatedAt(b)?.getTime() ?? 0;
            return bTime - aTime;
        });
    }

    function showAllExceptions(board) {
        const tabs = board.querySelectorAll('.exception-tab');
        const panels = board.querySelectorAll('.exception-tab-panel');
        markExceptionCardOrigins(board);
        restoreExceptionCardsToPanels(board);

        const allView = ensureExceptionAllView(board);
        const mergedList = allView.querySelector('.exception-alert-list');
        const cards = [];
        ['behavior', 'employee'].forEach((key) => {
            const panel = board.querySelector(`.exception-tab-panel[data-exception-panel="${key}"]`);
            panel?.querySelectorAll('.exception-alert-list .exception-alert-card:not(.is-scope-hidden)').forEach((card) => {
                cards.push(card);
            });
        });
        sortExceptionCardsByCreatedAtDesc(cards).forEach((card) => {
            mergedList.appendChild(card);
        });

        board.dataset.exceptionView = 'all';
        panels.forEach((panel) => {
            panel.hidden = true;
            panel.classList.remove('is-active');
        });
        allView.hidden = false;

        tabs.forEach((item) => {
            item.classList.remove('is-active');
            item.setAttribute('aria-selected', 'false');
        });

        syncExceptionAllViewStats(board);
        applyExceptionAllViewFilter(board, 'all');
        updateExceptionBoardChrome(board);
    }

    function countExceptionCards(cards) {
        const counts = { new: 0, processing: 0, done: 0 };
        cards.forEach((card) => {
            if (card.classList.contains('is-scope-hidden')) return;
            if (isExceptionCardCreatedToday(card)) {
                counts.new += 1;
            }
            const status = card.querySelector('.exception-status-tag')?.textContent?.trim() || '';
            if (status === '处理中') {
                counts.processing += 1;
            } else if (status === '已处理') {
                counts.done += 1;
            }
        });
        return counts;
    }

    function countExceptionPanelStats(panel) {
        const cards = panel?.querySelectorAll('.exception-alert-card') || [];
        return countExceptionCards(cards);
    }

    function syncExceptionAllViewStats(board) {
        const allView = board?.querySelector('.exception-all-view');
        if (!allView) return;
        const counts = countExceptionCards(allView.querySelectorAll('.exception-alert-card'));
        const statsRow = allView.querySelector('.exception-stats-row');
        if (!statsRow) return;
        const setVal = (key, value) => {
            const el = statsRow.querySelector(`.exception-stat-value[data-stat="${key}"]`);
            if (el) el.textContent = String(value);
        };
        setVal('new', counts.new);
        setVal('processing', counts.processing);
        setVal('done', counts.done);
    }

    function syncExceptionPanelStats(panel) {
        if (!panel) return;
        const counts = countExceptionPanelStats(panel);
        const statsRow = panel.querySelector('.exception-stats-row');
        if (!statsRow) return;
        const setVal = (key, value) => {
            const el = statsRow.querySelector(`.exception-stat-value[data-stat="${key}"]`);
            if (el) el.textContent = String(value);
        };
        setVal('new', counts.new);
        setVal('processing', counts.processing);
        setVal('done', counts.done);
    }

    function syncExceptionBoardStats(board) {
        board?.querySelectorAll('.exception-tab-panel').forEach((panel) => {
            syncExceptionPanelStats(panel);
        });
    }

    function initExceptionReminderBoards(root) {
        const scope = root || document;
        scope.querySelectorAll('.exception-reminder-board').forEach((board) => {
            if (board.dataset.initialized === 'true') return;
            board.dataset.initialized = 'true';

            board.dataset.exceptionView = 'tab';
            markExceptionCardOrigins(board);
            syncExceptionDemoTodayDates(board);
            syncExceptionBoardStats(board);
            board.querySelectorAll('.exception-tab-panel').forEach((panel) => {
                resetExceptionPanelFilter(panel);
            });
            updateExceptionBoardChrome(board);

            const tabs = board.querySelectorAll('.exception-tab');
            tabs.forEach((tab) => {
                tab.addEventListener('click', () => {
                    const key = tab.dataset.exceptionTab;
                    if (!key) return;
                    activateExceptionTab(board, key);
                });
            });

            board.querySelectorAll('.exception-tab-panel .exception-stat-card').forEach((statCard) => {
                bindExceptionStatCard(board, statCard);
            });

            const allBtn = board.querySelector('.exception-all-btn');
            if (allBtn && !allBtn.dataset.bound) {
                allBtn.dataset.bound = 'true';
                allBtn.addEventListener('click', () => {
                    showAllExceptions(board);
                });
            }

            board.querySelectorAll('.exception-alert-card').forEach((card) => {
                bindExceptionAlertCard(board, card);
            });

            applyExceptionBoardScope(board);
        });
    }

    function ensureExceptionStatusTagButton(card) {
        const tag = card?.querySelector('.exception-status-tag');
        if (!tag || tag.tagName === 'BUTTON') return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = tag.className;
        btn.textContent = tag.textContent;
        btn.setAttribute('aria-label', `${tag.textContent.trim()}，点击查看详情`);
        tag.replaceWith(btn);
    }

    function parseExceptionAlertCard(card) {
        if (!card) return null;
        return {
            title: card.querySelector('.exception-alert-title')?.textContent?.trim() || '',
            dept: card.dataset.exceptionDeptOriginal
                || card.querySelector('.exception-alert-dept')?.textContent?.trim() || '',
            desc: card.dataset.exceptionDescOriginal
                || card.querySelector('.exception-alert-desc')?.textContent?.trim() || '',
            status: card.querySelector('.exception-status-tag')?.textContent?.trim() || '待处理',
            createdAt: card.querySelector('.exception-alert-time')?.textContent?.trim() || '',
            category: card.dataset.exceptionOriginPanel
                || card.closest('.exception-tab-panel')?.dataset.exceptionPanel
                || 'behavior'
        };
    }

    function getExceptionCategoryLabel(category) {
        return category === 'employee' ? '员工异常' : '行为异常';
    }

    function getExceptionActionFromStatus(status) {
        const text = String(status || '').trim();
        if (text === '处理中') return 'processing';
        if (text === '已处理') return 'done';
        return 'pending';
    }

    function findExceptionAlertCard(title) {
        const board = document.getElementById('exception-reminder-board-support')
            || document.getElementById('exception-reminder-board');
        if (!board || !title) return null;
        return Array.from(board.querySelectorAll('.exception-alert-card')).find((card) => {
            return card.querySelector('.exception-alert-title')?.textContent?.trim() === title;
        }) || null;
    }

    function buildExceptionUserMessage(item, action) {
        const categoryLabel = getExceptionCategoryLabel(item.category);
        if (action === 'processing') {
            return `请查看「${item.title}」${categoryLabel}的处理进度`;
        }
        if (action === 'done') {
            return `请查看「${item.title}」${categoryLabel}的处理结果`;
        }
        return `请协助处理「${item.title}」${categoryLabel}`;
    }

    function buildExceptionAssistantReplyHtml(item, action) {
        const categoryLabel = getExceptionCategoryLabel(item.category);
        const header = `<p>以下是汇总的「${escapeHtmlText(item.title)}」${categoryLabel}信息：</p>`;
        const meta = `
            <p><strong>异常类型：</strong>${categoryLabel}</p>
            <p><strong>责任部门/人员：</strong>${escapeHtmlText(item.dept || '—')}</p>
            <p>${escapeHtmlText(item.desc || '')}</p>
            <p><strong>提醒时间：</strong>${escapeHtmlText(item.createdAt || '—')}</p>`;

        if (action === 'processing') {
            return `${header}${meta}
                <p><strong>当前状态：</strong>处理中</p>
                <p><strong>处理进度</strong></p>
                <ul class="chat-md-list">
                    <li>已完成初步核实与情况说明收集</li>
                    <li>责任部门正在推进处置方案执行</li>
                    <li>关键节点与协作事项已同步相关同事</li>
                </ul>
                <p>如需了解最新进展、补充材料或协调会商，请继续说明。</p>`;
        }

        if (action === 'done') {
            return `${header}${meta}
                <p><strong>当前状态：</strong>已处理</p>
                <p><strong>处理结果</strong></p>
                <ul class="chat-md-list">
                    <li>异常事项已核实并完成处置闭环</li>
                    <li>相关说明、整改或复核材料已归档备查</li>
                    <li>后续将纳入常规监测，如有反复将再次提醒</li>
                </ul>
                <p>如需查看完整处理记录或导出结论，请继续说明。</p>`;
        }

        return `${header}${meta}
            <p><strong>当前状态：</strong>待处理</p>
            <p><strong>建议处置步骤</strong></p>
            <ul class="chat-md-list">
                <li>核实异常事实与影响范围</li>
                <li>同步合规、风控及相关负责人</li>
                <li>制定处置方案并在截止节点前提交结论</li>
            </ul>
            <p>如需继续协助撰写说明、安排会商或推进审批，直接告知。</p>`;
    }

    function sendSupportExceptionAlert(item, action) {
        const panel = document.getElementById('workbench-panel-support');
        if (!panel || !item?.title) return;

        if (!panel.classList.contains('active')) {
            switchWorkbenchTab('support');
        }
        window.AppShell?.returnToSupportSessionView?.({ keepChat: true });
        setSupportInputAgent(panel, SUPPORT_INPUT_AGENT_EXCEPTIONS);

        const state = getPanelState(panel);
        if (!state.chatModeActive) {
            enterSupportChatMode(panel);
        }

        const resolvedAction = action || getExceptionActionFromStatus(item.status);
        appendSupportChatMessage(buildExceptionUserMessage(item, resolvedAction), 'user', panel);
        setTimeout(() => {
            appendSupportChatMessage(buildExceptionAssistantReplyHtml(item, resolvedAction), 'assistant', panel, {
                html: true,
                agentId: SUPPORT_INPUT_AGENT_EXCEPTIONS
            });
        }, 400);
    }

    function buildEmployeeExceptionChatAvatarHtml() {
        return buildEmployeeBotAvatarHtml('异常提醒助手', 'exceptions');
    }

    function clearEmployeeAssistantInputSelection(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);

        state.currentExtraAssistantId = null;
        state.currentCatalogAssistant = null;
        state.currentInputSkillId = null;
        state.currentCardIndex = null;
        state.exceptionChatActive = true;

        p.querySelectorAll('.ai-mini-avatar').forEach((avatar) => avatar.classList.remove('active'));
        p.querySelectorAll('.ai-card-fan[data-index]').forEach((card) => card.classList.remove('active'));
        p.querySelectorAll('.indicator').forEach((ind) => ind.classList.remove('active'));
        p.querySelectorAll('.input-assistant-tag:not(.input-assistant-more-trigger)').forEach((tag) => {
            tag.classList.remove('is-active');
            tag.setAttribute('aria-selected', 'false');
        });
        syncAssistantMorePickerState(p);
        refreshInputSkillPicker(p);
        updateEmployeeInputPlaceholder(p);
    }

    function sendEmployeeExceptionAlert(item, action) {
        const panel = document.getElementById('workbench-panel-employee');
        if (!panel || !item?.title) return;

        if (!panel.classList.contains('active')) {
            switchWorkbenchTab('employee');
        }
        window.AppShell?.returnToMainSessionView?.();

        const state = getPanelState(panel);
        const resolvedAction = action || getExceptionActionFromStatus(item.status);

        if (!state.chatModeActive) {
            applyEmployeeChatModeUI(panel, {
                index: state.currentCardIndex ?? 0,
                showWelcome: false,
                createHistory: true,
                sessionTitle: `异常提醒·${item.title}`,
                skipAssistantSelection: true
            });
        } else {
            clearEmployeeAssistantInputSelection(panel);
        }

        appendChatMessage(buildExceptionUserMessage(item, resolvedAction), 'user', panel);
        setTimeout(() => {
            appendChatMessage(buildExceptionAssistantReplyHtml(item, resolvedAction), 'assistant', panel, {
                html: true,
                agentId: SUPPORT_INPUT_AGENT_EXCEPTIONS
            });
        }, 400);
    }

    function openExceptionAlertFromCard(card) {
        const item = parseExceptionAlertCard(card);
        if (!item?.title) return;
        const board = card.closest('.exception-reminder-board');
        const action = getExceptionActionFromStatus(item.status);
        if (getExceptionBoardScope(board) === 'support') {
            sendSupportExceptionAlert(item, action);
        } else {
            sendEmployeeExceptionAlert(item, action);
        }
    }

    function cloneWorkbenchPanels() {
        const source = document.getElementById('workbench-panel-employee');
        ['support', 'org'].forEach((key) => {
            const target = document.getElementById('workbench-panel-' + key);
            target.innerHTML = source.innerHTML;
            target.querySelectorAll('[id]').forEach((el) => {
                if (el.id) el.id = el.id + '-' + key;
            });
            const performanceSection = target.querySelector('#performance-section-' + key);
            if (performanceSection) {
                performanceSection.remove();
            }
            if (key === 'org') {
                customizeOrgPanel(target);
            }
            if (key === 'support') {
                target.querySelector('#center-view-performance-support')?.remove();
                customizeSupportPanel(target);
            }
        });
        injectSupportOnlyExceptionCards(document.getElementById('exception-reminder-board-support'));
        initExceptionReminderBoards();
        applyAllExceptionBoardScopes();
        if (typeof window.initAssistantManagement === 'function') {
            window.initAssistantManagement();
        }
        initInputSkillPickers();
        initMainSendButtonSync();
    }

    function syncMainSendButtonState(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p) return;
        const input = getPanelEl('main-chat-input', p);
        const sendBtn = p.querySelector('.send-btn');
        if (!input || !sendBtn) return;
        const ready = !!String(input.value || '').trim();
        sendBtn.classList.toggle('is-ready', ready);
        sendBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');
    }

    function initMainSendButtonSync(root) {
        const scope = root?.querySelectorAll ? root : document;
        scope.querySelectorAll('.workbench-panel').forEach((panel) => {
            const input = getPanelEl('main-chat-input', panel);
            if (!input || input.dataset.sendBtnSyncBound === 'true') return;
            input.dataset.sendBtnSyncBound = 'true';
            input.addEventListener('input', () => syncMainSendButtonState(panel));
            input.addEventListener('change', () => syncMainSendButtonState(panel));
            syncMainSendButtonState(panel);
        });
    }

    window.syncMainSendButtonState = syncMainSendButtonState;

    function restoreSupportStandardInput(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const container = p?.querySelector('.input-container');
        if (!container) return;

        container.querySelector('.support-input-agent-picker')?.remove();
        teardownSupportInputTopRow(p);
        container.classList.remove('support-input-container');
        container.dataset.supportInputReady = 'false';

        const field = container.closest('.enhanced-input-wrap')?.querySelector('.chat-input, .enhanced-textarea, .support-chat-input');
        if (field) {
            field.classList.remove('support-chat-input');
            field.classList.add('enhanced-textarea');
            field.placeholder = getMainInputDefaultPlaceholder(p);
        }

        const sendBtn = container.querySelector('.send-btn');
        if (sendBtn) sendBtn.classList.remove('support-input-send-btn');
    }

    function syncSupportHomeLayout(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p) return;

        const state = getPanelState(p);
        const messagesEl = getPanelEl('ai-chat-messages', p);
        const hasMessages = (messagesEl?.children.length || 0) > 0;
        const inChat = !!(state.chatModeActive || hasMessages);

        const hero = p.querySelector('#center-hero-support');
        const welcome = p.querySelector('.support-welcome-section');
        const chatView = getPanelEl('ai-chat-view', p);
        const sessionScroll = p.querySelector('#session-scroll-support');
        const workbench = p.querySelector('.ai-workbench-section');
        const inputSection = p.querySelector('.input-section');

        if (hero) hero.classList.toggle('is-hidden', inChat);
        if (welcome) welcome.classList.toggle('is-hidden', inChat);
        const homeCards = p.querySelector('#support-home-cards');
        if (homeCards) homeCards.classList.toggle('is-hidden', inChat);
        if (chatView) {
            chatView.style.display = inChat ? 'flex' : 'none';
            chatView.classList.toggle('is-visible', inChat);
        }
        if (sessionScroll) sessionScroll.classList.toggle('is-chat-active', inChat);
        if (workbench) workbench.classList.toggle('support-chat-mode', inChat);
        if (inputSection) inputSection.classList.toggle('chat-mode', inChat);
        if (inChat && messagesEl) {
            messagesEl.classList.add('overlay-scrollbar');
            bindOverlayScrollbar(messagesEl);
        }
    }

    function enterSupportChatMode(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        state.chatModeActive = true;
        syncSupportHomeLayout(p);
        updateSupportInputPlaceholder(p);
    }

    function exitSupportChatMode(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        state.chatModeActive = false;
        syncSupportHomeLayout(p);
        updateSupportInputPlaceholder(p);
    }

    window.exitSupportChatMode = exitSupportChatMode;
    window.syncSupportHomeLayout = syncSupportHomeLayout;

    function returnToSupportMainPage() {
        window.AppShell?.setCenterView?.('session');
        document.body.classList.remove('support-exceptions-view-active');
        document.querySelectorAll('.sidebar .bc-item-nav[data-bc="exceptions"]').forEach((el) => {
            el.classList.remove('is-center-active');
        });
        const panel = document.getElementById('workbench-panel-support');
        if (!panel) return;
        deselectSupportInputAssistant(panel);
        exitSupportChatMode(panel);
        document.getElementById('session-scroll-support')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function customizeSupportPanel(panel) {
        const workbench = panel.querySelector('.ai-workbench-section');

        panel.querySelector('#ai-carousel-view-support')?.remove();
        panel.querySelector('.card-indicators')?.remove();

        const miniAvatars = panel.querySelector('#ai-mini-avatars-support');
        if (miniAvatars) miniAvatars.remove();

        panel.querySelector('#employee-home-assistant-tabs-support')?.remove();

        const chatView = panel.querySelector('#ai-chat-view-support');
        if (chatView) {
            chatView.style.display = 'none';
            chatView.classList.remove('is-visible');
        }

        const hero = panel.querySelector('#center-hero-support');
        if (hero) hero.classList.remove('is-hidden');

        if (workbench) {
            workbench.classList.add('support-workbench-mode');

            const jumpBar = document.createElement('div');
            jumpBar.className = 'support-agent-jump-bar';
            const agentBtn = document.createElement('button');
            agentBtn.type = 'button';
            agentBtn.className = 'org-current-agent-name';
            agentBtn.id = 'support-current-agent-name-support';
            agentBtn.textContent = '去投行业务助理';
            agentBtn.style.display = 'none';
            jumpBar.appendChild(agentBtn);
            workbench.insertBefore(jumpBar, workbench.firstChild);
        }

        panel.querySelector('.support-daily-task-panel')?.remove();
        ensureSupportHomeCards(panel);
        initSupportInputAgentSelect(panel);
        syncSupportAssistantTags(panel);
        panel.dataset.supportCustomized = 'true';
    }

    function collectSupportExceptionAlerts() {
        const board = document.getElementById('exception-reminder-board-support')
            || document.getElementById('exception-reminder-board');
        if (!board) return [];
        applyExceptionBoardScope(board);
        return Array.from(board.querySelectorAll('.exception-alert-card')).map((card) => {
            if (card.classList.contains('is-scope-hidden') || card.classList.contains('is-filter-hidden')) {
                return null;
            }
            return parseExceptionAlertCard(card);
        }).filter((item) => item?.title);
    }

    function collectEmployeeExceptionAlerts() {
        const board = document.getElementById('exception-reminder-board');
        if (!board) return [];
        applyExceptionBoardScope(board);
        return Array.from(board.querySelectorAll('.exception-alert-card')).map((card) => {
            if (card.classList.contains('is-scope-hidden') || card.classList.contains('is-filter-hidden')) {
                return null;
            }
            return parseExceptionAlertCard(card);
        }).filter((item) => item?.title);
    }

    const EMPLOYEE_APPROVAL_PENDING_COUNT = 3;

    function getEmployeeDailyTaskCount() {
        return (getEmployeeDailyTasks?.() || []).length;
    }

    function getEmployeeExceptionAlertCount() {
        const board = document.getElementById('exception-reminder-board');
        if (!board) return 0;
        return board.querySelectorAll('.exception-alert-card:not(.is-scope-hidden):not(.is-filter-hidden)').length;
    }

    function getEmployeeApprovalPendingCount() {
        return EMPLOYEE_APPROVAL_PENDING_COUNT;
    }

    function updateNavLabelCount(labelEl, fallback, count) {
        if (!labelEl) return;
        if (!labelEl.dataset.baseLabel) {
            labelEl.dataset.baseLabel = labelEl.textContent.trim() || fallback;
        }
        const base = labelEl.dataset.baseLabel;
        labelEl.textContent = count > 0 ? `${base}（${count}）` : base;
    }

    function updateEmployeeSidebarNavCounts() {
        const tasksEl = document.getElementById('sidebar-nav-tasks-count');
        const exceptionsEl = document.getElementById('sidebar-nav-exceptions-count');
        const approvalEl = document.getElementById('sidebar-nav-approval-count');
        const tasksLabelEl = document.querySelector('#menu-today-tasks .bc-label');
        const exceptionsLabelEl = document.querySelector('#menu-exceptions .bc-label');
        const approvalLabelEl = document.querySelector('#menu-approval .bc-label');
        const exceptionsDotEl = document.getElementById('sidebar-nav-exceptions-dot');
        const approvalDotEl = document.getElementById('sidebar-nav-approval-dot');
        const taskCount = getEmployeeDailyTaskCount();
        const exceptionCount = getEmployeeExceptionAlertCount();
        const approvalCount = getEmployeeApprovalPendingCount();

        if (tasksEl) {
            tasksEl.textContent = String(taskCount);
            tasksEl.setAttribute('aria-label', `${taskCount}项今日任务`);
        }
        if (exceptionsEl) {
            exceptionsEl.textContent = String(exceptionCount);
            exceptionsEl.setAttribute('aria-label', `${exceptionCount}项异常提醒`);
        }
        if (approvalEl) {
            approvalEl.textContent = String(approvalCount);
            approvalEl.setAttribute('aria-label', `${approvalCount}项待办事项`);
        }

        updateNavLabelCount(tasksLabelEl, '今日任务', taskCount);
        updateNavLabelCount(exceptionsLabelEl, '异常提醒', exceptionCount);
        updateNavLabelCount(approvalLabelEl, '待办事项', approvalCount);

        if (exceptionsDotEl) {
            const hasUnread = !localStorage.getItem('workbench_employee_exceptions_read') && exceptionCount > 0;
            exceptionsDotEl.classList.toggle('show', hasUnread);
        }
        if (approvalDotEl) {
            const hasUnread = !localStorage.getItem('workbench_employee_approval_read') && approvalCount > 0;
            approvalDotEl.classList.toggle('show', hasUnread);
        }
    }

    function updateSupportSidebarNavCounts() {
        const exceptionCount = collectSupportExceptionAlerts().length;
        const approvalCount = getEmployeeApprovalPendingCount();
        
        updateNavLabelCount(
            document.querySelector('#support-menu-today-tasks .bc-label'),
            '今日任务',
            getSupportTotalTaskCount()
        );
        updateNavLabelCount(
            document.querySelector('#support-menu-exceptions .bc-label'),
            '异常提醒',
            exceptionCount
        );
        updateNavLabelCount(
            document.querySelector('#support-menu-approval .bc-label'),
            '待办事项',
            approvalCount
        );

        const exceptionsDotEl = document.getElementById('sidebar-nav-support-exceptions-dot');
        const approvalDotEl = document.getElementById('sidebar-nav-support-approval-dot');
        
        if (exceptionsDotEl) {
            const hasUnread = !localStorage.getItem('workbench_support_exceptions_read') && exceptionCount > 0;
            exceptionsDotEl.classList.toggle('show', hasUnread);
        }
        if (approvalDotEl) {
            const hasUnread = !localStorage.getItem('workbench_support_approval_read') && approvalCount > 0;
            approvalDotEl.classList.toggle('show', hasUnread);
        }
    }

    function buildEmployeeAllExceptionsChatHtml() {
        const alerts = collectEmployeeExceptionAlerts();
        const count = alerts.length;
        if (!count) {
            return `
                <p class="chat-md-h2">异常提醒</p>
                <p>当前暂无异常提醒。</p>
            `;
        }
        return `
            <p class="chat-md-h2">异常提醒（${count}）</p>
            <p>点击任一条异常，可直接在对话里查看详情与处理建议。</p>
            <div class="chat-exception-list">
                ${alerts.map((item) => `
                    <button type="button" class="chat-exception-card" data-exception-title="${escapeHtmlAttr(item.title)}">
                        <div class="chat-exception-card-title">${escapeHtmlText(item.title)}</div>
                        <div class="chat-exception-card-meta">
                            <span class="chat-exception-card-status">${escapeHtmlText(item.status || '待处理')}</span>
                            <span class="chat-exception-card-time">${escapeHtmlText(item.createdAt || '')}</span>
                        </div>
                        <div class="chat-exception-card-desc">${escapeHtmlText(item.desc || '')}</div>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function ensureSupportHomeCards(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const sessionScroll = p?.querySelector('#session-scroll-support');
        const hero = p?.querySelector('#center-hero-support');
        if (!sessionScroll || p.querySelector('#support-home-cards')) return;

        const section = document.createElement('div');
        section.className = 'ai-team-section support-home-cards';
        section.id = 'support-home-cards';
        section.innerHTML = `
            <div class="ai-cards-fan-row support-home-cards-row">
                <div class="ai-cards-fan support-home-cards-fan"></div>
                <button type="button" class="ai-cards-add-btn support-home-cards-add-btn" id="support-home-cards-add-btn" aria-label="管理助手与技能">
                    <span class="ai-cards-add-plus" aria-hidden="true">+</span>
                    <span class="ai-cards-add-text">新增</span>
                </button>
            </div>
        `;

        if (hero?.parentNode) {
            hero.parentNode.insertBefore(section, hero.nextSibling);
        } else {
            sessionScroll.appendChild(section);
        }

        if (p.dataset.supportHomeCardsBound !== 'true') {
            p.dataset.supportHomeCardsBound = 'true';
            section.addEventListener('click', (event) => {
                if (event.target.closest('#support-home-cards-add-btn')) return;
                const card = event.target.closest('.support-home-card');
                if (!card) return;
                const cardType = card.dataset.supportCard;
                if (cardType) {
                    openSupportHomeCardInChat(cardType);
                    return;
                }
                const assistantId = card.dataset.assistantId;
                if (assistantId) openSupportFunctionalAssistantInChat(assistantId);
            });
            section.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                const card = event.target.closest('.support-home-card');
                if (!card) return;
                event.preventDefault();
                const cardType = card.dataset.supportCard;
                if (cardType) {
                    openSupportHomeCardInChat(cardType);
                    return;
                }
                const assistantId = card.dataset.assistantId;
                if (assistantId) openSupportFunctionalAssistantInChat(assistantId);
            });
        }

        window.syncSupportHomeCards?.(p);
    }

    function refreshSupportHomeCardCounts(panel) {
        window.syncSupportHomeCards?.(panel || document.getElementById('workbench-panel-support'));
    }

    function buildSupportAllExceptionsChatHtml() {
        const items = collectSupportExceptionAlerts();
        if (!items.length) {
            return '<p>当前暂无异常提醒。</p>';
        }
        let html = `<p>以下是当前全部 <strong>${items.length}</strong> 项异常提醒：</p>`;
        items.forEach((item, index) => {
            html += `<p class="support-chat-todo-line support-chat-todo-title">${index + 1}. <button type="button" class="support-chat-todo-trigger support-exception-item-trigger" data-exception-title="${escapeHtmlAttr(item.title)}"><strong>${escapeHtmlText(item.title)}</strong></button>${item.dept ? ` <span class="support-exception-dept">（${escapeHtmlText(item.dept)}）</span>` : ''}</p>`;
            if (item.desc) {
                html += `<p class="support-chat-todo-line">${escapeHtmlText(item.desc)}</p>`;
            }
            if (item.status) {
                html += `<p class="support-chat-exception-status">状态：${escapeHtmlText(item.status)}</p>`;
            }
        });
        html += '<p>点击异常项发送到对话框，协助推进处理。</p>';
        return html;
    }

    function buildSupportExceptionReplyHtml(item) {
        if (!item) {
            return `<p>已收到，我将为你汇总相关背景、影响范围与建议处置步骤。</p>`;
        }
        return `<p>已收到，正在协助你处理<strong>${escapeHtmlText(item.title)}</strong>。</p>
            <p><strong>责任部门：</strong>${escapeHtmlText(item.dept || '—')}</p>
            <p>${escapeHtmlText(item.desc || '')}</p>
            <p><strong>当前状态：</strong>${escapeHtmlText(item.status || '待处理')}</p>
            <p>建议：确认事实背景 → 同步相关同事 → 在截止时间前提交处置方案。</p>`;
    }

    function sendSupportExceptionQuick(title) {
        const card = findExceptionAlertCard(title);
        if (card) {
            openExceptionAlertFromCard(card);
            return;
        }
        const item = collectSupportExceptionAlerts().find((entry) => entry.title === title);
        if (!item) return;
        sendSupportExceptionAlert(item, getExceptionActionFromStatus(item.status));
    }

    function openSupportHomeCardInChat(cardType, options = {}) {
        const panel = document.getElementById('workbench-panel-support');
        if (!panel) return;

        const labels = { tasks: '今日任务助手', exceptions: '异常提醒助手' };
        const label = labels[cardType] || '工作台';
        const agentId = cardType === 'exceptions'
            ? SUPPORT_INPUT_AGENT_EXCEPTIONS
            : SUPPORT_INPUT_AGENT_DAILY_TASK;
        setSupportInputAgent(panel, agentId);
        enterSupportChatMode(panel);
        const userText = options.fromSummon ? `召唤${label}` : `查看${label}`;
        appendSupportChatMessage(userText, 'user', panel);

        const replyHtml = cardType === 'exceptions'
            ? buildSupportAllExceptionsChatHtml()
            : buildSupportDailyTasksSummaryHtml({ forChatCard: true });

        setTimeout(() => {
            appendSupportChatMessage(replyHtml, 'assistant', panel, {
                html: true,
                agentId
            });
        }, 400);
    }

    function getSupportFunctionalWelcomeHtml(agent) {
        return getEmployeeCatalogWelcomeHtml(agent);
    }

    function openSupportFunctionalAssistantInChat(assistantId) {
        const panel = document.getElementById('workbench-panel-support');
        const agent = getSupportFunctionalAssistantMeta(assistantId);
        if (!panel || !agent) return;

        setSupportInputAgent(panel, assistantId);
        enterSupportChatMode(panel);
        appendSupportChatMessage(`召唤${agent.name}`, 'user', panel);
        setTimeout(() => {
            appendSupportChatMessage(getSupportFunctionalWelcomeHtml(agent), 'assistant', panel, {
                html: true,
                agentId: assistantId
            });
        }, 400);
    }

    function getEmployeeCatalogAgent(agentId) {
        return typeof window.getAssistantCatalogEntry === 'function'
            ? window.getAssistantCatalogEntry(agentId, 'employee')
            : null;
    }

    function buildEmployeeCatalogChatAvatarHtml(agent) {
        if (!agent) return buildWorkbenchChatAvatarHtml();
        return buildEmployeeBotAvatarHtml(agent.name, getEmployeeAssistantAvatarKey(agent));
    }

    function getEmployeeCatalogWelcomeHtml(agent) {
        const extendedWelcome = {
            hegui: `**合规审查助手**\n\n快速筛查合规风险，识别潜在违规事项。\n\n输入：业务类型、审查材料或关注要点。`,
            shuju: `**数据洞察助手**\n\n数据穿透看经营，多维指标联动分析。\n\n输入：分析主题、指标范围或业务条线。`,
            xuqiu: `**意图识别助手**\n\n深度识别合作意图，辅助商机判断。\n\n输入：客户名称、沟通记录或合作背景。`
        };
        if (extendedWelcome[agent.id]) {
            return markdownToHtml(extendedWelcome[agent.id]);
        }
        const base = typeof agent.chatIndex === 'number' ? aiAssistants[agent.chatIndex] : null;
        if (base?.welcomeText) {
            return markdownToHtml(base.welcomeText.replace(/^\*\*[^*]+\*\*/, `**${agent.name}**`));
        }
        return markdownToHtml(`**${agent.name}**\n\n${agent.desc || '我将为你提供相关支持。'}\n\n请直接输入具体事项或相关材料。`);
    }

    function appendEmployeeCatalogAssistantWelcome(agent, panel, options = {}) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl || !agent) return;

        const row = document.createElement('div');
        row.className = 'chat-row chat-row-assistant';
        row.innerHTML = `
            ${buildEmployeeCatalogChatAvatarHtml(agent)}
            <div class="chat-bubble chat-bubble-assistant">${getEmployeeCatalogWelcomeHtml(agent)}</div>
        `;
        messagesEl.appendChild(row);
        scrollWorkbenchChatToBottom(p);

        if (!options.skipPersist) {
            recordEmployeeChatMessage(p, {
                role: 'assistant',
                type: 'welcome',
                assistantId: agent.id,
                assistantIndex: typeof agent.chatIndex === 'number' ? agent.chatIndex : 0,
                text: agent.name
            });
        }
    }

    function openEmployeeAssistantInChat(assistantId) {
        const agent = getEmployeeCatalogAgent(assistantId);
        const panel = document.getElementById('workbench-panel-employee');
        if (!agent || !panel) return;

        const state = getPanelState(panel);
        const index = typeof agent.chatIndex === 'number' ? agent.chatIndex : 0;

        applyEmployeeChatModeUI(panel, {
            index,
            showWelcome: false,
            createHistory: true,
            sessionTitle: `${agent.name}对话`
        });

        state.currentCatalogAssistant = agent;
        state.currentInputSkillId = null;
        updateMiniAvatarActive(index, panel);

        appendChatMessage(`召唤${agent.name}`, 'user', panel);
        appendEmployeeCatalogAssistantWelcome(agent, panel);
        refreshInputSkillPicker(panel);
    }

    const SUPPORT_DAILY_TASK_AVATAR_SRC = 'images/daily-task-assistant-avatar.png';
    const SUPPORT_INPUT_AGENT_DAILY_TASK = 'daily-task';
    const SUPPORT_INPUT_AGENT_EXCEPTIONS = 'exceptions';

    const TOP_BIZ_INPUT_PROMPTS = {
        ib: '帮我查一下定增的发行条件和准入标准',
        asset: '查询「华创稳健成长1号」最新净值与持仓',
        retail: '查询陈明精工名下零售客户的资产规模',
        invest: '查询当前自营权益持仓前十大',
        sales: '查询陈明精工今日委托与成交明细',
        institution: '查询「测试科技」的机构客户画像',
        research: '查询陈明精工最新研报观点与评级',
        credit: '查询陈明精工的维持担保比例'
    };

    const SUPPORT_TOP_INPUT_PROMPTS = {
        ib: '复核陈明精工定增项目的申报材料',
        asset: '审核本月新设资管产品的备案材料',
        retail: '复核本周待审核的机构客户开户资料',
        invest: '核查当前自营权益持仓单票集中度',
        sales: '核对今日客户交易清算数据',
        institution: '维护「测试科技」机构客户档案信息',
        research: '审核本周待发布的研究报告',
        credit: '监控当前维持担保比例低于预警线的客户'
    };

    const SUPPORT_ASSISTANT_INPUT_PROMPTS = {
        [SUPPORT_INPUT_AGENT_DAILY_TASK]: '帮我汇总今天的待办任务并给出优先级建议',
        [SUPPORT_INPUT_AGENT_EXCEPTIONS]: '帮我汇总今天的异常提醒并给出处理建议'
    };

    function getSupportDailyTaskRobotAvatarHtml() {
        return `<div class="support-daily-task-robot-avatar" title="今日任务助手">
            <img src="${SUPPORT_DAILY_TASK_AVATAR_SRC}" alt="今日任务助手" class="support-daily-task-robot-avatar-img">
        </div>`;
    }

    function getSupportDailyTaskChevronHtml() {
        return `<svg class="support-daily-task-chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }

    function syncSupportDailyTaskToggle(panel) {
        const dailyPanel = getSupportDailyTaskPanel(panel);
        if (!dailyPanel) return;
        const toggle = dailyPanel.querySelector('.support-daily-task-toggle');
        if (!toggle) return;
        const collapsed = dailyPanel.classList.contains('is-collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.setAttribute('aria-label', collapsed ? '展开' : '收起');
    }

    function getSupportDailyTaskPanel(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        return p?.querySelector('.support-daily-task-panel') || null;
    }

    function renderSupportDailyTaskContent(html, panel) {
        renderSupportSidebarTasks(panel);
    }

    function getSupportTotalTaskCount() {
        let count = 0;
        supportBadgeAgentIds.forEach((agentId) => {
            count += getSupportAgentAllTasks(agentId).length;
        });
        return count;
    }

    function updateSupportSidebarTasksCount() {
        const countEl = document.getElementById('support-sidebar-tasks-count');
        if (countEl) countEl.textContent = String(getSupportTotalTaskCount());
    }

    function renderSupportSidebarTasks(panel) {
        const body = document.getElementById('support-sidebar-tasks-body');
        if (!body) {
            updateSupportSidebarNavCounts();
            return;
        }
        body.innerHTML = `<div class="support-sidebar-tasks-content support-daily-task-body">${buildSupportDailyTasksSummaryHtml({ sidebar: true })}</div>`;
        updateSupportSidebarTasksCount();
        updateSupportSidebarNavCounts();
        refreshSupportHomeCardCounts(panel);
        updateSupportAvatarPendingDots();
        const scrollEl = body.closest('.support-sidebar-tasks-scroll');
        if (scrollEl) bindOverlayScrollbar(scrollEl);
    }

    function formatSupportRelativeTime(ts) {
        const diff = Date.now() - (ts || 0);
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return mins + ' 分钟前';
        const hours = Math.floor(mins / 60);
        if (hours < 24) return hours + ' 小时前';
        const days = Math.floor(hours / 24);
        return days + ' 天前';
    }

    function getSupportSessions() {
        try {
            return JSON.parse(localStorage.getItem(SUPPORT_SESSIONS_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveSupportSessions(list) {
        localStorage.setItem(SUPPORT_SESSIONS_KEY, JSON.stringify(list.slice(0, 50)));
    }

    function renderSupportSessionHistory() {
        const list = document.getElementById('support-sidebar-sessions-list');
        if (!list) return;
        const panel = document.getElementById('workbench-panel-support');
        const state = panel ? getPanelState(panel) : { currentSessionId: null };
        const sessions = getSupportSessions().slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (!sessions.length) {
            list.innerHTML = '<div class="context-empty">暂无历史会话</div>';
            return;
        }
        const sessionItemIconHtml = '<span class="session-item-icon" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3.5h10a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H7l-2.5 2V10.5H3a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/><circle cx="5.5" cy="7" r="0.55" fill="currentColor"/><circle cx="8" cy="7" r="0.55" fill="currentColor"/><circle cx="10.5" cy="7" r="0.55" fill="currentColor"/></svg></span>';
        list.innerHTML = sessions.map((s) =>
            `<button type="button" class="session-item${s.id === state.currentSessionId ? ' active' : ''}" data-session-id="${escapeHtmlAttr(s.id)}">
                ${sessionItemIconHtml}
                <span class="session-item-body">
                    <span class="session-item-title">${escapeHtmlText(s.title)}</span>
                    <span class="session-item-time">${formatSupportRelativeTime(s.timestamp)}</span>
                </span>
            </button>`
        ).join('');
    }

    function highlightSupportSessionInSidebar(sessionId) {
        document.querySelectorAll('#support-sidebar-sessions-list .session-item').forEach((el) => {
            el.classList.toggle('active', !!sessionId && el.dataset.sessionId === sessionId);
        });
    }

    function createSupportSession(title) {
        const sessions = getSupportSessions();
        const panel = document.getElementById('workbench-panel-support');
        const state = getPanelState(panel);
        const entry = {
            id: 'ss-' + Date.now(),
            title: (title || '新对话').slice(0, 40),
            timestamp: Date.now(),
            messages: []
        };
        sessions.unshift(entry);
        saveSupportSessions(sessions);
        state.currentSessionId = entry.id;
        state.supportChatMessages = [];
        renderSupportSessionHistory();
        highlightSupportSessionInSidebar(entry.id);
        return entry;
    }

    function touchSupportSession(title) {
        const panel = document.getElementById('workbench-panel-support');
        const state = getPanelState(panel);
        if (!state.currentSessionId) return;
        const sessions = getSupportSessions();
        const session = sessions.find((s) => s.id === state.currentSessionId);
        if (!session) return;
        const fallbackTitle = /对话$/.test(session.title) || session.title === '新对话';
        if (title && fallbackTitle) {
            session.title = title.slice(0, 40);
        }
        session.timestamp = Date.now();
        saveSupportSessions(sessions);
        renderSupportSessionHistory();
        highlightSupportSessionInSidebar(state.currentSessionId);
    }

    function persistSupportChat(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        if (!state.currentSessionId) return;
        const sessions = getSupportSessions();
        const session = sessions.find((s) => s.id === state.currentSessionId);
        if (!session) return;
        session.messages = Array.isArray(state.supportChatMessages) ? state.supportChatMessages.slice(-100) : [];
        session.timestamp = Date.now();
        saveSupportSessions(sessions);
        renderSupportSessionHistory();
    }

    function recordSupportChatMessage(panel, message) {
        const state = getPanelState(panel);
        if (!state.supportChatMessages) state.supportChatMessages = [];
        if (!state.currentSessionId && message.role === 'user') {
            createSupportSession((message.text || '业务支持对话').slice(0, 30));
        }
        state.supportChatMessages.push(message);
        if (message.role === 'user') {
            const userMsgs = state.supportChatMessages.filter((m) => m.role === 'user');
            if (userMsgs.length === 1) {
                touchSupportSession(message.text.slice(0, 30));
            }
        }
        persistSupportChat(panel);
    }

    function restoreSupportChatFromSession(panel, session) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl || !session) return;

        messagesEl.innerHTML = '';
        state.currentSessionId = session.id;
        state.supportChatMessages = Array.isArray(session.messages) ? session.messages.slice() : [];
        highlightSupportSessionInSidebar(session.id);

        state.supportChatMessages.forEach((msg, index, arr) => {
            const prevUser = arr.slice(0, index).reverse().find((item) => item.role === 'user');
            const extra = msg.agentId ? getExtraAssistantById(msg.agentId) : null;
            appendSupportChatMessage(msg.text, msg.role, p, {
                skipPersist: true,
                html: msg.html,
                agentId: msg.agentId,
                workbenchAssistant: !!msg.workbenchAssistant,
                assistantImage: msg.assistantImage || null,
                assistantDisplayName: msg.assistantDisplayName || null,
                chatIndex: extra?.chatIndex,
                extraAssistantId: extra?.id,
                userMessage: prevUser?.text || ''
            });
        });
        if (state.supportChatMessages.length) {
            state.chatModeActive = true;
        }
        // 恢复顶部业务助理会话状态
        const topAssistantMsg = state.supportChatMessages.find((m) => m.assistantImage);
        if (topAssistantMsg?.assistantImage) {
            const assistant = TOP_SUPPORT_ASSISTANTS.find((a) => a.image === topAssistantMsg.assistantImage);
            state.currentTopSupportAssistant = assistant?.id || null;
            state.currentExtraAssistantId = null;
            state.currentSupportInputAgent = null;
            updateTopAvatarActive(assistant?.avatarKey || null);
        } else {
            state.currentTopSupportAssistant = null;
        }
        updateSupportChatLayout(p);
        updateSupportInputPlaceholder(p);
    }

    function toggleSupportDailyTaskPanel(panel) {
        const dailyPanel = getSupportDailyTaskPanel(panel);
        if (!dailyPanel) return;
        dailyPanel.classList.toggle('is-collapsed');
        syncSupportDailyTaskToggle(panel);
    }

    function updateSupportDailyTaskPanelState(panel, hasChat) {
        const dailyPanel = getSupportDailyTaskPanel(panel);
        if (!dailyPanel) return;
        if (hasChat) {
            dailyPanel.classList.add('is-collapsed');
        } else {
            dailyPanel.classList.remove('is-collapsed');
        }
        syncSupportDailyTaskToggle(panel);
    }

    function getSupportAgent(agentId) {
        return supportAgents.find(a => a.id === agentId) || supportAgents[0];
    }

    function getSupportCategoryAgentTasks(categoryId, agentId) {
        return supportCategoryAgentTasks[categoryId]?.[agentId] || [];
    }

    function getSupportAgentAllTasks(agentId) {
        const tasks = [];
        Object.values(supportCategoryAgentTasks).forEach(categoryMap => {
            const list = categoryMap[agentId];
            if (list?.length) tasks.push(...list);
        });
        return tasks;
    }

    function getSupportAgentTasksWithCategory(agentId) {
        const items = [];
        supportTopCategories.forEach(cat => {
            getSupportCategoryAgentTasks(cat.id, agentId).forEach(task => {
                items.push({ categoryId: cat.id, categoryName: cat.name, task });
            });
        });
        return items;
    }

    function getSupportAgentTaskCount(agentId, categoryId) {
        if (categoryId) return getSupportCategoryAgentTasks(categoryId, agentId).length;
        return getSupportAgentAllTasks(agentId).length;
    }

    function updateSupportAgentButton(panel, agentId) {
        const agentBtn = panel.querySelector('#support-current-agent-name-support');
        const jumpBar = panel.querySelector('.support-agent-jump-bar');
        if (!agentBtn) return;
        if (!agentId) {
            agentBtn.style.display = 'none';
            if (jumpBar) jumpBar.classList.remove('is-visible');
            return;
        }
        const agent = getSupportAgent(agentId);
        agentBtn.style.display = '';
        agentBtn.textContent = '去' + agent.name;
        agentBtn.onclick = () => showOrgAgentJumpToast(agent.name);
        if (jumpBar) jumpBar.classList.add('is-visible');
    }

    function escapeHtmlText(text) {
        return String(text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeHtmlAttr(text) {
        return escapeHtmlText(text).replace(/"/g, '&quot;');
    }

    const supportExecSuggestions = [
        '梳理该项工作的背景材料、责任人与截止时间',
        '按优先级推进关键协作事项，并同步相关同事',
        '完成后更新任务进展，便于团队跟踪'
    ];

    function buildSupportTodoTriggerHtml(agentId, task, displayText, stepText, replyMode = 'task') {
        return `<button type="button" class="support-chat-todo-trigger" data-agent-id="${escapeHtmlAttr(agentId)}" data-task-id="${escapeHtmlAttr(task.id)}" data-step-text="${escapeHtmlAttr(stepText)}" data-send-text="${escapeHtmlAttr(displayText)}" data-reply-mode="${escapeHtmlAttr(replyMode)}">${escapeHtmlText(displayText)}</button>`;
    }

    function buildSupportTodoLineSummaryHtml(agentId, task, index) {
        const nextStep = task.nextSteps[0] || '请跟进推进';
        const lineText = `${index + 1}. ${task.title}：${nextStep}`;
        return `<p class="support-chat-todo-line">${buildSupportTodoTriggerHtml(agentId, task, lineText, nextStep)}</p>`;
    }

    function buildSupportTaskCardHtml(agentId, task, index) {
        const nextStep = task.nextSteps[0] || '请跟进推进';
        const lineText = `${index + 1}. ${task.title}：${nextStep}`;
        return `<button type="button" class="support-task-card support-chat-todo-trigger" data-agent-id="${escapeHtmlAttr(agentId)}" data-task-id="${escapeHtmlAttr(task.id)}" data-step-text="${escapeHtmlAttr(nextStep)}" data-send-text="${escapeHtmlAttr(lineText)}" data-reply-mode="task">
            <span class="support-task-card-title">${escapeHtmlText(task.title)}</span>
            <span class="support-task-card-meta">${escapeHtmlText(nextStep)}</span>
        </button>`;
    }

    function buildSupportTodoLineGuideHtml(agentId, task, index) {
        const nextStep = task.nextSteps[0] || '请跟进推进';
        const stepText = `→ ${nextStep}`;
        return `<p class="support-chat-todo-line support-chat-todo-title">${index + 1}. <strong>${escapeHtmlText(task.title)}</strong></p>
<p class="support-chat-todo-line support-chat-todo-step">${buildSupportTodoTriggerHtml(agentId, task, stepText, nextStep)}</p>`;
    }

    function getSupportCategoryById(categoryId) {
        return supportTopCategories.find(cat => cat.id === categoryId) || null;
    }

    function getSupportAgentCategoryId(agentId) {
        return supportAgentCategoryMap[agentId] || null;
    }

    function getSupportAgentDisplayLabel(agentId) {
        const extra = getExtraAssistantById(agentId);
        if (extra) return extra.name;
        if (agentId === SUPPORT_INPUT_AGENT_DAILY_TASK) return '今日任务助手';
        if (agentId === SUPPORT_INPUT_AGENT_EXCEPTIONS) return '异常提醒助手';
        const functional = getSupportFunctionalAssistantMeta(agentId);
        if (functional) return functional.name;
        return getSupportAgent(agentId)?.name || '';
    }

    function getSupportInputAgentMeta(agentId) {
        if (!agentId) return null;
        const extra = getExtraAssistantById(agentId);
        if (extra) {
            return { id: extra.id, name: extra.name, emoji: extra.emoji, avatarClass: extra.avatarClass };
        }
        if (agentId === SUPPORT_INPUT_AGENT_DAILY_TASK) {
            return { id: SUPPORT_INPUT_AGENT_DAILY_TASK, name: '今日任务助手', image: SUPPORT_DAILY_TASK_AVATAR_SRC };
        }
        if (agentId === SUPPORT_INPUT_AGENT_EXCEPTIONS) {
            return {
                id: SUPPORT_INPUT_AGENT_EXCEPTIONS,
                name: '异常提醒助手',
                emoji: '⚠️',
                avatarClass: 'support-exceptions-avatar'
            };
        }
        const functional = getSupportFunctionalAssistantMeta(agentId);
        if (functional) {
            return {
                id: functional.id,
                name: functional.name,
                emoji: functional.emoji,
                avatarClass: functional.avatarClass
            };
        }
        const agent = getSupportAgent(agentId);
        return agent ? { id: agentId, name: agent.name, image: agent.image } : null;
    }

    function getSupportFunctionalAssistantMeta(agentId) {
        return typeof window.getSupportFunctionalAssistantMeta === 'function'
            ? window.getSupportFunctionalAssistantMeta(agentId)
            : null;
    }

    function getSupportInputAgentAvatarHtml(meta, imgClass, emojiClass) {
        if (meta?.image) {
            return `<img src="${escapeHtml(meta.image)}" alt="${escapeHtmlText(meta.name)}" class="${imgClass}">`;
        }
        if (meta?.emoji) {
            const extraClass = meta.avatarClass ? ` ${meta.avatarClass}` : '';
            return `<span class="${emojiClass}${extraClass}" aria-hidden="true">${meta.emoji}</span>`;
        }
        return '';
    }

    function updateSupportInputAgentTriggerAvatar(trigger, meta) {
        if (!trigger || !meta) return;
        trigger.querySelector('.support-input-agent-trigger-img')?.remove();
        trigger.querySelector('.support-input-agent-trigger-emoji')?.remove();
        trigger.insertAdjacentHTML('afterbegin', getSupportInputAgentAvatarHtml(
            meta,
            'support-input-agent-trigger-img',
            'support-input-agent-trigger-emoji'
        ));
    }

    function getSupportInputPlaceholder(agentId) {
        if (SUPPORT_ASSISTANT_INPUT_PROMPTS[agentId]) {
            return SUPPORT_ASSISTANT_INPUT_PROMPTS[agentId];
        }
        const name = getSupportInputAgentMeta(agentId)?.name || '今日任务助手';
        return `向${name}发送工作指令`;
    }

    function getSupportAssistantInputPrompt(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p || getPanelKey(p) !== 'support') return '';
        if (!isWorkbenchInputHomePage(p)) return '';
        const state = getPanelState(p);
        if (state.currentInputSkillId) {
            return EMPLOYEE_ASSISTANT_INPUT_PROMPTS[state.currentInputSkillId] || '';
        }
        if (state.currentTopSupportAssistant) {
            return SUPPORT_TOP_INPUT_PROMPTS[state.currentTopSupportAssistant] || '';
        }
        if (state.currentExtraAssistantId) {
            return EMPLOYEE_ASSISTANT_INPUT_PROMPTS[state.currentExtraAssistantId] || '';
        }
        if (state.currentSupportInputAgent) {
            return SUPPORT_ASSISTANT_INPUT_PROMPTS[state.currentSupportInputAgent] || '';
        }
        return '';
    }

    function updateSupportInputPlaceholder(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        const input = getPanelEl('main-chat-input', p);
        if (!input) return;

        // 输入框内以 chip 显示 @xxx 时，将预设提示词作为 placeholder 展示（浅灰色）
        const state = getPanelState(p);
        if (state.currentInputSkillId
            || state.currentTopSupportAssistant
            || state.currentExtraAssistantId
            || state.currentSupportInputAgent) {
            const chipPrompt = getSupportAssistantInputPrompt(p);
            const prevChipPrompt = input.dataset.suggestedPrompt || '';
            if (prevChipPrompt && input.value === prevChipPrompt) {
                input.value = '';
                syncMainSendButtonState(p);
            }
            input.dataset.suggestedPrompt = chipPrompt;
            input.placeholder = chipPrompt;
            refreshInputMentionChip(p);
            return;
        }

        if (!isWorkbenchInputHomePage(p)) {
            input.dataset.suggestedPrompt = '';
            input.placeholder = getChatModeInputPlaceholder(p);
            refreshInputMentionChip(p);
            return;
        }

        const prevPrompt = input.dataset.suggestedPrompt || '';
        const prompt = getSupportAssistantInputPrompt(p);
        if (!input.value.trim() || (prevPrompt && input.value === prevPrompt)) {
            input.value = '';
            syncMainSendButtonState(p);
        }
        input.placeholder = prompt || '发消息...';
        input.dataset.suggestedPrompt = prompt;
        refreshInputMentionChip(p);
    }

    function fillSupportMainInputPrompt(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        if (!isWorkbenchInputHomePage(p)) return;
        const input = getPanelEl('main-chat-input', p);
        const prompt = getSupportAssistantInputPrompt(p);
        if (!input || !prompt || input.value.trim()) return;
        input.value = prompt;
        autoResizeTextarea(input);
        syncMainSendButtonState(p);
    }

    function initSupportMainInputPromptBehavior(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        const input = getPanelEl('main-chat-input', p);
        if (!input || input.dataset.supportPromptBound === 'true') return;
        input.dataset.supportPromptBound = 'true';
        input.addEventListener('focus', () => fillSupportMainInputPrompt(p));
        input.addEventListener('click', () => fillSupportMainInputPrompt(p));
    }

    function ensureInputMentionChip(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p) return null;
        const wrap = p.querySelector('.enhanced-input-wrap');
        if (!wrap) return null;
        let chip = wrap.querySelector('.input-mention-chip');
        if (!chip) {
            chip = document.createElement('span');
            chip.className = 'input-mention-chip';
            chip.hidden = true;
            wrap.appendChild(chip);
            chip.addEventListener('click', () => {
                const input = getPanelEl('main-chat-input', p);
                if (!input) return;
                input.focus();
                const key = getPanelKey(p);
                if (key === 'employee') {
                    fillEmployeeMainInputPrompt(p);
                } else if (key === 'support') {
                    fillSupportMainInputPrompt(p);
                }
            });
        }
        return chip;
    }

    function resolveCurrentAssistantName(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p) return '';
        const state = getPanelState(p);
        const key = getPanelKey(p);
        if (state.currentInputSkillId) {
            const skill = window.getSkillById?.(state.currentInputSkillId) || getFallbackEmployeeSkillById(state.currentInputSkillId);
            if (skill?.name) return skill.name;
        }
        if (key === 'employee') {
            if (state.currentTopBusinessAssistant) {
                const a = (typeof getTopBusinessAssistant === 'function') ? getTopBusinessAssistant(state.currentTopBusinessAssistant) : null;
                if (a?.name) return a.name;
            }
            if (state.currentCatalogAssistant) {
                return state.currentCatalogAssistant.name || '';
            }
            if (state.currentExtraAssistantId) {
                const extra = getExtraAssistantById(state.currentExtraAssistantId);
                if (extra?.name) return extra.name;
            }
            if (typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0) {
                const agents = window.getInstalledEmployeeAssistantsForHome?.() || [];
                const agent = agents.find((item) => item.listIndex === state.currentCardIndex);
                if (agent?.name) return agent.name;
                const assistant = aiAssistants.find((item) => item.index === state.currentCardIndex);
                if (assistant?.name) return assistant.name;
            }
            return '';
        }
        if (key === 'support') {
            if (state.currentTopSupportAssistant) {
                const a = (typeof getTopSupportAssistant === 'function') ? getTopSupportAssistant(state.currentTopSupportAssistant) : null;
                if (a?.name) return a.name;
            }
            if (state.currentExtraAssistantId) {
                const extra = getExtraAssistantById(state.currentExtraAssistantId);
                if (extra?.name) return extra.name;
            }
            if (state.currentSupportInputAgent) {
                return getSupportAgentDisplayLabel(state.currentSupportInputAgent) || '';
            }
            return '';
        }
        return '';
    }

    function refreshInputMentionChip(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p) return;
        const chip = ensureInputMentionChip(p);
        if (!chip) return;
        const input = getPanelEl('main-chat-input', p);
        const wrap = p.querySelector('.enhanced-input-wrap');
        const name = resolveCurrentAssistantName(p);
        if (name && input) {
            input.style.paddingLeft = '';
            const cs = getComputedStyle(input);
            const origPadLeft = parseFloat(cs.paddingLeft) || 0;
            const padTop = parseFloat(cs.paddingTop) || 0;
            const inputOffsetTop = (wrap && input.offsetParent === wrap) ? input.offsetTop : 0;
            const inputOffsetLeft = (wrap && input.offsetParent === wrap) ? input.offsetLeft : 0;
            chip.style.top = (inputOffsetTop + padTop) + 'px';
            chip.style.left = (inputOffsetLeft + origPadLeft) + 'px';
            chip.style.fontSize = cs.fontSize;
            chip.style.lineHeight = cs.lineHeight;
            chip.textContent = '@' + name + ' ';
            chip.hidden = false;
            const chipWidth = chip.offsetWidth;
            input.style.paddingLeft = (origPadLeft + chipWidth + 6) + 'px';
            wrap?.classList.add('has-mention-chip');
            bindMentionChipBackspaceDelete(p, input);
        } else {
            chip.hidden = true;
            chip.textContent = '';
            if (input) {
                input.style.paddingLeft = '';
            }
            wrap?.classList.remove('has-mention-chip');
        }
    }

    function bindMentionChipBackspaceDelete(panel, input) {
        if (input.dataset.mentionBackspaceBound === 'true') return;
        input.dataset.mentionBackspaceBound = 'true';
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Backspace') return;
            if (input.value.length > 0) return;
            const selectionStart = input.selectionStart || 0;
            const selectionEnd = input.selectionEnd || 0;
            if (selectionStart !== 0 || selectionEnd !== 0) return;
            const p = panel || getActiveWorkbenchPanel();
            if (!p) return;
            const state = getPanelState(p);
            const key = getPanelKey(p);
            event.preventDefault();
            if (state.currentInputSkillId) {
                state.currentInputSkillId = null;
                refreshInputSkillPicker(p);
                refreshInputMentionChip(p);
                syncMainSendButtonState(p);
                if (key === 'employee') {
                    updateEmployeeInputPlaceholder(p);
                } else if (key === 'support') {
                    updateSupportInputPlaceholder(p);
                }
                return;
            }
            if (key === 'employee') {
                if (state.currentTopBusinessAssistant) {
                    state.currentTopBusinessAssistant = null;
                    updateTopAvatarActive(null);
                    updateEmployeeInputPlaceholder(p);
                    return;
                }
                if (state.currentCatalogAssistant) {
                    state.currentCatalogAssistant = null;
                    updateEmployeeInputPlaceholder(p);
                    return;
                }
                if (state.currentExtraAssistantId) {
                    clearEmployeeExtraAssistant(p);
                    return;
                }
                if (typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0) {
                    state.currentCardIndex = null;
                    updateEmployeeAssistantSelection(null, p);
                    collapseTopSections(p);
                    refreshInputSkillPicker(p);
                    updateEmployeeInputPlaceholder(p);
                    return;
                }
            }
            if (key === 'support') {
                if (state.currentTopSupportAssistant) {
                    state.currentTopSupportAssistant = null;
                    updateTopAvatarActive(null);
                    updateSupportInputPlaceholder(p);
                    return;
                }
                if (state.currentExtraAssistantId) {
                    clearSupportExtraAssistant(p);
                    return;
                }
                if (state.currentSupportInputAgent) {
                    deselectSupportInputAssistant(p);
                    return;
                }
            }
        });
    }




    function getInputSkillPickerEl(panel) {
        return getPanelEl('input-skill-picker', panel);
    }

    const FALLBACK_EMPLOYEE_SKILLS = [
        { id: 'emp-invest-plan', name: '投资方案生成', description: '根据需求生成投资方案、服务方案' },
        { id: 'emp-compliance', name: '合规审查', description: '检查文档、交易或操作是否符合规范' }
    ];

    const SUPPORT_ATOMIC_SKILLS = [
        {
            id: 'support-atom-daily',
            name: '今日任务原子模型',
            description: '围绕今日任务的拆解、归类与跟进'
        },
        {
            id: 'support-atom-exception',
            name: '异常提醒原子模型',
            description: '识别、归因并跟踪业务异常事项'
        }
    ];

    function getIbAtomicSkills() {
        const knowledge = window.IB_MODEL_KNOWLEDGE;
        if (!knowledge || (!Array.isArray(knowledge.businesses) && !Array.isArray(knowledge.serviceModels))) {
            return FALLBACK_EMPLOYEE_SKILLS.slice();
        }

        const skills = [];
        const seenNames = new Set();
        const businesses = Array.isArray(knowledge.businesses) ? knowledge.businesses : [];
        const serviceModels = Array.isArray(knowledge.serviceModels) ? knowledge.serviceModels : [];

        function addAtomicModel(name, bizLabel, columnLabel, categoryLabel) {
            const modelName = String(name || '').trim();
            if (!modelName) return;
            if (seenNames.has(modelName)) return;
            seenNames.add(modelName);
            const parts = [];
            if (bizLabel) parts.push(bizLabel);
            if (columnLabel) parts.push(columnLabel);
            if (categoryLabel) parts.push(categoryLabel);
            const desc = parts.join(' · ');
            skills.push({
                id: `ib-atom-${skills.length}`,
                name: modelName,
                description: desc || '投行业务原子模型'
            });
        }

        const COLUMN_LABEL_MAP = {
            analysis: '业务分析模型',
            design: '方案设计模型',
            validation: '交叉验证模型'
        };

        businesses.forEach((biz) => {
            if (!biz || !biz.name || !biz.columns) return;
            const bizLabel = biz.category ? `${biz.name}（${biz.category}）` : biz.name;
            ['analysis', 'design', 'validation'].forEach((columnKey) => {
                const column = biz.columns[columnKey];
                if (!Array.isArray(column)) return;
                const columnLabel = COLUMN_LABEL_MAP[columnKey] || columnKey;
                column.forEach((sectionItem) => {
                    if (!sectionItem) return;
                    const categoryLabel = sectionItem.subSection
                        ? `${sectionItem.section} / ${sectionItem.subSection}`
                        : sectionItem.section;
                    (sectionItem.models || []).forEach((modelName) => {
                        addAtomicModel(modelName, bizLabel, columnLabel, categoryLabel);
                    });
                });
            });
        });

        serviceModels.forEach((service) => {
            if (!service || !service.name || !Array.isArray(service.sections)) return;
            const bizLabel = service.name;
            const columnLabel = '客户服务';
            service.sections.forEach((section) => {
                if (!section) return;
                const categoryLabel = section.section;
                (section.models || []).forEach((modelName) => {
                    addAtomicModel(modelName, bizLabel, columnLabel, categoryLabel);
                });
            });
        });

        return skills.length ? skills : FALLBACK_EMPLOYEE_SKILLS.slice();
    }

    function getSupportAtomicSkills() {
        return SUPPORT_ATOMIC_SKILLS.slice();
    }

    function getFallbackEmployeeSkillById(skillId) {
        if (!skillId) return null;
        const atomic = getIbAtomicSkills().find((s) => s.id === skillId);
        if (atomic) return atomic;
        return FALLBACK_EMPLOYEE_SKILLS.find((s) => s.id === skillId) || null;
    }

    function getActiveAssistantSkillOwnerKey(panel) {
        const key = getPanelKey(panel);
        if (key === 'support') {
            const state = getPanelState(panel);
            if (state.currentExtraAssistantId) {
                const extra = getExtraAssistantById(state.currentExtraAssistantId);
                return window.getAssistantSkillOwnerKey?.(extra?.name) || '';
            }
            const meta = getSupportInputAgentMeta(getSupportInputReplyAgentId(state));
            return window.getAssistantSkillOwnerKey?.(meta?.name) || '';
        }
        if (key === 'employee') {
            const state = getPanelState(panel);
            if (state.currentExtraAssistantId) {
                const extra = getExtraAssistantById(state.currentExtraAssistantId);
                return window.getAssistantSkillOwnerKey?.(extra?.name) || '';
            }
            if (state.currentCatalogAssistant?.name) {
                return window.getAssistantSkillOwnerKey(state.currentCatalogAssistant.name);
            }
            if (state.chatModeActive) {
                const assistant = getEmployeeAssistant(state.currentCardIndex ?? 0, panel);
                return window.getAssistantSkillOwnerKey?.(assistant?.name) || '';
            }
            const activeCard = panel?.querySelector('.ai-card-fan.active[data-assistant-id]');
            if (activeCard?.dataset.assistantId) {
                const agent = window.getAssistantCatalogEntry?.(activeCard.dataset.assistantId, 'employee');
                if (agent?.name) return window.getAssistantSkillOwnerKey(agent.name);
            }
            const assistant = getEmployeeAssistant(state.currentCardIndex ?? 0, panel);
            return window.getAssistantSkillOwnerKey?.(assistant?.name) || '';
        }
        return '';
    }

    function closeInputSkillPicker(panel) {
        const picker = getInputSkillPickerEl(panel);
        if (!picker) return;
        picker.classList.remove('is-open');
        const trigger = picker.querySelector('.input-skill-trigger');
        const menu = picker.querySelector('.input-skill-menu');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        if (menu) menu.hidden = true;
    }

    function setInputSkillSelection(panel, skillId) {
        const state = getPanelState(panel);
        state.currentInputSkillId = skillId || null;
        const picker = getInputSkillPickerEl(panel);
        if (!picker) return;
        const triggerText = picker.querySelector('.input-skill-trigger-text');
        const skill = skillId ? (window.getSkillById?.(skillId) || getFallbackEmployeeSkillById(skillId)) : null;
        if (triggerText) {
            triggerText.textContent = skill?.name || '原子模型';
        }
        picker.querySelectorAll('.input-skill-option').forEach((btn) => {
            const active = (btn.dataset.skillId || '') === (skillId || '');
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        closeInputSkillPicker(panel);
        refreshInputMentionChip(panel);
        // 选中/取消原子模型后同步更新 placeholder（选中时隐藏，取消时恢复）
        const key = getPanelKey(panel);
        if (key === 'employee') {
            updateEmployeeInputPlaceholder(panel);
        } else if (key === 'support') {
            updateSupportInputPlaceholder(panel);
        }
    }

    function refreshInputSkillPicker(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const picker = getInputSkillPickerEl(p);
        if (!picker) return;

        const ownerKey = getActiveAssistantSkillOwnerKey(p);
        const panelKey = getPanelKey(p);
        let skills;
        if (panelKey === 'employee' && window.IB_MODEL_KNOWLEDGE) {
            skills = getIbAtomicSkills();
        } else if (panelKey === 'support') {
            skills = getSupportAtomicSkills();
        } else {
            skills = window.getInstalledSkillsForOwner?.(ownerKey) || [];
        }
        const state = getPanelState(p);
        const menu = picker.querySelector('.input-skill-menu');
        const trigger = picker.querySelector('.input-skill-trigger');

        if (!state.currentInputSkillId || !skills.some((s) => s.id === state.currentInputSkillId)) {
            state.currentInputSkillId = null;
        }

        if (!skills.length) {
            if (menu) {
                menu.innerHTML = '<div class="input-skill-empty">当前助手暂无已安装原子模型</div>';
            }
            if (trigger) {
                trigger.disabled = true;
                trigger.title = ownerKey ? `${ownerKey}助手暂无已安装原子模型` : '请先选择助手';
            }
            setInputSkillSelection(p, null);
            if (trigger) trigger.querySelector('.input-skill-trigger-text').textContent = '原子模型';
            return;
        }

        if (trigger) {
            trigger.disabled = false;
            trigger.title = ownerKey ? `选择${ownerKey}助手下的已安装原子模型` : '选择原子模型';
        }

        if (menu) {
            const items = [
                `<button type="button" class="input-skill-option${!state.currentInputSkillId ? ' is-active' : ''}" data-skill-id="" role="option" aria-selected="${!state.currentInputSkillId ? 'true' : 'false'}">不使用原子模型</button>`
            ].concat(skills.map((skill) => {
                const desc = skill.description || skill.desc || skill.summary || '';
                return `
                    <button type="button" class="input-skill-option${state.currentInputSkillId === skill.id ? ' is-active' : ''}" data-skill-id="${escapeHtmlAttr(skill.id)}" role="option" aria-selected="${state.currentInputSkillId === skill.id ? 'true' : 'false'}">
                        <span class="input-skill-option-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M14.7 6.3a4 4 0 0 0-5.7 5.7L3 18v3h3l6-6a4 4 0 0 0 2.7-8.7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span class="input-skill-option-body">
                            <span class="input-skill-option-name">${escapeHtmlText(skill.name)}</span>
                            ${desc ? `<span class="input-skill-option-desc">${escapeHtmlText(desc)}</span>` : ''}
                        </span>
                        <span class="input-skill-option-check" aria-hidden="true">
                            <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l2.6 2.6L12.5 4.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                    </button>
                `;
            }));
            menu.innerHTML = items.join('');
            window.bindOverlayScrollbar?.(menu);
        }

        const activeSkill = state.currentInputSkillId ? (window.getSkillById?.(state.currentInputSkillId) || getFallbackEmployeeSkillById(state.currentInputSkillId)) : null;
        const triggerText = picker.querySelector('.input-skill-trigger-text');
        if (triggerText) triggerText.textContent = activeSkill?.name || '原子模型';
    }

    function toggleInputSkillPicker(panel) {
        const picker = getInputSkillPickerEl(panel);
        const trigger = picker?.querySelector('.input-skill-trigger');
        const menu = picker?.querySelector('.input-skill-menu');
        if (!picker || !trigger || trigger.disabled || !menu) return;

        const willOpen = !picker.classList.contains('is-open');
        document.querySelectorAll('.input-skill-picker.is-open').forEach((el) => {
            if (el !== picker) closeInputSkillPicker(el.closest('.workbench-panel'));
        });
        picker.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        menu.hidden = !willOpen;
        if (willOpen) {
            menu.classList.add('overlay-scrollbar');
            window.bindOverlayScrollbar?.(menu);
        }
    }

    function formatMessageWithSelectedSkill(message, panel) {
        const state = getPanelState(panel);
        const skill = state.currentInputSkillId ? (window.getSkillById?.(state.currentInputSkillId) || getFallbackEmployeeSkillById(state.currentInputSkillId)) : null;
        if (!skill) return message;
        return `【${skill.name}】${message}`;
    }

    function initInputSkillPickers(root) {
        const scope = root?.querySelectorAll ? root : document;
        scope.querySelectorAll('.workbench-panel').forEach((panel) => refreshInputSkillPicker(panel));

        if (document.body.dataset.inputSkillPickerBound === 'true') return;
        document.body.dataset.inputSkillPickerBound = 'true';

        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('.input-skill-trigger');
            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                const panel = trigger.closest('.workbench-panel');
                toggleInputSkillPicker(panel);
                return;
            }

            const option = event.target.closest('.input-skill-option');
            if (option) {
                event.preventDefault();
                const panel = option.closest('.workbench-panel');
                setInputSkillSelection(panel, option.dataset.skillId || null);
                return;
            }

            if (!event.target.closest('.input-skill-picker')) {
                document.querySelectorAll('.input-skill-picker.is-open').forEach((picker) => {
                    closeInputSkillPicker(picker.closest('.workbench-panel'));
                });
            }
        });
    }

    window.refreshInputSkillPickers = function (root) {
        initInputSkillPickers(root);
    };

    function isWorkbenchInputHomePage(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p) return true;
        const key = getPanelKey(p);
        if (key !== 'employee' && key !== 'support') return true;
        return !getPanelState(p).chatModeActive;
    }

    function getChatModeInputPlaceholder(panel) {
        return '输入消息...';
    }

    function getMainInputDefaultPlaceholder(panel) {
        if (!isWorkbenchInputHomePage(panel)) {
            return getChatModeInputPlaceholder(panel);
        }
        if (getPanelKey(panel) === 'support') {
            return getSupportAssistantInputPrompt(panel) || '发消息...';
        }
        return '发消息...';
    }

    function ensureSupportInputTopRow(panel) {
        const wrap = panel?.querySelector('.enhanced-input-wrap');
        const field = wrap?.querySelector('.support-chat-input, .chat-input, .enhanced-textarea');
        if (!wrap || !field) return null;

        let topRow = wrap.querySelector('.support-input-top-row');
        if (!topRow) {
            topRow = document.createElement('div');
            topRow.className = 'support-input-top-row';
            wrap.insertBefore(topRow, field);
            topRow.appendChild(field);
        } else if (field.parentElement !== topRow) {
            topRow.appendChild(field);
        }
        wrap.classList.add('support-input-wrap');
        return topRow;
    }

    function teardownSupportInputTopRow(panel) {
        const wrap = panel?.querySelector('.enhanced-input-wrap');
        if (!wrap) return;

        wrap.classList.remove('support-input-wrap');
        const topRow = wrap.querySelector('.support-input-top-row');
        if (!topRow) return;

        const field = topRow.querySelector('.chat-input, .enhanced-textarea, .support-chat-input');
        if (field) {
            wrap.insertBefore(field, topRow);
        }
        topRow.remove();
    }

    function prepareSupportInputField(panel) {
        const wrap = panel?.querySelector('.enhanced-input-wrap');
        const container = panel?.querySelector('.input-container');
        const input = wrap?.querySelector('.chat-input') || container?.querySelector('.chat-input');
        if (!container || !input || container.dataset.supportInputReady === 'true') return;

        container.classList.add('support-input-container');
        container.dataset.supportInputReady = 'true';

        let field = input;
        if (input.tagName !== 'TEXTAREA') {
            const textarea = document.createElement('textarea');
            textarea.id = input.id;
            textarea.className = 'chat-input support-chat-input';
            textarea.rows = 1;
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMainMessage();
                }
            });
            textarea.addEventListener('input', () => autoResizeTextarea(textarea));
            input.replaceWith(textarea);
            field = textarea;
        } else {
            field.classList.add('support-chat-input');
        }

        const sendBtn = container.querySelector('.send-btn');
        if (sendBtn) sendBtn.classList.add('support-input-send-btn');

        const state = getPanelState(panel);
        updateSupportInputPlaceholder(panel);
        ensureSupportInputTopRow(panel);
    }

    function getSupportInputReplyAgentId(state) {
        if (state?.currentExtraAssistantId) return state.currentExtraAssistantId;
        return state?.currentSupportInputAgent || null;
    }

    function isSupportWorkbenchAssistantMode(state) {
        if (!state) return false;
        if (state.currentExtraAssistantId) return false;
        if (state.currentTopSupportAssistant) return false;
        return !state.currentSupportInputAgent;
    }

    function getSupportWorkbenchAssistantReply(message) {
        if (/异常|提醒|预警|风险/.test(message)) {
            return `**工作台助手**\n\n你的问题更适合由「异常提醒助手」处理。可点选下方「异常提醒」标签切换。\n\n关于「${message}」，我已记录需求，请补充更多背景信息以便跟进。`;
        }
        if (/待办|任务|协同|跟进|今日/.test(message)) {
            return `**工作台助手**\n\n你的问题更适合由「今日任务助手」处理。可点选下方「今日任务」标签切换。\n\n关于「${message}」，我已记录需求，请补充更多背景信息以便跟进。`;
        }
        return `**工作台助手**\n\n关于「${message}」，我已收到你的需求。\n\n可选下方「今日任务」「异常提醒」等助手标签；也可继续描述，我帮你协调处理。`;
    }

    function handleSupportAssistantMessage(message, panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        if (state.currentTopSupportAssistant) {
            const assistant = getTopSupportAssistant(state.currentTopSupportAssistant);
            setTimeout(() => {
                appendSupportChatMessage(getTopSupportAssistantReply(message, assistant), 'assistant', p, {
                    html: true,
                    assistantImage: assistant?.image,
                    assistantDisplayName: assistant?.name
                });
            }, 400);
            return;
        }
        if (isSupportWorkbenchAssistantMode(state)) {
            setTimeout(() => {
                appendSupportChatMessage(getSupportWorkbenchAssistantReply(message), 'assistant', p, {
                    workbenchAssistant: true
                });
            }, 400);
            return;
        }
        if (state.currentExtraAssistantId) {
            const extra = getExtraAssistantById(state.currentExtraAssistantId);
            setTimeout(() => {
                appendSupportChatMessage(
                    getAssistantReply(message, 0, p, { chatIndex: extra?.chatIndex ?? 5 }),
                    'assistant',
                    p,
                    {
                        chatIndex: extra?.chatIndex ?? 5,
                        extraAssistantId: extra?.id,
                        userMessage: message
                    }
                );
            }, 400);
            return;
        }
        setTimeout(() => {
            appendSupportAssistantReply(message, getSupportInputReplyAgentId(state), p);
        }, 400);
    }

    function startSupportChatFromMainInput(message, panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        enterSupportChatMode(p);
        appendSupportChatMessage(message, 'user', p);
        handleSupportAssistantMessage(message, p);
    }

    function getSupportInputAgentOptions() {
        const options = [];
        const seen = new Set();
        const addOption = (meta) => {
            if (!meta || seen.has(meta.id)) return;
            seen.add(meta.id);
            options.push(meta);
        };

        const homeAgents = window.getInstalledSupportAssistantsForHome?.() || [];
        homeAgents.forEach((agent) => {
            if (agent.supportCard === 'tasks') {
                addOption(getSupportInputAgentMeta(SUPPORT_INPUT_AGENT_DAILY_TASK));
            } else if (agent.supportCard === 'exceptions') {
                addOption(getSupportInputAgentMeta(SUPPORT_INPUT_AGENT_EXCEPTIONS));
            } else {
                addOption(getSupportInputAgentMeta(agent.id));
            }
        });

        supportAgents.forEach((agent) => {
            addOption(getSupportInputAgentMeta(agent.id));
        });
        return options;
    }

    function buildSupportInputAgentOptionHtml(meta, isActive) {
        const avatarInner = meta.image
            ? `<img src="${escapeHtml(meta.image)}" alt="">`
            : `<span class="support-input-agent-option-emoji ${meta.avatarClass || ''}" aria-hidden="true">${meta.emoji || ''}</span>`;
        return `
            <button type="button" class="support-input-agent-option${isActive ? ' is-active' : ''}" data-agent-id="${escapeHtml(meta.id)}" role="option" aria-selected="${isActive ? 'true' : 'false'}">
                <span class="support-input-agent-option-avatar">
                    ${avatarInner}
                </span>
                <span class="support-input-agent-option-name">${escapeHtmlText(meta.name)}</span>
            </button>
        `;
    }

    function refreshSupportInputAgentMenu(picker, panel) {
        if (!picker) return;
        const menu = picker.querySelector('.support-input-agent-menu');
        if (!menu) return;
        const state = getPanelState(panel);
        const activeId = state.currentSupportInputAgent;
        menu.innerHTML = getSupportInputAgentOptions()
            .map((meta) => buildSupportInputAgentOptionHtml(meta, meta.id === activeId))
            .join('');
    }

    function syncSupportInputAgentPickers(panel) {
        const panels = panel ? [panel] : [document.getElementById('workbench-panel-support')].filter(Boolean);
        panels.forEach((p) => {
            const picker = p.querySelector('.support-input-agent-picker');
            if (!picker) return;

            const state = getPanelState(p);
            const validIds = new Set(getSupportInputAgentOptions().map((meta) => meta.id));
            if (state.currentSupportInputAgent && !validIds.has(state.currentSupportInputAgent)) {
                state.currentSupportInputAgent = null;
            }

            refreshSupportInputAgentMenu(picker, p);
            updateSupportInputAgentPickerUI(picker, state.currentSupportInputAgent);
        });
    }

    window.syncSupportInputAgentPickers = syncSupportInputAgentPickers;

    function updateSupportInputAgentPickerUI(picker, agentId) {
        if (!picker) return;
        const panel = picker.closest('.workbench-panel');
        const trigger = picker.querySelector('.support-input-agent-trigger');

        if (!agentId) {
            if (trigger) {
                trigger.dataset.agentName = WORKBENCH_ASSISTANT.name;
                trigger.setAttribute('aria-label', `当前助理：${WORKBENCH_ASSISTANT.name}，点击切换`);
                trigger.title = WORKBENCH_ASSISTANT.name;
                trigger.querySelector('.support-input-agent-trigger-img')?.remove();
                trigger.querySelector('.support-input-agent-trigger-emoji')?.remove();
                trigger.insertAdjacentHTML(
                    'afterbegin',
                    `<span class="support-input-agent-trigger-emoji ${WORKBENCH_ASSISTANT.avatarClass}" aria-hidden="true">${WORKBENCH_ASSISTANT.emoji}</span>`
                );
            }
            if (panel) updateSupportInputPlaceholder(panel);
            picker.querySelectorAll('.support-input-agent-option').forEach((btn) => {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            });
            return;
        }

        const meta = getSupportInputAgentMeta(agentId);
        if (!meta) return;

        if (trigger) {
            trigger.dataset.agentName = meta.name;
            trigger.setAttribute('aria-label', `当前助理：${meta.name}，点击切换`);
            trigger.title = meta.name;
            updateSupportInputAgentTriggerAvatar(trigger, meta);
        }
        if (panel) updateSupportInputPlaceholder(panel);

        picker.querySelectorAll('.support-input-agent-option').forEach((btn) => {
            const active = btn.dataset.agentId === agentId;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function closeSupportInputAgentPicker(picker) {
        if (!picker) return;
        picker.classList.remove('is-open');
        picker.querySelector('.support-input-agent-trigger')?.setAttribute('aria-expanded', 'false');
    }

    function closeAllSupportInputAgentPickers(exceptPicker) {
        document.querySelectorAll('.support-input-agent-picker.is-open').forEach((picker) => {
            if (exceptPicker && picker === exceptPicker) return;
            closeSupportInputAgentPicker(picker);
        });
    }

    function setSupportInputAgent(panel, agentId) {
        const state = getPanelState(panel);
        state.currentSupportInputAgent = agentId;
        state.currentExtraAssistantId = null;
        state.currentInputSkillId = null;
        const picker = panel?.querySelector('.support-input-agent-picker');
        if (picker) {
            updateSupportInputAgentPickerUI(picker, agentId);
        } else {
            updateSupportInputPlaceholder(panel);
        }
        updateSupportAssistantTagSelection(panel);
        refreshInputSkillPicker(panel);
        refreshInputMentionChip(panel);
    }

    function bindSupportInputAgentMenuScroll(menu) {
        if (!menu) return;
        menu.classList.add('overlay-scrollbar');
        window.bindOverlayScrollbar?.(menu);
    }

    function toggleSupportInputAgentPicker(picker) {
        if (!picker) return;
        const willOpen = !picker.classList.contains('is-open');
        closeAllSupportInputAgentPickers(picker);
        picker.classList.toggle('is-open', willOpen);
        picker.querySelector('.support-input-agent-trigger')?.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        if (willOpen) {
            bindSupportInputAgentMenuScroll(picker.querySelector('.support-input-agent-menu'));
        }
    }

    function initSupportInputAgentSelect(panel) {
        if (!panel) return;
        restoreSupportStandardInput(panel);
        updateSupportInputPlaceholder(panel);
    }

    if (!window.__supportInputAgentPickerDocBound) {
        window.__supportInputAgentPickerDocBound = true;
        document.addEventListener('click', (event) => {
            if (event.target.closest('.input-assistant-more-picker')) return;
            closeAllSupportInputAgentPickers();
            document.querySelectorAll('.support-input-agent-menu').forEach((menu) => {
                menu.setAttribute('hidden', '');
            });
        });
    }

    function getSupportAgentIntroHtml(agentId) {
        return `<strong>${escapeHtmlText(getSupportAgentDisplayLabel(agentId))}</strong>`;
    }

    function getSupportCategoryTaskCount(categoryId) {
        const cat = getSupportCategoryById(categoryId);
        if (!cat?.badgeAgentIds?.length) return 0;
        return cat.badgeAgentIds.reduce((sum, agentId) => {
            return sum + getSupportCategoryAgentTasks(categoryId, agentId).length;
        }, 0);
    }

    function shouldShowSupportAgentBadge(agentId, categoryId) {
        const cat = getSupportCategoryById(categoryId);
        if (!cat?.badgeAgentIds?.includes(agentId)) return false;
        return getSupportCategoryAgentTasks(categoryId, agentId).length > 0;
    }

    function updateSupportCategoryCardBadges() {
        if (!document.body.classList.contains('support-tab-active')) return;
        supportTopCategories.forEach(cat => {
            const btn = document.querySelector(`.support-category-item[data-support-category="${cat.id}"]`);
            if (!btn) return;
            btn.querySelector('.support-category-task-badge')?.remove();
            const count = getSupportCategoryTaskCount(cat.id);
            if (count <= 0) return;
            const badge = document.createElement('span');
            badge.className = 'support-category-task-badge';
            badge.textContent = String(count);
            badge.setAttribute('aria-label', count + '项今日任务');
            btn.appendChild(badge);
        });
    }

    const collapsedSupportTaskGroups = new Set();

    function buildSupportDailyTasksSummaryHtml(options = {}) {
        const useCards = options.sidebar === true;

        if (useCards) {
            let html = '<div class="support-task-cards-wrap">';
            supportBadgeAgentIds.forEach(agentId => {
                const agent = getSupportAgent(agentId);
                const allTasks = getSupportAgentAllTasks(agentId);
                if (!allTasks.length) return;
                const expanded = !collapsedSupportTaskGroups.has(agentId);
                html += `<section class="support-task-group${expanded ? ' is-expanded' : ''}" data-agent-id="${escapeHtmlAttr(agentId)}">
                    <button type="button" class="support-task-group-toggle" aria-expanded="${expanded}">
                        <img src="${escapeHtml(agent.image)}" alt="${escapeHtmlText(agent.name)}" class="support-task-group-avatar">
                        <span class="support-task-group-label">${escapeHtmlText(agent.name)}（${allTasks.length}项待办）</span>
                        ${getSupportDailyTaskChevronHtml()}
                    </button>
                    <div class="support-task-card-list">`;
                getSupportAgentTasksWithCategory(agentId).forEach((item, index) => {
                    html += buildSupportTaskCardHtml(agentId, item.task, index);
                });
                html += '</div></section>';
            });
            html += '</div>';
            return html;
        }

        let html = '<p>以下是有待办事项的业务助理任务汇总：</p>';
        supportBadgeAgentIds.forEach(agentId => {
            const agent = getSupportAgent(agentId);
            const allTasks = getSupportAgentAllTasks(agentId);
            if (!allTasks.length) return;
            html += `<p><strong>${escapeHtmlText(agent.name)}</strong>（${allTasks.length}项待办）</p>`;
            getSupportAgentTasksWithCategory(agentId).forEach((item, index) => {
                html += buildSupportTodoLineSummaryHtml(agentId, item.task, index);
            });
        });
        if (options.forChatCard) {
            html += '<p>点击任务项发送到对话框，协助推进处理。</p>';
        } else {
            html += '<p>请点击任务项，或选择带角标的业务助理头像，快速发起对话。</p>';
        }
        return html;
    }

    function buildSupportAgentTasksGuideHtml(agentId) {
        const agent = getSupportAgent(agentId);
        const allTasks = getSupportAgentAllTasks(agentId);
        let html = `<p>你有 <strong>${allTasks.length}</strong> 项今日待办，建议优先处理：</p>`;
        allTasks.forEach((task, index) => {
            html += buildSupportTodoLineGuideHtml(agentId, task, index);
        });
        html += '<p>请在下方对话框输入具体待办内容，或<strong>直接点击</strong>上方待办文字快速发送，协助推进处理。</p>';
        return html;
    }

    function findSupportTask(agentId, taskId) {
        for (const categoryMap of Object.values(supportCategoryAgentTasks)) {
            const task = categoryMap[agentId]?.find(item => item.id === taskId);
            if (task) return task;
        }
        return null;
    }

    function sendSupportTodoQuick(agentId, taskId, sendText, stepText, replyMode = 'task', options = {}) {
        const panel = document.getElementById('workbench-panel-support');
        if (!panel || !supportBadgeAgentIds.includes(agentId)) return;

        const task = findSupportTask(agentId, taskId);
        const message = (options.preferTaskTitle && task?.title)
            ? `请协助处理：${task.title}`
            : (sendText || stepText || task?.nextSteps?.[0] || '').trim();
        if (!message) return;

        // 将任务同步到右侧「关联任务」面板
        if (task) {
            window.ContextPanel?.addTask?.({
                id: task.id || `${agentId}-${taskId}`,
                title: task.title || message,
                status: task.status || '待处理',
                dueDate: task.dueDate || ''
            });
        }

        const state = getPanelState(panel);
        state.currentTaskAgentId = agentId;
        state.currentTask = task;
        state.currentTodoStep = stepText || task?.nextSteps?.[0] || message;

        if (!state.chatModeActive) {
            enterSupportChatMode(panel);
        }

        appendSupportChatMessage(message, 'user', panel);
        setTimeout(() => {
            if (!task) {
                appendSupportChatMessage(getSupportAgentReply(message, agentId), 'assistant', panel, { agentId });
                return;
            }
            if (replyMode === 'step') {
                appendSupportChatMessage(buildSupportStepReplyHtml(task, agentId, stepText || message), 'assistant', panel, { html: true, agentId });
            } else if (replyMode === 'exec') {
                appendSupportChatMessage(buildSupportExecStepReplyHtml(task, agentId, stepText || state.currentTodoStep, message), 'assistant', panel, { html: true, agentId });
            } else {
                appendSupportChatMessage(buildSupportTaskReplyHtml(task, agentId), 'assistant', panel, { html: true, agentId });
            }
        }, 400);
    }

    function initSupportChatTodoActions(panel) {
        if (window.__supportTodoActionsBound === 'true') return;
        window.__supportTodoActionsBound = 'true';

        document.getElementById('support-sidebar-tasks-body')?.addEventListener('click', (event) => {
            const toggle = event.target.closest('.support-task-group-toggle');
            if (!toggle) return;
            event.preventDefault();
            event.stopPropagation();
            const group = toggle.closest('.support-task-group');
            if (!group) return;
            const agentId = group.dataset.agentId;
            const expanded = group.classList.toggle('is-expanded');
            toggle.setAttribute('aria-expanded', String(expanded));
            if (agentId) {
                if (expanded) collapsedSupportTaskGroups.delete(agentId);
                else collapsedSupportTaskGroups.add(agentId);
            }
        });

        document.addEventListener('click', (event) => {
            if (!document.body.classList.contains('support-tab-active')) return;

            const trigger = event.target.closest('.support-chat-todo-trigger');
            if (!trigger) return;

            if (event.target.closest('.support-task-group-toggle')) return;

            const exceptionTitle = trigger.dataset.exceptionTitle;
            if (exceptionTitle && trigger.classList.contains('support-exception-item-trigger')) {
                event.preventDefault();
                sendSupportExceptionQuick(exceptionTitle);
                return;
            }

            const inSidebar = trigger.closest('#support-sidebar-tasks-body, .support-sidebar-tasks-content');
            const inSupportPanel = trigger.closest('#workbench-panel-support');
            const inChatMessages = trigger.closest('#ai-chat-messages');
            if (!inSidebar && !inSupportPanel) return;

            event.preventDefault();

            if (inSidebar) {
                const agent = getSupportAgent(trigger.dataset.agentId);
                if (agent) showSupportAgentJumpToast(agent.name);
                return;
            }

            const exceptionsEl = document.getElementById('center-view-exceptions-support') || document.getElementById('center-view-exceptions');
            if (exceptionsEl && !exceptionsEl.hidden) {
                window.AppShell?.returnToMainSessionView?.();
            }

            sendSupportTodoQuick(
                trigger.dataset.agentId,
                trigger.dataset.taskId,
                trigger.dataset.sendText,
                trigger.dataset.stepText,
                trigger.dataset.replyMode || 'task',
                { preferTaskTitle: !!inChatMessages }
            );
        });
    }

    function showSupportWelcomeMessage(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        if (state.supportWelcomeShown) return;
        renderSupportSidebarTasks(p);
        renderSupportSessionHistory();
        state.supportWelcomeShown = true;
    }

    function resetSupportChatView(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (messagesEl) messagesEl.innerHTML = '';

        const input = getPanelEl('main-chat-input', p);
        if (input) input.value = '';

        const state = getPanelState(p);
        state.currentTaskAgentId = null;
        state.currentTask = null;
        state.currentTodoStep = null;
        state.chatModeActive = false;
        deselectSupportInputAssistant(p);
        renderSupportSidebarTasks(p);
        exitSupportChatMode(p);
        updateSupportChatLayout(p);
        window.AppShell?.collapseContextPanel?.();
    }

    function initSupportPanel(panel) {
        const state = getPanelState(panel);
        state.currentSupportAgent = null;
        state.currentSupportInputAgent = null;
        state.currentExtraAssistantId = null;
        state.currentInputSkillId = null;
        state.chatModeActive = false;
        state.supportWelcomeShown = false;
        initSupportInputAgentSelect(panel);
        syncSupportAssistantTags(panel);
        initSupportAtMentionAssistantPicker(panel);
        initSupportMainInputPromptBehavior(panel);
        updateSupportAgentButton(panel, null);
        updateTopAvatarActive(null);
        updateSupportAvatarPendingDots();
        initSupportChatTodoActions(panel);
        ensureSupportHomeCards(panel);
        refreshSupportHomeCardCounts(panel);
        showSupportWelcomeMessage(panel);
        updateSupportSidebarNavCounts();
        syncSupportHomeLayout(panel);
        panel.dataset.initialized = 'true';
    }

    function appendSupportAgentTaskGuide(agentId, panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;

        const agent = getSupportAgent(agentId);
        const row = document.createElement('div');
        row.className = 'chat-row chat-row-assistant support-assistant-row';
        row.dataset.supportAgentGuide = agentId;
        row.innerHTML = `
            <div class="chat-avatar support-chat-avatar"><img src="${agent.image}" alt="${escapeHtmlText(getSupportAgentDisplayLabel(agentId))}"></div>
            <div class="chat-bubble chat-bubble-assistant">${buildSupportAssistantBubbleContent(buildSupportAgentTasksGuideHtml(agentId), { html: true, agentId }, p)}</div>
        `;
        messagesEl.appendChild(row);
        updateSupportChatLayout(p);
    }

    function openSupportAvatarChat(avatarType) {
        const assistant = getTopSupportAssistant(avatarType);
        if (!assistant) return;

        if (getPanelKey() !== 'support') {
            switchWorkbenchTab('support');
        }
        const panel = document.getElementById('workbench-panel-support');
        if (!panel) return;

        const state = getPanelState(panel);
        const messagesEl = getPanelEl('ai-chat-messages', panel);
        if (messagesEl) messagesEl.innerHTML = '';

        createSupportSession(`${assistant.name}对话`);

        state.currentTopSupportAssistant = assistant.id;
        state.currentExtraAssistantId = null;
        state.currentSupportInputAgent = null;
        state.currentSupportAgent = null;
        state.currentTaskAgentId = null;

        enterSupportChatMode(panel);
        updateTopAvatarActive(avatarType);
        syncSupportInputAgentPickers(panel);

        appendSupportChatMessage(markdownToHtml(assistant.welcomeText), 'assistant', panel, {
            html: true,
            assistantImage: assistant.image,
            assistantDisplayName: assistant.name
        });

        updateSupportInputPlaceholder(panel);
    }

    function selectSupportAgent(agentId) {
        const panel = document.getElementById('workbench-panel-support');
        if (!panel) return;

        if (getPanelKey() !== 'support') {
            switchWorkbenchTab('support');
        }

        const agent = getSupportAgent(agentId);
        const state = getPanelState(panel);
        state.currentSupportAgent = null;
        updateSupportAgentButton(panel, null);
        updateTopAvatarActive(null);
        showOrgAgentJumpToast(agent.name);
    }

    function buildSupportAssistantChatAvatarHtml(agentMeta) {
        if (!agentMeta) {
            return buildWorkbenchChatAvatarHtml();
        }
        if (agentMeta.id === SUPPORT_INPUT_AGENT_EXCEPTIONS) {
            return buildEmployeeExceptionChatAvatarHtml();
        }
        if (agentMeta.id === SUPPORT_INPUT_AGENT_DAILY_TASK) {
            return buildEmployeeBotAvatarHtml('今日任务助手', 'tasks');
        }
        if (agentMeta.image) {
            return `<div class="chat-avatar support-chat-avatar"><img src="${escapeHtml(agentMeta.image)}" alt="${escapeHtmlText(agentMeta.name || '')}"></div>`;
        }
        const name = getEmployeeAssistantDisplayName(agentMeta, WORKBENCH_ASSISTANT.name);
        const avatarKey = getEmployeeAssistantAvatarKey(agentMeta);
        return buildEmployeeBotAvatarHtml(name, avatarKey);
    }

    function resolveSupportMessageAssistantName(options = {}, text = '', panel) {
        if (options.workbenchAssistant) {
            return WORKBENCH_ASSISTANT.name;
        }
        if (options.extraAssistantId) {
            const extra = getExtraAssistantById(options.extraAssistantId);
            if (extra?.name) return extra.name;
        }
        if (options.assistantDisplayName) {
            return options.assistantDisplayName;
        }
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        const agentId = options.agentId
            || options.extraAssistantId
            || state.currentExtraAssistantId
            || state.currentTaskAgentId
            || state.currentSupportInputAgent
            || state.currentSupportAgent;
        if (agentId) {
            const label = getSupportAgentDisplayLabel(agentId);
            if (label) return label;
        }
        if (typeof options.chatIndex === 'number') {
            const assistant = aiAssistants[options.chatIndex];
            if (assistant?.name) return assistant.name;
        }
        const titleName = resolveAssistantTitleFromMessage(text);
        if (titleName) return getAssistantDisplayNameFromTitle(titleName);
        return '助手';
    }

    function buildSupportAssistantBubbleContent(text, options = {}, panel) {
        const name = resolveSupportMessageAssistantName(options, text, panel);
        let bodyHtml = options.html ? String(text || '') : markdownToHtml(stripLeadingAssistantTitleMarkdown(text, name));
        bodyHtml = stripLeadingAssistantTitleHtml(bodyHtml, name);
        return `<p class="chat-assistant-name">${escapeHtml(name)}</p>${bodyHtml}`;
    }

    function appendSupportChatMessage(text, role, panel, options = {}) {
        const p = panel || document.getElementById('workbench-panel-support');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;

        const state = getPanelState(p);
        const agentId = options.workbenchAssistant
            ? null
            : (options.agentId
                || options.extraAssistantId
                || state.currentExtraAssistantId
                || state.currentTaskAgentId
                || state.currentSupportInputAgent
                || state.currentSupportAgent);
        const agentMeta = agentId ? getSupportInputAgentMeta(agentId) : null;
        const row = document.createElement('div');
        row.className = role === 'user' ? 'chat-row chat-row-user' : 'chat-row chat-row-assistant support-assistant-row';

        const assistantBody = buildSupportAssistantBubbleContent(text, options, p);

        if (role === 'user') {
            const initial = (document.getElementById('sidebar-user-avatar')?.textContent || '业').trim().charAt(0) || '业';
            row.innerHTML = `
                <div class="chat-bubble chat-bubble-user">${escapeHtml(text)}</div>
                <div class="chat-avatar employee-chat-avatar employee-user-avatar support-user-avatar">${escapeHtmlText(initial)}</div>
            `;
        } else if (options.assistantImage) {
            row.innerHTML = `
                <div class="chat-avatar support-chat-avatar"><img src="${escapeHtml(options.assistantImage)}" alt="${escapeHtmlText(options.assistantDisplayName || '')}"></div>
                <div class="chat-bubble chat-bubble-assistant">${assistantBody}</div>
            `;
        } else if (options.workbenchAssistant) {
            row.innerHTML = `
                ${buildWorkbenchChatAvatarHtml()}
                <div class="chat-bubble chat-bubble-assistant">${assistantBody}</div>
            `;
        } else if (agentMeta) {
            row.innerHTML = `
                ${buildSupportAssistantChatAvatarHtml(agentMeta)}
                <div class="chat-bubble chat-bubble-assistant">${assistantBody}</div>
            `;
        } else {
            row.innerHTML = `
                <div class="chat-avatar support-chat-avatar support-daily-task-chat-avatar">${getSupportDailyTaskRobotAvatarHtml()}</div>
                <div class="chat-bubble chat-bubble-assistant">${assistantBody}</div>
            `;
        }

        messagesEl.appendChild(row);
        if (role === 'assistant') {
            const bubble = row.querySelector('.chat-bubble-assistant');
            const extra = options.extraAssistantId
                ? getExtraAssistantById(options.extraAssistantId)
                : getExtraAssistantById(agentId);
            syncAssistantMessageContext(bubble, text, {
                chatIndex: options.chatIndex ?? extra?.chatIndex,
                extraAssistantId: options.extraAssistantId || extra?.id,
                userMessage: options.userMessage || ''
            });
        }
        if (!options.skipPersist) {
            recordSupportChatMessage(p, {
                role,
                text,
                html: !!options.html,
                agentId: options.agentId || null,
                workbenchAssistant: !!options.workbenchAssistant,
                assistantImage: options.assistantImage || null,
                assistantDisplayName: options.assistantDisplayName || null
            });
        }
        updateSupportChatLayout(p);
    }

    function buildSupportStepReplyHtml(task, agentId, stepText) {
        let html = `<p>好的，我来协助你推进「${escapeHtmlText(task.title)}」中的：<strong>${escapeHtmlText(stepText)}</strong>。</p>`;
        html += '<p><strong>执行建议</strong></p><ul class="chat-md-list support-task-exec-steps">';
        supportExecSuggestions.forEach(execStep => {
            html += `<li>${buildSupportTodoTriggerHtml(agentId, task, execStep, stepText, 'exec')}</li>`;
        });
        html += '</ul><p>你可<strong>直接点击</strong>上方执行建议快速发送，协助推进处理；也可在对话框继续输入具体事项。</p>';
        return html;
    }

    function buildSupportExecStepReplyHtml(task, agentId, parentStepText, execStepText) {
        let html = `<p>收到，我是${getSupportAgentIntroHtml(agentId)}。正在协助你处理「${escapeHtmlText(task.title)}」—「${escapeHtmlText(parentStepText)}」中的：<strong>${escapeHtmlText(execStepText)}</strong>。</p>`;
        html += getSupportExecProcessingHtml(task, parentStepText, execStepText);
        html += '<p>如需我继续帮你起草文档、整理清单或安排会议，请直接告诉我。</p>';
        return html;
    }

    function getSupportExecProcessingHtml(task, parentStepText, execStepText) {
        const maps = {
            '梳理该项工作的背景材料、责任人与截止时间': `
                <p><strong>背景材料清单</strong></p>
                <ul class="chat-md-list">
                    <li>任务概况：${escapeHtmlText(task.description)}</li>
                    <li>当前步骤：${escapeHtmlText(parentStepText)}</li>
                    <li>建议收集：相关审批记录、历史沟通纪要、模板与参考样例</li>
                </ul>
                <p><strong>责任与节点</strong></p>
                <ul class="chat-md-list">
                    <li>建议明确主责人与协作方，并设定目标完成日期</li>
                    <li>涉及跨部门事项时，提前同步合规、风控等相关同事</li>
                </ul>`,
            '按优先级推进关键协作事项，并同步相关同事': `
                <p><strong>协作推进建议</strong></p>
                <ul class="chat-md-list">
                    <li>优先推进「${escapeHtmlText(parentStepText)}」中的关键阻塞项</li>
                    <li>同步相关业务、合规及运营同事，确认分工与交付口径</li>
                    <li>对需外部配合的事项，建议今日内发出协作通知并跟进回执</li>
                </ul>
                <p><strong>沟通要点</strong></p>
                <ul class="chat-md-list">
                    <li>说明任务背景、当前进展与期望产出</li>
                    <li>明确截止时间、材料格式及反馈方式</li>
                </ul>`,
            '完成后更新任务进展，便于团队跟踪': `
                <p><strong>进展更新建议</strong></p>
                <ul class="chat-md-list">
                    <li>记录「${escapeHtmlText(parentStepText)}」的完成状态与关键结论</li>
                    <li>更新任务看板或工作日志，标注下一步待办与责任人</li>
                    <li>如有风险或延期，及时同步团队并调整优先级</li>
                </ul>
                <p><strong>可同步内容</strong></p>
                <ul class="chat-md-list">
                    <li>已完成事项摘要、遗留问题及预计解决时间</li>
                    <li>相关文档链接或附件清单，便于团队查阅跟踪</li>
                </ul>`
        };
        return maps[execStepText] || `<p>我将围绕「${escapeHtmlText(execStepText)}」为你梳理处理思路，请补充更多具体信息以便进一步协助。</p>`;
    }

    function buildSupportTaskReplyHtml(task, agentId) {
        let html = `<p>已收到你关于「${escapeHtmlText(task.title)}」的跟进请求。</p>`;
        html += `<p><strong>任务概况</strong><br>${escapeHtmlText(task.description)}</p>`;
        html += '<p><strong>已完成步骤</strong></p><ul class="chat-md-list support-task-steps-list">';
        task.completedSteps.forEach(step => {
            html += `<li>${escapeHtmlText(step)}</li>`;
        });
        html += '</ul><p><strong>建议下一步</strong></p><ul class="chat-md-list support-task-next-steps">';
        task.nextSteps.forEach(step => {
            html += `<li>${buildSupportTodoTriggerHtml(agentId, task, step, step, 'step')}</li>`;
        });
        html += '</ul><p>如需协助撰写材料、安排会议或推进审批，请直接点击上方建议步骤，或在对话框输入。</p>';
        return html;
    }

    function updateSupportChatLayout(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const workbench = p?.querySelector('.ai-workbench-section');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!workbench || !messagesEl) return;
        const hasChat = messagesEl.children.length > 0;
        if (hasChat) {
            getPanelState(p).chatModeActive = true;
        }
        workbench.classList.toggle('support-has-chat', hasChat);
        syncSupportHomeLayout(p);
        if (hasChat) {
            scrollWorkbenchChatToBottom(p);
        }
    }

    function findSupportTaskByMessage(message, agentId) {
        return getSupportAgentAllTasks(agentId).find(task =>
            message.includes(task.title) ||
            task.nextSteps.some(step => message.includes(step) || step.includes(message))
        ) || null;
    }

    function appendSupportAssistantReply(message, agentId, panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const state = getPanelState(p);
        const resolvedAgentId = agentId || state.currentSupportInputAgent || state.currentTaskAgentId || state.currentSupportAgent;
        const extra = getExtraAssistantById(resolvedAgentId);
        if (extra) {
            appendSupportChatMessage(
                getAssistantReply(message, 0, p, { chatIndex: extra.chatIndex }),
                'assistant',
                p,
                {
                    agentId: resolvedAgentId,
                    chatIndex: extra.chatIndex,
                    extraAssistantId: extra.id,
                    userMessage: message
                }
            );
            return;
        }
        if (resolvedAgentId === SUPPORT_INPUT_AGENT_EXCEPTIONS) {
            appendSupportChatMessage(buildSupportAllExceptionsChatHtml(), 'assistant', p, {
                html: true,
                agentId: resolvedAgentId,
                userMessage: message
            });
            return;
        }
        if (resolvedAgentId === SUPPORT_INPUT_AGENT_DAILY_TASK) {
            appendSupportChatMessage(buildSupportDailyTasksSummaryHtml({ forChatCard: true }), 'assistant', p, {
                html: true,
                agentId: resolvedAgentId,
                userMessage: message
            });
            return;
        }
        const task = state.currentTask || (resolvedAgentId ? findSupportTaskByMessage(message, resolvedAgentId) : null);
        if (task && resolvedAgentId) {
            state.currentTask = task;
            appendSupportChatMessage(buildSupportTaskReplyHtml(task, resolvedAgentId), 'assistant', p, { html: true, agentId: resolvedAgentId });
            return;
        }
        appendSupportChatMessage(getSupportAgentReply(message, resolvedAgentId), 'assistant', p, { agentId: resolvedAgentId });
    }

    function getSupportTaskReply(task, agentId) {
        const done = task.completedSteps.map(s => `• ${s}`).join('\n');
        const next = task.nextSteps.map(s => `• ${s}`).join('\n');
        return `已收到你关于「${task.title}」的跟进请求。\n\n**任务概况**\n${task.description}\n\n**已完成步骤**\n${done}\n\n**建议下一步**\n${next}\n\n如需协助撰写材料、安排会议或推进审批，请直接输入。`;
    }

    function getSupportAgentReply(message, agentId) {
        if (!agentId) {
            for (const id of supportBadgeAgentIds) {
                const agent = getSupportAgent(id);
                for (const task of getSupportAgentAllTasks(id)) {
                    const matchedStep = task.nextSteps.find(step => message.includes(step) || step.includes(message));
                    if (matchedStep || message.includes(task.title)) {
                        return `你好，该待办属于**${getSupportAgentDisplayLabel(id)}**。\n\n` + getSupportTaskReply(task, id).replace(/^你好[^\n]+\n\n/, '');
                    }
                }
            }
            const badgeHint = supportBadgeAgentIds.map(id => {
                return `**${getSupportAgentDisplayLabel(id)}**（${getSupportAgentTaskCount(id)}）`;
            }).join('、');
            return `你好，我已收到你的消息。你可在上方点击${badgeHint}选择对应助理；也可直接在对话框输入具体待办内容，我将协助你跟进处理。`;
        }
        const supportState = getPanelState(document.getElementById('workbench-panel-support'));
        const task = supportState?.currentTask;
        if (task && (message.includes(task.title) || task.nextSteps.some(step => message.includes(step) || step.includes(message)))) {
            return getSupportTaskReply(task, agentId || supportState.currentTaskAgentId);
        }
        if (agentId === SUPPORT_INPUT_AGENT_DAILY_TASK) {
            return `关于「${message}」，我将为你汇总待办并协助跟进处理。请补充具体事项或相关材料。`;
        }
        if (agentId === SUPPORT_INPUT_AGENT_EXCEPTIONS) {
            return `关于「${message}」，我将为你汇总需关注的异常并协助推进处理。请补充具体事项或相关材料。`;
        }
        const extra = getExtraAssistantById(agentId);
        if (extra) {
            return getAssistantReply(message, 0, null, { chatIndex: extra.chatIndex });
        }
        return `关于「${message}」，我将结合当前任务进展为你提供支持。请补充具体事项或相关材料。`;
    }

    function customizeOrgPanel(panel) {
        const workTips = panel.querySelector('#work-tips-section-org');
        if (workTips) workTips.remove();

        const carousel = panel.querySelector('#ai-carousel-view-org');
        if (carousel) carousel.remove();

        const miniAvatars = panel.querySelector('#ai-mini-avatars-org');
        if (miniAvatars) miniAvatars.remove();

        const chatView = panel.querySelector('#ai-chat-view-org');
        const workbench = panel.querySelector('.ai-workbench-section');
        if (chatView) chatView.style.display = '';
        if (workbench) {
            workbench.classList.add('org-workbench-mode');

            const jumpBar = document.createElement('div');
            jumpBar.className = 'org-agent-jump-bar';
            jumpBar.innerHTML = '<button type="button" class="org-current-agent-name" id="org-current-agent-name-org" style="display: none;">去业务助理</button>';
            workbench.insertBefore(jumpBar, workbench.firstChild);

            const scrollBody = document.createElement('div');
            scrollBody.className = 'org-workbench-scroll';

            const promptsCenter = document.createElement('div');
            promptsCenter.className = 'org-prompts-center';
            promptsCenter.innerHTML = '<div class="org-agent-prompts-list" id="org-agent-prompts-list-org"></div>';
            scrollBody.appendChild(promptsCenter);

            const inputSection = workbench.querySelector('.input-section');
            if (chatView) scrollBody.appendChild(chatView);
            workbench.insertBefore(scrollBody, inputSection);
        }

        panel.dataset.orgCustomized = 'true';
    }

    function getOrgAgent(agentId) {
        return orgAgents.find(a => a.id === agentId) || orgAgents[0];
    }

    function updateTopAvatarActive(agentId) {
        document.querySelectorAll('.avatar-item[data-avatar-type]').forEach(item => {
            item.classList.toggle('active', !!agentId && item.dataset.avatarType === agentId);
        });
    }

    function getSupportCategoryIconHtml(iconName) {
        const icons = {
            'users': {
                color: '#4A90E2',
                svg: '<circle cx="12" cy="7" r="4" fill="#4A90E2" opacity="0.2"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#4A90E2" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="#4A90E2" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#4A90E2" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#4A90E2" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            },
            'trending-up': {
                color: '#E74C3C',
                svg: '<path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#E74C3C" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 6 23 6 23 12" stroke="#E74C3C" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="23" cy="6" r="3" fill="#E74C3C" opacity="0.2"/>'
            },
            'shield': {
                color: '#27AE60',
                svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#27AE60" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#27AE60" opacity="0.15"/><path d="M9 12l2 2 4-4" stroke="#27AE60" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            },
            'layers': {
                color: '#F39C12',
                svg: '<polygon points="12 2 2 7 12 12 22 7 12 2" stroke="#F39C12" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polygon points="12 2 2 7 12 12 22 7 12 2" fill="#F39C12" opacity="0.15"/><polyline points="2 17 12 22 22 17" stroke="#F39C12" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 12 12 17 22 12" stroke="#F39C12" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            }
        };
        const icon = icons[iconName] || icons['users'];
        return `<svg class="support-category-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${icon.svg}</svg>`;
    }

    function initSupportCategoryRow() {
        const row = document.getElementById('support-category-row');
        if (!row || row.dataset.initialized === 'true') return;
        row.innerHTML = supportTopCategories.map(cat => {
            const hasDropdown = hasSupportCategoryDropdown(cat.id);
            return `
            <button type="button" class="support-category-item${hasDropdown ? '' : ' is-no-dropdown'}" role="tab" data-support-category="${cat.id}" data-has-dropdown="${hasDropdown ? 'true' : 'false'}" aria-selected="false" aria-expanded="false" onclick="toggleSupportCategory('${cat.id}', event)">
                <div class="support-category-item-left">
                    ${getSupportCategoryIconHtml(cat.icon)}
                </div>
                <div class="support-category-item-center">
                    <span class="support-category-item-title">${cat.name}</span>
                </div>
            </button>
        `;
        }).join('');
        row.dataset.initialized = 'true';
        initSupportCategoryDropdownDismiss();
        updateSupportCategoryCardBadges();
    }

    function toggleSupportCategory(categoryId, event) {
        event?.stopPropagation();
        if (!hasSupportCategoryDropdown(categoryId)) {
            handleSupportCategoryDirectClick(categoryId);
            return;
        }
        if (currentSupportCategoryId === categoryId) {
            clearSupportCategorySelection();
            return;
        }
        selectSupportCategory(categoryId);
    }

    function handleSupportCategoryDirectClick(categoryId) {
        if (currentSupportCategoryId) {
            clearSupportCategorySelection();
        }
        const cat = getSupportCategoryById(categoryId);
        const agentIds = getSupportCategoryVisibleAgentIds(categoryId);
        const toastMessage = cat?.directJumpToast
            || (agentIds.length === 1 ? '点击跳转' + getSupportAgent(agentIds[0]).name : '点击跳转相应页面');
        showOrgAgentJumpToast(toastMessage, { fullMessage: true });

        if (agentIds.length === 1) {
            const panel = document.getElementById('workbench-panel-support');
            if (!panel) return;
            const state = getPanelState(panel);
            state.currentSupportAgent = null;
            updateSupportAgentButton(panel, null);
            updateTopAvatarActive(null);
        }
    }

    function initSupportCategoryDropdownDismiss() {
        if (document.body.dataset.supportDropdownDismissBound === 'true') return;

        document.addEventListener('click', () => {
            if (!document.body.classList.contains('support-tab-active')) return;
            if (!currentSupportCategoryId) return;
            clearSupportCategorySelection();
        });

        document.getElementById('support-category-row')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.getElementById('support-secondary-avatars-wrap')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.getElementById('support-top-nav-stack')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.body.dataset.supportDropdownDismissBound = 'true';
    }

    const allSupportAgentIds = ['ib', 'asset', 'retail', 'invest', 'sales', 'institution', 'research', 'credit', 'verify'];

    function getSupportCategoryExcludedAgentIds(categoryId) {
        return supportTopCategories.find(cat => cat.id === categoryId)?.excludeAgentIds || [];
    }

    function getSupportCategoryVisibleAgentIds(categoryId) {
        const excluded = new Set(getSupportCategoryExcludedAgentIds(categoryId));
        return allSupportAgentIds.filter(id => !excluded.has(id));
    }

    function hasSupportCategoryDropdown(categoryId) {
        return getSupportCategoryVisibleAgentIds(categoryId).length >= 2;
    }

    function updateSupportAvatarsVisibility(categoryId) {
        const excluded = new Set(getSupportCategoryExcludedAgentIds(categoryId));
        document.querySelectorAll('.avatar-item[data-avatar-type]').forEach(item => {
            const hidden = excluded.has(item.dataset.avatarType);
            item.hidden = hidden;
            item.style.display = hidden ? 'none' : '';
        });
        updateDigitalAvatarsScrollButtons();
    }

    function resetSupportAvatarsVisibility() {
        document.querySelectorAll('.avatar-item[data-avatar-type]').forEach(item => {
            item.hidden = false;
            item.style.display = '';
        });
        updateDigitalAvatarsScrollButtons();
    }

    function setSupportSecondaryNavExpanded(expanded) {
        const host = document.getElementById('top-nav-avatars-host');
        const stack = document.getElementById('support-top-nav-stack');
        host?.classList.toggle('is-secondary-expanded', expanded);
        stack?.classList.toggle('is-secondary-expanded', expanded);
    }

    function selectSupportCategory(categoryId) {
        if (!supportTopCategories.some(cat => cat.id === categoryId)) return;
        currentSupportCategoryId = categoryId;
        setSupportSecondaryNavExpanded(true);
        document.querySelectorAll('.support-category-item').forEach(btn => {
            const active = btn.dataset.supportCategory === categoryId;
            btn.classList.toggle('active', active);
            btn.classList.toggle('is-expanded', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.setAttribute('aria-expanded', active ? 'true' : 'false');
        });
        const secondaryWrap = document.getElementById('support-secondary-avatars-wrap');
        secondaryWrap?.classList.add('is-visible');
        updateSupportAvatarsVisibility(categoryId);
        updateSupportAvatarPendingDots(categoryId);
    }

    function clearSupportCategorySelection() {
        currentSupportCategoryId = null;
        setSupportSecondaryNavExpanded(false);
        document.querySelectorAll('.support-category-item').forEach(btn => {
            btn.classList.remove('active', 'is-expanded');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('aria-expanded', 'false');
        });
        const secondaryWrap = document.getElementById('support-secondary-avatars-wrap');
        secondaryWrap?.classList.remove('is-visible');
        resetSupportAvatarsVisibility();
        restoreSupportSecondaryAvatarFullNames();
    }

    function showSupportAvatarsNav() {
        const host = document.getElementById('top-nav-avatars-host');
        const secondaryWrap = document.getElementById('support-secondary-avatars-wrap');
        host?.classList.add('is-support-avatars-only');
        secondaryWrap?.classList.add('is-visible');
        resetSupportAvatarsVisibility();
        document.querySelectorAll('.avatar-item[data-avatar-type]').forEach(item => {
            const agentId = item.dataset.avatarType;
            const nameEl = item.querySelector('.avatar-name');
            const fullName = getSupportAgent(agentId)?.name || '';
            if (!nameEl || !fullName) return;
            nameEl.dataset.fullLabel = fullName;
            nameEl.textContent = fullName;
        });
        updateSupportAvatarPendingDots();
        updateDigitalAvatarsScrollButtons();
    }

    function hideSupportAvatarsNav() {
        const host = document.getElementById('top-nav-avatars-host');
        const secondaryWrap = document.getElementById('support-secondary-avatars-wrap');
        host?.classList.remove('is-support-avatars-only', 'is-secondary-expanded');
        secondaryWrap?.classList.remove('is-visible');
        document.getElementById('support-top-nav-stack')?.classList.remove('is-secondary-expanded');
    }

    function syncSupportTopNavLayout() {
        const host = document.getElementById('top-nav-avatars-host');
        const isSupport = document.body.classList.contains('support-tab-active');
        if (!host) return;

        host.classList.toggle('is-support-mode', isSupport);

        // 业务助理统一展示在中栏顶部
        hideSupportAvatarsNav();
        if (!isSupport) {
            restoreSupportSecondaryAvatarFullNames();
        }
        updateDigitalAvatarsScrollButtons();
    }

    function getAvatarNameFullLabel(nameEl) {
        if (!nameEl) return '';
        if (nameEl.dataset.fullLabel) return nameEl.dataset.fullLabel;
        const stored = nameEl.textContent.trim();
        nameEl.dataset.fullLabel = stored;
        return stored;
    }

    function stripAssistantSuffix(name) {
        const suffix = '助理';
        return name && name.endsWith(suffix) ? name.slice(0, -suffix.length) : (name || '');
    }

    function getSupportSecondaryAvatarDisplayName(nameEl) {
        return stripAssistantSuffix(getAvatarNameFullLabel(nameEl));
    }

    function applySupportSecondaryAvatarDisplayName(nameEl) {
        if (!nameEl) return;
        nameEl.textContent = getSupportSecondaryAvatarDisplayName(nameEl);
    }

    function restoreSupportSecondaryAvatarFullNames() {
        document.querySelectorAll('.avatar-item[data-avatar-type] .avatar-name').forEach(nameEl => {
            if (!nameEl.dataset.fullLabel) return;
            nameEl.textContent = nameEl.dataset.fullLabel;
        });
    }

    function restoreAvatarNameLabel(nameEl) {
        if (!nameEl) return;
        const full = getAvatarNameFullLabel(nameEl);
        nameEl.textContent = full;
    }

    function setAvatarImgTaskBadge(wrap, count) {
        if (!wrap) return;
        const badge = document.createElement('span');
        badge.className = 'avatar-task-badge';
        badge.textContent = String(count);
        badge.setAttribute('aria-label', count + '项今日待办');
        wrap.appendChild(badge);
    }

    function updateSupportAvatarPendingDots() {
        document.querySelectorAll('.avatar-item[data-avatar-type]').forEach(item => {
            const wrap = item.querySelector('.avatar-img-wrap');
            const nameEl = item.querySelector('.avatar-name');
            if (!wrap || !nameEl) return;

            wrap.querySelector('.avatar-pending-dot')?.remove();
            wrap.querySelector('.avatar-task-badge')?.remove();
            nameEl.querySelector('.avatar-task-badge')?.remove();

            restoreAvatarNameLabel(nameEl);
        });
    }

    window.updateSupportAvatarPendingDots = updateSupportAvatarPendingDots;

    function renderOrgPrompts(panel, agentId) {
        const listEl = panel.querySelector('#org-agent-prompts-list-org');
        const nameEl = panel.querySelector('#org-current-agent-name-org');
        if (!listEl) return;

        if (!agentId) {
            if (nameEl) nameEl.style.display = 'none';
            panel.querySelector('.org-agent-jump-bar')?.classList.remove('is-visible');
            listEl.className = 'org-agent-prompts-list org-prompts-stagger';
            listEl.innerHTML = orgDefaultPrompts.map(prompt => `
                <button type="button" class="org-prompt-chip">${prompt}</button>
            `).join('');
            listEl.querySelectorAll('.org-prompt-chip').forEach((btn, index) => {
                btn.onclick = () => useOrgPrompt(orgDefaultPrompts[index]);
            });
            return;
        }

        const agent = getOrgAgent(agentId);
        if (nameEl) {
            nameEl.style.display = '';
            nameEl.textContent = '去' + agent.name;
            nameEl.onclick = () => showOrgAgentJumpToast(agent.name);
        }
        panel.querySelector('.org-agent-jump-bar')?.classList.add('is-visible');

        listEl.className = 'org-agent-prompts-list';
        listEl.innerHTML = agent.prompts.map(prompt => `
            <button type="button" class="org-prompt-chip">${prompt}</button>
        `).join('');

        listEl.querySelectorAll('.org-prompt-chip').forEach((btn, index) => {
            btn.onclick = () => useOrgPrompt(agent.prompts[index]);
        });
    }

    function showOrgAgentJumpToast(agentName, options = {}) {
        document.querySelectorAll('.org-agent-jump-toast').forEach(el => el.remove());

        const toast = document.createElement('div');
        toast.className = 'org-agent-jump-toast';
        if (options.fullMessage) {
            toast.textContent = agentName;
        } else if (options.supportRedirect) {
            toast.textContent = `跳转至${agentName}处理`;
            toast.classList.add('support-agent-jump-toast');
            positionSupportAgentJumpToast(toast);
        } else if (options.switchMode) {
            toast.textContent = `跳转到${agentName}处理`;
        } else {
            toast.textContent = '点击跳转' + agentName;
        }
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    function positionSupportAgentJumpToast(toast) {
        const anchor = document.getElementById('center-agents-bar');
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        toast.style.top = `${Math.round(rect.top + rect.height * 0.42)}px`;
        toast.style.left = `${Math.round(rect.left + rect.width / 2)}px`;
        toast.style.transform = 'translate(-50%, -50%) translateY(6px)';
    }

    function showSupportAgentJumpToast(agentName) {
        showOrgAgentJumpToast(agentName, { supportRedirect: true });
    }

    function initOrgPanel(panel) {
        const state = getPanelState(panel);
        state.currentOrgAgent = null;
        state.chatModeActive = true;
        renderOrgPrompts(panel, null);
        updateTopAvatarActive(null);
        panel.dataset.initialized = 'true';
    }

    function selectOrgAgent(agentId) {
        const panel = document.getElementById('workbench-panel-org');
        if (!panel) return;

        if (getPanelKey() !== 'org') {
            switchWorkbenchTab('org');
        }

        const agent = getOrgAgent(agentId);
        const state = getPanelState(panel);
        state.currentOrgAgent = null;
        updateTopAvatarActive(null);
        showOrgAgentJumpToast(agent.name);
    }

    function resetOrgChatView(panel) {
        const p = panel || document.getElementById('workbench-panel-org');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (messagesEl) messagesEl.innerHTML = '';

        const input = getPanelEl('main-chat-input', p);
        if (input) input.value = '';

        updateOrgChatLayout(p);
    }

    function useOrgPrompt(promptText) {
        const panel = document.getElementById('workbench-panel-org');
        if (!panel) return;

        appendOrgChatMessage(promptText, 'user', panel);
        setTimeout(() => {
            const agentId = getPanelState(panel).currentOrgAgent;
            const reply = agentId
                ? getOrgAgentReply(promptText, agentId)
                : getOrgDefaultPromptReply(promptText);
            appendOrgChatMessage(reply, 'assistant', panel);
        }, 400);

        const input = getPanelEl('main-chat-input', panel);
        if (input) input.value = '';
    }

    function appendOrgChatMessage(text, role, panel) {
        const p = panel || document.getElementById('workbench-panel-org');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;

        const state = getPanelState(p);
        const agent = state.currentOrgAgent ? getOrgAgent(state.currentOrgAgent) : null;
        const row = document.createElement('div');
        row.className = role === 'user' ? 'chat-row chat-row-user' : 'chat-row chat-row-assistant org-assistant-row';

        if (role === 'user') {
            row.innerHTML = `<div class="chat-bubble chat-bubble-user">${escapeHtml(text)}</div>`;
        } else if (agent) {
            row.innerHTML = `
                <div class="chat-avatar org-chat-avatar"><img src="${agent.image}" alt="${agent.name}"></div>
                <div class="chat-bubble chat-bubble-assistant">${markdownToHtml(text)}</div>
            `;
        } else {
            row.innerHTML = `
                <div class="chat-avatar org-chat-avatar org-chat-avatar-default">📊</div>
                <div class="chat-bubble chat-bubble-assistant">${markdownToHtml(text)}</div>
            `;
        }

        messagesEl.appendChild(row);
        updateOrgChatLayout(p);
    }

    function updateOrgChatLayout(panel) {
        const p = panel || document.getElementById('workbench-panel-org');
        const workbench = p?.querySelector('.ai-workbench-section');
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!workbench || !messagesEl) return;
        workbench.classList.toggle('org-has-chat', messagesEl.children.length > 0);
        if (messagesEl.children.length > 0) {
            scrollWorkbenchChatToBottom(p);
        }
    }

    function getOrgAgentReply(message, agentId) {
        const agent = getOrgAgent(agentId);
        return agent.getReply(message);
    }

    function initWorkbenchPanel(panel) {
        const key = getPanelKey(panel);
        if (key === 'org') {
            initOrgPanel(panel);
            return;
        }
        if (key === 'support') {
            initSupportPanel(panel);
            return;
        }
        initIndicatorsForPanel(panel);
        deselectEmployeeInputAssistant(panel);
        syncEmployeeAssistantTags(panel);
        initEmployeeMainInputPromptBehavior(panel);
        initEmployeeAtMentionAssistantPicker(panel);
        panel.dataset.initialized = 'true';
    }

    function syncSidebarForRole(tabKey) {
        const isEmployee = tabKey === 'employee';
        const isSupport = tabKey === 'support';
        document.querySelectorAll('.employee-only-nav').forEach((el) => {
            el.style.display = isEmployee ? '' : 'none';
        });
        document.querySelectorAll('.support-only-nav').forEach((el) => {
            el.style.display = isSupport ? '' : 'none';
        });
        const mainHeader = document.getElementById('main-area-header');
        if (mainHeader) {
            mainHeader.style.display = (isEmployee || isSupport) ? '' : 'none';
        }
        if (typeof window.AppShell?.syncBreadcrumbForRole === 'function') {
            window.AppShell.syncBreadcrumbForRole(tabKey);
        }
        const workTips = document.getElementById('work-tips-section');
        if (workTips) workTips.style.display = tabKey === 'support' ? 'none' : '';
        if (isSupport) {
            renderSupportSidebarTasks();
            renderSupportSessionHistory();
            updateSupportSidebarNavCounts();
            const supportPanel = document.getElementById('workbench-panel-support');
            if (supportPanel && !supportPanel.querySelector('.support-input-agent-picker')) {
                const container = supportPanel.querySelector('.input-container');
                if (container) container.dataset.supportInputReady = 'false';
                initSupportInputAgentSelect(supportPanel);
            }
            syncSupportAssistantTags(supportPanel);
            requestAnimationFrame(() => syncSupportHomeLayout(supportPanel));
        }
    }

    function switchWorkbenchTab(tabKey) {
        currentWorkbenchRole = tabKey === 'support' ? 'support' : (tabKey === 'org' ? 'org' : 'employee');
        document.querySelectorAll('.workbench-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabKey);
        });
        document.body.classList.toggle('org-tab-active', tabKey === 'org');
        document.body.classList.toggle('support-tab-active', tabKey === 'support');
        syncSidebarForRole(tabKey);
        applyAllExceptionBoardScopes();
        syncSupportTopNavLayout();
        syncEmployeeChatModeLayout();
        updateNavTitleForRole(tabKey === 'support' ? 'support' : 'employee');

        if (tabKey === 'org') {
            const orgPanel = document.getElementById('workbench-panel-org');
            updateTopAvatarActive(getPanelState(orgPanel).currentOrgAgent || null);
        } else if (tabKey === 'support') {
            const supportPanel = document.getElementById('workbench-panel-support');
            updateTopAvatarActive(getPanelState(supportPanel).currentSupportAgent || null);
        } else {
            document.querySelectorAll('.avatar-item[data-avatar-type]').forEach(item => item.classList.remove('active'));
        }

        const panel = document.getElementById('workbench-panel-' + tabKey);
        if (panel && panel.dataset.initialized !== 'true') {
            initWorkbenchPanel(panel);
        }
        if (tabKey === 'support' || tabKey === 'employee') {
            window.syncCenterAgentsBar?.();
        }
        updateSupportAvatarPendingDots();
        updateDigitalAvatarsScrollButtons();
        requestAnimationFrame(updateDigitalAvatarsScrollButtons);
        if (panel && (tabKey === 'support' || tabKey === 'employee')) {
            refreshInputSkillPicker(panel);
        }
    }

    const OVERLAY_SCROLLBAR_SELECTOR = [
        '.ai-chat-view',
        '.ai-chat-messages',
        '.support-dialogue',
        '.org-workbench-scroll',
        '.employee-tasks-scroll',
        '.support-sidebar-tasks-scroll',
        '.module-page-scroll',
        '.manage-tab-panel',
        '.session-scroll',
        '.sidebar-tab-scroll',
        '.context-scroll',
        '.support-input-agent-menu',
        '.input-skill-menu',
        '.ai-cards-fan-row .ai-cards-fan'
    ].join(', ');

    function bindOverlayScrollbar(el) {
        if (!el || el.dataset.overlayScrollbarBound === 'true') return;
        el.dataset.overlayScrollbarBound = 'true';
        el.classList.add('overlay-scrollbar');
        let hideTimer;
        el.addEventListener('scroll', () => {
            el.classList.add('is-scrolling');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => el.classList.remove('is-scrolling'), 800);
        }, { passive: true });
    }

    function initOverlayScrollbars(root) {
        const scope = root || document;
        scope.querySelectorAll(OVERLAY_SCROLLBAR_SELECTOR).forEach(bindOverlayScrollbar);
    }

    window.bindOverlayScrollbar = bindOverlayScrollbar;
    window.initOverlayScrollbars = initOverlayScrollbars;

    function syncHomeCardsFanLayout(root) {
        const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
        scope.querySelectorAll('.ai-cards-fan-row .ai-cards-fan').forEach((fan) => {
            bindOverlayScrollbar(fan);
            const overflow = fan.scrollWidth > fan.clientWidth + 2;
            fan.classList.toggle('is-scroll-overflow', overflow);
            if (typeof ResizeObserver !== 'undefined' && fan.dataset.fanResizeObserved !== 'true') {
                fan.dataset.fanResizeObserved = 'true';
                const ro = new ResizeObserver(() => {
                    const nextOverflow = fan.scrollWidth > fan.clientWidth + 2;
                    fan.classList.toggle('is-scroll-overflow', nextOverflow);
                });
                ro.observe(fan);
            }
        });
    }

    window.syncHomeCardsFanLayout = syncHomeCardsFanLayout;

    function initWorkbenchTabs() {
        initChatPromptCardEvents();
        cloneWorkbenchPanels();
        initWorkbenchPanel(document.getElementById('workbench-panel-employee'));
        initOverlayScrollbars();
        syncHomeCardsFanLayout();
        window.addEventListener('resize', syncHomeCardsFanLayout);
    }

    // AI横向堆叠卡片功能
    const totalCards = 5;

    const aiAssistants = [
        {
            index: 0,
            name: '客户分析助手',
            emoji: '🧠',
            avatarClass: 'canmou',
            welcomeText: `**客户分析助手**\n\n从资产、行为、交易、合作记录等维度分析客户价值与风险，并结合客户情况推荐投行业务机会。\n\n**【我能帮你】**\n1. 客户综合分析 — 描述客户情况，输出业务机会推荐\n2. 操作指引与材料清单 — 获取步骤与尽调材料要求\n3. 对接支持人员 — 查询各业务投行专业人员\n\n请直接描述你的客户情况，我开始协助你。`
        },
        {
            index: 1,
            name: '业务分析助手',
            emoji: '🐎',
            avatarClass: 'tanma',
            welcomeText: `**业务分析助手**\n\n按业务分析模型（找目标）匹配业务类型与具体模型。`
        },
        {
            index: 2,
            name: '方案生成助手',
            emoji: '📋',
            avatarClass: 'junshi',
            type: 'solution'
        },
        {
            index: 3,
            name: '交叉验证助手',
            emoji: '🔍',
            avatarClass: 'jiaocha',
            welcomeText: `**交叉验证助手**\n\n按交叉验证模型（核异常）匹配业务与核验模型。`
        },
        {
            index: 4,
            name: '客户服务助手',
            emoji: '👁️',
            avatarClass: 'tianyan',
            welcomeText: `**客户服务助手**\n\n按客户服务模块匹配买方分析、信披判断、临时公告生成模型。`
        },
        {
            index: 5,
            name: '待办事项助手',
            emoji: '✅',
            avatarClass: 'shenpi',
            welcomeText: `**待办事项助手**\n\n查询审批进度、发起审批申请、催办提醒与流程跟踪。\n\n输入：审批事项、单号或待办描述。`
        },
        {
            index: 6,
            name: '通知公告助手',
            emoji: '📢',
            avatarClass: 'tongzhi',
            welcomeText: `**通知公告助手**\n\n起草通知公告、查询发布记录、格式校验与发布建议。\n\n输入：公告主题、受众或正文要点。`
        }
    ];

    const employeeExtraAssistants = [
        { id: 'shenpi', name: '待办事项助手', emoji: '✅', avatarClass: 'shenpi', chatIndex: 5 },
        { id: 'tongzhi', name: '通知公告助手', emoji: '📢', avatarClass: 'tongzhi', chatIndex: 6 }
    ];

    const WORKBENCH_ASSISTANT = {
        name: '工作台助手',
        emoji: '💼',
        avatarClass: 'workbench',
        welcomeText: `**工作台助手**\n\n我是你的工作台助手，可帮你协调各业务助手、处理通用工作台事务。\n\n如需专业分析，可点选下方助手标签切换；也可直接描述需求，我来协助你。`
    };

    const EMPLOYEE_ASSISTANT_AVATAR_NAME_MAP = {
        '工作台助手': 'workbench',
        '今日任务助手': 'tasks',
        '今日任务': 'tasks',
        '异常提醒助手': 'exceptions',
        '异常提醒': 'exceptions',
        '差旅分析助手': 'travel',
        '差旅分析': 'travel',
        '差旅分析汇总': 'travel',
        '待办事项助手': 'approval',
        '待办事项助手': 'approval',
        '通知公告助手': 'tongzhi',
        '客户分析助手': 'canmou',
        '业务分析助手': 'tanma',
        '方案生成助手': 'junshi',
        '交叉验证助手': 'jiaocha',
        '客户服务助手': 'tianyan',
        '自动驾驶大模型': 'autopilot'
    };

    const EMPLOYEE_ASSISTANT_AVATAR_CLASS_MAP = {
        workbench: 'workbench',
        canmou: 'canmou',
        tanma: 'tanma',
        junshi: 'junshi',
        jiaocha: 'jiaocha',
        tianyan: 'tianyan',
        shenpi: 'approval',
        tongzhi: 'tongzhi',
        'support-exceptions-avatar': 'exceptions',
        'support-exceptions-tag': 'exceptions',
        'support-daily-task-tag': 'tasks'
    };

    const EMPLOYEE_ASSISTANT_AVATAR_SVGS = {
        workbench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`,
        tasks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="m9 16 2 2 4-4"></path></svg>`,
        exceptions: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
        travel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>`,
        approval: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>`,
        tongzhi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`,
        canmou: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>`,
        tanma: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
        junshi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`,
        jiaocha: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
        tianyan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>`,
        'top-ib': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18"></path><path d="M5 22V9l7-5 7 5v13"></path><path d="M9 22v-6h6v6"></path><path d="M9 11h.01"></path><path d="M15 11h.01"></path></svg>`,
        'top-asset': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
        'top-retail': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
        'top-invest': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M7 15l3-3 3 2 5-6"></path><path d="M18 8h2v2"></path></svg>`,
        'top-sales': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8h13"></path><path d="M7 8l4-4"></path><path d="M7 8l4 4"></path><path d="M17 16H4"></path><path d="M17 16l-4-4"></path><path d="M17 16l-4 4"></path></svg>`,
        'top-institution': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18"></path><path d="M5 22V11"></path><path d="M9 22V11"></path><path d="M15 22V11"></path><path d="M19 22V11"></path><path d="M12 3 3 8h18z"></path></svg>`,
        'top-research': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><circle cx="11" cy="15" r="2.5"></circle><path d="m13 17 2 2"></path></svg>`,
        'top-credit': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
        autopilot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line><path d="M9 21h6"></path></svg>`
    };

    const EMPLOYEE_ASSISTANT_AVATAR_KEY_LABELS = {
        workbench: '工作台助手',
        tasks: '今日任务助手',
        exceptions: '异常提醒助手',
        travel: '差旅分析助手',
        approval: '待办事项助手',
        tongzhi: '通知公告助手',
        canmou: '客户分析助手',
        tanma: '业务分析助手',
        junshi: '方案生成助手',
        jiaocha: '交叉验证助手',
        tianyan: '客户服务助手',
        'top-ib': '投行业务助理',
        'top-asset': '资管业务助理',
        'top-retail': '零售业务助理',
        'top-invest': '投资业务助理',
        'top-sales': '销交业务助理',
        'top-institution': '机构业务助理',
        'top-research': '研究业务助理',
        'top-credit': '信用业务助理',
        autopilot: '自动驾驶大模型'
    };

    const TOP_BUSINESS_ASSISTANTS = [
        {
            id: 'ib',
            name: '投行业务助理',
            avatarKey: 'top-ib',
            image: 'images/Avatar1.png',
            welcomeText: `**投行业务助理**

可以处理投行业务一线事务：

- **业务准入** — 查询股权融资、债券发行、并购重组等业务的发行条件与准入标准
- **方案设计** — 生成融资方案草案、操作指引与尽调材料清单
- **协同对接** — 查找各业务线的投行支持人员

输入想了解的业务类型或客户情况，例如：
>>> 帮我查一下定增的发行条件和准入标准
>>> 为陈明精工设计一套融资扩产方案
>>> 定增业务需要准备哪些材料`
        },
        {
            id: 'asset',
            name: '资管业务助理',
            avatarKey: 'top-asset',
            image: 'images/Avatar2.png',
            welcomeText: `**资管业务助理**

可以处理资管业务日常工作：

- **产品查询** — 查询资管产品信息、净值走势与持仓明细
- **产品对比** — 对比不同产品的业绩、费率与风险等级
- **合规咨询** — 解答资管产品合规要求与销售适当性规则

查询需求，例如：
>>> 查询「华创稳健成长1号」最新净值与持仓
>>> 对比本季度权益类和固收类资管产品业绩
>>> 资管产品销售适当性有哪些要求`
        },
        {
            id: 'retail',
            name: '零售业务助理',
            avatarKey: 'top-retail',
            image: 'images/Avatar3.png',
            welcomeText: `**零售业务助理**

可以处理零售业务一线事务：

- **开户服务** — 个人/机构客户开户流程指引与材料清单
- **产品推荐** — 零售理财产品推荐与佣金费率查询
- **客户分析** — 客户分层管理与精准营销建议

输入客户情况或业务需求，例如：
>>> 个人客户开户需要哪些材料
>>> 查询陈明精工名下零售客户的资产规模
>>> 本月适合稳健型客户的理财产品有哪些`
        },
        {
            id: 'invest',
            name: '投资业务助理',
            avatarKey: 'top-invest',
            image: 'images/Avatar4.png',
            welcomeText: `**投资业务助理**

可以处理自营投资相关事务：

- **持仓查询** — 查询自营持仓明细、盈亏情况与集中度
- **风控核查** — 核查风控指标与投资限制达标情况
- **策略参考** — 提供投资策略参考与市场观点汇总

查询需求，例如：
>>> 查询当前自营权益持仓前十大
>>> 核查单票集中度是否超限
>>> 汇总本周固收投资策略观点`
        },
        {
            id: 'sales',
            name: '销交业务助理',
            avatarKey: 'top-sales',
            image: 'images/Avatar5.png',
            welcomeText: `**销交业务助理**

可以处理销售交易一线事务：

- **委托交易** — 客户委托下单指引与成交查询
- **费用计算** — 交易佣金、印花税等费用计算与规则说明
- **交易分析** — 客户交易行为分析与活跃度统计

输入具体需求，例如：
>>> 查询陈明精工今日委托与成交明细
>>> 计算这笔大宗交易的综合费用
>>> 梳理本季度高净值客户的交易活跃度`
        },
        {
            id: 'institution',
            name: '机构业务助理',
            avatarKey: 'top-institution',
            image: 'images/Avatar6.png',
            welcomeText: `**机构业务助理**

可以处理机构客户服务事务：

- **客户画像** — 机构客户信息、需求与合作记录查询
- **产品定制** — 定制产品询价、方案沟通与路演安排
- **交易服务** — 机构交易服务流程与结算指引

请描述机构客户情况或需求，例如：
>>> 查询「测试科技」的机构客户画像
>>> 安排一场定增路演并通知相关客户
>>> 机构客户大宗交易结算流程是什么`
        },
        {
            id: 'research',
            name: '研究业务助理',
            avatarKey: 'top-research',
            image: 'images/Avatar8.png',
            welcomeText: `**研究业务助理**

可以获取研究支持：

- **研报查询** — 行业研究观点与公司分析报告检索
- **观点汇总** — 核心观点、投资评级与目标价变动汇总
- **专题研究** — 按主题或赛道汇总研究成果

请告诉我研究方向或标的，例如：
>>> 查询陈明精工最新研报观点与评级
>>> 汇总本月半导体行业研报核心观点
>>> 近期有哪些行业被上调评级`
        },
        {
            id: 'credit',
            name: '信用业务助理',
            avatarKey: 'top-credit',
            image: 'images/Avatar9.png',
            welcomeText: `**信用业务助理**

可以处理信用业务一线事务：

- **两融服务** — 融资融券账户开通、维持担保比例查询与展期指引
- **股票质押** — 股票质押回购流程、折算率与利率查询
- **风险提示** — 信用业务风险预警与平仓线提醒

输入业务需求，例如：
>>> 查询陈明精工的维持担保比例
>>> 股票质押回购需要准备哪些材料
>>> 哪些客户维持担保比例低于预警线`
        }
    ];

    function getTopBusinessAssistant(id) {
        return TOP_BUSINESS_ASSISTANTS.find((item) => item.id === id) || null;
    }

    function getTopBusinessAssistantReply(message, assistant) {
        if (!assistant) return markdownToHtml('已收到需求，请稍候。');
        return `**${assistant.name}**\n\n收到需求：「${message}」。\n\n已调用相关业务能力处理，完整业务系统对接即将上线。可继续补充具体场景或客户信息，以获取更精准的指引。`;
    }

    function getTopBusinessAssistantImage(avatarKey) {
        if (typeof avatarKey !== 'string' || avatarKey.indexOf('top-') !== 0) return null;
        const assistant = getTopBusinessAssistant(avatarKey.slice(4));
        return assistant?.image || null;
    }

    const TOP_SUPPORT_ASSISTANTS = [
        {
            id: 'ib',
            name: '投行业务助理',
            avatarKey: 'top-ib',
            image: 'images/Avatar1.png',
            welcomeText: `**投行业务助理**

面向投行业务中后台管理支持，协助一线业务推进：

- **项目审核** — 股权融资、债券发行、并购重组项目材料复核与准入把关
- **流程管理** — 项目立项、内核、申报进度跟踪与节点提醒
- **协同支持** — 对接一线投行人员，提供尽调清单、方案模板与合规要点

输入需支持的项目或事项，例如：
>>> 复核陈明精工定增项目的申报材料
>>> 查询本月在审投行项目的进度节点
>>> 并购重组项目内核需要关注哪些合规要点`
        },
        {
            id: 'asset',
            name: '资管业务助理',
            avatarKey: 'top-asset',
            image: 'images/Avatar2.png',
            welcomeText: `**资管业务助理**

面向资管业务中后台管理支持，保障产品规范运作：

- **产品备案** — 资管产品设立、变更、备案材料审核与归档
- **估值核算** — 产品净值核对、估值方法审查与异常波动排查
- **合规监控** — 投资范围、比例限制与适当性管理合规核查

输入需处理的产品或事项，例如：
>>> 审核本月新设资管产品的备案材料
>>> 核对「华创稳健成长1号」近期净值数据
>>> 资管产品投资比例限制合规核查要点`
        },
        {
            id: 'retail',
            name: '零售业务助理',
            avatarKey: 'top-retail',
            image: 'images/Avatar3.png',
            welcomeText: `**零售业务助理**

面向零售业务中后台管理支持，赋能一线展业：

- **开户审核** — 个人/机构客户开户资料审核与风险测评复核
- **产品上架** — 零售理财产品上架审核、费率配置与适当性匹配
- **客户管理** — 客户分层标准维护、营销活动配置与数据统计

输入需支持的事项，例如：
>>> 复核本周待审核的机构客户开户资料
>>> 查询本月新上架零售理财产品清单
>>> 稳健型客户适当性匹配规则核查`
        },
        {
            id: 'invest',
            name: '投资业务助理',
            avatarKey: 'top-invest',
            image: 'images/Avatar4.png',
            welcomeText: `**投资业务助理**

面向自营投资中后台管理支持，守住风控底线：

- **风控监控** — 自营持仓集中度、比例限制与止损线实时监控
- **持仓核对** — 自营持仓明细核对、盈亏复盘与异常交易排查
- **合规报告** — 风控指标达标情况统计与监管报表生成

输入需监控或核查的事项，例如：
>>> 核查当前自营权益持仓单票集中度
>>> 复核本月自营投资风控指标达标情况
>>> 排查本周自营异常交易记录`
        },
        {
            id: 'sales',
            name: '销交业务助理',
            avatarKey: 'top-sales',
            image: 'images/Avatar5.png',
            welcomeText: `**销交业务助理**

面向销售交易中后台管理支持，保障交易顺畅：

- **清算交收** — 客户交易清算核对、交收异常处理与对账
- **费用管理** — 佣金费率配置、印花税核算与费用稽核
- **交易监控** — 客户交易行为监控、异常委托识别与合规预警

输入需处理的事项，例如：
>>> 核对今日客户交易清算数据
>>> 稽核本月大宗交易佣金费率
>>> 排查本周异常委托交易记录`
        },
        {
            id: 'institution',
            name: '机构业务助理',
            avatarKey: 'top-institution',
            image: 'images/Avatar6.png',
            welcomeText: `**机构业务助理**

面向机构业务中后台管理支持，协同服务一线：

- **客户档案** — 机构客户信息维护、需求登记与合作记录管理
- **产品协同** — 定制产品需求对接、询价记录与路演安排支持
- **服务支持** — 机构交易结算流程跟进与问题协调处理

输入需支持的事项，例如：
>>> 维护「测试科技」机构客户档案信息
>>> 登记本月机构客户定制产品询价记录
>>> 跟进机构客户大宗交易结算进度`
        },
        {
            id: 'research',
            name: '研究业务助理',
            avatarKey: 'top-research',
            image: 'images/Avatar8.png',
            welcomeText: `**研究业务助理**

面向研究中后台管理支持，保障研报合规输出：

- **研报管理** — 研报发布审核、合规审查与归档管理
- **观点汇总** — 核心观点、评级变动与目标价调整统计
- **合规核查** — 研报信息披露、利益冲突与静默期合规检查

输入需处理的事项，例如：
>>> 审核本周待发布的研究报告
>>> 汇总本月行业评级变动情况
>>> 核查研报静默期合规执行情况`
        },
        {
            id: 'credit',
            name: '信用业务助理',
            avatarKey: 'top-credit',
            image: 'images/Avatar9.png',
            welcomeText: `**信用业务助理**

面向信用业务中后台管理支持，严控业务风险：

- **担保品管理** — 维持担保比例监控、折算率调整与担保品核查
- **风险预警** — 两融、股票质押风险客户识别与平仓线预警
- **流程审核** — 信用业务账户开通审核、展期材料复核与台账管理

输入需监控或审核的事项，例如：
>>> 监控当前维持担保比例低于预警线的客户
>>> 复核本周两融账户展期申请材料
>>> 核查股票质押回购担保品折算率`
        }
    ];

    function getTopSupportAssistant(id) {
        return TOP_SUPPORT_ASSISTANTS.find((item) => item.id === id) || null;
    }

    function getTopSupportAssistantReply(message, assistant) {
        if (!assistant) return markdownToHtml('已收到需求，请稍候。');
        return `**${assistant.name}**\n\n收到需求：「${message}」。\n\n已调用相关中后台管理支持能力处理，完整业务系统对接即将上线。可继续补充具体项目或事项信息，以获取更精准的指引。`;
    }

    const EMPLOYEE_ASSISTANT_INPUT_PROMPTS = {
        canmou: '分析我名下的【陈明精工这家公司】',
        tanma: '帮我分析本季度投行业务的目标完成进度',
        junshi: '为陈明精工生成一套融资扩产方案草案',
        jiaocha: '核查单笔银证转入≥100万是否存在异常',
        tianyan: '帮我梳理陈明精工待跟进的客户服务事项',
        shenpi: '查询我名下待审批的进度',
        tongzhi: '帮我看看公司最新的通知公告和正式发文',
        hegui: '帮我审查近期业务的合规风险',
        shuju: '帮我洞察最新的经营数据',
        xuqiu: '帮我识别客户的合作意图',
        'skill-customer-portrait': '分析我名下的【陈明精工这家公司】',
        'skill-business-match': '帮我匹配适合陈明精工的业务分析模型',
        'skill-solution-gen': '为陈明精工生成一套融资扩产方案草案',
        'skill-cross-verify': '核查单笔银证转入≥100万是否存在异常',
        'skill-service-reply': '帮我梳理陈明精工待跟进的客户服务事项',
        'skill-travel-audit': '帮我分析近期差旅报销的合规情况',
        'skill-expense-check': '帮我核查费用报销是否存在异常',
        'skill-kpi-forecast': '帮我预测本季度的绩效收入',
        'skill-doc-summary': '帮我摘要最新的业务文档'
    };

    function isApprovalProgressPrompt(message) {
        const text = (message || '').trim();
        if (!text) return false;
        if (text === EMPLOYEE_ASSISTANT_INPUT_PROMPTS.shenpi) return true;
        return /查询.*待审批.*进度|待审批.*进度/.test(text);
    }

    function isNoticeDocumentSummaryPrompt(message) {
        const text = (message || '').trim();
        if (!text) return false;
        if (text === EMPLOYEE_ASSISTANT_INPUT_PROMPTS.tongzhi) return true;
        return /通知公告/.test(text) && /正式发文/.test(text);
    }

    function buildApprovalProgressReply(message) {
        return `**待办事项助手**

## 名下待审批事项（3）

| 事项 | 当前节点 | 预计完成 |
|------|----------|----------|
| 机构客户「测试科技」开户绿色通道申请 | 运营部加急处理 | 今日内 |
| 陈明精工融资扩产配套材料提交 | 部门负责人审批 | 1 个工作日内 |
| 零售团队差异化费率方案 | 合规复核 | 2 个工作日内 |

如需催办某一事项，可直接告知事项名称。`;
    }

    function buildNoticeDocumentSummaryReply(message) {
        return `**通知公告助手**

## 最新通知公告

- **《关于2026年二季度投行业务协同专项安排的通知》**（6月20日发布）：明确投行业务、研究、销交三条线协同分工，要求 T+1 响应客户经理协同请求。
- **《员工工作台功能升级说明》**（6月18日发布）：上线助手标签联动、客户分析引导对话等功能，请各团队于6月25日前完成试用反馈。

## 最新正式发文

- **《投行业务材料报送管理办法（2026修订）》**（投行〔2026〕12号）：更新尽调材料清单、电子归档路径及报送时限，6月24日起执行。
- **《业务支持中心异常提醒处置指引》**（运管〔2026〕08号）：明确异常分级标准与闭环时限，要求一线于收到提醒后2个工作日内反馈处置进展。

如需查看全文，可继续说明。`;
    }

    function buildApprovalContextBundle() {
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        return {
            models: [{
                name: '审批进度查询模型',
                category: '审批协同 / 进度跟踪'
            }],
            customers: [],
            outputs: [{
                title: '名下待审批事项进度清单',
                type: 'PDF',
                fileKind: 'pdf',
                fileName: '待审批事项进度清单.pdf',
                modifiedAt: ts,
                sizeBytes: 245760,
                content: '汇总测试科技开户绿色通道、陈明精工融资扩产配套材料、零售差异化费率方案等3项待审批事项的当前节点与预计完成时间。',
                downloadText: '汇总测试科技开户绿色通道、陈明精工融资扩产配套材料、零售差异化费率方案等3项待审批事项的当前节点与预计完成时间。'
            }]
        };
    }

    function buildNoticeDocumentContextBundle() {
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        return {
            models: [{
                name: '通知公告与正式发文检索模型',
                category: '信息发布 / 公告检索'
            }],
            customers: [],
            outputs: [
                {
                    title: '公司最新通知公告摘要',
                    type: 'PDF',
                    fileKind: 'pdf',
                    fileName: '公司最新通知公告摘要.pdf',
                    modifiedAt: ts,
                    sizeBytes: 184320,
                    content: '包含《2026年二季度投行业务协同专项安排的通知》《员工工作台功能升级说明》等最新通知公告要点摘要。',
                    downloadText: '包含《2026年二季度投行业务协同专项安排的通知》《员工工作台功能升级说明》等最新通知公告要点摘要。'
                },
                {
                    title: '公司最新正式发文摘要',
                    type: 'PDF',
                    fileKind: 'pdf',
                    fileName: '公司最新正式发文摘要.pdf',
                    modifiedAt: ts,
                    sizeBytes: 204800,
                    content: '包含《投行业务材料报送管理办法（2026修订）》《业务支持中心异常提醒处置指引》等最新正式发文要点摘要。',
                    downloadText: '包含《投行业务材料报送管理办法（2026修订）》《业务支持中心异常提醒处置指引》等最新正式发文要点摘要。'
                }
            ]
        };
    }

    function resolveEmployeeAssistantAvatarClass(index, panel) {
        const agents = window.getInstalledEmployeeAssistantsForHome?.() || [];
        const agent = agents.find((item) => item.listIndex === index);
        if (agent?.avatarClass) return agent.avatarClass;
        const assistant = aiAssistants.find((item) => item.index === index);
        return assistant?.avatarClass || '';
    }

    function getEmployeeAssistantInputPrompt(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (!p || getPanelKey(p) !== 'employee') return '';
        if (!isWorkbenchInputHomePage(p)) return '';
        const state = getPanelState(p);
        if (state.currentInputSkillId) {
            return EMPLOYEE_ASSISTANT_INPUT_PROMPTS[state.currentInputSkillId] || '';
        }
        if (state.currentTopBusinessAssistant) {
            return TOP_BIZ_INPUT_PROMPTS[state.currentTopBusinessAssistant] || '';
        }
        if (state.currentCatalogAssistant) {
            const id = state.currentCatalogAssistant.id || '';
            const avatarClass = state.currentCatalogAssistant.avatarClass || '';
            return EMPLOYEE_ASSISTANT_INPUT_PROMPTS[id]
                || EMPLOYEE_ASSISTANT_INPUT_PROMPTS[avatarClass]
                || '';
        }
        if (state.currentExtraAssistantId) {
            return EMPLOYEE_ASSISTANT_INPUT_PROMPTS[state.currentExtraAssistantId] || '';
        }
        if (typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0) {
            const avatarClass = resolveEmployeeAssistantAvatarClass(state.currentCardIndex, p);
            if (avatarClass && EMPLOYEE_ASSISTANT_INPUT_PROMPTS[avatarClass]) {
                return EMPLOYEE_ASSISTANT_INPUT_PROMPTS[avatarClass];
            }
        }
        return '';
    }

    function updateEmployeeInputPlaceholder(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const input = getPanelEl('main-chat-input', p);
        if (!input) return;

        // 输入框内以 chip 显示 @xxx 时，将预设提示词作为 placeholder 展示（浅灰色）
        const state = getPanelState(p);
        if (state.currentInputSkillId
            || state.currentTopBusinessAssistant
            || state.currentExtraAssistantId
            || state.currentCatalogAssistant
            || (typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0)) {
            const chipPrompt = getEmployeeAssistantInputPrompt(p);
            const prevChipPrompt = input.dataset.suggestedPrompt || '';
            if (prevChipPrompt && input.value === prevChipPrompt) {
                input.value = '';
                syncMainSendButtonState(p);
            }
            input.dataset.suggestedPrompt = chipPrompt;
            input.placeholder = chipPrompt;
            refreshInputMentionChip(p);
            return;
        }

        if (!isWorkbenchInputHomePage(p)) {
            input.dataset.suggestedPrompt = '';
            input.placeholder = getChatModeInputPlaceholder(p);
            refreshInputMentionChip(p);
            return;
        }

        const prevPrompt = input.dataset.suggestedPrompt || '';
        const prompt = getEmployeeAssistantInputPrompt(p);
        if (!input.value.trim() || (prevPrompt && input.value === prevPrompt)) {
            input.value = '';
            syncMainSendButtonState(p);
        }
        input.placeholder = prompt || getMainInputDefaultPlaceholder(p);
        input.dataset.suggestedPrompt = prompt;
        refreshInputMentionChip(p);
    }

    function fillEmployeeMainInputPrompt(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        if (!isWorkbenchInputHomePage(p)) return;
        const input = getPanelEl('main-chat-input', p);
        const prompt = getEmployeeAssistantInputPrompt(p);
        if (!input || !prompt || input.value.trim()) return;
        input.value = prompt;
        autoResizeTextarea(input);
        syncMainSendButtonState(p);
    }

    function initEmployeeMainInputPromptBehavior(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const input = getPanelEl('main-chat-input', p);
        if (!input || input.dataset.employeePromptBound === 'true') return;
        input.dataset.employeePromptBound = 'true';
        input.addEventListener('focus', () => fillEmployeeMainInputPrompt(p));
        input.addEventListener('click', () => fillEmployeeMainInputPrompt(p));
    }

    function isWorkbenchAssistantMode(state) {
        if (!state || state.exceptionChatActive) return false;
        if (state.currentExtraAssistantId) return false;
        if (state.currentTopBusinessAssistant) return false;
        return !(typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0);
    }

    function isEmployeeInputAssistantSelected(state) {
        if (!state || state.exceptionChatActive) return false;
        if (state.currentExtraAssistantId) return true;
        return typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0;
    }

    function getEmployeeAssistantAvatarKey(source) {
        if (!source) return 'workbench';
        if (typeof source === 'string') {
            const key = EMPLOYEE_ASSISTANT_AVATAR_NAME_MAP[source.trim()];
            if (key) return key;
            return EMPLOYEE_ASSISTANT_AVATAR_CLASS_MAP[source] || 'workbench';
        }
        if (source.assistantAvatarKey) return source.assistantAvatarKey;
        if (source.avatarKey) return source.avatarKey;
        if (source.id === SUPPORT_INPUT_AGENT_DAILY_TASK) return 'tasks';
        if (source.id === SUPPORT_INPUT_AGENT_EXCEPTIONS) return 'exceptions';
        if (source.avatarClass) {
            return EMPLOYEE_ASSISTANT_AVATAR_CLASS_MAP[source.avatarClass] || source.avatarClass;
        }
        if (source.name) {
            const byName = EMPLOYEE_ASSISTANT_AVATAR_NAME_MAP[source.name.trim()];
            if (byName) return byName;
        }
        return 'workbench';
    }

    function getEmployeeAssistantDisplayName(source, fallback) {
        if (!source) return fallback || WORKBENCH_ASSISTANT.name;
        if (typeof source === 'string') return source;
        return source.name || fallback || WORKBENCH_ASSISTANT.name;
    }

    function buildEmployeeAssistantIconSvg(avatarKey) {
        const icons = EMPLOYEE_ASSISTANT_AVATAR_SVGS;
        return icons[avatarKey] || icons.workbench;
    }

    function buildEmployeeBotAvatarHtml(name, avatarKey) {
        const key = avatarKey || 'workbench';
        const label = name || WORKBENCH_ASSISTANT.name;
        return `<div class="chat-avatar employee-chat-avatar employee-bot-avatar employee-bot-avatar--${escapeHtmlAttr(key)}" title="${escapeHtmlText(label)}">
            <span class="employee-bot-avatar-icon" aria-hidden="true">
                ${buildEmployeeAssistantIconSvg(key)}
            </span>
        </div>`;
    }

    function buildEmployeeAssistantInlineIconHtml(source, variant) {
        const avatarKey = getEmployeeAssistantAvatarKey(source);
        const variantClass = variant === 'mention'
            ? 'employee-inline-assistant-icon--mention'
            : 'employee-inline-assistant-icon--tag';
        return `<span class="employee-inline-assistant-icon ${variantClass} employee-inline-assistant-icon--${escapeHtmlAttr(avatarKey)}" aria-hidden="true">${buildEmployeeAssistantIconSvg(avatarKey)}</span>`;
    }

    function buildWorkbenchChatAvatarHtml() {
        return buildEmployeeBotAvatarHtml(WORKBENCH_ASSISTANT.name, 'workbench');
    }

    function parseAssistantTitleFromMarkdown(text) {
        const match = String(text || '').trim().match(/^\*\*(.+?)\*\*/);
        return match ? match[1].trim() : '';
    }

    function parseAssistantTitleFromHtml(text) {
        const match = String(text || '').match(/class="chat-md-h2"[^>]*>([^<]+)</);
        if (!match) return '';
        return match[1].replace(/（.*?）/g, '').replace(/\(\d+\)/g, '').trim();
    }

    function resolveAssistantTitleFromMessage(text) {
        return parseAssistantTitleFromMarkdown(text) || parseAssistantTitleFromHtml(text);
    }

    function buildAvatarHtmlFromAiAssistant(assistant) {
        if (!assistant) return buildWorkbenchChatAvatarHtml();
        return buildEmployeeBotAvatarHtml(
            assistant.name,
            getEmployeeAssistantAvatarKey(assistant)
        );
    }

    function buildAvatarHtmlFromExtraAssistant(extra) {
        if (!extra) return buildWorkbenchChatAvatarHtml();
        return buildEmployeeBotAvatarHtml(
            extra.name,
            getEmployeeAssistantAvatarKey(extra)
        );
    }

    function buildEmployeeUserAvatarHtml(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const name = getLoggedInEmployeeProfile?.().name || '';
        const label = (name || 'W').trim();
        const initial = label ? label.charAt(0) : 'W';
        return `<div class="chat-avatar employee-chat-avatar employee-user-avatar" title="${escapeHtmlText(label)}"><span>${escapeHtmlText(initial)}</span></div>`;
    }

    function getAssistantDisplayNameFromTitle(titleName) {
        const title = String(titleName || '').trim();
        if (!title) return '助手';
        if (title.endsWith('助手')) return title;
        const withSuffix = `${title}助手`;
        if (EMPLOYEE_ASSISTANT_AVATAR_NAME_MAP[withSuffix]) return withSuffix;
        return EMPLOYEE_ASSISTANT_AVATAR_KEY_LABELS[EMPLOYEE_ASSISTANT_AVATAR_NAME_MAP[title]] || title;
    }

    function resolveEmployeeMessageAvatarMeta(options = {}, text = '', panel) {
        if (options.assistantAvatarKey) {
            return {
                avatarKey: options.assistantAvatarKey,
                name: options.assistantDisplayName
                    || EMPLOYEE_ASSISTANT_AVATAR_KEY_LABELS[options.assistantAvatarKey]
                    || '助手'
            };
        }

        if (options.agentId) {
            if (options.agentId === SUPPORT_INPUT_AGENT_EXCEPTIONS) {
                return { avatarKey: 'exceptions', name: '异常提醒助手' };
            }
            const agent = supportAgents.find((a) => a.id === options.agentId);
            if (agent) {
                return {
                    avatarKey: `support-${agent.id}`,
                    name: agent.name
                };
            }
        }

        if (options.extraAssistantId) {
            const extra = getExtraAssistantById(options.extraAssistantId);
            if (extra) {
                return {
                    avatarKey: getEmployeeAssistantAvatarKey(extra),
                    name: extra.name
                };
            }
        }

        const titleName = resolveAssistantTitleFromMessage(text);
        if (titleName) {
            if (titleName === WORKBENCH_ASSISTANT.name || isWorkbenchAssistantReplyText(text)) {
                return { avatarKey: 'workbench', name: WORKBENCH_ASSISTANT.name };
            }
            const mappedKey = EMPLOYEE_ASSISTANT_AVATAR_NAME_MAP[titleName];
            if (mappedKey) {
                return {
                    avatarKey: mappedKey,
                    name: getAssistantDisplayNameFromTitle(titleName)
                };
            }
            const extraByName = employeeExtraAssistants.find((item) => item.name === titleName);
            if (extraByName) {
                return {
                    avatarKey: getEmployeeAssistantAvatarKey(extraByName),
                    name: extraByName.name
                };
            }
            const assistantByName = aiAssistants.find((item) => item.name === titleName);
            if (assistantByName) {
                return {
                    avatarKey: getEmployeeAssistantAvatarKey(assistantByName),
                    name: assistantByName.name
                };
            }
        }

        if (typeof options.chatIndex === 'number' && aiAssistants[options.chatIndex]) {
            const assistant = aiAssistants[options.chatIndex];
            return {
                avatarKey: getEmployeeAssistantAvatarKey(assistant),
                name: assistant.name
            };
        }

        if (typeof options.assistantIndex === 'number') {
            const chatIndex = options.assistantIndex;
            if (aiAssistants[chatIndex]) {
                const assistant = aiAssistants[chatIndex];
                return {
                    avatarKey: getEmployeeAssistantAvatarKey(assistant),
                    name: assistant.name
                };
            }
            const homeAgent = getEmployeeHomeAssistant(chatIndex, panel);
            if (homeAgent) {
                return {
                    avatarKey: getEmployeeAssistantAvatarKey(homeAgent),
                    name: homeAgent.name
                };
            }
        }

        if (options.workbenchAssistant) {
            return { avatarKey: 'workbench', name: WORKBENCH_ASSISTANT.name };
        }

        if (!options.skipPersist) {
            const state = getPanelState(panel);
            if (isWorkbenchAssistantMode(state)) {
                return { avatarKey: 'workbench', name: WORKBENCH_ASSISTANT.name };
            }
            if (state.currentExtraAssistantId) {
                const extra = getExtraAssistantById(state.currentExtraAssistantId);
                if (extra) {
                    return {
                        avatarKey: getEmployeeAssistantAvatarKey(extra),
                        name: extra.name
                    };
                }
            }
            if (typeof state.currentCardIndex === 'number') {
                const assistant = getEmployeeAssistant(state.currentCardIndex, panel);
                return {
                    avatarKey: getEmployeeAssistantAvatarKey(assistant),
                    name: assistant.name
                };
            }
        }

        return { avatarKey: 'workbench', name: WORKBENCH_ASSISTANT.name };
    }

    function buildEmployeeMessageAvatarHtml(options = {}, text = '', panel) {
        if (options.agentId && options.agentId !== SUPPORT_INPUT_AGENT_EXCEPTIONS) {
            const agent = getSupportAgent(options.agentId);
            if (agent && agent.image) {
                return `<div class="chat-avatar employee-chat-avatar employee-bot-avatar support-chat-avatar"><img src="${escapeHtml(agent.image)}" alt="${escapeHtmlText(agent.name || '')}"></div>`;
            }
        }
        const meta = resolveEmployeeMessageAvatarMeta(options, text, panel);
        const topImage = getTopBusinessAssistantImage(meta.avatarKey);
        if (topImage) {
            return `<div class="chat-avatar employee-chat-avatar employee-bot-avatar"><img src="${escapeHtml(topImage)}" alt="${escapeHtmlText(meta.name || '')}"></div>`;
        }
        return buildEmployeeBotAvatarHtml(meta.name, meta.avatarKey);
    }

    function buildEmployeeChatPersistMeta(role, options = {}, text = '', panel) {
        if (role !== 'assistant') {
            return {};
        }
        if (options.agentId) {
            const persist = {
                agentId: options.agentId || null
            };
            if (options.assistantAvatarKey) {
                persist.assistantAvatarKey = options.assistantAvatarKey;
                if (options.assistantDisplayName) {
                    persist.assistantDisplayName = options.assistantDisplayName;
                }
            }
            return persist;
        }

        const meta = resolveEmployeeMessageAvatarMeta(options, text, panel);
        const persist = {};

        if (meta.avatarKey === 'workbench' && options.workbenchAssistant) {
            persist.workbenchAssistant = true;
        }
        if (meta.avatarKey && meta.avatarKey !== 'workbench') {
            persist.assistantAvatarKey = meta.avatarKey;
            if (meta.name) persist.assistantDisplayName = meta.name;
        }
        if (options.extraAssistantId) {
            const extra = getExtraAssistantById(options.extraAssistantId);
            if (extra) {
                persist.extraAssistantId = extra.id;
                persist.chatIndex = extra.chatIndex;
            }
        } else if (typeof options.chatIndex === 'number') {
            persist.chatIndex = options.chatIndex;
            persist.assistantIndex = options.assistantIndex ?? options.chatIndex;
        } else if (typeof options.assistantIndex === 'number') {
            persist.chatIndex = options.assistantIndex;
            persist.assistantIndex = options.assistantIndex;
        }

        return persist;
    }

    function getWorkbenchAssistantReply(message) {
        const routedIndex = resolveEmployeeAssistantIndexFromMessage(message);
        const routedName = aiAssistants[routedIndex]?.name;
        if (routedName && shouldShowEmployeeRoutingToast(message)) {
            return `**工作台助手**\n\n你的问题更适合由「${routedName}」处理。可点选下方对应助手标签切换。\n\n关于「${message}」，我已记录需求，请补充更多背景信息以便跟进。`;
        }
        return `**工作台助手**\n\n关于「${message}」，我已收到你的需求。\n\n如需专业分析，可选下方助手标签；也可继续描述，我帮你协调处理。`;
    }

    function isWorkbenchAssistantReplyText(text) {
        return typeof text === 'string' && /^\*\*工作台助手\*\*/.test(text.trim());
    }

    function isWorkbenchAssistantSession(session) {
        if (!session) return false;
        if (session.workbenchAssistant === true) return true;
        const messages = Array.isArray(session.messages) ? session.messages : [];
        return messages.some((msg) => msg?.workbenchAssistant || isWorkbenchAssistantReplyText(msg?.text));
    }

    function appendWorkbenchAssistantWelcome(panel, options = {}) {
        appendChatMessage(markdownToHtml(WORKBENCH_ASSISTANT.welcomeText), 'assistant', panel, {
            html: true,
            workbenchAssistant: true,
            skipPersist: !!options.skipPersist
        });
    }

    function getExtraAssistantById(id) {
        return employeeExtraAssistants.find((item) => item.id === id) || null;
    }

    function resolveEmployeeChatIndexForReply(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        if (state.currentExtraAssistantId) {
            return getExtraAssistantById(state.currentExtraAssistantId)?.chatIndex ?? 0;
        }
        return resolveEmployeeChatIndex(state.currentCardIndex ?? 0, p);
    }

    function getExtraAssistantWelcomeHtml(chatIndex) {
        const assistant = aiAssistants[chatIndex];
        if (!assistant?.welcomeText) {
            return markdownToHtml(`**${assistant?.name || '助手'}**\n\n说明当前能力与操作入口。`);
        }
        return markdownToHtml(assistant.welcomeText);
    }

    function markdownToHtml(text) {
        if (!text) return '';
        const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalizedText.split('\n');
        let html = '';
        let inList = false;
        let inOrderedList = false;
        let inTable = false;

        const closeLists = () => {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (inOrderedList) {
                html += '</ol>';
                inOrderedList = false;
            }
        };

        lines.forEach((line) => {
            const trimmed = line.trim();

            if (trimmed.match(/^\|.*\|$/)) {
                closeLists();
                if (trimmed.match(/^\|[\s\-:|]+\|$/)) return;
                if (!inTable) {
                    html += '<table class="chat-md-table"><thead><tr>';
                    inTable = 'thead';
                } else if (inTable === 'thead') {
                    html += '</tr></thead><tbody><tr>';
                    inTable = 'tbody';
                } else {
                    html += '<tr>';
                }
                const cells = trimmed.split('|').filter((c) => c.trim() !== '');
                const tag = inTable === 'thead' ? 'th' : 'td';
                cells.forEach((c) => {
                    const content = c.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    html += `<${tag}>${content}</${tag}>`;
                });
                if (inTable !== 'thead') html += '</tr>';
                return;
            }
            if (inTable) {
                html += '</tbody></table>';
                inTable = false;
            }

            if (trimmed.startsWith('# ')) {
                closeLists();
                const content = trimmed.replace(/^#\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p class="chat-md-h1">${content}</p>`;
            } else if (trimmed.startsWith('## ')) {
                closeLists();
                const content = trimmed.replace(/^##\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p class="chat-md-h2">${content}</p>`;
            } else if (trimmed.startsWith('### ')) {
                closeLists();
                const content = trimmed.replace(/^###\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p class="chat-md-h3">${content}</p>`;
            } else if (/^---+$/.test(trimmed)) {
                closeLists();
                html += '<hr class="chat-md-hr">';
            } else if (trimmed.startsWith('>>> ')) {
                closeLists();
                const promptText = trimmed.replace(/^>>>\s*/, '');
                const displayHtml = promptText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<div class="chat-prompt-card" role="button" tabindex="0" data-prompt="${escapeHtmlAttr(promptText)}">💬 ${displayHtml}</div>`;
            } else if (trimmed.startsWith('> ')) {
                closeLists();
                const content = trimmed.replace(/^>\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<blockquote class="chat-md-quote">${content}</blockquote>`;
            } else if (trimmed.match(/^\d+\.\s/)) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (!inOrderedList) {
                    html += '<ol class="chat-md-olist">';
                    inOrderedList = true;
                }
                const content = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<li>${content}</li>`;
            } else if (trimmed.match(/^[-•]\s/)) {
                if (inOrderedList) {
                    html += '</ol>';
                    inOrderedList = false;
                }
                const docLinkMatch = trimmed.match(/^[-•]\s+\*\*\[(.+?)\]\((.+?)\)\*\*(.*)$/)
                    || trimmed.match(/^[-•]\s+\[(.+?)\]\((.+?)\)(.*)$/);
                if (docLinkMatch) {
                    closeLists();
                    const docName = docLinkMatch[1];
                    const docUrl = docLinkMatch[2];
                    const docDesc = (docLinkMatch[3] || '').replace(/^\s*[-—]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').trim();
                    const ext = docUrl.split('.').pop().toUpperCase().replace(/[?#].*/, '') || 'FILE';
                    const extClass = ['PDF', 'DOCX', 'DOC', 'XLSX', 'XLS'].includes(ext) ? ext.toLowerCase() : 'file';
                    const briefSummary = window.ContextPanel?.getBriefSummaryByDocName?.(docName, docUrl)
                        || docDesc.replace(/<[^>]+>/g, '')
                        || '点击查看文档摘要';
                    const iconClass = ['pdf', 'word'].includes(extClass) || extClass === 'doc' || extClass === 'docx'
                        ? (extClass === 'pdf' ? 'pdf' : 'word')
                        : (extClass === 'xlsx' || extClass === 'xls' ? 'txt' : 'txt');
                    html += `<div class="chat-doc-card" data-doc-url="${escapeHtmlAttr(docUrl)}" data-doc-name="${escapeHtmlAttr(docName)}">`;
                    html += `<div class="chat-doc-card-top">`;
                    html += `<svg class="chat-doc-card-icon chat-doc-card-icon--${iconClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
                    html += `<div class="chat-doc-card-filename">${escapeHtmlText(docName)}</div>`;
                    html += `<svg class="chat-doc-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
                    html += `<button type="button" class="chat-doc-card-dl doc-card-dl" aria-label="下载文档">↓ 下载</button>`;
                    html += `</div>`;
                    html += `<div class="chat-doc-card-preview"><div class="chat-doc-card-preview-text">${escapeHtmlText(briefSummary)}</div></div>`;
                    html += `</div>`;
                } else {
                    if (!inList) {
                        html += '<ul class="chat-md-list">';
                        inList = true;
                    }
                    const content = trimmed.replace(/^[-•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    html += `<li>${content}</li>`;
                }
            } else {
                closeLists();
                if (trimmed === '') return;
                const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p>${content}</p>`;
            }
        });

        closeLists();
        if (inTable) html += '</tbody></table>';
        return html;
    }

    function clickPromptCard(promptText) {
        const panel = getActiveWorkbenchPanel();
        const handoff = window.EmployeeCustomerIbFlow?.resolvePromptHandoff?.(promptText);
        if (handoff?.handoff) {
            const state = getPanelState(panel);
            state.currentCardIndex = handoff.targetAssistantIndex;
            state.currentExtraAssistantId = null;
            updateEmployeeAssistantSelection(handoff.targetAssistantIndex, panel);
            refreshInputSkillPicker(panel);
            const sendText = handoff.sendMessage || promptText;
            const input = getPanelEl('main-chat-input', panel);
            if (input) {
                input.value = sendText;
                input.focus();
            }
            syncMainSendButtonState(panel);
            sendMainMessage(sendText);
            return;
        }
        const input = getPanelEl('main-chat-input', panel);
        if (input) {
            input.value = promptText;
            input.focus();
        }
        syncMainSendButtonState(panel);
        sendMainMessage(promptText);
    }

    function downloadDocFile(url, name) {
        const panel = getActiveWorkbenchPanel();
        appendChatMessage(`正在准备下载「${name}」...`, 'user', panel);
        setTimeout(() => {
            appendChatMessage(
                `「${name}」已准备就绪。\n\n请联系支持人员张明（工号8012）获取正式文件，或可直接发送邮件至：zhangm@company.com`,
                'assistant',
                panel
            );
        }, 600);
    }

    function initChatPromptCardEvents() {
        if (document.body.dataset.chatPromptCardBound === 'true') return;
        document.body.dataset.chatPromptCardBound = 'true';

        document.addEventListener('click', (event) => {
            const homeTab = event.target.closest('.employee-home-assistant-tab[data-assistant-index]');
            if (homeTab) {
                event.stopPropagation();
                const panel = homeTab.closest('.workbench-panel') || getActiveWorkbenchPanel();
                const idx = parseInt(homeTab.dataset.assistantIndex, 10);
                if (!Number.isNaN(idx)) {
                    handleEmployeeAssistantPick(idx, panel);
                }
                return;
            }
            const promptCard = event.target.closest('.chat-prompt-card');
            if (promptCard?.dataset.prompt) {
                event.stopPropagation();
                clickPromptCard(promptCard.dataset.prompt);
                return;
            }
            const taskCard = event.target.closest('.chat-task-card');
            if (taskCard?.dataset.taskId) {
                event.stopPropagation();
                sendEmployeeTaskToChat(taskCard.dataset.taskId);
                return;
            }
            const autopilotChip = event.target.closest('.autopilot-mention-chip');
            if (autopilotChip?.dataset.mentionId) {
                event.stopPropagation();
                const targetPanel = autopilotChip.closest('.workbench-panel') || document.getElementById('workbench-panel-employee');
                const inputEl = getPanelEl('main-chat-input', targetPanel);
                const emp = getMentionEmployeeById(autopilotChip.dataset.mentionId);
                if (emp && inputEl) {
                    const insertText = `@${emp.name} `;
                    inputEl.value += insertText;
                    syncMainSendButtonState(targetPanel);
                    addMentionedEmployee(targetPanel, emp.id);
                    autoResizeTextarea(inputEl);
                    inputEl.focus();
                }
                return;
            }
            const exceptionCard = event.target.closest('.chat-exception-card');
            if (exceptionCard?.dataset.exceptionTitle) {
                event.stopPropagation();
                const card = findExceptionAlertCard(exceptionCard.dataset.exceptionTitle);
                const item = parseExceptionAlertCard(card);
                if (item) {
                    sendEmployeeExceptionAlert(item, getExceptionActionFromStatus(item.status));
                }
                return;
            }
            const docCard = event.target.closest('.chat-doc-card');
            if (docCard?.dataset.docUrl && event.target.closest('.chat-doc-card-dl, .doc-card-dl')) {
                event.stopPropagation();
                downloadDocFile(docCard.dataset.docUrl, docCard.dataset.docName || '文档');
                return;
            }
        });
    }

    function getSolutionSelectHtml(blockId) {
        const radioName = `solution-type-${blockId}`;
        return `
            <p><strong>方案生成助手</strong> · 选择方案类型</p>
            <div class="solution-select-card">
                <div class="solution-select-header">方案生成助手</div>
                <div class="solution-select-subtitle">选择方案类型，按方案设计模型继续</div>
                <label class="solution-option">
                    <input type="radio" name="${radioName}" value="bankruptcy">
                    <div class="solution-option-content">
                        <strong>破产重整</strong>
                        <span>企业破产重整方案设计，包含偿债方案、投资人引入等</span>
                    </div>
                </label>
                <label class="solution-option">
                    <input type="radio" name="${radioName}" value="placement">
                    <div class="solution-option-content">
                        <strong>定增</strong>
                        <span>定向增发方案设计</span>
                    </div>
                </label>
                <label class="solution-option">
                    <input type="radio" name="${radioName}" value="bond">
                    <div class="solution-option-content">
                        <strong>债券</strong>
                        <span>债券发行方案设计</span>
                    </div>
                </label>
                <label class="solution-option">
                    <input type="radio" name="${radioName}" value="asset">
                    <div class="solution-option-content">
                        <strong>资管产品</strong>
                        <span>资产管理产品方案设计</span>
                    </div>
                </label>
                <div class="solution-select-actions">
                    <button type="button" class="solution-btn-cancel" onclick="cancelSolutionSelect('${blockId}')">取消</button>
                    <button type="button" class="solution-btn-confirm" onclick="confirmSolutionSelect('${blockId}')">确认</button>
                </div>
            </div>
        `;
    }

    function getEmployeeHomeAssistant(listIndex, panel) {
        const agents = window.getInstalledEmployeeAssistantsForHome?.();
        if (agents?.[listIndex]) return agents[listIndex];
        return null;
    }

    function resolveEmployeeChatIndex(listIndex, panel) {
        const agent = getEmployeeHomeAssistant(listIndex, panel);
        if (agent) return agent.chatIndex;
        return listIndex;
    }

    function syncEmployeeMiniAvatars(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const container = getPanelEl('ai-mini-avatars', p);
        if (!container) return;

        const agents = window.getInstalledEmployeeAssistantsForHome?.()
            || aiAssistants.map((assistant) => ({
                listIndex: assistant.index,
                chatIndex: assistant.index,
                name: assistant.name,
                emoji: assistant.emoji,
                avatarClass: assistant.avatarClass,
                id: ''
            }));

        container.innerHTML = '';
        agents.forEach((agent) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `ai-mini-avatar ${agent.avatarClass}`;
            btn.dataset.index = String(agent.listIndex);
            if (agent.id) btn.dataset.assistantId = agent.id;
            btn.title = agent.name;
            btn.innerHTML = `<span>${agent.emoji || '🤖'}</span>`;
            btn.onclick = () => {
                handleEmployeeAssistantPick(agent.listIndex, p);
            };
            container.appendChild(btn);
        });

        const state = getPanelState(p);
        if (state.chatModeActive && typeof state.currentCardIndex === 'number') {
            const maxIdx = agents.length - 1;
            if (state.currentCardIndex > maxIdx) {
                state.currentCardIndex = 0;
            }
            updateMiniAvatarActive(state.currentCardIndex, p);
        } else if (state.chatModeActive) {
            p.querySelectorAll('.ai-mini-avatar').forEach((avatar) => avatar.classList.remove('active'));
        }
    }

    window.syncEmployeeMiniAvatars = syncEmployeeMiniAvatars;

    function getEmployeeAssistantTagLabel(name) {
        if (!name) return '助手';
        return name.replace(/助手$/, '');
    }

    function createInputAssistantTagCloseBtn(onClose) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'input-assistant-tag-close';
        btn.setAttribute('aria-label', '取消选中');
        btn.title = '取消选中';
        btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            onClose();
        });
        return btn;
    }

    function syncEmployeeTagCloseButtons(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;

        p.querySelectorAll('.input-assistant-tag:not(.input-assistant-more-trigger)').forEach((tag) => {
            const isActive = tag.classList.contains('is-active');
            let closeBtn = tag.querySelector('.input-assistant-tag-close');
            if (isActive) {
                if (!closeBtn) {
                    closeBtn = createInputAssistantTagCloseBtn(() => {
                        if (tag.dataset.extraId) {
                            clearEmployeeExtraAssistant(p);
                        } else {
                            deselectEmployeeInputAssistant(p);
                        }
                    });
                    tag.appendChild(closeBtn);
                }
            } else if (closeBtn) {
                closeBtn.remove();
            }
        });
    }

    function syncEmployeeExtraInputTag(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const container = getPanelEl('input-assistant-tags', p);
        if (!container) return;
        const state = getPanelState(p);

        container.querySelector('.input-assistant-tag-extra')?.remove();
        if (!state.currentExtraAssistantId) return;

        const extra = getExtraAssistantById(state.currentExtraAssistantId);
        if (!extra) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `input-assistant-tag input-assistant-tag-extra is-active ${extra.avatarClass || ''}`;
        btn.dataset.extraId = extra.id;
        btn.title = extra.name;
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', 'true');
        btn.innerHTML = `
            ${buildEmployeeAssistantInlineIconHtml(extra, 'tag')}
            <span class="input-assistant-tag-name">${escapeHtmlText(getEmployeeAssistantTagLabel(extra.name))}</span>
        `;
        btn.addEventListener('click', () => {
            if (state.currentExtraAssistantId !== extra.id) {
                handleEmployeeExtraAssistantPick(extra.id, p);
            }
        });
        container.insertBefore(btn, container.firstChild);
        syncEmployeeTagCloseButtons(p);
    }

    function deselectEmployeeInputAssistant(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);

        state.currentCardIndex = null;
        state.currentCatalogAssistant = null;
        state.currentInputSkillId = null;
        state.exceptionChatActive = false;

        updateEmployeeAssistantSelection(null, p);
        collapseTopSections(p);
        refreshInputSkillPicker(p);
    }

    function syncEmployeeAssistantTags(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const container = getPanelEl('input-assistant-tags', p);
        if (!container) return;

        const agents = [
            { listIndex: 0, chatIndex: 0, name: '客户分析助手', emoji: '🧠', avatarClass: 'canmou', id: '' },
            { listIndex: 1, chatIndex: 1, name: '业务分析助手', emoji: '🐎', avatarClass: 'tanma', id: '' },
            { listIndex: 2, chatIndex: 2, name: '方案生成助手', emoji: '📋', avatarClass: 'junshi', id: '' },
            { listIndex: 4, chatIndex: 4, name: '客户服务助手', emoji: '👁️', avatarClass: 'tianyan', id: '' }
        ];

        container.innerHTML = '';
        agents.forEach((agent) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `input-assistant-tag ${agent.avatarClass || ''}`;
            btn.dataset.index = String(agent.listIndex);
            if (agent.id) btn.dataset.assistantId = agent.id;
            btn.title = agent.name;
            btn.setAttribute('role', 'option');
            btn.setAttribute('aria-selected', 'false');
            btn.innerHTML = `
                ${buildEmployeeAssistantInlineIconHtml(agent, 'tag')}
                <span class="input-assistant-tag-name">${escapeHtmlText(getEmployeeAssistantTagLabel(agent.name))}</span>
            `;
            btn.addEventListener('click', () => {
                handleEmployeeAssistantPick(agent.listIndex, p);
            });
            container.appendChild(btn);
        });

        // 员工首页固定4个标签，不展示“更多”
        closeEmployeeAssistantMorePicker?.(p);

        const state = getPanelState(p);
        if (state.currentExtraAssistantId || (typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0)) {
            updateEmployeeAssistantSelection(
                typeof state.currentCardIndex === 'number' ? state.currentCardIndex : null,
                p
            );
        } else {
            updateEmployeeAssistantSelection(null, p);
        }
    }

    function syncAssistantMorePickerState(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const key = getPanelKey(p);
        if (key !== 'employee' && key !== 'support') return;
        const state = getPanelState(p);
        const picker = p?.querySelector('.input-assistant-more-picker');
        if (!picker) return;

        const trigger = picker.querySelector('.input-assistant-more-trigger');

        if (key === 'employee' || key === 'support') {
            if (trigger) {
                trigger.classList.remove('is-active');
                employeeExtraAssistants.forEach((item) => trigger.classList.remove(item.avatarClass));
                trigger.querySelector('.input-assistant-tag-icon')?.remove();
                const textEl = trigger.querySelector('.input-assistant-more-trigger-text');
                if (textEl) textEl.textContent = '更多';
            }
            picker.querySelectorAll('.input-assistant-more-option').forEach((btn) => {
                const isActive = btn.dataset.extraId === state.currentExtraAssistantId;
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            return;
        }
    }

    function closeAssistantMorePicker(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const picker = p?.querySelector('.input-assistant-more-picker');
        if (!picker) return;
        picker.classList.remove('is-open');
        picker.querySelector('.input-assistant-more-trigger')?.setAttribute('aria-expanded', 'false');
        const menu = picker.querySelector('.input-assistant-more-menu');
        if (menu) menu.hidden = true;
        p.querySelector('.enhanced-input-wrap')?.classList.remove('has-more-menu-open');
        p.querySelector('.input-section')?.classList.remove('has-more-menu-open');
    }

    function toggleAssistantMorePicker(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const picker = p?.querySelector('.input-assistant-more-picker');
        const trigger = picker?.querySelector('.input-assistant-more-trigger');
        const menu = picker?.querySelector('.input-assistant-more-menu');
        if (!picker || !trigger || !menu) return;

        const willOpen = !picker.classList.contains('is-open');
        document.querySelectorAll('.input-assistant-more-picker.is-open').forEach((el) => {
            if (el !== picker) closeAssistantMorePicker(el.closest('.workbench-panel'));
        });
        document.querySelectorAll('.input-skill-picker.is-open').forEach((el) => {
            closeInputSkillPicker(el.closest('.workbench-panel'));
        });

        picker.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        menu.hidden = !willOpen;
        p.querySelector('.enhanced-input-wrap')?.classList.toggle('has-more-menu-open', willOpen);
        p.querySelector('.input-section')?.classList.toggle('has-more-menu-open', willOpen);
    }

    function initAssistantMorePickerGlobalEvents() {
        if (document.body.dataset.assistantMorePickerGlobalBound === 'true') return;
        document.body.dataset.assistantMorePickerGlobalBound = 'true';

        document.addEventListener('click', (event) => {
            const option = event.target.closest('.input-assistant-more-option');
            if (option) {
                event.stopPropagation();
                const panel = option.closest('.workbench-panel');
                handleExtraAssistantPick(option.dataset.extraId, panel);
                closeAssistantMorePicker(panel);
                return;
            }

            const trigger = event.target.closest('.input-assistant-more-trigger');
            if (trigger) {
                event.stopPropagation();
                toggleAssistantMorePicker(trigger.closest('.workbench-panel'));
                return;
            }

            if (!event.target.closest('.input-assistant-more-picker')) {
                document.querySelectorAll('.input-assistant-more-picker.is-open').forEach((el) => {
                    closeAssistantMorePicker(el.closest('.workbench-panel'));
                });
            }
        });
    }

    function handleExtraAssistantPick(extraId, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) === 'support') {
            handleSupportExtraAssistantPick(extraId, p);
            return;
        }
        handleEmployeeExtraAssistantPick(extraId, p);
    }

    function renderAssistantMorePicker(panel) {
        initAssistantMorePickerGlobalEvents();

        const p = panel || getActiveWorkbenchPanel();
        const key = getPanelKey(p);
        if (key !== 'employee' && key !== 'support') return;
        const container = getPanelEl('input-assistant-more-anchor', p)
            || p?.querySelector('.input-assistant-more-anchor');
        if (!container) return;

        let picker = container.querySelector('.input-assistant-more-picker');
        if (!picker) {
            picker = document.createElement('div');
            picker.className = 'input-assistant-more-picker';
            picker.innerHTML = `
                <button type="button" class="input-assistant-tag input-assistant-more-trigger" aria-haspopup="listbox" aria-expanded="false">
                    <span class="input-assistant-more-trigger-text">更多</span>
                    <svg class="input-assistant-more-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div class="input-assistant-more-menu" role="listbox" aria-label="更多助手" hidden>
                    <div class="input-assistant-more-menu-label">更多助手</div>
                    ${employeeExtraAssistants.map((extra) => `
                        <button type="button" class="input-assistant-more-option" data-extra-id="${extra.id}" role="option" aria-selected="false">
                            <span class="input-assistant-more-option-icon ${extra.avatarClass}" aria-hidden="true">${extra.emoji}</span>
                            <span class="input-assistant-more-option-name">${escapeHtmlText(extra.name)}</span>
                            <svg class="input-assistant-more-check" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    `).join('')}
                </div>
            `;
            container.appendChild(picker);
        }

        syncAssistantMorePickerState(p);
    }

    function syncEmployeeAssistantMorePickerState(panel) {
        syncAssistantMorePickerState(panel);
    }

    function closeEmployeeAssistantMorePicker(panel) {
        closeAssistantMorePicker(panel);
    }

    function toggleEmployeeAssistantMorePicker(panel) {
        toggleAssistantMorePicker(panel);
    }

    function renderEmployeeAssistantMorePicker(panel) {
        renderAssistantMorePicker(panel);
    }

    window.syncEmployeeAssistantTags = syncEmployeeAssistantTags;

    // 可被 @ 的员工列表（demo 数据：姓名 + 手机号 + 部门 + 头像）
    const MENTION_EMPLOYEES = [
        { id: 'emp-zhangming', name: '张明', phone: '13812348012', dept: '投行部', title: '高级经理', emoji: '👨‍💼' },
        { id: 'emp-wangqiang', name: '王强', phone: '13912348034', dept: '投行部', title: '经理', emoji: '🧑‍💼' },
        { id: 'emp-zhaomin', name: '赵敏', phone: '13712348045', dept: '投行部', title: '高级经理', emoji: '👩‍💼' },
        { id: 'emp-liutao', name: '刘涛', phone: '13612348067', dept: '资管部', title: '副总裁', emoji: '👨‍💼' },
        { id: 'emp-chenyu', name: '陈宇', phone: '13512348098', dept: '客户服务部', title: '经理', emoji: '🧑‍💼' },
        { id: 'emp-lina', name: '李娜', phone: '15812348023', dept: '合规部', title: '高级经理', emoji: '👩‍💼' },
        { id: 'emp-zhouwei', name: '周伟', phone: '15912348056', dept: '研究部', title: '分析师', emoji: '👨‍💼' },
        { id: 'emp-sunli', name: '孙丽', phone: '15212348078', dept: '运营部', title: '经理', emoji: '👩‍💼' },
        { id: 'emp-huangjie', name: '黄杰', phone: '15112348011', dept: '投行部', title: '董事', emoji: '👨‍💼' },
        { id: 'emp-wuxin', name: '吴欣', phone: '15012348033', dept: '资管部', title: '经理', emoji: '👩‍💼' }
    ];

    function getMentionEmployeeById(id) {
        return MENTION_EMPLOYEES.find((e) => e.id === id) || null;
    }

    // 获取当前会话中被 @ 的员工列表
    function getMentionedEmployees(panel) {
        const state = getPanelState(panel);
        return (state.mentionedEmployees || [])
            .map((id) => getMentionEmployeeById(id))
            .filter(Boolean);
    }

    // 将员工加入会话成员（群聊效果）
    function addMentionedEmployee(panel, employeeId) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        if (!state.mentionedEmployees) state.mentionedEmployees = [];
        if (!state.mentionedEmployees.includes(employeeId)) {
            state.mentionedEmployees.push(employeeId);
        }
        renderChatMembersBar(p);
    }

    function clearMentionedEmployees(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        state.mentionedEmployees = [];
        renderChatMembersBar(p);
    }

    // 从消息文本中解析被 @ 的员工（匹配 @人名）
    function parseMentionedEmployeesFromText(text, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        if (!state.mentionedEmployees || !state.mentionedEmployees.length) return [];
        const mentioned = [];
        state.mentionedEmployees.forEach((id) => {
            const emp = getMentionEmployeeById(id);
            if (emp && new RegExp('@' + emp.name + '(?![\\w\\u4e00-\\u9fa5])').test(text || '')) {
                mentioned.push(emp);
            }
        });
        return mentioned;
    }

    // 渲染会话窗口顶部的成员条（群聊效果）
    function renderChatMembersBar(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const chatView = getPanelEl('ai-chat-view', p);
        if (!chatView) return;
        // 将成员条插入到 .ai-workbench-section 层级，作为对话窗口顶部固定栏
        const section = chatView.closest('.ai-workbench-section') || chatView.closest('.center-module-view');
        if (!section) return;
        const sessionScroll = chatView.closest('.session-scroll') || chatView.parentElement;
        const members = getMentionedEmployees(p);
        let bar = section.querySelector(':scope > .chat-members-bar');
        // 始终显示成员条（即使没有 @ 员工，也显示“我”）
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'chat-members-bar';
            section.insertBefore(bar, section.firstChild);
        }
        if (sessionScroll) sessionScroll.classList.add('has-members-bar');
        const ownerName = '我';
        const sessionStatus = window.AppShell?.getSessionStatus?.() || '推进中';
        const statusColorClass = window.AppShell?.getStatuses?.() ? (window.AppShell?.getSessionStatus?.() || '推进中') : '推进中';
        const statusCls = {
            '推进中': 'status-active',
            '目标达成': 'status-done',
            '已暂停': 'status-paused',
            '已取消': 'status-cancelled'
        }[sessionStatus] || 'status-active';
        bar.innerHTML = `
            <span class="chat-members-bar-label">对话涉及成员：</span>
            <span class="chat-member-chip chat-member-self">
                <span class="chat-member-avatar" aria-hidden="true">🙋</span>
                <span class="chat-member-name">${escapeHtmlText(ownerName)}</span>
            </span>
            ${members.map((m) => `
                <span class="chat-member-chip" data-employee-id="${escapeHtmlAttr(m.id)}">
                    <span class="chat-member-avatar" aria-hidden="true">${m.emoji || '👤'}</span>
                    <span class="chat-member-name">${escapeHtmlText(m.name)}</span>
                </span>
            `).join('')}
            <span class="chat-members-bar-status">
                <span class="chat-members-bar-status-label">会话状态：</span>
                <span class="chat-status-badge ${statusCls}" id="chat-status-badge" title="点击修改会话状态">${escapeHtmlText(sessionStatus)}</span>
            </span>
        `;
    }

    // 被 @ 员工的群聊回复内容（demo：简短确认）
    function buildMentionedEmployeeReplyText(employee, message) {
        return `收到，我是${employee.dept || ''}${employee.title ? employee.title + ' ' : ''}${employee.name}。`;
    }

    // 追加一条被 @ 员工的群聊消息行
    function appendMentionedEmployeeReply(employee, text, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;
        const row = document.createElement('div');
        row.className = 'chat-row chat-row-assistant chat-row-mention-employee';
        row.dataset.employeeId = employee.id || '';
        row.innerHTML = `
            <div class="chat-avatar employee-chat-avatar mention-employee-avatar" aria-hidden="true">${employee.emoji || '👤'}</div>
            <div class="chat-bubble chat-bubble-assistant mention-employee-bubble">
                <div class="chat-bubble-sender">${escapeHtmlText(employee.name || '')}${employee.dept ? ' · ' + escapeHtmlText(employee.dept) : ''}</div>
                <div class="chat-bubble-content">${escapeHtml(text || '')}</div>
            </div>
        `;
        const lastBlock = messagesEl.querySelector('.chat-conversation-block:last-of-type');
        (lastBlock || messagesEl).appendChild(row);
        const scroller = messagesEl.closest('.ai-chat-messages') || messagesEl;
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    }

    // 发送含 @员工 的消息后，安排被 @ 的员工在助手回复之后追加群聊回复
    function scheduleMentionedEmployeeReplies(message, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'employee') return;
        const mentioned = parseMentionedEmployeesFromText(message, p);
        if (!mentioned.length) return;
        const emp = mentioned[0];
        setTimeout(() => {
            appendMentionedEmployeeReply(emp, buildMentionedEmployeeReplyText(emp, message), p);
        }, 1500);
    }

    function getEmployeeAtMentionOptions() {
        return [
            { kind: 'main', index: 0, name: '客户分析助手', avatarClass: 'canmou' },
            { kind: 'main', index: 1, name: '业务分析助手', avatarClass: 'tanma' },
            { kind: 'main', index: 2, name: '方案生成助手', avatarClass: 'junshi' },
            { kind: 'main', index: 4, name: '客户服务助手', avatarClass: 'tianyan' }
        ];
    }

    function getSupportAtMentionOptions() {
        return [
            {
                kind: 'support',
                agentId: SUPPORT_INPUT_AGENT_DAILY_TASK,
                id: SUPPORT_INPUT_AGENT_DAILY_TASK,
                name: '今日任务助手',
                avatarClass: 'support-daily-task-tag'
            },
            {
                kind: 'support',
                agentId: SUPPORT_INPUT_AGENT_EXCEPTIONS,
                id: SUPPORT_INPUT_AGENT_EXCEPTIONS,
                name: '异常提醒助手',
                avatarClass: 'support-exceptions-tag'
            }
        ];
    }

    function getEmployeeMentionOptions() {
        return MENTION_EMPLOYEES.map((e) => ({
            kind: 'employee',
            employeeId: e.id,
            name: e.name,
            phone: e.phone,
            dept: e.dept,
            title: e.title,
            emoji: e.emoji
        }));
    }

    function getAtMentionOptionsForPanel(panel) {
        return getEmployeeMentionOptions();
    }

    function findAtMentionToken(text, caretIndex) {
        const before = String(text || '').slice(0, Math.max(0, caretIndex || 0));
        const atIndex = before.lastIndexOf('@');
        if (atIndex < 0) return null;
        const token = before.slice(atIndex + 1);
        if (!token && atIndex === before.length - 1) {
            return { start: atIndex, token: '' };
        }
        if (/[\s\n\r\t]/.test(token)) return null;
        return { start: atIndex, token: token || '' };
    }

    function normalizeAtMentionQuery(q) {
        return String(q || '').trim().toLowerCase();
    }

    function filterAtMentionOptions(options, query) {
        const q = normalizeAtMentionQuery(query);
        if (!q) return options;
        return options.filter((opt) => {
            const name = String(opt.name || '').toLowerCase();
            const shortName = name.replace(/助手$/g, '');
            if (name.includes(q) || shortName.includes(q)) return true;
            if (opt.kind === 'employee') {
                const phone = String(opt.phone || '').toLowerCase();
                const dept = String(opt.dept || '').toLowerCase();
                if (phone.includes(q) || dept.includes(q)) return true;
            }
            return false;
        });
    }

    function ensureAtMentionMenu(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const wrap = p?.querySelector('.enhanced-input-wrap');
        if (!wrap) return null;
        let menu = wrap.querySelector('.input-at-mention-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'input-at-mention-menu';
            menu.hidden = true;
            wrap.appendChild(menu);
        }
        return menu;
    }

    function setAtMentionActiveIndex(menu, index) {
        if (!menu) return;
        const items = menu.querySelectorAll('[data-at-mention-idx]');
        items.forEach((el) => el.classList.remove('is-active'));
        const active = menu.querySelector(`[data-at-mention-idx="${index}"]`);
        if (active) {
            active.classList.add('is-active');
            active.scrollIntoView({ block: 'nearest' });
        }
        menu.dataset.activeIndex = String(index);
    }

    function closeAtMentionMenu(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const menu = ensureAtMentionMenu(p);
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
        delete menu.dataset.activeIndex;
        delete menu.dataset.mentionStart;
        p?.querySelector('.enhanced-input-wrap')?.classList.remove('has-at-mention-open');
        p?.querySelector('.input-section')?.classList.remove('has-at-mention-open');
        p?.querySelector('.ai-workbench-section')?.classList.remove('has-at-mention-open');
        p?.querySelector('.center-workspace')?.classList.remove('has-at-mention-open');
    }

    function openAtMentionMenu(panel, token) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const menu = ensureAtMentionMenu(p);
        const wrap = p?.querySelector('.enhanced-input-wrap');
        if (!menu) return;

        const query = token?.token ?? '';
        const options = filterAtMentionOptions(getAtMentionOptionsForPanel(p), query);
        if (!options.length) {
            closeAtMentionMenu(p);
            return;
        }

        menu.hidden = false;
        wrap?.classList.add('has-at-mention-open');
        p?.querySelector('.input-section')?.classList.add('has-at-mention-open');
        p?.querySelector('.ai-workbench-section')?.classList.add('has-at-mention-open');
        p?.querySelector('.center-workspace')?.classList.add('has-at-mention-open');

        // 仅渲染员工选项
        let html = '';
        if (options.length) {
            html += `<div class="input-at-mention-group-title">员工</div>`;
            options.forEach((opt, idx) => {
                html += `
                    <button type="button" class="input-at-mention-option input-at-mention-employee" data-at-mention-idx="${idx}" data-kind="employee" data-employee-id="${escapeHtmlAttr(opt.employeeId || '')}" data-employee-name="${escapeHtmlAttr(opt.name || '')}">
                        <span class="input-at-mention-option-avatar" aria-hidden="true">${opt.emoji || '👤'}</span>
                        <span class="input-at-mention-option-body">
                            <span class="input-at-mention-option-name">${escapeHtmlText(opt.name || '')}</span>
                            <span class="input-at-mention-option-meta">${escapeHtmlText(opt.dept || '')} · ${escapeHtmlText(opt.phone || '')}</span>
                        </span>
                    </button>
                `;
            });
        }
        menu.innerHTML = html;

        setAtMentionActiveIndex(menu, 0);

        if (menu.dataset.bound !== 'true') {
            menu.dataset.bound = 'true';
            menu.addEventListener('click', (event) => {
                const btn = event.target.closest('.input-at-mention-option');
                if (!btn) return;
                event.preventDefault();
                const idx = Number(btn.dataset.atMentionIdx || 0);
                pickAtMentionOption(p, idx);
            });
        }
    }

    function pickAtMentionOption(panel, optionIndex) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const input = getPanelEl('main-chat-input', p);
        const menu = ensureAtMentionMenu(p);
        if (!input || !menu || menu.hidden) return;

        const buttons = Array.from(menu.querySelectorAll('.input-at-mention-option'));
        const btn = buttons[optionIndex];
        if (!btn) return;

        const kind = btn.dataset.kind;
        const targetIndex = btn.dataset.index ? Number(btn.dataset.index) : null;
        const extraId = btn.dataset.extraId || '';
        const agentId = btn.dataset.agentId || '';
        const assistantName = btn.dataset.assistantName
            || btn.querySelector('.input-at-mention-option-name')?.textContent?.trim()
            || '';

        // 员工 @：在输入框插入“@人名 ”文本，并把员工拉入会话成员（群聊效果）
        if (kind === 'employee') {
            const employeeId = btn.dataset.employeeId || '';
            const employeeName = btn.dataset.employeeName
                || btn.querySelector('.input-at-mention-option-name')?.textContent?.trim()
                || '';
            const insertText = `@${employeeName} `;
            const caret = input.selectionStart ?? input.value.length;
            const token = findAtMentionToken(input.value, caret);
            if (token) {
                const before = input.value.slice(0, token.start);
                const after = input.value.slice(caret);
                input.value = before + insertText + after;
                const nextCaret = before.length + insertText.length;
                input.setSelectionRange(nextCaret, nextCaret);
            } else {
                input.value += insertText;
            }
            syncMainSendButtonState(p);
            if (employeeId) addMentionedEmployee(p, employeeId);
            closeAtMentionMenu(p);
            input.focus();
            return;
        }

        const caret = input.selectionStart ?? input.value.length;
        const token = findAtMentionToken(input.value, caret);
        if (token) {
            const before = input.value.slice(0, token.start);
            const after = input.value.slice(caret);
            input.value = before + after;
            const nextCaret = before.length;
            input.setSelectionRange(nextCaret, nextCaret);
        }
        syncMainSendButtonState(p);

        if (kind === 'support' && agentId) {
            handleSupportAssistantTagPick(agentId, p);
        } else if (kind === 'extra' && extraId) {
            handleEmployeeExtraAssistantPick(extraId, p);
        } else if (typeof targetIndex === 'number' && !Number.isNaN(targetIndex)) {
            handleEmployeeAssistantPick(targetIndex, p);
        }

        closeAtMentionMenu(p);
        input.focus();
    }

    function bindAtMentionAssistantPicker(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const key = getPanelKey(p);
        if (key !== 'employee' && key !== 'support') return;
        const input = getPanelEl('main-chat-input', p);
        if (!input || input.dataset.atMentionBound === 'true') return;
        input.dataset.atMentionBound = 'true';

        ensureAtMentionMenu(p);

        input.addEventListener('input', () => {
            const caret = input.selectionStart ?? input.value.length;
            const token = findAtMentionToken(input.value, caret);
            if (!token) {
                closeAtMentionMenu(p);
                return;
            }
            openAtMentionMenu(p, token);
        });

        input.addEventListener('keydown', (event) => {
            const menu = ensureAtMentionMenu(p);
            if (!menu || menu.hidden) return;

            const buttons = menu.querySelectorAll('.input-at-mention-option');
            if (!buttons.length) return;
            const max = buttons.length - 1;
            const active = Number(menu.dataset.activeIndex || 0);

            if (event.key === 'Escape') {
                event.preventDefault();
                closeAtMentionMenu(p);
                return;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setAtMentionActiveIndex(menu, Math.min(max, active + 1));
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setAtMentionActiveIndex(menu, Math.max(0, active - 1));
                return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                pickAtMentionOption(p, active);
            }
        });
    }

    function initAtMentionDocDismiss() {
        if (document.body.dataset.atMentionDocClickBound === 'true') return;
        document.body.dataset.atMentionDocClickBound = 'true';
        document.addEventListener('click', (event) => {
            ['employee', 'support'].forEach((key) => {
                const panel = document.getElementById('workbench-panel-' + key);
                if (!panel) return;
                const input = getPanelEl('main-chat-input', panel);
                if (!input) return;
                if (!event.target.closest('.input-at-mention-menu') && event.target !== input) {
                    closeAtMentionMenu(panel);
                }
            });
        });
    }

    function initEmployeeAtMentionAssistantPicker(panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        bindAtMentionAssistantPicker(p);
        initAtMentionDocDismiss();
    }

    function initSupportAtMentionAssistantPicker(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        bindAtMentionAssistantPicker(p);
        initAtMentionDocDismiss();
    }

    const supportInputTagAssistants = [
        {
            id: SUPPORT_INPUT_AGENT_DAILY_TASK,
            name: '今日任务助手',
            shortName: '今日任务',
            image: SUPPORT_DAILY_TASK_AVATAR_SRC,
            avatarClass: 'support-daily-task-tag'
        },
        {
            id: SUPPORT_INPUT_AGENT_EXCEPTIONS,
            name: '异常提醒助手',
            shortName: '异常提醒',
            emoji: '⚠️',
            avatarClass: 'support-exceptions-tag'
        }
    ];

    function getSupportAssistantTagLabel(name, shortName) {
        if (shortName) return shortName;
        if (!name) return '助手';
        return name.replace(/助手$/, '');
    }

    function buildSupportAssistantTagIconHtml(agent) {
        if (agent.id === SUPPORT_INPUT_AGENT_DAILY_TASK) {
            return `<span class="input-assistant-tag-icon support-daily-task-tag" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="2"/><path d="M7 3.5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 3.5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3.5 9h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>`;
        }
        if (agent.id === SUPPORT_INPUT_AGENT_EXCEPTIONS) {
            return `<span class="input-assistant-tag-icon support-exceptions-tag" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5l9 16H3l9-16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1" fill="currentColor"/></svg></span>`;
        }
        if (agent.image) {
            return `<img src="${escapeHtml(agent.image)}" alt="" class="input-assistant-tag-img">`;
        }
        return `<span class="input-assistant-tag-icon ${agent.avatarClass || ''}" aria-hidden="true">${agent.emoji || '🤖'}</span>`;
    }

    function buildAtMentionOptionIconHtml(opt, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) === 'support' && opt?.kind === 'support') {
            const agent = supportInputTagAssistants.find((item) => item.id === (opt.agentId || opt.id));
            if (agent) {
                return `<span class="input-at-mention-option-icon" aria-hidden="true">${buildSupportAssistantTagIconHtml(agent)}</span>`;
            }
        }
        return buildEmployeeAssistantInlineIconHtml(opt, 'mention');
    }

    function updateSupportAssistantTagSelection(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        const state = getPanelState(p);
        const activeExtraId = state.currentExtraAssistantId;
        const activeId = activeExtraId ? null : state.currentSupportInputAgent;
        const hasMainSelection = !!activeId;

        p.querySelectorAll('.input-assistant-tag[data-support-agent-id]').forEach((tag) => {
            const isActive = hasMainSelection && tag.dataset.supportAgentId === activeId;
            tag.classList.toggle('is-active', isActive);
            tag.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        const activeCardType = activeId === SUPPORT_INPUT_AGENT_EXCEPTIONS
            ? 'exceptions'
            : activeId === SUPPORT_INPUT_AGENT_DAILY_TASK
                ? 'tasks'
                : null;
        p.querySelectorAll('.support-home-card[data-support-card]').forEach((card) => {
            card.classList.toggle('active', !!activeCardType && card.dataset.supportCard === activeCardType);
        });

        syncSupportExtraInputTag(p);
        syncAssistantMorePickerState(p);
        syncSupportTagCloseButtons(p);
        if (!activeExtraId && !activeId) {
            const picker = p.querySelector('.support-input-agent-picker');
            if (picker) updateSupportInputAgentPickerUI(picker, null);
        }
        updateSupportInputPlaceholder(p);
    }

    function syncSupportTagCloseButtons(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;

        p.querySelectorAll('.input-assistant-tag:not(.input-assistant-more-trigger)').forEach((tag) => {
            const isActive = tag.classList.contains('is-active');
            let closeBtn = tag.querySelector('.input-assistant-tag-close');
            if (isActive) {
                if (!closeBtn) {
                    closeBtn = createInputAssistantTagCloseBtn(() => {
                        if (tag.dataset.extraId) {
                            clearSupportExtraAssistant(p);
                        } else {
                            deselectSupportInputAssistant(p);
                        }
                    });
                    tag.appendChild(closeBtn);
                }
            } else if (closeBtn) {
                closeBtn.remove();
            }
        });
    }

    function syncSupportExtraInputTag(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const container = getPanelEl('input-assistant-tags', p);
        if (!container) return;
        const state = getPanelState(p);

        container.querySelector('.input-assistant-tag-extra')?.remove();
        if (!state.currentExtraAssistantId) return;

        const extra = getExtraAssistantById(state.currentExtraAssistantId);
        if (!extra) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `input-assistant-tag input-assistant-tag-extra is-active ${extra.avatarClass || ''}`;
        btn.dataset.extraId = extra.id;
        btn.title = extra.name;
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', 'true');
        btn.innerHTML = `
            <span class="input-assistant-tag-icon ${extra.avatarClass || ''}" aria-hidden="true">${extra.emoji || '🤖'}</span>
            <span class="input-assistant-tag-name">${escapeHtmlText(getEmployeeAssistantTagLabel(extra.name))}</span>
        `;
        btn.addEventListener('click', () => {
            if (state.currentExtraAssistantId !== extra.id) {
                handleSupportExtraAssistantPick(extra.id, p);
            }
        });
        container.insertBefore(btn, container.firstChild);
        syncSupportTagCloseButtons(p);
    }

    function deselectSupportInputAssistant(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        const state = getPanelState(p);

        state.currentSupportInputAgent = null;
        state.currentExtraAssistantId = null;
        state.currentInputSkillId = null;
        updateSupportAssistantTagSelection(p);
        refreshInputSkillPicker(p);
        refreshInputMentionChip(p);
    }

    function clearSupportExtraAssistant(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;
        const state = getPanelState(p);
        if (!state.currentExtraAssistantId) return;

        state.currentExtraAssistantId = null;
        state.currentSupportInputAgent = null;
        state.currentInputSkillId = null;
        updateSupportAssistantTagSelection(p);
        refreshInputSkillPicker(p);
        refreshInputMentionChip(p);
    }

    function selectSupportExtraAssistant(extraId, panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const extra = getExtraAssistantById(extraId);
        if (!p || !extra) return;
        const state = getPanelState(p);

        state.currentExtraAssistantId = extraId;
        state.currentSupportInputAgent = null;
        state.currentInputSkillId = null;
        updateSupportAssistantTagSelection(p);
        refreshInputSkillPicker(p);
        refreshInputMentionChip(p);
    }

    function appendSupportExtraAssistantWelcome(extraId, panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        const extra = getExtraAssistantById(extraId);
        if (!p || !extra) return;
        appendSupportChatMessage(getExtraAssistantWelcomeHtml(extra.chatIndex), 'assistant', p, {
            html: true,
            agentId: extraId
        });
    }

    function handleSupportExtraAssistantPick(extraId, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'support') return;
        const extra = getExtraAssistantById(extraId);
        if (!extra) return;

        const state = getPanelState(p);
        if (state.currentExtraAssistantId === extraId) {
            return;
        }

        if (state.chatModeActive) {
            state.currentExtraAssistantId = extraId;
            state.currentSupportInputAgent = null;
            state.currentInputSkillId = null;
            updateSupportAssistantTagSelection(p);
            refreshInputSkillPicker(p);
            return;
        }
        selectSupportExtraAssistant(extraId, p);
    }

    function handleSupportAssistantTagPick(agentId, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'support') return;
        const state = getPanelState(p);
        if (state.chatModeActive && !state.currentExtraAssistantId && state.currentSupportInputAgent === agentId) {
            return;
        }
        setSupportInputAgent(p, agentId);
    }

    function syncSupportAssistantTags(panel) {
        const p = panel || document.getElementById('workbench-panel-support');
        if (!p || getPanelKey(p) !== 'support') return;

        const container = getPanelEl('input-assistant-tags', p);
        if (!container) return;

        container.innerHTML = '';
        supportInputTagAssistants.forEach((agent) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `input-assistant-tag ${agent.avatarClass || ''}`;
            btn.dataset.supportAgentId = agent.id;
            btn.title = agent.name;
            btn.setAttribute('role', 'option');
            btn.setAttribute('aria-selected', 'false');
            btn.innerHTML = `
                ${buildSupportAssistantTagIconHtml(agent)}
                <span class="input-assistant-tag-name">${escapeHtmlText(getSupportAssistantTagLabel(agent.name, agent.shortName))}</span>
            `;
            btn.addEventListener('click', () => {
                handleSupportAssistantTagPick(agent.id, p);
            });
            container.appendChild(btn);
        });

        renderAssistantMorePicker(p);
        updateSupportAssistantTagSelection(p);
    }

    window.syncSupportAssistantTags = syncSupportAssistantTags;

    function updateEmployeeAssistantSelection(index, panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);
        const activeExtraId = state.currentExtraAssistantId;
        const hasMainSelection = typeof index === 'number' && index >= 0;

        p.querySelectorAll('.ai-card-fan[data-index]').forEach((card) => {
            card.classList.toggle('active', !activeExtraId && hasMainSelection && parseInt(card.dataset.index, 10) === index);
        });
        p.querySelectorAll('.indicator').forEach((ind) => {
            ind.classList.toggle('active', !activeExtraId && hasMainSelection && parseInt(ind.dataset.index, 10) === index);
        });
        p.querySelectorAll('.input-assistant-tag:not(.input-assistant-more-trigger):not(.input-assistant-tag-extra)').forEach((tag) => {
            const isActive = !activeExtraId && hasMainSelection && parseInt(tag.dataset.index, 10) === index;
            tag.classList.toggle('is-active', isActive);
            tag.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        p.querySelectorAll('.employee-home-assistant-tab[data-assistant-index]').forEach((btn) => {
            const isActive = !activeExtraId && hasMainSelection && parseInt(btn.dataset.assistantIndex, 10) === index;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        syncEmployeeExtraInputTag(p);
        syncAssistantMorePickerState(p);
        if (activeExtraId) {
            p.querySelectorAll('.ai-mini-avatar').forEach((avatar) => avatar.classList.remove('active'));
        } else if (hasMainSelection) {
            updateMiniAvatarActive(index, p);
        } else {
            p.querySelectorAll('.ai-mini-avatar').forEach((avatar) => avatar.classList.remove('active'));
        }
        syncEmployeeTagCloseButtons(p);
        updateEmployeeInputPlaceholder(p);
    }

    function clearEmployeeExtraAssistant(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);
        if (!state.currentExtraAssistantId) return;

        state.currentExtraAssistantId = null;
        state.currentCardIndex = null;
        state.currentInputSkillId = null;
        updateEmployeeAssistantSelection(null, p);
        collapseTopSections(p);
        refreshInputSkillPicker(p);
    }

    function selectEmployeeExtraAssistant(extraId, panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const extra = getExtraAssistantById(extraId);
        if (!p || !extra) return;
        const state = getPanelState(p);

        state.currentExtraAssistantId = extraId;
        state.currentCardIndex = null;
        state.currentCatalogAssistant = null;
        state.currentInputSkillId = null;

        updateEmployeeAssistantSelection(null, p);
        collapseTopSections(p);
        refreshInputSkillPicker(p);
    }

    function handleEmployeeExtraAssistantPick(extraId, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'employee') return;
        const extra = getExtraAssistantById(extraId);
        if (!extra) return;

        const state = getPanelState(p);
        if (state.currentExtraAssistantId === extraId) {
            return;
        }

        if (state.chatModeActive) {
            state.currentExtraAssistantId = extraId;
            state.currentCardIndex = null;
            state.currentCatalogAssistant = null;
            state.currentInputSkillId = null;
            updateEmployeeAssistantSelection(null, p);
            collapseTopSections(p);
            refreshInputSkillPicker(p);
            return;
        }
        selectEmployeeExtraAssistant(extraId, p);
    }

    function selectEmployeeAssistant(index, panel) {
        const p = panel || document.getElementById('workbench-panel-employee');
        if (!p || getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);
        const agents = window.getInstalledEmployeeAssistantsForHome?.() || [];
        const maxIdx = Math.max(agents.length, totalCards) - 1;
        const safeIndex = Math.max(0, Math.min(index, maxIdx));

        state.currentExtraAssistantId = null;
        state.currentCatalogAssistant = null;
        state.currentInputSkillId = null;
        state.currentCardIndex = safeIndex;
        state.exceptionChatActive = false;

        updateEmployeeAssistantSelection(safeIndex, p);
        collapseTopSections(p);
        refreshInputSkillPicker(p);
    }

    function handleEmployeeAssistantPick(index, panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);
        state.exceptionChatActive = false;
        if (state.chatModeActive && !state.currentExtraAssistantId && index === state.currentCardIndex) return;
        selectEmployeeAssistant(index, p);
    }

    window.selectEmployeeAssistant = selectEmployeeAssistant;

    function syncEmployeeChatModeLayout() {
        const employeePanel = document.getElementById('workbench-panel-employee');
        const isActive = employeePanel?.classList.contains('active');
        const inChat = employeePanel && getPanelState(employeePanel).chatModeActive;
        document.body.classList.toggle('employee-chat-mode', !!(isActive && inChat));
    }

    function persistEmployeeChat(panel) {
        const p = panel || getActiveWorkbenchPanel();
        if (getPanelKey(p) !== 'employee') return;
        const state = getPanelState(p);
        if (!state.currentSessionId || !window.AppShell?.saveSessionMessages) return;
        const contextBundle = window.ContextPanel?.getState?.() || null;
        window.AppShell.saveSessionMessages(
            state.currentSessionId,
            state.chatMessages || [],
            state.currentCardIndex,
            { workbenchAssistant: isWorkbenchAssistantMode(state), contextBundle }
        );
    }

    function recordEmployeeChatMessage(panel, message) {
        const state = getPanelState(panel);
        if (!state.chatMessages) state.chatMessages = [];
        state.chatMessages.push(message);
        if (message.role === 'user') {
            const userMsgs = state.chatMessages.filter((m) => m.role === 'user');
            if (userMsgs.length === 1 && window.AppShell?.touchCurrentSession) {
                window.AppShell.touchCurrentSession(message.text.slice(0, 30));
            }
        }
        persistEmployeeChat(panel);
    }

    function shouldSkipGuidedWelcome(index, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const listIndex = typeof index === 'number' ? index : (getPanelState(p).currentCardIndex ?? 0);
        const chatIndex = resolveEmployeeChatIndex(listIndex, p);
        return window.EmployeeCustomerIbFlow?.usesGuidedFlow?.(chatIndex) === true;
    }

    function clearEmployeeChatMessages(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (messagesEl) messagesEl.innerHTML = '';
        getPanelState(p).chatMessages = [];
    }

    function restoreChatFromSession(panel, session) {
        const p = panel || document.getElementById('workbench-panel-employee');
        const state = getPanelState(p);
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;

        bindOverlayScrollbar(messagesEl);

        messagesEl.innerHTML = '';
        state.chatMessages = Array.isArray(session?.messages) ? session.messages.slice() : [];
        const workbenchSession = isWorkbenchAssistantSession(session);
        state.currentCardIndex = workbenchSession
            ? null
            : (typeof session?.assistantIndex === 'number' ? session.assistantIndex : null);
        const isExceptionSession = String(session?.title || '').startsWith('异常提醒·')
            || state.chatMessages.some((msg) => msg.agentId === SUPPORT_INPUT_AGENT_EXCEPTIONS);
        const topAssistantAvatarKey = state.chatMessages
            .map((msg) => msg.assistantAvatarKey)
            .find((key) => typeof key === 'string' && key.indexOf('top-') === 0);
        state.currentTopBusinessAssistant = null;
        if (isExceptionSession) {
            clearEmployeeAssistantInputSelection(p);
            updateTopAvatarActive(null);
        } else if (workbenchSession) {
            state.exceptionChatActive = false;
            state.currentExtraAssistantId = null;
            updateEmployeeAssistantSelection(null, p);
            updateTopAvatarActive(null);
        } else if (topAssistantAvatarKey) {
            state.exceptionChatActive = false;
            state.currentTopBusinessAssistant = topAssistantAvatarKey.slice(4);
            updateTopAvatarActive(topAssistantAvatarKey.slice(4));
            updateEmployeeAssistantSelection(null, p);
        } else {
            state.exceptionChatActive = false;
            if (typeof state.currentCardIndex === 'number') {
                updateMiniAvatarActive(state.currentCardIndex, p);
            }
            updateEmployeeAssistantSelection(
                typeof state.currentCardIndex === 'number' ? state.currentCardIndex : null,
                p
            );
            updateTopAvatarActive(null);
        }

        if (!state.chatMessages.length) {
            if (!shouldSkipGuidedWelcome(state.currentCardIndex, p)) {
                appendAssistantConversation(state.currentCardIndex, p);
            }
            return;
        }

        let lastUserMessage = '';
        state.chatMessages.forEach((msg) => {
            if (msg.type === 'welcome') {
                if (msg.extraAssistantId) {
                    appendExtraAssistantConversation(msg.extraAssistantId, p, { skipPersist: true });
                    return;
                }
                if (shouldSkipGuidedWelcome(msg.assistantIndex ?? 0, p)) return;
                appendAssistantConversation(msg.assistantIndex ?? 0, p, { skipPersist: true });
                return;
            }
            if (msg.role === 'user') {
                lastUserMessage = msg.text || '';
                appendChatMessage(msg.text, 'user', p, { skipPersist: true });
            } else if (msg.role === 'assistant') {
                appendChatMessage(msg.text, 'assistant', p, {
                    skipPersist: true,
                    assistantIndex: msg.assistantIndex,
                    chatIndex: msg.chatIndex,
                    extraAssistantId: msg.extraAssistantId,
                    userMessage: lastUserMessage,
                    html: !!msg.html,
                    agentId: msg.agentId || undefined,
                    workbenchAssistant: !!msg.workbenchAssistant,
                    assistantAvatarKey: msg.assistantAvatarKey,
                    assistantDisplayName: msg.assistantDisplayName
                });
            }
        });
        scrollWorkbenchChatToBottom(p);

        // 恢复右侧边栏上下文（关联任务等）
        window.ContextPanel?.reset?.();
        if (session?.contextBundle) {
            const bundle = session.contextBundle;
            if (window.ContextPanel?.loadSnapshot && (bundle.outputs?.length || bundle.models?.length || bundle.customers?.length || bundle.tasks?.length || bundle.inputs?.length)) {
                window.ContextPanel.loadSnapshot(bundle);
            }
        }
        window.ContextPanel?.renderAllSections?.();
    }

    function applyEmployeeChatModeUI(panel, options = {}) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        const useWorkbench = options.useWorkbenchAssistant === true || (
            !options.skipAssistantSelection
            && !state.currentExtraAssistantId
            && !(typeof options.index === 'number')
            && isWorkbenchAssistantMode(state)
        );
        const index = typeof options.index === 'number'
            ? options.index
            : (typeof state.currentCardIndex === 'number' ? state.currentCardIndex : null);
        const showWelcome = options.showWelcome !== false;
        const createHistory = options.createHistory !== false;

        state.chatModeActive = true;
        if (!options.skipAssistantSelection && typeof options.index === 'number') {
            state.currentCardIndex = options.index;
        }

        const hero = document.getElementById('center-hero');
        const carousel = getPanelEl('ai-carousel-view', p);
        const chatView = getPanelEl('ai-chat-view', p);
        const miniAvatars = getPanelEl('ai-mini-avatars', p);
        const workbench = p.querySelector('.ai-workbench-section');
        const inputSection = p.querySelector('.input-section');
        const sessionScroll = document.getElementById('session-scroll');

        if (hero) hero.classList.add('is-hidden');
        if (carousel) carousel.style.display = 'none';
        if (chatView) {
            chatView.style.display = 'flex';
            chatView.classList.add('is-visible');
        }
        if (miniAvatars) miniAvatars.style.display = 'flex';
        if (workbench) workbench.classList.add('chat-mode');
        if (inputSection) inputSection.classList.add('chat-mode');
        if (sessionScroll) sessionScroll.classList.add('is-chat-active');

        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (messagesEl) bindOverlayScrollbar(messagesEl);

        collapseTopSections(p);
        syncEmployeeMiniAvatars(p);
        if (options.skipAssistantSelection) {
            clearEmployeeAssistantInputSelection(p);
        } else {
            state.exceptionChatActive = false;
            updateEmployeeAssistantSelection(
                useWorkbench ? null : (typeof index === 'number' ? index : null),
                p
            );
        }

        if (createHistory && window.AppShell?.createSession) {
            const assistant = options.skipAssistantSelection
                ? getSupportInputAgentMeta(SUPPORT_INPUT_AGENT_EXCEPTIONS)
                : state.currentExtraAssistantId
                ? getExtraAssistantById(state.currentExtraAssistantId)
                : useWorkbench
                ? WORKBENCH_ASSISTANT
                : (typeof index === 'number' ? getEmployeeAssistant(index, p) : WORKBENCH_ASSISTANT);
            const title = options.sessionTitle || `${assistant?.name || '助手'}对话`;
            const session = window.AppShell.createSession(title, typeof index === 'number' ? index : null, {
                workbenchAssistant: useWorkbench
            });
            state.currentSessionId = session.id;
            window.AppShell.setCurrentSessionId(session.id);
        } else if (options.sessionId) {
            state.currentSessionId = options.sessionId;
            window.AppShell?.setCurrentSessionId?.(options.sessionId);
            window.AppShell?.highlightSessionInSidebar?.(options.sessionId);
        }

        if (options.clearMessages || showWelcome) {
            clearEmployeeChatMessages(p);
        }

        // 刷新会话状态徽章
        window.AppShell?.updateChatStatusBadge?.();

        if (showWelcome) {
            if (state.currentExtraAssistantId) {
                appendExtraAssistantConversation(state.currentExtraAssistantId, p);
            } else if (useWorkbench) {
                appendWorkbenchAssistantWelcome(p);
            } else if (typeof index === 'number') {
                appendAssistantConversation(index, p);
            }
        }

        syncEmployeeChatModeLayout();
        refreshInputSkillPicker(p);
        updateEmployeeInputPlaceholder(p);
        renderChatMembersBar(p);
        // 进入聊天模式时自动展开右侧边栏
        window.AppShell?.expandContextPanel?.();
    }

    function enterChatMode(index, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const skipWelcome = shouldSkipGuidedWelcome(index, p);
        applyEmployeeChatModeUI(p, {
            index,
            showWelcome: !skipWelcome,
            clearMessages: skipWelcome,
            createHistory: true
        });
    }

    function toggleSection(sectionName) {
        const panel = getActiveWorkbenchPanel();
        const key = getPanelKey(panel);
        const sectionId = key === 'employee' ? `${sectionName}-section` : `${sectionName}-section-${key}`;
        const toggleId = key === 'employee' ? `${sectionName}-toggle` : `${sectionName}-toggle-${key}`;
        const section = document.getElementById(sectionId) || panel?.querySelector('#' + sectionId);
        const toggleBtn = document.getElementById(toggleId) || panel?.querySelector('#' + toggleId);
        if (!section || !toggleBtn) return;

        const isCollapsed = section.classList.toggle('collapsed');
        toggleBtn.textContent = isCollapsed ? '展开' : '收起';
    }

    function collapseTopSections(panel) {
        const p = panel || getActiveWorkbenchPanel();
        const key = getPanelKey(p);
        ['work-tips'].forEach((sectionName) => {
            const sectionId = key === 'employee' ? `${sectionName}-section` : `${sectionName}-section-${key}`;
            const toggleId = key === 'employee' ? `${sectionName}-toggle` : `${sectionName}-toggle-${key}`;
            const section = document.getElementById(sectionId) || p?.querySelector('#' + sectionId);
            const toggleBtn = document.getElementById(toggleId) || p?.querySelector('#' + toggleId);
            if (!section) return;
            section.classList.add('collapsed');
            if (toggleBtn) toggleBtn.textContent = '展开';
        });
    }

    window.collapseTopSections = collapseTopSections;
    window.getWorkbenchChatScrollEl = getWorkbenchChatScrollEl;
    window.scrollLastChatCardIntoView = scrollLastChatCardIntoView;

    function selectAssistant(index, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        if (!state.currentExtraAssistantId && index === state.currentCardIndex) return;

        state.currentExtraAssistantId = null;
        state.currentCatalogAssistant = null;
        state.currentInputSkillId = null;
        state.currentCardIndex = index;
        if (getPanelKey(p) === 'employee') {
            updateEmployeeAssistantSelection(index, p);
            collapseTopSections(p);
        } else {
            updateMiniAvatarActive(index, p);
        }
        if (shouldSkipGuidedWelcome(index, p)) {
            clearEmployeeChatMessages(p);
        } else {
            appendAssistantConversation(index, p);
        }
        refreshInputSkillPicker(p);
    }

    function updateMiniAvatarActive(index, panel) {
        const p = panel || getActiveWorkbenchPanel();
        p.querySelectorAll('.ai-mini-avatar').forEach((avatar) => {
            avatar.classList.toggle('active', parseInt(avatar.dataset.index) === index);
        });
    }

    function getEmployeeAssistant(index, panel) {
        const chatIndex = resolveEmployeeChatIndex(index, panel || getActiveWorkbenchPanel());
        return aiAssistants[chatIndex] || aiAssistants[0];
    }

    function buildEmployeeChatAvatarHtml(index, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        if (isWorkbenchAssistantMode(state)) {
            return buildWorkbenchChatAvatarHtml();
        }
        if (state.currentCatalogAssistant) {
            return buildEmployeeCatalogChatAvatarHtml(state.currentCatalogAssistant);
        }
        if (state.currentExtraAssistantId) {
            const extra = getExtraAssistantById(state.currentExtraAssistantId);
            if (extra) {
                return buildEmployeeBotAvatarHtml(extra.name, getEmployeeAssistantAvatarKey(extra));
            }
        }
        const homeAgent = getEmployeeHomeAssistant(index, p);
        if (homeAgent) {
            return buildEmployeeBotAvatarHtml(homeAgent.name, getEmployeeAssistantAvatarKey(homeAgent));
        }
        const assistant = getEmployeeAssistant(index, p);
        return buildEmployeeBotAvatarHtml(assistant.name, getEmployeeAssistantAvatarKey(assistant));
    }

    function appendExtraAssistantConversation(extraId, panel, options = {}) {
        const p = panel || getActiveWorkbenchPanel();
        const extra = getExtraAssistantById(extraId);
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!extra || !messagesEl) return;

        const blockId = `chat-block-${Date.now()}`;
        const block = document.createElement('div');
        block.className = 'chat-conversation-block';
        block.id = blockId;
        block.dataset.extraAssistantId = extraId;

        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-row chat-row-assistant';
        const contentHtml = getExtraAssistantWelcomeHtml(extra.chatIndex);
        aiMsg.innerHTML = `
            ${buildEmployeeBotAvatarHtml(extra.name, getEmployeeAssistantAvatarKey(extra))}
            <div class="chat-bubble chat-bubble-assistant">${buildEmployeeAssistantBubbleContent(contentHtml, { html: true, extraAssistantId: extraId }, p)}</div>
        `;
        block.appendChild(aiMsg);

        messagesEl.appendChild(block);
        scrollLastChatCardIntoView(p, {
            card: block.querySelector('.chat-row-assistant') || block,
            padding: 8
        });

        if (getPanelKey(p) === 'employee' && !options.skipPersist) {
            recordEmployeeChatMessage(p, {
                role: 'assistant',
                type: 'welcome',
                extraAssistantId: extraId,
                text: extra.name
            });
        }
    }

    function appendAssistantConversation(index, panel, options = {}) {
        const p = panel || getActiveWorkbenchPanel();
        const chatIndex = resolveEmployeeChatIndex(index, p);
        const assistant = aiAssistants[chatIndex];
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;

        if (shouldSkipGuidedWelcome(index, p)) return;

        const blockId = `chat-block-${Date.now()}`;
        if (EmployeeModelGuide.usesIbModelGuide(chatIndex)) {
            EmployeeModelGuide.reset(p, chatIndex);
        }

        const block = document.createElement('div');
        block.className = 'chat-conversation-block';
        block.id = blockId;
        block.dataset.assistantIndex = index;

        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-row chat-row-assistant';
        const contentHtml = EmployeeModelGuide.getWelcomeHtml(blockId, chatIndex);
        aiMsg.innerHTML = `
            ${buildEmployeeChatAvatarHtml(index, p)}
            <div class="chat-bubble chat-bubble-assistant">${buildEmployeeAssistantBubbleContent(contentHtml, { html: true, assistantIndex: index }, p)}</div>
        `;
        block.appendChild(aiMsg);

        messagesEl.appendChild(block);
        scrollLastChatCardIntoView(p, {
            card: block.querySelector('.chat-row-assistant') || block,
            padding: 8
        });

        if (getPanelKey(p) === 'employee' && !options.skipPersist) {
            recordEmployeeChatMessage(p, {
                role: 'assistant',
                type: 'welcome',
                assistantIndex: index,
                text: assistant?.name || '助手'
            });
        }
    }

    function resolveChatContextBundle(replyText, options = {}) {
        const text = String(replyText || '');
        const chatIndex = typeof options.chatIndex === 'number'
            ? options.chatIndex
            : (typeof options.assistantIndex === 'number' ? options.assistantIndex : null);
        const userMessage = options.userMessage || '';

        if (/^\*\*待办事项助手\*\*/.test(text.trim()) && /名下待审批事项|待审批事项/.test(text)) {
            return buildApprovalContextBundle();
        }
        if (/^\*\*通知公告助手\*\*/.test(text.trim()) && /最新通知公告/.test(text)) {
            return buildNoticeDocumentContextBundle();
        }
        if (isApprovalProgressPrompt(userMessage) && chatIndex === 5) {
            return buildApprovalContextBundle();
        }
        if (isNoticeDocumentSummaryPrompt(userMessage) && chatIndex === 6) {
            return buildNoticeDocumentContextBundle();
        }

        const fromFlow = window.EmployeeCustomerIbFlow?.resolveContextBundle?.(
            replyText,
            chatIndex ?? 0,
            userMessage
        );
        if (window.ContextPanel?.bundleHasItems?.(fromFlow)) {
            return fromFlow;
        }
        const extracted = window.ContextPanel?.extractBundleFromMarkdown?.(replyText, {
            assistantIndex: chatIndex ?? 0,
            userMessage
        });
        if (window.ContextPanel?.bundleHasItems?.(extracted)) {
            return extracted;
        }
        return null;
    }

    function stripLeadingAssistantTitleMarkdown(text, assistantName) {
        if (!text || !assistantName) return text;
        const lines = String(text).split('\n');
        const first = lines[0]?.trim() || '';
        if (first === `**${assistantName}**`) {
            return lines.slice(1).join('\n').replace(/^\n+/, '');
        }
        return text;
    }

    function stripLeadingAssistantTitleHtml(html, assistantName) {
        if (!html || !assistantName) return html;
        const escaped = escapeHtml(assistantName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return String(html).replace(new RegExp(`^\\s*<p><strong>${escaped}<\\/strong><\\/p>\\s*`, 'i'), '')
            .replace(new RegExp(`^\\s*<p class="chat-assistant-name">${escaped}<\\/p>\\s*`, 'i'), '');
    }

    function buildEmployeeAssistantBubbleContent(text, options = {}, panel) {
        const meta = resolveEmployeeMessageAvatarMeta(options, text, panel);
        const name = meta.name || '助手';
        let bodyHtml = options.html ? String(text || '') : markdownToHtml(stripLeadingAssistantTitleMarkdown(text, name));
        bodyHtml = stripLeadingAssistantTitleHtml(bodyHtml, name);
        return `<p class="chat-assistant-name">${escapeHtml(name)}</p>${bodyHtml}`;
    }

    function syncAssistantMessageContext(bubble, replyText, options = {}) {
        if (!bubble || !window.ContextPanel?.attachSnapshotToBubble) return;
        const bundle = resolveChatContextBundle(replyText, options);
        if (!bundle) return;
        window.ContextPanel.attachSnapshotToBubble(bubble, bundle);
    }

    function appendChatMessage(text, role, panel, options = {}) {
        const p = panel || getActiveWorkbenchPanel();
        const messagesEl = getPanelEl('ai-chat-messages', p);
        if (!messagesEl) return;

        const row = document.createElement('div');
        row.className = role === 'user' ? 'chat-row chat-row-user' : 'chat-row chat-row-assistant';

        if (role === 'user') {
            const userAvatarHtml = getPanelKey(p) === 'employee' ? buildEmployeeUserAvatarHtml(p) : '';
            row.innerHTML = `<div class="chat-bubble chat-bubble-user">${escapeHtml(text)}</div>${userAvatarHtml}`;
            if (getPanelKey(p) === 'employee') {
                collapseTopSections(p);
            }
        } else {
            const avatarHtml = buildEmployeeMessageAvatarHtml(options, text, p);
            const assistantBody = getPanelKey(p) === 'employee'
                ? buildEmployeeAssistantBubbleContent(text, options, p)
                : (options.html ? text : markdownToHtml(text));
            row.innerHTML = `
                ${avatarHtml}
                <div class="chat-bubble chat-bubble-assistant">${assistantBody}</div>
            `;
        }

        const lastBlock = messagesEl.querySelector('.chat-conversation-block:last-of-type');
        (lastBlock || messagesEl).appendChild(row);
        scrollWorkbenchChatToBottom(p);

        // 刷新滚动条标记
        window.ChatScrollMarkers?.refresh?.();

        if (role === 'assistant') {
            const bubble = row.querySelector('.chat-bubble-assistant');
            syncAssistantMessageContext(bubble, text, {
                assistantIndex: options.assistantIndex,
                chatIndex: options.chatIndex,
                userMessage: options.userMessage || ''
            });
        }

        if (getPanelKey(p) === 'employee' && !options.skipPersist) {
            const persistMeta = buildEmployeeChatPersistMeta(role, options, text, p);
            recordEmployeeChatMessage(p, {
                role,
                text,
                html: !!options.html,
                ...persistMeta
            });
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getAssistantReply(message, index, panel, options = {}) {
        const p = panel || getActiveWorkbenchPanel();
        const chatIndex = typeof options.chatIndex === 'number'
            ? options.chatIndex
            : resolveEmployeeChatIndexForReply(p);
        const assistant = aiAssistants[chatIndex];
        const lowerMsg = message.toLowerCase();

        if (chatIndex === 0) {
            if (lowerMsg.includes('分析') || lowerMsg.includes('客户') || lowerMsg.includes('分层') || lowerMsg.includes('资产')) {
                return `**客户分析助手**\n\n任务：对「${message}」执行客户多维分析。\n\n补充：资产规模、交易行为、合作记录、风险测评结果等维度。`;
            }
            return `**客户分析助手**\n\n从资产、行为、交易、合作记录等维度分析客户价值与风险。\n\n输入：客户名称、客户类型或分析维度。`;
        }
        if (chatIndex === 1) {
            return `**业务分析助手**\n\n任务：处理「${message}」。\n\n操作：选择业务类型，按业务分析模型继续。`;
        }
        if (chatIndex === 2) {
            return `**方案生成助手**\n\n任务：处理「${message}」。\n\n操作：选择业务类型，按方案设计模型继续。`;
        }
        if (chatIndex === 3) {
            return `**交叉验证助手**\n\n任务：对「${message}」执行交叉验证。\n\n补充：方案文档或数据来源。`;
        }
        if (chatIndex === 4) {
            return `**客户服务助手**\n\n任务：处理「${message}」。\n\n操作：选择买方分析、信披判断或临时公告生成模型。`;
        }
        if (chatIndex === 5) {
            if (isApprovalProgressPrompt(message)) {
                return buildApprovalProgressReply(message);
            }
            if (lowerMsg.includes('进度') || lowerMsg.includes('查询') || lowerMsg.includes('单号')) {
                return `**待办事项助手**\n\n任务：查询「${message}」相关审批进度。\n\n结果：当前节点为部门负责人审批，预计 1 个工作日内完成。`;
            }
            if (lowerMsg.includes('催办') || lowerMsg.includes('提醒')) {
                return `**待办事项助手**\n\n任务：对「${message}」发起催办提醒。\n\n操作：已通知当前审批人，并记录催办时间。`;
            }
            return `**待办事项助手**\n\n任务：处理「${message}」。\n\n操作：查询审批进度、发起审批申请或催办提醒。`;
        }
        if (chatIndex === 6) {
            if (isNoticeDocumentSummaryPrompt(message)) {
                return buildNoticeDocumentSummaryReply(message);
            }
            if (lowerMsg.includes('起草') || lowerMsg.includes('编写') || lowerMsg.includes('撰写')) {
                return `**通知公告助手**\n\n任务：根据「${message}」起草通知公告。\n\n建议结构：标题、发布范围、正文要点、生效时间与联系人。`;
            }
            if (lowerMsg.includes('发布') || lowerMsg.includes('记录')) {
                return `**通知公告助手**\n\n任务：查询「${message}」相关发布记录。\n\n操作：可按时间、部门或关键词筛选历史公告。`;
            }
            return `**通知公告助手**\n\n任务：处理「${message}」。\n\n操作：起草通知公告、查询发布记录或格式校验。`;
        }

        return `**${assistant?.name || '助手'}**\n\n任务：处理「${message}」。`;
    }

    function handleEmployeeAssistantMessage(message, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        if (state.currentTopBusinessAssistant) {
            const assistant = getTopBusinessAssistant(state.currentTopBusinessAssistant);
            setTimeout(() => {
                appendChatMessage(
                    getTopBusinessAssistantReply(message, assistant),
                    'assistant',
                    p,
                    {
                        assistantAvatarKey: assistant?.avatarKey,
                        assistantDisplayName: assistant?.name,
                        userMessage: message
                    }
                );
            }, 400);
            return;
        }
        if (isWorkbenchAssistantMode(state)) {
            setTimeout(() => {
                const reply = getWorkbenchAssistantReply(message);
                appendChatMessage(reply, 'assistant', p, { workbenchAssistant: true });
                const detected = detectSessionStatus(message, reply);
                if (detected) {
                    const sid = window.AppShell?.getCurrentSessionId?.();
                    if (sid) window.AppShell?.setSessionStatus?.(sid, detected);
                }
            }, 400);
            return;
        }
        if (state.currentExtraAssistantId) {
            const extra = getExtraAssistantById(state.currentExtraAssistantId);
            setTimeout(() => {
                appendChatMessage(
                    getAssistantReply(message, 0, p, { chatIndex: extra?.chatIndex ?? 5 }),
                    'assistant',
                    p,
                    {
                        chatIndex: extra?.chatIndex ?? 5,
                        extraAssistantId: extra?.id,
                        userMessage: message
                    }
                );
            }, 400);
            return;
        }
        const assistantIndex = typeof state.currentCardIndex === 'number' ? state.currentCardIndex : 0;
        if (window.EmployeeCustomerIbFlow?.usesGuidedFlow?.(assistantIndex)) {
            setTimeout(() => {
                const reply = sanitizeTaoLanguageText(window.EmployeeCustomerIbFlow.getReply(message, assistantIndex));
                const chatIndex = resolveEmployeeChatIndex(assistantIndex, p);
                appendChatMessage(reply, 'assistant', p, {
                    assistantIndex,
                    chatIndex,
                    userMessage: message
                });
            }, 400);
            return;
        }
        EmployeeModelGuide.handleUserMessage(message, p);
    }

    function cancelSolutionSelect(blockId) {
        appendChatMessage('**方案生成助手**\n\n操作：方案类型选择已取消。', 'assistant');
    }

    function confirmSolutionSelect(blockId) {
        const selected = document.querySelector(`input[name="solution-type-${blockId}"]:checked`);
        if (!selected) {
            alert('请先选择方案类型');
            return;
        }
        const labels = { bankruptcy: '破产重整', placement: '定增', bond: '债券', asset: '资管产品' };
        appendChatMessage(`**方案生成助手**\n\n已选：${labels[selected.value]}。\n\n补充：项目背景与客户信息。`, 'assistant');
    }

    function bringToFront(clickedCard) {
        const panel = clickedCard.closest('.workbench-panel');
        if (getPanelKey(panel) === 'employee') {
            const clickedIndex = parseInt(clickedCard.dataset.index, 10);
            if (!Number.isNaN(clickedIndex)) {
                selectEmployeeAssistant(clickedIndex, panel);
            }
            return;
        }
        const state = getPanelState(panel);
        const clickedIndex = parseInt(clickedCard.dataset.index);
        const allCards = panel.querySelectorAll('.ai-card-fan');
        const indicators = panel.querySelectorAll('.indicator');

        allCards.forEach(card => card.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        clickedCard.classList.add('active');
        if (indicators[clickedIndex]) indicators[clickedIndex].classList.add('active');

        if (!state.chatModeActive) {
            setTimeout(() => enterChatMode(clickedIndex, panel), 150);
        } else {
            selectEmployeeAssistant(clickedIndex, panel);
        }
    }

    // 根据卡片索引打开对应的详情页面（保留供关键词路由使用）
    function openCardDetailPage(index) {
        const panel = getActiveWorkbenchPanel();
        const state = getPanelState(panel);
        if (!state.chatModeActive) {
            enterChatMode(index, panel);
            return;
        }
        selectEmployeeAssistant(index, panel);
    }
    
    // ========== 军师方案设计功能 ==========
    
    // 打开军师方案设计页面
    function openJunshiDetail() {
        const junshiPage = document.getElementById('junshi-page');
        junshiPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // ========== 智能工作台输入功能 ==========
    
    // AI助手关键词映射
    const aiAssistantKeywords = {
        junshi: {
            keywords: ['方案设计', '方案设计模型', '方案生成', '重整方案', '定增方案', '债券发行', '发行方案', '融资方案', '出方案', '发行规模', '发行价格'],
            name: '方案生成助手',
            action: () => {
                enterChatMode(2);
            }
        },
        tanma: {
            keywords: ['业务分析', '业务分析模型', '找目标', '基本标准', '公司标准', '股东与实控人'],
            name: '业务分析助手',
            action: () => {
                enterChatMode(1);
            }
        },
        canmou: {
            keywords: ['客户分析', '合作意图', '客户价值', '客户关系', '客户风险', '潜在客户', '客户跟进', '客户分层', '企业客户', '个人客户', '交易行为', '合作记录', '资产规模'],
            name: '客户分析助手',
            action: () => {
                enterChatMode(0);
            }
        },
        tianyan: {
            keywords: ['客户服务', '买方分析', '信披判断', '临时公告', '公告生成', '识信披', '写公告', '找买方'],
            name: '客户服务助手',
            action: () => {
                enterChatMode(4);
            }
        },
        jiaocha: {
            keywords: ['交叉验证', '交叉验证模型', '核异常', '验证', '复核', '比对', '核验', '财务数据异常', '治理结构'],
            name: '交叉验证助手',
            action: () => {
                enterChatMode(3);
            }
        }
    };
    
    const employeeAssistantIndexByKey = {
        canmou: 0,
        tanma: 1,
        junshi: 2,
        jiaocha: 3,
        tianyan: 4
    };

    function resolveEmployeeAssistantIndexFromMessage(message) {
        const lowerMessage = message.toLowerCase();
        for (const [key, assistant] of Object.entries(aiAssistantKeywords)) {
            for (const keyword of assistant.keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    return employeeAssistantIndexByKey[key] ?? 0;
                }
            }
        }
        const guideIndex = EmployeeModelGuide.matchAssistantFromMessage(message);
        if (guideIndex != null) return guideIndex;
        if (EmployeeModelGuide.matchBusinessFromMessage(message)) return 1;
        return 0;
    }

    function shouldShowEmployeeRoutingToast(message) {
        return !!recognizeIntent(message)
            || EmployeeModelGuide.matchAssistantFromMessage(message) != null
            || !!EmployeeModelGuide.matchBusinessFromMessage(message);
    }

    function startEmployeeChatFromMainInput(message, panel) {
        const p = panel || getActiveWorkbenchPanel();
        const state = getPanelState(p);
        const hasMainSelection = typeof state.currentCardIndex === 'number' && state.currentCardIndex >= 0;
        const extraAssistant = state.currentExtraAssistantId ? getExtraAssistantById(state.currentExtraAssistantId) : null;
        const workbenchMode = !extraAssistant && !hasMainSelection;
        // 消息中 @ 了员工时，仅由被 @ 员工在群聊中回复，工作台/助手不再自动回复卡片
        const hasMentionedEmployee = parseMentionedEmployeesFromText(message, p).length > 0;

        if (workbenchMode) {
            applyEmployeeChatModeUI(p, {
                useWorkbenchAssistant: true,
                showWelcome: false,
                clearMessages: true,
                createHistory: true,
                sessionTitle: message.length > 30 ? `${message.slice(0, 30)}…` : message
            });
            appendChatMessage(message, 'user', p);
            if (!hasMentionedEmployee) handleEmployeeAssistantMessage(message, p);
            return;
        }

        if (extraAssistant) {
            applyEmployeeChatModeUI(p, {
                showWelcome: false,
                clearMessages: true,
                createHistory: true,
                sessionTitle: message.length > 30 ? `${message.slice(0, 30)}…` : message
            });
            appendChatMessage(message, 'user', p);
            if (!hasMentionedEmployee) handleEmployeeAssistantMessage(message, p);
            return;
        }

        const selectedIndex = state.currentCardIndex;
        const routedIndex = resolveEmployeeAssistantIndexFromMessage(message);
        const targetIndex = selectedIndex;
        const assistantName = extraAssistant?.name
            || aiAssistants[resolveEmployeeChatIndex(targetIndex, p)]?.name
            || aiAssistants[targetIndex]?.name
            || '客户分析助手';

        if (hasMainSelection && routedIndex !== selectedIndex && shouldShowEmployeeRoutingToast(message)) {
            showRecognitionToast(aiAssistants[routedIndex]?.name || assistantName, message);
        }

        applyEmployeeChatModeUI(p, {
            index: targetIndex,
            showWelcome: false,
            clearMessages: true,
            createHistory: true,
            sessionTitle: message.length > 30 ? `${message.slice(0, 30)}…` : message
        });
        updateEmployeeAssistantSelection(targetIndex, p);
        appendChatMessage(message, 'user', p);
        if (!hasMentionedEmployee) handleEmployeeAssistantMessage(message, p);
    }

    // 处理主输入框回车键
    function handleMainInput(event) {
        const panel = getActiveWorkbenchPanel();
        const mentionMenu = panel?.querySelector?.('.input-at-mention-menu');
        if (mentionMenu && !mentionMenu.hidden) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
            }
            return;
        }
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMainMessage();
        }
    }

    function handleSupportSidebarAction(action) {
        if (!document.body.classList.contains('support-tab-active')) {
            switchWorkbenchTab('support');
        }
        const panel = document.getElementById('workbench-panel-support') || getActiveWorkbenchPanel();
        if (!panel) return;

        if (action === 'exceptions') {
            localStorage.setItem('workbench_support_exceptions_read', 'true');
        } else if (action === 'approval') {
            localStorage.setItem('workbench_support_approval_read', 'true');
        }
        updateSupportSidebarNavCounts();

        window.AppShell?.returnToMainSessionView?.({ resetChat: false });

        const titleMap = {
            'today-tasks': '今日任务',
            exceptions: '异常提醒',
            approval: '待办事项',
            announcement: '通知公告'
        };
        const sessionTitle = titleMap[action] || '业务支持对话';
        const messagesEl = getPanelEl('ai-chat-messages', panel);
        const state = getPanelState(panel);
        if (messagesEl) messagesEl.innerHTML = '';
        state.supportChatMessages = [];
        state.currentSessionId = null;
        state.currentTaskAgentId = null;
        state.currentTask = null;
        state.currentTodoStep = null;

        let agentId = null;
        let userMessage = `查看${sessionTitle}`;
        let assistantMessage = '';
        let assistantOptions = { html: true };

        if (action === 'today-tasks') {
            agentId = SUPPORT_INPUT_AGENT_DAILY_TASK;
            assistantMessage = buildSupportDailyTasksSummaryHtml({ forChatCard: true });
        } else if (action === 'exceptions') {
            agentId = SUPPORT_INPUT_AGENT_EXCEPTIONS;
            assistantMessage = buildSupportAllExceptionsChatHtml();
        } else if (action === 'approval') {
            agentId = 'shenpi';
            userMessage = EMPLOYEE_ASSISTANT_INPUT_PROMPTS.shenpi;
            assistantMessage = buildApprovalProgressReply(userMessage);
            assistantOptions = {};
        } else if (action === 'announcement') {
            agentId = 'tongzhi';
            userMessage = EMPLOYEE_ASSISTANT_INPUT_PROMPTS.tongzhi;
            assistantMessage = buildNoticeDocumentSummaryReply(userMessage);
            assistantOptions = {};
        }

        if (agentId) {
            setSupportInputAgent(panel, agentId);
        } else {
            deselectSupportInputAssistant(panel);
        }

        enterSupportChatMode(panel);
        appendSupportChatMessage(userMessage, 'user', panel);
        setTimeout(() => {
            appendSupportChatMessage(assistantMessage, 'assistant', panel, {
                ...assistantOptions,
                agentId,
                userMessage
            });
        }, 300);
    }

    function handleEmployeeSidebarAction(action) {
        if (document.body.classList.contains('support-tab-active') || document.body.classList.contains('org-tab-active')) {
            switchWorkbenchTab('employee');
        }
        const panel = document.getElementById('workbench-panel-employee') || getActiveWorkbenchPanel();
        if (!panel) return;

        if (action === 'exceptions') {
            localStorage.setItem('workbench_employee_exceptions_read', 'true');
        } else if (action === 'approval') {
            localStorage.setItem('workbench_employee_approval_read', 'true');
        }
        updateEmployeeSidebarNavCounts();

        window.AppShell?.returnToMainSessionView?.({ resetChat: false });

        const titleMap = {
            'today-tasks': '今日任务',
            exceptions: '异常提醒',
            travel: '差旅分析',
            approval: '待办事项',
            announcement: '通知公告'
        };

        const sessionTitle = titleMap[action] || '新会话';
        deselectEmployeeInputAssistant(panel);
        applyEmployeeChatModeUI(panel, {
            useWorkbenchAssistant: true,
            showWelcome: false,
            clearMessages: true,
            createHistory: true,
            sessionTitle
        });

        let userMessage = `查看${sessionTitle}`;
        if (action === 'approval') userMessage = EMPLOYEE_ASSISTANT_INPUT_PROMPTS.shenpi;
        if (action === 'announcement') userMessage = EMPLOYEE_ASSISTANT_INPUT_PROMPTS.tongzhi;

        appendChatMessage(userMessage, 'user', panel);

        if (action === 'today-tasks') {
            appendChatMessage(buildEmployeeAllDailyTasksChatHtml(), 'assistant', panel, {
                html: true,
                assistantAvatarKey: 'tasks',
                assistantDisplayName: '今日任务助手',
                userMessage
            });
            return;
        }
        if (action === 'exceptions') {
            appendChatMessage(buildEmployeeAllExceptionsChatHtml(), 'assistant', panel, {
                html: true,
                assistantAvatarKey: 'exceptions',
                assistantDisplayName: '异常提醒助手',
                userMessage
            });
            return;
        }
        if (action === 'travel') {
            const html = typeof window.buildTravelAnalysisSummaryChatHtml === 'function'
                ? window.buildTravelAnalysisSummaryChatHtml()
                : `<p class="chat-md-h2">差旅分析</p><p>当前暂无可用的差旅分析汇总。</p>`;
            appendChatMessage(html, 'assistant', panel, {
                html: true,
                assistantAvatarKey: 'travel',
                assistantDisplayName: '差旅分析助手',
                userMessage
            });
            return;
        }
        if (action === 'approval') {
            appendChatMessage(buildApprovalProgressReply(userMessage), 'assistant', panel, {
                chatIndex: 5,
                assistantAvatarKey: 'approval',
                assistantDisplayName: '待办事项助手',
                userMessage
            });
            return;
        }
        if (action === 'announcement') {
            appendChatMessage(buildNoticeDocumentSummaryReply(userMessage), 'assistant', panel, {
                chatIndex: 6,
                assistantAvatarKey: 'tongzhi',
                assistantDisplayName: '通知公告助手',
                userMessage
            });
        }
    }

    window.WorkbenchMenuActions = {
        handleEmployeeSidebarAction,
        handleSupportSidebarAction
    };
    
    // 发送消息并智能路由
    function sendMainMessage(overrideMsg) {
        const panel = getActiveWorkbenchPanel();
        const input = getPanelEl('main-chat-input', panel);
        const raw = (overrideMsg || input?.value || '').trim();
        if (!raw) {
            return;
        }
        const message = formatMessageWithSelectedSkill(raw, panel);
        
        if (input) input.value = '';
        syncMainSendButtonState(panel);

        // 检查是否为状态修改命令：/状态 推进中
        const statusCmd = parseStatusCommand(raw);
        if (statusCmd) {
            appendChatMessage(raw, 'user', panel);
            const sid = window.AppShell?.getCurrentSessionId?.();
            if (sid) {
                window.AppShell?.setSessionStatus?.(sid, statusCmd);
                appendChatMessage(`已将会话状态修改为「${statusCmd}」`, 'assistant', panel);
            }
            return;
        }

        if (getPanelKey(panel) === 'org') {
            appendOrgChatMessage(message, 'user', panel);
            setTimeout(() => {
                const agentId = getPanelState(panel).currentOrgAgent;
                const reply = agentId
                    ? getOrgAgentReply(message, agentId)
                    : getOrgDefaultPromptReply(message);
                appendOrgChatMessage(reply, 'assistant', panel);
            }, 400);
            return;
        }

        if (getPanelKey(panel) === 'support') {
            const supportState = getPanelState(panel);
            if (supportState.chatModeActive) {
                appendSupportChatMessage(message, 'user', panel);
                handleSupportAssistantMessage(message, panel);
            } else {
                startSupportChatFromMainInput(message, panel);
            }
            return;
        }

        if (getPanelState(panel).chatModeActive) {
            appendChatMessage(message, 'user', panel);
            // 消息中 @ 了员工时，仅由被 @ 员工在群聊中回复，工作台助手不再自动回复卡片
            const hasMentionedEmployee = parseMentionedEmployeesFromText(message, panel).length > 0;
            if (!hasMentionedEmployee) {
                if (getPanelKey(panel) === 'employee') {
                    handleEmployeeAssistantMessage(message, panel);
                    // 发送消息后清除顶部业务助理 @chip
                    const empState = getPanelState(panel);
                    if (empState.currentTopBusinessAssistant) {
                        empState.currentTopBusinessAssistant = null;
                        updateTopAvatarActive(null);
                        updateEmployeeInputPlaceholder(panel);
                    }
                } else {
                    setTimeout(() => {
                        const reply = getAssistantReply(message, getPanelState(panel).currentCardIndex, panel);
                        appendChatMessage(reply, 'assistant', panel);
                        // AI 智能判断会话状态
                        const detected = detectSessionStatus(message, reply);
                        if (detected) {
                            const sid = window.AppShell?.getCurrentSessionId?.();
                            if (sid) window.AppShell?.setSessionStatus?.(sid, detected);
                        }
                    }, 400);
                }
            }
            scheduleMentionedEmployeeReplies(message, panel);
            return;
        }

        startEmployeeChatFromMainInput(message, panel);
        // 从主页首次发送后清除顶部业务助理 @chip
        if (getPanelKey(panel) === 'employee') {
            const empState = getPanelState(panel);
            if (empState.currentTopBusinessAssistant) {
                empState.currentTopBusinessAssistant = null;
                updateTopAvatarActive(null);
                updateEmployeeInputPlaceholder(panel);
            }
        }
        scheduleMentionedEmployeeReplies(message, panel);
    }
    
    // 语音识别输入
    function getInputContainer(panel) {
        const p = panel || getActiveWorkbenchPanel();
        return p?.querySelector('.input-container');
    }

    function startMainFileUpload() {
        const panel = getActiveWorkbenchPanel();
        const fileInput = getPanelEl('main-chat-file-input', panel);
        fileInput?.click();
    }

    // 发起新会话（与当前会话关联）
    function startNewRelatedSession() {
        const parentSessionId = window.AppShell?.getCurrentSessionId?.();
        // 创建新会话并双向关联
        const newSession = window.AppShell?.createRelatedSession?.('关联新对话');
        if (!newSession) return;
        // 重置当前对话窗口
        const panel = getActiveWorkbenchPanel();
        if (panel) {
            const messagesEl = getPanelEl('ai-chat-messages', panel);
            if (messagesEl) messagesEl.innerHTML = '';
            const chatView = getPanelEl('ai-chat-view', panel);
            if (chatView) {
                chatView.classList.add('is-visible');
                chatView.style.display = '';
            }
            const state = getPanelState(panel);
            state.chatMessages = [];
            state.mentionedEmployees = [];
            renderChatMembersBar(panel);
            updateEmployeeInputPlaceholder(panel);
        }
        // 重置右栏上下文
        window.ContextPanel?.reset?.();
        window.AppShell?.expandContextPanel?.();
        // 切换到关联会话 Tab 以展示关联关系
        window.ContextPanel?.switchContextTab?.('related');
        // 提示
        const input = getPanelEl('main-chat-input', panel);
        input?.focus();
    }

    function handleMainFileUpload(input) {
        const file = input.files?.[0];
        if (!file) return;
        input.value = '';

        const panel = getActiveWorkbenchPanel();
        const message = `📎 ${file.name}`;
        const key = getPanelKey(panel);

        // 记录到右栏输入物
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const kindMap = { pdf: 'pdf', doc: 'word', docx: 'word', ppt: 'ppt', pptx: 'ppt', txt: 'txt' };
        window.ContextPanel?.addInput?.({
            fileName: file.name,
            fileKind: kindMap[ext] || 'txt',
            sizeText: file.size > 1024 * 1024 ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB'
        });

        if (key === 'org') {
            appendOrgChatMessage(message, 'user', panel);
            setTimeout(() => {
                const agentId = getPanelState(panel).currentOrgAgent;
                const reply = agentId
                    ? `已收到文件「${file.name}」，我将结合${getOrgAgent(agentId).name}能力为你提取关键信息并协助处理。`
                    : `已收到文件「${file.name}」，我将为你提取关键信息并协助后续处理。`;
                appendOrgChatMessage(reply, 'assistant', panel);
            }, 400);
            return;
        }

        if (key === 'support') {
            const supportState = getPanelState(panel);
            if (supportState.chatModeActive) {
                appendSupportChatMessage(message, 'user', panel);
                setTimeout(() => {
                    if (isSupportWorkbenchAssistantMode(supportState)) {
                        appendSupportChatMessage(
                            `**工作台助手**\n\n已收到文件「${file.name}」，我将为你提取关键信息并协助后续处理。`,
                            'assistant',
                            panel,
                            { workbenchAssistant: true }
                        );
                    } else {
                        appendSupportAssistantReply(
                            `已收到文件「${file.name}」，我将结合当前任务为你解析内容。`,
                            getSupportInputReplyAgentId(supportState),
                            panel
                        );
                    }
                }, 400);
            } else {
                startSupportChatFromMainInput(message, panel);
            }
            return;
        }

        if (getPanelState(panel).chatModeActive) {
            appendChatMessage(message, 'user');
            setTimeout(() => {
                const idx = getPanelState(panel).currentCardIndex ?? 0;
                const name = getEmployeeAssistant(idx, panel).name;
                appendChatMessage(`**${name}**\n\n文件：${file.name}\n\n操作：提取关键信息并继续处理。`, 'assistant', panel);
            }, 400);
            return;
        }

        startEmployeeChatFromMainInput(message, panel);
    }

    function startMainVoiceInput() {
        const panel = getActiveWorkbenchPanel();
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'zh-CN';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = function() {
                getInputContainer(panel)?.classList.add('is-recording');
                const input = getPanelEl('main-chat-input', panel);
                input.placeholder = '正在聆听...';
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                const input = getPanelEl('main-chat-input', panel);
                input.value = transcript;
                input.placeholder = getMainInputDefaultPlaceholder(panel);
                
                // 自动发送
                setTimeout(() => {
                    sendMainMessage();
                }, 500);
            };
            
            recognition.onerror = function() {
                getInputContainer(panel)?.classList.remove('is-recording');
                const input = getPanelEl('main-chat-input', panel);
                if (input) input.placeholder = getMainInputDefaultPlaceholder(panel);
                alert('语音识别出错，请手动输入');
            };
            
            recognition.onend = function() {
                getInputContainer(panel)?.classList.remove('is-recording');
                const input = getPanelEl('main-chat-input', panel);
                if (input) input.placeholder = getMainInputDefaultPlaceholder(panel);
            };
            
            recognition.start();
        } else {
            alert('你的浏览器不支持语音输入');
        }
    }
    
    // 识别用户意图
    function recognizeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // 遍历所有AI助手，检查关键词匹配
        for (const [key, assistant] of Object.entries(aiAssistantKeywords)) {
            for (const keyword of assistant.keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    return assistant;
                }
            }
        }
        
        return null;
    }
    
    // 显示识别提示
    function showRecognitionToast(assistantName, message) {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = 'ai-recognition-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">🤖</span>
                <div class="toast-text">
                    <p class="toast-title">已识别你的意图</p>
                    <p class="toast-detail">"${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"</p>
                    <p class="toast-assistant">路由至 <strong>${assistantName}</strong></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 动画显示
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // 3秒后移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2500);
    }
    
    // 显示通用帮助
    function showGeneralHelp() {
        const helpText = `💡 助手与模型清单对应关系：

🐎 业务分析助手 → 业务分析模型（找目标）
📋 方案生成助手 → 方案设计模型（出方案）
🔍 交叉验证助手 → 交叉验证模型（核异常）
👁️ 客户服务助手 → 客户服务（买方分析 / 信披判断 / 临时公告生成）

🧠 客户分析助手 → 客户多维分析（不走投行模型清单）

示例：
• "分析某企业客户合作价值" → 客户分析助手
• "定增业务分析" → 业务分析助手
• "设计IPO发行方案" → 方案生成助手
• "交叉验证财务异常" → 交叉验证助手
• "生成临时公告" → 客户服务助手`;
        
        alert(helpText);
    }
    
    // 初始化拖拽功能
    function initDragAndDrop() {
        const draggables = document.querySelectorAll('.center-item.draggable');
        const seats = document.querySelectorAll('.seat.empty-seat');
        
        // 为可拖拽元素添加事件
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', handleDragStart);
            draggable.addEventListener('dragend', handleDragEnd);
        });
        
        // 为座椅添加拖放事件
        seats.forEach(seat => {
            seat.addEventListener('dragover', handleDragOver);
            seat.addEventListener('dragenter', handleDragEnter);
            seat.addEventListener('dragleave', handleDragLeave);
            seat.addEventListener('drop', handleDrop);
            
            // 触摸设备支持
            seat.addEventListener('click', function() {
                if (selectedCenter) {
                    placeCenterInSeat(seat, selectedCenter);
                }
            });
        });
    }
    
    let selectedCenter = null;
    let draggedElement = null;
    
    function handleDragStart(e) {
        draggedElement = this;
        selectedCenter = this.dataset.centerType;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.centerType);
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedElement = null;
        
        // 移除所有高亮
        document.querySelectorAll('.seat').forEach(seat => {
            seat.classList.remove('drag-over');
        });
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        if (!this.classList.contains('occupied')) {
            this.classList.add('drag-over');
        }
    }
    
    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const centerType = e.dataTransfer.getData('text/plain');
        const centerElement = document.querySelector(`[data-center-type="${centerType}"]`);
        
        if (centerElement && !this.classList.contains('occupied')) {
            placeCenterInSeat(this, centerElement);
        }
    }
    
    // 放置支持中心到座椅
    function placeCenterInSeat(seat, centerElement) {
        const seatId = seat.dataset.seatId;
        const centerType = centerElement.dataset.centerType;
        const centerInfo = roundTableState.centers[centerElement.id];
        
        // 检查该座椅是否已有占用
        if (roundTableState.seats[seat.id]) {
            return;
        }
        
        // 检查该中心是否已被放置
        const existingSeat = Object.keys(roundTableState.seats).find(
            key => roundTableState.seats[key] === centerType
        );
        if (existingSeat) {
            // 从原位置移除
            const oldSeat = document.getElementById(existingSeat);
            resetSeat(oldSeat);
        }
        
        // 更新状态
        roundTableState.seats[seat.id] = centerType;
        
        // 更新UI
        seat.classList.remove('empty-seat');
        seat.classList.add('occupied');
        seat.innerHTML = `
            <div class="seat-icon">${centerInfo.icon}</div>
            <div class="center-name-small">${centerInfo.name.replace('业务支持中心', '').replace('支持中心', '')}</div>
        `;
        
        // 标记中心项为已使用
        centerElement.classList.add('dragged');
        centerElement.draggable = false;
        
        // 更新启动会议按钮
        updateStartMeetingButton();
        
        // 播放音效（可选）
        playDropSound();
    }
    
    // 重置座椅
    function resetSeat(seat) {
        seat.classList.remove('occupied');
        seat.classList.add('empty-seat');
        seat.innerHTML = '<div class="seat-placeholder">+</div>';
        roundTableState.seats[seat.id] = null;
    }
    
    // 重置圆桌
    function resetRoundTable() {
        // 重置所有座椅
        Object.keys(roundTableState.seats).forEach(seatId => {
            const seat = document.getElementById(seatId);
            if (seat) {
                resetSeat(seat);
            }
        });
        
        // 重置所有中心项
        document.querySelectorAll('.center-item').forEach(item => {
            item.classList.remove('dragged');
            item.draggable = true;
        });
        
        // 更新按钮
        updateStartMeetingButton();
    }
    
    // 更新启动会议按钮状态
    function updateStartMeetingButton() {
        const startBtn = document.getElementById('meeting-start-btn');
        const hintText = document.getElementById('meeting-hint');
        const occupiedSeats = Object.values(roundTableState.seats).filter(s => s !== null).length;
        
        if (occupiedSeats > 0) {
            startBtn.disabled = false;
            startBtn.classList.add('ready');
            hintText.innerHTML = `${occupiedSeats}个业务中心已就位，点击开始会议 ▶`;
            hintText.classList.add('ready');
        } else {
            startBtn.disabled = true;
            startBtn.classList.remove('ready');
            hintText.innerHTML = '拖拽业务支持中心到圆桌上，点击开始会议';
            hintText.classList.remove('ready');
        }
    }
    
    // 播放放置音效（可选）
    function playDropSound() {
        // 创建简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // 启动会议
    function startMeeting() {
        const occupiedSeats = Object.entries(roundTableState.seats)
            .filter(([key, value]) => value !== null)
            .map(([key, value]) => roundTableState.centers[`${value}-center`]?.name)
            .filter(name => name);
        
        if (occupiedSeats.length === 0) {
            alert('请至少拖拽一个业务支持中心到圆桌上！');
            return;
        }
        
        const centerList = occupiedSeats.join('、');
        
        alert(`🎉 圆桌会议已启动！\n\n参会成员：\n👤 我（主持人）\n📦 ${centerList}\n\n会议环境已建立，各业务支持中心已就位！`);
        
        // 这里可以添加进入实际会议界面的逻辑
        console.log('圆桌会议已启动，参会中心：', occupiedSeats);
    }
    
    // 关闭军师方案设计页面
    function closeJunshiDetail() {
        const junshiPage = document.getElementById('junshi-page');
        junshiPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // ========== 天眼资讯功能 ==========
    
    // 打开天眼资讯页面
    function openTianyanDetail() {
        const tianyanPage = document.getElementById('tianyan-page');
        tianyanPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭天眼资讯页面
    function closeTianyanDetail() {
        const tianyanPage = document.getElementById('tianyan-page');
        tianyanPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // 切换天眼资讯标签页
    function switchTianyanTab(tabName) {
        // 移除所有标签页的active状态
        const tabs = document.querySelectorAll('.client-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // 隐藏所有内容区域
        const contents = document.querySelectorAll('.tianyan-tab-content');
        contents.forEach(content => content.classList.remove('active'));
        
        // 激活选中的标签页
        const selectedTab = document.querySelector(`.client-tab[data-tab="${tabName}"]`);
        if (selectedTab) selectedTab.classList.add('active');
        
        // 显示对应的内容区域
        const selectedContent = document.getElementById(`tab-${tabName}`);
        if (selectedContent) selectedContent.classList.add('active');
    }
    
    // 调整资讯内容
    function adjustNews(customerType) {
        const typeNames = {
            'personal': '个人客户',
            'bank': '银行客户',
            'enterprise': '企业客户'
        };
        alert(`正在调整${typeNames[customerType]}的资讯内容...\n\n你可以：\n1. 选择/取消选择特定资讯\n2. 编辑资讯内容\n3. 添加自定义资讯\n\n调整完成后点击"发送"按钮推送至客户。`);
    }
    
    // 个人客户列表（用于发送资讯）
    const PERSONAL_CUSTOMER_LIST = [
        { id: 'c1', name: '王斌', info: '账户资产分层A档' },
        { id: 'c2', name: '孙海燕', info: '优博科财务总监' },
        { id: 'c3', name: '高巍', info: 'VIP客户' },
        { id: 'c4', name: '张大为', info: '专业投资者' },
        { id: 'c5', name: '董欣', info: '专业投资者' }
    ];
    
    // 发送资讯给对应类型客户
    function sendNews(customerType) {
        const typeNames = {
            'personal': '个人客户',
            'bank': '银行客户',
            'enterprise': '企业客户'
        };
        
        // 获取当前标签页下的所有资讯标题
        const contentDiv = document.getElementById(`tab-${customerType}`);
        const newsTitles = [];
        contentDiv.querySelectorAll('.news-title').forEach((title, index) => {
            if (index < 3) { // 只取前3条
                newsTitles.push(title.textContent);
            }
        });
        
        if (newsTitles.length === 0) {
            alert(`暂无资讯内容可发送给${typeNames[customerType]}`);
            return;
        }
        
        // 个人客户特殊处理：显示客户选择弹窗
        if (customerType === 'personal') {
            openPersonalCustomerSelector(newsTitles);
        } else {
            // 其他类型直接发送
            alert(`📤 正在发送资讯给${typeNames[customerType]}...\n\n发送内容：\n${newsTitles.map((t, i) => `${i+1}. ${t}`).join('\n')}\n\n✅ 发送成功！`);
        }
    }
    
    // 打开个人客户选择弹窗
    let selectedPersonalCustomers = new Set();
    
    function openPersonalCustomerSelector(newsTitles) {
        selectedPersonalCustomers.clear();
        
        // 创建弹窗HTML
        const modalHtml = `
            <div id="personal-customer-modal" class="modal" style="display: block;">
                <div class="modal-overlay" onclick="closePersonalCustomerModal()"></div>
                <div class="modal-container" style="max-width: 400px;">
                    <div class="modal-header">
                        <h4>📤 选择发送对象</h4>
                        <button class="close-modal-btn" onclick="closePersonalCustomerModal()">✕</button>
                    </div>
                    <div class="modal-content">
                        <div style="margin-bottom: 10px; font-size: 14px; font-weight: 500; color: #333;">👤 个人客户列表（可多选）</div>
                        
                        <div class="personal-customer-list" style="max-height: 250px; overflow-y: auto;">
                            ${PERSONAL_CUSTOMER_LIST.map(customer => `
                                <div class="personal-customer-item" data-customer-id="${customer.id}" 
                                     onclick="togglePersonalCustomer('${customer.id}')"
                                     style="display: flex; align-items: center; padding: 12px; margin-bottom: 8px; 
                                            border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; 
                                            transition: all 0.2s; background: white;">
                                    <input type="checkbox" style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;"
                                           onclick="event.stopPropagation(); togglePersonalCustomer('${customer.id}')">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: #333; font-size: 15px;">${customer.name}</div>
                                        <div style="font-size: 12px; color: #999; margin-top: 2px;">${customer.info}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="selected-customers" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e0e0e0;">
                            <span class="label" style="color: #666;">已选择：</span>
                            <span id="personal-selected-count" style="font-weight: 600; color: #4a6cf7;">0</span>
                            <span style="color: #666;">人</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn" onclick="closePersonalCustomerModal()">取消</button>
                        <button class="confirm-btn" id="personal-confirm-btn" onclick="sendToPersonalCustomers()" disabled>确认发送</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加弹窗到页面
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHtml;
        document.body.appendChild(modalDiv.firstElementChild);
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭个人客户选择弹窗
    function closePersonalCustomerModal() {
        const modal = document.getElementById('personal-customer-modal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
        selectedPersonalCustomers.clear();
    }
    
    // 切换个人客户选择状态
    function togglePersonalCustomer(customerId) {
        if (selectedPersonalCustomers.has(customerId)) {
            selectedPersonalCustomers.delete(customerId);
        } else {
            selectedPersonalCustomers.add(customerId);
        }
        
        // 更新UI
        const item = document.querySelector(`.personal-customer-item[data-customer-id="${customerId}"]`);
        if (item) {
            const isSelected = selectedPersonalCustomers.has(customerId);
            item.style.background = isSelected ? '#f0f4ff' : 'white';
            item.style.borderColor = isSelected ? '#4a6cf7' : '#e0e0e0';
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = isSelected;
        }
        
        updatePersonalSelectedCount();
    }
    
    // 更新已选择的个人客户数量
    function updatePersonalSelectedCount() {
        const countEl = document.getElementById('personal-selected-count');
        const confirmBtn = document.getElementById('personal-confirm-btn');
        
        if (countEl) {
            countEl.textContent = selectedPersonalCustomers.size;
        }
        
        if (confirmBtn) {
            confirmBtn.disabled = selectedPersonalCustomers.size === 0;
            confirmBtn.style.opacity = selectedPersonalCustomers.size === 0 ? '0.5' : '1';
        }
    }
    
    // 发送资讯给选中的个人客户
    function sendToPersonalCustomers() {
        if (selectedPersonalCustomers.size === 0) {
            alert('请至少选择一个客户');
            return;
        }
        
        // 获取选中的客户名称
        const selectedNames = Array.from(selectedPersonalCustomers)
            .map(id => PERSONAL_CUSTOMER_LIST.find(c => c.id === id)?.name)
            .filter(Boolean);
        
        if (window.ContextPanel) {
            selectedNames.forEach((name) => window.ContextPanel.addCustomer(name, '个人客户'));
        }
        
        // 关闭弹窗
        closePersonalCustomerModal();
        
        // 显示发送成功提示
        alert(`✅ 发送成功！\n\n资讯已发送给以下客户：\n${selectedNames.join('、')}`);
    }
    
    // ========== 客户选择弹窗功能 ==========
    
    // 客户数据
    const CUSTOMER_DATA = [
        { id: 'p1', name: '王斌', type: 'personal', info: '股票账户客户', phone: '13800138001' },
        { id: 'p2', name: '孙海燕', type: 'personal', info: '优博科公司财务总监', phone: '13932157387' },
        { id: 'p3', name: '赵宇', type: 'personal', info: '协和医院主任', phone: '13600136001' },
        { id: 'p4', name: '李明', type: 'personal', info: '账户资产分层A档', phone: '13500135001' },
        { id: 'p5', name: '张华', type: 'personal', info: 'VIP客户', phone: '13700137001' },
        { id: 'b1', name: '晋商银行', type: 'bank', info: '金融市场部', phone: '0351-5550101' },
        { id: 'b2', name: '海南农商行', type: 'bank', info: '黄亮副行长', phone: '0898-6655101' },
        { id: 'b3', name: '徽商银行', type: 'bank', info: '孔庆龙行长', phone: '0551-6266101' },
        { id: 'b4', name: '工商银行', type: 'bank', info: '同业部', phone: '010-66106101' },
        { id: 'b5', name: '建设银行', type: 'bank', info: '资金运营部', phone: '010-6620101' },
        { id: 'e1', name: '东方新能', type: 'enterprise', info: '购买创金宝5000万', phone: '010-8888101' },
        { id: 'e2', name: '行云科技', type: 'enterprise', info: '拟购买资管产品', phone: '021-6666101' },
        { id: 'e3', name: '优博科', type: 'enterprise', info: '财务总监孙海燕', phone: '0755-8888102' },
        { id: 'e4', name: '亿晶光电', type: 'enterprise', info: '已被申请预重整', phone: '0519-8888103' },
        { id: 'e5', name: '棒杰股份', type: 'enterprise', info: '法院受理重整申请', phone: '0579-8888104' },
        { id: 'e6', name: 'ST沐邦', type: 'enterprise', info: '共益债方案', phone: '0755-8888105' },
        { id: 'e7', name: '声通科技', type: 'enterprise', info: '财务分析事项', phone: '021-8888106' }
    ];
    
    // 当前选中的资讯
    let currentNewsId = null;
    let currentNewsTitle = null;
    let selectedCustomers = new Set();
    let currentFilter = 'all';
    
    // 打开客户选择弹窗
    function openCustomerSelector(newsId, newsTitle) {
        currentNewsId = newsId;
        currentNewsTitle = newsTitle;
        selectedCustomers.clear();
        
        // 更新弹窗标题
        document.getElementById('selected-news-title').textContent = newsTitle;
        
        // 重置筛选
        currentFilter = 'all';
        document.getElementById('customer-search-input').value = '';
        updateFilterButtons();
        
        // 渲染客户列表
        renderCustomerList();
        updateSelectedCount();
        
        // 显示弹窗
        document.getElementById('customer-selector-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭客户选择弹窗
    function closeCustomerSelector() {
        document.getElementById('customer-selector-modal').style.display = 'none';
        document.body.style.overflow = '';
        currentNewsId = null;
        currentNewsTitle = null;
        selectedCustomers.clear();
    }
    
    // 渲染客户列表
    function renderCustomerList(searchText = '') {
        const listContainer = document.getElementById('customer-list');
        listContainer.innerHTML = '';
        
        // 筛选客户
        let filteredCustomers = CUSTOMER_DATA;
        
        // 按类型筛选
        if (currentFilter !== 'all') {
            filteredCustomers = filteredCustomers.filter(c => c.type === currentFilter);
        }
        
        // 按搜索文本筛选
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            filteredCustomers = filteredCustomers.filter(c => 
                c.name.toLowerCase().includes(lowerSearch) ||
                c.info.toLowerCase().includes(lowerSearch)
            );
        }
        
        // 按类型分组
        const groupedCustomers = {
            personal: filteredCustomers.filter(c => c.type === 'personal'),
            bank: filteredCustomers.filter(c => c.type === 'bank'),
            enterprise: filteredCustomers.filter(c => c.type === 'enterprise')
        };
        
        // 渲染各组
        const typeLabels = {
            personal: '👤 个人客户',
            bank: '🏦 银行客户',
            enterprise: '🏢 企业客户'
        };
        
        let hasAnyCustomer = false;
        
        Object.keys(groupedCustomers).forEach(type => {
            const customers = groupedCustomers[type];
            if (customers.length === 0) return;
            
            hasAnyCustomer = true;
            
            // 分组标题
            const groupHeader = document.createElement('div');
            groupHeader.className = 'customer-group-header';
            groupHeader.textContent = typeLabels[type];
            listContainer.appendChild(groupHeader);
            
            // 客户项
            customers.forEach(customer => {
                const item = document.createElement('div');
                item.className = `customer-item ${selectedCustomers.has(customer.id) ? 'selected' : ''}`;
                item.dataset.customerId = customer.id;
                item.onclick = () => toggleCustomer(customer.id);
                
                const typeIcons = {
                    personal: '👤',
                    bank: '🏦',
                    enterprise: '🏢'
                };
                
                item.innerHTML = `
                    <div class="customer-checkbox">
                        <input type="checkbox" ${selectedCustomers.has(customer.id) ? 'checked' : ''}>
                    </div>
                    <div class="customer-avatar">${typeIcons[customer.type]}</div>
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-detail">${customer.info} · ${customer.phone}</div>
                    </div>
                `;
                
                listContainer.appendChild(item);
            });
        });
        
        if (!hasAnyCustomer) {
            listContainer.innerHTML = `
                <div class="empty-customers">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">未找到匹配的客户</div>
                </div>
            `;
        }
    }
    
    // 切换客户选择状态
    function toggleCustomer(customerId) {
        if (selectedCustomers.has(customerId)) {
            selectedCustomers.delete(customerId);
        } else {
            selectedCustomers.add(customerId);
        }
        
        // 更新UI
        const item = document.querySelector(`.customer-item[data-customer-id="${customerId}"]`);
        if (item) {
            item.classList.toggle('selected', selectedCustomers.has(customerId));
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = selectedCustomers.has(customerId);
        }
        
        updateSelectedCount();
    }
    
    // 更新已选择数量
    function updateSelectedCount() {
        document.getElementById('selected-count').textContent = selectedCustomers.size;
        
        // 更新确认按钮状态
        const confirmBtn = document.querySelector('.confirm-btn');
        confirmBtn.disabled = selectedCustomers.size === 0;
        confirmBtn.style.opacity = selectedCustomers.size === 0 ? '0.5' : '1';
    }
    
    // 筛选客户
    function filterCustomers(searchText) {
        renderCustomerList(searchText);
    }
    
    // 按类型筛选
    function filterByType(type) {
        currentFilter = type;
        updateFilterButtons();
        renderCustomerList(document.getElementById('customer-search-input').value);
    }
    
    // 更新筛选按钮状态
    function updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
    }
    
    // 发送资讯给客户
    function sendToCustomers() {
        if (selectedCustomers.size === 0) {
            alert('请至少选择一个客户');
            return;
        }
        
        // 获取选中的客户名称
        const selectedNames = Array.from(selectedCustomers)
            .map(id => CUSTOMER_DATA.find(c => c.id === id)?.name)
            .filter(Boolean);
        
        // 模拟发送
        console.log(`发送资讯 "${currentNewsTitle}" 给客户:`, selectedNames);
        
        // 关闭弹窗
        closeCustomerSelector();
        
        // 显示成功提示
        showSendSuccessToast();
    }
    
    // 显示发送成功提示
    function showSendSuccessToast() {
        const toast = document.getElementById('send-success-toast');
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    }
    
    // 打开破产重整方案设计页面
    function openBankruptcySolution() {
        const bankruptcyPage = document.getElementById('bankruptcy-solution-page');
        bankruptcyPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 重置表单
        resetBankruptcyForm();
        
        // 初始化填充步骤计数器
        window.bankruptcyFillStep = 0;
    }
    
    // 关闭破产重整方案设计页面
    function closeBankruptcySolution() {
        const bankruptcyPage = document.getElementById('bankruptcy-solution-page');
        bankruptcyPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // 打开定增方案设计页面（待开发）
    function openPlacementSolution() {
        alert('定增方案设计功能开发中，敬请期待！');
    }
    
    // 打开债券发行方案设计页面（待开发）
    function openBondSolution() {
        alert('债券发行方案设计功能开发中，敬请期待！');
    }
    
    // 打开资管产品方案设计页面（待开发）
    function openAssetSolution() {
        alert('资管产品方案设计功能开发中，敬请期待！');
    }
    
    // 重置破产重整表单
    function resetBankruptcyForm() {
        document.getElementById('bankruptcy-form').reset();
        document.getElementById('bankruptcy-result').style.display = 'none';
        document.getElementById('bankruptcy-form').style.display = 'block';
        // 重置填充步骤
        window.bankruptcyFillStep = 0;
    }
    
    // 破产重整表单逐步填充数据
    const bankruptcyFillData = [
        { id: 'company-name', value: 'ST沐邦', label: '公司名称' },
        { id: 'stock-code', value: '603398', label: '股票代码' },
        { id: 'calc-date', value: '2026-03-26', label: '测算日期' },
        { id: 'total-shares', value: '34200', label: '公司股本总额' },
        { id: 'current-price', value: '10.99', label: '测算日股票收盘价' },
        { id: 'price-20d', value: '10.68', label: '前20日股票收盘价均价' },
        { id: 'price-60d', value: '9.42', label: '前60日股票收盘价均价' },
        { id: 'price-120d', value: '9.25', label: '前120日股票收盘价均价' },
        { id: 'debt-principal', value: '270000', label: '债权本金' },
        { id: 'repayment-ratio', value: '100', label: '偿债比例' },
        { id: 'price-multiple', value: '3', label: '偿债股价倍数' },
        { id: 'cash-repayment', value: '0', label: '现金清偿金额' },
        { id: 'strategic-discount', value: '0.5', label: '产业投资人价格折扣' },
        { id: 'financial-discount', value: '0.55', label: '财务投资人价格折扣' },
        { id: 'capitalization-ratio', value: '1.5', label: '公积金转增比例' },
        { id: 'strategic-holding-ratio', value: '20', label: '产业投资人转增后持股比例' }
    ];
    
    // 填充下一个字段
    function fillNextBankruptcyField() {
        if (window.bankruptcyFillStep < bankruptcyFillData.length) {
            const data = bankruptcyFillData[window.bankruptcyFillStep];
            const element = document.getElementById(data.id);
            if (element) {
                element.value = data.value;
                // 添加高亮效果
                element.style.backgroundColor = '#fffacd';
                element.style.transition = 'background-color 0.3s';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 600);
            }
            window.bankruptcyFillStep++;
            
            // 如果所有字段都填充完成，不弹出提示，直接让用户点击生成按钮
        }
    }
    
    // 破产重整表单区域点击事件处理
    function handleBankruptcyFormClick(event) {
        // 如果点击的是输入框、标签或表单区域，填充下一个字段
        fillNextBankruptcyField();
    }
    
    // 编辑破产重整表单
    function editBankruptcyForm() {
        document.getElementById('bankruptcy-result').style.display = 'none';
        document.getElementById('bankruptcy-form').style.display = 'block';
    }
    
    // 生成破产重整方案
    function generateBankruptcySolution(event) {
        event.preventDefault();
        
        // 获取表单数据
        const formData = {
            companyName: document.getElementById('company-name').value,
            stockCode: document.getElementById('stock-code').value,
            calcDate: document.getElementById('calc-date').value,
            totalShares: parseFloat(document.getElementById('total-shares').value),
            currentPrice: parseFloat(document.getElementById('current-price').value),
            price20d: parseFloat(document.getElementById('price-20d').value),
            price60d: parseFloat(document.getElementById('price-60d').value),
            price120d: parseFloat(document.getElementById('price-120d').value),
            debtPrincipal: parseFloat(document.getElementById('debt-principal').value),
            repaymentRatio: parseFloat(document.getElementById('repayment-ratio').value) / 100, // 转换为小数
            priceMultiple: parseFloat(document.getElementById('price-multiple').value),
            cashRepayment: parseFloat(document.getElementById('cash-repayment').value),
            strategicDiscount: parseFloat(document.getElementById('strategic-discount').value),
            financialDiscount: parseFloat(document.getElementById('financial-discount').value),
            capitalizationRatio: parseFloat(document.getElementById('capitalization-ratio').value),
            strategicHoldingRatio: parseFloat(document.getElementById('strategic-holding-ratio').value) / 100 // 转换为小数
        };
        
        // 按照文档公式进行计算
        // 1. 产业投资人投资价格 = 测算日股票收盘价 × 产业投资人价格折扣
        const strategicPrice = formData.currentPrice * formData.strategicDiscount;
        
        // 2. 财务投资人投资价格 = 测算日前20日、60日、120日股票收盘价均价中的较低者 × 财务投资人价格折扣
        const minHistoricalPrice = Math.min(formData.price20d, formData.price60d, formData.price120d);
        const financialPrice = minHistoricalPrice * formData.financialDiscount;
        
        // 3. 转增后总股本 = 原股本 × (1 + 转增比例)
        const totalSharesAfter = formData.totalShares * (1 + formData.capitalizationRatio);
        
        // 4. 公积金转增股本数量 = 转增后总股本 - 转增前总股本
        const capitalizationShares = totalSharesAfter - formData.totalShares;
        
        // 5. 产业投资人获取的股份 = 转增后总股本 × 产业投资人转增后持股比例
        const strategicShares = totalSharesAfter * formData.strategicHoldingRatio;
        
        // 6. 产业投资人要拿出的资金 = 产业投资人获取的股份 × 产业投资人投资价格
        const strategicInvestment = strategicShares * strategicPrice;
        
        // 7. 债权人能拿到的权益价值 = 债权本金 × 偿债比例
        const creditorEquityValue = formData.debtPrincipal * formData.repaymentRatio;
        
        // 8. 债权人获得的股份 = 【（债权本金×偿债比例）-现金清偿金额】/（测算日股票收盘价×偿债股价倍数）
        const creditorShares = (creditorEquityValue - formData.cashRepayment) / (formData.currentPrice * formData.priceMultiple);
        
        // 9. 财务投资人获取的股份 = 公积金转增股本数量 - 债权人获得的股份 - 产业投资人获取的股份
        const financialShares = capitalizationShares - creditorShares - strategicShares;
        
        // 10. 财务投资人要拿出的资金 = 财务投资人获取的股份 × 财务投资人投资价格
        const financialInvestment = financialShares * financialPrice;
        
        // 11. 留在上市公司的现金 = 产业投资人拿出的现金 + 财务投资人拿出的现金 - 现金清偿的债务
        const remainingFunds = strategicInvestment + financialInvestment - formData.cashRepayment;

        // 12. 债权人要豁免的金额 = 债权本金 - 债权本金 × 偿债比例
        const forgivenAmount = formData.debtPrincipal - creditorEquityValue;
        
        // 计算结果对象
        const calculationResults = {
            strategicPrice,
            financialPrice,
            totalSharesAfter,
            capitalizationShares,
            strategicShares,
            strategicInvestment,
            financialShares,
            financialInvestment,
            creditorEquityValue,
            creditorShares,
            remainingFunds,
            forgivenAmount,
            minHistoricalPrice
        };
        
        // 生成方案内容
        const solutionHTML = generateBankruptcySolutionHTML(formData, calculationResults);
        
        // 显示结果
        document.getElementById('bankruptcy-result-content').innerHTML = solutionHTML;
        document.getElementById('bankruptcy-form').style.display = 'none';
        document.getElementById('bankruptcy-result').style.display = 'block';
    }
    
    // 生成破产重整方案HTML
    function generateBankruptcySolutionHTML(data, results) {
        const formatCurrency = (num) => {
            return (num / 10000).toFixed(2) + '亿元';
        };
        
        const formatNumber = (num) => {
            return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
        };
        
        return `
            <div class="solution-doc">
                <div class="doc-header">
                    <h2>${data.companyName}（${data.stockCode}）破产重整方案</h2>
                    <p class="doc-date">测算日期：${data.calcDate} | 生成时间：${new Date().toLocaleString()}</p>
                </div>
                
                <!-- 五大核心决定因素 -->
                <div class="doc-section highlight-section">
                    <h3>📊 五大核心决定因素</h3>
                    <div class="key-factors">
                        <div class="factor-card">
                            <div class="factor-label">产业投资人要拿出的资金</div>
                            <div class="factor-value">${formatCurrency(results.strategicInvestment)}</div>
                            <div class="factor-detail">${formatNumber(results.strategicInvestment)}万元（${formatNumber(results.strategicShares)}万股）</div>
                        </div>
                        <div class="factor-card">
                            <div class="factor-label">财务投资人要拿出的资金</div>
                            <div class="factor-value">${formatCurrency(results.financialInvestment)}</div>
                            <div class="factor-detail">${formatNumber(results.financialInvestment)}万元（${formatNumber(results.financialShares)}万股）</div>
                        </div>
                        <div class="factor-card">
                            <div class="factor-label">债权人要豁免的金额</div>
                            <div class="factor-value">${formatCurrency(results.forgivenAmount)}</div>
                            <div class="factor-detail">${formatNumber(results.forgivenAmount)}万元</div>
                        </div>
                        <div class="factor-card">
                            <div class="factor-label">债权人能拿到的权益</div>
                            <div class="factor-value">${formatNumber(results.creditorShares)}万股</div>
                            <div class="factor-detail">价值${formatNumber(results.creditorEquityValue)}万元</div>
                        </div>
                        <div class="factor-card">
                            <div class="factor-label">留在上市公司的现金</div>
                            <div class="factor-value">${formatCurrency(results.remainingFunds)}</div>
                            <div class="factor-detail">${formatNumber(results.remainingFunds)}万元</div>
                        </div>
                    </div>
                </div>
                
                <div class="doc-section">
                    <h3>一、输入要素汇总</h3>
                    <table class="info-table">
                        <tr><td>公司名称</td><td>${data.companyName}</td></tr>
                        <tr><td>股票代码</td><td>${data.stockCode}</td></tr>
                        <tr><td>测算日期</td><td>${data.calcDate}</td></tr>
                        <tr><td>公司股本总额</td><td>${formatNumber(data.totalShares)}万股</td></tr>
                        <tr><td>测算日股票收盘价</td><td>${data.currentPrice}元/股</td></tr>
                        <tr><td>前20日均价</td><td>${data.price20d}元/股</td></tr>
                        <tr><td>前60日均价</td><td>${data.price60d}元/股</td></tr>
                        <tr><td>前120日均价</td><td>${data.price120d}元/股</td></tr>
                        <tr><td>债权本金</td><td>${formatNumber(data.debtPrincipal)}万元</td></tr>
                        <tr><td>偿债比例</td><td>${(data.repaymentRatio * 100).toFixed(2)}%</td></tr>
                        <tr><td>现金清偿金额</td><td>${formatNumber(data.cashRepayment)}万元</td></tr>
                    </table>
                </div>
                
                <div class="doc-section">
                    <h3>二、投资人方案</h3>
                    <table class="info-table">
                        <tr><td>产业投资人价格折扣</td><td>${(data.strategicDiscount * 100).toFixed(0)}%</td></tr>
                        <tr><td>产业投资人投资价格</td><td>${results.strategicPrice.toFixed(2)}元/股</td></tr>
                        <tr><td>财务投资人价格折扣</td><td>${(data.financialDiscount * 100).toFixed(0)}%</td></tr>
                        <tr><td>财务投资人投资价格</td><td>${results.financialPrice.toFixed(2)}元/股</td></tr>
                        <tr><td>公积金转增比例</td><td>${(data.capitalizationRatio * 100).toFixed(0)}%</td></tr>
                        <tr><td>转增前总股本</td><td>${formatNumber(data.totalShares)}万股</td></tr>
                        <tr><td>转增后总股本</td><td>${formatNumber(results.totalSharesAfter)}万股</td></tr>
                        <tr><td>公积金转增股本数量</td><td>${formatNumber(results.capitalizationShares)}万股</td></tr>
                        <tr><td>产业投资人转增后持股比例</td><td>${(data.strategicHoldingRatio * 100).toFixed(2)}%</td></tr>
                    </table>
                </div>
                
                <div class="doc-section">
                    <h3>三、股份分配明细</h3>
                    <table class="info-table">
                        <tr><td>产业投资人获取的股份</td><td>${formatNumber(results.strategicShares)}万股（${(data.strategicHoldingRatio * 100).toFixed(2)}%）</td></tr>
                        <tr><td>债权人获得的股份</td><td>${formatNumber(results.creditorShares)}万股</td></tr>
                        <tr><td>财务投资人获取的股份</td><td>${formatNumber(results.financialShares)}万股（转增股本剩余部分）</td></tr>
                        <tr><td>合计</td><td>${formatNumber(results.capitalizationShares)}万股</td></tr>
                    </table>
                </div>
                
                <div class="doc-section">
                    <h3>四、资金测算明细</h3>
                    <div class="fund-calculation">
                        <div class="calc-item">
                            <span class="calc-label">产业投资人投入资金：</span>
                            <span class="calc-value">${formatNumber(results.strategicInvestment)}万元（${formatNumber(results.strategicShares)}万股 × ${results.strategicPrice.toFixed(2)}元）</span>
                        </div>
                        <div class="calc-item">
                            <span class="calc-label">财务投资人投入资金：</span>
                            <span class="calc-value">${formatNumber(results.financialInvestment)}万元（${formatNumber(results.financialShares)}万股 × ${results.financialPrice.toFixed(2)}元）</span>
                        </div>
                        <div class="calc-item">
                            <span class="calc-label">现金清偿金额：</span>
                            <span class="calc-value">-${formatNumber(data.cashRepayment)}万元</span>
                        </div>
                        <div class="calc-item total">
                            <span class="calc-label">留在上市公司的现金：</span>
                            <span class="calc-value">${formatNumber(results.remainingFunds)}万元</span>
                        </div>
                    </div>
                </div>
                
                <div class="doc-section">
                    <h3>四、债权清偿方案</h3>
                    <div class="repayment-plan">
                        <div class="plan-item">
                            <h4>债权本金</h4>
                            <p>${formatNumber(data.debtPrincipal)}万元</p>
                        </div>
                        <div class="plan-item">
                            <h4>偿债比例</h4>
                            <p>${(data.repaymentRatio * 100).toFixed(2)}%</p>
                        </div>
                        <div class="plan-item">
                            <h4>债权人获得权益</h4>
                            <p>${formatNumber(results.creditorShares)}万股（按${data.currentPrice} × ${data.priceMultiple} = ${(data.currentPrice * data.priceMultiple).toFixed(2)}元/股计算）</p>
                        </div>
                        <div class="plan-item">
                            <h4>债权人豁免金额</h4>
                            <p>${formatNumber(results.forgivenAmount)}万元</p>
                        </div>
                    </div>
                </div>
                
                <div class="doc-section">
                    <h3>五、计算公式说明</h3>
                    <div class="formula-list">
                        <p><strong>1. 产业投资人投资价格</strong> = ${data.currentPrice} × ${data.strategicDiscount} = ${results.strategicPrice.toFixed(2)}元/股</p>
                        <p><strong>2. 财务投资人投资价格</strong> = MIN(${data.price20d}, ${data.price60d}, ${data.price120d}) × ${data.financialDiscount} = ${results.minHistoricalPrice.toFixed(2)} × ${data.financialDiscount} = ${results.financialPrice.toFixed(2)}元/股</p>
                        <p><strong>3. 转增后总股本</strong> = ${formatNumber(data.totalShares)} × (1 + ${data.capitalizationRatio}) = ${formatNumber(results.totalSharesAfter)}万股</p>
                        <p><strong>4. 公积金转增股本数量</strong> = ${formatNumber(results.totalSharesAfter)} - ${formatNumber(data.totalShares)} = ${formatNumber(results.capitalizationShares)}万股</p>
                        <p><strong>5. 产业投资人获取股份</strong> = ${formatNumber(results.totalSharesAfter)} × ${(data.strategicHoldingRatio * 100).toFixed(2)}% = ${formatNumber(results.strategicShares)}万股</p>
                        <p><strong>6. 产业投资人资金</strong> = ${formatNumber(results.strategicShares)} × ${results.strategicPrice.toFixed(2)} = ${formatNumber(results.strategicInvestment)}万元</p>
                        <p><strong>7. 债权人获得股份</strong> = 【(${formatNumber(data.debtPrincipal)} × ${(data.repaymentRatio * 100).toFixed(2)}%) - ${formatNumber(data.cashRepayment)}】/ (${data.currentPrice} × ${data.priceMultiple}) = ${formatNumber(results.creditorShares)}万股</p>
                        <p><strong>8. 财务投资人获取股份</strong> = ${formatNumber(results.capitalizationShares)} - ${formatNumber(results.creditorShares)} - ${formatNumber(results.strategicShares)} = ${formatNumber(results.financialShares)}万股</p>
                        <p><strong>9. 财务投资人资金</strong> = ${formatNumber(results.financialShares)} × ${results.financialPrice.toFixed(2)} = ${formatNumber(results.financialInvestment)}万元</p>
                        <p><strong>10. 留在上市公司现金</strong> = ${formatNumber(results.strategicInvestment)} + ${formatNumber(results.financialInvestment)} - ${formatNumber(data.cashRepayment)} = ${formatNumber(results.remainingFunds)}万元</p>
                    </div>
                </div>
                
                <div class="doc-section">
                    <h3>六、风险提示</h3>
                    <div class="risk-notice">
                        <p>1. 本方案根据录入要素自动计算生成，最终方案以法院裁定批准的重整计划为准；</p>
                        <p>2. 股票价格波动可能影响投资人实际成本和债权人权益价值；</p>
                        <p>3. 投资人引入存在不确定性，需进一步谈判确定；</p>
                        <p>4. 本方案仅供参考，建议由专业律师、会计师审核后提交管理人。</p>
                    </div>
                </div>
                
                <div class="doc-footer">
                    <p>本方案由方案生成助手智能体根据录入要素自动生成，仅供参考。</p>
                    <p>生成时间：${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
    }
    
    // 导出破产重整方案
    function exportBankruptcySolution() {
        const content = document.getElementById('bankruptcy-result-content').innerText;
        const companyName = document.getElementById('company-name').value || '企业';
        
        // 创建并下载文本文件
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${companyName}破产重整方案.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('方案已导出！');
    }
    
    // 平铺布局：清除堆叠卡片遗留的内联样式
    function updateCardPositionsForPanel(activeIndex, panel) {
        const p = panel || getActiveWorkbenchPanel();
        p.querySelectorAll('.ai-card-fan').forEach((card) => {
            card.classList.remove('card-center', 'card-side-1', 'card-side-2', 'card-side-far');
            card.style.transform = '';
            card.style.zIndex = '';
            card.style.opacity = '';
            card.style.left = '';
            card.style.top = '';
            card.style.pointerEvents = '';
        });
    }

    function updateCardPositions(activeIndex) {
        updateCardPositionsForPanel(activeIndex, getActiveWorkbenchPanel());
    }

    // 初始化指示器点击
    function initIndicatorsForPanel(panel) {
        panel.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                const targetCard = panel.querySelector(`.ai-card-fan[data-index="${index}"]`);
                if (targetCard) bringToFront(targetCard);
            });
        });
    }

    function initIndicators() {
        document.querySelectorAll('.workbench-panel').forEach(panel => {
            if (panel.dataset.initialized === 'true') {
                initIndicatorsForPanel(panel);
            }
        });
    }

    // 点击指示器切换卡片
    // ========== 探马详情功能 ==========
    
    // 打开探马详情页面
    function openTanmaDetail() {
        const tanmaPage = document.getElementById('tanma-page');
        tanmaPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭探马详情页面
    function closeTanmaDetail() {
        const tanmaPage = document.getElementById('tanma-page');
        tanmaPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // 呼叫业务支持中心
    function callSupportCenter(centerType, customerName) {
        const centerNames = {
            'wealth': '财富管理业务支持中心',
            'asset': '资管业务支持中心',
            'ib': '投行业务支持中心'
        };

        const centerName = centerNames[centerType] || '业务支持中心';

        // 如果是徽商银行，打开资管业务支持中心对话页面
        if (centerType === 'asset' && customerName === '徽商银行') {
            openAssetSupportDetail(customerName);
            return;
        }

        // 其他客户显示呼叫提示
        alert(`📞 正在呼叫${centerName}...\n\n客户：${customerName}\n\n已通知相关支持人员，稍后将有专人与你对接！`);

        // 这里可以添加实际的通知逻辑，比如发送消息给后台
        console.log(`呼叫${centerName}，客户：${customerName}`);
    }

    // 打开资管业务支持中心对话页面
    function openAssetSupportDetail(customerName) {
        const assetSupportPage = document.getElementById('asset-support-page');
        const customerNameEl = document.getElementById('asset-support-customer');

        if (customerNameEl && customerName) {
            customerNameEl.textContent = customerName;
        }

        assetSupportPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // 关闭资管业务支持中心对话页面
    function closeAssetSupportDetail() {
        const assetSupportPage = document.getElementById('asset-support-page');
        assetSupportPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // 预设问题文本
    const ASSET_SUPPORT_QUESTION = '我了解到徽商银行代销了200亿券商资管产品，但还未与我司建立合作关系，我想了解华创证券的资管产品目前在股份制商业银行和城商行代销的情况，目前这个阶段向徽商银行推荐什么策略的代销产品最好？';
    
    // 填充资管业务助理问题
    function fillAssetSupportQuestion() {
        const input = document.getElementById('asset-support-input');
        if (input && !input.value.trim()) {
            input.value = ASSET_SUPPORT_QUESTION;
            autoResizeTextarea(input);
        }
    }
    
    // textarea自动调整高度
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    // 选择提示问题
    function selectPrompt(promptText) {
        const input = document.getElementById('asset-support-input');
        if (input) {
            input.value = promptText;
            // 自动调整高度
            autoResizeTextarea(input);
            // 自动发送消息
            sendAssetSupportMessage();
        }
    }
    
    // 发送资管业务助理消息
    function sendAssetSupportMessage() {
        const input = document.getElementById('asset-support-input');
        const dialogueArea = document.getElementById('asset-dialogue-area');
        
        if (!input || !dialogueArea) return;
        
        const message = input.value.trim();
        if (!message) {
            alert('请输入问题内容');
            return;
        }
        
        // 添加用户问题到对话区域（无头像，靠右显示，左边留空）
        const userQuestionHtml = `
            <div class="dialogue-item user-question" style="opacity: 0; animation: fadeInUp 0.5s ease forwards;">
                <div class="dialogue-content">
                    <div class="dialogue-text">${message}</div>
                </div>
            </div>
        `;
        dialogueArea.insertAdjacentHTML('beforeend', userQuestionHtml);
        
        // 清空输入框并恢复高度
        input.value = '';
        input.style.height = 'auto';
        input.rows = 1;
        
        // 滚动到底部
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
        
        // 模拟系统回复（延迟1秒）
        setTimeout(() => {
            const systemReplyHtml = `
                <div class="dialogue-item system-answer" style="opacity: 0; animation: fadeInUp 0.5s ease forwards;">
                    <div class="dialogue-content">
                        <div class="dialogue-text">
                            <p>这是介绍华创证券资管产品在股份制商业银行和城商行代销情况的报告，供你参考：</p>
                        </div>
                        <!-- 文档标识 -->
                        <div class="document-indicator">
                            <span class="doc-icon">📊</span>
                            <span class="doc-name">华创证券资管产品代销情况报告.pdf</span>
                        </div>
                        <div class="dialogue-text follow-up">
                            <p>现阶段建议向徽商银行推荐<strong>"固收+"</strong>的资管产品，我司现在主要的"固收+"产品策略的业绩表现可在下方文档中查看：</p>
                        </div>
                        <!-- 第二个文档 -->
                        <div class="document-card">
                            <div class="document-icon">📊</div>
                            <div class="document-info">
                                <div class="document-title">华创证券"固收+"产品策略业绩表现</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            dialogueArea.insertAdjacentHTML('beforeend', systemReplyHtml);
            
            // 滚动到底部
            dialogueArea.scrollTop = dialogueArea.scrollHeight;
        }, 1000);
    }
    
    // ========== 探马模型功能 ==========
    
    // 打开探马模型页面
    function openTanmaModel() {
        const tanmaModelPage = document.getElementById('tanma-model-page');
        tanmaModelPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 从localStorage加载保存的模型内容
        loadModelsFromStorage();
    }
    
    // 关闭探马模型页面
    function closeTanmaModel() {
        const tanmaModelPage = document.getElementById('tanma-model-page');
        tanmaModelPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // 进入编辑模式
    function editModel(modelType) {
        const displayEl = document.getElementById(`${modelType}-model-display`);
        const editEl = document.getElementById(`${modelType}-model-edit`);
        
        displayEl.style.display = 'none';
        editEl.style.display = 'block';
    }
    
    // 取消编辑
    function cancelModelEdit(modelType) {
        const displayEl = document.getElementById(`${modelType}-model-display`);
        const editEl = document.getElementById(`${modelType}-model-edit`);
        
        displayEl.style.display = 'block';
        editEl.style.display = 'none';
    }
    
    // 保存模型
    function saveModel(modelType) {
        const textarea = document.getElementById(`${modelType}-textarea`);
        const content = textarea.value;
        
        // 保存到localStorage
        localStorage.setItem(`tanma-model-${modelType}`, content);
        
        // 更新显示内容
        updateModelDisplay(modelType, content);
        
        // 退出编辑模式
        cancelModelEdit(modelType);
        
        alert('模型已保存！');
    }
    
    // 更新模型显示
    function updateModelDisplay(modelType, content) {
        const displayEl = document.getElementById(`${modelType}-model-display`);
        const lines = content.split('\n').filter(line => line.trim());
        
        let html = '';
        lines.forEach((line, index) => {
            // 解析格式 "1. 标题：内容" 或 "1.标题：内容"
            const match = line.match(/^\d+\.\s*(.+?)[:：](.+)$/);
            if (match) {
                html += `
                    <div class="model-item">
                        <span class="model-step">${index + 1}</span>
                        <div class="model-text">
                            <strong>${match[1]}：</strong>${match[2]}
                        </div>
                    </div>
                `;
            }
        });
        
        displayEl.innerHTML = html;
    }
    
    // 从localStorage加载模型
    function loadModelsFromStorage() {
        const modelTypes = ['broker', 'asset', 'investment'];
        
        modelTypes.forEach(type => {
            const saved = localStorage.getItem(`tanma-model-${type}`);
            if (saved) {
                // 更新textarea
                document.getElementById(`${type}-textarea`).value = saved;
                // 更新显示
                updateModelDisplay(type, saved);
            }
        });
    }
    
    // ========== 参谋分析功能 ==========
    
    // 打开参谋分析页面
    function openCanmouDetail() {
        const canmouPage = document.getElementById('canmou-page');
        canmouPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 填充分析示例文本
    function fillAnalysisExample() {
        const textarea = document.getElementById('analysis-input');
        if (!textarea.value.trim()) {
            textarea.value = '请帮我分析某企业客户的合作历史、资金规模、已购产品/持仓结构与待确认合作项';
        }
    }
    
    // 关闭参谋分析页面
    function closeCanmouDetail() {
        const canmouPage = document.getElementById('canmou-page');
        canmouPage.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // 使用示例文本
    function useExample() {
        document.getElementById('analysis-input').value = '请分析客户张某的业务合作情况与跟进建议';
    }
    
    // 语音输入功能
    function startVoiceInput() {
        // 检查浏览器是否支持语音识别
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'zh-CN';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = function() {
                alert('请开始说话...');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                document.getElementById('analysis-input').value = transcript;
            };
            
            recognition.onerror = function(event) {
                alert('语音识别出错，请重试或使用文字输入');
            };
            
            recognition.start();
        } else {
            alert('你的浏览器不支持语音输入，请使用文字输入');
        }
    }
    
    // ========== AI大模型分析配置 ==========
    // 【重要】配置说明：
    // 1. 如需使用真实大模型，请将 useMock 改为 false，并填入你的API密钥
    // 2. 支持的提供商：doubao（豆包）、openai（GPT）、claude、wenxin（文心一言）、tongyi（通义千问）
    // 3. API密钥获取方式：
    //    - 豆包：https://www.volcengine.com/product/doubao
    //    - OpenAI：https://platform.openai.com
    //    - 百度文心：https://cloud.baidu.com/product/wenxinworkshop
    //    - 阿里通义：https://dashscope.aliyun.com
    
    const AI_CONFIG = {
        // ==================== 配置区域开始 ====================
        
        // 【选项1】豆包大模型（字节跳动，推荐，中文能力强）
        provider: 'doubao',
        apiKey: 'api-key-20260319101617',  // 已配置API密钥
        apiEndpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',  // 豆包API地址
        model: 'doubao-pro-32k',  // 可选：doubao-pro-32k, doubao-lite-4k, doubao-1.5-pro

        // ==================== 配置区域结束 ====================
        
        useMock: true,  // 演示模式：使用本地模拟数据（无需代理服务器）
        
        // 超时设置（毫秒）
        timeout: 60000,
        
        // 重试次数
        retryCount: 2
    };
    
    // 提交分析请求
    async function submitAnalysis() {
        const input = document.getElementById('analysis-input').value.trim();
        if (!input) {
            alert('请输入要分析的内容');
            return;
        }
        
        // 显示分析进度
        showAnalysisProgress();
        document.getElementById('analysis-result').style.display = 'block';
        
        // 检测是否为声通科技分析请求（仅用于模拟模式）
        const isShengTong = input.includes('声通') || input.includes('声通科技');
        // 检测是否为中联数据与润泽科技对比分析
        const isComparison = input.includes('中联数据') && input.includes('润泽科技');
        
        try {
            if (AI_CONFIG.useMock) {
                // 模拟模式：使用本地模拟数据
                if (isComparison) {
                    await mockComparisonAnalysis();
                } else {
                    await mockAIAnalysis(input, isShengTong);
                }
            } else {
                // 真实API模式：调用大模型
                await callAIAPI(input);
            }
        } catch (error) {
            document.getElementById('result-content').innerHTML = `
                <div class="analysis-error">
                    <p>❌ 分析出错：${error.message}</p>
                    <p>请检查网络连接或API配置</p>
                    <p style="margin-top: 10px; font-size: 12px; color: #888;">
                        提示：如果还没有API密钥，可以在AI_CONFIG中将 useMock 设为 true 使用演示模式
                    </p>
                </div>
            `;
        }
    }
    
    // 显示分析进度动画
    function showAnalysisProgress() {
        const progressHTML = `
            <div class="analysis-progress">
                <div class="progress-step active">
                    <span class="step-icon">🔗</span>
                    <span class="step-text">正在连接AI参谋...</span>
                </div>
                <div class="progress-step">
                    <span class="step-icon">🧠</span>
                    <span class="step-text">正在分析财务数据...</span>
                </div>
                <div class="progress-step">
                    <span class="step-icon">📊</span>
                    <span class="step-text">正在生成分析报告...</span>
                </div>
                <div class="progress-loading">
                    <div class="loading-bar"></div>
                </div>
            </div>
        `;
        document.getElementById('result-content').innerHTML = progressHTML;
        
        // 模拟进度动画
        setTimeout(() => {
            const steps = document.querySelectorAll('.progress-step');
            if (steps[1]) steps[1].classList.add('active');
        }, 800);
        setTimeout(() => {
            const steps = document.querySelectorAll('.progress-step');
            if (steps[2]) steps[2].classList.add('active');
        }, 1600);
    }
    
    // 模拟中联数据与润泽科技对比分析
    async function mockComparisonAnalysis() {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const comparisonReportHTML = generateComparisonReport();
        document.getElementById('result-content').innerHTML = comparisonReportHTML;
    }
    
    // 生成中联数据与润泽科技对比分析报告
    function generateComparisonReport() {
        return `
            <div class="analysis-section ai-summary">
                <h5>🤖 AI参谋分析摘要</h5>
                <div class="ai-thinking-box">
                    <p class="ai-thinking-text">基于中联数据与润泽科技最新财报数据，完成五维度对比：中联数据营收45.6亿元（+28.5%），润泽科技营收38.2亿元（+35.2%）；润泽科技净利率21.5%高于中联数据14.9%，PUE 1.35低于中联数据1.45。</p>
                </div>
            </div>
            <div class="analysis-section">
                <h5>📝 分析主题</h5>
                <p>中联数据 vs 润泽科技 - IDC服务商五维度对比分析</p>
            </div>
            <div class="analysis-section">
                <h5>📊 五维度对比分析</h5>
                <div class="data-grid">
                    <div class="data-card highlight">
                        <div class="data-label">中联数据营收</div>
                        <div class="data-value">45.6亿元</div>
                        <div class="data-compare">同比+28.5%</div>
                    </div>
                    <div class="data-card highlight">
                        <div class="data-label">润泽科技营收</div>
                        <div class="data-value">38.2亿元</div>
                        <div class="data-compare">同比+35.2%</div>
                    </div>
                </div>
                <div class="data-grid">
                    <div class="data-card">
                        <div class="data-label">中联数据净利润</div>
                        <div class="data-value">6.8亿元</div>
                        <div class="data-compare">净利率14.9%</div>
                    </div>
                    <div class="data-card">
                        <div class="data-label">润泽科技净利润</div>
                        <div class="data-value">8.2亿元</div>
                        <div class="data-compare">净利率21.5%</div>
                    </div>
                </div>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">1. 营业收入对比</p>
                    <ul class="key-list">
                        <li><strong>中联数据：</strong>营收规模45.6亿元，行业排名第二，主要受益于字节跳动等大客户订单增长</li>
                        <li><strong>润泽科技：</strong>营收规模38.2亿元，增速35.2%高于中联数据，AI算力订单占比提升至40%</li>
                        <li><strong>结论：</strong>中联数据营收45.6亿高于润泽科技38.2亿；润泽科技收入增速35.2%高于中联数据28.5%</li>
                    </ul>
                </div>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">2. 净利润对比</p>
                    <ul class="key-list">
                        <li><strong>中联数据：</strong>净利润6.8亿元，净利率14.9%，受上游硬件成本上涨影响</li>
                        <li><strong>润泽科技：</strong>净利润8.2亿元，净利率21.5%，自建园区模式降低运营成本</li>
                        <li><strong>结论：</strong>润泽科技净利率21.5%，高于中联数据14.9%，差值6.6个百分点</li>
                    </ul>
                </div>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">3. 用电量与能效对比</p>
                    <ul class="key-list">
                        <li><strong>中联数据：</strong>年度用电量15.2亿度，PUE值1.45，绿色数据中心占比60%</li>
                        <li><strong>润泽科技：</strong>年度用电量11.8亿度，PUE值1.35，液冷技术大规模应用</li>
                        <li><strong>结论：</strong>润泽科技PUE 1.35，低于中联数据1.45，差值0.10</li>
                    </ul>
                </div>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">4. 收入增速对比</p>
                    <ul class="key-list">
                        <li><strong>中联数据：</strong>近三年CAGR 25.3%，传统云计算业务增速放缓至15%</li>
                        <li><strong>润泽科技：</strong>近三年CAGR 32.8%，AI智算中心业务贡献主要增量</li>
                        <li><strong>结论：</strong>润泽科技近三年CAGR 32.8%，高于中联数据25.3%</li>
                    </ul>
                </div>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">5. 客户结构对比</p>
                    <ul class="key-list">
                        <li><strong>中联数据：</strong>字节跳动占比55%，美团、京东等占比30%，前两大客户合计占比85%</li>
                        <li><strong>润泽科技：</strong>字节跳动占比35%，华为、浪潮等AI厂商占比40%，前两大客户合计占比75%</li>
                        <li><strong>结论：</strong>中联数据前两大客户合计占比85%，高于润泽科技75%</li>
                    </ul>
                </div>
            </div>
            <div class="analysis-section">
                <h5>💡 投资策略建议</h5>
                <div class="strategy-box">
                    <div class="strategy-item short-term">
                        <div class="strategy-title">短期关注（3-6个月）</div>
                        <div class="strategy-content">关注Q3财报数据中心上架率变化，润泽科技液冷数据中心投产进度，以及AI大客户订单落地情况</div>
                    </div>
                    <div class="strategy-item mid-term">
                        <div class="strategy-title">中期布局（6-12个月）</div>
                        <div class="strategy-content">中联数据建议关注客户多元化进展，润泽科技关注产能扩张与订单匹配度，两家均受益于AI算力订单增长</div>
                    </div>
                    <div class="strategy-item key-points">
                        <div class="strategy-title">核心观察指标</div>
                        <div class="strategy-content">月度用电量增速、PUE值变化、头部客户合同续签情况、AI算力业务占比提升进度</div>
                    </div>
                </div>
            </div>
            <div class="analysis-section">
                <h5>⚠️ 风险提示</h5>
                <div class="risk-warning-box">
                    <ul class="warning-list">
                        <li><strong>客户集中风险：</strong>两家公司均存在大客户依赖，字节跳动订单占营收35%–55%</li>
                        <li><strong>行业竞争风险：</strong>光环新网、数据港等同行加速AI数据中心布局，同业产能扩张速度与市场份额对比需持续跟踪</li>
                        <li><strong>政策风险：</strong>数据中心能耗双控政策趋严，电价上涨可能压缩利润空间</li>
                        <li><strong>技术迭代风险：</strong>液冷、储能等新技术投入成本高，技术路线选择错误可能导致竞争劣势</li>
                        <li><strong>免责声明：</strong>本分析仅供参考，不构成任何投资建议。投资有风险，决策需谨慎。</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 模拟AI分析（测试模式）
    async function mockAIAnalysis(input, isShengTong) {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        if (isShengTong) {
            // 声通科技AI分析报告
            const aiReportHTML = generateShengTongAIReport();
            document.getElementById('result-content').innerHTML = aiReportHTML;
        } else {
            // 通用AI分析
            const genericReportHTML = generateGenericAIReport(input);
            document.getElementById('result-content').innerHTML = genericReportHTML;
        }
    }
    
    // 生成声通科技AI分析报告
    function generateShengTongAIReport() {
        return `
            <div class="analysis-section ai-summary">
                <h5>🤖 AI参谋分析摘要</h5>
                <div class="ai-thinking-box">
                    <p class="ai-thinking-text">基于声通科技最新财报及公开信息：流动比率1.2（行业均值1.8），资产负债率68.5%（行业均值55%），毛利率32.6%（行业均值28%）；当前PE 15.2倍（行业均值22倍）。建议跟踪应收账款周转天数（95天）及下季度财报。</p>
                </div>
            </div>
            <div class="analysis-section">
                <h5>📝 分析主题</h5>
                <p>声通科技财务风险与股价分析</p>
            </div>
            <div class="analysis-section">
                <h5>🔍 核心观点</h5>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">1. 财务风险识别</p>
                    <ul class="risk-list">
                        <li><span class="risk-tag high">高风险</span> 资产负债率68.5%，高于行业均值55%，高出13.5个百分点</li>
                        <li><span class="risk-tag medium">中风险</span> 流动比率1.2，低于行业均值1.8，差值0.6</li>
                        <li><span class="risk-tag medium">中风险</span> 应收账款周转天数95天，需核对同比变动天数</li>
                        <li><span class="risk-tag low">低风险</span> 存货周转率下降15%，存在轻微库存积压</li>
                    </ul>
                </div>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">2. 市场价格对比</p>
                    <ul class="trend-list">
                        <li><span class="trend-tag">PE低于同业</span> 当前股价¥12.85，PE 15.2倍，低于行业均值22倍</li>
                        <li><span class="trend-tag">持仓下降</span> 机构持仓比例下降（请核对最新季报%）</li>
                    </ul>
                </div>
            </div>
            <div class="analysis-section">
                <h5>📊 数据支撑</h5>
                <div class="data-grid">
                    <div class="data-card">
                        <p class="data-label">资产负债率</p>
                        <p class="data-value warning">68.5%</p>
                        <p class="data-compare">行业均值: 55%</p>
                    </div>
                    <div class="data-card">
                        <p class="data-label">流动比率</p>
                        <p class="data-value warning">1.2</p>
                        <p class="data-compare">行业均值: 1.8</p>
                    </div>
                    <div class="data-card">
                        <p class="data-label">净资产收益率</p>
                        <p class="data-value">8.3%</p>
                        <p class="data-compare">行业均值: 12%</p>
                    </div>
                    <div class="data-card highlight">
                        <p class="data-label">毛利率</p>
                        <p class="data-value good">32.6%</p>
                        <p class="data-compare">行业均值: 28% ✓</p>
                    </div>
                </div>
                <div class="price-data-box">
                    <p class="box-title">📈 股价数据（截至最新交易日）</p>
                    <div class="price-row">
                        <span class="price-item">当前股价：<strong>¥12.85</strong></span>
                        <span class="price-item">52周高点：<strong class="high-price">¥18.60</strong></span>
                        <span class="price-item">52周低点：<strong class="low-price">¥9.20</strong></span>
                        <span class="price-item">当前PE：<strong>15.2倍</strong>（行业均值22倍）</span>
                    </div>
                </div>
            </div>
            <div class="analysis-section">
                <h5>✅ 投资建议</h5>
                <div class="strategy-box">
                    <div class="strategy-item short-term">
                        <p class="strategy-title">📌 短期策略（1-3个月）</p>
                        <p class="strategy-content">建议观望，暂不建仓。等待Q2财报发布，重点关注应收账款改善情况。如业绩企稳，可考虑小仓位试探性介入。</p>
                    </div>
                    <div class="strategy-item mid-term">
                        <p class="strategy-title">📌 中期策略（3-12个月）</p>
                        <p class="strategy-content">如股价回调至¥11.00-11.50区间，可考虑分批建仓。目标价¥15.00，止损位¥9.50。建议仓位控制在总资产的5-10%。</p>
                    </div>
                    <div class="strategy-item key-points">
                        <p class="strategy-title">📌 关键关注要点</p>
                        <ul class="key-list">
                            <li>下季度财报应收账款周转天数变化</li>
                            <li>存货去化进度及毛利率稳定性</li>
                            <li>重大合同签订及客户回款情况</li>
                            <li>行业政策变化及同业对比维度变化</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="analysis-section">
                <h5>⚠️ 风险提示</h5>
                <div class="risk-warning-box">
                    <ul class="warning-list">
                        <li><strong>市场风险：</strong>宏观经济波动可能影响下游订单，导致业绩不及预期</li>
                        <li><strong>竞争风险：</strong>行业毛利率同比变动待核对（请补充%）</li>
                        <li><strong>流动性风险：</strong>资产负债率68.5%，高于行业均值55%</li>
                        <li><strong>模型局限：</strong>本分析基于历史数据和公开信息，无法预测突发事件影响</li>
                        <li><strong>免责声明：</strong>本分析仅供参考，不构成任何投资建议。投资有风险，决策需谨慎。</li>
                    </ul>
                </div>
            </div>
            <div class="analysis-section document-reference">
                <p><strong>📄 参考文档：</strong>《声通科技财务风险与股价分析.pdf》</p>
                <p class="document-hint">💡 提示：完整的分析报告见此文档</p>
            </div>
        `;
    }
    
    // 生成通用AI分析报告
    function generateGenericAIReport(input) {
        return `
            <div class="analysis-section ai-summary">
                <h5>🤖 AI参谋分析摘要</h5>
                <div class="ai-thinking-box">
                    <p class="ai-thinking-text">收到你的分析请求：「${input}」。我已启动多维度分析引擎，对该标的进行全面评估。以下是基于当前市场数据和历史趋势的初步分析结果。</p>
                </div>
            </div>
            <div class="analysis-section">
                <h5>📝 分析主题</h5>
                <p>${input}</p>
            </div>
            <div class="analysis-section">
                <h5>🔍 核心观点</h5>
                <div class="viewpoint-box">
                    <p class="viewpoint-title">初步评估</p>
                    <p>基于资产负债、现金流及同业对比，建议关注以下关键因素：</p>
                    <ul class="risk-list">
                        <li>宏观经济环境对行业的影响</li>
                        <li>公司核心竞争力与市场地位</li>
                        <li>财务健康状况与盈利质量</li>
                        <li>资产负债率、现金流与同业对比</li>
                    </ul>
                </div>
            </div>
            <div class="analysis-section">
                <h5>📊 分析框架</h5>
                <div class="framework-box">
                    <p>AI参谋将从以下维度进行深入分析：</p>
                    <ul class="framework-list">
                        <li>📈 财务指标分析（盈利能力、偿债能力、运营效率）</li>
                        <li>🏭 同业对比分析（对比对象、比较维度、市场份额）</li>
                        <li>📉 历史趋势分析（股价走势、资产负债变化、量价关系）</li>
                        <li>🔮 未来展望（业绩预测、催化剂、风险因素）</li>
                    </ul>
                </div>
            </div>
            <div class="analysis-section">
                <h5>⚠️ 风险提示</h5>
                <div class="risk-warning-box">
                    <p>投资决策需综合考虑以下风险因素：</p>
                    <ul class="warning-list">
                        <li>市场风险：宏观经济波动、政策变化等系统性风险</li>
                        <li>个股风险：公司经营、同业对比维度变化、技术变革等特异性风险</li>
                        <li>模型风险：AI分析基于历史数据，无法完全预测未来</li>
                        <li>信息风险：分析结果仅供参考，不构成投资建议</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 调用大模型API（演示模式仅使用模拟数据）
    async function callAIAPI(input) {
        // 演示模式下此函数不会被调用（由submitAnalysis中的useMock判断）
        // 如需接入真实API，请配置AI_CONFIG并设置useMock为false
        throw new Error('演示模式不支持真实API调用，请在AI_CONFIG中配置API密钥并设置useMock: false');
    }
    
    // 将AI文本响应转换为HTML格式
    function convertAIResponseToHTML(responseText) {
        // 简单的Markdown转HTML处理
        let html = responseText
            .replace(/#{5}\s+(.+)/g, '<h5>$1</h5>')
            .replace(/#{4}\s+(.+)/g, '<h4>$1</h4>')
            .replace(/#{3}\s+(.+)/g, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        return `<div class="analysis-section"><p>${html}</p></div>`;
    }
    
    // 处理文档上传
    function handleAnalysisDocument(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                
                // 显示文档内容作为分析结果
                document.getElementById('result-content').innerHTML = `
                    <div class="analysis-section">
                        <h5>📄 文档内容：${file.name}</h5>
                        <div class="document-preview">${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}</div>
                    </div>
                `;
                document.getElementById('analysis-result').style.display = 'block';
                
                alert('文档已上传，内容已展示在下方');
            };
            
            if (file.type === 'text/plain') {
                reader.readAsText(file);
            } else {
                // 对于非文本文件（PDF、Word等），显示分析中的状态
                document.getElementById('result-content').innerHTML = `
                    <div class="analysis-section">
                        <h5>📄 文档信息</h5>
                        <p><strong>文件名：</strong>${file.name}</p>
                        <p><strong>文件大小：</strong>${(file.size / 1024).toFixed(2)} KB</p>
                        <p><strong>文件类型：</strong>${file.type || '未知'}</p>
                        <p class="document-note">📋 文档已接收，AI参谋正在分析中...</p>
                    </div>
                `;
                document.getElementById('analysis-result').style.display = 'block';
                
                // 模拟AI分析过程
                setTimeout(() => {
                    // 根据文件名判断是否为声通科技文档
                    const isShengTong = file.name.includes('声通科技') || file.name.includes('声通');
                    
                    if (isShengTong) {
                        // 声通科技财务分析结果
                        const analysisResultHTML = `
                            <div class="analysis-section">
                                <h5>📝 分析主题</h5>
                                <p>声通科技财务风险与股价分析</p>
                            </div>
                            <div class="analysis-section">
                                <h5>🔍 核心观点</h5>
                                <p><strong>1. 财务风险识别：</strong></p>
                                <p>• 资产负债率68.5%（行业均值55%）<br>
                                • 应收账款周转天数95天，需核对同比变动<br>
                                • 存货周转率同比下降15%</p>
                                <p style="margin-top: 12px;"><strong>2. 市场价格对比：</strong></p>
                                <p>• 当前股价¥12.85，PE 15.2倍（行业均值22倍）<br>
                                • 52周区间¥9.20–¥18.60，当前价位于区间中下部<br>
                                • 近20日成交量较60日均量下降18%（请核对最新数据）</p>
                            </div>
                            <div class="analysis-section">
                                <h5>📊 数据支撑</h5>
                                <p><strong>财务指标对比：</strong></p>
                                <p>• 资产负债率：68.5%（行业均值：55%）⚠️<br>
                                • 流动比率：1.2（行业均值：1.8）⚠️<br>
                                • 净资产收益率(ROE)：8.3%（行业均值：12%）<br>
                                • 毛利率：32.6%（行业均值：28%）✓</p>
                                <p style="margin-top: 12px;"><strong>股价数据：</strong></p>
                                <p>• 当前股价：¥12.85<br>
                                • 52周高点：¥18.60<br>
                                • 52周低点：¥9.20<br>
                                • 当前市盈率：15.2倍（行业均值：22倍）</p>
                            </div>
                            <div class="analysis-section">
                                <h5>✅ 投资建议</h5>
                                <p>• <strong>短期策略：</strong>建议观望，等待业绩企稳信号<br>
                                • <strong>中期策略：</strong>如股价回调至11元附近可考虑分批建仓<br>
                                • <strong>关注要点：</strong>下季度财报应收账款改善情况、存货去化进度</p>
                            </div>
                            <div class="analysis-section">
                                <h5>⚠️ 风险提示</h5>
                                <p>• 行业毛利率同比变动待核对（请补充%）<br>
                                • 资产负债率68.5%，高于行业均值55%<br>
                                • 本分析仅供参考，不构成投资建议</p>
                            </div>
                            <div class="analysis-section document-reference">
                                <p><strong>📄 参考文档：</strong>《声通科技财务风险与股价分析.pdf》</p>
                                <p class="document-hint">💡 提示：完整的分析报告见此文档</p>
                            </div>
                        `;
                        document.getElementById('result-content').innerHTML = analysisResultHTML;
                    } else {
                        // 通用文档分析结果
                        const analysisResultHTML = `
                            <div class="analysis-section">
                                <h5>📄 文档来源</h5>
                                <p><strong>文件名：</strong>${file.name}</p>
                                <p><strong>分析时间：</strong>${new Date().toLocaleString()}</p>
                            </div>
                            <div class="analysis-section">
                                <h5>🔍 核心观点</h5>
                                <p>基于文档内容进行深度分析，该标的具有以下特征...</p>
                            </div>
                            <div class="analysis-section">
                                <h5>📊 数据支撑</h5>
                                <p>• 财务指标分析<br>• 行业对比数据<br>• 历史趋势分析</p>
                            </div>
                            <div class="analysis-section">
                                <h5>⚠️ 风险提示</h5>
                                <p>投资决策需综合考虑市场风险、政策风险等因素...</p>
                            </div>
                        `;
                        document.getElementById('result-content').innerHTML = analysisResultHTML;
                    }
                }, 2500);
            }
        }
        input.value = '';
    }
    
    // 清除分析结果
    function clearAnalysis() {
        document.getElementById('analysis-input').value = '';
        document.getElementById('analysis-result').style.display = 'none';
        document.getElementById('result-content').innerHTML = '';
    }
    
    // 保存分析结果
    function saveAnalysis() {
        const content = document.getElementById('result-content').innerHTML;
        const timestamp = new Date().toLocaleString();
        
        // 保存到localStorage
        let savedAnalyses = JSON.parse(localStorage.getItem('canmouAnalyses') || '[]');
        savedAnalyses.push({
            id: Date.now(),
            timestamp: timestamp,
            content: content
        });
        localStorage.setItem('canmouAnalyses', JSON.stringify(savedAnalyses));
        
        alert('分析结果已保存！');
    }
    
    // ========== 今日任务 / 工作日志功能 ==========
    const EMPLOYEE_DAILY_TASKS_KEY = 'employeeDailyTasks';
    const EMPLOYEE_DAILY_TASKS_SEED_VERSION = 7;
    let pendingDeleteEmployeeTaskId = null;
    let selectedEmployeeTaskId = null;

    const TAO_LANGUAGE_REPLACEMENTS = [
        [/\[高净值\]\s*/g, ''],
        [/高净值客户/g, '客户（账户资产待补录万元）'],
        [/高净值/g, ''],
        [/客户画像/g, '客户分析'],
        [/核心画像/g, '核心量化结论'],
        [/画像如下/g, '量化结论如下'],
        [/交易活跃度/g, '近12月交易频次'],
        [/合作评价/g, '合作记录'],
        [/关注度高/g, '近12月有沟通记录'],
        [/战略客户/g, '营业部A类清单客户'],
        [/核心诉求/g, '合作意图'],
        [/行业赛道/g, '行业分类'],
        [/需求偏好/g, '待确认合作项'],
        [/待确认需求项/g, '待确认合作项'],
        [/需求挖掘/g, '意图识别'],
        [/客户需求/g, '合作意图'],
        [/研究服务需求/g, '研究服务安排'],
        [/交易需求/g, '交易意向'],
        [/合作需求/g, '合作意向'],
        [/分析需求/g, '分析事项'],
        [/潜在需求/g, '待确认合作项'],
        [/输入需求/g, '输入事项'],
        [/查询需求/g, '查询事项'],
        [/具体需求/g, '具体事项'],
        [/你的需求/g, '你的意图'],
        [/已识别你的需求/g, '已识别你的意图'],
        [/流动性需求/g, '流动性安排'],
        [/算力需求/g, '算力订单'],
        [/下游需求/g, '下游订单'],
        [/特殊需求/g, '特殊事项'],
        [/需求/g, '意图'],
        [/产品偏好/g, '已购产品/持仓结构'],
        [/风险偏好/g, '风险测评结果'],
        [/（积极型）/g, ''],
        [/积极型/g, ''],
        [/竞争格局/g, '同业对比维度'],
        [/行业景气度/g, '可验证行业指标'],
        [/景气度/g, '可验证指标'],
        [/企业基本面/g, '资产负债与现金流'],
        [/基本面/g, '资产负债与现金流'],
        [/行业研究/g, '对比分析'],
        [/估值水平/g, '资产负债与现金流对比'],
        [/估值偏低/g, 'PE低于同业均值'],
        [/商业模式/g, '资产负债与资产配置'],
        [/行业龙头/g, '可比公司客观数据'],
        [/区域龙头/g, '可比公司客观数据'],
        [/资产波动较大/g, '资产变动约15%'],
        [/近3月资产波动较大/g, '近3月资产变动约15%'],
        [/波动较大/g, '变动幅度约15%'],
        [/持仓中权益类占比偏高/g, '权益类占比62%（超C2建议上限40%）'],
        [/权益类占比偏高/g, '权益类占比超阈值（请核对%）'],
        [/占比偏高/g, '占比超阈值（请核对%与基准）'],
        [/账户资产规模较高客户/g, '账户资产500万以上客户'],
        [/账户资产规模较高的/g, '账户资产500万以上的'],
        [/账户资产规模较高/g, '账户资产500万以上'],
        [/杠杆水平偏高/g, '资产负债率高于行业均值（请核对%）'],
        [/债务水平偏高/g, '资产负债率高于行业均值（请核对%）'],
        [/资产负债率偏高/g, '资产负债率高于行业均值（请核对%）'],
        [/概率较高/g, '近6个月同类签约率28%'],
        [/概率较大/g, '概率待测算（请补充%）'],
        [/已有一定认知/g, '近12个月有权益类交易记录'],
        [/重点维护客户/g, '营业部清单客户'],
        [/活跃客户/g, '近30日有交易记录客户'],
        [/客户集中度较高/g, '单一客户占比超50%'],
        [/相对低位/g, 'PE低于行业均值'],
        [/一定的流动性压力/g, '流动比率低于行业均值'],
        [/压力增大/g, '周转天数同比增加（请核对天）'],
        [/市场情绪偏向谨慎/g, '机构持仓比例下降（请核对%）'],
        [/情绪谨慎/g, '机构持仓比例下降'],
        [/需主动触达/g, '待外呼确认'],
        [/合格投资者认定/g, '投资者准入认定（金融资产≥300万元）'],
        [/合格投资者/g, '投资者准入（金融资产≥300万元）'],
        [/偏股型持仓客户/g, '权益类持仓≥60%且未开通定投客户'],
        [/持仓偏股型客户/g, '权益类持仓≥60%客户'],
        [/偏股型基金/g, '权益仓位≥60%的基金'],
        [/偏股型/g, '权益仓位≥60%'],
        [/适当性匹配异常/g, '风险测评等级与持仓产品风险等级不匹配（如C1持有R4）'],
        [/适当性异常/g, '风险测评C1且持仓产品≥R4'],
        [/大额资金到账/g, '单笔银证转入≥100万元到账'],
        [/大额资金/g, '单笔银证转入≥100万元'],
        [/短期理财产品/g, '期限≤90天且风险等级R1–R2的理财产品'],
        [/短期理财/g, '期限≤90天理财（R1–R2）'],
        [/重点触达/g, '待外呼']
    ];

    function sanitizeTaoLanguageText(text) {
        if (typeof text !== 'string') return text;
        let out = text;
        TAO_LANGUAGE_REPLACEMENTS.forEach(([pattern, replacement]) => {
            out = out.replace(pattern, replacement);
        });
        return out;
    }

    function sanitizeEmployeeDailyTask(task) {
        if (!task || typeof task !== 'object') return task;
        return {
            ...task,
            title: sanitizeTaoLanguageText(task.title),
            summary: sanitizeTaoLanguageText(task.summary),
            content: sanitizeTaoLanguageText(task.content)
        };
    }

    const defaultEmployeeDailyTasks = [
        {
            id: 'seed-0',
            title: '昨日会话复盘：3项任务推进进展低于预期，建议拉通相关责任人协同处理',
            summary: '基于昨日4场会话记录分析，识别出客户季度回访、机构开户补件、私募双录3项任务推进缓慢，建议尽快拉通投资业务助理、资管业务助理及合规部李娜协同跟进',
            content: '自动驾驶大模型于今日09:00自动复盘昨日（7月1日）全部会话记录，共涉及4场对话、3位业务助理。经分析识别出3项任务推进进展低于预期：①客户张某季度回访（投资业务助理发起，昨日未完成外呼，客户资产变动15%待确认）；②测试科技有限公司开户补件（投行业务助理跟进，营业执照补件尚未上传，法人证件即将过期）；③私募基金双录视频（资管业务助理跟进，客户已签风险揭示书但双录视频未上传）。建议拉通相关责任人与合规部李娜共同推进，确保本周内完成闭环。',
            source: '自动驾驶大模型',
            sourceType: 'auto-pilot',
            date: '2026-07-02',
            time: '09:00',
            timestamp: new Date('2026-07-02T09:00:00').getTime()
        },
        {
            id: 'seed-1',
            title: '客户张某（账户资产888万）季度回访待完成，近3月资产变动约15%，待外呼确认',
            summary: '张三（资产规模888万），近3月资产变动约15%，需了解持仓变动原因并推荐固收类产品进行仓位调整',
            content: '该客户为营业部清单客户，账户资产规模888万元，近三个月账户资产变动约15%，主要系持仓的权益类产品净值调整所致。客户此前风险测评为稳健型（C2），目前权益类持仓占比62%（超C2建议上限40%），需在本次回访中核对客户对近期市场波动的反馈、风险测评结果是否有变化，并根据客户反馈推荐合适的固收类或固收+产品进行仓位再平衡，回访记录需在CRM系统中完整留痕。',
            source: '投资业务助理',
            sourceType: 'agent',
            date: '2026-06-16',
            time: '09:00',
            timestamp: new Date('2026-06-16T09:00:00').getTime()
        },
        {
            id: 'seed-2',
            title: '机构客户"测试科技有限公司"开户资料补件待跟进，营业执照及法人证件需重新上传',
            summary: '测试科技有限公司开户申请，营业执照复印件不清晰需重新上传，法人身份证即将过期需提醒更新',
            content: '测试科技有限公司为营业部新拓展的机构客户，拟开通证券账户用于闲置资金理财。该客户开户申请已提交至柜台系统，目前因营业执照印件扫描件清晰度不足被退回，且法人身份证有效期将于下月到期，需提醒客户同步更新证件。客户表示有资金使用计划，希望尽快完成开户，已申请绿色通道加急处理，需持续跟进资料补齐进度。',
            source: '投行业务助理',
            sourceType: 'agent',
            date: '2026-06-16',
            time: '09:45',
            timestamp: new Date('2026-06-16T09:45:00').getTime()
        },
        {
            id: 'seed-3',
            title: '私募基金双录视频待完成，客户已签署风险揭示书',
            summary: '李四（投资者准入已认定，金融资产≥300万元）已签署"测试一号"私募基金风险揭示书，需在系统中完成双录视频上传及合规提交',
            content: '客户李四已完成投资者准入认定（金融资产≥300万元），风险测评结果为进取型（C5），符合"测试一号"私募基金（R4风险等级）的适当性匹配规则。客户已线下签署基金合同及风险揭示书，根据监管要求，需在签约过程中完成录音录像双录。目前双录视频尚未上传至合规系统，需尽快预约客户完成双录环节，确保签约流程符合合规要求并归档备查。',
            source: '资管业务助理',
            sourceType: 'agent',
            date: '2026-06-16',
            time: '10:30',
            timestamp: new Date('2026-06-16T10:30:00').getTime()
        },
        {
            id: 'seed-4',
            title: '基金定投缺口8户，待外呼权益类持仓≥60%且未开定投客户35人',
            summary: '完成率73%（22/30户），筛选条件：权益类持仓≥60%、未开通定投',
            content: '本月营业部基金定投新增签约目标30户，已完成22户，缺口8户，完成率73%。筛选存量客户：持有权益仓位≥60%的基金且未开通定投功能，共35人；该群体近12个月有权益类交易记录，近6个月同类客户定投签约率28%。建议按名单外呼，说明定投规则与操作步骤，于本月20日前补齐缺口8户。',
            source: '员工工作台',
            sourceType: 'workbench',
            date: '2026-06-16',
            time: '11:15',
            timestamp: new Date('2026-06-16T11:15:00').getTime()
        },
        {
            id: 'seed-6',
            title: '单笔银证转入≥100万且3日零持仓变动，待推荐期限≤90天产品',
            summary: '客户吴九转入566万，6/12–6/15持仓变动0笔，待确认资金用途',
            content: '客户吴九近30日交易8笔，账户日均资产120万元。6月12日银证转账转入566万元（触发阈值：单笔≥100万元）。截至6月15日连续3个交易日持仓变动0笔，转入资金未配置。处理：外呼确认资金用途；若选择理财，仅推荐期限≤90天、风险等级R1–R2的货币基金或银行理财产品，并记录CRM。',
            source: '投资业务助理',
            sourceType: 'agent',
            date: '2026-06-16',
            time: '15:30',
            timestamp: new Date('2026-06-16T15:30:00').getTime()
        }
    ];

    function getEmployeeDailyTasks() {
        try {
            const raw = localStorage.getItem(EMPLOYEE_DAILY_TASKS_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return null;
            return parsed.map(sanitizeEmployeeDailyTask);
        } catch (e) {
            return null;
        }
    }

    function saveEmployeeDailyTasks(tasks) {
        localStorage.setItem(EMPLOYEE_DAILY_TASKS_KEY, JSON.stringify(tasks));
    }

    function initEmployeeDailyTasks() {
        const seedVersion = localStorage.getItem(EMPLOYEE_DAILY_TASKS_KEY + '_seed');
        const needsReseed = seedVersion !== String(EMPLOYEE_DAILY_TASKS_SEED_VERSION);
        const existing = getEmployeeDailyTasks();

        if (!existing || needsReseed) {
            saveEmployeeDailyTasks(defaultEmployeeDailyTasks);
            localStorage.setItem(EMPLOYEE_DAILY_TASKS_KEY + '_seed', String(EMPLOYEE_DAILY_TASKS_SEED_VERSION));
        } else {
            const sanitized = existing.map(sanitizeEmployeeDailyTask);
            if (JSON.stringify(existing) !== JSON.stringify(sanitized)) {
                saveEmployeeDailyTasks(sanitized);
            }
        }
        bindOverlayScrollbar(document.getElementById('employee-daily-tasks-scroll'));
        renderEmployeeDailyTasks();
        updateEmployeeSidebarNavCounts();
        bindEmployeeDailyTaskEvents();
        document.getElementById('new-task-btn')?.addEventListener('click', openWorkLog);
    }

    function canDeleteEmployeeTask(task) {
        return task?.sourceType === 'workbench' || task?.source === '业务团队工作台' || task?.source === '员工工作台';
    }

    function bindEmployeeDailyTaskEvents() {
        if (document.body.dataset.employeeTaskEventsBound === 'true') return;
        document.body.dataset.employeeTaskEventsBound = 'true';

        document.getElementById('employee-daily-tasks-list')?.addEventListener('click', (event) => {
            const sendBtn = event.target.closest('.employee-task-send-btn');
            if (sendBtn) {
                event.stopPropagation();
                sendEmployeeTaskToChat(sendBtn.dataset.taskId);
                return;
            }
            const deleteBtn = event.target.closest('.employee-task-delete-btn');
            if (deleteBtn) {
                event.stopPropagation();
                openEmployeeTaskDeleteModal(deleteBtn.dataset.taskId);
                return;
            }
            const item = event.target.closest('.tip-item[data-task-id]');
            if (item) {
                openEmployeeTaskDetail(item.dataset.taskId);
            }
        });

        document.getElementById('employee-task-detail-close')?.addEventListener('click', closeEmployeeTaskDetail);
        document.getElementById('employee-task-agent-btn')?.addEventListener('click', () => {
            if (selectedEmployeeTaskId) {
                sendEmployeeTaskToChat(selectedEmployeeTaskId);
                closeEmployeeTaskDetail();
            }
        });
    }

    function renderEmployeeDailyTasks() {
        const listEl = document.getElementById('employee-daily-tasks-list');
        const tasks = (getEmployeeDailyTasks() || []).slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (!listEl) {
            updateEmployeeSidebarNavCounts();
            return;
        }

        if (!tasks.length) {
            listEl.innerHTML = '<li class="employee-task-empty">暂无今日任务，点击「新建任务」添加</li>';
            closeEmployeeTaskDetail();
            updateEmployeeSidebarNavCounts();
            return;
        }

        listEl.innerHTML = tasks.map((task, index) => `
            <li class="tip-item${selectedEmployeeTaskId === task.id ? ' is-active' : ''}" data-task-id="${escapeHtmlAttr(task.id)}">
                <span class="tip-number">${index + 1}</span>
                <p class="tip-content tip-content-title">${escapeHtmlText(task.title)}</p>
                <div class="employee-task-item-actions">
                    ${canDeleteEmployeeTask(task) ? `<button type="button" class="employee-task-delete-btn" data-task-id="${escapeHtmlAttr(task.id)}" aria-label="删除" title="删除">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>` : ''}
                    <button type="button" class="employee-task-send-btn" data-task-id="${escapeHtmlAttr(task.id)}" aria-label="发送到对话" title="发送到对话">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </li>
        `).join('');
        updateEmployeeSidebarNavCounts();
    }

    function formatEmployeeTaskDateTime(task) {
        const date = task.date || '';
        const time = (task.time || '').slice(0, 5);
        return `${date} ${time}`.trim();
    }

    function buildEmployeeAllDailyTasksChatHtml() {
        const tasks = (getEmployeeDailyTasks() || []).slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const count = tasks.length;
        if (!count) {
            return `
                <p class="chat-md-h2">今日任务</p>
                <p>当前暂无今日任务。</p>
            `;
        }
        return `
            <p class="chat-md-h2">今日任务（${count}）</p>
            <p>点击任一任务，即可把任务详情发送到对话里继续处理。</p>
            <div class="chat-task-list">
                ${tasks.map((task) => `
                    <button type="button" class="chat-task-card" data-task-id="${escapeHtmlAttr(task.id)}">
                        <div class="chat-task-card-title">${escapeHtmlText(task.title || '')}</div>
                        <div class="chat-task-card-meta">
                            <span class="chat-task-card-source">${escapeHtmlText(task.source || '业务助理')}</span>
                            <span class="chat-task-card-time">${escapeHtmlText(formatEmployeeTaskDateTime(task))}</span>
                        </div>
                        <div class="chat-task-card-summary">${escapeHtmlText(task.summary || '')}</div>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function openEmployeeTaskDetail(taskId) {
        const tasks = getEmployeeDailyTasks() || [];
        const task = tasks.find(item => item.id === taskId);
        if (!task) return;

        selectedEmployeeTaskId = taskId;
        const drawer = document.getElementById('employee-task-detail-drawer');
        if (!drawer) return;

        document.getElementById('employee-task-detail-title').textContent = task.title;
        document.getElementById('employee-task-detail-summary').textContent = task.summary || '暂无摘要';
        document.getElementById('employee-task-detail-content').textContent = task.content || '暂无事项内容';
        document.getElementById('employee-task-detail-source').textContent = `来源：${task.source || '员工工作台'}`;
        document.getElementById('employee-task-detail-time').textContent = `创建时间：${formatEmployeeTaskDateTime(task)}`;

        drawer.hidden = false;
        document.body.style.overflow = 'hidden';
        renderEmployeeDailyTasks();
    }

    function closeEmployeeTaskDetail() {
        selectedEmployeeTaskId = null;
        const drawer = document.getElementById('employee-task-detail-drawer');
        if (drawer) drawer.hidden = true;
        document.body.style.overflow = '';
        renderEmployeeDailyTasks();
    }

    function openEmployeeTaskDeleteModal(taskId) {
        const tasks = getEmployeeDailyTasks() || [];
        const task = tasks.find(item => item.id === taskId);
        if (!task || !canDeleteEmployeeTask(task)) return;

        pendingDeleteEmployeeTaskId = taskId;
        const modal = document.getElementById('employee-task-delete-modal');
        if (modal) modal.hidden = false;
    }

    function closeEmployeeTaskDeleteModal() {
        pendingDeleteEmployeeTaskId = null;
        const modal = document.getElementById('employee-task-delete-modal');
        if (modal) modal.hidden = true;
    }

    function confirmDeleteEmployeeTask() {
        if (!pendingDeleteEmployeeTaskId) return;
        const tasks = getEmployeeDailyTasks() || [];
        const task = tasks.find(item => item.id === pendingDeleteEmployeeTaskId);
        if (!task || !canDeleteEmployeeTask(task)) {
            closeEmployeeTaskDeleteModal();
            return;
        }
        const nextTasks = tasks.filter(item => item.id !== pendingDeleteEmployeeTaskId);
        saveEmployeeDailyTasks(nextTasks);
        if (selectedEmployeeTaskId === pendingDeleteEmployeeTaskId) {
            closeEmployeeTaskDetail();
        }
        closeEmployeeTaskDeleteModal();
        renderEmployeeDailyTasks();
    }

    function ensureEmployeeChatMode(panel) {
        const state = getPanelState(panel);
        if (state.chatModeActive) return state.currentCardIndex ?? 0;

        const assistantIndex = state.currentCardIndex ?? 0;
        applyEmployeeChatModeUI(panel, {
            index: assistantIndex,
            showWelcome: false,
            createHistory: !state.currentSessionId
        });
        return assistantIndex;
    }

    function getSupportAgentByName(name) {
        return supportAgents.find(a => a.name === name) || null;
    }

    function getTaskAssistantReply(task, index, panel) {
        if (task.sourceType === 'auto-pilot') {
            return buildAutoPilotTaskReplyHtml(task);
        }
        if (task.sourceType === 'agent') {
            const agent = getSupportAgentByName(task.source);
            if (agent) {
                return `**${agent.name}**\n\n任务：${task.title}\n\n梳理背景与节点、生成执行建议、跟进进展。\n\n输入：指定起始步骤或补充材料。`;
            }
        }
        const assistant = getEmployeeAssistant(index, panel || getActiveWorkbenchPanel());
        return `**${assistant.name}**\n\n任务：${task.title}\n\n梳理背景与节点、生成执行建议、跟进进展。\n\n输入：指定起始步骤或补充材料。`;
    }

    function buildAutoPilotTaskReplyHtml(task) {
        return `<div class="autopilot-reply-card">
            <p class="chat-md-h2">昨日会话复盘报告</p>
            <p>我已自动复盘昨日（7月1日）的全部会话记录，共涉及 <strong>4场对话</strong>、<strong>3位业务助理</strong>，识别出 <strong>3项任务</strong> 推进进展低于预期，需尽快协同处理。</p>
            <p><strong>进展滞后任务清单</strong></p>
            <div class="autopilot-task-list">
                <div class="autopilot-task-item">
                    <div class="autopilot-task-item-title">① 客户张某季度回访</div>
                    <div class="autopilot-task-item-meta">
                        <span class="autopilot-task-item-source">投资业务助理</span>
                        <span class="autopilot-task-item-status autopilot-task-item-status--warning">未完成外呼</span>
                    </div>
                    <div class="autopilot-task-item-desc">客户资产变动约15%，权益类持仓占比62%超C2上限，昨日会话中未完成外呼确认</div>
                </div>
                <div class="autopilot-task-item">
                    <div class="autopilot-task-item-title">② 测试科技有限公司开户补件</div>
                    <div class="autopilot-task-item-meta">
                        <span class="autopilot-task-item-source">投行业务助理</span>
                        <span class="autopilot-task-item-status autopilot-task-item-status--warning">补件未上传</span>
                    </div>
                    <div class="autopilot-task-item-desc">营业执照扫描件不清晰需重新上传，法人身份证下月到期需同步更新</div>
                </div>
                <div class="autopilot-task-item">
                    <div class="autopilot-task-item-title">③ 私募基金双录视频</div>
                    <div class="autopilot-task-item-meta">
                        <span class="autopilot-task-item-source">资管业务助理</span>
                        <span class="autopilot-task-item-status autopilot-task-item-status--warning">双录未上传</span>
                    </div>
                    <div class="autopilot-task-item-desc">客户李四已签署风险揭示书，但双录视频尚未上传至合规系统</div>
                </div>
            </div>
            <p><strong>建议拉通的相关人员</strong></p>
            <p>以下人员与上述任务直接相关，点击即可将其拉入当前会话协同推进：</p>
            <div class="autopilot-mention-suggestions">
                <button type="button" class="autopilot-mention-chip" data-mention-id="emp-zhangming">
                    <span class="autopilot-mention-emoji">👨‍💼</span>
                    <span class="autopilot-mention-name">张明</span>
                    <span class="autopilot-mention-dept">投行部·高级经理</span>
                </button>
                <button type="button" class="autopilot-mention-chip" data-mention-id="emp-liutao">
                    <span class="autopilot-mention-emoji">👨‍💼</span>
                    <span class="autopilot-mention-name">刘涛</span>
                    <span class="autopilot-mention-dept">资管部·副总裁</span>
                </button>
                <button type="button" class="autopilot-mention-chip" data-mention-id="emp-lina">
                    <span class="autopilot-mention-emoji">👩‍💼</span>
                    <span class="autopilot-mention-name">李娜</span>
                    <span class="autopilot-mention-dept">合规部·高级经理</span>
                </button>
            </div>
            <p class="autopilot-reply-footer">💡 点击上方人员卡片将其拉入会话，或在下方输入 <code>@</code> 选择更多相关人员，共同推进任务闭环。</p>
        </div>`;
    }

    function sendEmployeeTaskToChat(taskId) {
        const tasks = getEmployeeDailyTasks() || [];
        const task = tasks.find(item => item.id === taskId);
        if (!task) return;

        const panel = document.getElementById('workbench-panel-employee');
        if (!panel) return;

        const assistantIndex = ensureEmployeeChatMode(panel);

        // 将任务同步到右侧「关联任务」面板（必须在 ensureEmployeeChatMode 之后，因为首次进入可能会 reset 上下文）
        window.ContextPanel?.addTask?.({
            id: task.id,
            title: task.title || '任务',
            status: task.status || '待处理',
            dueDate: task.date ? `${task.date} ${task.time || ''}`.trim() : ''
        });

        appendChatMessage(task.title, 'user', panel);
        setTimeout(() => {
            let options = {};
            if (task.sourceType === 'agent') {
                const agent = getSupportAgentByName(task.source);
                if (agent) {
                    options = {
                        agentId: agent.id,
                        assistantAvatarKey: `support-${agent.id}`,
                        assistantDisplayName: agent.name
                    };
                }
            } else if (task.sourceType === 'auto-pilot') {
                options = {
                    assistantAvatarKey: 'autopilot',
                    assistantDisplayName: '自动驾驶大模型',
                    html: true
                };
            }
            appendChatMessage(getTaskAssistantReply(task, getPanelState(panel).currentCardIndex ?? assistantIndex, panel), 'assistant', panel, options);
        }, 400);

        syncEmployeeChatModeLayout();
    }

    function updateEmployeeTaskCharCount(inputId, countId, max) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(countId);
        if (!input || !counter) return;
        counter.textContent = `${input.value.length}/${max}`;
    }

    function resetEmployeeTaskFormCounters() {
        ['log-title', 'log-summary', 'log-content'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.dispatchEvent(new Event('input'));
        });
    }

    function openWorkLog() {
        const workLogPage = document.getElementById('work-log-page');
        const now = new Date();

        document.getElementById('log-date').value = now.toISOString().split('T')[0];
        document.getElementById('log-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('log-title').value = '';
        document.getElementById('log-summary').value = '';
        document.getElementById('log-content').value = '';
        resetEmployeeTaskFormCounters();

        workLogPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeWorkLog() {
        const workLogPage = document.getElementById('work-log-page');
        workLogPage.style.display = 'none';
        document.body.style.overflow = '';
    }

    function saveWorkLog(event) {
        event.preventDefault();

        const date = document.getElementById('log-date').value;
        const time = document.getElementById('log-time').value;
        const title = document.getElementById('log-title').value.trim();
        const summary = document.getElementById('log-summary').value.trim();
        const content = document.getElementById('log-content').value.trim();

        if (!date || !time || !title || !content) {
            alert('请填写时间、标题和事项');
            return;
        }

        const task = {
            id: `task-${Date.now()}`,
            title,
            summary,
            content,
            source: '员工工作台',
            sourceType: 'workbench',
            date,
            time,
            timestamp: new Date(`${date}T${time}`).getTime() || Date.now()
        };

        const tasks = getEmployeeDailyTasks() || [];
        tasks.unshift(task);
        tasks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        saveEmployeeDailyTasks(tasks);
        renderEmployeeDailyTasks();

        alert('保存成功！');
        closeWorkLog();
    }

    function pushEmployeeDailyTaskFromAgent(taskData) {
        const tasks = getEmployeeDailyTasks() || [];
        tasks.unshift({
            id: taskData.id || `task-${Date.now()}`,
            title: taskData.title,
            summary: taskData.summary || '',
            content: taskData.content || taskData.title,
            source: taskData.source || '智能体',
            sourceType: 'agent',
            date: taskData.date || new Date().toISOString().split('T')[0],
            time: taskData.time || new Date().toTimeString().slice(0, 5),
            timestamp: Date.now()
        });
        tasks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        saveEmployeeDailyTasks(tasks);
        renderEmployeeDailyTasks();
    }
    
    function getDigitalAvatarsScrollContainer(wrap) {
        if (wrap?.classList.contains('center-agents-scroll-wrap')) {
            const track = wrap.querySelector('.digital-avatars-scroll.center-agents-track');
            return track?.querySelector('.digital-avatars') || track;
        }
        return wrap?.querySelector('.digital-avatars-scroll');
    }

    function measureCenterAgentsOverflow(scrollContainer, avatarsEl, threshold) {
        if (!scrollContainer || !avatarsEl) return false;
        return scrollContainer.scrollWidth - scrollContainer.clientWidth > threshold;
    }

    function updateDigitalAvatarsScrollButtonsForWrap(wrap) {
        const scrollContainer = getDigitalAvatarsScrollContainer(wrap);
        const btnLeft = wrap?.querySelector('.digital-avatars-scroll-left');
        const btnRight = wrap?.querySelector('.digital-avatars-scroll-right');
        if (!scrollContainer || !btnLeft || !btnRight) return;

        const wrapRect = wrap.getBoundingClientRect();
        if (wrapRect.width <= 0 || wrapRect.height <= 0) {
            btnLeft.hidden = true;
            btnRight.hidden = true;
            wrap.classList.remove('is-scroll-overflow');
            return;
        }

        const overflowThreshold = 8;
        const isCenterBar = wrap.classList.contains('center-agents-scroll-wrap');
        const avatarsEl = isCenterBar
            ? scrollContainer
            : scrollContainer.querySelector('.digital-avatars');
        let hasOverflow;

        if (isCenterBar) {
            wrap.classList.add('is-scroll-overflow');
            hasOverflow = measureCenterAgentsOverflow(scrollContainer, avatarsEl, overflowThreshold);
            if (!hasOverflow) {
                wrap.classList.remove('is-scroll-overflow');
                scrollContainer.scrollLeft = 0;
            }
        } else {
            const overflow = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            hasOverflow = overflow > overflowThreshold;
            wrap.classList.toggle('is-scroll-overflow', hasOverflow);
        }

        if (!hasOverflow) {
            scrollContainer.scrollLeft = 0;
            btnLeft.hidden = true;
            btnRight.hidden = true;
            return;
        }

        const tolerance = 4;
        const scrollOverflow = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const canScrollLeft = scrollContainer.scrollLeft > tolerance;
        const canScrollRight = scrollContainer.scrollLeft < scrollOverflow - tolerance;

        btnLeft.hidden = !canScrollLeft;
        btnRight.hidden = !canScrollRight;
    }

    function updateDigitalAvatarsScrollButtons() {
        document.querySelectorAll('.digital-avatars-scroll-wrap').forEach(updateDigitalAvatarsScrollButtonsForWrap);
    }

    window.updateDigitalAvatarsScrollButtons = updateDigitalAvatarsScrollButtons;

    function scrollDigitalAvatars(wrap, direction) {
        const scrollContainer = getDigitalAvatarsScrollContainer(wrap);
        if (!scrollContainer) return;
        const isCenterBar = wrap.classList.contains('center-agents-scroll-wrap');
        let step;
        if (isCenterBar) {
            const items = scrollContainer.querySelectorAll('.avatar-item');
            const firstVisible = Array.from(items).find((item) => {
                const rect = item.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                return rect.right > containerRect.left + 2 && rect.left < containerRect.right - 2;
            }) || items[0];
            const gap = parseFloat(getComputedStyle(scrollContainer).columnGap || getComputedStyle(scrollContainer).gap || '0') || 0;
            step = firstVisible ? firstVisible.getBoundingClientRect().width + gap : 120;
        } else {
            step = Math.max(180, Math.round(scrollContainer.clientWidth * 0.65));
        }
        scrollContainer.scrollBy({ left: direction * step, behavior: 'smooth' });
    }

    function initDigitalAvatarsScrollControls() {
        document.querySelectorAll('.digital-avatars-scroll-wrap').forEach((wrap) => {
        const scrollContainer = getDigitalAvatarsScrollContainer(wrap);
        const btnLeft = wrap.querySelector('.digital-avatars-scroll-left');
        const btnRight = wrap.querySelector('.digital-avatars-scroll-right');
        if (!scrollContainer || !btnLeft || !btnRight) return;

        if (wrap.dataset.scrollBound !== 'true') {
            wrap.dataset.scrollBound = 'true';

            btnLeft.addEventListener('click', (e) => {
                e.stopPropagation();
                scrollDigitalAvatars(wrap, -1);
                setTimeout(() => updateDigitalAvatarsScrollButtonsForWrap(wrap), 320);
            });

            btnRight.addEventListener('click', (e) => {
                e.stopPropagation();
                scrollDigitalAvatars(wrap, 1);
                setTimeout(() => updateDigitalAvatarsScrollButtonsForWrap(wrap), 320);
            });

            scrollContainer.addEventListener('scroll', () => {
                updateDigitalAvatarsScrollButtonsForWrap(wrap);
            }, { passive: true });

            if (typeof ResizeObserver !== 'undefined' && wrap.dataset.resizeObserved !== 'true') {
                wrap.dataset.resizeObserved = 'true';
                const ro = new ResizeObserver(() => updateDigitalAvatarsScrollButtonsForWrap(wrap));
                ro.observe(scrollContainer);
                if (wrap.classList.contains('center-agents-scroll-wrap')) {
                    ro.observe(wrap);
                }
            }

            window.addEventListener('resize', () => {
                updateDigitalAvatarsScrollButtons();
            });

            let isDown = false;
            let startX;
            let scrollLeft;

            scrollContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                scrollContainer.classList.add('active');
                startX = e.pageX - scrollContainer.offsetLeft;
                scrollLeft = scrollContainer.scrollLeft;
            });

            scrollContainer.addEventListener('mouseleave', () => {
                isDown = false;
                scrollContainer.classList.remove('active');
            });

            scrollContainer.addEventListener('mouseup', () => {
                isDown = false;
                scrollContainer.classList.remove('active');
                updateDigitalAvatarsScrollButtonsForWrap(wrap);
            });

            scrollContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - scrollContainer.offsetLeft;
                const walk = (x - startX) * 2;
                scrollContainer.scrollLeft = scrollLeft - walk;
            });

            let touchStartX;
            let touchScrollLeft;

            scrollContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].pageX - scrollContainer.offsetLeft;
                touchScrollLeft = scrollContainer.scrollLeft;
            }, { passive: true });

            scrollContainer.addEventListener('touchmove', (e) => {
                const x = e.touches[0].pageX - scrollContainer.offsetLeft;
                const walk = (x - touchStartX) * 2;
                scrollContainer.scrollLeft = touchScrollLeft - walk;
            }, { passive: true });

            scrollContainer.addEventListener('touchend', () => {
                updateDigitalAvatarsScrollButtonsForWrap(wrap);
            }, { passive: true });
        }

        updateDigitalAvatarsScrollButtonsForWrap(wrap);
        });
        requestAnimationFrame(updateDigitalAvatarsScrollButtons);
    }

    window.openEmployeeSession = function (session) {
        const panel = document.getElementById('workbench-panel-employee');
        if (!panel || !session) return;

        const workbenchSession = isWorkbenchAssistantSession(session);
        applyEmployeeChatModeUI(panel, {
            index: workbenchSession ? undefined : (typeof session.assistantIndex === 'number' ? session.assistantIndex : undefined),
            useWorkbenchAssistant: workbenchSession,
            showWelcome: false,
            createHistory: false,
            sessionId: session.id
        });
        restoreChatFromSession(panel, session);
        syncEmployeeChatModeLayout();
    };

    window.restoreEmployeeSessionView = function () {
        const panel = document.getElementById('workbench-panel-employee');
        if (!panel || !panel.classList.contains('active')) return;
        const state = getPanelState(panel);
        if (!state.chatModeActive) {
            syncEmployeeChatModeLayout();
            return;
        }
        applyEmployeeChatModeUI(panel, {
            index: state.currentCardIndex ?? 0,
            showWelcome: false,
            createHistory: false,
            sessionId: state.currentSessionId || undefined
        });
    };

    window.resetEmployeeChat = function () {
        const panel = document.getElementById('workbench-panel-employee');
        if (!panel) return;
        const state = getPanelState(panel);
        state.chatModeActive = false;
        state.currentCardIndex = null;
        state.currentExtraAssistantId = null;
        state.currentCatalogAssistant = null;
        state.currentSessionId = null;
        state.chatMessages = [];
        state.mentionedEmployees = [];
        window.AppShell?.setCurrentSessionId?.(null);

        const hero = document.getElementById('center-hero');
        const carousel = getPanelEl('ai-carousel-view', panel);
        const chatView = getPanelEl('ai-chat-view', panel);
        const miniAvatars = getPanelEl('ai-mini-avatars', panel);
        const workbench = panel.querySelector('.ai-workbench-section');
        const inputSection = panel.querySelector('.input-section');
        const sessionScroll = document.getElementById('session-scroll');
        const messagesEl = getPanelEl('ai-chat-messages', panel);

        if (hero) hero.classList.remove('is-hidden');
        if (carousel) carousel.style.display = '';
        if (chatView) {
            chatView.style.display = 'none';
            chatView.classList.remove('is-visible');
        }
        if (miniAvatars) miniAvatars.style.display = 'none';
        if (workbench) workbench.classList.remove('chat-mode');
        if (inputSection) inputSection.classList.remove('chat-mode');
        if (sessionScroll) {
            sessionScroll.classList.remove('is-chat-active');
            sessionScroll.classList.remove('has-members-bar');
        }
        if (messagesEl) messagesEl.innerHTML = '';
        // 成员条已移至 .ai-workbench-section 层级
        const section = chatView?.closest('.ai-workbench-section') || chatView?.closest('.center-module-view');
        section?.querySelector(':scope > .chat-members-bar')?.remove();

        panel.querySelectorAll('.ai-card-fan').forEach((card) => {
            card.classList.remove('active');
        });
        panel.querySelectorAll('.indicator').forEach((ind) => {
            ind.classList.remove('active');
        });
        syncEmployeeAssistantTags(panel);

        document.getElementById('session-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
        syncEmployeeChatModeLayout();
        updateEmployeeInputPlaceholder(panel);
        window.AppShell?.collapseContextPanel?.();
    };

    window.showLoginPage = showLoginPage;
    window.logoutWorkbench = logoutWorkbench;
    window.enterWorkbench = enterWorkbench;
    window.handleLoginSubmit = handleLoginSubmit;
    window.toggleLoginAccountMode = toggleLoginAccountMode;
    window.returnToSupportMainPage = returnToSupportMainPage;
    window.resetSupportChatView = resetSupportChatView;
    window.startSupportNewSession = function () {
        const panel = document.getElementById('workbench-panel-support');
        if (!panel) return;
        const state = getPanelState(panel);
        state.currentSessionId = null;
        state.supportChatMessages = [];
        highlightSupportSessionInSidebar(null);
        resetSupportChatView(panel);
        if (window.ContextPanel?.reset) {
            window.ContextPanel.reset();
        }
        window.AppShell?.returnToMainSessionView?.();
        window.AppShell?.switchSupportSidebarTab?.('sessions');
    };
    window.openSupportSession = function (sessionId) {
        const session = getSupportSessions().find((s) => s.id === sessionId);
        if (!session) return;
        window.AppShell?.returnToMainSessionView?.();
        restoreSupportChatFromSession(document.getElementById('workbench-panel-support'), session);
    };
    window.openSupportExceptionDetail = function (agentId) {
        const agent = getSupportAgent(agentId);
        if (!agent) return;
        window.AppShell?.returnToMainSessionView?.();
        const panel = document.getElementById('workbench-panel-support');
        const message = `请帮我查看${agent.name}相关异常提醒详情`;
        appendSupportChatMessage(message, 'user', panel);
        setTimeout(() => {
            appendSupportAssistantReply(message, agentId, panel);
        }, 400);
    };
    window.openExceptionAlertDetail = function (title) {
        sendSupportExceptionQuick(title);
    };
    window.sendSupportExceptionQuick = sendSupportExceptionQuick;
    window.sendSupportExceptionAlert = sendSupportExceptionAlert;
    window.openSupportHomeCardInChat = openSupportHomeCardInChat;
    window.openSupportFunctionalAssistantInChat = openSupportFunctionalAssistantInChat;
    window.openEmployeeAssistantInChat = openEmployeeAssistantInChat;
    window.getSupportTotalTaskCount = getSupportTotalTaskCount;
    window.collectSupportExceptionAlerts = collectSupportExceptionAlerts;
    window.renderSupportSessionHistory = renderSupportSessionHistory;
    window.markdownToHtml = markdownToHtml;
    window.clickPromptCard = clickPromptCard;
    window.appendChatMessage = appendChatMessage;
    window.renderChatMembersBar = renderChatMembersBar;

    // 页面加载时初始化（app-shell.js 也会初始化，此处保留兼容）
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof initAppShell === 'function') initAppShell();
        else showLoginPage();
        initDigitalAvatarsScrollControls();

        // 监听会话切换：从历史会话恢复消息到对话框
        document.addEventListener('workbench:switch-session', (e) => {
            const sessionId = e?.detail?.sessionId;
            if (!sessionId) return;
            const session = window.AppShell?.getSessionById?.(sessionId);
            if (!session) return;
            const panel = getActiveWorkbenchPanel();
            if (!panel) return;
            // 清空当前对话框
            const messagesEl = getPanelEl('ai-chat-messages', panel);
            if (messagesEl) messagesEl.innerHTML = '';
            const state = getPanelState(panel);
            state.chatMessages = [];
            state.mentionedEmployees = [];
            renderChatMembersBar(panel);
            // 进入聊天模式
            if (!state.chatModeActive) {
                state.chatModeActive = true;
                const chatView = getPanelEl('ai-chat-view', panel);
                if (chatView) {
                    chatView.classList.add('is-visible');
                    chatView.style.display = '';
                }
                syncEmployeeChatModeLayout();
            }
            // 恢复消息
            const msgs = Array.isArray(session.messages) ? session.messages : [];
            msgs.forEach((m) => {
                if (m && m.text) appendChatMessage(m.text, m.role || 'user', panel);
            });
            // 刷新右侧边栏：先重置，再从会话快照恢复，最后渲染所有区块
            window.ContextPanel?.reset?.();
            if (session.contextBundle) {
                // 直接恢复完整状态
                const bundle = session.contextBundle;
                if (window.ContextPanel?.loadSnapshot && (bundle.outputs?.length || bundle.models?.length || bundle.customers?.length || bundle.tasks?.length || bundle.inputs?.length)) {
                    window.ContextPanel.loadSnapshot(bundle);
                }
            }
            window.ContextPanel?.renderAllSections?.();
            // 刷新状态徽章
            window.AppShell?.updateChatStatusBadge?.();
            updateEmployeeInputPlaceholder(panel);
        });
    });

    // ===== 会话状态管理（全局作用域） =====
    let statusDropdown = null;

    function closeStatusDropdown() {
        if (statusDropdown) {
            statusDropdown.remove();
            statusDropdown = null;
        }
    }

    function openStatusDropdown(anchorEl) {
        closeStatusDropdown();
        const statuses = window.AppShell?.getStatuses?.() || ['推进中', '目标达成', '已暂停', '已取消'];
        const colorMap = {
            '推进中': 'status-active',
            '目标达成': 'status-done',
            '已暂停': 'status-paused',
            '已取消': 'status-cancelled'
        };
        statusDropdown = document.createElement('div');
        statusDropdown.className = 'status-dropdown';
        statusDropdown.innerHTML = statuses.map((s) => {
            const cls = colorMap[s] || 'status-active';
            return `<div class="status-dropdown-item" data-status="${s}">
                <span class="status-dot ${cls}"></span>
                <span>${s}</span>
            </div>`;
        }).join('') + `
            <div class="status-dropdown-divider"></div>
            <div class="status-dropdown-custom">
                <input type="text" class="status-dropdown-input" placeholder="自定义状态…" maxlength="20" />
                <button type="button" class="status-dropdown-confirm">确定</button>
            </div>
        `;
        document.body.appendChild(statusDropdown);

        const rect = anchorEl.getBoundingClientRect();
        statusDropdown.style.position = 'fixed';
        statusDropdown.style.top = (rect.bottom + 4) + 'px';
        statusDropdown.style.right = (window.innerWidth - rect.right) + 'px';

        statusDropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.status-dropdown-item');
            if (!item) return;
            const status = item.dataset.status;
            const sid = window.AppShell?.getCurrentSessionId?.();
            if (sid && status) {
                window.AppShell?.setSessionStatus?.(sid, status);
                appendChatMessage(`已将会话状态修改为「${status}」`, 'assistant', getActiveWorkbenchPanel());
            }
            closeStatusDropdown();
        });

        // 自定义状态输入：支持手动修改文字
        const customInput = statusDropdown.querySelector('.status-dropdown-input');
        const confirmBtn = statusDropdown.querySelector('.status-dropdown-confirm');
        const applyCustomStatus = () => {
            const val = (customInput.value || '').trim().slice(0, 20);
            if (!val) return;
            const sid = window.AppShell?.getCurrentSessionId?.();
            if (sid) {
                window.AppShell?.setSessionStatus?.(sid, val);
                appendChatMessage(`已将会话状态修改为「${val}」`, 'assistant', getActiveWorkbenchPanel());
            }
            closeStatusDropdown();
        };
        confirmBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyCustomStatus();
        });
        customInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                applyCustomStatus();
            }
        });
        // 自动聚焦输入框
        setTimeout(() => customInput?.focus(), 0);

        setTimeout(() => {
            document.addEventListener('click', closeStatusDropdownOnOutside, { once: true });
        }, 0);
    }

    function closeStatusDropdownOnOutside(e) {
        if (statusDropdown && !statusDropdown.contains(e.target) && !e.target.closest('#chat-status-badge')) {
            closeStatusDropdown();
        } else if (statusDropdown) {
            setTimeout(() => {
                document.addEventListener('click', closeStatusDropdownOnOutside, { once: true });
            }, 0);
        }
    }

    document.addEventListener('click', (e) => {
        const badge = e.target.closest('#chat-status-badge');
        if (badge) {
            e.stopPropagation();
            openStatusDropdown(badge);
        }
    });

    // AI 智能判断会话状态
    function detectSessionStatus(userMessage, aiReply) {
        const text = (userMessage + ' ' + aiReply).toLowerCase();
        if (/目标达成|已完成|已经完成|搞定了|任务完成|达成了|已解决|问题已解决|方案已确认|确认通过/.test(text)) {
            return '目标达成';
        }
        if (/暂停|先放一放|稍后再说|暂时搁置|以后再说|先不推进|暂停推进/.test(text)) {
            return '已暂停';
        }
        if (/取消|放弃|不需要了|作废|终止|不要了|取消推进/.test(text)) {
            return '已取消';
        }
        return null;
    }

    // 用户通过输入修改状态：/状态 推进中
    function parseStatusCommand(text) {
        const match = text.match(/^\/状态\s+(.+)$/);
        if (!match) return null;
        const status = match[1].trim();
        const valid = window.AppShell?.getStatuses?.() || ['推进中', '目标达成', '已暂停', '已取消'];
        return valid.includes(status) ? status : null;
    }
