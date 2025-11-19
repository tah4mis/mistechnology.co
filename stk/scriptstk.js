// Data Storage Keys
const STORAGE_KEYS = {
    PRODUCTS: 'stokTakip_products',
    CATEGORIES: 'stokTakip_categories',
    SUPPLIERS: 'stokTakip_suppliers',
    SETTINGS: 'stokTakip_settings',
    BARCODE_HISTORY: 'stokTakip_barcodeHistory',
    WAREHOUSE_LAYOUT: 'stokTakip_warehouseLayout',
    SALES: 'stokTakip_sales'
};

// Mobil menü işlevselliği
function setupMobileMenu() {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(mobileMenuBtn);
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    mobileMenuBtn.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.remove('mobile-open');
        overlay.classList.remove('active');
    });
    
    // Pencere boyutu değiştiğinde sidebar'ı kapat
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991.98) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    });
}

// Sayfa yüklendiğinde mobil menüyü kur
document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
});
// Default Data
const DEFAULT_DATA = {
    categories: ['Elektronik', 'Giyim', 'Gıda', 'Kırtasiye', 'Diğer'],
    suppliers: ['Tedarikçi A', 'Tedarikçi B', 'Tedarikçi C'],
    settings: {
        companyName: 'ABC Stok Yönetimi',
        currency: 'TL - Türk Lirası',
        defaultWarehouse: 'Merkez Depo',
        lowStockNotification: true,
        lowStockLimit: 10,
        autoStockCount: 'Kapalı',
        autoReorder: true,
        reportAutomation: 'Kapalı'
    },
    warehouseLayout: {
        rows: 10,
        cols: 10,
        cells: {}
    }
};

// Global variables
let stockChart = null;
let categoryChart = null;
let monthlyChart = null;
let currentSaleCart = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeData();
    
    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('tr-TR');
    
    // Set default dates for reports
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('report-start-date').valueAsDate = firstDay;
    document.getElementById('report-end-date').valueAsDate = today;
    
    // Navigation
    setupNavigation();
    
    // Populate initial data
    populateInitialData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show dashboard
    showSection('dashboard');
});

// Initialize data in local storage
function initializeData() {
    // Initialize categories
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_DATA.categories));
    }
    
    // Initialize suppliers
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_DATA.suppliers));
    }
    
    // Initialize settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_DATA.settings));
    }
    
    // Initialize products
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    
    // Initialize barcode history
    if (!localStorage.getItem(STORAGE_KEYS.BARCODE_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.BARCODE_HISTORY, JSON.stringify([]));
    }
    
    // Initialize warehouse layout
    if (!localStorage.getItem(STORAGE_KEYS.WAREHOUSE_LAYOUT)) {
        localStorage.setItem(STORAGE_KEYS.WAREHOUSE_LAYOUT, JSON.stringify(DEFAULT_DATA.warehouseLayout));
    }
    
    // Initialize sales data
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    }
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Show section and update page title
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update page title
    updatePageTitle(sectionId);
    
    // Refresh section data
    refreshSectionData(sectionId);
}

// Update page title based on active section
function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': 'Stok Takip Dashboard',
        'products': 'Ürün Yönetimi',
        'sales': 'Satış İşlemleri',
        'barcode': 'Barkod İşlemleri',
        'warehouse-map': 'Depo Haritası',
        'reports': 'Raporlar ve Analizler',
        'settings': 'Sistem Ayarları'
    };
    
    document.getElementById('page-title').textContent = titles[sectionId] || 'Stok Takip Sistemi';
}

// Refresh section data
function refreshSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'products':
            refreshProducts();
            break;
        case 'sales':
            refreshSales();
            break;
        case 'barcode':
            refreshBarcode();
            break;
        case 'warehouse-map':
            refreshWarehouseMap();
            break;
        case 'reports':
            refreshReports();
            break;
        case 'settings':
            refreshSettings();
            break;
    }
}

// Populate initial data (dropdowns, etc.)
function populateInitialData() {
    // Populate category dropdowns
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES));
    const categoryDropdowns = document.querySelectorAll('select[id$="category"], select[id$="category-filter"]');
    
    categoryDropdowns.forEach(dropdown => {
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            dropdown.appendChild(option);
        });
    });
    
    // Populate supplier dropdowns
    const suppliers = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS));
    const supplierDropdown = document.getElementById('supplier-filter');
    
    if (supplierDropdown) {
        // Clear existing options except the first one
        while (supplierDropdown.options.length > 1) {
            supplierDropdown.remove(1);
        }
        
        // Add suppliers
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            supplierDropdown.appendChild(option);
        });
    }
    
    // Populate settings form
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
    document.getElementById('company-name').value = settings.companyName;
    document.getElementById('currency').value = settings.currency;
    document.getElementById('default-warehouse').value = settings.defaultWarehouse;
    document.getElementById('lowStockNotification').checked = settings.lowStockNotification;
    document.getElementById('low-stock-limit').value = settings.lowStockLimit;
    document.getElementById('auto-stock-count').value = settings.autoStockCount;
    document.getElementById('autoReorder').checked = settings.autoReorder;
    document.getElementById('report-automation').value = settings.reportAutomation;
}

// Refresh dashboard
function refreshDashboard() {
    refreshStats();
    refreshProductsTable();
    refreshWarehousePreview();
}

// Refresh stats cards
function refreshStats() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    const lowStockLimit = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).lowStockLimit;
    
    // Calculate stats
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < (p.minStock || lowStockLimit)).length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    
    // Calculate sales stats
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date === today);
    const totalTodaySales = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    // Update stats cards
    document.getElementById('stats-cards').innerHTML = `
        <div class="col-md-3">
            <div class="card stats-card">
                <i class="fas fa-boxes"></i>
                <div class="number">${totalProducts}</div>
                <div class="label">Toplam Ürün</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="number">${lowStockProducts}</div>
                <div class="label">Düşük Stok</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card">
                <i class="fas fa-shopping-cart"></i>
                <div class="number">${todaySales.length}</div>
                <div class="label">Bugünkü Satış</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card">
                <i class="fas fa-dollar-sign"></i>
                <div class="number">${totalStockValue.toFixed(2)} TL</div>
                <div class="label">Toplam Stok Değeri</div>
            </div>
        </div>
    `;
}

// Refresh products table
function refreshProductsTable() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const tableBody = document.getElementById('products-table-body');
    const emptyState = document.getElementById('empty-products');
    
    if (products.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tableBody.innerHTML = '';
    
    // Show last 5 products
    const recentProducts = products.slice(-5).reverse();
    
    recentProducts.forEach(product => {
        const stockBadge = getStockBadge(product.stock, product.minStock);
        
        const row = `
            <tr>
                <td><img src="${product.image || 'https://via.placeholder.com/60'}" class="product-image" alt="${product.name}"></td>
                <td>${product.barcode || '-'}</td>
                <td>${product.name}</td>
                <td>${product.category || '-'}</td>
                <td>${stockBadge}</td>
                <td>${product.price.toFixed(2)} TL</td>
                <td>${product.location || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-sell" data-id="${product.id}"><i class="fas fa-cash-register"></i></button>
                    <button class="action-btn btn-delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        
        tableBody.innerHTML += row;
    });
    
    // Add event listeners to action buttons
    addProductActionListeners();
}

// Refresh all products table
function refreshProducts() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const tableBody = document.getElementById('all-products-table-body');
    const emptyState = document.getElementById('empty-all-products');
    
    if (products.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const stockBadge = getStockBadge(product.stock, product.minStock);
        
        const row = `
            <tr>
                <td><img src="${product.image || 'https://via.placeholder.com/60'}" class="product-image" alt="${product.name}"></td>
                <td>${product.barcode || '-'}</td>
                <td>${product.name}</td>
                <td>${product.category || '-'}</td>
                <td>${stockBadge}</td>
                <td>${product.price.toFixed(2)} TL</td>
                <td>${product.location || '-'}</td>
                <td>
                    <button class="action-btn btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-sell" data-id="${product.id}"><i class="fas fa-cash-register"></i></button>
                    <button class="action-btn btn-delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        
        tableBody.innerHTML += row;
    });
    
    // Add event listeners to action buttons
    addProductActionListeners();
}

// Get stock badge based on stock level
function getStockBadge(stock, minStock = 10) {
    if (stock < minStock) {
        return `<span class="badge bg-danger">${stock}</span>`;
    } else if (stock < minStock * 3) {
        return `<span class="badge bg-warning">${stock}</span>`;
    } else {
        return `<span class="badge bg-success">${stock}</span>`;
    }
}

// Add event listeners to product action buttons
function addProductActionListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    // Sell buttons
    document.querySelectorAll('.btn-sell').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            showSellModal(productId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// Show sell modal
function showSellModal(productId) {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showToast('Ürün bulunamadı!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('sell-product-id').value = product.id;
    document.getElementById('sell-product-name').value = product.name;
    document.getElementById('sell-current-stock').value = product.stock;
    document.getElementById('sell-unit-price').value = product.price;
    
    // Calculate total price
    updateSellTotalPrice();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('sellProductModal'));
    modal.show();
}

// Update sell total price
function updateSellTotalPrice() {
    const quantity = parseInt(document.getElementById('sell-quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('sell-unit-price').value) || 0;
    const totalPrice = quantity * unitPrice;
    
    document.getElementById('sell-total-price').value = totalPrice.toFixed(2) + ' TL';
}

// Edit product
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showToast('Ürün bulunamadı!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('product-modal-title').textContent = 'Ürünü Düzenle';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-barcode').value = product.barcode || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-min-stock').value = product.minStock || 5;
    document.getElementById('product-cost').value = product.cost || '';
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-supplier').value = product.supplier || '';
    document.getElementById('product-location').value = product.location || '';
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-description').value = product.description || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        const updatedProducts = products.filter(p => p.id != productId);
        
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
        
        showToast('Ürün başarıyla silindi!');
        refreshDashboard();
        refreshProducts();
        refreshReports();
    }
}

// Refresh sales section
function refreshSales() {
    refreshSaleProducts();
    refreshSaleCart();
    refreshSalesHistory();
}

// Refresh sale products dropdown
function refreshSaleProducts() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const productSelect = document.getElementById('sale-product-select');
    
    // Clear existing options except the first one
    while (productSelect.options.length > 1) {
        productSelect.remove(1);
    }
    
    // Add products with stock
    products.filter(p => p.stock > 0).forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Stok: ${product.stock}) - ${product.price.toFixed(2)} TL`;
        productSelect.appendChild(option);
    });
}

// Refresh sale cart
function refreshSaleCart() {
    const cartContainer = document.getElementById('sale-cart');
    const totalElement = document.getElementById('sale-total');
    
    if (currentSaleCart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h4>Sepet Boş</h4>
                <p>Satış yapmak için ürün ekleyin</p>
            </div>
        `;
        totalElement.textContent = '0.00 TL';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    currentSaleCart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        
        cartHTML += `
            <div class="sale-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">${item.quantity} adet × ${item.price.toFixed(2)} TL = ${itemTotal.toFixed(2)} TL</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-from-cart" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = cartHTML;
    totalElement.textContent = total.toFixed(2) + ' TL';
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// Remove item from cart
function removeFromCart(index) {
    currentSaleCart.splice(index, 1);
    refreshSaleCart();
}

// Refresh sales history
function refreshSalesHistory() {
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    const tableBody = document.getElementById('sales-history-table');
    const emptyState = document.getElementById('empty-sales');
    
    if (sales.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tableBody.innerHTML = '';
    
    // Show last 10 sales
    const recentSales = sales.slice(-10).reverse();
    
    recentSales.forEach(sale => {
        const row = `
            <tr>
                <td>#${sale.id}</td>
                <td>${sale.date}</td>
                <td>${sale.items.length} ürün</td>
                <td>${sale.totalAmount.toFixed(2)} TL</td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-sale-details" data-id="${sale.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-sale-details').forEach(button => {
        button.addEventListener('click', function() {
            const saleId = this.getAttribute('data-id');
            viewSaleDetails(saleId);
        });
    });
}

// View sale details
function viewSaleDetails(saleId) {
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    const sale = sales.find(s => s.id == saleId);
    
    if (!sale) {
        showToast('Satış bulunamadı!', 'error');
        return;
    }
    
    let detailsHTML = `
        <h6>Satış Detayları - #${sale.id}</h6>
        <p><strong>Tarih:</strong> ${sale.date}</p>
        <p><strong>Toplam Tutar:</strong> ${sale.totalAmount.toFixed(2)} TL</p>
        <h6 class="mt-3">Satılan Ürünler:</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Ürün Adı</th>
                        <th>Miktar</th>
                        <th>Birim Fiyat</th>
                        <th>Toplam</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    sale.items.forEach(item => {
        detailsHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)} TL</td>
                <td>${(item.quantity * item.price).toFixed(2)} TL</td>
            </tr>
        `;
    });
    
    detailsHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    alert(detailsHTML);
}

// Complete sale
function completeSale() {
    if (currentSaleCart.length === 0) {
        showToast('Sepet boş!', 'error');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    
    // Check stock availability
    for (const cartItem of currentSaleCart) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) {
            showToast(`${cartItem.name} ürünü bulunamadı!`, 'error');
            return;
        }
        if (product.stock < cartItem.quantity) {
            showToast(`${cartItem.name} ürünü için yeterli stok yok! Mevcut: ${product.stock}`, 'error');
            return;
        }
    }
    
    // Update product stocks and create sale record
    const saleItems = [];
    let totalAmount = 0;
    
    for (const cartItem of currentSaleCart) {
        const productIndex = products.findIndex(p => p.id === cartItem.productId);
        if (productIndex !== -1) {
            // Update stock
            products[productIndex].stock -= cartItem.quantity;
            products[productIndex].updatedAt = new Date().toISOString();
            
            // Add to sale items
            saleItems.push({
                productId: cartItem.productId,
                name: cartItem.name,
                quantity: cartItem.quantity,
                price: cartItem.price
            });
            
            totalAmount += cartItem.quantity * cartItem.price;
        }
    }
    
    // Create sale record
    const newSale = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        items: saleItems,
        totalAmount: totalAmount,
        timestamp: new Date().toISOString()
    };
    
    sales.push(newSale);
    
    // Save data
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    
    // Clear cart
    currentSaleCart = [];
    refreshSaleCart();
    refreshSaleProducts();
    
    showToast(`Satış başarıyla tamamlandı! Toplam: ${totalAmount.toFixed(2)} TL`);
    
    // Refresh all data
    refreshDashboard();
    refreshProducts();
    refreshReports();
}

// Add product to sale cart
function addToSaleCart() {
    const productSelect = document.getElementById('sale-product-select');
    const quantityInput = document.getElementById('sale-quantity');
    
    const productId = productSelect.value;
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!productId) {
        showToast('Lütfen bir ürün seçin!', 'error');
        return;
    }
    
    if (quantity < 1) {
        showToast('Geçerli bir miktar girin!', 'error');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showToast('Ürün bulunamadı!', 'error');
        return;
    }
    
    // Check if product already in cart
    const existingItemIndex = currentSaleCart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        // Update quantity
        const newQuantity = currentSaleCart[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
            showToast(`Yeterli stok yok! Mevcut: ${product.stock}`, 'error');
            return;
        }
        currentSaleCart[existingItemIndex].quantity = newQuantity;
    } else {
        // Check stock
        if (quantity > product.stock) {
            showToast(`Yeterli stok yok! Mevcut: ${product.stock}`, 'error');
            return;
        }
        
        // Add new item
        currentSaleCart.push({
            productId: productId,
            name: product.name,
            quantity: quantity,
            price: product.price
        });
    }
    
    refreshSaleCart();
    quantityInput.value = 1;
    showToast('Ürün sepete eklendi!');
}

// Refresh warehouse preview
function refreshWarehousePreview() {
    const warehousePreview = document.getElementById('warehouse-preview');
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const lowStockLimit = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).lowStockLimit;
    
    warehousePreview.innerHTML = '';
    
    // Create a 5x5 grid for preview
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        const location = `A-${Math.floor(i/5)+1}-${(i%5)+1}`;
        cell.className = 'warehouse-cell';
        cell.textContent = location;
        cell.setAttribute('data-location', location);
        
        // Check if location is occupied
        const productInLocation = products.find(p => p.location === location);
        if (productInLocation) {
            cell.classList.add('occupied');
            if (productInLocation.stock < (productInLocation.minStock || lowStockLimit)) {
                cell.classList.add('low-stock');
            }
        }
        
        warehousePreview.appendChild(cell);
    }
}

// Refresh warehouse map
function refreshWarehouseMap() {
    const warehouseFullMap = document.getElementById('warehouse-full-map');
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const lowStockLimit = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).lowStockLimit;
    
    warehouseFullMap.innerHTML = '';
    
    // Create a 10x10 grid for full map
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        const location = `A-${Math.floor(i/10)+1}-${(i%10)+1}`;
        cell.className = 'warehouse-cell';
        cell.textContent = location;
        cell.setAttribute('data-location', location);
        
        // Check if location is occupied
        const productInLocation = products.find(p => p.location === location);
        if (productInLocation) {
            cell.classList.add('occupied');
            if (productInLocation.stock < (productInLocation.minStock || lowStockLimit)) {
                cell.classList.add('low-stock');
            }
        }
        
        warehouseFullMap.appendChild(cell);
    }
}

// Refresh barcode section
function refreshBarcode() {
    refreshBarcodeHistory();
}

// Refresh barcode history
function refreshBarcodeHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.BARCODE_HISTORY));
    const historyList = document.getElementById('barcode-history');
    
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="list-group-item text-center text-muted">Henüz barkod tarama geçmişi yok</li>';
        return;
    }
    
    // Show last 5 history items
    const recentHistory = history.slice(-5).reverse();
    
    recentHistory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            ${item.barcode} - ${item.productName}
            <span class="badge bg-primary rounded-pill">${new Date(item.timestamp).toLocaleDateString('tr-TR')}</span>
        `;
        historyList.appendChild(listItem);
    });
}

// Refresh reports
function refreshReports() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    const lowStockLimit = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).lowStockLimit;
    
    // Update low stock table
    const lowStockTable = document.getElementById('low-stock-table');
    const emptyLowStock = document.getElementById('empty-low-stock');
    const lowStockProducts = products.filter(p => p.stock < (p.minStock || lowStockLimit));
    
    if (lowStockProducts.length === 0) {
        lowStockTable.innerHTML = '';
        emptyLowStock.style.display = 'block';
    } else {
        emptyLowStock.style.display = 'none';
        lowStockTable.innerHTML = '';
        
        lowStockProducts.forEach(product => {
            const minStock = product.minStock || lowStockLimit;
            const deficit = minStock - product.stock;
            const row = `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.stock}</td>
                    <td>${minStock}</td>
                    <td><span class="badge bg-danger">${deficit}</span></td>
                </tr>
            `;
            lowStockTable.innerHTML += row;
        });
    }
    
    // Update top value table
    const topValueTable = document.getElementById('top-value-table');
    const emptyTopValue = document.getElementById('empty-top-value');
    
    if (products.length === 0) {
        topValueTable.innerHTML = '';
        emptyTopValue.style.display = 'block';
    } else {
        emptyTopValue.style.display = 'none';
        topValueTable.innerHTML = '';
        
        // Sort products by total value (price * stock)
        const sortedProducts = [...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock));
        
        // Show top 5 most valuable products
        const topProducts = sortedProducts.slice(0, 5);
        
        topProducts.forEach(product => {
            const totalValue = product.price * product.stock;
            const row = `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.stock}</td>
                    <td>${product.price.toFixed(2)} TL</td>
                    <td><strong>${totalValue.toFixed(2)} TL</strong></td>
                </tr>
            `;
            topValueTable.innerHTML += row;
        });
    }
    
    // Update charts with REAL sales data
    refreshCharts(sales);
}

// Refresh charts with real sales data
function refreshCharts(sales = []) {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const lowStockLimit = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).lowStockLimit;
    
    // Calculate chart data based on ACTUAL products
    const lowStockCount = products.filter(p => p.stock < (p.minStock || lowStockLimit)).length;
    const mediumStockCount = products.filter(p => 
        p.stock >= (p.minStock || lowStockLimit) && 
        p.stock < (p.minStock || lowStockLimit) * 3
    ).length;
    const highStockCount = products.filter(p => p.stock >= (p.minStock || lowStockLimit) * 3).length;
    
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES));
    
    // Calculate category values based on ACTUAL products
    const categoryValues = categories.map(category => {
        const categoryProducts = products.filter(p => p.category === category);
        return categoryProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);
    });
    
    // Calculate monthly movements based on ACTUAL sales data
    const monthlyData = calculateMonthlyMovements(sales);
    
    // Destroy existing charts if they exist
    if (stockChart) {
        stockChart.destroy();
    }
    if (categoryChart) {
        categoryChart.destroy();
    }
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    // Stock distribution chart
    const stockCtx = document.getElementById('stockChart').getContext('2d');
    stockChart = new Chart(stockCtx, {
        type: 'doughnut',
        data: {
            labels: ['Düşük Stok', 'Orta Stok', 'Yüksek Stok'],
            datasets: [{
                data: [lowStockCount, mediumStockCount, highStockCount],
                backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Stok Durumu Dağılımı'
                }
            }
        }
    });
    
    // Category value chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Stok Değeri (TL)',
                data: categoryValues,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Değer (TL)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Kategoriler'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Kategori Bazlı Stok Değerleri'
                }
            }
        }
    });
    
    // Monthly movements chart - REAL sales data
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
            datasets: [{
                label: 'Stok Girişi',
                data: monthlyData.incoming,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Stok Çıkışı (Satış)',
                data: monthlyData.outgoing,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Stok Miktarı'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Aylar'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Aylık Stok Hareketleri'
                }
            }
        }
    });
}

// Calculate monthly movements based on actual sales data
function calculateMonthlyMovements(sales) {
    const currentYear = new Date().getFullYear();
    const monthlyIncoming = new Array(12).fill(0);
    const monthlyOutgoing = new Array(12).fill(0);
    
    // Calculate outgoing from sales
    sales.forEach(sale => {
        const saleDate = new Date(sale.timestamp);
        if (saleDate.getFullYear() === currentYear) {
            const month = saleDate.getMonth();
            const totalQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            monthlyOutgoing[month] += totalQuantity;
        }
    });
    
    // Calculate incoming from product creation dates (simplified)
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    products.forEach(product => {
        if (product.createdAt) {
            const createdDate = new Date(product.createdAt);
            if (createdDate.getFullYear() === currentYear) {
                monthlyIncoming[createdDate.getMonth()] += product.stock;
            }
        }
    });
    
    return {
        incoming: monthlyIncoming,
        outgoing: monthlyOutgoing
    };
}

// Refresh settings
function refreshSettings() {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const lastBackup = localStorage.getItem('stokTakip_lastBackup');
    
    // Update system info
    document.getElementById('system-info').innerHTML = `
        <small>
            <div>Son yedekleme: ${lastBackup || 'Henüz yedek alınmadı'}</div>
            <div>Toplam kayıt: ${products.length} ürün</div>
            <div>Sistem sürümü: 2.1.4</div>
        </small>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Add product buttons
    document.getElementById('add-product-btn').addEventListener('click', showAddProductModal);
    document.getElementById('add-new-product-btn').addEventListener('click', showAddProductModal);
    
    // Save product button
    document.getElementById('save-product-btn').addEventListener('click', saveProduct);
    
    // Sell product events
    document.getElementById('sell-quantity').addEventListener('input', updateSellTotalPrice);
    document.getElementById('sell-unit-price').addEventListener('input', updateSellTotalPrice);
    document.getElementById('confirm-sell-btn').addEventListener('click', confirmSell);
    
    // Sale cart events
    document.getElementById('add-to-cart-btn').addEventListener('click', addToSaleCart);
    document.getElementById('complete-sale-btn').addEventListener('click', completeSale);
    document.getElementById('clear-cart-btn').addEventListener('click', function() {
        currentSaleCart = [];
        refreshSaleCart();
        showToast('Sepet temizlendi!');
    });
    
    // Product search in sales
    document.getElementById('sale-product-search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const productSelect = document.getElementById('sale-product-select');
        const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        
        // Filter products
        const filteredProducts = products.filter(p => 
            p.stock > 0 && (
                p.name.toLowerCase().includes(searchTerm) ||
                (p.barcode && p.barcode.includes(searchTerm))
            )
        );
        
        // Update dropdown
        while (productSelect.options.length > 1) {
            productSelect.remove(1);
        }
        
        filteredProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Stok: ${product.stock}) - ${product.price.toFixed(2)} TL`;
            productSelect.appendChild(option);
        });
    });
    
    // Generate barcode button
    document.getElementById('generate-barcode-btn').addEventListener('click', generateBarcode);
    
    // Search by barcode button
    document.getElementById('search-by-barcode-btn').addEventListener('click', searchByBarcode);
    
    // Global search
    document.getElementById('global-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value;
            if (searchTerm) {
                // Switch to products section and filter
                showSection('products');
                // In a real application, this would filter the products table
                showToast(`"${searchTerm}" için arama yapılıyor...`);
            }
        }
    });
    
    // Advanced search
    document.getElementById('search-btn').addEventListener('click', function() {
        showToast('Gelişmiş arama uygulanıyor...');
    });
    
    document.getElementById('reset-btn').addEventListener('click', function() {
        document.getElementById('category-filter').selectedIndex = 0;
        document.getElementById('stock-filter').selectedIndex = 0;
        document.getElementById('supplier-filter').selectedIndex = 0;
        document.getElementById('price-filter').selectedIndex = 0;
        
        showToast('Filtreler sıfırlandı!');
    });
    
    // Report buttons
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    document.getElementById('export-report-btn').addEventListener('click', exportReport);
    document.getElementById('print-report-btn').addEventListener('click', printReport);
    
    // Save settings buttons
    document.getElementById('save-general-settings').addEventListener('click', saveGeneralSettings);
    document.getElementById('save-stock-settings').addEventListener('click', saveStockSettings);
    
    // Data management buttons
    document.getElementById('backup-data-btn').addEventListener('click', backupData);
    document.getElementById('restore-data-btn').addEventListener('click', restoreData);
    document.getElementById('reset-all-data-btn').addEventListener('click', resetAllData);
    document.getElementById('load-sample-data-btn').addEventListener('click', loadSampleData);
}

// Show add product modal
function showAddProductModal() {
    // Reset form
    document.getElementById('add-product-form').reset();
    document.getElementById('product-modal-title').textContent = 'Yeni Ürün Ekle';
    document.getElementById('product-id').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

// Save product
function saveProduct() {
    const form = document.getElementById('add-product-form');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const productId = document.getElementById('product-id').value;
    
    const productData = {
        name: document.getElementById('product-name').value,
        barcode: document.getElementById('product-barcode').value,
        category: document.getElementById('product-category').value,
        stock: parseInt(document.getElementById('product-stock').value),
        minStock: parseInt(document.getElementById('product-min-stock').value) || 5,
        cost: parseFloat(document.getElementById('product-cost').value) || 0,
        price: parseFloat(document.getElementById('product-price').value),
        supplier: document.getElementById('product-supplier').value,
        location: document.getElementById('product-location').value,
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        updatedAt: new Date().toISOString()
    };
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new product
        productData.id = Date.now().toString();
        productData.createdAt = new Date().toISOString();
        products.push(productData);
        
        // Add to barcode history if barcode exists
        if (productData.barcode) {
            const barcodeHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.BARCODE_HISTORY));
            barcodeHistory.push({
                barcode: productData.barcode,
                productName: productData.name,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(STORAGE_KEYS.BARCODE_HISTORY, JSON.stringify(barcodeHistory));
        }
    }
    
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    
    showToast(`Ürün ${productId ? 'güncellendi' : 'eklendi'}!`);
    
    // Refresh ALL data including charts
    refreshDashboard();
    refreshProducts();
    refreshSales();
    refreshReports();
}

// Confirm sell
function confirmSell() {
    const productId = document.getElementById('sell-product-id').value;
    const quantity = parseInt(document.getElementById('sell-quantity').value);
    const unitPrice = parseFloat(document.getElementById('sell-unit-price').value);
    
    if (!productId || quantity < 1 || unitPrice <= 0) {
        showToast('Lütfen geçerli değerler girin!', 'error');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const productIndex = products.findIndex(p => p.id == productId);
    
    if (productIndex === -1) {
        showToast('Ürün bulunamadı!', 'error');
        return;
    }
    
    if (products[productIndex].stock < quantity) {
        showToast(`Yeterli stok yok! Mevcut: ${products[productIndex].stock}`, 'error');
        return;
    }
    
    // Update stock
    products[productIndex].stock -= quantity;
    products[productIndex].updatedAt = new Date().toISOString();
    
    // Create sale record
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    const newSale = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        items: [{
            productId: productId,
            name: products[productIndex].name,
            quantity: quantity,
            price: unitPrice
        }],
        totalAmount: quantity * unitPrice,
        timestamp: new Date().toISOString()
    };
    
    sales.push(newSale);
    
    // Save data
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('sellProductModal'));
    modal.hide();
    
    showToast(`Satış başarıyla tamamlandı! Toplam: ${(quantity * unitPrice).toFixed(2)} TL`);
    
    // Refresh all data
    refreshDashboard();
    refreshProducts();
    refreshSales();
    refreshReports();
}

// Generate barcode
function generateBarcode() {
    const barcodeInput = document.getElementById('barcode-input').value;
    if (barcodeInput) {
        // In a real application, this would generate an actual barcode
        const canvas = document.getElementById('barcode-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw barcode-like pattern (simulated)
        ctx.fillStyle = '#000';
        for (let i = 0; i < 30; i++) {
            const height = Math.random() > 0.3 ? 100 : 70;
            ctx.fillRect(10 + i * 8, 25, 4, height);
        }
        
        // Add barcode text
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(barcodeInput, canvas.width / 2, 150);
        
        showToast('Barkod oluşturuldu: ' + barcodeInput);
    } else {
        showToast('Lütfen bir barkod numarası girin!', 'error');
    }
}

// Search by barcode
function searchByBarcode() {
    const barcodeInput = document.getElementById('barcode-input').value;
    if (barcodeInput) {
        // Switch to products section
        showSection('products');
        
        showToast('Barkod ile arama yapılıyor: ' + barcodeInput);
        // In a real application, this would filter the products table
    } else {
        showToast('Lütfen bir barkod numarası girin!', 'error');
    }
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const format = document.getElementById('report-format').value;
    
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES));
    const lowStockLimit = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)).lowStockLimit;
    
    // Generate report content based on type
    let reportContent = '';
    let reportTitle = '';
    
    switch(reportType) {
        case 'stock':
            reportTitle = 'Stok Raporu';
            reportContent = generateStockReport(products);
            break;
        case 'sales':
            reportTitle = 'Satış Raporu';
            reportContent = generateSalesReport(sales);
            break;
        case 'category':
            reportTitle = 'Kategori Raporu';
            reportContent = generateCategoryReport(products);
            break;
        case 'low-stock':
            reportTitle = 'Düşük Stok Raporu';
            reportContent = generateLowStockReport(products, lowStockLimit);
            break;
    }
    
    // Update report container
    document.getElementById('report-date-range').textContent = 
        `${startDate} - ${endDate}`;
    document.getElementById('generated-report-content').innerHTML = reportContent;
    document.getElementById('generated-report-container').style.display = 'block';
    
    showToast(`${reportTitle} başarıyla oluşturuldu!`);
}

// Generate stock report
function generateStockReport(products) {
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const totalStockQuantity = products.reduce((sum, product) => sum + product.stock, 0);
    const averagePrice = totalStockQuantity > 0 ? totalStockValue / totalStockQuantity : 0;
    
    return `
        <div class="report-summary mb-4">
            <div class="row">
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${totalProducts}</h3>
                            <p class="mb-0">Toplam Ürün</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${totalStockValue.toFixed(2)} TL</h3>
                            <p class="mb-0">Toplam Stok Değeri</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${averagePrice.toFixed(2)} TL</h3>
                            <p class="mb-0">Ortalama Birim Fiyat</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${totalStockQuantity}</h3>
                            <p class="mb-0">Toplam Stok Miktarı</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Ürün Adı</th>
                        <th>Kategori</th>
                        <th>Stok Miktarı</th>
                        <th>Birim Fiyat</th>
                        <th>Toplam Değer</th>
                        <th>Konum</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.category || '-'}</td>
                            <td>${product.stock}</td>
                            <td>${product.price.toFixed(2)} TL</td>
                            <td>${(product.price * product.stock).toFixed(2)} TL</td>
                            <td>${product.location || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate sales report (REAL data)
function generateSalesReport(sales) {
    const filteredSales = sales; // You could filter by date range here
    
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items.length, 0);
    const averageSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    
    return `
        <div class="report-summary mb-4">
            <div class="row">
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${filteredSales.length}</h3>
                            <p class="mb-0">Toplam Satış</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${totalRevenue.toFixed(2)} TL</h3>
                            <p class="mb-0">Toplam Gelir</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${totalItems}</h3>
                            <p class="mb-0">Satılan Ürün</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h3>${averageSale.toFixed(2)} TL</h3>
                            <p class="mb-0">Ortalama Satış</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Satış No</th>
                        <th>Tarih</th>
                        <th>Ürün Sayısı</th>
                        <th>Toplam Tutar</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSales.map(sale => `
                        <tr>
                            <td>#${sale.id}</td>
                            <td>${sale.date}</td>
                            <td>${sale.items.length}</td>
                            <td>${sale.totalAmount.toFixed(2)} TL</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate category report
function generateCategoryReport(products) {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES));
    const categoryData = categories.map(category => {
        const categoryProducts = products.filter(p => p.category === category);
        const productCount = categoryProducts.length;
        const totalValue = categoryProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);
        const totalStock = categoryProducts.reduce((sum, product) => sum + product.stock, 0);
        
        return {
            category,
            productCount,
            totalValue,
            totalStock
        };
    });
    
    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Kategori</th>
                        <th>Ürün Sayısı</th>
                        <th>Toplam Stok</th>
                        <th>Toplam Değer</th>
                        <th>Ortalama Değer</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryData.map(data => `
                        <tr>
                            <td>${data.category}</td>
                            <td>${data.productCount}</td>
                            <td>${data.totalStock}</td>
                            <td>${data.totalValue.toFixed(2)} TL</td>
                            <td>${data.productCount > 0 ? (data.totalValue / data.productCount).toFixed(2) : '0.00'} TL</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate low stock report
function generateLowStockReport(products, lowStockLimit) {
    const lowStockProducts = products.filter(p => p.stock < (p.minStock || lowStockLimit));
    
    return `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>${lowStockProducts.length} ürün düşük stok seviyesinde!</strong>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Ürün Adı</th>
                        <th>Kategori</th>
                        <th>Mevcut Stok</th>
                        <th>Minimum Stok</th>
                        <th>Eksik Miktar</th>
                        <th>Önerilen Sipariş</th>
                    </tr>
                </thead>
                <tbody>
                    ${lowStockProducts.map(product => {
                        const minStock = product.minStock || lowStockLimit;
                        const deficit = minStock - product.stock;
                        const recommendedOrder = deficit * 2; // Recommend ordering twice the deficit
                        
                        return `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.category || '-'}</td>
                                <td><span class="badge bg-danger">${product.stock}</span></td>
                                <td>${minStock}</td>
                                <td>${deficit}</td>
                                <td><strong>${recommendedOrder}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Export report
function exportReport() {
    const reportType = document.getElementById('report-type').value;
    const format = document.getElementById('report-format').value;
    
    let content = document.getElementById('generated-report-content').innerHTML;
    const title = document.querySelector('#generated-report-container .card-header h5').textContent;
    const dateRange = document.getElementById('report-date-range').textContent;
    
    // Create a printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${title} - ${dateRange}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    .table { width: 100%; }
                    .card { border: 1px solid #ddd; margin-bottom: 20px; }
                    .card-header { background-color: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <p><strong>Tarih Aralığı:</strong> ${dateRange}</p>
                <hr>
                ${content}
                <hr>
                <p class="text-muted">Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
            </body>
        </html>
    `);
    printWindow.document.close();
    
    showToast('Rapor dışa aktarıldı!');
}

// Print report
function printReport() {
    const reportContainer = document.getElementById('generated-report-container');
    
    if (reportContainer.style.display === 'none') {
        showToast('Önce bir rapor oluşturun!', 'error');
        return;
    }
    
    window.print();
}

// Save general settings
function saveGeneralSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
    
    settings.companyName = document.getElementById('company-name').value;
    settings.currency = document.getElementById('currency').value;
    settings.defaultWarehouse = document.getElementById('default-warehouse').value;
    settings.lowStockNotification = document.getElementById('lowStockNotification').checked;
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    showToast('Genel ayarlar kaydedildi!');
}

// Save stock settings
function saveStockSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
    
    settings.lowStockLimit = parseInt(document.getElementById('low-stock-limit').value);
    settings.autoStockCount = document.getElementById('auto-stock-count').value;
    settings.autoReorder = document.getElementById('autoReorder').checked;
    settings.reportAutomation = document.getElementById('report-automation').value;
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    showToast('Stok ayarları kaydedildi!');
}

// Backup data
function backupData() {
    const data = {
        products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)),
        categories: JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)),
        suppliers: JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS)),
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)),
        barcodeHistory: JSON.parse(localStorage.getItem(STORAGE_KEYS.BARCODE_HISTORY)),
        warehouseLayout: JSON.parse(localStorage.getItem(STORAGE_KEYS.WAREHOUSE_LAYOUT)),
        sales: JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)),
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stok-takip-yedek-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('stokTakip_lastBackup', new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR'));
    
    showToast('Veri yedeği başarıyla alındı!');
    refreshSettings();
}

// Restore data
function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate backup file
                if (!data.products || !data.categories || !data.settings) {
                    throw new Error('Geçersiz yedek dosyası');
                }
                
                if (confirm('Mevcut verilerin üzerine yazılacak. Devam etmek istiyor musunuz?')) {
                    // Restore data
                    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
                    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
                    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data.suppliers || DEFAULT_DATA.suppliers));
                    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
                    localStorage.setItem(STORAGE_KEYS.BARCODE_HISTORY, JSON.stringify(data.barcodeHistory || []));
                    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_LAYOUT, JSON.stringify(data.warehouseLayout || DEFAULT_DATA.warehouseLayout));
                    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales || []));
                    
                    showToast('Veri yedeği başarıyla yüklendi!');
                    
                    // Refresh all data
                    populateInitialData();
                    refreshDashboard();
                    refreshProducts();
                    refreshSales();
                    refreshBarcode();
                    refreshWarehouseMap();
                    refreshReports();
                    refreshSettings();
                }
            } catch (error) {
                showToast('Yedek dosyası yüklenirken hata oluştu: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Reset all data
function resetAllData() {
    if (confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
        // Clear all data
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
        localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.BARCODE_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.WAREHOUSE_LAYOUT);
        localStorage.removeItem(STORAGE_KEYS.SALES);
        localStorage.removeItem('stokTakip_lastBackup');
        
        // Reinitialize data
        initializeData();
        
        showToast('Tüm veriler sıfırlandı!');
        
        // Refresh all data
        populateInitialData();
        refreshDashboard();
        refreshProducts();
        refreshSales();
        refreshBarcode();
        refreshWarehouseMap();
        refreshReports();
        refreshSettings();
    }
}

// Load sample data
function loadSampleData() {
    if (confirm('Örnek veriler yüklenecek. Mevcut verileriniz korunacak. Devam etmek istiyor musunuz?')) {
        const sampleProducts = [
            {
                id: '1',
                name: 'Apple iPhone 14 Pro',
                barcode: '8691234567890',
                category: 'Elektronik',
                stock: 125,
                minStock: 10,
                cost: 28000,
                price: 34999,
                supplier: 'Tedarikçi A',
                location: 'A-12-4',
                image: 'https://via.placeholder.com/60',
                description: 'Apple iPhone 14 Pro 256GB',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Samsung Galaxy S23',
                barcode: '8699876543210',
                category: 'Elektronik',
                stock: 32,
                minStock: 10,
                cost: 20000,
                price: 24999,
                supplier: 'Tedarikçi B',
                location: 'A-10-2',
                image: 'https://via.placeholder.com/60',
                description: 'Samsung Galaxy S23 256GB',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Nike Air Max',
                barcode: '8694561237890',
                category: 'Giyim',
                stock: 8,
                minStock: 15,
                cost: 1800,
                price: 2499,
                supplier: 'Tedarikçi C',
                location: 'B-05-7',
                image: 'https://via.placeholder.com/60',
                description: 'Nike Air Max 270',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // Add sample products to existing products
        const existingProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        const updatedProducts = [...existingProducts, ...sampleProducts];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
        
        showToast('Örnek veriler başarıyla yüklendi!');
        
        // Refresh all data
        refreshDashboard();
        refreshProducts();
        refreshSales();
        refreshBarcode();
        refreshWarehouseMap();
        refreshReports();
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('success-toast');
    const toastBody = document.getElementById('success-toast-body');
    
    // Update toast content
    toastBody.textContent = message;
    
    // Update toast color based on type
    const toastHeader = toastElement.querySelector('.toast-header');
    if (type === 'error') {
        toastHeader.className = 'toast-header bg-danger text-white';
    } else {
        toastHeader.className = 'toast-header bg-success text-white';
    }
    
    // Show toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}