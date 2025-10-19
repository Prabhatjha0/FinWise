// learning.js — page-specific logic for the Learning Hub
// UPGRADED with category filters and detailed bookmarks.

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('termSearchPage');
    const termsList = document.getElementById('termsListPage');
    const bookmarksContainer = document.getElementById('myBookmarks');
    const categoryFiltersContainer = document.getElementById('category-filters');

    let currentFilter = {
        category: 'All',
        search: ''
    };

    // --- 1. RENDER CATEGORY FILTERS ---
    function renderCategoryFilters() {
        const categories = ['All', ...window.FW.CATEGORIES];
        categoryFiltersContainer.innerHTML = categories.map(cat =>
            `<button class="btn filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>`
        ).join('');

        // Add event listeners to new buttons
        categoryFiltersContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update state
                currentFilter.category = btn.dataset.category;
                // Update UI
                categoryFiltersContainer.querySelector('.active').classList.remove('active');
                btn.classList.add('active');
                // Re-render the list
                renderFilteredTerms();
            });
        });
    }

    // --- 2. RENDER THE MAIN LIST OF TERMS ---
    function renderFilteredTerms() {
        const { category, search } = currentFilter;
        const allTerms = window.FW.TERMS;
        const bookmarks = DUMMY_API.getBookmarks();

        // Apply filters
        const filteredTerms = allTerms.filter(term => {
            const matchesCategory = category === 'All' || term.c === category;
            const matchesSearch = search === '' || term.k.toLowerCase().includes(search.toLowerCase()) || term.d.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // Render to the DOM
        if (filteredTerms.length === 0) {
            termsList.innerHTML = `<li class="card muted" style="text-align:center;">No terms found matching your criteria.</li>`;
            return;
        }

        termsList.innerHTML = filteredTerms.map(t => {
            const isBookmarked = bookmarks.includes(t.k);
            return `
                <li class="card term-item">
                    <div class="term-content">
                        <strong>${t.k}</strong>
                        <p class="muted small">${t.d}</p>
                    </div>
                    <button class="btn bookmark-btn" data-term-key="${t.k}" aria-label="Bookmark ${t.k}">
                        ${isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                </li>
            `;
        }).join('');
    }

    // --- 3. RENDER THE DETAILED BOOKMARKS SECTION ---
    function renderBookmarks() {
        const allTerms = window.FW.TERMS;
        const bookmarkKeys = DUMMY_API.getBookmarks();
        
        if (bookmarkKeys.length === 0) {
            bookmarksContainer.innerHTML = `<p class="muted small">You haven't bookmarked any terms yet. Click the bookmark button on any term to save it here for quick reference.</p>`;
            return;
        }
        
        const bookmarkedTerms = allTerms.filter(term => bookmarkKeys.includes(term.k));

        bookmarksContainer.innerHTML = bookmarkedTerms.map(t => `
            <div class="bookmark-item">
                <strong>${t.k}</strong>
                <p class="muted small">${t.d}</p>
            </div>
        `).join('');
    }

    // --- 4. EVENT LISTENERS ---
    // Search input listener
    searchInput.addEventListener('input', () => {
        currentFilter.search = searchInput.value;
        renderFilteredTerms();
    });

    // Event delegation for bookmark buttons on the main list
    termsList.addEventListener('click', (e) => {
        if (e.target.matches('.bookmark-btn')) {
            const termKey = e.target.dataset.termKey;
            DUMMY_API.toggleBookmark(termKey);
            showToast(DUMMY_API.getBookmarks().includes(termKey) ? `"${termKey}" bookmarked!` : `"${termKey}" bookmark removed.`);
            
            // Re-render everything to update state
            renderFilteredTerms();
            renderBookmarks();
        }
    });

    // --- 5. INITIAL LOAD ---
    renderCategoryFilters();
    renderFilteredTerms();
    renderBookmarks();
});