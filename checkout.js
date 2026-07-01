import { supabase } from './supabase-config.js';

// Update this to the seller's actual WhatsApp number (include country code without + or 00)
const SELLER_WHATSAPP = "918077021923"; 

document.addEventListener('DOMContentLoaded', () => {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');
    const btnWhatsappCheckout = document.getElementById('btn-whatsapp-checkout');
    
    // Load items for checkout (either from direct buy now or from cart)
    let checkoutCart = [];
    try {
        checkoutCart = JSON.parse(localStorage.getItem('checkout_cart')) || [];
    } catch (e) {
        checkoutCart = [];
    }

    if (checkoutCart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p class="text-on-surface-variant font-body-md py-4">No items to checkout.</p>';
        btnWhatsappCheckout.disabled = true;
        btnWhatsappCheckout.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    // Render items and calculate totals
    let totalAmount = 0;
    let itemsHtml = '';
    
    checkoutCart.forEach(item => {
        let price = parseFloat(String(item.price || '0').replace('₹', '').replace(/,/g, '')) || 0;
        let itemTotal = price * (item.quantity || 1);
        totalAmount += itemTotal;
        
        let details = [];
        if(item.size) details.push(`Size: ${item.size}`);
        if(item.color) details.push(`Color: ${item.color}`);
        if(item.sleeve) details.push(`Style: ${item.sleeve}`);
        const detailsStr = details.length > 0 ? `<p class="text-xs text-on-surface-variant mt-1">${details.join(' | ')}</p>` : '';

        const imgUrl = item.image ? item.image.split(',')[0].trim() : 'https://placehold.co/100x120/f1dee1/a43560?text=P+&+P';

        itemsHtml += `
            <div class="flex gap-4 items-start pb-4 mb-4 border-b border-outline-variant/30 last:border-0 last:pb-0 last:mb-0">
                <img src="${imgUrl}" alt="${item.name}" class="w-16 h-20 object-cover rounded-md bg-surface-container-highest flex-shrink-0">
                <div class="flex-grow min-w-0">
                    <h4 class="font-body-md text-on-surface font-medium truncate">${item.name}</h4>
                    ${detailsStr}
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-sm text-on-surface-variant">Qty: ${item.quantity}</span>
                        <span class="font-medium text-primary">₹${itemTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        `;
    });

    checkoutItemsContainer.innerHTML = itemsHtml;
    
    const formattedTotal = '₹' + totalAmount.toLocaleString('en-IN');
    checkoutSubtotal.textContent = formattedTotal;
    checkoutTotal.textContent = formattedTotal;

    // Handle WhatsApp Checkout
    btnWhatsappCheckout.addEventListener('click', async (e) => {
        e.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const pincode = document.getElementById('pincode').value.trim();

        // Basic validation
        if (!fullName || !phone || !address || !city || !state || !pincode) {
            alert('Please fill in all required fields (marked with *).');
            return;
        }

        // Change button state
        const originalBtnText = btnWhatsappCheckout.innerHTML;
        btnWhatsappCheckout.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Processing...';
        btnWhatsappCheckout.disabled = true;

        try {
            // Bundle shipping info into the items array for the admin dashboard
            const itemsWithShipping = [...checkoutCart, {
                type: 'shipping_info',
                phone: phone,
                address: address,
                city: city,
                state: state,
                pincode: pincode
            }];

            // Try to get logged in user
            let customerEmail = email || 'N/A';
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.email) {
                    customerEmail = user.email;
                }
            } catch (e) {
                console.warn("Could not get auth user for checkout", e);
            }

            // Save to Supabase
            const { data: orderData, error } = await supabase
                .from('orders')
                .insert([
                    {
                        customername: fullName,
                        customeremail: customerEmail,
                        total: totalAmount,
                        items: JSON.stringify(itemsWithShipping),
                        status: 'Pending'
                    }
                ])
                .select();

            if (error) throw error;
            
            const orderId = orderData[0].id;

            // Save locally for quick invoice access
            const localOrderData = {
                id: orderId,
                customer: { fullName, phone, email, address, city, state, pincode },
                items: checkoutCart,
                totalAmount: totalAmount,
                date: new Date().toISOString()
            };
            localStorage.setItem('latest_invoice', JSON.stringify(localOrderData));

            // Build short WhatsApp Message
            let message = '🌸 *Namaste from Pall & Pearl!* ✨\n\n';
            message += 'Thank you for shopping with us! 💖\n';
            message += 'I have placed a new order. Please find my order invoice here:\n\n';
            
            // Assuming site runs on the current origin
            const invoiceLink = window.location.origin + '/invoice.html?id=' + orderId;
            message += `👉 ${invoiceLink}\n\n`;
            message += 'Chatpate Tops for Chatpati Girls ✨';

            // Encode and open WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP}?text=${encodedMessage}`;
            
            // Clear carts
            localStorage.removeItem('checkout_cart');
            localStorage.setItem('pall_and_pearl_cart', JSON.stringify([]));

            // Open Whatsapp
            window.open(whatsappUrl, '_blank');
            
            // Redirect to invoice page
            setTimeout(() => {
                window.location.href = `invoice.html?id=${orderId}`;
            }, 1000);
            
        } catch (err) {
            console.error("Order error:", err);
            alert("There was an error processing your order. Please try again.");
            btnWhatsappCheckout.innerHTML = originalBtnText;
            btnWhatsappCheckout.disabled = false;
        }
    });
});
