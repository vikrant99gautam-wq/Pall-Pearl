import { supabase } from './supabase-config.js';

// DOM Elements - Auth Page
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const alertBox = document.getElementById('alert-box');

// DOM Elements - Profile Page
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileInitial = document.getElementById('profile-initial');
const btnLogout = document.getElementById('btn-logout');

// DOM Elements - Cart Checkout
const btnCheckout = document.getElementById('btn-checkout');

// Utility to show alerts
function showAlert(message, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `mb-6 p-4 rounded-xl text-sm font-medium ${
        type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'
    }`;
    alertBox.classList.remove('hidden');
}

// Toggle Tabs on Auth Page
if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
        formLogin.classList.remove('hidden');
        formSignup.classList.add('hidden');
        
        tabLogin.classList.replace('text-on-surface-variant', 'text-primary');
        tabLogin.classList.add('border-b-2', 'border-primary');
        
        tabSignup.classList.replace('text-primary', 'text-on-surface-variant');
        tabSignup.classList.remove('border-b-2', 'border-primary');
        
        if (alertBox) alertBox.classList.add('hidden');
    });

    tabSignup.addEventListener('click', () => {
        formSignup.classList.remove('hidden');
        formLogin.classList.add('hidden');
        
        tabSignup.classList.replace('text-on-surface-variant', 'text-primary');
        tabSignup.classList.add('border-b-2', 'border-primary');
        
        tabLogin.classList.replace('text-primary', 'text-on-surface-variant');
        tabLogin.classList.remove('border-b-2', 'border-primary');
        
        if (alertBox) alertBox.classList.add('hidden');
    });
}

// Handle Login Submission
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            showAlert("Error: " + error.message);
            console.error(error);
        } else {
            // Redirect happens in onAuthStateChange
        }
    });
}

// Handle Sign Up Submission
if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name
                }
            }
        });
        
        if (error) {
            console.error(error);
            showAlert("Error: " + error.message);
        } else {
            showAlert("Success! You can now log in.", "success");
            // If email confirmation is off, it auto logs in
        }
    });
}

// Handle Logout
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            // Redirect happens in onAuthStateChange
        } catch (error) {
            console.error("Error signing out", error);
        }
    });
}

// Auth State Observer
supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user;
    const isAuthPage = window.location.pathname.endsWith('auth.html');
    const isProfilePage = window.location.pathname.endsWith('profile.html');

    if (user) {
        // User is logged in
        if (isAuthPage) {
            window.location.href = 'profile.html'; // Redirect away from login
        }
        
        if (isProfilePage && profileName && profileEmail) {
            const displayName = user.user_metadata?.display_name || "Fashion Lover";
            profileName.textContent = displayName;
            profileEmail.textContent = user.email;
            if (displayName) {
                profileInitial.textContent = displayName.charAt(0).toUpperCase();
            } else {
                profileInitial.textContent = user.email.charAt(0).toUpperCase();
            }
        }
        
        // Update global nav profile link
        updateNavProfileLink('profile.html');
        
        if (btnCheckout) {
            btnCheckout.onclick = async () => {
                try {
                    // Check if cart is empty
                    let cart = [];
                    try {
                        cart = JSON.parse(localStorage.getItem('cart')) || [];
                    } catch (e) {
                        cart = [];
                    }
                    
                    if (cart.length === 0) {
                        showAlert("Your cart is empty!", "error");
                        return;
                    }

                    // Calculate total
                    let total = 0;
                    cart.forEach(item => {
                        let price = parseFloat(item.price.replace('₹', ''));
                        total += price * item.quantity;
                    });

                    // Disable button
                    btnCheckout.disabled = true;
                    btnCheckout.textContent = "Processing...";
                    btnCheckout.classList.add("opacity-50");

                    const displayName = user.user_metadata?.display_name || "Unknown";

                    // Create order in Supabase
                    const { data, error } = await supabase.from('orders').insert([{
                        customername: displayName,
                        customeremail: user.email,
                        total: total,
                        status: "Pending",
                        items: JSON.stringify(cart)
                    }]).select();
                    
                    if (error) throw error;

                    // Clear cart
                    localStorage.setItem('cart', JSON.stringify([]));
                    
                    // Alert and redirect
                    const orderId = data[0].id;
                    alert(`Order #${orderId.substring(0,8).toUpperCase()} placed successfully!`);
                    window.location.href = "profile.html";

                } catch (e) {
                    console.error("Error placing order:", e);
                    showAlert("Failed to place order. Please try again.", "error");
                    btnCheckout.disabled = false;
                    btnCheckout.textContent = "Proceed to Checkout";
                    btnCheckout.classList.remove("opacity-50");
                }
            };
        }
        
    } else {
        // User is logged out
        if (isProfilePage) {
            window.location.href = 'auth.html'; // Redirect to login
        }
        
        // Update global nav profile link
        updateNavProfileLink('auth.html');
        
        if (btnCheckout) {
            btnCheckout.onclick = () => {
                alert("Please log in or create an account to place an order.");
                window.location.href = 'auth.html';
            };
        }
    }
});

// Helper to update navigation icon globally
function updateNavProfileLink(targetUrl) {
    const profileLinks = document.querySelectorAll('.nav-profile-link');
    profileLinks.forEach(link => {
        link.href = targetUrl;
    });
}
