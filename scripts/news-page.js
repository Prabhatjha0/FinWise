// news-page.js — page logic for the News page
document.addEventListener('DOMContentLoaded', ()=>{
  function refreshNews(){ 
    // Call renderNews without a limit (null) to show all articles on the news page
    if(window.FW && window.FW.renderNews) window.FW.renderNews(null); 
    
    document.getElementById('newsBookmarksCount').textContent = (JSON.parse(localStorage.getItem('fw_bookmarks')||'[]').length); 
  }
  refreshNews();
  window.addEventListener('storage', refreshNews);
  
  // add read-more toggles and saved panel
  function wireReadMore(){
    // IMPORTANT: Target cards within newsListPage as app.js now renders there directly
    document.querySelectorAll('#newsListPage .card').forEach((c,i)=>{ 
      const btn = c.querySelector('.bookmark-btn');
      if(btn){ btn.addEventListener('click', ()=>{ const bm=JSON.parse(localStorage.getItem('fw_bookmarks')||'[]'); const id = btn.dataset.news; const idx=bm.indexOf(id); if(idx===-1) bm.push(id); else bm.splice(idx,1); localStorage.setItem('fw_bookmarks', JSON.stringify(bm)); refreshNews(); wireSaved(); }); }
      // create a read more placeholder
      const p = c.querySelector('p'); if(p && p.textContent.length>120){ const short = p.textContent.slice(0,120)+'...'; const more = document.createElement('button'); more.className='btn'; more.textContent='Read more'; const full = p.textContent; p.textContent = short; more.addEventListener('click', ()=>{ if(more.textContent==='Read more'){ p.textContent = full; more.textContent='Show less'; } else { p.textContent = short; more.textContent='Read more'; } }); c.appendChild(more); }
    });
  }
  function wireSaved(){ 
    const savedEl = document.getElementById('savedNews'); 
    const bm = JSON.parse(localStorage.getItem('fw_bookmarks')||'[]'); 
    if(!savedEl) return; 
    if(!bm.length) { savedEl.textContent='No saved articles.'; return; } 
    // Use the NEWS array exposed via window.FW
    const NEWS = window.FW.NEWS || [];
    const items = NEWS.filter(n=>bm.includes(n.id)).map(n=>`<div><strong>${n.t}</strong><div class="muted small">${n.s}</div></div>`).join(''); 
    savedEl.innerHTML = items; 
  }
  // run wire functions after refresh
  setTimeout(()=>{ wireReadMore(); wireSaved(); }, 200);
});