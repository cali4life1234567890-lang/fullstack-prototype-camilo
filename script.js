// ============================================
// Phase 8: Toast Notifications
// ============================================
function showToast(message, type = 'info') {
  console.log(`[TOAST DEBUG] ${type}: ${message}`);
  
  const container = document.getElementById('toast-container');
  if (!container) {
    // Fallback to alert if toast container not found
    console.warn('[TOAST DEBUG] Toast container not found, using alert');
    alert(message);
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
// ============================================
// End Phase 8
// ============================================

// Global variables
const views = document.querySelectorAll('.view-section');
const loginAlert = document.getElementById('login-alert');
const userEmailDisplay = document.getElementById('user-email-display');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const authLinksLoggedOut = document.getElementById('auth-links-logged-out');
const authLinksLoggedIn = document.getElementById('auth-links-logged-in');
const displayUsername = document.getElementById('display-username');
const linkLogout = document.getElementById('link-logout');
const requestModal = document.getElementById('requestModal');
const itemsContainer = document.getElementById('itemsContainer');

// ============================================
// Phase 4: Data Persistence with localStorage
// ============================================
const STORAGE_KEY = 'ipt_demo_v1';

// Load from localStorage
function loadFromStorage() {
  console.log('[STORAGE DEBUG] loadFromStorage() called');
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (data) {
      const parsed = JSON.parse(data);
      console.log('[STORAGE DEBUG] Data loaded from storage');
      
      // Initialize window.db with loaded data
      window.db = parsed;
      return window.db;
    } else {
      console.log('[STORAGE DEBUG] No data in storage, seeding with default data');
      return seedDefaultData();
    }
  } catch (e) {
    console.error('[STORAGE DEBUG] Error parsing storage data:', e);
    console.log('[STORAGE DEBUG] Corrupt data detected, seeding with default data');
    return seedDefaultData();
  }
}

// Seed default data
function seedDefaultData() {
  console.log('[STORAGE DEBUG] Seeding default data');
  
  window.db = {
    accounts: [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'Password123!',
        verified: true,
        role: 'admin'
      }
    ],
    departments: [
      { name: 'Engineering', description: 'Engineering Department' },
      { name: 'HR', description: 'Human Resources Department' }
    ],
    employees: [],
    requests: []
  };
  
  // Save the seeded data
  saveToStorage();
  console.log('[STORAGE DEBUG] Default data seeded and saved');
  
  return window.db;
}

// Save to localStorage
function saveToStorage() {
  console.log('[STORAGE DEBUG] saveToStorage() called');
  
  if (typeof window.db !== 'undefined') {
    const data = JSON.stringify(window.db);
    localStorage.setItem(STORAGE_KEY, data);
    console.log('[STORAGE DEBUG] Data saved to storage');
  } else {
    console.warn('[STORAGE DEBUG] window.db is undefined, cannot save');
  }
}

console.log('[STORAGE DEBUG] Storage functions defined');

// ============================================
// End Phase 4
// ============================================

// Global variable for current user
let currentUser = null;

// Client-side routing
function navigateTo(hash) {
  window.location.hash = hash;
}

function handleRouting() {
  const hash = window.location.hash || '#/';
  const route = hash.slice(1); // Remove the #
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Define routes
  const publicRoutes = ['/', '/login', '/register', '/verify'];
  const protectedRoutes = ['/profile', '/my-requests'];
  const adminRoutes = ['/employees', '/accounts', '/departments'];
  
  // Check authentication
  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser && currentUser.role === 'admin';
  
  // Route handling
  let showPage = null;
  
  if (route === '/' || route === '') {
    showPage = 'home-page';
  } else if (route === '/login') {
    showPage = 'login-page';
  } else if (route === '/register') {
    showPage = 'register-page';
  } else if (route === '/verify') {
    showPage = 'verify-page';
  } else if (route === '/profile') {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    showPage = 'profile-page';
    renderProfile();  // Phase 5: Render profile on navigation
  } else if (route === '/my-requests') {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    showPage = 'myrequests-page';
    loadRequests();
  } else if (adminRoutes.includes(route)) {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (!isAdmin) {
      navigateTo('/profile');
      return;
    }
    if (route === '/employees') {
      showPage = 'employees-page';
      loadEmployees();
    } else if (route === '/accounts') {
      showPage = 'accounts-page';
      renderAccountsList();
    } else if (route === '/departments') {
      showPage = 'departments-page';
      renderDepartmentsList();
    }
  } else {
    showPage = 'home-page';
  }
  
  // Show the matching page
  if (showPage) {
    const pageElement = document.getElementById(showPage);
    if (pageElement) {
      pageElement.classList.add('active');
    }
  }
  
  // Handle login alert
  if (loginAlert) {
    if (showPage === 'login-page' && sessionStorage.getItem('showVerifiedAlert') === 'true') {
      loginAlert.classList.remove('d-none');
      sessionStorage.removeItem('showVerifiedAlert');
    } else {
      loginAlert.classList.add('d-none');
    }
  }
}

// Listen for hash changes
window.addEventListener('hashchange', handleRouting);
const adminAccount = {
  email: "admin@example.com",
  password: "Admin"
};

// View management
function showView(viewId, showVerifiedAlert = false) {
  views.forEach(view => view.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');

  if (loginAlert) {
    if (viewId === 'login-view' && showVerifiedAlert === true) {
      loginAlert.classList.remove('d-none');
    } else {
      loginAlert.classList.add('d-none');
    }
  }
}

// Persistent Login Check
console.log('[AUTH DEBUG] Setting up DOMContentLoaded listener');
window.addEventListener('DOMContentLoaded', () => {
  console.log('[AUTH DEBUG] DOMContentLoaded fired');
  
  // ============================================
  // Phase 4: Initialize storage and load data
  // ============================================
  console.log('[STORAGE DEBUG] Calling loadFromStorage()');
  loadFromStorage();
  console.log('[STORAGE DEBUG] window.db after load:', window.db);
  // ============================================
  // End Phase 4
  // ============================================
  
  // Check for existing auth_token and restore auth state
  const authToken = localStorage.getItem('auth_token');
  console.log('[AUTH DEBUG] Found auth_token:', authToken);
  
  // Use window.db.accounts (from loadFromStorage)
  const accounts = window.db.accounts || [];
  const adminEmail = 'admin@example.com';
  
  // Check if admin exists (backup - should already be seeded)
  if (!accounts.find(a => a.email === adminEmail)) {
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: 'Password123!',
      verified: true,
      role: 'admin'
    };
    accounts.push(adminUser);
    window.db.accounts = accounts;
    saveToStorage();
    console.log('[AUTH DEBUG] Created admin account');
  }
  
  if (authToken) {
    const account = accounts.find(a => a.email === authToken);
    if (account) {
      console.log('[AUTH DEBUG] Restoring session for:', account.email);
      currentUser = account;
      setAuthState(true, account);
    } else {
      console.log('[AUTH DEBUG] auth_token invalid, clearing');
      localStorage.removeItem('auth_token');
    }
  }
  
  // Set default hash if empty
  if (!window.location.hash) {
    window.location.hash = '#/';
  }
  
  // Initialize routing
  handleRouting();
  
  // Initialize department dropdown for employees
  updateEmployeeDeptDropdown();
  
  console.log('[AUTH DEBUG] Initialization complete');
});

// Navigation Listeners - Using hash-based routing
document.getElementById('link-login').onclick = (e) => { e.preventDefault(); navigateTo('/login'); };
document.getElementById('link-register').onclick = (e) => { e.preventDefault(); navigateTo('/register'); };
document.getElementById('btn-get-started').onclick = (e) => { e.preventDefault(); navigateTo('/register'); };
document.getElementById('btn-cancel-reg').onclick = (e) => { e.preventDefault(); navigateTo('/'); };

// Profile Link
const linkProfile = document.getElementById('link-profile');
if (linkProfile) {
  linkProfile.onclick = (e) => {
    e.preventDefault();
    navigateTo('/profile');
  };
}

// Accounts Link
const linkAccounts = document.getElementById('link-accounts');
if (linkAccounts) {
  linkAccounts.onclick = (e) => {
    e.preventDefault();
    navigateTo('/accounts');
    renderAccountTable();
  };
}

// Departments Link
const linkDepartments = document.getElementById('link-departments');
if (linkDepartments) {
  linkDepartments.onclick = (e) => {
    e.preventDefault();
    navigateTo('/departments');
    renderDeptTable();
  };
}

// My Requests Link
const linkMyRequests = document.getElementById('link-my-requests');
if (linkMyRequests) {
  linkMyRequests.onclick = (e) => {
    e.preventDefault();
    navigateTo('/my-requests');
    loadRequests();
  };
}

const btnCancelLogin = document.getElementById('btn-cancel-login');
if (btnCancelLogin) btnCancelLogin.onclick = (e) => { e.preventDefault(); navigateTo('/'); };

const btnGoLogin = document.getElementById('btn-go-login');
if (btnGoLogin) btnGoLogin.onclick = (e) => { e.preventDefault(); navigateTo('/login'); };

// Registration Logic
console.log('[AUTH DEBUG] Registration form submitted');
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPass').value;
  
  console.log('[AUTH DEBUG] Registration attempt for email:', email);
  console.log('[AUTH DEBUG] Password length:', password.length);
  
  // Validate password minimum 6 characters
  if (password.length < 6) {
    showToast('Password must be at least 6 characters!', 'error');
    console.log('[AUTH DEBUG] Password validation failed');
    return;
  }
  
  // Check for window.db.accounts existence
  console.log('[AUTH DEBUG] window.db.accounts exists:', typeof window.db !== 'undefined' && typeof window.db.accounts !== 'undefined');
  
  // Use window.db.accounts or fallback to localStorage
  let accounts = [];
  if (typeof window.db !== 'undefined' && Array.isArray(window.db.accounts)) {
    accounts = window.db.accounts;
  } else {
    accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    console.log('[AUTH DEBUG] Using localStorage.accounts, count:', accounts.length);
  }

  // Check if email already exists
  if (accounts.find(a => a.email === email)) {
    showToast('Email already registered!', 'error');
    console.log('[AUTH DEBUG] Email already exists');
    return;
  }

  // Create new account with verified: false
  const newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    verified: false,
    role: 'user'
  };
  
  console.log('[AUTH DEBUG] New account created:', { ...newUser, password: '***' });

  accounts.push(newUser);
  
  // Save to window.db.accounts if available, otherwise localStorage
  if (typeof window.db !== 'undefined' && Array.isArray(window.db.accounts)) {
    window.db.accounts = accounts;
  } else {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
  
  // Save to storage using new method
  saveToStorage();
  console.log('[STORAGE DEBUG] Account created, saved to storage');
  
  // Store unverified email for verification flow
  localStorage.setItem('unverified_email', email);
  console.log('[AUTH DEBUG] Stored unverified_email:', email);

  if (userEmailDisplay) userEmailDisplay.textContent = email;
  console.log('[AUTH DEBUG] Navigating to /verify');
  navigateTo('/verify');
});

// Simulation Button - Email Verification
console.log('[AUTH DEBUG] Setting up verify button listener');
const btnSimulateVerify = document.getElementById('btn-simulate-verify');
if (btnSimulateVerify) {
  btnSimulateVerify.addEventListener('click', () => {
    console.log('[AUTH DEBUG] Simulate verification clicked');
    
    // Get unverified email
    const unverifiedEmail = localStorage.getItem('unverified_email');
    console.log('[AUTH DEBUG] Retrieved unverified_email:', unverifiedEmail);
    
    if (!unverifiedEmail) {
      alert('No pending verification email found!');
      console.log('[AUTH DEBUG] ERROR: No unverified_email found');
      return;
    }
    
    // Find account and set verified: true
    let accounts = [];
    if (typeof window.db !== 'undefined' && Array.isArray(window.db.accounts)) {
      accounts = window.db.accounts;
    } else {
      accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    }
    
    console.log('[AUTH DEBUG] Searching for account:', unverifiedEmail);
    const accountIndex = accounts.findIndex(a => a.email === unverifiedEmail);
    console.log('[AUTH DEBUG] Account index found:', accountIndex);
    
    if (accountIndex !== -1) {
      accounts[accountIndex].verified = true;
      console.log('[AUTH DEBUG] Account verified:', { ...accounts[accountIndex], password: '***' });
      
      // Save to storage
      if (typeof window.db !== 'undefined' && Array.isArray(window.db.accounts)) {
        window.db.accounts = accounts;
      } else {
        localStorage.setItem('accounts', JSON.stringify(accounts));
      }
      
      // Save using new storage method
      saveToStorage();
      console.log('[STORAGE DEBUG] Account verified, saved to storage');
      
      // Clear unverified_email
      localStorage.removeItem('unverified_email');
      console.log('[AUTH DEBUG] Cleared unverified_email');
      
      // Set flag for login page
      sessionStorage.setItem('showVerifiedAlert', 'true');
      console.log('[AUTH DEBUG] Set showVerifiedAlert, navigating to /login');
      navigateTo('/login');
    } else {
      console.log('[AUTH DEBUG] ERROR: Account not found for email:', unverifiedEmail);
      alert('Account not found!');
    }
  });
}

// Login Logic
console.log('[AUTH DEBUG] Setting up login form listener');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    console.log('[AUTH DEBUG] Login attempt for email:', email);
    
    // Use window.db.accounts or fallback to localStorage
    let accounts = [];
    if (typeof window.db !== 'undefined' && Array.isArray(window.db.accounts)) {
      accounts = window.db.accounts;
    } else {
      accounts = JSON.parse(localStorage.getItem('accounts')) || [];
      console.log('[AUTH DEBUG] Using localStorage.accounts, count:', accounts.length);
    }

    // Find account with matching email, password, AND verified: true
    const user = accounts.find(a => a.email === email && a.password === password && a.verified === true);
    console.log('[AUTH DEBUG] User found:', user ? { ...user, password: '***' } : 'null');
    
    if (user) {
      // Save auth_token = email in localStorage
      localStorage.setItem('auth_token', email);
      console.log('[AUTH DEBUG] auth_token saved:', email);
      
      // Call setAuthState(true, user)
      setAuthState(true, user);
      console.log('[AUTH DEBUG] setAuthState called, navigating to /profile');
      navigateTo('/profile');
    } else {
      // Check if user exists but not verified
      const unverifiedUser = accounts.find(a => a.email === email && a.password === password);
      if (unverifiedUser && unverifiedUser.verified === false) {
        console.log('[AUTH DEBUG] User exists but not verified');
        showToast('Please verify your email first!', 'warning');
      } else {
        console.log('[AUTH DEBUG] Invalid credentials');
        showToast('Invalid email or password!', 'error');
      }
    }
  });
}

// UI Update Function
function updateUIForLoggedInUser(user) {
  authLinksLoggedOut.classList.add('d-none');
  authLinksLoggedIn.classList.remove('d-none');
  displayUsername.textContent = user.firstName;

  // Populate Profile View
  document.getElementById('profile-name-display').textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById('profile-email-display').textContent = user.email;
  document.getElementById('profile-role-display').textContent = user.role;

  // Update body classes for role-based visibility
  document.body.classList.remove('not-authenticated');
  document.body.classList.add('authenticated');
  if (user.role.toLowerCase() === 'admin') {
    document.body.classList.add('is-admin');
  }
}

// Auth State Management - Set Auth State Function
console.log('[AUTH DEBUG] Defining setAuthState function');
function setAuthState(isAuth, user) {
  console.log('[AUTH DEBUG] setAuthState called:', { isAuth, user: user ? { ...user, password: '***' } : null });
  
  if (isAuth && user) {
    // Update currentUser
    currentUser = user;
    
    // Toggle body classes
    document.body.classList.remove('not-authenticated');
    document.body.classList.add('authenticated');
    
    // If admin, add is-admin class
    if (user.role && user.role.toLowerCase() === 'admin') {
      document.body.classList.add('is-admin');
      console.log('[AUTH DEBUG] Admin role detected, adding is-admin class');
    } else {
      document.body.classList.remove('is-admin');
    }
    
    // Update UI for logged in user
    authLinksLoggedOut.classList.add('d-none');
    authLinksLoggedIn.classList.remove('d-none');
    displayUsername.textContent = user.firstName;
    
    // Populate Profile View
    document.getElementById('profile-name-display').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-email-display').textContent = user.email;
    document.getElementById('profile-role-display').textContent = user.role;
    
    console.log('[AUTH DEBUG] Auth state set to authenticated');
  } else {
    // Logout - clear auth state
    currentUser = null;
    
    // Clear auth_token
    localStorage.removeItem('auth_token');
    console.log('[AUTH DEBUG] Removed auth_token');
    
    // Toggle body classes
    document.body.classList.remove('authenticated', 'is-admin');
    document.body.classList.add('not-authenticated');
    
    // Update UI for logged out user
    authLinksLoggedOut.classList.remove('d-none');
    authLinksLoggedIn.classList.add('d-none');
    
    console.log('[AUTH DEBUG] Auth state set to not authenticated');
  }
}

// ============================================
// Phase 5: Profile Page
// ============================================
console.log('[PROFILE DEBUG] Defining renderProfile function');
function renderProfile() {
  console.log('[PROFILE DEBUG] renderProfile() called');
  
  if (!currentUser) {
    console.log('[PROFILE DEBUG] No currentUser, redirecting to login');
    navigateTo('/login');
    return;
  }
  
  // Display user's name, email, role
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email-display');
  const roleDisplay = document.getElementById('profile-role-display');
  
  if (nameDisplay) {
    nameDisplay.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  }
  if (emailDisplay) {
    emailDisplay.textContent = currentUser.email;
  }
  if (roleDisplay) {
    roleDisplay.textContent = currentUser.role || 'user';
  }
  
  console.log('[PROFILE DEBUG] Profile rendered for:', currentUser.email);
}

// Reset Data Function - Call in browser console: resetAppData()
window.resetAppData = function() {
  console.log('[APP RESET] Clearing all app data...');
  localStorage.removeItem('ipt_demo_v1');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('unverified_email');
  sessionStorage.clear();
  alert('App data reset! Refresh the page to re-initialize.');
  console.log('[APP RESET] Data cleared. Please refresh the page.');
};

// Edit Profile button handler
const btnEditProfile = document.getElementById('btn-edit-profile');
if (btnEditProfile) {
  btnEditProfile.onclick = (e) => {
    e.preventDefault();
    console.log('[PROFILE DEBUG] Edit Profile clicked');
    alert('Edit Profile functionality coming soon!\n\nYou can update your profile details in a future version.');
  };
}
// ============================================
// End Phase 5
// ============================================

// Logout Logic
console.log('[AUTH DEBUG] Setting up logout listener');
if (linkLogout) {
  linkLogout.onclick = (e) => {
    e.preventDefault();
    console.log('[AUTH DEBUG] Logout clicked');
    
    // Call setAuthState(false)
    setAuthState(false);
    
    console.log('[AUTH DEBUG] Navigating to /');
    navigateTo('/');
  };
}

// Employees Dropdown Link
const employeesLink = document.querySelector('.role-admin .dropdown-item[href="#"]');
document.querySelectorAll('.role-admin .dropdown-item').forEach(item => {
  if (item.textContent === 'Employees') {
    item.onclick = (e) => {
      e.preventDefault();
      navigateTo('/employees');
      loadEmployees();
      updateEmployeeDeptDropdown();
    };
  }
});

// Add Employee Button
const btnAddEmployee = document.getElementById('btn-add-employee');
if (btnAddEmployee) {
  btnAddEmployee.onclick = () => {
    document.getElementById('employeeModalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('empId').removeAttribute('data-edit-id');
    editIndex = -1;  // Reset edit index
    updateEmployeeDeptDropdown();
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  };
}

// Save Employee
const btnSaveEmployee = document.getElementById('btn-save-employee');
if (btnSaveEmployee) {
  btnSaveEmployee.onclick = () => {
    const employee = {
      id: document.getElementById('empId').value,
      name: document.getElementById('empName').value,
      email: document.getElementById('empEmail').value,
      position: document.getElementById('empPosition').value,
      dept: document.getElementById('empDept').value,
      hireDate: document.getElementById('empHireDate').value
    };

    if (!employee.id || !employee.name || !employee.position) {
      alert('Please fill in required fields!');
      return;
    }

    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const editId = document.getElementById('empId').getAttribute('data-edit-id');
    
    if (editId) {
      const index = employees.findIndex(e => e.id === editId);
      if (index !== -1) employees[index] = employee;
    } else {
      employees.push(employee);
    }

    localStorage.setItem('employees', JSON.stringify(employees));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
    modal.hide();
    
    loadEmployees();
  };
}

// Load Employees Table
function loadEmployees() {
  // Use window.db.employees
  const employees = window.db.employees || [];
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  
  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No employees.</td></tr>';
    return;
  }

  // Get department names for display
  const departments = window.db.accounts || [];
  const deptMap = {};
  if (window.db.departments) {
    window.db.departments.forEach(d => deptMap[d.name] = d.name);
  }

  tbody.innerHTML = employees.map(emp => {
    const deptName = emp.dept || '-';
    return `
    <tr>
      <td>${emp.id}</td>
      <td>${emp.email || '-'}</td>
      <td>${emp.position}</td>
      <td>${deptName}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editEmployee('${emp.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    </tr>
  `}).join('');
}

// Render Employees Table (alias for loadEmployees)
function renderEmployeesTable() {
  loadEmployees();
}

// Edit Employee
window.editEmployee = function(id) {
  const employees = window.db.employees || [];
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
  document.getElementById('empId').value = emp.id;
  document.getElementById('empId').setAttribute('data-edit-id', emp.id);
  document.getElementById('empEmail').value = emp.email || '';
  document.getElementById('empPosition').value = emp.position || '';
  updateEmployeeDeptDropdown();
  document.getElementById('empDept').value = emp.dept || '';
  document.getElementById('empHireDate').value = emp.hireDate || '';

  const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
  modal.show();
};

// Delete Employee
window.deleteEmployee = function(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  
  let employees = window.db.employees || [];
  employees = employees.filter(e => e.id !== id);
  window.db.employees = employees;
  empList = employees;
  saveToStorage();
  console.log('[ADMIN DEBUG] Employee deleted:', id);
  loadEmployees();
};

// Simple Employee Management Functions
let empList = [];
let editIndex = -1;

function showForm() {
    updateEmployeeDeptDropdown();
    document.getElementById('employeeForm').style.display = 'block';
}

function hideEmpForm() {
    document.getElementById('employeeForm').style.display = 'none';
    clearEmpForm();
}

function clearEmpForm() {
    document.getElementById('empId').value = '';
    document.getElementById('empEmail').value = '';
    document.getElementById('empPosition').value = '';
    // Update dropdown with current departments before setting default
    updateEmployeeDeptDropdown();
    const select = document.getElementById('empDept');
    if (select.options.length > 1) {
        select.value = select.options[1].value; // Select first actual department
    }
    document.getElementById('empHireDate').value = '';
    editIndex = -1;
}

function saveEmp() {
    const id = document.getElementById('empId').value;
    const email = document.getElementById('empEmail').value;
    const position = document.getElementById('empPosition').value;
    const dept = document.getElementById('empDept').value;
    const hireDate = document.getElementById('empHireDate').value;

    if (!id || !email || !position || !hireDate) {
        alert('Please fill in all fields.');
        return;
    }

    // Validate: user email must match existing account
    const accounts = window.db.accounts || [];
    const accountExists = accounts.some(a => a.email === email);
    if (!accountExists) {
        alert('User email must match an existing account!');
        return;
    }

    const employee = { id, email, position, dept, hireDate };

    // Use window.db.employees
    if (!window.db.employees) {
        window.db.employees = [];
    }
    
    const employees = window.db.employees;
    const editId = document.getElementById('empId').getAttribute('data-edit-id');
    
    if (editId && editId !== id) {
        // ID changed, delete old record
        const oldIndex = employees.findIndex(e => e.id === editId);
        if (oldIndex !== -1) employees.splice(oldIndex, 1);
    }
    
    // Check if employee with this ID already exists
    const existingIndex = employees.findIndex(e => e.id === id);
    if (existingIndex !== -1) {
        employees[existingIndex] = employee;
    } else {
        employees.push(employee);
    }
    
    // Save to storage
    saveToStorage();
    console.log('[ADMIN DEBUG] Employee saved:', employee);
    
    // Also update local empList for backward compatibility
    empList = window.db.employees;
    
    loadEmployees();
    hideEmpForm();
}

function renderEmpTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (empList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No employees.</td>
            </tr>
        `;
        return;
    }

    empList.forEach((emp, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.email}</td>
                <td>${emp.position}</td>
                <td>${emp.dept}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editEmp(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmp(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function editEmp(index) {
    const emp = empList[index];

    // Update dropdown first to ensure options are available
    updateEmployeeDeptDropdown();
    
    document.getElementById('empId').value = emp.id;
    document.getElementById('empEmail').value = emp.email;
    document.getElementById('empPosition').value = emp.position;
    document.getElementById('empDept').value = emp.dept;
    document.getElementById('empHireDate').value = emp.hireDate;

    editIndex = index;
    showForm();
}

function deleteEmp(index) {
    if (confirm('Are you sure you want to delete this employee?')) {
        // Use window.db.employees
        if (window.db.employees) {
            window.db.employees.splice(index, 1);
            empList = window.db.employees;
        } else {
            empList.splice(index, 1);
        }
        
        // Save to storage
        saveToStorage();
        console.log('[STORAGE DEBUG] Employee deleted, calling saveToStorage()');
        
        renderEmpTable();
    }
}

// Accounts Management Functions
let accountList = [];
let accountEditIndex = -1;

function showAccountForm() {
    document.getElementById('accountForm').style.display = 'block';
}

function addNewAccount() {
    accountEditIndex = -1;
    clearAccountForm();
    showAccountForm();
}

function hideAccountForm() {
    document.getElementById('accountForm').style.display = 'none';
    clearAccountForm();
}

function clearAccountForm() {
    document.getElementById('accountFirstName').value = '';
    document.getElementById('accountLastName').value = '';
    document.getElementById('accountEmail').value = '';
    document.getElementById('accountPassword').value = '';
    document.getElementById('accountRole').value = 'user';
    document.getElementById('accountVerified').checked = false;
    accountEditIndex = -1;
}

function saveAccount() {
    const firstName = document.getElementById('accountFirstName').value;
    const lastName = document.getElementById('accountLastName').value;
    const email = document.getElementById('accountEmail').value;
    const password = document.getElementById('accountPassword').value;
    const role = document.getElementById('accountRole').value;
    const verified = document.getElementById('accountVerified').checked;

    if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all required fields.');
        return;
    }

    const account = { firstName, lastName, email, password, role, verified };

    // Use window.db.accounts
    if (!window.db.accounts) {
        window.db.accounts = [];
    }
    
    if (accountEditIndex === -1) {
        // Add new account
        window.db.accounts.push(account);
    } else {
        // Edit existing account
        window.db.accounts[accountEditIndex] = account;
    }
    
    // Update local accountList for backward compatibility
    accountList = window.db.accounts;
    
    // Save to storage
    saveToStorage();
    console.log('[STORAGE DEBUG] Account saved, calling saveToStorage()');
    
    renderAccountTable();
    hideAccountForm();
}

function renderAccountTable() {
    const tableBody = document.getElementById('accountTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Use window.db.accounts
    const accounts = window.db.accounts || [];
    
    if (accounts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No accounts.</td>
            </tr>
        `;
        return;
    }

    accounts.forEach((account, index) => {
        const isSelf = currentUser && currentUser.email === account.email;
        const deleteBtn = isSelf 
            ? '<span class="text-muted">Cannot delete</span>' 
            : `<button class="btn btn-sm btn-danger" onclick="deleteAccount(${index})">Delete</button>`;
        
        tableBody.innerHTML += `
            <tr>
                <td>${account.firstName} ${account.lastName}</td>
                <td>${account.email}</td>
                <td>${account.role}</td>
                <td>${account.verified ? '✅' : '❌'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editAccount(${index})">Edit</button>
                    <button class="btn btn-sm btn-info" onclick="resetPassword(${index})">Reset PW</button>
                    ${deleteBtn}
                </td>
            </tr>
        `;
    });
}

// Helper function alias as per spec
function renderAccountsList() {
    renderAccountTable();
}

// Reset Password function
function resetPassword(index) {
    const accounts = window.db.accounts || [];
    const account = accounts[index];
    if (!account) return;
    
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }
    
    accounts[index].password = newPassword;
    window.db.accounts = accounts;
    saveToStorage();
    console.log('[ADMIN DEBUG] Password reset for:', account.email);
    alert('Password has been reset!');
}

function editAccount(index) {
    const accounts = window.db.accounts || [];
    const account = accounts[index];
    if (!account) return;

    document.getElementById('accountFirstName').value = account.firstName;
    document.getElementById('accountLastName').value = account.lastName;
    document.getElementById('accountEmail').value = account.email;
    document.getElementById('accountPassword').value = account.password;
    document.getElementById('accountRole').value = account.role;
    document.getElementById('accountVerified').checked = account.verified;

    accountEditIndex = index;
    showAccountForm();
}

function deleteAccount(index) {
    const accounts = window.db.accounts || [];
    const account = accounts[index];
    
    // Prevent self-deletion
    if (currentUser && currentUser.email === account.email) {
        alert('You cannot delete your own account!');
        return;
    }
    
    if (confirm('Are you sure you want to delete this account?')) {
        accounts.splice(index, 1);
        window.db.accounts = accounts;
        saveToStorage();
        console.log('[ADMIN DEBUG] Account deleted:', account.email);
        renderAccountTable();
    }
}

// Departments Management Functions
// Use window.db.departments (initialized by loadFromStorage)
let deptList = [];
if (window.db && window.db.departments) {
    deptList = window.db.departments;
} else {
    deptList = [
        { name: 'Engineering', description: 'Software team' },
        { name: 'HR', description: 'Human Resources' }
    ];
}
let deptEditIndex = -1;

// Save departments to localStorage (and unified storage)
function saveDepartmentsToStorage() {
    // Update window.db.departments
    if (!window.db.departments) {
        window.db.departments = [];
    }
    window.db.departments = deptList;
    
    // Save to unified storage
    saveToStorage();
    console.log('[STORAGE DEBUG] Departments saved, calling saveToStorage()');
}

// Initialize default departments if none exist (now handled by loadFromStorage)
// This block is kept for backward compatibility but loadFromStorage handles it now

function showDeptForm() {
    document.getElementById('departmentForm').style.display = 'block';
    deptEditIndex = -1;
    clearDeptForm();
}

function hideDeptForm() {
    document.getElementById('departmentForm').style.display = 'none';
    clearDeptForm();
}

function clearDeptForm() {
    document.getElementById('deptName').value = '';
    document.getElementById('deptDescription').value = '';
    deptEditIndex = -1;
}

function saveDept() {
    const name = document.getElementById('deptName').value;
    const description = document.getElementById('deptDescription').value;

    if (!name || !description) {
        alert('Please fill all fields.');
        return;
    }

    const dept = { name, description };

    if (deptEditIndex === -1) {
        // Check if department name already exists
        if (deptList.find(d => d.name.toLowerCase() === name.toLowerCase())) {
            alert('Department with this name already exists.');
            return;
        }
        deptList.push(dept);
    } else {
        deptList[deptEditIndex] = dept;
    }

    saveDepartmentsToStorage();
    renderDeptTable();
    updateEmployeeDeptDropdown();
    hideDeptForm();
}

function renderDeptTable() {
    const tableBody = document.getElementById('departmentTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Render list from window.db.departments
    const departments = window.db.departments || [];
    
    if (departments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">No departments.</td>
            </tr>
        `;
        return;
    }

    departments.forEach((dept, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${dept.name}</td>
                <td>${dept.description}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editDept(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDept(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Helper function alias as per spec
function renderDepartmentsList() {
    renderDeptTable();
}

// Add Department - show "Not implemented" alert
function showDeptForm() {
    alert('Add Department is not implemented yet.');
}

function editDept(index) {
    const departments = window.db.departments || [];
    const dept = departments[index];
    if (!dept) return;

    document.getElementById('deptName').value = dept.name;
    document.getElementById('deptDescription').value = dept.description;

    deptEditIndex = index;
    document.getElementById('departmentForm').style.display = 'block';
}

function deleteDept(index) {
    if (confirm('Delete this department?')) {
        const departments = window.db.departments || [];
        departments.splice(index, 1);
        window.db.departments = departments;
        deptList = departments;
        saveToStorage();
        console.log('[ADMIN DEBUG] Department deleted');
        renderDeptTable();
        updateEmployeeDeptDropdown();
    }
}

// Update employee department dropdown with current departments
function updateEmployeeDeptDropdown() {
    const select = document.getElementById('empDept');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Department</option>';
    
    // Use window.db.departments
    const departments = window.db.departments || [];
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        select.appendChild(option);
    });
    
    // Restore selected value if it still exists
    if (currentValue && departments.find(d => d.name === currentValue)) {
        select.value = currentValue;
    }
}

// Persistent Login Check
// ========================
// My Requests Functions
// ========================

function openRequestModal() {
  if (requestModal) {
    requestModal.style.display = 'block';
    if (itemsContainer && itemsContainer.children.length === 0) {
      addItem();
    }
  }
}

function closeRequestModal() {
  if (requestModal) {
    requestModal.style.display = 'none';
  }
}

function addItem() {
  if (!itemsContainer) return;
  
  const row = document.createElement('div');
  row.className = 'item-row';

  const itemCount = itemsContainer.children.length;
  
  if (itemCount === 0) {
    // First item - show + button (add)
    row.innerHTML = `
      <input type="text" placeholder="Item name" class="form-control">
      <input type="number" value="1" min="1" class="form-control" style="width: 80px;">
      <div class="btn-container-single">
        <button class="btn btn-success" onclick="addItemFromPlus(this)">+</button>
      </div>
    `;
  } else {
    // Second or more items - show × button (delete)
    row.innerHTML = `
      <input type="text" placeholder="Item name" class="form-control">
      <input type="number" value="1" min="1" class="form-control" style="width: 80px;">
      <div class="btn-container-single">
        <button class="btn btn-danger" onclick="removeItem(this)">×</button>
      </div>
    `;
  }

  itemsContainer.appendChild(row);
}

// Called when + is clicked on 1st item - adds new item, 1st item stays as +
function addItemFromPlus(button) {
  // Add new item (the new item will have x because it's now the 2nd item)
  addItem();
}

function removeItem(button) {
  const row = button.parentElement.parentElement;
  if (itemsContainer && itemsContainer.contains(row)) {
    itemsContainer.removeChild(row);
    
    // After removal, check remaining items
    const remainingRows = itemsContainer.querySelectorAll('.item-row');
    
    if (remainingRows.length === 1) {
      // Only 1 item left - change from x to + (first item)
      const lastRow = remainingRows[0];
      lastRow.innerHTML = `
        <input type="text" placeholder="Item name" class="form-control">
        <input type="number" value="1" min="1" class="form-control" style="width: 80px;">
        <div class="btn-container-single">
          <button class="btn btn-success" onclick="addItemFromPlus(this)">+</button>
        </div>
      `;
    }
    // If 2+ items remain, they already have x buttons
  }
}

function submitRequest() {
  const items = [];
  const rows = document.querySelectorAll('.item-row');

  rows.forEach(row => {
    const name = row.querySelector('input[type="text"]').value;
    const qty = row.querySelector('input[type="number"]').value;

    if (name.trim() !== '') {
      items.push({ name, qty: parseInt(qty) });
    }
  });

  if (items.length === 0) {
    alert('Please add at least one item.');
    return;
  }

  const requestType = document.getElementById('requestType').value;
  
  // Create new request with employeeEmail
  const newRequest = {
    id: Date.now(),
    type: requestType,
    items: items,
    status: 'Pending',
    date: new Date().toLocaleDateString(),
    employeeEmail: currentUser ? currentUser.email : 'user@example.com'
  };

  // Use window.db.requests
  if (!window.db.requests) {
      window.db.requests = [];
  }
  window.db.requests.push(newRequest);
  
  // Save to unified storage
  saveToStorage();
  console.log('[STORAGE DEBUG] Request submitted, calling saveToStorage()');

  console.log('Submitted Items:', items);
  showToast('Request submitted successfully!', 'success');
  closeRequestModal();
  
  // Clear the form for next time
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
  }
  
  // Reload the requests table
  loadRequests();
}

// Close modal if clicked outside
window.onclick = function(event) {
  if (event.target === requestModal) {
    closeRequestModal();
  }
};

function loadRequests() {
  const requestsTableBody = document.getElementById('requestsTableBody');
  if (!requestsTableBody) return;

  // Use window.db.requests
  const requests = window.db.requests || [];
  
  // Filter requests based on role - Admin sees all, User sees only their own
  let filteredRequests = requests;
  if (currentUser && currentUser.role !== 'admin') {
    // Filter by employeeEmail for regular users
    filteredRequests = requests.filter(r => r.employeeEmail === currentUser.email);
  }

  if (filteredRequests.length === 0) {
    requestsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">You have no requests yet.</td></tr>';
    return;
  }

  if (filteredRequests.length === 0) {
    requestsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">You have no requests yet.</td></tr>';
    return;
  }

  requestsTableBody.innerHTML = filteredRequests.map(req => {
    const itemsList = req.items.map(item => `${item.name} (x${item.qty})`).join(', ');
    
    // Determine status badge color
    let statusBadge = '';
    switch(req.status) {
      case 'Delivered':
        statusBadge = '<span class="badge bg-success">Delivered</span>';
        break;
      case 'Cancelled':
        statusBadge = '<span class="badge bg-danger">Cancelled</span>';
        break;
      case 'Approved':
        statusBadge = '<span class="badge bg-primary">Approved</span>';
        break;
      case 'Rejected':
        statusBadge = '<span class="badge bg-danger">Rejected</span>';
        break;
      default:
        statusBadge = '<span class="badge bg-warning">Pending</span>';
    }
    
    // Show action buttons only for Pending/Approved status AND if user is admin
    // Use global currentUser variable instead of localStorage
    const isAdmin = currentUser && currentUser.role === 'admin';
    const showDeliveredCancelled = isAdmin && req.status !== 'Delivered' && req.status !== 'Cancelled';
    const showDelete = isAdmin;
    
    return `
      <tr>
        <td>${req.id}</td>
        <td>${req.type}</td>
        <td>${itemsList}</td>
        <td>${statusBadge}</td>
        <td>${req.date}</td>
        <td>
          ${showDeliveredCancelled ? `
            <button class="btn btn-sm btn-success" onclick="markDelivered(${req.id})" title="Delivered">✓</button>
            <button class="btn btn-sm btn-danger" onclick="markCancelled(${req.id})" title="Cancelled">✗</button>
          ` : ''}
          ${showDelete ? `
            <button class="btn btn-sm btn-dark" onclick="deleteRequest(${req.id})" title="Delete">🗑</button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function approveRequest(id) {
  if (!window.db.requests) window.db.requests = [];
  const index = window.db.requests.findIndex(r => r.id === id);
  if (index !== -1) {
    window.db.requests[index].status = 'Approved';
    saveToStorage();
    console.log('[STORAGE DEBUG] Request approved, calling saveToStorage()');
    loadRequests();
  }
}

function rejectRequest(id) {
  if (!window.db.requests) window.db.requests = [];
  const index = window.db.requests.findIndex(r => r.id === id);
  if (index !== -1) {
    window.db.requests[index].status = 'Rejected';
    saveToStorage();
    console.log('[STORAGE DEBUG] Request rejected, calling saveToStorage()');
    loadRequests();
  }
}

function markDelivered(id) {
  if (!window.db.requests) window.db.requests = [];
  const index = window.db.requests.findIndex(r => r.id === id);
  if (index !== -1) {
    window.db.requests[index].status = 'Delivered';
    saveToStorage();
    console.log('[STORAGE DEBUG] Request marked delivered, calling saveToStorage()');
    loadRequests();
  }
}

function markCancelled(id) {
  if (!window.db.requests) window.db.requests = [];
  const index = window.db.requests.findIndex(r => r.id === id);
  if (index !== -1) {
    window.db.requests[index].status = 'Cancelled';
    saveToStorage();
    console.log('[STORAGE DEBUG] Request cancelled, calling saveToStorage()');
    loadRequests();
  }
}

function deleteRequest(id) {
  if (!confirm('Are you sure you want to delete this request?')) return;
  
  if (!window.db.requests) window.db.requests = [];
  window.db.requests = window.db.requests.filter(r => r.id !== id);
  saveToStorage();
  console.log('[STORAGE DEBUG] Request deleted, calling saveToStorage()');
  loadRequests();
}

function updateActionsColumn() {
  // This function is no longer needed - kept for reference
}