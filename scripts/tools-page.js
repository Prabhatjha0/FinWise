// scripts/tools-page.js
// CENTRALIZED LOGIC for all financial tools.

// This single 'FinWiseTools' object will manage all calculator logic.
const FinWiseTools = {
    // 1. Compound Interest
    calculateInterest: () => {
        const P = Number(document.getElementById('principal').value) || 0;
        const r = Number(document.getElementById('rate').value) / 100;
        const t = Number(document.getElementById('years').value) || 0;
        const A = P * Math.pow(1 + r, t);
        const resultEl = document.getElementById('interestResult');
        if (resultEl) resultEl.textContent = `Future value: ₹ ${A.toFixed(2)} (Total Interest: ₹ ${(A-P).toFixed(2)})`;
    },

    // 2. Currency Converter
    convertCurrency: () => {
        const amount = Number(document.getElementById('convAmount').value) || 0;
        const from = document.getElementById('convFrom').value;
        const to = document.getElementById('convTo').value;
        const LATEST_RATES_INR = { 'INR': 1, 'USD': 0.01137, 'EUR': 0.0105, 'GBP': 0.009, 'JPY': 1.75, 'AUD': 0.017, 'CAD': 0.015, 'CNY': 0.082, 'AED': 0.042 };
        const result = amount * (LATEST_RATES_INR[to] / LATEST_RATES_INR[from]);
        const resultEl = document.getElementById('convResult');
        if (resultEl) resultEl.textContent = `${amount.toLocaleString('en-IN')} ${from} ≈ ${result.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${to} (demo rates)`;
    },

    // 3. EMI Calculator
    calculateEMI: () => {
        const p = Number(document.getElementById('emiAmount').value) || 0;
        const annualRate = Number(document.getElementById('emiRate').value) || 0;
        const years = Number(document.getElementById('emiYears').value) || 0;
        const resultEl = document.getElementById('emiResult');
        if (p === 0 || annualRate === 0 || years === 0) {
            if(resultEl) resultEl.textContent = "Please enter valid loan details.";
            return;
        }
        const r = annualRate / 12 / 100; // Monthly interest rate
        const n = years * 12; // Total number of months
        const emi = p * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
        const totalPayable = emi * n;
        const totalInterest = totalPayable - p;
        if (resultEl) resultEl.innerHTML = `Monthly EMI: <strong>₹ ${emi.toFixed(2)}</strong><br>Total Interest: ₹ ${totalInterest.toFixed(2)}<br>Total Payable: ₹ ${totalPayable.toFixed(2)}`;
    },

    // 4. Savings Goal Calculator
    calculateSavings: () => {
        const target = Number(document.getElementById('savingsTarget').value) || 0;
        const months = Number(document.getElementById('savingsMonths').value) || 0;
        const resultEl = document.getElementById('savingsResult');
        if (target === 0 || months === 0) {
            if(resultEl) resultEl.textContent = "Please enter a valid target and timeframe.";
            return;
        }
        const monthlySaving = target / months;
        if (resultEl) resultEl.textContent = `You need to save ₹ ${monthlySaving.toFixed(2)} per month to reach your goal.`;
    },

    // A single function to attach all event listeners
    init: () => {
        document.body.addEventListener('click', (e) => {
            const toolAction = e.target.dataset.tool;
            if (!toolAction) return;

            switch (toolAction) {
                case 'calculate-interest':
                    FinWiseTools.calculateInterest();
                    break;
                case 'convert-currency':
                    FinWiseTools.convertCurrency();
                    break;
                case 'calculate-emi':
                    FinWiseTools.calculateEMI();
                    break;
                case 'calculate-savings':
                    FinWiseTools.calculateSavings();
                    break;
            }
        });
    }
};

// Initialize all tool event listeners when the script loads.
FinWiseTools.init();