import { supabase } from './supabase-config.js';

const adminEmails = ["admin@pallandpearls.com", "vikrantgautammm@gmail.com", "avnithetic@gmail.com"];
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
        
        let itemsHtml = '<span class="text-on-surface-variant italic">No details</span>';
        if (order.items) {
            try {
                const items = JSON.parse(order.items);
                if (items && items.length > 0) {
                    itemsHtml = items.map(item => {
                        let details = [];
                        if (item.size) details.push(`Size: ${item.size}`);
                        if (item.color) details.push(`Color: ${item.color}`);
                        if (item.sleeve) details.push(`Style: ${item.sleeve}`);
                        
                        let mods = item.customMod ? `<br><span class="text-primary font-medium">Mod: ${item.customMod}</span>` : '';
                        
                        return `<div class="mb-2 pb-2 border-b border-outline-variant/20 last:border-0 last:mb-0 last:pb-0">
                            <b>${item.quantity}x</b> ${item.name}
                            <div class="text-xs text-on-surface-variant">${details.join(' | ')}${mods}</div>
                        </div>`;
                    }).join('');
                }
            } catch (e) {
                console.error("Error parsing order items:", e);
                itemsHtml = "Error loading details";
            }
        }
        
        html += `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="p-6 font-body-md text-on-surface">#${order.id.substring(0,8).toUpperCase()}</td>
                <td class="p-6 font-body-md text-on-surface">
                    <div class="font-medium">${order.customername}</div>
                    <div class="text-sm text-on-surface-variant">${order.customeremail}</div>
                </td>
                <td class="p-6 font-body-md text-on-surface text-sm max-w-xs">
                    ${itemsHtml}
                </td>
                <td class="p-6 font-body-md text-on-surface">${date}</td>
                <td class="p-6 font-body-md font-medium text-primary">₹${parseFloat(order.total).toFixed(2)}</td>
                <td class="p-6 text-right">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm uppercase tracking-widest text-xs">
                        ${order.status || 'Pending'}
                    </span>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// --- PRODUCT MANAGEMENT ---
const btnAddProduct = document.getElementById('btn-add-product');

// Open Dedicated Page for Add
if (btnAddProduct) {
    btnAddProduct.addEventListener('click', () => {
        window.location.href = 'admin-product-form.html';
    });
}

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
        const firstImage = product.imageurl ? product.imageurl.split(',')[0].trim() : 'https://via.placeholder.com/80';
        html += `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="p-4">
                    <img src="${firstImage}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg border border-outline-variant/30">
                </td>
                <td class="p-4 font-body-md text-on-surface font-medium">${product.name}</td>
                <td class="p-4 font-body-md text-on-surface-variant">${product.category}</td>
                <td class="p-4 font-body-md font-medium text-primary">₹${parseFloat(product.price).toFixed(2)}</td>
                <td class="p-4 text-right">
                    <button onclick="editProduct('${product.id}')" class="text-primary hover:opacity-70 transition-opacity font-label-sm uppercase tracking-widest text-sm font-semibold mr-4">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" class="text-error hover:opacity-70 transition-opacity font-label-sm uppercase tracking-widest text-sm font-semibold">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Global functions for inline event handlers
window.editProduct = (id) => {
    window.location.href = 'admin-product-form.html?id=' + id;
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
