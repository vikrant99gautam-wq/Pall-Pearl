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
        
        // Calculate Stats
        let totalRevenue = 0;
        let pendingCount = 0;
        let newCount = 0;
        
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        orders.forEach(order => {
            // Revenue
            if (order.total) {
                totalRevenue += parseFloat(order.total) || 0;
            }
            
            // Pending
            if (!order.status || order.status.toLowerCase() === 'pending') {
                pendingCount++;
            }
            
            // New (last 24h)
            if (order.createdat) {
                const orderDate = new Date(order.createdat);
                if ((now - orderDate) < oneDayMs) {
                    newCount++;
                }
            }
        });

        // Update Stats
        const statOrders = document.getElementById("stat-orders");
        if (statOrders) statOrders.textContent = orders.length;
        
        const statRevenue = document.getElementById("stat-revenue");
        if (statRevenue) statRevenue.textContent = `₹${totalRevenue.toFixed(2)}`;
        
        const statPending = document.getElementById("stat-pending");
        if (statPending) statPending.textContent = pendingCount;
        
        const statNew = document.getElementById("stat-new");
        if (statNew) statNew.textContent = newCount;
        
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
        let shippingInfo = null;

        if (order.items) {
            try {
                const parsedItems = JSON.parse(order.items);
                if (parsedItems && parsedItems.length > 0) {
                    
                    const actualItems = [];
                    parsedItems.forEach(item => {
                        if (item.type === 'shipping_info') shippingInfo = item;
                        else actualItems.push(item);
                    });
                    
                    itemsHtml = actualItems.map(item => {
                        let details = [];
                        if (item.size) details.push(`Size: ${item.size}`);
                        if (item.color) details.push(`Color: ${item.color}`);
                        if (item.sleeve) details.push(`Style: ${item.sleeve}`);
                        
                        let mods = item.customMod ? `<br><span class="text-primary font-medium">Mod: ${item.customMod}</span>` : '';
                        
                        return `<div class="mb-2 pb-2 border-b border-outline-variant/20 last:border-0 last:mb-0 last:pb-0">
                            <b>${item.quantity || 1}x</b> ${item.name}
                            <div class="text-xs text-on-surface-variant">${details.join(' | ')}${mods}</div>
                        </div>`;
                    }).join('');
                }
            } catch (e) {
                console.error("Error parsing order items:", e);
                itemsHtml = "Error loading details";
            }
        }
        
        let shippingHtml = '';
        if (shippingInfo) {
            shippingHtml = `
                <div class="mt-2 text-xs text-on-surface-variant border-t border-outline-variant/20 pt-2">
                    <div><b>📞</b> ${shippingInfo.phone}</div>
                    <div class="mt-1 truncate max-w-[200px]" title="${shippingInfo.address}, ${shippingInfo.city}">
                        📍 ${shippingInfo.city}, ${shippingInfo.state}
                    </div>
                </div>
            `;
        }

        html += `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="p-6 font-body-md text-on-surface">#${order.id.substring(0,8).toUpperCase()}
                    <a href="invoice.html?id=${order.id}" target="_blank" class="block mt-2 text-xs text-primary hover:underline">View Invoice</a>
                </td>
                <td class="p-6 font-body-md text-on-surface">
                    <div class="font-medium">${order.customername}</div>
                    <div class="text-sm text-on-surface-variant">${order.customeremail}</div>
                    ${shippingHtml}
                </td>
                <td class="p-6 font-body-md text-on-surface text-sm max-w-xs">
                    ${itemsHtml}
                </td>
                <td class="p-6 font-body-md text-on-surface">${date}</td>
                <td class="p-6 font-body-md font-medium text-primary">₹${parseFloat(order.total).toFixed(2)}</td>
                <td class="p-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <select class="order-status-select bg-surface border border-outline-variant rounded-lg px-2 py-1 text-sm text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" data-order-id="${order.id}">
                            <option value="Pending" ${(!order.status || order.status === 'Pending') ? 'selected' : ''}>Pending</option>
                            <option value="Processing" ${(order.status === 'Processing') ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${(order.status === 'Shipped') ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${(order.status === 'Delivered') ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${(order.status === 'Cancelled') ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="delete-order-btn text-error hover:bg-error-container p-1 rounded transition-colors" data-order-id="${order.id}" title="Delete Order">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                    <div class="status-indicator hidden text-xs text-primary mt-1">Updated!</div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Handle Order Status Updates & Deletions
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById("orders-table-body");
    if (tbody) {
        // Handle Status Change
        tbody.addEventListener('change', async (e) => {
            if (e.target.classList.contains('order-status-select')) {
                const orderId = e.target.getAttribute('data-order-id');
                const newStatus = e.target.value;
                const indicator = e.target.parentElement.nextElementSibling;
                
                e.target.disabled = true;
                
                try {
                    const { error } = await supabase
                        .from('orders')
                        .update({ status: newStatus })
                        .eq('id', orderId);
                        
                    if (error) throw error;
                    
                    indicator.classList.remove('hidden');
                    setTimeout(() => indicator.classList.add('hidden'), 2000);
                } catch (err) {
                    console.error("Error updating status:", err);
                    alert("Failed to update status. Please try again.");
                } finally {
                    e.target.disabled = false;
                }
            }
        });

        // Handle Order Deletion
        tbody.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.delete-order-btn');
            if (deleteBtn) {
                const orderId = deleteBtn.getAttribute('data-order-id');
                if (confirm("Are you sure you want to completely delete this order? This cannot be undone.")) {
                    deleteBtn.disabled = true;
                    deleteBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">refresh</span>';
                    try {
                        const { error } = await supabase
                            .from('orders')
                            .delete()
                            .eq('id', orderId);
                        
                        if (error) throw error;
                        
                        // Remove row from DOM
                        deleteBtn.closest('tr').remove();
                    } catch (err) {
                        console.error("Error deleting order:", err);
                        alert("Failed to delete order.");
                        deleteBtn.disabled = false;
                        deleteBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">delete</span>';
                    }
                }
            }
        });
    }
});

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
