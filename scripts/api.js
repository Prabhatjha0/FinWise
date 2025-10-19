// scripts/api.js
// A centralized module for managing all app data (demo using localStorage).
// UPGRADED with more complex sample data for a better analytics demo.

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

  // --- NEW, MORE COMPLEX SAMPLE DATA ---
  const getSampleData = () => {
    // Generates realistic data for August, September, and October 2025
    const now = new Date('2025-10-19T10:00:00'); // Set a fixed "today" for consistency
    const sampleExpenses = [
      // August 2025
      { desc: 'Rent Payment', amount: 12000, category: 'Bills', date: new Date('2025-08-05T11:00:00').toISOString() },
      { desc: 'Groceries', amount: 3500, category: 'Food', date: new Date('2025-08-07T18:30:00').toISOString() },
      { desc: 'Metro Card Recharge', amount: 500, category: 'Transport', date: new Date('2025-08-10T09:00:00').toISOString() },
      { desc: 'Weekend Movie', amount: 800, category: 'Entertainment', date: new Date('2025-08-16T20:00:00').toISOString() },
      { desc: 'Online Course', amount: 2500, category: 'Education', date: new Date('2025-08-22T14:00:00').toISOString() },
      { desc: 'Dinner Out', amount: 1200, category: 'Food', date: new Date('2025-08-25T21:00:00').toISOString() },

      // September 2025
      { desc: 'Rent Payment', amount: 12000, category: 'Bills', date: new Date('2025-09-05T11:05:00').toISOString() },
      { desc: 'Groceries & Supplies', amount: 4200, category: 'Food', date: new Date('2025-09-08T19:00:00').toISOString() },
      { desc: 'Fuel for Bike', amount: 1000, category: 'Transport', date: new Date('2025-09-12T08:30:00').toISOString() },
      { desc: 'Birthday Gift', amount: 1500, category: 'Other', date: new Date('2025-09-18T12:00:00').toISOString() },
      { desc: 'Concert Tickets', amount: 2200, category: 'Entertainment', date: new Date('2025-09-21T18:00:00').toISOString() },
      { desc: 'Electricity Bill', amount: 1800, category: 'Bills', date: new Date('2025-09-25T10:00:00').toISOString() },
      { desc: 'Zomato Order', amount: 650, category: 'Food', date: new Date('2025-09-28T20:30:00').toISOString() },

      // October 2025 (Current Month)
      { desc: 'Rent Payment', amount: 12000, category: 'Bills', date: new Date('2025-10-05T11:10:00').toISOString() },
      { desc: 'Diwali Shopping', amount: 5500, category: 'Other', date: new Date('2025-10-10T17:00:00').toISOString() },
      { desc: 'Groceries for Festival', amount: 4800, category: 'Food', date: new Date('2025-10-11T13:00:00').toISOString() },
      { desc: 'Travel home for Diwali', amount: 3500, category: 'Transport', date: new Date('2025-10-14T19:00:00').toISOString() },
      { desc: 'New Headphones', amount: 3200, category: 'Entertainment', date: new Date('2025-10-17T15:00:00').toISOString() },
      { desc: 'Lunch with Colleagues', amount: 950, category: 'Food', date: new Date('2025-10-18T13:30:00').toISOString() }
    ];
    const sampleGoals = [
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
  // THIS IS THE MODIFIED LINE
  const getIncome = () => Number(localStorage.getItem('fw_income_' + getActiveUser()) || 150000); 
  const setIncome = (income) => localStorage.setItem('fw_income_' + getActiveUser(), income);
  
  const getExpenses = () => JSON.parse(localStorage.getItem(`fw_expenses_${getActiveUser()}`) || '[]');
  const getGoals = () => JSON.parse(localStorage.getItem(`fw_goals_${getActiveUser()}`) || '[]');

  const addExpense = (expense) => {
    const session = getActiveUser();
    if (!session) return;
    if (isDemoMode()) {
      clearDemoData();
    }
    const expenses = getExpenses();
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
    setupDemo: () => {
        const session = getActiveUser();
        if (!session) return;
        const { expenses, goals } = getSampleData();
        localStorage.setItem(`fw_expenses_${session}`, JSON.stringify(expenses));
        localStorage.setItem(`fw_goals_${session}`, JSON.stringify(goals));
        localStorage.setItem(`fw_is_demo_${session}`, 'true');
    },
    importExpenses
  };
})();