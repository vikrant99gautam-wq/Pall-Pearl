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
        const priceStr = String(item.price || '0');
        const price = parseFloat(priceStr.replace(/[₹,]/g, '').trim());
        const itemQuantity = item.quantity || 1;
        const itemTotal = price * itemQuantity;
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
        let message = '\uD83C\uDF38 *Namaste from Pall & Pearl!* \u2728\n\n';
        message += 'Thank you so much for shopping with us. \uD83D\uDC96\n';
        message += 'Your order request has been received successfully!\n\n';
        message += '━━━━━━━━━━━━━━━━━━\n';
        message += '\uD83D\uDECD\uFE0F *ORDER SUMMARY*\n\n';
        message += '\uD83D\uDC64 *Customer:* ' + fullName + '\n';
        message += '\uD83D\uDCDE *Phone:* ' + phone + '\n';
        if (email) message += '\uD83D\uDCE7 *Email:* ' + email + '\n';
        message += '\n\uD83D\uDCCD *Shipping Address:*\n';
        message += address + '\n' + city + ', ' + state + ' - ' + pincode + '\n\n';
        message += '━━━━━━━━━━━━━━━━━━\n';
        message += '\u2728 *Items Ordered*\n\n';

        checkoutCart.forEach((item) => {
            message += '\uD83E\uDE77 *' + item.name + '*\n';
            if (item.size) message += '• Size: ' + item.size + '\n';
            if (item.color) message += '• Color: ' + item.color + '\n';
            if (item.sleeve) message += '• Style: ' + item.sleeve + '\n';
            message += '• Quantity: ' + item.quantity + '\n';
            message += '• Price: ' + item.price + '\n';
            if (item.image) {
                const imgUrl = item.image.split(',')[0].trim();
                message += '• Image: ' + imgUrl + '\n';
            }
            if (item.customization) {
                message += '\n\uD83D\uDCDD *Customization Note:*\n' + item.customization + '\n';
            }
            message += '\n';
        });

        message += '━━━━━━━━━━━━━━━━━━\n';
        message += '\uD83D\uDCB3 *Total Amount:* *₹' + totalAmount.toLocaleString('en-IN') + '*\n\n';
        
        message += '\uD83D\uDC96 *What happens next?*\n\n';
        message += 'Our team will carefully review your order and our seller will personally contact you shortly to confirm all the details before processing your order.\n\n';
        message += 'If you have any questions or want to make any changes, feel free to reply to this chat. We\'re always happy to help! \uD83D\uDE0A\n\n';
        message += 'Thank you for choosing *Pall & Pearl* \uD83C\uDF37\n\n';
        message += '*Chatpate Tops for Chatpati Girls* \u2728';

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
