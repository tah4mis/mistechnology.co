// Uygulama veri yapısı
let appData = {
    kanbanData: {
        columns: [
            {
                id: 1,
                title: "📝 Yapılacaklar",
                tasks: [
                    {
                        id: 101,
                        title: "Yeni Görev Ekle",
                        description: "Yukarıdaki 'Görev Ekle' butonuna tıklayarak yeni bir görev oluşturabilirsiniz.",
                        priority: "medium",
                        deadline: "",
                        createdAt: new Date()
                    },
                    {
                        id: 102,
                        title: "Yeni Sütun Ekle",
                        description: "'Sütun Ekle' butonu ile iş akışınıza uygun yeni sütunlar (örn: 'Gözden Geçirme') ekleyebilirsiniz.",
                        priority: "low",
                        deadline: "",
                        createdAt: new Date()
                    }
                ]
            },
            {
                id: 2,
                title: "🚀 Devam Edenler",
                tasks: [
                    {
                        id: 201,
                        title: "Görevi Sürükle ve Bırak",
                        description: "Bir görevi mouse ile tutup başka bir sütuna sürükleyerek taşıyabilirsiniz.",
                        priority: "high",
                        deadline: "",
                        createdAt: new Date()
                    }
                ]
            },
            {
                id: 4,
                title: "✅ Tamamlandı",
                tasks: [
                     {
                        id: 401,
                        title: "İstatistikleri Kontrol Et",
                        description: "Yukarıdaki 'Proje İstatistikleri' panelinden projenizin genel durumunu takip edebilirsiniz.",
                        priority: "medium",
                        deadline: "",
                        createdAt: new Date()
                    }
                ]
            }
        ]
    },
    roadmapItems: [],
    sprints: [],
    bugs: [],
    releases: [],
    featureBacklog: []
};

// DOM elementleri
const kanbanBoard = document.getElementById('kanbanBoard');
const roadmapItems = document.getElementById('roadmapItems');
const addTaskBtn = document.getElementById('addTaskBtn');
const addColumnBtn = document.getElementById('addColumnBtn');
const addRoadmapItemBtn = document.getElementById('addRoadmapItemBtn');
const editRoadmapBtn = document.getElementById('editRoadmapBtn');
const taskModal = document.getElementById('taskModal');
const columnModal = document.getElementById('columnModal');
const roadmapModal = document.getElementById('roadmapModal');
const taskForm = document.getElementById('taskForm');
const columnForm = document.getElementById('columnForm');
const roadmapForm = document.getElementById('roadmapForm');
const taskColumnSelect = document.getElementById('taskColumn');
const closeButtons = document.querySelectorAll('.close');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');
const cancelColumnBtn = document.getElementById('cancelColumnBtn');
const cancelRoadmapBtn = document.getElementById('cancelRoadmapBtn');
const featureCards = document.querySelectorAll('.feature-card');
const featureContents = document.querySelectorAll('.feature-content');

// Modal açma/kapama işlevleri
addTaskBtn.addEventListener('click', () => {
    populateColumnSelect();
    taskModal.style.display = 'flex';
});

addColumnBtn.addEventListener('click', () => {
    columnModal.style.display = 'flex';
});

addRoadmapItemBtn.addEventListener('click', () => {
    roadmapModal.style.display = 'flex';
});

editRoadmapBtn.addEventListener('click', toggleRoadmapEditMode);

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        taskModal.style.display = 'none';
        columnModal.style.display = 'none';
        roadmapModal.style.display = 'none';
    });
});

cancelTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
});

cancelColumnBtn.addEventListener('click', () => {
    columnModal.style.display = 'none';
});

cancelRoadmapBtn.addEventListener('click', () => {
    roadmapModal.style.display = 'none';
});

// Özellik kartları tıklama
featureCards.forEach(card => {
    card.addEventListener('click', () => {
        featureCards.forEach(c => c.classList.remove('active'));
        featureContents.forEach(c => c.classList.remove('active'));
        
        card.classList.add('active');
        const feature = card.dataset.feature;
        document.getElementById(`${feature}-content`).classList.add('active');
        
        // Özelliğe özgü içeriği yükle
        loadFeatureContent(feature);
    });
});

// Özellik içeriklerini yükleme
function loadFeatureContent(feature) {
    switch(feature) {
        case 'sprint':
            renderSprints();
            break;
        case 'bugs':
            renderBugs();
            break;
        case 'releases':
            renderReleases();
            break;
        case 'backlog':
            renderFeatureBacklog();
            break;
        case 'kanban':
            renderKanban();
            break;
    }
}

// Yol haritasını render et
function renderRoadmap() {
    roadmapItems.innerHTML = '';
    
    // Öğeleri sıralama değerine göre sırala
    appData.roadmapItems.sort((a, b) => a.order - b.order);
    
    appData.roadmapItems.forEach(item => {
        const roadmapItem = document.createElement('div');
        roadmapItem.className = 'roadmap-item';
        roadmapItem.setAttribute('draggable', 'true');
        roadmapItem.setAttribute('data-item-id', item.id);
        
        const statusClass = {
            'planned': 'status-planned',
            'inprogress': 'status-inprogress',
            'completed': 'status-completed'
        }[item.status];
        
        roadmapItem.innerHTML = `
            <div class="roadmap-status ${statusClass}"></div>
            <div class="roadmap-content">
                <div class="roadmap-title">${item.title}</div>
                <div class="roadmap-description">${item.description}</div>
            </div>
            <div class="roadmap-actions">
                <button class="roadmap-action-btn edit-roadmap-item" data-item-id="${item.id}">✏️</button>
                <button class="roadmap-action-btn delete-roadmap-item" data-item-id="${item.id}">🗑️</button>
            </div>
        `;
        
        roadmapItems.appendChild(roadmapItem);
    });
    
    // Yol haritası sürükle-bırak olaylarını ekle
    setupRoadmapDragAndDrop();
    
    // Düzenleme ve silme butonlarına event listener ekle
    document.querySelectorAll('.edit-roadmap-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = parseInt(btn.dataset.itemId);
            editRoadmapItem(itemId);
        });
    });
    
    document.querySelectorAll('.delete-roadmap-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = parseInt(btn.dataset.itemId);
            deleteRoadmapItem(itemId);
        });
    });
}

// Yol haritası sürükle-bırak işlevleri
function setupRoadmapDragAndDrop() {
    const roadmapItemsContainer = document.getElementById('roadmapItems');
    let draggedItem = null;
    
    roadmapItemsContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('roadmap-item')) {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        }
    });
    
    roadmapItemsContainer.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('roadmap-item')) {
            e.target.classList.remove('dragging');
            draggedItem = null;
            document.querySelectorAll('.roadmap-item').forEach(item => {
                item.classList.remove('over');
            });
        }
    });
    
    roadmapItemsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(roadmapItemsContainer, e.clientY);
        const draggable = document.querySelector('.roadmap-item.dragging');
        
        if (draggable) {
            if (afterElement == null) {
                roadmapItemsContainer.appendChild(draggable);
            } else {
                roadmapItemsContainer.insertBefore(draggable, afterElement);
            }
        }
    });
    
    roadmapItemsContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            // Sıralamayı güncelle
            updateRoadmapOrder();
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.roadmap-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateRoadmapOrder() {
    const items = document.querySelectorAll('.roadmap-item');
    items.forEach((item, index) => {
        const itemId = parseInt(item.getAttribute('data-item-id'));
        const roadmapItem = appData.roadmapItems.find(i => i.id === itemId);
        if (roadmapItem) {
            roadmapItem.order = index + 1;
        }
    });
}

// Yol haritası düzenleme modunu aç/kapat
function toggleRoadmapEditMode() {
    const isEditing = editRoadmapBtn.textContent === 'Düzenle';
    
    if (isEditing) {
        editRoadmapBtn.textContent = 'Kaydet';
        document.querySelectorAll('.roadmap-actions').forEach(actions => {
            actions.style.display = 'flex';
        });
    } else {
        editRoadmapBtn.textContent = 'Düzenle';
        document.querySelectorAll('.roadmap-actions').forEach(actions => {
            actions.style.display = 'none';
        });
    }
}

// Yol haritası öğesi ekleme
roadmapForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('roadmapTitle').value;
    const description = document.getElementById('roadmapDescription').value;
    const status = document.getElementById('roadmapStatus').value;
    
    const newItem = {
        id: Date.now(),
        title,
        description,
        status,
        order: appData.roadmapItems.length + 1
    };
    
    appData.roadmapItems.push(newItem);
    renderRoadmap();
    roadmapModal.style.display = 'none';
    roadmapForm.reset();
});

// Yol haritası öğesini düzenle
function editRoadmapItem(itemId) {
    const item = appData.roadmapItems.find(i => i.id === itemId);
    if (item) {
        document.getElementById('roadmapTitle').value = item.title;
        document.getElementById('roadmapDescription').value = item.description;
        document.getElementById('roadmapStatus').value = item.status;
        
        // Mevcut formu güncellemek için kullan
        roadmapForm.onsubmit = (e) => {
            e.preventDefault();
            
            item.title = document.getElementById('roadmapTitle').value;
            item.description = document.getElementById('roadmapDescription').value;
            item.status = document.getElementById('roadmapStatus').value;
            
            renderRoadmap();
            roadmapModal.style.display = 'none';
            roadmapForm.reset();
            
            // Formu tekrar ekleme moduna döndür
            roadmapForm.onsubmit = originalRoadmapSubmit;
        };
        
        roadmapModal.style.display = 'flex';
    }
}

// Orijinal yol haritası submit işlevini sakla
const originalRoadmapSubmit = roadmapForm.onsubmit;

// Yol haritası öğesini sil
function deleteRoadmapItem(itemId) {
    if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        appData.roadmapItems = appData.roadmapItems.filter(item => item.id !== itemId);
        renderRoadmap();
    }
}

// Sprintleri görüntüleme
function renderSprints() {
    const sprintList = document.getElementById('sprintList');
    sprintList.innerHTML = '';
    
    appData.sprints.forEach(sprint => {
        const sprintItem = document.createElement('div');
        sprintItem.className = 'sprint-item';
        
        sprintItem.innerHTML = `
            <div><strong>${sprint.name}</strong></div>
            <div>${sprint.startDate} - ${sprint.endDate}</div>
            <div class="sprint-progress">
                <div class="sprint-progress-bar" style="width: ${sprint.progress}%"></div>
            </div>
            <div>${sprint.progress}% tamamlandı</div>
        `;
        
        sprintList.appendChild(sprintItem);
    });
}

// Hataları görüntüleme
function renderBugs() {
    const bugList = document.getElementById('bugList');
    bugList.innerHTML = '';
    
    appData.bugs.forEach(bug => {
        const bugItem = document.createElement('div');
        bugItem.className = 'bug-item';
        
        bugItem.innerHTML = `
            <div>
                <div><strong>${bug.title}</strong></div>
                <div>${bug.description}</div>
            </div>
            <div class="bug-severity severity-${bug.severity}">
                ${bug.severity.charAt(0).toUpperCase() + bug.severity.slice(1)}
            </div>
        `;
        
        bugList.appendChild(bugItem);
    });
}

// Yayınları görüntüleme
function renderReleases() {
    const releaseList = document.getElementById('releaseList');
    releaseList.innerHTML = '';
    
    appData.releases.forEach(release => {
        const releaseItem = document.createElement('div');
        releaseItem.className = 'release-item';
        
        releaseItem.innerHTML = `
            <div><strong>${release.name}</strong></div>
            <div>Planlanan Tarih: ${release.date}</div>
            <div>Durum: ${release.status === 'planned' ? 'Planlandı' : 'Yayınlandı'}</div>
        `;
        
        releaseList.appendChild(releaseItem);
    });
}

// Özellik birikimini görüntüleme
function renderFeatureBacklog() {
    const featureBacklog = document.getElementById('featureBacklog');
    featureBacklog.innerHTML = '';
    
    appData.featureBacklog.forEach(feature => {
        const backlogItem = document.createElement('div');
        backlogItem.className = 'backlog-item';
        
        backlogItem.innerHTML = `
            <div>
                <div><strong>${feature.title}</strong></div>
                <div>${feature.description}</div>
            </div>
            <div class="backlog-votes">
                <button class="vote-btn" data-feature-id="${feature.id}">👍</button>
                <span>${feature.votes}</span>
            </div>
        `;
        
        featureBacklog.appendChild(backlogItem);
    });
    
    // Oylama butonlarına event listener ekle
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const featureId = parseInt(btn.dataset.featureId);
            const feature = appData.featureBacklog.find(f => f.id === featureId);
            if (feature) {
                feature.votes++;
                renderFeatureBacklog();
            }
        });
    });
}

// İstatistikleri güncelleme
function updateStats() {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let plannedTasks = 0;
    
    appData.kanbanData.columns.forEach(column => {
        totalTasks += column.tasks.length;
        
        if (column.title === "Tamamlandı") {
            completedTasks = column.tasks.length;
        } else if (column.title === "Devam Edenler") {
            inProgressTasks = column.tasks.length;
        } else if (column.title === "Yapılacaklar") {
            plannedTasks = column.tasks.length;
        }
    });
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('inProgressTasks').textContent = inProgressTasks;
    document.getElementById('plannedTasks').textContent = plannedTasks;
}

// Pano oluşturma
function renderKanban() {
    kanbanBoard.innerHTML = '';
    
    appData.kanbanData.columns.forEach(column => {
        const columnElement = document.createElement('div');
        columnElement.className = 'column';
        columnElement.setAttribute('data-column-id', column.id);
        
        const columnHeader = document.createElement('div');
        columnHeader.className = 'column-header';
        
        const columnTitle = document.createElement('div');
        columnTitle.className = 'column-title';
        columnTitle.textContent = column.title;
        
        const deleteColumnBtn = document.createElement('button');
        deleteColumnBtn.className = 'btn btn-danger';
        deleteColumnBtn.textContent = 'Sil';
        deleteColumnBtn.addEventListener('click', () => deleteColumn(column.id));
        
        columnHeader.appendChild(columnTitle);
        columnHeader.appendChild(deleteColumnBtn);
        
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks';
        
        column.tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
        
        columnElement.appendChild(columnHeader);
        columnElement.appendChild(tasksContainer);
        
        // Sürükle-bırak olayları
        columnElement.addEventListener('dragover', handleDragOver);
        columnElement.addEventListener('drop', handleDrop);
        
        kanbanBoard.appendChild(columnElement);
    });
    
    updateStats();
}

// Görev elementi oluşturma
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('data-task-id', task.id);
    
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    const taskTitle = document.createElement('div');
    taskTitle.className = 'task-title';
    taskTitle.textContent = task.title;
    
    const taskDelete = document.createElement('div');
    taskDelete.className = 'task-delete';
    taskDelete.textContent = '×';
    taskDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskDelete);
    
    const taskDescription = document.createElement('div');
    taskDescription.className = 'task-description';
    taskDescription.textContent = task.description;
    
    const taskFooter = document.createElement('div');
    taskFooter.className = 'task-footer';
    
    const taskPriority = document.createElement('div');
    taskPriority.className = `task-priority priority-${task.priority}`;
    
    // Öncelik etiketleri
    const priorityLabels = {
        low: 'Düşük',
        medium: 'Orta',
        high: 'Yüksek',
        critical: 'Kritik'
    };
    
    taskPriority.textContent = priorityLabels[task.priority];
    
    const taskDeadline = document.createElement('div');
    taskDeadline.className = 'task-deadline';
    
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const today = new Date();
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff < 0) {
            taskDeadline.textContent = `${Math.abs(daysDiff)} gün geçmiş`;
            taskDeadline.style.color = '#e74c3c';
        } else if (daysDiff === 0) {
            taskDeadline.textContent = 'Bugün';
            taskDeadline.style.color = '#e67e22';
        } else if (daysDiff <= 3) {
            taskDeadline.textContent = `${daysDiff} gün kaldı`;
            taskDeadline.style.color = '#e67e22';
        } else {
            taskDeadline.textContent = `${daysDiff} gün kaldı`;
        }
    }
    
    taskFooter.appendChild(taskPriority);
    taskFooter.appendChild(taskDeadline);
    
    taskElement.appendChild(taskHeader);
    taskElement.appendChild(taskDescription);
    taskElement.appendChild(taskFooter);
    
    // Sürükle-bırak olayları
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragend', handleDragEnd);
    
    return taskElement;
}

// Sütun seçiciyi doldurma
function populateColumnSelect() {
    taskColumnSelect.innerHTML = '';
    
    appData.kanbanData.columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column.id;
        option.textContent = column.title;
        taskColumnSelect.appendChild(option);
    });
}

// Yeni görev ekleme
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const columnId = parseInt(document.getElementById('taskColumn').value);
    const deadline = document.getElementById('taskDeadline').value;
    
    const newTask = {
        id: Date.now(), // Basit ID oluşturma
        title,
        description,
        priority,
        deadline,
        createdAt: new Date()
    };
    
    // Görevi ilgili sütuna ekle
    const column = appData.kanbanData.columns.find(col => col.id === columnId);
    if (column) {
        column.tasks.push(newTask);
        renderKanban();
        taskModal.style.display = 'none';
        taskForm.reset();
    }
});

// Yeni sütun ekleme
columnForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('columnTitle').value;
    
    const newColumn = {
        id: Date.now(), // Basit ID oluşturma
        title,
        tasks: []
    };
    
    appData.kanbanData.columns.push(newColumn);
    renderKanban();
    columnModal.style.display = 'none';
    columnForm.reset();
});

// Sütun silme
function deleteColumn(columnId) {
    if (appData.kanbanData.columns.length <= 1) {
        alert('En az bir sütun olmalıdır!');
        return;
    }
    
    if (confirm('Bu sütunu silmek istediğinizden emin misiniz? Sütundaki tüm görevler silinecektir.')) {
        appData.kanbanData.columns = appData.kanbanData.columns.filter(col => col.id !== columnId);
        renderKanban();
    }
}

// Görev silme
function deleteTask(taskId) {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
        appData.kanbanData.columns.forEach(column => {
            column.tasks = column.tasks.filter(task => task.id !== taskId);
        });
        renderKanban();
    }
}

// Sürükle-bırak işlevleri
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-task-id'));
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedTask = null;
    
    // Tüm sütunlardaki over sınıfını kaldır
    document.querySelectorAll('.column').forEach(col => {
        col.classList.remove('over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('over');
    
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetColumnId = parseInt(this.getAttribute('data-column-id'));
    
    // Görevi bul ve taşı
    let taskToMove = null;
    let sourceColumn = null;
    
    appData.kanbanData.columns.forEach(column => {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            taskToMove = column.tasks[taskIndex];
            sourceColumn = column;
            column.tasks.splice(taskIndex, 1);
        }
    });
    
    if (taskToMove && sourceColumn) {
        const targetColumn = appData.kanbanData.columns.find(col => col.id === targetColumnId);
        if (targetColumn) {
            targetColumn.tasks.push(taskToMove);
            renderKanban();
        }
    }
}

// Sayfa yüklendiğinde panoyu oluştur
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const sessionActive = sessionStorage.getItem('sessionActive');

    if (!loggedInUser && !sessionActive) {
        window.location.href = '../loginler/loginknbn.html';
        return; // Yönlendirme sonrası kodun çalışmasını engelle
    }

    renderKanban();
    renderRoadmap();
    updateStats();
    
    // Varsayılan olarak Kanban özelliğini aç
    document.querySelector('.feature-card[data-feature="kanban"]').click();
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        // Oturum bilgilerini temizle
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('sessionActive');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loginTime');

        // Login sayfasına yönlendir
        window.location.href = '../loginler/loginknbn.html';
    }
});