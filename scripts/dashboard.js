// dashboard.js — per-user dashboard logic
document.addEventListener('DOMContentLoaded', ()=>{
  const session = localStorage.getItem('fw_session');
  if(!session){ location.href='login.html'; return; }
  const users = JSON.parse(localStorage.getItem('fw_users')||'{}');
  document.getElementById('welcome').textContent = `Welcome back, ${users[session]?.name||session}!`;

  // Income/Balance Storage and Management
  // Default income set to 25000 if not found
  function getIncome(){ return Number(localStorage.getItem('fw_income_' + session) || 25000); }
  function setIncome(income){ localStorage.setItem('fw_income_' + session, income); }

  function loadUserExpenses(){ return JSON.parse(localStorage.getItem('fw_expenses_' + session) || '[]'); }
  function saveUserExpenses(arr){ localStorage.setItem('fw_expenses_' + session, JSON.stringify(arr)); }

  const list = document.getElementById('userExpensesList');
  function renderUserExpenses(){
    const arr = loadUserExpenses();
    
    // 1. Render Recent Expenses List
    list.innerHTML='';
    arr.slice(-5).reverse().forEach(e=>{ const li=document.createElement('li'); li.textContent=`${e.desc} — ₹ ${e.amount.toFixed(2)} [${e.category}]`; list.appendChild(li); });

    // 2. Calculate Stats
    const income = getIncome();
    const stats = (window.FW && window.FW.expenseAnalyticsForUser) ? window.FW.expenseAnalyticsForUser(arr) : {total:arr.reduce((s,a)=>s+Number(a.amount),0),byCat:{},count:arr.length};
    const totalExpenses = stats.total;
    const currentBalance = income - totalExpenses;

    // 3. Update Summary Cards
    document.getElementById('currentBalance').textContent = `₹ ${currentBalance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `₹ ${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹ ${totalExpenses.toFixed(2)}`;
    
    // 4. Update Comparison Bar (Demo Logic: Compares user spending against a demo average)
    // Assume average spending is 60% of income, or a fixed 15000 if income is zero/low.
    const averageSpending = Math.max(15000, income * 0.6); 
    const spendingRatio = totalExpenses / income;
    const avgRatio = averageSpending / income;

    // Cap at 100% for visualization
    const userPercent = Math.min(100, (spendingRatio * 100)); 
    const avgPercent = Math.min(100, (avgRatio * 100));
    
    const userBar = document.getElementById('userSpendingBar');
    const avgMarker = document.getElementById('averageSpendingMarker');
    
    if(userBar) userBar.style.width = `${userPercent}%`;
    if(avgMarker) {
        avgMarker.style.left = `${avgPercent}%`;
        // Shorter label for better visual fit
        avgMarker.textContent = `Avg: ₹ ${averageSpending.toFixed(0)}`; 
        avgMarker.title = 'Average Indian professional spending (Demo)';
        
        // Change user bar color based on comparison
        if (spendingRatio > avgRatio) {
            userBar.style.backgroundColor = '#ef4444'; // Danger color
        } else {
            userBar.style.backgroundColor = 'var(--accent-2)'; // Primary color
        }
    }
  }
  
  // Set Income Button Handler
  document.getElementById('setIncomeBtn')?.addEventListener('click', ()=>{
    const currentIncome = getIncome();
    const newIncome = prompt(`Enter your monthly income (current: ₹ ${currentIncome.toFixed(0)}):`, currentIncome.toFixed(0));
    const incomeValue = Number(newIncome);
    if(newIncome !== null && !isNaN(incomeValue) && incomeValue >= 0){
        setIncome(incomeValue);
        renderUserExpenses();
        updateCharts();
    } else if (newIncome !== null) {
        alert('Please enter a valid income amount.');
    }
  });

  document.getElementById('userExpenseForm')?.addEventListener('submit', e=>{
    e.preventDefault();
    const desc = document.getElementById('udesc').value;
    const amount = Number(document.getElementById('uamount').value);
    const category = document.getElementById('ucategory').value;
    const arr = loadUserExpenses(); 
    arr.push({desc,amount,category,date:new Date().toISOString()}); 
    saveUserExpenses(arr);
    // update global demo store (for index.html preview)
    const global = JSON.parse(localStorage.getItem('fw_expenses')||'[]'); 
    global.push({desc,amount,category,date:new Date().toISOString()}); 
    localStorage.setItem('fw_expenses', JSON.stringify(global));
    
    renderUserExpenses();
    updateCharts();
    document.getElementById('userExpenseForm').reset();
  });

  // Goals 
  function getGoals(){ return JSON.parse(localStorage.getItem('fw_goals_' + session) || '[]'); }
  function saveGoals(g){ localStorage.setItem('fw_goals_' + session, JSON.stringify(g)); }
  function renderUserGoals(){ 
      const el = document.getElementById('goalsList'); 
      if(!el) return; 
      el.innerHTML=''; 
      getGoals().forEach((g, i)=>{ 
          const li=document.createElement('li'); 
          const percent = Math.min(100, Math.round((g.saved / g.target) * 100)); 
          li.innerHTML = `
              <div style="font-size: 0.95rem; font-weight: 600;">${g.name}</div>
              <div class="muted small">₹ ${g.saved.toFixed(2)} / ₹ ${g.target.toFixed(2)}</div>
              <div class="progress" style="margin-bottom: 8px;"><i style="width:${percent}%"></i></div>
          `; 
          el.appendChild(li); 
      }); 
  }

  document.getElementById('addGoalBtn')?.addEventListener('click', ()=>{
    const name=document.getElementById('goalName').value; 
    const target=Number(document.getElementById('goalTarget').value)||0; 
    const saved=Number(document.getElementById('goalSaved').value)||0;
    if(!name||target<=0){ alert('Provide valid name and target'); return; }
    const g = getGoals(); 
    g.push({name,target,saved}); 
    saveGoals(g); 
    renderUserGoals(); 
    document.getElementById('goalForm')?.reset();
  });

  // Bookmarks 
  function renderBookmarks(){ 
    const bm = JSON.parse(localStorage.getItem('fw_bookmarks')||'[]'); 
    // Accessing global terms/news arrays is safer here as app.js runs first
    const NEWS_TERMS = [...(window.FW?.TERMS || []), ...(window.FW?.NEWS || [])];
    const el = document.getElementById('bookmarksPanel'); 
    if(!el) return; 
    
    const bookmarkNames = bm.map(key => {
        const item = NEWS_TERMS.find(t => t.k === key || t.id === key);
        return item ? (item.k || item.t) : key;
    });

    el.innerHTML = bookmarkNames.length ? bookmarkNames.map(x=>`<div>• ${x}</div>`).join('') : 'No bookmarks yet.'; 
  }

  // --- Chart.js Integration ---
  
  // load Chart.js from CDN dynamically
  function loadChartJs(){
    return new Promise((resolve,reject)=>{
      if(window.Chart) return resolve(window.Chart);
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = ()=>resolve(window.Chart);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  let catChart=null, monthChart=null;
  function updateCharts(){
    const arr = loadUserExpenses();
    // category totals
    const byCat = arr.reduce((acc,a)=>{ acc[a.category]=(acc[a.category]||0)+Number(a.amount); return acc; },{});
    const catLabels = Object.keys(byCat);
    const catData = catLabels.map(l=>byCat[l]);
    // monthly totals (month-year)
    const byMonth = {};
    arr.forEach(a=>{ const d = new Date(a.date); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; byMonth[key]=(byMonth[key]||0)+Number(a.amount); });
    const monthLabels = Object.keys(byMonth).sort();
    const monthData = monthLabels.map(k=>byMonth[k]);

    loadChartJs().then(Chart=>{
      // Chart Colors (Using CSS variables)
      const colors = ['#3b82f6','#0ea5a4','#f97316','#ef4444','#a78bfa', '#facc15'];

      // Category Chart (Pie)
      const catCtx = document.getElementById('catChart')?.getContext('2d');
      if(catCtx) {
        if(catChart){ 
            catChart.data.labels = catLabels; 
            catChart.data.datasets[0].data = catData; 
            catChart.data.datasets[0].backgroundColor = colors;
            catChart.update(); 
        } else {
            catChart = new Chart(catCtx,{
                type:'pie',
                data:{labels:catLabels,datasets:[{data:catData,backgroundColor:colors}]},
                options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right'}}}
            });
        }
      }

      // Monthly Chart (Bar)
      const monCtx = document.getElementById('monthChart')?.getContext('2d');
      if(monCtx) {
        if(monthChart){ 
            monthChart.data.labels = monthLabels; 
            monthChart.data.datasets[0].data = monthData; 
            monthChart.update(); 
        } else {
            monthChart = new Chart(monCtx,{
                type:'bar',
                data:{labels:monthLabels,datasets:[{label:'Spending',data:monthData,backgroundColor:'#3b82f6'}]},
                options:{responsive:true,maintainAspectRatio:false, scales:{y:{beginAtZero:true}}}
            });
        }
      }
    }).catch(err=>{ console.warn('Chart.js load failed',err); });
  }

  // export CSV
  document.getElementById('exportCsv')?.addEventListener('click', ()=>{
    const arr = loadUserExpenses();
    if(!arr.length){ alert('No expenses to export'); return; }
    const csv = ['date,category,amount,desc', ...arr.map(e=>`${e.date.substring(0,10)},${e.category},${e.amount.toFixed(2)},${JSON.stringify(e.desc)}`)].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'finwise_expenses.csv'; a.click(); URL.revokeObjectURL(url);
  });

  // quick tips (simple rule-based, AI Demo)
  document.getElementById('genTips')?.addEventListener('click', ()=>{
    const arr = loadUserExpenses(); 
    const income = getIncome();
    const stats = (window.FW && window.FW.expenseAnalyticsForUser)?window.FW.expenseAnalyticsForUser(arr):{total:0,byCat:{}};
    const tipsEl = document.getElementById('tips'); 
    tipsEl.innerHTML='';
    
    if(stats.total===0){ tipsEl.textContent='No spending data yet — add some expenses to get tips.'; return; }
    
    // Tip 1: Top Category
    const sorted = Object.entries(stats.byCat).sort((a,b)=>b[1]-a[1]);
    if(sorted.length){ 
        const [cat,amt]=sorted[0]; 
        const pctOfTotal = (amt/stats.total * 100).toFixed(0);
        tipsEl.innerHTML += `<div style="margin-bottom:8px;">💡 **Expense Focus:** Your largest expense category is <strong>${cat}</strong>, accounting for ${pctOfTotal}% of your spending. Try setting a budget for ${cat}.</div>`; 
    }
    
    // Tip 2: Income vs Expense comparison
    if(stats.total > income * 0.8){ 
        tipsEl.innerHTML += `<div style="margin-bottom:8px;">⚠️ **Spending Alert:** Your total expenses (₹ ${stats.total.toFixed(0)}) are close to your income (₹ ${income.toFixed(0)}). Review non-essential spending immediately.</div>`; 
    } else {
        const potentialSavings = income - stats.total;
        tipsEl.innerHTML += `<div style="margin-bottom:8px;">✅ **Good Job!** You have a surplus of ₹ ${potentialSavings.toFixed(0)} this month. Consider transferring this amount to one of your savings goals!</div>`;
    }
  });

  // Initial render calls
  renderUserExpenses(); 
  renderUserGoals(); 
  renderBookmarks();
  updateCharts();
});