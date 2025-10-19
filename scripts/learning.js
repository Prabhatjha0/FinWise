// learning.js — page-specific logic for the Learning Hub
document.addEventListener('DOMContentLoaded', ()=>{
  function refreshTermsPage(filter=''){
    // Call renderTerms directly without a limit (null) to show all terms on this page
    if(window.FW && window.FW.renderTerms) window.FW.renderTerms(filter, null); 
    
    // Update bookmarks count
    const count = JSON.parse(localStorage.getItem('fw_bookmarks')||'[]').length;
    document.getElementById('bookmarksKeep').textContent = count;
    
    // Update bookmarks panel content
    const bmEl = document.getElementById('myBookmarks'); 
    if(bmEl){ 
        const bm = JSON.parse(localStorage.getItem('fw_bookmarks')||'[]'); 
        const allTerms = window.FW?.TERMS || [];
        const bookmarkNames = bm.map(key => {
            const item = allTerms.find(t => t.k === key);
            return item ? item.k : key;
        });
        bmEl.innerHTML = bookmarkNames.length ? bookmarkNames.map(x=>`<div>• ${x}</div>`).join(''):'No bookmarks yet.'; 
    }
  }
  
  // Wire up the search input for learning.html
  document.getElementById('termSearchPage')?.addEventListener('input', e=>{ 
    refreshTermsPage(e.target.value); 
  });
  
  // Initial load of all terms when the page loads
  refreshTermsPage();
});