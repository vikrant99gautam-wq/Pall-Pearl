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
const tabs = ['dashboard', 'orders', 'products', 'discounts', 'banners'];
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
            if (tab === 'discounts') loadCouponsData();
            if (tab === 'banners') loadBannersData();
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

// --- MOBILE SIDEBAR LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const btnOpenSidebar = document.getElementById('btn-open-sidebar');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const adminSidebar = document.getElementById('admin-sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function openSidebar() {
        if (adminSidebar && mobileOverlay) {
            mobileOverlay.classList.remove('hidden');
            // small delay for transition
            setTimeout(() => {
                mobileOverlay.classList.remove('opacity-0');
                adminSidebar.classList.remove('-translate-x-full');
                adminSidebar.classList.add('translate-x-0');
            }, 10);
        }
    }

    function closeSidebar() {
        if (adminSidebar && mobileOverlay) {
            adminSidebar.classList.remove('translate-x-0');
            adminSidebar.classList.add('-translate-x-full');
            mobileOverlay.classList.add('opacity-0');
            setTimeout(() => {
                mobileOverlay.classList.add('hidden');
            }, 300); // match transition duration
        }
    }

    if (btnOpenSidebar) btnOpenSidebar.addEventListener('click', openSidebar);
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeSidebar);
    
    // Auto-close sidebar on mobile when a tab is clicked
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth < 768) { // md breakpoint
                closeSidebar();
            }
        });
    });
});

// -------------------------------------------------------------
// COUPON MANAGEMENT LOGIC
// -------------------------------------------------------------
const couponModal = document.getElementById('coupon-modal');
const btnAddCoupon = document.getElementById('btn-add-coupon');
const btnCloseCouponModal = document.getElementById('btn-close-coupon-modal');
const couponForm = document.getElementById('coupon-form');
const btnSaveCoupon = document.getElementById('btn-save-coupon');
const couponsTableBody = document.getElementById('coupons-table-body');

if (btnAddCoupon) {
    btnAddCoupon.addEventListener('click', () => {
        couponForm.reset();
        couponModal.classList.remove('hidden');
    });
}
if (btnCloseCouponModal) {
    btnCloseCouponModal.addEventListener('click', () => {
        couponModal.classList.add('hidden');
    });
}

window.loadCouponsData = async function() {
    if (!couponsTableBody) return;
    
    try {
        const { data: coupons, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!coupons || coupons.length === 0) {
            couponsTableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center font-body-md text-on-surface-variant">No coupons found.</td></tr>`;
            return;
        }
        
        let html = '';
        coupons.forEach(coupon => {
            const statusClass = coupon.is_active ? 'text-primary bg-primary-fixed/20' : 'text-on-surface-variant bg-surface-container-highest';
            const statusText = coupon.is_active ? 'Active' : 'Inactive';
            
            html += `
                <tr class="hover:bg-surface-container-highest transition-colors">
                    <td class="p-6 font-body-md text-on-surface font-semibold tracking-wider">${coupon.code}</td>
                    <td class="p-6 font-body-md text-on-surface">${coupon.discount_percentage}%</td>
                    <td class="p-6 font-body-md text-on-surface">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">${statusText}</span>
                    </td>
                    <td class="p-6 text-right">
                        <button onclick="toggleCouponStatus('${coupon.id}', ${!coupon.is_active})" class="p-2 text-on-surface-variant hover:text-primary transition-colors" title="${coupon.is_active ? 'Deactivate' : 'Activate'}">
                            <span class="material-symbols-outlined">${coupon.is_active ? 'toggle_on' : 'toggle_off'}</span>
                        </button>
                        <button onclick="deleteCoupon('${coupon.id}')" class="p-2 text-on-surface-variant hover:text-error transition-colors" title="Delete Coupon">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        });
        couponsTableBody.innerHTML = html;
        
    } catch (e) {
        console.error("Error loading coupons: ", e);
        couponsTableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-error">Error loading coupons. Note: Supabase 'coupons' table must exist.</td></tr>`;
    }
}

if (couponForm) {
    couponForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('coupon-code').value.trim().toUpperCase();
        const discount_percentage = parseFloat(document.getElementById('coupon-discount').value);
        const is_active = document.getElementById('coupon-active').checked;
        
        if (!code || isNaN(discount_percentage)) return;
        
        btnSaveCoupon.disabled = true;
        btnSaveCoupon.textContent = 'Saving...';
        
        try {
            const { error } = await supabase
                .from('coupons')
                .insert([{ code, discount_percentage, is_active }]);
                
            if (error) {
                if (error.code === '23505') {
                    throw new Error('Coupon code already exists.');
                }
                throw error;
            }
            
            couponModal.classList.add('hidden');
            window.loadCouponsData();
        } catch (error) {
            console.error("Error saving coupon", error);
            alert("Error: " + error.message);
        } finally {
            btnSaveCoupon.disabled = false;
            btnSaveCoupon.textContent = 'Save Coupon';
        }
    });
}

window.toggleCouponStatus = async function(id, newState) {
    if(!confirm(`Are you sure you want to ${newState ? 'activate' : 'deactivate'} this coupon?`)) return;
    try {
        const { error } = await supabase.from('coupons').update({ is_active: newState }).eq('id', id);
        if (error) throw error;
        window.loadCouponsData();
    } catch (e) {
        console.error("Error toggling coupon", e);
        alert("Failed to update coupon status.");
    }
};

window.deleteCoupon = async function(id) {
    if(!confirm("Are you sure you want to completely delete this coupon?")) return;
    try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        window.loadCouponsData();
    } catch (e) {
        console.error("Error deleting coupon", e);
        alert("Failed to delete coupon.");
    }
};
const btnSaveBanners = document.getElementById('btn-save-banners');
if (btnSaveBanners) {
    btnSaveBanners.addEventListener('click', async () => {
        btnSaveBanners.disabled = true;
        const originalText = btnSaveBanners.innerHTML;
        btnSaveBanners.innerHTML = `<span class="material-symbols-outlined">sync</span> Saving...`;
        
        try {
            const { data: banners } = await supabase.from('homepage_banners').select('*');
            
            for (const banner of banners) {
                const fileInput = document.getElementById(`file-${banner.id}`);
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `banner_${banner.id}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
                    
                    // Upload to product-images bucket
                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, file);
                        
                    if (uploadError) throw uploadError;
                    
                    const { data: publicUrlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName);
                        
                    // Update Database
                    const { error: updateError } = await supabase
                        .from('homepage_banners')
                        .update({ image_url: publicUrlData.publicUrl })
                        .eq('id', banner.id);
                        
                    if (updateError) throw updateError;
                }
            }
            
            alert("Banners updated successfully!");
            loadBannersData(); // Refresh UI
            
        } catch (e) {
            console.error(e);
            alert("Error saving banners: " + e.message);
        } finally {
            btnSaveBanners.disabled = false;
            btnSaveBanners.innerHTML = originalText;
        }
    });
}

// ==========================================
// BANNERS LOGIC
// ==========================================
async function loadBannersData() {
    const bannersGrid = document.getElementById('banners-grid');
    try {
        const { data: banners, error } = await supabase
            .from('homepage_banners')
            .select('*');
            
        if (error) throw error;
        
        const dimensions = {
            'new_arrivals': 'Recommended Size: 800x1200 (Portrait)',
            'tops': 'Recommended Size: 800x800 (Square)',
            'kurtis': 'Recommended Size: 800x1000 (Portrait)',
            'coord_sets': 'Recommended Size: 800x700 (Landscape)',
            'summer_edit': 'Recommended Size: 1000x800 (Landscape)',
            'festive_edit': 'Recommended Size: 800x800 (Square)',
            'hero_main': 'Recommended Size: 800x1200 (Portrait)',
            'hero_side': 'Recommended Size: 800x1200 (Portrait)',
            'hero_small': 'Recommended Size: 600x600 (Square)'
        };
        
        let html = '';
        banners.forEach(banner => {
            html += `
                <div class="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                    <h3 class="font-headline-lg-mobile text-xl text-primary">${banner.title}</h3>
                    <p class="text-on-surface-variant font-label-sm">${banner.subtitle}</p>
                    
                    <div class="w-full h-48 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center relative">
                        <img src="${banner.image_url}" id="preview-${banner.id}" class="w-full h-full object-cover" onerror="this.src=''; this.alt='No Image'">
                    </div>
                    
                    <div>
                        <label class="block font-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Upload New Image</label>
                        <input type="file" id="file-${banner.id}" accept="image/*" class="w-full font-body-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-fixed file:text-on-primary-fixed hover:file:bg-primary-fixed-dim">
                        <p class="text-[11px] text-on-surface-variant mt-2 italic">${dimensions[banner.id] || 'Upload a high-quality image'}</p>
                    </div>
                </div>
            `;
        });
        
        bannersGrid.innerHTML = html;
        
    } catch (e) {
        console.error("Error loading banners:", e);
        bannersGrid.innerHTML = `<div class="col-span-full p-6 text-center text-error">Failed to load banners. Make sure you ran the SQL script!</div>`;
    }
}
