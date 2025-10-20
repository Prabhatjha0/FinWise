// scripts/api.js
// A centralized module for managing all app data (demo using localStorage).
// UPDATED with more months of data and reduced expense amounts.

const DUMMY_API = (() => {
  const getActiveUser = () => localStorage.getItem('fw_session');

  // --- Demo Mode Management ---
  const isDemoMode = () => {
    const session = getActiveUser();
    return localStorage.getItem(`fw_is_demo_${session}`) === 'true';
  };

  const clearDemoData = () => {
    const session = getActiveUser();
    if (!session) return;
    localStorage.setItem(`fw_expenses_${session}`, '[]');
    localStorage.setItem(`fw_goals_${session}`, '[]');
    localStorage.removeItem(`fw_is_demo_${session}`);
  };

  // --- UPDATED SAMPLE DATA ---
  const getSampleData = () => {
    // Generates realistic data for June - October 2025 with lower amounts
    const now = new Date('2025-10-19T10:00:00'); // Set a fixed "today" for consistency
    const sampleExpenses = [
      // June 2025
      { desc: 'Rent Share', amount: 7000, category: 'Bills', date: new Date('2025-06-05T10:00:00').toISOString() },
      { desc: 'Weekly Groceries', amount: 1800, category: 'Food', date: new Date('2025-06-10T19:00:00').toISOString() },
      { desc: 'Bus Pass', amount: 300, category: 'Transport', date: new Date('2025-06-12T08:30:00').toISOString() },
      { desc: 'Coffee Meetup', amount: 450, category: 'Entertainment', date: new Date('2025-06-18T16:00:00').toISOString() },
      { desc: 'Stationery', amount: 250, category: 'Education', date: new Date('2025-06-25T11:00:00').toISOString() },

      // July 2025
      { desc: 'Rent Share', amount: 7000, category: 'Bills', date: new Date('2025-07-05T10:05:00').toISOString() },
      { desc: 'Groceries', amount: 2000, category: 'Food', date: new Date('2025-07-08T18:00:00').toISOString() },
      { desc: 'Phone Bill', amount: 400, category: 'Bills', date: new Date('2025-07-15T12:00:00').toISOString() },
      { desc: 'Movie Ticket', amount: 350, category: 'Entertainment', date: new Date('2025-07-20T20:30:00').toISOString() },
      { desc: 'Lunch Out', amount: 500, category: 'Food', date: new Date('2025-07-28T13:00:00').toISOString() },

      // August 2025 (Reduced Amounts)
      { desc: 'Rent Share', amount: 7000, category: 'Bills', date: new Date('2025-08-05T11:00:00').toISOString() },
      { desc: 'Groceries', amount: 1500, category: 'Food', date: new Date('2025-08-07T18:30:00').toISOString() },
      { desc: 'Metro Card Recharge', amount: 250, category: 'Transport', date: new Date('2025-08-10T09:00:00').toISOString() },
      { desc: 'Weekend Movie', amount: 400, category: 'Entertainment', date: new Date('2025-08-16T20:00:00').toISOString() },
      { desc: 'Online Course Fee', amount: 1200, category: 'Education', date: new Date('2025-08-22T14:00:00').toISOString() },
      { desc: 'Dinner with Friends', amount: 600, category: 'Food', date: new Date('2025-08-25T21:00:00').toISOString() },

      // September 2025 (Reduced Amounts)
      { desc: 'Rent Share', amount: 7000, category: 'Bills', date: new Date('2025-09-05T11:05:00').toISOString() },
      { desc: 'Groceries & Supplies', amount: 2100, category: 'Food', date: new Date('2025-09-08T19:00:00').toISOString() },
      { desc: 'Fuel for Bike', amount: 500, category: 'Transport', date: new Date('2025-09-12T08:30:00').toISOString() },
      { desc: 'Birthday Gift Purchase', amount: 800, category: 'Other', date: new Date('2025-09-18T12:00:00').toISOString() },
      { desc: 'Concert Entry', amount: 1000, category: 'Entertainment', date: new Date('2025-09-21T18:00:00').toISOString() },
      { desc: 'Electricity Bill', amount: 900, category: 'Bills', date: new Date('2025-09-25T10:00:00').toISOString() },
      { desc: 'Zomato Delivery', amount: 350, category: 'Food', date: new Date('2025-09-28T20:30:00').toISOString() },

      // October 2025 (Reduced Amounts)
      { desc: 'Rent Share', amount: 7000, category: 'Bills', date: new Date('2025-10-05T11:10:00').toISOString() },
      { desc: 'Diwali Shopping Clothes', amount: 2500, category: 'Other', date: new Date('2025-10-10T17:00:00').toISOString() },
      { desc: 'Groceries for Festival Prep', amount: 2200, category: 'Food', date: new Date('2025-10-11T13:00:00').toISOString() },
      { desc: 'Bus Ticket Home (Diwali)', amount: 1500, category: 'Transport', date: new Date('2025-10-14T19:00:00').toISOString() },
      { desc: 'New Earbuds', amount: 1800, category: 'Entertainment', date: new Date('2025-10-17T15:00:00').toISOString() },
      { desc: 'Lunch with Colleagues', amount: 450, category: 'Food', date: new Date('2025-10-18T13:30:00').toISOString() }
    ];
    const sampleGoals = [ // Kept goals the same, but you can adjust these too
        { name: 'Trip to Goa', target: 20000, saved: 8500 },
        { name: 'New Phone Fund', target: 65000, saved: 22000 }
    ];
    return { expenses: sampleExpenses, goals: sampleGoals };
  };

  // --- User Management ---
  const login = (id, pass) => {
    const users = JSON.parse(localStorage.getItem('fw_users') || '{}');
    if (users[id] && users[id].pass === pass) {
      localStorage.setItem('fw_session', id);
      return true;
    }
    return false;
  };
  const signup = (name, id, email, pass) => {
    const users = JSON.parse(localStorage.getItem('fw_users') || '{}');
    if (users[id]) {
      alert('User ID already exists.'); return false;
    }
    users[id] = { name, email, pass, created: new Date().toISOString() };
    localStorage.setItem('fw_users', JSON.stringify(users));
    localStorage.setItem('fw_session', id);
    return true;
  };
  const logout = () => localStorage.removeItem('fw_session');
  const getUserDetails = () => {
      const session = getActiveUser();
      if (!session) return null;
      const users = JSON.parse(localStorage.getItem('fw_users') || '{}');
      return users[session] || { name: session };
  };

  // --- Data Management ---
  // Default Income (Adjust if needed)
  const getIncome = () => Number(localStorage.getItem('fw_income_' + getActiveUser()) || 20000); 
  const setIncome = (income) => localStorage.setItem('fw_income_' + getActiveUser(), income);
  
  const getExpenses = () => JSON.parse(localStorage.getItem(`fw_expenses_${getActiveUser()}`) || '[]');
  const getGoals = () => JSON.parse(localStorage.getItem(`fw_goals_${getActiveUser()}`) || '[]');

  const addExpense = (expense) => {
    const session = getActiveUser();
    if (!session) return;
    // If it's the first real expense, clear demo data
    if (isDemoMode()) { 
      clearDemoData();
    }
    const expenses = getExpenses();
    // Add current date/time to new expenses
    expenses.push({ ...expense, date: new Date().toISOString() }); 
    localStorage.setItem(`fw_expenses_${session}`, JSON.stringify(expenses));
  };
  
  const addGoal = (goal) => {
    const session = getActiveUser();
    if (!session) return;
    if (isDemoMode()) {
      clearDemoData();
    }
    const goals = getGoals();
    goals.push(goal);
    localStorage.setItem(`fw_goals_${session}`, JSON.stringify(goals));
  };

  const importExpenses = (newExpenses) => {
    const session = getActiveUser();
    if (!session) return 0;

    if (isDemoMode()) {
      clearDemoData();
    }

    const existingExpenses = getExpenses();
    // Basic validation for imported expenses
    const expensesToImport = newExpenses.filter(exp => 
        exp.desc && !isNaN(parseFloat(exp.amount)) && exp.category && exp.date
    );

    const updatedExpenses = [...existingExpenses, ...expensesToImport];
    localStorage.setItem(`fw_expenses_${session}`, JSON.stringify(updatedExpenses));

    return expensesToImport.length;
  };
  
  const getBookmarks = () => JSON.parse(localStorage.getItem('fw_bookmarks') || '[]');
  const toggleBookmark = (key) => {
      const bookmarks = getBookmarks();
      const index = bookmarks.indexOf(key);
      if (index === -1) { bookmarks.push(key); } else { bookmarks.splice(index, 1); }
      localStorage.setItem('fw_bookmarks', JSON.stringify(bookmarks));
      return bookmarks;
  };

  // Public Methods
  return {
    getActiveUser, login, signup, logout, getUserDetails,
    getIncome, setIncome, getExpenses, addExpense,
    getGoals, addGoal, getBookmarks, toggleBookmark,
    isDemoMode, getSampleData,
    setupDemo: () => { // Function to load the sample data for a user
        const session = getActiveUser();
        if (!session) return;
        const { expenses, goals } = getSampleData();
        localStorage.setItem(`fw_expenses_${session}`, JSON.stringify(expenses));
        localStorage.setItem(`fw_goals_${session}`, JSON.stringify(goals));
        localStorage.setItem(`fw_is_demo_${session}`, 'true'); // Mark as demo data
    },
    importExpenses
  };
})();