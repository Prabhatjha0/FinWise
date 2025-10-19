// tools-page.js — page logic for tools
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('calcBtnPage')?.addEventListener('click', ()=>{
    const P = Number(document.getElementById('principalPage').value) || 0;
    const r = Number(document.getElementById('ratePage').value)/100 || 0;
    const t = Number(document.getElementById('yearsPage').value) || 0;
    const A = P * Math.pow(1 + r, t);
    document.getElementById('interestResultPage').textContent = `Future value: ₹ ${A.toFixed(2)}`;
  });
  // currency converter (demo)
  document.getElementById('convBtn')?.addEventListener('click', async ()=>{
    const amount = Number(document.getElementById('convAmount').value) || 0;
    const from = document.getElementById('convFrom').value;
    const to = document.getElementById('convTo').value;
    // For demo: simple static rates or try a free API. We'll use demo rates here.
    const demo = { 'INR':1, 'USD':0.012, 'EUR':0.011 };
    const result = amount * (demo[to] / demo[from]);
    document.getElementById('convResult').textContent = `${amount} ${from} ≈ ${result.toFixed(2)} ${to} (demo rates)`;
  });
});
