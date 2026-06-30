import { supabase } from './supabase-config.js';

const form = document.getElementById('admin-login-form');
const alertBox = document.getElementById('alert-box');
const btnSubmit = document.getElementById('btn-submit');

function showAlert(message) {
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Authenticating...";
        btnSubmit.classList.add("opacity-50");
        alertBox.classList.add('hidden');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            console.error(error);
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Authenticate";
            btnSubmit.classList.remove("opacity-50");
            showAlert("Access Denied: " + error.message);
        } else {
            window.location.href = "admin.html";
        }
    });
}
