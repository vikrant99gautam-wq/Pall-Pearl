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

    let totalAmount = 0;

    // Render items
    checkoutItemsContainer.innerHTML = checkoutCart.map(item => {
        const price = parseFloat(item.price.replace('₹', '').replace(',', ''));
        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        return `
            <div class="flex gap-4 items-center">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border border-outline-variant/30">
                <div class="flex-1">
                    <h4 class="font-headline-lg-mobile text-sm text-primary mb-1">${item.name}</h4>
                    <p class="font-body-md text-xs text-on-surface-variant">Size: ${item.size} | Qty: ${item.quantity}</p>
                </div>
                <div class="font-body-md font-semibold text-primary">₹${itemTotal.toLocaleString('en-IN')}</div>
            </div>
        `;
    }).join('');

    // Update totals
    checkoutSubtotal.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    checkoutTotal.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;

    // Handle WhatsApp Checkout
    btnWhatsappCheckout.addEventListener('click', (e) => {
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

        // Build WhatsApp Message
        let message = `*NEW ORDER - Pall & Pearl*\n\n`;
        
        message += `*Customer Details:*\n`;
        message += `Name: ${fullName}\n`;
        message += `Phone: ${phone}\n`;
        if (email) message += `Email: ${email}\n`;
        message += `\n*Shipping Address:*\n`;
        message += `${address}\n${city}, ${state} - ${pincode}\n\n`;

        message += `*Order Details:*\n`;
        checkoutCart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Size: ${item.size} | Qty: ${item.quantity} | Price: ${item.price}\n`;
            if (item.customization) {
                message += `   Note: ${item.customization}\n`;
            }
        });

        message += `\n*Total Amount:* ₹${totalAmount.toLocaleString('en-IN')}\n`;
        message += `\nThank you!`;

        // Encode and open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP}?text=${encodedMessage}`;
        
        // Clear checkout cart after successful redirection preparation
        localStorage.removeItem('checkout_cart');
        // If the order came from the main cart, clear it too. 
        // We'll clear the main cart since the order is placed.
        localStorage.setItem('pall_and_pearl_cart', JSON.stringify([]));

        window.open(whatsappUrl, '_blank');
        
        // Redirect back to home or profile after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
});
