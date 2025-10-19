// dashboard.js — per-user dashboard logic
// FINAL, FULLY CORRECTED VERSION
// This version includes the new category-by-category comparison tab
// and fixes the logical flaw in the month-sorting algorithm.

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
        renderComparisonAnalytics(); // New function for the comparison tab
        updateCharts();
    }
    
    function renderUserExpensesAndSummary(){
        const expenses = DUMMY_API.getExpenses();
        const goals = DUMMY_API.getGoals();
        const list = document.getElementById('userExpensesList');
        
        list.innerHTML = '';
        if (expenses.length === 0) { list.innerHTML = `<li class="muted small" style="text-align:center;padding:10px;">No expenses recorded yet.</li>`; } 
        else {
            expenses.slice(-5).reverse().forEach(e=> {
                const li=document.createElement('li'); 
                li.textContent=`${e.desc} — ₹ ${Number(e.amount).toFixed(2)} [${e.category}]`; 
                list.appendChild(li); 
            });
        }

        const income = DUMMY_API.getIncome();
        const stats = window.FW.expenseAnalyticsForUser(expenses);
        const totalExpenses = stats.total;
        const totalSavedInGoals = goals.reduce((sum, goal) => sum + Number(goal.saved), 0);
        
        // This calculation is more accurate for net worth
        const allTimeExpenses = DUMMY_API.isDemoMode() ? totalExpenses : expenses.reduce((s, a) => s + Number(a.amount), 0);
        const netWorth = (income - allTimeExpenses) + totalSavedInGoals; // Simplified for demo logic

        document.getElementById('currentBalance').textContent = `₹ ${netWorth.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `₹ ${income.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `₹ ${totalExpenses.toFixed(2)}`;
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

    // --- NEW COMPARISON TAB LOGIC ---
    function renderComparisonAnalytics() {
        const expenses = DUMMY_API.getExpenses();
        // Use the existing analytics helper to get expenses by category
        const stats = window.FW.expenseAnalyticsForUser(expenses);
        const byCat = stats.byCat;
        const userTotal = stats.total; // Get user's total spending

        // Demo averages for comparison
        const DEMO_AVERAGES = {
            'Food': 4500,
            'Transport': 1500,
            'Bills': 8000,
            'Entertainment': 2000,
            'Other': 1000,
            'Education': 1200
        };
        
        // Calculate total average
        const avgTotal = Object.values(DEMO_AVERAGES).reduce((a, b) => a + b, 0);

        const categoriesToCompare = [...new Set([...Object.keys(DEMO_AVERAGES), ...Object.keys(byCat)])];
        const comparisonListEl = document.getElementById('comparison-list');
        const placeholderEl = document.getElementById('comparison-placeholder');
        
        if (!comparisonListEl) return;
        comparisonListEl.innerHTML = '';
        
        let relevantExpensesFound = false;
        let categoriesHtml = ''; // For individual categories
        let totalHtml = '';      // For the total bar

        // --- 1. Generate TOTAL bar ---
        const maxTotalVal = Math.max(userTotal, avgTotal) * 1.5 || 1;
        const userTotalPercent = Math.min(100, (userTotal / maxTotalVal) * 100);
        const avgTotalPercent = Math.min(100, (avgTotal / maxTotalVal) * 100);
        const isTotalOver = userTotal > avgTotal;
        const totalBarColor = isTotalOver ? '#ef4444' : '#0ea5a4';

        totalHtml = `
            <div class="comparison-item comparison-item-total comparison-item-padded">
              <div class="comparison-labels">
                <span>Total Spending</span>
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

        // --- 2. Generate Category bars ---
        categoriesToCompare.forEach(cat => {
            const userAmount = byCat[cat] || 0;
            const avgAmount = DEMO_AVERAGES[cat] || 0;

            // Only show categories where there is some data
            if (userAmount === 0 && avgAmount === 0) return;
            if (userAmount > 0) relevantExpensesFound = true;

            // Determine max value for the bar (e.g., 1.5x the higher value, or 1 if both are 0)
            const maxVal = Math.max(userAmount, avgAmount) * 1.5 || 1;

            const userPercent = Math.min(100, (userAmount / maxVal) * 100);
            const avgPercent = Math.min(100, (avgAmount / maxVal) * 100);
            const isOver = userAmount > avgAmount;
            const barColor = isOver ? '#ef4444' : '#0ea5a4'; // Red if over, teal if under/equal

            // Add the padding class here
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

        // --- 3. Combine and Render ---
        if (relevantExpensesFound || userTotal > 0) {
            // Add categories first, then the total bar at the end
            comparisonListEl.innerHTML = categoriesHtml + totalHtml; 
            comparisonListEl.style.display = 'flex';
            placeholderEl.style.display = 'none';
        } else {
            // Show placeholder if user has no expenses at all
            comparisonListEl.style.display = 'none';
            placeholderEl.style.display = 'flex';
        }
    }

    // --- CHART LOGIC: SIMPLIFIED AND CORRECTED ---
    let catChart = null, stackedMonthChart = null;
    
    function updateCharts() {
        const expenses = DUMMY_API.getExpenses();
        const categories = [...new Set(expenses.map(e => e.category))].sort();
        const colors = ['#3b82f6', '#0ea5a4', '#f97316', '#ef4444', '#a78bfa', '#facc15'];
        const categoryColors = categories.reduce((acc, cat, i) => {
            acc[cat] = colors[i % colors.length];
            return acc;
        }, {});

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // (Category Chart - Doughnut)
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
        
        // --- Stacked Monthly Chart by Category (The ONLY Trend Chart) ---
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
    
    // --- AI Tips & Data Management ---
    document.getElementById('genTips').addEventListener('click', () => {
        const expenses = DUMMY_API.getExpenses(); const income = DUMMY_API.getIncome(); const goals = DUMMY_API.getGoals();
        const tipsEl = document.getElementById('tips'); tipsEl.innerHTML='';
        if(expenses.length === 0){ tipsEl.textContent='No spending data yet — add some expenses to get tips.'; return; }
        const stats = window.FW.expenseAnalyticsForUser(expenses); let tipsHtml = '';
        const savings = income - stats.total; const savingsRate = income > 0 ? (savings / income) * 100 : 0;
        if (savingsRate > 20) { tipsHtml += `<div>✅ **Excellent Saver!** You're saving over ${savingsRate.toFixed(0)}% of your income.</div>`; }
        else if (savings < 0) { tipsHtml += `<div>⚠️ **Spending Alert:** You've spent ₹ ${Math.abs(savings).toFixed(0)} more than your income.</div>`; }
        else { tipsHtml += `<div>📈 **On Track:** You have a surplus of ₹ ${savings.toFixed(0)}.</div>`; }
        const sortedCats = Object.entries(stats.byCat).sort((a,b)=>b[1]-a[1]);
        if(sortedCats.length > 0){ const [topCat, topAmt] = sortedCats[0]; const percentOfTotal = stats.total > 0 ? (topAmt / stats.total * 100) : 0;
            tipsHtml += `<div>💡 **Expense Focus:** Your top spending is <strong>${topCat}</strong> (${percentOfTotal.toFixed(0)}%).</div>`;
        }
        if (savings > 0 && goals.length === 0) { tipsHtml += `<div>🎯 **Set a Goal:** You have a surplus! Why not create a savings goal?</div>`; }
        tipsEl.innerHTML = tipsHtml;
    });

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