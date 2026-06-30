// wishlist.js
// Handles global wishlist state via localStorage

const WISHLIST_KEY = 'pall_and_pearl_wishlist';

// Get wishlist from localStorage
function getWishlist() {
    const listStr = localStorage.getItem(WISHLIST_KEY);
    if (!listStr) return [];
    try {
        return JSON.parse(listStr);
    } catch (e) {
        console.error("Error parsing wishlist:", e);
        return [];
    }
}

// Save wishlist to localStorage
function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    updateWishlistBadge();
}

// Toggle item in wishlist
function toggleWishlist(product, buttonElement) {
    let list = getWishlist();
    const existingIndex = list.findIndex(item => item.name === product.name);
    
    if (existingIndex >= 0) {
        // Remove it
        list.splice(existingIndex, 1);
        if (buttonElement) {
            buttonElement.classList.remove('text-primary');
            buttonElement.classList.add('text-on-surface');
            // Try to find the inner span to change it to an unfilled heart if using filled/unfilled icons
            const icon = buttonElement.querySelector('span');
            if (icon) {
                icon.style.fontVariationSettings = "'FILL' 0";
            }
        }
        showToast(`Removed ${product.name} from wishlist.`);
    } else {
        // Add it
        list.push(product);
        if (buttonElement) {
            buttonElement.classList.remove('text-on-surface');
            buttonElement.classList.add('text-primary');
            const icon = buttonElement.querySelector('span');
            if (icon) {
                icon.style.fontVariationSettings = "'FILL' 1";
            }
        }
        showToast(`Added ${product.name} to wishlist!`);
    }
    
    saveWishlist(list);
    
    // If we are on the wishlist page, re-render
    if (window.location.pathname.endsWith('wishlist.html')) {
        renderWishlistPage();
    }
}

function removeFromWishlist(productName) {
    let list = getWishlist();
    list = list.filter(item => item.name !== productName);
    saveWishlist(list);
    
    if (window.location.pathname.endsWith('wishlist.html')) {
        renderWishlistPage();
    }
}

// Update the badge in the navigation bar
function updateWishlistBadge() {
    const list = getWishlist();
    const totalItems = list.length;
    
    // Look for all wishlist badges
    const badges = document.querySelectorAll('.wishlist-badge');
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Make sure the toast exists (it might have been created by cart.js, but we ensure it here too)
function showToast(message) {
    let toast = document.getElementById('cart-toast'); // Re-use the same toast container
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-full shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-[100] font-label-sm uppercase tracking-widest';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    });
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Initialize on load to set proper heart states
document.addEventListener("DOMContentLoaded", () => {
    updateWishlistBadge();
    
    // Auto-fill hearts on page load for items already in wishlist
    // This requires the buttons to have a data-product-name attribute or something similar, 
    // but since we are generating the buttons dynamically we'll try to find them if possible.
    const list = getWishlist();
    if (list.length > 0) {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        wishlistButtons.forEach(btn => {
            const name = btn.getAttribute('data-name');
            if (name && list.some(i => i.name === name)) {
                btn.classList.remove('text-on-surface');
                btn.classList.add('text-primary');
                const icon = btn.querySelector('span');
                if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            }
        });
    }
});
