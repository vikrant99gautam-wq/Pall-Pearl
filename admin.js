import { supabase } from './supabase-config.js';

const adminEmails = ["admin@pallandpearls.com", "vikrantgautammm@gmail.com"];
const adminBody = document.getElementById("admin-body");
const btnLogout = document.getElementById("btn-admin-logout");

// Security Check
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    if (user && adminEmails.includes(user.email)) {
        // Authorized
        if (adminBody) adminBody.classList.remove("hidden");
        loadDashboardData();
    } else {
        // Unauthorized - Kick to home
        window.location.href = "hero.html";
    }
});

// Logout
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = "hero.html";
        } catch (error) {
            console.error("Error signing out", error);
        }
    });
}

// Tab Switching Logic
const tabs = ['dashboard', 'orders', 'products', 'customers'];
tabs.forEach(tab => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    if (btn) {
        btn.addEventListener('click', () => {
            // Reset all buttons
            tabs.forEach(t => {
                const b = document.getElementById(`tab-btn-${t}`);
                if (b) {
                    b.classList.remove('bg-primary', 'text-on-primary');
                    b.classList.add('text-on-surface-variant', 'hover:bg-surface-container-highest');
                }
                const panel = document.getElementById(`tab-${t}`);
                if (panel) panel.classList.add('hidden');
            });
            
            // Activate clicked
            btn.classList.add('bg-primary', 'text-on-primary');
            btn.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-highest');
            
            const activePanel = document.getElementById(`tab-${tab}`);
            if (activePanel) activePanel.classList.remove('hidden');
            
            if (tab === 'products') loadProductsData();
        });
    }
});

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('createdat', { ascending: false });
            
        if (error) throw error;
        
        // Update Stats
        const statOrders = document.getElementById("stat-orders");
        if (statOrders) statOrders.textContent = orders.length;
        
        // Render Orders Table
        renderOrdersTable(orders);
        
    } catch (e) {
        console.error("Error loading admin data: ", e);
        alert("Dashboard Error: " + e.message);
        const tbody = document.getElementById("orders-table-body");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-error">Error loading orders. Check console.</td></tr>`;
        }
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById("orders-table-body");
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center font-body-md text-on-surface-variant">No orders found.</td></tr>`;
        return;
    }
    
    let html = "";
    orders.forEach(order => {
        const date = order.createdat ? new Date(order.createdat).toLocaleDateString() : 'N/A';
        html += `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="p-6 font-body-md text-on-surface">#${order.id.substring(0,8).toUpperCase()}</td>
                <td class="p-6 font-body-md text-on-surface">
                    <div class="font-medium">${order.customername}</div>
                    <div class="text-sm text-on-surface-variant">${order.customeremail}</div>
                </td>
                <td class="p-6 font-body-md text-on-surface">${date}</td>
                <td class="p-6 font-body-md font-medium text-primary">₹${parseFloat(order.total).toFixed(2)}</td>
                <td class="p-6">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm uppercase tracking-widest text-xs">
                        ${order.status || 'Pending'}
                    </span>
                </td>
                <td class="p-6 text-right">
                    <button class="text-primary hover:opacity-70 transition-opacity font-label-sm uppercase tracking-widest text-sm font-semibold">View</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// --- PRODUCT MANAGEMENT ---
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const btnAddProduct = document.getElementById('btn-add-product');
const btnCloseProductModal = document.getElementById('btn-close-product-modal');
const btnCancelProduct = document.getElementById('btn-cancel-product');
const modalTitle = document.getElementById('product-modal-title');

// Open Modal for Add
if (btnAddProduct) {
    btnAddProduct.addEventListener('click', () => {
        productForm.reset();
        document.getElementById('product-id').value = '';
        modalTitle.textContent = 'Add Product';
        productModal.classList.remove('hidden');
        productModal.classList.add('flex');
    });
}

function closeProductModal() {
    productModal.classList.add('hidden');
    productModal.classList.remove('flex');
}

if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductModal);
if (btnCancelProduct) btnCancelProduct.addEventListener('click', closeProductModal);

let allProducts = [];
let currentCategoryFilter = 'All';

// Category Filter Logic
const filterBtns = document.querySelectorAll('#product-category-filters .filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class
        filterBtns.forEach(b => {
            b.classList.remove('bg-primary', 'text-on-primary', 'border-primary');
            b.classList.add('bg-surface-container-low', 'text-on-surface');
        });
        
        const clicked = e.currentTarget;
        clicked.classList.remove('bg-surface-container-low', 'text-on-surface');
        clicked.classList.add('bg-primary', 'text-on-primary', 'border-primary');
        
        currentCategoryFilter = clicked.dataset.category;
        renderProductsTable();
    });
});

// Load Products
async function loadProductsData() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('createdat', { ascending: false });
            
        if (error) throw error;
        
        allProducts = products || [];
        renderProductsTable();
    } catch (e) {
        console.error("Error loading products: ", e);
        alert("Products Error: " + e.message);
        const tbody = document.getElementById("products-table-body");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-error">Error loading products. Check console.</td></tr>`;
        }
    }
}

function renderProductsTable() {
    const tbody = document.getElementById("products-table-body");
    if (!tbody) return;
    
    let filteredProducts = allProducts;
    if (currentCategoryFilter !== 'All') {
        filteredProducts = allProducts.filter(p => p.category === currentCategoryFilter);
    }
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center font-body-md text-on-surface-variant">No products found in this category.</td></tr>`;
        return;
    }
    
    let html = "";
    filteredProducts.forEach(product => {
        const prodData = encodeURIComponent(JSON.stringify(product));
        html += `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="p-4">
                    <img src="${product.imageurl || 'https://via.placeholder.com/80'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg border border-outline-variant/30">
                </td>
                <td class="p-4 font-body-md text-on-surface font-medium">${product.name}</td>
                <td class="p-4 font-body-md text-on-surface-variant">${product.category}</td>
                <td class="p-4 font-body-md font-medium text-primary">₹${parseFloat(product.price).toFixed(2)}</td>
                <td class="p-4 text-right">
                    <button onclick="editProduct('${prodData}')" class="text-primary hover:opacity-70 transition-opacity font-label-sm uppercase tracking-widest text-sm font-semibold mr-4">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" class="text-error hover:opacity-70 transition-opacity font-label-sm uppercase tracking-widest text-sm font-semibold">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Add/Edit Product Submission
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const category = document.getElementById('product-category').value;
        const desc = document.getElementById('product-desc').value;
        const colors = document.getElementById('product-colors').value;
        
        let imageUrl = document.getElementById('product-image').value;
        const fileInput = document.getElementById('product-image-file');
        
        const btnSave = document.getElementById('btn-save-product');
        btnSave.disabled = true;
        btnSave.textContent = 'Saving...';
        
        try {
            // Handle file upload if a file is selected
            if (fileInput.files.length > 0) {
                btnSave.textContent = 'Uploading Image...';
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file);
                
                if (uploadError) throw uploadError;
                
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);
                    
                imageUrl = publicUrlData.publicUrl;
            }
            
            const productData = {
                name, price, category, imageurl: imageUrl, description: desc, colors
            };
            
            if (id) {
                // Update
                const { error } = await supabase.from('products').update(productData).eq('id', id);
                if (error) throw error;
            } else {
                // Add
                const { error } = await supabase.from('products').insert([productData]);
                if (error) throw error;
            }
            
            closeProductModal();
            loadProductsData(); // Reload table
        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Error saving product: \n" + error.message);
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = 'Save Product';
        }
    });
}

// Global functions for inline event handlers
window.editProduct = (encodedData) => {
    const product = JSON.parse(decodeURIComponent(encodedData));
    
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.imageurl || '';
    document.getElementById('product-image-file').value = ''; // Reset file input
    document.getElementById('product-desc').value = product.description;
    document.getElementById('product-colors').value = product.colors || '';
    
    modalTitle.textContent = 'Edit Product';
    productModal.classList.remove('hidden');
    productModal.classList.add('flex');
};

window.deleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            loadProductsData();
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert("Error deleting product: " + error.message);
        }
    }
};
