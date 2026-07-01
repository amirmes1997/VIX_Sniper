// VIX Sniper Dashboard MVP Logic with CSV Data Source, Navigation, Grouping, and Full-Width Layout

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Fallback Timeline Data (Used in case CSV fails to load)
    // ----------------------------------------------------
    const fallbackTimeline = [
        {
            date: 'Jun 01, 2026',
            rawDate: '2026-06-01',
            sp500Val: 6100.00,
            sp500Chg: 0.85,
            vixVal: 12.10,
            vixChg: -4.20,
            isSpike: 0,
            strategyInvestedToday: 0,
            strategyEquity: 6100,
            baselineInvestedToday: 500,
            baselineEquity: 6100,
            excessReturnDollars: 0
        },
        {
            date: 'Jun 05, 2026',
            rawDate: '2026-06-05',
            sp500Val: 5810.00,
            sp500Chg: -1.25,
            vixVal: 21.00,
            vixChg: 8.50,
            isSpike: 0,
            strategyInvestedToday: 500,
            strategyEquity: 5785,
            baselineInvestedToday: 500,
            baselineEquity: 5770,
            excessReturnDollars: 15
        },
        {
            date: 'Jun 10, 2026',
            rawDate: '2026-06-10',
            sp500Val: 5420.00,
            sp500Chg: -3.42,
            vixVal: 32.50,
            vixChg: 41.80,
            isSpike: 1,
            strategyInvestedToday: 1500,
            strategyEquity: 5300,
            baselineInvestedToday: 500,
            baselineEquity: 5210,
            excessReturnDollars: 90
        },
        {
            date: 'Jun 17, 2026',
            rawDate: '2026-06-17',
            sp500Val: 5720.00,
            sp500Chg: 2.10,
            vixVal: 24.20,
            vixChg: -12.40,
            isSpike: 0,
            strategyInvestedToday: 500,
            strategyEquity: 5900,
            baselineInvestedToday: 500,
            baselineEquity: 5815,
            excessReturnDollars: 85
        },
        {
            date: 'Jun 24, 2026',
            rawDate: '2026-06-24',
            sp500Val: 5950.00,
            sp500Chg: 0.70,
            vixVal: 18.40,
            vixChg: -2.10,
            isSpike: 0,
            strategyInvestedToday: 500,
            strategyEquity: 6370,
            baselineInvestedToday: 500,
            baselineEquity: 6200,
            excessReturnDollars: 170
        }
    ];

    let timeline = [];

    let state = {
        currentDateIndex: 0,
        monthlyAmount: 1000,
        maxMonths: 5,
        interestRate: 6,
        groupMode: 'month',
        visibleMonth: null,
        visibleYear: null,
        chartFromDate: '',
        chartToDate: '',
        chartFromVisibleMonth: null,
        chartFromVisibleYear: null,
        chartToVisibleMonth: null,
        chartToVisibleYear: null,
        showSpy: true,
        showVix: true
    };

    function initStateFromDOM() {
        const getActiveValue = (container, isInt = false) => {
            if (!container) return null;
            const activeBtn = container.querySelector('.config-opt-btn.active');
            if (!activeBtn) return null;
            const valStr = activeBtn.getAttribute('data-value');
            return isInt ? parseInt(valStr, 10) : parseFloat(valStr);
        };

        const amt = getActiveValue(optionsMonthlyAmount, true);
        if (amt !== null) state.monthlyAmount = amt;

        const maxM = getActiveValue(optionsMaxMonths, true);
        if (maxM !== null) state.maxMonths = maxM;

        const rate = getActiveValue(optionsInterestRate, false);
        if (rate !== null) state.interestRate = rate;
    }

    let timelineDates = new Set();
    let investmentDates = new Set();

    // ----------------------------------------------------
    // DOM Elements Cache
    // ----------------------------------------------------
    // Date Navigation controls
    const btnPrevDate = document.getElementById('btn-prev-date');
    const btnNextDate = document.getElementById('btn-next-date');
    const btnToday = document.getElementById('btn-today');
    const currentDateDisplay = document.getElementById('current-date-display');
    const btnPrevYear = document.getElementById('btn-prev-year');
    const btnPrevMonth = document.getElementById('btn-prev-month');
    const btnNextMonth = document.getElementById('btn-next-month');
    const btnNextYear = document.getElementById('btn-next-year');

    // Grouping Toggle
    const groupControls = document.getElementById('group-controls');

    // Inputs (Segmented Option Containers)
    const optionsMonthlyAmount = document.getElementById('options-monthly-amount');
    const optionsMaxMonths = document.getElementById('options-max-months');
    const optionsInterestRate = document.getElementById('options-interest-rate');
    const maxPossibleLabel = document.getElementById('max-possible-val');
    const configStatusMsg = document.getElementById('config-status-msg');

    // Calendar DOM elements
    const btnCalendar = document.getElementById('btn-calendar');
    const calendarPopup = document.getElementById('calendar-popup');
    const calMonthLabel = document.getElementById('cal-month-label');
    const calPrevMonth = document.getElementById('cal-prev-month');
    const calNextMonth = document.getElementById('cal-next-month');
    const calPrevYear = document.getElementById('cal-prev-year');
    const calNextYear = document.getElementById('cal-next-year');
    const calPopGrid = document.getElementById('calendar-pop-grid');
    const btnFirstDay = document.getElementById('btn-first-day');

    // Chart Timeframe & Toggle DOM elements
    const chartBtnFrom = document.getElementById('chart-btn-from');
    const chartBtnTo = document.getElementById('chart-btn-to');
    const chartDisplayFrom = document.getElementById('chart-display-from');
    const chartDisplayTo = document.getElementById('chart-display-to');

    const chartPopupFrom = document.getElementById('chart-popup-from');
    const chartFromMonthLabel = document.getElementById('chart-from-month-label');
    const chartFromPrevMonth = document.getElementById('chart-from-prev-month');
    const chartFromNextMonth = document.getElementById('chart-from-next-month');
    const chartFromPrevYear = document.getElementById('chart-from-prev-year');
    const chartFromNextYear = document.getElementById('chart-from-next-year');
    const chartFromPopGrid = document.getElementById('chart-from-pop-grid');
    const chartFromBtnFirstDay = document.getElementById('chart-from-btn-first-day');

    const chartPopupTo = document.getElementById('chart-popup-to');
    const chartToMonthLabel = document.getElementById('chart-to-month-label');
    const chartToPrevMonth = document.getElementById('chart-to-prev-month');
    const chartToNextMonth = document.getElementById('chart-to-next-month');
    const chartToPrevYear = document.getElementById('chart-to-prev-year');
    const chartToNextYear = document.getElementById('chart-to-next-year');
    const chartToPopGrid = document.getElementById('chart-to-pop-grid');
    const chartToBtnFirstDay = document.getElementById('chart-to-btn-first-day');

    // Ticker displays (New Animated Ticker Bar & Spike Box)
    const tickerBarText = document.getElementById('ticker-bar-text');
    const tickerBarWrap = document.querySelector('.ticker-bar-wrap');
    const regimeSpikeBox = document.getElementById('regime-spike-box');
    const regimeSpikeText = document.getElementById('regime-spike-text');



    // Recommendation card elements
    const recCard = document.getElementById('rec-card');
    const recBadge = document.getElementById('rec-badge');
    const recActionText = document.getElementById('rec-action');
    const recActionBadge = document.getElementById('rec-action-badge');
    const recExplanationText = document.getElementById('rec-explanation');
    const confidenceBar = document.getElementById('confidence-bar');
    const logTradeBtn = document.getElementById('btn-log-trade');
    const successToast = document.getElementById('success-toast');

    // Summary & Table
    const totalInvestedLabel = document.getElementById('summary-total-invested');
    const summaryProfitLoss = document.getElementById('summary-profit-loss');
    const summaryDcaProfitLoss = document.getElementById('summary-dca-profit-loss');
    const historyTableBody = document.getElementById('history-table-body');

    // ----------------------------------------------------
    // Chart.js Configuration (Dual Y-Axis)
    // ----------------------------------------------------
    const ctx = document.getElementById('sp-vix-chart').getContext('2d');
    let spVixChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'SPY',
                    data: [],
                    borderColor: '#06b6d4', // Cyan
                    backgroundColor: 'rgba(6, 182, 212, 0.04)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    yAxisID: 'y-sp',
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#06b6d4'
                },
                {
                    label: 'Investment',
                    data: [],
                    borderColor: 'transparent',
                    backgroundColor: '#f97316', // Orange
                    pointBackgroundColor: '#f97316',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBorderWidth: 2,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#f97316',
                    showLine: false,
                    yAxisID: 'y-sp'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f8fafc',
                    bodyColor: '#f1f5f9',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 9
                        }
                    }
                },
                'y-sp': {
                    type: 'linear',
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#06b6d4',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 9
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });



    // ----------------------------------------------------
    // Helper Formatting Functions for Profit / Loss
    // ----------------------------------------------------
    function formatProfitLoss(value) {
        const rounded = Math.round(value);
        if (rounded > 0) {
            return `+$${rounded.toLocaleString()}`;
        } else if (rounded < 0) {
            return `-$${Math.abs(rounded).toLocaleString()}`;
        } else {
            return `$0`;
        }
    }

    function applyProfitLossStyle(element, value) {
        const rounded = Math.round(value);
        if (rounded > 0) {
            element.style.color = 'var(--color-success)';
        } else if (rounded < 0) {
            element.style.color = 'var(--color-danger)';
        } else {
            element.style.color = 'var(--text-primary)';
        }
    }

    // ----------------------------------------------------
    // CSV parsing and date formatting helpers
    // ----------------------------------------------------
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
        return data;
    }

    function formatDate(dateStr) {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    }

    function convertCSVDateToRaw(csvDateStr) {
        if (!csvDateStr) return '';
        const parts = csvDateStr.split('.');
        if (parts.length !== 3) return csvDateStr;
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
    }

    function parsePercent(val) {
        if (val === undefined || val === null || val === '') return null;
        let cleaned = String(val).replace(/%/g, '').trim();
        if (cleaned === '') return null;
        let num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }

    function formatPct(val) {
        if (val === null || val === undefined) return `(--)`;
        let sign = val > 0 ? '+' : '';
        return `(${sign}${val.toFixed(1)}%)`;
    }

    function getPctColor(val) {
        if (val === null || val === undefined) return 'var(--text-muted)';
        if (val > 0) return 'var(--color-success)';
        if (val < 0) return 'var(--color-danger)';
        return 'var(--text-primary)';
    }

    // Calendar grouping key functions
    function getWeekKey(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const day = date.getDay(); // 0 Sunday
        const diff = date.getDate() - day;
        const sunday = new Date(date.setDate(diff));
        const y = sunday.getFullYear();
        const m = String(sunday.getMonth() + 1).padStart(2, '0');
        const d = String(sunday.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatWeekLabel(sundayStr) {
        return `Week of ${formatDate(sundayStr)}`;
    }

    function getMonthKey(dateStr) {
        return dateStr.substring(0, 7);
    }

    function formatMonthLabel(monthKey) {
        const [year, month] = monthKey.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month, 10) - 1]} ${year}`;
    }

    // ----------------------------------------------------
    // Core Rendering and Calculation Loop
    // ----------------------------------------------------

    function updateDashboard() {
        if (!timeline || timeline.length === 0) return;
        const index = state.currentDateIndex;
        const currentData = timeline[index];

        // 1. Update Date Display & Controls Muted Status
        currentDateDisplay.textContent = currentData.date;
        btnPrevDate.disabled = (index === 0);
        btnNextDate.disabled = (index === timeline.length - 1);
        btnToday.disabled = (index === timeline.length - 1);
        
        if (btnPrevYear) btnPrevYear.disabled = (index === 0);
        if (btnPrevMonth) btnPrevMonth.disabled = (index === 0);
        if (btnNextMonth) btnNextMonth.disabled = (index === timeline.length - 1);
        if (btnNextYear) btnNextYear.disabled = (index === timeline.length - 1);

        // 2. Fetch active metrics (from timeline state)
        const spVal = currentData.sp500Val;
        const spChg = currentData.sp500Chg;
        const vixVal = currentData.vixVal;
        const vixChg = currentData.vixChg;
        const isSpike = currentData.isSpike;

        // Update Embedded Regime Spike Box
        if (isSpike === 1) {
            regimeSpikeText.textContent = "VIX Spike Detected";
            regimeSpikeBox.classList.add('spike-active');
        } else {
            regimeSpikeText.textContent = "No VIX Spike Detected";
            regimeSpikeBox.classList.remove('spike-active');
        }

        // 3. Update Animated Ticker Bar
        const spySign = spChg >= 0 ? '+' : '';
        const vixSign = vixChg >= 0 ? '+' : '';
        const spyColor = spChg >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        const vixColor = vixChg >= 0 ? 'var(--color-success)' : 'var(--color-danger)';

        const baseHtml = `
            <span>SPY: <strong>${spVal.toFixed(2)}</strong> <span style="color: ${spyColor}; font-weight: 700;">${spySign}${spChg.toFixed(2)}%</span></span>
            <span style="margin: 0 3rem; color: var(--border-color);">|</span>
            <span>VIX: <strong>${vixVal.toFixed(2)}</strong> <span style="color: ${vixColor}; font-weight: 700;">${vixSign}${vixChg.toFixed(2)}%</span></span>
        `;
        tickerBarText.innerHTML = baseHtml;
        if (tickerBarWrap && tickerBarText) {
            tickerBarWrap.style.setProperty('--ticker-container-width', `${tickerBarWrap.offsetWidth}px`);
            tickerBarWrap.style.setProperty('--ticker-content-width', `${tickerBarText.offsetWidth}px`);
        }

        // 4. Update Opportunity Value Labels
        const maxPossible = state.monthlyAmount * state.maxMonths;
        maxPossibleLabel.textContent = `$${maxPossible.toLocaleString()}`;

        // 5. Calculate Recommendation amount
        let strategyInvestedToday = currentData.strategyInvestedToday;
        let recType = strategyInvestedToday > 0 ? 'invest-one' : 'skip';
        let recLabel = strategyInvestedToday > 0 ? 'Invest' : 'Skip';
        let confidencePct = strategyInvestedToday > 0 ? 75 : 85;

        let badgeClass = '';
        let cardClass = '';
        let actionText = '';
        let confidenceClass = 'medium';

        if (recType === 'invest-max' || recType === 'invest-one') {
            badgeClass = 'invest-normal';
            cardClass = 'state-invest-normal'; // Green theme for invest
            actionText = `INVEST $${Math.round(strategyInvestedToday).toLocaleString()} TODAY`;
            confidenceClass = 'high';
        } else {
            badgeClass = 'skip';
            cardClass = 'state-skip'; // Red theme for skip
            actionText = 'DO NOT INVEST TODAY';
            confidenceClass = 'high';
        }

        recCard.className = `dashboard-card recommendation-card ${cardClass}`;
        if (recBadge) {
            recBadge.className = `rec-badge ${badgeClass}`;
            recBadge.textContent = recLabel;
        }
        if (recActionBadge) {
            recActionBadge.className = `rec-action-badge ${recType === 'skip' ? 'skip' : 'invest'}`;
        }
        recActionText.textContent = actionText;
        recActionText.className = `rec-action-text ${recType === 'skip' ? 'skip' : 'invest'}`;

        // Dynamic explanation
        let explanationText = "";
        if (strategyInvestedToday === 0) {
            explanationText = `VIX is at ${vixVal.toFixed(2)}. The model recommends waiting today and keeping cash available for future volatility opportunities.`;
        } else {
            explanationText = `VIX is at ${vixVal.toFixed(2)}. The model recommends investing $${Math.round(strategyInvestedToday).toLocaleString()} today based on the current volatility signal.`;
        }
        recExplanationText.textContent = explanationText;

        // Confidence Bar
        if (confidenceBar) {
            confidenceBar.className = `confidence-bar-inner ${confidenceClass}`;
            confidenceBar.style.width = `${confidencePct}%`;
        }

        // 6. Calculate Cumulative Metrics and render History Log
        let cumulativeStrategyInvest = 0;
        let cumulativeBaselineInvest = 0;

        for (let i = 0; i <= index; i++) {
            cumulativeStrategyInvest += timeline[i].strategyInvestedToday;
            cumulativeBaselineInvest += timeline[i].baselineInvestedToday;
        }

        historyTableBody.innerHTML = '';
        let displayRows = [];

        if (state.groupMode === 'day') {
            for (let i = index; i >= 0; i--) {
                const rowData = timeline[i];
                displayRows.push({
                    date: rowData.date,
                    recommendationLabel: rowData.strategyInvestedToday > 0 ? 'Invest' : 'Skip',
                    amountInvested: rowData.strategyInvestedToday,
                    sp500Val: rowData.sp500Val,
                    vixVal: rowData.vixVal
                });
            }
        } else if (state.groupMode === 'week') {
            const weeksMap = new Map();
            for (let i = 0; i <= index; i++) {
                const rowData = timeline[i];
                const weekKey = getWeekKey(rowData.rawDate);
                if (!weeksMap.has(weekKey)) {
                    weeksMap.set(weekKey, []);
                }
                weeksMap.get(weekKey).push(rowData);
            }
            weeksMap.forEach((rows, weekKey) => {
                const totalInvested = rows.reduce((sum, r) => sum + r.strategyInvestedToday, 0);
                const lastRow = rows[rows.length - 1];
                displayRows.push({
                    date: formatWeekLabel(weekKey),
                    recommendationLabel: totalInvested > 0 ? 'Invest' : 'Skip',
                    amountInvested: totalInvested,
                    sp500Val: lastRow.sp500Val,
                    vixVal: lastRow.vixVal
                });
            });
            displayRows.reverse();
        } else if (state.groupMode === 'month') {
            const monthsMap = new Map();
            for (let i = 0; i <= index; i++) {
                const rowData = timeline[i];
                const monthKey = getMonthKey(rowData.rawDate);
                if (!monthsMap.has(monthKey)) {
                    monthsMap.set(monthKey, []);
                }
                monthsMap.get(monthKey).push(rowData);
            }
            monthsMap.forEach((rows, monthKey) => {
                const totalInvested = rows.reduce((sum, r) => sum + r.strategyInvestedToday, 0);
                const lastRow = rows[rows.length - 1];
                displayRows.push({
                    date: formatMonthLabel(monthKey),
                    recommendationLabel: totalInvested > 0 ? 'Invest' : 'Skip',
                    amountInvested: totalInvested,
                    sp500Val: lastRow.sp500Val,
                    vixVal: lastRow.vixVal
                });
            });
            displayRows.reverse();
        }

        displayRows.forEach(rowData => {
            const tr = document.createElement('tr');
            let rowBadgeClass = rowData.recommendationLabel === 'Invest' ? 'invest-normal' : 'skip';
            let rowAmountStyle = rowData.amountInvested > 0 ? 'font-weight: 700; color: var(--color-success);' : 'color: var(--text-muted); font-weight: normal;';

            tr.innerHTML = `
                <td>${rowData.date}</td>
                <td><span class="table-badge ${rowBadgeClass}">${rowData.recommendationLabel}</span></td>
                <td style="${rowAmountStyle}">$${Math.round(rowData.amountInvested).toLocaleString()}</td>
                <td>${rowData.sp500Val.toFixed(2)}</td>
                <td>${rowData.vixVal.toFixed(2)}</td>
            `;
            historyTableBody.appendChild(tr);
        });

        totalInvestedLabel.textContent = `$${Math.round(cumulativeStrategyInvest).toLocaleString()}`;

        // 7. Update Profit / Loss summary fields
        const profitLossVal = currentData.strategyEquity - cumulativeStrategyInvest;
        const dcaProfitLossVal = currentData.excessReturnDollars;

        let vixSniperReturnPct = null;
        if (cumulativeStrategyInvest > 0) {
            vixSniperReturnPct = (profitLossVal / cumulativeStrategyInvest) * 100;
        }

        let dcaReturnPct = null;
        if (currentData.baselineEquity > 0) {
            dcaReturnPct = (dcaProfitLossVal / currentData.baselineEquity) * 100;
        }

        summaryProfitLoss.innerHTML = `${formatProfitLoss(profitLossVal)} <span class="summary-pct" style="font-size: 0.9em; font-weight: 600; margin-left: 0.25rem; color: ${getPctColor(vixSniperReturnPct)};">${formatPct(vixSniperReturnPct)}</span>`;
        applyProfitLossStyle(summaryProfitLoss, profitLossVal);

        summaryDcaProfitLoss.innerHTML = `${formatProfitLoss(dcaProfitLossVal)} <span class="summary-pct" style="font-size: 0.9em; font-weight: 600; margin-left: 0.25rem; color: ${getPctColor(dcaReturnPct)};">${formatPct(dcaReturnPct)}</span>`;
        applyProfitLossStyle(summaryDcaProfitLoss, dcaProfitLossVal);

        // 8. Update Graph datasets (filtered by From and To timeframes)
        const filteredTimeline = timeline.filter(item => item.rawDate >= state.chartFromDate && item.rawDate <= state.chartToDate);
        const labels = filteredTimeline.map(item => item.rawDate);
        
        const spData = filteredTimeline.map(item => item.sp500Val);
        
        const investData = filteredTimeline.map(item => {
            if (item.strategyInvestedToday !== 0) {
                return item.sp500Val;
            }
            return null;
        });

        spVixChart.data.labels = labels;
        spVixChart.data.datasets[0].data = spData;
        spVixChart.data.datasets[1].data = investData;
        spVixChart.update();

        // Refresh icons styling
        lucide.createIcons();
    }


    // ----------------------------------------------------
    // Interactive Navigation Listeners
    // ----------------------------------------------------

    btnPrevDate.addEventListener('click', () => {
        if (state.currentDateIndex > 0) {
            state.currentDateIndex--;
            updateDashboard();
        }
    });

    btnNextDate.addEventListener('click', () => {
        if (state.currentDateIndex < timeline.length - 1) {
            state.currentDateIndex++;
            updateDashboard();
        }
    });

    btnToday.addEventListener('click', () => {
        state.currentDateIndex = timeline.length - 1;
        updateDashboard();
    });

    // Month & Year Quick Jump Navigation Bar triggers
    if (btnPrevYear) {
        btnPrevYear.addEventListener('click', () => {
            jumpDate(-12);
        });
    }

    if (btnPrevMonth) {
        btnPrevMonth.addEventListener('click', () => {
            jumpDate(-1);
        });
    }

    if (btnNextMonth) {
        btnNextMonth.addEventListener('click', () => {
            jumpDate(1);
        });
    }

    if (btnNextYear) {
        btnNextYear.addEventListener('click', () => {
            jumpDate(12);
        });
    }

    function jumpDate(monthsOffset) {
        if (!timeline || timeline.length === 0) return;
        const currentDate = new Date(timeline[state.currentDateIndex].rawDate + 'T00:00:00');
        const targetDate = new Date(currentDate);
        targetDate.setMonth(targetDate.getMonth() + monthsOffset);
        
        const targetMs = targetDate.getTime();
        let bestIdx = -1;
        let minDiff = Infinity;
        
        for (let i = 0; i < timeline.length; i++) {
            const dateMs = new Date(timeline[i].rawDate + 'T00:00:00').getTime();
            const diff = Math.abs(dateMs - targetMs);
            if (diff < minDiff) {
                minDiff = diff;
                bestIdx = i;
            }
        }
        
        if (bestIdx !== -1) {
            if (bestIdx === state.currentDateIndex) {
                if (monthsOffset < 0 && bestIdx > 0) {
                    bestIdx--;
                } else if (monthsOffset > 0 && bestIdx < timeline.length - 1) {
                    bestIdx++;
                }
            }
            state.currentDateIndex = bestIdx;
            updateDashboard();
        }
    }

    // ----------------------------------------------------
    // Calendar Date Picker Helpers & Handlers
    // ----------------------------------------------------

    function dateExistsInTimeline(rawDate) {
        return timelineDates.has(rawDate);
    }

    function openCalendarPicker() {
        if (!timeline || timeline.length === 0) return;
        const currentData = timeline[state.currentDateIndex];
        const currentDate = new Date(currentData.rawDate + 'T00:00:00');
        state.visibleYear = currentDate.getFullYear();
        state.visibleMonth = currentDate.getMonth();
        renderMainCalendar();
        calendarPopup.classList.add('open');
    }

    function closeCalendarPicker() {
        calendarPopup.classList.remove('open');
        chartPopupFrom.classList.remove('open');
        chartPopupTo.classList.remove('open');
    }

    function renderCalendar(vMonth, vYear, labelEl, prevBtn, nextBtn, prevYearBtn, nextYearBtn, gridEl, selectedDate) {
        if (!timeline || timeline.length === 0) return;
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        labelEl.textContent = `${monthNames[vMonth]} ${vYear}`;

        const earliestDate = new Date(timeline[0].rawDate + 'T00:00:00');
        const latestDate = new Date(timeline[timeline.length - 1].rawDate + 'T00:00:00');

        const isPrevMonthDisabled = (vYear <= earliestDate.getFullYear() && vMonth <= earliestDate.getMonth());
        const isNextMonthDisabled = (vYear >= latestDate.getFullYear() && vMonth >= latestDate.getMonth());

        prevBtn.disabled = isPrevMonthDisabled;
        nextBtn.disabled = isNextMonthDisabled;

        if (prevYearBtn) {
            prevYearBtn.disabled = (vYear <= earliestDate.getFullYear());
        }
        if (nextYearBtn) {
            nextYearBtn.disabled = (vYear >= latestDate.getFullYear());
        }

        const daysInMonth = new Date(vYear, vMonth + 1, 0).getDate();
        const firstDayIdx = new Date(vYear, vMonth, 1).getDay();

        let gridHtml = '';
        for (let i = 0; i < firstDayIdx; i++) {
            gridHtml += '<span class="cal-pop-day empty"></span>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const yyyy = vYear;
            const mm = String(vMonth + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const rawDateStr = `${yyyy}-${mm}-${dd}`;

            const exists = dateExistsInTimeline(rawDateStr);
            const isSelected = selectedDate === rawDateStr;
            const isInvestment = investmentDates.has(rawDateStr);

            let dayClass = 'cal-pop-day';
            if (exists) {
                dayClass += ' available';
                if (isSelected) dayClass += ' selected';
                if (isInvestment) dayClass += ' investment-day';
                
                let innerHtml = day;
                if (isInvestment) {
                    innerHtml = `${day}<span class="cal-investment-dot"></span>`;
                }
                gridHtml += `<button class="${dayClass}" data-date="${rawDateStr}">${innerHtml}</button>`;
            } else {
                dayClass += ' disabled';
                gridHtml += `<span class="${dayClass}">${day}</span>`;
            }
        }
        gridEl.innerHTML = gridHtml;
    }

    function renderMainCalendar() {
        const currentData = timeline[state.currentDateIndex];
        renderCalendar(
            state.visibleMonth,
            state.visibleYear,
            calMonthLabel,
            calPrevMonth,
            calNextMonth,
            calPrevYear,
            calNextYear,
            calPopGrid,
            currentData.rawDate
        );
    }

    function renderFromCalendar() {
        renderCalendar(
            state.chartFromVisibleMonth,
            state.chartFromVisibleYear,
            chartFromMonthLabel,
            chartFromPrevMonth,
            chartFromNextMonth,
            chartFromPrevYear,
            chartFromNextYear,
            chartFromPopGrid,
            state.chartFromDate
        );
    }

    function renderToCalendar() {
        renderCalendar(
            state.chartToVisibleMonth,
            state.chartToVisibleYear,
            chartToMonthLabel,
            chartToPrevMonth,
            chartToNextMonth,
            chartToPrevYear,
            chartToNextYear,
            chartToPopGrid,
            state.chartToDate
        );
    }

    function goToDate(rawDate) {
        const idx = timeline.findIndex(item => item.rawDate === rawDate);
        if (idx !== -1) {
            state.currentDateIndex = idx;
            updateDashboard();
            closeCalendarPicker();
        }
    }

    function selectFromDate(rawDate) {
        if (rawDate > state.chartToDate) {
            state.chartToDate = rawDate;
            chartDisplayTo.textContent = formatDate(state.chartToDate);
        }
        state.chartFromDate = rawDate;
        chartDisplayFrom.textContent = formatDate(state.chartFromDate);
        closeCalendarPicker();
        updateDashboard();
    }

    function selectToDate(rawDate) {
        if (rawDate < state.chartFromDate) {
            state.chartFromDate = rawDate;
            chartDisplayFrom.textContent = formatDate(state.chartFromDate);
        }
        state.chartToDate = rawDate;
        chartDisplayTo.textContent = formatDate(state.chartToDate);
        closeCalendarPicker();
        updateDashboard();
    }

    function findNearestDate(targetRawDate) {
        if (!timeline || timeline.length === 0) return '';
        const targetMs = new Date(targetRawDate + 'T00:00:00').getTime();
        let nearestItem = timeline[0];
        let minDiff = Math.abs(new Date(nearestItem.rawDate + 'T00:00:00').getTime() - targetMs);
        for (let i = 1; i < timeline.length; i++) {
            const diff = Math.abs(new Date(timeline[i].rawDate + 'T00:00:00').getTime() - targetMs);
            if (diff < minDiff) {
                minDiff = diff;
                nearestItem = timeline[i];
            }
        }
        return nearestItem.rawDate;
    }

    function setDefaultTimeframe() {
        if (!timeline || timeline.length === 0) return;
        const latestRawDate = timeline[timeline.length - 1].rawDate;
        const earliestRawDate = timeline[0].rawDate;
        
        const latest = new Date(latestRawDate + 'T00:00:00');
        const earliest = new Date(earliestRawDate + 'T00:00:00');
        
        const twelveMonthsAgo = new Date(latest);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        if (earliest >= twelveMonthsAgo) {
            state.chartFromDate = earliestRawDate;
        } else {
            const targetRawStr = twelveMonthsAgo.toISOString().split('T')[0];
            state.chartFromDate = findNearestDate(targetRawStr);
        }
        state.chartToDate = latestRawDate;
        
        if (chartDisplayFrom) chartDisplayFrom.textContent = formatDate(state.chartFromDate);
        if (chartDisplayTo) chartDisplayTo.textContent = formatDate(state.chartToDate);
    }

    // Toggle calendar popup
    btnCalendar.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = calendarPopup.classList.contains('open');
        closeCalendarPicker();
        if (!isOpen) {
            openCalendarPicker();
        }
    });

    chartBtnFrom.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = chartPopupFrom.classList.contains('open');
        closeCalendarPicker();
        if (!isOpen) {
            const currentDate = new Date(state.chartFromDate + 'T00:00:00');
            state.chartFromVisibleYear = currentDate.getFullYear();
            state.chartFromVisibleMonth = currentDate.getMonth();
            renderFromCalendar();
            chartPopupFrom.classList.add('open');
            
            // Adjust positioning if it overflows bottom of the screen
            const rect = chartPopupFrom.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                chartPopupFrom.style.top = 'auto';
                chartPopupFrom.style.bottom = 'calc(100% + 8px)';
            } else {
                chartPopupFrom.style.bottom = 'auto';
                chartPopupFrom.style.top = 'calc(100% + 8px)';
            }
        }
    });

    chartBtnTo.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = chartPopupTo.classList.contains('open');
        closeCalendarPicker();
        if (!isOpen) {
            const currentDate = new Date(state.chartToDate + 'T00:00:00');
            state.chartToVisibleYear = currentDate.getFullYear();
            state.chartToVisibleMonth = currentDate.getMonth();
            renderToCalendar();
            chartPopupTo.classList.add('open');
            
            // Adjust positioning if it overflows bottom of the screen
            const rect = chartPopupTo.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                chartPopupTo.style.top = 'auto';
                chartPopupTo.style.bottom = 'calc(100% + 8px)';
            } else {
                chartPopupTo.style.bottom = 'auto';
                chartPopupTo.style.top = 'calc(100% + 8px)';
            }
        }
    });

    // Month & Year Navigation
    calPrevMonth.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.visibleMonth === 0) {
            state.visibleMonth = 11;
            state.visibleYear--;
        } else {
            state.visibleMonth--;
        }
        renderMainCalendar();
    });

    calNextMonth.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.visibleMonth === 11) {
            state.visibleMonth = 0;
            state.visibleYear++;
        } else {
            state.visibleMonth++;
        }
        renderMainCalendar();
    });

    calPrevYear.addEventListener('click', (e) => {
        e.stopPropagation();
        const earliestYear = new Date(timeline[0].rawDate + 'T00:00:00').getFullYear();
        if (state.visibleYear > earliestYear) {
            state.visibleYear--;
            renderMainCalendar();
        }
    });

    calNextYear.addEventListener('click', (e) => {
        e.stopPropagation();
        const latestYear = new Date(timeline[timeline.length - 1].rawDate + 'T00:00:00').getFullYear();
        if (state.visibleYear < latestYear) {
            state.visibleYear++;
            renderMainCalendar();
        }
    });

    chartFromPrevMonth.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.chartFromVisibleMonth === 0) {
            state.chartFromVisibleMonth = 11;
            state.chartFromVisibleYear--;
        } else {
            state.chartFromVisibleMonth--;
        }
        renderFromCalendar();
    });

    chartFromNextMonth.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.chartFromVisibleMonth === 11) {
            state.chartFromVisibleMonth = 0;
            state.chartFromVisibleYear++;
        } else {
            state.chartFromVisibleMonth++;
        }
        renderFromCalendar();
    });

    chartFromPrevYear.addEventListener('click', (e) => {
        e.stopPropagation();
        const earliestYear = new Date(timeline[0].rawDate + 'T00:00:00').getFullYear();
        if (state.chartFromVisibleYear > earliestYear) {
            state.chartFromVisibleYear--;
            renderFromCalendar();
        }
    });

    chartFromNextYear.addEventListener('click', (e) => {
        e.stopPropagation();
        const latestYear = new Date(timeline[timeline.length - 1].rawDate + 'T00:00:00').getFullYear();
        if (state.chartFromVisibleYear < latestYear) {
            state.chartFromVisibleYear++;
            renderFromCalendar();
        }
    });

    chartToPrevMonth.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.chartToVisibleMonth === 0) {
            state.chartToVisibleMonth = 11;
            state.chartToVisibleYear--;
        } else {
            state.chartToVisibleMonth--;
        }
        renderToCalendar();
    });

    chartToNextMonth.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.chartToVisibleMonth === 11) {
            state.chartToVisibleMonth = 0;
            state.chartToVisibleYear++;
        } else {
            state.chartToVisibleMonth++;
        }
        renderToCalendar();
    });

    chartToPrevYear.addEventListener('click', (e) => {
        e.stopPropagation();
        const earliestYear = new Date(timeline[0].rawDate + 'T00:00:00').getFullYear();
        if (state.chartToVisibleYear > earliestYear) {
            state.chartToVisibleYear--;
            renderToCalendar();
        }
    });

    chartToNextYear.addEventListener('click', (e) => {
        e.stopPropagation();
        const latestYear = new Date(timeline[timeline.length - 1].rawDate + 'T00:00:00').getFullYear();
        if (state.chartToVisibleYear < latestYear) {
            state.chartToVisibleYear++;
            renderToCalendar();
        }
    });

    // Day Selection (Event Delegation)
    calPopGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.cal-pop-day.available');
        if (btn) {
            const rawDateStr = btn.getAttribute('data-date');
            goToDate(rawDateStr);
        }
    });

    chartFromPopGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.cal-pop-day.available');
        if (btn) {
            selectFromDate(btn.getAttribute('data-date'));
        }
    });

    chartToPopGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.cal-pop-day.available');
        if (btn) {
            selectToDate(btn.getAttribute('data-date'));
        }
    });

    // First Day Trigger
    btnFirstDay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (timeline && timeline.length > 0) {
            goToDate(timeline[0].rawDate);
        }
    });

    if (chartFromBtnFirstDay) {
        chartFromBtnFirstDay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (timeline && timeline.length > 0) {
                selectFromDate(timeline[0].rawDate);
            }
        });
    }

    if (chartToBtnFirstDay) {
        chartToBtnFirstDay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (timeline && timeline.length > 0) {
                selectToDate(timeline[0].rawDate);
            }
        });
    }

    // Outside click listener to close calendar
    document.addEventListener('click', (e) => {
        if (calendarPopup && !calendarPopup.contains(e.target) && !btnCalendar.contains(e.target) &&
            chartPopupFrom && !chartPopupFrom.contains(e.target) && !chartBtnFrom.contains(e.target) &&
            chartPopupTo && !chartPopupTo.contains(e.target) && !chartBtnTo.contains(e.target)) {
            closeCalendarPicker();
        }
    });

    // Legend Checkbox Toggles removed (no checkboxes)

    // Segmented Toggle listener for history grouping
    if (groupControls) {
        const btns = groupControls.querySelectorAll('.segment-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.groupMode = btn.getAttribute('data-mode');
                updateDashboard();
            });
        });
    }

    // ----------------------------------------------------
    // Configuration Option Select Listeners
    // ----------------------------------------------------

    setupConfigOptionListeners(optionsMonthlyAmount, 'monthlyAmount', true);
    setupConfigOptionListeners(optionsMaxMonths, 'maxMonths', true);
    setupConfigOptionListeners(optionsInterestRate, 'interestRate', false);

    function setupConfigOptionListeners(container, stateKey, isInt = false) {
        if (!container) return;
        const buttons = container.querySelectorAll('.config-opt-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const val = isInt ? parseInt(btn.getAttribute('data-value'), 10) : parseFloat(btn.getAttribute('data-value'));
                state[stateKey] = val;
                
                // Clear any warning messages if settings are changed
                if (configStatusMsg) {
                    configStatusMsg.style.display = 'none';
                    configStatusMsg.textContent = '';
                }

                updateDashboard();
            });
        });
    }



    // ----------------------------------------------------
    // Log Trade Action (Interactive Log Button)
    // ----------------------------------------------------
    logTradeBtn.addEventListener('click', () => {
        if (!timeline || timeline.length === 0) return;
        const currentData = timeline[state.currentDateIndex];
        
        let type = currentData.strategyInvestedToday > 0 ? 'invest-one' : 'skip';
        let label = currentData.strategyInvestedToday > 0 ? 'Invest' : 'Skip';
        let amount = currentData.strategyInvestedToday;

        const tr = document.createElement('tr');
        tr.className = 'new-row';

        let badgeClass = 'skip';
        let amountStyle = 'color: var(--text-muted); font-weight: normal;';
        
        if (type === 'invest-max' || type === 'invest-one') {
            badgeClass = 'invest-normal';
            amountStyle = 'font-weight: 700; color: var(--color-success);';
        }

        const now = new Date();
        const options = { month: 'short', day: '2-digit', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><span class="table-badge ${badgeClass}">${label}</span></td>
            <td style="${amountStyle}">$${Math.round(amount).toLocaleString()}</td>
            <td>${currentData.sp500Val.toFixed(2)}</td>
            <td>${currentData.vixVal.toFixed(2)}</td>
        `;

        if (historyTableBody.firstChild) {
            historyTableBody.insertBefore(tr, historyTableBody.firstChild);
        } else {
            historyTableBody.appendChild(tr);
        }

        // Reset default toast message on trade log click
        successToast.innerHTML = `<i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Action added to log successfully!`;
        lucide.createIcons();

        // Show Toast Notification
        successToast.classList.add('show');
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 2500);
    });

    // ----------------------------------------------------
    // Scenario files mapping and loader
    // ----------------------------------------------------
    function getScenarioFileName() {
        return `${state.monthlyAmount}_${state.maxMonths}_${state.interestRate}.csv`;
    }

    function loadScenarioData(filename) {
        return fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                const rows = parseCSV(csvText);
                if (rows.length === 0) {
                    throw new Error("CSV file contains no rows");
                }
                const newTimeline = rows.map(row => {
                    const rawDate = convertCSVDateToRaw(row.Day);
                    return {
                        date: formatDate(rawDate),
                        rawDate: rawDate,
                        sp500Val: parseFloat(row.SPY_Price),
                        sp500Chg: parseFloat(row.SPY_Return) * 100,
                        vixVal: parseFloat(row.VIX_Level),
                        vixChg: parseFloat(row.VIX_Return),
                        isSpike: parseInt(row.Is_Spike, 10),
                        strategyInvestedToday: parseFloat(row.Strategy_Invested_Today),
                        strategyEquity: parseFloat(row.Strategy_Equity),
                        baselineInvestedToday: parseFloat(row.Baseline_Invested_Today),
                        baselineEquity: parseFloat(row.Baseline_Equity),
                        excessReturnDollars: parseFloat(row.Excess_Return_Dollars)
                    };
                }).sort((a, b) => a.rawDate.localeCompare(b.rawDate));

                if (newTimeline.length === 0 || newTimeline.some(item => isNaN(item.sp500Val) || isNaN(item.vixVal))) {
                    throw new Error("CSV parsed data is invalid or empty");
                }

                // Everything parsed successfully, replace the current dashboard timeline
                timeline = newTimeline;
                timelineDates = new Set(timeline.map(t => t.rawDate));
                investmentDates = new Set(timeline.filter(t => t.strategyInvestedToday !== 0).map(t => t.rawDate));
                
                // Reset timeframe boundaries & toggle states on scenario load
                setDefaultTimeframe();

                state.currentDateIndex = timeline.length - 1;
                updateDashboard();
                if (configStatusMsg) {
                    configStatusMsg.style.display = 'none';
                    configStatusMsg.textContent = '';
                }
                return true;
            });
    }

    // Initialize configuration states from DOM active buttons
    initStateFromDOM();

    // Load Default Scenario on startup
    loadScenarioData(getScenarioFileName())
        .catch(err => {
            console.error("Error loading default CSV scenario, falling back to mock timeline:", err);
            timeline = fallbackTimeline;
            timelineDates = new Set(timeline.map(t => t.rawDate));
            investmentDates = new Set(timeline.filter(t => t.strategyInvestedToday !== 0).map(t => t.rawDate));
            state.currentDateIndex = timeline.length - 1;
            setDefaultTimeframe();
            updateDashboard();
        });

    // ----------------------------------------------------
    // Let's Invest Trigger (CSV Loader Trigger)
    // ----------------------------------------------------
    const btnLetsInvest = document.getElementById('btn-lets-invest');
    if (btnLetsInvest) {
        btnLetsInvest.addEventListener('click', () => {
            const filename = getScenarioFileName();

            if (configStatusMsg) {
                configStatusMsg.style.display = 'none';
                configStatusMsg.textContent = '';
            }
            loadScenarioData(filename)
                .then(() => {
                    successToast.innerHTML = `<i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Scenario loaded successfully!`;
                    lucide.createIcons();
                    successToast.classList.add('show');
                    setTimeout(() => {
                        successToast.classList.remove('show');
                    }, 2500);
                })
                .catch(err => {
                    console.warn("Failed to load scenario CSV:", err);
                    if (configStatusMsg) {
                        configStatusMsg.style.display = 'block';
                        configStatusMsg.textContent = 'Scenario data for this configuration is not available yet.';
                    }
                });
        });
    }

    window.addEventListener('resize', () => {
        if (tickerBarWrap && tickerBarText) {
            tickerBarWrap.style.setProperty('--ticker-container-width', `${tickerBarWrap.offsetWidth}px`);
            tickerBarWrap.style.setProperty('--ticker-content-width', `${tickerBarText.offsetWidth}px`);
        }
    });
});
