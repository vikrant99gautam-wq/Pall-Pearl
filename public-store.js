import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://sydswktememhjapothib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZHN3a3RlbWVtaGphcG90aGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MDkwNzUsImV4cCI6MjA5ODI4NTA3NX0._0lwAmNk8o0E6WBvqyubWlIS4Q3pYhUGIaiJ5Zzpdh4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    const category = grid.dataset.category;
    let allProducts = [];
    
    // Show a loading state
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-on-surface-variant font-body-lg">Loading products...</div>';

    // Render function
    const renderProducts = (productsToRender) => {
        if (!productsToRender || productsToRender.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-on-surface-variant font-body-lg">No products found for this filter.</div>';
            return;
        }

        let html = '';
        const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[4/5]", ""];
        
        productsToRender.forEach((p, index) => {
            const aspect = aspectRatios[index % aspectRatios.length];
            const colors = p.colors || '';
            const defaultColor = colors.split(',')[0]?.trim() || '';
            
            html += `
            <a class="masonry-item block group relative" href="product-detail.html?name=${encodeURIComponent(p.name)}&price=${encodeURIComponent('₹' + p.price)}&desc=${encodeURIComponent(p.description || '')}&image=${encodeURIComponent(p.imageurl)}&category=${encodeURIComponent(p.category)}&colors=${encodeURIComponent(colors)}">
                <div class="relative overflow-hidden rounded-xl mb-4 bg-surface-container-low ${aspect}">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" alt="${p.name}" src="${p.imageurl}"/>
                    
                    ${index < 2 ? `<div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full"><span class="font-label-sm text-primary uppercase">New</span></div>` : ''}
                    
                    <!-- Hover Actions -->
                    <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <button onclick="event.preventDefault(); addToCart({name: '${p.name.replace(/'/g, "\\'")}', price: '₹${p.price}', image: '${p.imageurl}', desc: '${defaultColor}', size: 'M', color: '${defaultColor}'})" class="glass-panel w-full py-3 px-4 rounded-xl flex justify-between items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white/90">
                            <span class="font-label-sm uppercase text-on-surface">Quick Add</span>
                            <span class="material-symbols-outlined text-on-surface">shopping_bag</span>
                        </button>
                    </div>
                    <button onclick="event.preventDefault(); toggleWishlist({name: '${p.name.replace(/'/g, "\\'")}', price: '₹${p.price}', image: '${p.imageurl}', desc: '${defaultColor}'}, this)" class="wishlist-btn absolute top-4 right-4 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface hover:text-primary transition-colors opacity-0 group-hover:opacity-100 z-10" data-name="${p.name.replace(/'/g, "\\'")}">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                </div>
                <div class="flex flex-col">
                    <h3 class="font-headline-lg-mobile text-[20px] text-on-surface leading-tight mb-1">${p.name}</h3>
                    <p class="font-body-md text-on-surface-variant mb-2">${p.category}</p>
                    <p class="font-body-md font-semibold text-primary">₹${p.price}</p>
                </div>
            </a>
            `;
        });

        grid.innerHTML = html;
        
        // Also update the result count if it exists
        const countEl = document.getElementById("result-count");
        if (countEl) countEl.textContent = `${productsToRender.length} Results`;
    };

    try {
        let query = supabase.from('products').select('*').order('createdat', { ascending: false });
        
        // Filter by category if one is specified and it's not "All"
        if (category && category !== 'All' && category !== 'New Arrivals' && category !== 'Best Sellers' && category !== 'Sale') {
            query = query.eq('category', category);
        }
        
        const { data: products, error } = await query;

        if (error) throw error;
        
        allProducts = products || [];
        renderProducts(allProducts);

    } catch (e) {
        console.error("Error loading products:", e);
        grid.innerHTML = '<div class="col-span-full py-12 text-center text-error font-body-lg">Error loading products.</div>';
    }

    // Set up filter tabs
    const tabContainer = document.querySelector('.overflow-x-auto.space-x-3');
    if (tabContainer) {
        const buttons = tabContainer.querySelectorAll('button');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes from all buttons
                buttons.forEach(b => {
                    b.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
                    b.classList.add('glass-panel', 'text-on-surface', 'hover:bg-surface-container');
                });
                
                // Add active classes to clicked button
                btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
                btn.classList.remove('glass-panel', 'text-on-surface', 'hover:bg-surface-container');
                
                // Filter products based on tab text
                const filter = btn.textContent.trim().toLowerCase();
                let filteredProducts = [...allProducts];
                
                if (filter === 'all new' || filter === 'all') {
                    // Already sorted by new
                    filteredProducts = allProducts;
                } else if (filter === 'trending') {
                    // Randomly sort to simulate trending or pick a subset
                    filteredProducts = allProducts.slice().sort(() => 0.5 - Math.random()).slice(0, Math.ceil(allProducts.length * 0.7));
                } else if (filter === 'summer edit') {
                    filteredProducts = allProducts.filter(p => 
                        (p.name + " " + (p.description || "")).toLowerCase().match(/summer|cotton|light|breezy|linen/i)
                    );
                    // Fallback to random if empty
                    if (filteredProducts.length === 0) filteredProducts = allProducts.slice(0, 3);
                } else if (filter === 'florals') {
                    filteredProducts = allProducts.filter(p => 
                        (p.name + " " + (p.description || "")).toLowerCase().match(/floral|flower|print|blossom/i)
                    );
                    if (filteredProducts.length === 0) filteredProducts = allProducts.slice(0, 3);
                } else if (filter === 'evening wear') {
                    filteredProducts = allProducts.filter(p => 
                        (p.name + " " + (p.description || "")).toLowerCase().match(/evening|party|silk|dark|elegant/i)
                    );
                    if (filteredProducts.length === 0) filteredProducts = allProducts.slice(0, 3);
                }
                
                renderProducts(filteredProducts);
            });
        });
    }
});
