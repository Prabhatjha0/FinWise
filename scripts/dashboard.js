// dashboard.js — per-user dashboard logic
// FINAL, FULLY CORRECTED VERSION
//
// --- LATEST CHANGE (User Request) ---
// 1. renderComparisonAnalytics() now filters for the CURRENT MONTH
//    to match the main dashboard cards.
//
// --- PREVIOUS CHANGES ---
// 1. "Available to Save" logic is implemented.
// 2. Realistic, sequential AI tips are implemented.

// --- DEMO ASSET DATA ---
const DEMO_ASSETS = {
    gold: { name: 'Gold (per gram)', labels: ['2022', '2023', '2024'], data: [5000, 5750, 6300], avgReturn: 12.23 },
    nifty: { name: 'Nifty 50 Index', labels: ['2022', '2023', '2024'], data: [17354, 19411, 21731], avgReturn: 11.76 },
    crypto: { name: 'Crypto (BTC)', labels: ['2022', '2023', '2024'], data: [1380000, 3570000, 5230000], avgReturn: 49.3 }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Setup ---
    const session = DUMMY_API.getActiveUser();
    if (!session) { location.href = 'login.html'; return; }

    const userDetails = DUMMY_API.getUserDetails();
    document.getElementById('welcome').textContent = `Welcome back, ${userDetails?.name || session}!`;

    // --- Demo Mode Activation ---
    const userHasRealData = DUMMY_API.getExpenses().length > 0 || DUMMY_API.getGoals().length > 0;
    if (!userHasRealData) { DUMMY_API.setupDemo(); }
    
    const disclaimer = document.getElementById('demo-disclaimer');
    if (DUMMY_API.isDemoMode()) { disclaimer.style.display = 'flex'; }
    document.getElementById('close-disclaimer-btn')?.addEventListener('click', () => { disclaimer.style.display = 'none'; });
    
    // --- Tab Switching Logic ---
    const tabsContainer = document.getElementById('analytics-tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab-btn');
            if (!clickedTab) return;
            tabsContainer.querySelector('.active').classList.remove('active');
            clickedTab.classList.add('active');
            const tabName = clickedTab.dataset.tab;
            document.querySelector('.tab-content.active').classList.remove('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    }

    // --- Main Render Function ---
    function renderDashboard() {
        if (!DUMMY_API.isDemoMode()) { disclaimer.style.display = 'none'; }
        renderUserExpensesAndSummary();
        renderUserGoals();
        renderComparisonAnalytics(); // This will now show monthly
        updateCharts();
    }
    
    // --- (Simplified "Available to Save" logic) ---
    function renderUserExpensesAndSummary(){
        const allExpenses = DUMMY_API.getExpenses(); // Get ALL expenses
        const list = document.getElementById('userExpensesList');
        
        list.innerHTML = '';
        if (allExpenses.length === 0) { list.innerHTML = `<li class="muted small" style="text-align:center;padding:10px;">No expenses recorded yet.</li>`; } 
        else {
            // Display 5 most recent expenses
            allExpenses.slice(-5).reverse().forEach(e=> {
                const li=document.createElement('li'); 
                li.textContent=`${e.desc} — ₹ ${Number(e.amount).toFixed(2)} [${e.category}]`; 
                list.appendChild(li); 
            });
        }

        const income = DUMMY_API.getIncome();

        // --- Filter for CURRENT MONTH ---
        const now = new Date('2025-10-20T10:00:00'); // Represents the "current" day
        const currentMonth = now.getMonth(); // 9 (for October)
        const currentYear = now.getFullYear(); // 2025

        const monthlyExpenses = allExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        
        // --- Calculate stats for the current month ---
        const monthlyStats = window.FW.expenseAnalyticsForUser(monthlyExpenses);
        const monthlyTotalExpenses = monthlyStats.total;
        
        // --- NEW, SIMPLER CALCULATION ---
        const monthlySavings = income - monthlyTotalExpenses; 

        // --- Update DOM with new logic and IDs ---
        document.getElementById('monthlySavings').textContent = `₹ ${monthlySavings.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `₹ ${income.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `₹ ${monthlyTotalExpenses.toFixed(2)}`; 
    }
    
    // --- Event Listeners for Forms ---
    document.getElementById('userExpenseForm').addEventListener('submit', e => {
        e.preventDefault();
        const desc = document.getElementById('udesc').value;
        const amount = Number(document.getElementById('uamount').value);
        const category = document.getElementById('ucategory').value;
        if (!desc || amount <= 0) { alert('Please enter a valid description and amount.'); return; }
        DUMMY_API.addExpense({ desc, amount, category });
        showToast('Expense added successfully!');
        document.getElementById('userExpenseForm').reset();
        renderDashboard();
    });
    
    document.getElementById('addGoalBtn').addEventListener('click', () => {
        const name = document.getElementById('goalName').value;
        const target = Number(document.getElementById('goalTarget').value) || 0;
        const saved = Number(document.getElementById('goalSaved').value) || 0;
        if (!name || target <= 0) { alert('Provide valid name and target'); return; }
        DUMMY_API.addGoal({ name, target, saved });
        showToast('Goal added!');
        document.getElementById('goalForm').reset();
        renderDashboard();
    });

    document.getElementById('setIncomeBtn')?.addEventListener('click', () => {
        const currentIncome = DUMMY_API.getIncome();
        const newIncome = prompt(`Enter your monthly income:`, currentIncome.toFixed(0));
        const incomeValue = Number(newIncome);
        if (newIncome !== null && !isNaN(incomeValue) && incomeValue >= 0) {
            DUMMY_API.setIncome(incomeValue);
            renderDashboard();
            showToast('Income updated!');
        } else if (newIncome !== null) { alert('Please enter a valid income amount.'); }
    });

    function renderUserGoals() {
        const el = document.getElementById('goalsList');
        const goals = DUMMY_API.getGoals();
        el.innerHTML = '';
        if (goals.length === 0) { el.innerHTML = `<li class="muted small" style="text-align:center;padding:10px;">No savings goals added yet.</li>`; return; }
        goals.forEach(g => {
            const li = document.createElement('li');
            const percent = (g.target > 0) ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
            li.innerHTML = `<div><strong>${g.name}</strong></div><div class="muted small">₹ ${Number(g.saved).toFixed(2)} / ₹ ${Number(g.target).toFixed(2)}</div><div class="progress"><i style="width:${percent}%"></i></div>`;
            el.appendChild(li);
        });
    }

    // --- UPDATED COMPARISON TAB LOGIC (Now Monthly) ---
    function renderComparisonAnalytics() {
        
        // --- NEW: Filter for CURRENT MONTH ---
        const allExpenses = DUMMY_API.getExpenses();
        const now = new Date('2025-10-20T10:00:00'); // Represents the "current" day
        const currentMonth = now.getMonth(); // 9 (for October)
        const currentYear = now.getFullYear(); // 2025

        const monthlyExpenses = allExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        // --- End of new filter ---

        // Use the filtered monthly expenses
        const stats = window.FW.expenseAnalyticsForUser(monthlyExpenses); 
        const byCat = stats.byCat;
        const userTotal = stats.total; // This is now the MONTHLY total

        // Demo averages (which are already monthly)
        const DEMO_AVERAGES = {
            'Food': 4500,
            'Transport': 1500,
            'Bills': 8000,
            'Entertainment': 2000,
            'Other': 1000,
            'Education': 1200
        };
        
        const avgTotal = Object.values(DEMO_AVERAGES).reduce((a, b) => a + b, 0);
        const categoriesToCompare = [...new Set([...Object.keys(DEMO_AVERAGES), ...Object.keys(byCat)])];
        const comparisonListEl = document.getElementById('comparison-list');
        const placeholderEl = document.getElementById('comparison-placeholder');
        
        if (!comparisonListEl) return;
        comparisonListEl.innerHTML = '';
        
        let relevantExpensesFound = false;
        let categoriesHtml = ''; // For individual categories
        let totalHtml = '';      // For the total bar

        // --- 1. Generate TOTAL bar (now compares monthly total) ---
        const maxTotalVal = Math.max(userTotal, avgTotal) * 1.5 || 1;
        const userTotalPercent = Math.min(100, (userTotal / maxTotalVal) * 100);
        const avgTotalPercent = Math.min(100, (avgTotal / maxTotalVal) * 100);
        const isTotalOver = userTotal > avgTotal;
        const totalBarColor = isTotalOver ? '#ef4444' : '#0ea5a4';

        totalHtml = `
            <div class="comparison-item comparison-item-total comparison-item-padded">
              <div class="comparison-labels">
                <span>Total Spending (This Month)</span>
                <span class="comparison-values">
                  <strong>Your: ₹${userTotal.toLocaleString('en-IN')}</strong> (Avg: ₹${avgTotal.toLocaleString('en-IN')})
                </span>
              </div>
              <div class="progress" style="height: 20px;">
                <i class="user-bar" style="width: ${userTotalPercent}%; background-color: ${totalBarColor};"></i>
                <span class="avg-marker" style="left: ${avgTotalPercent}%;"></span>
              </div>
            </div>
        `;

        // --- 2. Generate Category bars (now compares monthly categories) ---
        categoriesToCompare.forEach(cat => {
            const userAmount = byCat[cat] || 0;
            const avgAmount = DEMO_AVERAGES[cat] || 0;
            if (userAmount === 0 && avgAmount === 0) return;
            if (userAmount > 0) relevantExpensesFound = true;
            const maxVal = Math.max(userAmount, avgAmount) * 1.5 || 1;
            const userPercent = Math.min(100, (userAmount / maxVal) * 100);
            const avgPercent = Math.min(100, (avgAmount / maxVal) * 100);
            const isOver = userAmount > avgAmount;
            const barColor = isOver ? '#ef4444' : '#0ea5a4';
            categoriesHtml += `
                <div class="comparison-item comparison-item-padded"> 
                  <div class="comparison-labels">
                    <span>${cat}</span>
                    <span class="comparison-values">
                      <strong>Your: ₹${userAmount.toLocaleString('en-IN')}</strong> (Avg: ₹${avgAmount.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <div class="progress" style="height: 20px;">
                    <i class="user-bar" style="width: ${userPercent}%; background-color: ${barColor};"></i>
                    <span class="avg-marker" style="left: ${avgPercent}%;"></span>
                  </div>
                </div>
            `;
        });
        if (relevantExpensesFound || userTotal > 0) {
            comparisonListEl.innerHTML = categoriesHtml + totalHtml; 
            comparisonListEl.style.display = 'flex';
            placeholderEl.style.display = 'none';
        } else {
            comparisonListEl.style.display = 'none';
            placeholderEl.style.display = 'flex';
        }
    }

    // --- CHART LOGIC: SIMPLIFIED AND CORRECTED ---
    let catChart = null, stackedMonthChart = null;
    
    function updateCharts() {
        // This function uses ALL expenses, which is correct for charts
        // The "Breakdown" chart shows all-time breakdown
        // The "Trends" chart shows month-by-month
        const expenses = DUMMY_API.getExpenses(); 
        const categories = [...new Set(expenses.map(e => e.category))].sort();
        const colors = ['#3b82f6', '#0ea5a4', '#f97316', '#ef4444', '#a78bfa', '#facc15'];
        const categoryColors = categories.reduce((acc, cat, i) => {
            acc[cat] = colors[i % colors.length];
            return acc;
        }, {});

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // (Category Chart - Doughnut) - This shows ALL-TIME breakdown
        const catCanvas = document.getElementById('catChart');
        const catPlaceholder = document.getElementById('catChartPlaceholder');
        const byCat = expenses.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + Number(a.amount); return acc; }, {});
        const catLabels = Object.keys(byCat);
        if (catLabels.length === 0) {
            catCanvas.style.display = 'none'; catPlaceholder.style.display = 'flex';
            if (catChart) { catChart.destroy(); catChart = null; }
        } else {
            catCanvas.style.display = 'block'; catPlaceholder.style.display = 'none';
            const catData = catLabels.map(l => byCat[l]);
            if (catChart) { catChart.data.labels = catLabels; catChart.data.datasets[0].data = catData; catChart.update(); }
            else { catChart = new Chart(catCanvas.getContext('2d'), { type: 'doughnut', data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: colors, borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '60%' } }); }
        }
        
        // --- Stacked Monthly Chart by Category (Trends) ---
        const stackedMonthCanvas = document.getElementById('stackedMonthChart');
        const stackedMonthPlaceholder = document.getElementById('stackedMonthChartPlaceholder');
        
        const byMonthCategory = {};
        expenses.forEach(a => {
            const d = new Date(a.date);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`; // YYYY-MM format
            if (!byMonthCategory[key]) {
                byMonthCategory[key] = {};
            }
            byMonthCategory[key][a.category] = (byMonthCategory[key][a.category] || 0) + Number(a.amount);
        });

        const sortedMonthKeys = Object.keys(byMonthCategory).sort();
        
        const finalMonthLabels = sortedMonthKeys.map(key => {
            const [year, monthIndex] = key.split('-');
            return `${monthNames[parseInt(monthIndex, 10)]} ${year}`;
        });

        if (sortedMonthKeys.length === 0) {
            stackedMonthCanvas.style.display = 'none'; stackedMonthPlaceholder.style.display = 'flex';
            if (stackedMonthChart) { stackedMonthChart.destroy(); stackedMonthChart = null; }
        } else {
            stackedMonthCanvas.style.display = 'block'; stackedMonthPlaceholder.style.display = 'none';

            const datasets = categories.map(cat => ({
                label: cat,
                data: sortedMonthKeys.map(key => byMonthCategory[key][cat] || 0),
                backgroundColor: categoryColors[cat]
            }));

            if (stackedMonthChart) {
                stackedMonthChart.data.labels = finalMonthLabels;
                stackedMonthChart.data.datasets = datasets;
                stackedMonthChart.update();
            } else {
                stackedMonthChart = new Chart(stackedMonthCanvas.getContext('2d'), {
                    type: 'bar',
                    data: { labels: finalMonthLabels, datasets: datasets },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } },
                        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
                    }
                });
            }
        }
    }
    
    // --- ======================================================= ---
    // --- NEW, REALISTIC "AI" TIPS & DATA MANAGEMENT ---
    // --- ======================================================= ---
    
    // Helper function to simulate AI "thinking" and typing
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    document.getElementById('genTips').addEventListener('click', async () => {
        const genTipsBtn = document.getElementById('genTips');
        const tipsEl = document.getElementById('tips');
        tipsEl.innerHTML = ''; // Clear old tips
        genTipsBtn.disabled = true;
        genTipsBtn.textContent = 'Analyzing...';
        
        // This helper function adds tips one by one
        async function showTip(tip, delay = 500) {
            await sleep(delay);
            const tipElement = document.createElement('div');
            tipElement.innerHTML = tip; // Use innerHTML to parse <strong> tags
            tipsEl.appendChild(tipElement);
        }

        const allExpenses = DUMMY_API.getExpenses();
        const income = DUMMY_API.getIncome();
        const goals = DUMMY_API.getGoals();
        
        if(allExpenses.length === 0){ 
            await showTip('No spending data yet — add some expenses to get tips.', 0);
            genTipsBtn.disabled = false;
            genTipsBtn.textContent = 'Get Quick Tips (AI Demo)';
            return; 
        }

        // --- Data Prep for AI ---
        const now = new Date('2025-10-20T10:00:00'); // "Current" day
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();
        
        const monthlyExpenses = allExpenses.filter(e => {
            const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const lastMonthExpenses = allExpenses.filter(e => {
            const d = new Date(e.date); return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        const monthlyStats = window.FW.expenseAnalyticsForUser(monthlyExpenses);
        const lastMonthStats = window.FW.expenseAnalyticsForUser(lastMonthExpenses);
        const monthlyTotal = monthlyStats.total;
        
        const tips = [];
        
        // --- Tip 1: Savings Rate ---
        const savings = income - monthlyTotal;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;
        
        if (savingsRate > 20) {
            tips.push(`✅ **Excellent Saver!** You're on track to save over **${savingsRate.toFixed(0)}%** of your income this month. Keep it up!`);
        } else if (savings < 0) {
            tips.push(`⚠️ **Spending Alert:** This month, you've spent **₹ ${Math.abs(savings).toFixed(0)}** more than your income. Let's review your top expenses.`);
        } else {
            tips.push(`📈 **On Track:** You have a surplus of **₹ ${savings.toFixed(0)}** so far this month. Good job sticking to your budget!`);
        }

        // --- Tip 2: Top Category & Comparison ---
        const sortedCats = Object.entries(monthlyStats.byCat).sort((a,b)=>b[1]-b[1]);
        
        if(sortedCats.length > 0){ 
            const [topCat, topAmt] = sortedCats[0]; 
            const percentOfTotal = monthlyTotal > 0 ? (topAmt / monthlyTotal * 100) : 0;
            tips.push(`💡 **Expense Focus:** Your top spending category this month is <strong>${topCat}</strong>, making up **${percentOfTotal.toFixed(0)}%** of your expenses.`);

            // --- Tip 3: Comparison to Last Month ---
            const lastMonthAmt = lastMonthStats.byCat[topCat] || 0;
            if (lastMonthAmt > 0) {
                const diff = topAmt - lastMonthAmt;
                const percentDiff = (diff / lastMonthAmt) * 100;
                if (percentDiff > 10) {
                    tips.push(`📊 **Trend Alert:** Your <strong>${topCat}</strong> spending is up by **${percentDiff.toFixed(0)}%** compared to last month. Is this a one-time expense?`);
                } else if (percentDiff < -10) {
                    tips.push(`📉 **Good Trend:** Great work! Your <strong>${topCat}</strong> spending is down by **${Math.abs(percentDiff).toFixed(0)}%** from last month.`);
                }
            }
        }
        
        // --- Tip 4: Specific Category Advice ---
        const foodPercent = (monthlyStats.byCat['Food'] || 0) / monthlyTotal;
        if (foodPercent > 0.25) { // If food is > 25% of monthly spend
            tips.push(`🍽️ **Food for Thought:** Your spending on 'Food' seems high. Consider planning meals for the week to help reduce costs.`);
        }
        
        const entPercent = (monthlyStats.byCat['Entertainment'] || 0) / monthlyTotal;
        if (entPercent > 0.20) { // If entertainment is > 20%
             tips.push(`🎟️ **Entertainment:** This category is a high part of your spending. Try looking for free events or activities for your next outing.`);
        }

        // --- Tip 5: Goal Suggestion ---
        if (savings > 0 && goals.length === 0) { 
            tips.push(`🎯 **Set a Goal:** You have a surplus of **₹ ${savings.toFixed(0)}**! Why not create a savings goal? Head over to the 'Savings Goals' section to start.`);
        } else if (savings > 0 && goals.length > 0) {
            tips.push(`🎯 **Goal Boost:** You have **₹ ${savings.toFixed(0)}** in unallocated savings this month. Consider adding it to your '${goals[0].name}' goal!`);
        }

        // --- Render the tips one by one ---
        for (const tip of tips) {
            await showTip(tip, 600); // 0.6 second delay between each tip
        }

        // Re-enable the button
        genTipsBtn.disabled = false;
        genTipsBtn.textContent = 'Get Quick Tips (AI Demo)';
    });

    // --- Data Management (Export/Import) ---
    document.getElementById('exportCsv')?.addEventListener('click', () => { 
        const arr = DUMMY_API.getExpenses(); if(!arr.length){ alert('No expenses to export'); return; }
        const csv = ['date,category,amount,desc', ...arr.map(e=>`${new Date(e.date).toISOString().substring(0,10)},${e.category},${Number(e.amount).toFixed(2)},"${e.desc.replace(/"/g, '""')}"`)].join('\n');
        const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'finwise_expenses.csv'; a.click(); URL.revokeObjectURL(url);
    });

    const importCsvInput = document.getElementById('importCsvInput');
    const importCsvBtn = document.getElementById('importCsvBtn');
    importCsvBtn.addEventListener('click', () => { importCsvInput.click(); });
    importCsvInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            try {
                const expenses = parseCSV(text);
                const importedCount = DUMMY_API.importExpenses(expenses);
                if (importedCount > 0) {
                    showToast(`${importedCount} expenses imported!`);
                    renderDashboard();
                } else { alert("Could not import. Check file format."); }
            } catch (error) { alert("An error occurred reading the file."); }
            importCsvInput.value = '';
        };
        reader.readAsText(file);
    });
    function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const entry = {};
            headers.forEach((header, index) => { entry[header] = values[index].trim().replace(/"/g, ''); });
            if (entry.amount) entry.amount = parseFloat(entry.amount);
            if (entry.date) entry.date = !isNaN(new Date(entry.date).getTime()) ? new Date(entry.date).toISOString() : new Date().toISOString();
            data.push(entry);
        }
        return data;
    }

    // --- Investment Hub Logic ---
    let investmentLineChart = null;
    const investCtx = document.getElementById('investmentChart').getContext('2d');
    const assetSelect = document.getElementById('assetSelect');
    const calculateBtn = document.getElementById('calculateInvestmentBtn');
    
    function renderInvestmentChart(assetKey) {
        const asset = DEMO_ASSETS[assetKey];
        if (investmentLineChart) investmentLineChart.destroy();
        investmentLineChart = new Chart(investCtx, {
            type: 'line', data: { labels: asset.labels, datasets: [{ label: asset.name, data: asset.data, borderColor: '#0ea5a4', backgroundColor: 'rgba(14, 165, 164, 0.1)', fill: true, tension: 0.1 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (value) => `₹${value/1000}k` } }, x: { grid: { display: false } } } }
        });
    }

    function calculateInvestment() {
        const assetKey = assetSelect.value;
        const asset = DEMO_ASSETS[assetKey];
        const P = Number(document.getElementById('investAmount').value) || 0;
        const n = Number(document.getElementById('investYears').value) || 0;
        const r = asset.avgReturn / 100;
        const resultEl = document.getElementById('investmentResult');
        if (P <= 0 || n <= 0) { resultEl.innerHTML = "Please enter a valid amount and number of years."; return; }
        const A = P * Math.pow(1 + r, n);
        const totalInterest = A - P;
        resultEl.innerHTML = `Investing <strong>₹${P.toLocaleString('en-IN')}</strong> for ${n} years could yield <strong>₹${A.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>.<br><span class="muted small">Profit: ₹${totalInterest.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`;
    }

    assetSelect.addEventListener('change', (e) => renderInvestmentChart(e.target.value));
    calculateBtn.addEventListener('click', calculateInvestment);
    
    // --- Initial Load ---
    renderDashboard();
    renderInvestmentChart('gold');
});