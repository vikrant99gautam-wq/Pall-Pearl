import { supabase } from './supabase-config.js';

const adminEmails = ["admin@pallandpearls.com", "vikrantgautammm@gmail.com"];
const adminBody = document.getElementById("admin-body");

// Form Elements
const productForm = document.getElementById('product-form');
const pageTitle = document.getElementById('page-title');
const inputId = document.getElementById('product-id');
const inputName = document.getElementById('product-name');
const inputPrice = document.getElementById('product-price');
const inputCategory = document.getElementById('product-category');
const inputDesc = document.getElementById('product-desc');
const inputColors = document.getElementById('product-colors');

const btnSave = document.getElementById('btn-save-product');

// Parse URL for ID
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Security Check
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    if (user && adminEmails.includes(user.email)) {
        if (adminBody) adminBody.classList.remove("hidden");
        if (productId) {
            loadProduct(productId);
        }
    } else {
        window.location.href = "hero.html";
    }
});

async function loadProduct(id) {
    pageTitle.textContent = "Edit Product";
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        
        if (product) {
            inputId.value = product.id;
            inputName.value = product.name;
            inputPrice.value = product.price;
            inputCategory.value = product.category;
            inputDesc.value = product.description || '';
            inputColors.value = product.colors || '';
            
            if (product.imageurl) {
                const urls = product.imageurl.split(',').map(u => u.trim());
                for (let i = 1; i <= 3; i++) {
                    if (urls[i-1]) {
                        document.getElementById(`product-image-url-${i}`).value = urls[i-1];
                        document.getElementById(`current-image-preview-${i}`).src = urls[i-1];
                        document.getElementById(`current-image-container-${i}`).classList.remove('hidden');
                        document.getElementById(`upload-image-container-${i}`).classList.add('hidden');
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error loading product:", e);
        alert("Could not load product details.");
    }
}

// Remove Image Buttons
for (let i = 1; i <= 3; i++) {
    const btnRemoveImage = document.getElementById(`btn-remove-image-${i}`);
    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', () => {
            if (confirm("Remove this image? You will need to upload a new one or provide a URL.")) {
                document.getElementById(`product-image-url-${i}`).value = '';
                document.getElementById(`current-image-preview-${i}`).src = '';
                document.getElementById(`current-image-container-${i}`).classList.add('hidden');
                document.getElementById(`upload-image-container-${i}`).classList.remove('hidden');
                document.getElementById(`product-image-file-${i}`).value = '';
                document.getElementById(`product-image-url-input-${i}`).value = '';
            }
        });
    }
}

async function uploadImage(fileInput) {
    if (fileInput.files && fileInput.files.length > 0) {
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
            
        return publicUrlData.publicUrl;
    }
    return null;
}

// Form Submission
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = inputId.value;
        const name = inputName.value;
        const price = parseFloat(inputPrice.value);
        const category = inputCategory.value;
        const desc = inputDesc.value;
        const colors = inputColors.value;
        
        btnSave.disabled = true;
        btnSave.textContent = 'Saving...';
        
        try {
            const finalUrls = [];
            for (let i = 1; i <= 3; i++) {
                const hiddenUrl = document.getElementById(`product-image-url-${i}`).value;
                const fileInput = document.getElementById(`product-image-file-${i}`);
                const urlInput = document.getElementById(`product-image-url-input-${i}`).value;
                
                if (fileInput.files && fileInput.files.length > 0) {
                    btnSave.textContent = `Uploading Image ${i}...`;
                    const uploadedUrl = await uploadImage(fileInput);
                    if (uploadedUrl) finalUrls.push(uploadedUrl);
                } else if (urlInput) {
                    finalUrls.push(urlInput);
                } else if (hiddenUrl) {
                    finalUrls.push(hiddenUrl);
                }
            }
            
            const finalImageUrl = finalUrls.join(',');
            
            const productData = {
                name, price, category, imageurl: finalImageUrl, description: desc, colors
            };
            
            btnSave.textContent = 'Saving Details...';
            
            if (id) {
                // Update
                const { error } = await supabase.from('products').update(productData).eq('id', id);
                if (error) throw error;
            } else {
                // Add
                const { error } = await supabase.from('products').insert([productData]);
                if (error) throw error;
            }
            
            // Success, go back
            window.location.href = 'admin.html';
        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Error saving product: \n" + error.message);
            btnSave.disabled = false;
            btnSave.textContent = 'Save Product';
        }
    });
}
