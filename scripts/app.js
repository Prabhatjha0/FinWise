// scripts/app.js
// CORRECTED VERSION: renderTerms and renderNews now use DUMMY_API for bookmarking.

// --- Global Toast Notification Function ---
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
  }
}

// --- Homepage Tool Selector Logic ---
const toolSelector = document.getElementById('toolSelector');
if (toolSelector) {
    toolSelector.addEventListener('change', (e) => {
        const selectedTool = e.target.value;
        document.querySelectorAll('.tool-content').forEach(el => {
            el.style.display = 'none';
        });
        const targetElement = document.getElementById(selectedTool + '-tool');
        if (targetElement) {
            targetElement.style.display = 'block';
        }
    });
    // Trigger change on load to show the first tool
    toolSelector.dispatchEvent(new Event('change'));
}

// --- EXPANDED & CATEGORIZED DEMO DATA ---
const CATEGORIES = ["Basics", "Investing", "Banking", "Loans", "Taxes", "Insurance", "Advanced"];
const TERMS = [
  // Basics
  {k:'asset', d:'A resource with economic value that an individual owns with the expectation that it will provide a future benefit.', c:'Basics'},
  {k:'liability', d:'A financial debt or obligation that arises during business operations.', c:'Basics'},
  {k:'net worth', d:'The value of all assets minus the total of all liabilities. It represents your personal wealth.', c:'Basics'},
  {k:'budget', d:'An estimate of income and expenditure for a set period of time.', c:'Basics'},
  {k:'credit score', d:'A number representing a person’s creditworthiness, based on their financial history.', c:'Basics'},
  {k:'emergency fund', d:'A stash of money set aside to cover financial surprises (like an unexpected medical bill or job loss).', c:'Basics'},
  {k:'inflation', d:'The rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling.', c:'Basics'},
  {k:'financial goal', d:'A specific, measurable, and time-bound objective you aim to achieve with your money.', c:'Basics'},
  {k:'cash flow', d:'The total amount of money being transferred into and out of a business or household.', c:'Basics'},
  {k:'liquidity', d:'The ease with which an asset can be converted into ready cash without affecting its market price.', c:'Basics'},

  // Investing
  {k:'compound interest', d:'Interest calculated on the initial principal, which also includes all of the accumulated interest from previous periods.', c:'Investing'},
  {k:'mutual fund', d:'An investment vehicle made up of a pool of money collected from many investors to invest in securities like stocks and bonds.', c:'Investing'},
  {k:'SIP', d:'Systematic Investment Plan; a method of investing a fixed sum regularly in a mutual fund or stock.', c:'Investing'},
  {k:'diversification', d:'A risk management strategy that mixes a wide variety of investments within a portfolio.', c:'Investing'},
  {k:'equity', d:'Represents the amount of money that would be returned to a company’s shareholders if all of the assets were liquidated.', c:'Investing'},
  {k:'stock', d:'A security that represents the ownership of a fraction of a corporation.', c:'Investing'},
  {k:'bond', d:'A fixed-income instrument that represents a loan made by an investor to a borrower (typically corporate or governmental).', c:'Investing'},
  {k:'portfolio', d:'A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents.', c:'Investing'},
  {k:'risk tolerance', d:'The degree of variability in investment returns that an investor is willing to withstand.', c:'Investing'},
  {k:'bull market', d:'A market in which share prices are rising, encouraging buying.', c:'Investing'},
  {k:'bear market', d:'A market in which prices are falling, encouraging selling.', c:'Investing'},
  {k:'blue-chip stocks', d:'Stocks of large, well-established, and financially sound companies that have operated for many years.', c:'Investing'},
  {k:'capital gain', d:'A profit from the sale of property or an investment.', c:'Investing'},
  {k:'dividend', d:'A sum of money paid regularly by a company to its shareholders out of its profits.', c:'Investing'},
  {k:'index fund', d:'A type of mutual fund with a portfolio constructed to match or track the components of a financial market index, such as the Nifty 50.', c:'Investing'},
  
  // Banking
  {k:'APY', d:'Annual Percentage Yield; the real rate of return earned on an investment, considering the effect of compounding interest.', c:'Banking'},
  {k:'fixed deposit (FD)', d:'A financial instrument provided by banks which provides investors with a higher rate of interest than a regular savings account.', c:'Banking'},
  {k:'recurring deposit (RD)', d:'A special kind of term deposit offered by Indian banks which help people with regular incomes to deposit a fixed amount every month.', c:'Banking'},
  {k:'NEFT', d:'National Electronic Funds Transfer; a nationwide payment system facilitating one-to-one funds transfer.', c:'Banking'},
  {k:'RTGS', d:'Real-Time Gross Settlement; a funds transfer system where money is transferred from one bank to another on a real-time basis.', c:'Banking'},
  {k:'IMPS', d:'Immediate Payment Service; an instant interbank electronic fund transfer service available 24x7.', c:'Banking'},
  {k:'repo rate', d:'The rate at which the central bank of a country (RBI in India) lends money to commercial banks.', c:'Banking'},
  {k:'reverse repo rate', d:'The rate at which the central bank of a country borrows money from commercial banks.', c:'Banking'},
  {k:'savings account', d:'A bank account that earns interest. It is meant for saving money.', c:'Banking'},
  {k:'current account', d:'A type of bank account that is used for frequent transactions and business purposes.', c:'Banking'},
  
  // Loans
  {k:'EMI', d:'Equated Monthly Installment; a fixed payment amount made by a borrower to a lender at a specified date each calendar month.', c:'Loans'},
  {k:'principal', d:'The original sum of money borrowed in a loan, or put into an investment.', c:'Loans'},
  {k:'interest rate', d:'The proportion of a loan that is charged as interest to the borrower, typically expressed as an annual percentage.', c:'Loans'},
  {k:'loan tenure', d:'The duration within which a loan should be fully repaid, including interest.', c:'Loans'},
  {k:'collateral', d:'An asset that a lender accepts as security for a loan.', c:'Loans'},
  {k:'mortgage', d:'A loan used to purchase or maintain a home, land, or other types of real estate.', c:'Loans'},
  {k:'personal loan', d:'An unsecured loan taken by individuals from a bank or a non-banking financial company (NBFC) to meet their personal needs.', c:'Loans'},
  {k:'credit limit', d:'The maximum amount of credit that a financial institution extends to a client.', c:'Loans'},
  
  // Taxes
  {k:'taxation', d:'The levying of tax by a government; money paid as tax.', c:'Taxes'},
  {k:'income tax', d:'Tax levied by a government directly on income, especially an annual tax on personal income.', c:'Taxes'},
  {k:'GST', d:'Goods and Services Tax; an indirect tax used in India on the supply of goods and services.', c:'Taxes'},
  {k:'TDS', d:'Tax Deducted at Source; income tax is deducted at the source from where an individual’s income is generated.', c:'Taxes'},
  {k:'form 16', d:'A certificate issued by an employer that certifies the details of the salary paid and the tax deducted at source.', c:'Taxes'},
  {k:'tax exemption', d:'A monetary exemption which reduces taxable income.', c:'Taxes'},
  {k:'tax deduction', d:'A deduction that lowers a person\'s or organization\'s tax liability by lowering their taxable income.', c:'Taxes'},
  {k:'capital gains tax', d:'A tax on the profit realized on the sale of a non-inventory asset.', c:'Taxes'},
  
  // Insurance
  {k:'insurance', d:'A contract in which an individual receives financial protection against losses from an insurance company.', c:'Insurance'},
  {k:'premium', d:'The amount of money that an individual or business must pay for an insurance policy.', c:'Insurance'},
  {k:'deductible', d:'The amount of money you have to pay out-of-pocket for expenses before your insurance plan starts to pay.', c:'Insurance'},
  {k:'life insurance', d:'Insurance that pays out a sum of money either on the death of the insured person or after a set period.', c:'Insurance'},
  {k:'health insurance', d:'A type of insurance that covers the cost of an insured individual\'s medical and surgical expenses.', c:'Insurance'},
  {k:'term insurance', d:'A type of life insurance policy that provides coverage for a certain period of time or a specified "term" of years.', c:'Insurance'},
  {k:'sum assured', d:'The guaranteed amount that the beneficiary of a life insurance policy will receive in the event of the insured\'s death.', c:'Insurance'},
  
  // Advanced
  {k:'volatility', d:'The degree of variation of a trading price series over time, usually measured by the standard deviation of logarithmic returns.', c:'Advanced'},
  {k:'futures', d:'Financial contracts obligating the buyer to purchase an asset or the seller to sell an asset at a predetermined future date and price.', c:'Advanced'},
  {k:'options', d:'Financial instruments that are derivatives based on the value of underlying securities such as stocks.', c:'Advanced'},
  {k:'hedging', d:'An investment strategy to offset potential losses or gains that may be incurred by a companion investment.', c:'Advanced'},
  {k:'arbitrage', d:'The simultaneous purchase and sale of the same asset in different markets to profit from tiny differences in the asset\'s listed price.', c:'Advanced'},
  {k:'cryptocurrency', d:'A digital or virtual currency that uses cryptography for security.', c:'Advanced'},
  {k:'blockchain', d:'A system of recording information in a way that makes it difficult or impossible to change, hack, or cheat the system.', c:'Advanced'}
];

const NEWS = [ {id:'n1',t:'Digital Rupee Pilot Expands Across Cities', s:'The CBDC (Central Bank Digital Currency) pilot program is now operational in 10 major Indian cities...', img_id:'assets/news-n1.png'}, {id:'n2',t:'UPI Hits New Record for Monthly Transactions', s:'The unified payments interface recorded a massive surge, crossing a billion transactions in the last month...', img_id:'assets/news-n2.png'}, {id:'n3',t:'New FinTech Startup Focuses on Gen Z Savings', s:'A Bangalore-based startup launched a micro-savings app targeting young professionals and students...', img_id:'assets/news-n3.png'}, {id:'n4',t:'AI-Driven Credit Scoring Gains Traction', s:'More lenders are adopting AI models to assess risk, moving beyond traditional credit reports...', img_id:'assets/news-n4.png'}, {id:'n5',t:'Embedded Finance Disrupts E-commerce', s:'Buy Now Pay Later (BNPL) options are becoming standard at online checkouts, blurring lines between finance and retail...', img_id:'assets/news-n5.png'}, {id:'n6',t:'Regulatory Sandbox for Web3 Finance Launched', s:'Government initiates a dedicated environment for testing blockchain-based financial products under supervision...', img_id:'assets/news-n6.png'}, {id:'n7',t:'Rise of Robo-Advisors for Millennial Investors', s:'Automated investment platforms offer low-cost portfolio management, democratizing access to wealth building...', img_id:'assets/news-n7.png'}, {id:'n8',t:'Cybersecurity Concerns Spike in Mobile Banking', s:'New zero-day vulnerabilities force banks to update authentication protocols and security layers...', img_id:'assets/news-n8.png'}, {id:'n9',t:'Personalized Insurance Pricing Using Telematics', s:'InsurTech firms are leveraging data from devices to offer dynamic, personalized premium pricing...', img_id:'assets/news-n9.png'}, {id:'n10',t:'FinTech Mergers and Acquisitions Reach Record Highs', s:'Consolidation driven by a need for scale and diversification in the competitive financial technology landscape...', img_id:'assets/news-n10.png'} ];

// --- Global Render Functions (WITH CORRECTED BOOKMARK LOGIC) ---
function renderTerms(filter = '', limit = null) {
    const out = document.getElementById('termsListPage') || document.getElementById('termsList');
    if (!out) return;
    out.innerHTML = '';
    const bookmarks = DUMMY_API.getBookmarks();
    let filteredTerms = TERMS.filter(t => t.k.toLowerCase().includes(filter.toLowerCase()));
    if (limit && out.id === 'termsList' && filter.length === 0) {
        filteredTerms = filteredTerms.slice(0, limit);
    }
    filteredTerms.forEach(t => {
        const li = document.createElement('li');
        const isBook = bookmarks.includes(t.k);
        li.innerHTML = `<strong>${t.k}</strong> — ${t.d} <button class="btn bookmark-btn" data-term="${t.k}">${isBook ? 'Unbookmark' : 'Bookmark'}</button>`;
        out.appendChild(li);
    });
    out.querySelectorAll('.bookmark-btn').forEach(b => b.addEventListener('click', e => {
        const key = e.target.dataset.term;
        DUMMY_API.toggleBookmark(key); // <-- CORRECTED
        showToast(DUMMY_API.getBookmarks().includes(key) ? 'Bookmarked!' : 'Bookmark removed.'); // <-- CORRECTED
        const currentLimit = document.getElementById('termsListPage') ? null : 4;
        const searchInputId = document.getElementById('termsListPage') ? 'termSearchPage' : 'termSearch';
        renderTerms(document.getElementById(searchInputId)?.value || '', currentLimit);
    }));
}

function renderNews(limit = null) {
    const el = document.getElementById('newsListPage') || document.getElementById('newsList');
    if (!el) return;
    const bm = DUMMY_API.getBookmarks();
    el.innerHTML = '';
    let newsToRender = NEWS;
    if (limit && el.id === 'newsList') {
        newsToRender = newsToRender.slice(0, limit);
    }
    newsToRender.forEach(n => {
        const c = document.createElement('div');
        c.className = 'card news-card-with-img';
        const isB = bm.includes(n.id);
        const imageHtml = n.img_id ? `<div class="news-image-container"><img src="${n.img_id}" alt="${n.t}" class="news-image"/></div>` : '';
        c.innerHTML = `${imageHtml}<div class="news-content"><h4>${n.t} <button class="btn bookmark-btn" data-news="${n.id}">${isB ? 'Unbookmark' : 'Bookmark'}</button></h4><p class="muted">${n.s}</p></div>`;
        el.appendChild(c);
    });
    el.querySelectorAll('[data-news]').forEach(b => b.addEventListener('click', e => {
        const id = e.target.dataset.news;
        DUMMY_API.toggleBookmark(id); // <-- CORRECTED
        showToast(DUMMY_API.getBookmarks().includes(id) ? 'Article bookmarked!' : 'Bookmark removed.'); // <-- CORRECTED
        renderNews(document.getElementById('newsList') ? 3 : null);
    }));
}

// --- Analytics Helper ---
function expenseAnalyticsForUser(arr) {
    const total = arr.reduce((s, a) => s + Number(a.amount), 0);
    const byCat = arr.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + Number(a.amount); return acc; }, {});
    return { total, byCat, count: arr.length };
}

// --- Global Namespace and Initial Calls ---
window.FW = { renderTerms, renderNews, expenseAnalyticsForUser, TERMS, NEWS, CATEGORIES };

// Initial render calls for homepage
if (document.getElementById('termsList')) renderTerms('', 4);
if (document.getElementById('newsList')) renderNews(3);