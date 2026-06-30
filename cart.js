// cart.js
// Handles global cart state via localStorage

const CART_KEY = 'pall_and_pearl_cart';

// Get cart from localStorage
function getCart() {
    const cartStr = localStorage.getItem(CART_KEY);
    if (!cartStr) return [];
    try {
        return JSON.parse(cartStr);
    } catch (e) {
        console.error("Error parsing cart:", e);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

// Add item to cart
// product object should look like { name: '...', price: '...', image: '...', desc: '...', size: '...' }
function addToCart(product) {
    const cart = getCart();
    
    // Check if item already exists with same name, size, sleeve, and color
    const existingItem = cart.find(item => item.name === product.name && (item.size || '') === (product.size || '') && (item.sleeve || '') === (product.sleeve || '') && (item.color || '') === (product.color || ''));
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);
    
    // Optional visual feedback
    showToast(`Added ${product.name} to bag!`);
}

function removeFromCart(productName, productSize, productSleeve, productColor) {
    let cart = getCart();
    cart = cart.filter(item => !(item.name === productName && (item.size || '') === (productSize || '') && (item.sleeve || '') === (productSleeve || '') && (item.color || '') === (productColor || '')));
    saveCart(cart);
    
    // If we are on the cart page, we should re-render
    if (window.location.pathname.endsWith('cart.html')) {
        renderCartPage();
    }
}

function updateQuantity(productName, productSize, productSleeve, productColor, delta) {
    const cart = getCart();
    const item = cart.find(i => i.name === productName && (i.size || '') === (productSize || '') && (i.sleeve || '') === (productSleeve || '') && (i.color || '') === (productColor || ''));
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            return removeFromCart(productName, productSize, productSleeve, productColor);
        }
        saveCart(cart);
        if (window.location.pathname.endsWith('cart.html')) {
            renderCartPage();
        }
    }
}

// Update the badge in the navigation bar
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Look for all cart badges (in case there are mobile/desktop variants)
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

function showToast(message) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-full shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-[100] font-label-sm uppercase tracking-widest';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    });
    
    // Animate out after 3s
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Helper to convert price string like "₹195.00" to number 195.00
function parsePrice(priceStr) {
    return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});
