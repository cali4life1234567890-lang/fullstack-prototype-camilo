const views = document.querySelectorAll('.view-section');
const loginAlert = document.getElementById('login-alert');
const userEmailDisplay = document.getElementById('user-email-display');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const authLinksLoggedOut = document.getElementById('auth-links-logged-out');
const authLinksLoggedIn = document.getElementById('auth-links-logged-in');
const displayUsername = document.getElementById('display-username');
const linkLogout = document.getElementById('link-logout');
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
window.addEventListener('DOMContentLoaded', () => {
  // Initialize admin account if not exists
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminEmail = 'admin@example.com';
  
  if (!users.find(u => u.email === adminEmail)) {
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      pass: 'Admin',
      role: 'admin'
    };
    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  const savedUser = JSON.parse(localStorage.getItem('currentUser'));
  if (savedUser) {
    updateUIForLoggedInUser(savedUser);
    showView('profile-view');
  }
  
  // Initialize department dropdown for employees
  updateEmployeeDeptDropdown();
});

// Navigation Listeners
document.getElementById('link-login').onclick = () => showView('login-view', false);
document.getElementById('link-register').onclick = () => showView('register-view');
document.getElementById('btn-get-started').onclick = () => showView('register-view');
document.getElementById('btn-cancel-reg').onclick = () => showView('home-view');

// Profile Link
const linkProfile = document.getElementById('link-profile');
if (linkProfile) {
  linkProfile.onclick = (e) => {
    e.preventDefault();
    showView('profile-view');
  };
}

// Accounts Link
const linkAccounts = document.getElementById('link-accounts');
if (linkAccounts) {
  linkAccounts.onclick = (e) => {
    e.preventDefault();
    showView('accounts-view');
    renderAccountTable();
  };
}

// Departments Link
const linkDepartments = document.getElementById('link-departments');
if (linkDepartments) {
  linkDepartments.onclick = (e) => {
    e.preventDefault();
    showView('departments-view');
    renderDeptTable();
  };
}

// My Requests Link
const linkMyRequests = document.getElementById('link-my-requests');
if (linkMyRequests) {
  linkMyRequests.onclick = (e) => {
    e.preventDefault();
    showView('myrequests-view');
    loadRequests();
  };
}

const btnCancelLogin = document.getElementById('btn-cancel-login');
if (btnCancelLogin) btnCancelLogin.onclick = () => showView('home-view');

const btnGoLogin = document.getElementById('btn-go-login');
if (btnGoLogin) btnGoLogin.onclick = () => showView('login-view', false);

// Registration Logic
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newUser = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('regEmail').value,
    pass: document.getElementById('regPass').value,
    role: 'user'
  };

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.find(u => u.email === newUser.email)) {
    alert('Email already registered!');
    return;
  }

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  if (userEmailDisplay) userEmailDisplay.textContent = newUser.email;
  showView('verify-view');
});

// Simulation Button
const btnSimulateVerify = document.getElementById('btn-simulate-verify');
if (btnSimulateVerify) {
  btnSimulateVerify.addEventListener('click', () => {
    showView('login-view', true);
  });
}

// Login Logic
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      updateUIForLoggedInUser(user);
      showView('profile-view');
    } else {
      alert('Invalid email or password!');
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

  // Role-based visibility for Admin dropdown items
  const adminElements = document.querySelectorAll('.role-admin');
  adminElements.forEach(el => {
    el.style.display = (user.role.toLowerCase() === 'admin') ? 'block' : 'none';
  });
}

// Logout Logic
if (linkLogout) {
  linkLogout.onclick = (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    authLinksLoggedOut.classList.remove('d-none');
    authLinksLoggedIn.classList.add('d-none');
    showView('home-view');
  };
}

// Employees Dropdown Link
const employeesLink = document.querySelector('.role-admin .dropdown-item[href="#"]');
document.querySelectorAll('.role-admin .dropdown-item').forEach(item => {
  if (item.textContent === 'Employees') {
    item.onclick = (e) => {
      e.preventDefault();
      showView('employees-view');
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
  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  const tbody = document.getElementById('tableBody');
  
  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No employees.</td></tr>';
    return;
  }

  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.position}</td>
      <td>${emp.dept}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editEmployee('${emp.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Edit Employee
window.editEmployee = function(id) {
  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
  document.getElementById('empId').value = emp.id;
  document.getElementById('empId').setAttribute('data-edit-id', emp.id);
  document.getElementById('empName').value = emp.name;
  document.getElementById('empEmail').value = emp.email || '';
  document.getElementById('empPosition').value = emp.position;
  updateEmployeeDeptDropdown();
  document.getElementById('empDept').value = emp.dept;
  document.getElementById('empHireDate').value = emp.hireDate || '';

  const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
  modal.show();
};

// Delete Employee
window.deleteEmployee = function(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  
  let employees = JSON.parse(localStorage.getItem('employees')) || [];
  employees = employees.filter(e => e.id !== id);
  localStorage.setItem('employees', JSON.stringify(employees));
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

    const employee = { id, email, position, dept, hireDate };

    if (editIndex === -1) {
        empList.push(employee);
    } else {
        empList[editIndex] = employee;
    }

    renderEmpTable();
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
        empList.splice(index, 1);
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

    if (accountEditIndex === -1) {
        // Add new account
        accountList.push(account);
    } else {
        // Edit existing account
        accountList[accountEditIndex] = account;
    }

    renderAccountTable();
    hideAccountForm();
}

function renderAccountTable() {
    const tableBody = document.getElementById('accountTableBody');
    tableBody.innerHTML = '';

    if (accountList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No accounts.</td>
            </tr>
        `;
        return;
    }

    accountList.forEach((account, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${account.firstName} ${account.lastName}</td>
                <td>${account.email}</td>
                <td>${account.role}</td>
                <td>${account.verified ? 'Yes' : 'No'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editAccount(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAccount(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function editAccount(index) {
    const account = accountList[index];

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
    if (confirm('Are you sure you want to delete this account?')) {
        accountList.splice(index, 1);
        renderAccountTable();
    }
}

// Departments Management Functions
let deptList = JSON.parse(localStorage.getItem('departments')) || [
    { name: 'Engineering', description: 'Software team' },
    { name: 'HR', description: 'Human Resources' }
];
let deptEditIndex = -1;

// Save departments to localStorage
function saveDepartmentsToStorage() {
    localStorage.setItem('departments', JSON.stringify(deptList));
}

// Initialize default departments if none exist
if (!localStorage.getItem('departments')) {
    saveDepartmentsToStorage();
}

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
    tableBody.innerHTML = '';

    if (deptList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">No departments.</td>
            </tr>
        `;
        return;
    }

    deptList.forEach((dept, index) => {
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

function editDept(index) {
    const dept = deptList[index];

    document.getElementById('deptName').value = dept.name;
    document.getElementById('deptDescription').value = dept.description;

    deptEditIndex = index;
    showDeptForm();
}

function deleteDept(index) {
    if (confirm('Delete this department?')) {
        const deptName = deptList[index].name;
        deptList.splice(index, 1);
        saveDepartmentsToStorage();
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
    
    deptList.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        select.appendChild(option);
    });
    
    // Restore selected value if it still exists
    if (currentValue && deptList.find(d => d.name === currentValue)) {
        select.value = currentValue;
    }
}

// Persistent Login Check
window.addEventListener('DOMContentLoaded', () => {
  // Initialize admin account if not exists
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminEmail = 'admin@example.com';
  
  if (!users.find(u => u.email === adminEmail)) {
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      pass: 'Admin',
      role: 'admin'
    };
    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  const savedUser = JSON.parse(localStorage.getItem('currentUser'));
  if (savedUser) {
    updateUIForLoggedInUser(savedUser);
    showView('profile-view');
  }
});

// ========================
// My Requests Functions
// ========================

const requestModal = document.getElementById('requestModal');
const itemsContainer = document.getElementById('itemsContainer');

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
  
  // Logic:
  // - 1st item: + only (add)
  // - 2nd+ items: x only (delete)
  // - Clicking + on 1st adds new row and turns + to x
  // - When only 1 item remains, show + again
  
  if (itemCount === 0) {
    // First item - show only + button (add)
    row.innerHTML = `
      <input type="text" placeholder="Item name" class="form-control">
      <input type="number" value="1" min="1" class="form-control" style="width: 80px;">
      <div class="btn-container-single">
        <button class="btn btn-success" onclick="addItemFromPlus(this)">+</button>
      </div>
    `;
  } else {
    // Second or more items - show only x button (delete)
    row.innerHTML = `
      <input type="text" placeholder="Item name" class="form-control">
      <input type="number" value="1" min="1" class="form-control" style="width: 80px;">
      <div class="btn-container-single">
        <button class="btn btn-danger" onclick="removeItem(this)">x</button>
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
  
  // Create new request
  const newRequest = {
    id: Date.now(),
    type: requestType,
    items: items,
    status: 'Pending',
    date: new Date().toLocaleDateString(),
    userEmail: JSON.parse(localStorage.getItem('currentUser'))?.email || 'user@example.com'
  };

  // Save to localStorage
  const requests = JSON.parse(localStorage.getItem('requests')) || [];
  requests.push(newRequest);
  localStorage.setItem('requests', JSON.stringify(requests));

  console.log('Submitted Items:', items);
  alert('Request Submitted!');
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

  const requests = JSON.parse(localStorage.getItem('requests')) || [];
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Filter requests based on role - Admin sees all, User sees only their own
  let filteredRequests = requests;
  if (currentUser && currentUser.role !== 'admin') {
    filteredRequests = requests.filter(r => r.userEmail === currentUser.email);
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
    
    // Show action buttons only for Pending/Approved status (admin can change status)
    const showActions = req.status !== 'Delivered' && req.status !== 'Cancelled';
    
    return `
      <tr>
        <td>${req.id}</td>
        <td>${req.type}</td>
        <td>${itemsList}</td>
        <td>${statusBadge}</td>
        <td>${req.date}</td>
        <td class="role-admin">
          ${showActions ? `
            <button class="btn btn-sm btn-success me-1" onclick="markDelivered(${req.id})">Delivered</button>
            <button class="btn btn-sm btn-danger" onclick="markCancelled(${req.id})">Cancelled</button>
          ` : `
            <span class="text-muted small">No actions available</span>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Show/hide actions column based on role
  updateActionsColumn();
}

function approveRequest(id) {
  const requests = JSON.parse(localStorage.getItem('requests')) || [];
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index].status = 'Approved';
    localStorage.setItem('requests', JSON.stringify(requests));
    loadRequests();
  }
}

function rejectRequest(id) {
  const requests = JSON.parse(localStorage.getItem('requests')) || [];
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index].status = 'Rejected';
    localStorage.setItem('requests', JSON.stringify(requests));
    loadRequests();
  }
}

function markDelivered(id) {
  const requests = JSON.parse(localStorage.getItem('requests')) || [];
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index].status = 'Delivered';
    localStorage.setItem('requests', JSON.stringify(requests));
    loadRequests();
  }
}

function markCancelled(id) {
  const requests = JSON.parse(localStorage.getItem('requests')) || [];
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index].status = 'Cancelled';
    localStorage.setItem('requests', JSON.stringify(requests));
    loadRequests();
  }
}

function updateActionsColumn() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const actionCells = document.querySelectorAll('#requestsTableBody .role-admin');
  
  if (currentUser && currentUser.role === 'admin') {
    actionCells.forEach(cell => cell.style.display = '');
  } else {
    actionCells.forEach(cell => cell.style.display = 'none');
  }
}