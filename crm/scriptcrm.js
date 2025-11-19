// CRM System - Local Storage Based
// Data Storage Keys
const STORAGE_KEYS = {
    CUSTOMERS: 'crm_customers',
    OPPORTUNITIES: 'crm_opportunities',
    TASKS: 'crm_tasks',
    ACTIVITIES: 'crm_activities',
    SETTINGS: 'crm_settings'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Initialize data structures
    initializeStorage();
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboard();
    loadCustomers();
    loadOpportunities();
    loadTasks();
    loadActivities();
    loadSettings();
    
    // Update current date
    updateCurrentDate();
}

// Initialize Local Storage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES)) {
        localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
            companyName: 'ABC CRM Yönetimi',
            currency: 'TL',
            defaultRegion: 'Türkiye',
            activityNotification: true,
            defaultOpportunityStage: 'new',
            autoTaskReminder: '1 Gün Önce',
            autoFollowUp: true,
            reportAutomation: 'Kapalı'
        }));
    }
}

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
                
                // Update page title
                const pageTitle = document.getElementById('page-title');
                const titleText = this.querySelector('span').textContent;
                if (pageTitle) {
                    pageTitle.textContent = titleText;
                }
                
                // Load section data
                switch(sectionId) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'customers':
                        loadCustomers();
                        break;
                    case 'opportunities':
                        loadOpportunities();
                        break;
                    case 'tasks':
                        loadTasks();
                        break;
                    case 'activities':
                        loadActivities();
                        break;
                    case 'reports':
                        loadReports();
                        break;
                }
            }
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Customer buttons
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const addNewCustomerBtn = document.getElementById('add-new-customer-btn');
    const saveCustomerBtn = document.getElementById('save-customer-btn');
    const exportCustomersBtn = document.getElementById('export-customers-btn');
    
    if (addCustomerBtn) addCustomerBtn.addEventListener('click', () => openCustomerModal());
    if (addNewCustomerBtn) addNewCustomerBtn.addEventListener('click', () => openCustomerModal());
    if (saveCustomerBtn) saveCustomerBtn.addEventListener('click', () => saveCustomer());
    if (exportCustomersBtn) exportCustomersBtn.addEventListener('click', () => exportCustomers());
    
    // Opportunity buttons
    const newOpportunityBtn = document.getElementById('new-opportunity-btn');
    const saveOpportunityBtn = document.getElementById('save-opportunity-btn');
    
    if (newOpportunityBtn) newOpportunityBtn.addEventListener('click', () => openOpportunityModal());
    if (saveOpportunityBtn) saveOpportunityBtn.addEventListener('click', () => saveOpportunity());
    
    // Task buttons
    const addTaskBtn = document.getElementById('add-task-btn');
    const refreshTasksBtn = document.getElementById('refresh-tasks-btn');
    
    if (addTaskBtn) addTaskBtn.addEventListener('click', () => addTask());
    if (refreshTasksBtn) refreshTasksBtn.addEventListener('click', () => loadTasks());
    
    // Activity buttons
    const addActivityBtn = document.getElementById('add-activity-btn');
    if (addActivityBtn) addActivityBtn.addEventListener('click', () => addActivity());
    
    // Report buttons
    const generateReportBtn = document.getElementById('generate-report-btn');
    const exportReportBtn = document.getElementById('export-report-btn');
    const printReportBtn = document.getElementById('print-report-btn');
    
    if (generateReportBtn) generateReportBtn.addEventListener('click', () => generateReport());
    if (exportReportBtn) exportReportBtn.addEventListener('click', () => exportReport());
    if (printReportBtn) printReportBtn.addEventListener('click', () => window.print());
    
    // Settings buttons
    const saveGeneralSettingsBtn = document.getElementById('save-general-settings');
    const saveCrmSettingsBtn = document.getElementById('save-crm-settings');
    const backupDataBtn = document.getElementById('backup-data-btn');
    const restoreDataBtn = document.getElementById('restore-data-btn');
    const resetAllDataBtn = document.getElementById('reset-all-data-btn');
    const loadSampleDataBtn = document.getElementById('load-sample-data-btn');
    
    if (saveGeneralSettingsBtn) saveGeneralSettingsBtn.addEventListener('click', () => saveGeneralSettings());
    if (saveCrmSettingsBtn) saveCrmSettingsBtn.addEventListener('click', () => saveCrmSettings());
    if (backupDataBtn) backupDataBtn.addEventListener('click', () => backupData());
    if (restoreDataBtn) restoreDataBtn.addEventListener('click', () => restoreData());
    if (resetAllDataBtn) resetAllDataBtn.addEventListener('click', () => resetAllData());
    if (loadSampleDataBtn) loadSampleDataBtn.addEventListener('click', () => loadSampleData());
    
    // Search and filter
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const globalSearch = document.getElementById('global-search');
    
    if (searchBtn) searchBtn.addEventListener('click', () => performSearch());
    if (resetBtn) resetBtn.addEventListener('click', () => resetFilters());
    if (globalSearch) globalSearch.addEventListener('input', () => performGlobalSearch());
    
    // Modal close handlers
    const customerModal = document.getElementById('addCustomerModal');
    const opportunityModal = document.getElementById('addOpportunityModal');
    
    if (customerModal) {
        customerModal.addEventListener('hidden.bs.modal', () => resetCustomerForm());
    }
    if (opportunityModal) {
        opportunityModal.addEventListener('hidden.bs.modal', () => resetOpportunityForm());
    }
}

// Update Current Date
function updateCurrentDate() {
    const currentDateSpan = document.getElementById('current-date');
    if (currentDateSpan) {
        const now = new Date();
        currentDateSpan.innerHTML = `
            <span>${now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        `;
    }
}

// ==================== CUSTOMER MANAGEMENT ====================

// Get all customers
function getCustomers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
}

// Save customers
function saveCustomers(customers) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

// Add/Update customer
function saveCustomer() {
    const form = document.getElementById('add-customer-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const customerId = document.getElementById('customer-id').value;
    const customer = {
        id: customerId || generateId(),
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        company: document.getElementById('customer-company').value,
        position: document.getElementById('customer-position').value,
        address: document.getElementById('customer-address').value,
        website: document.getElementById('customer-website').value,
        image: document.getElementById('customer-image').value,
        type: document.getElementById('customer-type').value,
        status: document.getElementById('customer-status').value,
        notes: document.getElementById('customer-notes').value,
        createdAt: customerId ? getCustomers().find(c => c.id === customerId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let customers = getCustomers();
    if (customerId) {
        const index = customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            customers[index] = customer;
        }
    } else {
        customers.push(customer);
    }
    
    saveCustomers(customers);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
    if (modal) modal.hide();
    
    // Reload data
    loadCustomers();
    loadDashboard();
    
    showToast('Müşteri başarıyla kaydedildi!');
}

// Open customer modal
function openCustomerModal(customerId = null) {
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    const title = document.getElementById('customer-modal-title');
    
    if (customerId) {
        const customer = getCustomers().find(c => c.id === customerId);
        if (customer) {
            title.textContent = 'Müşteri Düzenle';
            document.getElementById('customer-id').value = customer.id;
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-email').value = customer.email;
            document.getElementById('customer-phone').value = customer.phone || '';
            document.getElementById('customer-company').value = customer.company || '';
            document.getElementById('customer-position').value = customer.position || '';
            document.getElementById('customer-address').value = customer.address || '';
            document.getElementById('customer-website').value = customer.website || '';
            document.getElementById('customer-image').value = customer.image || '';
            document.getElementById('customer-type').value = customer.type || 'customer';
            document.getElementById('customer-status').value = customer.status || 'active';
            document.getElementById('customer-notes').value = customer.notes || '';
        }
    } else {
        title.textContent = 'Yeni Müşteri Ekle';
        resetCustomerForm();
    }
    
    modal.show();
}

// Reset customer form
function resetCustomerForm() {
    document.getElementById('customer-id').value = '';
    document.getElementById('add-customer-form').reset();
    document.getElementById('customer-type').value = 'customer';
    document.getElementById('customer-status').value = 'active';
}

// Delete customer
function deleteCustomer(customerId) {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
        let customers = getCustomers();
        customers = customers.filter(c => c.id !== customerId);
        saveCustomers(customers);
        loadCustomers();
        loadDashboard();
        showToast('Müşteri silindi!');
    }
}

// Load customers
function loadCustomers() {
    const customers = getCustomers();
    const tableBody = document.getElementById('all-customers-table-body');
    const dashboardTableBody = document.getElementById('customers-table-body');
    const emptyState = document.getElementById('empty-all-customers');
    const dashboardEmptyState = document.getElementById('empty-customers');
    
    // Load all customers table
    if (tableBody) {
        tableBody.innerHTML = '';
        if (customers.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            customers.slice().reverse().forEach(customer => {
                const row = createCustomerRow(customer);
                tableBody.appendChild(row);
            });
        }
    }
    
    // Load dashboard table (last 5)
    if (dashboardTableBody) {
        dashboardTableBody.innerHTML = '';
        const recentCustomers = customers.slice().reverse().slice(0, 5);
        if (recentCustomers.length === 0) {
            if (dashboardEmptyState) dashboardEmptyState.style.display = 'block';
        } else {
            if (dashboardEmptyState) dashboardEmptyState.style.display = 'none';
            recentCustomers.forEach(customer => {
                const row = createCustomerRow(customer);
                dashboardTableBody.appendChild(row);
            });
        }
    }
    
    // Update customer selects
    updateCustomerSelects();
}

// Create customer row
function createCustomerRow(customer) {
    const row = document.createElement('tr');
    const imageUrl = customer.image || 'https://via.placeholder.com/50';
    const typeBadge = getTypeBadge(customer.type);
    const statusBadge = getStatusBadge(customer.status);
    
    row.innerHTML = `
        <td><img src="${imageUrl}" alt="${customer.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;"></td>
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.phone || '-'}</td>
        <td>${customer.company || '-'}</td>
        <td>${typeBadge}</td>
        <td>${statusBadge}</td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="openCustomerModal('${customer.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return row;
}

// Update customer selects
function updateCustomerSelects() {
    const customers = getCustomers();
    const selects = [
        document.getElementById('activity-customer-select'),
        document.getElementById('task-customer-select'),
        document.getElementById('opportunity-customer')
    ];
    
    selects.forEach(select => {
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Müşteri seçin</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                select.appendChild(option);
            });
            select.value = currentValue;
        }
    });
}

// Export customers
function exportCustomers() {
    const customers = getCustomers();
    const dataStr = JSON.stringify(customers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Müşteriler dışa aktarıldı!');
}

// ==================== OPPORTUNITY MANAGEMENT ====================

// Get all opportunities
function getOpportunities() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES) || '[]');
}

// Save opportunities
function saveOpportunities(opportunities) {
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opportunities));
}

// Add/Update opportunity
function saveOpportunity() {
    const form = document.getElementById('add-opportunity-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const opportunityId = document.getElementById('opportunity-id').value;
    const customerId = document.getElementById('opportunity-customer').value;
    const customer = getCustomers().find(c => c.id === customerId);
    
    const opportunity = {
        id: opportunityId || generateId(),
        name: document.getElementById('opportunity-name').value,
        customerId: customerId,
        customerName: customer ? customer.name : '',
        amount: parseFloat(document.getElementById('opportunity-amount').value),
        stage: document.getElementById('opportunity-stage').value,
        closeDate: document.getElementById('opportunity-close-date').value,
        description: document.getElementById('opportunity-description').value,
        createdAt: opportunityId ? getOpportunities().find(o => o.id === opportunityId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let opportunities = getOpportunities();
    if (opportunityId) {
        const index = opportunities.findIndex(o => o.id === opportunityId);
        if (index !== -1) {
            opportunities[index] = opportunity;
        }
    } else {
        opportunities.push(opportunity);
    }
    
    saveOpportunities(opportunities);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addOpportunityModal'));
    if (modal) modal.hide();
    
    // Reload data
    loadOpportunities();
    loadDashboard();
    
    showToast('Fırsat başarıyla kaydedildi!');
}

// Open opportunity modal
function openOpportunityModal(opportunityId = null) {
    const modal = new bootstrap.Modal(document.getElementById('addOpportunityModal'));
    
    if (opportunityId) {
        const opportunity = getOpportunities().find(o => o.id === opportunityId);
        if (opportunity) {
            document.getElementById('opportunity-id').value = opportunity.id;
            document.getElementById('opportunity-name').value = opportunity.name;
            document.getElementById('opportunity-customer').value = opportunity.customerId;
            document.getElementById('opportunity-amount').value = opportunity.amount;
            document.getElementById('opportunity-stage').value = opportunity.stage;
            document.getElementById('opportunity-close-date').value = opportunity.closeDate || '';
            document.getElementById('opportunity-description').value = opportunity.description || '';
        }
    } else {
        resetOpportunityForm();
    }
    
    updateCustomerSelects();
    modal.show();
}

// Reset opportunity form
function resetOpportunityForm() {
    document.getElementById('opportunity-id').value = '';
    document.getElementById('add-opportunity-form').reset();
    document.getElementById('opportunity-stage').value = 'new';
}

// Delete opportunity
function deleteOpportunity(opportunityId) {
    if (confirm('Bu fırsatı silmek istediğinizden emin misiniz?')) {
        let opportunities = getOpportunities();
        opportunities = opportunities.filter(o => o.id !== opportunityId);
        saveOpportunities(opportunities);
        loadOpportunities();
        loadDashboard();
        showToast('Fırsat silindi!');
    }
}

// Load opportunities
function loadOpportunities() {
    const opportunities = getOpportunities();
    const pipeline = document.getElementById('opportunity-pipeline');
    const tableBody = document.getElementById('opportunities-history-table');
    const emptyState = document.getElementById('empty-opportunities');
    
    // Load pipeline
    if (pipeline) {
        pipeline.innerHTML = '';
        const stages = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
        const stageNames = {
            'new': 'Yeni',
            'qualified': 'Nitelendirilmiş',
            'proposal': 'Teklif',
            'negotiation': 'Müzakere',
            'won': 'Kazanıldı',
            'lost': 'Kaybedildi'
        };
        
        stages.forEach(stage => {
            const column = document.createElement('div');
            column.className = 'pipeline-column';
            column.innerHTML = `<h6>${stageNames[stage]}</h6>`;
            
            const stageOpportunities = opportunities.filter(o => o.stage === stage);
            if (stageOpportunities.length === 0) {
                column.innerHTML += '<p class="text-muted text-center">Boş</p>';
            } else {
                stageOpportunities.forEach(opp => {
                    const item = document.createElement('div');
                    item.className = 'pipeline-item';
                    item.innerHTML = `
                        <strong>${opp.name}</strong><br>
                        <small>${opp.customerName}</small><br>
                        <span class="badge bg-primary">${formatCurrency(opp.amount)}</span>
                    `;
                    item.onclick = () => openOpportunityModal(opp.id);
                    column.appendChild(item);
                });
            }
            
            pipeline.appendChild(column);
        });
    }
    
    // Load history table
    if (tableBody) {
        tableBody.innerHTML = '';
        if (opportunities.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            opportunities.slice().reverse().forEach(opp => {
                const row = document.createElement('tr');
                const stageBadge = getStageBadge(opp.stage);
                row.innerHTML = `
                    <td>${opp.id.substring(0, 8)}</td>
                    <td>${opp.name}</td>
                    <td>${opp.customerName}</td>
                    <td>${formatCurrency(opp.amount)}</td>
                    <td>${stageBadge}</td>
                    <td>${new Date(opp.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openOpportunityModal('${opp.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOpportunity('${opp.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
}

// ==================== TASK MANAGEMENT ====================

// Get all tasks
function getTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
}

// Save tasks
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// Add task
function addTask() {
    const title = document.getElementById('task-title').value;
    if (!title) {
        alert('Lütfen görev başlığı girin!');
        return;
    }
    
    const task = {
        id: generateId(),
        title: title,
        customerId: document.getElementById('task-customer-select').value,
        customerName: getCustomers().find(c => c.id === document.getElementById('task-customer-select').value)?.name || '',
        dueDate: document.getElementById('task-due-date').value,
        priority: document.getElementById('task-priority').value,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
    
    // Reset form
    document.getElementById('task-title').value = '';
    document.getElementById('task-customer-select').value = '';
    document.getElementById('task-due-date').value = '';
    document.getElementById('task-priority').value = 'medium';
    
    loadTasks();
    loadDashboard();
    showToast('Görev eklendi!');
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
        let tasks = getTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
        loadTasks();
        loadDashboard();
        showToast('Görev silindi!');
    }
}

// Toggle task status
function toggleTaskStatus(taskId) {
    let tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.updatedAt = new Date().toISOString();
        saveTasks(tasks);
        loadTasks();
        loadDashboard();
    }
}

// Load tasks
function loadTasks() {
    const tasks = getTasks();
    const tasksList = document.getElementById('tasks-list');
    
    if (tasksList) {
        tasksList.innerHTML = '';
        if (tasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><h4>Henüz görev eklenmemiş</h4></div>';
        } else {
            tasks.slice().reverse().forEach(task => {
                const item = document.createElement('div');
                item.className = `task-item priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`;
                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-';
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6>${task.title}</h6>
                            <p class="mb-1"><small>Müşteri: ${task.customerName || '-'}</small></p>
                            <p class="mb-0"><small>Bitiş: ${dueDate}</small></p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-success" onclick="toggleTaskStatus('${task.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTask('${task.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                tasksList.appendChild(item);
            });
        }
    }
    
    // Load upcoming tasks for dashboard
    loadUpcomingTasks();
}

// Load upcoming tasks
function loadUpcomingTasks() {
    const tasks = getTasks().filter(t => t.status !== 'completed');
    const preview = document.getElementById('upcoming-tasks-preview');
    const table = document.getElementById('upcoming-tasks-table');
    
    // Dashboard preview
    if (preview) {
        preview.innerHTML = '';
        const upcoming = tasks.slice(0, 5);
        if (upcoming.length === 0) {
            preview.innerHTML = '<p class="text-muted text-center">Yaklaşan görev yok</p>';
        } else {
            upcoming.forEach(task => {
                const item = document.createElement('div');
                item.className = 'task-preview-item';
                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-';
                item.innerHTML = `
                    <strong>${task.title}</strong><br>
                    <small>${task.customerName || '-'} - ${dueDate}</small>
                `;
                preview.appendChild(item);
            });
        }
    }
    
    // Reports table
    if (table) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            tasks.slice(0, 10).forEach(task => {
                const row = document.createElement('tr');
                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-';
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>${task.customerName || '-'}</td>
                    <td>${dueDate}</td>
                    <td><span class="badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}">${task.priority}</span></td>
                `;
                tbody.appendChild(row);
            });
        }
    }
}

// ==================== ACTIVITY MANAGEMENT ====================

// Get all activities
function getActivities() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
}

// Save activities
function saveActivities(activities) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

// Add activity
function addActivity() {
    const type = document.getElementById('activity-type-select').value;
    const customerId = document.getElementById('activity-customer-select').value;
    const date = document.getElementById('activity-date').value;
    const notes = document.getElementById('activity-notes').value;
    
    if (!customerId) {
        alert('Lütfen müşteri seçin!');
        return;
    }
    
    const customer = getCustomers().find(c => c.id === customerId);
    
    const activity = {
        id: generateId(),
        type: type,
        customerId: customerId,
        customerName: customer ? customer.name : '',
        date: date || new Date().toISOString(),
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    let activities = getActivities();
    activities.push(activity);
    saveActivities(activities);
    
    // Reset form
    document.getElementById('activity-customer-select').value = '';
    document.getElementById('activity-date').value = '';
    document.getElementById('activity-notes').value = '';
    
    loadActivities();
    showToast('İletişim kaydı eklendi!');
}

// Delete activity
function deleteActivity(activityId) {
    if (confirm('Bu iletişim kaydını silmek istediğinizden emin misiniz?')) {
        let activities = getActivities();
        activities = activities.filter(a => a.id !== activityId);
        saveActivities(activities);
        loadActivities();
        showToast('İletişim kaydı silindi!');
    }
}

// Load activities
function loadActivities() {
    const activities = getActivities();
    const activitiesList = document.getElementById('activities-list');
    
    if (activitiesList) {
        activitiesList.innerHTML = '';
        if (activities.length === 0) {
            activitiesList.innerHTML = '<div class="empty-state"><i class="fas fa-phone-alt"></i><h4>Henüz iletişim kaydı yok</h4></div>';
        } else {
            activities.slice().reverse().forEach(activity => {
                const item = document.createElement('div');
                item.className = `activity-item ${activity.type}`;
                const typeNames = {
                    'call': 'Telefon',
                    'email': 'E-posta',
                    'meeting': 'Toplantı',
                    'note': 'Not'
                };
                const typeIcons = {
                    'call': 'fa-phone',
                    'email': 'fa-envelope',
                    'meeting': 'fa-calendar',
                    'note': 'fa-sticky-note'
                };
                const date = new Date(activity.date).toLocaleString('tr-TR');
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6><i class="fas ${typeIcons[activity.type]}"></i> ${typeNames[activity.type]} - ${activity.customerName}</h6>
                            <p class="mb-1"><small>${date}</small></p>
                            <p class="mb-0">${activity.notes || '-'}</p>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="deleteActivity('${activity.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                activitiesList.appendChild(item);
            });
        }
    }
}

// ==================== DASHBOARD ====================

// Load dashboard
function loadDashboard() {
    loadStats();
    loadCustomers();
    loadUpcomingTasks();
}

// Load stats
function loadStats() {
    const customers = getCustomers();
    const opportunities = getOpportunities();
    const tasks = getTasks();
    const activities = getActivities();
    
    const statsCards = document.getElementById('stats-cards');
    if (statsCards) {
        const totalValue = opportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
        const wonValue = opportunities.filter(o => o.stage === 'won').reduce((sum, o) => sum + (o.amount || 0), 0);
        const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
        
        statsCards.innerHTML = `
            <div class="col-md-3">
                <div class="stat-card primary">
                    <p>Toplam Müşteri</p>
                    <h3>${customers.length}</h3>
                    <i class="fas fa-users"></i>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card success">
                    <p>Toplam Fırsat Değeri</p>
                    <h3>${formatCurrency(totalValue)}</h3>
                    <i class="fas fa-briefcase"></i>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card warning">
                    <p>Kazanılan Değer</p>
                    <h3>${formatCurrency(wonValue)}</h3>
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card danger">
                    <p>Bekleyen Görevler</p>
                    <h3>${pendingTasks}</h3>
                    <i class="fas fa-tasks"></i>
                </div>
            </div>
        `;
    }
}

// ==================== REPORTS ====================

// Chart instances
let customerChartInstance = null;
let opportunityChartInstance = null;
let salesChartInstance = null;

// Load reports
function loadReports() {
    loadCharts();
    loadUpcomingTasks();
    loadTopOpportunities();
}

// Load charts
function loadCharts() {
    const customers = getCustomers();
    const opportunities = getOpportunities();
    
    // Customer distribution chart
    const customerCtx = document.getElementById('customerChart');
    if (customerCtx) {
        // Destroy existing chart if it exists
        if (customerChartInstance) {
            customerChartInstance.destroy();
        }
        
        const typeCounts = {
            'lead': customers.filter(c => c.type === 'lead').length,
            'customer': customers.filter(c => c.type === 'customer').length,
            'partner': customers.filter(c => c.type === 'partner').length
        };
        
        customerChartInstance = new Chart(customerCtx, {
            type: 'doughnut',
            data: {
                labels: ['Potansiyel Müşteri', 'Müşteri', 'İş Ortağı'],
                datasets: [{
                    data: [typeCounts.lead, typeCounts.customer, typeCounts.partner],
                    backgroundColor: ['#3498db', '#27ae60', '#f39c12']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Opportunity stage chart
    const opportunityCtx = document.getElementById('opportunityChart');
    if (opportunityCtx) {
        // Destroy existing chart if it exists
        if (opportunityChartInstance) {
            opportunityChartInstance.destroy();
        }
        
        const stageCounts = {
            'new': opportunities.filter(o => o.stage === 'new').length,
            'qualified': opportunities.filter(o => o.stage === 'qualified').length,
            'proposal': opportunities.filter(o => o.stage === 'proposal').length,
            'negotiation': opportunities.filter(o => o.stage === 'negotiation').length,
            'won': opportunities.filter(o => o.stage === 'won').length,
            'lost': opportunities.filter(o => o.stage === 'lost').length
        };
        
        opportunityChartInstance = new Chart(opportunityCtx, {
            type: 'bar',
            data: {
                labels: ['Yeni', 'Nitelendirilmiş', 'Teklif', 'Müzakere', 'Kazanıldı', 'Kaybedildi'],
                datasets: [{
                    label: 'Fırsat Sayısı',
                    data: [stageCounts.new, stageCounts.qualified, stageCounts.proposal, stageCounts.negotiation, stageCounts.won, stageCounts.lost],
                    backgroundColor: ['#3498db', '#17a2b8', '#ffc107', '#fd7e14', '#27ae60', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Sales chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        // Destroy existing chart if it exists
        if (salesChartInstance) {
            salesChartInstance.destroy();
        }
        
        const last6Months = [];
        const salesData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            last6Months.push(date.toLocaleDateString('tr-TR', { month: 'short' }));
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const monthSales = opportunities
                .filter(o => o.stage === 'won' && new Date(o.createdAt) >= monthStart && new Date(o.createdAt) <= monthEnd)
                .reduce((sum, o) => sum + (o.amount || 0), 0);
            salesData.push(monthSales);
        }
        
        salesChartInstance = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: last6Months,
                datasets: [{
                    label: 'Satış (TL)',
                    data: salesData,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Load top opportunities
function loadTopOpportunities() {
    const opportunities = getOpportunities().filter(o => o.stage !== 'lost' && o.stage !== 'won');
    const table = document.getElementById('top-opportunities-table');
    
    if (table) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            const topOpps = opportunities.sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 10);
            if (topOpps.length === 0) {
                const emptyState = document.getElementById('empty-top-opportunities');
                if (emptyState) emptyState.style.display = 'block';
            } else {
                const emptyState = document.getElementById('empty-top-opportunities');
                if (emptyState) emptyState.style.display = 'none';
                topOpps.forEach(opp => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${opp.name}</td>
                        <td>${opp.customerName}</td>
                        <td>${formatCurrency(opp.amount)}</td>
                        <td>${getStageBadge(opp.stage)}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    }
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const reportContainer = document.getElementById('generated-report-container');
    const reportContent = document.getElementById('generated-report-content');
    const reportDateRange = document.getElementById('report-date-range');
    
    if (!reportContainer || !reportContent) return;
    
    const customers = getCustomers();
    const opportunities = getOpportunities();
    const tasks = getTasks();
    const activities = getActivities();
    
    let reportHTML = '';
    let dateRangeText = '';
    
    // Filter by date range if provided
    let filteredCustomers = customers;
    let filteredOpportunities = opportunities;
    let filteredTasks = tasks;
    let filteredActivities = activities;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        filteredCustomers = customers.filter(c => {
            const created = new Date(c.createdAt);
            return created >= start && created <= end;
        });
        
        filteredOpportunities = opportunities.filter(o => {
            const created = new Date(o.createdAt);
            return created >= start && created <= end;
        });
        
        filteredTasks = tasks.filter(t => {
            const created = new Date(t.createdAt);
            return created >= start && created <= end;
        });
        
        filteredActivities = activities.filter(a => {
            const created = new Date(a.date);
            return created >= start && created <= end;
        });
        
        dateRangeText = `${new Date(startDate).toLocaleDateString('tr-TR')} - ${new Date(endDate).toLocaleDateString('tr-TR')}`;
    } else {
        dateRangeText = 'Tüm Zamanlar';
    }
    
    if (reportDateRange) {
        reportDateRange.textContent = dateRangeText;
    }
    
    // Generate report based on type
    switch(reportType) {
        case 'customers':
            reportHTML = generateCustomerReport(filteredCustomers);
            break;
        case 'opportunities':
            reportHTML = generateOpportunityReport(filteredOpportunities);
            break;
        case 'activities':
            reportHTML = generateActivityReport(filteredActivities);
            break;
        case 'sales':
            reportHTML = generateSalesReport(filteredOpportunities);
            break;
        default:
            reportHTML = generateCustomerReport(filteredCustomers);
    }
    
    reportContent.innerHTML = reportHTML;
    reportContainer.style.display = 'block';
    
    // Scroll to report
    reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showToast('Rapor başarıyla oluşturuldu!');
}

// Generate customer report
function generateCustomerReport(customers) {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const leads = customers.filter(c => c.type === 'lead').length;
    const regularCustomers = customers.filter(c => c.type === 'customer').length;
    const partners = customers.filter(c => c.type === 'partner').length;
    
    let html = `
        <div class="report-summary mb-4">
            <h5>Müşteri Raporu Özeti</h5>
            <div class="row mt-3">
                <div class="col-md-3">
                    <div class="stat-card primary">
                        <p>Toplam Müşteri</p>
                        <h3>${totalCustomers}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card success">
                        <p>Aktif Müşteri</p>
                        <h3>${activeCustomers}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card warning">
                        <p>Potansiyel Müşteri</p>
                        <h3>${leads}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card info">
                        <p>İş Ortağı</p>
                        <h3>${partners}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Müşteri Adı</th>
                        <th>E-posta</th>
                        <th>Telefon</th>
                        <th>Şirket</th>
                        <th>Tip</th>
                        <th>Durum</th>
                        <th>Kayıt Tarihi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    customers.forEach(customer => {
        html += `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.company || '-'}</td>
                <td>${getTypeBadge(customer.type)}</td>
                <td>${getStatusBadge(customer.status)}</td>
                <td>${new Date(customer.createdAt).toLocaleDateString('tr-TR')}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Generate opportunity report
function generateOpportunityReport(opportunities) {
    const totalOpportunities = opportunities.length;
    const totalValue = opportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
    const wonValue = opportunities.filter(o => o.stage === 'won').reduce((sum, o) => sum + (o.amount || 0), 0);
    const wonCount = opportunities.filter(o => o.stage === 'won').length;
    
    let html = `
        <div class="report-summary mb-4">
            <h5>Fırsat Raporu Özeti</h5>
            <div class="row mt-3">
                <div class="col-md-3">
                    <div class="stat-card primary">
                        <p>Toplam Fırsat</p>
                        <h3>${totalOpportunities}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card success">
                        <p>Toplam Değer</p>
                        <h3>${formatCurrency(totalValue)}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card warning">
                        <p>Kazanılan</p>
                        <h3>${wonCount}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card info">
                        <p>Kazanılan Değer</p>
                        <h3>${formatCurrency(wonValue)}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Fırsat Adı</th>
                        <th>Müşteri</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                        <th>Kapanış Tarihi</th>
                        <th>Oluşturulma</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    opportunities.forEach(opp => {
        html += `
            <tr>
                <td>${opp.name}</td>
                <td>${opp.customerName}</td>
                <td>${formatCurrency(opp.amount)}</td>
                <td>${getStageBadge(opp.stage)}</td>
                <td>${opp.closeDate ? new Date(opp.closeDate).toLocaleDateString('tr-TR') : '-'}</td>
                <td>${new Date(opp.createdAt).toLocaleDateString('tr-TR')}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Generate activity report
function generateActivityReport(activities) {
    const totalActivities = activities.length;
    const calls = activities.filter(a => a.type === 'call').length;
    const emails = activities.filter(a => a.type === 'email').length;
    const meetings = activities.filter(a => a.type === 'meeting').length;
    const notes = activities.filter(a => a.type === 'note').length;
    
    let html = `
        <div class="report-summary mb-4">
            <h5>İletişim Raporu Özeti</h5>
            <div class="row mt-3">
                <div class="col-md-3">
                    <div class="stat-card primary">
                        <p>Toplam İletişim</p>
                        <h3>${totalActivities}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card success">
                        <p>Telefon</p>
                        <h3>${calls}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card warning">
                        <p>E-posta</p>
                        <h3>${emails}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card info">
                        <p>Toplantı</p>
                        <h3>${meetings}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Tür</th>
                        <th>Müşteri</th>
                        <th>Tarih</th>
                        <th>Notlar</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const typeNames = {
        'call': 'Telefon',
        'email': 'E-posta',
        'meeting': 'Toplantı',
        'note': 'Not'
    };
    
    activities.forEach(activity => {
        html += `
            <tr>
                <td>${typeNames[activity.type] || activity.type}</td>
                <td>${activity.customerName}</td>
                <td>${new Date(activity.date).toLocaleString('tr-TR')}</td>
                <td>${activity.notes || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Generate sales report
function generateSalesReport(opportunities) {
    const wonOpportunities = opportunities.filter(o => o.stage === 'won');
    const totalSales = wonOpportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
    const avgSale = wonOpportunities.length > 0 ? totalSales / wonOpportunities.length : 0;
    
    let html = `
        <div class="report-summary mb-4">
            <h5>Satış Raporu Özeti</h5>
            <div class="row mt-3">
                <div class="col-md-4">
                    <div class="stat-card success">
                        <p>Toplam Satış</p>
                        <h3>${formatCurrency(totalSales)}</h3>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card primary">
                        <p>Satış Sayısı</p>
                        <h3>${wonOpportunities.length}</h3>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card warning">
                        <p>Ortalama Satış</p>
                        <h3>${formatCurrency(avgSale)}</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Fırsat Adı</th>
                        <th>Müşteri</th>
                        <th>Tutar</th>
                        <th>Kapanış Tarihi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    wonOpportunities.forEach(opp => {
        html += `
            <tr>
                <td>${opp.name}</td>
                <td>${opp.customerName}</td>
                <td>${formatCurrency(opp.amount)}</td>
                <td>${opp.closeDate ? new Date(opp.closeDate).toLocaleDateString('tr-TR') : new Date(opp.createdAt).toLocaleDateString('tr-TR')}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Export report
function exportReport() {
    const reportContent = document.getElementById('generated-report-content');
    const reportType = document.getElementById('report-type').value;
    const format = document.getElementById('report-format').value;
    
    if (!reportContent || reportContent.innerHTML.trim() === '') {
        showToast('Lütfen önce rapor oluşturun!');
        return;
    }
    
    if (format === 'html') {
        const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>CRM Raporu - ${reportType}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { padding: 20px; }
        .stat-card { padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px; }
        .stat-card h3 { margin: 10px 0; }
    </style>
</head>
<body>
    <h2>CRM Raporu - ${reportType}</h2>
    <p>Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
    ${reportContent.innerHTML}
</body>
</html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crm_raporu_${reportType}_${new Date().toISOString().split('T')[0]}.html`;
        link.click();
        URL.revokeObjectURL(url);
    } else {
        showToast(`${format.toUpperCase()} formatı yakında eklenecek!`);
    }
    
    showToast('Rapor dışa aktarıldı!');
}

// ==================== SETTINGS ====================

// Load settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    
    if (document.getElementById('company-name')) {
        document.getElementById('company-name').value = settings.companyName || 'ABC CRM Yönetimi';
    }
    if (document.getElementById('currency')) {
        document.getElementById('currency').value = settings.currency || 'TL';
    }
    if (document.getElementById('default-region')) {
        document.getElementById('default-region').value = settings.defaultRegion || 'Türkiye';
    }
    if (document.getElementById('activityNotification')) {
        document.getElementById('activityNotification').checked = settings.activityNotification !== false;
    }
    if (document.getElementById('default-opportunity-stage')) {
        document.getElementById('default-opportunity-stage').value = settings.defaultOpportunityStage || 'new';
    }
    if (document.getElementById('auto-task-reminder')) {
        document.getElementById('auto-task-reminder').value = settings.autoTaskReminder || '1 Gün Önce';
    }
    if (document.getElementById('autoFollowUp')) {
        document.getElementById('autoFollowUp').checked = settings.autoFollowUp !== false;
    }
    if (document.getElementById('report-automation')) {
        document.getElementById('report-automation').value = settings.reportAutomation || 'Kapalı';
    }
    
    // System info
    const systemInfo = document.getElementById('system-info');
    if (systemInfo) {
        systemInfo.innerHTML = `
            <small>
                <strong>Tarayıcı:</strong> ${navigator.userAgent.split(' ')[0]}<br>
                <strong>Dil:</strong> ${navigator.language}<br>
                <strong>Platform:</strong> ${navigator.platform}<br>
                <strong>Local Storage:</strong> ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
            </small>
        `;
    }
}

// Save general settings
function saveGeneralSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    settings.companyName = document.getElementById('company-name').value;
    settings.currency = document.getElementById('currency').value;
    settings.defaultRegion = document.getElementById('default-region').value;
    settings.activityNotification = document.getElementById('activityNotification').checked;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    showToast('Genel ayarlar kaydedildi!');
}

// Save CRM settings
function saveCrmSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    settings.defaultOpportunityStage = document.getElementById('default-opportunity-stage').value;
    settings.autoTaskReminder = document.getElementById('auto-task-reminder').value;
    settings.autoFollowUp = document.getElementById('autoFollowUp').checked;
    settings.reportAutomation = document.getElementById('report-automation').value;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    showToast('CRM ayarları kaydedildi!');
}

// Backup data
function backupData() {
    const data = {
        customers: getCustomers(),
        opportunities: getOpportunities(),
        tasks: getTasks(),
        activities: getActivities(),
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Yedek alındı!');
}

// Restore data
function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.customers) saveCustomers(data.customers);
                    if (data.opportunities) saveOpportunities(data.opportunities);
                    if (data.tasks) saveTasks(data.tasks);
                    if (data.activities) saveActivities(data.activities);
                    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
                    
                    // Reload all
                    loadDashboard();
                    loadCustomers();
                    loadOpportunities();
                    loadTasks();
                    loadActivities();
                    loadSettings();
                    
                    showToast('Yedek yüklendi!');
                } catch (error) {
                    alert('Yedek dosyası geçersiz!');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Reset all data
function resetAllData() {
    if (confirm('TÜM VERİLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ? Bu işlem geri alınamaz!')) {
        localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
        localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
        initializeStorage();
        loadDashboard();
        loadCustomers();
        loadOpportunities();
        loadTasks();
        loadActivities();
        showToast('Tüm veriler sıfırlandı!');
    }
}

// Load sample data
function loadSampleData() {
    if (confirm('Örnek veriler yüklenecek. Mevcut veriler korunacak. Devam etmek istiyor musunuz?')) {
        const sampleCustomers = [
            {
                id: generateId(),
                name: 'Ahmet Yılmaz',
                email: 'ahmet@example.com',
                phone: '0532 123 4567',
                company: 'ABC Teknoloji',
                type: 'customer',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Ayşe Demir',
                email: 'ayse@example.com',
                phone: '0533 987 6543',
                company: 'XYZ Yazılım',
                type: 'lead',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        let customers = getCustomers();
        customers = [...customers, ...sampleCustomers];
        saveCustomers(customers);
        
        loadDashboard();
        loadCustomers();
        showToast('Örnek veriler yüklendi!');
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Generate ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
}

// Get type badge
function getTypeBadge(type) {
    const badges = {
        'lead': '<span class="badge bg-info type-badge type-lead">Potansiyel</span>',
        'customer': '<span class="badge bg-success type-badge type-customer">Müşteri</span>',
        'partner': '<span class="badge bg-warning type-badge type-partner">İş Ortağı</span>'
    };
    return badges[type] || '<span class="badge bg-secondary">-</span>';
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'active': '<span class="badge bg-success status-badge status-active">Aktif</span>',
        'inactive': '<span class="badge bg-danger status-badge status-inactive">Pasif</span>',
        'blocked': '<span class="badge bg-warning status-badge status-pending">Engellenmiş</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">-</span>';
}

// Get stage badge
function getStageBadge(stage) {
    const badges = {
        'new': '<span class="badge bg-info stage-badge stage-new">Yeni</span>',
        'qualified': '<span class="badge bg-success stage-badge stage-qualified">Nitelendirilmiş</span>',
        'proposal': '<span class="badge bg-warning stage-badge stage-proposal">Teklif</span>',
        'negotiation': '<span class="badge bg-danger stage-badge stage-negotiation">Müzakere</span>',
        'won': '<span class="badge bg-success stage-badge stage-won">Kazanıldı</span>',
        'lost': '<span class="badge bg-danger stage-badge stage-lost">Kaybedildi</span>'
    };
    return badges[stage] || '<span class="badge bg-secondary">-</span>';
}

// Show toast
function showToast(message) {
    const toast = document.getElementById('success-toast');
    const toastBody = document.getElementById('success-toast-body');
    if (toast && toastBody) {
        toastBody.textContent = message;
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Perform search
function performSearch() {
    // Implement search functionality
    showToast('Arama yapıldı!');
}

// Reset filters
function resetFilters() {
    document.getElementById('customer-type-filter').value = '';
    document.getElementById('opportunity-status-filter').value = '';
    document.getElementById('task-status-filter').value = '';
    document.getElementById('date-range-filter').value = '';
    showToast('Filtreler sıfırlandı!');
}

// Perform global search
function performGlobalSearch() {
    const query = document.getElementById('global-search').value.toLowerCase();
    // Implement global search
}

