// Enhanced client-side interactions for FinWise
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');

function loadExpenses(){
  const raw = localStorage.getItem('fw_expenses') || '[]';
  return JSON.parse(raw);
}
function saveExpenses(arr){ localStorage.setItem('fw_expenses', JSON.stringify(arr)); }

function addExpenseLocal(desc, amount, category){
  const arr = loadExpenses();
  arr.push({desc,amount,category,date:new Date().toISOString()});
  saveExpenses(arr);
}

function renderExpenses(){
  const data = loadExpenses();
  if(!expensesList) return;
  expensesList.innerHTML = '';
  data.forEach((e, i)=>{
    const li = document.createElement('li');
    li.textContent = `${e.desc} — ₹ ${e.amount} [${e.category}]`;
    expensesList.appendChild(li);
  });
}

expenseForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const desc = document.getElementById('desc').value;
  const amount = Number(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  addExpenseLocal(desc, amount, category);
  renderExpenses();
  expenseForm.reset();
});

// Interest calc (page and tools)
function calcCompound(principal, rate, years){
  const r = rate/100;
  const A = principal * Math.pow(1 + r, years);
  return A;
}
document.getElementById('calcBtn')?.addEventListener('click', ()=>{
  const P = Number(document.getElementById('principal').value) || 0;
  const r = Number(document.getElementById('rate').value) || 0;
  const t = Number(document.getElementById('years').value) || 0;
  const A = calcCompound(P, r, t);
  document.getElementById('interestResult').textContent = `Future value: ₹ ${A.toFixed(2)} (interest ₹ ${(A-P).toFixed(2)})`;
});

// Currency Converter Demo Logic (For index.html)
document.getElementById('convBtn')?.addEventListener('click', async ()=>{
    const amount = Number(document.getElementById('convAmount').value) || 0;
    const from = document.getElementById('convFrom').value;
    const to = document.getElementById('convTo').value;
    // For demo: simple static rates
    const demo = { 'INR':1, 'USD':0.012, 'EUR':0.011 };
    const result = amount * (demo[to] / demo[from]);
    document.getElementById('convResult').textContent = `${amount} ${from} ≈ ${result.toFixed(2)} ${to} (demo rates)`;
});

// Tool Selector Logic (For index.html)
const toolSelector = document.getElementById('toolSelector');
if(toolSelector){
    toolSelector.addEventListener('change', (e)=>{
        const selectedTool = e.target.value;
        document.querySelectorAll('.tool-content').forEach(el => {
            el.style.display = 'none';
        });
        const targetElement = document.getElementById(selectedTool + '-tool');
        if (targetElement) {
            targetElement.style.display = 'block';
        }
    });
}

// Demo terms and bookmarking
const TERMS = [
  {k:'inflation', d:'A general increase in prices and fall in the purchasing value of money.'},
  {k:'compound interest', d:'Interest calculated on the initial principal and also on the accumulated interest.'},
  {k:'mutual funds', d:'Investment vehicles that pool money to buy securities managed by professionals.'},
  {k:'budget', d:'A plan for your income and expenses to meet goals.'},
  {k:'diversification', d:'A risk management strategy that mixes a wide variety of investments within a portfolio.'},
  {k:'taxation', d:'The levying of a tax. It is a compulsory financial charge imposed by a government.'},
  {k:'financial goal', d:'Specific, measurable, and time-bound objectives you hope to achieve through your finances.'},
  {k:'asset', d:'A resource with economic value that an individual, corporation, or country owns or controls with the expectation that it will provide a future benefit.'},
  {k:'liability', d:'A company’s legal financial debts or obligations that arise during the course of business operations.'},
  {k:'net worth', d:'The value of all the non-financial and financial assets owned minus the value of all outstanding liabilities.'},
  {k:'credit score', d:'A number representing a person’s creditworthiness based on their financial history.'},
  {k:'equity', d:'The value of an ownership interest in a company or asset after all debts and liabilities are paid off.'},
  {k:'emergency fund', d:'A pool of money saved to cover unexpected expenses or a period of unemployment.'},
  {k:'APY', d:'Annual Percentage Yield; the real rate of return earned on an investment, considering the effect of compounding interest.'},
  {k:'fixed deposit', d:'A financial instrument provided by banks which provides investors with a higher rate of interest than a regular savings account.'},
  {k:'SIP', d:'Systematic Investment Plan; a method of investing a fixed sum of money regularly in a mutual fund or stock.'},
  {k:'EMI', d:'Equated Monthly Installment; a fixed payment amount made by a borrower to a lender at a specified date each calendar month.'},
  {k:'insurance', d:'A contract represented by a policy in which an individual receives financial protection or reimbursement against losses from an insurance company.'},
  {k:'risk tolerance', d:'The degree of variability in investment returns that an investor is willing to withstand.'}
];

function getBookmarks(){ return JSON.parse(localStorage.getItem('fw_bookmarks')||'[]'); }
function saveBookmarks(b){ localStorage.setItem('fw_bookmarks', JSON.stringify(b)); }

// Updated renderTerms to render to the appropriate list element based on the page
function renderTerms(filter='', limit=null){ 
  // Determine which list element to use (termsListPage for learning.html, termsList for index.html)
  const out = document.getElementById('termsListPage') || document.getElementById('termsList');
  if(!out) return;
  
  out.innerHTML = '';
  const bookmarks = getBookmarks();
  
  let filteredTerms = TERMS.filter(t=>t.k.includes(filter.toLowerCase()));
  
  // Apply limit only if the target is the index.html list AND no search filter is active
  const isIndexPage = out.id === 'termsList';
  if(limit && isIndexPage && filter.length === 0) { 
    filteredTerms = filteredTerms.slice(0, limit);
  }
  
  filteredTerms.forEach(t=>{
    const li = document.createElement('li');
    const isBook = bookmarks.includes(t.k);
    li.innerHTML = `<strong>${t.k}</strong> — ${t.d} <button class="btn bookmark-btn" data-term="${t.k}">${isBook?'Unbookmark':'Bookmark'}</button>`;
    out.appendChild(li);
  });
  out.querySelectorAll('.bookmark-btn').forEach(b=>b.addEventListener('click', e=>{
    const key = e.target.dataset.term;
    const bm = getBookmarks();
    const idx = bm.indexOf(key);
    if(idx===-1) bm.push(key); else bm.splice(idx,1);
    saveBookmarks(bm);
    
    // Determine the current page context to decide whether to re-render with limit
    const currentLimit = document.getElementById('termsListPage') ? null : 4; 
    // Use the correct search input ID based on which page we're on for re-render
    const searchInputId = document.getElementById('termsListPage') ? 'termSearchPage' : 'termSearch';
    renderTerms(document.getElementById(searchInputId)?.value || '', currentLimit);
  }));
}

// Handler for the index.html search bar (which renders a limited list)
document.getElementById('termSearch')?.addEventListener('input', e=>{ 
    renderTerms(e.target.value, 4); 
});

// Demo news with bookmarking
const NEWS = [
  {id:'n1',t:'Digital Rupee Pilot Expands Across Cities', s:'The CBDC (Central Bank Digital Currency) pilot program is now operational in 10 major Indian cities...', img_id:'assets/news-n1.png'},
  {id:'n2',t:'UPI Hits New Record for Monthly Transactions', s:'The unified payments interface recorded a massive surge, crossing a billion transactions in the last month...', img_id:'assets/news-n2.png'},
  {id:'n3',t:'New FinTech Startup Focuses on Gen Z Savings', s:'A Bangalore-based startup launched a micro-savings app targeting young professionals and students...', img_id:'assets/news-n3.png'},
  {id:'n4',t:'AI-Driven Credit Scoring Gains Traction', s:'More lenders are adopting AI models to assess risk, moving beyond traditional credit reports...', img_id:'assets/news-n4.png'},
  {id:'n5',t:'Embedded Finance Disrupts E-commerce', s:'Buy Now Pay Later (BNPL) options are becoming standard at online checkouts, blurring lines between finance and retail...', img_id:'assets/news-n5.png'},
  {id:'n6',t:'Regulatory Sandbox for Web3 Finance Launched', s:'Government initiates a dedicated environment for testing blockchain-based financial products under supervision...', img_id:'assets/news-n6.png'},
  {id:'n7',t:'Rise of Robo-Advisors for Millennial Investors', s:'Automated investment platforms offer low-cost portfolio management, democratizing access to wealth building...', img_id:'assets/news-n7.png'},
  {id:'n8',t:'Cybersecurity Concerns Spike in Mobile Banking', s:'New zero-day vulnerabilities force banks to update authentication protocols and security layers...', img_id:'assets/news-n8.png'},
  {id:'n9',t:'Personalized Insurance Pricing Using Telematics', s:'InsurTech firms are leveraging data from devices to offer dynamic, personalized premium pricing...', img_id:'assets/news-n9.png'},
  {id:'n10',t:'FinTech Mergers and Acquisitions Reach Record Highs', s:'Consolidation driven by a need for scale and diversification in the competitive financial technology landscape...', img_id:'assets/news-n10.png'}
];

function renderNews(limit=null){ // Added limit parameter
  // Target the appropriate list element based on the page
  const el = document.getElementById('newsListPage') || document.getElementById('newsList');
  if(!el) return;
  
  const bm = getBookmarks();
  el.innerHTML = '';
  
  let newsToRender = NEWS;

  // Apply limit only if the target is the index.html list
  const isIndexPage = el.id === 'newsList';
  if(limit && isIndexPage) { 
    newsToRender = newsToRender.slice(0, limit);
  }

  newsToRender.forEach(n=>{
    const c = document.createElement('div');
    c.className = 'card news-card-with-img';
    const isB = bm.includes(n.id);
    
    // Inject the image at the top of the card
    // Added onerror fallback in case the image is not yet available in assets
    const imageHtml = n.img_id ? `<div class="news-image-container"><img src="${n.img_id}" alt="${n.t}" class="news-image" onerror="this.onerror=null;this.src='assets/placeholder.webp';" /></div>` : '';

    c.innerHTML = `
        ${imageHtml}
        <div class="news-content">
            <h4>${n.t} <button class="btn bookmark-btn" data-news="${n.id}">${isB?'Unbookmark':'Bookmark'}</button></h4>
            <p class="muted">${n.s}</p>
        </div>
    `;
    el.appendChild(c);
  });
  el.querySelectorAll('[data-news]').forEach(b=>b.addEventListener('click', e=>{
    const id = e.target.dataset.news; const bm = getBookmarks(); const idx = bm.indexOf(id);
    if(idx===-1) bm.push(id); else bm.splice(idx,1); saveBookmarks(bm); 
    
    // Re-render, applying the limit only if on the index page
    const currentLimit = document.getElementById('newsList') ? 3 : null;
    renderNews(currentLimit);
  }));
}

// Savings goals
function getGoals(){ return JSON.parse(localStorage.getItem('fw_goals')||'[]'); }
function saveGoals(g){ localStorage.setItem('fw_goals', JSON.stringify(g)); }

function renderGoals(){
  const el = document.getElementById('goalsList'); if(!el) return;
  const goals = getGoals(); el.innerHTML='';
  goals.forEach((g, i)=>{
    const li = document.createElement('li');
    const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
    li.innerHTML = `<strong>${g.name}</strong> — ₹ ${g.saved.toFixed(2)} / ₹ ${g.target.toFixed(2)}<div class="progress"><i style="width:${percent}%"></i></div>`;
    el.appendChild(li);
  });
}

document.getElementById('addGoalBtn')?.addEventListener('click', ()=>{
  const name=document.getElementById('goalName').value; const target=Number(document.getElementById('goalTarget').value)||0; const saved=Number(document.getElementById('goalSaved').value)||0;
  if(!name||target<=0){ alert('Provide valid name and target'); return; }
  const g = getGoals(); g.push({name,target,saved}); saveGoals(g); renderGoals(); document.getElementById('goalForm')?.reset();
});

// Basic analytics: expense totals and category breakdown
function expenseAnalyticsForUser(arr){
  const total = arr.reduce((s,a)=>s+Number(a.amount),0);
  const byCat = arr.reduce((acc,a)=>{ acc[a.category]=(acc[a.category]||0)+Number(a.amount); return acc; },{});
  return {total,byCat,count:arr.length};
}

// expose renderers
window.FW = { renderTerms, renderNews, renderGoals, renderExpenses, expenseAnalyticsForUser, calcCompound, TERMS, NEWS };

// init on pages
renderExpenses(); 
// Init index.html terms with a limit (e.g., first 4 terms)
if(document.getElementById('termsList') && !document.getElementById('termsListPage')) {
    renderTerms('', 4); 
}
// Init news rendering. Use a limit of 3 for index.html (where newsList exists)
if(document.getElementById('newsList') && !document.getElementById('newsListPage')) {
    renderNews(3);
} else if (document.getElementById('newsListPage')) {
    renderNews(null); // Full list for news.html
}

renderGoals();